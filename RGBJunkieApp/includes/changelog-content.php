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
        'versions' => $versions,
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
    <nav class="rgbj-changelog-versions-nav" aria-label="Jump to a version">
        <p class="rgbj-changelog-versions-nav__label"><i class="bi bi-tags me-1" aria-hidden="true"></i>By app version</p>
        <?php foreach ($meta['versions'] as $version) :
            $slug = rgbj_changelog_version_slug($version);
            $isCurrent = $version === $current;
            ?>
        <a href="#<?= rgbj_h($slug) ?>"<?= $isCurrent ? ' class="rgbj-changelog-versions-nav__current"' : '' ?> title="Release notes for v<?= rgbj_h($version) ?>">v<?= rgbj_h($version) ?></a>
        <?php endforeach; ?>
    </nav>
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
        echo file_get_contents($paths['html']);
        return;
    }

    if (is_readable($paths['md'])) {
        echo '<p class="text-warning mb-0">Changelog HTML is missing. Run <code>npm run changelog:sync-wamp</code> from the RGBJunkie app repository.</p>';
        return;
    }

    echo '<p class="text-warning mb-0">Changelog not published yet. Run <code>npm run changelog:sync-wamp</code> from the RGBJunkie app repository.</p>';
}
