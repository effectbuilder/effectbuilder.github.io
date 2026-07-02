<?php declare(strict_types=1);

require_once dirname(__DIR__) . '/includes/installers.php';
require_once dirname(__DIR__) . '/includes/help-content.php';

$rgbj_nav_active = 'help';
$includeDrafts = rgbj_help_show_drafts();

if (rgbj_help_active_tag_from_request() !== null) {
    header('Location: ' . rgbj_help_index_url(), true, 302);
    exit;
}

$pageTitle = 'Help Center | RGBJunkie for Windows';
$pageDesc = 'Self-help guides, tips, and troubleshooting for RGBJunkie for Windows and rgbjunkie.com web tools.';

rgbj_help_page_head(['title' => $pageTitle, 'description' => $pageDesc]);
rgbj_help_shell_open();
if (!rgbj_help_embed_mode()) {
    rgbj_subpage_open([
        ['label' => 'RGBJunkie for Windows', 'href' => rgbj_url()],
        ['label' => 'Help Center'],
    ], 'col-12 rgbj-help-page');
}
?>

<div class="rgbj-help-index-shell">
    <?php rgbj_render_help_search_bar($includeDrafts, true); ?>

    <div class="rgbj-help-index">
        <header class="rgbj-help-index-header mb-4">
            <h1 class="h2 fw-bold text-body-emphasis mb-2">Help Center</h1>
            <p class="text-body-secondary mb-0 rgbj-help-index-lead">
                Guides and troubleshooting for RGBJunkie for Windows and rgbjunkie.com tools.
                <?php if (!rgbj_help_embed_mode()) : ?>
                Plugin and effect authors can also browse the <a href="<?= rgbj_h(rgbj_url('docs/')) ?>">Documentation</a> hub.
                <?php endif; ?>
                <span class="rgbj-help-intro-app-hint">In the desktop app, open <strong>Settings → Help</strong> for the same articles.</span>
            </p>
        </header>

        <div class="alert alert-secondary border-secondary d-none mb-4" data-rgbj-help-index-empty role="status">
            No articles match your search. Try different keywords.
        </div>

        <?php rgbj_render_help_index(); ?>
        <?php rgbj_help_editor_nav_link_standalone(); ?>
    </div>
</div>

<?php
if (rgbj_help_embed_mode()) {
    rgbj_help_shell_close();
    exit;
}

rgbj_subpage_close();
$rgbj_footer_blurb = 'Self-help articles for RGBJunkie for Windows and web tools.';
require dirname(__DIR__) . '/includes/page-footer.php';
rgbj_help_page_scripts();
rgbj_page_scripts_end();
