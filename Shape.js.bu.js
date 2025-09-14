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
                dy += Math.sin(waveAngle + i * 0.5) * (pixelSize * 2);
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
// Replace the entire lerpColor function with this:
function lerpColor(a, b, amount) {
    const amt = (typeof amount === 'number' && isFinite(amount)) ? Math.max(0, Math.min(1, amount)) : 0;

    const c1 = parseColorToRgba(a);
    const c2 = parseColorToRgba(b);

    const r = Math.round(c1.r + amt * (c2.r - c1.r));
    const g = Math.round(c1.g + amt * (c2.g - c1.g));
    const b_val = Math.round(c1.b + amt * (c2.b - c1.b)); // Use 'b_val' to avoid conflict
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
    constructor({ id, name, shape, x, y, width, height, rotation, gradient, gradType, scrollDirection, cycleColors, cycleSpeed, animationSpeed, ctx, innerDiameter, angularWidth, numberOfSegments, rotationSpeed, useSharpGradient, gradientStop, locked, numberOfRows, numberOfColumns, phaseOffset, animationMode, text, fontSize, textAlign, pixelFont, textAnimation, textAnimationSpeed, showTime, showDate, lineWidth, waveType, frequency, oscDisplayMode, pulseDepth, fillShape, enableWaveAnimation, waveStyle, waveCount, tetrisBlockCount, tetrisAnimation, tetrisSpeed, tetrisBounce, sides, points, starInnerRadius, isClosed, polylinePoints, enableStroke, strokeWidth, strokeGradType, strokeGradient, strokeScrollDir, strokeCycleColors, strokeAnimationSpeed, fireSpread, pixelArtData, enableAudioReactivity, audioTarget, audioMetric, audioSensitivity, audioSmoothing = 50, beatThreshold, vizBarCount, vizBarSpacing, vizSmoothing, vizStyle, vizLayout, vizDrawStyle, vizUseSegments, vizSegmentCount, vizSegmentSpacing, vizLineWidth, enableSensorReactivity, sensorTarget, sensorValueSource, userSensor, sensorMeterFill, timePlotLineThickness, timePlotFillArea = false, gradientSpeedMultiplier, shapeAnimationSpeedMultiplier, seismicAnimationSpeedMultiplier }) {
        // --- Polyline properties ---
        this.polylinePoints = polylinePoints || [{ x: -50, y: -25 }, { x: 50, y: -25 }, { x: 0, y: 50 }];
        this.isClosed = isClosed !== undefined ? isClosed : false;
        this.nodeHandleRadius = 6;

        // --- ALL other properties are assigned here ---
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
        this.gradient = gradient ? { ...gradient } : { color1: '#000000', color2: '#000000' };
        this.scrollDirection = scrollDirection || 'right';
        this.cycleColors = cycleColors || false;
        this.cycleSpeed = cycleSpeed || 0;
        this.animationSpeed = animationSpeed || 0;
        this.animationMode = animationMode || 'loop';
        this.ctx = ctx;
        this.hue1 = 0;
        this.hue2 = 90;
        this.scrollOffset = 0;

        this.enableStroke = enableStroke !== undefined ? enableStroke : (this.shape === 'polyline');
        this.strokeWidth = strokeWidth || 2;
        this.strokeGradType = strokeGradType || 'solid';
        this.strokeGradient = strokeGradient ? { ...strokeGradient } : { color1: '#FFFFFF', color2: '#000000' };
        this.strokeScrollDir = strokeScrollDir || 'right';
        this.strokeCycleColors = strokeCycleColors || false;
        this.strokeAnimationSpeed = strokeAnimationSpeed || 0;
        this.strokeCycleSpeed = (strokeAnimationSpeed || 0) / 10;
        this.strokeHue1 = 0;
        this.strokeHue2 = 90;
        this.strokeScrollOffset = 0;

        this.isReversing = false;
        this.animationState = 'scrolling';
        this.waitTimer = 0;
        this.innerDiameter = innerDiameter || 100;
        this.angularWidth = angularWidth || 20;
        this.numberOfSegments = numberOfSegments || 12;
        this.rotationSpeed = rotationSpeed || 0;
        this.rotationAngle = 0;
        this.animationAngle = 0;
        this.wavePhaseAngle = 0;
        this.useSharpGradient = useSharpGradient !== undefined ? useSharpGradient : false;
        this.gradientStop = gradientStop !== undefined ? parseFloat(gradientStop) : 50;
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
        this.visibleCharCount = 0;
        this.waveAngle = 0;
        this.typewriterWaitTimer = 0;
        this.showTime = showTime || false;
        this.showDate = showDate || false;
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
        this.tetrisSpeedDivisor = 10.0;
        this.tetrisBlocks = [];
        this.tetrisSpawnTimer = 0;
        this.tetrisStackHeight = 0;
        this.tetrisActiveBlockIndex = 0;
        this.tetrisFadeState = 'in';
        this.sides = sides || 6;
        this.points = points || 5; // This is for the Star shape
        this.starInnerRadius = starInnerRadius || 50;
        this.fireParticles = [];
        this.fireSpread = fireSpread || 100;
        this.particleSpawnCounter = 0;
        this.nextParticleId = 0;
        this.pixelArtData = pixelArtData || '[[1]]';
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
        this.vizBarCount = vizBarCount || 32;
        this.vizBarSpacing = vizBarSpacing || 2;
        this.vizSmoothing = vizSmoothing || 60;
        this.vizStyle = vizStyle || 'bottom';
        this.vizBarHeights = new Array(parseInt(this.vizBarCount, 10)).fill(0);
        this.vizLayout = vizLayout || 'Linear';
        this.vizDrawStyle = vizDrawStyle || 'Bars';
        this.vizUseSegments = vizUseSegments || false;
        this.vizSegmentCount = vizSegmentCount || 16;
        this.vizSegmentSpacing = vizSegmentSpacing || 1;
        this.vizLineWidth = vizLineWidth || 8;
        this.enableSensorReactivity = enableSensorReactivity || false;
        this.sensorTarget = sensorTarget || 'Size';
        this.sensorValueSource = sensorValueSource || 'value';
        this.userSensor = userSensor || 'CPU Load';
        this.sensorMeterFill = sensorMeterFill || 0;
        this.timePlotLineThickness = timePlotLineThickness || 1;
        this.timePlotFillArea = timePlotFillArea;
        this.baseWidth = this.width;
        this.baseHeight = this.height;
        this.baseRotation = this.rotation;
        this.baseAnimationSpeed = this.animationSpeed;
        this.baseStrokeWidth = this.strokeWidth;
        this.baseGradient = { ...this.gradient };
        this.baseGradientStop = this.gradientStop;
        this.baseStarInnerRadius = this.starInnerRadius;
        this.baseInnerDiameter = this.innerDiameter;
        this.basePulseDepth = this.pulseDepth;
        this.sensorHistory = [];
        this.gradientSpeedMultiplier = gradientSpeedMultiplier || (1 / 400);
        this.shapeAnimationSpeedMultiplier = shapeAnimationSpeedMultiplier || 0.05;
        this.seismicAnimationSpeedMultiplier = seismicAnimationSpeedMultiplier || 0.015;
    }

    _updatePolylineBounds() {
        if (!this.polylinePoints || this.polylinePoints.length === 0) {
            this.width = 0;
            this.height = 0;
            return;
        }
        const minX = Math.min(...this.polylinePoints.map(p => p.x));
        const maxX = Math.max(...this.polylinePoints.map(p => p.x));
        const minY = Math.min(...this.polylinePoints.map(p => p.y));
        const maxY = Math.max(...this.polylinePoints.map(p => p.y));
        this.width = maxX - minX;
        this.height = maxY - minY;
    }

    // Replace the entire _updateBoundsFromPoints method with this version:
    _updateBoundsFromPoints() {
        if (!this.polylinePoints || this.polylinePoints.length === 0) {
            this.width = 0;
            this.height = 0;
            return;
        }

        const minX = Math.min(...this.polylinePoints.map(p => p.x));
        const maxX = Math.max(...this.polylinePoints.map(p => p.x));
        const minY = Math.min(...this.polylinePoints.map(p => p.y));
        const maxY = Math.max(...this.polylinePoints.map(p => p.y));

        // Only update the width and height based on the points' extents.
        // Do not move the origin (x, y) or modify the points themselves.
        this.width = maxX - minX;
        this.height = maxY - minY;
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
        const min = sensor.min;
        const max = sensor.max;

        let normalizedValue = (rawValue - min) / (max - min);
        normalizedValue = Math.min(1.0, Math.max(0, normalizedValue));

        if (this.sensorTarget === 'Sensor Meter') {
            this.sensorMeterFill = normalizedValue;
        } else if (this.sensorTarget === 'Time Plot') {
            this.sensorHistory.push(normalizedValue);
            if (this.sensorHistory.length > this.width) {
                this.sensorHistory.shift();
            }
        }
    }

    _drawTimePlot() {
        if (this.sensorHistory.length === 0) return;

        // Use a new context for rotation, so it doesn't affect the object's bounding box.
        this.ctx.save();
        this.ctx.rotate(this.animationAngle);

        // Apply the dynamic animation angle.
        this.ctx.rotate(this.animationAngle);

        this.ctx.beginPath();

        // Check if the area should be filled.
        if (this.timePlotFillArea) {
            this.ctx.fillStyle = this._createLocalFillStyle();
            // Start the path at the bottom-left of the plot area.
            this.ctx.moveTo(-this.width / 2, this.height / 2);
        }

        // Set up the style for the line.
        this.ctx.strokeStyle = this._createLocalFillStyle();
        this.ctx.lineWidth = this.timePlotLineThickness;

        const xStep = this.width / this.sensorHistory.length;
        const halfHeight = this.height / 2;

        // Draw the main time plot line.
        this.sensorHistory.forEach((value, i) => {
            const x = -this.width / 2 + i * xStep;
            const y = halfHeight - (value * this.height);
            this.ctx.lineTo(x, y);
        });

        // If filling is enabled, close the path and fill the area.
        if (this.timePlotFillArea) {
            // Connect the end of the line to the bottom-right of the plot area.
            this.ctx.lineTo(this.width / 2, this.height / 2);
            this.ctx.closePath();
            this.ctx.fill();
        }

        // Draw the line on top of the filled area.
        this.ctx.stroke();

        // Restore the canvas context to its previous state.
        this.ctx.restore();
    }

    _applyAudioReactivity(audioData) {
        if (this.isBeingManuallyRotated) {
            return;
        }

        // Reset properties at the start of each frame.
        this.rotation = this.baseRotation || 0;
        this.internalScale = 1.0;
        this.colorOverride = null;
        this.gradient = { ...(this.baseGradient || { color1: '#000000', color2: '#000000' }) };
        this.volumeMeterFill = 0;

        // 1. Update Flash Decay
        if (this.flashDecay > 0) {
            this.flashDecay -= 0.18;
        }
        this.flashDecay = Math.max(0, this.flashDecay);

        // Exit if reactivity is disabled.
        if (!this.enableAudioReactivity || !audioData || !audioData[this.audioMetric] || this.audioTarget === 'none') {
            return;
        }

        const rawAudioValue = audioData[this.audioMetric].avg || 0;

        // Update smoothed value for continuous effects
        const smoothingFactor = (this.audioSmoothing || 0) / 100.0;
        this.smoothedAudioValue = smoothingFactor * this.smoothedAudioValue + (1.0 - smoothingFactor) * rawAudioValue;

        // Beat detection for impulse effects
        this.audioHistory.push(rawAudioValue);
        this.audioHistory.shift();
        const n = this.audioHistory.length;
        const mean = this.audioHistory.reduce((a, b) => a + b, 0) / n;
        const stdDev = Math.sqrt(this.audioHistory.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b, 0) / n);
        const thresholdMultiplier = 0.5 + ((this.beatThreshold || 30) / 100.0) * 2.0;
        const threshold = mean + thresholdMultiplier * stdDev;

        if (rawAudioValue > threshold) {
            const sensitivity = (this.audioSensitivity / 100.0) * 1.5;
            this.flashDecay = Math.min(1.5, sensitivity);
        }

        const reactiveValue = this.flashDecay;

        switch (this.audioTarget) {
            case 'Flash':
                if (reactiveValue > 0) {
                    this.colorOverride = '#FFFFFF';
                    this.flashOpacity = Math.min(1.0, reactiveValue);
                } else { this.flashOpacity = 0; }
                break;
            case 'Size':
                this.internalScale = 1.0 + reactiveValue;
                break;
            case 'Rotation':
                // Use a smoothed value to create a continuous rotation effect.
                // The sensitivity can be applied here.
                const rotationSensitivity = (this.audioSensitivity / 100.0) * 5 / 100;
                const sign = Math.random() < 0.5 ? -1 : 1;
                // Update the animationAngle instead of the rotation
                this.animationAngle = this.baseAnimationAngle + (sign * this.smoothedAudioValue * rotationSensitivity);
                break;
            case 'Volume Meter':
                const volumeSensitivity = 1.0 + (this.audioSensitivity / 100.0) * 2.0;
                this.volumeMeterFill = Math.min(1.0, this.smoothedAudioValue * volumeSensitivity);
                break;
        }
    }

    _drawFill(phase = 0) {
        if (this.audioTarget === 'Volume Meter' && this.volumeMeterFill > 0) {
            // ... existing volume meter logic
        } else if (this.sensorTarget === 'Sensor Meter' && this.sensorMeterFill > 0) {
            this.ctx.save();
            this.ctx.clip();

            // Draw the empty part of the meter
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            this.ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

            // Calculate the filled part's height and position
            const fillHeight = this.height * this.sensorMeterFill;
            const fillY = this.height / 2 - fillHeight;

            // Draw the filled part with the shape's current style
            this.ctx.fillStyle = this._createLocalFillStyle(phase);
            this.ctx.fillRect(-this.width / 2, fillY, this.width, fillHeight);

            this.ctx.restore();
        } else {
            // If not a meter, use the original fill logic
            const fillStyle = this._createLocalFillStyle(phase);
            this.ctx.fillStyle = fillStyle;
            // This handles the necessary translation for pattern-based fills (like conic)
            if (fillStyle instanceof CanvasPattern && fillStyle.offsetX) {
                this.ctx.save();
                this.ctx.translate(fillStyle.offsetX, fillStyle.offsetY);
                this.ctx.fill();
                this.ctx.restore();
            } else {
                this.ctx.fill();
            }
        }
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

        if (this.gradType !== 'random') {
            return this.gradient.color1;
        }
        if (!this.randomElementState) {
            this.randomElementState = {};
        }

        if (!this.randomElementState[elementIndex]) {
            this.randomElementState[elementIndex] = {
                color: Math.random() < 0.5 ? this.gradient.color1 : this.gradient.color2,
                timer: Math.random() * 10 + 5
            };
        }

        const state = this.randomElementState[elementIndex];
        state.timer -= this.cycleSpeed;

        if (state.timer <= 0) {
            state.color = Math.random() < 0.5 ? this.gradient.color1 : this.gradient.color2;
            state.timer = Math.random() * 10 + 5;
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

        const localPoint = {
            x: (px - center.x) * Math.cos(-staticAngle) - (py - center.y) * Math.sin(-staticAngle),
            y: (px - center.x) * Math.sin(-staticAngle) + (py - center.y) * Math.cos(-staticAngle)
        };

        // --- NEW: Check for polyline node handles first ---
        if (this.shape === 'polyline') {
            for (let i = 0; i < this.polylinePoints.length; i++) {
                const p = this.polylinePoints[i];
                const dist = Math.sqrt(Math.pow(localPoint.x - p.x, 2) + Math.pow(localPoint.y - p.y, 2));
                if (dist <= this.nodeHandleRadius) {
                    return { name: `node-${i}`, type: 'node', index: i, cursor: 'crosshair' };
                }
            }
        }

        const halfW = this.width / 2;
        const halfH = this.height / 2;
        const h2 = this.handleSize / 2;

        const rotHandlePos = this.getRotationHandlePosition();
        const dist = Math.sqrt(Math.pow(localPoint.x - rotHandlePos.x, 2) + Math.pow(localPoint.y - rotHandlePos.y, 2));

        if (dist <= this.rotationHandleRadius + h2) {
            return { name: 'rotate', cursor: 'crosshair', type: 'rotation' };
        }

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

        if (this.shape === 'polyline') {
            if (this.isClosed) {
                let inside = false;
                for (let i = 0, j = this.polylinePoints.length - 1; i < this.polylinePoints.length; j = i++) {
                    const xi = this.polylinePoints[i].x, yi = this.polylinePoints[i].y;
                    const xj = this.polylinePoints[j].x, yj = this.polylinePoints[j].y;
                    const intersect = ((yi > localY) !== (yj > localY)) && (localX < (xj - xi) * (localY - yi) / (yj - yi) + xi);
                    if (intersect) inside = !inside;
                }
                return inside;
            } else {
                const clickThreshold = this.strokeWidth / 2 + 5;
                for (let i = 0; i < this.polylinePoints.length - 1; i++) {
                    const p1 = this.polylinePoints[i];
                    const p2 = this.polylinePoints[i + 1];
                    const dx_seg = p2.x - p1.x;
                    const dy_seg = p2.y - p1.y;
                    const len_sq = dx_seg * dx_seg + dy_seg * dy_seg;
                    if (len_sq === 0) continue;
                    let t = ((localX - p1.x) * dx_seg + (localY - p1.y) * dy_seg) / len_sq;
                    t = Math.max(0, Math.min(1, t));
                    const closestX = p1.x + t * dx_seg;
                    const closestY = p1.y + t * dy_seg;
                    const dist_sq = (localX - closestX) * (localX - closestX) + (localY - closestY) * (localY - closestY);
                    if (dist_sq < clickThreshold * clickThreshold) {
                        return true;
                    }
                }
                // This line was missing, causing the bug.
                return false;
            }
        }

        return (localX >= -halfWidth && localX <= halfWidth &&
            localY >= -halfHeight && localY <= halfHeight);
    }

    update(props) {
        const oldWidth = this.width;
        const oldHeight = this.height;
        const oldVizBarCount = this.vizBarCount;
        if (props.strokeAnimationSpeed !== undefined) {
            this.strokeAnimationSpeed = props.strokeAnimationSpeed;
            this.strokeCycleSpeed = props.strokeAnimationSpeed / 10;
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
        }
        if ((textChanged && (this.textAnimation === 'marquee' || this.textAnimation === 'wave')) || (animationChanged && (this.textAnimation === 'marquee' || this.textAnimation === 'wave'))) {
            this.scrollOffsetX = 0;
            this.waveAngle = 0;
        }
        const oldRows = this.numberOfRows;
        const oldCols = this.numberOfColumns;
        for (const key in props) {
            if (props[key] === undefined) continue;
            if (key === 'gradient' && typeof props[key] === 'object' && props[key] !== null) {
                if (props.gradient.color1 !== undefined) this.gradient.color1 = props.gradient.color1;
                if (props.gradient.color2 !== undefined) this.gradient.color2 = props.gradient.color2;
            } else if (key === 'strokeGradient' && typeof props[key] === 'object' && props[key] !== null) {
                if (props.strokeGradient.color1 !== undefined) this.strokeGradient.color1 = props.strokeGradient.color1;
                if (props.strokeGradient.color2 !== undefined) this.strokeGradient.color2 = props.strokeGradient.color2;
            } else if (key === 'x' || key === 'y') {
                const dx = props.x - this.x;
                const dy = props.y - this.y;
                this.x = props.x;
                this.y = props.y;
                if (this.shape === 'polyline') {
                    this.polylinePoints = this.polylinePoints.map(p => ({ x: p.x + dx, y: p.y + dy }));
                }
            } else {
                this[key] = props[key];
            }
        }
        this.dirty = true;

        // --- THIS IS THE CRITICAL FIX ---
        // The buggy code that caused the offset has been removed.
        // The object's x and y are no longer modified here.
        if (props.width !== undefined && props.width !== oldWidth) {
            this.width = props.width;
        }
        if (props.height !== undefined && props.height !== oldHeight) {
            this.height = props.height;
        }

        if (props.animationSpeed !== undefined) this.baseAnimationSpeed = props.animationSpeed;
        if (props.strokeWidth !== undefined) this.baseStrokeWidth = props.strokeWidth;
        if (props.gradient !== undefined) this.baseGradient = { ...this.gradient };
        if (props.gradientStop !== undefined) this.baseGradientStop = props.gradientStop;
        if (props.starInnerRadius !== undefined) this.baseStarInnerRadius = props.starInnerRadius;
        if (props.innerDiameter !== undefined) this.baseInnerDiameter = props.innerDiameter;
        if (props.pulseDepth !== undefined) this.basePulseDepth = props.pulseDepth;
        if (props.rotation !== undefined) this.baseRotation = props.rotation;
        if (this.numberOfRows !== oldRows || this.numberOfColumns !== oldCols) {
            this._shuffleCellOrder();
        }
        if (this.shape === 'text') {
            if (props.height !== undefined && props.height !== oldHeight) {
                this._updateFontSizeFromHeight();
            }
            this._updateTextMetrics();
        }
        const vizBarCountChanged = this.vizBarCount !== oldVizBarCount;
        if (this.shape === 'audio-visualizer' && (!this.vizBarHeights || vizBarCountChanged)) {
            this.vizBarHeights = new Array(parseInt(this.vizBarCount, 10) || 0).fill(0);
        }
        if (this.shape === 'polyline') {
            this._updatePolylineBounds();
        }
    }

    _getPolylineBounds() {
        if (!this.polylinePoints || this.polylinePoints.length === 0) {
            return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
        }
        const minX = Math.min(...this.polylinePoints.map(p => p.x));
        const maxX = Math.max(...this.polylinePoints.map(p => p.x));
        const minY = Math.min(...this.polylinePoints.map(p => p.y));
        const maxY = Math.max(...this.polylinePoints.map(p => p.y));
        return { minX, minY, maxX, maxY };
    }

    _createLocalStrokeStyle(phase = 0) {
        // Calculate the true local bounds of the shape's path
        let bounds = {
            minX: -this.width / 2, maxX: this.width / 2,
            minY: -this.height / 2, maxY: this.height / 2,
        };
        if (this.shape === 'polyline' && this.polylinePoints && this.polylinePoints.length > 0) {
            bounds.minX = Math.min(...this.polylinePoints.map(p => p.x));
            bounds.maxX = Math.max(...this.polylinePoints.map(p => p.x));
            bounds.minY = Math.min(...this.polylinePoints.map(p => p.y));
            bounds.maxY = Math.max(...this.polylinePoints.map(p => p.y));
        }
        const localWidth = bounds.maxX - bounds.minX;
        const localHeight = bounds.maxY - bounds.minY;

        if (this.colorOverride) {
            return this.colorOverride;
        }

        const safeColor = (c) => (typeof c === 'string' && c.length > 0) ? c : '#000000';
        const c1 = this.strokeCycleColors ? `hsl(${this.strokeHue1 % 360}, 100%, 50%)` : safeColor(this.strokeGradient.color1);
        const c2 = this.strokeCycleColors ? `hsl(${this.strokeHue2 % 360}, 100%, 50%)` : safeColor(this.strokeGradient.color2);

        if (this.strokeGradType === 'alternating') {
            return (phase % 2 === 0) ? c1 : c2;
        }

        let phaseIndex = phase;
        if (this.animationMode === 'bounce-random') {
            if (this.cellOrder && this.cellOrder.length > phase) { phaseIndex = this.cellOrder[phase]; }
        } else if (this.animationMode === 'bounce-reversed' && this.isReversing) {
            let lastCellIndex = 0;
            if (this.shape === 'tetris') {
                lastCellIndex = Math.max(0, this.tetrisBlockCount - 1);
            } else {
                lastCellIndex = Math.max(0, (this.numberOfRows * this.numberOfColumns) - 1);
            }
            phaseIndex = lastCellIndex - phase;
        }

        const effectiveScrollOffset = this.strokeScrollOffset + phaseIndex * this.phaseOffset / 100.0;
        let p = (effectiveScrollOffset % 1.0 + 1.0) % 1.0;

        if (this.strokeGradType === 'linear') {
            let grad;
            switch (this.strokeScrollDir) {
                case 'up': grad = this.ctx.createLinearGradient(0, bounds.maxY, 0, bounds.minY); break;
                case 'down': grad = this.ctx.createLinearGradient(0, bounds.minY, 0, bounds.maxY); break;
                case 'left': grad = this.ctx.createLinearGradient(bounds.maxX, 0, bounds.minX, 0); break;
                case 'right': default: grad = this.ctx.createLinearGradient(bounds.minX, 0, bounds.maxX, 0); break;
            }

            if (this.animationMode.includes('bounce')) {
                grad.addColorStop(0, getPatternColor(0 - p, c1, c2));
                grad.addColorStop(0.5, getPatternColor(0.5 - p, c1, c2));
                grad.addColorStop(1, getPatternColor(1 - p, c1, c2));
            } else {
                const midPoint = 0.5;
                const stops = [];
                const getPatternColorAtTime = (time) => {
                    const t = (time % 1.0 + 1.0) % 1.0;
                    if (t < midPoint) return lerpColor(c1, c2, t / midPoint);
                    return lerpColor(c2, c1, (t - midPoint) / (1 - midPoint));
                };
                stops.push({ pos: 0, color: getPatternColorAtTime(0 - p) });
                stops.push({ pos: 1, color: getPatternColorAtTime(1 - p) });
                for (let i = -2; i <= 2; i++) {
                    const c1_pos = i + p;
                    const c2_pos = i + midPoint + p;
                    if (c1_pos > 0 && c1_pos < 1) stops.push({ pos: c1_pos, color: c1 });
                    if (c2_pos > 0 && c2_pos < 1) stops.push({ pos: c2_pos, color: c2 });
                }
                const uniqueStops = stops.sort((a, b) => a.pos - b.pos)
                    .filter((stop, index, self) => index === 0 || stop.pos > self[index - 1].pos + 0.0001);
                uniqueStops.forEach(stop => grad.addColorStop(stop.pos, stop.color));
            }
            return grad;
        }

        if (this.strokeGradType === 'radial') {
            const maxRadius = Math.max(localWidth, localHeight) / 2;
            if (maxRadius <= 0) return 'black';
            const grad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, maxRadius);

            if (this.animationMode.includes('bounce')) {
                const wave = 1 - Math.abs(2 * p - 1);
                const midPoint = 0.5 * wave;
                grad.addColorStop(0, c1);
                grad.addColorStop(midPoint, c2);
                grad.addColorStop(1, c1);
            } else {
                const midPoint = 0.5;
                const stops = [];
                const getPatternColorAtTime = (time) => {
                    const t = (time % 1.0 + 1.0) % 1.0;
                    if (t < midPoint) return lerpColor(c1, c2, t / midPoint);
                    return lerpColor(c2, c1, (t - midPoint) / (1 - midPoint));
                };
                stops.push({ pos: 0, color: getPatternColorAtTime(0 - p) });
                stops.push({ pos: 1, color: getPatternColorAtTime(1 - p) });

                for (let i = -2; i <= 2; i++) {
                    const c1_pos = i + p;
                    const c2_pos = i + midPoint + p;
                    if (c1_pos > 0 && c1_pos < 1) stops.push({ pos: c1_pos, color: c1 });
                    if (c2_pos > 0 && c2_pos < 1) stops.push({ pos: c2_pos, color: c2 });
                }
                const uniqueStops = stops.sort((a, b) => a.pos - b.pos)
                    .filter((stop, index, self) => index === 0 || stop.pos > self[index - 1].pos + 0.0001);
                uniqueStops.forEach(stop => grad.addColorStop(stop.pos, stop.color));
            }
            return grad;
        }

        if (this.strokeGradType === 'rainbow' || this.strokeGradType === 'rainbow-radial') {
            const hueOffset = (this.strokeHue1 * 10) + (phaseIndex * (this.phaseOffset / 100.0) * 360);
            let grad;

            if (this.strokeGradType === 'rainbow-radial') {
                const maxRadius = Math.max(localWidth, localHeight) / 2;
                if (maxRadius <= 0) return 'black';
                grad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, maxRadius);
            } else {
                switch (this.strokeScrollDir) {
                    case 'up': grad = this.ctx.createLinearGradient(0, bounds.maxY, 0, bounds.minY); break;
                    case 'down': grad = this.ctx.createLinearGradient(0, bounds.minY, 0, bounds.maxY); break;
                    case 'left': grad = this.ctx.createLinearGradient(bounds.maxX, 0, bounds.minX, 0); break;
                    case 'right': default: grad = this.ctx.createLinearGradient(bounds.minX, 0, bounds.maxX, 0); break;
                }
            }

            const numStops = 60;
            for (let i = 0; i <= numStops; i++) {
                const hue = (i * (360 / numStops) + hueOffset) % 360;
                grad.addColorStop(i / numStops, `hsl(${hue}, 100%, 50%)`);
            }
            return grad;
        }
        return c1 || 'black';
    }

    /**
     * Creates a fill style for the shape's context, delegating to specialized helper methods.
     * This is the main dispatcher for creating gradients and fills.
     * @param {number} [phase=0] - The phase offset for animations, used in grids/groups.
     * @returns {CanvasGradient|string} The generated canvas style.
     */
    _createLocalFillStyle(phase = 0) {
        // Calculate the true local bounds of the shape's path
        let bounds = {
            minX: -this.width / 2, maxX: this.width / 2,
            minY: -this.height / 2, maxY: this.height / 2,
        };
        if (this.shape === 'polyline' && this.polylinePoints && this.polylinePoints.length > 0) {
            bounds.minX = Math.min(...this.polylinePoints.map(p => p.x));
            bounds.maxX = Math.max(...this.polylinePoints.map(p => p.x));
            bounds.minY = Math.min(...this.polylinePoints.map(p => p.y));
            bounds.maxY = Math.max(...this.polylinePoints.map(p => p.y));
        }
        const localWidth = bounds.maxX - bounds.minX;
        const localHeight = bounds.maxY - bounds.minY;


        if (this.colorOverride) {
            return this.colorOverride;
        }
        const safeColor = (c) => (typeof c === 'string' && c.length > 0) ? c : '#000000';
        let c1 = safeColor(this.gradient.color1);
        let c2 = safeColor(this.gradient.color2);

        if (this.cycleColors) {
            c1 = `hsl(${(this.hue1 + phase * this.phaseOffset) % 360}, 100%, 50%)`;
            c2 = `hsl(${(this.hue2 + phase * this.phaseOffset) % 360}, 100%, 50%)`;
        }

        if (this.gradType === 'alternating') {
            return (phase % 2 === 0) ? c1 : c2;
        }

        const phaseIndex = this._getPhaseIndex(phase);
        const p = this._getAnimationProgress(phaseIndex);

        switch (this.gradType) {
            case 'linear': {
                // Re-implement _createLinearGradient logic using the correct bounds
                const gradientStop = (typeof this.gradientStop === 'number' && isFinite(this.gradientStop)) ? this.gradientStop : 50;
                const progress = (typeof p === 'number' && isFinite(p)) ? p : 0;
                const isVertical = this.scrollDirection === 'up' || this.scrollDirection === 'down';

                const grad = isVertical
                    ? this.ctx.createLinearGradient(0, bounds.minY, 0, bounds.maxY)
                    : this.ctx.createLinearGradient(bounds.minX, 0, bounds.maxX, 0);

                if (this.animationSpeed === 0) {
                    if (this.useSharpGradient) {
                        const stopPoint = gradientStop / 100.0;
                        grad.addColorStop(0, c1);
                        grad.addColorStop(stopPoint, c1);
                        grad.addColorStop(Math.min(1, stopPoint + 0.001), c2);
                        grad.addColorStop(1, c2);
                    } else {
                        grad.addColorStop(0, c1);
                        grad.addColorStop(1, c2);
                    }
                    return grad;
                }

                if (this.useSharpGradient) {
                    let p_bounce = progress;
                    if (this.animationMode.includes('bounce')) {
                        const bounce_progress = (progress < 0.5) ? (progress * 2) : ((1 - progress) * 2);
                        p_bounce = bounce_progress * (1.0 - (gradientStop / 100.0));
                    }
                    const stopRatio = gradientStop / 100.0;
                    const p1 = p_bounce;
                    const p2 = p1 + stopRatio;
                    if (p2 > 1.0) {
                        const wrapped_p2 = p2 - 1.0;
                        grad.addColorStop(0, c1); grad.addColorStop(wrapped_p2, c1);
                        grad.addColorStop(wrapped_p2, c2); grad.addColorStop(p1, c2);
                        grad.addColorStop(p1, c1); grad.addColorStop(1, c1);
                    } else {
                        grad.addColorStop(0, c2); grad.addColorStop(p1, c2);
                        grad.addColorStop(p1, c1); grad.addColorStop(p2, c1);
                        grad.addColorStop(p2, c2); grad.addColorStop(1, c2);
                    }
                } else {
                    if (this.animationMode.includes('bounce')) {
                        grad.addColorStop(0, getPatternColor(0 - progress, c1, c2));
                        grad.addColorStop(0.5, getPatternColor(0.5 - progress, c1, c2));
                        grad.addColorStop(1, getPatternColor(1 - progress, c1, c2));
                    } else {
                        const midPoint = gradientStop / 100.0;
                        const stops = [];
                        const getPatternColorAtTime = (time) => {
                            const t = (time % 1.0 + 1.0) % 1.0;
                            if (midPoint <= 0.0001) return c2;
                            if (midPoint >= 0.9999) return c1;
                            if (t < midPoint) return lerpColor(c1, c2, t / midPoint);
                            return lerpColor(c2, c1, (t - midPoint) / (1 - midPoint));
                        };
                        stops.push({ pos: 0, color: getPatternColorAtTime(0 - progress) });
                        stops.push({ pos: 1, color: getPatternColorAtTime(1 - progress) });
                        for (let i = -2; i <= 2; i++) {
                            const c1_pos = i + progress;
                            const c2_pos = i + midPoint + progress;
                            if (c1_pos > 0 && c1_pos < 1) stops.push({ pos: c1_pos, color: c1 });
                            if (c2_pos > 0 && c2_pos < 1) stops.push({ pos: c2_pos, color: c2 });
                        }
                        const uniqueStops = stops.sort((a, b) => a.pos - b.pos).filter((stop, index, self) => index === 0 || stop.pos > self[index - 1].pos + 0.0001);
                        uniqueStops.forEach(stop => {
                            const finalPos = (typeof stop.pos === 'number' && isFinite(stop.pos)) ? stop.pos : 0;
                            grad.addColorStop(Math.max(0, Math.min(1, finalPos)), stop.color);
                        });
                    }
                }
                return grad;
            }
            case 'radial': {
                // Re-implement _createRadialGradient logic using the correct bounds
                const gradientStop = (typeof this.gradientStop === 'number' && isFinite(this.gradientStop)) ? this.gradientStop : 50;
                const progress = (typeof p === 'number' && isFinite(p)) ? p : 0;
                const maxRadius = Math.max(localWidth, localHeight) / 2;
                if (maxRadius <= 0) return 'black';
                const grad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, maxRadius);
                const wave = 1 - Math.abs(2 * progress - 1);
                if (this.useSharpGradient) {
                    const stopPoint = (gradientStop / 100) * wave;
                    grad.addColorStop(0, c1);
                    grad.addColorStop(stopPoint, c1);
                    grad.addColorStop(Math.min(1, stopPoint + 0.001), c2);
                    grad.addColorStop(1, c2);
                } else {
                    const midPoint = gradientStop / 100.0;
                    const animatedMidPoint = midPoint * wave;
                    grad.addColorStop(0, c1);
                    grad.addColorStop(animatedMidPoint, c2);
                    grad.addColorStop(1, c1);
                }
                return grad;
            }
            case 'conic':
            case 'rainbow-conic': {
                if (this._conicPatternCache) {
                    return this._conicPatternCache;
                }
                const size = Math.ceil(Math.sqrt(localWidth * localWidth + localHeight * localHeight));
                if (size <= 0) return 'black';
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = size;
                tempCanvas.height = size;
                const tempCtx = tempCanvas.getContext('2d');
                const centerX = size / 2;
                const centerY = size / 2;
                const rotationOffset = this.scrollOffset * 2 * Math.PI;
                const segments = 180;
                for (let i = 0; i < segments; i++) {
                    const startAngle = (i / segments) * 2 * Math.PI + rotationOffset;
                    const endAngle = ((i + 1.5) / segments) * 2 * Math.PI + rotationOffset;
                    let segmentColor;
                    if (this.gradType === 'rainbow-conic') {
                        const hue = ((i / segments) * 360 + this.hue1) % 360;
                        segmentColor = `hsl(${hue}, 100%, 50%)`;
                    } else {
                        const progress = i / segments;
                        if (this.useSharpGradient) {
                            const stopPoint = this.gradientStop / 100.0;
                            segmentColor = progress < stopPoint ? c1 : c2;
                        } else {
                            segmentColor = lerpColor(c1, c2, progress);
                        }
                    }
                    tempCtx.beginPath();
                    tempCtx.moveTo(centerX, centerY);
                    tempCtx.arc(centerX, centerY, size, startAngle, endAngle);
                    tempCtx.closePath();
                    tempCtx.fillStyle = segmentColor;
                    tempCtx.fill();
                }
                const pattern = this.ctx.createPattern(tempCanvas, 'no-repeat');
                pattern.offsetX = -centerX;
                pattern.offsetY = -centerY;
                this._conicPatternCache = pattern;
                return pattern;
            }
            case 'rainbow':
            case 'rainbow-radial': {
                const hueOffset = (this.scrollOffset * 360) + (phaseIndex * (this.phaseOffset / 100.0) * 360);
                let grad;
                const isVertical = this.scrollDirection === 'up' || this.scrollDirection === 'down';
                if (this.gradType === 'rainbow-radial') {
                    const maxRadius = Math.max(localWidth, localHeight) / 2;
                    if (maxRadius <= 0) return 'black';
                    grad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, maxRadius);
                } else {
                    grad = isVertical
                        ? this.ctx.createLinearGradient(0, bounds.maxY, 0, bounds.minY)
                        : this.ctx.createLinearGradient(bounds.maxX, 0, bounds.minX, 0);
                }

                const numStops = 60;
                for (let i = 0; i <= numStops; i++) {
                    const hue = (i * (360 / numStops) + hueOffset) % 360;
                    grad.addColorStop(i / numStops, `hsl(${hue}, 100%, 50%)`);
                }
                return grad;
            }
            case 'random':
                return this._getRandomColorForElement(phase);
            default: // solid
                return c1 || 'black';
        }
    }

    /**
     * Determines the effective index for an animation phase, accounting for different animation modes.
     * @param {number} phase - The base phase value.
     * @returns {number} The calculated phase index.
     * @private
     */
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
                    const data = JSON.parse(this.pixelArtData);
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

    /**
     * Creates a linear gradient style.
     * @param {string} c1 - The first color.
     * @param {string} c2 - The second color.
     * @param {number} p - The animation progress (0.0 to 1.0).
     * @returns {CanvasGradient} The generated linear gradient.
     * @private
     */
    _createLinearGradient(c1, c2, p) {
        const gradientStop = (typeof this.gradientStop === 'number' && isFinite(this.gradientStop)) ? this.gradientStop : 50;
        const progress = (typeof p === 'number' && isFinite(p)) ? p : 0;
        const halfW = this.width / 2;
        const halfH = this.height / 2;
        const isVertical = this.scrollDirection === 'up' || this.scrollDirection === 'down';
        const grad = isVertical ? this.ctx.createLinearGradient(0, -halfH, 0, halfH) : this.ctx.createLinearGradient(-halfW, 0, halfW, 0);

        // This new block handles static gradients when animation speed is zero.
        if (this.animationSpeed === 0) {
            if (this.useSharpGradient) {
                const stopPoint = gradientStop / 100.0;
                grad.addColorStop(0, c1);
                grad.addColorStop(stopPoint, c1);
                grad.addColorStop(Math.min(1, stopPoint + 0.001), c2);
                grad.addColorStop(1, c2);
            } else {
                grad.addColorStop(0, c1);
                grad.addColorStop(1, c2);
            }
            return grad;
        }

        // The rest of the function handles the existing animation logic
        if (this.useSharpGradient) {
            let p_bounce = progress;
            if (this.animationMode.includes('bounce')) {
                const bounce_progress = (progress < 0.5) ? (progress * 2) : ((1 - progress) * 2);
                p_bounce = bounce_progress * (1.0 - (gradientStop / 100.0));
            }
            const stopRatio = gradientStop / 100.0;
            const p1 = p_bounce;
            const p2 = p1 + stopRatio;
            if (p2 > 1.0) {
                const wrapped_p2 = p2 - 1.0;
                grad.addColorStop(0, c1); grad.addColorStop(wrapped_p2, c1);
                grad.addColorStop(wrapped_p2, c2); grad.addColorStop(p1, c2);
                grad.addColorStop(p1, c1); grad.addColorStop(1, c1);
            } else {
                grad.addColorStop(0, c2); grad.addColorStop(p1, c2);
                grad.addColorStop(p1, c1); grad.addColorStop(p2, c1);
                grad.addColorStop(p2, c2); grad.addColorStop(1, c2);
            }
        } else {
            if (this.animationMode.includes('bounce')) {
                grad.addColorStop(0, getPatternColor(0 - progress, c1, c2));
                grad.addColorStop(0.5, getPatternColor(0.5 - progress, c1, c2));
                grad.addColorStop(1, getPatternColor(1 - progress, c1, c2));
            } else {
                const midPoint = gradientStop / 100.0;
                const stops = [];
                const getPatternColorAtTime = (time) => {
                    const t = (time % 1.0 + 1.0) % 1.0;
                    if (midPoint <= 0.0001) return c2;
                    if (midPoint >= 0.9999) return c1;
                    if (t < midPoint) return lerpColor(c1, c2, t / midPoint);
                    return lerpColor(c2, c1, (t - midPoint) / (1 - midPoint));
                };
                stops.push({ pos: 0, color: getPatternColorAtTime(0 - progress) });
                stops.push({ pos: 1, color: getPatternColorAtTime(1 - progress) });
                for (let i = -2; i <= 2; i++) {
                    const c1_pos = i + progress;
                    const c2_pos = i + midPoint + progress;
                    if (c1_pos > 0 && c1_pos < 1) stops.push({ pos: c1_pos, color: c1 });
                    if (c2_pos > 0 && c2_pos < 1) stops.push({ pos: c2_pos, color: c2 });
                }
                const uniqueStops = stops.sort((a, b) => a.pos - b.pos).filter((stop, index, self) => index === 0 || stop.pos > self[index - 1].pos + 0.0001);
                uniqueStops.forEach(stop => {
                    const finalPos = (typeof stop.pos === 'number' && isFinite(stop.pos)) ? stop.pos : 0;
                    grad.addColorStop(Math.max(0, Math.min(1, finalPos)), stop.color);
                });
            }
        }
        return grad;
    }

    /**
     * Creates a radial gradient style, resulting in a smooth pulse.
     * @param {string} c1 - The first color.
     * @param {string} c2 - The second color.
     * @param {number} p - The animation progress (0.0 to 1.0).
     * @returns {CanvasGradient} The generated radial gradient.
     * @private
     */
    _createRadialGradient(c1, c2, p) {
        const gradientStop = (typeof this.gradientStop === 'number' && isFinite(this.gradientStop)) ? this.gradientStop : 50;
        const progress = (typeof p === 'number' && isFinite(p)) ? p : 0;
        const maxRadius = Math.max(this.width, this.height) / 2;
        if (maxRadius <= 0) return 'black';
        const grad = this.ctx.createRadialGradient(0, 0, 0, 0, 0, maxRadius);
        const wave = 1 - Math.abs(2 * progress - 1);
        if (this.useSharpGradient) {
            const stopPoint = (gradientStop / 100) * wave;
            grad.addColorStop(0, c1);
            grad.addColorStop(stopPoint, c1);
            grad.addColorStop(Math.min(1, stopPoint + 0.001), c2);
            grad.addColorStop(1, c2);
        } else {
            const midPoint = gradientStop / 100.0;
            const animatedMidPoint = midPoint * wave;
            grad.addColorStop(0, c1);
            grad.addColorStop(animatedMidPoint, c2);
            grad.addColorStop(1, c1);
        }
        return grad;
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

        const numStops = 60;
        for (let i = 0; i <= numStops; i++) {
            const hue = (i * (360 / numStops) + hueOffset) % 360;
            grad.addColorStop(i / numStops, `hsl(${hue}, 100%, 50%)`);
        }
        return grad;
    }

    updateAnimationState(audioData, sensorData, deltaTime = 0) {
        this._conicPatternCache = null;
        this._applyAudioReactivity(audioData);
        this._applySensorReactivity(sensorData);

        const animSpeed = (this.animationSpeed || 0) * deltaTime;
        const cycleSpeed = (this.cycleSpeed || 0) * deltaTime;
        const strokeAnimationSpeed = (this.strokeAnimationSpeed || 0) * deltaTime * 10;
        const strokeCycleSpeed = (this.strokeCycleSpeed || 0) * deltaTime * 50;
        const oscAnimSpeed = (this.oscAnimationSpeed || 0) * deltaTime;
        const textAnimSpeed = (this.textAnimationSpeed || 0) * deltaTime;
        const rotationSpeed = (this.rotationSpeed || 0) * deltaTime;
        const tetrisSpeed = (this.tetrisSpeed || 0) * deltaTime;

        if (this.shape === 'audio-visualizer' && audioData && audioData.frequencyData) {
            const fullFreqData = audioData.frequencyData;
            const smoothingFactor = this.vizSmoothing / 100.0;
            const barCount = parseInt(this.vizBarCount, 10);
            const maxFreqIndex = Math.round((20000 / 22050) * fullFreqData.length);
            const freqData = fullFreqData.slice(0, maxFreqIndex);
            if (!this.vizBarHeights || this.vizBarHeights.length !== barCount) {
                this.vizBarHeights = new Array(barCount).fill(0);
            }
            let minFreq = 255;
            let maxFreq = 0;
            for (let i = 0; i < freqData.length; i++) {
                if (freqData[i] < minFreq) minFreq = freqData[i];
                if (freqData[i] > maxFreq) maxFreq = freqData[i];
            }
            const freqRange = maxFreq > minFreq ? maxFreq - minFreq : 1;
            if (freqData.length === 0) return;
            const logMax = Math.log(freqData.length);
            const normalizedAvgs = [];
            let peakNormalizedValue = 0;
            for (let i = 0; i < barCount; i++) {
                const startRatio = i / barCount;
                const endRatio = (i + 1) / barCount;
                const startFreqIndex = Math.max(0, Math.floor(Math.exp(startRatio * logMax)) - 1);
                const endFreqIndex = Math.max(0, Math.floor(Math.exp(endRatio * logMax)) - 1);
                let sum = 0;
                let count = 0;
                for (let j = startFreqIndex; j <= endFreqIndex && j < freqData.length; j++) {
                    sum += freqData[j];
                    count++;
                }
                const avg = count > 0 ? sum / count : 0;
                const normalizedAvg = (avg - minFreq) / freqRange;
                normalizedAvgs.push(normalizedAvg);
                if (normalizedAvg > peakNormalizedValue) {
                    peakNormalizedValue = normalizedAvg;
                }
            }
            for (let i = 0; i < barCount; i++) {
                let targetHeight;
                const normalizedAvg = normalizedAvgs[i];
                if (this.vizAutoScale !== false) {
                    let shapeMaxHeight;
                    if (this.vizLayout === 'Circular') {
                        const outerRadius = Math.min(this.width, this.height) / 2;
                        const innerRadiusRatio = (this.vizInnerRadius || 0) / 100.0;
                        shapeMaxHeight = outerRadius * (1.0 - innerRadiusRatio);
                    } else {
                        shapeMaxHeight = this.height;
                    }
                    const scaleFactor = (peakNormalizedValue > 0) ? (1.0 / peakNormalizedValue) : 0;
                    targetHeight = Math.max(0, normalizedAvg * scaleFactor * shapeMaxHeight);
                } else {
                    const availableSpace = this.vizLayout === 'Circular' ? (Math.min(this.width, this.height) / 2) : this.height;
                    const maxBarHeight = ((this.vizMaxBarHeight || 30) / 100.0) * availableSpace;
                    targetHeight = Math.max(0, normalizedAvg * maxBarHeight);
                }
                this.vizBarHeights[i] = smoothingFactor * this.vizBarHeights[i] + (1.0 - smoothingFactor) * targetHeight;
            }
        }

        if (this.shape === 'tetris') {
            const baseSpeed = tetrisSpeed * 0.2;
            if (this.tetrisAnimation === 'fade-in-stack') {
                const fadeSpeed = baseSpeed * 0.1;
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
                        activeBlock.life += fadeSpeed;
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
                        block.life -= fadeSpeed;
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
                        const gravity = baseSpeed * 30 * deltaTime;
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
                } else { // Linear Animation
                    if (this.tetrisActiveBlockIndex < this.tetrisBlocks.length) {
                        const activeBlock = this.tetrisBlocks[this.tetrisActiveBlockIndex];
                        if (!activeBlock.settled) {
                            const speed = baseSpeed * 100;
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

        if (this.gradType === 'random' && this.randomElementState) {
            for (const key in this.randomElementState) {
                this.randomElementState[key].timer -= cycleSpeed * 0.2;
            }
        }

        this.hue1 += cycleSpeed * 20;
        this.hue2 += cycleSpeed * 20;
        this.strokeHue1 += strokeCycleSpeed * 20;
        this.strokeHue2 += strokeCycleSpeed * 20;

        const currentText = this.getDisplayText();
        switch (this.textAnimation) {
            case 'marquee':
            case 'wave':
                const fontData = this.pixelFont === 'large' ? FONT_DATA_5PX : FONT_DATA_4PX;
                const pixelSize = this.fontSize / 10;
                const textWidth = currentText.length * (fontData.charWidth + fontData.charSpacing) * pixelSize;
                this.scrollOffsetX -= textAnimSpeed * 20;
                if (this.scrollOffsetX < -textWidth) { this.scrollOffsetX = this.width; }
                if (this.textAnimation === 'wave') { this.waveAngle += textAnimSpeed * 0.5; }
                this.visibleCharCount = currentText.length;
                break;
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
            const increment = strokeAnimationSpeed * 0.025;
            const directionMultiplier = (this.strokeScrollDir === 'left' || this.strokeScrollDir === 'up') ? -1 : 1;
            this.strokeScrollOffset += increment * directionMultiplier;
        }

        let shapeIncrement;
        if (this.shape === 'oscilloscope') {
            if (this.oscDisplayMode === 'seismic') {
                shapeIncrement = oscAnimSpeed * 0.15;
                const directionMultiplier = (this.scrollDirection === 'right' || this.scrollDirection === 'down') ? 1 : 1;
                shapeIncrement *= directionMultiplier;
            } else {
                shapeIncrement = oscAnimSpeed * 0.5;
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
            } else { // 'fire-radial'
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

    // In Shape.js, replace the entire draw() method with this corrected version.
    draw(isSelected) {
        const angleToUse = this.getRenderAngle();

        this.ctx.save();

        // --- NEW: General translation logic for all shapes ---
        if (this.shape === 'polyline') {
            this.ctx.translate(this.x, this.y);
        } else {
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;
            this.ctx.translate(centerX, centerY);
        }

        this.ctx.rotate(angleToUse);
        this.ctx.rotate(this.animationAngle);

        if (this.internalScale && this.internalScale !== 1.0) {
            this.ctx.scale(this.internalScale, this.internalScale);
        }

        // --- NEW: Polyline Drawing Logic ---
        if (this.shape === 'polyline') {
            if (!this.polylinePoints || this.polylinePoints.length < 2) return;

            this.ctx.beginPath();
            this.ctx.moveTo(this.polylinePoints[0].x - this.x, this.polylinePoints[0].y - this.y);
            for (let i = 1; i < this.polylinePoints.length; i++) {
                this.ctx.lineTo(this.polylinePoints[i].x - this.x, this.polylinePoints[i].y - this.y);
            }

            if (this.isClosed) {
                this.ctx.closePath();
                this._drawFill();
            }

            if (this.enableStroke) {
                this.ctx.lineJoin = 'round';
                this.ctx.lineCap = 'round';
                this.ctx.strokeStyle = this._createLocalStrokeStyle();
                this.ctx.lineWidth = this.strokeWidth;
                this.ctx.stroke();
            }
        } else {
            const centerX = this.x + this.width / 2;
            const centerY = this.y + this.height / 2;
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(angleToUse);
            this.ctx.rotate(this.animationAngle);

            if (this.internalScale && this.internalScale !== 1.0) {
                this.ctx.scale(this.internalScale, this.internalScale);
            }

            const applyStrokeInside = () => {
                if (this.enableStroke && this.strokeWidth > 0) {
                    this.ctx.save();
                    this.ctx.clip();
                    this.ctx.strokeStyle = this._createLocalStrokeStyle(this.strokeScrollOffset);
                    this.ctx.lineWidth = this.strokeWidth * 2;
                    this.ctx.stroke();
                    this.ctx.restore();
                }
            };

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
                    if (!this.pixelArtData) return;
                    const data = (typeof this.pixelArtData === 'string') ? JSON.parse(this.pixelArtData) : this.pixelArtData;
                    if (!Array.isArray(data) || data.length === 0 || !Array.isArray(data[0])) { return; }
                    const rows = data.length;
                    const cols = data[0].length;
                    if (cols === 0) return;
                    const cellWidth = this.width / cols;
                    const cellHeight = this.height / rows;
                    const isGradientFill = this.gradType === 'linear' || this.gradType === 'radial' || this.gradType.startsWith('rainbow') || this.gradType.startsWith('conic');
                    if (isGradientFill) { this.ctx.fillStyle = this._createLocalFillStyle(); }
                    for (let r = 0; r < rows; r++) {
                        for (let c = 0; c < cols; c++) {
                            const alphaValue = data[r] && data[r][c] ? data[r][c] : 0;
                            if (alphaValue > 0) {
                                if (!isGradientFill) {
                                    const cellIndex = r * cols + c;
                                    this.ctx.fillStyle = this.gradType === 'random' ? this._getRandomColorForElement(cellIndex) : this._createLocalFillStyle(cellIndex);
                                }
                                this.ctx.globalAlpha = alphaValue;
                                this.ctx.fillRect(-this.width / 2 + c * cellWidth, -this.height / 2 + r * cellHeight, cellWidth, cellHeight);
                            }
                        }
                    }
                    this.ctx.globalAlpha = 1.0;
                } catch (e) { console.error("Failed to draw pixel art:", e); }
            } else if (this.shape === 'tetris') {
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
                this.ctx.globalAlpha = 1.0;
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

                if (this.vizLayout === 'Circular') {
                    const centerX = 0;
                    const centerY = 0;
                    const outerRadius = Math.min(this.width, this.height) / 2;
                    const innerRadius = outerRadius * ((this.vizInnerRadius || 0) / 100.0);

                    if (this.vizDrawStyle === 'Line' || this.vizDrawStyle === 'Area') {
                        if (barCount < 2) return;
                        this.ctx.beginPath();
                        for (let i = 0; i <= barCount; i++) {
                            const index = i % barCount;
                            const barHeight = this.vizBarHeights[index] || 0;
                            const angle = (i / barCount) * 2 * Math.PI - (Math.PI / 2);
                            const radius = innerRadius + barHeight;
                            const x = centerX + radius * Math.cos(angle);
                            const y = centerY + radius * Math.sin(angle);
                            if (i === 0) {
                                this.ctx.moveTo(x, y);
                            } else {
                                this.ctx.lineTo(x, y);
                            }
                        }
                        if (this.vizDrawStyle === 'Area') {
                            this.ctx.closePath();
                            this._drawFill();
                        } else {
                            this.ctx.lineWidth = this.vizLineWidth;
                            this.ctx.stroke();
                        }
                    } else { // Bars
                        if (this.vizUseSegments) {
                            const segmentCount = this.vizSegmentCount || 16;
                            const segmentSpacing = this.vizSegmentSpacing || 1;
                            const availableBarSpace = outerRadius - innerRadius;
                            const totalSpacing = (segmentCount - 1) * segmentSpacing;
                            const segmentLength = (availableBarSpace - totalSpacing) / segmentCount;

                            if (segmentLength > 0) {
                                const angleStep = (2 * Math.PI) / barCount;
                                const barAngularWidth = angleStep * (1 - ((this.vizBarSpacing || 0) / 100.0));

                                for (let i = 0; i < barCount; i++) {
                                    const barLength = this.vizBarHeights[i] || 0;
                                    if (barLength <= 0) continue;

                                    const litSegments = Math.floor(barLength / (segmentLength + segmentSpacing));
                                    const baseAngle = this.rotation * (Math.PI / 180);
                                    const startAngle = baseAngle + (i * angleStep) - (Math.PI / 2);
                                    const endAngle = startAngle + barAngularWidth;

                                    for (let j = 0; j < litSegments; j++) {
                                        const segmentStartRadius = innerRadius + j * (segmentLength + segmentSpacing);
                                        const segmentEndRadius = segmentStartRadius + segmentLength;

                                        this.ctx.beginPath();
                                        this.ctx.arc(centerX, centerY, segmentEndRadius, startAngle, endAngle);
                                        this.ctx.arc(centerX, centerY, segmentStartRadius, endAngle, startAngle, true);
                                        this.ctx.closePath();

                                        if (this.gradType === 'alternating' || this.gradType === 'random') {
                                            this._drawFill(j);
                                        } else {
                                            this._drawFill();
                                        }
                                    }
                                }
                            }
                        } else { // Solid Bars
                            const angleStep = (2 * Math.PI) / barCount;
                            const barAngularWidth = angleStep * (1 - ((this.vizBarSpacing || 0) / 100.0));

                            for (let i = 0; i < barCount; i++) {
                                const barLength = this.vizBarHeights[i] || 0;
                                if (barLength <= 0) continue;

                                const startRadius = innerRadius;
                                const endRadius = innerRadius + barLength;
                                const baseAngle = this.rotation * (Math.PI / 180);
                                const startAngle = baseAngle + (i * angleStep) - (Math.PI / 2);
                                const endAngle = startAngle + barAngularWidth;

                                this.ctx.beginPath();
                                this.ctx.arc(centerX, centerY, endRadius, startAngle, endAngle);
                                this.ctx.arc(centerX, centerY, startRadius, endAngle, startAngle, true);
                                this.ctx.closePath();
                                this._drawFill();
                            }
                        }
                    }
                } else { // Linear Layout
                    const totalSpacing = (barCount - 1) * this.vizBarSpacing;
                    const barWidth = (this.width - totalSpacing) / barCount;

                    if (this.vizDrawStyle === 'Line' || this.vizDrawStyle === 'Area') {
                        this.ctx.beginPath();
                        const halfW = this.width / 2;
                        const halfH = this.height / 2;
                        const firstBarHeight = this.vizBarHeights[0] || 0;
                        this.ctx.moveTo(-halfW, halfH - firstBarHeight);
                        for (let i = 0; i < barCount; i++) {
                            const barHeight = this.vizBarHeights[i] || 0;
                            const x = -halfW + i * (barWidth + this.vizBarSpacing) + barWidth / 2;
                            const y = halfH - barHeight;
                            this.ctx.lineTo(x, y);
                        }

                        if (this.vizDrawStyle === 'Area') {
                            this.ctx.lineTo(halfW, halfH);
                            this.ctx.lineTo(-halfW, halfH);
                            this.ctx.closePath();
                            this._drawFill();
                        } else { // Line
                            this.ctx.lineWidth = this.vizLineWidth;
                            this.ctx.stroke();
                        }
                    } else { // Bars
                        for (let i = 0; i < barCount; i++) {
                            const barHeight = this.vizBarHeights[i] || 0;
                            if (barHeight < 1) continue;
                            const x = -this.width / 2 + i * (barWidth + this.vizBarSpacing);
                            if (this.vizUseSegments) {
                                const segmentCount = this.vizSegmentCount || 16;
                                const segmentSpacing = this.vizSegmentSpacing || 2;
                                const totalSegSpacing = (segmentCount - 1) * segmentSpacing;
                                const segmentHeight = (this.height - totalSegSpacing) / segmentCount;
                                if (segmentHeight > 0) {
                                    const litSegments = Math.floor(barHeight / (segmentHeight + segmentSpacing));
                                    for (let j = 0; j < litSegments; j++) {
                                        let y;
                                        const segYPos = j * (segmentHeight + segmentSpacing);
                                        if (this.gradType === 'alternating' || this.gradType === 'random') {
                                            this.ctx.fillStyle = this._createLocalFillStyle(j);
                                        }
                                        switch (this.vizStyle) {
                                            case 'top': y = -this.height / 2 + segYPos; break;
                                            case 'center':
                                                const totalPossibleHeight = segmentCount * (segmentHeight + segmentSpacing) - segmentSpacing;
                                                y = -totalPossibleHeight / 2 + j * (segmentHeight + segmentSpacing);
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
                        if (this.fillShape) { this._drawFill(i); } else { this.ctx.stroke(); }
                    }
                    this.ctx.globalAlpha = 1.0;
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
                        this._drawFill();
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
            } else {
                if (this.sensorTarget === 'Time Plot') {
                    this._drawTimePlot();
                } else {
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

        if (this.shape === 'polyline') {
            if (!this.locked) {
                this.ctx.fillStyle = selectionColor;
                this.ctx.beginPath();
                this.polylinePoints.forEach(p => {
                    this.ctx.rect(p.x - this.nodeHandleRadius, p.y - this.nodeHandleRadius, this.nodeHandleRadius * 2, this.nodeHandleRadius * 2);
                });
                this.ctx.fill();
            }
        } else {
            const halfW = this.width / 2;
            const halfH = this.height / 2;

            this.ctx.strokeStyle = selectionColor;
            this.ctx.lineWidth = 2;
            this.ctx.setLineDash([6, 4]);
            this.ctx.strokeRect(-halfW, -halfH, this.width, this.height);
            this.ctx.setLineDash([]);

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
        }

        this.ctx.restore();

        if (this.locked) {
            this.ctx.save();
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            const lockPathData = "M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z";
            const lockIconPath = new Path2D(lockPathData);
            const iconSize = 30;
            const scale = iconSize / 16;
            this.ctx.translate(center.x - (iconSize / 2), center.y - (iconSize / 2));
            this.ctx.scale(scale, scale);
            this.ctx.fill(lockIconPath);
            this.ctx.restore();
        }
    }
}
