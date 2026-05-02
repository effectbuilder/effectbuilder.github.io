<?php
/**
 * Git deployment (e.g. GitHub webhook → this URL).
 *
 * Private repositories: `git pull` must authenticate. Pick ONE approach on the server:
 *
 * (A) HTTPS + token (this script)
 *     1. Copy deploy-config.example.php → deploy-config.local.php
 *     2. Add a PAT (classic or fine-grained) with read access to the repo.
 *     3. Deploy runs: git -c http.extraHeader="Authorization: Bearer …" pull …
 *
 * (B) SSH deploy key (no token in PHP)
 *     1. On the server (as the SAME user as PHP/apache): ssh-keygen, add public key in
 *        GitHub → Repo → Settings → Deploy keys (read-only).
 *     2. git remote set-url origin git@github.com:OWNER/REPO.git
 *     3. Test: ssh -T git@github.com
 *     4. Leave github_token empty below; pull uses your SSH config.
 *
 * Webhook: set a secret in GitHub and the same value in deploy-config.local.php
 * to reject requests that are not from GitHub (optional but recommended).
 */

declare(strict_types=1);

header('Content-Type: text/plain; charset=utf-8');

$repoRoot = __DIR__;
$configFile = $repoRoot . '/deploy-config.local.php';
$config = file_exists($configFile) ? require $configFile : [];
$token = isset($config['github_token']) ? trim((string) $config['github_token']) : '';
$webhookSecret = isset($config['webhook_secret']) ? trim((string) $config['webhook_secret']) : '';

// --- Optional: verify GitHub webhook (POST body must be raw JSON GitHub sends) ---
if ($webhookSecret !== '') {
    $sig = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';
    $raw = file_get_contents('php://input') ?: '';
    $expected = 'sha256=' . hash_hmac('sha256', $raw, $webhookSecret);
    if (!hash_equals($expected, $sig)) {
        http_response_code(403);
        echo 'Forbidden';
        exit;
    }
}

$cd = 'cd ' . escapeshellarg($repoRoot) . ' && ';
$gitPrefix = '';
if ($token !== '') {
    // GitHub HTTPS: PAT as password; "x-access-token" works for PATs (classic + fine-grained).
    $basic = base64_encode('x-access-token:' . $token);
    $gitPrefix = '-c ' . escapeshellarg('http.extraHeader=Authorization: Basic ' . $basic) . ' ';
}

$cmd = $cd . 'git ' . $gitPrefix . 'pull origin main 2>&1';
$output = shell_exec($cmd);

if ($output === null) {
    http_response_code(500);
    echo "Deploy failed: shell_exec returned no output (check PHP disable_functions / safe_mode).\n";
    exit;
}

http_response_code(200);
echo "Deployment result:\n\n";
echo $output;
