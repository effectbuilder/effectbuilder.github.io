<?php declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/includes/installers.php';
require_once dirname(__DIR__, 2) . '/includes/device-validations.php';
require_once dirname(__DIR__, 2) . '/includes/help-editor-auth.php';

$rgbj_nav_active = 'supported';
$pageTitle = 'Supported device validations | RGBJunkie admin';
$pageDesc = 'Mark USB devices as validated on the supported gear page.';

$devicesJsonUrl = '/api/docs/supported-devices-data.json';
$validationsApiUrl = rgbj_device_validations_api_url();

rgbj_page_head([
    'title' => $pageTitle,
    'description' => $pageDesc,
    'extra_css' => [rgbj_url('assets/supported-devices.css')],
]);
rgbj_page_analytics();
rgbj_render_page_nav();
rgbj_subpage_open([
    ['label' => 'RGBJunkie for Windows', 'href' => rgbj_url()],
    ['label' => 'Supported gear', 'href' => rgbj_url('supported/')],
    ['label' => 'Validation admin'],
], 'col-12 rgbj-supported-page rgbj-supported-admin-page');
?>

<div id="rgbj-sd-admin-loading" class="text-center py-5">
    <div class="spinner-border text-info" role="status"><span class="visually-hidden">Loading…</span></div>
    <p class="text-body-secondary mt-3 mb-0">Checking sign-in…</p>
</div>

<div id="rgbj-sd-admin-denied" class="d-none">
    <div class="alert alert-danger border-danger">
        <h1 class="h4 alert-heading"><i class="bi bi-shield-lock me-2"></i>Admin sign-in required</h1>
        <p class="mb-3">Sign in with the site administrator Google account to mark supported devices as validated or experimental.</p>
        <button type="button" class="btn btn-success" id="rgbj-sd-admin-login"><i class="bi bi-google me-2"></i>Sign in with Google</button>
    </div>
</div>

<div id="rgbj-sd-admin-app" class="d-none">
    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
        <div>
            <h1 class="h3 fw-bold text-body-emphasis mb-1"><i class="bi bi-patch-check me-2 text-info"></i>Supported device validations</h1>
            <p class="text-body-secondary small mb-0">Mark devices you have tested as <strong>Validated</strong> (confirmed working) or <strong>Experimental</strong> (early support — may need extra setup). Marked gear appears on the public <strong>Validated</strong> and <strong>Experimental</strong> tabs at <a href="<?= rgbj_h(rgbj_url('supported/')) ?>">Supported gear</a>.</p>
        </div>
        <div class="d-flex flex-wrap align-items-center gap-2">
            <a class="btn btn-outline-secondary btn-sm" href="<?= rgbj_h(rgbj_url('supported/')) ?>"><i class="bi bi-box-arrow-up-right me-1"></i>View public page</a>
            <button type="button" class="btn btn-outline-secondary btn-sm" id="rgbj-sd-admin-logout"><i class="bi bi-box-arrow-right me-1"></i>Sign out</button>
        </div>
    </div>

    <div class="card border-secondary shadow-sm mb-3">
        <div class="card-body">
            <div class="row g-3 align-items-end">
                <div class="col-12 col-lg-5">
                    <label for="rgbj-sd-admin-search" class="form-label small fw-semibold text-body-secondary mb-1">Search</label>
                    <input id="rgbj-sd-admin-search" type="search" class="form-control" placeholder="Search by name, brand, or USB IDs…" autocomplete="off">
                </div>
                <div class="col-12 col-md-6 col-lg-3">
                    <label for="rgbj-sd-admin-filter" class="form-label small fw-semibold text-body-secondary mb-1">Show</label>
                    <select id="rgbj-sd-admin-filter" class="form-select">
                        <option value="all">All devices</option>
                        <option value="validated">Validated only</option>
                        <option value="experimental">Experimental only</option>
                        <option value="unmarked">Not marked yet</option>
                    </select>
                </div>
                <div class="col-12 col-lg-4">
                    <p id="rgbj-sd-admin-count" class="mb-0 small text-body-secondary"></p>
                </div>
            </div>
        </div>
    </div>

    <p id="rgbj-sd-admin-status" class="small text-body-secondary mb-2" role="status" aria-live="polite"></p>
    <p id="rgbj-sd-admin-err" class="alert alert-warning d-none mb-3" role="alert"></p>

    <div id="rgbj-sd-admin-list" class="sd-admin-device-list"></div>
</div>

<script>
    window.RGBJ_SUPPORTED_VALIDATIONS_ADMIN = {
        adminUid: <?= json_encode(rgbj_help_editor_admin_uid(), JSON_THROW_ON_ERROR) ?>,
        apiUrl: <?= json_encode($validationsApiUrl, JSON_THROW_ON_ERROR) ?>,
        devicesJsonUrl: <?= json_encode($devicesJsonUrl, JSON_THROW_ON_ERROR) ?>,
        supportedPageUrl: <?= json_encode(rgbj_url('supported/'), JSON_THROW_ON_ERROR) ?>
    };
</script>

<?php
rgbj_subpage_close();
$rgbj_footer_blurb = 'Admin tool for marking validated USB devices (sign-in required).';
require dirname(__DIR__, 2) . '/includes/page-footer.php';
?>
<script type="module" src="<?= rgbj_h(rgbj_url('assets/supported-validations-admin.js?v=' . (string) @filemtime(dirname(__DIR__, 2) . '/assets/supported-validations-admin.js'))) ?>"></script>
<?php rgbj_page_scripts_end(); ?>
