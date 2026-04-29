<?php

declare(strict_types=1);

/**
 * Single-component layout (LED grid + bounds), same fields as catalog layoutDefinitions[id].
 * GET /builder/component-layout.json?id=<catalogId>
 */

require_once __DIR__ . '/firestore-catalog-common.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=60, stale-while-revalidate=300');
header('Access-Control-Allow-Origin: *');

$id = isset($_GET['id']) ? trim((string) $_GET['id']) : '';
if ($id === '' || strlen($id) > 512 || preg_match('#[/#?\\\\]#', $id)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing or invalid id'], JSON_UNESCAPED_SLASHES);
    exit;
}

[$docCode, $fields] = firestore_get_component_fields($id);
if ($docCode === 404) {
    http_response_code(404);
    echo json_encode(['error' => 'Component not found'], JSON_UNESCAPED_SLASHES);
    exit;
}
if ($docCode !== 200 || $fields === []) {
    http_response_code(502);
    echo json_encode(['error' => 'Could not load component'], JSON_UNESCAPED_SLASHES);
    exit;
}

$layout = build_layout_definition_from_fields($fields);
$out = ['catalogId' => $id] + $layout;

http_response_code(200);
echo json_encode($out, JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
