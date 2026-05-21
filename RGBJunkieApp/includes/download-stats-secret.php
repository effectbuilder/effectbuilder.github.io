<?php

/**
 * Copy to download-stats-secret.php (gitignored).
 *
 * Stats page: /RGBJunkieApp/stats/downloads/
 * Sign in with Google (admin UID below) to load Firestore stats.
 *
 * Deploy Firestore rules (from repo root):
 *   firebase deploy --only firestore:rules,firestore:indexes
 */
declare(strict_types=1);

return [
    /** Google account UID allowed to read rgbjunkie-app-downloads (default: site admin). */
    'admin_uid' => 'zMj8mtfMjXeFMt072027JT7Jc7i1',

    /** 0 = log every click. Set e.g. 45 to ignore repeat clicks of the same file in the same browser within that many seconds. */
    'count_cooldown_seconds' => 0,

    /**
     * Optional: path to a Google service account JSON key (project effect-builder).
     * Required for server-side logging when the desktop app downloads via download.php?channel=app-update
     * (browser downloads still use client-side Firestore in assets/download-track.js).
     */
    'firebase_service_account_json' => __DIR__ . '/firebase-service-account.json',
];
