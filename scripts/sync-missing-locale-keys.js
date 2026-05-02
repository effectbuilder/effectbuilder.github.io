/**
 * Copies missing keys from locales/en.json into other locale files (English fallback).
 */
const fs = require('fs');
const path = require('path');
const dir = path.join(__dirname, '../locales');
const en = JSON.parse(fs.readFileSync(path.join(dir, 'en.json'), 'utf8'));
const files = ['es.json', 'fr.json', 'de.json', 'pt.json', 'zh-CN.json', 'hi.json'];
for (const f of files) {
    const p = path.join(dir, f);
    const loc = JSON.parse(fs.readFileSync(p, 'utf8'));
    let added = 0;
    for (const k of Object.keys(en)) {
        if (loc[k] === undefined) {
            loc[k] = en[k];
            added++;
        }
    }
    const sortedKeys = Object.keys(loc).sort();
    const sorted = {};
    for (const k of sortedKeys) sorted[k] = loc[k];
    fs.writeFileSync(p, JSON.stringify(sorted, null, 4) + '\n', 'utf8');
    console.log(f, 'added', added, 'keys');
}
