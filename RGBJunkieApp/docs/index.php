<?php declare(strict_types=1);

require_once dirname(__DIR__) . '/includes/installers.php';
require_once dirname(__DIR__) . '/includes/developer-docs.php';
require_once dirname(__DIR__) . '/includes/user-app-guide.php';
require_once dirname(__DIR__) . '/includes/app-deep-links.php';

$rgbj_nav_active = 'docs';

$pageTitle = 'Documentation | RGBJunkie for Windows';
$pageDesc = 'Developer guides for RGBJunkie plugins, effects, and APIs, plus links to browser creative tools.';

rgbj_page_head(['title' => $pageTitle, 'description' => $pageDesc]);
rgbj_page_analytics();
rgbj_render_page_nav();
rgbj_subpage_open([
    ['label' => 'RGBJunkie for Windows', 'href' => rgbj_url()],
    ['label' => 'Documentation'],
]);
?>

<h1 class="h2 fw-bold text-body-emphasis mb-2"><i class="bi bi-journal-code me-2 text-info"></i>Documentation</h1>
<p class="text-body-secondary mb-4">
    Extend RGBJunkie with custom plugins and effects, or use the free browser tools to prototype before you install the Windows app.
    End-user guides and troubleshooting live in the <a href="<?= rgbj_h(rgbj_url('help/')) ?>">Help Center</a>; hardware lists are on the <a href="<?= rgbj_h(rgbj_url('supported/')) ?>">supported gear</a> page. The API reference below is aimed at authors.
</p>

<?php rgbj_render_user_app_guide(); ?>

<?php rgbj_render_app_deep_links_doc_card(); ?>

<?php rgbj_render_developer_doc_sections(); ?>

<?php
rgbj_subpage_close();
$rgbj_footer_blurb = 'Guides for plugin authors, effect builders, and anyone extending RGBJunkie for Windows.';
require dirname(__DIR__) . '/includes/page-footer.php';
rgbj_page_scripts_end();
