<?php
/**
 * RGBJunkie — short app-link handoff (SignalRGB-style `s?p=…`).
 *
 * Examples:
 *   /s?p=addon/install&url=https://github.com/owner/repo
 *   /s?p=view/settings/installed
 *   /s?p=effect/apply/Rainbow%20Rise?speed=3
 */
declare(strict_types=1);

require_once __DIR__ . '/../includes/site.php';

function rgbj_handoff_path_from_request(): string {
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
        }
        return $path;
    }
    $uri = $_SERVER['REQUEST_URI'] ?? '';
    if (preg_match('#/s/([^?]+)#', $uri, $m)) {
        return ltrim(rawurldecode($m[1]), '/');
    }
    return '';
}

function rgbj_build_deep_link_from_path(string $pathAndQuery): ?string {
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
?>
<!DOCTYPE html>
<html lang="en" data-bs-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?></title>
    <link rel="stylesheet" href="<?= htmlspecialchars(rgbj_url('assets/rgbjunkie-app.css'), ENT_QUOTES, 'UTF-8') ?>">
    <style>
        body { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem; }
        .rgbj-handoff-card { max-width: 32rem; text-align: center; }
        .rgbj-handoff-card code { word-break: break-all; font-size: 0.85rem; }
    </style>
</head>
<body>
    <div class="rgbj-handoff-card">
        <h1 class="h4 mb-3"><?= htmlspecialchars($title, ENT_QUOTES, 'UTF-8') ?></h1>
        <?php if ($deepLink): ?>
            <p class="text-secondary">If RGBJunkie is installed, it should open automatically.</p>
            <p><a class="btn btn-primary" id="rgbj-open-app" href="<?= htmlspecialchars($deepLink, ENT_QUOTES, 'UTF-8') ?>">Open RGBJunkie</a></p>
            <p class="mt-3"><code><?= htmlspecialchars($deepLink, ENT_QUOTES, 'UTF-8') ?></code></p>
            <script>
                (function () {
                    var target = <?= json_encode($deepLink, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) ?>;
                    try { window.location.href = target; } catch (e) {}
                    setTimeout(function () {
                        try { window.close(); } catch (e2) {}
                    }, 1200);
                })();
            </script>
        <?php else: ?>
            <p class="text-secondary">This link is missing a valid path. See the app link docs on rgbjunkie.com.</p>
            <p><a class="btn btn-outline-light" href="<?= htmlspecialchars(rgbj_url(''), ENT_QUOTES, 'UTF-8') ?>">Back to RGBJunkie</a></p>
        <?php endif; ?>
    </div>
</body>
</html>
