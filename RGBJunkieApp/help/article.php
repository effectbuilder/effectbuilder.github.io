<?php declare(strict_types=1);

require_once dirname(__DIR__) . '/includes/installers.php';
require_once dirname(__DIR__) . '/includes/help-content.php';

$slug = trim((string) ($_GET['slug'] ?? ''));
$includeDrafts = rgbj_help_show_drafts();
$article = rgbj_help_get_article($slug, $includeDrafts);

if ($article === null) {
    http_response_code(404);
    $rgbj_nav_active = 'help';
    $pageTitle = 'Article not found | RGBJunkie Help';
    $pageDesc = 'The requested help article could not be found.';

    rgbj_help_page_head(['title' => $pageTitle, 'description' => $pageDesc]);
    rgbj_page_analytics();
    rgbj_render_page_nav();
    rgbj_subpage_open([
        ['label' => 'RGBJunkie for Windows', 'href' => rgbj_url()],
        ['label' => 'Help Center', 'href' => rgbj_help_index_url()],
        ['label' => 'Not found'],
    ], 'col-12 rgbj-help-page');
    rgbj_render_help_search_bar($includeDrafts);
    ?>
    <h1 class="h2 fw-bold text-body-emphasis mb-3">Article not found</h1>
    <p class="text-body-secondary mb-4">We could not find a help article for <code><?= rgbj_h($slug) ?></code>.</p>
    <a href="<?= rgbj_h(rgbj_help_index_url()) ?>" class="btn btn-primary"><i class="bi bi-arrow-left me-1"></i>Back to Help Center</a>
    <?php
    rgbj_subpage_close();
    $rgbj_footer_blurb = 'Self-help articles for RGBJunkie for Windows and web tools.';
    require dirname(__DIR__) . '/includes/page-footer.php';
    rgbj_help_page_scripts();
    rgbj_page_scripts_end();
    exit;
}

$rgbj_nav_active = 'help';
$pageTitle = $article['title'] . ' | RGBJunkie Help';
$pageDesc = $article['summary'] !== '' ? $article['summary'] : 'Help article for RGBJunkie users.';
$rgbj_help_load_prism = rgbj_help_article_has_highlighted_code($article['html']);

$pageHeadOpts = ['title' => $pageTitle, 'description' => $pageDesc];
if ($rgbj_help_load_prism) {
    $pageHeadOpts['extra_css'] = ['https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css'];
}
rgbj_help_page_head($pageHeadOpts);
rgbj_page_analytics();
rgbj_render_page_nav();
rgbj_subpage_open([
    ['label' => 'RGBJunkie for Windows', 'href' => rgbj_url()],
    ['label' => 'Help Center', 'href' => rgbj_help_index_url()],
    ['label' => $article['title']],
], 'col-12 rgbj-help-page');

rgbj_render_help_search_bar($includeDrafts);
?>

<div class="row g-4 rgbj-help-layout">
    <aside class="col-12 col-xl-2 order-1">
        <?php rgbj_render_help_doc_map($article['slug'], $includeDrafts); ?>
    </aside>

    <div class="col-12 col-xl-8 order-3 order-xl-2">
        <?php rgbj_render_help_article($article); ?>
    </div>

    <aside class="col-12 col-xl-2 order-2 order-xl-3">
        <?php rgbj_render_help_toc($article['headings'] ?? []); ?>
    </aside>
</div>

<?php
rgbj_subpage_close();
$rgbj_footer_blurb = 'Self-help articles for RGBJunkie for Windows and web tools.';
require dirname(__DIR__) . '/includes/page-footer.php';
if ($rgbj_help_load_prism) {
    rgbj_help_prism_scripts();
}
rgbj_help_page_scripts();
rgbj_page_scripts_end();
