<?php

declare(strict_types=1);

/**
 * Server-side showcase manifest: scan effect HTML once, cache JSON for fast page loads.
 */

/** @return list<string> Newest-first display order (append new effects at the end). */
function showcase_effect_filename_order(): array
{
    return [
        'SwirlCirclesAudio.html', 'RotatingBeam.html', 'NoiseMap.html', 'Policing.html',
        'MovingPanes.html', 'SpectrumCycling.html', 'Sunrise.html', 'Stack.html',
        'Mosaic.html', 'Marquee.html', 'Swap.html', 'Mask.html', 'ZigZag.html',
        'AudioBubbles.html', 'Wavy.html', 'Visor.html', 'StarryNight.html',
        'Spiral.html', 'Sequence.html', 'SmoothBlink.html', 'SparkleFade.html',
        'RandomMarquee.html', 'RotatingRainbow.html', 'RandomSpin.html',
        'RadialRainbow.html', 'Rain.html', 'RainbowWave.html', 'Lightning.html',
        'MotionPoints.html', 'GradientWave.html', 'FractalMotion.html',
        'Hypnotoad.html', 'Fill.html', 'DoubleRotatingRainbow.html',
        'BreathingCircle.html', 'BubbleCollision.html', 'ColorWheel.html',
        'CustomMarque.html', 'CrossingBeams.html', 'Comet.html',
        'CustomGradientWave.html', 'CustomBlink.html', 'Clock.html',
        'Bubbles.html', 'Breathing.html', 'BouncingBall.html', 'Bloom.html',
        'AudioVUMeter.html', 'AudioVisualizer.html', 'AudioSync.html',
        'AudioStar.html', 'AudioSine.html', 'AudioParty.html', 'Ambient.html',
        'ParticleSwarm.html', 'NeonHex.html', 'fractal_explorer.html',
        'audio_eclipse.html', 'RetroWave.html', 'infinity_spiral.html',
        'PRFlag.html', 'SolarSystem.html', 'tunnel.html',
        'particle_eq_bars.html', 'laserShapes.html', 'concertLasers.html',
        'ink_drops.html', 'starfield.html', 'digital_noiseform.html',
        'bouncingCubes.html', 'clouds.html', 'polyPlanet.html',
        'serenityWaves.html', 'systemBouncer.html', 'picasso.html',
        'void_and_silk.html', 'SouthPark.html', 'spirograph.html', 'Borealis.html',
        'DigitalDecay.html', 'KineticSand.html', 'arcraiders.html', 'windowrain.html',
        'prismLaser.html', 'AudioLines.html', 'audioLinesCanvas.html', 'qmkKeyboardVisualizer.html',
        'skyMap.html', 'stellarSynapse.html', 'Fireflies.html', 'BioluminiscentDeep.html',
        'DragonSkin.html', 'DragonSkin2.html',
        'police.html', 'neuralAutomata.html', 'fanTracer.html', 'grandLineVoyage.html',
        'chuck.html', 'fanTracerTwoColor.html', 'flowfield.html', 'Morpheus.html',
        'ferromagneticResonance.html',
    ];
}

function showcase_ordered_filenames(string $effectsDir): array
{
    $ordered = showcase_effect_filename_order();
    $known = array_flip($ordered);
    $extra = [];

    foreach (glob($effectsDir . '/*.html') ?: [] as $path) {
        $name = basename($path);
        if (!isset($known[$name])) {
            $extra[] = $name;
        }
    }

    sort($extra);

    return array_merge($ordered, $extra);
}

function showcase_effects_max_mtime(string $effectsDir): int
{
    $max = 0;
    foreach (glob($effectsDir . '/*.html') ?: [] as $path) {
        $max = max($max, (int) filemtime($path));
    }
    return $max;
}

/** @return list<array<string, mixed>> */
function showcase_get_manifest(string $showcaseRoot, bool $forceRebuild = false): array
{
    $cacheFile = $showcaseRoot . DIRECTORY_SEPARATOR . 'cache' . DIRECTORY_SEPARATOR . 'manifest.json';
    $effectsDir = $showcaseRoot . DIRECTORY_SEPARATOR . 'effects';
    $orderFile = $showcaseRoot . DIRECTORY_SEPARATOR . 'includes' . DIRECTORY_SEPARATOR . 'showcase-lib.php';
    $sourcesMtime = max(
        showcase_effects_max_mtime($effectsDir),
        is_file($orderFile) ? (int) filemtime($orderFile) : 0
    );

    if (!$forceRebuild && is_file($cacheFile)) {
        $cacheMtime = (int) filemtime($cacheFile);
        if ($cacheMtime >= $sourcesMtime) {
            $cached = json_decode((string) file_get_contents($cacheFile), true);
            if (is_array($cached)) {
                return $cached;
            }
        }
    }

    $manifest = showcase_build_manifest($showcaseRoot);
    $cacheDir = dirname($cacheFile);
    if (!is_dir($cacheDir)) {
        mkdir($cacheDir, 0755, true);
    }
    file_put_contents(
        $cacheFile,
        json_encode($manifest, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
        LOCK_EX
    );

    return $manifest;
}

/** @return list<array<string, mixed>> */
function showcase_build_manifest(string $showcaseRoot): array
{
    $effectsDir = $showcaseRoot . DIRECTORY_SEPARATOR . 'effects';
    $filenames = showcase_ordered_filenames($effectsDir);
    $manifest = [];

    foreach ($filenames as $index => $filename) {
        $path = $effectsDir . DIRECTORY_SEPARATOR . $filename;
        if (!is_file($path)) {
            continue;
        }
        $parsed = showcase_parse_effect_file($path, $filename, $index);
        if ($parsed !== null) {
            $manifest[] = $parsed;
        }
    }

    return $manifest;
}

/** @return array<string, mixed>|null */
function showcase_parse_effect_file(string $path, string $filename, int $index): ?array
{
    $html = file_get_contents($path);
    if ($html === false || $html === '') {
        return null;
    }

    return showcase_parse_effect_html($html, $filename, $index);
}

/** @return array<string, mixed>|null */
function showcase_parse_effect_html(string $html, string $filename, int $index): ?array
{
    $dom = new DOMDocument();
    $prev = libxml_use_internal_errors(true);
    $dom->loadHTML($html, LIBXML_NOWARNING | LIBXML_NOERROR);
    libxml_clear_errors();
    libxml_use_internal_errors($prev);

    $getCustomMeta = static function (DOMDocument $dom, string $attrName): ?string {
        foreach ($dom->getElementsByTagName('meta') as $meta) {
            if (!$meta instanceof DOMElement) {
                continue;
            }
            if ($meta->hasAttribute($attrName)) {
                return trim($meta->getAttribute($attrName));
            }
            if ($meta->getAttribute('name') === $attrName && $meta->hasAttribute('content')) {
                return trim($meta->getAttribute('content'));
            }
        }
        return null;
    };

    $titleNodes = $dom->getElementsByTagName('title');
    $docTitle = $titleNodes->length > 0 ? trim($titleNodes->item(0)?->textContent ?? '') : '';

    $title = $getCustomMeta($dom, 'title') ?: ($docTitle !== '' ? $docTitle : 'Untitled Effect');
    $description = $getCustomMeta($dom, 'description')
        ?: $getCustomMeta($dom, 'og:description')
        ?: 'No description available.';
    $author = $getCustomMeta($dom, 'publisher')
        ?: $getCustomMeta($dom, 'author')
        ?: 'Unknown Author';

    $structuredControls = [];
    foreach ($dom->getElementsByTagName('meta') as $meta) {
        if (!$meta instanceof DOMElement || !$meta->hasAttribute('property')) {
            continue;
        }
        $prop = $meta->getAttribute('property');
        if ($prop === '') {
            continue;
        }
        $structuredControls[] = [
            'label' => $meta->getAttribute('label') !== '' ? $meta->getAttribute('label') : $prop,
            'variable' => $prop,
            'type' => $meta->getAttribute('type') !== '' ? $meta->getAttribute('type') : 'text',
            'min' => $meta->getAttribute('min') !== '' ? $meta->getAttribute('min') : '0',
            'max' => $meta->getAttribute('max') !== '' ? $meta->getAttribute('max') : '100',
            'step' => $meta->getAttribute('step') !== '' ? $meta->getAttribute('step') : '1',
            'valuesStr' => $meta->getAttribute('values'),
            'def' => $meta->getAttribute('default'),
            'description' => $meta->getAttribute('tooltip'),
        ];
    }

    $tags = [];
    $tagsMeta = $getCustomMeta($dom, 'tags') ?: $getCustomMeta($dom, 'keywords');
    if ($tagsMeta !== null && $tagsMeta !== '') {
        foreach (explode(',', $tagsMeta) as $t) {
            $t = trim($t);
            if ($t !== '') {
                $tags[] = $t;
            }
        }
    }

    $textToAnalyze = strtolower($title . ' ' . $description . ' ' . $filename);
    $addTag = static function (string $t) use (&$tags): void {
        foreach ($tags as $existing) {
            if (strcasecmp($existing, $t) === 0) {
                return;
            }
        }
        $tags[] = $t;
    };

    $hasAudioMeta = false;
    foreach ($dom->getElementsByTagName('meta') as $meta) {
        if ($meta instanceof DOMElement && $meta->getAttribute('property') === 'audio_reactive') {
            $hasAudioMeta = true;
            break;
        }
    }

    if ($hasAudioMeta || preg_match('/audio|sound|music|beat|freq|mic|visualizer|spect|vu meter|rhythm/', $textToAnalyze)) {
        if (!in_array('Sound Responsive', $tags, true)) {
            array_unshift($tags, 'Sound Responsive');
        }
    }
    if (preg_match('/mouse|click|drag|interactive|cursor|touch/', $textToAnalyze)) {
        $addTag('Interactive');
    }
    if (preg_match('/rainbow|color cycle|gradient|hues|spectrum/', $textToAnalyze)) {
        $addTag('Rainbow');
    }
    if (preg_match('/fractal|mandelbrot|julia|math|geometry/', $textToAnalyze)) {
        $addTag('Fractal');
    }
    if (preg_match('/particle|swarm|dots|dust|starfield/', $textToAnalyze)) {
        $addTag('Particles');
    }
    if ($structuredControls !== [] && !in_array('Customizable', $tags, true)) {
        $tags[] = 'Customizable';
    }

    $presets = [];
    $xpath = new DOMXPath($dom);
    $presetNodes = $xpath->query('//script[contains(concat(" ", normalize-space(@class), " "), " effect-preset ")]');
    if ($presetNodes !== false) {
        foreach ($presetNodes as $node) {
            $text = trim($node->textContent ?? '');
            if ($text === '' || $text[0] !== '{') {
                continue;
            }
            try {
                $parsed = json_decode($text, true, 512, JSON_THROW_ON_ERROR);
                if (is_array($parsed)) {
                    $presets[] = $parsed;
                }
            } catch (JsonException) {
                // Some legacy presets use JS object syntax; skip on server.
            }
        }
    }

    $base = 'effects/' . $filename;
    $staticUrl = preg_replace('/\.html$/i', '.png', $base) ?? $base;

    return [
        'title' => $title,
        'description' => $description,
        'author' => $author,
        'effectUrl' => $base,
        'staticUrl' => $staticUrl,
        'filename' => $filename,
        'tags' => $tags,
        'structuredControls' => $structuredControls,
        'presets' => $presets,
        'originalIndex' => $index,
        'downloads' => 0,
    ];
}

function showcase_json_for_script(array $data): string
{
    return json_encode(
        $data,
        JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT | JSON_THROW_ON_ERROR
    );
}
