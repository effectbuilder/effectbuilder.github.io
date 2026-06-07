<?php declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/includes/help-content.php';
require_once dirname(__DIR__, 2) . '/includes/help-editor-auth.php';

header('Cache-Control: no-store');

if (strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET')) !== 'POST') {
    rgbj_help_editor_json_response(['error' => 'Method not allowed.'], 405);
}

rgbj_help_editor_require_admin();

$body = file_get_contents('php://input');
$data = json_decode($body !== false ? $body : '', true);
if (!is_array($data)) {
    rgbj_help_editor_json_response(['error' => 'Invalid JSON body.'], 400);
}

$encoded = (string) ($data['data'] ?? '');
$mime = trim((string) ($data['mime'] ?? ''));
$nameHint = trim((string) ($data['name'] ?? ''));

if ($encoded === '') {
    rgbj_help_editor_json_response(['error' => 'data is required (base64 file).'], 400);
}

if (str_contains($encoded, ',')) {
    $encoded = substr($encoded, strpos($encoded, ',') + 1);
}

$binary = base64_decode($encoded, true);
if ($binary === false) {
    rgbj_help_editor_json_response(['error' => 'Invalid base64 file data.'], 400);
}

try {
    $saved = rgbj_help_save_uploaded_media($binary, $mime, $nameHint);
    rgbj_help_editor_json_response([
        'ok' => true,
        'filename' => $saved['filename'],
        'path' => $saved['path'],
        'url' => $saved['url'],
        'type' => $saved['type'],
        'markdown' => $saved['markdown'],
    ]);
} catch (InvalidArgumentException $e) {
    rgbj_help_editor_json_response(['error' => $e->getMessage()], 400);
} catch (Throwable $e) {
    rgbj_help_editor_json_response(['error' => $e->getMessage()], 500);
}
