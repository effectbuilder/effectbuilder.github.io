<?php declare(strict_types=1);

require_once __DIR__ . '/includes/installers.php';
require_once __DIR__ . '/includes/feature-cards.php';
require_once __DIR__ . '/includes/developer-docs.php';

$rgbj_installers = rgbj_discover_installer_pairs(__DIR__);
$rgbj_latest_version = $rgbj_installers[0]['version'] ?? null;

$pageTitle = 'RGBJunkie for Windows | Plan, preview, and light up your setup';
$pageDesc = 'Download RGBJunkie for Windows. Arrange your RGB battlestation on multiple canvases, preview effects, and control supported USB lighting from one polished app.';
?>
<!DOCTYPE html>
<html lang="en" data-bs-theme="dark">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= rgbj_h($pageTitle) ?></title>
    <meta name="description" content="<?= rgbj_h($pageDesc) ?>">

    <meta property="og:url" content="https://rgbjunkie.com/RGBJunkieApp/">
    <meta property="og:type" content="website">
    <meta property="og:title" content="<?= rgbj_h($pageTitle) ?>">
    <meta property="og:description" content="Your desk, your vibe: multiple layout canvases, gorgeous effects, and broad hardware support. Built for gamers and PC enthusiasts.">
    <meta property="og:image" content="https://www.rgbjunkie.com/images/rgbjunkie.png">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:domain" content="rgbjunkie.com">
    <meta name="twitter:url" content="https://rgbjunkie.com/RGBJunkieApp/">
    <meta name="twitter:title" content="<?= rgbj_h($pageTitle) ?>">
    <meta name="twitter:description" content="Your desk, your vibe: multiple layout canvases, gorgeous effects, and broad hardware support.">
    <meta name="twitter:image" content="https://www.rgbjunkie.com/images/rgbjunkie.png">

    <link rel="icon" type="image/x-icon" href="/rgbjunkielogo2.ico">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
    <link rel="stylesheet" href="/styles.css">
    <link rel="stylesheet" href="/styles-alt.css">
    <link rel="stylesheet" href="assets/rgbjunkie-app.css">
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
                    <li><a class="dropdown-item active" href="<?= rgbj_h(rgbj_url()) ?>" aria-current="page">RGBJunkie for Windows</a></li>
                    <li><a class="dropdown-item" href="<?= rgbj_h(rgbj_url('releases/')) ?>">Previous releases</a></li>
                    <li><a class="dropdown-item" href="<?= rgbj_h(rgbj_url('terms/')) ?>">Terms of Service</a></li>
                    <li><a class="dropdown-item" href="<?= rgbj_h(rgbj_url('supported/')) ?>">Supported USB devices &amp; parts</a></li>
                    <li><a class="dropdown-item" href="<?= rgbj_h(rgbj_url('docs/')) ?>">Documentation</a></li>
                </ul>
            </div>

            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#appNav" aria-controls="appNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="appNav">
                <ul class="navbar-nav ms-auto gap-lg-2">
                    <li class="nav-item"><a class="nav-link" href="#features"><i class="bi bi-grid-3x3-gap me-1"></i>Features</a></li>
                    <li class="nav-item"><a class="nav-link" href="#download"><i class="bi bi-download me-1"></i>Download</a></li>
                    <li class="nav-item"><a class="nav-link" href="<?= rgbj_h(rgbj_url('releases/')) ?>"><i class="bi bi-archive me-1"></i>Previous releases</a></li>
                    <li class="nav-item"><a class="nav-link" href="<?= rgbj_h(rgbj_url('supported/')) ?>"><i class="bi bi-plugin me-1"></i>Supported gear</a></li>
                    <li class="nav-item"><a class="nav-link" href="<?= rgbj_h(rgbj_url('docs/')) ?>"><i class="bi bi-journal-code me-1"></i>Documentation</a></li>
                    <li class="nav-item"><a class="nav-link" href="<?= rgbj_h(rgbj_url('terms/')) ?>"><i class="bi bi-file-text me-1"></i>Terms</a></li>
                    <li class="nav-item"><a class="nav-link" href="#requirements"><i class="bi bi-pc-display me-1"></i>Requirements</a></li>
                    <li class="nav-item"><a class="btn btn-primary mt-2 mt-lg-0 ms-lg-2" href="#download"><i class="bi bi-box-arrow-in-down me-1"></i>Download</a></li>
                </ul>
            </div>
        </div>
    </nav>

    <header class="py-5 border-bottom bg-body-tertiary">
        <div class="container">
            <div class="row align-items-center g-4">
                <div class="col-lg-5">
                    <p class="text-info small fw-semibold text-uppercase tracking-wide mb-2">RGBJunkie · Windows desktop app</p>
                    <h1 class="display-5 fw-bold text-body-emphasis mb-3">Light up your battlestation, the easy way!</h1>
                    <p class="lead text-body-secondary mb-4">
                        Plan every strip, keyboard, and accent on a visual desk. Switch between workspace canvases for different zones, preview stunning effects in real time, and push colors to the USB gear you already own, without scripting or juggling five separate apps.
                    </p>
                    <div class="rgbj-hero-badges d-flex flex-wrap mb-4">
                        <?php if ($rgbj_latest_version !== null) : ?>
                        <span class="rgbj-hero-badge rgbj-hero-badge--accent">Latest · v<?= rgbj_h($rgbj_latest_version) ?></span>
                        <?php endif; ?>
                        <span class="rgbj-hero-badge">Multiple layout canvases</span>
                        <span class="rgbj-hero-badge">Wide device support</span>
                        <span class="rgbj-hero-badge">Effect &amp; color profiles</span>
                    </div>
                    <div class="rgbj-hero-cta d-flex flex-wrap gap-2">
                        <a class="btn btn-primary btn-lg" href="#download"><i class="bi bi-download" aria-hidden="true"></i><span>Download for Windows</span></a>
                        <a class="btn btn-outline-secondary btn-lg" href="<?= rgbj_h(rgbj_url('supported/')) ?>"><i class="bi bi-usb-symbol" aria-hidden="true"></i><span>See supported gear</span></a>
                    </div>
                </div>
                <div class="col-lg-7 text-center">
                    <div class="position-relative rounded-3 overflow-hidden w-100 mx-auto" style="max-width: 720px;">
                            <video
                                id="hero-video"
                                class="d-block w-100"
                                style="max-width: 100%; height: auto;"
                                autoplay
                                loop
                                playsinline
                                preload="auto"
                                disablepictureinpicture
                                disableremoteplayback
                                aria-label="RGBJunkie app preview"
                            >
                                <source src="RGBJunkie.mp4" type="video/mp4">
                            </video>
                            <button
                                type="button"
                                id="hero-video-mute"
                                class="btn btn-dark btn-sm border border-secondary position-absolute bottom-0 end-0 m-2 opacity-75"
                                style="--bs-btn-padding-y: 0.25rem; --bs-btn-padding-x: 0.5rem;"
                                aria-label="Mute video"
                                title="Mute"
                            >
                                <i class="bi bi-volume-up-fill" aria-hidden="true"></i>
                            </button>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <main class="flex-grow-1">
        <section id="features" class="py-5">
            <div class="container">
                <h2 class="h3 fw-bold text-body-emphasis mb-2"><i class="bi bi-stars me-2 text-info"></i>Built for gamers &amp; PC enthusiasts</h2>
                <p class="text-body-secondary col-lg-8 mb-4">RGBJunkie keeps the creative fun upfront: drag, preview, save a look, and go play. Whether you are dialing in a stream backdrop or finally syncing the tower, monitor, and desk mat, you stay in control without a manual the size of a textbook.</p>
                <div class="row g-4">
                    <?php foreach (rgbj_feature_cards() as $card): ?>
                    <div class="col-md-6 col-lg-4">
                        <?php rgbj_render_feature_card($card); ?>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </section>

        <section id="developers" class="py-5 bg-body-tertiary border-top border-bottom">
            <div class="container">
                <h2 class="h3 fw-bold text-body-emphasis mb-2"><i class="bi bi-journal-code me-2 text-info"></i>Build plugins &amp; effects</h2>
                <p class="text-body-secondary col-lg-8 mb-4">
                    RGBJunkie is extensible: ship USB device plugins, HTML canvas effects, or functional <code>.mjs</code> effects.
                    Full API guides and links to the browser creative tools are on the <a href="<?= rgbj_h(rgbj_url('docs/')) ?>">documentation page</a>.
                </p>
                <div class="text-center mb-4">
                    <a class="btn btn-outline-info" href="<?= rgbj_h(rgbj_url('docs/')) ?>"><i class="bi bi-journal-code me-1"></i>View all documentation</a>
                </div>
                <?php rgbj_render_developer_doc_teaser(); ?>
            </div>
        </section>

        <section id="download" class="py-5 bg-body-tertiary border-top border-bottom">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-lg-10 col-xl-8">
                        <h2 class="h3 fw-bold text-body-emphasis mb-2 text-center"><i class="bi bi-cloud-download me-2 text-info"></i>Download for Windows</h2>
                        <p class="text-body-secondary text-center mb-4">Pick the installer that fits your PC. Both deliver the same RGBJunkie experience on 64-bit Windows 10 or later. New builds appear here automatically when you add files to the download folders.</p>

                        <?php require __DIR__ . '/includes/download-section.php'; ?>

                        <div class="alert alert-info border-info bg-dark mb-0" role="note">
                            <h3 class="alert-heading h6"><i class="bi bi-shield-check me-2"></i>Windows may ask you to confirm the first time</h3>
                            <p class="small mb-0">New apps sometimes show a SmartScreen notice. Choose “More info,” then “Run anyway” if you trust this download from RGBJunkie. Signed installers reduce these prompts over time.</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <section id="requirements" class="py-5">
            <div class="container">
                <div class="row g-4">
                    <div class="col-lg-6">
                        <h2 class="h4 fw-bold text-body-emphasis mb-3"><i class="bi bi-pc-display-horizontal me-2 text-info"></i>What you need</h2>
                        <ul class="list-group list-group-flush border rounded border-secondary overflow-hidden">
                            <li class="list-group-item bg-body-tertiary text-body-secondary"><strong class="text-body">PC:</strong> Windows 10 or newer, 64-bit.</li>
                            <li class="list-group-item bg-body-tertiary text-body-secondary"><strong class="text-body">Lighting:</strong> USB RGB devices supported by RGBJunkie. See our <a href="<?= rgbj_h(rgbj_url('supported/')) ?>">compatibility list</a>.</li>
                            <li class="list-group-item bg-body-tertiary text-body-secondary"><strong class="text-body">Display:</strong> A comfortable window around 1200×800 or larger for the full workspace.</li>
                        </ul>
                    </div>
                    <div class="col-lg-6">
                        <h2 class="h4 fw-bold text-body-emphasis mb-3"><i class="bi bi-lightning-charge me-2 text-info"></i>Up and running in minutes</h2>
                        <ol class="list-group list-group-numbered list-group-flush border rounded border-secondary overflow-hidden">
                            <li class="list-group-item bg-body-tertiary text-body-secondary d-flex justify-content-between align-items-start">
                                <div class="ms-2 me-auto">
                                    <div class="fw-bold text-body">Download the installer</div>
                                    Use the button above. No account required.
                                </div>
                            </li>
                            <li class="list-group-item bg-body-tertiary text-body-secondary d-flex justify-content-between align-items-start">
                                <div class="ms-2 me-auto">
                                    <div class="fw-bold text-body">Run setup</div>
                                    Accept the defaults unless you need a custom folder.
                                </div>
                            </li>
                            <li class="list-group-item bg-body-tertiary text-body-secondary d-flex justify-content-between align-items-start">
                                <div class="ms-2 me-auto">
                                    <div class="fw-bold text-body">Plug in gear &amp; explore</div>
                                    Launch RGBJunkie, add your devices, and build the desk you have been picturing.
                                </div>
                            </li>
                        </ol>
                    </div>
                </div>
            </div>
        </section>
    </main>

    <?php
    $rgbj_footer_blurb = 'The Windows companion to the free RGBJunkie creative tools in your browser, now with multiple canvases, rich effects, and room-scale control.';
    require __DIR__ . '/includes/page-footer.php';
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

            var heroVideo = document.getElementById('hero-video');
            var heroMuteBtn = document.getElementById('hero-video-mute');
            if (heroVideo && heroMuteBtn) {
                var heroMuteStorageKey = 'rgbjunkie.heroVideoMuted';

                function readHeroMutePreference() {
                    try {
                        var stored = localStorage.getItem(heroMuteStorageKey);
                        if (stored === '1') return true;
                        if (stored === '0') return false;
                    } catch (e) { /* private browsing */ }
                    return null;
                }

                function saveHeroMutePreference(muted) {
                    try {
                        localStorage.setItem(heroMuteStorageKey, muted ? '1' : '0');
                    } catch (e) { /* private browsing */ }
                }

                var syncMuteUi = function () {
                    var muted = heroVideo.muted;
                    heroMuteBtn.setAttribute('aria-label', muted ? 'Unmute video' : 'Mute video');
                    heroMuteBtn.title = muted ? 'Unmute' : 'Mute';
                    heroMuteBtn.innerHTML = muted
                        ? '<i class="bi bi-volume-mute-fill" aria-hidden="true"></i>'
                        : '<i class="bi bi-volume-up-fill" aria-hidden="true"></i>';
                };

                heroMuteBtn.addEventListener('click', function () {
                    heroVideo.muted = !heroVideo.muted;
                    if (!heroVideo.muted) {
                        heroVideo.volume = 1;
                    }
                    saveHeroMutePreference(heroVideo.muted);
                    syncMuteUi();
                });

                heroVideo.volume = 1;
                var savedMuted = readHeroMutePreference();
                if (savedMuted === true) {
                    heroVideo.muted = true;
                    heroVideo.play().catch(function () { /* autoplay policy */ });
                    syncMuteUi();
                } else {
                    heroVideo.muted = false;
                    heroVideo.play().catch(function () {
                        heroVideo.muted = true;
                        heroVideo.play().catch(function () { /* autoplay policy */ });
                        syncMuteUi();
                    });
                    syncMuteUi();
                }
            }
        })();
    </script>
</body>

</html>
