<?php
/**
 * Renders the RGBJunkie for Windows changelog synced from docs/CHANGELOG.md.
 */
declare(strict_types=1);

function rgbj_changelog_paths(): array
{
    $includes = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'includes';
    return [
        'html' => $includes . DIRECTORY_SEPARATOR . 'changelog-body.html',
        'md' => $includes . DIRECTORY_SEPARATOR . 'changelog.md',
        'meta' => $includes . DIRECTORY_SEPARATOR . 'changelog-meta.json',
        'versions' => $includes . DIRECTORY_SEPARATOR . 'changelog-versions.json',
    ];
}

/** @param list<string> $versions */
function rgbj_changelog_sort_versions(array $versions): array
{
    $versions = array_values(array_unique(array_filter($versions, static fn (mixed $v): bool => is_string($v) && $v !== '')));
    usort($versions, static fn (string $a, string $b): int => version_compare($b, $a));

    return $versions;
}

/**
 * @return list<array{version: string, html: string, start: int, end: int}>
 */
function rgbj_changelog_extract_versioned_releases(string $html): array
{
    $releases = [];
    $marker = '<article class="rgbj-changelog-release rgbj-changelog-release--versioned"';
    $offset = 0;
    $len = strlen($html);

    while (($start = strpos($html, $marker, $offset)) !== false) {
        if (!preg_match('#data-version="([^"]*)"#', $html, $versionMatch, 0, $start)) {
            $offset = $start + strlen($marker);
            continue;
        }

        $tagEnd = strpos($html, '>', $start);
        if ($tagEnd === false) {
            break;
        }

        $pos = $tagEnd + 1;
        $depth = 1;

        while ($pos < $len && $depth > 0) {
            $openPos = stripos($html, '<article', $pos);
            $closePos = stripos($html, '</article>', $pos);
            if ($closePos === false) {
                break;
            }
            if ($openPos !== false && $openPos < $closePos) {
                $depth++;
                $pos = $openPos + 8;
                continue;
            }
            $depth--;
            $pos = $closePos + 10;
        }

        if ($depth !== 0) {
            break;
        }

        $releases[] = [
            'version' => $versionMatch[1],
            'html' => substr($html, $start, $pos - $start),
            'start' => $start,
            'end' => $pos,
        ];
        $offset = $pos;
    }

    return $releases;
}

/**
 * Reorder versioned release articles newest-first (synced HTML may not match markdown order).
 */
function rgbj_changelog_sort_body_html(string $html): string
{
    $releases = rgbj_changelog_extract_versioned_releases($html);
    if ($releases === []) {
        return $html;
    }

    usort($releases, static fn (array $a, array $b): int => version_compare($b['version'], $a['version']));

    $sortedBlock = implode('', array_column($releases, 'html'));

    $withoutVersioned = $html;
    $byStartDesc = $releases;
    usort($byStartDesc, static fn (array $a, array $b): int => $b['start'] <=> $a['start']);
    foreach ($byStartDesc as $release) {
        $withoutVersioned = substr($withoutVersioned, 0, $release['start'])
            . substr($withoutVersioned, $release['end']);
    }

    $replaced = preg_replace(
        '#(<div class="rgbj-changelog-timeline">)#',
        '$1' . $sortedBlock,
        $withoutVersioned,
        1
    );

    return is_string($replaced) ? $replaced : $html;
}

/** @return array{appVersion: string, versions: list<string>}|null */
function rgbj_changelog_versions_meta(): ?array
{
    $paths = rgbj_changelog_paths();
    if (!is_readable($paths['versions'])) {
        return null;
    }
    $raw = json_decode((string) file_get_contents($paths['versions']), true);
    if (!is_array($raw)) {
        return null;
    }
    $versions = [];
    foreach ($raw['versions'] ?? [] as $v) {
        if (is_string($v) && $v !== '') {
            $versions[] = $v;
        }
    }
    return [
        'appVersion' => is_string($raw['appVersion'] ?? null) ? (string) $raw['appVersion'] : '',
        'versions' => rgbj_changelog_sort_versions($versions),
    ];
}

function rgbj_changelog_version_slug(string $version): string
{
    return 'v-' . str_replace('.', '-', trim($version));
}

function rgbj_render_changelog_versions_nav(): void
{
    $meta = rgbj_changelog_versions_meta();
    if ($meta === null || $meta['versions'] === []) {
        return;
    }
    $current = $meta['appVersion'];
    ?>
    <div class="rgbj-changelog-versions-nav" role="navigation" aria-label="Jump to a version">
        <label class="rgbj-changelog-versions-nav__label" for="rgbj-changelog-version-select">
            <i class="bi bi-tags me-1" aria-hidden="true"></i>By app version
        </label>
        <select id="rgbj-changelog-version-select" class="rgbj-changelog-versions-nav__select form-select form-select-sm" aria-describedby="rgbj-changelog-version-select-hint">
            <?php foreach ($meta['versions'] as $version) :
                $slug = rgbj_changelog_version_slug($version);
                $isCurrent = $version === $current;
                ?>
            <option value="#<?= rgbj_h($slug) ?>"<?= $isCurrent ? ' selected' : '' ?>>v<?= rgbj_h($version) ?><?= $isCurrent ? ' (latest)' : '' ?></option>
            <?php endforeach; ?>
        </select>
        <span id="rgbj-changelog-version-select-hint" class="rgbj-changelog-versions-nav__hint visually-hidden">Jump to release notes for the selected version.</span>
    </div>
    <?php
}

function rgbj_changelog_last_sync_label(): ?string
{
    $paths = rgbj_changelog_paths();
    if (!is_readable($paths['meta'])) {
        return null;
    }
    $raw = json_decode((string) file_get_contents($paths['meta']), true);
    if (!is_array($raw) || empty($raw['syncedAt'])) {
        return null;
    }
    try {
        $dt = new DateTimeImmutable((string) $raw['syncedAt']);
        return $dt->format('F j, Y');
    } catch (Throwable) {
        return null;
    }
}

function rgbj_render_changelog_body(): void
{
    $paths = rgbj_changelog_paths();
    if (is_readable($paths['html'])) {
        echo rgbj_changelog_sort_body_html((string) file_get_contents($paths['html']));
        return;
    }

    if (is_readable($paths['md'])) {
        echo '<p class="text-warning mb-0">Changelog HTML is missing. Run <code>npm run changelog:sync-wamp</code> from the RGBJunkie app repository.</p>';
        return;
    }

    echo '<p class="text-warning mb-0">Changelog not published yet. Run <code>npm run changelog:sync-wamp</code> from the RGBJunkie app repository.</p>';
}
