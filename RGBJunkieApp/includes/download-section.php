<?php
/**
 * Latest-release download card; expects $rgbj_installers (list from rgbj_discover_installer_pairs).
 * @var list<array> $rgbj_installers
 */
declare(strict_types=1);

if (empty($rgbj_installers)) : ?>
    <div class="alert alert-warning border-warning bg-dark mb-4" role="alert">
        <h3 class="alert-heading h6"><i class="bi bi-exclamation-triangle me-2"></i>Installers not found yet</h3>
        <p class="small mb-0">Place matching pairs in <code><?= rgbj_h(RGBJ_NSIS_DIR) ?></code> (setup .exe) and <code><?= rgbj_h(RGBJ_MSI_DIR) ?></code> (MSI). This page will list them automatically; no manual HTML edits needed.</p>
    </div>
<?php
    return;
endif;

$latest = $rgbj_installers[0];
$older = array_slice($rgbj_installers, 1);
$latestIsDev = rgbj_is_development_version($latest['version']);
$midDot = '·';
?>
<div class="card border-secondary shadow-sm mb-4">
    <div class="card-header bg-dark border-secondary d-flex align-items-center justify-content-between flex-wrap gap-2">
        <span class="fw-semibold"><i class="bi bi-windows me-2"></i>RGBJunkie v<?= rgbj_h($latest['version']) ?> <?= rgbj_h($midDot) ?> Windows 10 or later (64-bit)</span>
        <?= rgbj_version_status_badges_html($latest['version'], true) ?>
    </div>
    <div class="card-body">
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
        <p class="small text-body-secondary mt-3 mb-0">Same full app either way: the quick installer for most gaming rigs, or the MSI if your school or workplace prefers it. By downloading, you agree to the <a href="<?= rgbj_h(rgbj_url('terms/')) ?>">Terms of Service</a>.</p>
        <hr class="border-secondary my-4">
        <p class="small text-muted mb-2 fw-semibold">Share these links</p>
        <div class="input-group input-group-sm mb-2">
            <span class="input-group-text bg-dark border-secondary text-secondary">Installer</span>
            <input type="text" class="form-control font-monospace small bg-body text-body-secondary" readonly value="" id="link-setup" data-base-path="<?= rgbj_h($latest['setup']['webPath']) ?>">
            <button class="btn btn-outline-secondary" type="button" data-copy-target="link-setup" title="Copy link"><i class="bi bi-clipboard"></i></button>
        </div>
        <div class="input-group input-group-sm">
            <span class="input-group-text bg-dark border-secondary text-secondary">MSI</span>
            <input type="text" class="form-control font-monospace small bg-body text-body-secondary" readonly value="" id="link-msi" data-base-path="<?= rgbj_h($latest['msi']['webPath']) ?>">
            <button class="btn btn-outline-secondary" type="button" data-copy-target="link-msi" title="Copy link"><i class="bi bi-clipboard"></i></button>
        </div>
    </div>
</div>

<?php if ($older !== []) : ?>
<p class="text-center mb-4">
    <a class="btn btn-outline-secondary" href="<?= rgbj_h(rgbj_url('releases/')) ?>">
        <i class="bi bi-archive me-2"></i>Previous releases
        <span class="badge text-bg-secondary ms-1"><?= count($older) ?></span>
    </a>
</p>
<?php endif; ?>
