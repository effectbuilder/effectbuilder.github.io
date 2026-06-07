<?php
/**
 * Gemini API helper for Help Center editor (admin-only via help/api/gemini.php).
 */
declare(strict_types=1);

const RGBJ_HELP_GEMINI_SYSTEM = <<<'TEXT'
You are a writing assistant for RGBJunkie Help Center articles.

Articles use YAML front matter between --- lines (title, slug, summary, category, tags, published, draft), then Markdown body.

Supported Markdown: headings (#–####), **bold**, *italic*, `code`, lists, [links](url), pipe tables, blockquotes, fenced code blocks with language tags (e.g. ```javascript), and images.

Return ONLY the requested text. No preamble, apologies, or wrapping the entire response in a code fence unless the output itself is a code sample.
TEXT;

/** @return array{api_key: string, model: string, fallback_models: list<string>, max_input_chars: int} */
function rgbj_help_gemini_config(): array
{
    static $config = null;
    if ($config !== null) {
        return $config;
    }

    $defaults = [
        'api_key' => '',
        'model' => 'gemini-2.0-flash',
        'fallback_models' => ['gemini-2.0-flash-lite', 'gemini-2.5-flash'],
        'max_input_chars' => 48000,
    ];

    $local = __DIR__ . '/help-gemini-secret.php';
    if (is_file($local)) {
        $loaded = require $local;
        if (is_array($loaded)) {
            $config = array_merge($defaults, $loaded);
            if (!isset($config['fallback_models']) || !is_array($config['fallback_models'])) {
                $config['fallback_models'] = $defaults['fallback_models'];
            }

            return $config;
        }
    }

    $config = $defaults;

    return $config;
}

function rgbj_help_gemini_is_configured(): bool
{
    return rgbj_help_gemini_config()['api_key'] !== '';
}

/** @return list<string> */
function rgbj_help_gemini_models_to_try(): array
{
    $config = rgbj_help_gemini_config();
    $models = array_merge(
        [trim($config['model']) !== '' ? trim($config['model']) : 'gemini-2.0-flash'],
        $config['fallback_models']
    );

    $unique = [];
    foreach ($models as $model) {
        $model = trim((string) $model);
        if ($model !== '' && !in_array($model, $unique, true)) {
            $unique[] = $model;
        }
    }

    return $unique;
}

function rgbj_help_gemini_is_quota_error(string $message, int $httpStatus = 0): bool
{
    $lower = strtolower($message);

    return $httpStatus === 429
        || str_contains($lower, 'quota')
        || str_contains($lower, 'rate limit')
        || str_contains($lower, 'resource exhausted')
        || str_contains($lower, 'too many requests');
}

function rgbj_help_gemini_is_rate_limit_error(string $message, int $httpStatus = 0): bool
{
    if ($httpStatus !== 429) {
        return false;
    }

    $lower = strtolower($message);

    return str_contains($lower, 'rate')
        || str_contains($lower, 'rpm')
        || str_contains($lower, 'tpm')
        || str_contains($lower, 'retry in')
        || str_contains($lower, 'too many requests');
}

function rgbj_help_gemini_is_model_not_found_error(string $message, int $httpStatus = 0): bool
{
    $lower = strtolower($message);

    return $httpStatus === 404
        || str_contains($lower, 'not found')
        || str_contains($lower, 'not supported for generatecontent');
}

function rgbj_help_gemini_is_prepay_depleted_error(string $message): bool
{
    $lower = strtolower($message);

    return str_contains($lower, 'prepayment credits are depleted')
        || (str_contains($lower, 'prepay') && str_contains($lower, 'depleted'));
}

function rgbj_help_gemini_friendly_error(string $message, int $httpStatus = 0): string
{
    if (rgbj_help_gemini_is_prepay_depleted_error($message)) {
        return 'Your Google AI Studio prepayment balance for this project is $0. '
            . 'Add credits at https://aistudio.google.com/ (open your project → Billing / prepay). '
            . 'This is not an editor bug — Gemini will work again after you top up. '
            . 'Details: https://ai.google.dev/gemini-api/docs/billing#prepay';
    }

    if (!rgbj_help_gemini_is_quota_error($message, $httpStatus)) {
        return $message;
    }

    $hint = 'Check quotas: https://aistudio.google.com/apikey and '
        . 'https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas';

    if (rgbj_help_gemini_is_rate_limit_error($message, $httpStatus)) {
        return 'Gemini rate limit (requests or tokens per minute). Wait a minute and try again, '
            . 'or select a smaller excerpt. ' . $hint;
    }

    return 'Gemini usage limit for this API key\'s project. Try again later or adjust quotas. '
        . $hint . ' Google says: ' . $message;
}

/**
 * @param array{maxOutputTokens?: int} $generationOverrides
 * @return array{text: string, model: string}
 * @throws RuntimeException
 */
function rgbj_help_gemini_request_model(string $model, string $systemInstruction, string $userText, array $generationOverrides = [], int $retryCount = 0): array
{
    $config = rgbj_help_gemini_config();
    $apiKey = trim($config['api_key']);
    if ($apiKey === '') {
        throw new RuntimeException('Gemini API key not configured. Copy includes/help-gemini-secret.php.example to help-gemini-secret.php.');
    }

    $url = 'https://generativelanguage.googleapis.com/v1beta/models/'
        . rawurlencode($model)
        . ':generateContent?key='
        . rawurlencode($apiKey);

    $generation = array_merge([
        'temperature' => 0.35,
        'maxOutputTokens' => 4096,
    ], $generationOverrides);

    $payload = json_encode([
        'systemInstruction' => [
            'parts' => [['text' => $systemInstruction]],
        ],
        'contents' => [
            [
                'role' => 'user',
                'parts' => [['text' => $userText]],
            ],
        ],
        'generationConfig' => $generation,
    ], JSON_THROW_ON_ERROR);

    $ctx = stream_context_create([
        'http' => [
            'method' => 'POST',
            'header' => "Content-Type: application/json\r\n",
            'content' => $payload,
            'timeout' => 60,
            'ignore_errors' => true,
        ],
    ]);

    $raw = @file_get_contents($url, false, $ctx);
    if ($raw === false) {
        throw new RuntimeException('Could not reach Gemini API.');
    }

    $httpStatus = 0;
    if (isset($http_response_header[0]) && preg_match('/\s(\d{3})\s/', (string) $http_response_header[0], $statusMatch)) {
        $httpStatus = (int) $statusMatch[1];
    }

    $data = json_decode($raw, true);
    if (!is_array($data)) {
        throw new RuntimeException('Invalid Gemini API response.');
    }

    if (isset($data['error']['message'])) {
        $message = (string) $data['error']['message'];
        $status = (string) ($data['error']['status'] ?? '');

        if ($retryCount === 0 && rgbj_help_gemini_is_rate_limit_error($message, $httpStatus)) {
            usleep(2_000_000);
            return rgbj_help_gemini_request_model($model, $systemInstruction, $userText, $generationOverrides, 1);
        }

        $detail = $status !== '' ? $status . ': ' . $message : $message;
        if (rgbj_help_gemini_is_model_not_found_error($message, $httpStatus)) {
            throw new RuntimeException('MODEL_NOT_FOUND:' . $detail);
        }
        if (rgbj_help_gemini_is_quota_error($message, $httpStatus)) {
            throw new RuntimeException('QUOTA:' . $detail);
        }
        throw new RuntimeException($detail);
    }

    $parts = $data['candidates'][0]['content']['parts'] ?? [];
    $text = '';
    foreach ($parts as $part) {
        if (is_array($part) && isset($part['text'])) {
            $text .= (string) $part['text'];
        }
    }

    $text = trim($text);
    if ($text === '') {
        throw new RuntimeException('Gemini returned an empty response.');
    }

    return ['text' => $text, 'model' => $model];
}

function rgbj_help_gemini_generate(string $systemInstruction, string $userText, array $generationOverrides = []): string
{
    $errors = [];
    foreach (rgbj_help_gemini_models_to_try() as $model) {
        try {
            return rgbj_help_gemini_request_model($model, $systemInstruction, $userText, $generationOverrides)['text'];
        } catch (RuntimeException $e) {
            $message = $e->getMessage();
            if (str_starts_with($message, 'QUOTA:') || str_starts_with($message, 'MODEL_NOT_FOUND:')) {
                $errors[] = $model . ': ' . substr($message, strpos($message, ':') + 1);
                continue;
            }
            throw $e;
        }
    }

    $combined = $errors !== [] ? implode(' | ', $errors) : 'No Gemini models available.';
    if (rgbj_help_gemini_is_prepay_depleted_error($combined)) {
        throw new RuntimeException(rgbj_help_gemini_friendly_error($combined));
    }

    throw new RuntimeException(
        str_contains(strtolower($combined), 'not found')
            ? 'No configured Gemini model is available to this API key. Update model names in help-gemini-secret.php (e.g. gemini-2.0-flash, gemini-2.5-flash). Details: ' . $combined
            : rgbj_help_gemini_friendly_error($combined, 429)
    );
}

/**
 * @return array{text: string, scope: string}
 */
function rgbj_help_gemini_assist(string $action, string $markdown, string $selection, string $customPrompt): array
{
    $action = strtolower(trim($action));
    $selection = trim($selection);
    $customPrompt = trim($customPrompt);
    $markdown = str_replace(["\r\n", "\r"], "\n", $markdown);
    $maxChars = max(4000, (int) rgbj_help_gemini_config()['max_input_chars']);

    $generationOverrides = match ($action) {
        'summarize', 'title' => ['maxOutputTokens' => 256],
        'grammar', 'improve' => ['maxOutputTokens' => 4096],
        default => ['maxOutputTokens' => 6144],
    };

    $instruction = match ($action) {
        'improve' => 'Improve clarity and readability for RGBJunkie end users. Preserve structure and technical accuracy.',
        'grammar' => 'Fix grammar, spelling, and punctuation. Do not change meaning.',
        'expand' => 'Expand with helpful detail and short examples where appropriate.',
        'summarize' => 'Write one concise summary sentence for the article index card (max 160 characters). Return only that sentence.',
        'title' => 'Suggest a clear, concise help article title. Return only the title text.',
        'custom' => $customPrompt !== '' ? $customPrompt : throw new InvalidArgumentException('Prompt is required for custom requests.'),
        default => throw new InvalidArgumentException('Unknown action.'),
    };

    if ($selection !== '') {
        $userText = $instruction
            . "\n\nRevise ONLY this excerpt. Return only the revised excerpt:\n\n"
            . $selection;
        $scope = 'selection';
    } elseif ($action === 'summarize') {
        $body = rgbj_help_markdown_body($markdown);
        $userText = $instruction . "\n\nArticle body:\n\n" . $body;
        $scope = 'summary';
    } elseif ($action === 'title') {
        $body = rgbj_help_markdown_body($markdown);
        $userText = $instruction . "\n\nArticle body:\n\n" . $body;
        $scope = 'title';
    } else {
        $userText = $instruction
            . "\n\nPreserve the YAML front matter exactly. Only revise the Markdown body when present.\n\n"
            . $markdown;
        $scope = 'document';
    }

    if (strlen($userText) > $maxChars) {
        $userText = substr($userText, 0, $maxChars) . "\n\n[Truncated for API length — select a smaller excerpt for full coverage.]";
    }

    return [
        'text' => rgbj_help_gemini_generate(RGBJ_HELP_GEMINI_SYSTEM, $userText, $generationOverrides),
        'scope' => $scope,
    ];
}
