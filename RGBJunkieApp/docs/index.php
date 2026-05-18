<?php declare(strict_types=1);

require_once dirname(__DIR__) . '/includes/installers.php';
require_once dirname(__DIR__) . '/includes/developer-docs.php';

$rgbj_nav_active = 'docs';

$pageTitle = 'Documentation | RGBJunkie for Windows';
$pageDesc = 'Developer guides for RGBJunkie plugins, effects, and APIs, plus links to browser creative tools.';
?>
<!DOCTYPE html>
<html lang="en" data-bs-theme="dark">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= rgbj_h($pageTitle) ?></title>
    <meta name="description" content="<?= rgbj_h($pageDesc) ?>">

    <link rel="icon" type="image/x-icon" href="/rgbjunkielogo2.ico">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="/styles.css">
    <link rel="stylesheet" href="/styles-alt.css">
    <link rel="stylesheet" href="../assets/rgbjunkie-app.css">
</head>

<script async src="https://www.googletagmanager.com/gtag/js?id=G-WS7MGSDJSB"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag() { dataLayer.push(arguments); }
    gtag('js', new Date());
    gtag('config', 'G-WS7MGSDJSB');
</script>

<body class="d-flex flex-column min-vh-100">
    <nav class="navbar navbar-expand-lg bg-body-tertiary border-bottom" style="overflow: visible;">
        <div class="container-fluid" style="overflow: visible;">
            <div class="dropdown me-3" style="position: relative; display: inline-block;">
                <a class="navbar-brand d-flex align-items-center me-0 brand-dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false" style="cursor: pointer; margin: 0; padding: 0.25rem 0.5rem;">
                    <img src="/images/rgbjunkielogo.png" alt="RGBJunkie" class="me-2" style="height: 1.5em;">
                    <span>RGBJunkie</span>
                    <i class="bi bi-chevron-down ms-2 dropdown-indicator"></i>
                </a>
                <ul class="dropdown-menu dropdown-menu-start shadow mt-2" style="min-width: 280px;">
                    <li><a class="dropdown-item" href="/">RGBJunkie Effect Builder</a></li>
                    <li><a class="dropdown-item" href="/builder/">RGBJunkie Component Builder</a></li>
                    <li><a class="dropdown-item" href="/combiner/">RGBJunkie Effect Combiner</a></li>
                    <li><a class="dropdown-item" href="/skydimo/">Skydimo LUA Builder</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="<?= rgbj_h(rgbj_url()) ?>">RGBJunkie for Windows</a></li>
                    <li><a class="dropdown-item" href="<?= rgbj_h(rgbj_url('releases/')) ?>">Previous releases</a></li>
                    <li><a class="dropdown-item" href="<?= rgbj_h(rgbj_url('terms/')) ?>">Terms of Service</a></li>
                    <li><a class="dropdown-item" href="<?= rgbj_h(rgbj_url('supported/')) ?>">Supported USB devices &amp; parts</a></li>
                    <li><a class="dropdown-item active" href="<?= rgbj_h(rgbj_url('docs/')) ?>" aria-current="page">Documentation</a></li>
                </ul>
            </div>

            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#appNav" aria-controls="appNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="appNav">
                <ul class="navbar-nav ms-auto gap-lg-2">
                    <li class="nav-item"><a class="nav-link" href="<?= rgbj_h(rgbj_url('#features')) ?>">Features</a></li>
                    <li class="nav-item"><a class="nav-link" href="<?= rgbj_h(rgbj_url('#download')) ?>">Download</a></li>
                    <li class="nav-item"><a class="nav-link" href="<?= rgbj_h(rgbj_url('releases/')) ?>">Previous releases</a></li>
                    <li class="nav-item"><a class="nav-link" href="<?= rgbj_h(rgbj_url('supported/')) ?>">Supported gear</a></li>
                    <li class="nav-item"><a class="nav-link active" href="<?= rgbj_h(rgbj_url('docs/')) ?>" aria-current="page">Documentation</a></li>
                    <li class="nav-item"><a class="nav-link" href="<?= rgbj_h(rgbj_url('terms/')) ?>">Terms</a></li>
                    <li class="nav-item"><a class="btn btn-primary mt-2 mt-lg-0 ms-lg-2" href="<?= rgbj_h(rgbj_url('#download')) ?>"><i class="bi bi-box-arrow-in-down me-1"></i>Download</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <main class="flex-grow-1 py-4">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-lg-10 col-xl-9">
                    <nav aria-label="breadcrumb" class="mb-3">
                        <ol class="breadcrumb mb-0">
                            <li class="breadcrumb-item"><a href="<?= rgbj_h(rgbj_url()) ?>">RGBJunkie for Windows</a></li>
                            <li class="breadcrumb-item active" aria-current="page">Documentation</li>
                        </ol>
                    </nav>

                    <h1 class="h2 fw-bold text-body-emphasis mb-2"><i class="bi bi-journal-code me-2 text-info"></i>Documentation</h1>
                    <p class="text-body-secondary mb-4">
                        Extend RGBJunkie with custom plugins and effects, or use the free browser tools to prototype before you install the Windows app.
                        End-user hardware lists live on the <a href="<?= rgbj_h(rgbj_url('supported/')) ?>">supported gear</a> page; the API reference below is aimed at authors.
                    </p>

                    <?php rgbj_render_developer_doc_sections(); ?>
                </div>
            </div>
        </div>
    </main>

    <?php
    $rgbj_footer_blurb = 'Guides for plugin authors, effect builders, and anyone extending RGBJunkie for Windows.';
    require dirname(__DIR__) . '/includes/page-footer.php';
    ?>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>

</html>
