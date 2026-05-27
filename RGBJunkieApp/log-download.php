<?php declare(strict_types=1);

/**
 * Server-side download event logger (IP + geo). POST JSON from download-track.js.
 */
header('Content-Type: application/json; charset=UTF-8');

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'POST required']);
    exit;
}

require_once __DIR__ . '/includes/download-tracker.php';

$raw = file_get_contents('php://input');
$payload = is_string($raw) && $raw !== '' ? json_decode($raw, true) : null;
if (!is_array($payload)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid JSON']);
    exit;
}

$filePath = rgbj_download_normalize_path((string) ($payload['filePath'] ?? ''));
if ($filePath === '') {
    http_response_code(400);
    echo json_encode(['ok' => false, 'error' => 'Invalid file path']);
    exit;
}

if (!rgbj_download_server_logging_enabled()) {
    echo json_encode([
        'ok' => false,
        'error' => 'server_logging_disabled',
        'hint' => 'Add firebase_service_account_json in download-stats-secret.php (readable JSON key file).',
    ]);
    exit;
}

$fileName = basename($filePath);
$classified = rgbj_download_classify($filePath, $fileName);
$channel = rgbj_download_normalize_channel((string) ($payload['channel'] ?? 'website'));

try {
    $ok = rgbj_firestore_log_download(
        rgbj_download_build_log_meta($filePath, $channel, $fileName, $classified)
    );
} catch (Throwable $e) {
    error_log('log-download.php: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'log_failed']);
    exit;
}

if (!$ok) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'firestore_write_failed']);
    exit;
}

// Tell download.php to skip a duplicate log when the thanks-page iframe fetches the file next.
$cookiePath = rgbj_base_path() === '' ? '/' : rgbj_base_path() . '/';
setcookie(
    'rgbj_dl_nolog',
    hash('sha256', $filePath . '|' . $channel),
    [
        'expires' => time() + 90,
        'path' => $cookiePath,
        'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'),
        'httponly' => true,
        'samesite' => 'Lax',
    ]
);

echo json_encode([
    'ok' => true,
    'ip' => rgbj_download_client_ip(),
]);
