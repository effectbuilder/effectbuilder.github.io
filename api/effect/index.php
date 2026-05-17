<?php
/**
 * RGBJunkie — effect settings share endpoint (reference implementation)
 *
 * Live: `https://rgbjunkie.com/api/effect/`
 *
 * - **POST** — JSON envelope (max 2 MB); stores body; returns `{ id, shareId, shareUrl, url }`.
 * - **GET ?id=…** — returns stored JSON for the desktop/web importer.
 * - **GET ?rgbj=v1.…** — **HTML** handoff page (app-like styling): JS navigates to
 *   `rgbjunkie://import#rgbj-effect=v1.…`, tries `window.close()`, shows a short decoded summary when
 *   gzip/JSON parse succeeds. Self-contained links need **query** (fragments never reach PHP).
 * - **GET** with neither — JSON **404**.
 *
 * @see EFFECT_SETTINGS_SHARE_API.md (repo root)
 */
declare(strict_types=1);

const MAX_BODY_BYTES = 2 * 1024 * 1024;
/** Same cap as app share links (~24576 chars total URL). */
const MAX_RGBJ_QUERY_CHARS = 24576;
const SHARE_DATA_DIR = __DIR__ . '/../private-data/effect-settings-shares';

function respond_json(int $httpCode, array $payload): never {
    http_response_code($httpCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function sanitize_share_id(string $raw): ?string {
    $t = trim($raw);
    if ($t === '' || strlen($t) > 80) {
        return null;
    }
    if (!preg_match('/^[A-Za-z0-9_-]+$/', $t)) {
        return null;
    }
    return $t;
}

function new_share_id(): string {
    return rtrim(strtr(base64_encode(random_bytes(18)), '+/', '-_'), '=');
}

function base64url_decode_to_bytes(string $b64url): string {
    $b64 = strtr($b64url, '-_', '+/');
    $pad = strlen($b64) % 4;
    if ($pad > 0) {
        $b64 .= str_repeat('=', 4 - $pad);
    }
    $out = base64_decode($b64, true);
    return $out === false ? '' : $out;
}

/**
 * @return array<string, mixed>|null Decoded envelope or null if gzip/JSON fails.
 */
function try_decode_rgbj_v1_envelope(string $raw): ?array {
    if (!preg_match('/^v1\.(.+)$/', $raw, $m)) {
        return null;
    }
    $bin = base64url_decode_to_bytes($m[1]);
    if ($bin === '') {
        return null;
    }
    $json = @gzdecode($bin);
    if ($json === false || $json === '') {
        return null;
    }
    $data = json_decode($json, true);
    return is_array($data) ? $data : null;
}

/**
 * @param array<string, mixed>|null $env
 * @return array{lines: list<array{label: string, value: string}>}
 */
function rgbj_envelope_summary(?array $env): array {
    $lines = [];
    if ($env === null) {
        return ['lines' => $lines];
    }

    $effect = $env['effect'] ?? null;
    if (is_array($effect)) {
        $lmStr = '';
        if (array_key_exists('lightingMode', $effect)) {
            $lm = $effect['lightingMode'];
            if (is_string($lm) || is_int($lm) || is_float($lm)) {
                $lmStr = (string) $lm;
            }
        }
        $displayName = '';
        if (isset($effect['activeEffectDisplayName']) && is_string($effect['activeEffectDisplayName'])) {
            $displayName = trim($effect['activeEffectDisplayName']);
        }
        if ($displayName !== '') {
            $lines[] = [
                'label' => 'Effect',
                'value' => $lmStr !== '' ? $displayName . ' · ' . $lmStr : $displayName,
            ];
        } elseif ($lmStr !== '') {
            $lines[] = ['label' => 'Lighting mode', 'value' => $lmStr];
        }
        if (isset($effect['profileFormat']) && (is_string($effect['profileFormat']) || is_int($effect['profileFormat']))) {
            $lines[] = ['label' => 'Profile format', 'value' => (string) $effect['profileFormat']];
        }
    }

    if (isset($env['exportedAt']) && is_string($env['exportedAt']) && $env['exportedAt'] !== '') {
        $ea = $env['exportedAt'];
        $ts = strtotime($ea);
        $disp = ($ts !== false) ? date('M j, Y · H:i T', $ts) : $ea;
        $lines[] = ['label' => 'Exported', 'value' => $disp];
    }
    $client = $env['client'] ?? null;
    if (is_array($client)) {
        $name = isset($client['name']) && is_string($client['name']) ? $client['name'] : 'RGBJunkie';
        $ver = isset($client['version']) && is_string($client['version']) ? $client['version'] : '';
        $lines[] = ['label' => 'From', 'value' => trim($name . ($ver !== '' ? ' ' . $ver : ''))];
    }

    return ['lines' => $lines];
}

/**
 * Styled HTML handoff: opens app via JS, optional summary, tries to close tab.
 *
 * @param string $raw decoded query value (v1.<base64url>)
 */
function send_rgbj_handoff_html(string $raw): never {
    $raw = trim($raw);
    if ($raw === '' || strlen($raw) > MAX_RGBJ_QUERY_CHARS) {
        respond_json(400, ['error' => 'Invalid or oversized rgbj parameter.']);
    }
    if (!preg_match('/^v1\.[A-Za-z0-9_-]+$/', $raw)) {
        respond_json(400, ['error' => 'rgbj must be v1.<base64url(gzip(JSON)))>.']);
    }

    $deepLink = 'rgbjunkie://import#rgbj-effect=' . $raw;
    $env = try_decode_rgbj_v1_envelope($raw);
    $summary = rgbj_envelope_summary($env);

    http_response_code(200);
    header('Content-Type: text/html; charset=utf-8');
    header('Referrer-Policy: no-referrer');
    header('X-Robots-Tag: noindex, nofollow');

    $esc = static function (string $s): string {
        return htmlspecialchars($s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    };

    echo '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">';
    echo '<meta name="color-scheme" content="dark">';
    echo '<title>RGBJunkie — Opening…</title>';
    echo '<style>';
    echo ':root{--bg0:#0d0f12;--bg1:#121212;--bg2:#16191f;--border:#2a2f38;--text:#e5e8ef;--soft:#a7b1c2;--accent:#55f86f;--accent-dim:rgba(85,248,111,.18);--radius:10px;}';
    echo 'body{margin:0;min-height:100vh;background:radial-gradient(circle at 50% 8%,rgba(255,255,255,.06),transparent 42%),var(--bg0);color:var(--text);font-family:Inter,Segoe UI,system-ui,sans-serif;font-size:15px;line-height:1.45;}';
    echo '.wrap{max-width:28rem;margin:0 auto;padding:clamp(1.25rem,4vw,2.5rem) 1.25rem 2rem;}';
    echo '.brand{font-family:Rajdhani,Segoe UI,sans-serif;font-weight:600;font-size:1.35rem;letter-spacing:.04em;color:var(--text);margin:0 0 .35rem;}';
    echo '.brand span{color:var(--accent);}';
    echo '.card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius);padding:1.1rem 1.15rem 1rem;box-shadow:0 0 0 1px var(--accent-dim);}';
    echo '.status{display:flex;align-items:flex-start;gap:.65rem;margin:0 0 1rem;}';
    echo '.dot{width:.55rem;height:.55rem;border-radius:50%;background:var(--accent);margin-top:.45rem;flex-shrink:0;animation:pulse 1.2s ease-in-out infinite;}@keyframes pulse{50%{opacity:.45}}';
    echo 'h1{font-size:1.05rem;font-weight:600;margin:0 0 .25rem;}';
    echo '.hint{font-size:.88rem;color:var(--soft);margin:.5rem 0 0;}';
    echo 'dl{margin:.35rem 0 0;font-size:.92rem;}';
    echo 'dt{color:var(--soft);font-size:.78rem;text-transform:uppercase;letter-spacing:.06em;margin:.65rem 0 .15rem;}';
    echo 'dd{margin:0;color:var(--text);word-break:break-word;}';
    echo '.actions{display:flex;flex-wrap:wrap;gap:.5rem;margin-top:1.1rem;}';
    echo 'button{font:inherit;cursor:pointer;border-radius:var(--radius);padding:.5rem .95rem;border:1px solid var(--border);background:var(--bg1);color:var(--text);}';
    echo 'button.primary{background:linear-gradient(180deg,rgba(85,248,111,.25),rgba(85,248,111,.08));border-color:rgba(85,248,111,.45);color:var(--text);}';
    echo 'button:hover{filter:brightness(1.08);}';
    echo '</style>';
    echo '<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>';
    echo '<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Rajdhani:wght@600&display=swap" rel="stylesheet">';
    echo '</head><body><div class="wrap">';
    echo '<p class="brand">RGB<span>Junkie</span></p>';
    echo '<div class="card"><div class="status"><span class="dot" aria-hidden="true"></span><div>';
    echo '<h1>Opening the app…</h1>';
    echo '<p class="hint">If RGBJunkie is installed, it should open with these settings. You can close this tab when you\'re done.</p></div></div>';

    if ($summary['lines'] !== []) {
        echo '<dl>';
        foreach ($summary['lines'] as $row) {
            echo '<dt>' . $esc($row['label']) . '</dt><dd>' . $esc($row['value']) . '</dd>';
        }
        echo '</dl>';
    } elseif ($env === null) {
        echo '<p class="hint">Effect details could not be read from this link (still sending to the app).</p>';
    }

    echo '<div class="actions">';
    echo '<button type="button" class="primary" id="rgbj-open-again">Open again</button>';
    echo '<button type="button" id="rgbj-close">Close this tab</button>';
    echo '</div></div></div>';

    $deepJson = json_encode($deepLink, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_UNESCAPED_UNICODE);
    echo '<script>(function(){var u=' . $deepJson . ';function go(){try{location.replace(u);}catch(e){location.href=u;}}';
    echo 'go();setTimeout(function(){try{window.close();}catch(e){}},900);';
    echo 'document.getElementById("rgbj-open-again").addEventListener("click",go);';
    echo 'document.getElementById("rgbj-close").addEventListener("click",function(){try{window.close();}catch(e){}});';
    echo '})();</script>';
    echo '</body></html>';
    exit;
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if (!is_dir(SHARE_DATA_DIR) && !mkdir(SHARE_DATA_DIR, 0700, true)) {
    respond_json(500, ['error' => 'Server storage is not available.']);
}

if ($method === 'POST') {
    $raw = file_get_contents('php://input') ?: '';
    if (strlen($raw) > MAX_BODY_BYTES) {
        respond_json(413, ['error' => 'Payload too large (max 2 MB).']);
    }
    if ($raw === '') {
        respond_json(400, ['error' => 'Empty body.']);
    }
    json_decode($raw);
    if (json_last_error() !== JSON_ERROR_NONE) {
        respond_json(400, ['error' => 'Body is not valid JSON: ' . json_last_error_msg()]);
    }

    $id = new_share_id();
    $path = SHARE_DATA_DIR . '/' . $id . '.json';
    for ($i = 0; $i < 8 && file_exists($path); $i++) {
        $id = new_share_id();
        $path = SHARE_DATA_DIR . '/' . $id . '.json';
    }
    if (file_exists($path)) {
        respond_json(500, ['error' => 'Could not allocate a new share id.']);
    }
    if (file_put_contents($path, $raw, LOCK_EX) === false) {
        respond_json(500, ['error' => 'Could not store share.']);
    }

    $host = $_SERVER['HTTP_HOST'] ?? 'rgbjunkie.com';
    $https = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
    $scheme = $https ? 'https' : 'http';
    $shareUrl = $scheme . '://' . $host . '/api/effect/?id=' . rawurlencode($id);
    respond_json(201, [
        'id' => $id,
        'shareId' => $id,
        'shareUrl' => $shareUrl,
        'url' => $shareUrl,
    ]);
}

if ($method === 'GET') {
    $rgbjRaw = $_GET['rgbj'] ?? null;
    if (is_string($rgbjRaw) && trim($rgbjRaw) !== '') {
        // PHP decodes the query string once; do not rawurldecode again (would break %-escaped bytes).
        send_rgbj_handoff_html($rgbjRaw);
    }

    $idRaw = $_GET['id'] ?? '';
    if (!is_string($idRaw) || trim($idRaw) === '') {
        respond_json(404, [
            'error' => 'Use ?id=<shareId> for stored JSON, or ?rgbj=v1… for app redirect (see EFFECT_SETTINGS_SHARE_API.md).',
        ]);
    }
    $id = sanitize_share_id($idRaw);
    if ($id === null) {
        respond_json(400, ['error' => 'Missing or invalid id (use letters, digits, _, -, max 80).']);
    }
    $path = SHARE_DATA_DIR . '/' . $id . '.json';
    if (!is_file($path)) {
        respond_json(404, ['error' => 'Share not found.']);
    }
    $body = file_get_contents($path);
    if ($body === false || $body === '') {
        respond_json(500, ['error' => 'Could not read share.']);
    }
    http_response_code(200);
    header('Content-Type: application/json; charset=utf-8');
    echo $body;
    exit;
}

respond_json(405, ['error' => 'Method not allowed.']);
