<?php
/**
 * Proxy Shadertoy shader JSON for RGBJunkie desktop (same POST the shadertoy.com site uses).
 * Public shaders only — no API key required.
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

$payload = json_encode(['shaders' => [$id]], JSON_UNESCAPED_SLASHES);
if (!is_string($payload)) {
    http_response_code(500);
    echo json_encode(['error' => 'Could not build request']);
    exit;
}

$postBody = 's=' . rawurlencode($payload) . '&nt=1&nl=1';
$referer = 'https://www.shadertoy.com/view/' . $id;
$ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';

if (function_exists('curl_init')) {
    $ch = curl_init('https://www.shadertoy.com/shadertoy');
    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $postBody,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_TIMEOUT => 45,
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/x-www-form-urlencoded',
            'Referer: ' . $referer,
            'Origin: https://www.shadertoy.com',
            'User-Agent: ' . $ua,
            'Accept: application/json, text/plain, */*',
        ],
    ]);
    $body = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($body === false || $status < 200 || $status >= 300) {
        http_response_code(502);
        echo json_encode(['error' => 'Shadertoy did not return shader data', 'status' => $status]);
        exit;
    }
} else {
    $ctx = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' =>
                "Content-Type: application/x-www-form-urlencoded\r\n" .
                "Referer: {$referer}\r\n" .
                "Origin: https://www.shadertoy.com\r\n" .
                "User-Agent: {$ua}\r\n" .
                "Accept: application/json, text/plain, */*\r\n",
            'content' => $postBody,
            'timeout' => 45,
        ],
    ]);
    $body = @file_get_contents('https://www.shadertoy.com/shadertoy', false, $ctx);
    if (!is_string($body) || trim($body) === '' || strcasecmp(trim($body), 'bad request') === 0) {
        http_response_code(502);
        echo json_encode(['error' => 'Shadertoy did not return shader data']);
        exit;
    }
}

$trimmed = trim($body);
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
