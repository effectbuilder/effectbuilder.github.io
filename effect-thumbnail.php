<?php

declare(strict_types=1);

/**
 * PNG thumbnail for Firestore data-URL thumbnails. GET /effects/thumbnail.png?id=<projectId>
 */

require_once __DIR__ . '/effects-firestore-lib.php';

$id = isset($_GET['id']) ? trim((string) $_GET['id']) : '';
if ($id === '' || strlen($id) > 512 || preg_match('#[/#?\\\\]#', $id)) {
    http_response_code(400);
    exit;
}

[$code, $fields] = effects_get_project_document($id);
if ($code !== 200 || $fields === []) {
    http_response_code(404);
    exit;
}
if (! effects_is_public_true($fields['isPublic'] ?? false)) {
    http_response_code(403);
    exit;
}

$thumb = $fields['thumbnail'] ?? null;
if (! is_string($thumb) || ! str_starts_with($thumb, 'data:')) {
    http_response_code(404);
    exit;
}

if (! preg_match('#^data:([^;,]+)(;charset=[^;,]+)?(;base64)?,(.*)$#s', $thumb, $m)) {
    http_response_code(422);
    exit;
}
$mime = trim($m[1]);
$isB64 = $m[3] === ';base64';
$payload = $m[4];
if ($isB64) {
    $bin = base64_decode(str_replace(["\r", "\n", ' '], '', $payload), true);
} else {
    $bin = rawurldecode($payload);
}
if ($bin === false || $bin === '') {
    http_response_code(422);
    exit;
}

$etag = '"' . md5($bin) . '"';
if (isset($_SERVER['HTTP_IF_NONE_MATCH']) && trim($_SERVER['HTTP_IF_NONE_MATCH']) === $etag) {
    http_response_code(304);
    header('ETag: ' . $etag);
    header('Cache-Control: public, max-age=86400');
    exit;
}

$outMime = str_starts_with($mime, 'image/') ? $mime : 'image/png';
header('Content-Type: ' . $outMime);
header('ETag: ' . $etag);
header('Cache-Control: public, max-age=86400, stale-while-revalidate=86400');
header('Access-Control-Allow-Origin: *');
echo $bin;
