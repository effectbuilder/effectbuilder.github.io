<?php
/**
 * Site paths and clean URLs for RGBJunkie for Windows (RGBJunkieApp/).
 */
declare(strict_types=1);

/** Filesystem root of this site (directory that contains includes/, downloads/, index.php). */
function rgbj_app_root(): string
{
    return dirname(__DIR__);
}

/** URL path prefix for this site, e.g. /RGBJunkieApp (empty when served from web root). */
function rgbj_base_path(): string
{
    static $cached = null;
    if ($cached !== null) {
        return $cached;
    }

    $script = str_replace('\\', '/', (string) ($_SERVER['SCRIPT_NAME'] ?? ''));
    $segments = array_values(array_filter(explode('/', trim($script, '/')), static fn (string $s): bool => $s !== ''));

    if ($segments !== []) {
        $last = $segments[count($segments) - 1];
        if (preg_match('/\.(php|html)$/i', $last)) {
            array_pop($segments);
        }
    }

  // Nested paths under RGBJunkieApp (e.g. stats/downloads/) — strip all section segments.
    $sectionDirs = ['releases', 'terms', 'privacy', 'supported', 'docs', 'deep-links', 'changelog', 'stats', 'downloads', 'thanks'];
    while ($segments !== [] && in_array($segments[count($segments) - 1], $sectionDirs, true)) {
        array_pop($segments);
    }

    $cached = $segments === [] ? '' : '/' . implode('/', $segments);
    return $cached;
}

/**
 * Build a site URL path. Examples: rgbj_url() -> /RGBJunkieApp/, rgbj_url('releases/') -> /RGBJunkieApp/releases/
 *
 * @param string $path Empty, hash anchor (#download), or path under this site (releases/, terms/, supported/).
 */
function rgbj_url(string $path = ''): string
{
    $base = rgbj_base_path();
    $path = ltrim(str_replace('\\', '/', $path), '/');

    if ($path === '') {
        return $base === '' ? '/' : $base . '/';
    }

    if ($path[0] === '#') {
        return ($base === '' ? '/' : $base . '/') . $path;
    }

    return ($base === '' ? '' : $base) . '/' . $path;
}

function rgbj_nav_is_active(string $page): bool
{
    return ($GLOBALS['rgbj_nav_active'] ?? 'home') === $page;
}

/** Absolute URL for a file under this site (tracked when under downloads/). */
function rgbj_download_absolute_url(string $webPath): string
{
    $webPath = ltrim(str_replace('\\', '/', $webPath), '/');
    if (preg_match('#^https?://#i', $webPath)) {
        return $webPath;
    }

    $scheme = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'] ?? 'localhost';
    if (str_starts_with($webPath, 'downloads/')) {
        if (!function_exists('rgbj_download_link')) {
            require_once __DIR__ . '/download-tracker.php';
        }
        $path = rgbj_download_link($webPath);
    } else {
        $path = rgbj_url($webPath);
    }

    return $scheme . '://' . $host . $path;
}

/** Official RGBJunkie Discord invite (lands in #welcome-and-rules). */
const RGBJ_DISCORD_INVITE_URL = 'https://discord.gg/adHsQG8czv';

/**
 * Free browser tools on rgbjunkie.com (sibling paths from site root).
 *
 * @return list<array{label: string, href: string, description: string, icon: string}>
 */
function rgbj_web_tools(): array
{
    return [
        [
            'label' => 'Effect Builder',
            'href' => '/',
            'description' => 'Design custom lighting effects in the browser and export them for SignalRGB.',
            'icon' => 'bi-magic',
        ],
        [
            'label' => 'Component Builder',
            'href' => '/builder/',
            'description' => 'Lay out LED strips and zones visually, then export a component for your rig.',
            'icon' => 'bi-grid-3x3-gap',
        ],
        [
            'label' => 'Effect Combiner',
            'href' => '/combiner/',
            'description' => 'Blend and layer existing effects into something new without starting from scratch.',
            'icon' => 'bi-layers',
        ],
        [
            'label' => 'Skydimo LUA Builder',
            'href' => '/skydimo/',
            'description' => 'Sketch Skydimo-compatible LUA effects with a live preview and generated code.',
            'icon' => 'bi-code-slash',
        ],
    ];
}
