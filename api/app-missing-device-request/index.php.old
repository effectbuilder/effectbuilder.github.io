<?php
/**
 * RGBJunkie desktop app — missing USB device / plugin request ingest (PHP)
 *
 * URL: https://rgbjunkie.com/api/app-missing-device-request/
 *      (The desktop app also tries https://www.rgbjunkie.com/... if the apex URL returns 404.)
 *
 * **Multipart** — field `metadata` (JSON) + optional log files (same field names as app-support-report.php):
 *   `file_rgbjunkie_log`, `file_hardware_snapshot`, `file_rgbjunkie_log_prev`
 *
 * **schema_version 1** — metadata only, no attachments (legacy).
 * **schema_version 2+** — same attachments + `attachments` summary as support reports; `kind` must be `missing_device_request`.
 *
 * Env: RGBJUNKIE_SUPPORT_TO, RGBJUNKIE_SUPPORT_FROM (same as app-support-report.php)
 *
 * Server: raise limits — e.g. `upload_max_filesize=16M`, `post_max_size=32M`, `max_execution_time=120`.
 */
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (stripos($contentType, 'multipart/form-data') === false) {
    http_response_code(400);
    echo json_encode(['error' => 'Expected multipart/form-data']);
    exit;
}

$metaRaw = $_POST['metadata'] ?? '';
if ($metaRaw === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Missing metadata field']);
    exit;
}

$data = json_decode($metaRaw, true);
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid metadata JSON']);
    exit;
}

$schemaVersion = (int) ($data['schema_version'] ?? 0);
$kind = (string) ($data['kind'] ?? '');
if ($kind !== 'missing_device_request') {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid or missing kind']);
    exit;
}
if ($schemaVersion < 1) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid schema_version']);
    exit;
}

$to = getenv('RGBJUNKIE_SUPPORT_TO') ?: 'admin@rgbjunkie.com';
$from = getenv('RGBJUNKIE_SUPPORT_FROM') ?: 'noreply@rgbjunkie.com';

$appVersion = is_array($data['app'] ?? null) ? (string) ($data['app']['version'] ?? '?') : '?';
$contact = is_array($data['contact'] ?? null) ? $data['contact'] : [];
$display = trim((string) ($contact['display_name'] ?? ''));
$email = trim((string) ($contact['email'] ?? ''));
$modelDetails = trim((string) ($data['model_details'] ?? ''));

if ($display === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Name is required.']);
    exit;
}
if ($email === '' || filter_var($email, FILTER_VALIDATE_EMAIL) === false) {
    http_response_code(400);
    echo json_encode(['error' => 'Valid email is required.']);
    exit;
}
$modelLen = function_exists('mb_strlen') ? mb_strlen($modelDetails, 'UTF-8') : strlen($modelDetails);
if ($modelLen < 12) {
    http_response_code(400);
    echo json_encode(['error' => 'Model / product details must be at least a short sentence.']);
    exit;
}

$device = is_array($data['device'] ?? null) ? $data['device'] : [];
$vid = isset($device['vid']) ? sprintf('0x%04X', (int) $device['vid']) : '?';
$pid = isset($device['pid']) ? sprintf('0x%04X', (int) $device['pid']) : '?';
$usbName = trim(
    trim((string) ($device['manufacturer'] ?? '')) . ' ' . trim((string) ($device['product'] ?? ''))
);
if ($usbName === '') {
    $usbName = '(unknown)';
}

$subject = "[RGBJunkie {$appVersion}] Missing device — {$vid} {$pid} — {$usbName}";
$subjectEncoded = function_exists('mb_encode_mimeheader')
    ? mb_encode_mimeheader($subject, 'UTF-8')
    : $subject;

$h = static function (string $s): string {
    return htmlspecialchars($s, ENT_QUOTES | ENT_HTML5, 'UTF-8');
};

$deviceJson = htmlspecialchars(
    json_encode($device, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) ?: '{}',
    ENT_QUOTES | ENT_HTML5,
    'UTF-8'
);
$pc = is_array($data['pc'] ?? null) ? $data['pc'] : [];
$pcLine = $h((string) ($pc['hostname'] ?? '')) . ' — ' . $h((string) ($pc['os'] ?? '')) . ' / ' . $h((string) ($pc['arch'] ?? ''));
$wmiJson = '';
if (is_array($pc['wmi'] ?? null) && ($pc['wmi'] ?? []) !== []) {
    $wmiJson = htmlspecialchars(
        json_encode($pc['wmi'], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) ?: '{}',
        ENT_QUOTES | ENT_HTML5,
        'UTF-8'
    );
}

$att = is_array($data['attachments'] ?? null) ? $data['attachments'] : [];
$attachBlock =
    $schemaVersion >= 2
        ? '<tr><td valign="top"><strong>Log files</strong></td><td>' . format_attachments_summary_html($att, $h) . '</td></tr>'
        : '';

$html = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>RGBJunkie missing device</title></head>
<body style="font-family:Segoe UI,Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.45;color:#1a1a1a;">
  <h2 style="margin:0 0 12px;">RGBJunkie — missing device / plugin request</h2>
  <table cellpadding="8" cellspacing="0" border="1" style="border-collapse:collapse;border-color:#ccc;">
    <tr><td><strong>Name</strong></td><td>{$h($display)}</td></tr>
    <tr><td><strong>Email</strong></td><td>{$h($email)}</td></tr>
    <tr><td><strong>App</strong></td><td>{$h($appVersion)}</td></tr>
    <tr><td><strong>PC</strong></td><td>{$pcLine}</td></tr>
    <tr><td><strong>USB (OS string)</strong></td><td>{$h($usbName)}</td></tr>
    <tr><td><strong>VID / PID</strong></td><td>{$h($vid)} / {$h($pid)}</td></tr>
    {$attachBlock}
  </table>
  <h3 style="margin:20px 0 8px;">Model / product details (user)</h3>
  <p style="white-space:pre-wrap;margin:0;">{$h($modelDetails)}</p>
  <h3 style="margin:20px 0 8px;">Full device payload (JSON)</h3>
  <pre style="background:#f5f5f5;padding:12px;border-radius:6px;font-size:12px;overflow:auto;">{$deviceJson}</pre>
HTML;
if ($wmiJson !== '') {
    $html .= <<<HTML
  <h3 style="margin:20px 0 8px;">WMI / hardware (from app)</h3>
  <pre style="background:#f5f5f5;padding:12px;border-radius:6px;font-size:12px;overflow:auto;">{$wmiJson}</pre>
HTML;
}
$html .= <<<HTML
  <p style="margin-top:24px;font-size:12px;color:#666;">When schema_version is 2 or higher, log files are attached to this message when present.</p>
</body>
</html>
HTML;

$headers = [
    'From: ' . $from,
    'MIME-Version: 1.0',
    'X-Mailer: RGBJunkie-missing-device-ingest-v2',
];
if ($email !== '') {
    $headers[] = 'Reply-To: <' . $email . '>';
}

if ($schemaVersion >= 2) {
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
                $fn = trim((string) ($att['rgbjunkie_rotated_log_filename'] ?? ''));
                $filename = $fn !== '' ? basename($fn) : 'rgbjunkie_rotated.log';
            }
        } else {
            $filename = (string) $defaultName;
        }
        $attachments[$filename] = $tmp;
    }

    [$mimeBody, $mixedBoundary] = build_multipart_mixed_email($html, $attachments);
    $headers[] = 'Content-Type: multipart/mixed; boundary="' . $mixedBoundary . '"';
    $body = $mimeBody;
} else {
    $headers[] = 'Content-Type: text/html; charset=UTF-8';
    $body = $html;
}

$ok = @mail($to, $subjectEncoded, $body, implode("\r\n", $headers));
if (!$ok) {
    http_response_code(500);
    echo json_encode(['error' => 'Mail send failed (check server mail configuration).']);
    exit;
}

http_response_code(200);
echo json_encode(['ok' => true, 'message' => 'Request received. Thank you.']);

// --- helpers (aligned with docs/examples/app-support-report.php) ---

/**
 * @param array<string,mixed> $att
 * @param callable(string): string $h
 */
function format_attachments_summary_html(array $att, callable $h): string
{
    $items = [];
    $baseRows = [
        ['flag' => 'rgbjunkie_log', 'label' => 'rgbjunkie.log', 'bytes_key' => 'rgbjunkie_log_bytes'],
        ['flag' => 'hardware_snapshot', 'label' => 'hardware-snapshot.txt', 'bytes_key' => 'hardware_snapshot_bytes'],
    ];
    foreach ($baseRows as $row) {
        $included = support_attachment_flag_true($att, $row['flag']);
        $bytes = isset($att[$row['bytes_key']]) ? (int) $att[$row['bytes_key']] : null;
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

    if (support_attachment_flag_true($att, 'rgbjunkie_log_rotated')) {
        $fn = trim((string) ($att['rgbjunkie_rotated_log_filename'] ?? ''));
        $label = normalize_rotated_log_display_label($fn);
        $rb = isset($att['rgbjunkie_rotated_log_bytes']) ? (int) $att['rgbjunkie_rotated_log_bytes'] : 0;
        $rotDetail = ($rb > 0) ? ('Included · ' . format_byte_size($rb)) : 'Included · size not reported';
        $items[] =
            '<li style="margin:6px 0;"><strong>' . $h($label) . '</strong> — ' . $h($rotDetail) . '</li>';
    }

    return '<ul style="margin:0;padding-left:20px;">' . implode('', $items) . '</ul>';
}

/**
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

function normalize_rotated_log_display_label(string $filename): string
{
    $f = trim($filename);
    if ($f === '' || preg_match('/^rgbjunkie\.log\.\d+$/i', $f)) {
        return 'Previous log archive';
    }

    return $f;
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
