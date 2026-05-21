<?php
/**
 * Discover RGBJunkie release artifacts under downloads/{nsis,msi,portable,linux}.
 */

declare(strict_types=1);

require_once __DIR__ . '/site.php';
require_once __DIR__ . '/page-layout.php';

const RGBJ_NSIS_DIR = 'downloads/nsis';
const RGBJ_MSI_DIR = 'downloads/msi';
const RGBJ_PORTABLE_DIR = 'downloads/portable';
const RGBJ_LINUX_DIR = 'downloads/linux';

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

/** @return 'deb'|'rpm'|'appimage'|null */
function rgbj_linux_artifact_kind(string $filename): ?string
{
    $lower = strtolower($filename);
    if (str_ends_with($lower, '.deb')) {
        return 'deb';
    }
    if (str_ends_with($lower, '.rpm')) {
        return 'rpm';
    }
    if (str_ends_with($lower, '.appimage')) {
        return 'appimage';
    }
    return null;
}

/**
 * @return array{version:string,kind:'deb'|'rpm'|'appimage'}|null
 */
function rgbj_parse_linux_artifact_name(string $filename): ?array
{
    $kind = rgbj_linux_artifact_kind($filename);
    if ($kind === null) {
        return null;
    }
    if (preg_match('/^RGBJunkie_(.+?)_(?:amd64|x86_64|x64)\.(?:deb|rpm|AppImage)$/i', $filename, $m)) {
        return ['version' => $m[1], 'kind' => $kind];
    }
    if ($kind === 'rpm' && preg_match('/^RGBJunkie-([\d.]+)-\d+\.(?:x86_64|amd64|aarch64)\.rpm$/i', $filename, $m)) {
        return ['version' => $m[1], 'kind' => $kind];
    }
    if (preg_match('/^RGBJunkie[_-](.+?)\.(?:deb|rpm|AppImage)$/i', $filename, $m)) {
        return ['version' => $m[1], 'kind' => $kind];
    }
    if (preg_match('/^rgbjunkie[_-](.+?)_(?:amd64|x86_64)\.(?:deb|rpm)$/i', $filename, $m)) {
        return ['version' => $m[1], 'kind' => $kind];
    }
    return null;
}

/** @return list<array{dir:string,webSubdir:string,kind:?string}> */
function rgbj_linux_scan_locations(string $linuxDir): array
{
    $locations = [
        ['dir' => $linuxDir, 'webSubdir' => RGBJ_LINUX_DIR, 'kind' => null],
    ];
    foreach (['deb', 'rpm', 'appimage'] as $kind) {
        $sub = $linuxDir . DIRECTORY_SEPARATOR . $kind;
        if (is_dir($sub)) {
            $locations[] = [
                'dir' => $sub,
                'webSubdir' => RGBJ_LINUX_DIR . '/' . $kind,
                'kind' => $kind,
            ];
        }
    }
    return $locations;
}

/**
 * @param callable(string):void $ensure
 */
function rgbj_discover_linux_into(string $linuxDir, callable $ensure, array &$byVer): void
{
    foreach (rgbj_linux_scan_locations($linuxDir) as $loc) {
        foreach (glob($loc['dir'] . DIRECTORY_SEPARATOR . '*') ?: [] as $path) {
            if (!is_file($path)) {
                continue;
            }
            $name = basename($path);
            $parsed = rgbj_parse_linux_artifact_name($name);
            if ($parsed === null) {
                continue;
            }
            if ($loc['kind'] !== null && $parsed['kind'] !== $loc['kind']) {
                continue;
            }
            $ensure($parsed['version']);
            $existing = $byVer[$parsed['version']]['linux'][$parsed['kind']] ?? null;
            $meta = rgbj_installer_file_meta($loc['dir'], $loc['webSubdir'], $name);
            if ($meta === null) {
                continue;
            }
            if ($existing === null || $meta['mtime'] >= $existing['mtime']) {
                $byVer[$parsed['version']]['linux'][$parsed['kind']] = $meta;
            }
        }
    }
}

/** @param array{deb:?array,rpm:?array,appimage:?array} $linux */
function rgbj_release_has_linux(array $linux): bool
{
    return $linux['deb'] !== null || $linux['rpm'] !== null || $linux['appimage'] !== null;
}

/** @return array{deb:?array,rpm:?array,appimage:?array} */
function rgbj_empty_linux_bundle(): array
{
    return ['deb' => null, 'rpm' => null, 'appimage' => null];
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
 *   linux:array{deb:?array,rpm:?array,appimage:?array},
 *   setup:array{file:string,webPath:string,size:int,mtime:int}|null,
 *   msi:array{file:string,webPath:string,size:int,mtime:int}|null
 * }>
 */
function rgbj_discover_releases(string $siteRoot): array
{
    $dirs = rgbj_installer_directories($siteRoot);
    $portableDir = $siteRoot . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, RGBJ_PORTABLE_DIR);
    $linuxDir = $siteRoot . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, RGBJ_LINUX_DIR);
    /** @var array<string, array{version:string,sortKey:string,portable:?array,linux:array{deb:?array,rpm:?array,appimage:?array},setup:?array,msi:?array}> $byVer */
    $byVer = [];

    $ensure = static function (string $ver) use (&$byVer): void {
        if (!isset($byVer[$ver])) {
            $byVer[$ver] = [
                'version' => $ver,
                'sortKey' => $ver,
                'portable' => null,
                'linux' => rgbj_empty_linux_bundle(),
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

    if (is_dir($linuxDir)) {
        rgbj_discover_linux_into($linuxDir, $ensure, $byVer);
    }

    $complete = [];
    foreach ($byVer as $row) {
        $hasPortable = $row['portable'] !== null;
        $hasPair = $row['setup'] !== null && $row['msi'] !== null;
        $hasLinux = rgbj_release_has_linux($row['linux']);
        if (!$hasPortable && !$hasPair && !$hasLinux) {
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

/** @return array<string, mixed>|null */
function rgbj_latest_release(string $siteRoot): ?array
{
    $releases = rgbj_discover_releases($siteRoot);
    return $releases[0] ?? null;
}

/**
 * Latest release for the public download page.
 * When the newest build lacks Windows installers, uses the newest version that has them.
 *
 * @return array<string, mixed>|null
 */
function rgbj_latest_release_for_download(string $siteRoot): ?array
{
    $releases = rgbj_discover_releases($siteRoot);
    if ($releases === []) {
        return null;
    }

    $latest = $releases[0];
    if ($latest['setup'] !== null && $latest['msi'] !== null) {
        return $latest;
    }

    foreach ($releases as $row) {
        if ($row['setup'] === null || $row['msi'] === null) {
            continue;
        }
        $latest['setup'] = $row['setup'];
        $latest['msi'] = $row['msi'];
        if ($row['version'] !== $latest['version']) {
            $latest['windowsInstallerVersion'] = $row['version'];
        }
        return $latest;
    }

    return $latest;
}

/** Canonical public site root for absolute URLs in releases/latest.json (in-app update check). */
function rgbj_public_manifest_base_url(): string
{
    return 'https://www.rgbjunkie.com/RGBJunkieApp';
}

function rgbj_version_to_changelog_url(string $version): string
{
    $slug = 'v-' . str_replace('.', '-', trim($version));

    return rgbj_public_manifest_base_url() . '/changelog/#' . $slug;
}

/**
 * @return array<string, string>|null Manifest fields for releases/latest.json, or null when no portable ZIP.
 */
function rgbj_build_latest_version_manifest(string $siteRoot): ?array
{
    $latest = rgbj_latest_release($siteRoot);
    if ($latest === null) {
        return null;
    }
    $portable = $latest['portable'] ?? null;
    if (!is_array($portable)) {
        return null;
    }

    $version = (string) ($latest['version'] ?? '');
    $webPath = ltrim(str_replace('\\', '/', (string) ($portable['webPath'] ?? '')), '/');
    $fileName = (string) ($portable['file'] ?? '');
    if ($version === '' || $webPath === '' || $fileName === '') {
        return null;
    }

    $absZip = $siteRoot . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, $webPath);
    if (!is_readable($absZip)) {
        return null;
    }

    $sha = hash_file('sha256', $absZip);
    if (!is_string($sha) || !preg_match('/^[a-f0-9]{64}$/', $sha)) {
        return null;
    }

    $base = rgbj_public_manifest_base_url();

    return [
        'version' => $version,
        'downloadUrl' => $base . '/' . $webPath,
        'trackedDownloadUrl' => $base . '/download.php?f=' . rawurlencode($webPath) . '&channel=app-update',
        'portableZip' => $fileName,
        'releaseNotes' => rgbj_version_to_changelog_url($version),
        'portableZipSha256' => strtolower($sha),
    ];
}

/**
 * JSON string for releases/latest.json (same shape as emit-latest-version-json.mjs).
 */
function rgbj_latest_version_manifest_json(string $siteRoot): ?string
{
    $manifest = rgbj_build_latest_version_manifest($siteRoot);
    if ($manifest === null) {
        return null;
    }

    return json_encode(
        $manifest,
        JSON_THROW_ON_ERROR | JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES,
    ) . "\n";
}

/** Emit latest.json for HTTP clients (used by releases/latest.php). */
function rgbj_send_latest_version_manifest(string $siteRoot): void
{
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, no-cache, must-revalidate');

    $json = rgbj_latest_version_manifest_json($siteRoot);
    if ($json === null) {
        http_response_code(404);
        echo json_encode(
            ['error' => 'No portable ZIP found under downloads/portable/.'],
            JSON_THROW_ON_ERROR | JSON_UNESCAPED_SLASHES,
        );
        return;
    }

    http_response_code(200);
    echo $json;
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
