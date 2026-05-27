<?php declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/includes/download-tracker.php';

$statsCfg = rgbj_download_stats_config();
$rgbj_server_download_log = rgbj_download_server_logging_enabled();
$rgbj_nav_active = '';
$pageTitle = 'Download stats | RGBJunkie';

rgbj_page_head(['title' => $pageTitle, 'description' => 'RGBJunkie download statistics', 'app_css' => true]);
rgbj_page_analytics();
rgbj_render_page_nav();
rgbj_subpage_open([
    ['label' => 'RGBJunkie', 'href' => rgbj_url()],
    ['label' => 'Download stats'],
]);
?>

<h1 class="h2 fw-bold text-body-emphasis mb-2"><i class="bi bi-bar-chart me-2 text-info"></i>Download stats</h1>
<p class="text-body-secondary mb-3">
    Firestore collection <code><?= rgbj_h(RGBJ_FIRESTORE_DOWNLOADS_COLLECTION) ?></code>
    · project <code>effect-builder</code> (same as <code>/js/firebase.js</code>).
    Every tracked download is logged separately. With a service account configured, events include <strong>IP address</strong>, country/region/city, and ISP (via <code>download.php</code>).
</p>
<?php if (!$rgbj_server_download_log) : ?>
<div class="alert alert-warning small mb-3" role="alert">
    <strong>IP / location logging is off.</strong>
    Browser-only events do not include IP addresses. Add a Firebase service account JSON and set
    <code>firebase_service_account_json</code> in <code>includes/download-stats-secret.php</code>
    (see <code>download-stats-secret.php.example</code>). The file
    <code>includes/rgbjunkie-download-logger.json</code> must exist and be readable by PHP.
</div>
<?php endif; ?>
<p class="small text-body-secondary mb-3">
    If you see a permission error after sign-in, add the <code>rgbjunkie-app-downloads</code> rules from
    <code>firestore.rules.example</code> in the
    <a href="https://console.firebase.google.com/project/effect-builder/firestore/rules" target="_blank" rel="noopener">Firebase Console</a>
    (merge into existing rules, do not replace the whole file).
</p>

<div id="rgbj-stats-signin-panel" class="mb-4">
    <p class="small text-body-secondary mb-2">Sign in with your admin Google account to read stats from Firestore (same login as Effect Builder admin).</p>
    <div class="d-flex flex-wrap gap-2">
        <button type="button" class="btn btn-primary" id="rgbj-stats-signin"><i class="bi bi-google me-2"></i>Sign in with Google</button>
        <button type="button" class="btn btn-outline-secondary d-none" id="rgbj-stats-signout"><i class="bi bi-box-arrow-right me-2"></i>Sign out</button>
    </div>
</div>

<div id="rgbj-stats-status" class="alert alert-info small" hidden></div>
<div id="rgbj-stats-loading" class="text-body-secondary small py-4">Waiting for sign-in…</div>

<div id="rgbj-stats-content" hidden>
    <div class="row g-3 mb-4">
        <div class="col-md-4">
            <div class="card border-secondary h-100">
                <div class="card-body">
                    <p class="small text-body-secondary mb-1">All time</p>
                    <p class="h3 fw-bold mb-0" id="rgbj-stat-all-time">0</p>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card border-secondary h-100">
                <div class="card-body">
                    <p class="small text-body-secondary mb-1">Last 7 days</p>
                    <p class="h3 fw-bold mb-0" id="rgbj-stat-7d">0</p>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card border-secondary h-100">
                <div class="card-body">
                    <p class="small text-body-secondary mb-1">Last 30 days</p>
                    <p class="h3 fw-bold mb-0" id="rgbj-stat-30d">0</p>
                </div>
            </div>
        </div>
    </div>

    <h2 class="h5 fw-semibold mb-3">Downloads per file</h2>
    <div class="table-responsive mb-4">
        <table class="table table-sm table-dark table-striped align-middle mb-0 rgbj-stats-sortable" data-stats-table="file" data-default-sort="version" data-default-dir="desc">
            <thead>
                <tr>
                    <th scope="col" data-sort="file_name" data-sort-type="string">File</th>
                    <th scope="col" data-sort="kind" data-sort-type="string">Kind</th>
                    <th scope="col" data-sort="channel" data-sort-type="string">Channel</th>
                    <th scope="col" data-sort="version" data-sort-type="version">Version</th>
                    <th scope="col" class="text-end" data-sort="downloads" data-sort-type="number">Downloads (30d)</th>
                </tr>
            </thead>
            <tbody id="rgbj-stats-by-file"></tbody>
        </table>
    </div>

    <h2 class="h5 fw-semibold mb-3">By country (30d)</h2>
    <div class="table-responsive mb-4">
        <table class="table table-sm table-dark table-striped align-middle mb-0 rgbj-stats-sortable" data-stats-table="country" data-default-sort="downloads" data-default-dir="desc">
            <thead>
                <tr>
                    <th scope="col" data-sort="country" data-sort-type="string">Country</th>
                    <th scope="col" class="text-end" data-sort="downloads" data-sort-type="number">Downloads</th>
                </tr>
            </thead>
            <tbody id="rgbj-stats-by-country"></tbody>
        </table>
    </div>

    <div class="row g-4">
        <div class="col-lg-5">
            <h2 class="h5 fw-semibold mb-3">By day (30d)</h2>
            <div class="table-responsive">
                <table class="table table-sm table-dark table-striped align-middle mb-0 rgbj-stats-sortable" data-stats-table="day" data-default-sort="day" data-default-dir="desc">
                    <thead>
                        <tr>
                            <th scope="col" data-sort="day" data-sort-type="string">Day</th>
                            <th scope="col" class="text-end" data-sort="downloads" data-sort-type="number">Downloads</th>
                        </tr>
                    </thead>
                    <tbody id="rgbj-stats-by-day"></tbody>
                </table>
            </div>
        </div>
        <div class="col-lg-7">
            <h2 class="h5 fw-semibold mb-3">Recent downloads</h2>
            <p class="small text-body-secondary mb-2">IP and location appear when events are logged server-side (<code>download.php</code> + service account).</p>
            <div class="table-responsive">
                <table class="table table-sm table-dark table-striped align-middle mb-0 rgbj-stats-sortable" data-stats-table="recent" data-default-sort="created_at_ts" data-default-dir="desc">
                    <thead>
                        <tr>
                            <th scope="col" data-sort="created_at_ts" data-sort-type="number">When</th>
                            <th scope="col" data-sort="file_name" data-sort-type="string">File</th>
                            <th scope="col" data-sort="ip" data-sort-type="string">IP</th>
                            <th scope="col" data-sort="location" data-sort-type="string">Location</th>
                        </tr>
                    </thead>
                    <tbody id="rgbj-stats-recent"></tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<script>
window.RGBJ_DOWNLOAD_STATS = {
    adminUid: <?= json_encode((string) $statsCfg['admin_uid'], JSON_THROW_ON_ERROR) ?>,
    days: 30,
    collection: <?= json_encode(RGBJ_FIRESTORE_DOWNLOADS_COLLECTION, JSON_THROW_ON_ERROR) ?>
};
window.RGBJ_FIREBASE_MODULE = '/js/firebase.js';
</script>
<script src="<?= rgbj_h(rgbj_url('assets/download-stats.js')) ?>" defer></script>

<?php
rgbj_subpage_close();
require dirname(__DIR__, 2) . '/includes/page-footer.php';
rgbj_page_scripts_end();
