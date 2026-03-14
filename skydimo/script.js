const elements = {
    type: document.getElementById('effect-type'),
    color: document.getElementById('color'),
    color2: document.getElementById('color2'),
    out: document.getElementById('lua-output'),
    copyBtn: document.getElementById('copy-btn'),
    canvas: document.getElementById('preview-canvas'),
    ctx: document.getElementById('preview-canvas').getContext('2d'),
    resetBtn: document.getElementById('reset-btn')
};

const syncPairs = ['brightness', 'fps', 'speed', 'temperature', 'tint'];
let startTime = Date.now();
const rows = 15;
const cols = 40;

function setupSyncing() {
    syncPairs.forEach(id => {
        const slider = document.getElementById(id);
        const num = document.getElementById(`${id}-num`);
        slider.addEventListener('input', () => { num.value = slider.value; saveState(); generateSkydimoLua(); });
        num.addEventListener('input', () => { slider.value = num.value; saveState(); generateSkydimoLua(); });
    });
}

function saveState() {
    const state = { type: elements.type.value, color: elements.color.value, color2: elements.color2.value };
    syncPairs.forEach(id => state[id] = document.getElementById(id).value);
    localStorage.setItem('skydimoConfig', JSON.stringify(state));
}

function loadState() {
    const saved = localStorage.getItem('skydimoConfig');
    if (saved) {
        const state = JSON.parse(saved);
        if (state.type) elements.type.value = state.type;
        if (state.color) elements.color.value = state.color;
        if (state.color2) elements.color2.value = state.color2;
        syncPairs.forEach(id => {
            const slider = document.getElementById(id);
            const num = document.getElementById(`${id}-num`);
            if (slider && state[id] !== undefined) {
                slider.value = state[id];
                if (num) num.value = state[id];
            }
        });
    }
}

function generateSkydimoLua() {
    const type = elements.type.value;
    const hex = elements.color.value;
    const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    const r = parseInt(rgb[1], 16), g = parseInt(rgb[2], 16), b = parseInt(rgb[3], 16);
    
    const hex2 = elements.color2.value;
    const rgb2 = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex2);
    const r2 = parseInt(rgb2[1], 16), g2 = parseInt(rgb2[2], 16), b2 = parseInt(rgb2[3], 16);
    
    const brightness = document.getElementById('brightness').value;
    const speed = document.getElementById('speed').value;
    const temp = document.getElementById('temperature').value;
    const tint = document.getElementById('tint').value;

    let luaCode = `-- Skydimo Config\nlocal cfg = {\n    brightness = ${brightness} / 100,\n    speed = ${speed} / 1000,\n    temp = ${temp},\n    tint = ${tint}\n}\n\n`;

    luaCode += `function apply_correction(r, g, b)
    -- Multiplicative Factors (0.5 to 1.5 range)
    local r_gain = 1.0 + (cfg.temp / 200) - (cfg.tint / 1000)
    local g_gain = 1.0 + (cfg.tint / 100)
    local b_gain = 1.0 - (cfg.temp / 200) - (cfg.tint / 1000)

    r = math.min(255, math.max(0, r * r_gain))
    g = math.min(255, math.max(0, g * g_gain))
    b = math.min(255, math.max(0, b * b_gain))
    
    return math.floor(r * cfg.brightness), math.floor(g * cfg.brightness), math.floor(b * cfg.brightness)
end\n\n`;

    switch (type) {
        case 'solid': luaCode += `function get_color(x, y, width, height, env)\n    return rgb(apply_correction(${r}, ${g}, ${b}))\nend`; break;
        case 'rainbow': luaCode += `function get_color(x, y, width, height, env)\n    local hue = math.floor((x / width * 360 + env.time * (cfg.speed * 100)) % 360)\n    return hsv(hue, 255, math.floor(255 * cfg.brightness))\nend`; break;
        case 'wave': luaCode += `function get_color(x, y, width, height, env)\n    local wave = (math.sin((x / 10) + env.time * (cfg.speed * 10)) + 1) / 2\n    return rgb(apply_correction(${r} * wave, ${g} * wave, ${b} * wave))\nend`; break;
        case 'scanner': luaCode += `function get_color(x, y, width, height, env)\n    local cycle = (width - 1) * 2\n    local pos = (env.time * (cfg.speed * 50)) % cycle\n    if pos >= width then pos = cycle - pos end\n    local intensity = math.max(0, 1 - (math.abs(x - pos) / 10))\n    return rgb(apply_correction(${r} * intensity, ${g} * intensity, ${b} * intensity))\nend`; break;
        case 'sweep': luaCode += `function get_color(x, y, width, height, env)\n    local pos = (env.time * (cfg.speed * 50)) % width\n    local dist = math.min(math.abs(x - pos), width - math.abs(x - pos))\n    local intensity = math.max(0, 1 - (dist / 10))\n    return rgb(apply_correction(${r} * intensity, ${g} * intensity, ${b} * intensity))\nend`; break;
        case 'breathing': luaCode += `function get_color(x, y, width, height, env)\n    local intensity = (math.sin(env.time * (cfg.speed * 5)) + 1) / 2\n    return rgb(apply_correction(${r} * intensity, ${g} * intensity, ${b} * intensity))\nend`; break;
        case 'aurora': luaCode += `function get_color(x, y, width, height, env)\n    local mix = (math.sin((x / 15) + env.time * (cfg.speed * 3)) + math.sin((y / 10) - env.time * (cfg.speed * 2)) + 2) / 4\n    return rgb(apply_correction(${r} * mix + ${r2} * (1 - mix), ${g} * mix + ${g2} * (1 - mix), ${b} * mix + ${b2} * (1 - mix)))\nend`; break;
        case 'plasma': luaCode += `function get_color(x, y, width, height, env)\n    local intensity = (math.sin((x / 5) + env.time * (cfg.speed * 10)) + math.sin((y / 5) - env.time * (cfg.speed * 5)) + 2) / 4\n    return rgb(apply_correction(${r} * intensity, ${g} * intensity, ${b} * intensity))\nend`; break;
        case 'heartbeat': luaCode += `function get_color(x, y, width, height, env)\n    local t = (env.time * (cfg.speed * 2)) % 1\n    local intensity = math.exp(-60 * (t - 0.1)^2) + math.exp(-60 * (t - 0.35)^2)\n    return rgb(apply_correction(${r} * intensity, ${g} * intensity, ${b} * intensity))\nend`; break;
        case 'glitch': luaCode += `function get_color(x, y, width, height, env)\n    local chance = math.random(1, 100)\n    if chance > 98 then return rgb(apply_correction(${r2}, ${g2}, ${b2}))\n    elseif chance > 95 then return rgb(0,0,0)\n    else return rgb(apply_correction(${r}, ${g}, ${b})) end\nend`; break;
        case 'comet': luaCode += `function get_color(x, y, width, height, env)\n    local dist = (env.time * (cfg.speed * 50) - x) % width\n    local intensity = math.max(0, 1 - (dist / (width / 1.5))) ^ 3\n    return rgb(apply_correction(${r} * intensity, ${g} * intensity, ${b} * intensity))\nend`; break;
        case 'fire': luaCode += `function get_color(x, y, width, height, env)\n    local flicker = math.random(80, 120) / 100\n    local sine = (math.sin(env.time * (cfg.speed * 15)) + 2) / 3\n    return rgb(apply_correction(${r} * flicker * sine, ${g} * flicker * sine, ${b} * flicker * sine))\nend`; break;
        case 'helix': luaCode += `function get_color(x, y, width, height, env)\n    local s1 = math.max(0, math.sin((x / 8) + env.time * (cfg.speed * 10)))\n    local s2 = math.max(0, math.sin((x / 8) + env.time * (cfg.speed * 10) + math.pi))\n    return rgb(apply_correction(${r} * s1 + ${r2} * s2, ${g} * s1 + ${g2} * s2, ${b} * s1 + ${b2} * s2))\nend`; break;
        case 'ripple': luaCode += `function get_color(x, y, width, height, env)\n    local center = width / 2\n    local dist = math.abs(x - center)\n    local wave = (math.sin(dist / 5 - env.time * (cfg.speed * 20)) + 1) / 2\n    local edge = math.max(0, 1 - (dist / center))\n    return rgb(apply_correction(${r} * wave * edge, ${g} * wave * edge, ${b} * wave * edge))\nend`; break;
        case 'radial_pulse': luaCode += `function get_color(x, y, width, height, env)\n    local centerX, centerY = width / 2, height / 2\n    local dist = math.sqrt((x - centerX)^2 + (y - centerY)^2)\n    local wave = (math.sin(dist / 5 - env.time * (cfg.speed * 10)) + 1) / 2\n    return rgb(apply_correction(${r} * wave, ${g} * wave, ${b} * wave))\nend`; break;
        case 'diagonal_wave': luaCode += `function get_color(x, y, width, height, env)\n    local wave = (math.sin((x + y) / 10 + env.time * (cfg.speed * 10)) + 1) / 2\n    return rgb(apply_correction(${r} * wave, ${g} * wave, ${b} * wave))\nend`; break;
        case 'v_sweep': luaCode += `function get_color(x, y, width, height, env)\n    local pos = (env.time * (cfg.speed * 50)) % height\n    local intensity = math.max(0, 1 - (math.abs(y - pos) / 5))\n    return rgb(apply_correction(${r} * intensity, ${g} * intensity, ${b} * intensity))\nend`; break;
        case 'grid_scan': luaCode += `function get_color(x, y, width, height, env)\n    local posX = (env.time * (cfg.speed * 40)) % width\n    local posY = (env.time * (cfg.speed * 30)) % height\n    local iX = math.max(0, 1 - (math.abs(x - posX) / 4))\n    local iY = math.max(0, 1 - (math.abs(y - posY) / 4))\n    local intensity = math.max(iX, iY)\n    return rgb(apply_correction(${r} * intensity, ${g} * intensity, ${b} * intensity))\nend`; break;
        case 'matrix_rain': luaCode += `function get_color(x, y, width, height, env)\n    local col_speed = 0.5 + (math.sin(x * 123.45) + 1) * 0.5\n    local drop_pos = (env.time * (cfg.speed * 50) * col_speed + math.sin(x * 987.65) * 100) % (height + 25)\n    local dist = y - (drop_pos - 12)\n    local intensity = (dist > 0 and dist < 15) and (1 - (dist / 15))^1.5 or 0\n    return rgb(apply_correction(${r} * intensity, ${g} * intensity, ${b} * intensity))\nend`; break;
    }
    elements.out.value = luaCode;
}

function renderPreview() {
    const type = elements.type.value;
    const speed = document.getElementById('speed').value / 1000;
    const brightness = document.getElementById('brightness').value / 100;
    const temp = parseFloat(document.getElementById('temperature').value);
    const tint = parseFloat(document.getElementById('tint').value);
    const time = (Date.now() - startTime) / 1000;
    
    const cellW = elements.canvas.width / cols;
    const cellH = elements.canvas.height / rows;

    const hex1 = elements.color.value;
    const r1_base = parseInt(hex1.substring(1,3), 16), g1_base = parseInt(hex1.substring(3,5), 16), b1_base = parseInt(hex1.substring(5,7), 16);
    const hex2 = elements.color2.value;
    const r2_base = parseInt(hex2.substring(1,3), 16), g2_base = parseInt(hex2.substring(3,5), 16), b2_base = parseInt(hex2.substring(5,7), 16);

    elements.ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);

    // Factors for multiplicative color correction (0.5 to 1.5 range)
    const r_gain = 1.0 + (temp / 200) - (tint / 1000);
    const g_gain = 1.0 + (tint / 100);
    const b_gain = 1.0 - (temp / 200) - (tint / 1000);

    for (let iy = 0; iy < rows; iy++) {
        for (let ix = 0; ix < cols; ix++) {
            let r = 0, g = 0, b = 0;
            
            // --- Effect Calculation ---
            if (type === 'solid') { r = r1_base; g = g1_base; b = b1_base; }
            else if (type === 'matrix_rain') {
                let colSpeed = 0.5 + (Math.sin(ix * 123.45) + 1) * 0.5;
                let dropPos = (time * (speed * 50) * colSpeed + Math.sin(ix * 987.65) * 100) % (rows + 25);
                let dist = iy - (dropPos - 12);
                let intensity = (dist > 0 && dist < 15) ? Math.pow(1 - (dist / 15), 1.5) : 0;
                r = r1_base * intensity; g = g1_base * intensity; b = b1_base * intensity;
            }
            else if (type === 'radial_pulse') {
                let cX = cols / 2, cY = rows / 2;
                let dist = Math.sqrt(Math.pow(ix - cX, 2) + Math.pow(iy - cY, 2));
                let w = (Math.sin(dist / 3 - time * (speed * 10)) + 1) / 2;
                r = r1_base * w; g = g1_base * w; b = b1_base * w;
            }
            else if (type === 'diagonal_wave') {
                let w = (Math.sin((ix + iy) / 5 + time * (speed * 10)) + 1) / 2;
                r = r1_base * w; g = g1_base * w; b = b1_base * w;
            }
            else if (type === 'v_sweep') {
                let pos = (time * (speed * 50)) % rows;
                let i = Math.max(0, 1 - (Math.abs(iy - pos) / 3));
                r = r1_base * i; g = g1_base * i; b = b1_base * i;
            }
            else if (type === 'grid_scan') {
                let posX = (time * (speed * 40)) % cols, posY = (time * (speed * 30)) % rows;
                let iX = Math.max(0, 1 - (Math.abs(ix - posX) / 1.5));
                let iY = Math.max(0, 1 - (Math.abs(iy - posY) / 1.5));
                let intensity = Math.max(iX, iY);
                r = r1_base * intensity; g = g1_base * intensity; b = b1_base * intensity;
            }
            else if (type === 'aurora') {
                let mix = (Math.sin(ix / 15 + time * speed * 3) + Math.sin(iy / 10 - time * speed * 2) + 2) / 4;
                r = r1_base * mix + r2_base * (1 - mix);
                g = g1_base * mix + g2_base * (1 - mix);
                b = b1_base * mix + b2_base * (1 - mix);
            }
            else if (type === 'rainbow') {
                let hue = ((ix / cols) * 360 + time * (speed * 100)) % 360;
                let c = 255, xv = c * (1 - Math.abs(((hue / 60) % 2) - 1));
                if (hue < 60) {r=c;g=xv;b=0;} else if (hue < 120) {r=xv;g=c;b=0;} else if (hue < 180) {r=0;g=c;b=xv;} 
                else if (hue < 240) {r=0;g=xv;b=c;} else if (hue < 300) {r=xv;g=0;b=c;} else {r=c;g=0;b=xv;}
            }
            // (Insert other legacy 1D cases here if needed, using the 'ix' logic)

            // --- Apply Multiplicative Correction ---
            if (type !== 'rainbow') {
                r *= r_gain;
                g *= g_gain;
                b *= b_gain;
            }

            // Apply Master Brightness
            r *= brightness; g *= brightness; b *= brightness;

            // Final Clamp and Draw
            r = Math.floor(Math.min(255, Math.max(0, r)));
            g = Math.floor(Math.min(255, Math.max(0, g)));
            b = Math.floor(Math.min(255, Math.max(0, b)));

            elements.ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            elements.ctx.fillRect(ix * cellW, iy * cellH, cellW - 1, cellH - 1);
        }
    }
    requestAnimationFrame(renderPreview);
}

elements.resetBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to reset all settings?")) {
        localStorage.removeItem('skydimoConfig');
        location.reload();
    }
});

elements.copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(elements.out.value).then(() => {
        elements.copyBtn.innerText = 'Copied!';
        setTimeout(() => elements.copyBtn.innerText = 'Copy to Clipboard', 2000);
    });
});

[elements.type, elements.color, elements.color2].forEach(el => el.addEventListener('input', () => { saveState(); generateSkydimoLua(); }));
window.addEventListener('DOMContentLoaded', () => { setupSyncing(); loadState(); generateSkydimoLua(); renderPreview(); });

// New Elements
const presetNameInput = document.getElementById('preset-name');
const savePresetBtn = document.getElementById('save-preset-btn');
const presetsList = document.getElementById('presets-list');

// Load presets from LocalStorage on startup
let savedPresets = JSON.parse(localStorage.getItem('skydimoPresets')) || [];

function updatePresetsUI() {
    presetsList.innerHTML = '';
    savedPresets.forEach((preset, index) => {
        const row = document.createElement('div');
        row.style = "display: flex; justify-content: space-between; align-items: center; background: #333; padding: 5px; border-radius: 4px;";

        const label = document.createElement('span');
        label.innerText = preset.name;
        label.style = "cursor: pointer; flex-grow: 1; font-size: 0.85rem;";
        label.onclick = () => applyPreset(preset);

        const delBtn = document.createElement('button');
        delBtn.innerText = '×';
        delBtn.style = "background: none; border: none; color: #ff5555; cursor: pointer; font-weight: bold; font-size: 1.2rem; padding: 0 5px;";
        delBtn.onclick = () => deletePreset(index);

        row.appendChild(label);
        row.appendChild(delBtn);
        presetsList.appendChild(row);
    });
}

function savePreset() {
    const name = presetNameInput.value.trim() || "Untitled Preset";
    const currentConfig = {
        name: name,
        type: elements.type.value,
        color: elements.color.value,
        color2: elements.color2.value,
        brightness: document.getElementById('brightness').value,
        speed: document.getElementById('speed').value,
        fps: document.getElementById('fps').value,
        temperature: document.getElementById('temperature').value,
        tint: document.getElementById('tint').value
    };

    savedPresets.push(currentConfig);
    localStorage.setItem('skydimoPresets', JSON.stringify(savedPresets));
    presetNameInput.value = '';
    updatePresetsUI();
}

function applyPreset(preset) {
    elements.type.value = preset.type;
    elements.color.value = preset.color;
    elements.color2.value = preset.color2;

    syncPairs.forEach(id => {
        const val = preset[id];
        if (val !== undefined) {
            document.getElementById(id).value = val;
            document.getElementById(`${id}-num`).value = val;
        }
    });

    saveState();
    generateSkydimoLua();
}

function deletePreset(index) {
    savedPresets.splice(index, 1);
    localStorage.setItem('skydimoPresets', JSON.stringify(savedPresets));
    updatePresetsUI();
}

// Event Listener
savePresetBtn.addEventListener('click', savePreset);

// Initialize UI
window.addEventListener('DOMContentLoaded', () => {
    updatePresetsUI();
});