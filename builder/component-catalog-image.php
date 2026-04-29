<?php

declare(strict_types=1);

require_once __DIR__ . '/firestore-catalog-common.php';

$id = isset($_GET['id']) ? trim((string) $_GET['id']) : '';
if ($id === '' || strlen($id) > 512 || preg_match('#[/#?\\\\]#', $id)) {
    http_response_code(400);
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    echo json_encode(['error' => 'Missing or invalid id'], JSON_UNESCAPED_SLASHES);
    exit;
}

[$docCode, $fields] = firestore_get_component_fields($id);
if ($docCode === 404) {
    http_response_code(404);
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    echo json_encode(['error' => 'Component not found'], JSON_UNESCAPED_SLASHES);
    exit;
}
if ($docCode !== 200 || $fields === []) {
    http_response_code(502);
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    echo json_encode(['error' => 'Could not load component'], JSON_UNESCAPED_SLASHES);
    exit;
}

$raw = pick_device_image_raw($fields);
[$byteCode, $mime, $binary] = resolve_device_image_bytes($raw);

if ($byteCode !== 200 || $binary === '') {
    $synth = generate_led_thumbnail_png($fields);
    if ($synth !== null) {
        $byteCode = 200;
        $mime = 'image/png';
        $binary = $synth;
    }
}

if ($byteCode !== 200 || $binary === '') {
    http_response_code(404);
    header('Content-Type: application/json; charset=utf-8');
    header('Access-Control-Allow-Origin: *');
    echo json_encode(['error' => 'No image or LED layout for this component'], JSON_UNESCAPED_SLASHES);
    exit;
}

if ($mime === 'application/octet-stream' && function_exists('finfo_open')) {
    $f = finfo_open(FILEINFO_MIME_TYPE);
    if ($f !== false) {
        $detected = finfo_buffer($f, $binary);
        finfo_close($f);
        if (is_string($detected) && $detected !== '' && $detected !== 'application/octet-stream') {
            $mime = $detected;
        }
    }
}

$wantJson = strtolower((string) ($_GET['format'] ?? '')) === 'json';

if ($wantJson) {
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: public, max-age=300, stale-while-revalidate=600');
    header('Access-Control-Allow-Origin: *');
    $b64 = base64_encode($binary);
    echo json_encode([
        'ContentType' => $mime,
        'Image' => $b64,
        'ImageUrl' => 'data:' . $mime . ';base64,' . $b64,
    ], JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

header('Content-Type: ' . $mime);
header('Cache-Control: public, max-age=86400, stale-while-revalidate=86400');
header('Access-Control-Allow-Origin: *');
echo $binary;
