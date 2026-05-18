<?php declare(strict_types=1);

require_once dirname(__DIR__) . '/includes/installers.php';
require_once dirname(__DIR__) . '/includes/tos-content.php';

$rgbj_nav_active = 'terms';

$pageTitle = 'Terms of Service | RGBJunkie for Windows';
$pageDesc = 'RGBJunkie Terms of Service, the same agreement shown in the Windows app before use.';

rgbj_page_head(['title' => $pageTitle, 'description' => $pageDesc]);
rgbj_page_analytics();
rgbj_render_page_nav();
rgbj_subpage_open([
    ['label' => 'RGBJunkie for Windows', 'href' => rgbj_url()],
    ['label' => 'Terms of Service'],
]);
?>

<h1 class="h2 fw-bold text-body-emphasis mb-2"><i class="bi bi-file-text me-2 text-info"></i>Terms of Service</h1>
<p class="text-body-secondary mb-4">This is the same agreement presented in the RGBJunkie Windows app when you first run it or when the terms are updated.</p>

<?php $w = 'div'; ?>
<<?= $w ?> class="card border-secondary bg-body-tertiary shadow-sm">
    <<?= $w ?> class="card-body rgbj-tos-document">
        <?php rgbj_render_tos_body(); ?>
    </<?= $w ?>>
</<?= $w ?>>

<?php
rgbj_subpage_close();
$rgbj_footer_blurb = 'Review the terms that apply to the RGBJunkie Windows desktop app.';
require dirname(__DIR__) . '/includes/page-footer.php';
rgbj_page_scripts_end();
