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
    $moreActive = in_array($active, ['releases', 'changelog', 'terms', 'privacy'], true);
    $helpHref = rgbj_url('help/');
    ?>
<body class="d-flex flex-column min-vh-100">
    <nav class="navbar navbar-expand-xl bg-body-tertiary border-bottom rgbj-site-nav">
        <div class="container-fluid rgbj-nav-container">
            <div class="d-flex align-items-center flex-shrink-0 rgbj-brand-wrap">
                <a class="navbar-brand d-flex align-items-center mb-0" href="<?= rgbj_h(rgbj_url()) ?>">
                    <img src="/images/rgbjunkielogo.png" alt="" class="me-2 rgbj-brand-logo" width="28" height="28">
                    <span class="rgbj-brand-text">RGBJunkie</span>
                </a>
                <div class="dropdown rgbj-brand-dropdown">
                    <button class="btn btn-link btn-sm text-body-secondary rgbj-brand-menu-btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="More RGBJunkie sites">
                        <i class="bi bi-chevron-down" aria-hidden="true"></i>
                    </button>
                    <ul class="dropdown-menu dropdown-menu-start shadow mt-2 rgbj-brand-menu">
                        <li class="dropdown-header small text-body-secondary">Web tools</li>
                        <li><a class="dropdown-item" href="/">RGBJunkie home</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li><a class="dropdown-item" href="/effect-builder/">Effect Builder</a></li>
                        <li><a class="dropdown-item" href="/builder/">Component Builder</a></li>
                        <li><a class="dropdown-item" href="/combiner/">Effect Combiner</a></li>
                        <li><a class="dropdown-item" href="/skydimo/">Skydimo LUA Builder</a></li>
                        <li><hr class="dropdown-divider"></li>
                        <li class="dropdown-header small text-body-secondary">Desktop app</li>
                        <li><a class="dropdown-item<?= $dropClass('home') ?>" href="<?= rgbj_h(rgbj_url()) ?>"<?= $dropCurrent('home') ?>>App home</a></li>
                        <li><a class="dropdown-item<?= $dropClass('releases') ?>" href="<?= rgbj_h(rgbj_url('releases/')) ?>"<?= $dropCurrent('releases') ?>>Previous releases</a></li>
                        <li><a class="dropdown-item<?= $dropClass('changelog') ?>" href="<?= rgbj_h(rgbj_url('changelog/')) ?>"<?= $dropCurrent('changelog') ?>>Changelog</a></li>
                        <li><a class="dropdown-item<?= $dropClass('supported') ?>" href="<?= rgbj_h(rgbj_url('supported/')) ?>"<?= $dropCurrent('supported') ?>>Supported gear</a></li>
                        <li><a class="dropdown-item<?= $dropClass('docs') ?>" href="<?= rgbj_h(rgbj_url('docs/')) ?>"<?= $dropCurrent('docs') ?>>Documentation</a></li>
                        <li><a class="dropdown-item<?= $dropClass('help') ?>" href="<?= rgbj_h($helpHref) ?>"<?= $dropCurrent('help') ?>>Help Center</a></li>
                    </ul>
                </div>
            </div>

            <button class="navbar-toggler ms-auto" type="button" data-bs-toggle="collapse" data-bs-target="#appNav" aria-controls="appNav" aria-expanded="false" aria-label="Open menu">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="appNav">
                <ul class="navbar-nav ms-xl-auto align-items-xl-center rgbj-nav-list">
                    <?php if ($isHome) : ?>
                    <li class="nav-item"><a class="nav-link rgbj-nav-link" href="<?= rgbj_h($featuresHref) ?>"><i class="bi bi-grid-3x3-gap rgbj-nav-icon" aria-hidden="true"></i><span>Features</span></a></li>
                    <?php endif; ?>
                    <li class="nav-item"><a class="nav-link rgbj-nav-link<?= $navClass('supported') ?>" href="<?= rgbj_h(rgbj_url('supported/')) ?>"<?= $navCurrent('supported') ?>><i class="bi bi-usb-symbol rgbj-nav-icon" aria-hidden="true"></i><span>Supported gear</span></a></li>
                    <li class="nav-item"><a class="nav-link rgbj-nav-link<?= $navClass('docs') ?>" href="<?= rgbj_h(rgbj_url('docs/')) ?>"<?= $navCurrent('docs') ?>><i class="bi bi-journal-code rgbj-nav-icon" aria-hidden="true"></i><span>Documentation</span></a></li>
                    <li class="nav-item"><a class="nav-link rgbj-nav-link<?= $navClass('help') ?>" href="<?= rgbj_h($helpHref) ?>"<?= $navCurrent('help') ?>><i class="bi bi-life-preserver rgbj-nav-icon" aria-hidden="true"></i><span>Help</span></a></li>
                    <li class="nav-item dropdown rgbj-nav-more">
                        <a class="nav-link dropdown-toggle rgbj-nav-link<?= $moreActive ? ' active' : '' ?>" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="bi bi-three-dots rgbj-nav-icon" aria-hidden="true"></i><span>More</span>
                        </a>
                        <ul class="dropdown-menu dropdown-menu-end shadow">
                            <li><a class="dropdown-item<?= $dropClass('releases') ?>" href="<?= rgbj_h(rgbj_url('releases/')) ?>"<?= $dropCurrent('releases') ?>>Previous releases</a></li>
                            <li><a class="dropdown-item<?= $dropClass('changelog') ?>" href="<?= rgbj_h(rgbj_url('changelog/')) ?>"<?= $dropCurrent('changelog') ?>>Changelog</a></li>
                            <li><a class="dropdown-item<?= $dropClass('help') ?>" href="<?= rgbj_h($helpHref) ?>"<?= $dropCurrent('help') ?>>Help Center</a></li>
                            <li><a class="dropdown-item<?= $dropClass('terms') ?>" href="<?= rgbj_h(rgbj_url('terms/')) ?>"<?= $dropCurrent('terms') ?>>Terms of Service</a></li>
                            <li><a class="dropdown-item<?= $dropClass('privacy') ?>" href="<?= rgbj_h(rgbj_url('privacy/')) ?>"<?= $dropCurrent('privacy') ?>>Privacy Policy</a></li>
                            <?php if ($isHome) : ?>
                            <li><hr class="dropdown-divider"></li>
                            <li><a class="dropdown-item" href="<?= rgbj_h($requirementsHref) ?>">Requirements</a></li>
                            <?php endif; ?>
                        </ul>
                    </li>
                    <?php if ($isHome) : ?>
                    <li class="nav-item d-none rgbj-admin-stats-nav">
                        <a class="nav-link rgbj-nav-link" href="<?= rgbj_h(rgbj_url('stats/downloads/')) ?>">
                            <i class="bi bi-bar-chart rgbj-nav-icon" aria-hidden="true"></i><span>Download stats</span>
                        </a>
                    </li>
                    <?php endif; ?>
                    <li class="nav-item rgbj-nav-cta">
                        <a class="btn btn-primary btn-sm w-100" href="<?= rgbj_h($downloadHref) ?>"><i class="bi bi-download me-1" aria-hidden="true"></i>Download</a>
                    </li>
                </ul>
            </div>
        </div>
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
    $isHelpPage = strpos($columnClass, 'rgbj-help-page') !== false;
    $containerClass = $isHelpPage ? 'container-fluid px-3 px-lg-4 px-xxl-5' : 'container';
    $rowClass = $isHelpPage ? 'row' : 'row justify-content-center';
    $colClass = ($columnClass !== '' && str_starts_with($columnClass, 'col-'))
        ? $columnClass
        : 'col-lg-10 col-xl-9' . ($columnClass !== '' ? ' ' . $columnClass : '');
    ?>
    <main class="flex-grow-1 py-4 rgbj-subpage-glow<?= $isHelpPage ? ' rgbj-subpage-glow--help' : '' ?>">
        <<?= $w ?> class="<?= rgbj_h($containerClass) ?>">
            <<?= $w ?> class="<?= rgbj_h($rowClass) ?>">
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

function rgbj_page_admin_nav_scripts(): void
{
    if (!function_exists('rgbj_download_stats_config')) {
        require_once __DIR__ . '/download-stats-config.php';
    }
    $adminUid = (string) (rgbj_download_stats_config()['admin_uid'] ?? '');
    ?>
    <script>
        window.RGBJ_ADMIN_NAV = { adminUid: <?= json_encode($adminUid, JSON_THROW_ON_ERROR) ?> };
    </script>
    <script src="<?= rgbj_h(rgbj_url('assets/admin-nav.js')) ?>" defer></script>
    <?php
}

function rgbj_page_firebase_download_scripts(): void
{
    if (!function_exists('rgbj_download_stats_config')) {
        require_once __DIR__ . '/download-stats-config.php';
    }
    if (!function_exists('rgbj_download_server_logging_enabled')) {
        require_once __DIR__ . '/firestore-download-log.php';
    }
    $cooldown = (int) (rgbj_download_stats_config()['count_cooldown_seconds'] ?? 45);
    $serverLog = rgbj_download_server_logging_enabled();
    ?>
    <script type="module" src="/js/firebase.js"></script>
    <script>
        window.RGBJ_DOWNLOAD_THANKS_URL = <?= json_encode(rgbj_url('thanks/'), JSON_THROW_ON_ERROR) ?>;
        window.RGBJ_DOWNLOAD_LOG_URL = <?= json_encode(rgbj_url('log-download.php'), JSON_THROW_ON_ERROR) ?>;
        window.RGBJ_DOWNLOAD_SERVER_LOG = <?= $serverLog ? 'true' : 'false' ?>;
    </script>
    <script src="<?= rgbj_h(rgbj_url('assets/download-track.js')) ?>" defer></script>
    <script>
        document.getElementById('rgbj-download-root')?.setAttribute('data-rgbj-cooldown', '<?= $cooldown ?>');
    </script>
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
