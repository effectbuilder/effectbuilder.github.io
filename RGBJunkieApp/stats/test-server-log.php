<?php declare(strict_types=1);

/**
 * Local/server diagnostic: can download.php write to Firestore?
 * Allowed only from localhost. Delete or block on public production if you upload it.
 */
declare(strict_types=1);

$remote = (string) ($_SERVER['REMOTE_ADDR'] ?? '');
$local = in_array($remote, ['127.0.0.1', '::1'], true);
if (!$local) {
    http_response_code(403);
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode(['ok' => false, 'error' => 'Forbidden (localhost only).']);
    exit;
}

require_once dirname(__DIR__) . '/includes/download-stats-config.php';
require_once dirname(__DIR__) . '/includes/firestore-download-log.php';

header('Content-Type: application/json; charset=UTF-8');

$cfg = rgbj_download_stats_config();
$saPath = (string) ($cfg['firebase_service_account_json'] ?? '');

$payload = [
    'ok' => true,
    'service_account_path_set' => $saPath !== '',
    'service_account_readable' => $saPath !== '' && is_readable($saPath),
    'collection' => RGBJ_FIRESTORE_DOWNLOADS_COLLECTION,
    'project' => 'effect-builder',
];

if (!$payload['service_account_readable']) {
    $payload['test_write'] = false;
    $payload['hint'] =
        'Copy includes/download-stats-secret.php.example → download-stats-secret.php and set firebase_service_account_json to your service account JSON (same folder). Upload both files to production includes/ for app-update HEAD/GET logging.';
    echo json_encode($payload, JSON_PRETTY_PRINT);
    exit;
}

$payload['test_write'] = rgbj_firestore_log_download([
    'filePath' => 'downloads/portable/_diagnostic_test.zip',
    'fileName' => '_diagnostic_test.zip',
    'version' => 'diagnostic',
    'kind' => 'portable',
    'platform' => 'windows',
    'channel' => 'app-update',
    'userAgent' => 'RGBJunkieDiagnostic/1.0',
    'referer' => 'stats/test-server-log.php',
]);

if (!$payload['test_write']) {
    $payload['hint'] =
        'Service account is present but Firestore write failed. Check PHP error_log, IAM (Datastore/Firestore), and Firestore rules for project effect-builder.';
}

echo json_encode($payload, JSON_PRETTY_PRINT);
