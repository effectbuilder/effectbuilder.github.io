<?php
/**
 * rgbjunkie.com hub landing — product cards for the desktop app and browser tools.
 */
declare(strict_types=1);

require_once __DIR__ . '/effect-builder-legacy.php';

/**
 * @return list<array{
 *   slug: string,
 *   featured?: bool,
 *   title: string,
 *   description: string,
 *   href: string,
 *   icon: string,
 *   cta: string,
 *   image: string,
 *   external?: bool
 * }>
 */
function rgbj_hub_products(): array
{
    return [
        // [
        //     'slug' => 'rgbjunkie-app',
        //     'featured' => true,
        //     'title' => 'RGBJunkie for Windows & Linux',
        //     'description' => 'Plan your battlestation on multiple workspace canvases, preview stunning effects, and drive supported USB lighting from one polished desktop app.',
        //     'href' => '/RGBJunkieApp/',
        //     'icon' => 'bi-pc-display-horizontal',
        //     'cta' => 'Get the app',
        //     'image' => 'images/hub/rgbjunkie.png',
        // ],
        [
            'slug' => 'effect-builder',
            'title' => 'Effect Builder',
            'description' => 'Design interactive canvas lighting effects visually, save projects to the cloud, and export HTML for RGBJunkie or SignalRGB.',
            'href' => RGBJ_EFFECT_BUILDER_PATH,
            'icon' => 'bi-magic',
            'cta' => 'Open Effect Builder',
            'image' => 'images/hub/effect-builder.png',
        ],
        [
            'slug' => 'component-builder',
            'title' => 'Component Builder',
            'description' => 'Lay out keyboards, strips, mats, and accent zones on a canvas, then export a reusable component for your rig.',
            'href' => '/builder/',
            'icon' => 'bi-grid-3x3-gap',
            'cta' => 'Open Component Builder',
            'image' => 'images/hub/component-builder.png',
        ],
        [
            'slug' => 'effect-combiner',
            'title' => 'Effect Combiner',
            'description' => 'Blend and layer multiple effects into one combined look without rebuilding from scratch.',
            'href' => '/combiner/',
            'icon' => 'bi-layers',
            'cta' => 'Open Effect Combiner',
            'image' => 'images/hub/effect-combiner.png',
        ],
        [
            'slug' => 'skydimo',
            'title' => 'Skydimo LUA Builder',
            'description' => 'Sketch Skydimo-compatible LUA effects with a live preview and generated code ready to paste into your setup.',
            'href' => '/skydimo/',
            'icon' => 'bi-code-slash',
            'cta' => 'Open Skydimo Builder',
            'image' => 'images/hub/skydimo.png',
        ],
    ];
}

function rgbj_hub_image_exists(string $webPath): bool
{
    $root = dirname(__DIR__);
    $full = $root . DIRECTORY_SEPARATOR . str_replace('/', DIRECTORY_SEPARATOR, ltrim($webPath, '/'));

    return is_file($full);
}

function rgbj_render_hub_product_card(array $product): void
{
    $featured = !empty($product['featured']);
    $isEffectBuilder = ($product['slug'] ?? '') === 'effect-builder';
    $image = (string) $product['image'];
    $hasImage = rgbj_hub_image_exists($image);
    $external = !empty($product['external']);
    $linkAttrs = $external ? ' target="_blank" rel="noopener noreferrer"' : '';

    if ($isEffectBuilder) {
        echo '<div class="rgbj-hub-tile-wrap" id="hub-effect-builder-tile">';
        rgbj_render_effect_builder_hint('float');
    }
    ?>
    <article class="rgbj-hub-card<?= $featured ? ' rgbj-hub-card--app' : '' ?><?= $isEffectBuilder ? ' rgbj-hub-card--effect-builder' : '' ?>" role="listitem">
        <a class="rgbj-hub-card__link text-decoration-none" href="<?= htmlspecialchars($product['href'], ENT_QUOTES, 'UTF-8') ?>"<?= $linkAttrs ?>>
            <div class="rgbj-hub-card__media<?= $hasImage ? '' : ' rgbj-hub-card__media--placeholder' ?>">
                <?php if ($hasImage) : ?>
                <img
                    class="rgbj-hub-card__img"
                    src="/<?= htmlspecialchars(ltrim($image, '/'), ENT_QUOTES, 'UTF-8') ?>"
                    alt=""
                    width="640"
                    height="360"
                    loading="eager"
                    decoding="async"
                >
                <?php else : ?>
                <div class="rgbj-hub-card__placeholder" aria-hidden="true">
                    <i class="bi <?= htmlspecialchars($product['icon'], ENT_QUOTES, 'UTF-8') ?>"></i>
                    <span class="rgbj-hub-card__placeholder-label">Image placeholder</span>
                </div>
                <?php endif; ?>
            </div>
            <div class="rgbj-hub-card__body">
                <h2 class="rgbj-hub-card__title h5 text-body-emphasis mb-2"><?= htmlspecialchars($product['title'], ENT_QUOTES, 'UTF-8') ?></h2>
                <p class="rgbj-hub-card__text text-body-secondary mb-3"><?= htmlspecialchars($product['description'], ENT_QUOTES, 'UTF-8') ?></p>
                <span class="rgbj-hub-card__cta btn btn-primary btn-sm">
                    <?= htmlspecialchars($product['cta'], ENT_QUOTES, 'UTF-8') ?>
                    <i class="bi bi-arrow-right-short" aria-hidden="true"></i>
                </span>
            </div>
        </a>
    </article>
    <?php
    if ($isEffectBuilder) {
        echo '</div>';
    }
}

function rgbj_render_effect_builder_hint(string $variant = 'inline'): void
{
    $isFloat = $variant === 'float';
    $classes = 'rgbj-hub-builder-hint rgbj-hub-builder-hint--' . $variant;
    if ($isFloat) {
        $classes .= ' d-none d-xl-block';
    }
    ?>
    <div
        class="<?= htmlspecialchars($classes, ENT_QUOTES, 'UTF-8') ?>"
        id="hub-builder-hint-<?= htmlspecialchars($variant, ENT_QUOTES, 'UTF-8') ?>"
        data-hub-builder-hint
        role="dialog"
        aria-labelledby="hub-builder-hint-title-<?= htmlspecialchars($variant, ENT_QUOTES, 'UTF-8') ?>"
        aria-describedby="hub-builder-hint-desc-<?= htmlspecialchars($variant, ENT_QUOTES, 'UTF-8') ?>"
        hidden
    >
        <div class="rgbj-hub-builder-hint__panel shadow-lg">
            <button type="button" class="btn-close btn-close-white rgbj-hub-builder-hint__close" data-hub-hint-dismiss aria-label="Dismiss"></button>
            <p class="rgbj-hub-builder-hint__title mb-1" id="hub-builder-hint-title-<?= htmlspecialchars($variant, ENT_QUOTES, 'UTF-8') ?>">
                <i class="bi bi-magic me-1 text-info" aria-hidden="true"></i>Looking for the Effect Builder?
            </p>
            <p class="rgbj-hub-builder-hint__text mb-3" id="hub-builder-hint-desc-<?= htmlspecialchars($variant, ENT_QUOTES, 'UTF-8') ?>">
                <?php if ($isFloat) : ?>
                Same tool as always — it lives on this tile now. Click below to open it.
                <?php else : ?>
                Same tool as always — open it from the <strong>Effect Builder</strong> tile below.
                <?php endif; ?>
            </p>
            <div class="rgbj-hub-builder-hint__actions d-flex flex-wrap gap-2">
                <a class="btn btn-primary btn-sm" href="<?= htmlspecialchars(RGBJ_EFFECT_BUILDER_PATH, ENT_QUOTES, 'UTF-8') ?>">Open Effect Builder</a>
                <button type="button" class="btn btn-outline-secondary btn-sm" data-hub-hint-dismiss>Got it</button>
            </div>
        </div>
        <?php if ($isFloat) : ?>
        <div class="rgbj-hub-builder-hint__arrow" aria-hidden="true">
            <i class="bi bi-arrow-down"></i>
        </div>
        <?php endif; ?>
    </div>
    <?php
}

function rgbj_render_hub_nav(): void
{
    $tools = rgbj_hub_products();
    ?>
    <nav class="navbar navbar-expand-lg bg-body-tertiary border-bottom rgbj-hub-nav">
        <div class="container-fluid rgbj-hub-nav__inner">
            <a class="navbar-brand d-flex align-items-center mb-0" href="/">
                <img src="/images/rgbjunkielogo.png" alt="" class="me-2 rgbj-hub-nav__logo" width="28" height="28">
                <span class="fw-semibold">RGBJunkie</span>
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#hubNav" aria-controls="hubNav" aria-expanded="false" aria-label="Open menu">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="hubNav">
                <ul class="navbar-nav ms-auto align-items-lg-center gap-lg-1">
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">Web tools</a>
                        <ul class="dropdown-menu dropdown-menu-end shadow">
                            <?php foreach ($tools as $tool) {
                                if (!empty($tool['featured'])) {
                                    continue;
                                } ?>
                            <li><a class="dropdown-item" href="<?= htmlspecialchars($tool['href'], ENT_QUOTES, 'UTF-8') ?>"><?= htmlspecialchars($tool['title'], ENT_QUOTES, 'UTF-8') ?></a></li>
                            <?php } ?>
                        </ul>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/RGBJunkieApp/">Desktop app</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/RGBJunkieApp/help/">Help</a>
                    </li>
                    <li class="nav-item ms-lg-2">
                        <a class="btn btn-primary btn-sm" href="/RGBJunkieApp/#download">Download</a>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
    <?php
}

function rgbj_render_hub_footer(): void
{
    ?>
    <footer class="rgbj-hub-footer py-4 border-top bg-body-tertiary">
        <div class="container">
            <div class="row align-items-center g-3">
                <div class="col-md-7 text-center text-md-start small text-body-secondary">
                    <div class="d-flex align-items-center justify-content-center justify-content-md-start gap-2 mb-2">
                        <img src="/images/rgbjunkielogo.png" alt="" height="28" class="opacity-75">
                        <span class="fw-semibold text-body-emphasis">RGBJunkie</span>
                    </div>
                    <p class="mb-1">Browser creative tools and the RGBJunkie desktop app for PC lighting enthusiasts.</p>
                    <p class="mb-0">
                        <a href="/RGBJunkieApp/docs/">Documentation</a>
                        <span class="text-muted mx-1">·</span>
                        <a href="/RGBJunkieApp/help/">Help Center</a>
                        <span class="text-muted mx-1">·</span>
                        <a href="/terms-of-usage.html">Terms</a>
                        <span class="text-muted mx-1">·</span>
                        <a href="/privacy-policy.html">Privacy</a>
                    </p>
                </div>
                <div class="col-md-5 text-center text-md-end small text-body-secondary">
                    <p class="mb-0">&copy; <?= date('Y') ?> RGBJunkie. All rights reserved.</p>
                </div>
            </div>
        </div>
    </footer>
    <?php
}
