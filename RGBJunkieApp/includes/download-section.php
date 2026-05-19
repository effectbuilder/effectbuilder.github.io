<?php
/**
 * Latest-release download cards.
 * @var array<string, mixed>|null $rgbj_latest_release Row from rgbj_discover_releases (newest).
 * @var list<array<string, mixed>> $rgbj_older_releases Remaining rows for archive link count.
 */
declare(strict_types=1);

if (empty($rgbj_latest_release)) : ?>
    <div class="alert alert-warning border-warning bg-dark mb-4" role="alert">
        <h3 class="alert-heading h6"><i class="bi bi-exclamation-triangle me-2"></i>Downloads not found yet</h3>
        <p class="small mb-0">Add release files under <code><?= rgbj_h(RGBJ_NSIS_DIR) ?></code> and <code><?= rgbj_h(RGBJ_MSI_DIR) ?></code> (Windows installers), <code><?= rgbj_h(RGBJ_PORTABLE_DIR) ?></code> (portable ZIP), or <code><?= rgbj_h(RGBJ_LINUX_DIR) ?></code> (.deb, .rpm, AppImage). This page lists them automatically.</p>
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
$windowsVersion = $latest['windowsInstallerVersion'] ?? $latest['version'];
$windowsVersionNote = $hasWindows && $windowsVersion !== $latest['version'];
$midDot = '·';

$renderShareLink = static function (string $id, string $label, string $webPath): void {
    ?>
    <div class="input-group input-group-sm mb-2">
        <span class="input-group-text bg-dark border-secondary text-secondary"><?= rgbj_h($label) ?></span>
        <input type="text" class="form-control font-monospace small bg-body text-body-secondary" readonly value="<?= rgbj_h(rgbj_download_absolute_url($webPath)) ?>" id="<?= rgbj_h($id) ?>">
        <button class="btn btn-outline-secondary" type="button" data-copy-target="<?= rgbj_h($id) ?>" title="Copy link"><i class="bi bi-clipboard"></i></button>
    </div>
    <?php
};
?>

<?php if ($hasWindows) : ?>
<div class="card border-secondary shadow-sm mb-4">
    <div class="card-header bg-dark border-secondary d-flex align-items-center justify-content-between flex-wrap gap-2">
        <span class="fw-semibold"><i class="bi bi-windows me-2"></i>RGBJunkie v<?= rgbj_h($windowsVersion) ?> <?= rgbj_h($midDot) ?> Windows 10 or later (64-bit)</span>
        <?= rgbj_version_status_badges_html($windowsVersion, true) ?>
    </div>
    <div class="card-body">
        <?php if ($windowsVersionNote) : ?>
        <p class="small text-body-secondary mb-3">Portable and Linux builds below are v<?= rgbj_h($latest['version']) ?>. These are the latest Windows installer files on this site (v<?= rgbj_h($windowsVersion) ?>).</p>
        <?php endif; ?>
        <div class="d-grid gap-2 d-sm-flex flex-sm-wrap">
            <a class="btn btn-primary btn-lg flex-sm-fill" href="<?= rgbj_h($latest['setup']['webPath']) ?>" download>
                <i class="bi bi-download me-2"></i>Download installer
                <span class="d-block small opacity-75 fw-normal"><?= rgbj_h(rgbj_format_bytes($latest['setup']['size'])) ?></span>
            </a>
            <a class="btn btn-outline-primary flex-sm-fill" href="<?= rgbj_h($latest['msi']['webPath']) ?>" download>
                <i class="bi bi-box-seam me-2"></i>Download MSI (managed PCs)
                <span class="d-block small opacity-75 fw-normal"><?= rgbj_h(rgbj_format_bytes($latest['msi']['size'])) ?></span>
            </a>
        </div>
        <?php if ($latestIsDev) : ?>
        <div class="rounded-3 border border-secondary bg-body-tertiary p-3 small text-body-secondary mt-3 mb-0" role="note">
            <i class="bi bi-code-slash me-1 text-info"></i>This is a <strong class="text-body">development</strong> build (version below 1.0), intended for testing, not a final 1.0 product release.
        </div>
        <?php endif; ?>
        <p class="small text-body-secondary mt-3 mb-0">Quick installer for most gaming rigs, or MSI for school or workplace PCs. By downloading, you agree to the <a href="<?= rgbj_h(rgbj_url('terms/')) ?>">Terms of Service</a>.</p>
        <hr class="border-secondary my-4">
        <p class="small text-muted mb-2 fw-semibold">Share these links</p>
        <?php $renderShareLink('link-setup', 'Installer', $latest['setup']['webPath']); ?>
        <?php $renderShareLink('link-msi', 'MSI', $latest['msi']['webPath']); ?>
    </div>
</div>
<?php endif; ?>

<?php if ($hasPortable) : ?>
<div class="card border-secondary shadow-sm mb-4">
    <div class="card-header bg-dark border-secondary d-flex align-items-center justify-content-between flex-wrap gap-2">
        <span class="fw-semibold"><i class="bi bi-file-earmark-zip me-2"></i>Portable ZIP <?= rgbj_h($midDot) ?> Windows (64-bit)</span>
        <?php if (!$hasWindows) : ?>
        <?= rgbj_version_status_badges_html($latest['version'], true) ?>
        <?php endif; ?>
    </div>
    <div class="card-body">
        <p class="small text-body-secondary mb-3">Unzip and run — no installer. Same v<?= rgbj_h($latest['version']) ?> app; handy for USB sticks or when you cannot run setup.</p>
        <a class="btn btn-outline-info btn-lg" href="<?= rgbj_h($latest['portable']['webPath']) ?>" download>
            <i class="bi bi-download me-2"></i>Download portable ZIP
            <span class="d-block small opacity-75 fw-normal"><?= rgbj_h(rgbj_format_bytes($latest['portable']['size'])) ?></span>
        </a>
        <hr class="border-secondary my-4">
        <p class="small text-muted mb-2 fw-semibold">Share this link</p>
        <?php $renderShareLink('link-portable', 'Portable', $latest['portable']['webPath']); ?>
    </div>
</div>
<?php endif; ?>

<?php if ($hasLinux) : ?>
<div class="card border-secondary shadow-sm mb-4">
    <div class="card-header bg-dark border-secondary d-flex align-items-center justify-content-between flex-wrap gap-2">
        <span class="fw-semibold"><i class="bi bi-ubuntu me-2"></i>Linux <?= rgbj_h($midDot) ?> v<?= rgbj_h($latest['version']) ?></span>
        <?php if (!$hasWindows && !$hasPortable) : ?>
        <?= rgbj_version_status_badges_html($latest['version'], true) ?>
        <?php endif; ?>
    </div>
    <div class="card-body">
        <p class="small text-body-secondary mb-3">Pick the package for your distro, or use the AppImage to run without installing.</p>
        <div class="d-grid gap-2 d-sm-flex flex-sm-wrap">
            <?php if ($latest['linux']['deb'] !== null) : ?>
            <a class="btn btn-outline-info flex-sm-fill" href="<?= rgbj_h($latest['linux']['deb']['webPath']) ?>" download>
                <i class="bi bi-download me-2"></i>.deb (Debian / Ubuntu)
                <span class="d-block small opacity-75 fw-normal"><?= rgbj_h(rgbj_format_bytes($latest['linux']['deb']['size'])) ?></span>
            </a>
            <?php endif; ?>
            <?php if ($latest['linux']['rpm'] !== null) : ?>
            <a class="btn btn-outline-info flex-sm-fill" href="<?= rgbj_h($latest['linux']['rpm']['webPath']) ?>" download>
                <i class="bi bi-download me-2"></i>.rpm (Fedora / RHEL)
                <span class="d-block small opacity-75 fw-normal"><?= rgbj_h(rgbj_format_bytes($latest['linux']['rpm']['size'])) ?></span>
            </a>
            <?php endif; ?>
            <?php if ($latest['linux']['appimage'] !== null) : ?>
            <a class="btn btn-outline-info flex-sm-fill" href="<?= rgbj_h($latest['linux']['appimage']['webPath']) ?>" download>
                <i class="bi bi-download me-2"></i>AppImage
                <span class="d-block small opacity-75 fw-normal"><?= rgbj_h(rgbj_format_bytes($latest['linux']['appimage']['size'])) ?></span>
            </a>
            <?php endif; ?>
        </div>
        <?php
        foreach (['deb' => '.deb', 'rpm' => '.rpm', 'appimage' => 'AppImage'] as $key => $label) {
            if ($latest['linux'][$key] === null) {
                continue;
            }
            $renderShareLink('link-linux-' . $key, $label, $latest['linux'][$key]['webPath']);
        }
        ?>
    </div>
</div>
<?php endif; ?>

<?php if ($older !== []) : ?>
<p class="text-center mb-4">
    <a class="btn btn-outline-secondary" href="<?= rgbj_h(rgbj_url('releases/')) ?>">
        <i class="bi bi-archive me-2"></i>Previous releases
        <span class="badge text-bg-secondary ms-1"><?= count($older) ?></span>
    </a>
</p>
<?php endif; ?>
