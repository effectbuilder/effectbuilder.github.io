<?php
/**
 * Public GET catalog: JSON array of component objects (Firestore REST; public read rules).
 * URL: GET /builder/components-catalog.json → 200, Content-Type: application/json, body: [...]
 * Optional: ?max=2000&includeDataImages=1 (inline data URLs in catalog when set)
 * Embedded Firestore images: ImageUrl points at component-catalog-image.php?id=...
 */

declare(strict_types=1);

require_once __DIR__ . '/firestore-catalog-common.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=60, stale-while-revalidate=300');
header('Access-Control-Allow-Origin: *');

/**
 * @param array<string, mixed> $d Flat Firestore document fields
 */
function build_normalized_component(string $shareId, array $d, bool $includeDataImages, ?string $docCreateTime, ?string $docUpdateTime): array
{
    $rawImage = pick_device_image_raw($d);
    [$imageUrl, $imageInline] = resolve_catalog_image_display($shareId, $rawImage, $includeDataImages);
    $imageField = $imageInline;

    $ledRaw = $d['LedCount'] ?? $d['ledCount'] ?? (isset($d['leds']) && is_array($d['leds']) ? count($d['leds']) : null);
    $ledCount = is_int($ledRaw) ? $ledRaw : (int) (is_numeric($ledRaw) ? $ledRaw : 0);

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

    $base = [
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
        'Image' => $imageField,
        'LedCount' => $ledCount,
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
    ];

    $baseUrl = rtrim(SITE_ORIGIN, '/');
    $base['BuilderUrl'] = $baseUrl . '/builder/?id=' . rawurlencode($shareId);
    $base['SignalrgbJsonUrl'] = $baseUrl . '/builder/?id=' . rawurlencode($shareId) . '&export=rgbjunkie';

    return [
        'id' => $shareId,
        'shareId' => $shareId,
        'catalogId' => $shareId,
    ] + $base;
}

$max = (int) ($_GET['max'] ?? $_GET['limit'] ?? 2000);
$max = max(1, min($max, 5000));
$includeDataImages = (($_GET['includeDataImages'] ?? '') === '1');

$baseUrl = sprintf(
    'https://firestore.googleapis.com/v1/projects/%s/databases/(default)/documents/%s',
    FIRESTORE_PROJECT,
    COLLECTION
);

$normalized = [];
$pageToken = null;
$pageSize = 300;

try {
    while (count($normalized) < $max) {
        $take = min($pageSize, $max - count($normalized));
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
            if (count($normalized) >= $max) {
                break 2;
            }
            $name = (string) ($doc['name'] ?? '');
            $shareId = extract_share_id($name);
            if ($shareId === '') {
                continue;
            }
            $fields = firestore_fields_to_array($doc['fields'] ?? []);
            $createT = isset($doc['createTime']) && is_string($doc['createTime']) ? $doc['createTime'] : null;
            $updateT = isset($doc['updateTime']) && is_string($doc['updateTime']) ? $doc['updateTime'] : null;
            $normalized[] = build_normalized_component($shareId, $fields, $includeDataImages, $createT, $updateT);
        }
        $pageToken = isset($json['nextPageToken']) && is_string($json['nextPageToken']) ? $json['nextPageToken'] : null;
        if ($pageToken === null || $pageToken === '') {
            break;
        }
    }

    usort($normalized, static function (array $a, array $b): int {
        $ta = $a['UpdatedAt'] ?? '';
        $tb = $b['UpdatedAt'] ?? '';

        return strcmp((string) $tb, (string) $ta);
    });

    http_response_code(200);
    echo json_encode($normalized, JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Catalog generation failed',
        'message' => $e->getMessage(),
    ], JSON_UNESCAPED_SLASHES);
}
