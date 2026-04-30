<?php

declare(strict_types=1);

/**
 * Single public effect as JSON. `html` is set when `exportedHtml` exists on the Firestore project (saved from builder).
 * GET /effects/effect.json?id=<projectId>
 * Optional: includeWorkspace=1 adds configs/objects (large; for debugging only).
 */

require_once __DIR__ . '/effects-firestore-lib.php';

header('Access-Control-Allow-Origin: *');

$id = isset($_GET['id']) ? trim((string) $_GET['id']) : '';
if ($id === '' || strlen($id) > 512 || preg_match('#[/#?\\\\]#', $id)) {
    http_response_code(400);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'invalid_id', 'message' => 'Missing or invalid id'], JSON_UNESCAPED_SLASHES);
    exit;
}

[$code, $fields] = effects_get_project_document($id);
if ($code === 404) {
    http_response_code(404);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'not_found', 'message' => 'Effect not found'], JSON_UNESCAPED_SLASHES);
    exit;
}
if ($code !== 200 || $fields === []) {
    http_response_code(502);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'load_failed', 'message' => 'Could not load effect'], JSON_UNESCAPED_SLASHES);
    exit;
}

if (! effects_is_public_true($fields['isPublic'] ?? false)) {
    http_response_code(403);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'forbidden', 'message' => 'Effect is not public'], JSON_UNESCAPED_SLASHES);
    exit;
}

$name = effects_pick_string($fields, 'name') ?? 'Untitled Effect';
$meta = effects_summary_from_fields($fields);
$desc = $meta['description'];
$tags = $meta['tags'];

$includeWorkspace = isset($_GET['includeWorkspace'])
    && (string) $_GET['includeWorkspace'] === '1';

$exportPlainUrl = effects_export_plain_page_url($id);

$html = effects_decode_exported_html_from_fields($fields);

$payload = [
    'schemaVersion' => 1,
    'id' => $id,
    'name' => $name,
    'fileName' => 'rgbjunkie-' . $id . '.html',
    'developer' => effects_pick_string($fields, 'creatorName'),
    'description' => $desc,
    'tags' => $tags,
    'html' => $html,
    'exportPlainUrl' => $exportPlainUrl,
];

if ($includeWorkspace) {
    $configs = $fields['configs'] ?? [];
    $objects = $fields['objects'] ?? [];
    if (! is_array($configs)) {
        $configs = [];
    }
    if (! is_array($objects)) {
        $objects = [];
    }
    $payload['workspace'] = [
        'configs' => $configs,
        'objects' => $objects,
    ];
}

$body = json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
if ($body === false) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['error' => 'encode_failed', 'message' => 'Could not encode JSON'], JSON_UNESCAPED_SLASHES);
    exit;
}

$etag = '"' . sha1($body) . '"';
if (isset($_SERVER['HTTP_IF_NONE_MATCH']) && trim($_SERVER['HTTP_IF_NONE_MATCH']) === $etag) {
    http_response_code(304);
    header('ETag: ' . $etag);
    header('Cache-Control: public, max-age=120');
    exit;
}

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('ETag: ' . $etag);
header('Cache-Control: public, max-age=120, stale-while-revalidate=300');
echo $body;
