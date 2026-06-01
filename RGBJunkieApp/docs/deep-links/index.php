<?php declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/includes/installers.php';
require_once dirname(__DIR__, 2) . '/includes/app-deep-links.php';

$rgbj_nav_active = 'docs';

$pageTitle = 'App deep links | RGBJunkie for Windows';
$pageDesc = 'rgbjunkie:// links and website handoff URLs for Stream Deck, batch files, and automation.';

rgbj_page_head(['title' => $pageTitle, 'description' => $pageDesc]);
rgbj_page_analytics();
rgbj_render_page_nav();
rgbj_subpage_open([
    ['label' => 'RGBJunkie for Windows', 'href' => rgbj_url()],
    ['label' => 'Documentation', 'href' => rgbj_url('docs/')],
    ['label' => 'App deep links'],
]);
?>

<h1 class="h2 fw-bold text-body-emphasis mb-2"><i class="bi bi-link-45deg me-2 text-info"></i>App deep links</h1>

<?php rgbj_render_app_deep_links_page_content(); ?>

<?php
rgbj_subpage_close();
$rgbj_footer_blurb = 'rgbjunkie:// and website handoff links for RGBJunkie for Windows.';
require dirname(__DIR__, 2) . '/includes/page-footer.php';
rgbj_page_scripts_end();
