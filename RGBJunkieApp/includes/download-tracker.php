<?php

/**
 * Installer download gateway (download.php) and Firestore tracking helpers.
 * Events are written client-side via /js/firebase.js (same effect-builder project).
 */
declare(strict_types=1);

require_once __DIR__ . '/download-stats-config.php';
require_once __DIR__ . '/site.php';
require_once __DIR__ . '/installers.php';
require_once __DIR__ . '/firestore-download-log.php';

function rgbj_download_link(string $webPath, string $channel = 'website'): string
{
    $webPath = ltrim(str_replace('\\', '/', $webPath), '/');
    $query = 'f=' . rawurlencode($webPath);
    $channel = rgbj_download_normalize_channel($channel);
    if ($channel !== 'website') {
        $query .= '&channel=' . rawurlencode($channel);
    }

    return rgbj_url('download.php?' . $query);
}

/** Extra attributes for links logged to Firestore on click. */
function rgbj_tracked_download_attrs(string $webPath, string $class = ''): string
{
    $webPath = ltrim(str_replace('\\', '/', $webPath), '/');
    $fileName = basename($webPath);
    $classified = rgbj_download_classify($webPath, $fileName);
    $class = trim('rgbj-tracked-download ' . $class);

    return ' class="' . rgbj_h($class) . '"'
        . ' data-rgbj-file-path="' . rgbj_h($webPath) . '"'
        . ' data-rgbj-file-name="' . rgbj_h($fileName) . '"'
        . ' data-rgbj-version="' . rgbj_h((string) ($classified['version'] ?? '')) . '"'
        . ' data-rgbj-kind="' . rgbj_h($classified['kind']) . '"'
        . ' data-rgbj-platform="' . rgbj_h($classified['platform']) . '"'
        . ' data-rgbj-channel="website"';
}

function rgbj_download_normalize_path(string $webPath): string
{
    $webPath = rawurldecode(ltrim(str_replace('\\', '/', $webPath), '/'));
    if ($webPath === '' || str_contains($webPath, '..')) {
        return '';
    }
    if (!preg_match('#^downloads/(?:nsis|msi|portable|linux(?:/(?:deb|rpm|appimage))?)/[^/]+$#', $webPath)) {
        return '';
    }
    return $webPath;
}

/** @return array{version:?string,kind:string,platform:string} */
function rgbj_download_classify(string $filePath, string $fileName): array
{
    $kind = 'other';
    $platform = 'other';
    $version = null;

    if ($ver = rgbj_version_from_setup_name($fileName)) {
        $kind = 'setup';
        $platform = 'windows';
        $version = $ver;
    } elseif ($ver = rgbj_version_from_msi_name($fileName)) {
        $kind = 'msi';
        $platform = 'windows';
        $version = $ver;
    } elseif ($ver = rgbj_version_from_portable_name($fileName)) {
        $kind = 'portable';
        $platform = 'windows';
        $version = $ver;
    } else {
        $parsed = rgbj_parse_linux_artifact_name($fileName);
        if ($parsed !== null) {
            $kind = $parsed['kind'];
            $platform = 'linux';
            $version = $parsed['version'];
        }
    }

    return ['version' => $version, 'kind' => $kind, 'platform' => $platform];
}

function rgbj_download_resolve_file(string $webPath): ?string
{
    $normalized = rgbj_download_normalize_path($webPath);
    if ($normalized === '') {
        return null;
    }

    $absolute = rgbj_app_root() . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $normalized);
    $realFile = realpath($absolute);
    $realDownloads = realpath(rgbj_app_root() . DIRECTORY_SEPARATOR . 'downloads');
    if ($realFile === false || $realDownloads === false || !is_file($realFile)) {
        return null;
    }
    if (!str_starts_with($realFile, $realDownloads)) {
        return null;
    }

    return $realFile;
}

function rgbj_download_serve_file(string $realFile, string $downloadName): void
{
    $size = filesize($realFile);
    if ($size === false) {
        http_response_code(500);
        exit('Unable to read file.');
    }

    header('Content-Type: application/octet-stream');
    header('Content-Disposition: attachment; filename="' . str_replace('"', '', $downloadName) . '"');
    header('Content-Length: ' . (string) $size);
    header('X-Content-Type-Options: nosniff');
    header('Cache-Control: no-store');

    if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'HEAD') {
        return;
    }

    $handle = fopen($realFile, 'rb');
    if ($handle === false) {
        http_response_code(500);
        exit('Unable to read file.');
    }
    while (!feof($handle)) {
        $chunk = fread($handle, 1024 * 1024);
        if ($chunk === false) {
            break;
        }
        echo $chunk;
    }
    fclose($handle);
}

function rgbj_serve_tracked_download(string $webPath, string $channel = 'website'): void
{
    $realFile = rgbj_download_resolve_file($webPath);
    if ($realFile === null) {
        http_response_code(404);
        header('Content-Type: text/plain; charset=UTF-8');
        echo 'Download not found.';
        return;
    }

    $channel = rgbj_download_normalize_channel($channel);
    $fileName = basename($realFile);
    $classified = rgbj_download_classify($webPath, $fileName);
    $userAgent = (string) ($_SERVER['HTTP_USER_AGENT'] ?? '');
    $referer = (string) ($_SERVER['HTTP_REFERER'] ?? '');

    if (rgbj_download_should_log_server_side($channel, $userAgent)) {
        rgbj_firestore_log_download([
            'filePath' => $webPath,
            'fileName' => $fileName,
            'version' => $classified['version'],
            'kind' => $classified['kind'],
            'platform' => $classified['platform'],
            'channel' => $channel,
            'userAgent' => $userAgent,
            'referer' => $referer,
        ]);
    }

    rgbj_download_serve_file($realFile, $fileName);
}

