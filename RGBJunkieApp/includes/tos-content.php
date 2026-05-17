<?php
/**
 * Terms of Service; keep in sync with src/ui/termsOfService.ts (TOS_SECTIONS).
 */
declare(strict_types=1);

const RGBJ_TOS_VERSION = '1.0.0';
const RGBJ_TOS_EFFECTIVE_DATE = 'May 16, 2026';

/** @return list<array{heading:string,body:list<string>}> */
function rgbj_tos_sections(): array
{
    return [
        [
            'heading' => '1. Acceptance',
            'body' => [
                'By clicking “I Agree”, installing, or using RGBJunkie (the “Software”), or using RGBJunkie.com (the “Website”), you (“You”) agree to be bound by these Terms of Service (the “Terms”). If you do not agree, click “Decline & Quit” and do not use the Software or the Website.',
            ],
        ],
        [
            'heading' => '2. License',
            'body' => [
                'RGBJunkie grants You a personal, non-exclusive, non-transferable, revocable license to install and run the Software on hardware You own or control, solely for Your personal or internal business use. All right, title, and interest in the Software remain with RGBJunkie and its licensors.',
                'You will not (a) reverse engineer, decompile, or disassemble the Software except to the extent expressly permitted by applicable law that cannot be waived; (b) remove or alter any proprietary notices; or (c) resell, sublicense, or distribute the Software without prior written permission.',
            ],
        ],
        [
            'heading' => '3. Hardware Access: Important Risk Acknowledgement',
            'body' => [
                'The Software communicates with your computer’s lighting hardware. Depending on the devices you connect, this may include USB HID writes, SMBus / I²C transactions to RAM and motherboard controllers, direct GPU I²C via vendor SDKs (NVIDIA NVAPI, AMD ADL), and similar low-level hardware operations.',
                "Although significant effort has been made to make these operations safe, including read-only enumeration before any write, restricting writes to addresses returned by detection routines, and graceful blackout on shutdown, direct hardware access of this nature carries inherent and unavoidable risk, including but not limited to:\n•  Corruption of vendor-managed configuration data (e.g. RAM SPD, ME / EC firmware, motherboard sensor state);\n•  LED controller lockups requiring a full power cycle or, in rare cases, a CMOS clear;\n•  Conflicts with other RGB control software running simultaneously;\n•  Excessive power draw or heat if a malicious or buggy plugin writes unsafe color values;\n•  Voiding of hardware manufacturer warranties that disallow third-party low-level access.",
                'You acknowledge that You understand these risks, that You alone are responsible for deciding whether to grant the Software access to Your hardware, and that You assume all such risks.',
            ],
        ],
        [
            'heading' => '4. AS-IS; No Warranty',
            'body' => [
                'THE SOFTWARE IS PROVIDED “AS IS” AND “AS AVAILABLE”, WITH ALL FAULTS AND WITHOUT WARRANTY OF ANY KIND. TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, RGBJUNKIE AND ITS CONTRIBUTORS DISCLAIM ALL WARRANTIES, EXPRESS, IMPLIED, OR STATUTORY, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, NON-INFRINGEMENT, ACCURACY, QUIET ENJOYMENT, AND ANY WARRANTIES ARISING FROM COURSE OF DEALING OR USAGE OF TRADE.',
                'No advice or information, whether oral or written, obtained from RGBJunkie or through the Software creates any warranty not expressly stated in these Terms.',
            ],
        ],
        [
            'heading' => '5. Limitation of Liability',
            'body' => [
                'TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL RGBJUNKIE, ITS AFFILIATES, OFFICERS, EMPLOYEES, AGENTS, SUPPLIERS, OR CONTRIBUTORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR ANY LOSS OF PROFITS, REVENUE, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR IN CONNECTION WITH YOUR USE OF, OR INABILITY TO USE, THE SOFTWARE, INCLUDING DAMAGE TO OR FAILURE OF YOUR COMPUTER, MOTHERBOARD, MEMORY, GRAPHICS CARD, PERIPHERAL HARDWARE, OR ANY OTHER PROPERTY, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), STRICT LIABILITY, OR ANY OTHER LEGAL THEORY, AND WHETHER OR NOT RGBJUNKIE HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.',
                'IN ANY EVENT, RGBJUNKIE’S TOTAL CUMULATIVE LIABILITY ARISING OUT OF OR RELATING TO THESE TERMS OR YOUR USE OF THE SOFTWARE WILL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU ACTUALLY PAID TO RGBJUNKIE FOR THE SOFTWARE IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING RISE TO LIABILITY, OR (B) USD $50.',
                'Some jurisdictions do not allow the exclusion or limitation of incidental or consequential damages; in those jurisdictions the above exclusions and limitations apply only to the maximum extent permitted by law.',
            ],
        ],
        [
            'heading' => '6. Indemnification',
            'body' => [
                'You agree to defend, indemnify, and hold harmless RGBJunkie and its affiliates, officers, employees, agents, suppliers, and contributors from and against any and all claims, damages, losses, liabilities, costs, and expenses (including reasonable attorneys’ fees) arising out of or related to (a) Your use or misuse of the Software; (b) Your violation of these Terms; (c) Your violation of any applicable law or third-party right; or (d) any plugins, scripts, configurations, or content You install, author, or run inside the Software.',
            ],
        ],
        [
            'heading' => '7. Third-Party Plugins and Content',
            'body' => [
                'The Software may load device plugins, effects, and other content authored by third parties (including community contributions and content downloaded from RGBJunkie servers). RGBJunkie does not warrant the safety, accuracy, or fitness of any third-party content. You are solely responsible for reviewing any plugin or script You install or enable.',
            ],
        ],
        [
            'heading' => '8. Diagnostic Data',
            'body' => [
                'When You use “Send a report” or the missing-device email form, the Software uploads diagnostic log files and hardware identifiers along with the contact information You provide. This data is used only to diagnose bugs and answer Your support request. It is not sold and is not used for advertising. See Settings → Logs for the exact files attached.',
            ],
        ],
        [
            'heading' => '9. Changes to the Terms',
            'body' => [
                'RGBJunkie may update these Terms from time to time. Material changes will be indicated by a new effective date and version number, and You will be asked to re-agree on next launch. Continued use of the Software after acceptance constitutes acceptance of the updated Terms.',
            ],
        ],
        [
            'heading' => '10. Termination',
            'body' => [
                'These Terms remain in effect until terminated. You may terminate them at any time by uninstalling the Software. RGBJunkie may terminate or suspend Your license immediately if You breach these Terms. Sections 3 through 7 and 11 survive termination.',
            ],
        ],
        [
            'heading' => '11. Governing Law',
            'body' => [
                'These Terms are governed by the laws of the jurisdiction in which RGBJunkie operates, without regard to its conflict-of-law principles, and any dispute arising under or in connection with these Terms is subject to the exclusive jurisdiction of the courts located there.',
            ],
        ],
        [
            'heading' => '12. Entire Agreement; Severability',
            'body' => [
                'These Terms constitute the entire agreement between You and RGBJunkie regarding the Software, and supersede any prior agreements on that subject. If any provision is held unenforceable, that provision will be enforced to the maximum extent permissible and the remaining provisions will remain in full force and effect.',
            ],
        ],
        [
            'heading' => '13. Contact',
            'body' => [
                'Questions about these Terms: admin@rgbjunkie.com',
            ],
        ],
    ];
}

function rgbj_render_tos_body(): void
{
    ?>
    <p class="text-body-secondary"><strong class="text-body">Version <?= rgbj_h(RGBJ_TOS_VERSION) ?> · Effective <?= rgbj_h(RGBJ_TOS_EFFECTIVE_DATE) ?></strong></p>
    <div class="alert alert-warning border-warning bg-dark text-warning-emphasis small" role="note">
        Please read these terms carefully. RGBJunkie talks to your computer’s lighting hardware at a low level. By using the software, you acknowledge the risks described below and accept that you, not RGBJunkie, are responsible for how you use it.
    </div>
    <?php
    foreach (rgbj_tos_sections() as $section) {
        echo '<h2 class="h5 fw-semibold text-body-emphasis mt-4 mb-2">' . rgbj_h($section['heading']) . '</h2>';
        foreach ($section['body'] as $para) {
            echo '<p class="text-body-secondary small mb-2" style="white-space: pre-line;">' . rgbj_h($para) . '</p>';
        }
    }
}
