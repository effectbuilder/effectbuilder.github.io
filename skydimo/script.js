const elements = {
    type: document.getElementById('effect-type'),
    color: document.getElementById('color'),
    color2: document.getElementById('color2'),
    out: document.getElementById('lua-output'),
    copyBtn: document.getElementById('copy-btn'),
    canvas: document.getElementById('preview-canvas'),
    ctx: document.getElementById('preview-canvas').getContext('2d'),
    resetBtn: document.getElementById('reset-btn'),
    presetName: document.getElementById('preset-name'),
    savePresetBtn: document.getElementById('save-preset-btn'),
    presetsList: document.getElementById('presets-list')
};

const syncPairs = ['brightness', 'speed'];
let startTime = Date.now();
const rows = 15;
const cols = 40;

// Memory table for throttling true random effects
let ledStates = {};

function rgbToHsv(r, g, b) {
    let max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let h = 0;
    if (max !== min) {
        if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
        else if (max === g) h = (b - r) / d + 2;
        else if (max === b) h = (r - g) / d + 4;
        h = h * 60;
    }
    return Math.floor(h);
}

function hueToSkydimo(hue) {
    return Math.floor((hue / 1.8) - 100);
}

function setupSyncing() {
    syncPairs.forEach(id => {
        const slider = document.getElementById(id);
        const num = document.getElementById(`${id}-num`);
        if (slider && num) {
            slider.addEventListener('input', () => {
                num.value = slider.value;
                saveState();
                generateSkydimoLua();
            });
            num.addEventListener('input', () => {
                slider.value = num.value;
                saveState();
                generateSkydimoLua();
            });
        }
    });
}

function saveState() {
    const state = { type: elements.type.value, color: elements.color.value, color2: elements.color2.value };
    syncPairs.forEach(id => {
        const el = document.getElementById(id);
        if (el) state[id] = el.value;
    });
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
    const brightness = document.getElementById('brightness').value;
    const speed = document.getElementById('speed').value;
    
    const hex1 = elements.color.value;
    const rgb1 = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex1);
    const r1 = parseInt(rgb1[1], 16), g1 = parseInt(rgb1[2], 16), b1 = parseInt(rgb1[3], 16);
    
    const hex2 = elements.color2.value;
    const rgb2 = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex2);
    const r2 = parseInt(rgb2[1], 16), g2 = parseInt(rgb2[2], 16), b2 = parseInt(rgb2[3], 16);

    const hue1Param = hueToSkydimo(rgbToHsv(r1, g1, b1));
    const hue2Param = hueToSkydimo(rgbToHsv(r2, g2, b2));

    let luaCode = `-- Skydimo Exact Hue Mapping Script\nlocal cfg = {\n    brightness = ${brightness} / 100,\n    speed = ${speed} / 1000,\n    hue1 = ${hue1Param},\n    hue2 = ${hue2Param}\n}\n\n`;

    luaCode += `function get_hue(val)\n    return math.floor((val + 100) * 1.8) % 360\nend\n\n`;
    
    // Global memory table for throttled random effects
    if (type === 'sparkle' || type === 'glitch') {
        luaCode += `local led_states = {}\n\n`;
    }

    const needsBlending = ['aurora', 'plasma', 'helix', 'dual_sine'].includes(type);

    if (needsBlending) {
        luaCode += `function blend_hsv(mix, intensity)\n    local h1 = get_hue(cfg.hue1)\n    local h2 = get_hue(cfg.hue2)\n    local d = h2 - h1\n    if d > 180 then d = d - 360 elseif d < -180 then d = d + 360 end\n    local h = (h1 + d * (1 - mix)) % 360\n    if h < 0 then h = h + 360 end\n    return hsv(math.floor(h), 255, math.floor(intensity * cfg.brightness * 255))\nend\n\n`;
    }

    switch (type) {
        // --- STRICTLY SINGLE COLOR ---
        case 'solid': luaCode += `function get_color(x, y, width, height, env)\n    return hsv(get_hue(cfg.hue1), 255, math.floor(255 * cfg.brightness))\nend`; break;
        case 'rainbow': luaCode += `function get_color(x, y, width, height, env)\n    local hue = math.floor((x / width * 360 + env.time * (cfg.speed * 50)) % 360)\n    return hsv(hue, 255, math.floor(255 * cfg.brightness))\nend`; break;
        case 'wave': luaCode += `function get_color(x, y, width, height, env)\n    local i = (math.sin((x / 10) + env.time * (cfg.speed * 5)) + 1) / 2\n    return hsv(get_hue(cfg.hue1), 255, math.floor(255 * i * cfg.brightness))\nend`; break;
        case 'scanner': luaCode += `function get_color(x, y, width, height, env)\n    local cyc = (width - 1) * 2\n    local pos = (env.time * (cfg.speed * 25)) % cyc\n    if pos >= width then pos = cyc - pos end\n    local i = math.max(0, 1 - (math.abs(x - pos) / 10))\n    return hsv(get_hue(cfg.hue1), 255, math.floor(255 * i * cfg.brightness))\nend`; break;
        case 'sweep': luaCode += `function get_color(x, y, width, height, env)\n    local pos = (env.time * (cfg.speed * 25)) % width\n    local dist = math.min(math.abs(x - pos), width - math.abs(x - pos))\n    local i = math.max(0, 1 - (dist / 10))\n    return hsv(get_hue(cfg.hue1), 255, math.floor(255 * i * cfg.brightness))\nend`; break;
        case 'breathing': luaCode += `function get_color(x, y, width, height, env)\n    local i = (math.sin(env.time * (cfg.speed * 2.5)) + 1) / 2\n    return hsv(get_hue(cfg.hue1), 255, math.floor(255 * i * cfg.brightness))\nend`; break;
        case 'strobe': luaCode += `function get_color(x, y, width, height, env)\n    local i = (env.time * (cfg.speed * 10)) % 1 < 0.5 and 1 or 0\n    return hsv(get_hue(cfg.hue1), 255, math.floor(255 * i * cfg.brightness))\nend`; break;
        case 'comet': luaCode += `function get_color(x, y, width, height, env)\n    local dist = (env.time * (cfg.speed * 25) - x) % width\n    local i = math.max(0, 1 - (dist / (width / 1.5))) ^ 3\n    return hsv(get_hue(cfg.hue1), 255, math.floor(255 * i * cfg.brightness))\nend`; break;
        case 'ripple': luaCode += `function get_color(x, y, width, height, env)\n    local center = width / 2\n    local dist = math.abs(x - center)\n    local wave = (math.sin(dist / 5 - env.time * (cfg.speed * 10)) + 1) / 2\n    local edge = math.max(0, 1 - (dist / center))\n    return hsv(get_hue(cfg.hue1), 255, math.floor(255 * wave * edge * cfg.brightness))\nend`; break;
        case 'sine_pulse': luaCode += `function get_color(x, y, width, height, env)\n    local i = (math.sin(env.time * cfg.speed * 5) + 1) / 2\n    return hsv(get_hue(cfg.hue1), 255, math.floor(255 * i * cfg.brightness))\nend`; break;
        case 'bounce_sine': luaCode += `function get_color(x, y, width, height, env)\n    local pos = (math.sin(env.time * cfg.speed * 2.5) + 1) / 2 * width\n    local i = math.max(0, 1 - (math.abs(x - pos) / 6))\n    return hsv(get_hue(cfg.hue1), 255, math.floor(255 * i * cfg.brightness))\nend`; break;
        case 'radial_pulse': luaCode += `function get_color(x, y, width, height, env)\n    local dist = math.sqrt((x - width/2)^2 + (y - height/2)^2)\n    local i = (math.sin(dist / 3 - env.time * (cfg.speed * 5)) + 1) / 2\n    return hsv(get_hue(cfg.hue1), 255, math.floor(255 * i * cfg.brightness))\nend`; break;
        case 'diagonal_wave': luaCode += `function get_color(x, y, width, height, env)\n    local i = (math.sin((x + y) / 10 + env.time * (cfg.speed * 5)) + 1) / 2\n    return hsv(get_hue(cfg.hue1), 255, math.floor(255 * i * cfg.brightness))\nend`; break;
        case 'matrix_rain': luaCode += `function get_color(x, y, width, height, env)\n    local col_spd = 0.5 + (math.sin(x * 123.45) + 1) * 0.5\n    local drop = (env.time * (cfg.speed * 25) * col_spd + math.sin(x * 987.65) * 100) % (height + 25)\n    local dist = y - (drop - 12)\n    local i = (dist > 0 and dist < 15) and (1 - (dist / 15))^1.5 or 0\n    return hsv(get_hue(cfg.hue1), 255, math.floor(255 * i * cfg.brightness))\nend`; break;
        case 'grid_scan': luaCode += `function get_color(x, y, width, height, env)\n    local posX = (env.time * (cfg.speed * 20)) % width\n    local posY = (env.time * (cfg.speed * 15)) % height\n    local iX = math.max(0, 1 - (math.abs(x - posX) / 4))\n    local iY = math.max(0, 1 - (math.abs(y - posY) / 4))\n    local i = math.max(iX, iY)\n    return hsv(get_hue(cfg.hue1), 255, math.floor(255 * i * cfg.brightness))\nend`; break;
        case 'v_sweep': luaCode += `function get_color(x, y, width, height, env)\n    local pos = (env.time * (cfg.speed * 25)) % height\n    local i = math.max(0, 1 - (math.abs(y - pos) / 5))\n    return hsv(get_hue(cfg.hue1), 255, math.floor(255 * i * cfg.brightness))\nend`; break;
        case 'fire': luaCode += `function get_color(x, y, width, height, env)\n    local noise = math.abs(math.sin(x * 12.3 + y * 45.6 + env.time * cfg.speed * 10))\n    local flicker = (noise * 0.4) + 0.6\n    local sine = (math.sin(env.time * (cfg.speed * 7.5)) + 2) / 3\n    return hsv(get_hue(cfg.hue1), 255, math.floor(255 * flicker * sine * cfg.brightness))\nend`; break;
        case 'heartbeat': luaCode += `function get_color(x, y, width, height, env)\n    local t = (env.time * (cfg.speed * 1)) % 1\n    local i = math.exp(-60 * (t - 0.1)^2) + math.exp(-60 * (t - 0.35)^2)\n    return hsv(get_hue(cfg.hue1), 255, math.floor(255 * i * cfg.brightness))\nend`; break;

        // --- 2D EFFECTS ---
        case 'radar': luaCode += `function get_color(x, y, width, height, env)\n    local angle = math.atan2(y - height/2, x - width/2)\n    local sweep = (angle + env.time * cfg.speed * 2.5) % (math.pi * 2)\n    if sweep < 0 then sweep = sweep + math.pi * 2 end\n    local i = (1 - sweep / (math.pi * 2)) ^ 3\n    return hsv(get_hue(cfg.hue1), 255, math.floor(255 * i * cfg.brightness))\nend`; break;
        case 'waterfall': luaCode += `function get_color(x, y, width, height, env)\n    local pos = (env.time * cfg.speed * 15 + math.sin(x * 123.4) * 10) % height\n    if pos < 0 then pos = pos + height end\n    local i = math.max(0, 1 - math.abs(y - pos) / 5)\n    return hsv(get_hue(cfg.hue1), 255, math.floor(255 * i * cfg.brightness))\nend`; break;
        case 'vortex': luaCode += `function get_color(x, y, width, height, env)\n    local dx, dy = x - width/2, y - height/2\n    local dist = math.sqrt(dx*dx + dy*dy)\n    local angle = math.atan2(dy, dx)\n    local i = (math.sin(dist/3 - env.time*cfg.speed*5 + angle) + 1) / 2\n    return hsv(get_hue(cfg.hue1), 255, math.floor(255 * i * cfg.brightness))\nend`; break;
        case 'kaleidoscope': luaCode += `function get_color(x, y, width, height, env)\n    local dx, dy = math.abs(x - width/2), math.abs(y - height/2)\n    local i = (math.sin(dx/3 + env.time*cfg.speed*2.5) + math.sin(dy/3 - env.time*cfg.speed*2) + 2) / 4\n    return hsv(get_hue(cfg.hue1), 255, math.floor(255 * i * cfg.brightness))\nend`; break;

        // --- ALTERNATING COLORS ---
        case 'theater': luaCode += `function get_color(x, y, width, height, env)\n    local step = (x + math.floor(env.time * cfg.speed * 10)) % 3\n    if step == 0 then return hsv(get_hue(cfg.hue1), 255, math.floor(255 * cfg.brightness))\n    elseif step == 1 then return hsv(get_hue(cfg.hue2), 255, math.floor(255 * cfg.brightness))\n    else return hsv(0, 0, 0) end\nend`; break;
        case 'police': luaCode += `function get_color(x, y, width, height, env)\n    local state = math.floor(env.time * cfg.speed * 5) % 2\n    local isLeft = x < width / 2\n    if state == 0 and isLeft then return hsv(get_hue(cfg.hue1), 255, math.floor(255 * cfg.brightness))\n    elseif state == 1 and not isLeft then return hsv(get_hue(cfg.hue2), 255, math.floor(255 * cfg.brightness))\n    else return hsv(0, 0, 0) end\nend`; break;
        
        // --- RANDOM WITH THROTTLE COUNTER (Tick logic) ---
        case 'glitch': luaCode += `function get_color(x, y, width, height, env)
    local tick = math.floor(env.time * cfg.speed * 10)
    local id = x .. "_" .. y
    if not led_states[id] or led_states[id].tick ~= tick then
        led_states[id] = { val = math.random(1, 100), tick = tick }
    end
    local chance = led_states[id].val
    if chance > 95 then return hsv(get_hue(cfg.hue2), 255, math.floor(255 * cfg.brightness))
    elseif chance > 90 then return hsv(0, 0, 0)
    else return hsv(get_hue(cfg.hue1), 255, math.floor(255 * cfg.brightness)) end
end`; break;
        
        case 'sparkle': luaCode += `function get_color(x, y, width, height, env)
    local tick = math.floor(env.time * cfg.speed * 10)
    local id = x .. "_" .. y
    if not led_states[id] or led_states[id].tick ~= tick then
        led_states[id] = { val = math.random(1, 100), tick = tick }
    end
    local chance = led_states[id].val
    if chance > 95 then return hsv(get_hue(cfg.hue1), 255, math.floor(255 * cfg.brightness))
    elseif chance > 90 then return hsv(get_hue(cfg.hue2), 255, math.floor(255 * cfg.brightness))
    else return hsv(0, 0, 0) end
end`; break;

        // --- BLENDING COLORS ---
        case 'aurora': luaCode += `function get_color(x, y, width, height, env)\n    local mix = (math.sin(x/15 + env.time*cfg.speed*1.5) + math.sin(y/10 - env.time*cfg.speed*1) + 2) / 4\n    return blend_hsv(mix, 1)\nend`; break;
        case 'plasma': luaCode += `function get_color(x, y, width, height, env)\n    local mix = (math.sin(x/5 + env.time*cfg.speed*5) + math.sin(y/5 - env.time*cfg.speed*2.5) + 2) / 4\n    return blend_hsv(mix, 1)\nend`; break;
        case 'helix': luaCode += `function get_color(x, y, width, height, env)\n    local s1 = math.max(0, math.sin(x/8 + env.time*cfg.speed*5))\n    local s2 = math.max(0, math.sin(x/8 + env.time*cfg.speed*5 + math.pi))\n    local mix = s1 / (s1 + s2 + 0.001)\n    return blend_hsv(mix, math.min(1, s1 + s2))\nend`; break;
        case 'dual_sine': luaCode += `function get_color(x, y, width, height, env)\n    local s1 = (math.sin(x/10 + env.time * cfg.speed * 2.5) + 1) / 2\n    local s2 = (math.cos(x/15 - env.time * cfg.speed * 4) + 1) / 2\n    local mix = s1 / (s1 + s2 + 0.001)\n    return blend_hsv(mix, (s1 + s2) / 2)\nend`; break;
        
        default: luaCode += `function get_color(x, y, width, height, env)\n    return hsv(0, 0, 0)\nend`;
    }

    elements.out.value = luaCode;
}

function renderPreview() {
    const type = elements.type.value;
    const speed = document.getElementById('speed').value / 1000;
    const brightness = document.getElementById('brightness').value / 100;
    const time = (Date.now() - startTime) / 1000;

    const cellW = elements.canvas.width / cols;
    const cellH = elements.canvas.height / rows;

    function hexToRgb(hex) {
        const res = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return res ? { r: parseInt(res[1], 16), g: parseInt(res[2], 16), b: parseInt(res[3], 16) } : { r: 0, g: 0, b: 0 };
    }
    const rawRgb1 = hexToRgb(elements.color.value);
    const rawRgb2 = hexToRgb(elements.color2.value);

    const tempParam = hueToSkydimo(rgbToHsv(rawRgb1.r, rawRgb1.g, rawRgb1.b));
    const tintParam = hueToSkydimo(rgbToHsv(rawRgb2.r, rawRgb2.g, rawRgb2.b));

    const h1 = ((tempParam + 100) * 1.8) % 360;
    const h2 = ((tintParam + 100) * 1.8) % 360;

    function hsvToRgb(h, s, v) {
        let c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
        let res = h < 60 ? [c,x,0] : h < 120 ? [x,c,0] : h < 180 ? [0,c,x] : h < 240 ? [0,x,c] : h < 300 ? [x,0,c] : [c,0,x];
        return [res[0]+m, res[1]+m, res[2]+m];
    }

    elements.ctx.clearRect(0, 0, elements.canvas.width, elements.canvas.height);

    for (let iy = 0; iy < rows; iy++) {
        for (let ix = 0; ix < cols; ix++) {
            let mix = 1, final_i = 1;
            let useRainbow = false, isOff = false;
            let isSingleColor = false, isAlternating = false, isBlending = false;
            let useColor2 = false;

            let stateId = `${ix}_${iy}`;
            let currentTick = Math.floor(time * speed * 10);

            if (type === 'solid') { final_i = 1; isSingleColor = true; }
            else if (type === 'rainbow') { useRainbow = true; }
            else if (type === 'wave') { final_i = (Math.sin((ix / 10) + time * (speed * 5)) + 1) / 2; isSingleColor = true; }
            else if (type === 'scanner') {
                let cyc = (cols - 1) * 2, p = (time * (speed * 25)) % cyc;
                if (p >= cols) p = cyc - p;
                final_i = Math.max(0, 1 - (Math.abs(ix - p) / 10)); isSingleColor = true;
            }
            else if (type === 'sweep') {
                let p = (time * (speed * 25)) % cols;
                let dist = Math.min(Math.abs(ix - p), cols - Math.abs(ix - p));
                final_i = Math.max(0, 1 - (dist / 10)); isSingleColor = true;
            }
            else if (type === 'breathing') { final_i = (Math.sin(time * (speed * 2.5)) + 1) / 2; isSingleColor = true; }
            else if (type === 'strobe') { final_i = (time * (speed * 10)) % 1 < 0.5 ? 1 : 0; isSingleColor = true; }
            else if (type === 'comet') {
                let d = (time * speed * 25 - ix) % cols; if (d < 0) d += cols;
                final_i = Math.pow(Math.max(0, 1 - (d / (cols / 1.5))), 3); isSingleColor = true;
            }
            else if (type === 'ripple') {
                let center = cols / 2, dist = Math.abs(ix - center);
                let w = (Math.sin(dist / 5 - time * speed * 10) + 1) / 2;
                let edge = Math.max(0, 1 - (dist / center));
                final_i = w * edge; isSingleColor = true;
            }
            else if (type === 'sine_pulse') {
                final_i = (Math.sin(time * speed * 5) + 1) / 2; isSingleColor = true;
            }
            else if (type === 'bounce_sine') {
                let pos = (Math.sin(time * speed * 2.5) + 1) / 2 * cols;
                final_i = Math.max(0, 1 - (Math.abs(ix - pos) / 6)); isSingleColor = true;
            }
            else if (type === 'radial_pulse') {
                let dist = Math.sqrt(Math.pow(ix - cols / 2, 2) + Math.pow(iy - rows / 2, 2));
                final_i = (Math.sin(dist / 3 - time * (speed * 5)) + 1) / 2; isSingleColor = true;
            }
            else if (type === 'diagonal_wave') {
                final_i = (Math.sin((ix + iy) / 10 + time * (speed * 5)) + 1) / 2; isSingleColor = true;
            }
            else if (type === 'matrix_rain') {
                let colSpd = 0.5 + (Math.sin(ix * 123) + 1) * 0.5;
                let drop = (time * speed * 25 * colSpd + Math.sin(ix * 987) * 100) % (rows + 25);
                final_i = Math.max(0, 1 - (Math.abs(iy - (drop - 12)) / 15)) ** 1.5; isSingleColor = true;
            }
            else if (type === 'grid_scan') {
                let posX = (time * speed * 20) % cols, posY = (time * speed * 15) % rows;
                let iX = Math.max(0, 1 - (Math.abs(ix - posX) / 4)), iY = Math.max(0, 1 - (Math.abs(iy - posY) / 4));
                final_i = Math.max(iX, iY); isSingleColor = true;
            }
            else if (type === 'v_sweep') {
                let pos = (time * speed * 25) % rows;
                final_i = Math.max(0, 1 - (Math.abs(iy - pos) / 5)); isSingleColor = true;
            }
            else if (type === 'fire') {
                let noise = Math.abs(Math.sin(ix * 12.3 + iy * 45.6 + time * speed * 10));
                let flicker = (noise * 0.4) + 0.6;
                let s = (Math.sin(time * speed * 7.5) + 2) / 3;
                final_i = flicker * s; isSingleColor = true;
            }
            else if (type === 'heartbeat') {
                let t = (time * speed * 1) % 1; 
                final_i = Math.exp(-60 * Math.pow(t - 0.1, 2)) + Math.exp(-60 * Math.pow(t - 0.35, 2)); isSingleColor = true;
            }
            
            // PREVIEW RENDER 2D EFFECTS
            else if (type === 'radar') {
                let angle = Math.atan2(iy - rows/2, ix - cols/2);
                let sweep = (angle + time * speed * 2.5) % (Math.PI * 2);
                if (sweep < 0) sweep += Math.PI * 2;
                final_i = Math.pow(1 - sweep / (Math.PI * 2), 3); isSingleColor = true;
            }
            else if (type === 'waterfall') {
                let pos = (time * speed * 15 + Math.sin(ix * 123.4) * 10) % rows;
                if (pos < 0) pos += rows;
                final_i = Math.max(0, 1 - Math.abs(iy - pos) / 5); isSingleColor = true;
            }
            else if (type === 'vortex') {
                let dx = ix - cols/2, dy = iy - rows/2;
                let dist = Math.sqrt(dx*dx + dy*dy);
                let angle = Math.atan2(dy, dx);
                final_i = (Math.sin(dist/3 - time * speed * 5 + angle) + 1) / 2; isSingleColor = true;
            }
            else if (type === 'kaleidoscope') {
                let dx = Math.abs(ix - cols/2), dy = Math.abs(iy - rows/2);
                final_i = (Math.sin(dx/3 + time*speed*2.5) + Math.sin(dy/3 - time*speed*2) + 2) / 4; isSingleColor = true;
            }

            // ALTERNATING WITH TICK-THROTTLED MATH.RANDOM()
            else if (type === 'sparkle') {
                if (!ledStates[stateId] || ledStates[stateId].tick !== currentTick) {
                    ledStates[stateId] = { val: Math.random(), tick: currentTick };
                }
                let chance = ledStates[stateId].val;
                if (chance > 0.95) { final_i = 1; isAlternating = true; useColor2 = false; }
                else if (chance > 0.90) { final_i = 1; isAlternating = true; useColor2 = true; }
                else { isOff = true; }
            }
            else if (type === 'glitch') {
                if (!ledStates[stateId] || ledStates[stateId].tick !== currentTick) {
                    ledStates[stateId] = { val: Math.random(), tick: currentTick };
                }
                let chance = ledStates[stateId].val;
                if (chance > 0.95) { final_i = 1; isAlternating = true; useColor2 = true; }
                else if (chance > 0.90) { isOff = true; }
                else { final_i = 1; isAlternating = true; useColor2 = false; }
            }
            else if (type === 'theater') {
                let step = (ix + Math.floor(time * speed * 10)) % 3;
                if (step === 0) { final_i = 1; isAlternating = true; useColor2 = false; }
                else if (step === 1) { final_i = 1; isAlternating = true; useColor2 = true; }
                else { isOff = true; }
            }
            else if (type === 'police') {
                let state = Math.floor(time * speed * 5) % 2;
                let isLeft = ix < cols / 2;
                if (state === 0 && isLeft) { final_i = 1; isAlternating = true; useColor2 = false; }
                else if (state === 1 && !isLeft) { final_i = 1; isAlternating = true; useColor2 = true; }
                else { isOff = true; }
            }

            // BLENDING
            else if (type === 'aurora') {
                mix = (Math.sin(ix / 15 + time * speed * 1.5) + Math.sin(iy / 10 - time * speed * 1) + 2) / 4;
                final_i = 1; isBlending = true;
            }
            else if (type === 'plasma') {
                mix = (Math.sin(ix / 5 + time * speed * 5) + Math.sin(iy / 5 - time * speed * 2.5) + 2) / 4;
                final_i = 1; isBlending = true;
            }
            else if (type === 'helix') {
                let s1 = Math.max(0, Math.sin(ix / 8 + time * speed * 5));
                let s2 = Math.max(0, Math.sin(ix / 8 + time * speed * 5 + Math.PI));
                mix = s1 / (s1 + s2 + 0.001);
                final_i = Math.min(1, s1 + s2); isBlending = true;
            }
            else if (type === 'dual_sine') {
                let s1 = (Math.sin(ix / 10 + time * speed * 2.5) + 1) / 2;
                let s2 = (Math.cos(ix / 15 - time * speed * 4) + 1) / 2;
                mix = s1 / (s1 + s2 + 0.001);
                final_i = (s1 + s2) / 2; isBlending = true;
            }

            let r = 0, g = 0, b = 0;

            if (useRainbow) {
                let hue = ((ix / cols) * 360 + time * (speed * 50)) % 360;
                let c = 255, x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
                if (hue < 60) [r, g, b] = [c, x, 0]; else if (hue < 120) [r, g, b] = [x, c, 0]; else if (hue < 180) [r, g, b] = [0, c, x];
                else if (hue < 240) [r, g, b] = [0, x, c]; else if (hue < 300) [r, g, b] = [x, 0, c]; else [r, g, b] = [c, 0, x];
            } else if (!isOff) {
                if (isSingleColor) {
                    let rgbArr = hsvToRgb(h1, 1, final_i);
                    r = rgbArr[0] * 255; g = rgbArr[1] * 255; b = rgbArr[2] * 255;
                } else if (isAlternating) {
                    let active_h = useColor2 ? h2 : h1;
                    let rgbArr = hsvToRgb(active_h, 1, final_i);
                    r = rgbArr[0] * 255; g = rgbArr[1] * 255; b = rgbArr[2] * 255;
                } else if (isBlending) {
                    let d = h2 - h1;
                    if (d > 180) d -= 360; else if (d < -180) d += 360;
                    let blend_h = (h1 + d * (1 - mix)) % 360;
                    if (blend_h < 0) blend_h += 360;
                    let rgbArr = hsvToRgb(blend_h, 1, final_i);
                    r = rgbArr[0] * 255; g = rgbArr[1] * 255; b = rgbArr[2] * 255;
                }
            }
            
            r *= brightness; g *= brightness; b *= brightness;
            elements.ctx.fillStyle = `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
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

[elements.type, elements.color, elements.color2].forEach(el => el.addEventListener('input', () => { 
    ledStates = {}; // Clear random states when switching effects
    saveState(); 
    generateSkydimoLua(); 
}));

let savedPresets = JSON.parse(localStorage.getItem('skydimoPresets')) || [];

function updatePresetsUI() {
    elements.presetsList.innerHTML = '';
    savedPresets.forEach((preset, index) => {
        const row = document.createElement('div');
        row.className = "preset-item";
        row.style = "display: flex; justify-content: space-between; align-items: center; background: #333; padding: 5px; border-radius: 4px; margin-bottom: 5px;";
        row.innerHTML = `<span style="cursor:pointer; flex-grow:1; font-size:0.85rem;">${preset.name}</span><button style="background:none; border:none; color:#ff5555; cursor:pointer; font-weight:bold; font-size:1.2rem;">×</button>`;
        row.querySelector('span').onclick = () => applyPreset(preset);
        row.querySelector('button').onclick = () => { 
            savedPresets.splice(index, 1); 
            localStorage.setItem('skydimoPresets', JSON.stringify(savedPresets)); 
            updatePresetsUI(); 
        };
        elements.presetsList.appendChild(row);
    });
}

function applyPreset(preset) {
    elements.type.value = preset.type;
    elements.color.value = preset.color;
    elements.color2.value = preset.color2;
    syncPairs.forEach(id => {
        if (preset[id] !== undefined) {
            const slider = document.getElementById(id);
            const num = document.getElementById(`${id}-num`);
            if (slider) slider.value = preset[id];
            if (num) num.value = preset[id];
        }
    });
    ledStates = {};
    saveState();
    generateSkydimoLua();
}

elements.savePresetBtn.addEventListener('click', () => {
    const name = elements.presetName.value.trim() || "Untitled Preset";
    const preset = { name, type: elements.type.value, color: elements.color.value, color2: elements.color2.value };
    syncPairs.forEach(id => {
        const el = document.getElementById(id);
        if (el) preset[id] = el.value;
    });
    savedPresets.push(preset);
    localStorage.setItem('skydimoPresets', JSON.stringify(savedPresets));
    elements.presetName.value = '';
    updatePresetsUI();
});

window.addEventListener('DOMContentLoaded', () => { 
    setupSyncing(); 
    loadState(); 
    updatePresetsUI();
    generateSkydimoLua(); 
    renderPreview(); 
});