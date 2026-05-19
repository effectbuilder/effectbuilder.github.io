<?php declare(strict_types=1);

require_once __DIR__ . '/includes/installers.php';
require_once __DIR__ . '/includes/feature-cards.php';
require_once __DIR__ . '/includes/developer-docs.php';

$rgbj_nav_active = 'home';
$rgbj_releases = rgbj_discover_releases(__DIR__);
$rgbj_latest_release = rgbj_latest_release_for_download(__DIR__);
$rgbj_older_releases = array_slice($rgbj_releases, 1);
$rgbj_latest_version = $rgbj_latest_release['version'] ?? null;

$pageTitle = 'RGBJunkie | Plan, preview, and light up your setup';
$pageDesc = 'Download RGBJunkie for Windows and Linux. Arrange your RGB battlestation on multiple canvases, preview effects, and control supported USB lighting from one polished desktop app.';

rgbj_page_head(['title' => $pageTitle, 'description' => $pageDesc, 'og' => true]);
rgbj_page_analytics();
rgbj_render_page_nav();

?>

    <header class="py-5 border-bottom bg-body-tertiary rgbj-subpage-glow">
        <div class="container">
            <div class="row align-items-center g-4">
                <div class="col-lg-5">
                    <img
                        src="/images/rgbjunkie.png"
                        alt="RGBJunkie"
                        class="rgbj-hero-logo mb-3"
                        width="260"
                        height="auto"
                    >
                    <p class="text-info small fw-semibold text-uppercase tracking-wide mb-2">Windows &amp; Linux desktop app</p>
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
                        <span class="rgbj-hero-badge">Windows &amp; Linux</span>
                    </div>
                    <div class="rgbj-hero-cta d-flex flex-wrap gap-2">
                        <a class="btn btn-primary btn-lg" href="#download"><i class="bi bi-download" aria-hidden="true"></i><span>Download</span></a>
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
                        <h2 class="h3 fw-bold text-body-emphasis mb-4 text-center"><i class="bi bi-cloud-download me-2 text-info"></i>Download</h2>

                        <?php require __DIR__ . '/includes/download-section.php'; ?>

                        <p class="small text-body-secondary text-center mt-3 mb-0" data-rgbj-download-tip="windows">On Windows, SmartScreen may ask you to confirm the first run — choose “More info,” then “Run anyway” if you trust this download.</p>
                        <p class="small text-body-secondary text-center mt-3 mb-0 d-none" data-rgbj-download-tip="linux">On Linux, install the package with your distro’s tools, or mark the AppImage executable before running it.</p>
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
                            <li class="list-group-item bg-body-tertiary text-body-secondary"><strong class="text-body">Windows:</strong> Windows 10 or newer, 64-bit.</li>
                            <li class="list-group-item bg-body-tertiary text-body-secondary"><strong class="text-body">Linux:</strong> Recent 64-bit distro — install the .deb or .rpm, or use the AppImage.</li>
                            <li class="list-group-item bg-body-tertiary text-body-secondary"><strong class="text-body">Lighting:</strong> USB RGB devices supported by RGBJunkie. See our <a href="<?= rgbj_h(rgbj_url('supported/')) ?>">compatibility list</a>.</li>
                            <li class="list-group-item bg-body-tertiary text-body-secondary"><strong class="text-body">Display:</strong> A comfortable window around 1200×800 or larger for the full workspace.</li>
                        </ul>
                    </div>
                    <div class="col-lg-6">
                        <h2 class="h4 fw-bold text-body-emphasis mb-3"><i class="bi bi-lightning-charge me-2 text-info"></i>Up and running in minutes</h2>
                        <ol class="list-group list-group-numbered list-group-flush border rounded border-secondary overflow-hidden">
                            <li class="list-group-item bg-body-tertiary text-body-secondary d-flex justify-content-between align-items-start">
                                <div class="ms-2 me-auto">
                                    <div class="fw-bold text-body">Download for your OS</div>
                                    Choose Windows or Linux from the section above. No account required.
                                </div>
                            </li>
                            <li class="list-group-item bg-body-tertiary text-body-secondary d-flex justify-content-between align-items-start">
                                <div class="ms-2 me-auto">
                                    <div class="fw-bold text-body">Install or unpack</div>
                                    Run the Windows installer, unzip the portable build, or install the Linux package you prefer.
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
    $rgbj_footer_blurb = 'The Windows and Linux companion to the free RGBJunkie creative tools in your browser — multiple canvases, rich effects, and room-scale control.';
    require __DIR__ . '/includes/page-footer.php';
    ?>
    <?php require __DIR__ . '/includes/download-share-scripts.php'; ?>
    <script src="<?= rgbj_h(rgbj_url('assets/download-platform.js')) ?>" defer></script>
    <script>
        (function () {
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
<?php rgbj_page_scripts_end(); ?>
