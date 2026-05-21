<?php declare(strict_types=1);

/**
 * In-app update manifest (JSON). Requested as /releases/latest.json via .htaccess rewrite.
 */

require_once dirname(__DIR__) . '/includes/installers.php';

rgbj_send_latest_version_manifest(rgbj_app_root());
