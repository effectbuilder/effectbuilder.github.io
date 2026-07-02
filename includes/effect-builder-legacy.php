<?php
/**
 * Redirect old Effect Builder URLs (root / and /index.html) to /effect-builder/.
 */
declare(strict_types=1);

/** Canonical path for the interactive Effect Builder (trailing slash). */
const RGBJ_EFFECT_BUILDER_PATH = '/effect-builder/';

/**
 * Query keys that only the Effect Builder consumes at the site root.
 *
 * @return list<string>
 */
function rgbj_effect_builder_legacy_query_keys(): array
{
    return ['effectId', 'adminBackfillExport', 'exportPlain', 'show', 'action'];
}

function rgbj_request_has_legacy_effect_builder_query(): bool
{
    foreach (rgbj_effect_builder_legacy_query_keys() as $key) {
        if (array_key_exists($key, $_GET)) {
            return true;
        }
    }

    return false;
}

/**
 * 301 to /effect-builder/ preserving the query string (shared effects, admin backfill, etc.).
 */
function rgbj_redirect_legacy_effect_builder_if_needed(): void
{
    if (!rgbj_request_has_legacy_effect_builder_query()) {
        return;
    }

    $qs = (string) ($_SERVER['QUERY_STRING'] ?? '');
    $target = RGBJ_EFFECT_BUILDER_PATH . ($qs !== '' ? '?' . $qs : '');

    header('Location: ' . $target, true, 301);
    exit;
}
