<?php
/**
 * Firebase ID token verification for Help Center editor API (admin only).
 */
declare(strict_types=1);

require_once __DIR__ . '/download-stats-config.php';

const RGBJ_HELP_FIREBASE_API_KEY = 'AIzaSyBIzgQqxHMTdCsW0UG4MOEuFWwjEYAFYbk';

function rgbj_help_editor_admin_uid(): string
{
    return (string) (rgbj_download_stats_config()['admin_uid'] ?? '');
}

function rgbj_help_editor_bearer_token(): ?string
{
    $header = (string) ($_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? '');

    if ($header === '' && function_exists('apache_request_headers')) {
        $apacheHeaders = apache_request_headers();
        if (is_array($apacheHeaders)) {
            foreach ($apacheHeaders as $name => $value) {
                if (strcasecmp((string) $name, 'Authorization') === 0) {
                    $header = (string) $value;
                    break;
                }
            }
        }
    }

    if ($header === '' && function_exists('getallheaders')) {
        foreach (getallheaders() as $name => $value) {
            if (strcasecmp((string) $name, 'Authorization') === 0) {
                $header = (string) $value;
                break;
            }
        }
    }

    if (preg_match('/^Bearer\s+(\S+)/i', $header, $m)) {
        return $m[1];
    }

    $alt = trim((string) ($_SERVER['HTTP_X_RGBJ_AUTH'] ?? ''));
    if ($alt !== '') {
        return $alt;
    }

    return null;
}

/** @return array{uid: string, email: string}|null */
function rgbj_help_editor_verify_token(string $idToken): ?array
{
    $payload = json_encode(['idToken' => $idToken], JSON_THROW_ON_ERROR);
    $url = 'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' . rawurlencode(RGBJ_HELP_FIREBASE_API_KEY);

    $ctx = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\n",
            'content' => $payload,
            'timeout' => 15,
            'ignore_errors' => true,
        ],
    ]);

    $raw = @file_get_contents($url, false, $ctx);
    if ($raw === false) {
        return null;
    }

    $data = json_decode($raw, true);
    if (!is_array($data)) {
        return null;
    }

    $user = $data['users'][0] ?? null;
    if (!is_array($user) || empty($user['localId'])) {
        return null;
    }

    return [
        'uid' => (string) $user['localId'],
        'email' => (string) ($user['email'] ?? ''),
    ];
}

function rgbj_help_editor_require_admin(): array
{
    $token = rgbj_help_editor_bearer_token();
    if ($token === null) {
        http_response_code(401);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'Missing Authorization bearer token.'], JSON_THROW_ON_ERROR);
        exit;
    }

    $user = rgbj_help_editor_verify_token($token);
    if ($user === null) {
        http_response_code(401);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'Invalid or expired sign-in token.'], JSON_THROW_ON_ERROR);
        exit;
    }

    $adminUid = rgbj_help_editor_admin_uid();
    if ($adminUid === '' || $user['uid'] !== $adminUid) {
        http_response_code(403);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'Admin access required.'], JSON_THROW_ON_ERROR);
        exit;
    }

    return $user;
}

function rgbj_help_editor_json_response(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    exit;
}
