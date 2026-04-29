<?php

declare(strict_types=1);

const SITE_ORIGIN = 'https://rgbjunkie.com';
const FIRESTORE_PROJECT = 'effect-builder';
const COLLECTION = 'srgb-components';

/**
 * @param mixed $v Firestore Value object (single-key associative array)
 * @return mixed
 */
function firestore_decode_value($v): mixed
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
 * Raw device image reference from Firestore fields (matches builder save shape).
 *
 * @param array<string, mixed> $d
 */
function pick_device_image_raw(array $d): ?string
{
    return pick_first(
        isset($d['ImageUrl']) ? (string) $d['ImageUrl'] : null,
        isset($d['imageUrl']) ? (string) $d['imageUrl'] : null,
        isset($d['imageURL']) ? (string) $d['imageURL'] : null,
        isset($d['image_url']) ? (string) $d['image_url'] : null,
        isset($d['Image']) ? (string) $d['Image'] : null
    );
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

/**
 * @return array{mime: string, binary: string}|null
 */
function parse_data_url(string $dataUrl): ?array
{
    if (! str_starts_with($dataUrl, 'data:')) {
        return null;
    }
    if (! preg_match('#^data:([^;,]+)(;charset=[^;,]+)?(;base64)?,(.*)$#s', $dataUrl, $m)) {
        return null;
    }
    $mime = trim($m[1]);
    $isB64 = $m[3] === ';base64';
    $payload = $m[4];
    if ($isB64) {
        $bin = base64_decode(str_replace(["\r", "\n", ' '], '', $payload), true);
        if ($bin === false) {
            return null;
        }
        return ['mime' => $mime, 'binary' => $bin];
    }
    return ['mime' => $mime, 'binary' => rawurldecode($payload)];
}

function gs_to_storage_download_url(string $gs): ?string
{
    if (! preg_match('#^gs://([^/]+)/(.+)$#', $gs, $m)) {
        return null;
    }
    $bucket = $m[1];
    $objectPath = $m[2];

    return 'https://firebasestorage.googleapis.com/v0/b/' . rawurlencode($bucket) . '/o/'
        . rawurlencode($objectPath) . '?alt=media';
}

/**
 * LEDs from Firestore (same shape as builder / gallery thumbnail).
 *
 * @param array<string, mixed> $d
 * @return list<array{id: string, x: float, y: float}>
 */
function parse_leds_for_thumbnail(array $d): array
{
    $leds = $d['leds'] ?? [];
    if (! is_array($leds)) {
        return [];
    }
    $out = [];
    foreach ($leds as $led) {
        if (! is_array($led)) {
            continue;
        }
        $id = isset($led['id']) ? trim((string) $led['id']) : '';
        if ($id === '') {
            continue;
        }
        $x = $led['x'] ?? null;
        $y = $led['y'] ?? null;
        if (! is_numeric($x) || ! is_numeric($y)) {
            continue;
        }
        $out[] = ['id' => $id, 'x' => (float) $x, 'y' => (float) $y];
    }

    return $out;
}

/**
 * Wiring as list of ordered LED id lists (Firestore [{circuit: [...]}] or flat arrays).
 *
 * @param array<string, mixed> $d
 * @return list<list<string>>
 */
function parse_wiring_circuits(array $d): array
{
    $w = $d['wiring'] ?? [];
    if (! is_array($w)) {
        return [];
    }
    $out = [];
    foreach ($w as $item) {
        if (! is_array($item)) {
            continue;
        }
        if (isset($item['circuit']) && is_array($item['circuit'])) {
            $circ = [];
            foreach ($item['circuit'] as $id) {
                if (is_string($id) || is_int($id)) {
                    $circ[] = (string) $id;
                }
            }
            if ($circ !== []) {
                $out[] = $circ;
            }
        } elseif ($item !== [] && array_key_exists(0, $item)) {
            $circ = [];
            foreach ($item as $id) {
                if (is_string($id) || is_int($id)) {
                    $circ[] = (string) $id;
                }
            }
            if ($circ !== []) {
                $out[] = $circ;
            }
        }
    }

    return $out;
}

/**
 * PNG bitmap matching builder util.js renderComponentThumbnail (180², padding 20, green LEDs).
 *
 * @param array<string, mixed> $d Decoded Firestore document fields
 */
function generate_led_thumbnail_png(array $d): ?string
{
    if (! function_exists('imagecreatetruecolor')) {
        return null;
    }
    $leds = parse_leds_for_thumbnail($d);
    if ($leds === []) {
        return null;
    }
    $wiring = parse_wiring_circuits($d);
    /** @var array<string, array{id: string, x: float, y: float}> $ledMap */
    $ledMap = [];
    foreach ($leds as $led) {
        $ledMap[$led['id']] = $led;
    }

    $W = 180;
    $H = 180;
    $padding = 20.0;

    $minX = INF;
    $minY = INF;
    $maxX = -INF;
    $maxY = -INF;
    foreach ($leds as $led) {
        $minX = min($minX, $led['x']);
        $minY = min($minY, $led['y']);
        $maxX = max($maxX, $led['x']);
        $maxY = max($maxY, $led['y']);
    }
    $boundsW = max($maxX - $minX, 1.0);
    $boundsH = max($maxY - $minY, 1.0);

    $innerW = $W - $padding * 2;
    $innerH = $H - $padding * 2;
    $scale = min($innerW / $boundsW, $innerH / $boundsH);

    $boundsCenterX = $minX + $boundsW / 2;
    $boundsCenterY = $minY + $boundsH / 2;
    $panX = ($W / 2) - ($boundsCenterX * $scale);
    $panY = ($H / 2) - ($boundsCenterY * $scale);

    $toScreen = static function (float $x, float $y) use ($panX, $panY, $scale): array {
        return [$panX + $x * $scale, $panY + $y * $scale];
    };

    $im = imagecreatetruecolor($W, $H);
    if ($im === false) {
        return null;
    }
    imagealphablending($im, true);

    $bg = imagecolorallocate($im, 33, 37, 41);
    imagefilledrectangle($im, 0, 0, $W - 1, $H - 1, $bg);

    $wireColor = imagecolorallocate($im, 80, 80, 88);
    $ledFill = imagecolorallocate($im, 0, 180, 0);
    $ledStroke = imagecolorallocate($im, 200, 200, 200);

    imagesetthickness($im, 1);

    foreach ($wiring as $circuit) {
        if (count($circuit) < 2) {
            continue;
        }
        $prev = null;
        foreach ($circuit as $lidStr) {
            if (! isset($ledMap[$lidStr])) {
                continue;
            }
            $led = $ledMap[$lidStr];
            [$sx, $sy] = $toScreen($led['x'], $led['y']);
            if ($prev === null) {
                $prev = [$sx, $sy];
                continue;
            }
            imageline(
                $im,
                (int) round($prev[0]),
                (int) round($prev[1]),
                (int) round($sx),
                (int) round($sy),
                $wireColor
            );
            $prev = [$sx, $sy];
        }
    }

    $rpx = 5;
    foreach ($leds as $led) {
        [$cx, $cy] = $toScreen($led['x'], $led['y']);
        $cx = (int) round($cx);
        $cy = (int) round($cy);
        imagefilledellipse($im, $cx, $cy, $rpx * 2, $rpx * 2, $ledFill);
        imageellipse($im, $cx, $cy, $rpx * 2, $rpx * 2, $ledStroke);
    }

    ob_start();
    imagepng($im, null, 6);
    $png = ob_get_clean();
    imagedestroy($im);

    return is_string($png) && $png !== '' ? $png : null;
}

/**
 * @return array{0: ?string, 1: ?string} [catalog ImageUrl, optional inline Image data URL]
 */
function resolve_catalog_image_display(string $shareId, array $d, bool $includeDataImages): array
{
    $raw = pick_device_image_raw($d);
    $rawTrim = $raw !== null ? trim($raw) : '';
    $proxy = rtrim(SITE_ORIGIN, '/') . '/builder/component-catalog-image.php?id=' . rawurlencode($shareId);

    if ($rawTrim !== '') {
        if (str_starts_with($rawTrim, 'data:')) {
            $inline = $includeDataImages ? $rawTrim : null;

            return [$proxy, $inline];
        }
        if (str_starts_with($rawTrim, 'gs://')) {
            return [$proxy, null];
        }
        if (str_starts_with($rawTrim, 'http://') || str_starts_with($rawTrim, 'https://')) {
            return [$rawTrim, null];
        }
    }

    if (parse_leds_for_thumbnail($d) !== []) {
        return [$proxy, null];
    }

    return [null, null];
}

/**
 * Load one srgb-components document; returns [httpCode, fields array].
 *
 * @return array{0: int, 1: array<string, mixed>}
 */
function firestore_get_component_fields(string $docId): array
{
    $url = sprintf(
        'https://firestore.googleapis.com/v1/projects/%s/databases/(default)/documents/%s/%s',
        FIRESTORE_PROJECT,
        COLLECTION,
        rawurlencode($docId)
    );
    [$code, $raw] = http_get($url);
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
    $fields = firestore_fields_to_array($json['fields'] ?? []);

    return [200, $fields];
}

/**
 * Resolve stored image to mime + binary for HTTP response or JSON.
 *
 * @return array{0: int httpErrorOr200, 1: string mime, 2: string binary}|array{0: int, 1: '', 2: ''}
 */
function resolve_device_image_bytes(?string $raw): array
{
    if ($raw === null || trim($raw) === '') {
        return [404, '', ''];
    }
    $raw = trim($raw);
    if (str_starts_with($raw, 'data:')) {
        $parsed = parse_data_url($raw);
        if ($parsed === null) {
            return [422, '', ''];
        }

        return [200, $parsed['mime'], $parsed['binary']];
    }
    if (str_starts_with($raw, 'gs://')) {
        $u = gs_to_storage_download_url($raw);
        if ($u === null) {
            return [404, '', ''];
        }
        [$c, $body] = http_get($u);
        if ($c !== 200 || ! is_string($body) || $body === '') {
            return [$c >= 400 ? $c : 502, '', ''];
        }
        $mime = 'application/octet-stream';

        return [200, $mime, $body];
    }
    if (str_starts_with($raw, 'http://') || str_starts_with($raw, 'https://')) {
        [$c, $body] = http_get($raw);
        if ($c !== 200 || ! is_string($body) || $body === '') {
            return [$c >= 400 ? $c : 502, '', ''];
        }
        $mime = 'application/octet-stream';

        return [200, $mime, $body];
    }

    return [404, '', ''];
}
