<?php
/**
 * Device validation registry for the supported gear page.
 *
 * Validated and experimental devices are stored separately from the auto-generated device catalog
 * (`/api/docs/supported-devices-data.json`) so harvest/sync never overwrites admin work.
 */
declare(strict_types=1);

require_once __DIR__ . '/site.php';

function rgbj_device_validations_file(): string
{
    return rgbj_app_root() . '/supported/data/device-validations.json';
}

function rgbj_device_validations_api_url(): string
{
    return rgbj_url('supported/api/validations.php');
}

/** @return array{meta: array<string, mixed>, entries: array<string, array<string, mixed>>} */
function rgbj_device_validations_default(): array
{
    return [
        'meta' => [
            'purpose' => 'RGBJunkie supported-device validation registry (admin-maintained)',
            'updatedAt' => null,
            'updatedBy' => null,
            'entryCount' => 0,
        ],
        'entries' => [],
    ];
}

/** @return array{meta: array<string, mixed>, entries: array<string, array<string, mixed>>} */
function rgbj_read_device_validations(): array
{
    $path = rgbj_device_validations_file();
    if (!is_readable($path)) {
        return rgbj_device_validations_default();
    }

    $raw = file_get_contents($path);
    if ($raw === false || trim($raw) === '') {
        return rgbj_device_validations_default();
    }

    $data = json_decode($raw, true);
    if (!is_array($data)) {
        return rgbj_device_validations_default();
    }

    if (!isset($data['entries']) || !is_array($data['entries'])) {
        $data['entries'] = [];
    }
    if (!isset($data['meta']) || !is_array($data['meta'])) {
        $data['meta'] = rgbj_device_validations_default()['meta'];
    }

    $data['entries'] = rgbj_normalize_validation_entries($data['entries']);
    $data['meta']['entryCount'] = count($data['entries']);

    return $data;
}

/** @param array{meta: array<string, mixed>, entries: array<string, array<string, mixed>>} $data */
function rgbj_write_device_validations(array $data, string $updatedByEmail): bool
{
    $path = rgbj_device_validations_file();
    $dir = dirname($path);
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        return false;
    }

    if (!isset($data['entries']) || !is_array($data['entries'])) {
        $data['entries'] = [];
    }

    $data['entries'] = rgbj_normalize_validation_entries($data['entries']);

    $data['meta'] = array_merge(rgbj_device_validations_default()['meta'], $data['meta'] ?? []);
    $data['meta']['updatedAt'] = gmdate('c');
    $data['meta']['updatedBy'] = $updatedByEmail;
    $data['meta']['entryCount'] = count($data['entries']);

    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    if ($json === false) {
        return false;
    }

    $json .= "\n";
    $tmp = $path . '.tmp.' . bin2hex(random_bytes(4));
    if (file_put_contents($tmp, $json, LOCK_EX) === false) {
        @unlink($tmp);

        return false;
    }

    if (!rename($tmp, $path)) {
        @unlink($tmp);

        return false;
    }

    return true;
}

function rgbj_normalize_device_relative_path(string $relativePath): ?string
{
    $path = str_replace('\\', '/', trim($relativePath));
    if ($path === '' || str_contains($path, '..') || str_starts_with($path, '/')) {
        return null;
    }

    return $path;
}

/** @return 'validated'|'experimental' */
function rgbj_validation_status_from_entry(array $entry): string
{
    $status = strtolower(trim((string) ($entry['status'] ?? 'validated')));

    return $status === 'experimental' ? 'experimental' : 'validated';
}

/** @param array<string, array<string, mixed>> $entries */
function rgbj_normalize_validation_entries(array $entries): array
{
    $out = [];
    foreach ($entries as $path => $entry) {
        if (!is_string($path) || !is_array($entry)) {
            continue;
        }
        $normalizedPath = rgbj_normalize_device_relative_path($path);
        if ($normalizedPath === null) {
            continue;
        }
        $out[$normalizedPath] = [
            'status' => rgbj_validation_status_from_entry($entry),
            'validatedAt' => isset($entry['validatedAt']) ? (string) $entry['validatedAt'] : gmdate('c'),
            'notes' => trim((string) ($entry['notes'] ?? '')),
        ];
    }

    return $out;
}

/** @return 'validated'|'experimental'|null */
function rgbj_parse_validation_status_from_request(array $data): ?string
{
    if (array_key_exists('status', $data)) {
        $raw = strtolower(trim((string) $data['status']));
        if ($raw === '' || $raw === 'none' || $raw === 'clear') {
            return null;
        }
        if ($raw === 'experimental') {
            return 'experimental';
        }
        if ($raw === 'validated') {
            return 'validated';
        }

        return null;
    }

    if (!array_key_exists('validated', $data)) {
        return null;
    }

    $validated = filter_var($data['validated'], FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
    if ($validated === null) {
        return null;
    }

    return $validated ? 'validated' : null;
}

function rgbj_device_validations_json_response(array $payload, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    exit;
}
