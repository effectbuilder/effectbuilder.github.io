<?php
/**
 * Shared site footer. Expects rgbj_h() from includes/installers.php.
 */
declare(strict_types=1);
?>
<footer class="py-4 mt-auto border-top bg-body-tertiary">
    <div class="container">
        <div class="row align-items-center g-3">
            <div class="col-md-6 text-center text-md-start">
                <div class="d-flex align-items-center justify-content-center justify-content-md-start gap-2 mb-2 mb-md-0">
                    <img src="/images/rgbjunkielogo.png" alt="" height="28" class="opacity-75" style="height: 28px; width: auto;">
                    <span class="fw-semibold text-body-emphasis">RGBJunkie</span>
                </div>
                <?php if (!empty($rgbj_footer_blurb)) : ?>
                <p class="small text-body-secondary mb-1"><?= $rgbj_footer_blurb ?></p>
                <?php endif; ?>
                <p class="small text-body-secondary mb-0">
                    <a href="<?= rgbj_h(rgbj_url('terms/')) ?>">Terms of Service</a>
                    <?php if (!empty($rgbj_footer_extra_link)) : ?>
                    <span class="text-muted mx-1">·</span>
                    <?= $rgbj_footer_extra_link ?>
                    <?php endif; ?>
                </p>
            </div>
            <div class="col-md-6 text-center text-md-end small text-body-secondary">
                <p class="mb-0">&copy; <?= date('Y') ?> RGBJunkie. All rights reserved.</p>
            </div>
        </div>
    </div>
</footer>
