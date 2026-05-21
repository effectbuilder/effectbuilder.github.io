<?php declare(strict_types=1);

require_once __DIR__ . '/includes/download-tracker.php';

rgbj_serve_tracked_download(
    (string) ($_GET['f'] ?? ''),
    (string) ($_GET['channel'] ?? 'website')
);
