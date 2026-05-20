<?php

declare(strict_types=1);

/** Same admin UID as Cloud Functions / Effect Builder (js/firebase.js project). */
const RGBJ_FIREBASE_ADMIN_UID = 'zMj8mtfMjXeFMt072027JT7Jc7i1';

const RGBJ_FIRESTORE_DOWNLOADS_COLLECTION = 'rgbjunkie-app-downloads';

/** @return array{admin_uid:string,count_cooldown_seconds:int} */
function rgbj_download_stats_config(): array
{
    static $config = null;
    if ($config !== null) {
        return $config;
    }

    $defaults = [
        'admin_uid' => RGBJ_FIREBASE_ADMIN_UID,
        'count_cooldown_seconds' => 0,
    ];

    $local = __DIR__ . '/download-stats-secret.php';
    if (is_file($local)) {
        $loaded = require $local;
        if (is_array($loaded)) {
            $config = array_merge($defaults, $loaded);

            return $config;
        }
    }

    $config = $defaults;

    return $config;
}
