/**
 * Reads index.html help modal and prints JSON snippets for help_* keys (stdout).
 * Run: node scripts/extract-help-modal-keys.js > help-keys.json (inspect then merge)
 */
const fs = require('fs');
const path = require('path');
const html = fs.readFileSync(path.join(__dirname, '../effect-builder/index.html'), 'utf8');

function extractBetween(startMarker, endMarker) {
    const i = html.indexOf(startMarker);
    if (i < 0) throw new Error('start not found: ' + startMarker);
    const j = html.indexOf(endMarker, i + startMarker.length);
    if (j < 0) throw new Error('end not found');
    return html.slice(i + startMarker.length, j).trim();
}

const welcome = extractBetween(
    '<div class="modal-body">',
    '<div class="ratio ratio-16x9'
);
const welcomeP = welcome.match(/<p>([\s\S]*?)<\/p>/);
const welcomeHtml = welcomeP ? welcomeP[1].trim() : '';

const keys = {
    help_welcome_html: `<p>${welcomeHtml}</p>`
};

// Accordion bodies: find each help-collapse-N accordion-body inner
for (let n = 1; n <= 6; n++) {
    const start = `<div id="help-collapse-${n}" class="accordion-collapse`;
    const idx = html.indexOf(start);
    if (idx < 0) continue;
    const bodyStart = html.indexOf('<div class="accordion-body', idx);
    const innerStart = html.indexOf('>', bodyStart) + 1;
    let depth = 1;
    let pos = innerStart;
    const openDiv = /<div\b[^>]*>/g;
    const closeDiv = /<\/div>/g;
    // simpler: find matching closing </div> for accordion-body
    const openTag = '<div class="accordion-body';
    const os = html.indexOf(openTag, idx);
    const startContent = html.indexOf('>', os) + 1;
    let endContent = startContent;
    let level = 1;
    while (level > 0 && endContent < html.length) {
        const nextOpen = html.indexOf('<div', endContent);
        const nextClose = html.indexOf('</div>', endContent);
        if (nextClose < 0) break;
        if (nextOpen !== -1 && nextOpen < nextClose) {
            level++;
            endContent = nextOpen + 4;
        } else {
            level--;
            endContent = nextClose + 6;
        }
    }
    const inner = html.slice(startContent, endContent - 6).trim();
    keys[`help_acc_${n}_html`] = inner;
}

console.log(JSON.stringify(keys, null, 4));
