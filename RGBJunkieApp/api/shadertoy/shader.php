<?php
/**
 * Shadertoy shader JSON for RGBJunkie desktop.
 * Uses the official REST API when an app key is configured (recommended).
 * Falls back to the site POST only when no key is available.
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Cache-Control: no-store, max-age=0');

$id = preg_replace('/[^a-zA-Z0-9]/', '', (string) ($_GET['id'] ?? ''));
if ($id === '' || strlen($id) < 3 || strlen($id) > 12) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid shader id']);
    exit;
}

const SHADERTOY_UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

function shadertoy_app_key(): ?string
{
    $env = getenv('RGBJUNKIE_SHADERTOY_APP_KEY');
    if (is_string($env) && trim($env) !== '') {
        return trim($env);
    }
    $configPath = __DIR__ . '/config.local.php';
    if (is_file($configPath)) {
        $cfg = require $configPath;
        if (is_array($cfg) && isset($cfg['app_key'])) {
            $key = trim((string) $cfg['app_key']);
            if ($key !== '' && $key !== 'YOUR_SHADERTOY_APP_KEY') {
                return $key;
            }
        }
    }
    return null;
}

function shadertoy_emit_shader_json(string $trimmed): void
{
    $data = json_decode($trimmed, true);
    if (!is_array($data)) {
        http_response_code(502);
        echo json_encode(['error' => 'Invalid JSON from Shadertoy']);
        exit;
    }

    if (isset($data['Shader'])) {
        echo $trimmed;
        exit;
    }

    if (array_is_list($data) && $data !== []) {
        echo json_encode(['Shader' => $data[0]], JSON_UNESCAPED_SLASHES);
        exit;
    }

    if (isset($data['renderpass'])) {
        echo json_encode(['Shader' => $data], JSON_UNESCAPED_SLASHES);
        exit;
    }

    http_response_code(404);
    echo json_encode(['error' => 'Shader not found']);
    exit;
}

function shadertoy_http_get(string $url, array $headers, ?string $cookieFile = null): array
{
    if (!function_exists('curl_init')) {
        return ['ok' => false, 'status' => 0, 'body' => ''];
    }
    $ch = curl_init($url);
    $opts = [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 45,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_ENCODING => '',
    ];
    if ($cookieFile !== null) {
        $opts[CURLOPT_COOKIEJAR] = $cookieFile;
        $opts[CURLOPT_COOKIEFILE] = $cookieFile;
    }
    curl_setopt_array($ch, $opts);
    $body = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($body === false) {
        return ['ok' => false, 'status' => $status, 'body' => ''];
    }
    return ['ok' => $status >= 200 && $status < 300, 'status' => $status, 'body' => (string) $body];
}

function shadertoy_http_post(string $url, string $postBody, array $headers, ?string $cookieFile = null): array
{
    if (!function_exists('curl_init')) {
        return ['ok' => false, 'status' => 0, 'body' => ''];
    }
    $ch = curl_init($url);
    $opts = [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $postBody,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 45,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_ENCODING => '',
    ];
    if ($cookieFile !== null) {
        $opts[CURLOPT_COOKIEJAR] = $cookieFile;
        $opts[CURLOPT_COOKIEFILE] = $cookieFile;
    }
    curl_setopt_array($ch, $opts);
    $body = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($body === false) {
        return ['ok' => false, 'status' => $status, 'body' => ''];
    }
    return ['ok' => $status >= 200 && $status < 300, 'status' => $status, 'body' => (string) $body];
}

function shadertoy_fetch_rest(string $id, string $appKey): array
{
    $url = 'https://www.shadertoy.com/api/v1/shaders/' . rawurlencode($id) . '?key=' . rawurlencode($appKey);
    return shadertoy_http_get($url, [
        'User-Agent: ' . SHADERTOY_UA,
        'Accept: application/json, text/plain, */*',
    ]);
}

function shadertoy_fetch_site_post(string $id): array
{
    $payload = json_encode(['shaders' => [$id]], JSON_UNESCAPED_SLASHES);
    if (!is_string($payload)) {
        return ['ok' => false, 'status' => 0, 'body' => ''];
    }
    $postBody = 's=' . rawurlencode($payload) . '&nt=1&nl=1';
    $referer = 'https://www.shadertoy.com/view/' . $id;
    $cookieFile = tempnam(sys_get_temp_dir(), 'rgbj_st_');
    if ($cookieFile === false) {
        $cookieFile = null;
    }

    $warmHeaders = [
        'User-Agent: ' . SHADERTOY_UA,
        'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    ];
    shadertoy_http_get('https://www.shadertoy.com/view/' . $id, $warmHeaders, $cookieFile);
    shadertoy_http_get(
        'https://www.shadertoy.com/embed/' . $id . '?gui=false',
        array_merge($warmHeaders, ['Referer: ' . $referer]),
        $cookieFile
    );

    $result = shadertoy_http_post(
        'https://www.shadertoy.com/shadertoy',
        $postBody,
        [
            'Content-Type: application/x-www-form-urlencoded',
            'Referer: ' . $referer,
            'Origin: https://www.shadertoy.com',
            'User-Agent: ' . SHADERTOY_UA,
            'Accept: application/json, text/plain, */*',
        ],
        $cookieFile
    );

    if ($cookieFile !== null && is_file($cookieFile)) {
        @unlink($cookieFile);
    }

    return $result;
}

$errors = [];

$appKey = shadertoy_app_key();
if ($appKey !== null) {
    $rest = shadertoy_fetch_rest($id, $appKey);
    $trimmed = trim($rest['body']);
    if ($rest['ok'] && $trimmed !== '' && strcasecmp($trimmed, 'bad request') !== 0) {
        shadertoy_emit_shader_json($trimmed);
    }
    $errors[] = 'REST HTTP ' . $rest['status'];
}

$site = shadertoy_fetch_site_post($id);
$trimmed = trim($site['body']);
if ($site['ok'] && $trimmed !== '' && strcasecmp($trimmed, 'bad request') !== 0) {
    shadertoy_emit_shader_json($trimmed);
}

http_response_code(502);
echo json_encode([
    'error' => $appKey === null
        ? 'Shadertoy app key not configured on server — copy config.example.php to config.local.php'
        : 'Shadertoy did not return shader data — shader must be Public + API on shadertoy.com',
    'status' => $site['status'],
    'detail' => implode('; ', $errors),
]);
