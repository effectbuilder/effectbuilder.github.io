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

    $sectionDirs = ['releases', 'terms', 'privacy', 'supported', 'docs', 'changelog'];
    if ($segments !== [] && in_array($segments[count($segments) - 1], $sectionDirs, true)) {
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
