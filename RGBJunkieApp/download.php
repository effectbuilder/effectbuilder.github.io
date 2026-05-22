<?php declare(strict_types=1);

require_once __DIR__ . '/includes/download-tracker.php';

try {
    rgbj_serve_tracked_download(
        (string) ($_GET['f'] ?? ''),
        (string) ($_GET['channel'] ?? 'website')
    );
} catch (Throwable $e) {
    http_response_code(500);
    header('Content-Type: text/plain; charset=UTF-8');
    echo 'Download failed. Please try again from the download page.';
    error_log('download.php: ' . $e->getMessage());
}
