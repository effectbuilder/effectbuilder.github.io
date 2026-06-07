<?php declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/includes/help-content.php';
require_once dirname(__DIR__, 2) . '/includes/help-editor-auth.php';
require_once dirname(__DIR__, 2) . '/includes/help-gemini.php';

header('Cache-Control: no-store');

if (strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET')) !== 'POST') {
    rgbj_help_editor_json_response(['error' => 'Method not allowed.'], 405);
}

rgbj_help_editor_require_admin();

if (!rgbj_help_gemini_is_configured()) {
    rgbj_help_editor_json_response(['error' => 'Gemini API key not configured on the server.'], 503);
}

$body = file_get_contents('php://input');
$data = json_decode($body !== false ? $body : '', true);
if (!is_array($data)) {
    rgbj_help_editor_json_response(['error' => 'Invalid JSON body.'], 400);
}

$action = trim((string) ($data['action'] ?? ''));
$markdown = (string) ($data['markdown'] ?? '');
$selection = (string) ($data['selection'] ?? '');
$prompt = (string) ($data['prompt'] ?? '');

if ($action === '') {
    rgbj_help_editor_json_response(['error' => 'action is required.'], 400);
}

try {
    $result = rgbj_help_gemini_assist($action, $markdown, $selection, $prompt);
    rgbj_help_editor_json_response([
        'text' => $result['text'],
        'scope' => $result['scope'],
    ]);
} catch (InvalidArgumentException $e) {
    rgbj_help_editor_json_response(['error' => $e->getMessage()], 400);
} catch (Throwable $e) {
    $detail = rgbj_help_gemini_friendly_error($e->getMessage());
    rgbj_help_editor_json_response([
        'error' => strlen($detail) > 180 ? substr($detail, 0, 177) . '…' : $detail,
        'detail' => $detail,
    ], 502);
}
