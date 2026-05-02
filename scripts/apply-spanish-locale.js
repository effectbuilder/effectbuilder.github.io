/**
 * Fills locales/es.json with Spanish for keys that still matched English:
 * - prop_* labels via prop-pairs.txt (English phrase → Spanish)
 * - showcase, help, misc via generated JSON files.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const enPath = path.join(root, 'locales', 'en.json');
const esPath = path.join(root, 'locales', 'es.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
let es = JSON.parse(fs.readFileSync(esPath, 'utf8'));

function loadPairs(file) {
    const raw = fs.readFileSync(path.join(__dirname, file), 'utf8').trim();
    const map = {};
    raw.split(/\r?\n/).forEach((line) => {
        if (!line.trim()) return;
        const i = line.indexOf('|');
        if (i === -1) return;
        map[line.slice(0, i)] = line.slice(i + 1);
    });
    return map;
}

const propMap = loadPairs('prop-pairs.txt');
for (const k of Object.keys(en)) {
    if (!k.startsWith('prop_')) continue;
    const englishVal = en[k];
    if (propMap[englishVal]) es[k] = propMap[englishVal];
}

function mergeJson(file) {
    const p = path.join(__dirname, file);
    if (!fs.existsSync(p)) {
        console.warn('Missing optional merge file:', file);
        return;
    }
    const patch = JSON.parse(fs.readFileSync(p, 'utf8'));
    Object.assign(es, patch);
}

mergeJson('es-showcase-overrides.json');
mergeJson('es-help-overrides.json');
mergeJson('es-misc-overrides.json');

fs.writeFileSync(esPath, JSON.stringify(es, null, 4) + '\n');
console.log('Updated', esPath);
