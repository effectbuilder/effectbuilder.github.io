<?php declare(strict_types=1);

require_once __DIR__ . '/includes/home-hub.php';

rgbj_redirect_legacy_effect_builder_if_needed();

$pageTitle = 'RGBJunkie | Tools for PC lighting enthusiasts';
$pageDesc = 'RGBJunkie browser tools and the desktop app for planning, previewing, and lighting up your battlestation.';
$products = rgbj_hub_products();
?>
<!DOCTYPE html>
<html lang="en" data-bs-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?></title>
    <meta name="description" content="<?= htmlspecialchars($pageDesc, ENT_QUOTES, 'UTF-8') ?>">

    <meta property="og:url" content="https://rgbjunkie.com/">
    <meta property="og:type" content="website">
    <meta property="og:title" content="<?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?>">
    <meta property="og:description" content="Plan your desk, design effects in the browser, and drive supported USB lighting from one RGB-first toolkit built for gamers and PC enthusiasts.">
    <meta property="og:image" content="https://www.rgbjunkie.com/images/rgbjunkie.png">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:domain" content="rgbjunkie.com">
    <meta name="twitter:url" content="https://rgbjunkie.com/">
    <meta name="twitter:title" content="<?= htmlspecialchars($pageTitle, ENT_QUOTES, 'UTF-8') ?>">
    <meta name="twitter:description" content="Browser creative tools and the RGBJunkie desktop app for your battlestation.">
    <meta name="twitter:image" content="https://www.rgbjunkie.com/images/rgbjunkie.png">

    <link rel="icon" type="image/x-icon" href="/rgbjunkielogo2.ico">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="/styles.css">
    <link rel="stylesheet" href="/styles-alt.css">
    <link rel="stylesheet" href="/assets/rgbjunkie-home.css">
</head>
<script async src="https://www.googletagmanager.com/gtag/js?id=G-WS7MGSDJSB"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'G-WS7MGSDJSB');
</script>
<body class="d-flex flex-column min-vh-100 rgbj-hub-page">
<?php rgbj_render_hub_nav(); ?>

<main class="rgbj-hub-main flex-grow-1 d-flex flex-column">
    <div class="rgbj-hub-stage container-fluid px-3 px-lg-4">
        <header class="rgbj-hub-intro text-center mx-auto">
            <img src="/images/rgbjunkie.png" alt="RGBJunkie" class="rgbj-hub-intro__mark mb-3" width="152" height="152">
            <p class="text-info small fw-semibold text-uppercase mb-1">Built for gamers &amp; RGB enthusiasts</p>
            <h1 class="rgbj-hub-intro__title fw-bold text-body-emphasis mb-2">Pick your tool</h1>
            <p class="rgbj-hub-intro__lead text-body-secondary mb-0">
                Desktop app and free browser builders — everything you need to plan, design, and light up your battlestation.
            </p>
        </header>

        <div class="rgbj-hub-hint-slot rgbj-hub-hint-slot--inline">
            <?php rgbj_render_effect_builder_hint('inline'); ?>
        </div>

        <div class="rgbj-hub-showcase" role="list" style="--hub-product-count: <?= (int) count($products) ?>">
            <?php foreach ($products as $product) {
                rgbj_render_hub_product_card($product);
            } ?>
        </div>

        <p class="rgbj-hub-community text-center text-body-secondary small mb-0">
            Browse the <a href="/gallery/">community gallery</a> or <a href="/showcase/">effect showcase</a> for inspiration.
        </p>
    </div>
</main>

<?php rgbj_render_hub_footer(); ?>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script src="/assets/rgbjunkie-home.js"></script>
</body>
</html>
