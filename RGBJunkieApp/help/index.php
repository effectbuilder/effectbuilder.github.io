<?php declare(strict_types=1);

require_once dirname(__DIR__) . '/includes/installers.php';
require_once dirname(__DIR__) . '/includes/help-content.php';

$rgbj_nav_active = 'help';
$includeDrafts = rgbj_help_show_drafts();
$rgbj_help_active_tag = rgbj_help_resolve_active_tag(rgbj_help_active_tag_from_request(), $includeDrafts);

$pageTitle = 'Help Center | RGBJunkie for Windows';
$pageDesc = 'Self-help guides, tips, and troubleshooting for RGBJunkie for Windows and rgbjunkie.com web tools.';

rgbj_help_page_head(['title' => $pageTitle, 'description' => $pageDesc]);
rgbj_page_analytics();
rgbj_render_page_nav();
rgbj_subpage_open([
    ['label' => 'RGBJunkie for Windows', 'href' => rgbj_url()],
    ['label' => 'Help Center'],
], 'col-12 rgbj-help-page');

rgbj_render_help_search_bar($includeDrafts);
?>

<div class="row g-4 rgbj-help-layout">
    <aside class="col-12 col-xl-2">
        <?php rgbj_render_help_doc_map(null, $includeDrafts); ?>
    </aside>

    <div class="col-12 col-xl-10">
        <h1 class="h2 fw-bold text-body-emphasis mb-2"><i class="bi bi-life-preserver me-2 text-info"></i>Help Center</h1>
        <p class="text-body-secondary mb-4">
            Step-by-step guides and troubleshooting for the Windows app and rgbjunkie.com tools.
            For developer documentation (plugins, effects, APIs), see the <a href="<?= rgbj_h(rgbj_url('docs/')) ?>">Documentation</a> page.
            Inside the desktop app, open <strong>Settings → Help</strong> for the full in-app guide in your language.
        </p>

        <div class="alert alert-secondary border-secondary d-none mb-4" data-rgbj-help-index-empty role="status">
            No articles match your search. Try different keywords or browse the map on the left.
        </div>

        <div class="alert alert-info border-info mb-4 rgbj-help-tag-filter-banner<?= $rgbj_help_active_tag ? '' : ' d-none' ?>" data-rgbj-help-tag-filter role="status">
            <span>Showing articles tagged <strong data-rgbj-help-tag-filter-label><?= rgbj_h($rgbj_help_active_tag ?? '') ?></strong>.</span>
            <a href="<?= rgbj_h(rgbj_help_index_url()) ?>" class="btn btn-sm btn-outline-secondary ms-auto">Clear tag</a>
        </div>

        <?php rgbj_render_help_index(); ?>
    </div>
</div>

<?php
rgbj_subpage_close();
$rgbj_footer_blurb = 'Self-help articles for RGBJunkie for Windows and web tools.';
require dirname(__DIR__) . '/includes/page-footer.php';
rgbj_help_page_scripts();
rgbj_page_scripts_end();
