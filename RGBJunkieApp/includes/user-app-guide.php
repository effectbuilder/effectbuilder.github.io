<?php declare(strict_types=1);

/**
 * End-user guide for RGBJunkie for Windows (marketing site).
 * Mirrors Settings → Help; full detail lives in the desktop app.
 */
function rgbj_render_user_app_guide(): void
{
    ?>
    <section class="mb-5" id="using-the-app">
        <h2 class="h4 fw-bold text-body-emphasis mb-2"><i class="bi bi-window-sidebar me-2 text-info"></i>Using RGBJunkie for Windows</h2>
        <p class="text-body-secondary col-lg-10 mb-4">
            Quick reference for the desktop app. Browse the <a href="<?= rgbj_h(rgbj_url('help/')) ?>">Help Center</a> for step-by-step guides, or open <strong>Settings → Help</strong> (or the toolbar <strong>Help</strong> button) inside RGBJunkie for the full guide in your language, including keyboard shortcuts and troubleshooting.
        </p>

        <div class="row g-4">
            <div class="col-lg-6">
                <div class="card h-100 border-secondary shadow-sm">
                    <div class="card-body">
                        <h3 class="h6 card-title text-body-emphasis"><i class="bi bi-bookmark-star me-2 text-info"></i>Scene profiles</h3>
                        <p class="card-text text-body-secondary small mb-0">
                            Layout, components, canvas tabs, and effect sliders save together as a <strong>Scene</strong>.
                            Use the picker in the bar <strong>above the workspace canvas tabs</strong> (center column).
                            Files live under <code>profiles/scenes/</code> in your AppData folder.
                        </p>
                    </div>
                </div>
            </div>
            <div class="col-lg-6">
                <div class="card h-100 border-secondary shadow-sm">
                    <div class="card-body">
                        <h3 class="h6 card-title text-body-emphasis"><i class="bi bi-layout-three-columns me-2 text-info"></i>Layout</h3>
                        <p class="card-text text-body-secondary small mb-0">
                            <strong>Devices</strong> (left) and <strong>Effects</strong> (right) are collapsible docks — chevrons on the panel edges hide either side for more canvas room.
                            The <strong>Scene</strong> bar and canvas tabs sit centered above the workspace.
                            The <strong>fullscreen</strong> button (lower-right of the canvas) maximizes the layout preview;
                            press <kbd>Escape</kbd> or the button again to return.
                        </p>
                    </div>
                </div>
            </div>
            <div class="col-lg-6">
                <div class="card h-100 border-secondary shadow-sm">
                    <div class="card-body">
                        <h3 class="h6 card-title text-body-emphasis"><i class="bi bi-magic me-2 text-info"></i>Setup wizard &amp; components</h3>
                        <p class="card-text text-body-secondary small mb-0">
                            The magic-wand button in the <strong>Devices</strong> panel runs the <strong>initial setup wizard</strong> for channels without components.
                            <strong>+ Add</strong> on a <strong>channel</strong> row opens the <strong>Component Library</strong> (LED layout thumbnails when no product photo is available).
                            <kbd>Escape</kbd> closes the wizard, library, and most other overlays.
                        </p>
                    </div>
                </div>
            </div>
            <div class="col-lg-6">
                <div class="card h-100 border-secondary shadow-sm">
                    <div class="card-body">
                        <h3 class="h6 card-title text-body-emphasis"><i class="bi bi-grid-3x3-gap me-2 text-info"></i>Stream Deck</h3>
                        <p class="card-text text-body-secondary small mb-0">
                            Install the separate <strong>RGBJunkie-Deck</strong> plugin for Elgato Stream Deck to switch effects and Scenes, control brightness, and toggle all lights from your keys and dials.
                            See the Help Center article <a href="<?= rgbj_h(rgbj_url('help/article.php?slug=stream-deck')) ?>">Stream Deck</a>.
                        </p>
                    </div>
                </div>
            </div>
            <div class="col-lg-6">
                <div class="card h-100 border-secondary shadow-sm">
                    <div class="card-body">
                        <h3 class="h6 card-title text-body-emphasis"><i class="bi bi-usb-plug me-2 text-info"></i>Per-device output</h3>
                        <p class="card-text text-body-secondary small mb-0">
                            <strong>Settings → Hardware → Connected</strong> includes an <strong>Output on / Output off</strong> toggle per device.
                            Turn output off when you want RGBJunkie to leave that hardware alone (for example a Stream Deck LCD managed elsewhere).
                        </p>
                    </div>
                </div>
            </div>
            <div class="col-lg-6">
                <div class="card h-100 border-secondary shadow-sm">
                    <div class="card-body">
                        <h3 class="h6 card-title text-body-emphasis"><i class="bi bi-keyboard me-2 text-info"></i>Escape key</h3>
                        <p class="card-text text-body-secondary small mb-0">
                            Closes the topmost UI layer: <strong>Settings</strong>, <strong>Browse effects</strong>, <strong>Component Library</strong>,
                            <strong>setup wizard</strong>, <strong>plugin device settings</strong>, confirm dialogs, and rename prompts.
                            Exits <strong>maximized canvas</strong> and dismisses context menus.
                            On the bare canvas, clears the current selection when nothing else is open.
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <p class="text-body-secondary small mt-4 mb-0">
            See also: <a href="<?= rgbj_h(rgbj_url('changelog/')) ?>">What’s new</a> for release-by-release changes.
        </p>
    </section>
    <?php
}
