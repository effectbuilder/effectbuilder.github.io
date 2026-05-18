<?php

declare(strict_types=1);

require_once __DIR__ . '/includes/showcase-lib.php';

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=300, stale-while-revalidate=600');

$force = isset($_GET['refresh']) && $_GET['refresh'] === '1';
$manifest = showcase_get_manifest(__DIR__, $force);

echo showcase_json_for_script($manifest);
