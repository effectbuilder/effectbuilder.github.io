<?php
/**
 * Discover paired RGBJunkie Windows installers under downloads/nsis and downloads/msi.
 */

declare(strict_types=1);

require_once __DIR__ . '/site.php';
require_once __DIR__ . '/page-layout.php';

const RGBJ_NSIS_DIR = 'downloads/nsis';
const RGBJ_MSI_DIR = 'downloads/msi';
const RGBJ_PORTABLE_DIR = 'downloads/portable';

/** @return array{nsis:string,msi:string} Absolute directory paths. */
function rgbj_installer_directories(string $siteRoot): array
{
    return [
        'nsis' => $siteRoot . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, RGBJ_NSIS_DIR),
        'msi' => $siteRoot . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, RGBJ_MSI_DIR),
    ];
}

function rgbj_version_from_setup_name(string $filename): ?string
{
    if (preg_match('/^RGBJunkie_(.+)_x64-setup\.exe$/i', $filename, $m)) {
        return $m[1];
    }
    return null;
}

function rgbj_version_from_msi_name(string $filename): ?string
{
    if (preg_match('/^RGBJunkie_(.+)_x64(?:_en-US)?\.msi$/i', $filename, $m)) {
        return $m[1];
    }
    return null;
}

function rgbj_version_from_portable_name(string $filename): ?string
{
    if (preg_match('/^RGBJunkie_(.+)_x64-portable\.zip$/i', $filename, $m)) {
        return $m[1];
    }
    return null;
}

/** @return array{file:string,webPath:string,size:int,mtime:int}|null */
function rgbj_installer_file_meta(string $dir, string $webSubdir, string $filename): ?array
{
    $path = $dir . DIRECTORY_SEPARATOR . $filename;
    if (!is_file($path)) {
        return null;
    }
    return [
        'file' => $filename,
        'webPath' => $webSubdir . '/' . rawurlencode($filename),
        'size' => (int) filesize($path),
        'mtime' => (int) filemtime($path),
    ];
}

/**
 * @return list<array{
 *   version:string,
 *   sortKey:string,
 *   portable:array{file:string,webPath:string,size:int,mtime:int}|null,
 *   setup:array{file:string,webPath:string,size:int,mtime:int}|null,
 *   msi:array{file:string,webPath:string,size:int,mtime:int}|null
 * }>
 */
function rgbj_discover_releases(string $siteRoot): array
{
    $dirs = rgbj_installer_directories($siteRoot);
    $portableDir = $siteRoot . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, RGBJ_PORTABLE_DIR);
    /** @var array<string, array{version:string,sortKey:string,portable:?array,setup:?array,msi:?array}> $byVer */
    $byVer = [];

    $ensure = static function (string $ver) use (&$byVer): void {
        if (!isset($byVer[$ver])) {
            $byVer[$ver] = [
                'version' => $ver,
                'sortKey' => $ver,
                'portable' => null,
                'setup' => null,
                'msi' => null,
            ];
        }
    };

    if (is_dir($portableDir)) {
        foreach (glob($portableDir . DIRECTORY_SEPARATOR . 'RGBJunkie_*_x64-portable.zip') ?: [] as $path) {
            $name = basename($path);
            $ver = rgbj_version_from_portable_name($name);
            if ($ver === null) {
                continue;
            }
            $ensure($ver);
            $byVer[$ver]['portable'] = rgbj_installer_file_meta($portableDir, RGBJ_PORTABLE_DIR, $name);
        }
    }

    if (is_dir($dirs['nsis'])) {
        foreach (glob($dirs['nsis'] . DIRECTORY_SEPARATOR . 'RGBJunkie_*_x64-setup.exe') ?: [] as $path) {
            $name = basename($path);
            $ver = rgbj_version_from_setup_name($name);
            if ($ver === null) {
                continue;
            }
            $ensure($ver);
            $byVer[$ver]['setup'] = rgbj_installer_file_meta($dirs['nsis'], RGBJ_NSIS_DIR, $name);
        }
    }

    if (is_dir($dirs['msi'])) {
        foreach (glob($dirs['msi'] . DIRECTORY_SEPARATOR . 'RGBJunkie_*_x64*.msi') ?: [] as $path) {
            $name = basename($path);
            $ver = rgbj_version_from_msi_name($name);
            if ($ver === null) {
                continue;
            }
            $ensure($ver);
            $byVer[$ver]['msi'] = rgbj_installer_file_meta($dirs['msi'], RGBJ_MSI_DIR, $name);
        }
    }

    $complete = [];
    foreach ($byVer as $row) {
        $hasPortable = $row['portable'] !== null;
        $hasPair = $row['setup'] !== null && $row['msi'] !== null;
        if (!$hasPortable && !$hasPair) {
            continue;
        }
        $complete[] = $row;
    }

    usort($complete, static function (array $a, array $b): int {
        return version_compare($b['sortKey'], $a['sortKey']);
    });

    return $complete;
}

/**
 * @return list<array{
 *   version:string,
 *   sortKey:string,
 *   setup:array{file:string,webPath:string,size:int,mtime:int},
 *   msi:array{file:string,webPath:string,size:int,mtime:int}
 * }>
 */
function rgbj_discover_installer_pairs(string $siteRoot): array
{
    $paired = [];
    foreach (rgbj_discover_releases($siteRoot) as $row) {
        if ($row['setup'] === null || $row['msi'] === null) {
            continue;
        }
        $paired[] = [
            'version' => $row['version'],
            'sortKey' => $row['sortKey'],
            'setup' => $row['setup'],
            'msi' => $row['msi'],
        ];
    }
    return $paired;
}

function rgbj_format_bytes(int $bytes): string
{
    if ($bytes < 1024) {
        return $bytes . ' B';
    }
    if ($bytes < 1048576) {
        return round($bytes / 1024, 1) . ' KB';
    }
    return round($bytes / 1048576, 1) . ' MB';
}

function rgbj_rel_id(string $version): string
{
    return 'rel-' . preg_replace('/[^a-zA-Z0-9_-]+/', '-', $version);
}

function rgbj_link_suffix(string $version): string
{
    return preg_replace('/\./', '', $version);
}

function rgbj_h(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/** Pre-1.0 semver builds are development releases (matches public-site policy). */
function rgbj_is_development_version(string $version): bool
{
    return version_compare($version, '1.0', '<');
}

/** @return list<string> HTML badge fragments (already escaped where needed). */
function rgbj_version_status_badges(string $version, bool $isCurrent = false): array
{
    $badges = [];
    if ($isCurrent) {
        $badges[] = '<span class="badge text-bg-success">Current</span>';
    }
    if (rgbj_is_development_version($version)) {
        $badges[] = '<span class="badge text-bg-warning text-dark">Development</span>';
    }
    return $badges;
}

function rgbj_version_status_badges_html(string $version, bool $isCurrent = false): string
{
    $badges = rgbj_version_status_badges($version, $isCurrent);
    return $badges === [] ? '' : '<span class="d-inline-flex flex-wrap gap-1">' . implode('', $badges) . '</span>';
}
