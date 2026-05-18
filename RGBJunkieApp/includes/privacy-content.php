<?php
/**
 * Privacy Policy for rgbjunkie.com and RGBJunkie for Windows.
 */
declare(strict_types=1);

const RGBJ_PRIVACY_VERSION = '1.0.0';
const RGBJ_PRIVACY_EFFECTIVE_DATE = 'May 18, 2026';

/** @return list<array{heading:string,body:list<string>}> */
function rgbj_privacy_sections(): array
{
    return [
        [
            'heading' => '1. Who we are',
            'body' => [
                'RGBJunkie (“we”, “us”) operates rgbjunkie.com and the RGBJunkie for Windows desktop application. Questions about this policy: admin@rgbjunkie.com.',
            ],
        ],
        [
            'heading' => '2. What this policy covers',
            'body' => [
                'This Privacy Policy explains how we collect, use, and share information when you visit our website, use our browser-based creative tools, download the Windows app, or contact us for support. It applies together with our Terms of Service.',
            ],
        ],
        [
            'heading' => '3. Information we collect',
            'body' => [
                "Website usage — When you browse rgbjunkie.com, we may collect standard web log data (IP address, browser type, pages visited, referring URL) and analytics events through Google Analytics (property ID G-WS7MGSDJSB). You can use browser extensions or opt-out tools provided by Google if you do not want analytics cookies.",
                "Support and feedback — If you use “Send a report”, the missing-device form, or email us, we receive the information you choose to send (such as your email address, message text, and any log files or hardware identifiers you attach). See the desktop app’s Settings → Logs to see what may be included before you send.",
                "Downloads — When you download installers from this site, our hosting provider may log technical data needed to deliver the file (IP address, user agent, timestamp). We do not require an account to download the free app today.",
                "Desktop app — The Windows app stores data locally on your PC (profiles, layouts, preferences, Terms acceptance, and diagnostic logs). That data stays on your device unless you explicitly upload it through a support flow or a feature that contacts our servers.",
                "Effect Builder / gallery — Public effects you publish through our online tools may be stored on our servers so others can browse the gallery. Metadata (name, description, tags) is visible in the public catalog unless we state otherwise for a specific program.",
            ],
        ],
        [
            'heading' => '4. How we use information',
            'body' => [
                'We use information to operate and improve the website and app, respond to support requests, fix bugs, understand aggregate usage, secure our services, and comply with law. We do not sell your personal information and we do not use support or diagnostic data for advertising.',
            ],
        ],
        [
            'heading' => '5. How we share information',
            'body' => [
                'We share information only when needed: with service providers that host the site, deliver email, or process analytics (under contracts that limit their use); when you ask us to (for example, when you send a report); to protect rights and safety; or when required by law. If we use payment or account providers for future subscription features, they will process billing data under their own privacy policies.',
            ],
        ],
        [
            'heading' => '6. Cookies and similar technologies',
            'body' => [
                'Our marketing site may set cookies or local storage used by Google Analytics. The Windows desktop app does not use advertising cookies. You can control cookies through your browser settings; blocking analytics cookies does not prevent you from downloading the app.',
            ],
        ],
        [
            'heading' => '7. Data retention',
            'body' => [
                'We keep support correspondence and uploaded diagnostics only as long as needed to resolve your request and improve the product, then delete or aggregate them unless law requires longer retention. Server logs are rotated on a schedule appropriate for security and operations. Data stored locally in the app is controlled by you (uninstalling or deleting app data removes it from your PC).',
            ],
        ],
        [
            'heading' => '8. Security',
            'body' => [
                'We use reasonable technical and organizational measures to protect information on our systems. No method of transmission or storage is 100% secure; please do not send sensitive information you do not want us to receive.',
            ],
        ],
        [
            'heading' => '9. Children',
            'body' => [
                'Our services are not directed to children under 13 (or the minimum age in your country). We do not knowingly collect personal information from children. Contact us if you believe we have done so and we will delete it.',
            ],
        ],
        [
            'heading' => '10. Your choices and rights',
            'body' => [
                'Depending on where you live, you may have rights to access, correct, delete, or export personal information we hold about you, or to object to certain processing. To exercise these rights, email admin@rgbjunkie.com with enough detail for us to verify your request. You may also stop using the services at any time and uninstall the desktop app.',
            ],
        ],
        [
            'heading' => '11. International visitors',
            'body' => [
                'We are based in the United States. If you access our services from other regions, your information may be processed in the U.S. or where our providers operate, which may have different data protection laws than your home country.',
            ],
        ],
        [
            'heading' => '12. Changes to this policy',
            'body' => [
                'We may update this Privacy Policy from time to time. We will post the new version on this page with an updated effective date. Material changes may also be noted on the website or in the app where appropriate.',
            ],
        ],
        [
            'heading' => '13. Contact',
            'body' => [
                'Privacy questions or requests: admin@rgbjunkie.com',
            ],
        ],
    ];
}

function rgbj_render_privacy_body(): void
{
    ?>
    <p class="text-body-secondary"><strong class="text-body">Version <?= rgbj_h(RGBJ_PRIVACY_VERSION) ?> · Effective <?= rgbj_h(RGBJ_PRIVACY_EFFECTIVE_DATE) ?></strong></p>
    <p class="text-body-secondary small mb-3">This policy describes how RGBJunkie handles information for the website and the Windows desktop app. It is written in plain language; the Terms of Service govern your use of the software.</p>
    <?php
    foreach (rgbj_privacy_sections() as $section) {
        echo '<h2 class="h5 fw-semibold text-body-emphasis mt-4 mb-2">' . rgbj_h($section['heading']) . '</h2>';
        foreach ($section['body'] as $para) {
            echo '<p class="text-body-secondary small mb-2" style="white-space: pre-line;">' . rgbj_h($para) . '</p>';
        }
    }
}
