<?php

/**
 * Optional server-side Firestore logging for downloads that bypass the browser tracker
 * (e.g. RGBJunkie desktop in-app updates via download.php).
 *
 * Configure `firebase_service_account_json` in download-stats-secret.php (service account
 * with Cloud Datastore / Firestore access on project effect-builder).
 */
declare(strict_types=1);

require_once __DIR__ . '/download-stats-config.php';

/** @return 'website'|'app-update' */
function rgbj_download_normalize_channel(string $channel): string
{
    $channel = strtolower(trim($channel));
    return $channel === 'app-update' ? 'app-update' : 'website';
}

function rgbj_download_server_logging_enabled(): bool
{
    $cfg = rgbj_download_stats_config();
    $saPath = (string) ($cfg['firebase_service_account_json'] ?? '');

    return $saPath !== '' && is_readable($saPath);
}

function rgbj_download_client_ip(): string
{
    $candidates = [
        (string) ($_SERVER['HTTP_CF_CONNECTING_IP'] ?? ''),
        (string) ($_SERVER['HTTP_X_FORWARDED_FOR'] ?? ''),
        (string) ($_SERVER['REMOTE_ADDR'] ?? ''),
    ];

    foreach ($candidates as $raw) {
        $raw = trim($raw);
        if ($raw === '') {
            continue;
        }
        $ip = trim(explode(',', $raw)[0]);
        if (filter_var($ip, FILTER_VALIDATE_IP)) {
            return $ip;
        }
    }

    return '';
}

/**
 * Rough geo/ISP lookup for public IPs (cached 7 days). Uses ip-api.com (non-commercial).
 *
 * @return array{country: string, region: string, city: string, isp: string}
 */
function rgbj_download_geo_lookup(string $ip): array
{
    $empty = ['country' => '', 'region' => '', 'city' => '', 'isp' => ''];
    if (
        $ip === ''
        || !filter_var($ip, FILTER_VALIDATE_IP)
        || !filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)
    ) {
        return $empty;
    }

    $cacheDir = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'geo-cache';
    $cacheFile = $cacheDir . DIRECTORY_SEPARATOR . hash('sha256', $ip) . '.json';
    if (is_readable($cacheFile) && filemtime($cacheFile) > time() - 7 * 86400) {
        $cached = json_decode((string) file_get_contents($cacheFile), true);
        if (is_array($cached)) {
            return [
                'country' => (string) ($cached['country'] ?? ''),
                'region' => (string) ($cached['region'] ?? ''),
                'city' => (string) ($cached['city'] ?? ''),
                'isp' => (string) ($cached['isp'] ?? ''),
            ];
        }
    }

    $url = 'http://ip-api.com/json/'
        . rawurlencode($ip)
        . '?fields=status,country,regionName,city,isp';
    $ctx = stream_context_create([
        'http' => [
            'method' => 'GET',
            'timeout' => 1.5,
            'ignore_errors' => true,
        ],
        'ssl' => [
            'verify_peer' => true,
            'verify_peer_name' => true,
        ],
    ]);
    $resp = @file_get_contents($url, false, $ctx);
    if ($resp === false) {
        return $empty;
    }
    $parsed = json_decode($resp, true);
    if (!is_array($parsed) || ($parsed['status'] ?? '') !== 'success') {
        return $empty;
    }

    $result = [
        'country' => substr((string) ($parsed['country'] ?? ''), 0, 80),
        'region' => substr((string) ($parsed['regionName'] ?? ''), 0, 120),
        'city' => substr((string) ($parsed['city'] ?? ''), 0, 120),
        'isp' => substr((string) ($parsed['isp'] ?? ''), 0, 120),
    ];

    if (!is_dir($cacheDir) && !@mkdir($cacheDir, 0755, true) && !is_dir($cacheDir)) {
        return $result;
    }
    $encoded = json_encode($result);
    if ($encoded !== false) {
        @file_put_contents($cacheFile, $encoded);
    }

    return $result;
}

/**
 * @param array{version:?string,kind:string,platform:string} $classified
 * @return array{
 *   filePath: string,
 *   fileName: string,
 *   version: ?string,
 *   kind: string,
 *   platform: string,
 *   channel: string,
 *   userAgent: string,
 *   referer: string,
 *   ip: string,
 *   country: string,
 *   region: string,
 *   city: string,
 *   isp: string,
 *   acceptLanguage: string
 * }
 */
function rgbj_download_build_log_meta(
    string $webPath,
    string $channel,
    string $fileName,
    array $classified
): array {
    $ip = rgbj_download_client_ip();
    $geo = rgbj_download_geo_lookup($ip);

    return [
        'filePath' => $webPath,
        'fileName' => $fileName,
        'version' => $classified['version'],
        'kind' => $classified['kind'],
        'platform' => $classified['platform'],
        'channel' => rgbj_download_normalize_channel($channel),
        'userAgent' => (string) ($_SERVER['HTTP_USER_AGENT'] ?? ''),
        'referer' => (string) ($_SERVER['HTTP_REFERER'] ?? ''),
        'ip' => $ip,
        'country' => $geo['country'],
        'region' => $geo['region'],
        'city' => $geo['city'],
        'isp' => $geo['isp'],
        'acceptLanguage' => substr((string) ($_SERVER['HTTP_ACCEPT_LANGUAGE'] ?? ''), 0, 128),
    ];
}

/**
 * @param array{
 *   filePath: string,
 *   fileName: string,
 *   version: ?string,
 *   kind: string,
 *   platform: string,
 *   channel: string,
 *   userAgent: string,
 *   referer: string,
 *   ip?: string,
 *   country?: string,
 *   region?: string,
 *   city?: string,
 *   isp?: string,
 *   acceptLanguage?: string
 * } $meta
 */
function rgbj_firestore_log_download(array $meta): bool
{
    static $disabled = null;
    if ($disabled === true) {
        return false;
    }

    $cfg = rgbj_download_stats_config();
    $saPath = (string) ($cfg['firebase_service_account_json'] ?? '');
    if ($saPath === '' || !is_readable($saPath)) {
        $disabled = true;

        return false;
    }

    $raw = file_get_contents($saPath);
    if ($raw === false) {
        $disabled = true;

        return false;
    }
    $sa = json_decode($raw, true);
    if (!is_array($sa) || empty($sa['client_email']) || empty($sa['private_key'])) {
        $disabled = true;

        return false;
    }

    $token = rgbj_firestore_access_token($sa);
    if ($token === null) {
        error_log(
            'rgbj_firestore_log_download: could not obtain access token (check openssl extension and service account JSON)'
        );
        return false;
    }

    $projectId = (string) ($sa['project_id'] ?? 'effect-builder');
    $collection = RGBJ_FIRESTORE_DOWNLOADS_COLLECTION;
    $url = 'https://firestore.googleapis.com/v1/projects/'
        . rawurlencode($projectId)
        . '/databases/(default)/documents/'
        . rawurlencode($collection);

    $createdAt = gmdate('Y-m-d\TH:i:s\Z');
    $fields = [
        'createdAt' => ['timestampValue' => $createdAt],
        'filePath' => ['stringValue' => $meta['filePath']],
        'fileName' => ['stringValue' => $meta['fileName']],
        'version' => $meta['version'] !== null && $meta['version'] !== ''
            ? ['stringValue' => (string) $meta['version']]
            : ['nullValue' => null],
        'kind' => ['stringValue' => $meta['kind']],
        'platform' => ['stringValue' => $meta['platform']],
        'channel' => ['stringValue' => rgbj_download_normalize_channel($meta['channel'])],
        'userAgent' => ['stringValue' => substr((string) $meta['userAgent'], 0, 512)],
        'referer' => ['stringValue' => substr((string) $meta['referer'], 0, 512)],
    ];

    foreach (
        [
            'ip' => 45,
            'country' => 80,
            'region' => 120,
            'city' => 120,
            'isp' => 120,
            'acceptLanguage' => 128,
        ] as $key => $maxLen
    ) {
        $value = substr(trim((string) ($meta[$key] ?? '')), 0, $maxLen);
        if ($value !== '') {
            $fields[$key] = ['stringValue' => $value];
        }
    }

    $body = ['fields' => $fields];

    $json = json_encode($body);
    if ($json === false) {
        return false;
    }
    $ctx = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Authorization: Bearer {$token}\r\nContent-Type: application/json\r\n",
            'content' => $json,
            'timeout' => 8,
            'ignore_errors' => true,
        ],
    ]);

    $resp = @file_get_contents($url, false, $ctx);
    if ($resp === false) {
        error_log('rgbj_firestore_log_download: no response from Firestore API');
        return false;
    }

    $httpCode = 0;
    if (isset($http_response_header[0]) && preg_match('/\d{3}/', (string) $http_response_header[0], $m)) {
        $httpCode = (int) $m[0];
    }
    if ($httpCode < 200 || $httpCode >= 300) {
        error_log(
            'rgbj_firestore_log_download: Firestore HTTP '
                . $httpCode
                . ' channel='
                . rgbj_download_normalize_channel((string) ($meta['channel'] ?? 'website'))
                . ' body='
                . substr((string) $resp, 0, 400)
        );
        return false;
    }

    return true;
}

/** @param array<string, mixed> $sa */
function rgbj_firestore_access_token(array $sa): ?string
{
    static $cached = null;
    static $cachedUntil = 0;
    if ($cached !== null && time() < $cachedUntil - 60) {
        return $cached;
    }

    $now = time();
    $headerJson = json_encode(['alg' => 'RS256', 'typ' => 'JWT']);
    $claimJson = json_encode([
        'iss' => (string) $sa['client_email'],
        'scope' => 'https://www.googleapis.com/auth/datastore',
        'aud' => 'https://oauth2.googleapis.com/token',
        'iat' => $now,
        'exp' => $now + 3600,
    ]);
    if ($headerJson === false || $claimJson === false) {
        return null;
    }
    $header = rgbj_firestore_b64url($headerJson);
    $claim = rgbj_firestore_b64url($claimJson);
    $unsigned = $header . '.' . $claim;

    if (!function_exists('openssl_pkey_get_private') || !function_exists('openssl_sign')) {
        error_log('rgbj_firestore_access_token: PHP openssl extension is not enabled');
        return null;
    }

    $key = openssl_pkey_get_private((string) $sa['private_key']);
    if ($key === false) {
        error_log('rgbj_firestore_access_token: invalid private_key in service account JSON');
        return null;
    }
    $signature = '';
    $algo = defined('OPENSSL_ALGORITHM_SHA256') ? OPENSSL_ALGORITHM_SHA256 : 'sha256';
    if (!openssl_sign($unsigned, $signature, $key, $algo)) {
        error_log('rgbj_firestore_access_token: openssl_sign failed');
        return null;
    }
    $jwt = $unsigned . '.' . rgbj_firestore_b64url($signature);

    $post = http_build_query([
        'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        'assertion' => $jwt,
    ]);
    $ctx = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/x-www-form-urlencoded\r\n",
            'content' => $post,
            'timeout' => 10,
            'ignore_errors' => true,
        ],
    ]);
    $resp = @file_get_contents('https://oauth2.googleapis.com/token', false, $ctx);
    if ($resp === false) {
        return null;
    }
    $parsed = json_decode($resp, true);
    if (!is_array($parsed) || empty($parsed['access_token'])) {
        return null;
    }
    $cached = (string) $parsed['access_token'];
    $cachedUntil = $now + (int) ($parsed['expires_in'] ?? 3600);

    return $cached;
}

function rgbj_firestore_b64url(string $data): string
{
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}
