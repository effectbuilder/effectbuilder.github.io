<?php declare(strict_types=1);

require_once dirname(__DIR__) . '/includes/installers.php';
require_once dirname(__DIR__) . '/includes/changelog-content.php';

$rgbj_nav_active = 'changelog';
$rgbj_installers = rgbj_discover_installer_pairs(rgbj_app_root());
$rgbj_latest_version = $rgbj_installers[0]['version'] ?? null;
$rgbj_changelog_synced = rgbj_changelog_last_sync_label();

$pageTitle = 'Changelog | RGBJunkie for Windows';
$pageDesc = 'What is new in RGBJunkie for Windows: release notes and user-facing changes by version and date.';

rgbj_page_head(['title' => $pageTitle, 'description' => $pageDesc]);
rgbj_page_analytics();
rgbj_render_page_nav();
rgbj_subpage_open([
    ['label' => 'RGBJunkie for Windows', 'href' => rgbj_url()],
    ['label' => 'Changelog'],
], 'rgbj-changelog-page');
?>

<h1 class="h2 fw-bold text-body-emphasis mb-2"><i class="bi bi-journal-text me-2 text-info"></i>Changelog</h1>
<p class="text-body-secondary mb-4">
    Release notes for the Windows desktop app — what changed, what improved, and what to try after you update.
    <?php if ($rgbj_latest_version !== null) : ?>
    Current download: <a href="<?= rgbj_h(rgbj_url('#download')) ?>">v<?= rgbj_h($rgbj_latest_version) ?></a>.
    <?php endif; ?>
    Older installers remain on the <a href="<?= rgbj_h(rgbj_url('releases/')) ?>">previous releases</a> page.
    <?php if ($rgbj_changelog_synced !== null) : ?>
    <span class="d-block small mt-2 mb-0"><i class="bi bi-arrow-repeat me-1 opacity-75"></i>Notes last synced <?= rgbj_h($rgbj_changelog_synced) ?>.</span>
    <?php endif; ?>
</p>

<?php rgbj_render_changelog_versions_nav(); ?>
<?php rgbj_render_changelog_body(); ?>

<?php
rgbj_subpage_close();
$rgbj_footer_blurb = 'See what changed in each RGBJunkie for Windows release.';
require dirname(__DIR__) . '/includes/page-footer.php';
?>
<script>
    (function () {
        var hash = window.location.hash;
        if (!hash) return;
        var el = document.querySelector(hash);
        if (el) {
            requestAnimationFrame(function () {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
            });
        }
    })();
</script>
<?php rgbj_page_scripts_end(); ?>
