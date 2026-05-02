const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const keysJson = execSync('node "' + path.join(__dirname, 'extract-help-modal-keys.js') + '"', { encoding: 'utf8' });
const extracted = JSON.parse(keysJson);

const titles = {
    help_acc_1_title: 'Interface Overview',
    help_acc_2_title: 'The Canvas & Toolbar',
    help_acc_3_title: 'Advanced Shapes & Tools',
    help_acc_4_title: 'Audio & Sensor Reactivity',
    help_acc_5_title: 'Saving, Loading & Exporting',
    help_acc_6_title: 'Installing Custom Effects in SignalRGB'
};

const enPath = path.join(__dirname, '../locales/en.json');
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
Object.assign(en, extracted, titles);
const sortedKeys = Object.keys(en).sort();
const sorted = {};
for (const k of sortedKeys) sorted[k] = en[k];
fs.writeFileSync(enPath, JSON.stringify(sorted, null, 4) + '\n', 'utf8');
console.log('Merged help keys into en.json');
