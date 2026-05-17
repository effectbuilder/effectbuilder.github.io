<?php
/**
 * Upload next to deploy.php on HostGator. Open in browser once — not in git repo.
 * Confirms which folder Apache serves vs where deploy.php lives.
 */
declare(strict_types=1);

header('Content-Type: text/plain; charset=utf-8');

$here = realpath(__DIR__) ?: __DIR__;
$docRoot = isset($_SERVER['DOCUMENT_ROOT'])
    ? (realpath((string) $_SERVER['DOCUMENT_ROOT']) ?: (string) $_SERVER['DOCUMENT_ROOT'])
    : '(CLI — open this URL in a browser on the server)';

echo "deploy-ping OK\n";
echo "This file:     {$here}/deploy-ping.php\n";
echo "DOCUMENT_ROOT: {$docRoot}\n";
echo 'Roots match:   ' . ($docRoot === $here ? 'YES' : 'NO — site files are served from a different folder') . "\n\n";

$deployPath = __DIR__ . DIRECTORY_SEPARATOR . 'deploy.php';
if (is_file($deployPath)) {
    $body = (string) file_get_contents($deployPath);
    $isV3 = strpos($body, "DEPLOY_SCRIPT_VERSION = '3'") !== false;
    echo 'deploy.php:    found, v3=' . ($isV3 ? 'yes' : 'NO (upload latest deploy.php)') . "\n";
} else {
    echo "deploy.php:    MISSING in this folder\n";
}

$indexPath = __DIR__ . DIRECTORY_SEPARATOR . 'index.html';
if (is_file($indexPath)) {
    $text = (string) file_get_contents($indexPath);
    $ver = null;
    if (preg_match('/Version:\s*([0-9]+(?:\.[0-9]+)+)/i', $text, $m)) {
        $ver = $m[1];
    } elseif (preg_match('/id=["\']version-display["\'][^>]*>\s*([0-9]+(?:\.[0-9]+)+)/i', $text, $m)) {
        $ver = $m[1];
    }
    if ($ver !== null) {
        echo 'index.html:    Version ' . $ver . ' (mtime UTC ' . gmdate('Y-m-d H:i:s', filemtime($indexPath) ?: 0) . ")\n";
    } else {
        echo "index.html:    present, version string not found\n";
    }
} else {
    echo "index.html:    MISSING\n";
}

$marker = __DIR__ . DIRECTORY_SEPARATOR . 'deploy-last.json';
echo 'deploy-last.json: ' . (is_file($marker) ? 'present (run deploy.php to refresh)' : 'missing — run deploy.php') . "\n";
