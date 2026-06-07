<?php
/**
 * File-based Help Center: Markdown articles in help/content/*.md
 */
declare(strict_types=1);

require_once __DIR__ . '/site.php';

const RGBJ_HELP_CODE_FOLD_VISIBLE_LINES = 12;

function rgbj_help_content_dir(): string
{
    return rgbj_app_root() . DIRECTORY_SEPARATOR . 'help' . DIRECTORY_SEPARATOR . 'content';
}

/**
 * @return array{meta: array<string, string>, body: string}
 */
function rgbj_help_parse_markdown_file(string $path): array
{
    $raw = (string) file_get_contents($path);
    $meta = [];
    $body = $raw;

    if (preg_match('/^---\r?\n(.*?)\r?\n---\r?\n(.*)$/s', $raw, $m)) {
        foreach (preg_split('/\r?\n/', trim($m[1])) as $line) {
            if ($line === '' || strpos($line, ':') === false) {
                continue;
            }
            [$key, $value] = explode(':', $line, 2);
            $meta[trim($key)] = trim($value);
        }
        $body = $m[2];
    }

    return ['meta' => $meta, 'body' => $body];
}

/** Markdown body only (strip YAML front matter when present). */
function rgbj_help_markdown_body(string $raw): string
{
    if (preg_match('/^---\r?\n(.*?)\r?\n---\r?\n(.*)$/s', $raw, $m)) {
        return $m[2];
    }

    return $raw;
}

function rgbj_help_slug_from_filename(string $filename): string
{
    $base = pathinfo($filename, PATHINFO_FILENAME);

    return strtolower(preg_replace('/[^a-z0-9]+/i', '-', $base) ?? $base);
}

function rgbj_help_is_truthy(string $value): bool
{
    $value = strtolower(trim($value));

    return in_array($value, ['1', 'true', 'yes', 'on'], true);
}

/** @return list<string> */
function rgbj_help_parse_tag_list(string $raw): array
{
    if ($raw === '') {
        return [];
    }

    $tags = [];
    foreach (preg_split('/\s*,\s*/', $raw) as $part) {
        $part = trim($part);
        if ($part !== '') {
            $tags[] = $part;
        }
    }

    return array_values(array_unique($tags));
}

function rgbj_help_tag_slug(string $tag): string
{
    $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', trim($tag)) ?? '');

    return trim($slug, '-') ?: 'tag';
}

/** @param list<string> $tags */
function rgbj_help_article_tag_slugs(array $tags): string
{
    return implode(' ', array_map('rgbj_help_tag_slug', $tags));
}

/**
 * @return list<array{
 *   slug: string,
 *   title: string,
 *   summary: string,
 *   category: string,
 *   tags: list<string>,
 *   published: string,
 *   updated: string,
 *   html: string,
 *   headings: list<array{level: int, id: string, text: string}>,
 *   plain_text: string,
 *   filename: string,
 *   draft: bool
 * }>
 */
function rgbj_help_load_articles(bool $includeDrafts = false): array
{
    $dir = rgbj_help_content_dir();
    if (!is_dir($dir)) {
        return [];
    }

    $articles = [];
    $files = glob($dir . DIRECTORY_SEPARATOR . '*.md') ?: [];

    foreach ($files as $path) {
        $filename = basename($path);
        if (strcasecmp($filename, 'README.md') === 0) {
            continue;
        }

        $parsed = rgbj_help_parse_markdown_file($path);
        $meta = $parsed['meta'];
        $draft = rgbj_help_is_truthy($meta['draft'] ?? '');
        $published = trim($meta['published'] ?? '');

        if (!$includeDrafts && ($draft || $published === '')) {
            continue;
        }

        $slug = trim($meta['slug'] ?? '');
        if ($slug === '') {
            $slug = rgbj_help_slug_from_filename($filename);
        }

        $title = trim($meta['title'] ?? '');
        if ($title === '') {
            $title = ucwords(str_replace('-', ' ', $slug));
        }

        $rendered = rgbj_help_markdown_to_html($parsed['body']);
        $category = trim($meta['category'] ?? 'General');
        if ($category === '') {
            $category = 'General';
        }
        $extraTags = rgbj_help_parse_tag_list($meta['tags'] ?? '');
        $tags = array_values(array_unique(array_merge([$category], $extraTags)));

        $articles[] = [
            'slug' => $slug,
            'title' => $title,
            'summary' => trim($meta['summary'] ?? ''),
            'category' => $category,
            'tags' => $tags,
            'published' => $published,
            'updated' => trim($meta['updated'] ?? ''),
            'html' => $rendered['html'],
            'headings' => $rendered['headings'],
            'plain_text' => rgbj_help_markdown_plain_text($parsed['body']),
            'filename' => $filename,
            'draft' => $draft,
        ];
    }

    usort($articles, static function (array $a, array $b): int {
        $dateCmp = strcmp($b['published'], $a['published']);
        if ($dateCmp !== 0) {
            return $dateCmp;
        }

        return strcasecmp($a['title'], $b['title']);
    });

    return $articles;
}

/**
 * Lightweight article list for the editor (front matter only, no HTML rendering).
 *
 * @return list<array{slug: string, title: string, filename: string, draft: bool, published: string, category: string, url: string}>
 */
function rgbj_help_list_article_meta(bool $includeDrafts = false): array
{
    $dir = rgbj_help_content_dir();
    if (!is_dir($dir)) {
        return [];
    }

    $articles = [];
    $files = glob($dir . DIRECTORY_SEPARATOR . '*.md') ?: [];

    foreach ($files as $path) {
        $filename = basename($path);
        if (strcasecmp($filename, 'README.md') === 0) {
            continue;
        }

        $parsed = rgbj_help_parse_markdown_file($path);
        $meta = $parsed['meta'];
        $draft = rgbj_help_is_truthy($meta['draft'] ?? '');
        $published = trim($meta['published'] ?? '');

        if (!$includeDrafts && ($draft || $published === '')) {
            continue;
        }

        $slug = trim($meta['slug'] ?? '');
        if ($slug === '') {
            $slug = rgbj_help_slug_from_filename($filename);
        }

        $title = trim($meta['title'] ?? '');
        if ($title === '') {
            $title = ucwords(str_replace('-', ' ', $slug));
        }

        $category = trim($meta['category'] ?? 'General');
        if ($category === '') {
            $category = 'General';
        }

        $articles[] = [
            'slug' => $slug,
            'title' => $title,
            'filename' => $filename,
            'draft' => $draft,
            'published' => $published,
            'category' => $category,
            'url' => rgbj_help_article_url($slug),
        ];
    }

    usort($articles, static function (array $a, array $b): int {
        $dateCmp = strcmp($b['published'], $a['published']);
        if ($dateCmp !== 0) {
            return $dateCmp;
        }

        return strcasecmp($a['title'], $b['title']);
    });

    return $articles;
}

/**
 * @param list<array{category?: string, ...}> $articles
 * @return array<string, list<array<string, mixed>>>
 */
function rgbj_help_group_article_meta_by_category(array $articles): array
{
    $grouped = [];
    foreach ($articles as $article) {
        $category = trim((string) ($article['category'] ?? ''));
        if ($category === '') {
            $category = 'General';
        }
        $grouped[$category][] = $article;
    }

    uksort($grouped, 'strcasecmp');

    return $grouped;
}

/** @return array<string, list<array<string, mixed>>> */
function rgbj_help_articles_by_category(bool $includeDrafts = false): array
{
    $grouped = [];
    foreach (rgbj_help_load_articles($includeDrafts) as $article) {
        $category = $article['category'] !== '' ? $article['category'] : 'General';
        $grouped[$category][] = $article;
    }

    uksort($grouped, 'strcasecmp');

    return $grouped;
}

/** @return array<string, int> Tag label => article count */
function rgbj_help_tag_counts(bool $includeDrafts = false): array
{
    $counts = [];
    foreach (rgbj_help_load_articles($includeDrafts) as $article) {
        foreach ($article['tags'] as $tag) {
            $counts[$tag] = ($counts[$tag] ?? 0) + 1;
        }
    }

    uksort($counts, 'strcasecmp');

    return $counts;
}

function rgbj_help_index_url_with_tag(string $tag): string
{
    return rgbj_help_index_url() . '?tag=' . rawurlencode(rgbj_help_tag_slug($tag));
}

function rgbj_help_active_tag_from_request(): ?string
{
    $raw = trim((string) ($_GET['tag'] ?? ''));

    return $raw !== '' ? $raw : null;
}

function rgbj_help_resolve_active_tag(?string $tagSlug, bool $includeDrafts = false): ?string
{
    if ($tagSlug === null || $tagSlug === '') {
        return null;
    }

    foreach (array_keys(rgbj_help_tag_counts($includeDrafts)) as $tag) {
        if (rgbj_help_tag_slug($tag) === $tagSlug) {
            return $tag;
        }
    }

    return null;
}

function rgbj_help_get_article(string $slug, bool $includeDrafts = false): ?array
{
    $slug = trim($slug);
    if ($slug === '') {
        return null;
    }

    foreach (rgbj_help_load_articles($includeDrafts) as $article) {
        if ($article['slug'] === $slug) {
            return $article;
        }
    }

    return null;
}

function rgbj_help_embed_mode(): bool
{
    return isset($_GET['embed']) && (string) $_GET['embed'] === '1';
}

function rgbj_help_embed_css_url(): string
{
    $path = rgbj_app_root() . DIRECTORY_SEPARATOR . 'assets' . DIRECTORY_SEPARATOR . 'help-embed.css';
    $v = is_file($path) ? (string) @filemtime($path) : '1';

    return rgbj_url('assets/help-embed.css?v=' . $v);
}

function rgbj_help_link_url(string $url): string
{
    if (!rgbj_help_embed_mode() || $url === '') {
        return $url;
    }

    if (preg_match('/(?:^|[?&])embed=1(?:&|$)/', $url)) {
        return $url;
    }

    return $url . (str_contains($url, '?') ? '&' : '?') . 'embed=1';
}

function rgbj_help_article_url(string $slug): string
{
    return rgbj_help_link_url(rgbj_url('help/' . rawurlencode($slug) . '/'));
}

function rgbj_help_index_url(): string
{
    return rgbj_help_link_url(rgbj_url('help/'));
}

function rgbj_help_editor_url(): string
{
    return rgbj_url('help/edit/');
}

function rgbj_help_editor_article_url(string $slug): string
{
    return rgbj_help_editor_url() . '?slug=' . rawurlencode($slug);
}

function rgbj_help_admin_ui_enabled(): bool
{
    if (!function_exists('rgbj_help_editor_admin_uid')) {
        require_once __DIR__ . '/help-editor-auth.php';
    }

    return rgbj_help_editor_admin_uid() !== '';
}

function rgbj_help_api_url(): string
{
    return rgbj_url('help/api/articles.php');
}

function rgbj_help_gemini_api_url(): string
{
    return rgbj_url('help/api/gemini.php');
}

function rgbj_help_upload_image_api_url(): string
{
    return rgbj_url('help/api/upload-image.php');
}

function rgbj_help_images_api_url(): string
{
    return rgbj_url('help/api/images.php');
}

function rgbj_help_article_file_path(string $slug): ?string
{
    $slug = rgbj_help_tag_slug($slug);
    if ($slug === '' || strcasecmp($slug, 'readme') === 0) {
        return null;
    }

    return rgbj_help_content_dir() . DIRECTORY_SEPARATOR . $slug . '.md';
}

function rgbj_help_format_date_label(string $isoDate): string
{
    if ($isoDate === '') {
        return '';
    }

    $dt = DateTimeImmutable::createFromFormat('Y-m-d', $isoDate);
    if ($dt === false) {
        return $isoDate;
    }

    return $dt->format('M j, Y');
}

function rgbj_help_normalize_code_language(string $lang): ?string
{
    $lang = strtolower(trim($lang));
    if ($lang === '') {
        return null;
    }

    $aliases = [
        'js' => 'javascript',
        'javascript' => 'javascript',
        'node' => 'javascript',
        'mjs' => 'javascript',
        'cjs' => 'javascript',
    ];

    return $aliases[$lang] ?? $lang;
}

function rgbj_help_code_block_language_label(?string $language): string
{
    $normalized = rgbj_help_normalize_code_language($language ?? '');
    if ($normalized === null || $normalized === '') {
        return 'Code';
    }

    $labels = [
        'javascript' => 'JavaScript',
        'html' => 'HTML',
        'css' => 'CSS',
        'json' => 'JSON',
        'bash' => 'Bash',
        'shell' => 'Shell',
        'php' => 'PHP',
        'python' => 'Python',
        'markdown' => 'Markdown',
        'xml' => 'XML',
        'yaml' => 'YAML',
    ];

    return $labels[$normalized] ?? ucfirst($normalized);
}

function rgbj_help_parse_code_fence_info(string $info): array
{
    $info = trim($info);
    $title = null;

    if (preg_match('/\btitle=(["\'])(.*?)\1/i', $info, $m)) {
        $title = trim($m[2]);
        $info = trim(preg_replace('/\btitle=(["\']).*?\1/i', '', $info) ?? $info);
    }

    $langToken = preg_split('/\s+/', $info)[0] ?? '';
    $langToken = trim((string) $langToken);

    return [
        'language' => $langToken !== '' ? rgbj_help_normalize_code_language($langToken) : null,
        'title' => ($title !== null && $title !== '') ? $title : null,
    ];
}

function rgbj_help_code_block_display_title(?string $language, ?string $title): string
{
    $title = trim((string) ($title ?? ''));
    if ($title !== '') {
        return $title;
    }

    return rgbj_help_code_block_language_label($language);
}

function rgbj_help_normalize_code_fence_line(string $line): string
{
    if (preg_match('/^\s*<br\s*\/?>\s*$/i', $line)) {
        return '';
    }

    return preg_replace('/<br\s*\/?>/i', '', $line) ?? $line;
}

/** @param list<string> $lines */
function rgbj_help_render_code_block_copy_button(): string
{
    return '<button type="button" class="rgbj-help-code-block__copy" aria-label="Copy code to clipboard">'
        . '<i class="bi bi-clipboard" aria-hidden="true"></i>'
        . '<span>Copy</span>'
        . '</button>';
}

function rgbj_help_render_code_block_bar(?string $language, ?string $title = null): string
{
    $label = rgbj_help_code_block_display_title($language, $title);
    $customTitle = trim((string) ($title ?? '')) !== '';
    $titleClass = 'rgbj-help-code-block__title' . ($customTitle ? ' rgbj-help-code-block__title--custom' : ' rgbj-help-code-block__title--fallback');

    return '<div class="rgbj-help-code-block__bar">'
        . '<span class="' . $titleClass . '">'
        . htmlspecialchars($label, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')
        . '</span>'
        . rgbj_help_render_code_block_copy_button()
        . '</div>';
}

/** @param list<string> $lines */
function rgbj_help_render_code_block(array $lines, ?string $language, ?string $title = null): string
{
    $lineCount = count($lines);
    $code = htmlspecialchars(implode("\n", $lines), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $codeClass = 'rgbj-help-code';
    if ($language !== null && $language !== '') {
        $safeLang = preg_replace('/[^a-z0-9_-]/i', '', $language) ?? '';
        if ($safeLang !== '') {
            $codeClass .= ' language-' . $safeLang;
        }
    }

    $pre = '<pre class="rgbj-help-pre"><code class="'
        . htmlspecialchars($codeClass, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')
        . '">' . $code . '</code></pre>';
    $bar = rgbj_help_render_code_block_bar($language, $title);

    if ($lineCount <= RGBJ_HELP_CODE_FOLD_VISIBLE_LINES) {
        return '<div class="rgbj-help-code-block">' . $bar . $pre . '</div>';
    }

    $hiddenLines = $lineCount - RGBJ_HELP_CODE_FOLD_VISIBLE_LINES;
    $showLabel = $hiddenLines === 1 ? 'Show 1 more line' : 'Show ' . $hiddenLines . ' more lines';

    return '<div class="rgbj-help-code-block rgbj-help-code-fold is-collapsed" style="--rgbj-code-fold-visible-lines: '
        . RGBJ_HELP_CODE_FOLD_VISIBLE_LINES
        . ';" data-visible-lines="' . RGBJ_HELP_CODE_FOLD_VISIBLE_LINES
        . '" data-total-lines="' . $lineCount . '">'
        . $bar
        . '<div class="rgbj-help-code-fold__viewport">'
        . $pre
        . '</div>'
        . '<button type="button" class="rgbj-help-code-fold__toggle" aria-expanded="false">'
        . '<span class="rgbj-help-code-fold__toggle-show"><i class="bi bi-chevron-down" aria-hidden="true"></i> '
        . htmlspecialchars($showLabel, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')
        . '</span>'
        . '<span class="rgbj-help-code-fold__toggle-hide"><i class="bi bi-chevron-up" aria-hidden="true"></i> Show less</span>'
        . '</button>'
        . '</div>';
}

function rgbj_help_article_has_highlighted_code(string $html): bool
{
    return strpos($html, 'language-') !== false;
}

function rgbj_help_prism_head(): void
{
    ?>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-tomorrow.min.css">
    <?php
}

function rgbj_help_prism_scripts(): void
{
    ?>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-core.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/plugins/autoloader/prism-autoloader.min.js"></script>
    <script>
        if (window.Prism) {
            Prism.highlightAll();
        }
    </script>
    <?php
}

function rgbj_help_is_external_href(string $href): bool
{
    if ($href !== '' && $href[0] === '#') {
        return true;
    }

    return preg_match('#^(https?://|/|mailto:)#i', $href) === 1;
}

function rgbj_help_images_dir(): string
{
    return rgbj_help_content_dir() . DIRECTORY_SEPARATOR . 'images';
}

/** @return array{filename: string, path: string, url: string} */
function rgbj_help_save_uploaded_image(string $binary, string $mimeHint = '', string $nameHint = ''): array
{
    if ($binary === '') {
        throw new InvalidArgumentException('Empty image data.');
    }

    $maxBytes = 15 * 1024 * 1024;
    if (strlen($binary) > $maxBytes) {
        throw new InvalidArgumentException('Image is too large (max 15 MB).');
    }

    $allowed = [
        'image/png' => 'png',
        'image/jpeg' => 'jpg',
        'image/gif' => 'gif',
        'image/webp' => 'webp',
    ];

    $detected = $mimeHint;
    if (class_exists(finfo::class)) {
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $fromBuffer = $finfo->buffer($binary);
        if (is_string($fromBuffer) && $fromBuffer !== '') {
            $detected = $fromBuffer;
        }
    }

    $detected = strtolower(trim($detected));
    if (!isset($allowed[$detected])) {
        throw new InvalidArgumentException('Unsupported image type. Use PNG, JPEG, GIF, or WebP.');
    }

    $ext = $allowed[$detected];
    $dir = rgbj_help_images_dir();
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        throw new RuntimeException('Could not create help/content/images/.');
    }

    $base = rgbj_help_tag_slug(pathinfo($nameHint, PATHINFO_FILENAME));
    if ($base === '') {
        $base = 'paste-' . gmdate('Ymd-His');
    }

    $filename = $base . '.' . $ext;
    $counter = 1;
    while (is_file($dir . DIRECTORY_SEPARATOR . $filename)) {
        $filename = $base . '-' . $counter . '.' . $ext;
        $counter++;
    }

    $path = $dir . DIRECTORY_SEPARATOR . $filename;
    if (file_put_contents($path, $binary) === false) {
        throw new RuntimeException('Failed to save image file.');
    }

    return [
        'filename' => $filename,
        'path' => 'images/' . $filename,
        'url' => rgbj_url('help/content/images/' . rawurlencode($filename)),
    ];
}

/** @return list<array{filename: string, path: string, url: string, size: int, modified: int}> */
function rgbj_help_list_images(): array
{
    $dir = rgbj_help_images_dir();
    if (!is_dir($dir)) {
        return [];
    }

    $images = [];
    foreach (['png', 'jpg', 'jpeg', 'gif', 'webp'] as $ext) {
        foreach (glob($dir . DIRECTORY_SEPARATOR . '*.' . $ext) ?: [] as $path) {
            if (!is_file($path)) {
                continue;
            }

            $filename = basename($path);
            $images[$filename] = [
                'filename' => $filename,
                'path' => 'images/' . $filename,
                'url' => rgbj_url('help/content/images/' . rawurlencode($filename)),
                'size' => (int) filesize($path),
                'modified' => (int) filemtime($path),
            ];
        }
    }

    $list = array_values($images);
    usort($list, static fn (array $a, array $b): int => $b['modified'] <=> $a['modified']);

    return $list;
}

function rgbj_help_image_alt_from_filename(string $filename): string
{
    $base = pathinfo($filename, PATHINFO_FILENAME);

    return ucwords(str_replace(['-', '_'], ' ', $base));
}

function rgbj_help_sanitize_image_filename(string $filename): ?string
{
    $filename = basename(str_replace('\\', '/', trim($filename)));
    if ($filename === '' || strcasecmp($filename, '.gitkeep') === 0) {
        return null;
    }

    if (preg_match('/^[a-z0-9][a-z0-9._-]*\.(png|jpe?g|gif|webp)$/i', $filename) !== 1) {
        return null;
    }

    return $filename;
}

function rgbj_help_delete_image(string $filename): void
{
    $filename = rgbj_help_sanitize_image_filename($filename);
    if ($filename === null) {
        throw new InvalidArgumentException('Invalid image filename.');
    }

    $path = rgbj_help_images_dir() . DIRECTORY_SEPARATOR . $filename;
    if (!is_file($path)) {
        throw new InvalidArgumentException('Image not found.');
    }

    if (!@unlink($path)) {
        throw new RuntimeException('Failed to delete image file.');
    }
}

function rgbj_help_media_dir(): string
{
    return rgbj_help_content_dir() . DIRECTORY_SEPARATOR . 'media';
}

function rgbj_help_is_video_path(string $path): bool
{
    return preg_match('/\.(mp4|webm|ogg)$/i', $path) === 1;
}

/** @return array{filename: string, path: string, url: string, type: string} */
function rgbj_help_save_uploaded_video(string $binary, string $mimeHint = '', string $nameHint = ''): array
{
    if ($binary === '') {
        throw new InvalidArgumentException('Empty video data.');
    }

    $maxBytes = 50 * 1024 * 1024;
    if (strlen($binary) > $maxBytes) {
        throw new InvalidArgumentException('Video is too large (max 50 MB).');
    }

    $allowed = [
        'video/mp4' => 'mp4',
        'video/webm' => 'webm',
        'video/ogg' => 'ogg',
    ];

    $detected = $mimeHint;
    if (class_exists(finfo::class)) {
        $finfo = new finfo(FILEINFO_MIME_TYPE);
        $fromBuffer = $finfo->buffer($binary);
        if (is_string($fromBuffer) && $fromBuffer !== '') {
            $detected = $fromBuffer;
        }
    }

    $detected = strtolower(trim($detected));
    if (!isset($allowed[$detected])) {
        throw new InvalidArgumentException('Unsupported video type. Use MP4, WebM, or Ogg.');
    }

    $ext = $allowed[$detected];
    $dir = rgbj_help_media_dir();
    if (!is_dir($dir) && !mkdir($dir, 0755, true) && !is_dir($dir)) {
        throw new RuntimeException('Could not create help/content/media/.');
    }

    $base = rgbj_help_tag_slug(pathinfo($nameHint, PATHINFO_FILENAME));
    if ($base === '') {
        $base = 'clip-' . gmdate('Ymd-His');
    }

    $filename = $base . '.' . $ext;
    $counter = 1;
    while (is_file($dir . DIRECTORY_SEPARATOR . $filename)) {
        $filename = $base . '-' . $counter . '.' . $ext;
        $counter++;
    }

    $path = $dir . DIRECTORY_SEPARATOR . $filename;
    if (file_put_contents($path, $binary) === false) {
        throw new RuntimeException('Failed to save video file.');
    }

    return [
        'filename' => $filename,
        'path' => 'media/' . $filename,
        'url' => rgbj_url('help/content/media/' . rawurlencode($filename)),
        'type' => 'video',
    ];
}

/**
 * @return array{filename: string, path: string, url: string, type: string, markdown: string}
 */
function rgbj_help_save_uploaded_media(string $binary, string $mimeHint = '', string $nameHint = ''): array
{
    $mimeHint = strtolower(trim($mimeHint));
    if ($mimeHint !== '' && str_starts_with($mimeHint, 'video/')) {
        $saved = rgbj_help_save_uploaded_video($binary, $mimeHint, $nameHint);
    } else {
        $saved = rgbj_help_save_uploaded_image($binary, $mimeHint, $nameHint);
        $saved['type'] = 'image';
    }

    $alt = rgbj_help_image_alt_from_filename($saved['filename']);
    $saved['markdown'] = '![' . $alt . '](' . $saved['path'] . ')';

    return $saved;
}

/** @return list<array{filename: string, path: string, url: string, size: int, modified: int, type: string}> */
function rgbj_help_list_videos(): array
{
    $dir = rgbj_help_media_dir();
    if (!is_dir($dir)) {
        return [];
    }

    $videos = [];
    foreach (['mp4', 'webm', 'ogg'] as $ext) {
        foreach (glob($dir . DIRECTORY_SEPARATOR . '*.' . $ext) ?: [] as $path) {
            if (!is_file($path)) {
                continue;
            }

            $filename = basename($path);
            $videos[$filename] = [
                'filename' => $filename,
                'path' => 'media/' . $filename,
                'url' => rgbj_url('help/content/media/' . rawurlencode($filename)),
                'size' => (int) filesize($path),
                'modified' => (int) filemtime($path),
                'type' => 'video',
            ];
        }
    }

    $list = array_values($videos);
    usort($list, static fn (array $a, array $b): int => $b['modified'] <=> $a['modified']);

    return $list;
}

/** @return list<array{filename: string, path: string, url: string, size: int, modified: int, type: string}> */
function rgbj_help_list_media_library(): array
{
    $items = [];
    foreach (rgbj_help_list_images() as $image) {
        $items[] = array_merge($image, ['type' => 'image']);
    }
    foreach (rgbj_help_list_videos() as $video) {
        $items[] = $video;
    }

    usort($items, static fn (array $a, array $b): int => $b['modified'] <=> $a['modified']);

    return $items;
}

function rgbj_help_sanitize_media_filename(string $filename): ?string
{
    $filename = basename(str_replace('\\', '/', trim($filename)));
    if ($filename === '' || strcasecmp($filename, '.gitkeep') === 0) {
        return null;
    }

    if (preg_match('/^[a-z0-9][a-z0-9._-]*\.(png|jpe?g|gif|webp|mp4|webm|ogg)$/i', $filename) !== 1) {
        return null;
    }

    return $filename;
}

function rgbj_help_delete_media(string $filename): void
{
    $filename = rgbj_help_sanitize_media_filename($filename);
    if ($filename === null) {
        throw new InvalidArgumentException('Invalid media filename.');
    }

    if (rgbj_help_is_video_path($filename)) {
        $path = rgbj_help_media_dir() . DIRECTORY_SEPARATOR . $filename;
    } else {
        $path = rgbj_help_images_dir() . DIRECTORY_SEPARATOR . $filename;
    }

    if (!is_file($path)) {
        throw new InvalidArgumentException('Media file not found.');
    }

    if (!@unlink($path)) {
        throw new RuntimeException('Failed to delete media file.');
    }
}

function rgbj_help_normalize_media_path(string $src): string
{
    $src = ltrim(str_replace('\\', '/', trim($src)), './');
    if ($src === '' || strpos($src, '..') !== false) {
        return '';
    }

    if (str_starts_with($src, 'images/') || str_starts_with($src, 'media/')) {
        return $src;
    }

    if (rgbj_help_is_video_path($src)) {
        return 'media/' . $src;
    }

    return 'images/' . $src;
}

function rgbj_help_resolve_image_src(string $src): string
{
    return rgbj_help_resolve_media_src($src);
}

function rgbj_help_resolve_media_src(string $src): string
{
    $src = trim(str_replace('\\', '/', $src));
    if ($src === '') {
        return '';
    }

    if (preg_match('#^https?://#i', $src)) {
        return $src;
    }

    if ($src[0] === '/') {
        return $src;
    }

    $src = rgbj_help_normalize_media_path($src);
    if ($src === '') {
        return '';
    }

    return rgbj_url('help/content/' . $src);
}

function rgbj_help_render_image(string $alt, string $src): string
{
    return rgbj_help_render_media($alt, $src);
}

function rgbj_help_render_media(string $alt, string $src): string
{
    if (rgbj_help_is_video_path($src)) {
        $resolved = rgbj_help_resolve_media_src($src);
        if ($resolved === '') {
            return '';
        }

        return rgbj_help_build_video_html($alt, $resolved);
    }

    $resolved = rgbj_help_resolve_media_src($src);
    if ($resolved === '') {
        return '';
    }

    return rgbj_help_build_image_html($alt, $resolved, true);
}

function rgbj_help_build_video_html(string $alt, string $resolved): string
{
    $altEsc = htmlspecialchars($alt, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $srcEsc = htmlspecialchars($resolved, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

    $html = '<span class="rgbj-help-media-wrap rgbj-help-media-wrap--video">'
        . '<video class="rgbj-help-video rounded border border-secondary" controls playsinline preload="metadata" src="'
        . $srcEsc . '"></video>';
    if ($alt !== '') {
        $html .= '<span class="rgbj-help-image__caption small text-body-secondary d-block mt-2 mb-0">' . $altEsc . '</span>';
    }
    $html .= '</span>';

    return $html;
}

function rgbj_help_build_image_html(string $alt, string $resolved, bool $block = true): string
{
    $altEsc = htmlspecialchars($alt, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $srcEsc = htmlspecialchars($resolved, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

    $preview = '<a class="rgbj-help-image__link rgbj-help-image__zoom" href="' . $srcEsc . '">'
        . '<img class="rgbj-help-image rgbj-help-image--preview rounded border border-secondary" src="'
        . $srcEsc . '" alt="' . $altEsc . '" loading="lazy" decoding="async"></a>';

    $html = '<span class="rgbj-help-image-wrap rgbj-help-image-wrap--inline">' . $preview;
    if ($alt !== '') {
        $html .= '<span class="rgbj-help-image__caption small text-body-secondary d-block mt-2 mb-0">' . $altEsc . '</span>';
    }
    $html .= '</span>';

    return $html;
}

function rgbj_help_replace_markdown_images(string $text): string
{
    $result = '';
    $remaining = $text;

    while (preg_match('/!\[([^\]]*)\]\(([^)]+)\)/', $remaining, $m, PREG_OFFSET_CAPTURE)) {
        $pos = $m[0][1];
        $len = strlen($m[0][0]);
        $result .= substr($remaining, 0, $pos);

        $alt = $m[1][0];
        $src = $m[2][0];
        if (rgbj_help_is_video_path($src)) {
            $result .= rgbj_help_build_video_html($alt, rgbj_help_resolve_media_src($src));
        } else {
            $resolved = rgbj_help_resolve_media_src($src);
            if ($resolved !== '') {
                $result .= rgbj_help_build_image_html($alt, $resolved, false);
            }
        }

        $remaining = substr($remaining, $pos + $len);
    }

    return $result . $remaining;
}

function rgbj_help_replace_markdown_links(string $text): string
{
    $result = '';
    $remaining = $text;

    while (preg_match('/\[([^\]]+)\]\(([^)]+)\)/', $remaining, $m, PREG_OFFSET_CAPTURE)) {
        $pos = $m[0][1];
        $len = strlen($m[0][0]);
        $result .= substr($remaining, 0, $pos);

        $label = $m[1][0];
        $href = $m[2][0];
        if (!rgbj_help_is_external_href($href)) {
            $href = rgbj_help_article_url($href);
        }

        $result .= '<a href="' . htmlspecialchars($href, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '">' . $label . '</a>';
        $remaining = substr($remaining, $pos + $len);
    }

    return $result . $remaining;
}

function rgbj_help_repair_split_html_links(string $text): string
{
    $updated = preg_replace_callback(
        '/<a\s+[^>]*?href=(["\'])([^"\']+)\1[^>]*\starget\s*=\s*["\']?_blank[^>]*>\s*<\/a>`([^`]+)`<a\s+[^>]*?href=\1[^"\']+\1[^>]*\starget\s*=\s*["\']?_blank[^>]*>\s*<\/a>/iu',
        static function (array $matches): string {
            $href = htmlspecialchars($matches[2], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
            $code = htmlspecialchars($matches[3], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

            return '<a href="' . $href . '" target="_blank" rel="noopener noreferrer"><code>' . $code . '</code></a>';
        },
        $text
    );

    if (!is_string($updated)) {
        return $text;
    }

    $updated = preg_replace_callback(
        '/<a\s+[^>]*?href=(["\'])([^"\']+)\1[^>]*\starget\s*=\s*["\']?_blank[^>]*>\s*<\/a>([^<`]+?)<a\s+[^>]*?href=\1[^"\']+\1[^>]*\starget\s*=\s*["\']?_blank[^>]*>\s*<\/a>/iu',
        static function (array $matches): string {
            $href = htmlspecialchars($matches[2], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
            $label = htmlspecialchars($matches[3], ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

            return '<a href="' . $href . '" target="_blank" rel="noopener noreferrer">' . $label . '</a>';
        },
        $updated
    );

    return is_string($updated) ? $updated : $text;
}

/**
 * @return array{0: string, 1: array<string, string>}
 */
function rgbj_help_preserve_html_links(string $text): array
{
    $placeholders = [];
    $index = 0;

    $updated = preg_replace_callback(
        '/<a\s+[^>]*?href=(["\'])([^"\']*)\1[^>]*>.*?<\/a>/is',
        static function (array $matches) use (&$placeholders, &$index): string {
            $token = '%%RGBJ_HTML_LINK_' . $index . '%%';
            $placeholders[$token] = rgbj_help_normalize_html_link($matches[0]);
            $index++;

            return $token;
        },
        $text
    );

    return [$updated ?? $text, $placeholders];
}

function rgbj_help_normalize_html_link(string $html): string
{
    if (!preg_match('/href=(["\'])([^"\']+)\1/is', $html, $hrefMatch)) {
        return $html;
    }

    $href = $hrefMatch[2];
    if (!rgbj_help_is_external_href($href)) {
        $href = rgbj_help_article_url($href);
    }

    $targetBlank = (bool) preg_match('/\btarget\s*=\s*["\']?_blank/i', $html);
    $label = '';
    if (preg_match('/>(.*?)<\/a>/is', $html, $labelMatch)) {
        $label = $labelMatch[1];
    }

    $out = '<a href="' . htmlspecialchars($href, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') . '"';
    if ($targetBlank) {
        $out .= ' target="_blank" rel="noopener noreferrer"';
    }
    $out .= '>' . $label . '</a>';

    return $out;
}

function rgbj_help_inline_markdown(string $text): string
{
    $breakToken = '%%RGBJ_LINE_BREAK%%';
    $text = rgbj_help_repair_split_html_links($text);
    [$text, $htmlLinkPlaceholders] = rgbj_help_preserve_html_links($text);
    $text = preg_replace('/<br\s*\/?>/i', $breakToken, $text) ?? $text;

    $escaped = htmlspecialchars($text, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');

    $replaced = preg_replace('/`([^`]+)`/', '<code>$1</code>', $escaped);
    $escaped = is_string($replaced) ? $replaced : $escaped;

    $replaced = preg_replace('/\*\*([^*]+)\*\*/', '<strong>$1</strong>', $escaped);
    $escaped = is_string($replaced) ? $replaced : $escaped;

    $replaced = preg_replace('/\*([^*]+)\*/', '<em>$1</em>', $escaped);
    $escaped = is_string($replaced) ? $replaced : $escaped;

    $escaped = rgbj_help_replace_markdown_images($escaped);
    $escaped = rgbj_help_replace_markdown_links($escaped);

    $escaped = str_replace($breakToken, '<br>', $escaped);

    foreach ($htmlLinkPlaceholders as $token => $html) {
        $escaped = str_replace($token, $html, $escaped);
    }

    return $escaped;
}

function rgbj_help_heading_tag(int $level): string
{
    if ($level === 1) {
        return 'h2';
    }
    if ($level === 2) {
        return 'h3';
    }
    if ($level === 3) {
        return 'h4';
    }

    return 'h5';
}

function rgbj_help_is_table_row(string $line): bool
{
    $line = trim($line);

    return $line !== '' && $line[0] === '|';
}

/** @return list<string> */
function rgbj_help_parse_table_row(string $line): array
{
    $line = trim($line);
    if ($line === '' || $line[0] !== '|') {
        return [];
    }

    $line = trim($line, '|');
    if ($line === '') {
        return [''];
    }

    return array_map('trim', explode('|', $line));
}

/** @param list<string> $cells */
function rgbj_help_normalize_table_row(array $cells, int $columnCount): array
{
    if ($columnCount <= 0) {
        return $cells;
    }

    if (count($cells) >= $columnCount) {
        return array_slice(array_pad($cells, $columnCount, ''), 0, $columnCount);
    }

    if ($columnCount === 2 && count($cells) === 1) {
        $text = trim($cells[0]);
        if (
            $text !== ''
            && preg_match(
                '/^(.+?)\h+((?:Spaces|Lines|Moves|Mirrors|Resizes|Toggles|Treats|Turn|Adjust|Shows|Snaps|Breaks|Paints|Scales|Groups|Ungroups|While|Each|LED|Fill|Match|Group|Ungroup|Snap|Show|Center|Flip|Distribute|Align).+)$/u',
                $text,
                $matches
            ) === 1
        ) {
            return [trim($matches[1]), trim($matches[2])];
        }
    }

    return array_slice(array_pad($cells, $columnCount, ''), 0, $columnCount);
}

/** @param list<string> $cells */
function rgbj_help_format_table_row(array $cells): string
{
    return '| ' . implode(' | ', $cells) . ' |';
}

function rgbj_help_is_table_separator(string $line): bool
{
    $cells = rgbj_help_parse_table_row($line);
    if ($cells === []) {
        return false;
    }

    foreach ($cells as $cell) {
        if (!preg_match('/^:?-+:?$/', trim($cell))) {
            return false;
        }
    }

    return true;
}

/** @param list<string> $header @param list<list<string>> $rows */
function rgbj_help_render_table(array $header, array $rows): string
{
    if ($header === []) {
        return '';
    }

    $columnCount = count($header);
    $html = '<div class="rgbj-help-table-wrap"><table class="rgbj-help-table">';
    if ($columnCount === 2) {
        $html .= '<colgroup><col class="rgbj-help-table__col-tool"><col class="rgbj-help-table__col-desc"></colgroup>';
    }
    $html .= '<thead><tr>';
    foreach ($header as $cell) {
        $html .= '<th scope="col">' . rgbj_help_inline_markdown($cell) . '</th>';
    }
    $html .= '</tr></thead><tbody>';

    foreach ($rows as $row) {
        $row = rgbj_help_normalize_table_row($row, $columnCount);
        $html .= '<tr>';
        for ($i = 0; $i < $columnCount; $i++) {
            $cell = $row[$i] ?? '';
            $html .= '<td>' . rgbj_help_inline_markdown($cell) . '</td>';
        }
        $html .= '</tr>';
    }

    $html .= '</tbody></table></div>';

    return $html;
}

function rgbj_help_normalize_panel_type(string $raw): ?string
{
    $key = strtolower(trim($raw));
    $aliases = [
        'info' => 'information',
        'information' => 'information',
        'note' => 'information',
        'caution' => 'caution',
        'warning' => 'warning',
        'danger' => 'danger',
        'important' => 'danger',
    ];

    return $aliases[$key] ?? null;
}

function rgbj_help_panel_label(string $type): string
{
    return match ($type) {
        'information' => 'Information',
        'caution' => 'Caution',
        'warning' => 'Warning',
        'danger' => 'Danger',
        default => ucfirst($type),
    };
}

function rgbj_help_panel_icon(string $type): string
{
    return match ($type) {
        'information' => 'bi-info-circle',
        'caution' => 'bi-exclamation-triangle',
        'warning' => 'bi-exclamation-triangle-fill',
        'danger' => 'bi-exclamation-octagon',
        default => 'bi-info-circle',
    };
}

function rgbj_help_render_panel_body(string $bodyMarkdown): string
{
    $bodyMarkdown = trim($bodyMarkdown);
    if ($bodyMarkdown === '') {
        return '';
    }

    $rendered = rgbj_help_markdown_to_html($bodyMarkdown);

    return $rendered['html'];
}

function rgbj_help_render_panel(string $type, string $bodyMarkdown): string
{
    $typeEsc = htmlspecialchars($type, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $labelEsc = htmlspecialchars(rgbj_help_panel_label($type), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    $icon = rgbj_help_panel_icon($type);

    return '<aside class="rgbj-help-panel rgbj-help-panel--' . $typeEsc . '" role="note">'
        . '<div class="rgbj-help-panel__header">'
        . '<i class="bi ' . $icon . ' rgbj-help-panel__icon" aria-hidden="true"></i>'
        . '<span class="rgbj-help-panel__title">' . $labelEsc . '</span>'
        . '</div>'
        . '<div class="rgbj-help-panel__body">' . rgbj_help_render_panel_body($bodyMarkdown) . '</div>'
        . '</aside>';
}

/**
 * @param list<string> $lines
 * @return array{html: string, nextIndex: int}|null
 */
function rgbj_help_try_parse_blockquote_block(array $lines, int $startIndex): ?array
{
    $lineCount = count($lines);
    if ($startIndex >= $lineCount || !preg_match('/^>\s?(.*)$/', $lines[$startIndex])) {
        return null;
    }

    $quoteLines = [];
    for ($i = $startIndex; $i < $lineCount; $i++) {
        if (!preg_match('/^>\s?(.*)$/', $lines[$i], $m)) {
            break;
        }
        $quoteLines[] = $m[1];
    }

    if ($quoteLines === []) {
        return null;
    }

    $firstLine = trim($quoteLines[0]);
    $bodyLines = array_slice($quoteLines, 1);

        if (preg_match('/^\[!([a-z]+)\]\s*(.*)$/i', $firstLine, $panelMatch)) {
        $type = rgbj_help_normalize_panel_type($panelMatch[1]);
        if ($type !== null) {
            $leadingBody = trim($panelMatch[2] ?? '');
            if ($leadingBody !== '') {
                array_unshift($bodyLines, $leadingBody);
            }

            $label = rgbj_help_panel_label($type);
            $bodyLines = array_values(array_filter($bodyLines, static function (string $line) use ($type, $label): bool {
                $trimmed = trim($line);
                if ($trimmed === '') {
                    return false;
                }
                if (preg_match('/^\[!([a-z]+)\]\s*$/i', $trimmed)) {
                    return false;
                }
                if (strcasecmp($trimmed, $label) === 0) {
                    return false;
                }

                return true;
            }));

            return [
                'html' => rgbj_help_render_panel($type, trim(implode("\n", $bodyLines))),
                'nextIndex' => $startIndex + count($quoteLines),
            ];
        }
    }

    if (count($quoteLines) === 1) {
        $content = trim($quoteLines[0]);

        return [
            'html' => '<blockquote class="rgbj-help-callout">' . rgbj_help_inline_markdown($content) . '</blockquote>',
            'nextIndex' => $startIndex + 1,
        ];
    }

    $body = trim(implode("\n", $quoteLines));
    $rendered = rgbj_help_markdown_to_html($body);

    return [
        'html' => '<blockquote class="rgbj-help-callout">' . $rendered['html'] . '</blockquote>',
        'nextIndex' => $startIndex + count($quoteLines),
    ];
}

/**
 * @param list<string> $lines
 * @return array{html: string, nextIndex: int}|null
 */
function rgbj_help_try_parse_table_block(array $lines, int $startIndex): ?array
{
    $lineCount = count($lines);
    if ($startIndex >= $lineCount || !rgbj_help_is_table_row($lines[$startIndex])) {
        return null;
    }

    $tableLines = [];
    for ($i = $startIndex; $i < $lineCount && rgbj_help_is_table_row($lines[$i]); $i++) {
        $tableLines[] = $lines[$i];
    }

    if (count($tableLines) < 2) {
        return null;
    }

    if (rgbj_help_is_table_separator($tableLines[1])) {
        $header = rgbj_help_parse_table_row($tableLines[0]);
        $rows = [];
        for ($t = 2, $tMax = count($tableLines); $t < $tMax; $t++) {
            $rows[] = rgbj_help_normalize_table_row(rgbj_help_parse_table_row($tableLines[$t]), count($header));
        }

        return [
            'html' => rgbj_help_render_table($header, $rows),
            'nextIndex' => $startIndex + count($tableLines),
        ];
    }

    $header = rgbj_help_parse_table_row($tableLines[0]);
    $rows = [];
    for ($t = 1, $tMax = count($tableLines); $t < $tMax; $t++) {
        if (rgbj_help_is_table_separator($tableLines[$t])) {
            continue;
        }

        $rows[] = rgbj_help_normalize_table_row(rgbj_help_parse_table_row($tableLines[$t]), count($header));
    }

    if ($header === [] || $rows === []) {
        return null;
    }

    return [
        'html' => rgbj_help_render_table($header, $rows),
        'nextIndex' => $startIndex + count($tableLines),
    ];
}

function rgbj_help_markdown_to_html(string $markdown): array
{
    $markdown = str_replace(["\r\n", "\r"], "\n", trim($markdown));
    if ($markdown === '') {
        return ['html' => '', 'headings' => []];
    }

    $lines = explode("\n", $markdown);
    $html = [];
    $headings = [];
    $usedHeadingIds = [];
    $paragraph = [];
    $inUl = false;
    $inOl = false;
    $inCode = false;
    $openListItemContent = null;
    $codeLines = [];
    $codeLanguage = null;
    $codeTitle = null;

    $flushOpenListItem = static function () use (&$openListItemContent, &$html): void {
        if ($openListItemContent === null) {
            return;
        }

        $html[] = '<li>' . $openListItemContent . '</li>';
        $openListItemContent = null;
    };

    $flushParagraph = static function () use (&$paragraph, &$html, &$flushOpenListItem): void {
        $flushOpenListItem();
        if ($paragraph === []) {
            return;
        }
        $html[] = '<p>' . rgbj_help_inline_markdown(implode(' ', $paragraph)) . '</p>';
        $paragraph = [];
    };

    $closeLists = static function () use (&$inUl, &$inOl, &$html, &$flushOpenListItem): void {
        $flushOpenListItem();
        if ($inUl) {
            $html[] = '</ul>';
            $inUl = false;
        }
        if ($inOl) {
            $html[] = '</ol>';
            $inOl = false;
        }
    };

    $lineCount = count($lines);
    for ($lineIndex = 0; $lineIndex < $lineCount; $lineIndex++) {
        $line = $lines[$lineIndex];

        $tableBlock = rgbj_help_try_parse_table_block($lines, $lineIndex);
        if ($tableBlock !== null) {
            $flushParagraph();
            $closeLists();
            $html[] = $tableBlock['html'];
            $lineIndex = $tableBlock['nextIndex'] - 1;
            continue;
        }

        if ($inCode) {
            if (preg_match('/^```\s*$/', trim($line))) {
                $html[] = rgbj_help_render_code_block($codeLines, $codeLanguage, $codeTitle);
                $codeLines = [];
                $codeLanguage = null;
                $codeTitle = null;
                $inCode = false;
            } else {
                $codeLines[] = rgbj_help_normalize_code_fence_line($line);
            }
            continue;
        }

        if (preg_match('/^```(.*)$/', $line, $m)) {
            $flushParagraph();
            $closeLists();
            $fenceInfo = rgbj_help_parse_code_fence_info($m[1] ?? '');
            $inCode = true;
            $codeLanguage = $fenceInfo['language'];
            $codeTitle = $fenceInfo['title'];
            $codeLines = [];
            continue;
        }

        if (trim($line) === '') {
            if (($inUl || $inOl) && $openListItemContent !== null) {
                $nextIndex = $lineIndex + 1;
                while ($nextIndex < $lineCount && trim($lines[$nextIndex]) === '') {
                    $nextIndex++;
                }

                if ($nextIndex < $lineCount && preg_match('/^\s{2,}/', $lines[$nextIndex])) {
                    continue;
                }
            }

            $flushParagraph();
            $closeLists();
            continue;
        }

        if (($inUl || $inOl) && $openListItemContent !== null && preg_match('/^\s{2,}(.+)$/', $line, $m)) {
            $continuation = trim($m[1]);
            if (preg_match('/^!\[([^\]]*)\]\(([^)]+)\)\s*$/', $continuation, $im)) {
                $openListItemContent .= '<br>' . rgbj_help_render_media($im[1], $im[2]);
            } else {
                $openListItemContent .= '<br>' . rgbj_help_inline_markdown($continuation);
            }
            continue;
        }

        if (preg_match('/^(#{1,4})\s+(.+)$/', $line, $m)) {
            $flushParagraph();
            $closeLists();
            $level = strlen($m[1]);
            $tag = rgbj_help_heading_tag($level);
            $headingSource = trim($m[2]);
            $headingPlain = rgbj_help_heading_plain_text($headingSource);
            $headingId = rgbj_help_make_heading_id($headingPlain, $usedHeadingIds);
            $headings[] = [
                'level' => $level,
                'id' => $headingId,
                'text' => $headingPlain,
            ];
            $html[] = '<' . $tag . ' id="' . htmlspecialchars($headingId, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')
                . '" class="rgbj-help-heading">' . rgbj_help_inline_markdown($headingSource) . '</' . $tag . '>';
            continue;
        }

        if (preg_match('/^[-*+]\s+(.+)$/', $line, $m)) {
            $flushParagraph();
            if ($inOl) {
                $flushOpenListItem();
                $html[] = '</ol>';
                $inOl = false;
            }
            if (!$inUl) {
                $html[] = '<ul>';
                $inUl = true;
            }
            $flushOpenListItem();
            $openListItemContent = rgbj_help_inline_markdown(trim($m[1]));
            continue;
        }

        if (preg_match('/^\d+\.\s+(.+)$/', $line, $m)) {
            $flushParagraph();
            if ($inUl) {
                $flushOpenListItem();
                $html[] = '</ul>';
                $inUl = false;
            }
            if (!$inOl) {
                $html[] = '<ol>';
                $inOl = true;
            }
            $flushOpenListItem();
            $openListItemContent = rgbj_help_inline_markdown(trim($m[1]));
            continue;
        }

        if (preg_match('/^!\[([^\]]*)\]\(([^)]+)\)\s*$/', trim($line), $m)) {
            $flushParagraph();
            $closeLists();
            $html[] = rgbj_help_render_media($m[1], $m[2]);
            continue;
        }

        $blockquoteBlock = rgbj_help_try_parse_blockquote_block($lines, $lineIndex);
        if ($blockquoteBlock !== null) {
            $flushParagraph();
            $closeLists();
            $html[] = $blockquoteBlock['html'];
            $lineIndex = $blockquoteBlock['nextIndex'] - 1;
            continue;
        }

        if (preg_match('/^(?:-{3,}|\*{3,}|_{3,})\s*$/', $line)) {
            $flushParagraph();
            $closeLists();
            $html[] = '<hr class="rgbj-help-divider">';
            continue;
        }

        $paragraph[] = trim($line);
    }

    if ($inCode && $codeLines !== []) {
        $html[] = rgbj_help_render_code_block($codeLines, $codeLanguage, $codeTitle);
    }

    $flushParagraph();
    $closeLists();

    return [
        'html' => implode("\n", $html),
        'headings' => $headings,
    ];
}

function rgbj_help_show_drafts(): bool
{
    return isset($_GET['preview']) && $_GET['preview'] === '1';
}

function rgbj_render_help_index(): void
{
    $includeDrafts = rgbj_help_show_drafts();
    $grouped = rgbj_help_articles_by_category($includeDrafts);

    if ($grouped === []) {
        echo '<div class="alert alert-secondary border-secondary">';
        echo '<p class="mb-0">No help articles are published yet. Add a <code>.md</code> file under <code>RGBJunkieApp/help/content/</code> with a <code>published:</code> date in the front matter.</p>';
        echo '</div>';
        return;
    }

    if ($includeDrafts) {
        echo '<p class="small text-warning mb-4"><i class="bi bi-eye me-1"></i>Preview mode — draft articles are visible. Remove <code>?preview=1</code> from the URL before sharing.</p>';
    }

    foreach ($grouped as $category => $articles) {
        ?>
        <section class="rgbj-help-category mb-4" data-rgbj-help-index-section>
            <h2 class="h5 fw-bold text-body-emphasis mb-3"><i class="bi bi-folder2-open me-2 text-info"></i><?= rgbj_h($category) ?></h2>
            <div class="row g-3">
                <?php foreach ($articles as $article) :
                    $searchText = strtolower(
                        $article['title'] . ' ' . $article['summary'] . ' ' . $article['category'] . ' '
                        . implode(' ', $article['tags']) . ' ' . ($article['plain_text'] ?? '')
                    );
                    ?>
                <div
                    class="col-md-6"
                    data-rgbj-help-index-card
                    data-search-text="<?= rgbj_h($searchText) ?>"
                    data-tag-slugs="<?= rgbj_h(rgbj_help_article_tag_slugs($article['tags'])) ?>"
                >
                    <div class="card h-100 border-secondary shadow-sm rgbj-help-card position-relative">
                        <div class="card-body">
                            <div class="d-flex align-items-start justify-content-between gap-2 mb-2">
                                <h3 class="h6 card-title text-body-emphasis mb-0"><?= rgbj_h($article['title']) ?></h3>
                                <?php rgbj_render_help_article_admin_actions($article['slug'], $article['title']); ?>
                            </div>
                            <?php if ($article['summary'] !== '') : ?>
                            <p class="card-text text-body-secondary small mb-2"><?= rgbj_h($article['summary']) ?></p>
                            <?php endif; ?>
                            <p class="card-text small text-body-secondary mb-0">
                                <?php if ($article['draft']) : ?>
                                <span class="badge text-bg-warning me-1">Draft</span>
                                <?php endif; ?>
                                <?php if ($article['published'] !== '') : ?>
                                <i class="bi bi-calendar3 me-1 opacity-75"></i><?= rgbj_h(rgbj_help_format_date_label($article['published'])) ?>
                                <?php endif; ?>
                            </p>
                            <a
                                href="<?= rgbj_h(rgbj_help_article_url($article['slug'])) ?>"
                                class="stretched-link"
                                aria-label="Read <?= rgbj_h($article['title']) ?>"
                            ></a>
                        </div>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </section>
        <?php
    }
}

function rgbj_render_help_article(array $article): void
{
    ?>
    <article class="rgbj-help-article">
        <header class="mb-4">
            <?php if ($article['category'] !== '') : ?>
            <p class="small text-body-secondary mb-2"><i class="bi bi-tag me-1"></i><?= rgbj_h($article['category']) ?></p>
            <?php endif; ?>
            <div class="d-flex flex-wrap align-items-start justify-content-between gap-2 mb-2">
                <h1 class="h2 fw-bold text-body-emphasis mb-0"><?= rgbj_h($article['title']) ?></h1>
                <?php rgbj_render_help_article_admin_actions($article['slug'], $article['title']); ?>
            </div>
            <?php if ($article['summary'] !== '') : ?>
            <p class="lead text-body-secondary fs-6 mb-2"><?= rgbj_h($article['summary']) ?></p>
            <?php endif; ?>
            <p class="small text-body-secondary mb-0">
                <?php if ($article['draft']) : ?>
                <span class="badge text-bg-warning me-2">Draft preview</span>
                <?php endif; ?>
                <?php if ($article['published'] !== '') : ?>
                <span><i class="bi bi-calendar3 me-1"></i>Published <?= rgbj_h(rgbj_help_format_date_label($article['published'])) ?></span>
                <?php endif; ?>
                <?php if ($article['updated'] !== '' && $article['updated'] !== $article['published']) : ?>
                <span class="ms-2"><i class="bi bi-pencil me-1"></i>Updated <?= rgbj_h(rgbj_help_format_date_label($article['updated'])) ?></span>
                <?php endif; ?>
            </p>
        </header>
        <div class="card border-secondary shadow-sm">
            <div class="card-body rgbj-help-article__body">
                <?= $article['html'] ?>
            </div>
        </div>
    </article>
    <?php
}

function rgbj_help_heading_plain_text(string $markdown): string
{
    $text = rgbj_help_inline_markdown($markdown);

    return trim(html_entity_decode(strip_tags($text), ENT_QUOTES | ENT_HTML5, 'UTF-8'));
}

function rgbj_help_make_heading_id(string $text, array &$used): string
{
    $base = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $text) ?? 'section');
    $base = trim($base, '-');
    if ($base === '') {
        $base = 'section';
    }

    $id = $base;
    $suffix = 2;
    while (isset($used[$id])) {
        $id = $base . '-' . $suffix;
        $suffix++;
    }
    $used[$id] = true;

    return $id;
}

function rgbj_help_markdown_plain_text(string $markdown): string
{
    $markdown = preg_replace('/```.*?```/s', ' ', $markdown) ?? $markdown;
    $markdown = preg_replace('/!\[[^\]]*\]\([^)]+\)/', ' ', $markdown) ?? $markdown;
    $markdown = preg_replace('/\[([^\]]+)\]\([^)]+\)/', '$1', $markdown) ?? $markdown;
    $markdown = preg_replace('/^#{1,6}\s+/m', ' ', $markdown) ?? $markdown;
    $markdown = preg_replace('/^>\s*\[!([a-z]+)\]\s*/im', ' ', $markdown) ?? $markdown;
    $markdown = preg_replace('/^>\s+/m', ' ', $markdown) ?? $markdown;
    $markdown = preg_replace('/^\|.*\|$/m', ' ', $markdown) ?? $markdown;
    $markdown = preg_replace('/[*_`>#-]+/', ' ', $markdown) ?? $markdown;
    $markdown = preg_replace('/\s+/', ' ', $markdown) ?? $markdown;

    return trim($markdown);
}

/** @return list<array{slug: string, title: string, summary: string, category: string, url: string, text: string}> */
function rgbj_help_search_entries(bool $includeDrafts = false): array
{
    $entries = [];
    foreach (rgbj_help_load_articles($includeDrafts) as $article) {
        $entries[] = [
            'slug' => $article['slug'],
            'title' => $article['title'],
            'summary' => $article['summary'],
            'category' => $article['category'],
            'url' => rgbj_help_article_url($article['slug']),
            'text' => strtolower(
                $article['title'] . ' '
                . $article['summary'] . ' '
                . $article['category'] . ' '
                . $article['slug'] . ' '
                . ($article['plain_text'] ?? '')
            ),
        ];
    }

    return $entries;
}

function rgbj_render_help_search_bar(bool $includeDrafts = false): void
{
    $entries = rgbj_help_search_entries($includeDrafts);
    ?>
    <div class="rgbj-help-search mb-4" data-rgbj-help-search>
        <label class="form-label visually-hidden" for="rgbj-help-search-input">Search help articles</label>
        <div class="input-group input-group-lg rgbj-help-search__input-wrap">
            <span class="input-group-text border-secondary"><i class="bi bi-search" aria-hidden="true"></i></span>
            <input
                type="search"
                id="rgbj-help-search-input"
                class="form-control border-secondary"
                placeholder="Search help articles…"
                autocomplete="off"
                spellcheck="false"
                data-rgbj-help-search-input
            >
        </div>
        <div class="rgbj-help-search__results d-none" data-rgbj-help-search-results role="listbox" aria-label="Search results"></div>
        <script type="application/json" id="rgbj-help-search-data"><?= json_encode($entries, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) ?></script>
    </div>
    <?php
}

function rgbj_render_help_doc_map(?string $activeSlug, bool $includeDrafts = false): void
{
    $grouped = rgbj_help_articles_by_category($includeDrafts);
    $tagCounts = rgbj_help_tag_counts($includeDrafts);
    $activeTagSlug = rgbj_help_active_tag_from_request();
    ?>
    <nav class="rgbj-help-sidebar-panel" aria-label="Help articles">
        <div class="rgbj-help-sidebar-panel__header">
            <i class="bi bi-map me-2 text-info" aria-hidden="true"></i>All articles
        </div>
        <div class="rgbj-help-sidebar-panel__body">
            <ul class="rgbj-help-doc-map list-unstyled mb-0">
                <li class="rgbj-help-toc__item">
                    <a href="<?= rgbj_h(rgbj_help_index_url()) ?>" class="rgbj-help-toc__link<?= $activeSlug === null && $activeTagSlug === null ? ' is-active' : '' ?>">
                        <i class="bi bi-grid me-2 opacity-75" aria-hidden="true"></i>Help Center home
                    </a>
                </li>
                <?php foreach ($grouped as $category => $articles) : ?>
                <li class="rgbj-help-doc-map__section">
                    <p class="rgbj-help-doc-map__group-label">
                        <?= rgbj_h($category) ?>
                        <span class="rgbj-help-doc-map__group-count"><?= count($articles) ?></span>
                    </p>
                    <ul class="rgbj-help-doc-map__articles list-unstyled mb-0">
                        <?php foreach ($articles as $article) :
                            $isActive = $activeSlug === $article['slug'];
                            ?>
                        <li class="rgbj-help-toc__item rgbj-help-toc__item--depth-3 rgbj-help-doc-map__item" data-tag-slugs="<?= rgbj_h(rgbj_help_article_tag_slugs($article['tags'])) ?>">
                            <a
                                href="<?= rgbj_h(rgbj_help_article_url($article['slug'])) ?>"
                                class="rgbj-help-toc__link<?= $isActive ? ' is-active' : '' ?>"
                                <?= $isActive ? ' aria-current="page"' : '' ?>
                            ><?= rgbj_h($article['title']) ?></a>
                        </li>
                        <?php endforeach; ?>
                    </ul>
                </li>
                <?php endforeach; ?>
            </ul>

            <?php if ($tagCounts !== []) : ?>
            <div class="rgbj-help-tags">
                <p class="rgbj-help-tags__label"><i class="bi bi-tags me-1" aria-hidden="true"></i>Tags</p>
                <div class="rgbj-help-tags__list" role="list" aria-label="Article tags">
                    <?php foreach ($tagCounts as $tag => $count) :
                        $tagSlug = rgbj_help_tag_slug($tag);
                        $isTagActive = $activeTagSlug === $tagSlug;
                        ?>
                    <a
                        href="<?= rgbj_h(rgbj_help_index_url_with_tag($tag)) ?>"
                        class="rgbj-help-tag<?= $isTagActive ? ' is-active' : '' ?>"
                        role="listitem"
                        data-rgbj-help-tag="<?= rgbj_h($tagSlug) ?>"
                        data-rgbj-help-tag-label="<?= rgbj_h($tag) ?>"
                        aria-pressed="<?= $isTagActive ? 'true' : 'false' ?>"
                    ><?= rgbj_h($tag) ?><span class="rgbj-help-tag__count"><?= (int) $count ?></span></a>
                    <?php endforeach; ?>
                </div>
            </div>
            <?php endif; ?>
            <?php rgbj_help_editor_nav_link(); ?>
        </div>
    </nav>
    <?php
}

/** @param list<array{level: int, id: string, text: string}> $headings */
function rgbj_render_help_toc(array $headings): void
{
    ?>
    <nav class="rgbj-help-sidebar-panel rgbj-help-sidebar-panel--toc" aria-label="On this page">
        <div class="rgbj-help-sidebar-panel__header">
            <i class="bi bi-list-ul me-2 text-info" aria-hidden="true"></i>On this page
        </div>
        <div class="rgbj-help-sidebar-panel__body">
            <?php if ($headings === []) : ?>
            <p class="small text-body-secondary mb-0">No sections in this article.</p>
            <?php else : ?>
            <ul class="rgbj-help-toc list-unstyled mb-0">
                <?php foreach ($headings as $heading) :
                    $level = (int) $heading['level'];
                    $depthClass = 'rgbj-help-toc__item--depth-' . max(1, min(4, $level));
                    ?>
                <li class="rgbj-help-toc__item <?= rgbj_h($depthClass) ?>">
                    <a href="#<?= rgbj_h($heading['id']) ?>" class="rgbj-help-toc__link"><?= rgbj_h($heading['text']) ?></a>
                </li>
                <?php endforeach; ?>
            </ul>
            <?php endif; ?>
        </div>
    </nav>
    <?php
}

function rgbj_help_article_content_css_url(): string
{
    $path = rgbj_app_root() . DIRECTORY_SEPARATOR . 'assets' . DIRECTORY_SEPARATOR . 'help-article-content.css';
    $v = is_file($path) ? (string) filemtime($path) : '1';

    return rgbj_url('assets/help-article-content.css?v=' . $v);
}

/**
 * Help Center pages need help-article-content.css linked directly in the head.
 * A mid-file @import inside rgbjunkie-app.css is ignored by browsers.
 *
 * @param array{title: string, description: string, og?: bool, app_css?: bool, extra_css?: list<string>} $opts
 */
function rgbj_help_page_head(array $opts): void
{
    $extraCss = $opts['extra_css'] ?? [];
    $extraCss = array_merge([rgbj_help_article_content_css_url()], $extraCss);
    if (rgbj_help_embed_mode()) {
        $extraCss[] = rgbj_help_embed_css_url();
    }
    $opts['extra_css'] = $extraCss;
    rgbj_page_head($opts);
}

function rgbj_help_shell_open(): void
{
    if (rgbj_help_embed_mode()) {
        echo '<body class="rgbj-help-embed d-flex flex-column min-vh-100">';
        echo '<main class="flex-grow-1 rgbj-help-embed__main">';
        echo '<div class="container-fluid px-3 py-3 rgbj-help-page">';

        return;
    }

    rgbj_page_analytics();
    rgbj_render_page_nav();
}

function rgbj_help_shell_close(): void
{
    if (!rgbj_help_embed_mode()) {
        return;
    }

    echo '</div></main>';
    rgbj_help_page_scripts();
    echo '<script src="' . rgbj_h(rgbj_url('assets/help-embed.js')) . '" defer></script>';
    rgbj_page_scripts_end();
}

function rgbj_help_page_scripts(): void
{
    ?>
    <script src="<?= rgbj_h(rgbj_url('assets/help-image-lightbox.js')) ?>" defer></script>
    <script src="<?= rgbj_h(rgbj_url('assets/help-center.js')) ?>" defer></script>
    <?php
    if (rgbj_help_admin_ui_enabled()) {
        ?>
    <script>
        window.RGBJ_HELP_ADMIN = {
            apiUrl: <?= json_encode(rgbj_help_api_url(), JSON_THROW_ON_ERROR) ?>,
            helpIndexUrl: <?= json_encode(rgbj_help_index_url(), JSON_THROW_ON_ERROR) ?>,
        };
    </script>
    <script type="module" src="/js/firebase.js"></script>
        <?php
        rgbj_page_admin_nav_scripts();
    }
}

function rgbj_render_help_article_admin_actions(string $slug, string $title): void
{
    if (!rgbj_help_admin_ui_enabled()) {
        return;
    }
    ?>
    <div class="d-flex flex-wrap align-items-center gap-2 flex-shrink-0 d-none rgbj-help-admin-only">
        <a
            href="<?= rgbj_h(rgbj_help_editor_article_url($slug)) ?>"
            class="btn btn-sm btn-outline-info rgbj-help-article-edit"
            title="Edit this article"
        ><i class="bi bi-pencil-square me-1" aria-hidden="true"></i>Edit</a>
        <button
            type="button"
            class="btn btn-sm btn-outline-danger rgbj-help-article-delete"
            title="Delete this article"
            data-slug="<?= rgbj_h($slug) ?>"
            data-title="<?= rgbj_h($title) ?>"
        ><i class="bi bi-trash me-1" aria-hidden="true"></i>Delete</button>
    </div>
    <?php
}

function rgbj_help_editor_nav_link(): void
{
    if (!rgbj_help_admin_ui_enabled()) {
        return;
    }
    ?>
    <p class="small mb-0 mt-3 pt-3 border-top rgbj-help-editor-link-wrap d-none rgbj-help-admin-only">
        <a href="<?= rgbj_h(rgbj_help_editor_url()) ?>" class="link-info"><i class="bi bi-pencil-square me-1"></i>Edit articles</a>
    </p>
    <?php
}
