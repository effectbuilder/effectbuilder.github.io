<?php
/**
 * Git deployment — sync working tree to origin/main.
 *
 * Server-only (not in the GitHub repo). After deploy, reads deploy-last.json via browser
 * to confirm THIS folder is what Apache serves.
 */

declare(strict_types=1);

// HostGator often hides PHP errors as a blank HTTP 500 — surface them in the deploy log.
ini_set('display_errors', '0');
error_reporting(E_ALL);

chdir(__DIR__);

/**
 * @return never
 */
function deployFatal(string $message): void
{
    header('Content-Type: text/html; charset=utf-8');
    http_response_code(200);
    echo '<h2>Deployment Result</h2><pre>';
    echo htmlspecialchars($message, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    echo '</pre>';
    exit;
}

const DEPLOY_PROTECTED_PATHS = [
    'deploy.php',
    'deploy-config.local.php',
    'deploy-last.json',
];

const DEPLOY_MARKER_FILE = 'deploy-last.json';
const DEPLOY_SCRIPT_VERSION = '3';

$configPath = __DIR__ . '/deploy-config.local.php';
$config = [];
if (is_readable($configPath)) {
    try {
        $loaded = require $configPath;
        if (is_array($loaded)) {
            $config = $loaded;
        }
    } catch (Throwable $e) {
        deployFatal('deploy-config.local.php error: ' . $e->getMessage());
    }
}

$deploySecret = isset($config['webhook_secret']) ? (string) $config['webhook_secret'] : '';
if ($deploySecret !== '') {
    $provided = (string) ($_GET['secret'] ?? $_SERVER['HTTP_X_DEPLOY_SECRET'] ?? '');
    if ($provided === '' || !hash_equals($deploySecret, $provided)) {
        http_response_code(403);
        header('Content-Type: text/plain; charset=utf-8');
        echo 'Forbidden';
        exit;
    }
}

$git = 'git';
if (PHP_OS_FAMILY !== 'Windows' && is_executable('/usr/bin/git')) {
    $git = '/usr/bin/git';
}

$remote = 'origin';
$branch = 'main';
$ref = $remote . '/' . $branch;

/**
 * @return array{0: string, 1: int}
 */
function runGit(string $git, string $args): array
{
    $cmd = $git . ' ' . $args . ' 2>&1';
    $lines = [];
    $code = 0;
    exec($cmd, $lines, $code);
    if ($lines === [] && $code === 0) {
        $fallback = shell_exec($cmd);
        if (is_string($fallback) && $fallback !== '') {
            return [rtrim($fallback), 0];
        }
    }
    return [implode("\n", $lines), $code];
}

function parseIndexVersionFromHtml(string $text): ?string
{
    if (preg_match('/Version:\s*([0-9]+(?:\.[0-9]+)+)/i', $text, $m)) {
        return $m[1];
    }
    if (preg_match('/id=["\']version-display["\'][^>]*>\s*([0-9]+(?:\.[0-9]+)+)/i', $text, $m)) {
        return $m[1];
    }
    return null;
}

function extractSiteVersionFromIndex(string $indexPath): ?string
{
    if (!is_file($indexPath)) {
        return null;
    }
    $text = @file_get_contents($indexPath);
    if (!is_string($text) || $text === '') {
        return null;
    }
    return parseIndexVersionFromHtml($text);
}

function fetchGithubMainIndexVersion(): ?string
{
    $ctx = stream_context_create([
        'http' => [
            'timeout' => 12,
            'user_agent' => 'RGBJunkie-Deploy-Verify/1.0',
        ],
    ]);
    $url = 'https://raw.githubusercontent.com/effectbuilder/effectbuilder.github.io/main/index.html';
    $text = @file_get_contents($url, false, $ctx);
    if (!is_string($text) || $text === '') {
        return null;
    }
    return parseIndexVersionFromHtml($text);
}

function writeDeployMarker(string $commit, string $deployDir): void
{
    $indexPath = $deployDir . DIRECTORY_SEPARATOR . 'index.html';
    $payload = [
        'commit' => $commit,
        'deployed_at_utc' => gmdate('c'),
        'deploy_directory' => $deployDir,
        'index_version' => extractSiteVersionFromIndex($indexPath),
        'github_main_index_version' => fetchGithubMainIndexVersion(),
    ];
    @file_put_contents(
        $deployDir . DIRECTORY_SEPARATOR . DEPLOY_MARKER_FILE,
        json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n"
    );
}

function deployDiagnostics(string $commit, string $ref): string
{
    $lines = ["\n--- On-disk check (this git checkout) ---"];
    $here = realpath(__DIR__) ?: __DIR__;
    $lines[] = 'Deploy directory: ' . $here;

    if (isset($_SERVER['DOCUMENT_ROOT']) && $_SERVER['DOCUMENT_ROOT'] !== '') {
        $docRoot = realpath((string) $_SERVER['DOCUMENT_ROOT']) ?: (string) $_SERVER['DOCUMENT_ROOT'];
        $lines[] = 'Apache DOCUMENT_ROOT: ' . $docRoot;
        if ($docRoot !== $here) {
            $lines[] = '';
            $lines[] = '*** PROBLEM: deploy.php is NOT in the folder your website serves. ***';
            $lines[] = 'Git updated: ' . $here;
            $lines[] = 'Browser loads: ' . $docRoot;
            $lines[] = 'Fix in cPanel → Domains → Document Root → point to the deploy directory above,';
            $lines[] = 'OR move this .git folder + deploy.php into DOCUMENT_ROOT.';
        } else {
            $lines[] = 'DOCUMENT_ROOT matches deploy directory (good).';
        }
    } else {
        $lines[] = 'DOCUMENT_ROOT: (not available — run deploy.php in the browser, not CLI)';
    }

    [$remoteOut] = runGit($GLOBALS['git'] ?? 'git', 'remote get-url origin');
    if ($remoteOut !== '') {
        $lines[] = 'git remote: ' . trim($remoteOut);
    }

    $indexPath = __DIR__ . DIRECTORY_SEPARATOR . 'index.html';
    $localVer = extractSiteVersionFromIndex($indexPath);
    $githubVer = fetchGithubMainIndexVersion();

    $lines[] = 'index.html on disk: ' . ($localVer ?? '(version not found)');
    if ($githubVer !== null) {
        $lines[] = 'index.html on GitHub main: ' . $githubVer;
        if ($localVer !== null && $localVer !== $githubVer) {
            $lines[] = '*** PROBLEM: disk index version != GitHub — git checkout may be wrong repo/branch ***';
        } elseif ($localVer === $githubVer) {
            $lines[] = 'Disk matches GitHub main (git sync OK).';
        }
    }

    if (is_file($indexPath)) {
        $lines[] = 'index.html mtime UTC: ' . gmdate('Y-m-d H:i:s', filemtime($indexPath) ?: 0);
    }

    $markerUrl = '';
    if (isset($_SERVER['HTTP_HOST']) && $_SERVER['HTTP_HOST'] !== '') {
        $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
        $dir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'] ?? '/deploy.php'));
        if ($dir === '.') {
            $dir = '';
        }
        $markerUrl = $scheme . '://' . $_SERVER['HTTP_HOST'] . rtrim($dir, '/') . '/' . DEPLOY_MARKER_FILE;
    }
    if ($markerUrl !== '') {
        $lines[] = '';
        $lines[] = 'Open this URL in your browser (should show JSON with commit ' . $commit . '):';
        $lines[] = $markerUrl;
        $lines[] = 'If that 404s, the site is served from a different folder than deploy.php.';
    }

    [$diffOut] = runGit($GLOBALS['git'] ?? 'git', 'diff --name-only HEAD ' . escapeshellarg($ref));
    if (trim($diffOut) !== '') {
        $lines[] = '';
        $lines[] = 'Files still different from origin/main:';
        $lines[] = $diffOut;
    }

    $lines[] = '';
    $lines[] = 'Note: https://effectbuilder.github.io/ is GitHub Pages (not this HostGator folder).';

    return implode("\n", $lines);
}

$cleanArgs = 'clean -fd';
foreach (DEPLOY_PROTECTED_PATHS as $path) {
    $cleanArgs .= ' -e ' . escapeshellarg($path);
}

$steps = [
    'fetch' => 'fetch ' . escapeshellarg($remote) . ' ' . escapeshellarg($branch),
    'reset' => 'reset --hard ' . escapeshellarg($ref),
    'clean' => $cleanArgs,
];

$log = [
    'RGBJunkie deploy.php v' . DEPLOY_SCRIPT_VERSION . ' (fetch + reset --hard + clean)',
    'If you only see "Already up to date" with no diagnostics below, this file is outdated on the server.',
    '',
];
$failed = false;

foreach ($steps as $label => $args) {
    [$out, $code] = runGit($git, $args);
    $log[] = '$ git ' . $args . ($out !== '' ? "\n" . $out : '');
    if ($code !== 0) {
        $log[] = "\n[FAILED] git {$label} exited with code {$code}";
        $failed = true;
        break;
    }
}

$commit = '';
if (!$failed) {
    [$headOut] = runGit($git, 'rev-parse HEAD');
    [$originOut] = runGit($git, 'rev-parse ' . escapeshellarg($ref));
    $head = trim($headOut);
    $origin = trim($originOut);
    if ($head !== '' && $origin !== '') {
        $log[] = '';
        $log[] = 'HEAD:         ' . $head . ($head === $origin ? ' (matches origin/main)' : '');
        $log[] = 'origin/main:  ' . $origin;
        if ($head !== $origin) {
            $log[] = 'Reset applied — working tree now matches origin/main.';
        } else {
            $log[] = 'Already on latest origin/main (nothing new on GitHub to download).';
            $log[] = 'If the live site still looks old → wrong document root or browser/CDN cache (see below).';
        }
    }
    $commit = $head;
    if ($commit !== '') {
        $log[] = "\nDeployed commit: " . $commit;
    }
    writeDeployMarker($commit, realpath(__DIR__) ?: __DIR__);
    $GLOBALS['git'] = $git;
    try {
        $log[] = deployDiagnostics($commit, $ref);
    } catch (Throwable $e) {
        $log[] = "\n[ERROR] Diagnostics failed: " . $e->getMessage();
        $failed = true;
    }
    if (!$failed) {
        $log[] = "\nDeploy OK.";
    }
}

header('Content-Type: text/html; charset=utf-8');
// Always 200 so the host does not replace our <pre> log with a generic "HTTP 500" page.
http_response_code(200);
echo '<h2>Deployment Result</h2>';
echo '<pre>' . htmlspecialchars(implode("\n", $log), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '</pre>';
if ($failed) {
    echo '<p><strong>Deploy failed</strong> — see git output above.</p>';
}
