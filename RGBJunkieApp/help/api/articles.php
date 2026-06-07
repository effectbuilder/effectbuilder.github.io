<?php declare(strict_types=1);

require_once dirname(__DIR__, 2) . '/includes/help-content.php';
require_once dirname(__DIR__, 2) . '/includes/help-editor-auth.php';

header('Cache-Control: no-store');

$method = strtoupper((string) ($_SERVER['REQUEST_METHOD'] ?? 'GET'));

if ($method === 'POST' && isset($_GET['action']) && $_GET['action'] === 'preview') {
    $body = file_get_contents('php://input');
    $data = json_decode($body !== false ? $body : '', true);
    $markdown = is_array($data) ? (string) ($data['markdown'] ?? '') : '';
    $rendered = rgbj_help_markdown_to_html(rgbj_help_markdown_body($markdown));

    rgbj_help_editor_json_response([
        'html' => $rendered['html'],
    ]);
}

rgbj_help_editor_require_admin();

if ($method === 'GET') {
    $slug = trim((string) ($_GET['slug'] ?? ''));

    if ($slug !== '') {
        $path = rgbj_help_article_file_path($slug);
        if ($path === null || !is_readable($path)) {
            rgbj_help_editor_json_response(['error' => 'Article not found.'], 404);
        }

        rgbj_help_editor_json_response([
            'slug' => rgbj_help_tag_slug($slug),
            'filename' => basename($path),
            'markdown' => (string) file_get_contents($path),
            'url' => rgbj_help_article_url(rgbj_help_tag_slug($slug)),
        ]);
    }

    $articles = [];
    foreach (rgbj_help_list_article_meta(true) as $article) {
        $articles[] = $article;
    }

    rgbj_help_editor_json_response(['articles' => $articles]);
}

if ($method === 'POST') {
    $body = file_get_contents('php://input');
    $data = json_decode($body !== false ? $body : '', true);
    if (!is_array($data)) {
        rgbj_help_editor_json_response(['error' => 'Invalid JSON body.'], 400);
    }

    $slug = trim((string) ($data['slug'] ?? ''));
    $markdown = (string) ($data['markdown'] ?? '');

    if ($slug === '') {
        rgbj_help_editor_json_response(['error' => 'slug is required.'], 400);
    }

    if ($markdown === '') {
        rgbj_help_editor_json_response(['error' => 'markdown cannot be empty.'], 400);
    }

    if (!preg_match('/^---\r?\n/s', $markdown)) {
        rgbj_help_editor_json_response(['error' => 'Article must start with YAML front matter (---).'], 400);
    }

    $path = rgbj_help_article_file_path($slug);
    if ($path === null) {
        rgbj_help_editor_json_response(['error' => 'Invalid slug.'], 400);
    }

    $dir = dirname($path);
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        rgbj_help_editor_json_response(['error' => 'Could not create content directory.'], 500);
    }

    if (file_put_contents($path, str_replace(["\r\n", "\r"], "\n", $markdown)) === false) {
        rgbj_help_editor_json_response(['error' => 'Failed to write file.'], 500);
    }

    $normalizedSlug = rgbj_help_tag_slug($slug);
    $previousSlug = rgbj_help_tag_slug(trim((string) ($data['previousSlug'] ?? '')));
    if ($previousSlug !== '' && $previousSlug !== $normalizedSlug) {
        $previousPath = rgbj_help_article_file_path($previousSlug);
        if ($previousPath !== null && is_file($previousPath) && $previousPath !== $path && !@unlink($previousPath)) {
            rgbj_help_editor_json_response([
                'error' => 'Saved as ' . basename($path) . ' but could not remove ' . basename($previousPath) . '.',
            ], 500);
        }
    }

    rgbj_help_editor_json_response([
        'ok' => true,
        'slug' => rgbj_help_tag_slug($slug),
        'filename' => basename($path),
        'url' => rgbj_help_article_url(rgbj_help_tag_slug($slug)),
    ]);
}

if ($method === 'DELETE') {
    $slug = trim((string) ($_GET['slug'] ?? ''));
    $path = rgbj_help_article_file_path($slug);
    if ($path === null || !is_file($path)) {
        rgbj_help_editor_json_response(['error' => 'Article not found.'], 404);
    }

    if (!@unlink($path)) {
        rgbj_help_editor_json_response(['error' => 'Failed to delete file.'], 500);
    }

    rgbj_help_editor_json_response(['ok' => true]);
}

rgbj_help_editor_json_response(['error' => 'Method not allowed.'], 405);
