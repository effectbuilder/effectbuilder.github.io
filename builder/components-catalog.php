<?php
/**
 * Public GET catalog: rich component rows — no LedCoordinates in this response (Firestore REST).
 * URL: GET /builder/components-catalog.json
 * Body: { "components": [ … ] } — each item includes id/shareId/catalogId, names, brand, type,
 * ImageUrl/Image (optional), stats, dates, BuilderUrl, SignalrgbJsonUrl, LayoutUrl.
 * Layout (LedCoordinates, Width, Height): GET LayoutUrl or /builder/component-layout.json?id=<catalogId>
 * Optional: ?max=2000&limit=… (capped at 5000), ?includeDataImages=1 (inline data: Image when stored).
 */

declare(strict_types=1);

require_once __DIR__ . '/firestore-catalog-common.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=60, stale-while-revalidate=300');
header('Access-Control-Allow-Origin: *');

/**
 * @param array<string, mixed> $d
 */
function pick_led_count(array $d): int
{
    $ledRaw = $d['LedCount'] ?? $d['ledCount'] ?? (isset($d['leds']) && is_array($d['leds']) ? count($d['leds']) : null);

    return is_int($ledRaw) ? $ledRaw : (int) (is_numeric($ledRaw) ? $ledRaw : 0);
}

/**
 * @param array<string, mixed> $d
 */
function pick_updated_at_sort_key(array $d, ?string $docUpdateTime): string
{
    if (isset($d['lastUpdated']) && is_string($d['lastUpdated'])) {
        return $d['lastUpdated'];
    }
    if (isset($d['LastUpdated']) && is_string($d['LastUpdated'])) {
        return $d['LastUpdated'];
    }
    if ($docUpdateTime) {
        return $docUpdateTime;
    }

    return '';
}

/**
 * @param array<string, mixed> $d
 * @return array<string, mixed>
 */
function build_catalog_component_row(
    string $catalogId,
    array $d,
    bool $includeDataImages,
    ?string $docCreateTime,
    ?string $docUpdateTime
): array {
    [$imageUrl, $imageInline] = resolve_catalog_image_display($catalogId, $d, $includeDataImages);

    $createdAt = null;
    if (isset($d['createdAt']) && is_string($d['createdAt'])) {
        $createdAt = $d['createdAt'];
    } elseif ($docCreateTime) {
        $createdAt = $docCreateTime;
    }

    $updatedAt = null;
    if (isset($d['lastUpdated']) && is_string($d['lastUpdated'])) {
        $updatedAt = $d['lastUpdated'];
    } elseif (isset($d['LastUpdated']) && is_string($d['LastUpdated'])) {
        $updatedAt = $d['LastUpdated'];
    } elseif ($docUpdateTime) {
        $updatedAt = $docUpdateTime;
    }

    $baseUrl = rtrim(SITE_ORIGIN, '/');

    return [
        'id' => $catalogId,
        'shareId' => $catalogId,
        'catalogId' => $catalogId,
        'ProductName' => pick_first(
            isset($d['ProductName']) ? (string) $d['ProductName'] : null,
            isset($d['productName']) ? (string) $d['productName'] : null,
            isset($d['name']) ? (string) $d['name'] : null
        ),
        'DisplayName' => pick_first(
            isset($d['DisplayName']) ? (string) $d['DisplayName'] : null,
            isset($d['displayName']) ? (string) $d['displayName'] : null,
            isset($d['display_name']) ? (string) $d['display_name'] : null,
            isset($d['name']) ? (string) $d['name'] : null
        ),
        'Brand' => pick_first(
            isset($d['Brand']) ? (string) $d['Brand'] : null,
            isset($d['brand']) ? (string) $d['brand'] : null
        ),
        'Type' => pick_first(
            isset($d['Type']) ? (string) $d['Type'] : null,
            isset($d['type']) ? (string) $d['type'] : null
        ),
        'ImageUrl' => $imageUrl,
        'Image' => $imageInline,
        'LedCount' => pick_led_count($d),
        'Description' => pick_first(
            isset($d['Description']) ? (string) $d['Description'] : null,
            isset($d['description']) ? (string) $d['description'] : null
        ),
        'CreatorId' => pick_first(
            isset($d['CreatorId']) ? (string) $d['CreatorId'] : null,
            isset($d['creatorId']) ? (string) $d['creatorId'] : null,
            isset($d['ownerId']) ? (string) $d['ownerId'] : null
        ),
        'CreatorName' => pick_first(
            isset($d['CreatorName']) ? (string) $d['CreatorName'] : null,
            isset($d['creatorName']) ? (string) $d['creatorName'] : null,
            isset($d['ownerName']) ? (string) $d['ownerName'] : null
        ),
        'LikeCount' => (int) ($d['likeCount'] ?? $d['LikeCount'] ?? 0),
        'ViewCount' => (int) ($d['viewCount'] ?? $d['ViewCount'] ?? 0),
        'DownloadCount' => (int) ($d['downloadCount'] ?? $d['DownloadCount'] ?? 0),
        'CreatedAt' => $createdAt,
        'UpdatedAt' => $updatedAt,
        'BuilderUrl' => $baseUrl . '/builder/?id=' . rawurlencode($catalogId),
        'SignalrgbJsonUrl' => $baseUrl . '/builder/?id=' . rawurlencode($catalogId) . '&export=rgbjunkie',
        'LayoutUrl' => $baseUrl . '/builder/component-layout.json?id=' . rawurlencode($catalogId),
    ];
}

$max = (int) ($_GET['max'] ?? $_GET['limit'] ?? 2000);
$max = max(1, min($max, 5000));
$includeDataImages = (($_GET['includeDataImages'] ?? '') === '1');

$baseUrl = sprintf(
    'https://firestore.googleapis.com/v1/projects/%s/databases/(default)/documents/%s',
    FIRESTORE_PROJECT,
    COLLECTION
);

/** @var list<array{catalogId: string, fields: array<string, mixed>, sortKey: string, createTime: ?string, updateTime: ?string}> $rows */
$rows = [];
$pageToken = null;
$pageSize = 300;

try {
    while (count($rows) < $max) {
        $take = min($pageSize, $max - count($rows));
        $q = ['pageSize' => (string) $take];
        if ($pageToken !== null && $pageToken !== '') {
            $q['pageToken'] = $pageToken;
        }
        $url = $baseUrl . '?' . http_build_query($q);
        [$code, $raw] = http_get($url);
        if ($code !== 200) {
            http_response_code($code >= 400 && $code < 600 ? $code : 502);
            echo json_encode([
                'error' => 'Firestore request failed',
                'httpStatus' => $code,
                'bodyPreview' => substr($raw, 0, 500),
            ], JSON_UNESCAPED_SLASHES);
            exit;
        }
        $json = json_decode($raw, true);
        if (! is_array($json)) {
            http_response_code(502);
            echo json_encode(['error' => 'Invalid Firestore JSON'], JSON_UNESCAPED_SLASHES);
            exit;
        }
        $docs = $json['documents'] ?? [];
        if ($docs === []) {
            break;
        }
        foreach ($docs as $doc) {
            if (count($rows) >= $max) {
                break 2;
            }
            $name = (string) ($doc['name'] ?? '');
            $shareId = extract_share_id($name);
            if ($shareId === '') {
                continue;
            }
            $fields = firestore_fields_to_array($doc['fields'] ?? []);
            $updateT = isset($doc['updateTime']) && is_string($doc['updateTime']) ? $doc['updateTime'] : null;
            $createT = isset($doc['createTime']) && is_string($doc['createTime']) ? $doc['createTime'] : null;
            $rows[] = [
                'catalogId' => $shareId,
                'fields' => $fields,
                'sortKey' => pick_updated_at_sort_key($fields, $updateT),
                'createTime' => $createT,
                'updateTime' => $updateT,
            ];
        }
        $pageToken = isset($json['nextPageToken']) && is_string($json['nextPageToken']) ? $json['nextPageToken'] : null;
        if ($pageToken === null || $pageToken === '') {
            break;
        }
    }

    usort($rows, static function (array $a, array $b): int {
        return strcmp((string) $b['sortKey'], (string) $a['sortKey']);
    });

    $components = [];
    foreach ($rows as $row) {
        $cid = $row['catalogId'];
        $d = $row['fields'];
        $components[] = build_catalog_component_row(
            $cid,
            $d,
            $includeDataImages,
            $row['createTime'] ?? null,
            $row['updateTime'] ?? null
        );
    }

    http_response_code(200);
    echo json_encode(['components' => $components], JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Catalog generation failed',
        'message' => $e->getMessage(),
    ], JSON_UNESCAPED_SLASHES);
}
