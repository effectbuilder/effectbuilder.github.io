<?php declare(strict_types=1);

require_once dirname(__DIR__) . '/includes/installers.php';
require_once dirname(__DIR__) . '/includes/privacy-content.php';

$rgbj_nav_active = 'privacy';

$pageTitle = 'Privacy Policy | RGBJunkie';
$pageDesc = 'How RGBJunkie collects and uses information on rgbjunkie.com and in the Windows desktop app.';

rgbj_page_head(['title' => $pageTitle, 'description' => $pageDesc]);
rgbj_page_analytics();
rgbj_render_page_nav();
rgbj_subpage_open([
    ['label' => 'RGBJunkie for Windows', 'href' => rgbj_url()],
    ['label' => 'Privacy Policy'],
]);
?>

<h1 class="h2 fw-bold text-body-emphasis mb-2"><i class="bi bi-shield-check me-2 text-info"></i>Privacy Policy</h1>
<p class="text-body-secondary mb-4">How we handle information when you use our website, browser tools, and the RGBJunkie for Windows app. See also our <a href="<?= rgbj_h(rgbj_url('terms/')) ?>">Terms of Service</a>.</p>

<div class="card border-secondary bg-body-tertiary shadow-sm">
    <div class="card-body rgbj-legal-document">
        <?php rgbj_render_privacy_body(); ?>
    </div>
</div>

<?php
rgbj_subpage_close();
$rgbj_footer_blurb = 'Privacy practices for rgbjunkie.com and RGBJunkie for Windows.';
require dirname(__DIR__) . '/includes/page-footer.php';
rgbj_page_scripts_end();
