<?php

declare(strict_types=1);

/**
 * Public community effects catalog for desktop / Tauri (JSON only, no inlined HTML).
 */

require_once __DIR__ . '/effects-firestore-lib.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=120, stale-while-revalidate=300');
header('Access-Control-Allow-Origin: *');

$max = (int) ($_GET['max'] ?? $_GET['limit'] ?? 300);
$max = max(1, min($max, 2000));

// `configs` is loaded only so PHP can derive description/tags; it is not included in the catalog JSON.
$selectPaths = [
    'name',
    'creatorName',
    'thumbnail',
    'createdAt',
    'updatedAt',
    'catalogDescription',
    'catalogTags',
    'configs',
    'isPublic',
];

$origin = effects_site_origin();
$effects = [];
$cursor = null;
$pageSize = min(80, $max);

try {
    while (count($effects) < $max) {
        $take = min($pageSize, $max - count($effects));
        $batch = effects_run_query_public_projects($take, $cursor, $selectPaths);
        if ($batch === []) {
            break;
        }
        if ($cursor !== null) {
            array_shift($batch);
        }
        if ($batch === []) {
            break;
        }
        foreach ($batch as $row) {
            if (count($effects) >= $max) {
                break 2;
            }
            $id = effects_extract_document_id($row['name']);
            if ($id === '') {
                continue;
            }
            $f = $row['fields'];
            if (! effects_is_public_true($f['isPublic'] ?? false)) {
                continue;
            }
            $name = effects_pick_string($f, 'name') ?? 'Untitled Effect';
            $thumb = $f['thumbnail'] ?? null;
            $thumbUrl = null;
            if (is_string($thumb) && str_starts_with(trim($thumb), 'http')) {
                $thumbUrl = trim($thumb);
            } elseif (is_string($thumb) && str_starts_with(trim($thumb), 'data:')) {
                $thumbUrl = $origin . '/effects/thumbnail.png?id=' . rawurlencode($id);
            }
            $meta = effects_summary_from_fields($f);

            $effects[] = [
                'id' => $id,
                'name' => $name,
                'fileName' => 'rgbjunkie-' . $id . '.html',
                'contentUrl' => $origin . '/effects/effect.json?id=' . rawurlencode($id),
                'thumbnailUrl' => $thumbUrl,
                'developer' => effects_pick_string($f, 'creatorName'),
                'description' => $meta['description'],
                'tags' => $meta['tags'],
            ];
        }
        $last = $batch[array_key_last($batch)];
        $cursor = $last['name'];
        if (count($batch) < $take) {
            break;
        }
    }

    http_response_code(200);
    echo json_encode([
        'effects' => $effects,
        'effectDefinitions' => new stdClass(),
    ], JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'effects_catalog_failed',
        'message' => $e->getMessage(),
    ], JSON_UNESCAPED_SLASHES);
}
