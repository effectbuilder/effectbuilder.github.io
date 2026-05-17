<?php declare(strict_types=1);

/**
 * @return array<int, array{icon: string, title: string, text: string, image: string, screenshot: string}>
 */
function rgbj_feature_cards(): array
{
    return [
        [
            'icon' => 'bi-columns-gap',
            'title' => 'Multiple workspace canvases',
            'text' => 'Organize different zones (main desk, shelf, stream wall) on separate tabs. Rename them, jump with hotkeys, and keep each area’s layout and lighting independent.',
            'image' => 'images/features/workspaces.jpg',
            'screenshot' => 'Workspace tabs with more than one desk zone open',
        ],
        [
            'icon' => 'bi-bounding-box',
            'title' => 'See it before you mount it',
            'text' => 'Drag keyboards, strips, and mats onto a large workspace. Move, resize, rotate, and align until the on-screen picture matches the rig you are building.',
            'image' => 'images/features/layout.jpg',
            'screenshot' => 'Layout canvas with keyboards, strips, or mats placed on the desk',
        ],
        [
            'icon' => 'bi-usb-symbol',
            'title' => 'Works with lots of gear you already own',
            'text' => 'Plug in supported USB lighting from popular brands, keep everything in one tidy list, and flash a device when you need to spot it behind the tower. <a href="' . rgbj_h(rgbj_url('supported/')) . '">Browse the growing compatibility list</a>.',
            'image' => 'images/features/devices.jpg',
            'screenshot' => 'Connected devices list with USB gear recognized',
        ],
        [
            'icon' => 'bi-rainbow',
            'title' => 'Gorgeous effects, zero coding',
            'text' => 'Pick from a rich library of bundled looks, tune sliders to taste, and save color profiles that match your aesthetic: calm focus, neon party, team colors, and more.',
            'image' => 'images/features/effects.jpg',
            'screenshot' => 'Effect picker or live preview with colors on the workspace',
        ],
        [
            'icon' => 'bi-palette',
            'title' => 'Paint individual LEDs when details matter',
            'text' => 'Open LED Studio to brush specific lights by hand, ideal for logos, corner accents, or fixing one zone that never quite matched the rest.',
            'image' => 'images/features/led-studio.jpg',
            'screenshot' => 'LED Studio with per-key or per-LED painting visible',
        ],
        [
            'icon' => 'bi-music-note-beamed',
            'title' => 'Let the beat drive the room',
            'text' => 'Optional music-reactive lighting helps colors follow your playlist, game audio, or stream, so the desk feels alive when you are in the zone.',
            'image' => 'images/features/music.gif',
            'screenshot' => 'Music-reactive effect responding to audio levels',
        ],
        // [
        //     'icon' => 'bi-bookmark-star',
        //     'title' => 'Save scenes & switch in seconds',
        //     'text' => 'Store complete setups (layout, effects, and custom LED touches) so weekday chill and weekend showcase are one click apart.',
        //     'image' => 'images/features/scenes.jpg',
        //     'screenshot' => 'Saved scenes or profiles ready to load',
        // ],
    ];
}

function rgbj_render_feature_card(array $card): void
{
    $imagePath = $card['image'];
    $full = dirname(__DIR__) . '/' . ltrim($imagePath, '/');
    $hasImage = is_file($full);
    ?>
    <div class="card h-100 border-secondary shadow-sm rgbj-feature-card">
        <div class="rgbj-feature-card__media<?= $hasImage ? '' : ' rgbj-feature-card__media--placeholder' ?>">
            <?php if ($hasImage) : ?>
            <img
                class="rgbj-feature-card__img"
                src="<?= rgbj_h($imagePath) ?>"
                alt="<?= rgbj_h($card['screenshot']) ?>"
                width="640"
                height="360"
                loading="lazy"
                decoding="async"
            >
            <?php else : ?>
            <div class="rgbj-feature-card__placeholder">
                <i class="bi bi-window-sidebar" aria-hidden="true"></i>
                <span class="rgbj-feature-card__placeholder-label">App screenshot</span>
                <span class="rgbj-feature-card__placeholder-hint"><?= rgbj_h($card['screenshot']) ?></span>
            </div>
            <?php endif; ?>
        </div>
        <div class="card-body">
            <h3 class="h5 card-title">
                <i class="bi <?= rgbj_h($card['icon']) ?> me-2 text-info" aria-hidden="true"></i><?= rgbj_h($card['title']) ?>
            </h3>
            <p class="card-text text-body-secondary small mb-0"><?= $card['text'] ?></p>
        </div>
    </div>
    <?php
}
