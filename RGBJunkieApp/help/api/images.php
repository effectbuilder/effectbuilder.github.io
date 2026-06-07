<?php declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/includes/help-content.php';
require_once dirname(__DIR__, 2) . '/includes/help-editor-auth.php';

header('Cache-Control: no-store');

$method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));

rgbj_help_editor_require_admin();

if ($method === 'GET') {
    $images = [];
    foreach (rgbj_help_list_media_library() as $item) {
        $alt = rgbj_help_image_alt_from_filename($item['filename']);
        $images[] = array_merge($item, [
            'markdown' => '![' . $alt . '](' . $item['path'] . ')',
        ]);
    }

    rgbj_help_editor_json_response(['images' => $images]);
}

if ($method === 'DELETE') {
    $filename = trim((string) ($_GET['filename'] ?? ''));

    try {
        rgbj_help_delete_media($filename);
        rgbj_help_editor_json_response([
            'ok' => true,
            'filename' => rgbj_help_sanitize_media_filename($filename),
        ]);
    } catch (InvalidArgumentException $e) {
        rgbj_help_editor_json_response(['error' => $e->getMessage()], 404);
    } catch (Throwable $e) {
        rgbj_help_editor_json_response(['error' => $e->getMessage()], 500);
    }
}

rgbj_help_editor_json_response(['error' => 'Method not allowed.'], 405);
