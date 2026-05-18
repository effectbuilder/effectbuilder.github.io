<?php declare(strict_types=1);

require_once dirname(__DIR__) . '/includes/installers.php';

$rgbj_installers = rgbj_discover_installer_pairs(rgbj_app_root());
$rgbj_nav_active = 'releases';
$rgbj_latest_version = $rgbj_installers[0]['version'] ?? null;
$rgbj_release_rows = array_slice($rgbj_installers, 1);

$pageTitle = 'Previous releases | RGBJunkie for Windows';
$pageDesc = 'Download older RGBJunkie for Windows builds: setup and MSI pairs for 64-bit Windows 10 or later.';

rgbj_page_head(['title' => $pageTitle, 'description' => $pageDesc]);
rgbj_page_analytics();
rgbj_render_page_nav();
rgbj_subpage_open([
    ['label' => 'RGBJunkie for Windows', 'href' => rgbj_url()],
    ['label' => 'Previous releases'],
]);
?>

<h1 class="h2 fw-bold text-body-emphasis mb-2"><i class="bi bi-archive me-2 text-info"></i>Previous releases</h1>
<p class="text-body-secondary mb-4">
    Older installers stay available if you need to match a prior version on your PC.
    <?php if ($rgbj_latest_version !== null) : ?>
    For the newest experience, use <a href="<?= rgbj_h(rgbj_url('#download')) ?>">v<?= rgbj_h($rgbj_latest_version) ?></a> on the main download page.
    <?php endif; ?>
    See the <a href="<?= rgbj_h(rgbj_url('changelog/')) ?>">changelog</a> for what changed in recent builds.
</p>

<?php require dirname(__DIR__) . '/includes/previous-releases-section.php'; ?>

<?php
rgbj_subpage_close();
$rgbj_footer_blurb = 'Download current or older RGBJunkie for Windows installers.';
require dirname(__DIR__) . '/includes/page-footer.php';
rgbj_page_scripts_end();
