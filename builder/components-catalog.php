<?php
/**
 * Dynamic JSON catalog for srgb-components (Firestore REST, no auth — public read rules).
 * Served as: https://rgbjunkie.com/builder/components-catalog.json (see root .htaccess rewrite).
 */

declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, must-revalidate');
header('Access-Control-Allow-Origin: *');

const SITE_ORIGIN = 'https://rgbjunkie.com';
const FIRESTORE_PROJECT = 'effect-builder';
const COLLECTION = 'srgb-components';

/**
 * @param mixed $v Firestore Value object (single-key associative array)
 * @return mixed
 */
function firestore_decode_value($v): mixed
{
    if (!is_array($v) || $v === []) {
        return null;
    }
    $key = array_key_first($v);
    $val = $v[$key];
    switch ($key) {
        case 'nullValue':
            return null;
        case 'stringValue':
            return $val;
        case 'integerValue':
            return (int) $val;
        case 'doubleValue':
            return (float) $val;
        case 'booleanValue':
            return (bool) $val;
        case 'timestampValue':
            return is_string($val) ? $val : null;
        case 'bytesValue':
        case 'referenceValue':
            return $val;
        case 'geoPointValue':
            return $val;
        case 'mapValue':
            return firestore_fields_to_array($val['fields'] ?? []);
        case 'arrayValue':
            $out = [];
            foreach (($val['values'] ?? []) as $item) {
                $out[] = firestore_decode_value($item);
            }
            return $out;
        default:
            return null;
    }
}

/**
 * @param array<string, mixed>|null $fields
 * @return array<string, mixed>
 */
function firestore_fields_to_array(?array $fields): array
{
    if ($fields === null || $fields === []) {
        return [];
    }
    $out = [];
    foreach ($fields as $k => $v) {
        $out[$k] = firestore_decode_value($v);
    }
    return $out;
}

function extract_share_id(string $resourceName): string
{
    if (preg_match('#/srgb-components/([^/]+)$#', $resourceName, $m)) {
        return $m[1];
    }
    return '';
}

function pick_first(?string ...$candidates): ?string
{
    foreach ($candidates as $c) {
        if ($c === null) {
            continue;
        }
        if (is_string($c) && trim($c) === '') {
            continue;
        }
        return $c;
    }
    return null;
}

/**
 * @param array<string, mixed> $d Flat Firestore document fields
 */
function build_normalized_component(string $shareId, array $d, bool $includeDataImages, ?string $docCreateTime, ?string $docUpdateTime): array
{
    $imageUrl = pick_first(
        isset($d['ImageUrl']) ? (string) $d['ImageUrl'] : null,
        isset($d['imageUrl']) ? (string) $d['imageUrl'] : null,
        isset($d['imageURL']) ? (string) $d['imageURL'] : null,
        isset($d['image_url']) ? (string) $d['image_url'] : null,
        isset($d['Image']) ? (string) $d['Image'] : null
    );

    $hasEmbedded = is_string($imageUrl) && str_starts_with($imageUrl, 'data:');
    if ($hasEmbedded && ! $includeDataImages) {
        $imageUrl = null;
    }

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

/**
 * @param list<array<string, mixed>> $normalized
 * @return mixed
 */
function wrap_catalog(array $normalized, string $format)
{
    $f = strtolower($format);
    return match ($f) {
        'array' => $normalized,
        'items' => ['items' => $normalized],
        'data' => ['data' => ['components' => $normalized]],
        'nested' => array_map(static function (array $entry): array {
            $sid = (string) ($entry['id'] ?? $entry['shareId'] ?? $entry['catalogId'] ?? '');
            unset($entry['id'], $entry['shareId'], $entry['catalogId']);
            return ['id' => $sid, 'component' => $entry];
        }, $normalized),
        default => ['components' => $normalized],
    };
}

function http_get(string $url): array
{
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        if ($ch === false) {
            return [0, ''];
        }
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT => 120,
        ]);
        $body = curl_exec($ch);
        $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        return [$code, is_string($body) ? $body : ''];
    }

    $ctx = stream_context_create([
        'http' => [
            'timeout' => 120,
            'ignore_errors' => true,
        ],
    ]);
    $body = @file_get_contents($url, false, $ctx);
    $code = 0;
    if (isset($http_response_header[0]) && preg_match('#\b(\d{3})\b#', $http_response_header[0], $m)) {
        $code = (int) $m[1];
    }
    return [$code, is_string($body) ? $body : ''];
}

$max = (int) ($_GET['max'] ?? $_GET['limit'] ?? 2000);
$max = max(1, min($max, 5000));
$includeDataImages = (($_GET['includeDataImages'] ?? '') === '1');
$format = (string) ($_GET['format'] ?? 'components');

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

    // Sort by UpdatedAt / document order — prefer UpdatedAt desc
    usort($normalized, static function (array $a, array $b): int {
        $ta = $a['UpdatedAt'] ?? '';
        $tb = $b['UpdatedAt'] ?? '';
        return strcmp((string) $tb, (string) $ta);
    });

    $out = wrap_catalog($normalized, $format);
    echo json_encode($out, JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Catalog generation failed',
        'message' => $e->getMessage(),
    ], JSON_UNESCAPED_SLASHES);
}
