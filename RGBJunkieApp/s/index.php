<?php

/**
 * RGBJunkie — short app-link handoff (`s?p=…`).
 *
 * Examples:
 *   /s?p=addon%2Finstall&url=https://github.com/owner/repo
 *   /s?p=view%2Fsettings%2Finstalled
 *   /s?p=effect%2Fapply%2FRainbow%20Rise&speed=3
 */

declare(strict_types=1);

require_once __DIR__ . '/../includes/installers.php';
require_once __DIR__ . '/../includes/app-deep-links.php';

/** Must match `DEEPLINK_HTTP_PORT` in RGBJunkie `src-tauri/src/deep_link_inbox.rs`. */
const RGBJ_DEEPLINK_HTTP_PORT = 14221;

function rgbj_handoff_path_from_request(): string
{
    $p = isset($_GET['p']) ? trim((string) $_GET['p']) : '';

    if ($p !== '') {
        $path = ltrim($p, '/');

        if (
            str_starts_with($path, 'addon/install')
            && !str_contains($path, 'url=')
            && isset($_GET['url'])
            && trim((string) $_GET['url']) !== ''
        ) {
            $path .= '?url=' . rawurlencode(trim((string) $_GET['url']));
        } else {
            $extra = $_GET;
            unset($extra['p']);
            if ($extra !== []) {
                $path .= '?' . http_build_query($extra);
            }
        }

        return $path;
    }

    $uri = $_SERVER['REQUEST_URI'] ?? '';
    if (preg_match('#/s/([^?]+)#', $uri, $m)) {
        return ltrim(rawurldecode($m[1]), '/');
    }

    return '';
}

function rgbj_build_deep_link_from_path(string $pathAndQuery): ?string
{
    $pathAndQuery = trim($pathAndQuery);
    if ($pathAndQuery === '') {
        return null;
    }

    $qIdx = strpos($pathAndQuery, '?');
    $pathPart = $qIdx === false ? $pathAndQuery : substr($pathAndQuery, 0, $qIdx);
    $queryPart = $qIdx === false ? '' : substr($pathAndQuery, $qIdx + 1);

    $segments = array_values(array_filter(explode('/', trim($pathPart, '/')), static fn ($s) => $s !== ''));
    if ($segments === []) {
        return null;
    }

    $params = [];
    if ($queryPart !== '') {
        parse_str($queryPart, $params);
    }

    if ($segments[0] === 'addon' && ($segments[1] ?? '') === 'install') {
        $gitUrl = isset($params['url']) ? trim((string) $params['url']) : '';
        if ($gitUrl === '' || !preg_match('#^https://(github\.com|gitlab\.com)/#i', $gitUrl)) {
            return null;
        }

        return 'rgbjunkie://addon/install?url=' . rawurlencode($gitUrl);
    }

    if ($segments[0] === 'effect' && ($segments[1] ?? '') === 'apply') {
        $name = implode('/', array_slice($segments, 2));
        if ($name === '') {
            return null;
        }
        $qs = $queryPart !== '' ? '?' . $queryPart : '';

        return 'rgbjunkie://effect/apply/' . rawurlencode(rawurldecode($name)) . $qs;
    }

    if (in_array($segments[0], ['scene', 'layout'], true) && ($segments[1] ?? '') === 'apply') {
        $name = implode('/', array_slice($segments, 2));
        if ($name === '') {
            return null;
        }
        $host = $segments[0];
        $qs = $queryPart !== '' ? '?' . $queryPart : '';

        return 'rgbjunkie://' . $host . '/apply/' . rawurlencode(rawurldecode($name)) . $qs;
    }

    if ($segments[0] === 'view') {
        $rest = implode('/', array_slice($segments, 1));
        $qs = $queryPart !== '' ? '?' . $queryPart : '';

        return $rest !== ''
            ? 'rgbjunkie://view/' . $rest . $qs
            : 'rgbjunkie://view/overview' . $qs;
    }

    if ($segments[0] === 'open' && ($segments[1] ?? '') === 'appdata') {
        $sub = rgbj_normalize_appdata_deep_link_subpath(implode('/', array_slice($segments, 2)));
        if ($sub === null) {
            return null;
        }
        $qs = $queryPart !== '' ? '?' . $queryPart : '';

        return $sub !== ''
            ? 'rgbjunkie://open/appdata/' . $sub . $qs
            : 'rgbjunkie://open/appdata' . $qs;
    }

    if ($segments[0] === 'app' && ($segments[1] ?? '') === 'restart') {
        $qs = $queryPart !== '' ? '?' . $queryPart : '';

        return 'rgbjunkie://app/restart' . $qs;
    }

    if ($segments[0] === 'import') {
        return 'rgbjunkie://import' . ($queryPart !== '' ? '?' . $queryPart : '');
    }

    return null;
}

$path = rgbj_handoff_path_from_request();
$deepLink = rgbj_build_deep_link_from_path($path);
$title = $deepLink ? 'Opening RGBJunkie…' : 'Invalid RGBJunkie link';
$pageTitle = $title . ' | RGBJunkie for Windows';
$pageDesc = $deepLink
    ? 'Handoff link that opens RGBJunkie on your PC.'
    : 'This RGBJunkie handoff link is missing a valid path.';

$rgbj_nav_active = 'help';

rgbj_page_head(['title' => $pageTitle, 'description' => $pageDesc]);
rgbj_page_analytics();
rgbj_render_page_nav();
rgbj_subpage_open([
    ['label' => 'RGBJunkie for Windows', 'href' => rgbj_url()],
    ['label' => 'Help Center', 'href' => rgbj_url('help/')],
    ['label' => $title],
]);
?>

<div class="rgbj-handoff-card text-center mx-auto py-4" style="max-width: 36rem;">
    <h1 class="h3 fw-bold text-body-emphasis mb-3"><i class="bi bi-box-arrow-up-right me-2 text-info" aria-hidden="true"></i><?= rgbj_h($title) ?></h1>

    <?php if ($deepLink) : ?>
        <p class="text-body-secondary mb-3" id="rgbj-handoff-status">Sending link to RGBJunkie…</p>
        <p class="text-body-secondary small mb-4">If RGBJunkie is already running, the link should apply with no extra prompts. If the app is closed, Windows may ask once to start RGBJunkie (it runs as administrator for USB lighting access).</p>
        <p class="mb-3">
            <a class="btn btn-primary btn-lg" id="rgbj-open-app" href="<?= rgbj_h($deepLink) ?>">Open RGBJunkie</a>
        </p>
        <p class="small text-body-secondary mb-2">App link</p>
        <p class="mb-0"><code class="user-select-all d-inline-block text-start px-3 py-2 bg-dark border border-secondary rounded"><?= rgbj_h($deepLink) ?></code></p>
        <p class="mt-4 mb-0">
            <a href="<?= rgbj_h(rgbj_url('help/app-links/')) ?>" class="link-info">More about app links</a>
        </p>
        <script>
            (function () {
                var target = <?= json_encode($deepLink, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>;
                var statusEl = document.getElementById('rgbj-handoff-status');
                var openBtn = document.getElementById('rgbj-open-app');
                var handoffUrl = 'http://127.0.0.1:<?= (int) RGBJ_DEEPLINK_HTTP_PORT ?>/handoff';

                function setStatus(text) {
                    if (statusEl) {
                        statusEl.textContent = text;
                    }
                }

                function openProtocol() {
                    try { window.location.href = target; } catch (e) {}
                }

                fetch(handoffUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain' },
                    body: target,
                    mode: 'cors',
                    keepalive: true
                }).then(function (res) {
                    if (!res.ok) {
                        throw new Error('handoff rejected');
                    }
                    setStatus('Link sent to RGBJunkie.');
                    if (openBtn) {
                        openBtn.textContent = 'Sent to RGBJunkie';
                        openBtn.classList.remove('btn-primary');
                        openBtn.classList.add('btn-outline-light');
                    }
                }).catch(function () {
                    setStatus('RGBJunkie is not running — opening the app…');
                    window.setTimeout(openProtocol, 300);
                });
            })();
        </script>
    <?php else : ?>
        <p class="text-body-secondary mb-4">This link is missing a valid path. See the app link docs for supported handoff URLs.</p>
        <p class="mb-0">
            <a class="btn btn-outline-light me-2" href="<?= rgbj_h(rgbj_url('help/app-links/')) ?>">App links help</a>
            <a class="btn btn-primary" href="<?= rgbj_h(rgbj_url('')) ?>">Back to RGBJunkie</a>
        </p>
    <?php endif; ?>
</div>

<?php
rgbj_subpage_close();
$rgbj_footer_blurb = 'Website handoff links that open RGBJunkie on your PC.';
require __DIR__ . '/../includes/page-footer.php';
rgbj_page_scripts_end();
