<?php declare(strict_types=1);

/**
 * Developer documentation links for RGBJunkie for Windows and related APIs.
 *
 * @return list<array{heading: string, intro: string, items: list<array{icon: string, title: string, text: string, href: string, external?: bool}>}>
 */
function rgbj_developer_doc_sections(): array
{
    return [
        [
            'heading' => 'Desktop app API',
            'intro' => 'Author plugins, effects, and integrations that run inside RGBJunkie for Windows. Plain-language guides with examples — no app source required.',
            'items' => [
                [
                    'icon' => 'bi-plugin',
                    'title' => 'Plugin developer guide',
                    'text' => 'Build USB HID lighting plugins: export-function format (recommended), optional ABI descriptor, lifecycle exports, and the device API.',
                    'href' => rgbj_url('help/plugin-developer-guide/'),
                ],
                [
                    'icon' => 'bi-brush',
                    'title' => 'Effect developer guide (HTML canvas)',
                    'text' => 'Create HTML canvas effects: metadata, sidebar settings, and host APIs (audio, screen, sensors) explained in plain language first.',
                    'href' => rgbj_url('help/effect-developer-guide/'),
                ],
                [
                    'icon' => 'bi-code-slash',
                    'title' => 'Functional effects guide (.mjs)',
                    'text' => 'Per-LED effects without a canvas — export meta + sampleLed; audio and color profiles explained step by step.',
                    'href' => rgbj_url('help/effect-functional-developer-guide/'),
                ],
                [
                    'icon' => 'bi-usb-plug',
                    'title' => 'Supported devices reference',
                    'text' => 'Search VID/PID, transport, and device kind from shipped plugins — useful when matching hardware in your plugin.',
                    'href' => '/RGBJunkieApp/supported/',
                ],
            ],
        ],
        [
            'heading' => 'Browser creative tools',
            'intro' => 'Free web tools from RGBJunkie. Prototype looks in the browser, then bring them into the Windows app or share with the community.',
            'items' => [
                [
                    'icon' => 'bi-palette2',
                    'title' => 'RGBJunkie Effect Builder',
                    'text' => 'Design interactive canvas effects with a visual editor — the classic RGBJunkie starting point.',
                    'href' => '/effect-builder/',
                ],
                [
                    'icon' => 'bi-bounding-box-circles',
                    'title' => 'RGBJunkie Component Builder',
                    'text' => 'Draw and export layout components for keyboards, strips, mats, and other desk gear.',
                    'href' => '/builder/',
                ],
                [
                    'icon' => 'bi-layers',
                    'title' => 'RGBJunkie Effect Combiner',
                    'text' => 'Blend and layer multiple effects into one combined look.',
                    'href' => '/combiner/',
                ],
            ],
        ],
    ];
}

function rgbj_render_developer_doc_card(array $item): void
{
    $external = !empty($item['external']);
    $attrs = $external ? ' target="_blank" rel="noopener noreferrer"' : '';
    ?>
    <div class="col-md-6">
        <a class="card h-100 border-secondary shadow-sm rgbj-doc-card text-decoration-none" href="<?= rgbj_h($item['href']) ?>"<?= $attrs ?>>
            <div class="card-body d-flex flex-column">
                <h3 class="h6 card-title text-body-emphasis mb-2">
                    <i class="bi <?= rgbj_h($item['icon']) ?> me-2 text-info" aria-hidden="true"></i><?= rgbj_h($item['title']) ?>
                    <?php if ($external) : ?>
                    <i class="bi bi-box-arrow-up-right ms-1 small opacity-75" aria-hidden="true"></i>
                    <?php endif; ?>
                </h3>
                <p class="card-text text-body-secondary small mb-0 flex-grow-1"><?= rgbj_h($item['text']) ?></p>
                <span class="small text-info mt-3">Read guide <i class="bi bi-arrow-right-short" aria-hidden="true"></i></span>
            </div>
        </a>
    </div>
    <?php
}

/** Compact API links for the landing page developers section. */
function rgbj_render_developer_doc_teaser(): void
{
    $apiSection = rgbj_developer_doc_sections()[0];
    ?>
    <div class="row g-3">
        <?php foreach ($apiSection['items'] as $item) {
            rgbj_render_developer_doc_card($item);
        } ?>
    </div>
    <?php
}

function rgbj_render_developer_doc_sections(): void
{
    foreach (rgbj_developer_doc_sections() as $section) {
        ?>
        <section class="mb-5">
            <h2 class="h4 fw-bold text-body-emphasis mb-2"><?= rgbj_h($section['heading']) ?></h2>
            <p class="text-body-secondary col-lg-10 mb-4"><?= rgbj_h($section['intro']) ?></p>
            <div class="row g-3">
                <?php foreach ($section['items'] as $item) {
                    rgbj_render_developer_doc_card($item);
                } ?>
            </div>
        </section>
        <?php
    }
}
