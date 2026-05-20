<?php
/**
 * Latest-release download block (simplified).
 * @var array<string, mixed>|null $rgbj_latest_release
 * @var list<array<string, mixed>> $rgbj_older_releases
 */
declare(strict_types=1);

require_once __DIR__ . '/download-tracker.php';

if (empty($rgbj_latest_release)) : ?>
    <div class="alert alert-warning border-warning bg-dark mb-0" role="alert">
        <p class="small mb-0">Downloads are not available yet. Check back soon.</p>
    </div>
<?php
    return;
endif;

$latest = $rgbj_latest_release;
$older = $rgbj_older_releases ?? [];
$latestIsDev = rgbj_is_development_version($latest['version']);
$hasWindows = $latest['setup'] !== null && $latest['msi'] !== null;
$hasPortable = $latest['portable'] !== null;
$hasLinux = rgbj_release_has_linux($latest['linux']);
$hasWindowsDownloads = $hasWindows || $hasPortable;
$windowsVersion = $latest['windowsInstallerVersion'] ?? $latest['version'];
$windowsVersionNote = $hasWindows && $windowsVersion !== $latest['version'];

$windowsPrimary = $hasWindows ? $latest['setup'] : ($hasPortable ? $latest['portable'] : null);
$windowsPrimaryLabel = $hasWindows ? 'Download for Windows' : 'Download portable ZIP';
?>

<div
    id="rgbj-download-root"
    class="card border-secondary shadow-sm mb-0"
    data-has-windows="<?= $hasWindowsDownloads ? '1' : '0' ?>"
    data-has-linux="<?= $hasLinux ? '1' : '0' ?>"
    data-rgbj-cooldown="<?= (int) rgbj_download_stats_config()['count_cooldown_seconds'] ?>"
>
    <div class="card-body text-center px-4 py-4 py-lg-5">
        <p class="text-info small fw-semibold text-uppercase tracking-wide mb-2">Latest release</p>
        <p class="h4 fw-bold text-body-emphasis mb-2">v<?= rgbj_h($latest['version']) ?></p>
        <div class="d-flex flex-wrap justify-content-center gap-1"><?= rgbj_version_status_badges_html($latest['version'], true) ?></div>

        <?php if ($latestIsDev) : ?>
        <p class="small text-body-secondary mt-3 mb-0">Development build — for testing before 1.0.</p>
        <?php endif; ?>

        <div id="rgbj-download-panels" class="mt-4">
            <?php if ($hasWindowsDownloads && $windowsPrimary !== null) : ?>
            <section class="rgbj-download-panel mb-4" data-rgbj-platform="windows">
                <a<?= rgbj_tracked_download_attrs($windowsPrimary['webPath'], 'btn btn-primary btn-lg px-4') ?> href="<?= rgbj_h(rgbj_download_link($windowsPrimary['webPath'])) ?>" download>
                    <i class="bi bi-download me-2"></i><?= rgbj_h($windowsPrimaryLabel) ?>
                </a>
                <p class="small text-body-secondary mt-2 mb-0">
                    <?= $hasWindows ? 'Windows 10 or later, 64-bit' : 'Portable ZIP, 64-bit' ?>
                    · <?= rgbj_h(rgbj_format_bytes($windowsPrimary['size'])) ?>
                </p>
                <?php if ($windowsVersionNote) : ?>
                <p class="small text-body-secondary mt-2 mb-0 rgbj-download-version-note">Installer v<?= rgbj_h($windowsVersion) ?> · portable/Linux v<?= rgbj_h($latest['version']) ?>.</p>
                <?php endif; ?>
                <?php if ($hasWindows && ($hasPortable || $latest['msi'] !== null)) : ?>
                <p class="small text-body-secondary mt-2 mb-0 rgbj-download-alt-links">
                    <?php if ($hasWindows && $latest['msi'] !== null) : ?>
                    <a<?= rgbj_tracked_download_attrs($latest['msi']['webPath']) ?> href="<?= rgbj_h(rgbj_download_link($latest['msi']['webPath'])) ?>" download>MSI</a>
                    <?php endif; ?>
                    <?php if ($hasWindows && $hasPortable) : ?>
                    <?php if ($latest['msi'] !== null) : ?><span class="text-muted mx-1">·</span><?php endif; ?>
                    <a<?= rgbj_tracked_download_attrs($latest['portable']['webPath']) ?> href="<?= rgbj_h(rgbj_download_link($latest['portable']['webPath'])) ?>" download>Portable ZIP</a>
                    <?php endif; ?>
                </p>
                <?php endif; ?>
            </section>
            <?php endif; ?>

            <?php if ($hasLinux) : ?>
            <section class="rgbj-download-panel mb-0" data-rgbj-platform="linux">
                <?php
                $linuxPrimary = $latest['linux']['deb'] ?? $latest['linux']['appimage'] ?? $latest['linux']['rpm'] ?? null;
                $linuxPrimaryKey = $latest['linux']['deb'] !== null ? 'deb' : ($latest['linux']['appimage'] !== null ? 'appimage' : 'rpm');
                $linuxPrimaryLabels = ['deb' => 'Download for Linux (.deb)', 'rpm' => 'Download for Linux (.rpm)', 'appimage' => 'Download for Linux (AppImage)'];
                ?>
                <?php if ($linuxPrimary !== null) : ?>
                <a<?= rgbj_tracked_download_attrs($linuxPrimary['webPath'], 'btn btn-primary btn-lg px-4') ?> href="<?= rgbj_h(rgbj_download_link($linuxPrimary['webPath'])) ?>" download>
                    <i class="bi bi-download me-2"></i><?= rgbj_h($linuxPrimaryLabels[$linuxPrimaryKey]) ?>
                </a>
                <p class="small text-body-secondary mt-2 mb-0">64-bit Linux · <?= rgbj_h(rgbj_format_bytes($linuxPrimary['size'])) ?></p>
                <?php endif; ?>
                <?php
                $linuxAlts = [];
                if ($latest['linux']['rpm'] !== null && $linuxPrimaryKey !== 'rpm') {
                    $linuxAlts[] = '<a' . rgbj_tracked_download_attrs($latest['linux']['rpm']['webPath']) . ' href="' . rgbj_h(rgbj_download_link($latest['linux']['rpm']['webPath'])) . '" download>.rpm</a>';
                }
                if ($latest['linux']['appimage'] !== null && $linuxPrimaryKey !== 'appimage') {
                    $linuxAlts[] = '<a' . rgbj_tracked_download_attrs($latest['linux']['appimage']['webPath']) . ' href="' . rgbj_h(rgbj_download_link($latest['linux']['appimage']['webPath'])) . '" download>AppImage</a>';
                }
                if ($latest['linux']['deb'] !== null && $linuxPrimaryKey !== 'deb') {
                    $linuxAlts[] = '<a' . rgbj_tracked_download_attrs($latest['linux']['deb']['webPath']) . ' href="' . rgbj_h(rgbj_download_link($latest['linux']['deb']['webPath'])) . '" download>.deb</a>';
                }
                ?>
                <?php if ($linuxAlts !== []) : ?>
                <p class="small text-body-secondary mt-2 mb-0 rgbj-download-alt-links"><?= implode('<span class="text-muted mx-1">·</span>', $linuxAlts) ?></p>
                <?php endif; ?>
            </section>
            <?php endif; ?>
        </div>

        <?php if ($hasWindowsDownloads && $hasLinux) : ?>
        <p class="small mb-0 mt-3">
            <button type="button" class="btn btn-link btn-sm text-body-secondary p-0 rgbj-download-other-toggle d-none" id="rgbj-download-other-toggle" aria-expanded="false"></button>
        </p>
        <?php endif; ?>

        <p class="small text-body-secondary mt-4 mb-0">
            By downloading, you agree to the <a href="<?= rgbj_h(rgbj_url('terms/')) ?>">Terms of Service</a>.
            <?php if ($older !== []) : ?>
            <span class="text-muted mx-1">·</span><a href="<?= rgbj_h(rgbj_url('releases/')) ?>">Older versions</a>
            <?php endif; ?>
        </p>
    </div>
</div>
