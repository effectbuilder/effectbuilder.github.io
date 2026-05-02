const fs = require('fs');
const s = fs.readFileSync('js/main.js', 'utf8');
const start = s.indexOf('const shapePropertyMap = {');
const end = s.indexOf('\n    };', start + 50);
const block = s.slice(start, end + 8);
const props = new Set();
const re = /'([^']+)'/g;
let m;
while ((m = re.exec(block))) props.add(m[1]);

[
    'enableAnimation', 'enableSound', 'enablePalette', 'globalGradientStops',
    'enableGlobalCycle', 'globalCycleSpeed'
].forEach((p) => props.add(p));

const shapeNames = new Set([
    'rectangle', 'polyline', 'circle', 'ring', 'polygon', 'star', 'text',
    'oscilloscope', 'tetris', 'fire', 'visualizer', 'audio-visualizer',
    'audio-visualizer', 'gif', 'pixel-art', 'spawn_matrix', 'spawn'
]);

function camelToSnake(str) {
    return str.replace(/([A-Z])/g, '_$1').replace(/^_/, '').toLowerCase();
}

const suffixes = [...props].filter((p) => !shapeNames.has(p)).sort();

console.log('suffix count', suffixes.length);

const enLines = {};
for (const suf of suffixes) {
    const key = 'prop_' + camelToSnake(suf);
    // Human-readable default from suffix
    const readable = suf
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (c) => c.toUpperCase())
        .trim();
    enLines[key] = readable;
}

// Pretty-print JSON snippet for manual merge - actually output full object
console.log(JSON.stringify(enLines, null, 2));
