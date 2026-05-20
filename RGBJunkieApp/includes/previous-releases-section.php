<?php
/**
 * Accordion of older releases (Windows, portable, Linux).
 * @var list<array<string, mixed>> $rgbj_release_rows Rows from rgbj_discover_releases (excluding latest).
 */
declare(strict_types=1);

require_once __DIR__ . '/download-tracker.php';

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
        <span class="small text-body-secondary d-block mt-1"><?= count($rgbj_release_rows) ?> older build<?= count($rgbj_release_rows) === 1 ? '' : 's' ?> · Windows, portable ZIP, and Linux packages where available. Versions below 1.0 are <strong class="text-body">development</strong> releases.</span>
    </div>
    <div class="card-body p-0">
        <div class="accordion accordion-flush" id="installersArchive">
            <?php foreach ($rgbj_release_rows as $row) :
                $rid = rgbj_rel_id($row['version']);
                $suffix = rgbj_link_suffix($row['version']);
                $hasWindows = $row['setup'] !== null && $row['msi'] !== null;
                $hasPortable = $row['portable'] !== null;
                $hasLinux = rgbj_release_has_linux($row['linux']);
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
                        <?php if ($hasWindows) : ?>
                        <p class="small text-muted mb-2 fw-semibold">Windows</p>
                        <div class="d-grid gap-2 d-sm-flex flex-sm-wrap mb-3">
                            <a<?= rgbj_tracked_download_attrs($row['setup']['webPath'], 'btn btn-outline-secondary flex-sm-fill') ?> href="<?= rgbj_h(rgbj_download_link($row['setup']['webPath'])) ?>" download><i class="bi bi-download me-2"></i>Setup (.exe) <span class="opacity-75">(<?= rgbj_h(rgbj_format_bytes($row['setup']['size'])) ?>)</span></a>
                            <a<?= rgbj_tracked_download_attrs($row['msi']['webPath'], 'btn btn-outline-secondary flex-sm-fill') ?> href="<?= rgbj_h(rgbj_download_link($row['msi']['webPath'])) ?>" download><i class="bi bi-box-seam me-2"></i>MSI <span class="opacity-75">(<?= rgbj_h(rgbj_format_bytes($row['msi']['size'])) ?>)</span></a>
                        </div>
                        <?php endif; ?>
                        <?php if ($hasPortable) : ?>
                        <p class="small text-muted mb-2 fw-semibold">Portable (Windows)</p>
                        <div class="d-grid gap-2 d-sm-flex flex-sm-wrap mb-3">
                            <a<?= rgbj_tracked_download_attrs($row['portable']['webPath'], 'btn btn-outline-secondary flex-sm-fill') ?> href="<?= rgbj_h(rgbj_download_link($row['portable']['webPath'])) ?>" download><i class="bi bi-file-earmark-zip me-2"></i>Portable ZIP <span class="opacity-75">(<?= rgbj_h(rgbj_format_bytes($row['portable']['size'])) ?>)</span></a>
                        </div>
                        <?php endif; ?>
                        <?php if ($hasLinux) : ?>
                        <p class="small text-muted mb-2 fw-semibold">Linux</p>
                        <div class="d-grid gap-2 d-sm-flex flex-sm-wrap mb-3">
                            <?php if ($row['linux']['deb'] !== null) : ?>
                            <a<?= rgbj_tracked_download_attrs($row['linux']['deb']['webPath'], 'btn btn-outline-secondary flex-sm-fill') ?> href="<?= rgbj_h(rgbj_download_link($row['linux']['deb']['webPath'])) ?>" download><i class="bi bi-download me-2"></i>.deb <span class="opacity-75">(<?= rgbj_h(rgbj_format_bytes($row['linux']['deb']['size'])) ?>)</span></a>
                            <?php endif; ?>
                            <?php if ($row['linux']['rpm'] !== null) : ?>
                            <a<?= rgbj_tracked_download_attrs($row['linux']['rpm']['webPath'], 'btn btn-outline-secondary flex-sm-fill') ?> href="<?= rgbj_h(rgbj_download_link($row['linux']['rpm']['webPath'])) ?>" download><i class="bi bi-download me-2"></i>.rpm <span class="opacity-75">(<?= rgbj_h(rgbj_format_bytes($row['linux']['rpm']['size'])) ?>)</span></a>
                            <?php endif; ?>
                            <?php if ($row['linux']['appimage'] !== null) : ?>
                            <a<?= rgbj_tracked_download_attrs($row['linux']['appimage']['webPath'], 'btn btn-outline-secondary flex-sm-fill') ?> href="<?= rgbj_h(rgbj_download_link($row['linux']['appimage']['webPath'])) ?>" download><i class="bi bi-download me-2"></i>AppImage <span class="opacity-75">(<?= rgbj_h(rgbj_format_bytes($row['linux']['appimage']['size'])) ?>)</span></a>
                            <?php endif; ?>
                        </div>
                        <?php endif; ?>
                        <p class="small text-muted mb-2 fw-semibold">Share direct links</p>
                        <?php if ($hasWindows) : ?>
                        <div class="input-group input-group-sm mb-2">
                            <span class="input-group-text bg-dark border-secondary text-secondary">Installer</span>
                            <input type="text" class="form-control font-monospace small bg-body text-body-secondary" readonly value="<?= rgbj_h(rgbj_download_absolute_url($row['setup']['webPath'])) ?>" id="link-setup-<?= rgbj_h($suffix) ?>">
                            <button class="btn btn-outline-secondary" type="button" data-copy-target="link-setup-<?= rgbj_h($suffix) ?>" title="Copy link"><i class="bi bi-clipboard"></i></button>
                        </div>
                        <div class="input-group input-group-sm mb-2">
                            <span class="input-group-text bg-dark border-secondary text-secondary">MSI</span>
                            <input type="text" class="form-control font-monospace small bg-body text-body-secondary" readonly value="<?= rgbj_h(rgbj_download_absolute_url($row['msi']['webPath'])) ?>" id="link-msi-<?= rgbj_h($suffix) ?>">
                            <button class="btn btn-outline-secondary" type="button" data-copy-target="link-msi-<?= rgbj_h($suffix) ?>" title="Copy link"><i class="bi bi-clipboard"></i></button>
                        </div>
                        <?php endif; ?>
                        <?php if ($hasPortable) : ?>
                        <div class="input-group input-group-sm mb-2">
                            <span class="input-group-text bg-dark border-secondary text-secondary">Portable</span>
                            <input type="text" class="form-control font-monospace small bg-body text-body-secondary" readonly value="<?= rgbj_h(rgbj_download_absolute_url($row['portable']['webPath'])) ?>" id="link-portable-<?= rgbj_h($suffix) ?>">
                            <button class="btn btn-outline-secondary" type="button" data-copy-target="link-portable-<?= rgbj_h($suffix) ?>" title="Copy link"><i class="bi bi-clipboard"></i></button>
                        </div>
                        <?php endif; ?>
                        <?php foreach (['deb' => '.deb', 'rpm' => '.rpm', 'appimage' => 'AppImage'] as $key => $label) :
                            if ($row['linux'][$key] === null) {
                                continue;
                            }
                            ?>
                        <div class="input-group input-group-sm mb-2">
                            <span class="input-group-text bg-dark border-secondary text-secondary"><?= rgbj_h($label) ?></span>
                            <input type="text" class="form-control font-monospace small bg-body text-body-secondary" readonly value="<?= rgbj_h(rgbj_download_absolute_url($row['linux'][$key]['webPath'])) ?>" id="link-linux-<?= rgbj_h($key) ?>-<?= rgbj_h($suffix) ?>">
                            <button class="btn btn-outline-secondary" type="button" data-copy-target="link-linux-<?= rgbj_h($key) ?>-<?= rgbj_h($suffix) ?>" title="Copy link"><i class="bi bi-clipboard"></i></button>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>
    </div>
</div>
