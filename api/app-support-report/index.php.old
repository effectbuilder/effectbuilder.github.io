<?php
/**
 * RGBJunkie desktop app — support report ingest (PHP)
 *
 * URL: https://rgbjunkie.com/api/app-support-report/
 *
 * **Multipart (schema v2)** — preferred: field `metadata` (JSON) + file uploads:
 *   file_rgbjunkie_log, file_hardware_snapshot, file_rgbjunkie_log_prev (timestamped rgbjunkie_*.log)
 *
 * **Legacy JSON (schema v1)** — plain POST body application/json (older app builds).
 *
 * Server: raise limits — e.g. `upload_max_filesize=16M`, `post_max_size=32M`, `max_execution_time=120`.
 *
 * Env: RGBJUNKIE_SUPPORT_TO, RGBJUNKIE_SUPPORT_FROM
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$contentType = $_SERVER['CONTENT_TYPE'] ?? '';

if (stripos($contentType, 'multipart/form-data') !== false) {
    handle_multipart_v2();
} else {
    handle_legacy_json_v1();
}

/**
 * Desktop app v2: multipart/form-data + attachments.
 */
function handle_multipart_v2(): void
{
    $metaRaw = $_POST['metadata'] ?? '';
    if ($metaRaw === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Missing metadata field']);
        exit;
    }

    $data = json_decode($metaRaw, true);
    if (!is_array($data) || (int)($data['schema_version'] ?? 0) < 2) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid metadata JSON or schema_version']);
        exit;
    }

    $to = getenv('RGBJUNKIE_SUPPORT_TO') ?: 'admin@rgbjunkie.com';
    $from = getenv('RGBJUNKIE_SUPPORT_FROM') ?: 'noreply@rgbjunkie.com';

    $appVersion = $data['app']['version'] ?? '?';
    $contact = $data['contact'] ?? [];
    $display = trim((string)($contact['display_name'] ?? ''));
    $email = trim((string)($contact['email'] ?? ''));
    if ($display === '' && $email === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Provide at least a name or an email so support can reply.']);
        exit;
    }

    $subject = "[RGBJunkie {$appVersion}] Support report";
    if ($display !== '' || $email !== '') {
        $subject .= ' — ' . ($display !== '' ? $display : $email);
    }

    $html = build_support_email_html_v2($data);

    $attMeta = is_array($data['attachments'] ?? null) ? $data['attachments'] : [];
    $attachDefs = [
        'file_rgbjunkie_log' => 'rgbjunkie.log',
        'file_hardware_snapshot' => 'hardware-snapshot.txt',
        'file_rgbjunkie_log_prev' => null,
    ];
    $attachments = [];
    foreach ($attachDefs as $field => $defaultName) {
        if (
            !isset($_FILES[$field]['tmp_name'])
            || !is_string($_FILES[$field]['tmp_name'])
            || $_FILES[$field]['tmp_name'] === ''
            || !is_uploaded_file($_FILES[$field]['tmp_name'])
        ) {
            continue;
        }
        $tmp = $_FILES[$field]['tmp_name'];
        if ($field === 'file_rgbjunkie_log_prev') {
            $upName = $_FILES[$field]['name'] ?? '';
            if (is_string($upName) && $upName !== '') {
                $filename = basename($upName);
            } else {
                $fn = trim((string)($attMeta['rgbjunkie_rotated_log_filename'] ?? ''));
                $filename = $fn !== '' ? basename($fn) : 'rgbjunkie_rotated.log';
            }
        } else {
            $filename = (string) $defaultName;
        }
        $attachments[$filename] = $tmp;
    }

    $subjectEncoded = function_exists('mb_encode_mimeheader')
        ? mb_encode_mimeheader($subject, 'UTF-8')
        : $subject;

    [$mimeBody, $mixedBoundary] = build_multipart_mixed_email($html, $attachments);

    $headers = [
        'From: ' . $from,
        'MIME-Version: 1.0',
        'Content-Type: multipart/mixed; boundary="' . $mixedBoundary . '"',
        'X-Mailer: RGBJunkie-support-ingest-v2',
    ];
    if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL) !== false) {
        $headers[] = 'Reply-To: <' . $email . '>';
    }

    $ok = @mail($to, $subjectEncoded, $mimeBody, implode("\r\n", $headers));
    if (!$ok) {
        http_response_code(500);
        echo json_encode(['error' => 'Mail send failed (check server mail configuration).']);
        exit;
    }

    http_response_code(200);
    echo json_encode(['ok' => true, 'message' => 'Report received.']);
}

/**
 * @param array<string,mixed> $data
 */
function build_support_email_html_v2(array $data): string
{
    $app = $data['app'] ?? [];
    $contact = $data['contact'] ?? [];
    $pc = $data['pc'] ?? [];
    $note = trim((string)($data['user_note'] ?? ''));
    $att = is_array($data['attachments'] ?? null) ? $data['attachments'] : [];

    $h = static function (string $s): string {
        return htmlspecialchars($s, ENT_QUOTES | ENT_HTML5, 'UTF-8');
    };

    $wmiBlock = format_wmi_hardware_html(is_array($pc['wmi'] ?? null) ? $pc['wmi'] : [], $h);
    $attachBlock = format_attachments_summary_html($att, $h);

    ob_start();
    ?>
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>RGBJunkie support</title></head>
<body style="font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.45;color:#1a1a1a;">
  <h2 style="margin:0 0 12px;">RGBJunkie support report</h2>
  <table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse;border-color:#ccc;">
    <tr><td><strong>App</strong></td><td><?php
    $appLine = trim(($app['name'] ?? '') . ' ' . ($app['version'] ?? ''));
    $bid = isset($app['build_id']) ? (string)$app['build_id'] : '';
    if ($bid !== '' && $bid !== 'dev') {
        $appLine .= ' (build ' . $bid . ')';
    }
    echo $h($appLine);
    ?></td></tr>
    <tr><td><strong>Name</strong></td><td><?= $h((string)($contact['display_name'] ?? '')) ?></td></tr>
    <tr><td><strong>Email</strong></td><td><?= $h((string)($contact['email'] ?? '')) ?></td></tr>
    <tr><td><strong>OS / arch</strong></td><td><?= $h((string)($pc['os'] ?? '') . ' / ' . (string)($pc['arch'] ?? '')) ?></td></tr>
    <tr><td valign="top"><strong>Attachments sent</strong></td><td><?= $attachBlock ?></td></tr>
  </table>
  <?php if ($note !== '') : ?>
  <h3 style="margin:20px 0 8px;">User note</h3>
  <p style="white-space:pre-wrap;margin:0;"><?= nl2br($h($note)) ?></p>
  <?php endif; ?>
  <?php if ($wmiBlock !== '') : ?>
  <h3 style="margin:20px 0 8px;">WMI / hardware</h3>
  <div style="background:#f5f5f5;padding:12px;border-radius:6px;font-size:13px;line-height:1.5;"><?= $wmiBlock ?></div>
  <?php endif; ?>
  <p style="margin-top:24px;font-size:12px;color:#666;">Files listed above are attached to this message when marked included.</p>
</body>
</html>
<?php
    return (string) ob_get_clean();
}

/**
 * Booleans from JSON decode — avoid !empty() (it mishandles some edge cases).
 *
 * @param array<string,mixed> $att
 */
function support_attachment_flag_true(array $att, string $key): bool
{
    if (!array_key_exists($key, $att)) {
        return false;
    }
    $v = $att[$key];
    return $v === true || $v === 1 || $v === '1';
}

/** Hide legacy numeric names (rgbjunkie.log.1); show timestamp archives as-is. */
function normalize_rotated_log_display_label(string $filename): string
{
    $f = trim($filename);
    if ($f === '' || preg_match('/^rgbjunkie\.log\.\d+$/i', $f)) {
        return 'Previous log archive';
    }

    return $f;
}

/**
 * Human-readable attachment summary from metadata (matches desktop app schema).
 *
 * @param array<string,mixed> $att
 * @param callable(string): string $h
 */
function format_attachments_summary_html(array $att, callable $h): string
{
    $items = [];
    $baseRows = [
        ['flag' => 'rgbjunkie_log', 'label' => 'rgbjunkie.log', 'bytes_key' => 'rgbjunkie_log_bytes'],
        ['flag' => 'hardware_snapshot', 'label' => 'hardware-snapshot.txt', 'bytes_key' => null],
    ];
    foreach ($baseRows as $row) {
        $included = support_attachment_flag_true($att, $row['flag']);
        $bytes = ($row['bytes_key'] !== null && isset($att[$row['bytes_key']])) ? (int) $att[$row['bytes_key']] : null;
        $status = $included ? 'Included' : 'Not attached';
        $detail = $status;
        if ($included && $bytes !== null && $bytes > 0) {
            $detail .= ' · ' . format_byte_size($bytes);
        } elseif ($included) {
            $detail .= ' · size not reported';
        }
        $items[] =
            '<li style="margin:6px 0;"><strong>' . $h($row['label']) . '</strong> — ' . $h($detail) . '</li>';
    }

    // Only list a previous/rotated log when the app actually attached one (never show “Not attached” here).
    if (support_attachment_flag_true($att, 'rgbjunkie_log_rotated')) {
        $fn = trim((string) ($att['rgbjunkie_rotated_log_filename'] ?? ''));
        $label = normalize_rotated_log_display_label($fn);
        $items[] =
            '<li style="margin:6px 0;"><strong>' . $h($label) . '</strong> — ' . $h('Included · size not reported') . '</li>';
    }

    return '<ul style="margin:0;padding-left:20px;">' . implode('', $items) . '</ul>';
}

function format_byte_size(int $bytes): string
{
    if ($bytes < 1024) {
        return $bytes . ' B';
    }
    if ($bytes < 1024 * 1024) {
        return round($bytes / 1024, 1) . ' KB';
    }

    return round($bytes / (1024 * 1024), 2) . ' MB';
}

/**
 * Formatted WMI / CIM text (Win32_BaseBoard, BIOS, PhysicalMemory from app JSON).
 *
 * @param array<string,mixed> $wmi
 * @param callable(string): string $h
 */
function format_wmi_hardware_html(array $wmi, callable $h): string
{
    $parts = [];

    $mb = $wmi['motherboard'] ?? null;
    if (is_array($mb)) {
        $lines = [];
        foreach (
            [
                'manufacturer' => 'Manufacturer',
                'product' => 'Product',
                'serial_number' => 'Serial number',
            ] as $key => $lbl
        ) {
            $v = trim((string) ($mb[$key] ?? ''));
            if ($v !== '') {
                $lines[] = '<div><strong>' . $h($lbl) . '</strong> ' . $h($v) . '</div>';
            }
        }
        if ($lines !== []) {
            $parts[] = '<p style="margin:0 0 12px;"><strong>Motherboard</strong></p>' . implode('', $lines);
        }
    }

    $bios = $wmi['bios'] ?? null;
    if (is_array($bios)) {
        $lines = [];
        foreach (
            [
                'release_date' => 'BIOS release date',
                'version' => 'BIOS version',
            ] as $key => $lbl
        ) {
            $v = trim((string) ($bios[$key] ?? ''));
            if ($v !== '') {
                $lines[] = '<div><strong>' . $h($lbl) . '</strong> ' . $h($v) . '</div>';
            }
        }
        if ($lines !== []) {
            $parts[] = '<p style="margin:12px 0 8px;"><strong>BIOS</strong></p>' . implode('', $lines);
        }
    }

    $mem = $wmi['memory_modules'] ?? null;
    if (is_array($mem) && $mem !== []) {
        $blocks = [];
        foreach ($mem as $idx => $mod) {
            if (!is_array($mod)) {
                continue;
            }
            $man = trim((string) ($mod['manufacturer'] ?? ''));
            $pn = trim((string) ($mod['part_number'] ?? ''));
            if ($man === '' && $pn === '') {
                continue;
            }
            $n = (int) $idx + 1;
            $line = '<div style="margin:8px 0;padding-left:8px;border-left:3px solid #ccc;">';
            $line .= '<strong>' . $h('Module ' . $n) . '</strong>';
            if ($man !== '') {
                $line .= '<br>' . $h('Manufacturer') . ': ' . $h($man);
            }
            if ($pn !== '') {
                $line .= '<br>' . $h('Part number') . ': ' . $h($pn);
            }
            $line .= '</div>';
            $blocks[] = $line;
        }
        if ($blocks !== []) {
            $parts[] = '<p style="margin:12px 0 8px;"><strong>Memory modules</strong></p>' . implode('', $blocks);
        }
    }

    if ($parts === []) {
        return '';
    }

    return implode('', $parts);
}

/**
 * @param array<string,string> $attachments filename => temp path on disk
 * @return array{0:string,1:string} body and boundary
 */
function build_multipart_mixed_email(string $html, array $attachments): array
{
    $mixed = '=_rgbjunkie_mixed_' . bin2hex(random_bytes(12));

    $lines = [];
    $lines[] = '--' . $mixed;
    $lines[] = 'Content-Type: text/html; charset=UTF-8';
    $lines[] = 'Content-Transfer-Encoding: base64';
    $lines[] = '';
    $lines[] = chunk_split(base64_encode($html));

    foreach ($attachments as $filename => $tmpPath) {
        $bin = @file_get_contents($tmpPath);
        if ($bin === false || $bin === '') {
            continue;
        }
        $safeName = preg_replace('/[^a-zA-Z0-9._-]/', '_', $filename) ?: 'attachment.bin';
        $lines[] = '--' . $mixed;
        $lines[] = 'Content-Type: application/octet-stream; name="' . $safeName . '"';
        $lines[] = 'Content-Transfer-Encoding: base64';
        $lines[] = 'Content-Disposition: attachment; filename="' . $safeName . '"';
        $lines[] = '';
        $lines[] = chunk_split(base64_encode($bin));
    }

    $lines[] = '--' . $mixed . '--';
    $lines[] = '';

    return [implode("\r\n", $lines), $mixed];
}

/** Legacy app: single JSON body (log tail embedded). */
function handle_legacy_json_v1(): void
{
    $raw = file_get_contents('php://input');
    if ($raw === false || strlen($raw) > 3 * 1024 * 1024) {
        http_response_code(413);
        echo json_encode(['error' => 'Payload too large']);
        exit;
    }

    $data = json_decode($raw, true);
    if (!is_array($data) || (int)($data['schema_version'] ?? 0) < 1) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON or schema_version']);
        exit;
    }

    $to = getenv('RGBJUNKIE_SUPPORT_TO') ?: 'admin@rgbjunkie.com';
    $from = getenv('RGBJUNKIE_SUPPORT_FROM') ?: 'noreply@rgbjunkie.com';
    $appVersion = $data['app']['version'] ?? '?';
    $platform = $data['platform'] ?? 'unknown';
    $subject = "[RGBJunkie {$appVersion}] Support report (legacy, {$platform})";

    $html = '<pre style="font-family:monospace;font-size:12px;">'
        . htmlspecialchars(build_support_email_body_plain($data), ENT_QUOTES | ENT_HTML5, 'UTF-8')
        . '</pre>';

    [$mimeBody, $mixedBoundary] = build_multipart_mixed_email($html, []);

    $headers = [
        'From: ' . $from,
        'MIME-Version: 1.0',
        'Content-Type: multipart/mixed; boundary="' . $mixedBoundary . '"',
        'X-Mailer: RGBJunkie-support-ingest-v1-legacy',
    ];

    $subjectEncoded = function_exists('mb_encode_mimeheader')
        ? mb_encode_mimeheader($subject, 'UTF-8')
        : $subject;

    $ok = @mail($to, $subjectEncoded, $mimeBody, implode("\r\n", $headers));
    if (!$ok) {
        http_response_code(500);
        echo json_encode(['error' => 'Mail send failed (check server mail configuration).']);
        exit;
    }

    http_response_code(200);
    echo json_encode(['ok' => true, 'message' => 'Report received.']);
}

/**
 * @param array<string,mixed> $data
 */
function build_support_email_body_plain(array $data): string
{
    $lines = [];
    $lines[] = 'RGBJunkie support report (legacy JSON)';
    $lines[] = str_repeat('=', 50);
    $lines[] = '';
    $app = $data['app'] ?? [];
    $lines[] = 'App: ' . ($app['name'] ?? '') . ' ' . ($app['version'] ?? '');
    $lines[] = 'Platform: ' . ($data['platform'] ?? '');
    $lines[] = 'Logs directory: ' . ($data['logs_directory'] ?? '');
    $lines[] = '';
    $note = trim((string)($data['user_note'] ?? ''));
    if ($note !== '') {
        $lines[] = 'User note:';
        $lines[] = $note;
        $lines[] = '';
    }
    $snap = $data['hardware_snapshot'] ?? null;
    if (is_string($snap) && $snap !== '') {
        $lines[] = '--- hardware-snapshot.txt ---';
        $lines[] = $snap;
        $lines[] = '';
    }
    $lines[] = '--- rgbjunkie.log (tail) ---';
    $lines[] = (string)($data['rgbjunkie_log_tail'] ?? '(empty)');
    $lines[] = '';
    return implode("\n", $lines);
}
