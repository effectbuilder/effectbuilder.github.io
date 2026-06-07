<?php declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/includes/installers.php';
require_once dirname(__DIR__, 2) . '/includes/help-content.php';
require_once dirname(__DIR__, 2) . '/includes/help-editor-auth.php';
require_once dirname(__DIR__, 2) . '/includes/help-gemini.php';

$rgbj_nav_active = 'help';
$pageTitle = 'Help article editor | RGBJunkie';
$pageDesc = 'Edit Help Center articles with a visual editor.';
$rgbj_editor_articles = rgbj_help_list_article_meta(true);

rgbj_page_head([
    'title' => $pageTitle,
    'description' => $pageDesc,
    'extra_css' => [
        'https://uicdn.toast.com/editor/latest/toastui-editor.min.css',
        'https://uicdn.toast.com/editor/latest/theme/toastui-editor-dark.min.css',
        'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css',
        'https://uicdn.toast.com/editor-plugin-code-syntax-highlight/latest/toastui-editor-plugin-code-syntax-highlight.min.css',
        rgbj_url('assets/help-article-content.css?v=' . (string) @filemtime(dirname(__DIR__, 2) . '/assets/help-article-content.css')),
        rgbj_url('assets/help-editor.css?v=' . (string) @filemtime(dirname(__DIR__, 2) . '/assets/help-editor.css')),
    ],
]);
rgbj_page_analytics();
rgbj_render_page_nav();
rgbj_subpage_open([
    ['label' => 'RGBJunkie for Windows', 'href' => rgbj_url()],
    ['label' => 'Help Center', 'href' => rgbj_help_index_url()],
    ['label' => 'Editor'],
], 'col-12 rgbj-help-page rgbj-help-editor-page');
?>

<div id="rgbj-help-editor-loading" class="text-center py-5">
    <div class="spinner-border text-info" role="status"><span class="visually-hidden">Loading…</span></div>
    <p class="text-body-secondary mt-3 mb-0">Checking sign-in…</p>
</div>

<div id="rgbj-help-editor-denied" class="d-none">
    <div class="alert alert-danger border-danger">
        <h1 class="h4 alert-heading"><i class="bi bi-shield-lock me-2"></i>Admin sign-in required</h1>
        <p class="mb-3">Sign in with the site administrator Google account to edit Help Center articles.</p>
        <button type="button" class="btn btn-success" id="rgbj-help-editor-login"><i class="bi bi-google me-2"></i>Sign in with Google</button>
    </div>
</div>

<div id="rgbj-help-editor-app" class="d-none">
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
        <div>
            <h1 class="h3 fw-bold text-body-emphasis mb-1"><i class="bi bi-pencil-square me-2 text-info"></i>Help article editor</h1>
            <p class="text-body-secondary small mb-0">Visual editor — articles are saved as Markdown in <code>RGBJunkieApp/help/content/</code>. Paste or drop an image to upload it.</p>
        </div>
        <div class="d-flex flex-wrap align-items-center gap-2">
            <button type="button" class="btn btn-primary" id="rgbj-help-editor-save"><i class="bi bi-cloud-upload me-1"></i>Save</button>
            <button type="button" class="btn btn-outline-secondary btn-sm" id="rgbj-help-editor-logout"><i class="bi bi-box-arrow-right me-1"></i>Sign out</button>
        </div>
    </div>

    <div class="card border-secondary shadow-sm mb-3">
        <div class="card-body">
            <div class="row g-3 align-items-center">
                <div class="col-lg-5">
                    <label class="form-label small fw-semibold" for="rgbj-help-editor-select">Open article</label>
                    <select class="form-select" id="rgbj-help-editor-select">
                        <option value=""><?= $rgbj_editor_articles === [] ? 'No articles yet' : 'Choose an article…' ?></option>
                        <?php foreach (rgbj_help_group_article_meta_by_category($rgbj_editor_articles) as $rgbj_editor_category => $rgbj_editor_category_articles) : ?>
                        <optgroup label="<?= rgbj_h($rgbj_editor_category) ?>">
                            <?php foreach ($rgbj_editor_category_articles as $rgbj_editor_article) : ?>
                            <option value="<?= rgbj_h($rgbj_editor_article['slug']) ?>">
                                <?= rgbj_h($rgbj_editor_article['title']) ?><?= !empty($rgbj_editor_article['draft']) ? ' (draft)' : '' ?>
                            </option>
                            <?php endforeach; ?>
                        </optgroup>
                        <?php endforeach; ?>
                    </select>
                </div>
                <div class="col-lg-7 d-flex flex-wrap align-items-center gap-2 pt-lg-4">
                        <button type="button" class="btn btn-outline-secondary" id="rgbj-help-editor-new"><i class="bi bi-file-earmark-plus me-1"></i>New</button>
                        <button type="button" class="btn btn-outline-secondary" id="rgbj-help-editor-reload"><i class="bi bi-arrow-clockwise me-1"></i>Reload</button>
                        <button type="button" class="btn btn-outline-danger" id="rgbj-help-editor-delete" disabled><i class="bi bi-trash me-1"></i>Delete</button>
                        <a class="btn btn-outline-secondary d-none" id="rgbj-help-editor-view" href="#" target="_blank" rel="noopener"><i class="bi bi-box-arrow-up-right me-1"></i>View live</a>
                    </div>
            </div>
            <div class="row g-3 mt-1">
                <div class="col-md-6 col-lg-4">
                    <label class="form-label small fw-semibold" for="rgbj-help-editor-slug">Slug (filename)</label>
                    <input type="text" class="form-control font-monospace" id="rgbj-help-editor-slug" placeholder="quick-start">
                </div>
            </div>
        </div>
    </div>

    <div id="rgbj-help-gemini-source" class="d-none" aria-hidden="true">
        <div class="rgbj-help-gemini rgbj-help-gemini-popup">
            <?php if (!rgbj_help_gemini_is_configured()) : ?>
            <p class="small text-body-secondary mb-0">
                Gemini is not configured on this server. Copy
                <code>RGBJunkieApp/includes/help-gemini-secret.php.example</code> to
                <code>help-gemini-secret.php</code> and add your API key from
                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Google AI Studio</a>.
            </p>
            <?php else : ?>
            <div class="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3">
                <div>
                    <h2 class="h6 fw-bold text-body-emphasis mb-1"><i class="bi bi-stars me-1 text-info"></i>Gemini Helper</h2>
                    <p class="small text-body-secondary mb-0">Select text in the editor for excerpt actions, or run on the full article. Quota limits apply per API key project — paid Cloud billing must be linked to that same project in <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">AI Studio</a>.</p>
                </div>
            </div>
            <div class="d-flex flex-wrap gap-2 mb-3">
                <button type="button" class="btn btn-sm btn-outline-secondary rgbj-help-gemini-action" data-action="improve">Improve clarity</button>
                <button type="button" class="btn btn-sm btn-outline-secondary rgbj-help-gemini-action" data-action="grammar">Fix grammar</button>
                <button type="button" class="btn btn-sm btn-outline-secondary rgbj-help-gemini-action" data-action="expand">Expand section</button>
                <button type="button" class="btn btn-sm btn-outline-secondary rgbj-help-gemini-action" data-action="summarize">Suggest summary</button>
                <button type="button" class="btn btn-sm btn-outline-secondary rgbj-help-gemini-action" data-action="title">Suggest title</button>
            </div>
            <label class="form-label small fw-semibold" for="rgbj-help-gemini-prompt">Custom prompt</label>
            <div class="input-group mb-3">
                <input type="text" class="form-control" id="rgbj-help-gemini-prompt" placeholder="e.g. Make the intro friendlier for beginners">
                <button type="button" class="btn btn-info" id="rgbj-help-gemini-run"><i class="bi bi-stars me-1"></i>Ask Gemini</button>
            </div>
            <div id="rgbj-help-gemini-result-wrap" class="d-none">
                <label class="form-label small fw-semibold" id="rgbj-help-gemini-result-label" for="rgbj-help-gemini-result">Suggestion</label>
                <textarea class="form-control font-monospace mb-2" id="rgbj-help-gemini-result" rows="8" readonly></textarea>
                <div class="d-flex flex-wrap gap-2" id="rgbj-help-gemini-result-actions">
                    <button type="button" class="btn btn-sm btn-primary d-none" id="rgbj-help-gemini-apply-selection">Replace selection</button>
                    <button type="button" class="btn btn-sm btn-primary d-none" id="rgbj-help-gemini-apply-document">Replace article</button>
                    <button type="button" class="btn btn-sm btn-outline-secondary d-none" id="rgbj-help-gemini-apply-summary">Set summary field</button>
                    <button type="button" class="btn btn-sm btn-outline-secondary d-none" id="rgbj-help-gemini-apply-title">Set title field</button>
                    <button type="button" class="btn btn-sm btn-outline-secondary d-none" id="rgbj-help-gemini-select-all"><i class="bi bi-check2-square me-1"></i>Select all</button>
                    <button type="button" class="btn btn-sm btn-outline-secondary" id="rgbj-help-gemini-copy"><i class="bi bi-clipboard me-1"></i>Copy</button>
                </div>
            </div>
            <?php endif; ?>
        </div>
    </div>

    <div class="rgbj-help-editor-workspace">
        <div class="rgbj-help-editor-pane rgbj-help-editor-pane--edit">
            <details class="rgbj-help-editor-frontmatter" id="rgbj-help-editor-frontmatter">
                <summary class="small fw-semibold text-body-secondary">Article metadata</summary>
                <div class="rgbj-help-editor-meta-form row g-3 mt-2">
                    <div class="col-12">
                        <label class="form-label small fw-semibold" for="rgbj-help-meta-title">Title</label>
                        <input type="text" class="form-control form-control-sm" id="rgbj-help-meta-title" autocomplete="off">
                    </div>
                    <div class="col-12">
                        <label class="form-label small fw-semibold" for="rgbj-help-meta-summary">Summary</label>
                        <textarea class="form-control form-control-sm" id="rgbj-help-meta-summary" rows="2" placeholder="One sentence for the index card."></textarea>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label small fw-semibold" for="rgbj-help-meta-category">Category</label>
                        <input type="text" class="form-control form-control-sm" id="rgbj-help-meta-category" autocomplete="off" placeholder="Getting started">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label small fw-semibold" for="rgbj-help-meta-tags">Tags</label>
                        <input type="text" class="form-control form-control-sm" id="rgbj-help-meta-tags" autocomplete="off" placeholder="setup, scenes, effects">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label small fw-semibold" for="rgbj-help-meta-published">Published date</label>
                        <input type="date" class="form-control form-control-sm" id="rgbj-help-meta-published">
                    </div>
                    <div class="col-md-6 d-flex align-items-end">
                        <div class="form-check mb-2">
                            <input class="form-check-input" type="checkbox" id="rgbj-help-meta-draft">
                            <label class="form-check-label small" for="rgbj-help-meta-draft">Draft (hidden from Help Center index)</label>
                        </div>
                    </div>
                </div>
            </details>
            <div id="rgbj-help-editor-body" class="rgbj-help-editor-body"></div>
        </div>
    </div>

    <div id="rgbj-help-editor-status" class="rgbj-help-editor-status" role="status" aria-live="polite">Ready.</div>
</div>

<script>
    window.RGBJ_HELP_EDITOR = {
        adminUid: <?= json_encode(rgbj_help_editor_admin_uid(), JSON_THROW_ON_ERROR) ?>,
        apiUrl: <?= json_encode(rgbj_help_api_url(), JSON_THROW_ON_ERROR) ?>,
        geminiUrl: <?= json_encode(rgbj_help_gemini_api_url(), JSON_THROW_ON_ERROR) ?>,
        uploadImageUrl: <?= json_encode(rgbj_help_upload_image_api_url(), JSON_THROW_ON_ERROR) ?>,
        imagesUrl: <?= json_encode(rgbj_help_images_api_url(), JSON_THROW_ON_ERROR) ?>,
        geminiConfigured: <?= rgbj_help_gemini_is_configured() ? 'true' : 'false' ?>,
        helpIndexUrl: <?= json_encode(rgbj_help_index_url(), JSON_THROW_ON_ERROR) ?>,
        contentBaseUrl: <?= json_encode(rgbj_url('help/content/'), JSON_THROW_ON_ERROR) ?>,
        codeFoldVisibleLines: <?= RGBJ_HELP_CODE_FOLD_VISIBLE_LINES ?>,
        initialArticles: <?= json_encode($rgbj_editor_articles, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?>,
        firebaseModule: '/js/firebase.js'
    };
</script>

<?php
rgbj_subpage_close();
$rgbj_footer_blurb = 'Edit Help Center Markdown articles (admin only).';
require dirname(__DIR__, 2) . '/includes/page-footer.php';
?>
<script src="https://uicdn.toast.com/editor/latest/toastui-editor-all.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-clike.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-markup.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-javascript.min.js"></script>
<script src="https://uicdn.toast.com/editor-plugin-code-syntax-highlight/latest/toastui-editor-plugin-code-syntax-highlight.min.js"></script>
<script type="module" src="<?= rgbj_h(rgbj_url('assets/help-editor.js?v=' . (string) @filemtime(dirname(__DIR__, 2) . '/assets/help-editor.js'))) ?>"></script>
<?php rgbj_page_scripts_end(); ?>
