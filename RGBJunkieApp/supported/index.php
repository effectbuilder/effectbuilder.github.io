<?php declare(strict_types=1);

require_once dirname(__DIR__) . '/includes/installers.php';

$rgbj_nav_active = 'supported';

$pageTitle = 'Supported USB devices & layout parts | RGBJunkie for Windows';
$pageDesc = 'Search RGBJunkie supported USB lighting devices by brand, type, and USB IDs. Browse layout components for the virtual desk.';

$devicesJsonUrl = '/api/docs/supported-devices-data.json';
$gearJsonUrl = rgbj_url('_supported-data.json');
$amazonLogoUrl = rgbj_url('images/amazon-wordmark-on-dark.svg');

rgbj_page_head([
    'title' => $pageTitle,
    'description' => $pageDesc,
    'extra_css' => [rgbj_url('assets/supported-devices.css')],
]);
rgbj_page_analytics();
rgbj_render_page_nav();
rgbj_subpage_open([
    ['label' => 'RGBJunkie for Windows', 'href' => rgbj_url()],
    ['label' => 'Supported gear'],
], 'col-12 rgbj-supported-page');
?>

<h1 class="h2 fw-bold text-body-emphasis mb-2"><i class="bi bi-plugin me-2 text-info"></i>Supported USB devices &amp; layout parts</h1>
<p class="text-body-secondary mb-2">
    See hardware RGBJunkie can light up and control. Use <strong class="text-body">Search</strong> to find a product by name or maker,
    or narrow the list with <strong class="text-body">Brand</strong> and <strong class="text-body">Device type</strong>.
    If you have USB vendor and product numbers from Windows, paste those into Search as well.
</p>
<p class="small text-body-secondary mb-2" id="meta-updated"></p>
<p class="small text-body-secondary mb-4">Some links on this page go to Amazon. As an Amazon Associate, I earn from qualifying purchases. Links open US search results in a new tab.</p>

<div
    id="supported-devices-root"
    data-devices-json="<?= rgbj_h($devicesJsonUrl) ?>"
    data-amazon-logo="<?= rgbj_h($amazonLogoUrl) ?>"
>
    <div class="card border-secondary shadow-sm mb-4 rgbj-sd-filters">
        <div class="card-body">
            <div class="row g-3 align-items-end">
                <div class="col-12 col-lg-4">
                    <label for="sd-search" class="form-label small fw-semibold text-body-secondary mb-1">Search</label>
                    <input id="sd-search" type="search" class="form-control" placeholder="Search by name, maker, or USB numbers…" autocomplete="off">
                </div>
                <div class="col-12 col-md-6 col-lg-3">
                    <label for="sd-brand" class="form-label small fw-semibold text-body-secondary mb-1">Brand</label>
                    <select id="sd-brand" class="form-select">
                        <option value="">All brands</option>
                    </select>
                </div>
                <div class="col-12 col-md-6 col-lg-3">
                    <label for="sd-kind" class="form-label small fw-semibold text-body-secondary mb-1">Device type</label>
                    <select id="sd-kind" class="form-select">
                        <option value="">All types</option>
                    </select>
                </div>
                <div class="col-12 col-lg-2">
                    <p id="sd-count" class="mb-0 small text-body-secondary"></p>
                </div>
            </div>
        </div>
    </div>

    <p id="sd-err" class="alert alert-warning d-none" role="alert"></p>

    <div id="sd-permalink-banner" class="alert alert-info border-info d-none mb-3 py-2 px-3" role="status" aria-live="polite">
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-2">
            <span id="sd-permalink-banner-text" class="me-2"></span>
            <button type="button" class="btn btn-sm btn-outline-secondary flex-shrink-0 d-none" id="sd-permalink-clear">
                Browse all devices
            </button>
        </div>
    </div>

    <div class="sd-device-panel mb-5" role="region" aria-label="Supported USB devices">
        <div id="sd-list" class="sd-device-grid"></div>
    </div>
</div>

<hr class="my-5 border-secondary">

<h2 class="h4 fw-bold text-body-emphasis mb-2"><i class="bi bi-grid-1x2 me-2 text-info"></i>Layout components</h2>
<p class="text-body-secondary mb-3">
    Parts you drag onto the virtual desk in RGBJunkie for Windows — fans, strips, cases, and other on-screen layout pieces bundled with the app.
    Custom entries you add yourself are not listed here.
</p>

<div id="gear-components-root" data-gear-json="<?= rgbj_h($gearJsonUrl) ?>" data-amazon-logo="<?= rgbj_h($amazonLogoUrl) ?>">
    <div class="card border-secondary shadow-sm mb-3">
        <div class="card-body">
            <label for="gear-search" class="form-label fw-semibold mb-2"><i class="bi bi-search me-2"></i>Filter components</label>
            <input type="search" class="form-control" id="gear-search" placeholder="Filter by brand or product name…" autocomplete="off">
        </div>
    </div>
    <p class="small text-body-secondary mb-2">
        <span class="badge bg-secondary" id="badge-components">—</span> layout components
    </p>
    <div id="components-mount" class="text-body-secondary">Loading layout components…</div>
</div>

<p class="small text-body-secondary mt-4 mb-0">
    Lists are refreshed when the app bundle is updated. If something is missing, your device may still work after a future update, or it may use a profile you added under Custom.
</p>

<?php
rgbj_subpage_close();
$rgbj_footer_blurb = 'USB devices and layout parts that ship with RGBJunkie for Windows today.';
require dirname(__DIR__) . '/includes/page-footer.php';
?>

<script src="<?= rgbj_h(rgbj_url('supported/supported-devices.js')) ?>" defer></script>
<script src="<?= rgbj_h(rgbj_url('supported/gear-components.js')) ?>" defer></script>
<?php rgbj_page_scripts_end(); ?>
