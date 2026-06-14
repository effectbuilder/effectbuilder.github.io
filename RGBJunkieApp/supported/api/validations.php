<?php declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/includes/device-validations.php';
require_once dirname(__DIR__, 2) . '/includes/help-editor-auth.php';

$method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));

if ($method === 'GET') {
    header('Cache-Control: public, max-age=120');
    rgbj_device_validations_json_response(rgbj_read_device_validations());
}

if ($method !== 'POST') {
    rgbj_device_validations_json_response(['error' => 'Method not allowed.'], 405);
}

$user = rgbj_help_editor_require_admin();

$body = file_get_contents('php://input');
$data = json_decode($body !== false ? $body : '', true);
if (!is_array($data)) {
    rgbj_device_validations_json_response(['error' => 'Invalid JSON body.'], 400);
}

$relativePath = rgbj_normalize_device_relative_path((string) ($data['relativePath'] ?? ''));
if ($relativePath === null) {
    rgbj_device_validations_json_response(['error' => 'relativePath is required.'], 400);
}

$status = rgbj_parse_validation_status_from_request($data);
if (!array_key_exists('status', $data) && !array_key_exists('validated', $data)) {
    rgbj_device_validations_json_response(['error' => 'status is required (validated, experimental, or clear).'], 400);
}
if (array_key_exists('status', $data)) {
    $rawStatus = strtolower(trim((string) $data['status']));
    if ($rawStatus !== '' && $rawStatus !== 'none' && $rawStatus !== 'clear' && $status === null) {
        rgbj_device_validations_json_response(['error' => 'status must be validated, experimental, or empty to clear.'], 400);
    }
}

$notes = trim((string) ($data['notes'] ?? ''));
if (strlen($notes) > 500) {
    rgbj_device_validations_json_response(['error' => 'notes must be 500 characters or fewer.'], 400);
}

$store = rgbj_read_device_validations();

if ($status === null) {
    unset($store['entries'][$relativePath]);
} else {
    $store['entries'][$relativePath] = [
        'status' => $status,
        'validatedAt' => gmdate('c'),
        'notes' => $notes,
    ];
}

if (!rgbj_write_device_validations($store, (string) ($user['email'] ?? ''))) {
    rgbj_device_validations_json_response(['error' => 'Could not save validation registry.'], 500);
}

rgbj_device_validations_json_response([
    'ok' => true,
    'relativePath' => $relativePath,
    'status' => $status,
    'store' => rgbj_read_device_validations(),
]);
