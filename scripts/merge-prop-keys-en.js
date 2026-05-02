/**
 * Merges auto-generated prop_* keys into locales/en.json (readable English labels).
 */
const fs = require('fs');
const path = require('path');

function camelToSnake(str) {
    return str.replace(/([A-Z])/g, '_$1').replace(/^_/, '').toLowerCase();
}

const main = fs.readFileSync(path.join(__dirname, '../js/main.js'), 'utf8');
const start = main.indexOf('const shapePropertyMap = {');
const end = main.indexOf('\n    };', start + 50);
const block = main.slice(start, end + 8);
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
    'gif', 'pixel-art', 'spawn_matrix'
]);

const suffixes = [...props].filter((p) => !shapeNames.has(p)).sort();

const generated = {};
for (const suf of suffixes) {
    const key = 'prop_' + camelToSnake(suf);
    const readable = suf
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (c) => c.toUpperCase())
        .trim();
    generated[key] = readable;
}

const enPath = path.join(__dirname, '../locales/en.json');
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

const manual = {
    panel_general_settings: 'General Settings',
    panel_global_overrides: 'Global Overrides',
    label_effect_title: 'Effect Title',
    label_description: 'Description',
    label_developer_name: 'Developer Name',
    panel_group_geometry: 'Geometry',
    panel_group_polyline: 'Polyline',
    panel_group_stroke: 'Stroke',
    panel_group_object_path: 'Object',
    panel_group_object_fill: 'Object Fill',
    panel_group_fill_animation: 'Fill-Animation',
    panel_group_text: 'Text',
    panel_group_oscilloscope: 'Oscilloscope',
    panel_group_tetris: 'Tetris',
    panel_group_fire: 'Fire',
    panel_group_pixel_art: 'Pixel Art',
    panel_group_visualizer: 'Visualizer',
    panel_group_audio: 'Audio Responsiveness',
    panel_group_sensor: 'Sensor Responsiveness',
    panel_group_strimer: 'Strimer',
    panel_group_spawner: 'Spawner',
    panel_group_particle: 'Particle',
    panel_group_gif: 'GIF Settings',
    pixel_editor_paint_heading: 'Paint:',
    gif_modal_powered_by: 'Powered by:',
    gif_btn_process_selected: 'Process Selected GIF',
    gif_btn_choose_file_process: 'Choose File and Process',
    prop_controls_tooltip: 'Controls the {label}',
    shape_option_rectangle: 'Rectangle',
    shape_option_circle: 'Circle',
    shape_option_ring: 'Ring',
    shape_option_text: 'Text',
    shape_option_tetris: 'Tetris',
    shape_option_polyline: 'Polyline',
    shape_option_polygon: 'Polygon',
    shape_option_star: 'Star',
    shape_option_oscilloscope: 'Oscilloscope',
    shape_option_fire: 'Fire',
    shape_option_audio_visualizer: 'Audio Visualizer',
    shape_option_pixel_art: 'Pixel Art',
    shape_option_gif: 'GIF',
    shape_option_spawn_matrix: 'Spawn Matrix'
};

Object.assign(en, manual, generated);

const sortedKeys = Object.keys(en).sort();
const sorted = {};
for (const k of sortedKeys) sorted[k] = en[k];

fs.writeFileSync(enPath, JSON.stringify(sorted, null, 4) + '\n', 'utf8');
console.log('Merged', Object.keys(generated).length, 'prop keys + manual keys into en.json');
