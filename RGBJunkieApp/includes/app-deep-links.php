<?php declare(strict_types=1);

/**
 * App deep link reference (rgbjunkie:// and website handoff).
 *
 * @see RGBJunkieApp repo docs/APP_DEEP_LINKS.md
 */

/** Website handoff URL (`/s?p=…`) for the current site base (localhost or production). */
function rgbj_handoff_url(string $pathAndQuery): string
{
    $p = ltrim($pathAndQuery, '/');
    return rgbj_url('s/') . '?p=' . rawurlencode($p);
}

/**
 * @return list<array{group: string, rows: list<array{action: string, app: string, handoff: string, note?: string}>}>
 */
function rgbj_app_deep_link_catalog(): array
{
    $gitExample = 'https://github.com/owner/repo';

    return [
        [
            'group' => 'Open Settings and UI',
            'rows' => [
                [
                    'action' => 'Settings → Overview (dashboard)',
                    'app' => 'rgbjunkie://view/settings/overview',
                    'handoff' => 'view/settings/overview',
                ],
                [
                    'action' => 'Settings → Colors',
                    'app' => 'rgbjunkie://view/settings/colors',
                    'handoff' => 'view/settings/colors',
                    'note' => 'Alias: rgbjunkie://view/customize',
                ],
                [
                    'action' => 'Settings → Hardware',
                    'app' => 'rgbjunkie://view/settings/hardware',
                    'handoff' => 'view/settings/hardware',
                    'note' => 'Alias: rgbjunkie://view/devices',
                ],
                [
                    'action' => 'Settings → Installed (plugins & components)',
                    'app' => 'rgbjunkie://view/settings/installed',
                    'handoff' => 'view/settings/installed',
                    'note' => 'Alias: rgbjunkie://view/userplugins',
                ],
                [
                    'action' => 'Settings → System',
                    'app' => 'rgbjunkie://view/settings/system',
                    'handoff' => 'view/settings/system',
                    'note' => 'Alias: rgbjunkie://view/debuginfo',
                ],
                [
                    'action' => 'Settings → System → Logs',
                    'app' => 'rgbjunkie://view/logs',
                    'handoff' => 'view/logs',
                ],
                [
                    'action' => 'Effect browser',
                    'app' => 'rgbjunkie://view/effects',
                    'handoff' => 'view/effects',
                ],
                [
                    'action' => 'Scene profile picker (scroll into view)',
                    'app' => 'rgbjunkie://view/scenes',
                    'handoff' => 'view/scenes',
                ],
                [
                    'action' => 'Restart RGBJunkie',
                    'app' => 'rgbjunkie://app/restart',
                    'handoff' => 'app/restart',
                ],
            ],
        ],
        [
            'group' => 'Scenes, effects, and plugins',
            'rows' => [
                [
                    'action' => 'Apply a scene (layout profile) by name',
                    'app' => 'rgbjunkie://scene/apply/My%20Scene',
                    'handoff' => 'scene/apply/My%20Scene',
                    'note' => 'Same as rgbjunkie://layout/apply/… — matches the Scene dropdown label.',
                ],
                [
                    'action' => 'Apply an effect by name (with optional sliders)',
                    'app' => 'rgbjunkie://effect/apply/Rainbow%20Rise?speed=3&reverse=false',
                    'handoff' => 'effect/apply/Rainbow%20Rise?speed=3&reverse=false',
                    'note' => 'Query keys merge into that effect’s settings. Use %20 for spaces (%%20 in .bat files).',
                ],
                [
                    'action' => 'Install plugins from GitHub / GitLab',
                    'app' => 'rgbjunkie://addon/install?url=' . rawurlencode($gitExample),
                    'handoff' => 'addon/install?url=' . rawurlencode($gitExample),
                    'note' => 'Only https://github.com/… and https://gitlab.com/… URLs are accepted.',
                ],
                [
                    'action' => 'Import shared effect settings',
                    'app' => 'rgbjunkie://import#rgbj-effect=v1.…',
                    'handoff' => 'import',
                    'note' => 'Usually opened from https://rgbjunkie.com/api/effect/?rgbj=v1… handoff pages.',
                ],
            ],
        ],
        [
            'group' => 'Legacy settings tab names',
            'rows' => [
                [
                    'action' => 'Settings → Colors → Color profiles',
                    'app' => 'rgbjunkie://view/color-profiles',
                    'handoff' => 'view/color-profiles',
                ],
                [
                    'action' => 'Settings → Hardware → Connected devices',
                    'app' => 'rgbjunkie://view/devices',
                    'handoff' => 'view/devices',
                ],
                [
                    'action' => 'Settings → System → Engine',
                    'app' => 'rgbjunkie://view/engine',
                    'handoff' => 'view/engine',
                ],
            ],
        ],
    ];
}

/** Teaser card on the documentation hub. */
function rgbj_render_app_deep_links_doc_card(): void
{
    $href = rgbj_url('docs/deep-links/');
    ?>
    <section class="mb-5">
        <h2 class="h4 fw-bold text-body-emphasis mb-2">Automation &amp; shortcuts</h2>
        <p class="text-body-secondary col-lg-10 mb-4">
            Open settings, apply scenes and effects, or install Git plugins from Stream Deck, batch files, or browser bookmarks.
        </p>
        <div class="row g-3">
            <div class="col-md-6">
                <a class="card h-100 border-secondary shadow-sm rgbj-doc-card text-decoration-none" href="<?= rgbj_h($href) ?>">
                    <div class="card-body d-flex flex-column">
                        <h3 class="h6 card-title text-body-emphasis mb-2">
                            <i class="bi bi-link-45deg me-2 text-info" aria-hidden="true"></i>App deep links
                        </h3>
                        <p class="card-text text-body-secondary small mb-0 flex-grow-1">
                            Full list of <code>rgbjunkie://</code> URLs and matching website handoff links (<code>/s?p=…</code>).
                        </p>
                        <span class="small text-info mt-3">View reference <i class="bi bi-arrow-right-short" aria-hidden="true"></i></span>
                    </div>
                </a>
            </div>
        </div>
    </section>
    <?php
}

function rgbj_render_app_deep_links_page_content(): void
{
    ?>
    <p class="text-body-secondary col-lg-10 mb-3">
        RGBJunkie for Windows registers the <code>rgbjunkie://</code> URL scheme. Use these links from Stream Deck, batch files,
        browser bookmarks, or automation tools. When RGBJunkie is already running, a second launch forwards the link to the first window.
    </p>
    <p class="text-body-secondary col-lg-10 mb-4">
        On the website, short <strong>handoff</strong> links under <code>/s?p=…</code> open the desktop app the same way
        (SignalRGB-style). Each entry below includes a clickable handoff link for this server.
    </p>

    <h2 class="h6 fw-semibold text-body-emphasis mb-2">Silent launch</h2>
    <p class="text-body-secondary small col-lg-10 mb-4">
        Add <code>?silent=1</code>, <code>?-silentlaunch-</code>, or embed <code>-silentlaunch-</code> in the path/query so RGBJunkie
        stays in the tray instead of restoring the window. Example:
        <code class="user-select-all">rgbjunkie://view/settings/installed?silent=1</code>
    </p>

    <?php foreach (rgbj_app_deep_link_catalog() as $section) : ?>
    <section class="mb-5">
        <h2 class="h5 fw-bold text-body-emphasis mb-3"><?= rgbj_h($section['group']) ?></h2>
        <div class="d-flex flex-column gap-3">
            <?php foreach ($section['rows'] as $row) :
                $handoffHref = rgbj_handoff_url($row['handoff']);
                ?>
            <article class="card border-secondary shadow-sm rgbj-deep-link-entry">
                <div class="card-body">
                    <h3 class="h6 card-title text-body-emphasis mb-2"><?= rgbj_h($row['action']) ?></h3>
                    <?php if (!empty($row['note'])) : ?>
                    <p class="text-body-secondary small mb-3"><?= rgbj_h($row['note']) ?></p>
                    <?php endif; ?>
                    <div class="row g-3">
                        <div class="col-md-6">
                            <p class="text-body-secondary small mb-1 fw-semibold">App link</p>
                            <pre class="rgbj-deep-link-uri mb-0"><code><?= rgbj_h($row['app']) ?></code></pre>
                        </div>
                        <div class="col-md-6">
                            <p class="text-body-secondary small mb-1 fw-semibold">Website handoff</p>
                            <p class="mb-0"><a class="rgbj-deep-link-handoff" href="<?= rgbj_h($handoffHref) ?>"><?= rgbj_h($handoffHref) ?></a></p>
                        </div>
                    </div>
                </div>
            </article>
            <?php endforeach; ?>
        </div>
    </section>
    <?php endforeach; ?>

    <h2 class="h6 fw-semibold text-body-emphasis mb-2">Windows examples</h2>
    <pre class="rgbj-deep-link-uri bg-dark border border-secondary rounded p-3 small mb-4 user-select-all"><code>start "" "rgbjunkie://effect/apply/Solid%%20Color?silent=1"
start "" "rgbjunkie://addon/install?url=https://github.com/owner/repo"</code></pre>

    <p class="text-body-secondary small mb-0">
        Packaged installs register <code>rgbjunkie://</code> with Windows. Effect-settings import and dev testing may need a release build;
        <code>tauri dev</code> often does not register the handler.
    </p>
    <?php
}
