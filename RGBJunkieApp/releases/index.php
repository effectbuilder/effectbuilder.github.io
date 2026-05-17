<?php declare(strict_types=1);

require_once dirname(__DIR__) . '/includes/installers.php';

$rgbj_installers = rgbj_discover_installer_pairs(rgbj_app_root());
$rgbj_nav_active = 'releases';
$rgbj_latest_version = $rgbj_installers[0]['version'] ?? null;
$rgbj_release_rows = array_slice($rgbj_installers, 1);

$pageTitle = 'Previous releases | RGBJunkie for Windows';
$pageDesc = 'Download older RGBJunkie for Windows builds: setup and MSI pairs for 64-bit Windows 10 or later.';
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
                    <li><a class="dropdown-item active" href="<?= rgbj_h(rgbj_url('releases/')) ?>" aria-current="page">Previous releases</a></li>
                    <li><a class="dropdown-item" href="<?= rgbj_h(rgbj_url('terms/')) ?>">Terms of Service</a></li>
                    <li><a class="dropdown-item" href="<?= rgbj_h(rgbj_url('supported/')) ?>">Supported USB devices &amp; parts</a></li>
                </ul>
            </div>

            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#appNav" aria-controls="appNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="appNav">
                <ul class="navbar-nav ms-auto gap-lg-2">
                    <li class="nav-item"><a class="nav-link" href="<?= rgbj_h(rgbj_url('#features')) ?>">Features</a></li>
                    <li class="nav-item"><a class="nav-link" href="<?= rgbj_h(rgbj_url('#download')) ?>">Download</a></li>
                    <li class="nav-item"><a class="nav-link active" href="<?= rgbj_h(rgbj_url('releases/')) ?>" aria-current="page">Previous releases</a></li>
                    <li class="nav-item"><a class="nav-link" href="<?= rgbj_h(rgbj_url('supported/')) ?>">Supported gear</a></li>
                    <li class="nav-item"><a class="nav-link" href="<?= rgbj_h(rgbj_url('terms/')) ?>">Terms</a></li>
                    <li class="nav-item"><a class="btn btn-primary mt-2 mt-lg-0 ms-lg-2" href="<?= rgbj_h(rgbj_url('#download')) ?>"><i class="bi bi-box-arrow-in-down me-1"></i>Latest download</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <main class="flex-grow-1 py-4">
        <div class="container">
            <div class="row justify-content-center">
                <div class="col-lg-10 col-xl-8">
                    <nav aria-label="breadcrumb" class="mb-3">
                        <ol class="breadcrumb mb-0">
                            <li class="breadcrumb-item"><a href="<?= rgbj_h(rgbj_url()) ?>">RGBJunkie for Windows</a></li>
                            <li class="breadcrumb-item active" aria-current="page">Previous releases</li>
                        </ol>
                    </nav>

                    <h1 class="h2 fw-bold text-body-emphasis mb-2"><i class="bi bi-archive me-2 text-info"></i>Previous releases</h1>
                    <p class="text-body-secondary mb-4">
                        Older installers stay available if you need to match a prior version on your PC.
                        <?php if ($rgbj_latest_version !== null) : ?>
                        For the newest experience, use <a href="<?= rgbj_h(rgbj_url('#download')) ?>">v<?= rgbj_h($rgbj_latest_version) ?></a> on the main download page.
                        <?php endif; ?>
                    </p>

                    <?php require dirname(__DIR__) . '/includes/previous-releases-section.php'; ?>
                </div>
            </div>
        </div>
    </main>

    <?php
    $rgbj_footer_extra_link = '<a href="' . rgbj_h(rgbj_url('#download')) . '">Latest download</a>';
    require dirname(__DIR__) . '/includes/page-footer.php';
    ?>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        (function () {
            var base = window.location.href.replace(/[^/]*$/, '');
            document.querySelectorAll('input[data-base-path]').forEach(function (el) {
                el.value = base + el.dataset.basePath;
            });
            document.querySelectorAll('[data-copy-target]').forEach(function (btn) {
                btn.addEventListener('click', function () {
                    var tid = btn.getAttribute('data-copy-target');
                    var inp = document.getElementById(tid);
                    if (!inp || !inp.value) return;
                    navigator.clipboard.writeText(inp.value).then(function () {
                        var prev = btn.innerHTML;
                        btn.innerHTML = '<i class="bi bi-check2"></i>';
                        btn.classList.add('btn-success');
                        btn.classList.remove('btn-outline-secondary');
                        setTimeout(function () {
                            btn.innerHTML = prev;
                            btn.classList.remove('btn-success');
                            btn.classList.add('btn-outline-secondary');
                        }, 1500);
                    });
                });
            });
        })();
    </script>
</body>

</html>
