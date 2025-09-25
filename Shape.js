// Shape.js
/**
 * Represents a drawable, interactive shape on the canvas.
 * Manages its own state, including position, size, appearance, and animation properties.
 */

// --- DEPENDENCIES: All of these functions are now self-contained in this file. ---
const FONT_DATA_4PX = {
    name: 'small', charWidth: 3, charHeight: 4, charSpacing: 1, lineSpacing: 2,
    map: {
        'A': ['010', '101', '111', '101'], 'B': ['110', '101', '111', '110'], 'C': ['011', '100', '100', '011'],
        'D': ['110', '101', '101', '110'], 'E': ['111', '100', '110', '111'], 'F': ['111', '100', '110', '100'],
        'G': ['011', '100', '101', '011'], 'H': ['101', '101', '111', '101'], 'I': ['111', '010', '010', '111'],
        'J': ['011', '001', '101', '010'], 'K': ['101', '110', '110', '101'], 'L': ['100', '100', '100', '111'],
        'M': ['101', '111', '101', '101'], 'N': ['110', '101', '101', '101'], 'O': ['010', '101', '101', '010'],
        'P': ['111', '101', '110', '100'], 'Q': ['010', '101', '111', '011'], 'R': ['110', '101', '110', '101'],
        'S': ['011', '100', '010', '110'], 'T': ['111', '010', '010', '010'], 'U': ['101', '101', '101', '011'],
        'V': ['101', '101', '010', '010'], 'W': ['101', '101', '111', '101'], 'X': ['101', '010', '010', '101'],
        'Y': ['101', '010', '010', '010'], 'Z': ['111', '001', '010', '111'],
        'a': ['000', '010', '111', '101'], 'b': ['100', '110', '101', '110'], 'c': ['000', '011', '100', '011'],
        'd': ['001', '011', '101', '011'], 'e': ['000', '010', '111', '111'], 'f': ['010', '100', '110', '100'],
        'g': ['011', '101', '011', '001'], 'h': ['100', '110', '101', '101'], 'i': ['010', '000', '010', '010'],
        'j': ['001', '000', '001', '010'], 'k': ['100', '110', '110', '101'], 'l': ['010', '010', '010', '010'],
        'm': ['000', '111', '111', '101'], 'n': ['000', '110', '101', '101'], 'o': ['000', '010', '101', '010'],
        'p': ['110', '101', '110', '100'], 'q': ['011', '101', '011', '001'], 'r': ['000', '110', '100', '100'],
        's': ['000', '111', '100', '011'], 't': ['100', '111', '100', '010'], 'u': ['000', '101', '101', '011'],
        'v': ['000', '101', '101', '010'], 'w': ['000', '101', '111', '111'], 'x': ['000', '101', '010', '101'],
        'y': ['101', '101', '011', '001'], 'z': ['000', '111', '010', '111'],
        '0': ['010', '101', '101', '010'], '1': ['010', '110', '010', '010'], '2': ['110', '001', '010', '111'],
        '3': ['111', '010', '101', '010'], '4': ['100', '101', '111', '001'], '5': ['111', '100', '011', '110'],
        '6': ['011', '100', '111', '010'], '7': ['111', '001', '010', '010'], '8': ['010', '101', '010', '101'],
        '9': ['010', '111', '001', '110'], '.': ['000', '000', '000', '010'], ',': ['000', '000', '010', '010'],
        '!': ['010', '010', '000', '010'], '?': ['010', '101', '000', '010'], "'": ['010', '010', '000', '000'],
        '"': ['101', '101', '000', '000'], ':': ['000', '010', '000', '010'], ';': ['000', '010', '010', '010'],
        '(': ['010', '100', '100', '010'], ')': ['100', '010', '010', '100'], '-': ['000', '000', '111', '000'],
        '+': ['000', '010', '111', '010'], '=': ['000', '111', '000', '111'], '*': ['101', '010', '101', '000'],
        '/': ['001', '010', '100', '000'], '\\': ['100', '010', '001', '000'], '#': ['010', '111', '010', '111'],
        '$': ['010', '111', '101', '111'], '%': ['101', '001', '010', '101'], '&': ['010', '101', '010', '101'],
        ' ': ['000', '000', '000', '000']
    }
};

const FONT_DATA_5PX = {
    name: 'large', charWidth: 5, charHeight: 5, charSpacing: 1, lineSpacing: 1,
    map: {
        'A': ['01110', '10001', '11111', '10001', '10001'], 'B': ['11110', '10001', '11110', '10001', '11110'],
        'C': ['01110', '10000', '10000', '10000', '01110'], 'D': ['11110', '10001', '10001', '10001', '11110'],
        'E': ['11111', '10000', '11110', '10000', '11111'], 'F': ['11111', '10000', '11110', '10000', '10000'],
        'G': ['01110', '10000', '10111', '10001', '01110'], 'H': ['10001', '10001', '11111', '10001', '10001'],
        'I': ['11111', '00100', '00100', '00100', '11111'], 'J': ['00111', '00001', '00001', '10001', '01110'],
        'K': ['10001', '10010', '11100', '10010', '10001'], 'L': ['10000', '10000', '10000', '10000', '11111'],
        'M': ['10001', '11011', '10101', '10001', '10001'], 'N': ['10001', '11001', '10101', '10011', '10001'],
        'O': ['01110', '10001', '10001', '10001', '01110'], 'P': ['11110', '10001', '11110', '10000', '10000'],
        'Q': ['01110', '10001', '10101', '10010', '01101'], 'R': ['11110', '10001', '11110', '10010', '10001'],
        'S': ['01110', '10000', '01110', '00001', '11110'], 'T': ['11111', '00100', '00100', '00100', '00100'],
        'U': ['10001', '10001', '10001', '10001', '01110'], 'V': ['10001', '10001', '10001', '01010', '00100'],
        'W': ['10001', '10001', '10101', '11011', '10001'], 'X': ['10001', '01010', '00100', '01010', '10001'],
        'Y': ['10001', '01010', '00100', '00100', '00100'], 'Z': ['11111', '00010', '00100', '01000', '11111'],
        'a': ['00000', '01110', '10001', '01111', '00000'], 'b': ['10000', '10000', '11110', '10001', '11110'],
        'c': ['00000', '01110', '10000', '10000', '01110'], 'd': ['00001', '00001', '01111', '10001', '01111'],
        'e': ['00000', '01110', '11111', '10000', '01110'], 'f': ['00110', '01001', '01000', '01000', '01000'],
        'g': ['00000', '01111', '10001', '01111', '00001'], 'h': ['10000', '10000', '11110', '10001', '10001'],
        'i': ['01110', '00000', '01100', '01000', '01110'], 'j': ['00110', '00000', '00110', '00100', '11000'],
        'k': ['10000', '10010', '11100', '11100', '10010'], 'l': ['01000', '01000', '01000', '01000', '01110'],
        'm': ['00000', '11010', '10101', '10101', '10001'], 'n': ['00000', '11110', '10001', '10001', '10001'],
        'o': ['00000', '01110', '10001', '10001', '01110'], 'p': ['00000', '11110', '10001', '11110', '10000'],
        'q': ['00000', '01111', '10001', '01111', '00001'], 'r': ['00000', '10110', '11000', '10000', '10000'],
        's': ['00000', '01111', '01000', '10010', '11100'], 't': ['01000', '11110', '01000', '01000', '00110'],
        'u': ['00000', '10001', '10001', '10001', '01111'], 'v': ['00000', '10001', '10001', '01010', '00100'],
        'w': ['00000', '10101', '10101', '11111', '10101'], 'x': ['00000', '10001', '01110', '01110', '10001'],
        'y': ['00000', '10001', '10001', '01111', '00001'], 'z': ['00000', '11111', '00110', '01100', '11111'],
        '0': ['01110', '10011', '10101', '11001', '01110'], '1': ['00100', '01100', '00100', '00100', '01110'],
        '2': ['01110', '10001', '00110', '01000', '11111'], '3': ['11111', '00010', '01100', '00001', '11110'],
        '4': ['00110', '01010', '10010', '11111', '00010'], '5': ['11111', '10000', '11110', '00001', '11110'],
        '6': ['01110', '10000', '11110', '10001', '01110'], '7': ['11111', '00001', '00010', '00100', '00100'],
        '8': ['01110', '10001', '01110', '10001', '01110'], '9': ['01110', '10001', '01111', '00001', '01110'],
        ' ': ['00000', '00000', '00000', '00000', '00000'], '.': ['00000', '00000', '00000', '01100', '01100'],
        ',': ['00000', '00000', '00000', '01100', '01000'], '!': ['01100', '01100', '01100', '00000', '01100'],
        '?': ['01110', '10001', '00110', '00000', '00100'], "'": ['00110', '00110', '00100', '00000', '00000'],
        '"': ['11011', '11011', '00000', '00000', '00000'], ':': ['00000', '01100', '00000', '01100', '00000'],
        ';': ['00000', '00000', '01100', '00000', '01000'], '(': ['00100', '01000', '01000', '01000', '00100'],
        ')': ['10000', '01000', '01000', '01000', '10000'], '-': ['00000', '00000', '11111', '00000', '00000'],
        '+': ['00000', '00100', '01110', '00100', '00000'], '=': ['00000', '11111', '00000', '11111', '00000'],
        '*': ['01010', '01010', '11111', '01010', '01010'], '/': ['00001', '00010', '00100', '01000', '10000'],
        '\\': ['10000', '01000', '00100', '00010', '00001'], '#': ['01010', '11111', '01010', '11111', '01010'],
        '$': ['00100', '01110', '10101', '01110', '00100'], '%': ['11001', '01010', '00100', '01010', '10011'],
        '&': ['01110', '10001', '01110', '10101', '01011']
    }
};

function hexToHsl(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    if (max === min) { h = s = 0; } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h * 360, s * 100, l * 100];
}

function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;
    const k = n => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    const toHex = c => Math.round(c * 255).toString(16).padStart(2, '0');
    return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

/**
 * A completely isolated function to draw axes for the time plot.
 * It has no dependency on the 'this' context of the Shape class.
 * @param {CanvasRenderingContext2D} ctx The canvas context.
 * @param {number} width The width of the drawing area.
 * @param {number} height The height of the drawing area.
 */
function drawTimePlotAxes(ctx, width, height) {
    ctx.save(); // Save the state to ensure we don't interfere with other drawing.

    // Explicitly set all styles for the axes
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 4]);
    ctx.lineJoin = 'miter';
    ctx.lineCap = 'butt';

    // Y-Axis (Value)
    ctx.beginPath();
    ctx.moveTo(-width / 2, -height / 2);
    ctx.lineTo(-width / 2, height / 2);
    ctx.stroke();

    // X-Axis (Time)
    ctx.beginPath();
    ctx.moveTo(-width / 2, height / 2);
    ctx.lineTo(width / 2, height / 2);
    ctx.stroke();

    ctx.restore(); // Restore the state immediately after.
}

function drawPixelText(ctx, shape, textToRender) {
    const { x, y, width, height, pixelFont, fontSize, textAlign,
        textAnimation, scrollOffsetX, waveAngle, visibleCharCount } = shape;

    if (typeof textToRender !== 'string') return;

    const fontData = pixelFont === 'large' ? FONT_DATA_5PX : FONT_DATA_4PX;
    const { charWidth, charHeight, charSpacing, lineSpacing, map } = fontData;
    const pixelSize = fontSize / 10;

    const animatedText = textToRender.toUpperCase().substring(0, Math.floor(visibleCharCount));
    const lines = animatedText.split('\n');

    ctx.save();
    ctx.beginPath();

    if (textAnimation === 'wave') {
        const verticalPadding = 100;
        ctx.rect(x, y - verticalPadding, width, height + verticalPadding * 2);
    } else {
        ctx.rect(x, y, width, height);
    }
    ctx.clip();

    lines.forEach((line, lineIndex) => {
        const lineWidth = line.length * (charWidth + charSpacing) * pixelSize - (charSpacing * pixelSize);
        let lineStartX = x;
        if (textAlign === 'center') {
            lineStartX = x + (width - lineWidth) / 2;
        } else if (textAlign === 'right') {
            lineStartX = x + width - lineWidth;
        }

        for (let i = 0; i < line.length; i++) {
            const charData = map[line[i]] || map['?'];
            if (!charData) continue;

            let dx = lineStartX + i * (charWidth + charSpacing) * pixelSize + scrollOffsetX;
            let dy = y + pixelSize + lineIndex * (charHeight + lineSpacing) * pixelSize;

            if (textAnimation === 'wave') {
                // The wave is now based on the character's horizontal position (dx),
                // which creates a proper undulating effect as the text scrolls.
                dy += Math.sin(waveAngle + dx * 0.05) * (pixelSize * 2);
            }

            if (dx > x + width || dx < x - (charWidth * pixelSize)) {
                continue;
            }

            for (let r = 0; r < charHeight; r++) {
                for (let c = 0; c < charWidth; c++) {
                    if (charData[r] && charData[r][c] === '1') {
                        ctx.fillRect(dx + c * pixelSize, dy + r * pixelSize, pixelSize, pixelSize);
                    }
                }
            }
        }
    });

    ctx.restore();
}

function parseColorToRgba(colorStr) {
    if (typeof colorStr !== 'string') colorStr = '#000000';

    if (colorStr.startsWith('#')) {
        let hex = colorStr.slice(1);
        if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
        if (hex.length === 4) hex = hex.split('').map(c => c + c).join('');

        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);
        const a = hex.length === 8 ? parseInt(hex.substring(6, 8), 16) / 255 : 1;
        return { r, g, b, a };
    }

    if (colorStr.startsWith('rgb')) {
        const parts = colorStr.match(/(\d+(\.\d+)?)/g).map(Number);
        return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
    }

    if (colorStr.startsWith('hsl')) {
        const [h, s, l] = colorStr.match(/(\d+(\.\d+)?)/g).map(Number);
        const s_norm = s / 100;
        const l_norm = l / 100;
        if (s_norm === 0) return { r: l_norm * 255, g: l_norm * 255, b: l_norm * 255, a: 1 };

        const c = (1 - Math.abs(2 * l_norm - 1)) * s_norm;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = l_norm - c / 2;
        let r_temp, g_temp, b_temp;

        if (h >= 0 && h < 60) { [r_temp, g_temp, b_temp] = [c, x, 0]; }
        else if (h >= 60 && h < 120) { [r_temp, g_temp, b_temp] = [x, c, 0]; }
        else if (h >= 120 && h < 180) { [r_temp, g_temp, b_temp] = [0, c, x]; }
        else if (h >= 180 && h < 240) { [r_temp, g_temp, b_temp] = [0, x, c]; }
        else if (h >= 240 && h < 300) { [r_temp, g_temp, b_temp] = [x, 0, c]; }
        else { [r_temp, g_temp, b_temp] = [c, 0, x]; }

        return {
            r: Math.round((r_temp + m) * 255),
            g: Math.round((g_temp + m) * 255),
            b: Math.round((b_temp + m) * 255),
            a: 1
        };
    }
    return { r: 0, g: 0, b: 0, a: 1 }; // Fallback
}

/**
 * Linearly interpolates between two hexadecimal colors.
 * @param {string} a - The starting color in hex format (e.g., "#RRGGBB").
 * @param {string} b - The ending color in hex format (e.g., "#RRGGBB").
 * @param {number} amount - The interpolation amount (0.0 to 1.0).
 * @returns {string} The interpolated color in hex format.
 */
function lerpColor(a, b, amount) {
    const amt = (typeof amount === 'number' && isFinite(amount)) ? Math.max(0, Math.min(1, amount)) : 0;
    const c1 = parseColorToRgba(a);
    const c2 = parseColorToRgba(b);
    const r = Math.round(c1.r + amt * (c2.r - c1.r));
    const g = Math.round(c1.g + amt * (c2.g - c1.g));
    const b_val = Math.round(c1.b + amt * (c2.b - c1.b));
    const alpha = c1.a + amt * (c2.a - c1.a);
    return `rgba(${r}, ${g}, ${b_val}, ${alpha})`;
}

/**
 * Generates a color from a two-color pattern based on a time value.
 * Supports both HSL and hex color formats.
 * @param {number} t - The time value (typically 0.0 to 1.0) for the pattern.
 * @param {string} c1 - The first color (hex or HSL).
 * @param {string} c2 - The second color (hex or HSL).
 * @returns {string} The calculated color string.
 */
function getPatternColor(t, c1, c2) {
    t = (t % 1.0 + 1.0) % 1.0;
    const isHsl = c1.startsWith('hsl');
    if (isHsl) {
        const hue1 = parseFloat(c1.match(/hsl\((\d+\.?\d*)/)[1]);
        const hue2 = parseFloat(c2.match(/hsl\((\d+\.?\d*)/)[1]);
        let finalHue;
        if (t < 0.5) {
            finalHue = hue1 + (t / 0.5) * (hue2 - hue1);
        } else {
            finalHue = hue2 + ((t - 0.5) / 0.5) * (hue1 - hue2);
        }
        return `hsl(${finalHue % 360}, 100%, 50%)`;
    } else {
        if (t < 0.5) return lerpColor(c1, c2, t / 0.5);
        else return lerpColor(c2, c1, (t - 0.5) / 0.5);
    }
}

// Update this for a new property
class Shape {
    constructor({ id, name, shape, x, y, width, height, rotation, gradient, gradientStops, gradType, scrollDirection, cycleColors, cycleSpeed, animationSpeed, ctx,
        innerDiameter, angularWidth, numberOfSegments, rotationSpeed, useSharpGradient, locked, numberOfRows, numberOfColumns, phaseOffset,
        animationMode, text, fontSize, textAlign, pixelFont, textAnimation, textAnimationSpeed, showTime, showDate, autoWidth, lineWidth, waveType,
        frequency, oscDisplayMode, pulseDepth, fillShape, enableWaveAnimation, waveStyle, waveCount, tetrisBlockCount, tetrisAnimation, tetrisSpeed,
        tetrisBounce, tetrisHoldTime, sides, points, starInnerRadius, enableStroke, strokeWidth, strokeGradType, strokeGradient, strokeGradientStops, strokeScrollDir,
        strokeCycleColors, strokeCycleSpeed, strokeAnimationSpeed, strokeAnimationMode, strokeUseSharpGradient, strokeRotationSpeed,
        strokePhaseOffset, fireSpread, pixelArtFrames, enableAudioReactivity, audioTarget, audioMetric, audioSensitivity, audioSmoothing = 50, beatThreshold,
        vizBarCount, vizBarSpacing, vizSmoothing, vizStyle, vizLayout, vizDrawStyle, vizUseSegments, vizSegmentCount, vizSegmentSpacing, vizLineWidth, vizBarWidth,
        enableSensorReactivity, sensorTarget, sensorValueSource, userSensor, sensorMeterFill, timePlotLineThickness, timePlotFillArea = false,
        sensorMeterShowValue = false, timePlotAxesStyle = 'None', timePlotTimeScale = 5, gradientSpeedMultiplier, shapeAnimationSpeedMultiplier,
        seismicAnimationSpeedMultiplier, wavePhaseAngle, oscAnimationSpeed, strimerColumns, strimerBlockCount, strimerBlockSize, strimerAnimation,
        strimerDirection, strimerEasing, strimerBlockSpacing, strimerGlitchFrequency, strimerPulseSync, strimerAudioSensitivity, strimerBassLevel,
        strimerTrebleBoost, strimerAudioSmoothing, strimerPulseSpeed, vizBassLevel, vizTrebleBoost, vizAutoScale, vizMaxBarHeight, vizInnerRadius, vizDynamicRange, strimerSnakeIndex, strimerAnimationSpeed,
        strimerSnakeProgress, sensorColorMode, sensorMidThreshold, sensorMaxThreshold, spawn_shapeType, spawn_animation, spawn_count, spawn_spawnRate, spawn_lifetime, spawn_speed,
        spawn_size, spawn_gravity, spawn_spread, spawn_rotationSpeed, spawn_size_randomness, spawn_initialRotation_random, spawn_svg_path,
        spawn_rotationVariance, spawn_speedVariance, spawn_matrixCharSet, spawn_matrixEnableGlow, spawn_glowSize, spawn_matrixGlowSize, spawn_enableTrail,
        spawn_trailLength, spawn_audioTarget, spawn_trailSpacing, polylineNodes, polylineCurveStyle, pathAnim_enable, pathAnim_shape, pathAnim_size,
        pathAnim_speed, pathAnim_gradType, pathAnim_useSharpGradient, pathAnim_gradColor1, pathAnim_gradColor2,
        pathAnim_cycleColors, pathAnim_cycleSpeed, pathAnim_animationMode, pathAnim_animationSpeed, pathAnim_scrollDir, pathAnim_trail,
        pathAnim_trailLength, pathAnim_behavior, pathAnim_objectCount, pathAnim_objectSpacing, pathAnim_trailColor }) {
        // --- ALL properties are assigned here first ---
        this.lastDeltaTime = 0;
        this.dirty = true;
        this.id = id;
        this.name = name || `Object ${id}`;
        this.shape = shape || 'rectangle';
        this.isBeingManuallyRotated = false;
        this.x = x || 0;
        this.y = y || 0;
        this.width = width || 200;
        this.height = height || 152;
        this.rotation = rotation || 0;
        this.baseRotation = this.rotation;
        this.baseAnimationAngle = 0;
        this.gradType = gradType || 'solid';

        // Handle backward compatibility and new format for fill gradient
        if (gradient && (gradient.color1 || gradient.color2)) {
            this.gradient = { stops: [{ color: gradient.color1 || '#00ff00', position: 0.0 }, { color: gradient.color2 || '#d400ff', position: 1.0 }] };
        } else if (gradientStops) {
            this.gradient = { stops: (typeof gradientStops === 'string') ? JSON.parse(gradientStops) : gradientStops };
        } else {
            this.gradient = { stops: [{ color: '#00ff00', position: 0.0 }, { color: '#d400ff', position: 1.0 }] };
        }

        // Handle backward compatibility and new format for stroke gradient
        if (strokeGradient && (strokeGradient.color1 || strokeGradient.color2)) {
            this.strokeGradient = { stops: [{ color: strokeGradient.color1 || '#FFFFFF', position: 0.0 }, { color: strokeGradient.color2 || '#000000', position: 1.0 }] };
        } else if (strokeGradientStops) {
            this.strokeGradient = { stops: (typeof strokeGradientStops === 'string') ? JSON.parse(strokeGradientStops) : strokeGradientStops };
        } else {
            this.strokeGradient = { stops: [{ color: '#FFFFFF', position: 0.0 }, { color: '#000000', position: 1.0 }] };
        }

        this.scrollDirection = scrollDirection || 'right';
        this.cycleColors = cycleColors || false;
        this.cycleSpeed = cycleSpeed || 0;
        this.animationSpeed = animationSpeed || 0;
        this.animationMode = animationMode || 'loop';
        this.ctx = ctx;
        this._linearPatternCache = null;
        this.hue1 = 0;
        this.hue2 = 90;
        this.scrollOffset = 0;
        this.enableStroke = enableStroke || false;
        this.strokeWidth = strokeWidth || 2;
        this.strokeGradType = strokeGradType || 'solid';
        this.strokeGradient = strokeGradient ? { ...strokeGradient } : { color1: '#FFFFFF', color2: '#000000' };
        this.strokeScrollDir = strokeScrollDir || 'right';
        this.strokeAnimationMode = strokeAnimationMode || 'loop';
        this.strokeCycleColors = strokeCycleColors || false;
        this.strokeCycleSpeed = strokeCycleSpeed || 0;
        this.strokeAnimationSpeed = strokeAnimationSpeed || 0;
        this.strokeUseSharpGradient = strokeUseSharpGradient || false;
        this.strokeRotationSpeed = strokeRotationSpeed || 0;
        this.strokePhaseOffset = strokePhaseOffset || 10;
        this.strokeAnimationAngle = 0;
        this.strokeHue1 = 0;
        this.strokeHue2 = 90;
        this.strokeScrollOffset = 0;
        this.isReversing = false;
        this.randomStrokeElementState = null;
        this._strokeConicPatternCache = null;
        this.animationState = 'scrolling';
        this.waitTimer = 0;
        this.innerDiameter = innerDiameter || 100;
        this.angularWidth = angularWidth || 20;
        this.numberOfSegments = numberOfSegments || 12;
        this.rotationSpeed = rotationSpeed || 0;
        this.rotationAngle = 0;
        this.animationAngle = 0;
        this.wavePhaseAngle = wavePhaseAngle || 0;
        this.oscAnimationSpeed = oscAnimationSpeed || 0;
        this.useSharpGradient = useSharpGradient !== undefined ? useSharpGradient : false;
        this.locked = locked || false;
        this.numberOfRows = numberOfRows || 1;
        this.numberOfColumns = numberOfColumns || 1;
        this.phaseOffset = phaseOffset || 10;
        this.cellOrder = [];
        this._shuffleCellOrder();
        this.handleSize = 15;
        this.rotationHandleOffset = -30;
        this.rotationHandleRadius = 15;
        this.handles = [{ name: 'top-left', cursor: 'nwse-resize' }, { name: 'top', cursor: 'ns-resize' }, { name: 'top-right', cursor: 'nesw-resize' }, { name: 'left', cursor: 'ew-resize' }, { name: 'right', cursor: 'ew-resize' }, { name: 'bottom-left', cursor: 'nesw-resize' }, { name: 'bottom', cursor: 'ns-resize' }, { name: 'bottom-right', cursor: 'nwse-resize' }];
        this.randomElementState = null;
        this.text = text || 'Hello';
        this.fontSize = fontSize || 60;
        this.textAlign = textAlign || 'center';
        this.pixelFont = pixelFont || 'small';
        this.textAnimation = textAnimation || 'none';
        this.textAnimationSpeed = textAnimationSpeed || 10;
        this.scrollOffsetX = 0;
        this.scrollTimer = 0;
        this.visibleCharCount = 0;
        this.waveAngle = 0;
        this.typewriterWaitTimer = 0;
        this.showTime = showTime || false;
        this.showDate = showDate || false;
        this.autoWidth = autoWidth || false;
        this.lineWidth = lineWidth || 1;
        this.waveType = waveType || 'sine';
        this.frequency = frequency || 5;
        this.pulseDepth = pulseDepth !== undefined ? pulseDepth : 50;
        this.fillShape = fillShape || false;
        this.enableWaveAnimation = enableWaveAnimation !== undefined ? enableWaveAnimation : true;
        this.oscDisplayMode = oscDisplayMode || 'linear';
        this._pausedRotationSpeed = null;
        this._pausedAnimationSpeed = null;
        this.waveStyle = waveStyle || 'wavy';
        this.waveCount = waveCount || 5;
        this.tetrisBlockCount = tetrisBlockCount || 10;
        this.tetrisAnimation = tetrisAnimation || 'gravity';
        this.tetrisSpeed = tetrisSpeed || 5;
        this.tetrisBounce = tetrisBounce || 50;
        this.tetrisHoldTime = tetrisHoldTime || 50;
        this.tetrisHoldTimer = 0;
        this.tetrisSpeedDivisor = 10.0;
        this.tetrisBlocks = [];
        this.tetrisSpawnTimer = 0;
        this.tetrisStackHeight = 0;
        this.tetrisActiveBlockIndex = 0;
        this.tetrisFadeState = 'in';
        this.sides = sides || 6;
        this.points = points || 5;
        this.starInnerRadius = starInnerRadius || 50;
        this.fireParticles = [];
        this.fireSpread = fireSpread || 100;
        this.particleSpawnCounter = 0;
        this.nextParticleId = 0;

        try {
            const initialFrames = pixelArtFrames || '[{"data":"[[1]]","duration":1}]';
            this.pixelArtFrames = (typeof initialFrames === 'string') ? JSON.parse(initialFrames) : initialFrames;
        } catch (e) {
            console.error("Error parsing initial pixel art frames, falling back to default.", e);
            this.pixelArtFrames = [{ data: '[[1]]', duration: 1 }];
        }
        this.currentFrameIndex = 0;
        this.frameTimer = (this.pixelArtFrames[0] && this.pixelArtFrames[0].duration) || 1;

        this.internalScale = 1.0;
        this.colorOverride = null;
        this.audioHistory = new Array(30).fill(0);
        this.flashDecay = 0;
        this.beatThreshold = beatThreshold || 30;
        this.baseBeatThreshold = this.beatThreshold;
        this.enableAudioReactivity = enableAudioReactivity || false;
        this.audioTarget = audioTarget || 'size';
        this.audioMetric = audioMetric || 'volume';
        this.audioSensitivity = audioSensitivity || 10;
        this.audioSmoothing = audioSmoothing;
        this.smoothedAudioValue = 0;
        this.volumeMeterFill = 0;
        this.vizBarSpacing = vizBarSpacing || 2;
        this.vizSmoothing = vizSmoothing || 60;
        this.vizStyle = vizStyle || 'bottom';
        this.vizBarCount = vizBarCount || 32;
        this.vizBarHeights = new Array(parseInt(this.vizBarCount, 10)).fill(0);
        this.vizLayout = vizLayout || 'Linear';
        this.vizDrawStyle = vizDrawStyle || 'Bars';
        this.vizUseSegments = vizUseSegments || false;
        this.vizSegmentCount = vizSegmentCount || 16;
        this.vizSegmentSpacing = vizSegmentSpacing || 1;
        this.vizLineWidth = vizLineWidth || 8;
        this.vizBarWidth = vizBarWidth || 10;
        this.vizBassLevel = vizBassLevel || 50;
        this.vizTrebleBoost = vizTrebleBoost || 125;
        this.vizAutoScale = vizAutoScale !== undefined ? vizAutoScale : true;
        this.vizMaxBarHeight = vizMaxBarHeight || 100;
        this.vizInnerRadius = vizInnerRadius || 40;
        this.vizDynamicRange = vizDynamicRange || false;
        this.smoothedFreqDataSize = undefined; // Initialize for dynamic range
        this.enableSensorReactivity = enableSensorReactivity || false;
        this.sensorTarget = sensorTarget || 'Sensor Meter';
        this.sensorValueSource = sensorValueSource || 'value';
        this.userSensor = userSensor || 'CPU Load';
        this.sensorMeterFill = sensorMeterFill || 0;
        this.timePlotLineThickness = timePlotLineThickness || 1;
        this.timePlotFillArea = timePlotFillArea;
        this.sensorMeterShowValue = sensorMeterShowValue;
        this.timePlotAxesStyle = timePlotAxesStyle;
        this.timePlotTimeScale = timePlotTimeScale;
        this.sensorRawValue = 0
        this.baseWidth = this.width;
        this.baseHeight = this.height;
        this.baseRotation = this.rotation;
        this.baseAnimationSpeed = this.animationSpeed;
        this.baseStrokeWidth = this.strokeWidth;
        this.baseGradient = { ...this.gradient };
        this.baseStarInnerRadius = this.starInnerRadius;
        this.baseInnerDiameter = this.innerDiameter;
        this.basePulseDepth = this.pulseDepth;
        this.sensorHistory = [];
        this.gradientSpeedMultiplier = gradientSpeedMultiplier || (1 / 400);
        this.shapeAnimationSpeedMultiplier = shapeAnimationSpeedMultiplier || 0.05;
        this.seismicAnimationSpeedMultiplier = seismicAnimationSpeedMultiplier || 0.015;
        this.strimerMeterHeights = [];
        this.strimerColumns = strimerColumns || 4;
        this.strimerBlockCount = strimerBlockCount || 3;
        this.strimerBlockSize = strimerBlockSize || 40;
        this.strimerAnimation = strimerAnimation || 'Bounce';
        this.strimerDirection = strimerDirection || 'Random';
        this.strimerEasing = strimerEasing || 'Linear';
        this.strimerBlocks = [];
        this.strimerBlockSpacing = strimerBlockSpacing || 20;
        this.strimerGlitchFrequency = strimerGlitchFrequency || 0;
        this.strimerPulseSync = strimerPulseSync || true;
        this.strimerPulseSpeed = strimerPulseSpeed || 0;
        this.pulseProgress = 0;
        this.strimerAudioSensitivity = strimerAudioSensitivity || 100;
        this.strimerBassLevel = strimerBassLevel || 50;
        this.strimerTrebleBoost = strimerTrebleBoost || 150;
        this.strimerSnakeIndex = strimerSnakeIndex || 0;
        this.strimerSnakeDirection = 'Vertical';
        this.strimerAnimationSpeed = strimerAnimationSpeed || 20;
        this.strimerSnakeProgress = strimerSnakeProgress || 0;
        this.sensorColorMode = sensorColorMode || 'None';
        this.sensorMidThreshold = sensorMidThreshold || 50;
        this.sensorMaxThreshold = sensorMaxThreshold || 90;
        this.spawn_audioTarget = spawn_audioTarget || 'none';

        // Spawner
        this.spawn_shapeType = spawn_shapeType || 'circle';
        this.spawn_animation = spawn_animation || 'explode';
        this.spawn_count = spawn_count || 100;
        this.spawn_spawnRate = spawn_spawnRate || 50;
        this.spawn_lifetime = spawn_lifetime || 3;
        this.spawn_speed = spawn_speed || 50;
        this.spawn_speedVariance = spawn_speedVariance || 0;
        this.spawn_size = spawn_size || 10;
        this.spawn_gravity = spawn_gravity || 0;
        this.spawn_spread = spawn_spread || 360;
        this.spawn_rotationSpeed = spawn_rotationSpeed || 0;
        this.spawn_rotationVariance = spawn_rotationVariance || 0;
        this.spawn_size_randomness = spawn_size_randomness || 0;
        this.spawn_initialRotation_random = spawn_initialRotation_random || false;
        this.spawn_svg_path = spawn_svg_path || 'M -20 -20 L 20 -20 L 20 20 L -20 20 Z';
        this.spawn_matrixCharSet = spawn_matrixCharSet || 'katakana';
        this.spawn_matrixEnableGlow = spawn_matrixEnableGlow || false;
        this.spawn_matrixGlowSize = spawn_matrixGlowSize || 10;
        this.spawn_glowSize = spawn_glowSize || 10;
        this.spawn_enableTrail = spawn_enableTrail || false;
        this.spawn_trailLength = spawn_trailLength || 10;
        this.spawn_trailSpacing = spawn_trailSpacing || 1;

        // Polyline properties
        try {
            const initialNodes = polylineNodes || '[{"x":50,"y":50},{"x":150,"y":100}]';
            if (typeof initialNodes === 'string') {
                this.polylineNodes = JSON.parse(initialNodes);
            } else {
                this.polylineNodes = initialNodes;
            }
        } catch (e) {
            console.error("Error parsing initial polyline nodes, falling back to default.", e);
            this.polylineNodes = [{ x: 50, y: 50 }, { x: 150, y: 100 }];
        }
        this.polylineCurveStyle = polylineCurveStyle || 'straight';

        // Particle system state
        this.particles = [];
        this.spawnCounter = 0;
        this.nextParticleId = 0;
        this.customParticlePath = null;
        this.matrixActiveCharSet = '';
        this.availableParticleShapes = ['rectangle', 'circle', 'polygon', 'star', 'sparkle', 'custom', 'matrix'];

        this.pathAnim_enable = pathAnim_enable || false;
        this.pathAnim_shape = pathAnim_shape || 'circle';
        this.pathAnim_size = pathAnim_size || 40; // This is the scaled value (UI value * 4)
        this.pathAnim_speed = pathAnim_speed || 200; // This is the scaled value (UI value * 4)
        this.pathAnim_gradType = pathAnim_gradType || 'solid';
        this.pathAnim_useSharpGradient = pathAnim_useSharpGradient || false;
        this.pathAnim_gradColor1 = pathAnim_gradColor1 || '#FFFFFF';
        this.pathAnim_gradColor2 = pathAnim_gradColor2 || '#00BFFF';
        this.pathAnim_cycleColors = pathAnim_cycleColors || false;
        this.pathAnim_cycleSpeed = pathAnim_cycleSpeed || 0;
        this.pathAnim_animationMode = pathAnim_animationMode || 'loop';
        this.pathAnim_animationSpeed = pathAnim_animationSpeed || 0;
        this.pathAnim_scrollDir = pathAnim_scrollDir || 'right';
        this.pathAnim_trail = pathAnim_trail || 'None';
        this.pathAnim_trailLength = pathAnim_trailLength || 80; // Scaled value

        // State variables for the sub-object's fill animation
        this.pathAnim_hue1 = 0;
        this.pathAnim_scrollOffset = 0;
        this.pathAnim_extraRotation = 0;

        // State variables for the animation
        this._cachedPathSegments = null; // To store path calculations for performance
        this.pathAnim_distance = 0;      // Current distance along the path

        this.pathAnim_behavior = pathAnim_behavior || 'Loop';
        this.pathAnim_objectCount = pathAnim_objectCount || 1;
        this.pathAnim_objectSpacing = pathAnim_objectSpacing || 100; // Scaled value
        this.pathAnim_trailColor = pathAnim_trailColor || 'Inherit';

        // State variables
        this.pathAnim_direction = 1; // For Ping-Pong
        this.pathAnim_speedBurst = 0; // For audio reactivity
    }

    _getPointOnCatmullRomSpline(p0, p1, p2, p3, t) {
        const t2 = t * t;
        const t3 = t2 * t;

        const x = 0.5 * ((2 * p1.x) +
            (-p0.x + p2.x) * t +
            (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
            (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3);

        const y = 0.5 * ((2 * p1.y) +
            (-p0.y + p2.y) * t +
            (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
            (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3);

        return { x: x, y: y };
    }

    _getPointOnQuadraticBezier(p0, p1, p2, t) {
        const oneMinusT = 1 - t;
        const x = oneMinusT * oneMinusT * p0.x + 2 * oneMinusT * t * p1.x + t * t * p2.x;
        const y = oneMinusT * oneMinusT * p0.y + 2 * oneMinusT * t * p1.y + t * t * p2.y;
        return { x: x, y: y };
    }

    _getQuadraticCurveLength(p0, p1, p2, segments = 20) {
        let length = 0;
        let lastPoint = p0;
        for (let i = 1; i <= segments; i++) {
            const t = i / segments;
            const currentPoint = this._getPointOnQuadraticBezier(p0, p1, p2, t);
            const dx = currentPoint.x - lastPoint.x;
            const dy = currentPoint.y - lastPoint.y;
            length += Math.sqrt(dx * dx + dy * dy);
            lastPoint = currentPoint;
        }
        return length;
    }

    _drawSubObject(shape, size) {
        this.ctx.beginPath();
        switch (shape) {
            case 'rectangle':
                this.ctx.rect(-size / 2, -size / 2, size, size);
                break;
            case 'star':
                const points = 5; const innerRadius = 0.5;
                for (let i = 0; i < 2 * points; i++) {
                    const r = (i % 2 === 0) ? size / 2 : size / 2 * innerRadius;
                    const a = (i / (2 * points)) * 2 * Math.PI - (Math.PI / 2);
                    this.ctx[i === 0 ? 'moveTo' : 'lineTo'](r * Math.cos(a), r * Math.sin(a));
                }
                this.ctx.closePath();
                break;
            case 'polygon':
                const sides = 6;
                for (let i = 0; i < sides; i++) {
                    const a = (i / sides) * 2 * Math.PI - (Math.PI / 2);
                    this.ctx[i === 0 ? 'moveTo' : 'lineTo'](size / 2 * Math.cos(a), size / 2 * Math.sin(a));
                }
                this.ctx.closePath();
                break;
            case 'circle':
            default:
                this.ctx.arc(0, 0, size / 2, 0, 2 * Math.PI);
                break;
        }
        this.ctx.fill('evenodd');
    }

    _drawParticleShape(particle) {
        const s = particle.size / 2;

        const isMatrix = particle.actualShape === 'matrix';
        const glowEnabled = this.spawn_matrixEnableGlow;
        const glowSize = this.spawn_matrixGlowSize

        if (glowEnabled && glowSize > 0) {
            this.ctx.shadowBlur = glowSize;
            if (typeof this.ctx.fillStyle === 'string') {
                this.ctx.shadowColor = this.ctx.fillStyle;
            } else {
                // Fallback for gradients: use the primary solid color for the glow.
                // This respects the global palette override as well.
                this.ctx.shadowColor = this.gradient.color1;
            }
        } else {
            this.ctx.shadowBlur = 0;
        }

        switch (particle.actualShape) {
            case 'custom':
                if (this.customParticlePath) {
                    this.ctx.save();
                    const scale = particle.size / 40;
                    this.ctx.scale(scale, scale);
                    this.ctx.translate(-20, -20);
                    this.ctx.fill(this.customParticlePath);
                    if (this.enableStroke) this.ctx.stroke(this.customParticlePath);
                    this.ctx.restore();
                }
                break;

            case 'matrix':
                if (particle.matrixChars && particle.matrixChars.length > 0) {
                    this.ctx.font = `bold ${particle.size}px monospace`;
                    this.ctx.textAlign = 'center';
                    this.ctx.textBaseline = 'middle';
                    // This helper now ONLY draws the first character of the array it's given.
                    this.ctx.fillText(particle.matrixChars[0] || '?', 0, 0);
                }
                break;

            default:
                this.ctx.beginPath();
                if (particle.actualShape === 'circle') {
                    this.ctx.arc(0, 0, s, 0, 2 * Math.PI);
                } else if (particle.actualShape === 'sparkle') {
                    this.ctx.moveTo(0, -s);
                    this.ctx.lineTo(s * 0.3, -s * 0.3);
                    this.ctx.lineTo(s, 0);
                    this.ctx.lineTo(s * 0.3, s * 0.3);
                    this.ctx.lineTo(0, s);
                    this.ctx.lineTo(-s * 0.3, s * 0.3);
                    this.ctx.lineTo(-s, 0);
                    this.ctx.lineTo(-s * 0.3, -s * 0.3);
                    this.ctx.closePath();
                } else if (particle.actualShape === 'polygon') {
                    const sides = Math.max(3, this.sides);
                    for (let i = 0; i < sides; i++) {
                        const a = (i / sides) * 2 * Math.PI - (Math.PI / 2);
                        this.ctx[i === 0 ? 'moveTo' : 'lineTo'](s * Math.cos(a), s * Math.sin(a));
                    }
                    this.ctx.closePath();
                } else if (particle.actualShape === 'star') {
                    const points = Math.max(3, this.points);
                    const iS = s * (this.starInnerRadius / 100);
                    for (let i = 0; i < 2 * points; i++) {
                        const r = (i % 2 === 0) ? s : iS;
                        const a = (i / (2 * points)) * 2 * Math.PI - (Math.PI / 2);
                        this.ctx[i === 0 ? 'moveTo' : 'lineTo'](r * Math.cos(a), r * Math.sin(a));
                    }
                    this.ctx.closePath();
                } else { // rectangle
                    this.ctx.rect(-s, -s, particle.size, particle.size);
                }
                this.ctx.fill();
                if (this.enableStroke) this.ctx.stroke();
                break;
        }
    }

    _applySensorReactivity(sensorData) {
        if (!this.enableSensorReactivity || this.sensorTarget === 'none') {
            this.sensorMeterFill = 0;
            this.sensorHistory = [];
            return;
        }

        const sensor = sensorData[this.userSensor];

        if (!sensor || typeof sensor.value !== 'number') {
            this.sensorMeterFill = 0;
            return;
        }

        const rawValue = sensor.value;
        this.sensorRawValue = rawValue;
        const min = sensor.min;
        const max = sensor.max;

        let normalizedValue = (rawValue - min) / (max - min);
        normalizedValue = Math.min(1.0, Math.max(0, normalizedValue));

        if (this.sensorTarget === 'Sensor Meter') {
            this.sensorMeterFill = normalizedValue;
        } else if (this.sensorTarget === 'Time Plot') {
            this.sensorHistory.push(normalizedValue);

            // MODIFIED: History length is now based on time scale, assuming ~60fps
            const framesToKeep = (this.timePlotTimeScale || 5) * 60;
            if (this.sensorHistory.length > framesToKeep) {
                this.sensorHistory.shift();
            }
        }
    }

    _drawTimePlot() {
        if (this.sensorHistory.length < 2) return;

        const timeScale = this.timePlotTimeScale || 5;

        // --- 1. Draw the plot line and fill area FIRST ---
        this.ctx.beginPath();
        if (this.timePlotFillArea) {
            this.ctx.moveTo(-this.width / 2, this.height / 2);
        }

        const framesToShow = timeScale * 60;
        const startIndex = Math.max(0, this.sensorHistory.length - framesToShow);
        const dataToPlot = this.sensorHistory.slice(startIndex);

        const xStep = this.width / (framesToShow - 1);
        const halfHeight = this.height / 2;

        dataToPlot.forEach((value, i) => {
            const x = -this.width / 2 + i * xStep;
            const y = halfHeight - (value * this.height);
            if (i === 0 && !this.timePlotFillArea) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        });

        if (this.timePlotFillArea) {
            this.ctx.lineTo(this.width / 2, this.height / 2);
            this.ctx.closePath();
            this.ctx.fillStyle = this._createLocalFillStyle();
            this.ctx.fill();
        }
        this.ctx.strokeStyle = this._createLocalFillStyle();
        this.ctx.lineWidth = this.timePlotLineThickness;
        this.ctx.lineJoin = 'round';
        this.ctx.stroke();

        // --- 2. Draw the Axes and Ticks on top ---
        const showLines = this.timePlotAxesStyle === 'Lines Only' || this.timePlotAxesStyle === 'Lines and Values';
        const showValues = this.timePlotAxesStyle === 'Lines and Values';

        if (showLines) {
            this.ctx.save();
            this.ctx.strokeStyle = this.gradient.color2 || '#FFFFFF';
            this.ctx.globalAlpha = 0.6;
            this.ctx.lineWidth = 8;

            // Draw main Y-Axis and X-Axis Lines
            this.ctx.beginPath();
            this.ctx.moveTo(-this.width / 2, -this.height / 2);
            this.ctx.lineTo(-this.width / 2, this.height / 2);
            this.ctx.moveTo(-this.width / 2, this.height / 2);
            this.ctx.lineTo(this.width / 2, this.height / 2);
            this.ctx.stroke();

            // Y-Axis Ticks and Values
            if (showValues) {
                this.ctx.fillStyle = this.gradient.color2 || '#FFFFFF';
                this.ctx.globalAlpha = 1;
                this.ctx.font = 'bold 24px Arial';
                this.ctx.textAlign = 'left';
                this.ctx.textBaseline = 'middle';

                const yTickCount = 4;
                for (let i = 0; i <= yTickCount; i++) {
                    const value = i * (100 / yTickCount);
                    const yPos = (this.height / 2) - (value / 100) * this.height;

                    this.ctx.globalAlpha = 1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(-this.width / 2, yPos);
                    this.ctx.lineTo(-this.width / 2 + 15, yPos);
                    this.ctx.stroke();

                    let textYPos = yPos;
                    if (i === 0) { textYPos -= 15; }
                    if (i === yTickCount) { textYPos += 15; }

                    this.ctx.globalAlpha = 1;
                    this.ctx.fillText(value.toFixed(0), -this.width / 2 + 20, textYPos);
                }
            }

            // Moving X-Axis Ticks (without text labels)
            this.ctx.globalAlpha = 1;
            const pixelsPerSecond = this.width / timeScale;
            const frameOffset = this.sensorHistory.length % 60;
            const pixelOffset = (frameOffset / 60) * pixelsPerSecond;

            for (let i = 0; i <= timeScale; i++) {
                const xPos = (this.width / 2) - (i * pixelsPerSecond) - pixelOffset;
                if (xPos < -this.width / 2) break;

                this.ctx.beginPath();
                this.ctx.moveTo(xPos, this.height / 2);
                this.ctx.lineTo(xPos, this.height / 2 - 15);
                this.ctx.stroke();
            }
            this.ctx.restore();
        }
    }

    _applyAudioReactivity(audioData) {
        // Reset all reactive properties
        this.internalScale = 1.0; this.colorOverride = null; this.flashOpacity = 0;
        this.pathAnim_internalScale = 1.0; this.pathAnim_colorOverride = null; this.pathAnim_flashOpacity = 0;
        this.pathAnim_extraRotation = 0;

        // Decay flash
        if (this.flashDecay > 0) { this.flashDecay -= 0.1; }
        this.flashDecay = Math.max(0, this.flashDecay);

        if (!this.enableAudioReactivity || !audioData || !audioData[this.audioMetric] || this.audioTarget === 'none') return;

        // Beat detection logic
        const rawAudioValue = audioData[this.audioMetric].avg || 0;
        this.audioHistory.push(rawAudioValue);
        if (this.audioHistory.length > 30) this.audioHistory.shift();
        const n = this.audioHistory.length;
        const mean = this.audioHistory.reduce((a, b) => a + b, 0) / n;
        const stdDev = Math.sqrt(this.audioHistory.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / n);
        const thresholdMultiplier = 0.5 + ((this.beatThreshold || 30) / 100.0) * 2.0;
        const threshold = mean + thresholdMultiplier * stdDev;
        let reactiveValue = 0;
        if (rawAudioValue > threshold) {
            const sensitivity = (this.audioSensitivity / 100.0) * 1.5;
            this.flashDecay = Math.min(1.5, sensitivity);
        }
        reactiveValue = this.flashDecay;

        const isPathAnim = this.pathAnim_enable;

        switch (this.audioTarget) {
            case 'Flash':
                if (reactiveValue > 0) {
                    // Affects main stroke AND path anim object
                    this.colorOverride = '#FFFFFF';
                    this.flashOpacity = Math.min(1.0, reactiveValue);
                    if (isPathAnim) {
                        this.pathAnim_colorOverride = '#FFFFFF';
                        this.pathAnim_flashOpacity = Math.min(1.0, reactiveValue);
                    }
                }
                break;
            case 'Size':
                if (isPathAnim) {
                    this.pathAnim_internalScale = 1.0 + reactiveValue;
                } else {
                    this.internalScale = 1.0 + reactiveValue;
                }
                break;
            case 'Rotation':
                if (isPathAnim) {
                    this.pathAnim_extraRotation = reactiveValue * 360 * (Math.random() < 0.5 ? -1 : 1);
                } else {
                    this.animationAngle = this.baseAnimationAngle + ((Math.random() < 0.5 ? -1 : 1) * reactiveValue * 30);
                }
                break;
            case 'Path Speed':
                if (isPathAnim && reactiveValue > 0) {
                    this.pathAnim_speedBurst = reactiveValue;
                }
                break;
        }
    }

    _drawFill(phase = 0) {
        if (this.gradType === 'none') return;

        // --- START: SENSOR METER LOGIC ---
        if (this.enableSensorReactivity && this.sensorTarget === 'Sensor Meter' && this.sensorMeterFill >= 0) {
            this.ctx.save();
            this.ctx.clip();

            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            this.ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

            if (this.sensorMeterFill > 0) {
                const fillHeight = this.height * this.sensorMeterFill;
                const fillY = this.height / 2 - fillHeight;

                if (this.sensorColorMode === 'Thresholds') {
                    const mid = this.sensorMidThreshold;
                    const max = this.sensorMaxThreshold;
                    if (this.sensorRawValue >= max) {
                        this.ctx.fillStyle = "#ff0000";
                    } else if (this.sensorRawValue >= mid) {
                        this.ctx.fillStyle = "#ffa500";
                    } else {
                        this.ctx.fillStyle = '#00ff00';
                    }
                } else if (this.sensorColorMode === 'Value-Based Gradient') {
                    let color;
                    if (this.sensorMeterFill < 0.5) {
                        color = lerpColor("#00ff00", "#ffa500", this.sensorMeterFill * 2);
                    } else {
                        color = lerpColor("#ffa500", "#ff0000", (this.sensorMeterFill - 0.5) * 2);
                    }
                    this.ctx.fillStyle = color;
                } else {
                    this.ctx.fillStyle = this._createLocalFillStyle();
                }

                this.ctx.fillRect(-this.width / 2, fillY, this.width, fillHeight);
            }

            if (this.sensorMeterShowValue) {
                const fontSize = Math.max(10, Math.round(this.width / 3));
                this.ctx.font = `bold ${fontSize}px Arial`;
                this.ctx.fillStyle = this.sensorColorMode === 'Thresholds' ? '#FFFFFF' : (this.gradient.color2 || '#FFFFFF');
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(this.sensorRawValue.toFixed(1), 0, 0);
                this.ctx.font = `bold ${fontSize / 3}px Arial`;
                this.ctx.fillText(this.userSensor, 0, -fontSize / 1.5);
            }

            this.ctx.restore();
            return; // Exit the function after drawing the meter
        }
        // --- END: SENSOR METER LOGIC ---

        // --- START: ORIGINAL CORRECT FILL LOGIC ---
        const fillStyle = this._createLocalFillStyle(phase);
        this.ctx.fillStyle = fillStyle;
        if (fillStyle instanceof CanvasPattern && (fillStyle.offsetX || fillStyle.offsetY)) {
            this.ctx.save();
            this.ctx.translate(fillStyle.offsetX || 0, fillStyle.offsetY || 0);
            this.ctx.fill();
            this.ctx.restore();
        } else {
            this.ctx.fill();
        }
        // --- END: ORIGINAL CORRECT FILL LOGIC ---
    }

    getDisplayText() {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const year = now.getFullYear();
        const dateString = `${month}/${day}/${year}`;
        if (this.showDate && this.showTime) {
            return `${dateString} ${timeString}`;
        } else if (this.showTime) {
            return timeString;
        } else if (this.showDate) {
            return dateString;
        }
        return this.text || '';
    }

    getWrappedText() {
        const text = this.getDisplayText();
        return text;
    }

    _getRandomColorForElement(elementIndex) {
        if (this.cycleColors) {
            const hue = (this.hue1 + elementIndex * this.phaseOffset) % 360;
            return `hsl(${hue}, 100%, 50%)`;
        }

        // Ensure stops exist and are not empty
        if (this.gradType !== 'random' || !this.gradient.stops || this.gradient.stops.length === 0) {
            return this.gradient.stops?.[0]?.color || '#000000';
        }

        if (!this.randomElementState) {
            this.randomElementState = {};
        }

        if (!this.randomElementState[elementIndex]) {
            const randomIndex = Math.floor(Math.random() * this.gradient.stops.length);
            this.randomElementState[elementIndex] = {
                color: this.gradient.stops[randomIndex].color,
                timer: Math.random() * 5 + 5
            };
        }

        const state = this.randomElementState[elementIndex];

        if (this.lastDeltaTime > 0) {
            const flickerSpeed = (this.animationSpeed || 0) * this.lastDeltaTime * 60;
            state.timer -= flickerSpeed;
        }

        if (state.timer <= 0) {
            const randomIndex = Math.floor(Math.random() * this.gradient.stops.length);
            state.color = this.gradient.stops[randomIndex].color;
            state.timer = Math.random() * 5 + 5;
        }

        return state.color;
    }

    _updateTextMetrics() {
        if (this.shape !== 'text' || !this.ctx) return;
        const fontData = this.pixelFont === 'large' ? FONT_DATA_5PX : FONT_DATA_4PX;
        const { charWidth, charHeight, charSpacing, lineSpacing } = fontData;
        const textToMeasure = this.getWrappedText() || ' ';
        const lines = textToMeasure.split('\n');
        const pixelSize = this.fontSize / 10;
        const textBlockHeight = lines.length * (charHeight + lineSpacing) * pixelSize - (lineSpacing * pixelSize);
        this.height = textBlockHeight + (2 * pixelSize);
    }

    _updateFontSizeFromHeight() {
        if (this.shape !== 'text') return;

        const fontData = this.pixelFont === 'large' ? FONT_DATA_5PX : FONT_DATA_4PX;
        const { charHeight, lineSpacing } = fontData;
        const textToMeasure = this.getWrappedText() || ' ';
        const lines = textToMeasure.split('\n');

        const denominator = (lines.length * (charHeight + lineSpacing) - lineSpacing + 2);
        if (denominator <= 0) return;

        const newPixelSize = this.height / denominator;
        this.fontSize = Math.max(20, Math.round(newPixelSize * 10));
    }

    _shuffleCellOrder() {
        const totalCells = this.numberOfRows * this.numberOfColumns;
        this.cellOrder = Array.from({ length: totalCells }, (_, i) => i);
        for (let i = this.cellOrder.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.cellOrder[i], this.cellOrder[j]] = [this.cellOrder[j], this.cellOrder[i]];
        }
    }

    getCenter() {
        return { x: this.x + this.width / 2, y: this.y + this.height / 2 };
    }

    getRenderAngle() {
        return (this.rotation * Math.PI / 180);
    }

    getWorldCoordsOfCorner(handleName) {
        const center = this.getCenter();
        const halfW = this.width / 2;
        const halfH = this.height / 2;

        let localCorner = { x: 0, y: 0 };
        if (handleName.includes('left')) localCorner.x = -halfW;
        if (handleName.includes('right')) localCorner.x = halfW;
        if (handleName.includes('top')) localCorner.y = -halfH;
        if (handleName.includes('bottom')) localCorner.y = halfH;

        const angle = this.getRenderAngle();
        const s = Math.sin(angle);
        const c = Math.cos(angle);
        const rotatedX = localCorner.x * c - localCorner.y * s;
        const rotatedY = localCorner.x * s + localCorner.y * c;

        return { x: center.x + rotatedX, y: center.y + rotatedY };
    }

    getHandleAtPoint(px, py) {
        if (this.locked) return null;

        const center = this.getCenter();
        const staticAngle = this.rotation * Math.PI / 180;
        const halfW = this.width / 2;
        const halfH = this.height / 2;

        // Transform the world mouse coordinates into the shape's local, unrotated space
        const localPoint = {
            x: (px - center.x) * Math.cos(-staticAngle) - (py - center.y) * Math.sin(-staticAngle),
            y: (px - center.x) * Math.sin(-staticAngle) + (py - center.y) * Math.cos(-staticAngle)
        };

        if (this.shape === 'polyline') {
            let nodes;
            try {
                nodes = (typeof this.polylineNodes === 'string') ? JSON.parse(this.polylineNodes) : this.polylineNodes;
            } catch (e) { return null; }

            if (Array.isArray(nodes)) {
                const offsetX = this.width / 2;
                const offsetY = this.height / 2;
                const handleRadius = 8; // Larger hit area

                for (let i = 0; i < nodes.length; i++) {
                    const node = nodes[i];
                    const nodeX = node.x - offsetX;
                    const nodeY = node.y - offsetY;
                    const dist = Math.sqrt(Math.pow(localPoint.x - nodeX, 2) + Math.pow(localPoint.y - nodeY, 2));
                    if (dist <= handleRadius) {
                        return { name: `node-${i}`, cursor: 'move', type: 'node', index: i };
                    }
                }
            }
        }

        const h2 = this.handleSize / 2;

        // Check for rotation handle first
        const rotHandlePos = this.getRotationHandlePosition();
        const dist = Math.sqrt(Math.pow(localPoint.x - rotHandlePos.x, 2) + Math.pow(localPoint.y - rotHandlePos.y, 2));

        if (dist <= this.rotationHandleRadius + h2) {
            return { name: 'rotate', cursor: 'crosshair', type: 'rotation' };
        }

        // Check for resize handles
        const handlePositions = {
            'top-left': { x: -halfW, y: -halfH }, 'top': { x: 0, y: -halfH }, 'top-right': { x: halfW, y: -halfH },
            'left': { x: -halfW, y: 0 }, 'right': { x: halfW, y: 0 },
            'bottom-left': { x: -halfW, y: halfH }, 'bottom': { x: 0, y: halfH }, 'bottom-right': { x: halfW, y: halfH }
        };

        for (const handle of this.handles) {
            const pos = handlePositions[handle.name];
            if (localPoint.x >= pos.x - h2 && localPoint.x <= pos.x + h2 && localPoint.y >= pos.y - h2 && localPoint.y <= pos.y + h2) {
                return handle;
            }
        }

        return null;
    }

    getRotationHandlePosition() {
        const halfH = this.height / 2;
        const threshold = 50; // How close to the top edge (in pixels) to trigger the flip

        // Check if the shape's top is near the canvas's top edge
        if (this.y < threshold) {
            // Place handle at the bottom
            return { x: 0, y: halfH - this.rotationHandleOffset };
        } else {
            // Place handle at the top (default)
            return { x: 0, y: -halfH + this.rotationHandleOffset };
        }
    }

    isPointInside(px, py) {
        const center = this.getCenter();
        const angle = -this.getRenderAngle();
        const s = Math.sin(angle);
        const c = Math.cos(angle);

        const dx = px - center.x;
        const dy = py - center.y;

        const localX = dx * c - dy * s;
        const localY = dx * s + dy * c;

        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;

        return (localX >= -halfWidth && localX <= halfWidth &&
            localY >= -halfHeight && localY <= halfHeight);
    }

    addNodeAtPoint(worldX, worldY) {
        if (this.shape !== 'polyline' || this.locked) return false;

        let nodes;
        try {
            nodes = (typeof this.polylineNodes === 'string') ? JSON.parse(this.polylineNodes) : [...this.polylineNodes];
        } catch (e) {
            console.error("Failed to parse polylineNodes for adding a node:", e);
            return false;
        }

        if (nodes.length < 2) return false;

        // --- 1. Transform world click coordinates to local, unrotated space relative to the shape's center ---
        const center = this.getCenter();
        const angle = -this.getRenderAngle();
        const s = Math.sin(angle);
        const c = Math.cos(angle);
        const dx = worldX - center.x;
        const dy = worldY - center.y;
        const localClickX = dx * c - dy * s;
        const localClickY = dx * s + dy * c;

        // --- 2. Adjust local click to be relative to the top-left corner of the bounding box (like the nodes) ---
        const clickPoint = {
            x: localClickX + this.width / 2,
            y: localClickY + this.height / 2
        };

        let bestSegmentIndex = -1;
        let minDistanceSq = Infinity;
        let closestPointOnSegment = null;

        // --- 3. Find the closest line segment to the click point ---
        for (let i = 0; i < nodes.length - 1; i++) {
            const p1 = nodes[i];
            const p2 = nodes[i + 1];

            const l2 = Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2);
            if (l2 === 0) { // If the segment has zero length, just check distance to the point
                const distSq = Math.pow(clickPoint.x - p1.x, 2) + Math.pow(clickPoint.y - p1.y, 2);
                if (distSq < minDistanceSq) {
                    minDistanceSq = distSq;
                    bestSegmentIndex = i;
                    closestPointOnSegment = { ...p1 };
                }
                continue;
            }

            // 't' is the projection of the point onto the line segment.
            // t < 0 means the closest point is p1.
            // t > 1 means the closest point is p2.
            // Otherwise, it's a point on the segment.
            let t = ((clickPoint.x - p1.x) * (p2.x - p1.x) + (clickPoint.y - p1.y) * (p2.y - p1.y)) / l2;
            t = Math.max(0, Math.min(1, t));

            const closest = {
                x: p1.x + t * (p2.x - p1.x),
                y: p1.y + t * (p2.y - p1.y)
            };

            const distSq = Math.pow(clickPoint.x - closest.x, 2) + Math.pow(clickPoint.y - closest.y, 2);

            if (distSq < minDistanceSq) {
                minDistanceSq = distSq;
                bestSegmentIndex = i;
                closestPointOnSegment = closest;
            }
        }

        // --- 4. Insert the new node if a suitable segment was found ---
        // Add a threshold to avoid adding nodes when clicking far away from the line
        const threshold = (this.strokeWidth || 1) * 4; // A generous threshold
        if (bestSegmentIndex !== -1 && Math.sqrt(minDistanceSq) < threshold) {
            const newNode = {
                x: Math.round(closestPointOnSegment.x),
                y: Math.round(closestPointOnSegment.y)
            };

            nodes.splice(bestSegmentIndex + 1, 0, newNode);

            // Trigger an update to recalculate bounding box and redraw
            this.update({ polylineNodes: nodes });
            return true;
        }

        return false;
    }

    deleteNode(indexToDelete) {
        if (this.shape !== 'polyline' || this.locked) return false;

        let nodes;
        try {
            nodes = (typeof this.polylineNodes === 'string') ? JSON.parse(this.polylineNodes) : [...this.polylineNodes];
        } catch (e) {
            console.error("Failed to parse polylineNodes for deleting a node:", e);
            return false;
        }

        // Prevent deleting nodes if it would result in less than 2 nodes
        if (nodes.length <= 2) {
            console.warn("Cannot delete node, polyline must have at least 2 nodes.");
            return false;
        }

        if (indexToDelete >= 0 && indexToDelete < nodes.length) {
            nodes.splice(indexToDelete, 1);

            // Trigger an update to recalculate bounding box and redraw
            this.update({ polylineNodes: nodes });
            return true;
        }

        return false;
    }

    update(props) {
        const oldStrimerColumns = this.strimerColumns;
        const oldStrimerBlockCount = this.strimerBlockCount;
        const oldStrimerDirection = this.strimerDirection;
        const oldStrimerAnimation = this.strimerAnimation;

        if (props.spawn_svg_path !== undefined && props.spawn_svg_path !== this.spawn_svg_path) {
            this.customParticlePath = null;
        }
        const textChanged = props.text !== undefined && props.text !== this.text;
        const animationChanged = props.textAnimation !== undefined && props.textAnimation !== this.textAnimation;
        if ((textChanged && this.textAnimation === 'typewriter') || (animationChanged && props.textAnimation === 'typewriter')) {
            this.visibleCharCount = 0;
            this.typewriterWaitTimer = 0;
        }
        const animationTypeChanged = props.tetrisAnimation !== undefined && props.tetrisAnimation !== this.tetrisAnimation;
        const gradTypeChangedToTetris = (props.gradType !== undefined && props.gradType.startsWith('tetris')) && !this.gradType.startsWith('tetris');
        const blockCountChanged = props.tetrisBlockCount !== undefined && props.tetrisBlockCount !== this.tetrisBlockCount;
        if (animationTypeChanged || gradTypeChangedToTetris || blockCountChanged) {
            this.tetrisBlocks = [];
            this.tetrisSpawnTimer = 0;
            this.tetrisActiveBlockIndex = 0;
            this.tetrisFadeState = 'in';
            this.tetrisHoldTimer = 0;
        }
        if ((textChanged && (this.textAnimation === 'marquee' || this.textAnimation === 'wave')) || (animationChanged && (this.textAnimation === 'marquee' || this.textAnimation === 'wave'))) {
            this.scrollOffsetX = 0;
            this.waveAngle = 0;
        }
        if (props.vizBarCount !== undefined && props.vizBarCount !== this.vizBarCount) {
            this.vizBarHeights = new Array(parseInt(props.vizBarCount, 10)).fill(0);
        }

        for (const key in props) {
            if (props[key] === undefined) continue;

            if (key === 'polylineNodes') {
                this._cachedPathSegments = null;
                try {
                    const propValue = props.polylineNodes;
                    this.polylineNodes = (typeof propValue === 'string') ? JSON.parse(propValue) : propValue;
                } catch (e) {
                    console.error("Error parsing polyline nodes in update:", e);
                }
            } else if (key === 'pixelArtFrames') {
                try {
                    // Temporarily store the old and new data as strings for easy comparison
                    const oldFramesJSON = JSON.stringify(this.pixelArtFrames);
                    const newFramesData = props.pixelArtFrames;
                    const newFrames = (typeof newFramesData === 'string') ? JSON.parse(newFramesData) : newFramesData;
                    const newFramesJSON = JSON.stringify(newFrames);

                    // Only update and reset the animation if the frame data has actually changed
                    if (oldFramesJSON !== newFramesJSON) {
                        this.pixelArtFrames = newFrames;
                        // Reset the frame index and timer since we have new data
                        if (this.currentFrameIndex >= this.pixelArtFrames.length) {
                            this.currentFrameIndex = 0;
                        }
                        const currentFrame = this.pixelArtFrames[this.currentFrameIndex];
                        this.frameTimer = (currentFrame && currentFrame.duration) || 1;
                    }
                } catch (e) {
                    console.error("Error parsing pixelArtFrames in update:", e);
                }
            } else if (key === 'gradient' && typeof props[key] === 'object' && props[key] !== null) {
                Object.assign(this.gradient, props[key]);
            } else if (key === 'strokeGradient' && typeof props[key] === 'object' && props[key] !== null) {
                Object.assign(this.strokeGradient, props[key]);
            } else {
                this[key] = props[key];
            }
        }

        // --- ADDED THIS BLOCK TO FIX STRIMER ---
        if (this.shape === 'strimer' && (
            this.strimerColumns !== oldStrimerColumns ||
            this.strimerBlockCount !== oldStrimerBlockCount ||
            this.strimerDirection !== oldStrimerDirection ||
            this.strimerAnimation !== oldStrimerAnimation
        )) {
            this.strimerBlocks = [];
            this.strimerMeterHeights = [];
        }
        // --- END OF FIX ---

        this._linearPatternCache = null;
        this.dirty = true;
        this.baseWidth = this.width;
        this.baseHeight = this.height;
        this.baseRotation = this.rotation;
        this.baseGradient = { ...this.gradient };
    }

    _calculatePathSegments() {
        if (this._cachedPathSegments) return this._cachedPathSegments;

        let nodes;
        try {
            nodes = (typeof this.polylineNodes === 'string') ? JSON.parse(this.polylineNodes) : this.polylineNodes;
        } catch (e) { return { segments: [], totalLength: 0 }; }

        if (!Array.isArray(nodes) || nodes.length < 2) {
            return { segments: [], totalLength: 0 };
        }

        const offsetX = -this.width / 2;
        const offsetY = -this.height / 2;
        const segments = [];
        let totalLength = 0;
        const curveDetail = 30; // Number of small lines to approximate a curve segment

        if (this.polylineCurveStyle === 'loose-curve' && nodes.length > 2) {
            // ... [Original Quadratic Bézier logic remains unchanged] ...
            let currentPoint = { x: nodes[0].x + offsetX, y: nodes[0].y + offsetY };
            for (let i = 1; i < nodes.length - 1; i++) {
                const controlPoint = { x: nodes[i].x + offsetX, y: nodes[i].y + offsetY };
                const endPoint = { x: (nodes[i].x + nodes[i + 1].x) / 2 + offsetX, y: (nodes[i].y + nodes[i + 1].y) / 2 + offsetY };
                const segmentLength = this._getQuadraticCurveLength(currentPoint, controlPoint, endPoint, curveDetail);
                // ... [lookup table creation remains unchanged] ...
                segments.push({ type: 'curve', p0: currentPoint, p1: controlPoint, p2: endPoint, length: segmentLength, startLength: totalLength, lookupTable: [] }); // Simplified for brevity
                totalLength += segmentLength;
                currentPoint = endPoint;
            }
            const finalNode = { x: nodes[nodes.length - 1].x + offsetX, y: nodes[nodes.length - 1].y + offsetY };
            const finalSegmentLength = Math.sqrt(Math.pow(finalNode.x - currentPoint.x, 2) + Math.pow(finalNode.y - currentPoint.y, 2));
            segments.push({ type: 'line', p0: currentPoint, p1: finalNode, length: finalSegmentLength, startLength: totalLength });
            totalLength += finalSegmentLength;

        } else if (this.polylineCurveStyle === 'tight-curve') {
            for (let i = 0; i < nodes.length - 1; i++) {
                const p0 = nodes[i === 0 ? i : i - 1];
                const p1 = nodes[i];
                const p2 = nodes[i + 1];
                const p3 = nodes[i === nodes.length - 2 ? i + 1 : i + 2];

                const points = [p0, p1, p2, p3].map(p => ({ x: p.x + offsetX, y: p.y + offsetY }));

                let segmentLength = 0;
                let lastPoint = points[1];
                for (let j = 1; j <= curveDetail; j++) {
                    const t = j / curveDetail;
                    const currentPoint = this._getPointOnCatmullRomSpline(points[0], points[1], points[2], points[3], t);
                    segmentLength += Math.sqrt(Math.pow(currentPoint.x - lastPoint.x, 2) + Math.pow(currentPoint.y - lastPoint.y, 2));
                    lastPoint = currentPoint;
                }
                segments.push({ type: 'tight-curve', p0: points[0], p1: points[1], p2: points[2], p3: points[3], length: segmentLength, startLength: totalLength });
                totalLength += segmentLength;
            }
        } else { // Straight lines
            for (let i = 0; i < nodes.length - 1; i++) {
                const p0 = { x: nodes[i].x + offsetX, y: nodes[i].y + offsetY };
                const p1 = { x: nodes[i + 1].x + offsetX, y: nodes[i + 1].y + offsetY };
                const segmentLength = Math.sqrt(Math.pow(p1.x - p0.x, 2) + Math.pow(p1.y - p0.y, 2));
                segments.push({ type: 'line', p0: p0, p1: p1, length: segmentLength, startLength: totalLength });
                totalLength += segmentLength;
            }
        }

        this._cachedPathSegments = { segments, totalLength };
        return this._cachedPathSegments;
    }

    _getPointAndAngleAtDistance(distance) {
        const { segments, totalLength } = this._calculatePathSegments();
        if (totalLength === 0) return { x: 0, y: 0, angle: 0 };

        const d = distance;
        const firstSeg = segments[0];
        const lastSeg = segments[segments.length - 1];

        if (d < 0) {
            const dx = firstSeg.p1.x - firstSeg.p0.x;
            const dy = firstSeg.p1.y - firstSeg.p0.y;
            return { x: firstSeg.p0.x, y: firstSeg.p0.y, angle: Math.atan2(dy, dx) };
        }
        if (d > totalLength) {
            const endPoint = (lastSeg.type === 'line' || lastSeg.type === 'curve') ? lastSeg.p1 : lastSeg.p2;
            const prevPoint = lastSeg.p0;
            const dx = endPoint.x - prevPoint.x;
            const dy = endPoint.y - prevPoint.y;
            return { x: endPoint.x, y: endPoint.y, angle: Math.atan2(dy, dx) };
        }

        for (const seg of segments) {
            if (d >= seg.startLength && d <= seg.startLength + seg.length) {
                const localDist = d - seg.startLength;
                const t = seg.length > 0 ? localDist / seg.length : 0;
                let p, p_next;

                if (seg.type === 'line') {
                    p = { x: seg.p0.x + t * (seg.p1.x - seg.p0.x), y: seg.p0.y + t * (seg.p1.y - seg.p0.y) };
                    p_next = { x: seg.p0.x + (t + 0.01) * (seg.p1.x - seg.p0.x), y: seg.p0.y + (t + 0.01) * (seg.p1.y - seg.p0.y) };
                } else if (seg.type === 'tight-curve') {
                    p = this._getPointOnCatmullRomSpline(seg.p0, seg.p1, seg.p2, seg.p3, t);
                    p_next = this._getPointOnCatmullRomSpline(seg.p0, seg.p1, seg.p2, seg.p3, t + 0.01);
                } else { // curve (quadratic)
                    // ... [Original quadratic bézier logic remains unchanged] ...
                    p = this._getPointOnQuadraticBezier(seg.p0, seg.p1, seg.p2, t);
                    p_next = this._getPointOnQuadraticBezier(seg.p0, seg.p1, seg.p2, t + 0.01);
                }

                const dx = p_next.x - p.x;
                const dy = p_next.y - p.y;
                return { x: p.x, y: p.y, angle: Math.atan2(dy, dx) };
            }
        }
        return { x: firstSeg.p0.x, y: firstSeg.p0.y, angle: 0 }; // Fallback
    }

    _createLocalStrokeStyle(phase = 0) {
        if (this.colorOverride) {
            return this.colorOverride;
        }

        let stopsToRender = this.strokeGradient?.stops || [{ color: '#FFFFFF', position: 0 }];

        if (this.strokeCycleColors) {
            const cycleOffset = (this.strokeHue1 + phase * this.strokePhaseOffset);
            stopsToRender = stopsToRender.map(stop => {
                const originalHsl = hexToHsl(stop.color);
                const newHue = (originalHsl[0] + cycleOffset) % 360;
                return { ...stop, color: hslToHex(newHue, originalHsl[1], originalHsl[2]) };
            });
        }

        const phaseIndex = this._getPhaseIndex(phase);
        const p = (this.strokeScrollOffset + phaseIndex * this.strokePhaseOffset / 100.0);
        const progress = (p % 1.0 + 1.0) % 1.0;

        switch (this.strokeGradType) {
            case 'linear':
                return this._createLinearGradient(progress, {
                    stops: stopsToRender,
                    scrollDirection: this.strokeScrollDir,
                    animationMode: this.strokeAnimationMode,
                    useSharpGradient: this.strokeUseSharpGradient,
                    animationSpeed: this.strokeAnimationSpeed,
                    width: this.width,
                    height: this.height
                });
            case 'radial':
                return this._createRadialGradient(progress, {
                    stops: stopsToRender,
                    animationMode: this.strokeAnimationMode,
                    useSharpGradient: this.strokeUseSharpGradient,
                    animationSpeed: this.strokeAnimationSpeed,
                    width: this.width,
                    height: this.height
                });
            case 'rainbow':
            case 'rainbow-radial': {
                let animProgress = progress;
                if (this.strokeAnimationMode.includes('bounce')) {
                    const bounceFrequency = 2.0;
                    animProgress = (1 - Math.cos(progress * bounceFrequency * 2 * Math.PI)) / 2;
                }
                const hueOffset = (animProgress * 360) + (phaseIndex * (this.strokePhaseOffset / 100.0) * 360);

                const tempProps = { gradType: this.strokeGradType, scrollDirection: this.strokeScrollDir, useSharpGradient: this.strokeUseSharpGradient };
                Object.assign(this, tempProps);
                const grad = this._createRainbowGradient(hueOffset);
                Object.assign(this, { gradType: this.gradType, scrollDirection: this.scrollDirection, useSharpGradient: this.useSharpGradient });
                return grad;
            }
            case 'conic':
            case 'rainbow-conic': {
                return this._createConicGradient(progress, {
                    stops: stopsToRender,
                    animationMode: this.strokeAnimationMode,
                    useSharpGradient: this.strokeUseSharpGradient,
                    animationSpeed: this.strokeAnimationSpeed
                });
            }
            default:
                return this._getStaticColor(phase, { type: this.strokeGradType, stops: stopsToRender });
        }
    }

    _createFillStyleForSubObject(size) {
        let c1 = this.pathAnim_gradColor1;
        let c2 = this.pathAnim_gradColor2;

        if (this.pathAnim_cycleColors) {
            c1 = `hsl(${this.pathAnim_hue1 % 360}, 100%, 50%)`;
            c2 = `hsl(${(this.pathAnim_hue1 + 90) % 360}, 100%, 50%)`;
        }

        const p = (this.pathAnim_scrollOffset % 1.0 + 1.0) % 1.0;

        switch (this.pathAnim_gradType) {
            case 'linear':
                // The path animation still uses a two-color system. We create a temporary stops array for it.
                const linearStops = [{ color: c1, position: 0 }, { color: c2, position: 1 }];
                return this._createLinearGradient(p, { width: size, height: size, stops: linearStops, scrollDirection: this.pathAnim_scrollDir, animationMode: this.pathAnim_animationMode, useSharpGradient: this.pathAnim_useSharpGradient });
            case 'radial':
                const radialStops = [{ color: c1, position: 0 }, { color: c2, position: 1 }];
                return this._createRadialGradient(p, { width: size, height: size, stops: radialStops, animationMode: this.pathAnim_animationMode, useSharpGradient: this.pathAnim_useSharpGradient });
            case 'rainbow':
            case 'rainbow-radial': {
                let animProgress = p;
                if (this.pathAnim_animationMode.includes('bounce')) {
                    animProgress = (p < 0.5) ? (p * 2) : ((1 - p) * 2);
                }
                const hueOffset = animProgress * 360;
                let grad;
                if (this.pathAnim_gradType === 'rainbow-radial') {
                    grad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, size / 2);
                } else {
                    grad = this.ctx.createLinearGradient(-size / 2, 0, size / 2, 0);
                }
                for (let i = 0; i <= 60; i++) {
                    grad.addColorStop(i / 60, `hsl(${(i * 6 + hueOffset) % 360}, 100%, 50%)`);
                }
                return grad;
            }
            case 'solid':
            default:
                return c1;
        }
    }

    _getStaticColor(phase = 0, options = {}) {
        const {
            type = this.gradType,
            stops = this.gradient.stops
        } = options;

        if (!stops || stops.length === 0) return '#ff00ff'; // Fallback

        const c1 = stops[0].color;
        const c2 = stops[stops.length - 1].color;

        if (type === 'alternating') {
            return (phase % 2 === 0) ? c1 : c2;
        }

        // Default case is 'solid' or any other non-gradient type
        return c1;
    }

    _createLocalFillStyle(phase = 0) {
        if (this.colorOverride) {
            return this.colorOverride;
        }

        let stopsToRender = this.gradient.stops || [{ color: '#ff00ff', position: 0 }];

        if (this.cycleColors) {
            const cycleOffset = (this.hue1 + phase * this.phaseOffset);
            stopsToRender = this.gradient.stops.map(stop => {
                const originalHsl = hexToHsl(stop.color);
                const newHue = (originalHsl[0] + cycleOffset) % 360;
                return { ...stop, color: hslToHex(newHue, originalHsl[1], originalHsl[2]) };
            });
        }

        const phaseIndex = this._getPhaseIndex(phase);
        const p = this._getAnimationProgress(phaseIndex);

        switch (this.gradType) {
            case 'linear':
                return this._createLinearGradient(p, { stops: stopsToRender });
            case 'radial':
                return this._createRadialGradient(p, { stops: stopsToRender });
            case 'rainbow':
            case 'rainbow-radial': {
                let animProgress = p;
                if (this.animationMode.includes('bounce')) {
                    const bounceFrequency = 2.0;
                    animProgress = (1 - Math.cos(p * bounceFrequency * 2 * Math.PI)) / 2;
                }
                const hueOffset = (animProgress * 360) + (phaseIndex * (this.phaseOffset / 100.0) * 360);
                return this._createRainbowGradient(hueOffset);
            }
            case 'conic':
            case 'rainbow-conic': {
                // This logic is now inside the _createConicGradient helper
                return this._createConicGradient(p, { stops: stopsToRender });
            }
            default: // solid, alternating, random
                return this._getStaticColor(phase, { type: this.gradType, stops: stopsToRender });
        }
    }

    _getPhaseIndex(phase) {
        if (this.animationMode === 'bounce-random') {
            return (this.cellOrder && this.cellOrder.length > phase) ? this.cellOrder[phase] : phase;
        }
        if (this.animationMode === 'bounce-reversed' && this.isReversing) {
            let lastCellIndex = (this.numberOfRows * this.numberOfColumns) - 1;
            if (this.shape === 'tetris') {
                lastCellIndex = Math.max(0, this.tetrisBlockCount - 1);
            } else if (this.shape === 'pixel-art') {
                try {
                    const data = JSON.parse(this.pixelArtFrames);
                    lastCellIndex = Math.max(0, (data.length * data[0].length) - 1);
                } catch (e) { lastCellIndex = 0; }
            }
            return lastCellIndex - phase;
        }
        return phase;
    }

    /**
     * Calculates the animation progress value 'p' based on a phase index.
     * @param {number} phaseIndex - The effective phase index.
     * @returns {number} The animation progress value, always between 0.0 and 1.0.
     * @private
     */
    _getAnimationProgress(phaseIndex) {
        const effectiveScrollOffset = this.scrollOffset + phaseIndex * this.phaseOffset / 100.0;
        return (effectiveScrollOffset % 1.0 + 1.0) % 1.0;
    }

    _applyEasing(t) {
        switch (this.strimerEasing) {
            case 'Ease-In': return t * t;
            case 'Ease-Out': return t * (2 - t);
            case 'Ease-In-Out': return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
            default: return t; // Linear
        }
    }

    /**
     * Creates a radial gradient style, resulting in a smooth pulse.
     * @param {string} c1 - The first color.
     * @param {string} c2 - The second color.
     * @param {number} p - The animation progress (0.0 to 1.0).
     * @returns {CanvasGradient} The generated radial gradient.
     * @private
     */
    _createLinearGradient(p, options) {
        const { stops, scrollDirection, animationMode, useSharpGradient, animationSpeed, width, height } = options;
        const progress = (typeof p === 'number' && isFinite(p)) ? p : 0;
        const isAnimated = animationSpeed > 0;

        if (!stops || stops.length === 0) return '#ff00ff';
        if (stops.length === 1) return stops[0].color;

        const sortedStops = [...stops].sort((a, b) => a.position - b.position);

        if (!isAnimated) {
            const gradCoords = { up: [0, height / 2, 0, -height / 2], down: [0, -height / 2, 0, height / 2], left: [width / 2, 0, -width / 2, 0], right: [-width / 2, 0, width / 2, 0] };
            const grad = this.ctx.createLinearGradient(...(gradCoords[scrollDirection] || gradCoords.right));
            if (useSharpGradient) {
                grad.addColorStop(0, sortedStops[0].color);
                for (let i = 1; i < sortedStops.length; i++) {
                    grad.addColorStop(Math.max(0, sortedStops[i].position - 0.0001), sortedStops[i - 1].color);
                    grad.addColorStop(sortedStops[i].position, sortedStops[i].color);
                }
            } else {
                sortedStops.forEach(stop => grad.addColorStop(stop.position, stop.color));
            }
            return grad;
        }

        let effectiveProgress = progress;
        if (animationMode.includes('bounce')) {
            const bounceFrequency = 2.0;
            effectiveProgress = (1 - Math.cos(progress * bounceFrequency * 2 * Math.PI)) / 2;
        }

        const isVertical = scrollDirection === 'up' || scrollDirection === 'down';
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        const patternSize = 256;
        tempCanvas.width = isVertical ? 1 : patternSize;
        tempCanvas.height = isVertical ? patternSize : 1;

        const tempGrad = isVertical ? tempCtx.createLinearGradient(0, 0, 0, patternSize) : tempCtx.createLinearGradient(0, 0, patternSize, 0);

        let patternStops = [];
        if (animationMode.includes('bounce')) {
            const halfStops = sortedStops.length;
            if (halfStops > 0) {
                for (let i = 0; i < halfStops; i++) patternStops.push({ color: sortedStops[i].color, position: sortedStops[i].position * 0.5 });
                for (let i = halfStops - 2; i >= 0; i--) patternStops.push({ color: sortedStops[i].color, position: 1.0 - (sortedStops[i].position * 0.5) });
            }
        } else {
            patternStops = [...sortedStops];
            if (patternStops.length > 0) patternStops.push({ color: patternStops[0].color, position: 1.0 });
        }

        if (useSharpGradient) {
            const uniquePositionStops = new Map();
            patternStops.forEach(stop => uniquePositionStops.set(stop.position, stop.color));
            const finalStops = Array.from(uniquePositionStops, ([pos, color]) => ({ position: pos, color })).sort((a, b) => a.position - b.position);
            tempGrad.addColorStop(0, finalStops[0].color);
            for (let i = 1; i < finalStops.length; i++) {
                tempGrad.addColorStop(finalStops[i].position - 0.0001, finalStops[i - 1].color);
                tempGrad.addColorStop(finalStops[i].position, finalStops[i].color);
            }
        } else {
            patternStops.forEach(stop => tempGrad.addColorStop(stop.position, stop.color));
        }

        tempCtx.fillStyle = tempGrad;
        tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
        const pattern = this.ctx.createPattern(tempCanvas, 'repeat');

        const matrix = new DOMMatrix();
        const halfW = width / 2;
        const halfH = height / 2;
        const directionMultiplier = (scrollDirection === 'left' || scrollDirection === 'up') ? 1 : -1;

        const scrollProgress = animationMode.includes('bounce') ? effectiveProgress : progress;

        if (isVertical) {
            const scaleY = height / patternSize;
            const scrollY = scrollProgress * height * directionMultiplier;
            matrix.translateSelf(-halfW, -halfH + scrollY);
            matrix.scaleSelf(1, scaleY);
        } else {
            const scaleX = width / patternSize;
            const scrollX = scrollProgress * width * directionMultiplier;
            matrix.translateSelf(-halfW + scrollX, -halfH);
            matrix.scaleSelf(scaleX, 1);
        }

        pattern.setTransform(matrix);
        return pattern;
    }

    _createRadialGradient(p, options) {
        const { stops, animationMode, useSharpGradient, animationSpeed, width, height } = options;
        const progress = (typeof p === 'number' && isFinite(p)) ? p : 0;
        const isAnimated = animationSpeed > 0;
        const maxRadius = Math.max(width, height) / 2;
        if (maxRadius <= 0) return 'black';

        const grad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, maxRadius);

        if (!stops || stops.length === 0) {
            grad.addColorStop(0, '#ff00ff');
            return grad;
        }

        const sortedStops = [...stops].sort((a, b) => a.position - b.position);

        let effectiveProgress = isAnimated ? progress : 1.0;

        if (animationMode.includes('bounce')) {
            const bounceFrequency = 2.0;
            effectiveProgress = (1 - Math.cos(progress * bounceFrequency * 2 * Math.PI)) / 2;
        } else {
            const sizeProgress = isAnimated ? progress : 1.0;
            const alpha = isAnimated ? (progress < 0.5 ? (progress * 2) : (2 - progress * 2)) : 1.0;
            const stopsWithAlpha = sortedStops.map(stop => {
                const rgba = parseColorToRgba(stop.color);
                return { position: stop.position, color: `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a * alpha})` }
            });

            if (useSharpGradient) {
                grad.addColorStop(0, stopsWithAlpha[0].color);
                for (let i = 1; i < stopsWithAlpha.length; i++) {
                    grad.addColorStop(Math.max(0, stopsWithAlpha[i].position * sizeProgress - 0.0001), stopsWithAlpha[i - 1].color);
                    grad.addColorStop(stopsWithAlpha[i].position * sizeProgress, stopsWithAlpha[i].color);
                }
            } else {
                stopsWithAlpha.forEach(stop => {
                    grad.addColorStop(stop.position * sizeProgress, stop.color);
                });
            }
            return grad;
        }

        if (useSharpGradient) {
            grad.addColorStop(0, sortedStops[0].color);
            for (let i = 1; i < sortedStops.length; i++) {
                grad.addColorStop(Math.max(0, sortedStops[i].position * effectiveProgress - 0.0001), sortedStops[i - 1].color);
                grad.addColorStop(sortedStops[i].position * effectiveProgress, sortedStops[i].color);
            }
        } else {
            sortedStops.forEach(stop => {
                grad.addColorStop(stop.position * effectiveProgress, stop.color);
            });
        }
        return grad;
    }

    _createConicGradient(p, options = {}) {
        const {
            stops = this.gradient.stops,
            animationMode = this.animationMode,
            useSharpGradient = this.useSharpGradient
        } = options;

        const progress = (typeof p === 'number' && isFinite(p)) ? p : 0;
        const size = Math.ceil(Math.sqrt(this.width * this.width + this.height * this.height));
        if (size <= 0) return 'black';

        let animProgress = progress;
        if (animationMode.includes('bounce')) {
            const bounceFrequency = 2.0;
            animProgress = (1 - Math.cos(progress * bounceFrequency * 2 * Math.PI)) / 2;
        }
        const rotationOffset = animProgress * 2 * Math.PI;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = size; tempCanvas.height = size;
        const tempCtx = tempCanvas.getContext('2d');
        const centerX = size / 2; const centerY = size / 2;

        const tempGrad = tempCtx.createConicGradient(rotationOffset, centerX, centerY);
        const sortedStops = [...stops].sort((a, b) => a.position - b.position);

        const seamlessStops = [...sortedStops];
        if (seamlessStops.length > 0) {
            seamlessStops.push({ color: seamlessStops[0].color, position: 1.0 });
        }

        if (useSharpGradient) {
            const uniquePositionStops = new Map();
            seamlessStops.forEach(stop => uniquePositionStops.set(stop.position, stop.color));
            const finalStops = Array.from(uniquePositionStops, ([pos, color]) => ({ position: pos, color })).sort((a, b) => a.position - b.position);

            tempGrad.addColorStop(0, finalStops[0].color);
            for (let i = 1; i < finalStops.length; i++) {
                const prevColor = finalStops[i - 1].color;
                tempGrad.addColorStop(finalStops[i].position - 0.0001, prevColor);
                tempGrad.addColorStop(finalStops[i].position, finalStops[i].color);
            }
        } else {
            seamlessStops.forEach(stop => tempGrad.addColorStop(stop.position, stop.color));
        }

        tempCtx.fillStyle = tempGrad;
        tempCtx.fillRect(0, 0, size, size);

        const pattern = this.ctx.createPattern(tempCanvas, 'no-repeat');
        const matrix = new DOMMatrix().translateSelf(-centerX, -centerY);
        pattern.setTransform(matrix);

        return pattern;
    }

    _getGradientColorAt(progress, stops) {
        // Ensure progress wraps around for seamless animation
        const t = (progress % 1.0 + 1.0) % 1.0;
        if (!stops || stops.length === 0) return '#ff00ff';

        const sortedStops = [...stops].sort((a, b) => a.position - b.position);

        // Find the two stops that the progress is between
        for (let i = 0; i < sortedStops.length - 1; i++) {
            const s1 = sortedStops[i];
            const s2 = sortedStops[i + 1];
            if (t >= s1.position && t <= s2.position) {
                const range = s2.position - s1.position;
                if (range === 0) return s1.color;
                const amount = (t - s1.position) / range;
                // Use the global lerpColor function to find the exact color
                return lerpColor(s1.color, s2.color, amount);
            }
        }

        // If progress is outside the defined stops, return the last color
        return sortedStops[sortedStops.length - 1].color;
    }

    /**
     * Creates a rainbow gradient style (linear or radial).
     * @param {number} hueOffset - The starting hue for the rainbow animation.
     * @returns {CanvasGradient} The generated rainbow gradient.
     * @private
     */
    _createRainbowGradient(hueOffset) {
        let grad;
        const isVertical = this.scrollDirection === 'up' || this.scrollDirection === 'down';

        if (this.gradType === 'rainbow-radial') {
            const maxRadius = Math.max(this.width, this.height) / 2;
            if (maxRadius <= 0) return 'black';
            grad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, maxRadius);
        } else {
            const halfW = this.width / 2;
            const halfH = this.height / 2;
            grad = isVertical
                ? this.ctx.createLinearGradient(0, halfH, 0, -halfH)
                : this.ctx.createLinearGradient(halfW, 0, -halfW, 0);
        }

        // **THE FIX IS HERE:** Use fewer stops for a sharp, banded rainbow.
        const numStops = this.useSharpGradient ? 12 : 60;
        const step = 360 / numStops;

        for (let i = 0; i <= numStops; i++) {
            const hue = (i * step + hueOffset) % 360;
            const color = `hsl(${hue}, 100%, 50%)`;
            const position = i / numStops;

            if (this.useSharpGradient && i > 0) {
                const prevHue = ((i - 1) * step + hueOffset) % 360;
                const prevColor = `hsl(${prevHue}, 100%, 50%)`;
                grad.addColorStop(position - 0.0001, prevColor);
            }
            grad.addColorStop(position, color);
        }
        return grad;
    }

    updateAnimationState(audioData, sensorData, deltaTime = 0) {
        this._conicPatternCache = null;
        this._strokeConicPatternCache = null;
        this._linearPatternCache = null;
        this._applyAudioReactivity(audioData);
        this._applySensorReactivity(sensorData);

        const animSpeed = (this.animationSpeed || 0) * deltaTime;
        const cycleSpeed = (this.cycleSpeed || 0) * deltaTime;
        const strokeAnimSpeed = (this.strokeAnimationSpeed || 0) * deltaTime;
        const strokeCycleSpeed = (this.strokeCycleSpeed || 0) * deltaTime;
        const oscAnimSpeed = (this.oscAnimationSpeed || 0);
        const textAnimSpeed = (this.textAnimationSpeed || 0) * deltaTime;
        const rotationSpeed = (this.rotationSpeed || 0) * deltaTime;
        const tetrisSpeed = (this.tetrisSpeed || 0);
        this.strokeAnimationAngle += (this.strokeRotationSpeed || 0) * deltaTime * 0.06;

        if (this.shape === 'spawner') {
            let spawnRate = Number(this.spawn_spawnRate) || 0;
            let initialSpeed = Number(this.spawn_speed) || 0;
            let particleSize = Number(this.spawn_size) || 0;
            let gravity = Number(this.spawn_gravity) || 0;
            let spreadAngle = Number(this.spawn_spread) || 0;

            if (this.enableAudioReactivity && this.spawn_audioTarget !== 'none') {
                const audioValue = this.smoothedAudioValue;
                const sensitivity = (this.audioSensitivity || 10) / 50.0;
                const reactiveAmount = audioValue * sensitivity;

                switch (this.spawn_audioTarget) {
                    case 'spawnRate': spawnRate *= (1 + reactiveAmount * 3); break;
                    case 'initialSpeed': initialSpeed *= (1 + reactiveAmount * 1.5); break;
                    case 'particleSize': particleSize *= (1 + reactiveAmount * 2); break;
                    case 'gravity': gravity -= reactiveAmount * 100; break;
                    case 'spreadAngle': spreadAngle = Math.min(360, spreadAngle + reactiveAmount * 180); break;
                }
            }

            const katakana = 'アァカサタナハマヤャラワガザダバパイィキシチニヒミリヰギジヂビピウゥクスツヌフムユュルグズブプエェケセテネヘメレヱゲゼデベペオォコソトノホモヨョロヲゴゾドボポヴッン';
            const numbers = '0123456789';
            const binary = '01';
            const ascii = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

            switch (this.spawn_matrixCharSet) {
                case 'numbers': this.matrixActiveCharSet = numbers; break;
                case 'binary': this.matrixActiveCharSet = binary; break;
                case 'ascii': this.matrixActiveCharSet = ascii; break;
                default: this.matrixActiveCharSet = katakana;
            }

            this.spawnCounter += spawnRate * deltaTime;
            const particlesToSpawn = Math.floor(this.spawnCounter);
            this.spawnCounter -= particlesToSpawn;

            for (let i = 0; i < particlesToSpawn; i++) {
                if (this.particles.length >= this.spawn_count) break;

                const baseSize = particleSize;
                const sizeRandomness = (Number(this.spawn_size_randomness) || 0) / 100.0;
                const sizeVariation = baseSize * sizeRandomness * (Math.random() - 0.5) * 2;
                const finalSize = Math.max(1, baseSize + sizeVariation);

                const baseRotSpeed = Number(this.spawn_rotationSpeed) || 0;
                const rotVariance = Number(this.spawn_rotationVariance) || 0;
                const rotDeviation = rotVariance * (Math.random() - 0.5) * 2;
                const finalRotSpeed = baseRotSpeed + rotDeviation;

                const baseSpeed = initialSpeed;
                const speedVariance = Number(this.spawn_speedVariance) || 0;
                const randomBaseSpeed = baseSpeed + (speedVariance * (Math.random() - 0.5) * 2);
                const sizeFactor = finalSize / (baseSize || 10);
                const finalSpeed = Math.max(0, randomBaseSpeed * sizeFactor);

                const particle = {
                    id: this.nextParticleId++,
                    life: 0,
                    maxLife: this.spawn_lifetime,
                    x: this.width / 2,
                    y: this.height / 2,
                    vx: 0,
                    vy: 0,
                    size: finalSize,
                    rotation: this.spawn_initialRotation_random ? (Math.random() * 2 * Math.PI) : 0,
                    rotationSpeed: finalRotSpeed,
                    actualShape: this.spawn_shapeType,
                    trail: []
                };

                if (particle.actualShape === 'random') {
                    particle.actualShape = this.availableParticleShapes[Math.floor(Math.random() * this.availableParticleShapes.length)];
                }

                if (particle.actualShape === 'matrix' && this.matrixActiveCharSet.length > 0) {
                    const trailLength = Math.max(1, Number(this.spawn_trailLength) || 0);
                    particle.matrixChars = Array.from({ length: trailLength + 1 }, () => this.matrixActiveCharSet[Math.floor(Math.random() * this.matrixActiveCharSet.length)]);
                }

                const speed = finalSpeed;
                switch (this.spawn_animation) {
                    case 'explode': {
                        const angle = Math.random() * (spreadAngle * Math.PI / 180) - (spreadAngle * Math.PI / 360);
                        particle.vx = Math.cos(angle) * speed;
                        particle.vy = Math.sin(angle) * speed;
                        break;
                    }
                    case 'fountain': {
                        const spreadRad = spreadAngle * Math.PI / 180;
                        const angle = (Math.random() - 0.5) * spreadRad - (Math.PI / 2);
                        particle.vx = Math.cos(angle) * speed;
                        particle.vy = Math.sin(angle) * speed;
                        particle.y = this.height;
                        break;
                    }
                    case 'rain':
                        particle.x = Math.random() * this.width;
                        particle.y = 0;
                        particle.vy = speed;
                        break;
                    case 'flow':
                        particle.x = 0;
                        particle.y = Math.random() * this.height;
                        particle.vx = speed;
                        break;
                }
                this.particles.push(particle);
            }

            this.particles = this.particles.filter(p => p.life < p.maxLife);
            this.particles.forEach(p => {
                p.life += deltaTime;
                p.vy += gravity * deltaTime;
                p.x += p.vx * deltaTime;
                p.y += p.vy * deltaTime;
                p.rotation += (p.rotationSpeed * Math.PI / 180) * deltaTime;

                const trailEnabled = p.actualShape === 'matrix' || this.spawn_enableTrail;
                if (trailEnabled) {
                    p.trail.unshift({ x: p.x, y: p.y, size: p.size, rotation: p.rotation });
                    const trailLength = Number(this.spawn_trailLength) || 15;
                    const spacingFactor = 1 + this.spawn_trailSpacing * p.size;
                    const historyLength = Math.floor((trailLength + 2) * spacingFactor);
                    if (p.trail.length > historyLength) {
                        p.trail.length = historyLength;
                    }
                }

                if (p.actualShape === 'matrix' && p.matrixChars && Math.random() > 0.9) {
                    const charIndexToChange = Math.floor(Math.random() * p.matrixChars.length);
                    p.matrixChars[charIndexToChange] = this.matrixActiveCharSet[Math.floor(Math.random() * this.matrixActiveCharSet.length)];
                }
            });
        }

        if (this.shape === 'pixel-art') {
            if (this.pixelArtFrames && this.pixelArtFrames.length > 1) {
                this.frameTimer -= deltaTime;
                if (this.frameTimer <= 0) {
                    this.currentFrameIndex = (this.currentFrameIndex + 1) % this.pixelArtFrames.length;
                    const newFrame = this.pixelArtFrames[this.currentFrameIndex];
                    // Add the remaining time to the new duration to keep timing smooth
                    this.frameTimer += (newFrame && newFrame.duration) || 1;
                }
            }
        }

        if (this.shape === 'audio-visualizer' && audioData && audioData.frequencyData) {
            let processingData = audioData.frequencyData;

            const lowCutoff = (this.vizLowCutoff || 0) / 100.0;
            const highCutoff = (this.vizHighCutoff || 100) / 100.0;
            if (lowCutoff > 0 || highCutoff < 1.0) {
                const originalSize = processingData.length;
                const startIndex = Math.floor(originalSize * lowCutoff);
                const endIndex = Math.floor(originalSize * highCutoff);
                if (startIndex < endIndex) {
                    processingData = processingData.slice(startIndex, endIndex);
                }
            }

            const downsampleFactor = Math.max(1, parseInt(this.vizDownsampleFactor, 10) || 1);
            if (downsampleFactor > 1) {
                processingData = processingData.filter((element, index) => {
                    return index % downsampleFactor === 0;
                });
            }

            let fullFreqData = processingData;
            const smoothingFactor = (this.vizSmoothing || 0) / 100.0;
            const barCount = parseInt(this.vizBarCount, 10);
            let freqDataSize = fullFreqData.length;

            // --- THIS IS THE MISSING LOGIC ---
            if (this.vizDynamicRange) {
                let lastActiveIndex = 0;
                const silenceThreshold = 1;
                for (let i = freqDataSize - 1; i >= 0; i--) {
                    if (fullFreqData[i] > silenceThreshold) {
                        lastActiveIndex = i;
                        break;
                    }
                }
                const minSize = Math.floor(fullFreqData.length * 0.25);
                const activeSize = Math.max(minSize, lastActiveIndex);

                if (this.smoothedFreqDataSize === undefined) {
                    this.smoothedFreqDataSize = activeSize;
                } else {
                    this.smoothedFreqDataSize = this.smoothedFreqDataSize * 0.9 + activeSize * 0.1;
                }
                freqDataSize = Math.ceil(this.smoothedFreqDataSize);
            }
            // --- END OF MISSING LOGIC ---

            const mappedData = [];
            for (let i = 0; i < barCount; i++) {
                const startFreqIndex = Math.floor((i / barCount) * freqDataSize);
                const endFreqIndex = Math.floor(((i + 1) / barCount) * freqDataSize);
                let sum = 0;
                let count = 0;
                for (let j = startFreqIndex; j < endFreqIndex; j++) {
                    let value = fullFreqData[j] || 0;
                    const bassBoostFactor = (this.vizBassLevel || 50) / 100.0;
                    const trebleBoostFactor = (this.vizTrebleBoost || 125) / 100.0;
                    const boostFactor = bassBoostFactor + (i / barCount) * (trebleBoostFactor - bassBoostFactor);
                    value *= boostFactor;
                    sum += value;
                    count++;
                }
                const avg = count > 0 ? sum / count : 0;
                mappedData.push(avg);
            }

            let peakValue = Math.max(...mappedData);
            if (peakValue <= 0) peakValue = 1;

            for (let i = 0; i < barCount; i++) {
                const normalizedValue = mappedData[i];
                let targetHeight;
                if (this.vizAutoScale) {
                    let scaleFactor = (255 / peakValue);
                    if (barCount === 1) scaleFactor = 1;
                    targetHeight = normalizedValue * scaleFactor;
                } else {
                    targetHeight = normalizedValue;
                }

                const shapeMaxHeight = (this.vizLayout === 'Circular' || this.vizLayout === 'Circular Polyline')
                    ? (Math.min(this.width, this.height) / 2)
                    : this.height;


                const sensitivityMultiplier = (this.vizGain || 100) / 100.0;
                const maxAllowedHeight = (this.vizMaxBarHeight || 100) / 100.0;
                let audioValue;

                if (barCount === 1) {
                    audioValue = (audioData.volume.avg || 0) * sensitivityMultiplier;
                } else {
                    audioValue = (targetHeight / 255) * sensitivityMultiplier;
                }

                let finalHeight;
                if (this.vizAutoScale) {
                    // When auto-scaling, allow bars to reach full height
                    finalHeight = Math.min(1.0, audioValue) * shapeMaxHeight;
                } else {
                    // When not auto-scaling, respect the Max Bar Height setting
                    const maxAllowedHeight = (this.vizMaxBarHeight || 100) / 100.0;
                    finalHeight = Math.min(maxAllowedHeight, audioValue) * shapeMaxHeight;
                }
                this.vizBarHeights[i] = smoothingFactor * this.vizBarHeights[i] + (1.0 - smoothingFactor) * finalHeight;
            }
        }

        if (this.shape === 'strimer') {
            const needsInitialization = this.strimerBlocks.length === 0 || this.strimerBlocks.length !== (this.strimerColumns * this.strimerBlockCount);
            if (needsInitialization) {
                this.strimerBlocks = [];
                for (let i = 0; i < this.strimerColumns; i++) {
                    for (let j = 0; j < this.strimerBlockCount; j++) {
                        const direction = this.strimerDirection === 'Random' ? (j % 2 === 0 ? -1 : 1) : (this.strimerDirection === 'Up' ? -1 : 1);
                        this.strimerBlocks.push({
                            col: i,
                            progress: this.strimerAnimation === 'Cascade' ? (j / this.strimerBlockCount) : Math.random(),
                            speed: (Math.random() * 0.5 + 0.5) * 0.01,
                            direction: direction,
                            colorIndex: Math.floor(Math.random() * 100),
                            glitchTimer: 0,
                            isGlitched: false
                        });
                    }
                }
            }

            if (this.strimerPulseSpeed > 0) {
                const pulseSpeed = (this.strimerPulseSpeed / 10) * 0.05;
                this.pulseProgress = (this.pulseProgress + pulseSpeed * deltaTime * 60) % (2 * Math.PI);
            }

            switch (this.strimerAnimation) {
                case 'Audio Meter':
                    if (!this.strimerMeterHeights || this.strimerMeterHeights.length !== this.strimerColumns) {
                        this.strimerMeterHeights = new Array(this.strimerColumns).fill(0);
                    }
                    const metrics = ['bass', 'mids', 'highs', 'volume'];
                    const smoothingFactor = (this.strimerAudioSmoothing || 0) / 100.0;
                    for (let i = 0; i < this.strimerColumns; i++) {
                        const metricName = metrics[i % metrics.length];
                        let audioValue = (audioData && audioData[metricName]) ? audioData[metricName].avg : 0;
                        const startPoint = (this.strimerBassLevel || 50) / 400.0;
                        const endPoint = (this.strimerTrebleBoost || 150) / 10.0;
                        const boost = startPoint + (i / (this.strimerColumns - 1 || 1)) * (endPoint - startPoint);
                        audioValue *= boost;
                        const targetHeight = Math.min(this.height, audioValue * (this.strimerAudioSensitivity / 5000.0) * this.height);
                        this.strimerMeterHeights[i] = smoothingFactor * this.strimerMeterHeights[i] + (1.0 - smoothingFactor) * targetHeight;
                    }
                    break;
                case 'Snake':
                    const totalBlocks = this.strimerColumns * this.strimerRows;
                    const animationSpeed = (this.strimerAnimationSpeed / 10) * deltaTime;
                    this.strimerSnakeProgress += animationSpeed;
                    if (this.strimerSnakeProgress >= 1.0) {
                        this.strimerSnakeProgress -= 1.0;
                        this.strimerSnakeIndex++;
                        if (this.strimerSnakeIndex >= totalBlocks) {
                            this.strimerSnakeIndex = 0;
                        }
                    }
                    break;
                default:
                    this.strimerBlocks.forEach(block => {
                        if (this.strimerGlitchFrequency > 0) {
                            if (block.glitchTimer > 0) {
                                block.glitchTimer -= deltaTime * 60;
                                if (block.glitchTimer <= 0) block.isGlitched = false;
                            } else if (Math.random() < (this.strimerGlitchFrequency / 5000)) {
                                block.isGlitched = true;
                                block.glitchTimer = Math.random() * 10 + 5;
                            }
                        }
                        if (block.isGlitched) return;
                        block.progress += block.speed * (this.strimerAnimationSpeed / 10) * block.direction * deltaTime * 60;
                        if (this.strimerAnimation === 'Bounce') {
                            if (block.progress >= 1.0) { block.progress = 1.0; block.direction *= -1; }
                            else if (block.progress <= 0) { block.progress = 0; block.direction *= -1; }
                        } else {
                            block.progress = (block.progress % 1.0 + 1.0) % 1.0;
                        }
                    });
                    break;
            }
        }

        if (this.shape === 'tetris') {
            const baseSpeed = tetrisSpeed;
            if (this.tetrisAnimation === 'fade-in-out') {
                const fadeSpeed = baseSpeed * 0.01;
                if (this.tetrisBlocks.length === 0 && this.tetrisFadeState !== 'out') {
                    const blockHeight = this.height / this.tetrisBlockCount;
                    for (let i = 0; i < this.tetrisBlockCount; i++) {
                        this.tetrisBlocks.push({ w: this.width, h: blockHeight, x: 0, y: this.height - (i + 1) * blockHeight, life: 0, settled: true });
                    }
                    this.tetrisActiveBlockIndex = 0;
                    this.tetrisFadeState = 'in';
                    this.tetrisHoldTimer = this.tetrisHoldTime;
                }
                if (this.tetrisFadeState === 'in') {
                    if (this.tetrisActiveBlockIndex < this.tetrisBlocks.length) {
                        const activeBlock = this.tetrisBlocks[this.tetrisActiveBlockIndex];
                        activeBlock.life += fadeSpeed * deltaTime * 60;
                        if (activeBlock.life >= 1.0) {
                            activeBlock.life = 1.0;
                            this.tetrisActiveBlockIndex++;
                        }
                    } else {
                        this.tetrisFadeState = 'hold';
                    }
                }
                else if (this.tetrisFadeState === 'hold') {
                    this.tetrisHoldTimer -= deltaTime * 60;
                    if (this.tetrisHoldTimer <= 0) {
                        this.tetrisFadeState = 'out';
                        this.tetrisActiveBlockIndex = 0;
                    }
                }
                else if (this.tetrisFadeState === 'out') {
                    if (this.tetrisActiveBlockIndex < this.tetrisBlocks.length) {
                        const activeBlock = this.tetrisBlocks[this.tetrisActiveBlockIndex];
                        activeBlock.life -= fadeSpeed * deltaTime * 60;
                        if (activeBlock.life <= 0) {
                            activeBlock.life = 0;
                            this.tetrisActiveBlockIndex++;
                        }
                    } else {
                        this.tetrisBlocks = [];
                        this.tetrisFadeState = 'in';
                    }
                }
            } else if (this.tetrisAnimation === 'fade-in-stack') {
                const fadeSpeed = baseSpeed * 0.01;
                if (this.tetrisBlocks.length === 0) {
                    const blockHeight = this.height / this.tetrisBlockCount;
                    for (let i = 0; i < this.tetrisBlockCount; i++) {
                        this.tetrisBlocks.push({ w: this.width, h: blockHeight, x: 0, y: this.height - (i + 1) * blockHeight, life: 0, settled: true });
                    }
                    this.tetrisActiveBlockIndex = 0;
                    this.tetrisFadeState = 'in';
                }
                if (this.tetrisFadeState === 'in') {
                    if (this.tetrisActiveBlockIndex < this.tetrisBlocks.length) {
                        const activeBlock = this.tetrisBlocks[this.tetrisActiveBlockIndex];
                        activeBlock.life += fadeSpeed * deltaTime * 60;
                        if (activeBlock.life >= 1.0) {
                            activeBlock.life = 1.0;
                            this.tetrisActiveBlockIndex++;
                        }
                    } else {
                        this.tetrisFadeState = 'out';
                    }
                } else {
                    let allFadedOut = true;
                    this.tetrisBlocks.forEach(block => {
                        block.life -= fadeSpeed * deltaTime * 60;
                        if (block.life > 0) { allFadedOut = false; } else { block.life = 0; }
                    });
                    if (allFadedOut) { this.tetrisBlocks = []; }
                }
            } else {
                this.tetrisSpawnTimer -= deltaTime * 60;
                if (this.tetrisBlocks.length === 0 && this.tetrisSpawnTimer < 0) {
                    this.tetrisSpawnTimer = 0;
                    this.tetrisActiveBlockIndex = 0;
                }
                if (this.tetrisSpawnTimer <= 0 && this.tetrisBlocks.length < this.tetrisBlockCount) {
                    let newBlock = { vy: 0, vx: 0, life: 1.0, settled: false, fading: false };
                    const blockHeight = this.height / this.tetrisBlockCount;
                    newBlock.w = this.width; newBlock.h = blockHeight;
                    newBlock.x = 0; newBlock.y = -newBlock.h;
                    this.tetrisBlocks.push(newBlock);
                    if (this.tetrisAnimation === 'gravity' || this.tetrisAnimation === 'gravity-fade') {
                        this.tetrisSpawnTimer = 10;
                    }
                }
                if (this.tetrisAnimation === 'gravity' || this.tetrisAnimation === 'gravity-fade') {
                    this.tetrisBlocks.forEach((block, index) => {
                        if (block.settled) return;
                        const gravity = baseSpeed * 0.01 * window.tetrisGravityMultiplier * deltaTime * 60;
                        const bounceFactor = this.tetrisBounce / 100.0;
                        let bounceBoundaryTop = this.height;
                        this.tetrisBlocks.forEach((other, i) => {
                            if (i !== index && other.y > block.y) {
                                bounceBoundaryTop = Math.min(bounceBoundaryTop, other.y);
                            }
                        });
                        block.vy += gravity;
                        block.y += block.vy;
                        if (block.y + block.h >= bounceBoundaryTop) {
                            block.y = bounceBoundaryTop - block.h;
                            block.vy *= -bounceFactor;
                            let stableBoundaryTop = this.height;
                            this.tetrisBlocks.forEach((other, i) => {
                                if (i !== index && other.settled) {
                                    stableBoundaryTop = Math.min(stableBoundaryTop, other.y);
                                }
                            });
                            if (block.y + block.h >= stableBoundaryTop - 1 && Math.abs(block.vy) < 1) {
                                block.settled = true;
                            }
                        }
                    });
                } else {
                    if (this.tetrisActiveBlockIndex < this.tetrisBlocks.length) {
                        const activeBlock = this.tetrisBlocks[this.tetrisActiveBlockIndex];
                        if (!activeBlock.settled) {
                            const speed = baseSpeed * 0.05 * deltaTime * 60;
                            let boundary = (this.tetrisActiveBlockIndex > 0) ? this.tetrisBlocks[this.tetrisActiveBlockIndex - 1].y : this.height;
                            activeBlock.y += speed;
                            if (activeBlock.y + activeBlock.h >= boundary) {
                                activeBlock.y = boundary - activeBlock.h;
                                activeBlock.settled = true;
                                this.tetrisActiveBlockIndex++;
                            }
                        }
                    }
                }
                if (this.tetrisAnimation === 'gravity-fade') {
                    this.tetrisBlocks.forEach(block => { if (block.settled) block.fading = true; });
                } else {
                    const allSpawned = this.tetrisBlocks.length === this.tetrisBlockCount;
                    const allSettled = this.tetrisBlocks.every(b => b.settled);
                    if (allSpawned && allSettled) {
                        this.tetrisBlocks.forEach(b => b.fading = true);
                    }
                }
                this.tetrisBlocks.forEach(block => { if (block.fading) block.life -= 3 * deltaTime; });
                this.tetrisBlocks = this.tetrisBlocks.filter(b => b.life > 0);
            }
        }

        if (this.shape === 'polyline' && this.pathAnim_enable) {
            if (!Array.isArray(this.pathAnim_history)) {
                this.pathAnim_history = [];
            }
            const { totalLength } = this._calculatePathSegments();
            const objectCount = Math.max(1, this.pathAnim_objectCount || 1);
            const spacing = this.pathAnim_objectSpacing || 100;
            const swarmLength = (objectCount - 1) * spacing;

            const baseSpeed = this.pathAnim_speed || 0;
            const burstSpeed = this.pathAnim_speedBurst * 500;
            const finalSpeed = baseSpeed + burstSpeed;
            this.pathAnim_distance += finalSpeed * deltaTime * this.pathAnim_direction;

            if (this.pathAnim_behavior === 'Ping-Pong') {
                if (this.pathAnim_direction === 1 && (this.pathAnim_distance - swarmLength) >= totalLength) {
                    this.pathAnim_distance = totalLength + swarmLength;
                    this.pathAnim_direction = -1;
                } else if (this.pathAnim_direction === -1 && this.pathAnim_distance < 0) {
                    this.pathAnim_distance = 0;
                    this.pathAnim_direction = 1;
                }
            } else if (this.pathAnim_behavior === 'Loop') {
                const loopDistance = totalLength + swarmLength;
                if (this.pathAnim_distance > loopDistance) {
                    this.pathAnim_distance -= loopDistance;
                }
            }
            this.pathAnim_speedBurst *= 0.95;

            const pathAnimSpeed = (this.pathAnim_animationSpeed || 0) * deltaTime;
            const pathCycleSpeed = (this.pathAnim_cycleSpeed || 0) * deltaTime;
            this.pathAnim_hue1 += pathCycleSpeed * 20;
            const increment = pathAnimSpeed * 0.025;
            const directionMultiplier = (this.pathAnim_scrollDir === 'left' || this.pathAnim_scrollDir === 'up') ? -1 : 1;
            this.pathAnim_scrollOffset += increment * directionMultiplier;
            const { x, y, angle } = this._getPointAndAngleAtDistance(this.pathAnim_distance);
            this.pathAnim_history.unshift({ x, y, angle });
            const trailLength = this.pathAnim_trailLength || 80;
            if (this.pathAnim_history.length > trailLength) {
                this.pathAnim_history.length = Math.ceil(trailLength);
            }
        } else if (this.shape === 'polyline') {
            this.pathAnim_history = [];
        }

        if (this.gradType === 'random' && this.randomElementState) {
            for (const key in this.randomElementState) {
                this.randomElementState[key].timer -= animSpeed * 1;
            }
        }

        this.hue1 += cycleSpeed * 20;
        this.hue2 += cycleSpeed * 20;
        this.strokeHue1 += strokeCycleSpeed * 20;
        this.strokeHue2 += strokeCycleSpeed * 20;

        const currentText = this.getDisplayText();
        switch (this.textAnimation) {
            case 'marquee':
            case 'wave': {
                const fontData = this.pixelFont === 'large' ? FONT_DATA_5PX : FONT_DATA_4PX;
                const pixelSize = this.fontSize / 10;
                const textWidth = currentText.length * (fontData.charWidth + fontData.charSpacing) * pixelSize;
                if (this.textAnimation === 'marquee') {
                    const scrollInterval = 5 / (this.textAnimationSpeed || 10);
                    this.scrollTimer += deltaTime;
                    if (pixelSize > 0 && this.scrollTimer >= scrollInterval) {
                        const stepsToTake = Math.floor(this.scrollTimer / scrollInterval);
                        this.scrollOffsetX -= stepsToTake * pixelSize;
                        this.scrollTimer -= stepsToTake * scrollInterval;
                    }
                } else {
                    this.scrollOffsetX -= textAnimSpeed * 20;
                }
                if (this.scrollOffsetX < -textWidth) {
                    this.scrollOffsetX = this.width;
                }
                this.visibleCharCount = currentText.length;
                break;
            }
            case 'typewriter':
                if (this.typewriterWaitTimer > 0) {
                    this.typewriterWaitTimer -= deltaTime * 60;
                    if (this.typewriterWaitTimer <= 0) {
                        this.visibleCharCount = 0;
                    }
                } else {
                    this.visibleCharCount += textAnimSpeed;
                    if (this.visibleCharCount >= currentText.length) {
                        this.visibleCharCount = currentText.length;
                        this.typewriterWaitTimer = 50;
                    }
                }
                this.scrollOffsetX = 0;
                break;
            default:
                this.scrollOffsetX = 0;
                this.visibleCharCount = currentText.length;
                break;
        }

        if (this.gradType !== 'solid' && this.gradType !== 'alternating' && this.gradType !== 'random') {
            const increment = animSpeed * 0.025;
            const directionMultiplier = (this.scrollDirection === 'left' || this.scrollDirection === 'up') ? -1 : 1;
            this.scrollOffset += increment * directionMultiplier;
        }

        if (this.strokeGradType !== 'solid' && this.strokeGradType !== 'alternating' && this.strokeGradType !== 'random') {
            const increment = strokeAnimSpeed * 0.025;
            const directionMultiplier = (this.strokeScrollDir === 'left' || this.strokeScrollDir === 'up' || this.strokeScrollDir === 'along-path-reversed') ? -1 : 1;
            this.strokeScrollOffset += increment * directionMultiplier;
        }

        let shapeIncrement;
        if (this.shape === 'oscilloscope') {
            if (this.oscDisplayMode === 'seismic') {
                shapeIncrement = oscAnimSpeed * this.seismicAnimationSpeedMultiplier * deltaTime;
                const directionMultiplier = (this.scrollDirection === 'right' || this.scrollDirection === 'down') ? 1 : 1;
                shapeIncrement *= directionMultiplier;
            } else {
                shapeIncrement = oscAnimSpeed * 0.5 * deltaTime;
            }
        } else {
            shapeIncrement = animSpeed * 0.5;
        }

        this.animationAngle += rotationSpeed * 0.06;

        if (this.shape === 'oscilloscope') {
            this.wavePhaseAngle += shapeIncrement;
        }

        if (this.shape === 'fire' || this.shape === 'fire-radial') {
            this.particleSpawnCounter += animSpeed * 0.25;
            const particlesToSpawn = Math.floor(this.particleSpawnCounter);
            this.particleSpawnCounter -= particlesToSpawn;
            if (this.shape === 'fire') {
                this.fireParticles.forEach(p => { p.y -= p.speed; p.age += deltaTime * 60; });
                this.fireParticles = this.fireParticles.filter(p => p.age < p.maxAge);
                for (let i = 0; i < particlesToSpawn; i++) {
                    if (this.fireParticles.length < 300) {
                        const halfH = this.height / 2;
                        const maxAge = (Math.random() * 60 + 90);
                        const particleSpeed = (this.height / maxAge) * (Math.random() * 0.2 + 0.8) * 60 * deltaTime;
                        const startSize = (Math.random() * 0.5 + 0.5) * (this.width / 7);
                        const spreadMultiplier = this.fireSpread / 100.0;
                        const newParticle = { id: this.nextParticleId++, x: (Math.random() - 0.5) * this.width * spreadMultiplier, y: halfH, sizeX: startSize, sizeY: startSize * (Math.random() * 1.5 + 0.5), age: 0, maxAge: maxAge, speed: particleSpeed };
                        let baseColor;
                        const gradProgress = (newParticle.x + (this.width / 2)) / this.width;
                        if (this.cycleColors) {
                            const hue = (this.hue1 + newParticle.id * this.phaseOffset) % 360;
                            baseColor = `hsl(${hue}, 100%, 50%)`;
                        } else if (this.gradType === 'rainbow' || this.gradType === 'rainbow-radial') {
                            const hue = (gradProgress * 360 + this.hue1) % 360;
                            baseColor = `hsl(${hue}, 100%, 50%)`;
                        } else if (this.gradType === 'random') {
                            baseColor = Math.random() < 0.5 ? this.gradient.color1 : this.gradient.color2;
                        } else if (this.gradType === 'alternating') {
                            baseColor = newParticle.id % 2 === 0 ? this.gradient.color1 : this.gradient.color2;
                        } else if (this.gradType === 'linear') {
                            baseColor = lerpColor(this.gradient.color1, this.gradient.color2, gradProgress);
                        } else {
                            baseColor = this.gradient.color1;
                        }
                        newParticle.color = baseColor;
                        this.fireParticles.push(newParticle);
                    }
                }
            } else {
                this.fireParticles.forEach(p => {
                    const speed = p.speed * 60 * deltaTime;
                    p.x += Math.cos(p.angle) * speed;
                    p.y += Math.sin(p.angle) * speed;
                    p.age += deltaTime * 60;
                });
                this.fireParticles = this.fireParticles.filter(p => p.age < p.maxAge);
                for (let i = 0; i < particlesToSpawn; i++) {
                    if (this.fireParticles.length < 300) {
                        const spreadMultiplier = this.fireSpread / 100.0;
                        const maxRadius = Math.min(this.width, this.height) / 2;
                        const maxAge = (Math.random() * 60 + 90);
                        const particleSpeed = (maxRadius / maxAge) * spreadMultiplier;
                        const startSize = (Math.random() * 0.5 + 0.5) * (Math.min(this.width, this.height) / 8);
                        if (maxAge < 1) continue;
                        const newParticle = { id: this.nextParticleId++, x: 0, y: 0, sizeX: startSize, sizeY: startSize, age: 0, maxAge: maxAge, speed: particleSpeed, angle: Math.random() * 2 * Math.PI };
                        let baseColor;
                        const gradProgress = newParticle.angle / (2 * Math.PI);
                        if (this.cycleColors) {
                            const hue = (this.hue1 + newParticle.id * this.phaseOffset) % 360;
                            baseColor = `hsl(${hue}, 100%, 50%)`;
                        } else if (this.gradType === 'rainbow' || this.gradType === 'rainbow-radial') {
                            const hue = (gradProgress * 360 + this.hue1) % 360;
                            baseColor = `hsl(${hue}, 100%, 50%)`;
                        } else if (this.gradType === 'random') {
                            baseColor = Math.random() < 0.5 ? this.gradient.color1 : this.gradient.color2;
                        } else if (this.gradType === 'alternating') {
                            baseColor = newParticle.id % 2 === 0 ? this.gradient.color1 : this.gradient.color2;
                        } else if (this.gradType === 'radial' || this.gradType === 'linear') {
                            baseColor = lerpColor(this.gradient.color1, this.gradient.color2, gradProgress);
                        } else {
                            baseColor = this.gradient.color1;
                        }
                        newParticle.color = baseColor;
                        this.fireParticles.push(newParticle);
                    }
                }
            }
        } else {
            if (this.fireParticles.length > 0) {
                this.fireParticles = [];
            }
        }
    }

    draw(isSelected, audioData = {}, palette = {}) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const angleToUse = this.getRenderAngle();

        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(angleToUse);
        this.ctx.rotate(this.animationAngle);

        if (this.internalScale && this.internalScale !== 1.0) {
            this.ctx.scale(this.internalScale, this.internalScale);
        }

        // Flash opacity is now applied on a case-by-case basis within each shape's drawing logic
        // to avoid affecting UI elements like the polyline placeholder.

        const applyStrokeInside = () => {
            if (this.enableStroke && this.strokeWidth > 0) {
                const strokeStyle = this._createLocalStrokeStyle();
                this.ctx.save();
                this.ctx.clip();
                this.ctx.strokeStyle = strokeStyle;
                this.ctx.lineWidth = this.strokeWidth * 2;

                if (strokeStyle instanceof CanvasPattern && strokeStyle.offsetX) {
                    this.ctx.save();
                    this.ctx.translate(strokeStyle.offsetX, strokeStyle.offsetY);
                    this.ctx.stroke();
                    this.ctx.restore();
                } else {
                    this.ctx.stroke();
                }

                this.ctx.restore();
            }
        };

        // --- SENSOR REACTIVITY OVERRIDE ---
        if (this.enableSensorReactivity && (this.sensorTarget === 'Time Plot' || this.sensorTarget === 'Sensor Meter')) {
            // Create the correct shape path before clipping and drawing the sensor effect.
            this.ctx.beginPath();
            if (this.shape === 'circle') {
                this.ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, 2 * Math.PI);
            } else if (this.shape === 'polygon') {
                const rX = this.width / 2;
                const rY = this.height / 2;
                const sides = Math.max(3, this.sides);
                for (let i = 0; i < sides; i++) {
                    const a = (i / sides) * 2 * Math.PI - (Math.PI / 2);
                    this.ctx[i === 0 ? 'moveTo' : 'lineTo'](rX * Math.cos(a), rY * Math.sin(a));
                }
                this.ctx.closePath();
            } else if (this.shape === 'star') {
                const oRX = this.width / 2;
                const oRY = this.height / 2;
                const iRX = oRX * (this.starInnerRadius / 100);
                const iRY = oRY * (this.starInnerRadius / 100);
                const points = Math.max(3, this.points);
                for (let i = 0; i < 2 * points; i++) {
                    const rX = (i % 2 === 0) ? oRX : iRX;
                    const rY = (i % 2 === 0) ? oRY : iRY;
                    const a = (i / (2 * points)) * 2 * Math.PI - (Math.PI / 2);
                    this.ctx[i === 0 ? 'moveTo' : 'lineTo'](rX * Math.cos(a), rY * Math.sin(a));
                }
                this.ctx.closePath();
            } else { // Default to rectangle for sensor effects on complex/unsupported shapes
                this.ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height);
            }

            if (this.sensorTarget === 'Time Plot') {
                this.ctx.save(); // Save state before clipping
                this.ctx.clip();
                this._drawTimePlot();
                this.ctx.restore(); // Restore state to remove clipping
            } else { // Sensor Meter
                // _drawFill handles its own clipping and state saving/restoring
                this._drawFill();
            }

        } else {
            // --- ALL REGULAR SHAPE DRAWING LOGIC IS NOW INSIDE THIS ELSE BLOCK ---
            if (this.shape === 'fire' || this.shape === 'fire-radial') {
                this.ctx.save();
                this.ctx.beginPath();
                this.ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height);
                this.ctx.clip();
                this.ctx.globalCompositeOperation = 'lighter';
                this.fireParticles.forEach(p => {
                    const lifeRatio = 1.0 - (p.age / p.maxAge);
                    this.ctx.beginPath();
                    const ageOpacity = Math.sin(lifeRatio * Math.PI);
                    if (this.colorOverride && this.flashOpacity > 0) {
                        this.ctx.fillStyle = this.colorOverride;
                        this.ctx.globalAlpha = this.flashOpacity * ageOpacity;
                    } else {
                        const baseColor = parseColorToRgba(p.color);
                        const finalAlpha = baseColor.a * ageOpacity;
                        this.ctx.fillStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${finalAlpha})`;
                        this.ctx.globalAlpha = 1.0;
                    }
                    this.ctx.ellipse(p.x, p.y, p.sizeX * lifeRatio, p.sizeY * lifeRatio, 0, 0, 2 * Math.PI);
                    this.ctx.fill();
                });
                this.ctx.restore();
            } else if (this.shape === 'pixel-art') {
                try {
                    const currentFrame = this.pixelArtFrames[this.currentFrameIndex];
                    if (!currentFrame || !currentFrame.data) return; // Safety check

                    const data = (typeof currentFrame.data === 'string') ? JSON.parse(currentFrame.data) : currentFrame.data;

                    if (!Array.isArray(data) || data.length === 0 || !Array.isArray(data[0])) { return; }
                    const rows = data.length;
                    const cols = data[0].length;
                    if (cols === 0) return;
                    const cellWidth = this.width / cols;
                    const cellHeight = this.height / rows;
                    // Only run the drawing loop if the fill type is NOT "None"
                    for (let r = 0; r < rows; r++) {
                        for (let c = 0; c < cols; c++) {
                            const alphaValue = data[r]?.[c] || 0;
                            if (alphaValue > 0) {
                                let shouldDraw = true;
                                if (alphaValue === 1.0) {
                                    this.ctx.fillStyle = '#FFFFFF';
                                    this.ctx.globalAlpha = 1.0;
                                } else if (alphaValue === 0.3) {
                                    this.ctx.fillStyle = this.gradient.color1 || '#ff0000';
                                    this.ctx.globalAlpha = 1.0;
                                } else if (alphaValue === 0.4) {
                                    this.ctx.fillStyle = this.gradient.color2 || '#00FF00';
                                    this.ctx.globalAlpha = 1.0;
                                } else {
                                    // --- THIS IS THE KEY ---
                                    // Only process the main fill style if the gradType is NOT "None"
                                    if (this.gradType === 'none') {
                                        shouldDraw = false;
                                    } else {
                                        const cellIndex = r * this.numberOfColumns + c;
                                        this.ctx.fillStyle = this._createLocalFillStyle(cellIndex);
                                        this.ctx.globalAlpha = alphaValue;
                                    }
                                }

                                if (shouldDraw) {
                                    this.ctx.fillRect(-this.width / 2 + c * cellWidth, -this.height / 2 + r * cellHeight, cellWidth, cellHeight);
                                }
                            }
                        }
                    }


                    // Reset global alpha after the loop is done to ensure it doesn't affect other shapes
                    this.ctx.globalAlpha = 1.0;
                } catch (e) { console.error("Failed to draw pixel art:", e); }
            } else if (this.shape === 'tetris') {
                this.ctx.save();
                this.ctx.beginPath();
                this.ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height);
                this.ctx.clip();
                this.tetrisBlocks.forEach((block, index) => {
                    this.ctx.fillStyle = this.gradType === 'random' ? this._getRandomColorForElement(index) : this._createLocalFillStyle(index);
                    this.ctx.globalAlpha = block.life;
                    const drawX = block.x - (this.width / 2);
                    const drawY = block.y - (this.height / 2);
                    this.ctx.fillRect(Math.round(drawX), Math.round(drawY), Math.ceil(block.w), Math.ceil(block.h));
                });
                this.ctx.restore();
            } else if (this.shape === 'strimer') {
                this.ctx.beginPath();
                this.ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height);
                this.ctx.clip();

                const colWidth = this.width / this.strimerColumns;

                if (this.strimerAnimation === 'Audio Meter') {
                    for (let i = 0; i < this.strimerColumns; i++) {
                        const fillHeight = this.strimerMeterHeights[i] || 0;
                        const xPos = -this.width / 2 + i * colWidth;
                        const yPos = this.height / 2 - fillHeight;
                        this.ctx.fillStyle = this._createLocalFillStyle(i);
                        this.ctx.fillRect(xPos, yPos, colWidth, fillHeight);
                    }
                } else if (this.strimerAnimation === 'Snake') {
                    const colWidth = this.width / this.strimerColumns;
                    const rowHeight = this.height / this.strimerRows;
                    const totalPath = this.strimerSnakeDirection === 'Horizontal' ? this.strimerRows : this.strimerColumns;
                    const snakeHeadIndex = Math.floor(this.strimerSnakeIndex % totalPath);
                    const snakeHeadProgress = this.strimerSnakeProgress;
                    const headPos = snakeHeadIndex + snakeHeadProgress;
                    const step = this.strimerBlockSize / (this.strimerSnakeDirection === 'Horizontal' ? (this.width - this.strimerBlockSize) : (this.height - this.strimerBlockSize));

                    this.ctx.save();
                    this.ctx.translate(-this.width / 2, -this.height / 2);

                    for (let i = 0; i < this.strimerBlockCount + 1; i++) {
                        let xPos, yPos, segmentPos, index, progress;

                        segmentPos = (headPos - i * step + totalPath) % totalPath;
                        index = Math.floor(segmentPos);
                        progress = segmentPos - index;

                        if (this.strimerSnakeDirection === 'Horizontal') {
                            // Horizontal zig-zag across rows
                            if (index % 2 === 1) {
                                progress = 1 - progress;
                            }
                            const easedProgress = this._applyEasing(progress);
                            xPos = easedProgress * this.width;
                            yPos = index * rowHeight;
                            const blockWidth = this.strimerBlockSize; // Use height as width for horizontal blocks
                            const blockHeight = rowHeight;
                            this.ctx.fillRect(xPos, yPos, blockWidth, blockHeight);
                        } else {
                            // Vertical zig-zag across columns
                            if (index % 2 === 1) {
                                progress = 1 - progress;
                            }
                            const easedProgress = this._applyEasing(progress);
                            xPos = index * colWidth;
                            yPos = easedProgress * this.height;
                            const blockWidth = colWidth;
                            const blockHeight = this.strimerBlockSize;
                            this.ctx.fillRect(xPos, yPos, blockWidth, blockHeight);
                        }

                        const alpha = 1.0 - (i / this.strimerBlockCount) * 0.5;
                        this.ctx.globalAlpha = alpha;

                        this.ctx.fillStyle = this._createLocalFillStyle(i % 2);

                        this.ctx.globalAlpha = 1.0;
                    }

                    this.ctx.restore();
                } else {
                    this.strimerBlocks.forEach((block, index) => {
                        if (block.isGlitched) return;

                        let yPos, blockHeight = this.strimerBlockSize;
                        let alpha = 1.0;

                        // Apply pulse as a modifier if enabled
                        if (this.strimerPulseSpeed > 0) {
                            const phaseOffset = this.strimerPulseSync ? 0 : block.col * (2 * Math.PI / this.strimerColumns);
                            alpha = (Math.sin(this.pulseProgress + phaseOffset) + 1) / 2;
                        }

                        if (this.strimerAnimation === 'Cascade') {
                            const totalSpacing = this.strimerBlockCount * this.strimerBlockSpacing;
                            const totalBlockHeight = this.strimerBlockCount * blockHeight;
                            const totalTravel = this.height + totalSpacing + totalBlockHeight;
                            yPos = -this.height / 2 - totalBlockHeight + block.progress * totalTravel;
                        } else { // Bounce or Loop
                            const easedProgress = this._applyEasing(block.progress);
                            yPos = -this.height / 2 - blockHeight + easedProgress * (this.height + blockHeight);
                        }

                        const xPos = -this.width / 2 + block.col * colWidth;

                        this.ctx.globalAlpha = alpha;
                        this.ctx.fillStyle = this._createLocalFillStyle(block.colorIndex);
                        this.ctx.fillRect(xPos, yPos, colWidth, blockHeight);
                        this.ctx.globalAlpha = 1.0;
                    });
                }
            } else if (this.shape === 'spawner') {
                this.ctx.save();
                this.ctx.beginPath();
                this.ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height);
                this.ctx.clip();

                // Ensure the custom particle path is created if needed
                if (this.spawn_shapeType === 'custom' || this.spawn_shapeType === 'random') {
                    if (!this.customParticlePath && this.spawn_svg_path) {
                        console.log('[DRAW] customParticlePath is null, attempting to create new Path2D.');
                        try {
                            this.customParticlePath = new Path2D(this.spawn_svg_path);
                        } catch (e) {
                            console.error("Invalid custom particle SVG path:", e);
                            this.customParticlePath = null;
                        }
                    }
                }

                this.particles.forEach(p => {
                    let overallAlpha = Math.sin((p.life / p.maxLife) * Math.PI);
                    const isFlashActive = this.enableAudioReactivity && this.audioTarget === 'Flash' && this.flashOpacity > 0;

                    if (isFlashActive) {
                        overallAlpha *= this.flashOpacity;
                    }

                    if (overallAlpha <= 0) return;

                    // --- Draw the Trail (Matrix or Generic) ---
                    const isMatrixTrail = p.actualShape === 'matrix' && p.matrixChars && p.trail && p.trail.length > 0;
                    const isGenericTrail = this.spawn_enableTrail && p.actualShape !== 'matrix' && p.trail && p.trail.length > 0;

                    if (isMatrixTrail || isGenericTrail) {
                        const spacing = (this.spawn_trailSpacing || 1) * p.size;
                        const trailLength = Number(this.spawn_trailLength) || 15;
                        const history = p.trail;

                        if (spacing > 0 && history.length > 1) {
                            let distanceNeededForNextChar = spacing;
                            let distanceTraveledAlongPath = 0;
                            let drawnCharIndex = 0;

                            for (let i = 1; i < history.length; i++) {
                                if (drawnCharIndex >= trailLength) break;

                                const p1 = history[i - 1];
                                const p2 = history[i];
                                const segmentDist = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

                                // Prevent division by zero if particle hasn't moved
                                if (segmentDist < 0.001) continue;

                                while (distanceTraveledAlongPath + segmentDist >= distanceNeededForNextChar) {
                                    const ratio = (distanceNeededForNextChar - distanceTraveledAlongPath) / segmentDist;
                                    if (ratio > 1) break;
                                    const charX = p1.x + (p2.x - p1.x) * ratio;
                                    const charY = p1.y + (p2.y - p1.y) * ratio;

                                    this.ctx.save();
                                    this.ctx.translate(charX - this.width / 2, charY - this.height / 2);
                                    this.ctx.rotate(p1.rotation);

                                    const trailOpacity = Math.max(0.1, 1.0 - (drawnCharIndex / trailLength));
                                    this.ctx.globalAlpha = overallAlpha * trailOpacity;

                                    if (isMatrixTrail) {
                                        this.ctx.fillStyle = isFlashActive ? '#FFFFFF' : ((this.gradType === 'solid') ? this.gradient.color2 : this._createLocalFillStyle(p.id + drawnCharIndex));
                                        this._drawParticleShape({ ...p, size: p.size, matrixChars: [p.matrixChars[drawnCharIndex + 1]] });
                                    } else { // isGenericTrail
                                        // Set fill for the trail based on the "split-color" logic
                                        if (isFlashActive) {
                                            this.ctx.fillStyle = '#FFFFFF';
                                        } else if (this.gradType === 'solid') {
                                            this.ctx.fillStyle = this.gradient.color2; // Trail uses Color 2 for solid fills
                                        } else {
                                            this.ctx.fillStyle = this._createLocalFillStyle(p.id + drawnCharIndex); // Trail uses full effect for gradients
                                        }

                                        if (this.enableStroke) this.ctx.strokeStyle = this.ctx.fillStyle;

                                        // Calculate shrinking size for the trail segment
                                        const sizeRatio = Math.max(0, 1.0 - (drawnCharIndex / trailLength));
                                        const trailSize = p.size * sizeRatio;

                                        this._drawParticleShape({ ...p, size: trailSize });
                                    }

                                    this.ctx.restore();

                                    drawnCharIndex++;
                                    distanceNeededForNextChar += spacing;
                                    if (drawnCharIndex >= trailLength) break;
                                }
                                distanceTraveledAlongPath += segmentDist;
                            }
                        }
                    }

                    // --- Draw the Leader Particle ---
                    this.ctx.save();
                    this.ctx.translate(p.x - this.width / 2, p.y - this.height / 2);
                    this.ctx.rotate(p.rotation);
                    this.ctx.globalAlpha = overallAlpha;

                    // Set leader particle color based on "split-color" logic
                    if (isFlashActive) {
                        this.ctx.fillStyle = '#FFFFFF';
                    } else if (p.actualShape === 'matrix' || this.spawn_enableTrail) {
                        // Matrix leaders and generic leaders (when trail is on) use Color 1
                        this.ctx.fillStyle = this.gradient.color1;
                    } else {
                        // No trail, so the single particle uses the full fill effect
                        this.ctx.fillStyle = this._createLocalFillStyle(p.id);
                    }


                    if (this.enableStroke) {
                        this.ctx.strokeStyle = this.ctx.fillStyle;
                    }

                    this._drawParticleShape(p);
                    this.ctx.restore();
                });
                this.ctx.restore();
            } else if (this.shape === 'text') {
                const textToRender = this.getDisplayText();
                const centeredShape = { ...this, x: -this.width / 2, y: -this.height / 2, };
                this.ctx.fillStyle = this._createLocalFillStyle();
                drawPixelText(this.ctx, centeredShape, textToRender);
            } else if (this.shape === 'audio-visualizer') {
                const barCount = parseInt(this.vizBarCount, 10) || 32;
                const fillStyle = this._createLocalFillStyle();
                this.ctx.fillStyle = fillStyle;
                this.ctx.strokeStyle = fillStyle;

                if (this.vizLayout === 'Circular' || this.vizLayout === 'Circular Polyline') {
                    const scaledSegmentSpacing = (this.vizSegmentSpacing || 0) * (this.height / 152.0);
                    const centerX = 0;
                    const centerY = 0;
                    const outerRadius = Math.min(this.width, this.height) / 2;
                    const innerRadius = outerRadius * ((this.vizInnerRadius || 0) / 100.0);

                    if (this.vizDrawStyle === 'Line' || this.vizDrawStyle === 'Area') {
                        const points = [];
                        for (let i = 0; i < barCount; i++) {
                            const barHeight = this.vizBarHeights[i] || 0;
                            const angle = (i / barCount) * 2 * Math.PI - (Math.PI / 2);
                            const radius = innerRadius + barHeight;
                            points.push({ x: centerX + radius * Math.cos(angle), y: centerY + radius * Math.sin(angle) });
                        }
                        if (points.length < 2) return;

                        this.ctx.beginPath();
                        this.ctx.moveTo(points[0].x, points[0].y);

                        if (this.vizLayout === 'Circular Polyline') {
                            // Use Catmull-Rom spline for a closed loop
                            const allPoints = [points[points.length - 1], ...points, points[0], points[1]];
                            for (let i = 0; i < points.length; i++) {
                                const p0 = allPoints[i];
                                const p1 = allPoints[i + 1];
                                const p2 = allPoints[i + 2];
                                const p3 = allPoints[i + 3];
                                for (let t_step = 1; t_step <= 10; t_step++) {
                                    const t = t_step / 10;
                                    const point = this._getPointOnCatmullRomSpline(p0, p1, p2, p3, t);
                                    this.ctx.lineTo(point.x, point.y);
                                }
                            }
                        } else { // 'Circular' layout uses straight lines
                            for (let i = 1; i < points.length; i++) this.ctx.lineTo(points[i].x, points[i].y);
                        }
                        this.ctx.closePath();

                        if (this.vizDrawStyle === 'Area') {
                            this.ctx.fill();
                        } else {
                            this.ctx.lineWidth = this.vizLineWidth;
                            this.ctx.stroke();
                        }
                    } else { // Bars
                        if (this.vizUseSegments) {
                            const segmentCount = this.vizSegmentCount || 16;
                            const scaledSegmentSpacing = (this.vizSegmentSpacing || 0) * (this.height / 152.0);
                            const availableBarSpace = outerRadius - innerRadius;
                            const totalSpacing = (segmentCount - 1) * scaledSegmentSpacing;
                            const segmentLength = (availableBarSpace - totalSpacing) / segmentCount;
                            if (segmentLength > 0) {
                                const angleStep = (2 * Math.PI) / barCount;
                                const barAngularWidth = barCount === 1 ? angleStep : angleStep * (1 - ((this.vizBarSpacing || 0) / 100.0));
                                for (let i = 0; i < barCount; i++) {
                                    const barLength = this.vizBarHeights[i] || 0;
                                    if (barLength <= 0) continue;
                                    const litSegments = Math.floor((barLength + scaledSegmentSpacing) / (segmentLength + scaledSegmentSpacing));
                                    const baseAngle = this.rotation * (Math.PI / 180);
                                    const startAngle = baseAngle + (i * angleStep) - (Math.PI / 2);
                                    const endAngle = startAngle + barAngularWidth;
                                    for (let j = 0; j < litSegments; j++) {
                                        const segmentStartRadius = innerRadius + j * (segmentLength + scaledSegmentSpacing);
                                        const segmentEndRadius = segmentStartRadius + segmentLength;
                                        this.ctx.beginPath();
                                        this.ctx.arc(centerX, centerY, segmentEndRadius, startAngle, endAngle);
                                        this.ctx.arc(centerX, centerY, segmentStartRadius, endAngle, startAngle, true);
                                        this.ctx.closePath();
                                        if (this.gradType === 'alternating' || this.gradType === 'random') {
                                            this.ctx.fillStyle = this._createLocalFillStyle(j);
                                        }
                                        this.ctx.fill();
                                    }
                                }
                            }
                        } else {
                            const angleStep = (2 * Math.PI) / barCount;
                            const barAngularWidth = barCount === 1 ? angleStep : angleStep * (1 - ((this.vizBarSpacing || 0) / 100.0));
                            for (let i = 0; i < barCount; i++) {
                                const barLength = this.vizBarHeights[i] || 0;
                                if (barLength <= 0) continue;
                                const startRadius = innerRadius; const endRadius = innerRadius + barLength;
                                const baseAngle = this.rotation * (Math.PI / 180);
                                const startAngle = baseAngle + (i * angleStep) - (Math.PI / 2);
                                const endAngle = startAngle + barAngularWidth;
                                this.ctx.beginPath();
                                this.ctx.arc(centerX, centerY, endRadius, startAngle, endAngle);
                                this.ctx.arc(centerX, centerY, startRadius, endAngle, startAngle, true);
                                this.ctx.closePath();
                                this.ctx.fill();
                            }
                        }
                    }
                } else { // Linear or Polyline Layout
                    const scaledBarSpacingInput = (this.vizBarSpacing || 0) * (this.width / 200.0);
                    const maxBarSpacing = barCount > 1 ? this.width / (2 * barCount - 1) : 0;
                    const barSpacing = Math.min(scaledBarSpacingInput, maxBarSpacing);
                    const totalSpacing = (barCount - 1) * barSpacing;
                    const barWidth = barCount > 0 ? (this.width - totalSpacing) / barCount : 0;

                    if (this.vizDrawStyle === 'Line' || this.vizDrawStyle === 'Area') {
                        const halfW = this.width / 2;
                        const halfH = this.height / 2;
                        const points = [];

                        for (let i = 0; i < barCount; i++) {
                            const barHeight = this.vizBarHeights[i] || 0;
                            const x = -halfW + i * (barWidth + barSpacing) + barWidth / 2;
                            const y = halfH - barHeight;
                            points.push({ x, y });
                        }
                        if (points.length < 2) return;

                        this.ctx.beginPath();
                        if (this.vizDrawStyle === 'Area') {
                            this.ctx.moveTo(-halfW, halfH);
                            this.ctx.lineTo(points[0].x, points[0].y);
                        } else {
                            this.ctx.moveTo(points[0].x, points[0].y);
                        }

                        if (this.vizLayout === 'Polyline') {
                            // Use Catmull-Rom spline for an open path
                            const allPoints = [points[0], ...points, points[points.length - 1]];
                            for (let i = 0; i < points.length - 1; i++) {
                                const p0 = allPoints[i];
                                const p1 = allPoints[i + 1];
                                const p2 = allPoints[i + 2];
                                const p3 = allPoints[i + 3];
                                for (let t_step = 1; t_step <= 10; t_step++) {
                                    const t = t_step / 10;
                                    const point = this._getPointOnCatmullRomSpline(p0, p1, p2, p3, t);
                                    this.ctx.lineTo(point.x, point.y);
                                }
                            }
                        } else { // 'Linear' layout uses straight lines
                            for (let i = 1; i < points.length; i++) this.ctx.lineTo(points[i].x, points[i].y);
                        }

                        if (this.vizDrawStyle === 'Area') {
                            this.ctx.lineTo(halfW, halfH);
                            this.ctx.closePath();
                            this.ctx.fill();
                        } else {
                            this.ctx.lineWidth = this.vizLineWidth;
                            this.ctx.stroke();
                        }

                    } else { // Bars
                        for (let i = 0; i < barCount; i++) {
                            const barHeight = this.vizBarHeights[i] || 0;
                            if (barHeight < 1) continue;
                            const x = -this.width / 2 + i * (barWidth + barSpacing);
                            if (this.vizUseSegments) {
                                const segmentCount = this.vizSegmentCount || 16;
                                const scaledSegmentSpacing = (this.vizSegmentSpacing || 0) * (this.height / 152.0);
                                const totalSegSpacing = (segmentCount - 1) * scaledSegmentSpacing;
                                const segmentHeight = (this.height - totalSegSpacing) / segmentCount;
                                if (segmentHeight > 0) {
                                    const litSegments = Math.floor((barHeight + scaledSegmentSpacing) / (segmentHeight + scaledSegmentSpacing));
                                    for (let j = 0; j < litSegments; j++) {
                                        let y;
                                        const segYPos = j * (segmentHeight + scaledSegmentSpacing);
                                        if (this.gradType === 'alternating' || this.gradType === 'random') {
                                            this.ctx.fillStyle = this._createLocalFillStyle(j);
                                        }
                                        switch (this.vizStyle) {
                                            case 'top': y = -this.height / 2 + segYPos; break;
                                            case 'center':
                                                const totalPossibleHeight = segmentCount * (segmentHeight + scaledSegmentSpacing) - scaledSegmentSpacing;
                                                y = -totalPossibleHeight / 2 + j * (segmentHeight + scaledSegmentSpacing);
                                                break;
                                            default: y = this.height / 2 - segmentHeight - segYPos; break;
                                        }
                                        this.ctx.fillRect(x, y, barWidth, segmentHeight);
                                    }
                                }
                            } else {
                                let y;
                                switch (this.vizStyle) {
                                    case 'top': y = -this.height / 2; break;
                                    case 'center': y = -barHeight / 2; break;
                                    default: y = this.height / 2 - barHeight; break;
                                }
                                this.ctx.fillRect(x, y, barWidth, barHeight);
                            }
                        }
                    }
                }
            } else if (this.shape === 'oscilloscope') {
                const activeWavePhase = this.enableWaveAnimation ? this.wavePhaseAngle : 0;
                if (this.oscDisplayMode === 'radial') {
                    this.ctx.lineWidth = this.vizLineWidth;
                    this.ctx.strokeStyle = this._createLocalFillStyle();
                    const totalRadius = (Math.min(this.width, this.height) / 2) - (this.ctx.lineWidth / 2);
                    if (totalRadius > 0) {
                        this.ctx.beginPath();
                        const baseRadius = totalRadius * (0.5 + (this.pulseDepth || 0) / 100.0 * 0.5);
                        const maxAmplitude = totalRadius - baseRadius;
                        for (let i = 0; i <= 360; i++) {
                            const angleRad = (i * Math.PI) / 180;
                            const waveFuncAngle = 2 * Math.PI * this.frequency * (i / 360) + activeWavePhase * 2;
                            let y_wave;
                            switch (this.waveType) {
                                case 'square': y_wave = Math.sin(waveFuncAngle) >= 0 ? 1 : -1; break;
                                case 'sawtooth': y_wave = (((waveFuncAngle / (2 * Math.PI)) % 1) * 2) - 1; break;
                                case 'triangle': y_wave = Math.asin(Math.sin(waveFuncAngle)) * (2 / Math.PI); break;
                                case 'earthquake': y_wave = Math.sin(waveFuncAngle * 0.8) * 0.5 + Math.sin(waveFuncAngle * 2.2) * 0.3 + Math.sin(waveFuncAngle * 5.0) * 0.2; break;
                                default: y_wave = Math.sin(waveFuncAngle); break;
                            }
                            const finalRadius = baseRadius + y_wave * maxAmplitude;
                            if (i === 0) this.ctx.moveTo(finalRadius * Math.cos(angleRad), finalRadius * Math.sin(angleRad));
                            else this.ctx.lineTo(finalRadius * Math.cos(angleRad), finalRadius * Math.sin(angleRad));
                        }
                        this.ctx.closePath();
                        this.ctx.stroke();
                    }
                } else if (this.oscDisplayMode === 'seismic') {
                    this.ctx.lineWidth = this.lineWidth;
                    const maxRadius = Math.min(this.width, this.height) / 2;
                    const waveCount = Math.max(1, this.waveCount);
                    const spacing = maxRadius / waveCount;
                    const totalCycle = maxRadius + spacing;
                    const progress = ((activeWavePhase * 10) % totalCycle + totalCycle) % totalCycle;
                    for (let i = waveCount - 1; i >= 0; i--) {
                        let radius = (progress + i * spacing) % totalCycle;
                        if (radius > maxRadius) continue;
                        let alpha = 1.0 - (radius / maxRadius);
                        const fadeInLimit = spacing;
                        if (radius < fadeInLimit) alpha *= (radius / fadeInLimit);
                        if (alpha <= 0) continue;
                        this.ctx.globalAlpha = alpha;
                        this.ctx.beginPath();
                        if (this.waveStyle === 'wavy') {
                            const points = Math.max(60, this.frequency * 20);
                            const maxAmplitude = (this.pulseDepth / 100) * 20;
                            const amplitude = maxAmplitude * (radius / maxRadius);
                            const rotationalPhase = (activeWavePhase / 10.0) - (i * (this.phaseOffset / this.frequency) * (Math.PI / 2));
                            for (let j = 0; j <= points; j++) {
                                const angle = (j / points) * 2 * Math.PI;
                                const freqAngle = angle * this.frequency;
                                let y_wave;
                                switch (this.waveType) {
                                    case 'square': y_wave = Math.sin(freqAngle) >= 0 ? 1 : -1; break;
                                    case 'sawtooth': y_wave = (((freqAngle / (2 * Math.PI)) % 1) * 2) - 1; break;
                                    case 'triangle': y_wave = Math.asin(Math.sin(freqAngle)) * (2 / Math.PI); break;
                                    case 'earthquake': y_wave = Math.sin(freqAngle * 0.8) * 0.5 + Math.sin(freqAngle * 2.2) * 0.3 + Math.sin(freqAngle * 5.0) * 0.2; break;
                                    default: y_wave = Math.sin(freqAngle); break;
                                }
                                const r = radius + y_wave * amplitude;
                                const finalAngle = angle + rotationalPhase;
                                this.ctx[j === 0 ? 'moveTo' : 'lineTo'](Math.cos(finalAngle) * r, Math.sin(finalAngle) * r);
                            }
                        } else { this.ctx.arc(0, 0, radius, 0, 2 * Math.PI); }
                        this.ctx.closePath();
                        const style = this._createLocalFillStyle(i);
                        this.ctx.strokeStyle = style;
                        this.ctx.fillStyle = style;
                        if (this.fillShape) { this.ctx.fill(); } else { this.ctx.stroke(); }
                    }
                } else {
                    const halfW = this.width / 2;
                    const halfH = this.height / 2;
                    const activeLineWidth = this.lineWidth;
                    const amplitude = Math.max(1, (this.height - activeLineWidth) / 2);
                    this.ctx.beginPath();
                    for (let i = 0; i <= this.width; i++) {
                        const progress = i / this.width;
                        const angle = 2 * Math.PI * this.frequency * progress + activeWavePhase;
                        let y_wave;
                        switch (this.waveType) {
                            case 'square': y_wave = Math.sin(angle) >= 0 ? 1 : -1; break;
                            case 'sawtooth': y_wave = (((angle / (Math.PI * 2)) % 1) * 2) - 1; break;
                            case 'triangle': y_wave = Math.asin(Math.sin(angle)) * (2 / Math.PI); break;
                            case 'earthquake': y_wave = Math.sin(angle * 0.8) * 0.5 + Math.sin(angle * 2.2) * 0.3 + Math.sin(angle * 5.0) * 0.2; break;
                            default: y_wave = Math.sin(angle); break;
                        }
                        const px = -halfW + i;
                        const py = -y_wave * amplitude;
                        if (i === 0) this.ctx.moveTo(px, py); else this.ctx.lineTo(px, py);
                    }
                    if (this.fillShape) {
                        this.ctx.save();
                        this.ctx.lineTo(halfW, halfH);
                        this.ctx.lineTo(-halfW, halfH);
                        this.ctx.closePath();
                        this.ctx.fillStyle = this._createLocalFillStyle();
                        this.ctx.fill();
                        this.ctx.restore();
                    }
                    this.ctx.strokeStyle = this._createLocalFillStyle();
                    this.ctx.lineWidth = this.lineWidth;
                    if (this.ctx.lineWidth <= 0 || !isFinite(this.ctx.lineWidth)) { this.ctx.lineWidth = 1; }
                    this.ctx.stroke();
                }
            } else if (this.shape === 'ring') {
                const oR = this.width / 2;
                const iR = this.innerDiameter / 2;
                if (iR >= 0 && iR < oR && this.numberOfSegments > 0) {
                    const aStep = (2 * Math.PI) / this.numberOfSegments;
                    const segAngle = (this.angularWidth * Math.PI) / 180;
                    for (let i = 0; i < this.numberOfSegments; i++) {
                        this.ctx.beginPath();
                        const startAngle = i * aStep + this.animationAngle;
                        const endAngle = startAngle + segAngle;
                        this.ctx.moveTo(Math.cos(startAngle) * oR, Math.sin(startAngle) * oR);
                        this.ctx.arc(0, 0, oR, startAngle, endAngle, false);
                        this.ctx.lineTo(Math.cos(endAngle) * iR, Math.sin(endAngle) * iR);
                        this.ctx.arc(0, 0, iR, endAngle, startAngle, true);
                        this.ctx.closePath();
                        this._drawFill(i);
                        applyStrokeInside();
                    }
                }
            } else if (this.shape === 'rectangle' && (this.numberOfRows > 1 || this.numberOfColumns > 1)) {
                const cellW = this.width / this.numberOfColumns;
                const cellH = this.height / this.numberOfRows;
                for (let row = 0; row < this.numberOfRows; row++) {
                    for (let col = 0; col < this.numberOfColumns; col++) {
                        const cellIndex = row * this.numberOfColumns + col;
                        this.ctx.beginPath();
                        this.ctx.rect(-this.width / 2 + col * cellW, -this.height / 2 + row * cellH, cellW, cellH);
                        this._drawFill(cellIndex);
                        applyStrokeInside();
                    }
                }
            } else if (this.shape === 'polyline') {
                let nodes;
                try {
                    nodes = (typeof this.polylineNodes === 'string') ? JSON.parse(this.polylineNodes) : this.polylineNodes;
                } catch (e) { nodes = []; }

                const hasValidNodes = Array.isArray(nodes) && nodes.length >= 2;

                // --- 1. Build the Complete Path Geometry ---
                // We build the path once, then decide whether to fill or stroke it.
                if (hasValidNodes) {
                    this.ctx.beginPath();
                    const offsetX = -this.width / 2;
                    const offsetY = -this.height / 2;
                    this.ctx.moveTo(nodes[0].x + offsetX, nodes[0].y + offsetY);

                    if (this.polylineCurveStyle === 'loose-curve' && nodes.length > 2) {
                        for (let i = 1; i < nodes.length - 1; i++) {
                            const xc = (nodes[i].x + nodes[i + 1].x) / 2 + offsetX;
                            const yc = (nodes[i].y + nodes[i + 1].y) / 2 + offsetY;
                            this.ctx.quadraticCurveTo(nodes[i].x + offsetX, nodes[i].y + offsetY, xc, yc);
                        }
                        this.ctx.lineTo(nodes[nodes.length - 1].x + offsetX, nodes[nodes.length - 1].y + offsetY);
                    } else if (this.polylineCurveStyle === 'tight-curve') {
                        const curveDetail = 30;
                        for (let i = 0; i < nodes.length - 1; i++) {
                            const p0 = nodes[i === 0 ? i : i - 1];
                            const p1 = nodes[i];
                            const p2 = nodes[i + 1];
                            const p3 = nodes[i === nodes.length - 2 ? i + 1 : i + 2];
                            for (let j = 1; j <= curveDetail; j++) {
                                const t = j / curveDetail;
                                const point = this._getPointOnCatmullRomSpline(p0, p1, p2, p3, t);
                                this.ctx.lineTo(point.x + offsetX, point.y + offsetY);
                            }
                        }
                    } else { // Straight
                        for (let i = 1; i < nodes.length; i++) {
                            this.ctx.lineTo(nodes[i].x + offsetX, nodes[i].y + offsetY);
                        }
                    }
                }

                // --- 2. Fill the Shape (if enabled) ---
                if (hasValidNodes && this.fillShape) {
                    this.ctx.closePath(); // Close the path to form a polygon
                    this._drawFill();     // Use the standard fill logic
                }

                // --- 3. Stroke the Shape (if enabled) ---
                if (hasValidNodes && this.enableStroke) {
                    if (this.enableAudioReactivity && this.audioTarget === 'Flash' && this.flashOpacity > 0) {
                        this.ctx.globalAlpha = this.flashOpacity;
                    }
                    this.ctx.setLineDash([]);
                    this.ctx.lineWidth = this.strokeWidth;
                    this.ctx.lineCap = 'round';
                    this.ctx.lineJoin = 'round';

                    if (this.strokeScrollDir === 'along-path' || this.strokeScrollDir === 'along-path-reversed') {
                        // This special mode draws the stroke segment-by-segment with different colors.
                        const { totalLength } = this._calculatePathSegments();
                        if (totalLength > 0) {
                            const direction = this.strokeScrollDir === 'along-path-reversed' ? -1 : 1;
                            const animOffset = this.strokeScrollOffset;
                            const step = 2;

                            for (let d = 0; d < totalLength; d += step) {
                                const currentPoint = this._getPointAndAngleAtDistance(d);
                                const nextPoint = this._getPointAndAngleAtDistance(Math.min(d + step, totalLength));
                                const progress = (d + step / 2) / totalLength;
                                const time = progress + (animOffset * direction);
                                const color = this._getGradientColorAt(time, this.strokeGradient.stops);

                                this.ctx.strokeStyle = color;
                                this.ctx.beginPath(); // Each segment is its own path
                                this.ctx.moveTo(currentPoint.x, currentPoint.y);
                                this.ctx.lineTo(nextPoint.x, nextPoint.y);
                                this.ctx.stroke();
                            }
                        }
                    } else {
                        // For all other stroke types, just stroke the path we already built.
                        this.ctx.strokeStyle = this._createLocalStrokeStyle();
                        this.ctx.stroke();
                    }
                } else if (hasValidNodes && typeof engine == 'undefined') {
                    // Draw placeholder if stroke is disabled in the editor
                    this.ctx.save();
                    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
                    this.ctx.lineWidth = 2;
                    this.ctx.setLineDash([4, 4]);
                    this.ctx.stroke(); // Stroke the path we built in step 1
                    this.ctx.restore();
                }

                // --- 4. Draw Path Animation (if enabled) ---
                if (this.pathAnim_enable) {
                    const { totalLength } = this._calculatePathSegments();
                    if (totalLength <= 0) return;

                    const baseSize = this.pathAnim_size || 40;
                    const objectCount = Math.max(1, this.pathAnim_objectCount || 1);
                    const spacing = this.pathAnim_objectSpacing || 100;
                    const trailLength = this.pathAnim_trailLength || 80;

                    for (let i = 0; i < objectCount; i++) {
                        const objectDistance = this.pathAnim_distance - (i * spacing);

                        // Draw trail
                        if (this.pathAnim_trail !== 'None' && trailLength > 0) {
                            const trailSegmentCount = 30;
                            for (let j = 1; j <= trailSegmentCount; j++) {
                                const progress = j / trailSegmentCount;
                                const trailDist = objectDistance - (progress * trailLength * this.pathAnim_direction);
                                if (trailDist < 0 || trailDist > totalLength) continue;

                                const { x, y, angle } = this._getPointAndAngleAtDistance(trailDist);
                                const trailSize = baseSize * (1 - progress);
                                if (trailSize < 1) continue;

                                this.ctx.save();
                                this.ctx.translate(x, y);
                                this.ctx.rotate(angle);
                                let trailFillStyle;
                                if (this.pathAnim_colorOverride) {
                                    trailFillStyle = this.pathAnim_colorOverride;
                                } else if (this.pathAnim_trailColor === 'Rainbow') {
                                    const hue = (progress * 360) % 360;
                                    trailFillStyle = `hsl(${hue}, 100%, 50%)`;
                                } else {
                                    trailFillStyle = this._createFillStyleForSubObject(trailSize);
                                }
                                this.ctx.fillStyle = trailFillStyle;
                                if (this.pathAnim_trail === 'Fade') {
                                    this.ctx.globalAlpha = (1 - progress) * 0.7;
                                }
                                this._drawSubObject(this.pathAnim_shape, trailSize);
                                this.ctx.restore();
                            }
                        }

                        // Draw main object
                        if (objectDistance >= 0 && objectDistance <= totalLength) {
                            const { x, y, angle } = this._getPointAndAngleAtDistance(objectDistance);
                            this.ctx.save();
                            this.ctx.translate(x, y);
                            this.ctx.rotate(angle + this.pathAnim_extraRotation);
                            if (this.pathAnim_flashOpacity > 0) { this.ctx.globalAlpha = this.pathAnim_flashOpacity; }
                            this.ctx.scale(this.pathAnim_internalScale, this.pathAnim_internalScale);
                            this.ctx.fillStyle = this.pathAnim_colorOverride || this._createFillStyleForSubObject(baseSize);
                            this._drawSubObject(this.pathAnim_shape, baseSize);
                            this.ctx.restore();
                        }
                    }
                }
            } else {
                if (this.enableAudioReactivity && this.audioTarget === 'Flash' && this.flashOpacity > 0) {
                    this.ctx.globalAlpha = this.flashOpacity;
                }
                this.ctx.beginPath();
                if (this.shape === 'circle') {
                    this.ctx.ellipse(0, 0, this.width / 2, this.height / 2, 0, 0, 2 * Math.PI);
                } else if (this.shape === 'polygon') {
                    const rX = this.width / 2;
                    const rY = this.height / 2;
                    const sides = Math.max(3, this.sides);
                    for (let i = 0; i < sides; i++) {
                        const a = (i / sides) * 2 * Math.PI - (Math.PI / 2);
                        this.ctx[i === 0 ? 'moveTo' : 'lineTo'](rX * Math.cos(a), rY * Math.sin(a));
                    }
                    this.ctx.closePath();
                } else if (this.shape === 'star') {
                    const oRX = this.width / 2;
                    const oRY = this.height / 2;
                    const iRX = oRX * (this.starInnerRadius / 100);
                    const iRY = oRY * (this.starInnerRadius / 100);
                    const points = Math.max(3, this.points);
                    for (let i = 0; i < 2 * points; i++) {
                        const rX = (i % 2 === 0) ? oRX : iRX;
                        const rY = (i % 2 === 0) ? oRY : iRY;
                        const a = (i / (2 * points)) * 2 * Math.PI - (Math.PI / 2);
                        this.ctx[i === 0 ? 'moveTo' : 'lineTo'](rX * Math.cos(a), rY * Math.sin(a));
                    }
                    this.ctx.closePath();
                } else {
                    this.ctx.rect(-this.width / 2, -this.height / 2, this.width, this.height);
                }
                this._drawFill();
                applyStrokeInside();
            }
        }

        this.ctx.restore();
    }

    drawSelectionUI() {
        const selectionColor = this.locked ? 'orange' : '#00f6ff';
        const center = this.getCenter();
        const staticAngle = this.rotation * Math.PI / 180;

        this.ctx.save();
        this.ctx.translate(center.x, center.y);
        this.ctx.rotate(staticAngle);

        const halfW = this.width / 2;
        const halfH = this.height / 2;

        this.ctx.strokeStyle = selectionColor;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([6, 4]);
        this.ctx.strokeRect(-halfW, -halfH, this.width, this.height);
        this.ctx.setLineDash([]);

        if (this.shape === 'polyline') {
            let nodes;
            try {
                nodes = (typeof this.polylineNodes === 'string') ? JSON.parse(this.polylineNodes) : this.polylineNodes;
            } catch (e) { return; }

            if (Array.isArray(nodes)) {
                const offsetX = -this.width / 2;
                const offsetY = -this.height / 2;
                const handleSize = 8;
                this.ctx.fillStyle = selectionColor;

                nodes.forEach(node => {
                    this.ctx.fillRect(
                        node.x + offsetX - handleSize / 2,
                        node.y + offsetY - handleSize / 2,
                        handleSize,
                        handleSize
                    );
                });
            }
        }

        if (!this.locked) {
            this.ctx.fillStyle = selectionColor;
            const h2 = this.handleSize / 2;
            const handlePositions = [
                { x: -halfW, y: -halfH }, { x: 0, y: -halfH }, { x: halfW, y: -halfH },
                { x: -halfW, y: 0 }, { x: halfW, y: 0 },
                { x: -halfW, y: halfH }, { x: 0, y: halfH }, { x: halfW, y: halfH }
            ];
            handlePositions.forEach(pos => {
                this.ctx.fillRect(pos.x - h2, pos.y - h2, this.handleSize, this.handleSize);
            });

            const rotHandlePos = this.getRotationHandlePosition();
            const connectionY = (rotHandlePos.y > 0) ? halfH : -halfH;

            this.ctx.beginPath();
            this.ctx.moveTo(0, connectionY);
            this.ctx.lineTo(rotHandlePos.x, rotHandlePos.y);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.arc(rotHandlePos.x, rotHandlePos.y, this.rotationHandleRadius, 0, 2 * Math.PI);
            this.ctx.fill();
        }

        this.ctx.restore();

        if (this.locked) {
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';

            // SVG path data for Bootstrap's 'lock-fill' icon.
            const lockPathData = "M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z";
            const lockIconPath = new Path2D(lockPathData);

            // The original icon is on a 16x16 grid. We'll scale it to 30px.
            const iconSize = 30;
            const scale = iconSize / 16;

            // Translate to the center of the shape, then adjust for the icon's own center.
            this.ctx.translate(center.x - (iconSize / 2), center.y - (iconSize / 2));
            this.ctx.scale(scale, scale);

            // Fill the path to draw the icon.
            this.ctx.fill(lockIconPath);

            this.ctx.restore();
        }
    }
}