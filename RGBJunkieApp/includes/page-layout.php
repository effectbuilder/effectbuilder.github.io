<?php
/**
 * Shared head, navigation, and scripts for RGBJunkie for Windows site pages.
 * Requires includes/installers.php (rgbj_h, rgbj_url, rgbj_nav_is_active).
 */
declare(strict_types=1);

/**
 * @param array{
 *   title: string,
 *   description: string,
 *   og?: bool,
 *   app_css?: bool,
 *   extra_css?: list<string>,
 * } $opts
 */
function rgbj_page_head(array $opts): void
{
    $title = $opts['title'];
    $desc = $opts['description'];
    $og = !empty($opts['og']);
    $appCss = array_key_exists('app_css', $opts) ? (bool) $opts['app_css'] : true;
    $extraCss = $opts['extra_css'] ?? [];
    ?>
<!DOCTYPE html>
<html lang="en" data-bs-theme="dark">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= rgbj_h($title) ?></title>
    <meta name="description" content="<?= rgbj_h($desc) ?>">

    <?php if ($og) : ?>
    <meta property="og:url" content="https://rgbjunkie.com/RGBJunkieApp/">
    <meta property="og:type" content="website">
    <meta property="og:title" content="<?= rgbj_h($title) ?>">
    <meta property="og:description" content="Your desk, your vibe: multiple layout canvases, gorgeous effects, and broad hardware support. Built for gamers and PC enthusiasts.">
    <meta property="og:image" content="https://www.rgbjunkie.com/images/rgbjunkie.png">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:domain" content="rgbjunkie.com">
    <meta name="twitter:url" content="https://rgbjunkie.com/RGBJunkieApp/">
    <meta name="twitter:title" content="<?= rgbj_h($title) ?>">
    <meta name="twitter:description" content="Your desk, your vibe: multiple layout canvases, gorgeous effects, and broad hardware support.">
    <meta name="twitter:image" content="https://www.rgbjunkie.com/images/rgbjunkie.png">
    <?php endif; ?>

    <link rel="icon" type="image/x-icon" href="/rgbjunkielogo2.ico">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="/styles.css">
    <link rel="stylesheet" href="/styles-alt.css">
    <?php if ($appCss) : ?>
    <link rel="stylesheet" href="<?= rgbj_h(rgbj_url('assets/rgbjunkie-app.css')) ?>">
    <?php endif; ?>
    <?php foreach ($extraCss as $href) : ?>
    <link rel="stylesheet" href="<?= rgbj_h($href) ?>">
    <?php endforeach; ?>
</head>
    <?php
}

function rgbj_page_analytics(): void
{
    ?>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-WS7MGSDJSB"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'G-WS7MGSDJSB');
</script>
    <?php
}

function rgbj_render_page_nav(): void
{
    $active = $GLOBALS['rgbj_nav_active'] ?? 'home';
    $isHome = $active === 'home';

    $featuresHref = $isHome ? '#features' : rgbj_url('#features');
    $downloadHref = $isHome ? '#download' : rgbj_url('#download');
    $requirementsHref = $isHome ? '#requirements' : rgbj_url('#requirements');

    $navClass = static fn (string $page): string => rgbj_nav_is_active($page) ? ' active' : '';
    $navCurrent = static fn (string $page): string => rgbj_nav_is_active($page) ? ' aria-current="page"' : '';
    $dropClass = static fn (string $page): string => rgbj_nav_is_active($page) ? ' active' : '';
    $dropCurrent = static fn (string $page): string => rgbj_nav_is_active($page) ? ' aria-current="page"' : '';
    ?>
<body class="d-flex flex-column min-vh-100">
    <nav class="navbar navbar-expand-lg bg-body-tertiary border-bottom rgbj-site-nav">
        <?php $w = 'div'; ?>
        <<?= $w ?> class="container-fluid">
            <<?= $w ?> class="dropdown me-3 rgbj-brand-dropdown">
                <a class="navbar-brand d-flex align-items-center me-0 brand-dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                    <img src="/images/rgbjunkielogo.png" alt="RGBJunkie" class="me-2 rgbj-brand-logo">
                    <span>RGBJunkie</span>
                    <i class="bi bi-chevron-down ms-2 dropdown-indicator"></i>
                </a>
                <ul class="dropdown-menu dropdown-menu-start shadow mt-2 rgbj-brand-menu">
                    <li><a class="dropdown-item" href="/">RGBJunkie Effect Builder</a></li>
                    <li><a class="dropdown-item" href="/builder/">RGBJunkie Component Builder</a></li>
                    <li><a class="dropdown-item" href="/combiner/">RGBJunkie Effect Combiner</a></li>
                    <li><a class="dropdown-item" href="/skydimo/">Skydimo LUA Builder</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item<?= $dropClass('home') ?>" href="<?= rgbj_h(rgbj_url()) ?>"<?= $dropCurrent('home') ?>>RGBJunkie for Windows</a></li>
                    <li><a class="dropdown-item<?= $dropClass('releases') ?>" href="<?= rgbj_h(rgbj_url('releases/')) ?>"<?= $dropCurrent('releases') ?>>Previous releases</a></li>
                    <li><a class="dropdown-item<?= $dropClass('changelog') ?>" href="<?= rgbj_h(rgbj_url('changelog/')) ?>"<?= $dropCurrent('changelog') ?>>Changelog</a></li>
                    <li><a class="dropdown-item<?= $dropClass('supported') ?>" href="<?= rgbj_h(rgbj_url('supported/')) ?>"<?= $dropCurrent('supported') ?>>Supported USB devices &amp; parts</a></li>
                    <li><a class="dropdown-item<?= $dropClass('docs') ?>" href="<?= rgbj_h(rgbj_url('docs/')) ?>"<?= $dropCurrent('docs') ?>>Documentation</a></li>
                    <li><a class="dropdown-item<?= $dropClass('terms') ?>" href="<?= rgbj_h(rgbj_url('terms/')) ?>"<?= $dropCurrent('terms') ?>>Terms of Service</a></li>
                    <li><a class="dropdown-item<?= $dropClass('privacy') ?>" href="<?= rgbj_h(rgbj_url('privacy/')) ?>"<?= $dropCurrent('privacy') ?>>Privacy Policy</a></li>
                </ul>
            </<?= $w ?>>

            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#appNav" aria-controls="appNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <<?= $w ?> class="collapse navbar-collapse" id="appNav">
                <ul class="navbar-nav ms-auto gap-lg-2">
                    <li class="nav-item"><a class="nav-link" href="<?= rgbj_h($featuresHref) ?>"><i class="bi bi-grid-3x3-gap me-1"></i>Features</a></li>
                    <li class="nav-item"><a class="nav-link" href="<?= rgbj_h($downloadHref) ?>"><i class="bi bi-download me-1"></i>Download</a></li>
                    <li class="nav-item"><a class="nav-link<?= $navClass('releases') ?>" href="<?= rgbj_h(rgbj_url('releases/')) ?>"<?= $navCurrent('releases') ?>><i class="bi bi-archive me-1"></i>Previous releases</a></li>
                    <li class="nav-item"><a class="nav-link<?= $navClass('changelog') ?>" href="<?= rgbj_h(rgbj_url('changelog/')) ?>"<?= $navCurrent('changelog') ?>><i class="bi bi-journal-text me-1"></i>Changelog</a></li>
                    <li class="nav-item"><a class="nav-link<?= $navClass('supported') ?>" href="<?= rgbj_h(rgbj_url('supported/')) ?>"<?= $navCurrent('supported') ?>><i class="bi bi-plugin me-1"></i>Supported gear</a></li>
                    <li class="nav-item"><a class="nav-link<?= $navClass('docs') ?>" href="<?= rgbj_h(rgbj_url('docs/')) ?>"<?= $navCurrent('docs') ?>><i class="bi bi-journal-code me-1"></i>Documentation</a></li>
                    <li class="nav-item"><a class="nav-link<?= $navClass('terms') ?>" href="<?= rgbj_h(rgbj_url('terms/')) ?>"<?= $navCurrent('terms') ?>><i class="bi bi-file-text me-1"></i>Terms</a></li>
                    <li class="nav-item"><a class="nav-link<?= $navClass('privacy') ?>" href="<?= rgbj_h(rgbj_url('privacy/')) ?>"<?= $navCurrent('privacy') ?>><i class="bi bi-shield-check me-1"></i>Privacy</a></li>
                    <?php if ($isHome) : ?>
                    <li class="nav-item"><a class="nav-link" href="<?= rgbj_h($requirementsHref) ?>"><i class="bi bi-pc-display me-1"></i>Requirements</a></li>
                    <?php endif; ?>
                    <li class="nav-item"><a class="btn btn-primary mt-2 mt-lg-0 ms-lg-2" href="<?= rgbj_h($downloadHref) ?>"><i class="bi bi-box-arrow-in-down me-1"></i>Download</a></li>
                </ul>
            </<?= $w ?>>
        </<?= $w ?>>
    </nav>
    <?php
}

/**
 * Standard subpage content wrapper (breadcrumb + centered column).
 *
 * @param list<array{label: string, href?: string}> $breadcrumb
 * @param string $columnClass Extra classes on the content column (e.g. rgbj-changelog-page).
 */
function rgbj_subpage_open(array $breadcrumb = [], string $columnClass = ''): void
{
    $w = 'div';
    $colClass = ($columnClass !== '' && str_starts_with($columnClass, 'col-'))
        ? $columnClass
        : 'col-lg-10 col-xl-9' . ($columnClass !== '' ? ' ' . $columnClass : '');
    ?>
    <main class="flex-grow-1 py-4 rgbj-subpage-glow">
        <<?= $w ?> class="container">
            <<?= $w ?> class="row justify-content-center">
                <<?= $w ?> class="<?= rgbj_h($colClass) ?>">
    <?php
    if ($breadcrumb !== []) {
        echo '<nav aria-label="breadcrumb" class="mb-3"><ol class="breadcrumb mb-0">';
        foreach ($breadcrumb as $i => $crumb) {
            $isLast = $i === count($breadcrumb) - 1;
            if ($isLast || empty($crumb['href'])) {
                echo '<li class="breadcrumb-item active" aria-current="page">' . rgbj_h($crumb['label']) . '</li>';
            } else {
                echo '<li class="breadcrumb-item"><a href="' . rgbj_h($crumb['href']) . '">' . rgbj_h($crumb['label']) . '</a></li>';
            }
        }
        echo '</ol></nav>';
    }
}

function rgbj_subpage_close(): void
{
    $w = 'div';
    ?>
                </<?= $w ?>>
            </<?= $w ?>>
        </<?= $w ?>>
    </main>
    <?php
}

function rgbj_page_scripts_end(): void
{
    ?>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>
    <?php
}
