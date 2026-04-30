<?php

declare(strict_types=1);

/**
 * Minimal Firestore REST helpers for public `projects` reads (Effect Builder).
 */

const EFFECTS_FIRESTORE_PROJECT = 'effect-builder';
const EFFECTS_COLLECTION = 'projects';

/**
 * @param mixed $v Firestore Value object (single-key associative array)
 * @return mixed
 */
function effects_firestore_decode_value($v): mixed
{
    if (! is_array($v) || $v === []) {
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
            return effects_firestore_fields_to_array($val['fields'] ?? []);
        case 'arrayValue':
            $out = [];
            foreach (($val['values'] ?? []) as $item) {
                $out[] = effects_firestore_decode_value($item);
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
function effects_firestore_fields_to_array(?array $fields): array
{
    if ($fields === null || $fields === []) {
        return [];
    }
    $out = [];
    foreach ($fields as $k => $v) {
        $out[$k] = effects_firestore_decode_value($v);
    }

    return $out;
}

function effects_http_get(string $url): array
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

function effects_http_post_json(string $url, string $jsonBody): array
{
    if (! function_exists('curl_init')) {
        return [0, ''];
    }
    $ch = curl_init($url);
    if ($ch === false) {
        return [0, ''];
    }
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_POSTFIELDS => $jsonBody,
        CURLOPT_TIMEOUT => 120,
    ]);
    $body = curl_exec($ch);
    $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    return [$code, is_string($body) ? $body : ''];
}

/**
 * @return list<array{fields: array<string, mixed>, name: string}>
 */
function effects_run_query_public_projects(
    int $limit,
    ?string $startAfterResourceName,
    array $selectFieldPaths
): array {
    $url = sprintf(
        'https://firestore.googleapis.com/v1/projects/%s/databases/(default)/documents:runQuery',
        EFFECTS_FIRESTORE_PROJECT
    );

    $selectFields = [];
    foreach ($selectFieldPaths as $path) {
        $selectFields[] = ['fieldPath' => $path];
    }

    $structured = [
        'from' => [['collectionId' => EFFECTS_COLLECTION]],
        'where' => [
            'fieldFilter' => [
                'field' => ['fieldPath' => 'isPublic'],
                'op' => 'EQUAL',
                'value' => ['booleanValue' => true],
            ],
        ],
        'orderBy' => [
            ['field' => ['fieldPath' => 'createdAt'], 'direction' => 'DESCENDING'],
        ],
        'limit' => $limit,
    ];
    if ($selectFields !== []) {
        $structured['select'] = ['fields' => $selectFields];
    }

    if ($startAfterResourceName !== null && $startAfterResourceName !== '') {
        $structured['startAt'] = [
            'values' => [['referenceValue' => $startAfterResourceName]],
            'before' => false,
        ];
    }

    $payload = ['structuredQuery' => $structured];
    [$code, $raw] = effects_http_post_json($url, json_encode($payload, JSON_UNESCAPED_SLASHES));
    if ($code !== 200) {
        return [];
    }
    $rows = json_decode($raw, true);
    if (! is_array($rows)) {
        return [];
    }

    $out = [];
    foreach ($rows as $item) {
        if (isset($item['error'])) {
            return [];
        }
        if (! isset($item['document']) || ! is_array($item['document'])) {
            continue;
        }
        $doc = $item['document'];
        $name = (string) ($doc['name'] ?? '');
        if ($name === '') {
            continue;
        }
        $fields = effects_firestore_fields_to_array($doc['fields'] ?? []);
        $out[] = ['name' => $name, 'fields' => $fields];
    }

    return $out;
}

/**
 * @return array{0: int, 1: array<string, mixed>}
 */
function effects_get_project_document(string $docId): array
{
    $url = sprintf(
        'https://firestore.googleapis.com/v1/projects/%s/databases/(default)/documents/%s/%s',
        EFFECTS_FIRESTORE_PROJECT,
        EFFECTS_COLLECTION,
        rawurlencode($docId)
    );
    [$code, $raw] = effects_http_get($url);
    if ($code === 404) {
        return [404, []];
    }
    if ($code !== 200) {
        return [$code >= 400 ? $code : 502, []];
    }
    $json = json_decode($raw, true);
    if (! is_array($json)) {
        return [502, []];
    }
    $fields = effects_firestore_fields_to_array($json['fields'] ?? []);

    return [200, $fields];
}

function effects_extract_document_id(string $resourceName): string
{
    if (preg_match('#/documents/' . preg_quote(EFFECTS_COLLECTION, '#') . '/([^/]+)$#', $resourceName, $m)) {
        return $m[1];
    }

    return '';
}

function effects_site_origin(): string
{
    $https = (! empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (isset($_SERVER['SERVER_PORT']) && (string) $_SERVER['SERVER_PORT'] === '443');
    $scheme = $https ? 'https' : 'http';
    $host = isset($_SERVER['HTTP_HOST']) ? (string) $_SERVER['HTTP_HOST'] : 'rgbjunkie.com';
    $host = preg_replace('/[^a-zA-Z0-9.:_-]/', '', $host) ?: 'rgbjunkie.com';

    return $scheme . '://' . $host;
}

/**
 * Opens the Effect Builder with exportPlain=1: in-browser download of the export HTML as a .txt and a plain pre view.
 */
function effects_export_plain_page_url(string $effectId): string
{
    $effectId = trim($effectId);
    if ($effectId === '') {
        return rtrim(effects_site_origin(), '/') . '/';
    }

    return rtrim(effects_site_origin(), '/') . '/?effectId=' . rawurlencode($effectId) . '&exportPlain=1';
}

function effects_pick_string(array $fields, string ...$keys): ?string
{
    foreach ($keys as $k) {
        if (isset($fields[$k]) && is_string($fields[$k]) && trim($fields[$k]) !== '') {
            return trim($fields[$k]);
        }
    }

    return null;
}

/**
 * Read description / tags from Effect Builder `configs` array (no website JS required).
 *
 * @param array<string, mixed> $fields
 * @return array{description: ?string, tags: list<string>}
 */
function effects_summary_from_fields(array $fields): array
{
    $desc = effects_pick_string($fields, 'catalogDescription', 'description');
    $tags = [];
    if (isset($fields['catalogTags']) && is_array($fields['catalogTags'])) {
        foreach ($fields['catalogTags'] as $t) {
            if (is_string($t) && trim($t) !== '') {
                $tags[] = trim($t);
            }
        }
    }
    if ($desc !== null || $tags !== []) {
        return ['description' => $desc, 'tags' => $tags];
    }

    $configs = $fields['configs'] ?? null;
    if (! is_array($configs)) {
        return ['description' => null, 'tags' => []];
    }
    foreach ($configs as $c) {
        if (! is_array($c)) {
            continue;
        }
        $n = $c['name'] ?? '';
        if ($n === 'description' && isset($c['default'])) {
            $d = trim((string) $c['default']);
            $desc = $d !== '' ? $d : null;
        }
        if ($n === 'tags' && isset($c['default'])) {
            $raw = trim((string) $c['default']);
            if ($raw !== '') {
                $tags = array_values(array_filter(array_map('trim', preg_split('/[,|]/', $raw) ?: [])));
            }
        }
    }

    return ['description' => $desc, 'tags' => $tags];
}

/**
 * @param mixed $v
 */
function effects_is_public_true($v): bool
{
    return $v === true;
}

/**
 * Reads stored SignalRGB-style HTML from Firestore project fields.
 * Prefers legacy plain `exportedHtml`; otherwise decompresses `exportedHtmlGzip` (base64 gzip from REST bytesValue).
 *
 * @param array<string, mixed> $fields
 */
function effects_decode_exported_html_from_fields(array $fields): ?string
{
    $plain = $fields['exportedHtml'] ?? null;
    if (is_string($plain) && $plain !== '') {
        return $plain;
    }

    $gzB64 = $fields['exportedHtmlGzip'] ?? null;
    if (! is_string($gzB64) || $gzB64 === '') {
        return null;
    }

    $raw = base64_decode($gzB64, true);
    if ($raw === false || $raw === '') {
        return null;
    }

    $out = @gzdecode($raw);
    if (is_string($out) && $out !== '') {
        return $out;
    }

    return null;
}
