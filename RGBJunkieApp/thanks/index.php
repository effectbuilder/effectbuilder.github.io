<?php declare(strict_types=1);

require_once dirname(__DIR__) . '/includes/download-tracker.php';

$rgbj_nav_active = '';
$filePath = rgbj_download_normalize_path((string) ($_GET['f'] ?? ''));
$downloadUrl = $filePath !== '' ? rgbj_download_link($filePath) : null;
$downloadName = $filePath !== '' ? basename($filePath) : null;
$webTools = rgbj_web_tools();

$pageTitle = 'Thanks for downloading | RGBJunkie';
$pageDesc = 'Your RGBJunkie download should be on its way. Explore more free tools on rgbjunkie.com or say hello on Discord.';

rgbj_page_head(['title' => $pageTitle, 'description' => $pageDesc, 'app_css' => true]);
rgbj_page_analytics();
rgbj_render_page_nav();
rgbj_subpage_open([
    ['label' => 'RGBJunkie', 'href' => rgbj_url()],
    ['label' => 'Thanks'],
], 'col-lg-9 col-xl-8');
?>

<div class="text-center mb-4">
    <p class="text-info small fw-semibold text-uppercase tracking-wide mb-2">You&apos;re all set</p>
    <h1 class="h2 fw-bold text-body-emphasis mb-3">
        <i class="bi bi-heart-fill text-info me-2" aria-hidden="true"></i>Thanks for downloading!
    </h1>
    <?php if ($downloadName !== null) : ?>
    <p class="lead text-body-secondary mb-2">
        We&apos;re glad you&apos;re giving RGBJunkie a try.
        <?php if ($downloadUrl !== null) : ?>
        Your file <span class="text-body fw-medium"><?= rgbj_h($downloadName) ?></span> should start downloading in a moment.
        <?php else : ?>
        We couldn&apos;t find that file anymore — grab the latest build below.
        <?php endif; ?>
    </p>
    <?php else : ?>
    <p class="lead text-body-secondary mb-2">
        We&apos;re glad you&apos;re here. If your download didn&apos;t start, head back to the
        <a href="<?= rgbj_h(rgbj_url('#download')) ?>">download page</a>.
    </p>
    <?php endif; ?>
    <p class="text-body-secondary mb-0">
        Install it when the transfer finishes, plug in your gear, and have fun lighting things up.
    </p>
</div>

<?php if ($downloadUrl !== null) : ?>
<div class="d-flex flex-wrap justify-content-center gap-2 mb-5">
    <a class="btn btn-outline-primary" href="<?= rgbj_h($downloadUrl) ?>" id="rgbj-thanks-redownload">
        <i class="bi bi-download me-2" aria-hidden="true"></i>Download again
    </a>
    <a class="btn btn-outline-secondary" href="<?= rgbj_h(rgbj_url()) ?>">
        <i class="bi bi-house me-2" aria-hidden="true"></i>Back to app home
    </a>
</div>
<?php else : ?>
<div class="d-flex flex-wrap justify-content-center gap-2 mb-5">
    <a class="btn btn-primary" href="<?= rgbj_h(rgbj_url('#download')) ?>">
        <i class="bi bi-download me-2" aria-hidden="true"></i>Get the latest build
    </a>
</div>
<?php endif; ?>

<h2 class="h5 fw-semibold text-body-emphasis mb-3">More free tools on this site</h2>
<p class="text-body-secondary mb-3">
    RGBJunkie isn&apos;t just the desktop app — these browser tools are free to use anytime, no install required.
</p>

<div class="row g-3 mb-5">
    <?php foreach ($webTools as $tool) : ?>
    <div class="col-md-6">
        <a href="<?= rgbj_h($tool['href']) ?>" class="card border-secondary h-100 text-decoration-none rgbj-thanks-tool-card">
            <div class="card-body">
                <h3 class="h6 fw-semibold text-body-emphasis mb-2">
                    <i class="bi <?= rgbj_h($tool['icon']) ?> text-info me-2" aria-hidden="true"></i><?= rgbj_h($tool['label']) ?>
                </h3>
                <p class="small text-body-secondary mb-0"><?= rgbj_h($tool['description']) ?></p>
            </div>
        </a>
    </div>
    <?php endforeach; ?>
</div>

<div class="card border-secondary bg-body-tertiary">
    <div class="card-body text-center py-4 px-4">
        <h2 class="h5 fw-semibold text-body-emphasis mb-2">
            <i class="bi bi-discord text-info me-2" aria-hidden="true"></i>Come say hi on Discord
        </h2>
        <p class="text-body-secondary mb-3 mx-auto" style="max-width: 36rem;">
            Whether you&apos;re stuck on an install, want to share a screenshot of your desk, or just like talking RGB —
            you&apos;re welcome in our community. No pressure, no spam — just friendly folks who enjoy this stuff as much as you do.
        </p>
        <a class="btn btn-primary btn-lg" href="<?= rgbj_h(RGBJ_DISCORD_INVITE_URL) ?>" target="_blank" rel="noopener noreferrer">
            <i class="bi bi-discord me-2" aria-hidden="true"></i>Join the RGBJunkie Discord
        </a>
        <p class="small text-body-secondary mt-3 mb-0">
            <a href="<?= rgbj_h(RGBJ_DISCORD_INVITE_URL) ?>" class="link-secondary" target="_blank" rel="noopener noreferrer">discord.gg/adHsQG8czv</a>
        </p>
    </div>
</div>

<?php if ($downloadUrl !== null) : ?>
<script>
(function () {
    var url = <?= json_encode($downloadUrl, JSON_THROW_ON_ERROR) ?>;
    var started = false;
    function triggerDownload() {
        if (started) {
            return;
        }
        started = true;
        var frame = document.createElement('iframe');
        frame.setAttribute('hidden', 'hidden');
        frame.setAttribute('aria-hidden', 'true');
        frame.src = url;
        document.body.appendChild(frame);
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', triggerDownload);
    } else {
        triggerDownload();
    }
})();
</script>
<?php endif; ?>

<?php
rgbj_subpage_close();
$rgbj_footer_blurb = 'Thanks for supporting RGBJunkie — happy lighting!';
require dirname(__DIR__) . '/includes/page-footer.php';
rgbj_page_scripts_end();
