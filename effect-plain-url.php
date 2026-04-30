<?php

declare(strict_types=1);

/**
 * Plain text response: one line = URL to open in a browser for exportPlain download (JS-generated HTML as .txt).
 * GET /effects/effect-export-url.txt?id=<projectId>
 */

require_once __DIR__ . '/effects-firestore-lib.php';

header('Access-Control-Allow-Origin: *');

$id = isset($_GET['id']) ? trim((string) $_GET['id']) : '';
if ($id === '' || strlen($id) > 512 || preg_match('#[/#?\\\\]#', $id)) {
    http_response_code(400);
    header('Content-Type: text/plain; charset=utf-8');
    echo "error: invalid_id\n";

    exit;
}

[$code, $fields] = effects_get_project_document($id);
if ($code === 404) {
    http_response_code(404);
    header('Content-Type: text/plain; charset=utf-8');
    echo "error: not_found\n";

    exit;
}
if ($code !== 200 || $fields === []) {
    http_response_code(502);
    header('Content-Type: text/plain; charset=utf-8');
    echo "error: load_failed\n";

    exit;
}

if (! effects_is_public_true($fields['isPublic'] ?? false)) {
    http_response_code(403);
    header('Content-Type: text/plain; charset=utf-8');
    echo "error: forbidden\n";

    exit;
}

header('Content-Type: text/plain; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: public, max-age=300');

echo effects_export_plain_page_url($id) . "\n";
