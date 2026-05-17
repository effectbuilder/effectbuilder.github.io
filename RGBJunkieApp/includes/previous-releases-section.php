<?php
/**
 * Accordion of older installer pairs.
 * @var list<array> $rgbj_release_rows Rows from rgbj_discover_installer_pairs (excluding latest).
 */
declare(strict_types=1);

if (empty($rgbj_release_rows)) : ?>
    <div class="alert alert-secondary border-secondary bg-dark mb-0" role="status">
        <p class="small mb-0">No older builds are hosted right now. <a href="<?= rgbj_h(rgbj_url('#download')) ?>">Download the current release</a>.</p>
    </div>
<?php
    return;
endif;
?>
<div class="card border-secondary shadow-sm mb-0">
    <div class="card-header bg-dark border-secondary">
        <span class="fw-semibold"><i class="bi bi-archive me-2"></i>All previous releases</span>
        <span class="small text-body-secondary d-block mt-1"><?= count($rgbj_release_rows) ?> older build<?= count($rgbj_release_rows) === 1 ? '' : 's' ?> · Windows 10 or later (64-bit). Versions below 1.0 are <strong class="text-body">development</strong> releases.</span>
    </div>
    <div class="card-body p-0">
        <div class="accordion accordion-flush" id="installersArchive">
            <?php foreach ($rgbj_release_rows as $row) :
                $rid = rgbj_rel_id($row['version']);
                $lid = 'link-setup-' . rgbj_link_suffix($row['version']);
                $mid = 'link-msi-' . rgbj_link_suffix($row['version']);
                ?>
            <div class="accordion-item bg-body-tertiary border-secondary">
                <h3 class="accordion-header">
                    <button class="accordion-button collapsed bg-body-tertiary text-body d-flex align-items-center justify-content-between gap-2" type="button" data-bs-toggle="collapse" data-bs-target="#<?= rgbj_h($rid) ?>" aria-expanded="false" aria-controls="<?= rgbj_h($rid) ?>">
                        <span>v<?= rgbj_h($row['version']) ?></span>
                        <?= rgbj_version_status_badges_html($row['version'], false) ?>
                    </button>
                </h3>
                <div id="<?= rgbj_h($rid) ?>" class="accordion-collapse collapse" data-bs-parent="#installersArchive">
                    <div class="accordion-body border-top border-secondary">
                        <div class="d-grid gap-2 d-sm-flex flex-sm-wrap mb-3">
                            <a class="btn btn-outline-secondary flex-sm-fill" href="<?= rgbj_h($row['setup']['webPath']) ?>" download><i class="bi bi-download me-2"></i>Setup (.exe) <span class="opacity-75">(<?= rgbj_h(rgbj_format_bytes($row['setup']['size'])) ?>)</span></a>
                            <a class="btn btn-outline-secondary flex-sm-fill" href="<?= rgbj_h($row['msi']['webPath']) ?>" download><i class="bi bi-box-seam me-2"></i>MSI <span class="opacity-75">(<?= rgbj_h(rgbj_format_bytes($row['msi']['size'])) ?>)</span></a>
                        </div>
                        <p class="small text-muted mb-2 fw-semibold">Share direct links</p>
                        <div class="input-group input-group-sm mb-2">
                            <span class="input-group-text bg-dark border-secondary text-secondary">Installer</span>
                            <input type="text" class="form-control font-monospace small bg-body text-body-secondary" readonly value="" id="<?= rgbj_h($lid) ?>" data-base-path="<?= rgbj_h($row['setup']['webPath']) ?>">
                            <button class="btn btn-outline-secondary" type="button" data-copy-target="<?= rgbj_h($lid) ?>" title="Copy link"><i class="bi bi-clipboard"></i></button>
                        </div>
                        <div class="input-group input-group-sm">
                            <span class="input-group-text bg-dark border-secondary text-secondary">MSI</span>
                            <input type="text" class="form-control font-monospace small bg-body text-body-secondary" readonly value="" id="<?= rgbj_h($mid) ?>" data-base-path="<?= rgbj_h($row['msi']['webPath']) ?>">
                            <button class="btn btn-outline-secondary" type="button" data-copy-target="<?= rgbj_h($mid) ?>" title="Copy link"><i class="bi bi-clipboard"></i></button>
                        </div>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</div>
