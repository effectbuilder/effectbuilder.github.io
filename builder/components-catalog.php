<?php
/**
 * Public GET catalog: component list only — no LED coordinates (Firestore REST; public read rules).
 * URL: GET /builder/components-catalog.json
 * Body: { "components": [ { "catalogId", "DisplayName", "LedCount", "Type" }, ... ] }
 * Per-component layout (LedCoordinates, Width, Height): GET /builder/component-layout.json?id=<catalogId>
 * Optional: ?max=2000&limit=… (capped at 5000).
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
 * @return array{catalogId: string, DisplayName: ?string, LedCount: int, Type: ?string}
 */
function build_catalog_component_row(string $catalogId, array $d): array
{
    return [
        'catalogId' => $catalogId,
        'DisplayName' => pick_first(
            isset($d['DisplayName']) ? (string) $d['DisplayName'] : null,
            isset($d['displayName']) ? (string) $d['displayName'] : null,
            isset($d['display_name']) ? (string) $d['display_name'] : null,
            isset($d['name']) ? (string) $d['name'] : null
        ),
        'LedCount' => pick_led_count($d),
        'Type' => pick_first(
            isset($d['Type']) ? (string) $d['Type'] : null,
            isset($d['type']) ? (string) $d['type'] : null
        ),
    ];
}

$max = (int) ($_GET['max'] ?? $_GET['limit'] ?? 2000);
$max = max(1, min($max, 5000));

$baseUrl = sprintf(
    'https://firestore.googleapis.com/v1/projects/%s/databases/(default)/documents/%s',
    FIRESTORE_PROJECT,
    COLLECTION
);

/** @var list<array{catalogId: string, fields: array<string, mixed>, sortKey: string}> $rows */
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
            $rows[] = [
                'catalogId' => $shareId,
                'fields' => $fields,
                'sortKey' => pick_updated_at_sort_key($fields, $updateT),
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
        $components[] = build_catalog_component_row($cid, $d);
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
