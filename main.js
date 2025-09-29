// Global speed multipliers (adjust these to change animation speeds across the board)
window.gradientSpeedMultiplier = 1;
window.shapeSpeedMultiplier = 1;
window.seismicSpeedMultiplier = 1;
window.tetrisGravityMultiplier = 4;
window.textSpeedMultiplier = 1;

const propsToScale = [
    'x', 'y', 'width', 'height', 'innerDiameter', 'fontSize',
    'lineWidth', 'strokeWidth', 'pulseDepth', 'vizLineWidth', 'strimerBlockSize',
    'pathAnim_size', 'pathAnim_speed', 'pathAnim_objectSpacing', 'pathAnim_trailLength',
    'spawn_size', 'spawn_speed', 'spawn_gravity', 'spawn_matrixGlowSize'
];

// Update this for a new property
//Tabs
const controlGroupMap = {
    'Geometry': { props: ['shape', 'x', 'y', 'width', 'height', 'rotation', 'rotationSpeed', 'autoWidth', 'innerDiameter', 'numberOfSegments', 'angularWidth', 'sides', 'points', 'starInnerRadius'], icon: 'bi-box-fill' },
    'Polyline': { props: ['polylineNodes', 'polylineCurveStyle'], icon: 'bi-vector-pen' },
    'Stroke': { props: ['enableStroke', 'strokeWidth', 'strokeGradType', 'strokeGradientStops', 'strokeUseSharpGradient', 'strokeCycleColors', 'strokeCycleSpeed', 'strokeAnimationSpeed', 'strokeRotationSpeed', 'strokeAnimationMode', 'strokePhaseOffset', 'strokeScrollDir'], icon: 'bi-brush-fill' },
    'Object': { props: ['pathAnim_enable', 'pathAnim_shape', 'pathAnim_size', 'pathAnim_speed', 'pathAnim_behavior', 'pathAnim_objectCount', 'pathAnim_objectSpacing', 'pathAnim_trail', 'pathAnim_trailLength', 'pathAnim_trailColor'], icon: 'bi-box-seam' },
    'Object Fill': { props: ['pathAnim_gradType', 'pathAnim_gradColor1', 'pathAnim_gradColor2', 'pathAnim_useSharpGradient', 'pathAnim_animationMode', 'pathAnim_animationSpeed', 'pathAnim_scrollDir', 'pathAnim_cycleColors', 'pathAnim_cycleSpeed'], icon: 'bi-palette-fill' },
    'Fill-Animation': { props: ['gradType', 'gradientStops', 'cycleColors', 'useSharpGradient', 'animationMode', 'scrollDir', 'phaseOffset', 'numberOfRows', 'numberOfColumns', 'animationSpeed', 'cycleSpeed', 'fillShape'], icon: 'bi-palette-fill' },
    'Text': { props: ['text', 'fontSize', 'textAlign', 'pixelFont', 'textAnimation', 'textAnimationSpeed', 'showTime', 'showDate'], icon: 'bi-fonts' },
    'Oscilloscope': { props: ['lineWidth', 'waveType', 'frequency', 'oscDisplayMode', 'pulseDepth', 'enableWaveAnimation', 'oscAnimationSpeed', 'waveStyle', 'waveCount'], icon: 'bi-graph-up-arrow' },
    'Tetris': { props: ['tetrisBlockCount', 'tetrisAnimation', 'tetrisSpeed', 'tetrisBounce', 'tetrisHoldTime'], icon: 'bi-grid-3x3-gap-fill' },
    'Fire': { props: ['fireSpread'], icon: 'bi-fire' },
    'Pixel Art': { props: ['pixelArtFrames'], icon: 'bi-image-fill' },
    'Visualizer': { props: ['vizLayout', 'vizDrawStyle', 'vizStyle', 'vizLineWidth', 'vizAutoScale', 'vizMaxBarHeight', 'vizBarCount', 'vizBarSpacing', 'vizSmoothing', 'vizUseSegments', 'vizSegmentCount', 'vizSegmentSpacing', 'vizInnerRadius', 'vizBassLevel', 'vizTrebleBoost', 'vizDynamicRange'], icon: 'bi-bar-chart-line-fill' },
    'Audio Responsiveness': { props: ['enableAudioReactivity', 'audioTarget', 'audioMetric', 'beatThreshold', 'audioSensitivity', 'audioSmoothing'], icon: 'bi-mic-fill' },
    'Sensor Responsiveness': { props: ['enableSensorReactivity', 'sensorTarget', 'userSensor', 'timePlotLineThickness', 'timePlotFillArea', 'sensorMeterShowValue', 'timePlotAxesStyle', 'timePlotTimeScale', 'sensorColorMode', 'sensorMidThreshold', 'sensorMaxThreshold'], icon: 'bi-cpu-fill' },
    'Strimer': { props: ['strimerRows', 'strimerColumns', 'strimerBlockCount', 'strimerBlockSize', 'strimerAnimation', 'strimerAnimationSpeed', 'strimerDirection', 'strimerEasing', 'strimerBlockSpacing', 'strimerGlitchFrequency', 'strimerAudioSensitivity', 'strimerBassLevel', 'strimerTrebleBoost', 'strimerAudioSmoothing', 'strimerPulseSpeed', 'strimerSnakeDirection'], icon: 'bi-segmented-nav' },
    'Spawner': { props: ['spawn_animation', 'spawn_count', 'spawn_spawnRate', 'spawn_lifetime', 'spawn_speed', 'spawn_speedVariance', 'spawn_gravity', 'spawn_spread'], icon: 'bi-broadcast' },
    'Particle': { props: ['spawn_shapeType', 'spawn_size', 'spawn_size_randomness', 'spawn_rotationSpeed', 'spawn_rotationVariance', 'spawn_initialRotation_random', 'spawn_matrixCharSet', 'spawn_matrixTrailLength', 'spawn_matrixEnableGlow', 'spawn_matrixGlowSize', 'spawn_matrixGlowColor', 'spawn_svg_path', 'spawn_enableTrail', 'spawn_trailLength', 'spawn_trailSpacing'], icon: 'bi-stars' }
};

const INITIAL_CONFIG_TEMPLATE = `
    <meta title="Untitled Efffect" />
    <meta description="Built with Effect Builder (https://joseamirandavelez.github.io/EffectBuilder/), by Jose Miranda" />
    <meta publisher="SRGB Interactive Effect Builder" />
    <meta property="enableAnimation" label="Enable Animation" type="boolean" default="true" />
    <meta property="enableSound" label="Enable Sound" type="boolean" default="false" />
    <meta property="enablePalette" label="Enable Global Color Palette" type="boolean" default="false" />
    <meta property="globalGradientStops" label="Global Gradient" type="gradientpicker" default='[{"color":"#ff0000","position":0},{"color":"#00ff00","position":0.5},{"color":"#0000ff","position":1}]' />
    <meta property="enableGlobalCycle" label="Enable Global Color Cycle" type="boolean" default="false" />
    <meta property="globalCycleSpeed" label="Global Color Cycle Speed" type="number" default="10" min="0" max="100" />

    <meta property="obj1_shape" label="Small Clock: Shape" type="combobox" values="rectangle,circle,ring,text" default="text" />
    <meta property="obj1_x" label="Small Clock: X Position" type="number" min="0" max="320" default="0" />
    <meta property="obj1_y" label="Small Clock: Y Position" type="number" min="0" max="200" default="35" />
    <meta property="obj1_width" label="Small Clock: Width/Outer Diameter" type="number" min="2" max="320" default="130" />
    <meta property="obj1_height" label="Small Clock: Height" type="number" min="2" max="200" default="17" />
    <meta property="obj1_rotation" label="Small Clock: Rotation" type="number" min="-360" max="360" default="0" />
    <meta property="obj1_innerDiameter" label="Small Clock: Inner Diameter" type="number" min="1" max="318" default="50" />
    <meta property="obj1_numberOfSegments" label="Small Clock: Segments" type="number" min="1" max="50" default="8" />
    <meta property="obj1_angularWidth" label="Small Clock: Segment Angle" type="number" min="1" max="360" default="20" />
    <meta property="obj1_rotationSpeed" label="Small Clock: Rotation Speed" type="number" min="-100" max="100" default="0" />
    <meta property="obj1_animationSpeed" label="Small Clock: Animation Speed" type="number" min="1" max="50" default="50" />
    <meta property="obj1_animationMode" label="Small Clock: Animation Mode" type="combobox" values="loop,bounce,bounce-reversed,bounce-random" default="bounce-random" />
    <meta property="obj1_scrollDir" label="Small Clock: Scroll Direction" type="combobox" values="right,left,up,down" default="right" />
    <meta property="obj1_gradType" label="Small Clock: Fill Type" type="combobox" values="solid,linear,radial,alternating,random" default="linear" />
    <meta property="obj1_useSharpGradient" label="Small Clock: Use Sharp Gradient" type="boolean" default="true" />
    <meta property="obj1_cycleColors" label="Small Clock: Cycle Colors" type="boolean" default="false" />
    <meta property="obj1_cycleSpeed" label="Small Clock: Color Cycle Speed" type="number" min="1" max="10" default="10" />
    <meta property="obj1_numberOfRows" label="Small Clock: Number of Rows" type="number" min="1" max="100" default="2" />
    <meta property="obj1_numberOfColumns" label="Small Clock: Number of Columns" type="number" min="1" max="100" default="1" />
    <meta property="obj1_phaseOffset" label="Small Clock: Phase Offset" type="number" min="0" max="100" default="100" />
    <meta property="obj1_text" label="Small Clock: Text" type="textfield" default="Jose Miranda" />
    <meta property="obj1_fontSize" label="Small Clock: Font Size" type="number" min="2" max="100" default="42" />
    <meta property="obj1_textAlign" label="Small Clock: Justification" type="combobox" values="left,center,right" default="center" />
    <meta property="obj1_pixelFont" label="Small Clock: Pixel Font Style" type="combobox" values="small,large" default="small" />
    <meta property="obj1_textAnimation" label="Small Clock: Text Animation" type="combobox" values="none,marquee,typewriter,wave" default="none" />
    <meta property="obj1_textAnimationSpeed" label="Small Clock: Text Scroll Speed" type="number" min="1" max="100" default="10" />
    <meta property="obj1_showTime" label="Small Clock: Show Current Time" type="boolean" default="true" />
    <meta property="obj1_showDate" label="Small Clock: Show Current Date" type="boolean" default="false" />
    <meta property="obj1_autoWidth" label="Small Clock: Auto-Width" type="boolean" default="true" />
    <meta property="obj1_enableAudioReactivity" label="Small Clock: Enable Sound Reactivity" type="boolean" default="true" />
    <meta property="obj1_audioTarget" label="Small Clock: Reactive Property" values="none,Flash,Size,Rotation,Volume Meter" type="combobox" default="Size" />
    <meta property="obj1_audioMetric" label="Small Clock: Audio Metric" values="volume,bass,mids,highs" type="combobox" default="volume" />
    <meta property="obj1_beatThreshold" label="Small Clock: Beat Threshold" min="1" max="100" type="number" default="30" />
    <meta property="obj1_audioSensitivity" label="Small Clock: Sensitivity" min="0" max="200" type="number" default="50" />
    <meta property="obj1_audioSmoothing" label="Small Clock: Smoothing" min="0" max="99" type="number" default="50" />

    <meta property="obj2_shape" label="Large Text: Shape" type="combobox" values="rectangle,circle,ring,text" default="text" />
    <meta property="obj2_x" label="Large Text: X Position" type="number" min="0" max="320" default="-3" />
    <meta property="obj2_y" label="Large Text: Y Position" type="number" min="0" max="200" default="0" />
    <meta property="obj2_width" label="Large Text: Width/Outer Diameter" type="number" min="2" max="320" default="237" />
    <meta property="obj2_height" label="Large Text: Height" type="number" min="2" max="200" default="30" />
    <meta property="obj2_rotation" label="Large Text: Rotation" type="number" min="-360" max="360" default="0" />
    <meta property="obj2_innerDiameter" label="Large Text: Inner Diameter" type="number" min="1" max="318" default="50" />
    <meta property="obj2_numberOfSegments" label="Large Text: Segments" type="number" min="1" max="50" default="8" />
    <meta property="obj2_angularWidth" label="Large Text: Segment Angle" type="number" min="1" max="360" default="20" />
    <meta property="obj2_rotationSpeed" label="Large Text: Rotation Speed" type="number" min="-100" max="100" default="0" />
    <meta property="obj2_animationSpeed" label="Large Text: Animation Speed" type="number" min="1" max="50" default="50" />
    <meta property="obj2_animationMode" label="Large Text: Animation Mode" type="combobox" values="loop,bounce,bounce-reversed,bounce-random" default="bounce-random" />
    <meta property="obj2_scrollDir" label="Large Text: Scroll Direction" type="combobox" values="right,left,up,down" default="right" />
    <meta property="obj2_gradType" label="Large Text: Fill Type" type="combobox" values="solid,linear,radial,alternating,random" default="linear" />
    <meta property="obj2_useSharpGradient" label="Large Text: Use Sharp Gradient" type="boolean" default="true" />
    <meta property="obj2_cycleColors" label="Large Text: Cycle Colors" type="boolean" default="false" />
    <meta property="obj2_cycleSpeed" label="Large Text: Color Cycle Speed" type="number" min="1" max="10" default="10" />
    <meta property="obj2_numberOfRows" label="Large Text: Number of Rows" type="number" min="1" max="100" default="2" />
    <meta property="obj2_numberOfColumns" label="Large Text: Number of Columns" type="number" min="1" max="100" default="1" />
    <meta property="obj2_phaseOffset" label="Large Text: Phase Offset" type="number" min="0" max="100" default="100" />
    <meta property="obj2_text" label="Large Text: Text" type="textfield" default="Interactive Effect Builder" />
    <meta property="obj2_fontSize" label="Large Text: Font Size" type="number" min="2" max="100" default="60" />
    <meta property="obj2_textAlign" label="Large Text: Justification" type="combobox" values="left,center,right" default="left" />
    <meta property="obj2_pixelFont" label="Large Text: Pixel Font Style" type="combobox" values="small,large" default="large" />
    <meta property="obj2_textAnimation" label="Large Text: Text Animation" type="combobox" values="none,marquee,typewriter,wave" default="marquee" />
    <meta property="obj2_textAnimationSpeed" label="Large Text: Text Scroll Speed" type="number" min="1" max="100" default="29" />
    <meta property="obj2_showTime" label="Large Text: Show Current Time" type="boolean" default="false" />
    <meta property="obj2_showDate" label="Large Text: Show Current Date" type="boolean" default="false" />
    <meta property="obj2_autoWidth" label="Large Text: Auto-Width" type="boolean" default="false" />
    <meta property="obj2_enableAudioReactivity" label="Large Text: Enable Sound Reactivity" type="boolean" default="true" />
    <meta property="obj2_audioTarget" label="Large Text: Reactive Property" values="none,Flash,Size,Rotation,Volume Meter" type="combobox" default="Size" />
    <meta property="obj2_audioMetric" label="Large Text: Audio Metric" values="volume,bass,mids,highs" type="combobox" default="volume" />
    <meta property="obj2_beatThreshold" label="Large Text: Beat Threshold" min="1" max="100" type="number" default="30" />
    <meta property="obj2_audioSensitivity" label="Large Text: Sensitivity" min="0" max="200" type="number" default="50" />
    <meta property="obj2_audioSmoothing" label="Large Text: Smoothing" min="0" max="99" type="number" default="50" />

    <meta property="obj3_shape" label="Visualizer: Shape" type="combobox" values="rectangle,circle,ring,text,audio-visualizer" default="audio-visualizer" />
    <meta property="obj3_x" label="Visualizer: X Position" type="number" min="0" max="320" default="10" />
    <meta property="obj3_y" label="Visualizer: Y Position" type="number" min="0" max="200" default="50" />
    <meta property="obj3_width" label="Visualizer: Width/Outer Diameter" type="number" min="2" max="320" default="300" />
    <meta property="obj3_height" label="Visualizer: Height" type="number" min="2" max="200" default="100" />
    <meta property="obj3_rotation" label="Visualizer: Rotation" type="number" min="-360" max="360" default="0" />
    <meta property="obj3_gradType" label="Visualizer: Fill Type" type="combobox" values="solid,linear,radial,alternating,random,rainbow" default="rainbow" />
    <meta property="obj3_animationSpeed" label="Visualizer: Animation Speed" type="number" min="1" max="50" default="10" />
    <meta property="obj3_vizLayout" label="Visualizer: Layout" type="combobox" default="Linear" values="Linear,Circular" />
    <meta property="obj3_vizDrawStyle" label="Visualizer: Draw Style" type="combobox" default="Line" values="Bars,Line,Area" />
    <meta property="obj3_vizBarCount" label="Visualizer: Bar Count" type="number" default="64" min="2" max="128" />
    <meta property="obj3_vizBarSpacing" label="Visualizer: Bar Spacing" type="number" default="2" min="0" max="20" />
    <meta property="obj3_vizSmoothing" label="Visualizer: Smoothing" type="number" default="60" min="0" max="99" />
`;

// --- State Management ---
let unreadNotificationCount = 0;
let userNotificationRef = null; // Reference to the user's notification check document
let baselineStateForURL = {};
let loadedStateSnapshot = null;
let dirtyProperties = new Set();
let leftPanelPixelWidth = 0;
let isRestoring = false;
let configStore = [];
let objects = [];
let selectedObjectIds = [];
let oldSelection = [];
let needsRedraw = false;
let constrainToCanvas = true;
let verticalSplit, horizontalSplit;
let lastHSizes, lastVSizes;
let fps = 50;
let fpsInterval;
let then;
let galleryListener = null;
let lastVisibleDoc = null;
let isLoadingMore = false;
const GALLERY_PAGE_SIZE = 10;
let currentGalleryQuery = null;
let currentProjectDocId = null;
let confirmActionCallback = null;
let exportPayload = {};
let propertyClipboard = null;
let sourceObjectId = null;
let currentSortOption = 'createdAt'; // Default sort
let currentSearchTerm = '';
let galleryQueryUnsubscribe = null; // To manage the Firestore listener

let cachedSnapTargets = null;
let snapLines = [];
let isDragging = false;
let isResizing = false;
let isRotating = false;
let isDraggingNode = false;
let activeNodeDragState = null;
let activeResizeHandle = null;
let initialDragState = [];
let dragStartX = 0;
let dragStartY = 0;
let audioContext;
let analyser;
let frequencyData;
let isAudioSetup = false;
let isPixelArtGalleryLoaded = false;
let pixelArtCache = [];
let pixelArtSearchTerm = '';
let pixelArtCurrentPage = 1;
const PIXEL_ART_ITEMS_PER_PAGE = 9;

/**
 * Calculates the interpolated color at a specific progress point within a set of color stops.
 * @param {number} progress - The position to find the color for (0.0 to 1.0).
 * @param {Array} stops - An array of color stop objects ({color, position}).
 * @returns {string} The interpolated color string.
 */
function getGradientColorAt(progress, stops) {
    const t = (progress % 1.0 + 1.0) % 1.0;
    if (!stops || stops.length === 0) return '#ff00ff';

    // Ensure stops are sorted by position
    const sortedStops = [...stops].sort((a, b) => a.position - b.position);

    // If before the first stop, return the first color
    if (t <= sortedStops[0].position) return sortedStops[0].color;

    // Find the two stops the progress is between
    for (let i = 0; i < sortedStops.length - 1; i++) {
        const s1 = sortedStops[i];
        const s2 = sortedStops[i + 1];
        if (t >= s1.position && t <= s2.position) {
            const range = s2.position - s1.position;
            if (range === 0) return s1.color; // Avoid division by zero
            const amount = (t - s1.position) / range;
            // lerpColor is a global function available from Shape.js
            return lerpColor(s1.color, s2.color, amount);
        }
    }

    // If after the last stop, return the last color
    return sortedStops[sortedStops.length - 1].color;
}

function renderNotificationDropdown(unreadProjects) {
    const listContainer = document.getElementById('notification-list-container');
    const markAllBtn = document.getElementById('mark-all-read-btn');
    const toggleBtn = document.getElementById('notification-dropdown-toggle');
    const user = window.auth.currentUser;

    if (!listContainer) return;

    // We rely on setupNotificationListener to ensure user is logged in before rendering.
    if (!user) {
        // This should ideally never be hit if setupNotificationListener is called correctly, 
        // but serves as a failsafe.
        listContainer.innerHTML = `
            <li class="dropdown-item disabled text-center text-body-secondary small p-3">
                <i class="bi bi-person-fill me-1"></i> Sign in to view notifications.
            </li>
        `;
        markAllBtn.style.display = 'none';
        return;
    }

    markAllBtn.style.display = unreadProjects.length > 0 ? 'inline' : 'none';

    if (unreadProjects.length === 0) {
        listContainer.innerHTML = '<li class="dropdown-item disabled text-center text-body-secondary small p-3">You have no new notifications.</li>';
        return;
    }

    listContainer.innerHTML = '';

    unreadProjects.forEach(notification => { // Renamed 'project' to 'notification' for clarity
        const item = document.createElement('li');

        // Construct the notification message
        const notificationText = (notification.eventType === 'like')
            ? `Your effect <strong>${notification.projectName}</strong> was liked by <strong>${notification.senderName}</strong>!`
            : `New event: ${notification.eventType} from <strong>${notification.senderName}</strong>.`;

        // The outer <li> will hold the click handler
        item.className = 'notification-item-container';

        const timestamp = notification.timestamp && notification.timestamp.toDate
            ? notification.timestamp.toDate()
            : new Date(); // Fallback to current time if timestamp is invalid

        item.innerHTML = `
            <li class="dropdown-item d-flex align-items-start gap-2 p-3">
                <i class="bi bi-heart-fill text-danger fs-5 mt-1 flex-shrink-0"></i>
                <div class="flex-grow-1">
                    <p class="mb-0 small">
                        ${notificationText}
                    </p>
                    <small class="text-body-secondary">${timeAgo(timestamp)} ago</small> 
                </div>
            </li>
        `;
        listContainer.appendChild(item);
    });

    toggleBtn.disabled = false;
}

function getLikedProjectsFromLocalStorage() {
    const user = window.auth.currentUser;
    if (!user) return [];

    // Use the user's UID to make the storage key unique
    const storageKey = `likedProjects_${user.uid}`;
    try {
        return JSON.parse(localStorage.getItem(storageKey) || '[]');
    } catch (e) {
        console.error("Error reading localStorage for likes:", e);
        return [];
    }
}

function rgbToHex(rgbString) {
    const match = rgbString.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (!match) return '#000000';
    const toHex = c => ('0' + parseInt(c, 10).toString(16)).slice(-2);
    return `#${toHex(match[1])}${toHex(match[2])}${toHex(match[3])}`;
}

function formatPixelData(data) {
    if (!Array.isArray(data)) return JSON.stringify(data);

    let result = "[\n";
    result += data.map(row => JSON.stringify(row)).join(",\n");
    result += "\n]";

    return result;
}

function renderPixelArtPreview(canvas, frameDataString, gradientStops = []) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Use a checkerboard pattern for the background to show transparency
    ctx.fillStyle = '#444';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#666';
    for (let i = 0; i < canvas.width; i += 8) {
        for (let j = 0; j < canvas.height; j += 8) {
            if ((i / 8 + j / 8) % 2 == 0) {
                ctx.fillRect(i, j, 8, 8);
            }
        }
    }

    try {
        const data = JSON.parse(frameDataString);
        if (!Array.isArray(data) || data.length === 0 || !Array.isArray(data[0])) return;

        const rows = data.length;
        const cols = data[0].length;
        if (cols === 0) return;
        const cellWidth = canvas.width / cols;
        const cellHeight = canvas.height / rows;

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const value = data[r]?.[c] || 0;
                if (value === 0) continue; // Skip transparent/empty pixels

                let fillColor = '#FF00FF'; // Default error color

                // This logic now mirrors the main renderer in Shape.js
                switch (value) {
                    case 0.7: // "Fill Style" - render as a semi-transparent gray
                        fillColor = 'rgba(180, 180, 180, 0.7)';
                        break;
                    case 1.0: // White
                        fillColor = '#FFFFFF';
                        break;
                    case 0.3: // "Color 1" from the editor palette
                        fillColor = gradientStops[0]?.color || '#FF00FF';
                        break;
                    case 0.4: // "Color 2" from the editor palette
                        fillColor = gradientStops[1]?.color || '#00FFFF';
                        break;
                    default:
                        // Handle integer index values from imported GIFs
                        if (value >= 2) {
                            const index = Math.round(value) - 2;
                            if (gradientStops && gradientStops[index]) {
                                fillColor = gradientStops[index].color;
                            }
                        }
                        break;
                }

                ctx.fillStyle = fillColor;
                // Use floor/ceil to avoid sub-pixel rendering gaps
                ctx.fillRect(Math.floor(c * cellWidth), Math.floor(r * cellHeight), Math.ceil(cellWidth), Math.ceil(cellHeight));
            }
        }
    } catch (e) {
        ctx.fillStyle = 'red';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', canvas.width / 2, canvas.height / 2);
    }
}

function colorDistance(rgb1, rgb2) {
    const rDiff = rgb1.r - rgb2.r;
    const gDiff = rgb1.g - rgb2.g;
    const bDiff = rgb1.b - rgb2.b;
    return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}

function findClosestColor(rgb, colorPalette) {
    let minDistanceSq = Infinity;
    let closestColorHex = null;

    for (const paletteColor of colorPalette) {
        // Using squared distance is faster as it avoids the square root calculation.
        const distSq = Math.pow(rgb.r - paletteColor.r, 2) +
            Math.pow(rgb.g - paletteColor.g, 2) +
            Math.pow(rgb.b - paletteColor.b, 2);

        if (distSq < minDistanceSq) {
            minDistanceSq = distSq;
            closestColorHex = paletteColor.hex;
        }

        // If a perfect match is found, we can stop searching.
        if (minDistanceSq === 0) {
            break;
        }
    }
    return closestColorHex;
}

function handleURLParameters() {
    const params = new URLSearchParams(window.location.search);
    const modalToShow = params.get('show');

    if (!modalToShow) {
        return; // No parameter found, do nothing.
    }

    let modalEl = null;
    if (modalToShow.toLowerCase() === 'about') {
        modalEl = document.getElementById('about-modal');
    } else if (modalToShow.toLowerCase() === 'help') {
        modalEl = document.getElementById('help-modal');
    }

    if (modalEl) {
        // Now we can create and show the modal immediately.
        const modal = new bootstrap.Modal(modalEl);
        modal.show();
    }
}

function updateColorControls() {
    const paletteEnabled = document.getElementById('enablePalette')?.checked;

    // A list of all control types that should be disabled when the global palette is on
    const controlsToToggle = [
        'gradType', 'gradientStops', 'useSharpGradient', 'cycleColors', 'cycleSpeed',
        'strokeGradType', 'strokeGradientStops', 'strokeUseSharpGradient', 'strokeCycleColors', 'strokeCycleSpeed'
    ];

    objects.forEach(obj => {
        const fieldset = form.querySelector(`fieldset[data-object-id="${obj.id}"]`);
        if (!fieldset) return;

        controlsToToggle.forEach(controlName => {
            const control = fieldset.querySelector(`[name$="_${controlName}"]`);
            if (control) {
                // Find the parent form group to disable everything inside it (labels, inputs, etc.)
                const formGroup = control.closest('.mb-3, .card-body');
                if (formGroup) {
                    const inputs = formGroup.querySelectorAll('input, select, button, textarea');
                    inputs.forEach(input => {
                        // The 'enableStroke' checkbox should remain active
                        if (!input.name.endsWith('_enableStroke')) {
                            input.disabled = paletteEnabled;
                        }
                    });
                }
            }
        });
    });
}

function getBoundingBox(obj) {
    const corners = [
        obj.getWorldCoordsOfCorner('top-left'),
        obj.getWorldCoordsOfCorner('top-right'),
        obj.getWorldCoordsOfCorner('bottom-right'),
        obj.getWorldCoordsOfCorner('bottom-left')
    ];
    return {
        minX: Math.min(...corners.map(c => c.x)),
        minY: Math.min(...corners.map(c => c.y)),
        maxX: Math.max(...corners.map(c => c.x)),
        maxY: Math.max(...corners.map(c => c.y)),
    };
}



document.addEventListener('DOMContentLoaded', function () {
    const exportOptionsModalEl = document.getElementById('export-options-modal');

    if (exportOptionsModalEl) {
        // Use event delegation for better performance
        exportOptionsModalEl.addEventListener('change', (e) => {
            const target = e.target;

            // Part 1: Logic for when a GROUP master checkbox is clicked
            if (target.classList.contains('group-master-check')) {
                const groupId = target.dataset.groupId;
                const childCheckboxes = exportOptionsModalEl.querySelectorAll(`.property-check.${groupId}`);

                // Set all child checkboxes to match the master's state
                childCheckboxes.forEach(child => {
                    child.checked = target.checked;
                });
            }
            // Part 2: Logic for when an INDIVIDUAL property checkbox is clicked
            else if (target.classList.contains('property-check')) {
                // Find the master checkbox for this group
                const groupId = Array.from(target.classList).find(c => c.startsWith('export-group-'));
                if (!groupId) return;

                const masterCheckbox = exportOptionsModalEl.querySelector(`[data-group-id="${groupId}"]`);
                const childCheckboxes = Array.from(exportOptionsModalEl.querySelectorAll(`.property-check.${groupId}`));

                const total = childCheckboxes.length;
                const checkedCount = childCheckboxes.filter(child => child.checked).length;

                // Update the master checkbox state based on how many children are checked
                if (checkedCount === 0) {
                    masterCheckbox.checked = false;
                    masterCheckbox.indeterminate = false; // Not checked
                } else if (checkedCount === total) {
                    masterCheckbox.checked = true;
                    masterCheckbox.indeterminate = false; // Fully checked
                } else {
                    masterCheckbox.checked = false;
                    masterCheckbox.indeterminate = true;  // Partially checked
                }
            }
        });

        exportOptionsModalEl.addEventListener('click', (e) => {
            const presetButton = e.target.closest('button[data-preset]');
            if (!presetButton) return;

            const preset = presetButton.dataset.preset;
            const allCheckboxes = exportOptionsModalEl.querySelectorAll('input.property-check');

            // Define which properties belong to which preset
            const presetMap = {
                animation: ['Fill-Animation', 'Color-Animation', 'Oscilloscope', 'Tetris', 'Fire', 'Strimer', 'Spawner', 'Object Fill', 'Object'],
                colors: ['Fill-Animation', 'Stroke', 'Object Fill', 'Particle'],
                geometry: ['Geometry', 'Polyline', 'Text']
            };

            // Define the specific properties for our new presets
            const minimalProps = ['gradientStops', 'animationSpeed'];
            const staticPropsToDisable = [
                'animationSpeed', 'rotationSpeed', 'cycleColors', 'cycleSpeed', 'textAnimation', 'textAnimationSpeed',
                'pathAnim_speed', 'pathAnim_animationSpeed', 'pathAnim_cycleSpeed', 'spawn_speed', 'spawn_rotationSpeed',
                'strimerAnimationSpeed', 'strimerPulseSpeed', 'oscAnimationSpeed', 'strokeAnimationSpeed', 'strokeCycleSpeed', 'strokeRotationSpeed'
            ];

            const gradientProps = [
                'gradientStops',
                'strokeGradientStops',
                'pathAnim_gradColor1',
                'pathAnim_gradColor2'
            ];

            // Set the state of all checkboxes based on the chosen preset
            allCheckboxes.forEach(cb => {
                const propName = cb.name.substring(cb.name.indexOf('_') + 1);

                if (preset === 'minimal') {
                    cb.checked = minimalProps.includes(propName);
                } else if (preset === 'static') {
                    cb.checked = !staticPropsToDisable.includes(propName);
                } else if (preset === 'gradients') {
                    cb.checked = gradientProps.includes(propName);
                } else {
                    const groupsForPreset = presetMap[preset] || [];
                    let isInGroup = false;
                    for (const groupName of groupsForPreset) {
                        if (controlGroupMap[groupName] && controlGroupMap[groupName].props.includes(propName)) {
                            isInGroup = true;
                            break;
                        }
                    }
                    cb.checked = isInGroup;
                }
            });

            // Manually trigger a 'change' event on the first checkbox to update all master checkboxes' indeterminate states
            const firstCheckbox = exportOptionsModalEl.querySelector('input.property-check');
            if (firstCheckbox) {
                firstCheckbox.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });

        exportOptionsModalEl.addEventListener('show.bs.modal', () => {
            const accordionContainer = document.getElementById('export-options-accordion');
            const modalBody = document.getElementById('export-options-body');

            // Clear previous content but keep the new elements we're about to add
            accordionContainer.innerHTML = '';

            // Remove old global buttons if they exist, to prevent duplication
            modalBody.querySelector('#export-global-controls')?.remove();
            modalBody.querySelector('#export-preset-controls')?.remove(); // <-- ADD THIS LINE

            // --- Add Global Shortcut Buttons ---
            const globalControls = document.createElement('div');
            globalControls.id = 'export-global-controls';
            globalControls.className = 'd-flex gap-2 border-bottom pb-3 mb-3';
            globalControls.innerHTML = `
        <button type="button" class="btn btn-sm btn-outline-secondary flex-grow-1"><i class="bi bi-check-square me-2"></i>Expose All</button>
        <button type="button" class="btn btn-sm btn-outline-secondary flex-grow-1"><i class="bi bi-square me-2"></i>Hardcode All</button>
    `;
            // Add the controls right after the introductory paragraph
            modalBody.querySelector('p').insertAdjacentElement('afterend', globalControls);

            const presetControls = document.createElement('div');
            presetControls.id = 'export-preset-controls';
            presetControls.className = 'd-flex flex-wrap gap-2 border-bottom pb-3 mb-3';
            presetControls.innerHTML = `
    <span class="text-body-secondary small me-2 align-self-center">Presets:</span>
    <div class="btn-group btn-group-sm" role="group">
        <button type="button" class="btn btn-outline-info" data-preset="animation">Animation</button>
        <button type="button" class="btn btn-outline-info" data-preset="colors">Colors</button>
        <button type="button" class="btn btn-outline-info" data-preset="geometry">Geometry</button>
        <button type="button" class="btn btn-outline-info" data-preset="gradients">Gradients</button> </div>
    <div class="vr mx-2"></div>
    <div class="btn-group btn-group-sm" role="group">
        <button type="button" class="btn btn-outline-success" data-preset="minimal">Minimal (User-Friendly)</button>
        <button type="button" class="btn btn-outline-success" data-preset="static">Static (No Animation)</button>
    </div>
`;
            globalControls.insertAdjacentElement('afterend', presetControls);

            globalControls.querySelector('button:first-child').addEventListener('click', () => {
                exportOptionsModalEl.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                    cb.checked = true;
                    cb.indeterminate = false;
                });
            });
            globalControls.querySelector('button:last-child').addEventListener('click', () => {
                exportOptionsModalEl.querySelectorAll('input[type="checkbox"]').forEach(cb => {
                    cb.checked = false;
                    cb.indeterminate = false;
                });
            });
            // --- End Global Shortcut Buttons ---

            const forceHardcode = ['pixelArtFrames', 'polylineNodes'];

            objects.forEach((obj, index) => {
                const validPropsForShape = shapePropertyMap[obj.shape] || [];
                const accordionId = `export-accordion-${obj.id}`;

                const item = document.createElement('div');
                item.className = 'accordion-item';
                item.innerHTML = `
            <h2 class="accordion-header">
                <button class="accordion-button ${index > 0 ? 'collapsed' : ''}" type="button" data-bs-toggle="collapse" data-bs-target="#collapse-${accordionId}" aria-expanded="${index === 0}">
                    ${obj.name || `Object ${obj.id}`}
                </button>
            </h2>
            <div id="collapse-${accordionId}" class="accordion-collapse collapse ${index === 0 ? 'show' : ''}" data-bs-parent="#export-options-accordion">
                <div class="accordion-body"></div>
            </div>
        `;

                const body = item.querySelector('.accordion-body');

                for (const groupName in controlGroupMap) {
                    const groupProps = controlGroupMap[groupName].props;
                    const relevantConfigs = configStore.filter(conf => {
                        if (!conf.property || !conf.property.startsWith(`obj${obj.id}_`)) return false;
                        const propName = conf.property.substring(conf.property.indexOf('_') + 1);
                        return !forceHardcode.includes(propName) && groupProps.includes(propName) && validPropsForShape.includes(propName);
                    });

                    if (relevantConfigs.length > 0) {
                        const groupId = `export-group-${obj.id}-${groupName.replace(/\\s/g, '-')}`;
                        const groupContainer = document.createElement('div');
                        groupContainer.className = 'mb-3';

                        // --- Add Group Master Checkbox ---
                        groupContainer.innerHTML = `
                    <div class="form-check bg-body-tertiary rounded p-2 mb-2">
                        <input class="form-check-input group-master-check" type="checkbox" id="${groupId}-master" data-group-id="${groupId}" checked>
                        <label class="form-check-label fw-bold" for="${groupId}-master">
                            ${groupName}
                        </label>
                    </div>
                `;

                        relevantConfigs.forEach(conf => {
                            const label = conf.label.split(':').slice(1).join(':').trim();
                            const checkWrapper = document.createElement('div');
                            checkWrapper.className = 'form-check ms-3';
                            // --- Add class to link to master checkbox ---
                            checkWrapper.innerHTML = `
                        <input class="form-check-input property-check ${groupId}" type="checkbox" id="${conf.property}-export-check" name="${conf.property}" checked>
                        <label class="form-check-label" for="${conf.property}-export-check">
                            ${label}
                        </label>
                    `;
                            groupContainer.appendChild(checkWrapper);
                        });
                        body.appendChild(groupContainer);
                    }
                }
                accordionContainer.appendChild(item);
            });
        });

        // This handles the final export confirmation
        document.getElementById('export-copy-code-btn').addEventListener('click', async () => {
            const checkboxes = exportOptionsModalEl.querySelectorAll('input[type="checkbox"]');
            const exposedProperties = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.name);

            const payload = buildExportPayload(exposedProperties);

            if (payload.finalHtml) {
                navigator.clipboard.writeText(payload.finalHtml).then(() => {
                    showToast("HTML code copied to clipboard!", 'success');
                    const exportModal = bootstrap.Modal.getInstance(exportOptionsModalEl);
                    if (exportModal) exportModal.hide();
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                    showToast("Could not copy code. See console for details.", 'danger');
                });
            }
        });

        // Listener for the new "Generate .zip File" button
        document.getElementById('confirm-export-zip-btn').addEventListener('click', async () => {
            const checkboxes = exportOptionsModalEl.querySelectorAll('input[type="checkbox"]');
            const exposedProperties = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.name);

            const exportModal = bootstrap.Modal.getInstance(exportOptionsModalEl);
            if (exportModal) exportModal.hide();

            // Call your existing generateAndDownloadZip function, but pass it the payload
            await generateAndDownloadZip(exposedProperties);
        });

        function buildExportPayload(exposedProperties = []) {
            // 1. Ensure the live objects are in sync with the form controls
            updateObjectsFromForm();

            // 2. Generate the meta tags and JS variables based on the user's selections
            const { metaTags, jsVars, allKeys, jsVarKeys } = generateOutputScript(exposedProperties);

            // 3. Get the title and generate a thumbnail for the export package
            const effectTitle = getControlValues()['title'] || 'MyEffect';
            const thumbnailDataUrl = generateThumbnail(document.getElementById('signalCanvas'));
            const safeFilename = effectTitle.replace(/[\\s/\\?%*:|"<>]/g, '_');

            // 4. Define the static parts of the exported file
            const styleContent = 'body { background-color: #000; overflow: hidden; margin: 0; } canvas { width: 100%; height: 100%; }';
            const bodyContent = '<body><canvas id="signalCanvas"></canvas></body>';

            // 5. Bundle all required helper functions and the Shape class into strings
            // FIX: This converts single-line comments to multi-line to prevent truncation
            const safeShapeClassString = Shape.toString().replace(/\/\/(.*)/g, '/*$1*/');
            const allHelperFunctions = [
                hexToHsl, hslToHex, parseColorToRgba, lerpColor, getPatternColor,
                drawPixelText, getSignalRGBAudioMetrics, drawTimePlotAxes
            ].map(fn => `const ${fn.name} = ${fn.toString()};`).join('\n\n');

            const formattedKeys = '[' + allKeys.map(key => `'${key}'`).join(',') + ']';

            // 6. Assemble the final, self-contained runtime script
            const exportedScript = `
document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('signalCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 320;
    canvas.height = 200;
    let objects = [];
    
    ${jsVars}

    const FONT_DATA_4PX = ${JSON.stringify(FONT_DATA_4PX)};
    const FONT_DATA_5PX = ${JSON.stringify(FONT_DATA_5PX)};
    ${allHelperFunctions}
    
    const Shape = ${safeShapeClassString};

    let then;
    const allPropKeys = ${formattedKeys};
    const jsProperties = ${JSON.stringify(jsVarKeys)};

    function updateObjectFromWindow(obj) {
        const id = obj.id;
        const newProps = {};
        const fillStops = [];
        for (let i = 1; i <= 10; i++) {
            const fcKey = \`obj\${id}_gradColor_\${i}\`;
            const fpKey = \`obj\${id}_gradPosition_\${i}\`;
            if (window[fcKey] !== undefined && window[fpKey] !== undefined) {
                fillStops.push({ color: window[fcKey], position: parseFloat(window[fpKey]) / 100.0 });
            }
        }
        if (fillStops.length > 0) newProps.gradient = { stops: fillStops.sort((a,b) => a.position - b.position) };
        
        const strokeStops = [];
        for (let i = 1; i <= 10; i++) {
             const scKey = \`obj\${id}_strokeColor_\${i}\`;
             const spKey = \`obj\${id}_strokePosition_\${i}\`;
             if (window[scKey] !== undefined && window[spKey] !== undefined) {
                strokeStops.push({ color: window[scKey], position: parseFloat(window[spKey]) / 100.0 });
            }
        }
        if (strokeStops.length > 0) newProps.strokeGradient = { stops: strokeStops.sort((a,b) => a.position - b.position) };

        allPropKeys.forEach(key => {
            if (key.startsWith(\`obj\${id}_\`) && window[key] !== undefined) {
                const propName = key.substring(key.indexOf('_') + 1);
                if (propName.includes('Color_') || propName.includes('Position_')) return;
                let value = window[key];
                if (value === "true") value = true;
                if (value === "false") value = false;
                if (propName === 'scrollDir') newProps.scrollDirection = value;
                else if (propName === 'strokeScrollDir') newProps.strokeScrollDir = value;
                else newProps[propName] = value;
            }
        });
        obj.update(newProps);
    }

    function createInitialObjects() {
        if (allPropKeys.length === 0) return;
        
        const uniqueIds = [...new Set(allPropKeys.map(p => {
            if (!p || !p.startsWith('obj')) return null;
            const end = p.indexOf('_');
            if (end <= 3) return null;
            const idString = p.substring(3, end);
            const id = parseInt(idString, 10);
            return isNaN(id) ? null : String(id);
        }).filter(id => id !== null))];

        objects = uniqueIds.map(id => {
            const config = { id: parseInt(id), ctx: ctx, gradient: {}, strokeGradient: {} };
            const prefix = 'obj' + id + '_';
            
            const fillStops = [];
            for (let i = 1; i <= 10; i++) {
                const fcKey = prefix + 'gradColor_' + i;
                const fpKey = prefix + 'gradPosition_' + i;
                if (typeof window[fcKey] !== 'undefined' && typeof window[fpKey] !== 'undefined') {
                    fillStops.push({ color: window[fcKey], position: parseFloat(window[fpKey]) / 100.0 });
                }
            }
            if (fillStops.length > 0) config.gradientStops = fillStops.sort((a,b) => a.position - b.position);
            
            const strokeStops = [];
            for (let i = 1; i <= 10; i++) {
                const scKey = prefix + 'strokeColor_' + i;
                const spKey = prefix + 'strokePosition_' + i;
                if (typeof window[scKey] !== 'undefined' && typeof window[spKey] !== 'undefined') {
                    strokeStops.push({ color: window[scKey], position: parseFloat(window[spKey]) / 100.0 });
                }
            }
            if (strokeStops.length > 0) config.strokeGradientStops = strokeStops.sort((a,b) => a.position - b.position);

            allPropKeys.filter(p => p.startsWith(prefix)).forEach(key => {
                const propName = key.substring(prefix.length);
                if (propName.includes('gradColor_') || propName.includes('gradPosition_') || propName.includes('strokeColor_') || propName.includes('strokePosition_')) return;
                let value;
                try {
                    if (eval(\`typeof \${key}\`) !== 'undefined') { value = eval(key); }
                } catch (e) {
                    if (typeof window[key] !== 'undefined') { value = window[key]; }
                }
                if (typeof value !== 'undefined') {
                    if (value === "true") value = true;
                    if (value === "false") value = false;
                    if (propName === 'pixelArtFrames' || propName === 'polylineNodes') {
                        try { config[propName] = (typeof value === 'string') ? JSON.parse(value) : value; } catch(e) {}
                    } else if (propName === 'scrollDir') {
                        config.scrollDirection = value;
                    } else if (propName === 'strokeScrollDir') {
                        config.strokeScrollDir = value;
                    } else {
                        config[propName] = value;
                    }
                }
            });
            return new Shape(config);
        });
    }

    function drawFrame(deltaTime = 0) {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const shouldAnimate = typeof enableAnimation !== 'undefined' ? !!enableAnimation : true;
        const soundEnabled = typeof enableSound !== 'undefined' ? !!enableSound : false;
        const audioData = soundEnabled ? getSignalRGBAudioMetrics() : { bass: { avg: 0 }, mids: { avg: 0 }, highs: { avg: 0 }, volume: { avg: 0 }, frequencyData: [] };
        const sensorData = {};
        const neededSensors = [...new Set(objects.map(o => o.userSensor).filter(Boolean))];
        neededSensors.forEach(sensorName => { sensorData[sensorName] = (typeof engine !== 'undefined') ? engine.getSensorValue(sensorName) : { value: 0 }; });
        const useGlobalPalette = typeof enablePalette !== 'undefined' ? !!enablePalette : false;
        const useGlobalCycle = typeof enableGlobalCycle !== 'undefined' ? !!enableGlobalCycle : false;
        const gCycleSpeed = typeof globalCycleSpeed !== 'undefined' ? globalCycleSpeed : 10;
        let gStops = [];
        if (useGlobalPalette) {
            for (let i = 1; i <= 10; i++) {
                if (typeof window['globalColor_' + i] !== 'undefined' && typeof window['globalPosition_' + i] !== 'undefined') {
                    gStops.push({ color: window['globalColor_' + i], position: parseFloat(window['globalPosition_' + i]) / 100.0 });
                }
            }
            if(gStops.length > 0) gStops.sort((a,b) => a.position - b.position);
        }
        for (let i = objects.length - 1; i >= 0; i--) {
            const obj = objects[i];
            updateObjectFromWindow(obj);
            const originalGradient = JSON.parse(JSON.stringify(obj.gradient));
            const originalStrokeGradient = JSON.parse(JSON.stringify(obj.strokeGradient));
            const originalCycleColors = obj.cycleColors;
            const originalCycleSpeed = obj.cycleSpeed;
            if (useGlobalCycle) {
                const speed = (gCycleSpeed || 0) / 50.0;
                obj.cycleColors = true; obj.cycleSpeed = speed;
                obj.strokeCycleColors = true; obj.strokeCycleSpeed = speed;
            }
            if (useGlobalPalette && gStops.length > 0) {
                if (obj.shape !== 'pixel-art') {
                    obj.gradient.stops = gStops;
                    obj.strokeGradient.stops = gStops;
                }
            }
            const dt = shouldAnimate ? deltaTime : 0;
            obj.updateAnimationState(audioData, sensorData, dt);
            obj.draw(false, audioData, {});
            obj.gradient = originalGradient;
            obj.strokeGradient = originalStrokeGradient;
            obj.cycleColors = originalCycleColors;
            obj.cycleSpeed = originalCycleSpeed;
        }
    }
    function animate(timestamp) {
        requestAnimationFrame(animate);
        const now = timestamp;
        let deltaTime = (now - (then || now)) / 1000.0;
        if (deltaTime > 0.1) deltaTime = 0.1;
        then = now;
        drawFrame(deltaTime);
    }
    function init() {
        createInitialObjects();
        then = window.performance.now();
        animate(then);
    }
    init();
});
`;

            // 7. Assemble the full HTML string with REAL newlines
            const finalHtml = [
                '<!DOCTYPE html>', '<html lang="en">', '<head>', '<meta charset="UTF-8">',
                `<title>${effectTitle}</title>`, metaTags, '<style>', styleContent, '</style>',
                '</head>', bodyContent, '<script>', exportedScript, '</script>', '</html>'
            ].join('\n'); // <-- This now uses a single backslash for a real newline

            return {
                safeFilename,
                finalHtml,
                thumbnailDataUrl,
                imageExtension: 'png',
                exportDate: new Date()
            };
        }

        // This is a new function that replaces the old exportFile logic
        async function generateAndDownloadZip(exposedProperties = []) {
            const exportButton = document.getElementById('export-btn');
            exportButton.disabled = true;
            exportButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Exporting...';

            try {
                const { safeFilename, finalHtml, thumbnailDataUrl, imageExtension, exportDate } = buildExportPayload(exposedProperties);

                if (!finalHtml) {
                    throw new Error("Failed to generate HTML content.");
                };

                const zip = new JSZip();
                zip.file(`${safeFilename}.html`, finalHtml, { date: exportDate });

                const imageResponse = await fetch(thumbnailDataUrl);
                const imageBlob = await imageResponse.blob();
                zip.file(`${safeFilename}.${imageExtension}`, imageBlob, { date: exportDate });

                const zipBlob = await zip.generateAsync({ type: "blob" });
                const link = document.createElement('a');
                link.href = URL.createObjectURL(zipBlob);
                link.download = `${safeFilename}.zip`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);

                showToast("Zip file download started.", 'info');
                await incrementDownloadCount();

            } catch (error) {
                console.error('Export failed:', error);
                showToast('Failed to export file: ' + error.message, 'danger');
            } finally {
                exportButton.disabled = false;
                exportButton.innerHTML = '<i class="bi bi-download me-1"></i> Export';
            }
        }
    }

    const confirmGifUploadBtn = document.getElementById('confirm-gif-upload-btn');
    if (confirmGifUploadBtn) {
        confirmGifUploadBtn.addEventListener('click', () => {
            if (selectedObjectIds.length !== 1) {
                showToast("Please select a single pixel art object first.", "warning");
                return;
            }
            const objectId = selectedObjectIds[0];
            const gifInput = document.getElementById(`gif-upload-input-${objectId}`);
            if (gifInput) {
                gifInput.click();
            }
        });
    }

    const processPastedImage = (image, targetWidth, targetHeight, color1, color2) => {
        const targetPalette = [
            { value: 1.0, name: 'White', rgb: { r: 255, g: 255, b: 255 } },
            { value: 0.3, name: 'Color 1', rgb: parseColorToRgba(color1) },
            { value: 0.4, name: 'Color 2', rgb: parseColorToRgba(color2) },
            { value: 0.0, name: 'Black', rgb: { r: 0, g: 0, b: 0 } }
            // Note: 'Fill Style' is intentionally left out to be handled separately
        ];

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = targetWidth;
        tempCanvas.height = targetHeight;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(image, 0, 0, targetWidth, targetHeight);
        const imageData = tempCtx.getImageData(0, 0, targetWidth, targetHeight).data;

        const colorMap = new Map();
        const availablePalette = [...targetPalette];

        // Find all unique, non-transparent colors in the image
        const uniqueColors = new Set();
        for (let i = 0; i < imageData.length; i += 4) {
            if (imageData[i + 3] > 128) { // Only consider opaque pixels
                uniqueColors.add(JSON.stringify({ r: imageData[i], g: imageData[i + 1], b: imageData[i + 2] }));
            }
        }

        // Map the most common unique colors to our available palette
        Array.from(uniqueColors).slice(0, availablePalette.length).forEach(colorStr => {
            const sourceRgb = JSON.parse(colorStr);
            let bestMatch = null;
            let minDistance = Infinity;
            let bestMatchIndex = -1;

            availablePalette.forEach((paletteColor, index) => {
                const distance = colorDistance(sourceRgb, paletteColor.rgb);
                if (distance < minDistance) {
                    minDistance = distance;
                    bestMatch = paletteColor;
                    bestMatchIndex = index;
                }
            });

            if (bestMatch) {
                colorMap.set(colorStr, bestMatch);
                availablePalette.splice(bestMatchIndex, 1);
            }
        });

        // Create the final pixel data array
        const newData = Array(targetHeight).fill(0).map(() => Array(targetWidth).fill(0));
        for (let i = 0; i < imageData.length; i += 4) {
            const r = Math.floor(i / (targetWidth * 4));
            const c = (i / 4) % targetWidth;

            // --- THIS IS THE KEY ---
            // If the pixel is transparent, assign it the Fill Style value (0.7).
            // Otherwise, find its mapped color.
            if (imageData[i + 3] < 128) {
                newData[r][c] = 0.7; // Assign Fill Style to transparent pixels
            } else {
                const key = JSON.stringify({ r: imageData[i], g: imageData[i + 1], b: imageData[i + 2] });
                const mappedColor = colorMap.get(key);
                newData[r][c] = mappedColor ? mappedColor.value : 0.0; // Default to black if no match
            }
        }

        return newData;
    };

    const handleGifPaste = async (gifBlob, objectId) => {
        try {
            const buffer = await gifBlob.arrayBuffer();
            const gif = await parseGIF(buffer);
            const frames = await decompressFrames(gif, true);

            if (!frames || !frames.length) {
                showToast("Could not extract frames from GIF.", "warning");
                return;
            }

            const allColors = new Set();
            const addColorsFromTable = (table) => {
                if (table) {
                    for (const color of table) {
                        if ((Array.isArray(color) || color instanceof Uint8Array) && color.length === 3) {
                            allColors.add(JSON.stringify(Array.from(color)));
                        }
                    }
                }
            };

            addColorsFromTable(gif.gct);
            frames.forEach(frame => addColorsFromTable(frame.lct));

            if (allColors.size === 0) {
                showToast("Could not find a valid color palette in this GIF.", "danger");
                return;
            }

            const uniqueColors = new Map();
            allColors.forEach(colorStr => {
                const [r, g, b] = JSON.parse(colorStr);
                const hex = rgbToHex(`rgb(${r},${g},${b})`);
                if (!uniqueColors.has(hex)) {
                    const hsl = hexToHsl(hex);
                    uniqueColors.set(hex, { hex, r, g, b, h: hsl[0], s: hsl[1], l: hsl[2] });
                }
            });

            const sortedColors = [...uniqueColors.values()].sort((a, b) => {
                if (a.h < b.h) return -1; if (a.h > b.h) return 1;
                if (a.s < b.s) return -1; if (a.s > b.s) return 1;
                return a.l - b.l;
            });

            const newGradientStops = sortedColors.map((color, index) => ({
                color: color.hex,
                position: sortedColors.length > 1 ? index / (sortedColors.length - 1) : 0.5
            }));

            // FIX: Map colors to their integer index (plus an offset) instead of a decimal position.
            const colorToIndexMap = new Map(sortedColors.map((color, index) => [color.hex, index + 2]));

            const targetWidth = parseInt(document.getElementById('gif-target-width').value, 10) || 32;
            const targetHeight = parseInt(document.getElementById('gif-target-height').value, 10) || 32;
            const newFramesData = [];
            const masterCanvas = document.createElement('canvas');
            masterCanvas.width = gif.lsd.width;
            masterCanvas.height = gif.lsd.height;
            const masterCtx = masterCanvas.getContext('2d');
            let savedCanvasState = null;

            for (let i = 0; i < frames.length; i++) {
                const frame = frames[i];
                const prevFrame = i > 0 ? frames[i - 1] : null;

                if (prevFrame) {
                    if (prevFrame.disposalType === 2) {
                        const bgColorIndex = gif.lsd.backgroundColorIndex;
                        if (gif.gct && gif.gct[bgColorIndex]) {
                            const [r, g, b] = gif.gct[bgColorIndex];
                            masterCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                            masterCtx.fillRect(prevFrame.dims.left, prevFrame.dims.top, prevFrame.dims.width, prevFrame.dims.height);
                        } else {
                            masterCtx.clearRect(prevFrame.dims.left, prevFrame.dims.top, prevFrame.dims.width, prevFrame.dims.height);
                        }
                    } else if (prevFrame.disposalType === 3 && savedCanvasState) {
                        masterCtx.putImageData(savedCanvasState, 0, 0);
                    }
                }
                savedCanvasState = (frame.disposalType === 3) ? masterCtx.getImageData(0, 0, masterCanvas.width, masterCanvas.height) : null;

                if (frame.pixels && frame.pixels.length > 0) {
                    const patchImageData = masterCtx.createImageData(frame.dims.width, frame.dims.height);
                    const patchData = patchImageData.data;
                    const colorTable = frame.lct || gif.gct;

                    if (colorTable) {
                        for (let j = 0; j < frame.pixels.length; j++) {
                            const colorIndex = frame.pixels[j];
                            if (colorIndex !== frame.transparentIndex && colorTable[colorIndex]) {
                                const color = colorTable[colorIndex];
                                const offset = j * 4;
                                patchData[offset] = color[0];
                                patchData[offset + 1] = color[1];
                                patchData[offset + 2] = color[2];
                                patchData[offset + 3] = 255;
                            }
                        }
                        masterCtx.putImageData(patchImageData, frame.dims.left, frame.dims.top);
                    }
                }

                const downsampleCanvas = document.createElement('canvas');
                downsampleCanvas.width = targetWidth;
                downsampleCanvas.height = targetHeight;
                const downsampleCtx = downsampleCanvas.getContext('2d');
                downsampleCtx.imageSmoothingEnabled = false;
                downsampleCtx.drawImage(masterCanvas, 0, 0, targetWidth, targetHeight);

                const imageData = downsampleCtx.getImageData(0, 0, targetWidth, targetHeight).data;
                const pixelData = Array(targetHeight).fill(0).map(() => Array(targetWidth).fill(0));
                for (let j = 0; j < imageData.length; j += 4) {
                    const r_idx = Math.floor(j / (targetWidth * 4));
                    const c_idx = (j / 4) % targetWidth;
                    if (imageData[j + 3] < 128) {
                        pixelData[r_idx][c_idx] = 0; // Transparent is 0
                    } else {
                        const currentPixelRgb = { r: imageData[j], g: imageData[j + 1], b: imageData[j + 2] };
                        const closestHex = findClosestColor(currentPixelRgb, sortedColors);
                        // FIX: Store the integer index from the new map.
                        pixelData[r_idx][c_idx] = colorToIndexMap.get(closestHex) || 0;
                    }
                }
                newFramesData.push({ data: JSON.stringify(pixelData), duration: (frame.delay || 100) / 1000 });
            }

            // --- 4. Update UI ---
            const shouldAppend = document.getElementById('gif-append-frames').checked;
            const targetObject = objects.find(o => o.id === parseInt(objectId, 10));
            if (!targetObject) return;

            const existingFrames = shouldAppend ? targetObject.pixelArtFrames : [];
            const combinedFrames = [...existingFrames, ...newFramesData];

            // FIX: Update the central configStore BEFORE re-rendering the form.
            const framesConf = configStore.find(c => c.property === `obj${objectId}_pixelArtFrames`);
            if (framesConf) {
                framesConf.default = JSON.stringify(combinedFrames);
            }
            const gradientConf = configStore.find(c => c.property === `obj${objectId}_gradientStops`);
            if (gradientConf) {
                gradientConf.default = JSON.stringify(newGradientStops);
            }

            // Now, update the live object and re-render everything
            targetObject.update({ gradient: { stops: newGradientStops }, pixelArtFrames: combinedFrames });
            renderForm();
            updateFormValuesFromObjects();
            drawFrame();
            recordHistory();

            const uploadModal = bootstrap.Modal.getInstance(document.getElementById('upload-gif-modal'));
            if (uploadModal) uploadModal.hide();
            showToast(`${newFramesData.length} GIF frames processed with ${sortedColors.length} colors!`, "success");

        } catch (err) {
            console.error("Error processing GIF: " + err.message, err);
            showToast("Could not process GIF file.", "danger");
        }
    };

    const handleSpritePaste = async () => {
        try {
            if (selectedObjectIds.length !== 1) {
                showToast("Please select a single pixel art object to paste into.", "warning");
                return;
            }
            const objectId = selectedObjectIds[0];

            const clipboardItems = await navigator.clipboard.read();
            const imageItem = clipboardItems.find(item => item.types.some(type => type.startsWith('image/')));

            if (!imageItem) {
                showToast("No image found on the clipboard.", "info");
                return;
            }

            const gifType = imageItem.types.find(type => type === 'image/gif');
            if (gifType) {
                const blob = await imageItem.getType(gifType);
                handleGifPaste(blob, objectId);
                return;
            }

            const imageType = imageItem.types.find(type => type.startsWith('image/'));
            const blob = await imageItem.getType(imageType);
            const imageUrl = URL.createObjectURL(blob);
            const image = new Image();

            image.onload = () => {
                // --- START: New Automatic Spritesheet Processing ---
                const frameWidth = parseInt(document.getElementById('sprite-frame-width').value, 10);
                const frameHeight = parseInt(document.getElementById('sprite-frame-height').value, 10);

                if (!frameWidth || !frameHeight || frameWidth <= 0 || frameHeight <= 0) {
                    showToast("Frame dimensions must be positive numbers.", "danger");
                    return;
                }

                // 1. Analyze colors from the entire image to build a consistent palette.
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = image.width;
                tempCanvas.height = image.height;
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.drawImage(image, 0, 0);
                const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height).data;

                const uniqueColors = new Map();
                for (let i = 0; i < imageData.length; i += 4) {
                    if (imageData[i + 3] > 128) {
                        const hex = rgbToHex(`rgb(${imageData[i]},${imageData[i + 1]},${imageData[i + 2]})`);
                        if (!uniqueColors.has(hex)) {
                            uniqueColors.set(hex, {
                                hex: hex,
                                luminance: 0.2126 * imageData[i] + 0.7152 * imageData[i + 1] + 0.0722 * imageData[i + 2]
                            });
                        }
                    }
                }

                // 2. Create the new gradient, sorted by brightness.
                const sortedColors = [...uniqueColors.values()].sort((a, b) => a.luminance - b.luminance);
                const newGradientStops = sortedColors.map((color, index) => ({
                    color: color.hex,
                    position: sortedColors.length > 1 ? index / (sortedColors.length - 1) : 0.5
                }));
                const colorToPositionMap = new Map(newGradientStops.map(stop => [stop.color, stop.position]));

                // 3. Process the spritesheet into frames with the new indexed pixel data.
                const spriteCols = Math.floor(image.width / frameWidth);
                const spriteRows = Math.floor(image.height / frameHeight);
                const newFrames = [];

                for (let row = 0; row < spriteRows; row++) {
                    for (let col = 0; col < spriteCols; col++) {
                        const frameCanvas = document.createElement('canvas');
                        frameCanvas.width = frameWidth;
                        frameCanvas.height = frameHeight;
                        const frameCtx = frameCanvas.getContext('2d');
                        frameCtx.drawImage(image, col * frameWidth, row * frameHeight, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);

                        const frameImgData = frameCtx.getImageData(0, 0, frameWidth, frameHeight).data;
                        const pixelData = Array(frameHeight).fill(0).map(() => Array(frameWidth).fill(0));

                        for (let i = 0; i < frameImgData.length; i += 4) {
                            const r_idx = Math.floor(i / (frameWidth * 4));
                            const c_idx = (i / 4) % frameWidth;

                            if (frameImgData[i + 3] < 128) {
                                pixelData[r_idx][c_idx] = 0.0;
                            } else {
                                const hex = rgbToHex(`rgb(${frameImgData[i]},${frameImgData[i + 1]},${frameImgData[i + 2]})`);
                                pixelData[r_idx][c_idx] = colorToPositionMap.get(hex) || 0.0;
                            }
                        }
                        newFrames.push({ data: JSON.stringify(pixelData), duration: 0.1 });
                    }
                }

                // 4. Apply changes and update UI.
                const shouldAppend = document.getElementById('sprite-paste-append').checked;
                const fieldset = form.querySelector(`fieldset[data-object-id="${objectId}"]`);
                const hiddenTextarea = fieldset.querySelector('textarea[name$="_pixelArtFrames"]');
                const existingFrames = shouldAppend && hiddenTextarea.value ? JSON.parse(hiddenTextarea.value) : [];
                const combinedFrames = [...existingFrames, ...newFrames];

                const targetObject = objects.find(o => o.id === parseInt(objectId, 10));
                if (targetObject) {
                    targetObject.update({ gradient: { stops: newGradientStops }, pixelArtFrames: combinedFrames });
                    renderForm();
                    updateFormValuesFromObjects();
                    drawFrame();
                    recordHistory();
                }

                URL.revokeObjectURL(imageUrl);
                const spritePasteModal = bootstrap.Modal.getInstance(document.getElementById('paste-sprite-modal'));
                if (spritePasteModal) spritePasteModal.hide();
                showToast(`${newFrames.length} frame(s) processed with ${sortedColors.length} colors!`, "success");
                // --- END: New Automatic Spritesheet Processing ---
            };
            image.src = imageUrl;

        } catch (err) {
            console.error(err);
            showToast("Could not paste sprite: " + err.message, "danger");
        }
    };

    const pasteSingleImageFrame = (blob) => {
        const frameWidthInput = document.getElementById('pixel-editor-width');
        const frameHeightInput = document.getElementById('pixel-editor-height');

        // Set the sprite sheet modal inputs to match the editor's grid
        document.getElementById('sprite-frame-width').value = frameWidthInput.value;
        document.getElementById('sprite-frame-height').value = frameHeightInput.value;
        document.getElementById('sprite-paste-append').checked = true; // Always append for single paste

        // Now, call the main sprite paste handler
        handleSpritePaste();
    };

    // --- START: PIXEL ART EDITOR LOGIC ---
    // State variables for the editor modal
    let targetTextarea = null;
    let currentEditorObjectId = null;
    let currentEditorFrameIndex = -1;
    let totalFramesInEditor = 0;

    /**
     * Updates the "Frame X / Y" counter in the modal header.
     */
    const updateEditorFrameCounter = () => {
        const counterEl = document.getElementById('pixel-editor-frame-counter');
        if (counterEl) {
            counterEl.textContent = `${currentEditorFrameIndex + 1} / ${totalFramesInEditor}`;
        }
    };

    /**
     * Loads a specific frame's data into the editor grid.
     * @param {number} index - The index of the frame to load.
     */
    const loadFrameIntoEditor = (index) => {
        const newTargetId = `frame-data-${currentEditorObjectId}-${index}`;
        targetTextarea = document.getElementById(newTargetId);
        if (!targetTextarea) return;
        currentEditorFrameIndex = index;
        updateEditorFrameCounter();
        const targetObject = objects.find(o => o.id === parseInt(currentEditorObjectId, 10));
        currentGradientStops = targetObject ? targetObject.gradient.stops : [];

        paletteContainer.querySelectorAll('.dynamic-color').forEach(btn => btn.remove());

        // The dynamic buttons will now be added after the "Selected Fill" button
        currentGradientStops.forEach((stop, idx) => {
            const value = idx + 2;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'btn btn-sm btn-outline-light dynamic-color';
            btn.dataset.value = value;
            btn.style.backgroundColor = stop.color;
            btn.title = `Right-click to delete | Gradient Color #${idx + 1} (Index: ${value})`;
            const hsl = hexToHsl(stop.color);
            if (hsl[2] < 40) btn.style.color = '#FFF';
            btn.textContent = idx + 1;
            paletteContainer.appendChild(btn); // Use appendChild to add to the end
        });

        let data;
        try { data = JSON.parse(targetTextarea.value); } catch (e) { data = [[0]]; }
        widthInput.value = data[0]?.length || 1;
        heightInput.value = data.length || 1;
        renderGrid(data, currentGradientStops);
        rawDataTextarea.value = formatPixelData(data);
    };

    // --- START: Upgraded Pixel Art Editor Logic ---
    const editorModalEl = document.getElementById('pixelArtEditorModal');
    if (editorModalEl) {
        // State variables
        let targetTextarea = null, currentEditorObjectId = null, currentEditorFrameIndex = -1, totalFramesInEditor = 0;
        let currentPaintValue = 0.7, isPainting = false, currentTool = 'paint', currentGradientStops = [];

        // Main Editor elements
        const gridContainer = document.getElementById('pixel-editor-grid-container');
        const widthInput = document.getElementById('pixel-editor-width');
        const heightInput = document.getElementById('pixel-editor-height');
        const resizeBtn = document.getElementById('pixel-editor-resize-btn');
        const saveBtn = document.getElementById('pixel-editor-save-btn');
        const paletteContainer = document.getElementById('pixel-editor-palette');
        const rawDataTextarea = document.getElementById('pixel-editor-raw-data');
        const prevFrameBtn = document.getElementById('pixel-editor-prev-frame-btn');
        const nextFrameBtn = document.getElementById('pixel-editor-next-frame-btn');
        const duplicateFrameBtn = document.getElementById('pixel-editor-duplicate-frame-btn');
        const paintBtn = document.getElementById('pixel-editor-paint-btn');
        const fillBtn = document.getElementById('pixel-editor-fill-btn');
        const toolsContainer = document.getElementById('pixel-editor-tools');

        // Color Picker Modal elements & iro.js instance
        const colorPickerModalEl = document.getElementById('pixel-art-color-picker-modal');
        const pickerContainer = document.getElementById('modal-picker-container');
        const colorPickerModal = new bootstrap.Modal(colorPickerModalEl);
        let iroColorPicker = null;

        const debouncedRecordHistory = debounce(recordHistory, 500);

        const updateActiveColor = (newColor, indexToUpdate) => {
            if (currentGradientStops[indexToUpdate]) {
                currentGradientStops[indexToUpdate].color = newColor;
                const targetObject = objects.find(o => o.id === parseInt(currentEditorObjectId, 10));
                targetObject.update({ gradient: { stops: currentGradientStops } });
                const fieldset = form.querySelector(`fieldset[data-object-id="${currentEditorObjectId}"]`);
                const gradientControl = fieldset.querySelector('textarea[name$="_gradientStops"]');
                if (gradientControl) {
                    gradientControl.value = JSON.stringify(currentGradientStops);
                    gradientControl.dispatchEvent(new CustomEvent('rebuild', { detail: { stops: currentGradientStops } }));
                }
                renderEditorPalette();
                const gridData = readGrid();
                renderGrid(gridData, currentGradientStops);
                debouncedRecordHistory();
            }
        };

        if (pickerContainer) {
            iroColorPicker = new iro.ColorPicker(pickerContainer, {
                width: 240,
                color: "#fff",
                borderWidth: 1,
                borderColor: "#fff",
                layout: [
                    { component: iro.ui.Wheel },
                    { component: iro.ui.Slider, options: { sliderType: 'value' } },
                    { component: iro.ui.Slider, options: { sliderType: 'hue' } },
                    { component: iro.ui.Input, options: { inputType: 'hex' } } // This adds the hex input
                ]
            });

            iroColorPicker.on('color:change', (color) => {
                const activeBtn = paletteContainer.querySelector('.dynamic-color.active');
                if (activeBtn) {
                    const indexToUpdate = parseFloat(activeBtn.dataset.value) - 2;
                    updateActiveColor(color.hexString, indexToUpdate);
                }
            });
        }

        const renderEditorPalette = () => {
            const dynamicButtons = paletteContainer.querySelectorAll('.dynamic-color, .btn-add-color');
            dynamicButtons.forEach(btn => btn.remove());
            currentGradientStops.forEach((stop, idx) => {
                const value = idx + 2;
                const btn = document.createElement('button');
                btn.type = 'button';
                btn.className = 'btn btn-sm btn-outline-light dynamic-color';
                btn.dataset.value = value;
                btn.style.backgroundColor = stop.color;
                btn.title = `Click to edit, Right-click to delete | Color #${idx + 1}`;
                const hsl = hexToHsl(stop.color);
                if (hsl[2] < 40) btn.style.color = '#FFF';
                btn.textContent = idx + 1;

                // FIX: Re-apply active class during re-render
                if (currentPaintValue === value) {
                    btn.classList.add('active');
                }

                btn.addEventListener('click', (e) => {
                    paletteContainer.querySelector('.active')?.classList.remove('active');
                    btn.classList.add('active');
                    currentPaintValue = parseFloat(btn.dataset.value);
                    if (iroColorPicker) {
                        iroColorPicker.color.hexString = stop.color;
                    }
                    if (colorPickerModal) {
                        colorPickerModal.show();
                    }
                });
                paletteContainer.appendChild(btn);
            });

            const addBtn = document.createElement('button');
            addBtn.type = 'button';
            addBtn.id = 'pixel-editor-add-color-btn';
            addBtn.className = 'btn btn-sm btn-outline-secondary btn-add-color';
            addBtn.innerHTML = '<i class="bi bi-plus-lg"></i>';
            addBtn.title = 'Add a new color to the palette';

            addBtn.addEventListener('click', () => {
                const targetObject = objects.find(o => o.id === parseInt(currentEditorObjectId, 10));
                if (!targetObject) return;
                let newStops = [...currentGradientStops, { color: '#FFFFFF', position: 1.0 }];
                if (newStops.length > 1) {
                    newStops.forEach((stop, index) => { stop.position = index / (newStops.length - 1); });
                }
                targetObject.update({ gradient: { stops: newStops } });
                currentGradientStops = newStops;
                const fieldset = form.querySelector(`fieldset[data-object-id="${currentEditorObjectId}"]`);
                const gradientControl = fieldset.querySelector('textarea[name$="_gradientStops"]');
                if (gradientControl) {
                    gradientControl.value = JSON.stringify(newStops);
                    gradientControl.dispatchEvent(new CustomEvent('rebuild', { detail: { stops: newStops } }));
                }
                renderEditorPalette();
                recordHistory();
            });

            paletteContainer.appendChild(addBtn);
        };

        const setActiveTool = (toolName) => {
            currentTool = toolName;
            toolsContainer.querySelectorAll('button[id$="-btn"]').forEach(btn => {
                if (btn.id.includes('-paint-') || btn.id.includes('-fill-')) btn.classList.remove('active');
            });
            const btnToActivate = document.getElementById(`pixel-editor-${toolName}-btn`);
            if (btnToActivate) btnToActivate.classList.add('active');
        };

        if (paintBtn) {
            paintBtn.addEventListener('click', () => setActiveTool('paint'));
        }
        if (fillBtn) {
            fillBtn.addEventListener('click', () => setActiveTool('fill'));
        }

        const valueToColor = (value, stops) => {
            if (value === 1.0) return '#FFFFFF';
            if (value === 0) return 'transparent';
            if (value === 0.7) return `repeating-conic-gradient(#444 0% 25%, #555 0% 50%) 50% / 10px 10px`;
            if (value >= 2) {
                const index = Math.round(value) - 2;
                if (stops && stops[index]) return stops[index].color;
            }
            return `repeating-conic-gradient(#808080 0% 25%, #a0a0a0 0% 50%) 50% / 10px 10px`;
        };

        const renderGrid = (data, stops) => {
            gridContainer.innerHTML = '';
            if (!data || !data.length || !data[0]) return;
            const rows = data.length; const cols = data[0].length;
            gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
            for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
                const cell = document.createElement('div');
                cell.className = 'pixel-editor-cell';
                cell.dataset.row = r; cell.dataset.col = c;
                const value = data[r]?.[c] || 0;
                cell.style.background = valueToColor(value, stops);
                cell.dataset.value = value;
                gridContainer.appendChild(cell);
            }
        };

        const readGrid = () => {
            const rows = parseInt(heightInput.value, 10); const cols = parseInt(widthInput.value, 10);
            const cells = gridContainer.querySelectorAll('.pixel-editor-cell');
            const data = [];
            for (let r = 0; r < rows; r++) {
                const row = [];
                for (let c = 0; c < cols; c++) {
                    row.push(cells[r * cols + c] ? parseFloat(cells[r * cols + c].dataset.value) : 0);
                }
                data.push(row);
            }
            return data;
        };

        const paintCell = (cell) => {
            if (!cell || !cell.classList.contains('pixel-editor-cell')) return;
            cell.dataset.value = currentPaintValue;
            cell.style.background = valueToColor(currentPaintValue, currentGradientStops);
        };

        const floodFill = (startNode) => {
            if (!startNode) return;
            const gridData = readGrid();
            const [rows, cols] = [gridData.length, gridData[0].length];
            const startRow = parseInt(startNode.dataset.row, 10); const startCol = parseInt(startNode.dataset.col, 10);
            const targetValue = gridData[startRow][startCol];
            if (targetValue === currentPaintValue) return;
            const queue = [[startRow, startCol]];
            gridData[startRow][startCol] = -1;
            while (queue.length > 0) {
                const [r, c] = queue.shift();
                const neighbors = [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]];
                for (const [nr, nc] of neighbors) {
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && gridData[nr][nc] === targetValue) {
                        gridData[nr][nc] = -1;
                        queue.push([nr, nc]);
                    }
                }
            }
            for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (gridData[r][c] === -1) gridData[r][c] = currentPaintValue;
            renderGrid(gridData, currentGradientStops);
        };

        const updateEditorFrameCounter = () => { document.getElementById('pixel-editor-frame-counter').textContent = `${currentEditorFrameIndex + 1} / ${totalFramesInEditor}`; };

        const saveCurrentFrameInEditor = () => {
            if (!targetTextarea) return;
            const gridData = readGrid();
            const newDataString = JSON.stringify(gridData);
            rawDataTextarea.value = formatPixelData(gridData);
            targetTextarea.value = newDataString;
            targetTextarea.dispatchEvent(new Event('input', { bubbles: true }));
        };

        const loadFrameIntoEditor = (index) => {
            const newTargetId = `frame-data-${currentEditorObjectId}-${index}`;
            targetTextarea = document.getElementById(newTargetId);
            if (!targetTextarea) return;
            currentEditorFrameIndex = index;
            updateEditorFrameCounter();
            const targetObject = objects.find(o => o.id === parseInt(currentEditorObjectId, 10));
            currentGradientStops = targetObject ? targetObject.gradient.stops : [];
            renderEditorPalette();
            let data;
            try { data = JSON.parse(targetTextarea.value); } catch (e) { data = [[0]]; }
            widthInput.value = data[0]?.length || 1;
            heightInput.value = data.length || 1;
            renderGrid(data, currentGradientStops);
            rawDataTextarea.value = formatPixelData(data);
        };

        editorModalEl.addEventListener('shown.bs.modal', (event) => {
            const button = event.relatedTarget;
            const targetId = button.getAttribute('data-target-id');
            targetTextarea = document.getElementById(targetId);
            const idMatch = targetId.match(/frame-data-(\d+)-(\d+)/);
            currentEditorObjectId = idMatch[1];
            currentEditorFrameIndex = parseInt(idMatch[2], 10);
            const fieldset = document.querySelector(`fieldset[data-object-id="${currentEditorObjectId}"]`);
            totalFramesInEditor = fieldset.querySelector('.pixel-art-frames-container').children.length;
            loadFrameIntoEditor(currentEditorFrameIndex);
            setActiveTool('paint');
            document.getElementById('collapseRawData')?.classList.remove('show');
        });

        // Simplified click listener for static buttons (e.g. "Selected Fill")
        paletteContainer.addEventListener('click', (e) => {
            const button = e.target.closest('button');
            if (!button || button.classList.contains('dynamic-color') || button.id === 'pixel-editor-add-color-btn') return;

            setActiveTool('paint');
            paletteContainer.querySelector('.active')?.classList.remove('active');
            button.classList.add('active');
            currentPaintValue = parseFloat(button.dataset.value);
        });

        paletteContainer.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const button = e.target.closest('button.dynamic-color');
            if (!button || currentGradientStops.length <= 2) {
                if (currentGradientStops.length <= 2) showToast("A gradient must have at least 2 colors.", "warning");
                return;
            }
            const valueToDelete = parseFloat(button.dataset.value);
            const isColorUsed = readGrid().flat().some(pixelValue => pixelValue === valueToDelete);
            if (isColorUsed) {
                showToast("Cannot delete a color that is currently in use on the canvas.", "danger");
                return;
            }
            const indexToDelete = valueToDelete - 2;
            const targetObject = objects.find(o => o.id === parseInt(currentEditorObjectId, 10));
            if (!targetObject) return;
            let newStops = [...currentGradientStops];
            newStops.splice(indexToDelete, 1);
            if (newStops.length > 1) {
                newStops.forEach((stop, index) => { stop.position = index / (newStops.length - 1); });
            }
            targetObject.update({ gradient: { stops: newStops } });
            currentGradientStops = newStops;
            const fieldset = form.querySelector(`fieldset[data-object-id="${currentEditorObjectId}"]`);
            const gradientControl = fieldset.querySelector('textarea[name$="_gradientStops"]');
            if (gradientControl) {
                gradientControl.value = JSON.stringify(newStops);
                gradientControl.dispatchEvent(new CustomEvent('rebuild', { detail: { stops: newStops } }));
            }
            renderEditorPalette();
            const firstPaintButton = paletteContainer.querySelector('[data-value]');
            if (firstPaintButton) firstPaintButton.click();
            recordHistory();
        });

        // Event listeners for editor tools
        document.getElementById('pixel-editor-mirror-h-btn').addEventListener('click', () => { let d = readGrid(); d.forEach(r => r.reverse()); renderGrid(d, currentGradientStops); });
        document.getElementById('pixel-editor-mirror-v-btn').addEventListener('click', () => { let d = readGrid().reverse(); renderGrid(d, currentGradientStops); });
        resizeBtn.addEventListener('click', () => { renderGrid(Array(parseInt(heightInput.value, 10)).fill(0).map(() => Array(parseInt(widthInput.value, 10)).fill(0)), currentGradientStops); });
        gridContainer.addEventListener('mousedown', (e) => { if (currentTool === 'paint') { isPainting = true; paintCell(e.target); } else if (currentTool === 'fill') { floodFill(e.target); } });
        gridContainer.addEventListener('mouseover', (e) => { if (isPainting) paintCell(e.target); });
        document.addEventListener('mouseup', () => { isPainting = false; });
        gridContainer.addEventListener('mouseleave', () => { isPainting = false; });
        saveBtn.addEventListener('click', () => { saveCurrentFrameInEditor(); saveBtn.blur(); bootstrap.Modal.getInstance(editorModalEl).hide(); });
        rawDataTextarea.addEventListener('input', () => { try { const d = JSON.parse(rawDataTextarea.value); if (d && d.length > 0 && d[0]) { heightInput.value = d.length; widthInput.value = d[0].length; } renderGrid(d, currentGradientStops); } catch (e) { /* ignore */ } });
    }
    // --- END: Upgraded Pixel Art Editor Logic ---

    const pixelArtGalleryModalEl = document.getElementById('pixel-art-gallery-modal');
    if (pixelArtGalleryModalEl) {
        pixelArtGalleryModalEl.addEventListener('show.bs.modal', () => {
            if (!isPixelArtGalleryLoaded) {
                fetchAndRenderPixelArtGallery();
            }
        });

        const searchInput = document.getElementById('pixel-art-search-input');
        searchInput.addEventListener('input', (e) => {
            pixelArtSearchTerm = e.target.value.toLowerCase();
            pixelArtCurrentPage = 1;
            renderPixelArtGallery();
        });
    }

    const srgbLinkBtn = document.getElementById('generate-srgb-link-btn');

    srgbLinkBtn.addEventListener('click', (event) => {
        event.preventDefault();
        const allProps = getControlValues();

        const effectTitle = allProps['title'] || 'My Effect';
        const urlSafeTitle = encodeURIComponent(effectTitle);
        const baseUrl = `https://go.signalrgb.com/app/effect/apply/${urlSafeTitle}`;

        let params = [];
        const currentState = getControlValues();

        for (const key in currentState) {
            if (!currentState.hasOwnProperty(key)) {
                continue;
            }

            const isDifferentFromBaseline = !baselineStateForURL.hasOwnProperty(key) || String(currentState[key]) !== String(baselineStateForURL[key]);

            // Compare the current value to the baseline value.
            // If the baseline doesn't have the key, or if the values are different, it's a change.
            if (isDifferentFromBaseline || dirtyProperties.has(key)) {

                // Filter out metadata that shouldn't be in the link's query string.
                if (key === 'title' || key === 'description' || key === 'publisher') {
                    continue;
                }

                let value = currentState[key];

                // Format the value for the URL.
                if (typeof value === 'boolean') {
                    value = value ? 'true' : 'false';
                } else if (typeof value === 'number') {
                    value = String(value);
                }

                if (typeof value === 'string') {
                    if (value.startsWith('#')) {
                        value = `%23${value.substring(1)}`;
                    }
                    value = value.replace(/ /g, '%20');
                }

                params.push(`${key}=${value}`);
            }
        }

        const queryString = params.join('&');
        const finalUrl = `${baseUrl}?${queryString}`;

        window.open(finalUrl, '_blank');

        const modalBody = 'This link has been opened in a new tab. It will only work if the corresponding effect is already installed in your SignalRGB library.\n\nThe link has also been copied to your clipboard.';
        showToast(modalBody, 'success');

        navigator.clipboard.writeText(finalUrl).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    });

    document.getElementById('startAudioBtn').addEventListener('click', setupAudio);

    if (!localStorage.getItem('termsAccepted')) {
        var termsModal = new bootstrap.Modal(document.getElementById('accept-terms-modal'));
        termsModal.show();
    }
    document.getElementById('accept-terms-btn').addEventListener('click', function () {
        localStorage.setItem('termsAccepted', 'true');
    });
    document.getElementById('accept-terms2-btn').addEventListener('click', function () {
        localStorage.setItem('termsAccepted', 'true');
    });

    // --- DOM Element References ---
    const ADMIN_UID = 'zMj8mtfMjXeFMt072027JT7Jc7i1';
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    const canvas = document.getElementById('signalCanvas');

    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    canvas.width = 1280;
    canvas.height = 800;
    const canvasContainer = document.getElementById('canvas-container');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Failed to get 2D context');
        return;
    }
    const form = document.getElementById('controls-form');
    const toolbar = document.getElementById('toolbar');
    const constrainBtn = document.getElementById('constrain-btn');
    const exportBtn = document.getElementById('export-btn');
    const shareBtn = document.getElementById('share-btn');
    const addObjectBtn = document.getElementById('add-object-btn');
    const addPolylineBtn = document.getElementById('add-polyline-btn');
    const confirmImportBtn = document.getElementById('confirm-import-btn');
    const confirmBtn = document.getElementById('confirm-overwrite-btn');
    const coordsDisplay = document.getElementById('coords-display');

    let activeTool = 'select'; // 'select' or 'polyline'
    let isDrawingPolyline = false;
    let currentlyDrawingShapeId = null;
    let previewLine = { startX: 0, startY: 0, endX: 0, endY: 0, active: false };

    // Update this for a new property
    const shapePropertyMap = {
        rectangle: [
            'shape', 'x', 'y', 'width', 'height', 'rotation', 'gradType', 'gradientStops', 'useSharpGradient',
            'cycleColors', 'animationMode', 'animationSpeed', 'rotationSpeed',
            'cycleSpeed', 'scrollDir', 'phaseOffset', 'numberOfRows', 'numberOfColumns',
            'enableStroke', 'strokeWidth', 'strokeGradType', 'strokeGradientStops', 'strokeUseSharpGradient', 'strokeCycleColors', 'strokeCycleSpeed', 'strokeAnimationSpeed', 'strokeRotationSpeed', 'strokeAnimationMode', 'strokePhaseOffset', 'strokeScrollDir',
            'enableAudioReactivity', 'audioTarget', 'audioMetric', 'beatThreshold', 'audioSensitivity', 'audioSmoothing',
            'enableSensorReactivity', 'sensorTarget', 'userSensor', 'timePlotLineThickness', 'timePlotFillArea', 'sensorMeterShowValue', 'timePlotAxesStyle', 'timePlotTimeScale', 'sensorColorMode', 'sensorMidThreshold', 'sensorMaxThreshold'
        ],
        polyline: [
            'shape', 'x', 'y', 'width', 'height', 'rotation', 'rotationSpeed', 'polylineNodes', 'polylineCurveStyle',
            'pathAnim_enable', 'pathAnim_shape', 'pathAnim_size', 'pathAnim_speed', 'pathAnim_behavior', 'pathAnim_objectCount', 'pathAnim_objectSpacing',
            'pathAnim_gradType', 'pathAnim_useSharpGradient', 'pathAnim_gradColor1', 'pathAnim_gradColor2',
            'pathAnim_cycleColors', 'pathAnim_cycleSpeed', 'pathAnim_animationMode', 'pathAnim_animationSpeed', 'pathAnim_scrollDir',
            'pathAnim_trail', 'pathAnim_trailLength', 'pathAnim_trailColor',
            'enableStroke', 'strokeWidth', 'strokeGradType', 'strokeGradientStops', 'strokeUseSharpGradient', 'strokeCycleColors', 'strokeCycleSpeed', 'strokeAnimationSpeed', 'strokeRotationSpeed', 'strokeAnimationMode', 'strokePhaseOffset', 'strokeScrollDir',
            'enableAudioReactivity', 'audioTarget', 'audioMetric', 'beatThreshold', 'audioSensitivity', 'audioSmoothing'
        ],
        circle: [
            'shape', 'x', 'y', 'width', 'height', 'rotation', 'gradType', 'gradientStops', 'useSharpGradient',
            'cycleColors', 'animationMode', 'animationSpeed', 'rotationSpeed',
            'cycleSpeed', 'scrollDir', 'phaseOffset',
            'enableStroke', 'strokeWidth', 'strokeGradType', 'strokeGradientStops', 'strokeUseSharpGradient', 'strokeCycleColors', 'strokeCycleSpeed', 'strokeAnimationSpeed', 'strokeRotationSpeed', 'strokeAnimationMode', 'strokePhaseOffset', 'strokeScrollDir',
            'enableAudioReactivity', 'audioTarget', 'audioMetric', 'beatThreshold', 'audioSensitivity', 'audioSmoothing',
            'enableSensorReactivity', 'sensorTarget', 'userSensor', 'timePlotLineThickness', 'timePlotFillArea', 'sensorMeterShowValue', 'timePlotAxesStyle', 'timePlotTimeScale', 'sensorColorMode', 'sensorMidThreshold', 'sensorMaxThreshold'
        ],
        ring: [
            'shape', 'x', 'y', 'width', 'height', 'rotation', 'gradType', 'gradientStops', 'useSharpGradient', 'cycleColors',
            'animationSpeed', 'rotationSpeed', 'cycleSpeed', 'innerDiameter', 'numberOfSegments', 'angularWidth',
            'enableStroke', 'strokeWidth', 'strokeGradType', 'strokeGradientStops', 'strokeUseSharpGradient', 'strokeCycleColors', 'strokeCycleSpeed', 'strokeAnimationSpeed', 'strokeRotationSpeed', 'strokeAnimationMode', 'strokePhaseOffset', 'strokeScrollDir',
            'enableAudioReactivity', 'audioTarget', 'audioMetric', 'beatThreshold', 'audioSensitivity', 'audioSmoothing',
            'enableSensorReactivity', 'sensorTarget', 'userSensor', 'timePlotLineThickness', 'timePlotFillArea', 'sensorMeterShowValue', 'timePlotAxesStyle', 'timePlotTimeScale', 'sensorColorMode', 'sensorMidThreshold', 'sensorMaxThreshold'
        ],
        polygon: [
            'shape', 'x', 'y', 'width', 'height', 'rotation', 'gradType', 'gradientStops', 'useSharpGradient',
            'cycleColors', 'animationMode', 'animationSpeed', 'rotationSpeed',
            'cycleSpeed', 'scrollDir', 'phaseOffset', 'sides',
            'enableStroke', 'strokeWidth', 'strokeGradType', 'strokeGradientStops', 'strokeUseSharpGradient', 'strokeCycleColors', 'strokeCycleSpeed', 'strokeAnimationSpeed', 'strokeRotationSpeed', 'strokeAnimationMode', 'strokePhaseOffset', 'strokeScrollDir',
            'enableAudioReactivity', 'audioTarget', 'audioMetric', 'beatThreshold', 'audioSensitivity', 'audioSmoothing',
            'enableSensorReactivity', 'sensorTarget', 'userSensor', 'timePlotLineThickness', 'timePlotFillArea', 'sensorMeterShowValue', 'timePlotAxesStyle', 'timePlotTimeScale', 'sensorColorMode', 'sensorMidThreshold', 'sensorMaxThreshold'
        ],
        star: [
            'shape', 'x', 'y', 'width', 'height', 'rotation', 'gradType', 'gradientStops', 'useSharpGradient',
            'cycleColors', 'animationMode', 'animationSpeed', 'rotationSpeed',
            'cycleSpeed', 'scrollDir', 'phaseOffset', 'points', 'starInnerRadius',
            'enableStroke', 'strokeWidth', 'strokeGradType', 'strokeGradientStops', 'strokeUseSharpGradient', 'strokeCycleColors', 'strokeCycleSpeed', 'strokeAnimationSpeed', 'strokeRotationSpeed', 'strokeAnimationMode', 'strokePhaseOffset', 'strokeScrollDir',
            'enableAudioReactivity', 'audioTarget', 'audioMetric', 'beatThreshold', 'audioSensitivity', 'audioSmoothing',
            'enableSensorReactivity', 'sensorTarget', 'userSensor', 'timePlotLineThickness', 'timePlotFillArea', 'sensorMeterShowValue', 'timePlotAxesStyle', 'timePlotTimeScale', 'sensorColorMode', 'sensorMidThreshold', 'sensorMaxThreshold'
        ],
        text: [
            'shape', 'x', 'y', 'width', 'height', 'rotation', 'rotationSpeed', 'gradType', 'gradientStops', 'useSharpGradient', 'cycleColors',
            'animationSpeed', 'text', 'fontSize', 'textAlign', 'pixelFont', 'textAnimation',
            'textAnimationSpeed', 'showTime', 'showDate',
            'enableAudioReactivity', 'audioTarget', 'audioMetric', 'beatThreshold', 'audioSensitivity', 'audioSmoothing',
        ],
        oscilloscope: [
            'shape', 'x', 'y', 'width', 'height', 'rotation', 'gradType', 'gradientStops', 'useSharpGradient', 'cycleColors',
            'animationMode', 'animationSpeed', 'rotationSpeed', 'cycleSpeed', 'scrollDir', 'phaseOffset',
            'lineWidth', 'waveType', 'frequency', 'oscDisplayMode', 'pulseDepth', 'fillShape',
            'enableWaveAnimation', 'waveStyle', 'waveCount', 'oscAnimationSpeed',
            'enableStroke', 'strokeWidth', 'strokeGradType', 'strokeGradientStops', 'strokeUseSharpGradient', 'strokeCycleColors', 'strokeCycleSpeed', 'strokeAnimationSpeed', 'strokeRotationSpeed', 'strokeAnimationMode', 'strokePhaseOffset', 'strokeScrollDir',
            'enableAudioReactivity', 'audioTarget', 'audioMetric', 'beatThreshold', 'audioSensitivity', 'audioSmoothing',
        ],
        'tetris': [
            'shape', 'x', 'y', 'width', 'height', 'rotation', 'gradType', 'gradientStops', 'useSharpGradient',
            'cycleColors', 'cycleSpeed', 'animationSpeed', 'phaseOffset',
            'tetrisAnimation', 'tetrisBlockCount', 'tetrisDropDelay', 'tetrisSpeed', 'tetrisBounce', 'tetrisHoldTime',
            'enableAudioReactivity', 'audioTarget', 'audioMetric', 'beatThreshold', 'audioSensitivity', 'audioSmoothing',
        ],
        fire: [
            'shape', 'x', 'y', 'width', 'height', 'rotation', 'gradType', 'gradientStops', 'useSharpGradient', 'cycleColors',
            'animationSpeed', 'cycleSpeed', 'scrollDir', 'fireSpread',
            'enableAudioReactivity', 'audioTarget', 'audioMetric', 'beatThreshold', 'audioSensitivity', 'audioSmoothing'
        ],
        'fire-radial': [
            'shape', 'x', 'y', 'width', 'height', 'rotation', 'gradType', 'gradientStops', 'useSharpGradient', 'cycleColors',
            'animationSpeed', 'cycleSpeed', 'scrollDir', 'fireSpread',
            'enableAudioReactivity', 'audioTarget', 'audioMetric', 'beatThreshold', 'audioSensitivity', 'audioSmoothing'
        ],
        'pixel-art': [
            'shape', 'x', 'y', 'width', 'height', 'rotation', 'gradType', 'gradientStops', 'useSharpGradient',
            'cycleColors', 'animationMode', 'animationSpeed', 'rotationSpeed',
            'cycleSpeed', 'scrollDir', 'phaseOffset', 'pixelArtFrames',
            'enableAudioReactivity', 'audioTarget', 'audioMetric', 'beatThreshold', 'audioSensitivity', 'audioSmoothing',
            'enableSensorReactivity', 'sensorTarget', 'userSensor', 'timePlotLineThickness', 'timePlotFillArea', 'sensorMeterShowValue', 'timePlotAxesStyle', 'timePlotTimeScale', 'sensorColorMode', 'sensorMidThreshold', 'sensorMaxThreshold'
        ],
        'audio-visualizer': ['shape', 'x', 'y', 'width', 'height', 'rotation', 'rotationSpeed', 'gradType', 'gradientStops', 'useSharpGradient',
            'cycleColors', 'animationSpeed', 'scrollDir',
            'vizLayout', 'vizDrawStyle', 'vizStyle',
            'vizLineWidth',
            'vizAutoScale', 'vizMaxBarHeight',
            'vizBarCount', 'vizBarSpacing', 'vizSmoothing',
            'vizUseSegments', 'vizSegmentCount', 'vizSegmentSpacing',
            'vizInnerRadius', 'vizBassLevel', 'vizTrebleBoost', 'vizDynamicRange'
        ],
        'strimer': [
            'shape', 'x', 'y', 'width', 'height', 'rotation',
            'gradType', 'gradientStops', 'useSharpGradient',
            'cycleColors', 'cycleSpeed', 'animationSpeed', 'scrollDir', 'phaseOffset',
            'strimerRows', 'strimerColumns', 'strimerBlockCount', 'strimerBlockSize', 'strimerAnimation', 'strimerAnimationSpeed',
            'strimerDirection', 'strimerEasing',
            'strimerBlockSpacing', 'strimerGlitchFrequency', 'strimerPulseSync', 'strimerAudioSensitivity', 'strimerBassLevel', 'strimerTrebleBoost', 'strimerAudioSmoothing', 'strimerPulseSpeed', 'strimerSnakeDirection'
        ],
        'spawner': [
            'shape', 'x', 'y', 'width', 'height', 'rotation', 'gradType', 'gradientStops', 'useSharpGradient',
            'cycleColors', 'animationMode', 'animationSpeed', 'rotationSpeed',
            'cycleSpeed', 'scrollDir', 'phaseOffset', 'numberOfRows', 'numberOfColumns',
            'enableAudioReactivity', 'audioTarget', 'audioMetric', 'beatThreshold', 'audioSensitivity', 'audioSmoothing', 'spawn_audioTarget',
            'spawn_shapeType', 'spawn_animation', 'spawn_count', 'spawn_spawnRate', 'spawn_lifetime', 'spawn_speed', 'spawn_speedVariance', 'spawn_size', 'spawn_size_randomness', 'spawn_gravity', 'spawn_spread', 'spawn_rotationSpeed', 'spawn_rotationVariance', 'spawn_initialRotation_random',
            'spawn_matrixCharSet', 'spawn_matrixTrailLength', 'spawn_matrixEnableGlow', 'spawn_matrixGlowSize', 'spawn_matrixGlowColor',
            'spawn_enableTrail', 'spawn_trailLength', 'spawn_trailSpacing',
            'sides', 'points', 'starInnerRadius', 'spawn_svg_path'
        ],
    };

    const galleryOffcanvasEl = document.getElementById('gallery-offcanvas');
    const galleryList = document.getElementById('gallery-project-list');
    const galleryBody = galleryOffcanvasEl.querySelector('.offcanvas-body');

    async function toggleFeaturedStatus(buttonEl, docIdToToggle) {
        buttonEl.disabled = true;
        buttonEl.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';

        try {
            const projectsRef = window.collection(window.db, "projects");
            const docToToggleRef = window.doc(projectsRef, docIdToToggle);

            // Step 1: Perform all READS before the transaction begins.
            // Find any effect that is currently featured.
            const q = window.query(projectsRef, window.where("featured", "==", true));
            const currentlyFeaturedSnapshot = await window.getDocs(q);

            // Step 2: Perform all WRITES inside the transaction.
            await window.runTransaction(window.db, async (transaction) => {
                const docToToggleSnap = await transaction.get(docToToggleRef);
                if (!docToToggleSnap.exists()) {
                    throw new Error("Document does not exist!");
                }

                const isCurrentlyFeatured = docToToggleSnap.data().featured === true;
                const newFeaturedState = !isCurrentlyFeatured;

                // If we are about to feature this item...
                if (newFeaturedState === true) {
                    // ...un-feature all other items found in our read step.
                    currentlyFeaturedSnapshot.forEach((doc) => {
                        transaction.update(doc.ref, { featured: false });
                    });
                }

                // Finally, set the new featured state on the document we clicked.
                transaction.update(docToToggleRef, { featured: newFeaturedState });
            });

            // --- UI update logic ---
            const allFeatureButtons = document.querySelectorAll('.btn-feature');
            allFeatureButtons.forEach(btn => {
                if (btn.dataset.docId === docIdToToggle) {
                    const isNowFeatured = !buttonEl.classList.contains('btn-warning');
                    btn.className = `btn btn-sm btn-feature ${isNowFeatured ? 'btn-warning' : 'btn-outline-warning'}`;
                    btn.innerHTML = isNowFeatured ? '<i class="bi bi-star-fill"></i>' : '<i class="bi bi-star"></i>';
                    btn.title = isNowFeatured ? 'Unfeature this effect' : 'Feature this effect';
                } else {
                    btn.className = 'btn btn-sm btn-feature btn-outline-warning';
                    btn.innerHTML = '<i class="bi bi-star"></i>';
                    btn.title = 'Feature this effect';
                }
            });

            showToast("Featured effect updated successfully!", 'success');

        } catch (error) {
            console.error("Error updating featured status: ", error);
            showToast("Failed to update featured status.", 'danger');
        } finally {
            buttonEl.disabled = false;
        }
    }

    async function showLikersModal(docId, projectName) {
        const user = window.auth.currentUser;
        if (!user) {
            showToast("You must be signed in to view likers.", 'danger');
            return;
        }

        try {
            const docRef = window.doc(window.db, "projects", docId);
            const projectDoc = await window.getDoc(docRef);

            if (!projectDoc.exists()) {
                showToast("Project not found.", 'danger');
                return;
            }

            const data = projectDoc.data();
            const likedBy = data.likedBy || {};
            const likerUids = Object.keys(likedBy);

            if (likerUids.length === 0) {
                showToast(`No users have liked "${projectName}" yet.`, 'info');
                return;
            }

            // --- TEMPORARY DISPLAY LOGIC (User ID is not friendly) ---
            // In a real application, you would query a 'users' collection 
            // to get display names from these UIDs.
            // For now, we display the UIDs, which is what the database holds.

            let content = likerUids.map(uid => `<li class="list-group-item small">${uid}</li>`).join('');

            // Use the existing confirm modal as a simple display container
            showConfirmModal(
                `Users Who Liked: ${projectName} (${likerUids.length})`,
                `<p>Note: Display names are not available in this tool. These are User IDs.</p>
             <ul class="list-group list-group-flush">${content}</ul>`,
                'Close',
                () => { /* Do nothing on close */ }
            );

            // The last argument of showConfirmModal is the onConfirm callback.
            // Since we are using it for display, the 'Close' button needs a dummy function.
            // You'd need a separate display modal for a perfect UI.

        } catch (error) {
            console.error("Error fetching likers:", error);
            showToast("Failed to retrieve the list of likers.", 'danger');
        }
    }

    /**
     * Fetches display names for a given array of UIDs.
     * @param {string[]} uids - Array of user UIDs.
     * @returns {Promise<Map<string, string>>} A map of UID to Display Name.
     */
    async function fetchDisplayNames(uids) {
        if (uids.length === 0) return new Map();

        const namesMap = new Map();
        const usersRef = window.collection(window.db, "users");

        // Split UIDs into batches of 10 for the 'in' query limit
        const batches = [];
        for (let i = 0; i < uids.length; i += 10) {
            batches.push(uids.slice(i, i + 10));
        }

        // Fetch user documents in parallel batches
        const promises = batches.map(batch => {
            const q = window.query(usersRef, window.where(window.documentId, 'in', batch));

            return window.getDocs(q).then(snapshot => {
                snapshot.forEach(doc => {
                    const data = doc.data();
                    namesMap.set(doc.id, data.displayName || 'Anonymous User');
                });
            });
        });

        await Promise.all(promises);
        return namesMap;
    }

    /**
 * Handles the click event on a notification item: loads the effect and marks the notification as read.
 * @param {string} projectId - The ID of the project/effect to load.
 * @param {string} notificationId - The ID of the notification document to mark as read.
 */
    async function handleNotificationClick(projectId, notificationId) {
        const user = window.auth.currentUser;
        if (!user) {
            showToast("Please sign in to load effects.", "warning");
            return;
        }

        // 1. Load the Effect from the database
        try {
            const projectDocRef = window.doc(window.db, "projects", projectId);
            const projectDoc = await window.getDoc(projectDocRef);

            if (!projectDoc.exists()) {
                showToast("The associated effect was not found.", "danger");
                return;
            }

            // Prepare the workspace object
            const workspace = { docId: projectDoc.id, ...projectDoc.data() };
            if (workspace.createdAt && workspace.createdAt.toDate) {
                workspace.createdAt = workspace.createdAt.toDate();
            }

            // Load the effect into the builder
            loadWorkspace(workspace);

            // Optionally close the offcanvas if it's open
            const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('gallery-offcanvas'));
            if (offcanvas) offcanvas.hide();

        } catch (error) {
            console.error("Error loading effect from notification:", error);
            showToast("Failed to load the effect.", "danger");
            // We still proceed to mark as read even if the load failed.
        }

        // 2. Mark the specific notification as read
        try {
            const notifDocRef = window.doc(window.db, "notifications", notificationId);
            await window.updateDoc(notifDocRef, { read: true });
            // The real-time listener will automatically update the badge/dropdown UI.
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    }

    /**
     * Fetches the display names for a given array of Project IDs.
     * @param {string[]} projectIds - Array of project IDs.
     * @returns {Promise<Map<string, string>>} A map of Project ID to Project Name.
     */
    async function fetchProjectNames(projectIds) {
        if (projectIds.length === 0) return new Map();

        const namesMap = new Map();
        const projectsRef = window.collection(window.db, "projects");

        // Split IDs into batches of 10 for the 'in' query limit
        const batches = [];
        for (let i = 0; i < projectIds.length; i += 10) {
            batches.push(projectIds.slice(i, i + 10));
        }

        // Fetch project documents in parallel batches
        const promises = batches.map(batch => {
            const q = window.query(projectsRef, window.where(window.documentId, 'in', batch));
            return window.getDocs(q).then(snapshot => {
                snapshot.forEach(doc => {
                    const data = doc.data();
                    // Store the project name
                    namesMap.set(doc.id, data.name || 'Undefined Project');
                });
            });
        });

        await Promise.all(promises);
        return namesMap;
    }

    async function likeEffect(docId) {
        const user = window.auth.currentUser;
        if (!user) {
            showToast("You must be logged in to like or unlike an effect.", 'danger');
            return;
        }

        const docRef = window.doc(window.db, "projects", docId);
        let action = '';
        let newLikesCount = 0;
        let projectOwnerId = ''; // To capture the recipient UID

        // References to UI elements (must be defined outside the transaction)
        const likeBtn = document.getElementById(`like-btn-${docId}`);
        const likeCountSpan = document.getElementById(`like-count-value-${docId}`);

        try {
            await window.runTransaction(window.db, async (transaction) => {
                const projectDoc = await transaction.get(docRef);
                if (!projectDoc.exists()) {
                    throw new Error("Project does not exist!");
                }

                const data = projectDoc.data();
                const likedBy = data.likedBy || {};
                const isCurrentlyLiked = likedBy.hasOwnProperty(user.uid);

                projectOwnerId = data.userId; // Get the owner's ID
                newLikesCount = data.likes || 0;

                if (isCurrentlyLiked) {
                    // UNLIKE ACTION
                    newLikesCount = Math.max(0, newLikesCount - 1);
                    delete likedBy[user.uid];
                    action = 'unliked';
                } else {
                    // LIKE ACTION
                    newLikesCount += 1;
                    likedBy[user.uid] = true;
                    action = 'liked';
                }

                // Commit the transaction: We remove lastLikeTime as it's now tracked by the 'notifications' collection.
                transaction.update(docRef, {
                    likes: newLikesCount,
                    likedBy: likedBy,
                    // lastLikeTime is NO LONGER needed here, rely on the notification document timestamp.
                });
            });

            // --- NEW: Create Notification Document AFTER successful transaction commit ---
            // We only create a notification on a LIKE action, and only if the liker is not the owner.
            if (action === 'liked' && projectOwnerId !== user.uid) {
                //if (action === 'liked') {
                await window.addDoc(window.collection(window.db, "notifications"), {
                    recipientId: projectOwnerId,
                    senderId: user.uid,
                    projectId: docId,
                    eventType: 'like',
                    timestamp: window.serverTimestamp(),
                    read: false
                });
            }
            // --- END NEW ---

            // --- UI Update Logic (Runs AFTER successful transaction commit) ---
            if (likeCountSpan) {
                // Update the count based on the committed action
                const currentCount = parseInt(likeCountSpan.textContent.trim()) || 0;
                const finalCount = Math.max(0, currentCount + (action === 'liked' ? 1 : -1));
                likeCountSpan.textContent = finalCount;
            }

            if (likeBtn) {
                if (action === 'liked') {
                    likeBtn.classList.remove('btn-outline-danger');
                    likeBtn.classList.add('btn-danger');
                    likeBtn.innerHTML = '<i class="bi bi-heart-fill me-1"></i> Liked';
                    likeBtn.title = "Unlike this effect";
                } else {
                    likeBtn.classList.remove('btn-danger');
                    likeBtn.classList.add('btn-outline-danger');
                    likeBtn.innerHTML = '<i class="bi bi-heart me-1"></i> Like';
                    likeBtn.title = "Like this effect";
                }
            }
            // --- END UI Update Logic ---

            showToast(`Effect ${action}!`, 'success');

        } catch (error) {
            console.error("Error liking/unliking effect:", error);
            showToast("Could not process like/unlike action. Check permissions/log.", 'danger');
        }
    }

    let notificationListenerCleanup = null;

    function setupNotificationListener(user) {
        // 1. Clean up previous listener
        if (notificationListenerCleanup) {
            notificationListenerCleanup();
            notificationListenerCleanup = null;
        }

        const toggleBtn = document.getElementById('notification-dropdown-toggle');
        const notificationBadge = document.getElementById('notification-badge');
        const listContainer = document.getElementById('notification-list-container');
        const markAllBtn = document.getElementById('mark-all-read-btn');

        if (!user) {
            // Render logged-out state and disable button
            if (listContainer) {
                listContainer.innerHTML = `
                <li class="dropdown-item disabled text-center text-body-secondary small p-3">
                    <i class="bi bi-person-fill me-1"></i> Sign in to view notifications.
                </li>
            `;
            }
            toggleBtn.disabled = true;
            notificationBadge.classList.add('d-none');
            return;
        }

        // If signed in, enable the button and set up listener
        toggleBtn.disabled = false;

        const notificationsRef = window.collection(window.db, "notifications");

        // 2. Query for unread notifications addressed to the current user
        const q = window.query(
            notificationsRef,
            window.where("recipientId", "==", user.uid),
            window.where("read", "==", false),
            window.orderBy("timestamp", "desc")
        );

        notificationListenerCleanup = window.onSnapshot(q, async (snapshot) => {
            const unreadNotifications = [];
            const senderUids = new Set();
            const projectIds = new Set(); // <-- NEW: Set to collect unique project IDs

            // 4. Collect Notification Data
            snapshot.forEach(doc => {
                const data = doc.data();
                unreadNotifications.push({ ...data, docId: doc.id });
                senderUids.add(data.senderId);
                projectIds.add(data.projectId); // <-- NEW: Collect project IDs
            });

            // 5. Fetch Display Names for the senders and Project Names
            const namesMap = await fetchDisplayNames(Array.from(senderUids));

            // <-- NEW: Fetch Project Names (Batched Query) -->
            const projectNamesMap = await fetchProjectNames(Array.from(projectIds));
            // <-- END NEW -->

            // 6. Finalize notification list with names and project names
            const finalNotifications = unreadNotifications.map(notification => ({
                ...notification,
                senderName: namesMap.get(notification.senderId) || 'A User',
                // <-- NEW: Inject the project name -->
                projectName: projectNamesMap.get(notification.projectId) || 'Undefined Effect'
            }));

            // 7. Update the UI
            const newUnreadCount = finalNotifications.length;
            notificationBadge.textContent = newUnreadCount;
            if (newUnreadCount > 0) {
                notificationBadge.classList.remove('d-none');
            } else {
                notificationBadge.classList.add('d-none');
            }

            // Render the dropdown
            renderNotificationDropdown(finalNotifications);

        }, (err) => {
            console.error("Error setting up notification listener:", err);
        });
    }
    window.setupNotificationListener = setupNotificationListener; // Expose globally

    function drawSnapLines(snapLines) {
        ctx.save();
        ctx.resetTransform();
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        snapLines.forEach(line => {
            if (line.duration <= 0) return;
            ctx.strokeStyle = line.snapType === 'center' ? 'purple' : line.type === 'horizontal' ? 'blue' : 'red';
            ctx.globalAlpha = 0.7;
            ctx.beginPath();
            if (line.type === 'horizontal') {
                ctx.moveTo(0, line.y);
                ctx.lineTo(canvas.width, line.y);
            } else if (line.type === 'vertical') {
                ctx.moveTo(line.x, 0);
                ctx.lineTo(line.x, canvas.height);
            }
            ctx.stroke();
            ctx.globalAlpha = 1.0;
        });
        ctx.restore();
    }


    /**
     * Clears all objects and resets the workspace to a blank state.
     */
    function resetWorkspace() {
        // Clear all object-specific data
        objects = [];
        configStore = configStore.filter(c => !(c.property || c.name).startsWith('obj'));
        selectedObjectIds = [];

        // Reset the undo/redo appHistory
        appHistory.stack = [];
        appHistory.index = -1;

        // Get the current user and set new default values
        const user = window.auth.currentUser;
        const newTitle = (user && user.displayName) ? user.displayName : "SRGB Interactive Effect Builder";
        const newPublisher = (user && user.displayName) ? user.displayName : "Anonymous";
        const newDescription = "";

        // Find and update the global settings in the central configStore
        const titleConf = configStore.find(c => c.name === 'title');
        if (titleConf) titleConf.default = newTitle;

        const descConf = configStore.find(c => c.name === 'description');
        if (descConf) descConf.default = newDescription;

        const pubConf = configStore.find(c => c.name === 'publisher');
        if (pubConf) pubConf.default = newPublisher;

        // Temporarily set the isRestoring flag to prevent state preservation during the render
        isRestoring = true;
        renderForm();
        isRestoring = false;

        drawFrame();
        updateUndoRedoButtons();

        // Record this new, blank state as the first appHistory entry
        recordHistory();

        // Clear any saved project ID from the session
        currentProjectDocId = null;
        updateShareButtonState();

        loadedStateSnapshot = null;
        dirtyProperties.clear();
        baselineStateForURL = getControlValues();

        showToast("New workspace created.", "info");
    }

    /**
     * Updates the enabled/disabled state of the share button.
     */
    function updateShareButtonState() {
        shareBtn.disabled = !currentProjectDocId;
    }

    /**
     * Populates the gallery panel with projects using a card-based layout.
     * @param {Array} projects - The array of project objects to display.
     * @param {boolean} [append=false] - If true, adds projects to the list. Otherwise, replaces the list.
     */
    function populateGallery(projects, append = false) {
        const galleryList = document.getElementById('gallery-project-list');
        const currentUser = window.auth.currentUser;

        if (!append) {
            galleryList.innerHTML = ''; // Clear previous results only if not appending
        }

        if (projects.length === 0 && !append) {
            galleryList.innerHTML = '<div class="col-12 text-center text-body-secondary mt-4"><p>No effects found.</p></div>';
            return;
        }

        projects.forEach(project => {
            // The card-building logic from the previous step remains the same.
            // This function body is identical to the one in the previous response.
            const col = document.createElement('div');
            col.className = 'col';
            col.id = `gallery-item-${project.docId}`;

            const card = document.createElement('div');
            card.className = 'card h-100 bg-body-tertiary';

            const img = document.createElement('img');
            img.src = project.thumbnail || 'placeholder.png';
            img.className = 'card-img-top';
            img.style.height = '150px';
            img.style.objectFit = 'cover';
            img.style.cursor = 'pointer';
            img.onclick = () => {
                loadWorkspace(project);
                const galleryOffcanvas = bootstrap.Offcanvas.getInstance(galleryOffcanvasEl);
                galleryOffcanvas.hide();
            };
            card.appendChild(img);

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body d-flex flex-column';

            const title = document.createElement('h6');
            title.className = 'card-title';
            title.textContent = project.name;

            const subtitle = document.createElement('small');
            subtitle.className = 'card-subtitle mb-2 text-body-secondary';
            const formattedDate = project.createdAt ? project.createdAt.toLocaleDateString() : 'N/A';
            subtitle.textContent = `By ${project.creatorName || 'Anonymous'} on ${formattedDate}`;

            const statsEl = document.createElement('div');
            statsEl.className = 'mt-auto d-flex justify-content-start small text-body-secondary gap-3';
            statsEl.innerHTML = `
            <span title="Views"><i class="bi bi-eye-fill me-1"></i>${project.viewCount || 0}</span>
            <span title="Downloads"><i class="bi bi-download me-1"></i>${project.downloadCount || 0}</span>
            <span id="like-count-span-${project.docId}" title="Likes" style="cursor: pointer;">
                <i class="bi bi-heart-fill me-1"></i>
                <span id="like-count-value-${project.docId}">${project.likes || 0}</span>
            </span>
        `;

            cardBody.appendChild(title);
            cardBody.appendChild(subtitle);
            cardBody.appendChild(statsEl);
            card.appendChild(cardBody);

            const cardFooter = document.createElement('div');
            cardFooter.className = 'card-footer d-flex justify-content-between align-items-center';

            const btnGroup = document.createElement('div');
            btnGroup.className = 'btn-group btn-group-sm';
            btnGroup.setAttribute('role', 'group');

            const loadBtn = document.createElement('button');
            loadBtn.className = 'btn btn-outline-primary';
            loadBtn.innerHTML = '<i class="bi bi-box-arrow-down me-1"></i> Load';
            loadBtn.title = "Load Effect";
            loadBtn.onclick = () => {
                loadWorkspace(project);
                const galleryOffcanvas = bootstrap.Offcanvas.getInstance(galleryOffcanvasEl);
                galleryOffcanvas.hide();
            };
            btnGroup.appendChild(loadBtn);

            const isInitiallyLiked = currentUser && project.likedBy && project.likedBy[currentUser.uid];
            const likeBtn = document.createElement('button');
            likeBtn.id = `like-btn-${project.docId}`;
            likeBtn.className = `btn ${isInitiallyLiked ? 'btn-danger' : 'btn-outline-danger'}`;
            likeBtn.innerHTML = isInitiallyLiked ? '<i class="bi bi-heart-fill"></i>' : '<i class="bi bi-heart"></i>';
            likeBtn.title = isInitiallyLiked ? "Unlike" : "Like";
            likeBtn.onclick = () => likeEffect(project.docId);
            btnGroup.appendChild(likeBtn);

            cardFooter.appendChild(btnGroup);

            const ownerControls = document.createElement('div');
            if (currentUser && (currentUser.uid === project.userId || currentUser.uid === ADMIN_UID)) {
                if (currentUser.uid === project.userId) {
                    const deleteBtn = document.createElement('button');
                    deleteBtn.className = 'btn btn-sm btn-outline-danger ms-2';
                    deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
                    deleteBtn.title = "Delete Effect";
                    deleteBtn.onclick = () => {
                        showConfirmModal(
                            'Delete Project', `Are you sure you want to delete "${project.name}"?`, 'Delete',
                            async () => {
                                await window.deleteDoc(window.doc(window.db, "projects", project.docId));
                            }
                        );
                    };
                    ownerControls.appendChild(deleteBtn);
                }
                if (currentUser.uid === ADMIN_UID) {
                    const isFeatured = project.featured === true;
                    const featureBtn = document.createElement('button');
                    featureBtn.className = `btn btn-sm ms-2 ${isFeatured ? 'btn-warning' : 'btn-outline-warning'}`;
                    featureBtn.innerHTML = isFeatured ? '<i class="bi bi-star-fill"></i>' : '<i class="bi bi-star"></i>';
                    featureBtn.title = isFeatured ? 'Unfeature' : 'Feature';
                    featureBtn.dataset.docId = project.docId;
                    featureBtn.onclick = function () { toggleFeaturedStatus(this, project.docId); };
                    ownerControls.appendChild(featureBtn);
                }
            }
            cardFooter.appendChild(ownerControls);
            card.appendChild(cardFooter);
            col.appendChild(card);
            galleryList.appendChild(col);

            setTimeout(() => {
                const likesSpan = document.getElementById(`like-count-span-${project.docId}`);
                if (likesSpan) {
                    likesSpan.addEventListener('click', () => showLikersModal(project.docId, project.name));
                }
            }, 0);
        });
    }

    // --- START: Theme Switcher Logic ---

    /**
     * Gets the saved theme from localStorage.
     * @returns {string|null} The saved theme ('light', 'dark', 'auto') or null.
     */
    const getStoredTheme = () => localStorage.getItem('theme');
    /**
     * Saves the selected theme to localStorage.
     * @param {string} theme - The theme to save.
     */
    const setStoredTheme = theme => localStorage.setItem('theme', theme);

    /**
     * Determines the preferred theme based on storage or system preference.
     * @returns {string} The preferred theme.
     */
    const getPreferredTheme = () => {
        const storedTheme = getStoredTheme();
        if (storedTheme) {
            return storedTheme;
        }
        return 'dark'; // Default to dark theme
    };

    /**
     * Applies the specified theme to the document.
     * @param {string} theme - The theme to apply ('light', 'dark', 'auto').
     */
    const setTheme = theme => {
        if (theme === 'auto') {
            document.documentElement.setAttribute('data-bs-theme', (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
        } else {
            document.documentElement.setAttribute('data-bs-theme', theme);
        }
    };

    /**
     * Updates the theme switcher UI to reflect the active theme.
     * @param {string} theme - The currently active theme.
     */
    const updateThemeSwitcherUI = (theme) => {
        const themeIcon = document.getElementById('theme-icon');
        const themeButtons = document.querySelectorAll('[data-bs-theme-value]');

        if (theme === 'auto') {
            themeIcon.className = 'bi bi-circle-half';
        } else if (theme === 'dark') {
            themeIcon.className = 'bi bi-moon-stars-fill';
        } else {
            themeIcon.className = 'bi bi-sun-fill';
        }

        themeButtons.forEach(button => {
            const checkmark = button.querySelector('.bi-check2');
            if (button.getAttribute('data-bs-theme-value') === theme) {
                button.classList.add('active');
                checkmark.classList.remove('d-none');
            } else {
                button.classList.remove('active');
                checkmark.classList.add('d-none');
            }
        });
    };

    const themeSwitcherBtn = document.getElementById('theme-switcher-btn');
    if (themeSwitcherBtn) {
        themeSwitcherBtn.addEventListener('click', () => {
            const themes = ['light', 'dark', 'auto'];
            const currentTheme = getStoredTheme() || getPreferredTheme();
            const currentIndex = themes.indexOf(currentTheme);
            const nextIndex = (currentIndex + 1) % themes.length;
            const newTheme = themes[nextIndex];

            setStoredTheme(newTheme);
            setTheme(newTheme);
            updateThemeSwitcherUI(newTheme);
        });
    }

    /**
     * Fetches the next batch of projects for lazy loading.
     */
    async function loadMoreProjects() {
        if (isLoadingMore || !lastVisibleDoc) return;
        isLoadingMore = true;

        const loadingIndicator = document.createElement('li');
        loadingIndicator.className = 'list-group-item text-center loading-indicator';
        loadingIndicator.innerHTML = '<div class="spinner-border spinner-border-sm"></div>';
        galleryList.appendChild(loadingIndicator);

        const nextQuery = window.query(currentGalleryQuery, window.startAfter(lastVisibleDoc), window.limit(10));

        try {
            const querySnapshot = await window.getDocs(nextQuery);
            const newProjects = [];
            querySnapshot.forEach(doc => {
                const data = doc.data();
                if (data.createdAt && data.createdAt.toDate) data.createdAt = data.createdAt.toDate();
                newProjects.push({ docId: doc.id, ...data });
            });

            lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
            populateGallery(newProjects, true);
        } catch (error) {
            console.error("Error loading more projects:", error);
            showToast("Could not load more effects.", 'danger');
        } finally {
            isLoadingMore = false;
        }
    }

    /**
     * Initializes and shows the gallery with a specific query.
     * @param {string} title - The title for the offcanvas panel.
     * @param {Query} baseQuery - The initial Firestore query.
     */
    async function startGallery(title, baseQuery) {
        document.getElementById('galleryOffcanvasLabel').textContent = title;
        galleryList.innerHTML = '<li class="list-group-item text-center"><div class="spinner-border spinner-border-sm"></div></li>';
        isLoadingMore = true;
        currentGalleryQuery = baseQuery;

        const firstQuery = window.query(baseQuery, window.limit(10));

        try {
            const querySnapshot = await window.getDocs(firstQuery);
            const projects = [];
            querySnapshot.forEach(doc => {
                const data = doc.data();
                if (data.createdAt && data.createdAt.toDate) data.createdAt = data.createdAt.toDate();
                projects.push({ docId: doc.id, ...data });
            });

            lastVisibleDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
            populateGallery(projects);
        } catch (error) {
            console.error("Error loading initial projects:", error);
            galleryList.innerHTML = '<li class="list-group-item text-danger">Could not load effects.</li>';
        } finally {
            isLoadingMore = false;
        }
    }

    // Initialize theme on page load
    const initialTheme = getPreferredTheme();
    setTheme(initialTheme);
    updateThemeSwitcherUI(initialTheme);

    // Listen for changes in system theme preference
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (getPreferredTheme() === 'auto') {
            setTheme('auto');
        }
    });

    // Add click listeners to theme switcher buttons
    // document.querySelectorAll('[data-bs-theme-value]').forEach(button => {
    //     button.addEventListener('click', () => {
    //         const theme = button.getAttribute('data-bs-theme-value');
    //         setStoredTheme(theme);
    //         setTheme(theme);
    //         updateThemeSwitcherUI(theme);
    //     });
    // });

    // --- END: Theme Switcher Logic ---

    /**
     * Displays a notification message.
     * @param {string} message - The message to display.
     */
    function showNotification(message) {
        // This now uses the new toast system
        showToast(message, 'success');
    }

    /**
     * Parses a <meta> element into a configuration object.
     * Handles both standard property-based and custom named formats.
     * @param {HTMLMetaElement} metaElement - The meta element to parse.
     * @returns {object} A configuration object.
     */
    function parseMetaToConfig(metaElement) {
        const config = {};
        // First, check if it's a standard property-based tag (like enablePalette).
        if (metaElement.hasAttribute('property')) {
            for (const attr of metaElement.attributes) {
                config[attr.name] = attr.value;
            }
        }
        // If not, then check for the special standalone tags.
        else if (metaElement.hasAttribute('title')) {
            config.name = 'title';
            config.default = metaElement.getAttribute('title');
            config.type = 'text';
            config.label = 'Effect Title';
        } else if (metaElement.hasAttribute('description')) {
            config.name = 'description';
            config.default = metaElement.getAttribute('description');
            config.type = 'text';
            config.label = 'Description';
        } else if (metaElement.hasAttribute('publisher')) {
            config.name = 'publisher';
            config.default = metaElement.getAttribute('publisher');
            config.type = 'text';
            config.label = 'Developer Name';
        }
        return config;
    }

    /**
     * Groups a flat array of configuration objects into general settings and object-specific settings.
     * @param {object[]} flatConfig - The flat array of config objects.
     * @returns {{general: object[], objects: Object.<string, object[]>}} The grouped configuration.
     */
    function groupConfigs(flatConfig) {
        const grouped = { general: [], objects: {} };
        flatConfig.forEach(config => {
            const key = config.property || config.name;
            if (key && key.startsWith('obj')) {
                const match = key.match(/^obj(\d+)_/);
                if (match) {
                    const id = match[1];
                    if (!grouped.objects[id]) grouped.objects[id] = [];
                    grouped.objects[id].push(config);
                }
            } else {
                grouped.general.push(config);
            }
        });
        return grouped;
    }

    /**
     * Creates an HTML form control element based on a configuration object.
     * @param {object} config - The configuration for the control.
     * @returns {HTMLDivElement} The generated form group element.
     */
    function createFormControl(config) {
        const {
            property, name, label, type, default: defaultValue,
            values, min, max, description
        } = config;
        const controlId = property || name;
        const formGroup = document.createElement('div');
        formGroup.className = 'mb-3';

        const labelEl = document.createElement('label');
        labelEl.htmlFor = controlId;
        labelEl.className = 'form-label';
        if (label) {
            const cleanLabel = label.includes(':') ? label.substring(label.indexOf(':') + 1).trim() : label;
            labelEl.textContent = cleanLabel;
            if (description) {
                labelEl.title = description;
            } else {
                labelEl.title = `Controls the ${cleanLabel.toLowerCase()}`;
            }
        }
        labelEl.dataset.bsToggle = 'tooltip';
        formGroup.appendChild(labelEl);

        if (type === 'number') {
            const inputGroup = document.createElement('div');
            inputGroup.className = 'd-flex align-items-center';
            const input = document.createElement('input');
            input.id = controlId;
            input.className = 'form-control';
            input.style.width = '100px';
            input.name = controlId;
            input.type = 'number';
            input.value = defaultValue;
            if (min) input.min = min;
            if (max) input.max = max;
            input.step = config.step || '1';
            const slider = document.createElement('input');
            slider.type = 'range';
            slider.className = 'form-range flex-grow-1 ms-2';
            slider.id = `${controlId}_slider`;
            slider.name = `${controlId}_slider`;
            if (min) slider.min = min;
            if (max) slider.max = max;
            slider.step = config.step || '1';
            slider.value = defaultValue;
            inputGroup.appendChild(input);
            inputGroup.appendChild(slider);
            formGroup.appendChild(inputGroup);
        } else if (type === 'text') {
            const input = document.createElement('input');
            input.id = controlId;
            input.className = 'form-control';
            input.name = controlId;
            input.type = 'text';
            input.value = defaultValue;
            formGroup.appendChild(input);
        } else if (type === 'combobox') {
            const vals = values.split(',');
            vals.sort();
            const select = document.createElement('select');
            select.id = controlId;
            select.className = 'form-select';
            select.name = controlId;
            vals.forEach(val => {
                const option = document.createElement('option');
                option.value = val;
                option.textContent = val.charAt(0).toUpperCase() + val.slice(1).replace(/-/g, ' ');
                if (val === defaultValue) option.selected = true;
                select.appendChild(option);
            });
            formGroup.appendChild(select);
        } else if (type === 'boolean') {
            const checkGroup = document.createElement('div');
            checkGroup.className = 'form-check form-switch';
            const check = document.createElement('input');
            check.id = controlId;
            check.type = 'checkbox';
            check.className = 'form-check-input';
            check.name = controlId;
            check.checked = (defaultValue === 'true');
            const checkLabel = document.createElement('label');
            checkLabel.className = 'form-check-label';
            checkLabel.htmlFor = controlId;
            if (label) {
                const cleanLabel = label.includes(':') ? label.substring(label.indexOf(':') + 1).trim() : label;
                checkLabel.textContent = cleanLabel;
            }
            checkGroup.appendChild(check);
            checkGroup.appendChild(checkLabel);
            formGroup.appendChild(checkGroup);
        } else if (type === 'textarea' || type === 'textfield') {
            const textarea = document.createElement('textarea');
            textarea.id = controlId;
            textarea.className = 'form-control';
            textarea.name = controlId;
            textarea.rows = (type === 'textarea') ? 10 : 3;
            textarea.textContent = String(defaultValue).replace(/\n/g, '\n');
            formGroup.appendChild(textarea);
            if (controlId.endsWith('_pixelArtData')) {
                const toolLink = document.createElement('a');
                toolLink.href = 'https://pixelart.nolliergb.com/';
                toolLink.target = '_blank';
                toolLink.rel = 'noopener noreferrer';
                toolLink.className = 'form-text d-block mt-2';
                toolLink.innerHTML = 'Open Pixel Art Data Generator <i class="bi bi-box-arrow-up-right"></i>';
                formGroup.appendChild(toolLink);
            } else if (controlId.endsWith('_spawn_svg_path')) {
                const toolLink = document.createElement('a');
                toolLink.href = 'https://yqnn.github.io/svg-path-editor/';
                toolLink.target = '_blank';
                toolLink.rel = 'noopener noreferrer';
                toolLink.className = 'form-text d-block mt-2';
                toolLink.innerHTML = 'Open SVG Path Editor <i class="bi bi-box-arrow-up-right"></i>';
                formGroup.appendChild(toolLink);
            }
        } else if (type === 'color') {
            const colorGroup = document.createElement('div');
            colorGroup.className = 'd-flex align-items-center';
            const input = document.createElement('input');
            input.id = controlId;
            input.className = 'form-control form-control-color';
            input.name = controlId;
            input.type = 'color';
            input.value = defaultValue;
            const hexInput = document.createElement('input');
            hexInput.type = 'text';
            hexInput.className = 'form-control ms-2';
            hexInput.style.width = '100px';
            hexInput.value = defaultValue;
            hexInput.id = `${controlId}_hex`;
            hexInput.name = `${controlId}_hex`;
            input.addEventListener('input', () => {
                hexInput.value = input.value;
            });
            hexInput.addEventListener('input', () => {
                if (/^#[0-9A-F]{6}$/i.test(hexInput.value)) {
                    input.value = hexInput.value;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
            colorGroup.appendChild(input);
            colorGroup.appendChild(hexInput);
            formGroup.appendChild(colorGroup);
        } else if (type === 'gradientpicker') {
            // --- START: CORRECTED PHOTOSHOP-STYLE GRADIENT PICKER ---
            const container = document.createElement('div');
            container.className = 'gradient-picker-container';

            const previewBar = document.createElement('div');
            previewBar.className = 'gradient-preview-bar';
            const previewOverlay = document.createElement('div');
            previewOverlay.className = 'gradient-preview-overlay';
            previewBar.appendChild(previewOverlay);

            const stopsContainer = document.createElement('div');
            stopsContainer.className = 'gradient-stops-container';

            const activeControlsContainer = document.createElement('div');
            activeControlsContainer.className = 'gradient-active-stop-controls';
            activeControlsContainer.style.display = 'none';

            const helpText = document.createElement('div');
            helpText.className = 'form-text text-body-secondary small mt-2';
            helpText.innerHTML = `
                <strong>Add:</strong> Click empty space below bar | 
                <strong>Select/Edit:</strong> Click a marker | 
                <strong>Delete:</strong> Drag a marker down
            `;

            const hiddenInput = document.createElement('textarea');
            hiddenInput.id = controlId;
            hiddenInput.name = controlId;
            hiddenInput.className = 'd-none';
            hiddenInput.value = defaultValue;

            let stops = [];
            let activeStopId = -1; // Use a stable ID instead of an index
            let nextStopId = 0; // Counter for unique IDs
            let isDraggingStop = false;

            const updateGradient = () => {
                stops.sort((a, b) => a.position - b.position);

                // Create a clean version of stops for saving (without the temporary ID)
                const stopsToSave = stops.map(({ color, position }) => ({ color, position }));
                const newGradientJson = JSON.stringify(stopsToSave);
                hiddenInput.value = newGradientJson;

                const fieldset = hiddenInput.closest('fieldset[data-object-id]');
                let isSharp = false;
                if (fieldset) {
                    const sharpToggleName = controlId.replace('gradientStops', 'useSharpGradient').replace('strokeGradientStops', 'strokeUseSharpGradient');
                    const sharpGradientToggle = fieldset.querySelector(`[name="${sharpToggleName}"]`);
                    if (sharpGradientToggle) isSharp = sharpGradientToggle.checked;
                }

                let gradientString;
                if (stops.length === 0) gradientString = 'transparent';
                else if (stops.length === 1) gradientString = stops[0].color;
                else if (isSharp) {
                    let parts = [];
                    parts.push(`${stops[0].color} ${stops[0].position * 100}%`);
                    for (let i = 1; i < stops.length; i++) {
                        const prevColor = stops[i - 1].color;
                        const currentPosPercent = stops[i].position * 100;
                        parts.push(`${prevColor} ${currentPosPercent}%`);
                        parts.push(`${stops[i].color} ${currentPosPercent}%`);
                    }
                    gradientString = `linear-gradient(to right, ${parts.join(', ')})`;
                } else {
                    gradientString = `linear-gradient(to right, ${stops.map(s => `${s.color} ${s.position * 100}%`).join(', ')})`;
                }
                previewOverlay.style.background = gradientString;

                if (fieldset && !isRestoring) {
                    hiddenInput.dispatchEvent(new Event('input', { bubbles: true }));
                }
            };

            const renderStops = () => {
                stopsContainer.innerHTML = '';
                stops.forEach((stop) => {
                    const marker = document.createElement('div');
                    marker.className = 'gradient-stop-marker';
                    marker.dataset.id = stop.id; // Use the unique ID
                    marker.style.left = `${stop.position * 100}%`;
                    marker.style.backgroundColor = stop.color;

                    if (stop.id === activeStopId) {
                        marker.classList.add('active');
                    }
                    stopsContainer.appendChild(marker);
                });
            };

            const updateActiveControls = () => {
                const activeStop = stops.find(s => s.id === activeStopId);
                if (!activeStop) {
                    activeControlsContainer.style.display = 'none';
                    return;
                }
                activeControlsContainer.style.display = '';
                activeControlsContainer.querySelector('.active-color-input').value = activeStop.color;
                activeControlsContainer.querySelector('.active-hex-input').value = activeStop.color;
                activeControlsContainer.querySelector('.active-position-input').value = (activeStop.position * 100).toFixed(1);
            };

            const setActiveStop = (id) => {
                activeStopId = id;
                renderStops();
                updateActiveControls();
            };

            activeControlsContainer.innerHTML = `
                <div class="row gx-2 align-items-center">
                    <div class="col-auto"><label class="col-form-label-sm">Color:</label></div>
                    <div class="col-auto"><input type="color" class="form-control form-control-color form-control-sm active-color-input"></div>
                    <div class="col-auto"><input type="text" class="form-control form-control-sm active-hex-input" style="width: 90px;"></div>
                    <div class="col-auto ms-auto"><label class="col-form-label-sm">Position:</label></div>
                    <div class="col-auto"><div class="input-group input-group-sm" style="width: 110px;"><input type="number" class="form-control active-position-input" min="0" max="100" step="0.1"><span class="input-group-text">%</span></div></div>
                </div>
            `;

            const activeColorInput = activeControlsContainer.querySelector('.active-color-input');
            const activeHexInput = activeControlsContainer.querySelector('.active-hex-input');
            const activePosInput = activeControlsContainer.querySelector('.active-position-input');

            const updateActiveStopProperty = (prop, value) => {
                const activeStop = stops.find(s => s.id === activeStopId);
                if (activeStop) {
                    activeStop[prop] = value;
                    renderStops();
                    updateGradient();
                }
            };

            activeColorInput.addEventListener('input', () => {
                activeHexInput.value = activeColorInput.value;
                updateActiveStopProperty('color', activeColorInput.value);
            });
            activeHexInput.addEventListener('input', () => {
                if (/^#[0-9A-F]{6}$/i.test(activeHexInput.value)) {
                    activeColorInput.value = activeHexInput.value;
                    updateActiveStopProperty('color', activeHexInput.value);
                }
            });
            activePosInput.addEventListener('input', () => {
                let newPos = parseFloat(activePosInput.value) / 100;
                updateActiveStopProperty('position', Math.max(0, Math.min(1, newPos)));
            });

            stopsContainer.addEventListener('mousedown', (e) => {
                const target = e.target;
                if (target.classList.contains('gradient-stop-marker')) {
                    isDraggingStop = true;
                    const id = parseInt(target.dataset.id, 10);
                    setActiveStop(id);

                    const startX = e.clientX;
                    const stopToDrag = stops.find(s => s.id === id);
                    const initialPosition = stopToDrag ? stopToDrag.position : 0;
                    const containerWidth = stopsContainer.offsetWidth;

                    const onMouseMove = (moveEvent) => {
                        if (!isDraggingStop) return;

                        const dx = moveEvent.clientX - startX;
                        const posDelta = dx / containerWidth;
                        let newPos = initialPosition + posDelta;
                        newPos = Math.max(0, Math.min(1, newPos));

                        const currentActiveStop = stops.find(s => s.id === activeStopId);
                        if (currentActiveStop) {
                            currentActiveStop.position = newPos;
                        }

                        // --- START: THIS IS THE FIX ---
                        // Re-query the DOM for the currently active marker, since the original
                        // 'target' was destroyed and re-created when it was selected.
                        const activeMarker = stopsContainer.querySelector('.gradient-stop-marker.active');
                        if (activeMarker) {
                            activeMarker.style.left = `${newPos * 100}%`;
                        }
                        // --- END: THIS IS THE FIX ---

                        activePosInput.value = (newPos * 100).toFixed(1);
                        updateGradient();

                        if (moveEvent.clientY > stopsContainer.getBoundingClientRect().bottom + 30 && stops.length > 2) {
                            const indexToDelete = stops.findIndex(s => s.id === activeStopId);
                            if (indexToDelete > -1) stops.splice(indexToDelete, 1);
                            setActiveStop(-1);
                            onMouseUp();
                        }
                    };

                    const onMouseUp = () => {
                        window.removeEventListener('mousemove', onMouseMove);
                        window.removeEventListener('mouseup', onMouseUp);
                        if (isDraggingStop) {
                            isDraggingStop = false;
                            renderStops();
                            updateGradient();
                        }
                    };

                    window.addEventListener('mousemove', onMouseMove);
                    window.addEventListener('mouseup', onMouseUp);
                } else if (e.target === stopsContainer) {
                    const rect = stopsContainer.getBoundingClientRect();
                    const newPos = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                    const newColor = getGradientColorAt(newPos, stops);
                    const newStop = { id: nextStopId++, color: newColor, position: newPos };
                    stops.push(newStop);
                    setActiveStop(newStop.id);
                    updateGradient();
                }
            });

            try {
                const loadedStops = JSON.parse(defaultValue);
                stops = loadedStops.map(s => ({ ...s, id: nextStopId++ }));
            } catch (e) {
                stops = [
                    { color: '#000000', position: 0, id: nextStopId++ },
                    { color: '#FFFFFF', position: 1, id: nextStopId++ }
                ];
            }

            container.appendChild(previewBar);
            container.appendChild(stopsContainer);
            container.appendChild(activeControlsContainer);
            container.appendChild(helpText);
            container.appendChild(hiddenInput);
            formGroup.appendChild(container);

            setActiveStop(stops.length > 0 ? stops[0].id : -1);

            setTimeout(() => {
                const fieldset = hiddenInput.closest('fieldset[data-object-id]');
                if (fieldset) {
                    const sharpToggleName = controlId.replace('gradientStops', 'useSharpGradient').replace('strokeGradientStops', 'strokeUseSharpGradient');
                    const sharpGradientToggle = fieldset.querySelector(`[name="${sharpToggleName}"]`);
                    if (sharpGradientToggle) {
                        sharpGradientToggle.addEventListener('input', updateGradient);
                    }
                    updateGradient();
                }
            }, 0);
        } else if (type === 'sensor') {
            const select = document.createElement('select');
            select.id = controlId;
            select.className = 'form-select';
            select.name = controlId;
            const cpuSensors = ['CPU Load', 'Memory Load', 'CPU Temperature', 'CPU Package Temp', ...Array.from({ length: 32 }, (_, i) => `CPU Core #${i + 1}`)];
            const gpuSensors = ['GPU Core Voltage', 'GPU Hot Spot Temperature', 'GPU Memory Junction Temp', 'GPU Core Temperature', 'GPU Memory Clock', 'GPU Core Clock', 'GPU Load', 'GPU VRAM Usage'];
            const fanSensors = [...Array.from({ length: 4 }, (_, i) => `Fan Speed #${i + 1}`), ...Array.from({ length: 7 }, (_, i) => `Fan Load #${i + 1}`)];
            const sensorValues = [...cpuSensors, ...gpuSensors, ...fanSensors];
            sensorValues.forEach(val => {
                const option = document.createElement('option');
                option.value = val;
                option.textContent = val;
                if (val === defaultValue) option.selected = true;
                select.appendChild(option);
            });
            formGroup.appendChild(select);
        } else if (type === 'nodetable') {
            const container = document.createElement('div');
            container.className = 'node-table-container';
            const hiddenTextarea = document.createElement('textarea');
            hiddenTextarea.id = controlId;
            hiddenTextarea.name = controlId;
            hiddenTextarea.style.display = 'none';
            hiddenTextarea.textContent = defaultValue;
            const table = document.createElement('table');
            table.className = 'table table-dark table-sm node-table';
            table.innerHTML = `<thead><tr><th scope="col">#</th><th scope="col">X</th><th scope="col">Y</th><th scope="col" style="width: 80px;">Actions</th></tr></thead><tbody></tbody>`;
            const tbody = table.querySelector('tbody');
            let nodes = [];
            try { nodes = JSON.parse(defaultValue); } catch (e) { console.error("Could not parse polyline nodes for table.", e); }
            nodes.forEach((node, index) => {
                const tr = document.createElement('tr');
                tr.dataset.index = index;
                tr.innerHTML = `<td class="align-middle">${index + 1}</td><td><input type="number" class="form-control form-control-sm node-x-input" value="${Math.round(node.x)}"></td><td><input type="number" class="form-control form-control-sm node-y-input" value="${Math.round(node.y)}"></td><td class="align-middle"><button type="button" class="btn btn-sm btn-outline-danger btn-delete-node" title="Delete Node"><i class="bi bi-trash"></i></button></td>`;
                tbody.appendChild(tr);
            });
            const addButton = document.createElement('button');
            addButton.type = 'button';
            addButton.className = 'btn btn-sm btn-outline-success mt-2 btn-add-node';
            addButton.innerHTML = '<i class="bi bi-plus-circle"></i> Add Node';
            container.appendChild(hiddenTextarea);
            container.appendChild(table);
            container.appendChild(addButton);
            formGroup.appendChild(container);
        } else if (type === 'pixelarttable') {
            const container = document.createElement('div');
            container.className = 'pixel-art-table-container';
            const hiddenTextarea = document.createElement('textarea');
            hiddenTextarea.id = controlId;
            hiddenTextarea.name = controlId;
            hiddenTextarea.style.display = 'none';
            hiddenTextarea.textContent = defaultValue;
            const framesContainer = document.createElement('div');
            framesContainer.className = 'd-flex flex-column gap-2 pixel-art-frames-container';
            let objectId = null;
            if (property) {
                const match = property.match(/^obj(\d+)_/);
                if (match) { objectId = match[1]; }
            }
            const gradientConf = configStore.find(c => c.property === `obj${objectId}_gradientStops`);
            let gradientStops = [];
            if (gradientConf && gradientConf.default) {
                try { gradientStops = JSON.parse(gradientConf.default); } catch (e) { console.error("Could not parse gradient stops for thumbnail rendering."); }
            }
            let frames = [];
            try { frames = JSON.parse(defaultValue); } catch (e) { console.error("Could not parse pixel art frames for table.", e); }
            frames.forEach((frame, index) => {
                const frameItem = document.createElement('div');
                frameItem.className = 'pixel-art-frame-item border rounded p-1 bg-body d-flex gap-2 align-items-center';
                frameItem.dataset.index = index;
                const textareaId = `frame-data-${objectId}-${index}`;
                const frameDataStr = typeof frame.data === 'string' ? frame.data : JSON.stringify(frame.data);
                frameItem.innerHTML = `<div class="frame-drag-handle text-body-secondary me-1 d-flex align-items-center" style="cursor: grab;" title="Drag to reorder frame"><i class="bi bi-grip-vertical"></i></div><canvas class="pixel-art-preview-canvas border rounded" width="60" height="60" title="Frame Preview"></canvas><div class="flex-grow-1"><div class="d-flex justify-content-between align-items-center mb-1"><strong class="frame-item-header small">Frame #${index + 1}</strong><div><button type="button" class="btn btn-sm btn-outline-info p-1" style="line-height: 1;" data-bs-toggle="modal" data-bs-target="#pixelArtEditorModal" data-target-id="${textareaId}" title="Edit Frame"><i class="bi bi-pencil-square"></i></button><button type="button" class="btn btn-sm btn-outline-danger p-1 btn-delete-frame" title="Delete Frame" style="line-height: 1;"><i class="bi bi-trash"></i></button></div></div><div class="input-group input-group-sm"><span class="input-group-text" title="Duration (seconds)"><i class="bi bi-clock"></i></span><input type="number" class="form-control form-control-sm frame-duration-input" value="${frame.duration || 0.1}" min="0.01" step="0.01"></div><textarea class="form-control form-control-sm frame-data-input d-none" id="${textareaId}" rows="6">${frameDataStr}</textarea></div>`;
                framesContainer.appendChild(frameItem);
                const previewCanvas = frameItem.querySelector('.pixel-art-preview-canvas');
                renderPixelArtPreview(previewCanvas, frameDataStr, gradientStops);
            });
            const buttonGroup = document.createElement('div');
            buttonGroup.className = 'd-flex flex-wrap gap-2 mt-2';
            const addButton = document.createElement('button');
            addButton.type = 'button';
            addButton.className = 'btn btn-sm btn-outline-success btn-add-frame';
            addButton.innerHTML = '<i class="bi bi-plus-circle"></i> Add Frame';
            const pasteSpriteButton = document.createElement('button');
            pasteSpriteButton.type = 'button';
            pasteSpriteButton.className = 'btn btn-sm btn-outline-secondary btn-paste-sprite';
            pasteSpriteButton.innerHTML = '<i class="bi bi-film"></i> Paste Sprite';
            pasteSpriteButton.dataset.bsToggle = 'modal';
            pasteSpriteButton.dataset.bsTarget = '#paste-sprite-modal';
            const uploadGifButton = document.createElement('button');
            uploadGifButton.type = 'button';
            uploadGifButton.className = 'btn btn-sm btn-outline-warning';
            uploadGifButton.innerHTML = '<i class="bi bi-filetype-gif"></i> Upload GIF';
            uploadGifButton.dataset.bsToggle = 'modal';
            uploadGifButton.dataset.bsTarget = '#upload-gif-modal';
            const browseButton = document.createElement('button');
            browseButton.type = 'button';
            browseButton.className = 'btn btn-sm btn-outline-info';
            browseButton.innerHTML = '<i class="bi bi-images"></i> Browse Gallery';
            browseButton.dataset.bsToggle = 'modal';
            browseButton.dataset.bsTarget = '#pixel-art-gallery-modal';
            buttonGroup.appendChild(addButton);
            buttonGroup.appendChild(pasteSpriteButton);
            buttonGroup.appendChild(uploadGifButton);
            buttonGroup.appendChild(browseButton);
            const gifInput = document.createElement('input');
            gifInput.type = 'file';
            gifInput.className = 'gif-upload-input d-none';
            gifInput.id = `gif-upload-input-${objectId}`;
            gifInput.accept = 'image/gif';
            container.appendChild(hiddenTextarea);
            container.appendChild(framesContainer);
            container.appendChild(buttonGroup);
            container.appendChild(gifInput);
            formGroup.appendChild(container);
        }
        return formGroup;
    }

    /**
     * Generates the meta tags and JavaScript variables for the final exported HTML file.
     * This is where the "Minimize Properties" logic is applied.
     */
    function generateOutputScript(exposedProperties = []) {
        let metaTags = '';
        let jsVars = '';
        let allKeys = [];
        const jsVarKeys = [];
        const generalValues = getControlValues();

        configStore.filter(conf => !(conf.property || conf.name).startsWith('obj')).forEach(conf => {
            const key = conf.property || conf.name;
            if (key === 'globalGradientStops') return;
            if (generalValues[key] !== undefined) {
                allKeys.push(key);
                let exportValue = generalValues[key];
                if (typeof exportValue === 'string') exportValue = exportValue.replace(/"/g, '&quot;');
                if (conf.name && !conf.property) {
                    metaTags += `<meta ${key}="${exportValue}">\n`;
                } else {
                    const attrs = [`property="${conf.property}"`, `label="${conf.label}"`, `type="${conf.type}"`];
                    if (conf.values) attrs.push(`values="${conf.values.split(',').sort().join(',')}"`);
                    if (conf.min) attrs.push(`min="${conf.min}"`);
                    if (conf.max) attrs.push(`max="${conf.max}"`);
                    metaTags += `<meta ${attrs.join(' ')} default="${exportValue}">\n`;
                }
            }
        });
        try {
            const globalStops = JSON.parse(generalValues.globalGradientStops || '[]');
            globalStops.forEach((stop, i) => {
                const index = i + 1;
                const colorKey = `globalColor_${index}`;
                const posKey = `globalPosition_${index}`;
                allKeys.push(colorKey, posKey);
                metaTags += `<meta property="${colorKey}" label="Global Color ${index}" type="color" default="${stop.color}">\n`;
                metaTags += `<meta property="${posKey}" label="Global Position ${index}" type="number" default="${Math.round(stop.position * 100)}" min="0" max="100">\n`;
            });
        } catch (e) { console.error("Could not process global gradient for export.", e); }

        objects.forEach(obj => {
            const name = obj.name || `Object ${obj.id}`;
            const objectConfigs = configStore.filter(c => c.property && c.property.startsWith(`obj${obj.id}_`));
            const validPropsForShape = shapePropertyMap[obj.shape] || [];

            if (obj.gradient && obj.gradient.stops) {
                obj.gradient.stops.forEach((stop, i) => {
                    const index = i + 1;
                    const colorKey = `obj${obj.id}_gradColor_${index}`;
                    const posKey = `obj${obj.id}_gradPosition_${index}`;
                    allKeys.push(colorKey, posKey);
                    metaTags += `<meta property="${colorKey}" label="${name}: Color ${index}" type="color" default="${stop.color}">\n`;
                    metaTags += `<meta property="${posKey}" label="${name}: Position ${index}" type="number" default="${Math.round(stop.position * 100)}" min="0" max="100">\n`;
                });
            }
            if (obj.strokeGradient && obj.strokeGradient.stops) {
                obj.strokeGradient.stops.forEach((stop, i) => {
                    const index = i + 1;
                    const colorKey = `obj${obj.id}_strokeColor_${index}`;
                    const posKey = `obj${obj.id}_strokePosition_${index}`;
                    allKeys.push(colorKey, posKey);
                    metaTags += `<meta property="${colorKey}" label="${name}: Stroke Color ${index}" type="color" default="${stop.color}">\n`;
                    metaTags += `<meta property="${posKey}" label="${name}: Stroke Position ${index}" type="number" default="${Math.round(stop.position * 100)}" min="0" max="100">\n`;
                });
            }

            objectConfigs.forEach(conf => {
                const propName = conf.property.substring(conf.property.indexOf('_') + 1);
                if (!validPropsForShape.includes(propName) || propName === 'gradientStops' || propName === 'strokeGradientStops') {
                    return;
                }

                let liveValue = (propName === 'scrollDir') ? obj.scrollDirection : (propName === 'strokeScrollDir') ? obj.strokeScrollDir : obj[propName];
                if (liveValue === undefined) liveValue = conf.default;
                allKeys.push(conf.property);

                let valueForExport = liveValue;
                if (typeof valueForExport === 'number' && propsToScale.includes(propName)) {
                    valueForExport = Math.round(valueForExport / 4);
                } else if (typeof valueForExport === 'boolean') {
                    valueForExport = String(valueForExport);
                }

                const forceJsVarProps = ['pixelArtFrames', 'polylineNodes'];

                const createMetaTag = (config, value) => {
                    config.label = `${name}: ${config.label.split(':').slice(1).join(':').trim()}`;
                    const attrs = [`property="${config.property}"`, `label="${config.label}"`, `type="${config.type}"`];
                    if (config.values) attrs.push(`values="${config.values.split(',').sort().join(',')}"`);
                    if (config.min) attrs.push(`min="${config.min}"`);
                    if (config.max) attrs.push(`max="${config.max}"`);
                    let finalValue = value;
                    if (typeof finalValue === 'string') finalValue = finalValue.replace(/"/g, '&quot;');
                    return `<meta ${attrs.join(' ')} default="${finalValue}">\n`;
                };

                if (forceJsVarProps.includes(propName) || !exposedProperties.includes(conf.property)) {
                    let finalJsValue = liveValue;
                    if (propName === 'polylineNodes' && Array.isArray(liveValue)) {
                        const scaledNodes = liveValue.map(node => ({ x: Math.round(node.x / 4), y: Math.round(node.y / 4) }));
                        finalJsValue = JSON.stringify(scaledNodes);
                    }
                    jsVars += `window.${conf.property} = ${JSON.stringify(valueForExport)};\n`;
                    jsVarKeys.push(conf.property);
                } else {
                    metaTags += createMetaTag(conf, valueForExport);
                }
            });
        });

        return { metaTags: metaTags.trim(), jsVars: jsVars.trim(), allKeys, jsVarKeys };
    }

    function createObjectPanel(obj, objectConfigs, activeCollapseStates, activeTabStates) {
        const id = obj.id;
        const objectName = obj.name || `Object ${id}`;
        const fieldset = document.createElement('fieldset');
        fieldset.className = 'border p-2 mb-3 rounded bg-body-tertiary';
        fieldset.dataset.objectId = id;
        const headerBar = document.createElement('div');
        headerBar.className = 'd-flex justify-content-between align-items-center w-100 px-2 py-1';
        const collapseId = `collapse-obj-${id}`;
        const showObject = activeCollapseStates[id] === true || selectedObjectIds.includes(id);
        headerBar.style.cursor = 'pointer';
        headerBar.dataset.bsToggle = 'collapse';
        headerBar.dataset.bsTarget = `#${collapseId}`;
        headerBar.setAttribute('aria-expanded', showObject);
        headerBar.setAttribute('aria-controls', collapseId);
        const stopPropagation = (e) => e.stopPropagation();
        const leftGroup = document.createElement('div');
        leftGroup.className = 'd-flex align-items-center';
        leftGroup.addEventListener('click', stopPropagation);
        const dragHandle = document.createElement('div');
        dragHandle.className = 'drag-handle me-2 text-body-secondary';
        dragHandle.style.cursor = 'grab';
        dragHandle.innerHTML = '<i class="bi bi-grip-vertical"></i>';
        leftGroup.appendChild(dragHandle);
        const editableArea = document.createElement('div');
        editableArea.className = 'editable-name-area d-flex align-items-center';
        const nameSpan = document.createElement('span');
        nameSpan.className = 'object-name fs-5 fw-semibold';
        nameSpan.style.minWidth = '0';
        nameSpan.contentEditable = true;
        nameSpan.dataset.id = id;
        nameSpan.textContent = objectName;
        editableArea.appendChild(nameSpan);
        const pencilIcon = document.createElement('i');
        pencilIcon.className = 'bi bi-pencil-fill ms-2';
        pencilIcon.addEventListener('click', (e) => {
            nameSpan.focus();
            const range = document.createRange();
            const selection = window.getSelection();
            range.selectNodeContents(nameSpan);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
        });
        editableArea.appendChild(pencilIcon);
        leftGroup.appendChild(editableArea);
        headerBar.appendChild(leftGroup);
        const controlsGroup = document.createElement('div');
        controlsGroup.className = 'd-flex align-items-center flex-shrink-0';
        controlsGroup.addEventListener('click', (e) => {
            e.stopPropagation();
            const lockBtn = e.target.closest('.btn-lock');
            const deleteBtn = e.target.closest('.btn-delete');
            const duplicateBtn = e.target.closest('.btn-duplicate');
            if (lockBtn) {
                const id = parseInt(lockBtn.dataset.id, 10);
                const obj = objects.find(o => o.id === id);
                if (obj) {
                    obj.locked = !obj.locked;
                    const icon = lockBtn.querySelector('i');
                    lockBtn.classList.toggle('btn-warning', obj.locked);
                    lockBtn.classList.toggle('btn-outline-secondary', !obj.locked);
                    icon.className = `bi ${obj.locked ? 'bi-lock-fill' : 'bi-unlock-fill'}`;
                    const tooltip = bootstrap.Tooltip.getInstance(lockBtn);
                    if (tooltip) {
                        tooltip.setContent({ '.tooltip-inner': obj.locked ? 'Unlock Object' : 'Lock Object' });
                    }
                    drawFrame();
                }
            }
            if (deleteBtn) {
                e.preventDefault();
                const idToDelete = parseInt(deleteBtn.dataset.id, 10);
                deleteObjects([idToDelete]);
            }
            if (duplicateBtn) {
                e.preventDefault();
                const idToCopy = parseInt(duplicateBtn.dataset.id, 10);
                const objectToCopy = objects.find(o => o.id === idToCopy);
                if (!objectToCopy) return;
                const newState = JSON.parse(JSON.stringify(objectToCopy, (key, value) => {
                    if (key === 'ctx') return undefined;
                    return value;
                }));
                const newId = (objects.reduce((maxId, o) => Math.max(maxId, o.id), 0)) + 1;
                newState.id = newId;
                newState.name = `${objectToCopy.name} Copy`;
                newState.x += 20;
                newState.y += 20;
                const newShape = new Shape({ ...newState, ctx, canvasWidth: canvas.width });
                objects.push(newShape);
                const oldConfigs = configStore.filter(c => c.property && c.property.startsWith(`obj${idToCopy}_`));
                const newConfigs = oldConfigs.map(oldConf => {
                    const newConf = { ...oldConf };
                    const propName = oldConf.property.substring(oldConf.property.indexOf('_') + 1);
                    newConf.property = `obj${newId}_${propName}`;
                    newConf.label = `${newState.name}:${oldConf.label.split(':')[1]}`;
                    let liveValue = newShape[propName];
                    if (propName.startsWith('gradColor')) {
                        liveValue = newShape.gradient[propName.replace('gradColor', 'color')];
                    } else if (propName === 'scrollDir') {
                        liveValue = newShape.scrollDirection;
                    }
                    const propsToScale = ['x', 'y', 'width', 'height', 'innerDiameter', 'fontSize'];
                    if (propsToScale.includes(propName)) {
                        liveValue /= 4;
                    } else if (propName === 'animationSpeed') {
                        liveValue *= 10;
                    } else if (propName === 'cycleSpeed') {
                        liveValue *= 50;
                    }
                    newConf.default = liveValue;
                    return newConf;
                });
                configStore.push(...newConfigs);
                selectedObjectIds = [newId];
                renderForm();
                syncPanelsWithSelection();
                drawFrame();
                recordHistory();
            }
        });
        const lockButton = document.createElement('button');
        const isLocked = obj.locked || false;
        lockButton.className = `btn btn-sm btn-lock ${isLocked ? 'btn-warning' : 'btn-outline-secondary'} d-flex align-items-center justify-content-center px-2 ms-2`;
        lockButton.style.height = '28px';
        lockButton.style.width = '28px';
        lockButton.type = 'button';
        lockButton.dataset.id = id;
        lockButton.dataset.bsToggle = 'tooltip';
        lockButton.title = isLocked ? 'Unlock Object' : 'Lock Object';
        lockButton.innerHTML = `<i class="bi ${isLocked ? 'bi-lock-fill' : 'bi-unlock-fill'}"></i>`;
        controlsGroup.appendChild(lockButton);
        const dropdown = document.createElement('div');
        dropdown.className = 'dropdown';
        dropdown.innerHTML = `<button class="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center px-2 ms-2" style="height: 28px;" type="button" data-bs-toggle="dropdown" aria-expanded="false"><i class="bi bi-list fs-5"></i></button><ul class="dropdown-menu dropdown-menu-dark"><li><a class="dropdown-item btn-duplicate" href="#" data-id="${id}"><i class="bi bi-copy me-2"></i>Duplicate</a></li><li><a class="dropdown-item btn-delete text-danger" href="#" data-id="${id}"><i class="bi bi-trash me-2"></i>Delete</a></li></ul>`;
        controlsGroup.appendChild(dropdown);
        const collapseIcon = document.createElement('span');
        collapseIcon.className = `legend-button ${showObject ? '' : 'collapsed'} ms-2`;
        collapseIcon.innerHTML = `<i class="bi bi-chevron-up"></i>`;
        controlsGroup.appendChild(collapseIcon);
        headerBar.appendChild(controlsGroup);
        const collapseWrapper = document.createElement('div');
        collapseWrapper.id = collapseId;
        collapseWrapper.className = `collapse p-3 ${showObject ? 'show' : ''}`;
        collapseWrapper.appendChild(document.createElement('hr'));

        // --- 4. TABBED INTERFACE CREATION ---
        const tabNav = document.createElement('ul');
        tabNav.className = 'nav nav-tabs';
        tabNav.id = `object-tabs-${id}`;
        tabNav.setAttribute('role', 'tablist');
        const tabContent = document.createElement('div');
        tabContent.className = 'tab-content';
        tabContent.id = `object-tab-content-${id}`;

        const validPropsForShape = shapePropertyMap[obj.shape] || shapePropertyMap['rectangle'];
        let isFirstTab = true;
        let firstTabId = null;
        for (const groupName in controlGroupMap) {
            const groupProps = controlGroupMap[groupName].props;
            const relevantProps = objectConfigs.filter(conf => {
                const propName = conf.property.substring(conf.property.indexOf('_') + 1);
                if (propName === 'shape' && groupName === 'Geometry') {
                    return true;
                }
                return groupProps.includes(propName) && validPropsForShape.includes(propName);
            });
            if (relevantProps.length > 0) {
                const safeGroupName = groupName.replace(/[\s&]/g, '-');
                const tabId = `tab-${id}-${safeGroupName}`;
                if (isFirstTab) {
                    firstTabId = tabId;
                }
                const paneId = `pane-${id}-${safeGroupName}`;
                const tabItem = document.createElement('li');
                tabItem.className = 'nav-item';
                tabItem.setAttribute('role', 'presentation');
                const tabButton = document.createElement('button');
                tabButton.className = `nav-link`;
                tabButton.id = tabId;
                tabButton.dataset.bsToggle = 'tab';
                tabButton.dataset.bsTarget = `#${paneId}`;
                tabButton.type = 'button';
                tabButton.setAttribute('role', 'tab');
                tabButton.setAttribute('aria-controls', paneId);
                const icon = document.createElement('i');
                icon.className = `bi ${controlGroupMap[groupName].icon} me-2`;
                tabButton.appendChild(icon);
                tabButton.appendChild(document.createTextNode(groupName.replace(/-/g, ' & ')));
                tabItem.appendChild(tabButton);
                tabNav.appendChild(tabItem);
                const pane = document.createElement('div');
                pane.className = `tab-pane fade`;
                pane.id = paneId;
                pane.setAttribute('role', 'tabpanel');
                pane.setAttribute('aria-labelledby', tabId);
                const groupCard = document.createElement('div');
                groupCard.className = 'card card-body bg-body mb-3';
                const groupHeader = document.createElement('h6');
                groupHeader.className = 'text-body-secondary border-bottom pb-1 mb-3';
                groupHeader.textContent = groupName.replace(/-/g, ' & ');
                groupCard.appendChild(groupHeader);
                relevantProps.forEach(conf => {
                    groupCard.appendChild(createFormControl(conf));
                });
                pane.appendChild(groupCard);
                tabContent.appendChild(pane);
                isFirstTab = false;
            }
        }
        collapseWrapper.appendChild(tabNav);
        collapseWrapper.appendChild(tabContent);
        fieldset.appendChild(headerBar);
        fieldset.appendChild(collapseWrapper);
        form.appendChild(fieldset);

        const savedTabId = activeTabStates[id] || firstTabId;
        if (savedTabId) {
            const tabToActivate = document.getElementById(savedTabId);
            if (tabToActivate) {
                const paneId = tabToActivate.dataset.bsTarget;
                const paneToActivate = document.querySelector(paneId);
                tabToActivate.classList.add('active');
                tabToActivate.setAttribute('aria-selected', 'true');
                if (paneToActivate) {
                    paneToActivate.classList.add('show', 'active');
                }
            } else {
                const firstTabButton = fieldset.querySelector('.nav-tabs .nav-link');
                if (firstTabButton) {
                    const paneId = firstTabButton.dataset.bsTarget;
                    const paneToActivate = document.querySelector(paneId);

                    if (paneToActivate) {
                        firstTabButton.classList.add('active');
                        firstTabButton.setAttribute('aria-selected', 'true');
                        paneToActivate.classList.add('show', 'active');
                    }
                }
            }
        }

        return fieldset;
    }

    /**
     * Renders the entire controls form based on the current `configStore` and `objects` state.
     * This function is responsible for dynamically building all the UI in the left panel.
     */
    function renderForm() {
        // --- 1. PREPARATION & STATE PRESERVATION ---
        const existingTooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
        existingTooltips.forEach(el => {
            const tooltip = bootstrap.Tooltip.getInstance(el);
            if (tooltip) tooltip.dispose();
        });

        const generalSettingsValues = {};
        const generalConfigs = configStore.filter(c => !(c.property || c.name).startsWith('obj'));
        generalConfigs.forEach(conf => {
            const key = conf.property || conf.name;
            const el = form.elements[key];
            if (el) {
                generalSettingsValues[key] = (el.type === 'checkbox') ? el.checked : el.value;
            }
        });

        const generalCollapseEl = form.querySelector('#collapse-general');
        const generalCollapseState = generalCollapseEl ? generalCollapseEl.classList.contains('show') : true;

        const activeCollapseStates = {};
        const activeTabStates = {};
        const allObjectFieldsets = form.querySelectorAll('fieldset[data-object-id]');

        allObjectFieldsets.forEach(fieldset => {
            const id = parseInt(fieldset.dataset.objectId, 10);
            const nameSpan = fieldset.querySelector('.object-name');
            const obj = objects.find(o => o.id === id);
            if (obj && nameSpan) {
                obj.name = nameSpan.textContent;
            }

            const collapseEl = fieldset.querySelector('.collapse');
            if (collapseEl) {
                activeCollapseStates[id] = collapseEl.classList.contains('show');
            }
            const activeTabButton = fieldset.querySelector('.nav-tabs .nav-link.active');
            if (activeTabButton) {
                activeTabStates[id] = activeTabButton.id;
            }
        });

        form.innerHTML = '';
        const grouped = groupConfigs(configStore);

        // --- 2. GENERAL SETTINGS PANEL CREATION ---
        const generalFieldset = document.createElement('fieldset');
        generalFieldset.className = 'border p-2 mb-3 rounded bg-body-tertiary';
        const generalHeaderBar = document.createElement('div');
        generalHeaderBar.className = 'd-flex justify-content-between align-items-center w-100 px-2 py-1';
        const generalCollapseId = 'collapse-general';
        const showGeneral = generalCollapseState;
        generalHeaderBar.style.cursor = 'pointer';
        generalHeaderBar.dataset.bsToggle = 'collapse';
        generalHeaderBar.dataset.bsTarget = `#${generalCollapseId}`;
        generalHeaderBar.setAttribute('aria-expanded', showGeneral);
        generalHeaderBar.setAttribute('aria-controls', generalCollapseId);
        const generalLeftGroup = document.createElement('div');
        generalLeftGroup.className = 'd-flex align-items-center';
        const generalHeaderText = document.createElement('span');
        generalHeaderText.className = 'fs-5 fw-semibold';
        generalHeaderText.textContent = 'General Settings';
        generalLeftGroup.appendChild(generalHeaderText);
        generalHeaderBar.appendChild(generalLeftGroup);
        const generalRightGroup = document.createElement('div');
        generalRightGroup.className = 'd-flex align-items-center';
        const generalCollapseIcon = document.createElement('span');
        generalCollapseIcon.className = `legend-button ${showGeneral ? '' : 'collapsed'}`;
        generalCollapseIcon.innerHTML = `<i class="bi bi-chevron-up"></i>`;
        generalRightGroup.appendChild(generalCollapseIcon);
        generalHeaderBar.appendChild(generalRightGroup);
        const generalCollapseWrapper = document.createElement('div');
        generalCollapseWrapper.id = generalCollapseId;
        generalCollapseWrapper.className = `collapse p-3 ${showGeneral ? 'show' : ''}`;
        generalCollapseWrapper.innerHTML = '<hr class="mt-2 mb-3">';

        // --- NEW LOGIC: Separate standard controls from override controls ---
        const overrideControlKeys = ['enablePalette', 'globalGradientStops', 'enableGlobalCycle', 'globalCycleSpeed'];
        const standardGeneralConfigs = grouped.general.filter(conf => !overrideControlKeys.includes(conf.property || conf.name));
        const overrideGeneralConfigs = grouped.general.filter(conf => overrideControlKeys.includes(conf.property || conf.name));

        // 1. Add standard controls (Title, Description, etc.)
        standardGeneralConfigs.forEach(conf => generalCollapseWrapper.appendChild(createFormControl(conf)));

        // 2. Build and add the collapsible "Overrides" section
        if (overrideGeneralConfigs.length > 0) {
            generalCollapseWrapper.appendChild(document.createElement('hr'));

            const overridesHeader = document.createElement('div');
            overridesHeader.className = 'd-flex justify-content-between align-items-center w-100 py-1';
            overridesHeader.style.cursor = 'pointer';
            overridesHeader.dataset.bsToggle = 'collapse';
            overridesHeader.dataset.bsTarget = '#collapse-overrides';
            overridesHeader.setAttribute('aria-expanded', 'false'); // Start collapsed
            overridesHeader.innerHTML = `
            <span class="fs-6 fw-semibold">Global Overrides</span>
            <span class="legend-button collapsed"><i class="bi bi-chevron-up"></i></span>
        `;
            generalCollapseWrapper.appendChild(overridesHeader);

            const overridesCollapseWrapper = document.createElement('div');
            overridesCollapseWrapper.id = 'collapse-overrides';
            overridesCollapseWrapper.className = 'collapse p-3 border-start border-end border-bottom rounded-bottom';

            overrideGeneralConfigs.forEach(conf => overridesCollapseWrapper.appendChild(createFormControl(conf)));
            generalCollapseWrapper.appendChild(overridesCollapseWrapper);
        }
        // --- END NEW LOGIC ---

        generalFieldset.appendChild(generalHeaderBar);
        generalFieldset.appendChild(generalCollapseWrapper);
        form.appendChild(generalFieldset);

        // --- 3. OBJECT PANELS CREATION (Main Loop) ---
        objects.forEach(obj => {
            const fieldset = createObjectPanel(obj, grouped.objects[obj.id] || [], activeCollapseStates, activeTabStates);
            if (fieldset) {
                form.appendChild(fieldset);
            }
        });

        // --- 5. FINALIZATION ---
        if (!isRestoring) {
            for (const key in generalSettingsValues) {
                const el = form.elements[key];
                if (el) {
                    if (el.type === 'checkbox') {
                        el.checked = generalSettingsValues[key];
                    } else {
                        el.value = generalSettingsValues[key];
                    }
                }
            }
        }

        updateFormValuesFromObjects();

        form.querySelectorAll('fieldset[data-object-id]').forEach(updateDependentControls);
        form.querySelectorAll('fieldset[data-object-id]').forEach(updateStrokeDependentControls);
        form.querySelectorAll('fieldset[data-object-id]').forEach(updateSensorControlVisibility);

        initializeFrameSorters();
    }

    function updateSensorControlVisibility(fieldset) {
        const id = fieldset.dataset.objectId;
        const colorModeControl = fieldset.querySelector(`[name="obj${id}_sensorColorMode"]`);
        if (!colorModeControl) return;

        const isThresholds = colorModeControl.value === 'Thresholds';
        const midControl = fieldset.querySelector(`[name="obj${id}_sensorMidThreshold"]`);
        const maxControl = fieldset.querySelector(`[name="obj${id}_sensorMaxThreshold"]`);

        if (midControl) midControl.closest('.mb-3').style.display = isThresholds ? '' : 'none';
        if (maxControl) maxControl.closest('.mb-3').style.display = isThresholds ? '' : 'none';
    }

    /**
    * Initializes the Sortable.js library for all pixel art frame containers
    * to allow drag-and-drop reordering of frames within an object.
    */
    function initializeFrameSorters() {
        const frameContainers = document.querySelectorAll('.pixel-art-frames-container');
        frameContainers.forEach(container => {
            // Prevent re-initialization by destroying the old instance if it exists
            if (container.sortableInstance) {
                container.sortableInstance.destroy();
            }

            container.sortableInstance = new Sortable(container, {
                animation: 150,
                handle: '.frame-drag-handle', // Use the new drag handle class
                onEnd: function (evt) {
                    if (evt.oldIndex === evt.newIndex) return;

                    const container = evt.from;
                    const fieldset = container.closest('fieldset[data-object-id]');
                    if (!fieldset) return;

                    const hiddenTextarea = fieldset.querySelector('textarea[name$="_pixelArtFrames"]');
                    const frameItems = Array.from(container.children);
                    const newFramesArray = [];

                    frameItems.forEach((item, index) => {
                        // Update the frame number text in the UI
                        const header = item.querySelector('.frame-item-header');
                        if (header) {
                            header.textContent = `Frame #${index + 1}`;
                        }
                        item.dataset.index = index; // Update the data-index attribute

                        // Read the data from the DOM elements in their new order
                        const dataTextarea = item.querySelector('.frame-data-input');
                        const durationInput = item.querySelector('.frame-duration-input');
                        if (dataTextarea && durationInput) {
                            newFramesArray.push({
                                data: dataTextarea.value,
                                duration: parseFloat(durationInput.value) || 1
                            });
                        }
                    });

                    // Update the hidden textarea, which is the ultimate source of truth
                    hiddenTextarea.value = JSON.stringify(newFramesArray);
                    // Trigger an input event to notify the rest of the application about the change
                    hiddenTextarea.dispatchEvent(new Event('input', { bubbles: true }));

                    recordHistory();
                }
            });
        });
    }

    /**
     * Initializes the Sortable.js library on the controls form to allow
     * drag-and-drop reordering of object panels.
     */
    function initializeSortable() {
        const formEl = document.getElementById('controls-form');
        new Sortable(formEl, {
            animation: 150,
            handle: '.drag-handle',
            draggable: 'fieldset[data-object-id]',
            onEnd: function (evt) {
                if (evt.oldIndex === evt.newIndex) return;

                // --- 1. Get the new visual order from the UI ---
                const fieldsets = Array.from(form.querySelectorAll('fieldset[data-object-id]'));
                const newOrderedIds = fieldsets.map(fieldset => parseInt(fieldset.dataset.objectId, 10));

                // --- 2. Reorder the live `objects` array ---
                objects.sort((a, b) => newOrderedIds.indexOf(a.id) - newOrderedIds.indexOf(b.id));

                // --- 3. Reorder the `configStore` to match the new object order (THE FIX) ---
                const generalConfigs = configStore.filter(c => !(c.property || '').startsWith('obj'));
                const objectConfigs = configStore.filter(c => (c.property || '').startsWith('obj'));

                const configsById = {};
                objectConfigs.forEach(conf => {
                    const match = conf.property.match(/^obj(\d+)_/);
                    if (match) {
                        const id = parseInt(match[1], 10);
                        if (!configsById[id]) {
                            configsById[id] = [];
                        }
                        configsById[id].push(conf);
                    }
                });

                const reorderedObjectConfigs = [];
                newOrderedIds.forEach(id => {
                    if (configsById[id]) {
                        reorderedObjectConfigs.push(...configsById[id]);
                    }
                });

                configStore = [...generalConfigs, ...reorderedObjectConfigs];

                // --- 4. Update the application state ---
                updateObjectsFromForm();
                drawFrame();
                recordHistory();
            }
        });
    }

    /**
      * Retrieves all current values from the form controls.
      * @returns {object} An object mapping control IDs to their current values.
      */
    function getControlValues() {
        const data = {};
        configStore.forEach(conf => {
            const key = conf.property || conf.name;
            const el = form.elements[key];
            if (el) {
                if (el.type === 'checkbox') {
                    data[key] = el.checked;
                } else if (el.type === 'number') {
                    const value = el.value;
                    data[key] = value === '' ? 0 : parseFloat(value);
                } else {
                    data[key] = el.value;
                }
            }
        });
        return data;
    }


    /**
     * Sets the values of form controls based on a data object.
     * @param {object} data - An object mapping control IDs to values.
     */
    function setFormValues(data) {
        for (const key in data) {
            const el = form.elements[key];
            if (el) {
                if (el.type === 'checkbox') {
                    el.checked = data[key];
                } else {
                    el.value = data[key];
                }
            }
        }
    }

    /**
     * Builds an array of shape state objects from the current form values.
     * @returns {object[]} An array of state objects for all shapes.
     */
    function buildStatesFromConfig() {
        const values = getControlValues();
        const grouped = groupConfigs(configStore);
        const finalStates = [];

        objects.forEach(obj => {
            const id = obj.id;
            if (!grouped.objects[id]) return;

            const existingObject = obj;
            const config = {
                id: parseInt(id),
                gradient: {},
                name: existingObject.name,
                locked: existingObject.locked
            };

            grouped.objects[id].forEach(conf => {
                let key = conf.property.replace(`obj${id}_`, '');
                let value = values[conf.property];
                const type = conf.type;
                if (type === 'number') value = parseFloat(value);
                else if (type === 'boolean') value = (value === true || value === 'true');

                if (key.startsWith('gradColor')) {
                    config.gradient[key.replace('grad', '').toLowerCase()] = value;
                } else if (key === 'scrollDir') {
                    config.scrollDirection = value;
                } else {
                    config[key] = value;
                }
            });

            config.gradientDirection = (config.scrollDirection === 'up' || config.scrollDirection === 'down') ? 'vertical' : 'horizontal';
            config.cycleSpeed = (config.cycleSpeed || 0) / 50.0;
            const speed = config.animationSpeed || 0;
            config.animationSpeed = speed / 10.0;
            if (config.shape === 'ring') {
                config.height = config.width;
            }
            finalStates.push(config);
        });

        return finalStates;
    }

    form.addEventListener('blur', (e) => {
        if (e.target.classList.contains('object-name')) {
            const id = parseInt(e.target.dataset.id, 10);
            const newName = e.target.textContent || 'Unnamed';
            const obj = objects.find(o => o.id === id);
            if (obj) {
                obj.name = newName;
                configStore.forEach(conf => {
                    if (conf.property && conf.property.startsWith(`obj${id}_`)) {
                        const labelParts = conf.label.split(':');
                        conf.label = `${newName}:${labelParts[1]}`;
                    }
                });
                generateOutputScript();
            }
        }
    }, true);

    /**
     * Converts mouse event coordinates to canvas-local coordinates.
     * @param {MouseEvent} event - The mouse event.
     * @returns {{x: number, y: number}} The coordinates relative to the canvas.
     */
    function getCanvasCoordinates(e) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    /**
     * Enables or disables dependent fill controls based on the 'fillShape' checkbox state.
     * @param {HTMLElement} fieldset - The fieldset element for a specific object.
     */
    function updateDependentControls(fieldset) {
        const id = fieldset.dataset.objectId;
        const fillShapeToggle = fieldset.querySelector(`[name="obj${id}_fillShape"]`);
        if (!fillShapeToggle) return;

        const isFillEnabled = fillShapeToggle.checked;

        // List all controls that depend on the fill being enabled
        const dependentControls = [
            'gradType', 'useSharpGradient', 'gradColor1', 'gradColor2',
            'cycleColors', 'animationMode', 'animationSpeed', 'cycleSpeed', 'scrollDir'
        ];

        dependentControls.forEach(prop => {
            const control = fieldset.querySelector(`[name="obj${id}_${prop}"]`);
            if (control) {
                control.disabled = !isFillEnabled;
                // Also handle associated sliders and hex inputs
                const slider = fieldset.querySelector(`[name="obj${id}_${prop}_slider"]`);
                if (slider) slider.disabled = !isFillEnabled;
                const hexInput = fieldset.querySelector(`[name="obj${id}_${prop}_hex"]`);
                if (hexInput) hexInput.disabled = !isFillEnabled;
            }
        });
    }

    /**
     * Enables or disables toolbar buttons based on the current selection.
     */
    function updateToolbarState() {
        const multiSelectButtons = toolbar.querySelectorAll('[data-action^="match-"]');
        const singleSelectButtons = toolbar.querySelectorAll('[data-action^="align-screen-"], [data-action="fit-canvas"]');
        const matchTextSizeBtn = document.getElementById('match-text-size-btn');
        const copyBtn = document.getElementById('copy-props-btn');
        const pasteBtn = document.getElementById('paste-props-btn');

        singleSelectButtons.forEach(btn => btn.disabled = selectedObjectIds.length === 0);
        multiSelectButtons.forEach(btn => {
            if (btn.id !== 'match-text-size-btn') {
                btn.disabled = selectedObjectIds.length < 2;
            }
        });

        if (copyBtn) {
            copyBtn.disabled = selectedObjectIds.length === 0;
        }
        if (pasteBtn) {
            pasteBtn.disabled = !propertyClipboard || selectedObjectIds.length === 0;
        }

        if (matchTextSizeBtn) {
            const selected = selectedObjectIds.map(id => objects.find(o => o.id === id)).filter(o => o);
            const textObjects = selected.filter(obj => obj.shape === 'text');
            const gridObjects = selected.filter(obj => obj.shape === 'rectangle' && (obj.numberOfRows > 1 || obj.numberOfColumns > 1));

            const canMatchTextToGrid = textObjects.length >= 1 && gridObjects.length >= 1;
            const canMatchTextToText = textObjects.length >= 2 && gridObjects.length === 0;

            matchTextSizeBtn.disabled = !(canMatchTextToGrid || canMatchTextToText);
        }
    }

    /**
     * Updates the form control values to match the state of the shape objects on the canvas.
     * This function is called after any direct manipulation on the canvas (drag, resize).
     */
    function updateFormFromShapes() {
        objects.forEach(obj => {
            const fieldset = form.querySelector(`fieldset[data-object-id="${obj.id}"]`);
            if (!fieldset) return;

            const updateField = (prop, value) => {
                const input = fieldset.querySelector(`[name="obj${obj.id}_${prop}"]`);
                if (input) {
                    if (input.type === 'checkbox') {
                        input.checked = value;
                    } else {
                        input.value = value;
                    }
                    const slider = fieldset.querySelector(`[name="obj${obj.id}_${prop}_slider"]`);
                    if (slider) slider.value = value;

                    // This line was added
                    const hexInput = fieldset.querySelector(`[name="obj${obj.id}_${prop}_hex"]`);
                    if (hexInput) hexInput.value = value;
                }
            };

            updateField('x', Math.round(obj.x));
            updateField('y', Math.round(obj.y));
            updateField('width', Math.round(obj.width));
            updateField('height', Math.round(obj.height));
            updateField('fontSize', Math.round(obj.fontSize));
            updateField('shape', obj.shape);
            updateField('gradType', obj.gradType);

            // Correct the scaling for animation and cycle speeds
            updateField('animationSpeed', obj.animationSpeed * 10);
            updateField('cycleSpeed', obj.cycleSpeed * 50);

            updateField('animationMode', obj.animationMode);
            updateField('scrollDirection', obj.scrollDirection);
            updateField('innerDiameter', Math.round(obj.innerDiameter));
            updateField('angularWidth', obj.angularWidth);
            updateField('numberOfSegments', obj.numberOfSegments);
            updateField('rotationSpeed', obj.rotationSpeed);
            updateField('useSharpGradient', obj.useSharpGradient);
            updateField('numberOfRows', obj.numberOfRows);
            updateField('numberOfColumns', obj.numberOfColumns);
            updateField('phaseOffset', obj.phaseOffset);
            updateField('text', obj.text);
            updateField('fontFamily', obj.fontFamily);
            updateField('fontWeight', obj.fontWeight);
            updateField('gradColor1', obj.gradient.color1);
            updateField('gradColor2', obj.gradient.color2);
        });
        generateOutputScript();
    }

    function drawObject(obj) {
        ctx.save();
        ctx.translate(obj.x + obj.width / 2, obj.y + obj.height / 2);
        if (obj.rotation) {
            ctx.rotate(obj.rotation * Math.PI / 180);
        }
        ctx.translate(-(obj.x + obj.width / 2), -(obj.y + obj.height / 2));

        if (obj.shape === 'rectangle') {
            ctx.fillStyle = obj.fillColor || 'rgba(0, 0, 255, 0.5)';
            ctx.fillRect(obj.x, obj.y, obj.width, obj.height);
        } else if (obj.shape === 'circle') {
            ctx.fillStyle = obj.fillColor || 'rgba(0, 0, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(obj.x + obj.width / 2, obj.y + obj.height / 2, obj.width / 2, 0, 2 * Math.PI);
            ctx.fill();
        } else if (obj.shape === 'ring') {
            ctx.fillStyle = obj.fillColor || 'rgba(0, 0, 255, 0.5)';
            ctx.beginPath();
            ctx.arc(obj.x + obj.width / 2, obj.y + obj.height / 2, obj.width / 2, 0, 2 * Math.PI);
            ctx.arc(obj.x + obj.width / 2, obj.y + obj.height / 2, obj.innerDiameter / 2, 0, 2 * Math.PI, true);
            ctx.fill();
        } else if (obj.shape === 'text') {
            ctx.font = `${obj.fontSize}px ${obj.fontFamily || 'Arial'}`;
            ctx.fillStyle = obj.fillColor || 'black';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            ctx.fillText(obj.text || '', obj.x, obj.y);
        }

        ctx.restore();
    }

    // In main.js, find the drawFrame function and replace it

    function drawFrame(audioData = {}, sensorData = {}, deltaTime = 0, palette = {}, globalCycle = {}) {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = objects.length - 1; i >= 0; i--) {
            const obj = objects[i];

            // 1. Save the object's original state before applying any overrides
            const originalGradient = JSON.parse(JSON.stringify(obj.gradient));
            const originalStrokeGradient = JSON.parse(JSON.stringify(obj.strokeGradient));
            const originalGradType = obj.gradType;
            const originalStrokeGradType = obj.strokeGradType;
            const originalCycleColors = obj.cycleColors;
            const originalCycleSpeed = obj.cycleSpeed;
            const originalStrokeCycleColors = obj.strokeCycleColors;
            const originalStrokeCycleSpeed = obj.strokeCycleSpeed;

            // 2. Apply global overrides by temporarily changing the object's properties
            if (globalCycle.enable) {
                const speed = (globalCycle.speed || 0) / 50.0;
                obj.cycleColors = true;
                obj.cycleSpeed = speed;
                obj.strokeCycleColors = true;
                obj.strokeCycleSpeed = speed;
            }

            if (palette.enablePalette && palette.stops) {
                // Only apply global palette if the object is NOT pixel art
                if (obj.shape !== 'pixel-art') {
                    try {
                        const globalGradientStops = (typeof palette.stops === 'string')
                            ? JSON.parse(palette.stops)
                            : palette.stops;

                        if (Array.isArray(globalGradientStops) && globalGradientStops.length > 0) {
                            obj.gradient.stops = globalGradientStops;
                            obj.strokeGradient.stops = globalGradientStops;
                        }
                    } catch (e) {
                        console.error("Could not parse globalGradientStops:", e);
                    }
                }
            }

            // 3. Animate and Draw the object using the (potentially overridden) state
            obj.updateAnimationState(audioData, sensorData, deltaTime);
            obj.draw(selectedObjectIds.includes(obj.id), audioData, {});

            // 4. Restore the object's original state so the UI controls remain correct
            obj.gradient = originalGradient;
            obj.strokeGradient = originalStrokeGradient;
            obj.gradType = originalGradType;
            obj.strokeGradType = originalStrokeGradType;
            obj.cycleColors = originalCycleColors;
            obj.cycleSpeed = originalCycleSpeed;
            obj.strokeCycleColors = originalStrokeCycleColors;
            obj.strokeCycleSpeed = originalStrokeCycleSpeed;

            obj.dirty = false;
        }

        if (selectedObjectIds.length > 0) {
            selectedObjectIds.forEach(id => {
                const obj = objects.find(o => o.id === id);
                if (obj && obj instanceof Shape) {
                    obj.drawSelectionUI();
                }
            });
        }
        drawSnapLines(snapLines);

        if (previewLine.active) {
            ctx.save();
            ctx.resetTransform();
            ctx.beginPath();
            ctx.moveTo(previewLine.startX, previewLine.startY);
            ctx.lineTo(previewLine.endX, previewLine.endY);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.restore();
        }
    }

    function animate(timestamp) {
        requestAnimationFrame(animate);

        const now = timestamp;
        let deltaTime = (now - then) / 1000.0; // deltaTime in seconds
        then = now;

        if (deltaTime > 0.1) {
            deltaTime = 0.1;
        }

        const generalValues = getControlValues();
        const soundEnabled = generalValues.enableSound !== false;
        const isAnimating = generalValues.enableAnimation !== false;

        // Start with a default "silent" audio object
        let audioData = {
            bass: { avg: 0, peak: 0 },
            mids: { avg: 0, peak: 0 },
            highs: { avg: 0, peak: 0 },
            volume: { avg: 0, peak: 0 },
            frequencyData: new Uint8Array(128).fill(0)
        };

        // Only generate real or mock audio data if sound is globally enabled
        if (soundEnabled) {
            if (isAudioSetup) {
                // Case 1: Real audio is connected and enabled. Use it.
                audioData = getAudioMetrics();
            } else {
                // Case 2: No real audio, so generate mock preview data.
                const time = now / 1000;
                const randomRate = (Math.sin(time * 0.1) + 1.2);
                const mockVol = (Math.sin(time * 0.8 * randomRate) * 0.5 + Math.sin(time * 0.5 * randomRate) * 0.5) / 2 + 0.5;
                const mockBass = (Math.sin(time * 1.0 * randomRate) * 0.6 + Math.sin(time * 2.1 * randomRate) * 0.4) / 2 + 0.5;
                const mockMids = (Math.sin(time * 0.7 * randomRate) * 0.5 + Math.sin(time * 1.2 * randomRate) * 0.5) / 2 + 0.5;
                const mockHighs = (Math.sin(time * 1.5 * randomRate) * 0.7 + Math.sin(time * 3.0 * randomRate) * 0.3) / 2 + 0.5;

                const mockFreqData = new Uint8Array(128);
                for (let i = 0; i < mockFreqData.length; i++) {
                    const progress = i / mockFreqData.length;
                    const bassEffect = Math.pow(1 - progress, 2) * mockBass;
                    const midEffect = (1 - Math.abs(progress - 0.5) * 2) * mockMids;
                    const highEffect = Math.pow(Math.pow(progress, 2), 0.5) * mockHighs;
                    mockFreqData[i] = ((bassEffect + midEffect + highEffect) / 3) * 255 * (Math.sin(i * 0.2 + time * 2) * 0.1 + 0.9);
                }

                audioData = {
                    bass: { avg: mockBass, peak: mockBass },
                    mids: { avg: mockMids, peak: mockMids },
                    highs: { avg: mockHighs, peak: mockHighs },
                    volume: { avg: mockVol, peak: mockVol },
                    frequencyData: mockFreqData
                };
            }
        }

        const neededSensors = [...new Set(objects.map(o => o.userSensor).filter(Boolean))];
        const sensorData = {}; // Start with an empty object

        // Only generate mock sensor data if the master animation switch is on
        if (isAnimating) {
            neededSensors.forEach((sensorName, index) => {
                const mockValue = Math.sin(now / 2000 + index) * 50 + 50;
                sensorData[sensorName] = {
                    value: mockValue,
                    min: 0,
                    max: 100
                };
            });
        }

        const paletteProps = {
            enablePalette: generalValues.enablePalette,
            stops: generalValues.globalGradientStops
        };

        const globalCycleProps = {
            enable: generalValues.enableGlobalCycle,
            speed: generalValues.globalCycleSpeed
        };

        drawFrame(audioData, sensorData, isAnimating ? deltaTime : 0, paletteProps, globalCycleProps);
    }

    /**
     * Deletes one or more objects from the scene.
     * @param {number[]} idsToDelete - An array of object IDs to delete.
     */
    function deleteObjects(idsToDelete) {
        if (!Array.isArray(idsToDelete) || idsToDelete.length === 0) {
            return;
        }

        // Filter the main objects array
        objects = objects.filter(o => !idsToDelete.includes(o.id));

        // Filter the configuration store to remove definitions for the deleted objects
        configStore = configStore.filter(conf => {
            const key = conf.property || conf.name;
            if (!key.startsWith('obj')) return true; // Keep general configs
            const match = key.match(/^obj(\d+)_/);
            if (match) {
                const id = parseInt(match[1], 10);
                return !idsToDelete.includes(id);
            }
            return true;
        });

        // Clear the selection
        selectedObjectIds = [];

        // Update the UI and record the change
        renderForm();
        updateFormValuesFromObjects();
        updateToolbarState();
        drawFrame();
        recordHistory();
    }

    /**
     * Gathers all form values for a specific object ID.
     * @param {number} id - The ID of the object to get values for.
     * @returns {object} An object containing all properties for the shape.
     */
    function getFormValuesForObject(id) {
        const values = {};
        const prefix = `obj${id}_`;
        const configs = configStore.filter(c => c.property && c.property.startsWith(prefix));

        configs.forEach(conf => {
            const key = conf.property.replace(prefix, '');
            const el = form.elements[conf.property];

            if (el) {
                let value;
                if (el.type === 'checkbox') {
                    value = el.checked;
                } else if (el.type === 'number') {
                    value = el.value === '' ? 0 : parseFloat(el.value);
                } else {
                    value = el.value; // For textareas, textfields, etc.
                }

                if (propsToScale.includes(key)) {
                    value *= 4;
                }

                // --- START: CORRECTED LOGIC ---
                if (key === 'gradientStops') {
                    if (!values.gradient) values.gradient = {};
                    try {
                        values.gradient.stops = JSON.parse(value);
                    } catch (e) {
                        console.error("Could not parse gradient stops for update", e);
                    }
                } else if (key === 'strokeGradientStops') {
                    if (!values.strokeGradient) values.strokeGradient = {};
                    try {
                        values.strokeGradient.stops = JSON.parse(value);
                    } catch (e) {
                        console.error("Could not parse stroke gradient stops for update", e);
                    }
                } else if (key.startsWith('gradColor')) {
                    // This block handles legacy color properties if they exist
                    if (!values.gradient) values.gradient = {};
                    values.gradient[key.replace('grad', '').toLowerCase()] = value;
                } else if (key.startsWith('strokeGradColor')) {
                    if (!values.strokeGradient) values.strokeGradient = {};
                    values.strokeGradient[key.replace('strokeGradColor', 'color').toLowerCase()] = value;
                } else if (key === 'scrollDir') {
                    values.scrollDirection = value;
                } else if (key === 'strokeScrollDir') {
                    values.strokeScrollDir = value;
                } else {
                    values[key] = value;
                }
                // --- END: CORRECTED LOGIC ---
            }
        });

        if (values.shape === 'ring') {
            values.height = values.width;
        }

        return values;
    }

    /**
     * Reads all values from the form and updates the live 'objects' array.
     * This is now the primary way user input affects the application state.
     */
    function updateObjectsFromForm() {
        if (isRestoring) return;
        const formValues = getControlValues();

        objects.forEach(obj => {
            const newProps = getFormValuesForObject(obj.id);

            if (obj._pausedRotationSpeed !== null && newProps.rotationSpeed !== undefined) {
                obj._pausedRotationSpeed = newProps.rotationSpeed;
                delete newProps.rotationSpeed;
            }

            obj.update(newProps);

            if (obj.shape === 'polyline') {
                const fieldset = form.querySelector(`fieldset[data-object-id="${obj.id}"]`);
                if (fieldset) {
                    const hiddenTextarea = fieldset.querySelector(`[name="obj${obj.id}_polylineNodes"]`);
                    if (hiddenTextarea) {
                        hiddenTextarea.value = JSON.stringify(obj.polylineNodes);
                    }
                }
            }
        });

        generateOutputScript();
    }

    /**
     * Reads all properties from the 'objects' array and updates the form inputs to match.
     */
    function updateFormValuesFromObjects() {
        // This list now includes the missing polyline animation properties.

        objects.forEach(obj => {
            const fieldset = form.querySelector(`fieldset[data-object-id="${obj.id}"]`);
            if (!fieldset) return;

            const updateField = (prop, value) => {
                const input = fieldset.querySelector(`[name="obj${obj.id}_${prop}"]`);
                if (input) {
                    if (input.type === 'checkbox') input.checked = value;
                    else input.value = value;
                    const slider = fieldset.querySelector(`[name="obj${obj.id}_${prop}_slider"]`);
                    if (slider) slider.value = value;
                    const hexInput = fieldset.querySelector(`[name="obj${obj.id}_${prop}_hex"]`);
                    if (hexInput) hexInput.value = value;
                }
            };

            Object.keys(obj).forEach(key => {
                if (key === 'rotationSpeed' && obj._pausedRotationSpeed !== null) {
                    return;
                }
                else if (key === 'polylineNodes') {
                    const controlId = `obj${obj.id}_polylineNodes`;
                    const container = fieldset.querySelector('.node-table-container');
                    const hiddenTextarea = fieldset.querySelector(`[name="${controlId}"]`);
                    if (!container || !hiddenTextarea) return;

                    const nodes = obj.polylineNodes;
                    hiddenTextarea.value = JSON.stringify(nodes);

                    const tbody = container.querySelector('tbody');
                    tbody.innerHTML = ''; // Clear the existing table body

                    // Rebuild the table from the object's current node data
                    nodes.forEach((node, index) => {
                        const tr = document.createElement('tr');
                        tr.dataset.index = index;
                        tr.innerHTML = `
                    <td class="align-middle">${index + 1}</td>
                    <td><input type="number" class="form-control form-control-sm node-x-input" value="${Math.round(node.x)}"></td>
                    <td><input type="number" class="form-control form-control-sm node-y-input" value="${Math.round(node.y)}"></td>
                    <td class="align-middle">
                        <button type="button" class="btn btn-sm btn-outline-danger btn-delete-node" title="Delete Node"><i class="bi bi-trash"></i></button>
                    </td>`;
                        tbody.appendChild(tr);
                    });

                }
                // --- END OF MODIFIED PART ---
                else if (propsToScale.includes(key)) {
                    updateField(key, Math.round(obj[key] / 4));
                } else if (key === 'gradient' || key === 'strokeGradient') {
                    const propName = key === 'gradient' ? 'gradientStops' : 'strokeGradientStops';
                    const control = fieldset.querySelector(`[name="obj${obj.id}_${propName}"]`);
                    if (control) {
                        const newStops = key === 'gradient' ? obj.gradient.stops : obj.strokeGradient.stops;
                        control.value = JSON.stringify(newStops);
                        // Trigger a custom event to tell the control to rebuild itself
                        control.dispatchEvent(new CustomEvent('rebuild', { detail: { stops: newStops } }));
                    }
                } else if (key === 'scrollDirection') {
                    updateField('scrollDir', obj.scrollDirection);
                } else if (key === 'strokeScrollDir') {
                    updateField('strokeScrollDir', obj.strokeScrollDir);
                } else if (typeof obj[key] !== 'object' && typeof obj[key] !== 'function') {
                    updateField(key, typeof obj[key] === 'number' ? Math.round(obj[key]) : obj[key]);
                }
            });
        });
        generateOutputScript();
    }

    /**
     * A master update function that syncs the shapes from the form and regenerates the output script.
     */
    function updateAll() {
        updateObjectsFromForm();
        drawFrame();
    }

    /**
     * Expands the control panel for the currently selected object and collapses others.
     */
    function syncPanelsWithSelection() {
        const allCollapses = form.querySelectorAll('.collapse');
        allCollapses.forEach(el => {
            const instance = bootstrap.Collapse.getInstance(el) || new bootstrap.Collapse(el, { toggle: false });
            const fieldset = el.closest('fieldset');
            if (!fieldset) return;
            const id = parseInt(fieldset.dataset.objectId, 10);
            if (selectedObjectIds.length === 1 && selectedObjectIds[0] === id) {
                instance.show();
            } else {
                instance.hide();
            }
        });
    }

    /**
     * Creates the initial set of Shape objects based on the `configStore`.
     */
    function createInitialObjects(objectNames = {}) {
        const allPropKeysFromStore = configStore.map(c => c.property || c.name);
        if (allPropKeysFromStore.length === 0) return;

        const uniqueIds = [...new Set(allPropKeysFromStore.map(p => {
            if (!p || !p.startsWith('obj')) return null;
            const end = p.indexOf('_');
            if (end <= 3) return null;
            const idString = p.substring(3, end);
            const id = parseInt(idString, 10);
            return isNaN(id) ? null : String(id);
        }).filter(id => id !== null))];

        const initialStates = uniqueIds.map(id => {
            const configForThisObject = {
                id: parseInt(id),
                gradient: {},
                strokeGradient: {},
                name: objectNames[id] || `Object ${id}` // Use the provided name
            };
            const objectConfigs = groupConfigs(configStore).objects[id];

            if (!objectConfigs) return null;

            objectConfigs.forEach(conf => {
                const key = conf.property.replace(`obj${id}_`, '');
                let value = conf.default;

                if (conf.type === 'number') {
                    value = parseFloat(value);
                } else if (conf.type === 'boolean') {
                    value = (String(value).toLowerCase() === 'true' || value === 1);
                } else if (conf.type === 'textfield' || conf.type === 'textarea') {
                    value = String(value).replace(/\n/g, '\n');
                }

                if (propsToScale.includes(key) && typeof value === 'number') {
                    value *= 4;
                }

                // MODIFIED: Correctly handle new gradientStops properties
                if (key === 'gradientStops') {
                    configForThisObject.gradientStops = value;
                } else if (key === 'strokeGradientStops') {
                    configForThisObject.strokeGradientStops = value;
                } else if (key.startsWith('gradColor') || key.startsWith('strokeGradColor')) {
                    // Ignore obsolete properties
                } else if (key === 'scrollDir') {
                    configForThisObject.scrollDirection = value;
                } else if (key === 'strokeScrollDir') {
                    configForThisObject.strokeScrollDir = value;
                } else {
                    configForThisObject[key] = value;
                }
            });

            if (configForThisObject.shape === 'ring') {
                configForThisObject.height = configForThisObject.width;
            }

            return configForThisObject;
        }).filter(Boolean);

        objects = initialStates.map(state => new Shape({ ...state, ctx, canvasWidth: canvas.width }));
    }

    /**
     * The new, centralized engine for loading any set of configurations into the workspace.
     * @param {Array} loadedConfigs - The array of config objects to load.
     * @param {Array} [savedObjects=[]] - Optional array of saved object data (for names/lock state).
     */
    function _loadFromConfigArray(loadedConfigs, savedObjects = []) {
        try {
            isRestoring = true;

            const loadedConfigMap = new Map(loadedConfigs.map(c => [(c.property || c.name), c]));
            const parser = new DOMParser();
            const doc = parser.parseFromString(INITIAL_CONFIG_TEMPLATE, 'text/html');
            const masterConfigTemplates = Array.from(doc.querySelectorAll('meta')).map(parseMetaToConfig);

            const masterGeneralConfigs = masterConfigTemplates.filter(c => !(c.property || c.name).startsWith('obj'));
            const mergedGeneralConfigs = masterGeneralConfigs.map(masterConf => {
                const key = masterConf.property || masterConf.name;
                if (loadedConfigMap.has(key)) {
                    return { ...masterConf, default: loadedConfigMap.get(key).default };
                }
                return masterConf;
            });

            const orderedIds = [];
            const seenIds = new Set();
            loadedConfigs.forEach(c => {
                const match = (c.property || '').match(/^obj(\d+)_/);
                if (match) {
                    const id = parseInt(match[1], 10);
                    if (!seenIds.has(id)) {
                        seenIds.add(id);
                        orderedIds.push(id);
                    }
                }
            });
            const objectIds = orderedIds;
            const finalMergedObjectConfigs = [];
            objectIds.forEach(id => {
                const fullDefaultConfigSet = getDefaultObjectConfig(id);
                const savedObjectConfigsForId = loadedConfigs.filter(c => c.property && c.property.startsWith(`obj${id}_`));
                const savedPropsMap = new Map(savedObjectConfigsForId.map(c => [c.property, c]));
                const mergedConfigsForThisObject = fullDefaultConfigSet.map(defaultConf => {
                    if (savedPropsMap.has(defaultConf.property)) {
                        const savedConf = savedPropsMap.get(defaultConf.property);
                        return { ...defaultConf, default: savedConf.default, label: savedConf.label || defaultConf.label };
                    }
                    return defaultConf;
                });
                finalMergedObjectConfigs.push(...mergedConfigsForThisObject);
            });

            configStore = [...mergedGeneralConfigs, ...finalMergedObjectConfigs];

            createInitialObjects();

            if (savedObjects.length > 0) {
                savedObjects.forEach(savedObj => {
                    const obj = objects.find(o => o.id === savedObj.id);
                    if (obj) {
                        obj.name = savedObj.name;
                        obj.locked = savedObj.locked || false;
                    }
                });
            }

            renderForm();

            configStore.filter(c => !(c.property || c.name).startsWith('obj')).forEach(conf => {
                const key = conf.property || conf.name;
                const el = form.elements[key];
                if (el) {
                    if (el.type === 'checkbox') {
                        el.checked = (conf.default === true || conf.default === 'true');
                    } else {
                        el.value = conf.default;
                    }
                    const slider = form.querySelector(`#${el.id}_slider`);
                    if (slider) slider.value = conf.default;
                    const hexInput = form.querySelector(`#${el.id}_hex`);
                    if (hexInput) hexInput.value = conf.default;
                }
            });

            updateObjectsFromForm();
            drawFrame();
            recordHistory();
        } catch (error) {
            console.error("Error in _loadFromConfigArray:", error);
            showToast("Failed to process configuration.", 'danger');
        } finally {
            isRestoring = false;
        }
    }

    /**
     * Loads a workspace state from a provided object, ensuring all properties,
     * including complex shapes and strokes, are correctly applied.
     * @param {object} workspace - The workspace object to load.
     */

    function loadWorkspace(workspace) {
        if (!workspace || !workspace.configs) {
            showToast("Invalid workspace data provided.", 'danger');
            return;
        }

        if (workspace.docId) {
            (async () => {
                try {
                    const docRef = window.doc(window.db, "projects", workspace.docId);
                    await window.updateDoc(docRef, { viewCount: window.increment(1) });
                } catch (err) { }
            })();
        }

        try {
            isRestoring = true;
            _loadFromConfigArray(workspace.configs, workspace.objects);

            currentProjectDocId = workspace.docId || null;
            updateShareButtonState();

            if (workspace.docId) {
                const newUrl = `${window.location.pathname}?effectId=${workspace.docId}`;
                const effectTitle = getControlValues()['title'] || "SRGB Effect Builder";
                window.history.pushState({ effectId: workspace.docId }, effectTitle, newUrl);
            }
        } catch (error) {
            console.error("Error loading workspace:", error);
            showToast("Failed to load workspace.", 'danger');
        } finally {
            isRestoring = false;
        }
    }

    /**
     * Gets the name of the handle opposite to the given one.
     * @param {string} handleName - The name of the handle (e.g., 'top-left').
     * @returns {string} The name of the opposite handle (e.g., 'bottom-right').
     */
    function getOppositeHandle(handleName) {
        let opposite = handleName;
        if (handleName.includes('top')) {
            opposite = opposite.replace('top', 'bottom');
        } else if (handleName.includes('bottom')) {
            opposite = opposite.replace('bottom', 'top');
        }
        if (handleName.includes('left')) {
            opposite = opposite.replace('left', 'right');
        } else if (handleName.includes('right')) {
            opposite = opposite.replace('right', 'left');
        }
        return opposite;
    }

    /**
     * Generates a default set of configuration properties for a new object.
     * @param {number} newId - The ID for the new object.
     * @returns {object[]} An array of default configuration objects.
     */
    // Update this for a new property
    function getDefaultObjectConfig(newId) {
        return [
            // Geometry & Transform
            { property: `obj${newId}_shape`, label: `Object ${newId}: Shape`, type: 'combobox', default: 'rectangle', values: 'rectangle,circle,ring,polygon,star,text,oscilloscope,tetris,fire,fire-radial,pixel-art,audio-visualizer,spawner,strimer,polyline', description: 'The basic shape of the object.' },
            { property: `obj${newId}_x`, label: `Object ${newId}: X Position`, type: 'number', default: '10', min: '0', max: '320', description: 'The horizontal position of the object on the canvas.' },
            { property: `obj${newId}_y`, label: `Object ${newId}: Y Position`, type: 'number', default: '10', min: '0', max: '200', description: 'The vertical position of the object on the canvas.' },
            { property: `obj${newId}_width`, label: `Object ${newId}: Width`, type: 'number', default: '50', min: '2', max: '320', description: 'The width of the object.' },
            { property: `obj${newId}_height`, label: `Object ${newId}: Height`, type: 'number', default: '38', min: '2', max: '200', description: 'The height of the object.' },
            { property: `obj${newId}_rotation`, label: `Object ${newId}: Rotation`, type: 'number', default: '0', min: '-360', max: '360', description: 'The static rotation of the object in degrees.' },

            // Fill Style & Animation
            { property: `obj${newId}_fillShape`, label: `Object ${newId}: Fill Shape`, type: 'boolean', default: 'false', description: 'Fills the interior of the shape with the selected fill style. For polylines, this will close the path.' },
            { property: `obj${newId}_gradType`, label: `Object ${newId}: Fill Type`, type: 'combobox', default: 'linear', values: 'none,solid,linear,radial,conic,alternating,random,rainbow,rainbow-radial,rainbow-conic', description: 'The type of color fill or gradient to use.' },
            { property: `obj${newId}_gradientStops`, label: `Object ${newId}: Gradient Colors`, type: 'gradientpicker', default: '[{"color":"#FFA500","position":0},{"color":"#FF4500","position":0.5},{"color":"#8B0000","position":1}]', description: 'The colors and positions of the gradient. The default is a fiery gradient.' },
            { property: `obj${newId}_useSharpGradient`, label: `Object ${newId}: Use Sharp Gradient`, type: 'boolean', default: 'false', description: 'If checked, creates a hard line between colors in Linear/Radial gradients instead of a smooth blend.' },
            { property: `obj${newId}_animationMode`, label: `Object ${newId}: Animation Mode`, type: 'combobox', values: 'loop,bounce,bounce-reversed,bounce-random', default: 'loop', description: 'Determines how the gradient animation behaves.' },
            { property: `obj${newId}_animationSpeed`, label: `Object ${newId}: Animation Speed`, type: 'number', default: '50', min: '0', max: '100', description: 'Master speed for particle systems, gradient scroll, and other animations.' },
            { property: `obj${newId}_cycleColors`, label: `Object ${newId}: Cycle Colors`, type: 'boolean', default: 'false', description: 'Animates the colors by cycling through the color spectrum.' },
            { property: `obj${newId}_cycleSpeed`, label: `Object ${newId}: Color Cycle Speed`, type: 'number', default: '10', min: '0', max: '100', description: 'The speed at which colors cycle when "Cycle Colors" is enabled.' },
            { property: `obj${newId}_rotationSpeed`, label: `Object ${newId}: Rotation Speed`, type: 'number', default: '0', min: '-100', max: '100', description: 'The continuous rotation speed of the object. Overrides static rotation.' },
            { property: `obj${newId}_scrollDir`, label: `Object ${newId}: Scroll Direction`, type: 'combobox', values: 'right,left,up,down', default: 'right', description: 'The direction the gradient animation moves.' },
            { property: `obj${newId}_phaseOffset`, label: `Object ${newId}: Phase Offset`, type: 'number', default: '10', min: '0', max: '100', description: 'Offsets the gradient animation for each item in a grid, seismic wave, or Tetris block, creating a cascading effect.' },

            // Shape-Specific Properties
            { property: `obj${newId}_sides`, label: `Object ${newId}: Sides`, type: 'number', default: '6', min: '3', max: '50', description: '(Polygon) The number of sides for the polygon.' },
            { property: `obj${newId}_points`, label: `Object ${newId}: Points`, type: 'number', default: '5', min: '3', max: '50', description: '(Star) The number of points on the star.' },
            { property: `obj${newId}_starInnerRadius`, label: `Object ${newId}: Inner Radius %`, type: 'number', default: '50', min: '1', max: '99', description: '(Star) The size of the inner points as a percentage of the outer radius.' },
            { property: `obj${newId}_innerDiameter`, label: `Object ${newId}: Inner Diameter`, type: 'number', default: '25', min: '1', max: '318', description: '(Ring) The diameter of the inner hole of the ring.' },
            { property: `obj${newId}_numberOfSegments`, label: `Object ${newId}: Segments`, type: 'number', default: '12', min: '1', max: '50', description: '(Ring) The number of individual segments that make up the ring.' },
            { property: `obj${newId}_angularWidth`, label: `Object ${newId}: Segment Angle`, type: 'number', min: '1', max: '360', default: '20', description: '(Ring) The width of each ring segment, in degrees.' },
            { property: `obj${newId}_numberOfRows`, label: `Object ${newId}: Number of Rows`, type: 'number', default: '1', min: '1', max: '100', description: '(Grid) The number of vertical cells in the grid.' },
            { property: `obj${newId}_numberOfColumns`, label: `Object ${newId}: Number of Columns`, type: 'number', default: '1', min: '1', max: '100', description: '(Grid) The number of horizontal cells in the grid.' },
            { property: `obj${newId}_text`, label: `Object ${newId}: Text`, type: 'textfield', default: 'New Text', description: '(Text) The content displayed within the text object.' },
            { property: `obj${newId}_fontSize`, label: `Object ${newId}: Font Size`, type: 'number', default: '15', min: '2', max: '100', description: '(Text) The size of the text.' },
            { property: `obj${newId}_textAlign`, label: `Object ${newId}: Justification`, type: 'combobox', values: 'left,center,right', default: 'center', description: '(Text) The horizontal alignment of the text.' },
            { property: `obj${newId}_pixelFont`, label: `Object ${newId}: Pixel Font Style`, type: 'combobox', values: 'small,large', default: 'small', description: '(Text) The style of the pixelated font.' },
            { property: `obj${newId}_textAnimation`, label: `Object ${newId}: Text Animation`, type: 'combobox', values: 'none,marquee,typewriter,wave', default: 'none', description: '(Text) The animation style for the text.' },
            { property: `obj${newId}_textAnimationSpeed`, label: `Object ${newId}: Text Scroll Speed`, type: 'number', min: '1', max: '100', default: '10', description: '(Text) The speed of the text animation.' },
            { property: `obj${newId}_showTime`, label: `Object ${newId}: Show Current Time`, type: 'boolean', default: 'false', description: 'Overrides the text content to show the current time.' },
            { property: `obj${newId}_showDate`, label: `Object ${newId}: Show Current Date`, type: 'boolean', default: 'false', description: 'Overrides the text content to show the current date.' },
            { property: `obj${newId}_lineWidth`, label: `Object ${newId}: Line Width`, type: 'number', default: '1', min: '1', max: '20', description: '(Oscilloscope) The thickness of the oscilloscope line.' },
            { property: `obj${newId}_waveType`, label: `Object ${newId}: Wave Type`, type: 'combobox', default: 'sine', values: 'sine,square,sawtooth,triangle,earthquake', description: '(Oscilloscope) The shape of the wave being displayed.' },
            { property: `obj${newId}_frequency`, label: `Object ${newId}: Frequency / Wave Peaks`, type: 'number', default: '5', min: '1', max: '50', description: '(Oscilloscope) The number of wave peaks displayed across the shape.' },
            { property: `obj${newId}_oscDisplayMode`, label: `Object ${newId}: Display Mode`, type: 'combobox', default: 'linear', values: 'linear,radial,seismic', description: '(Oscilloscope) The layout of the oscilloscope animation.' },
            { property: `obj${newId}_pulseDepth`, label: `Object ${newId}: Pulse Depth`, type: 'number', default: '50', min: '0', max: '100', description: 'The intensity of the wave\'s amplitude or pulse effect.' },
            { property: `obj${newId}_enableWaveAnimation`, label: `Object ${newId}: Enable Wave Animation`, type: 'boolean', default: 'true', description: 'Toggles the movement of the oscilloscope wave.' },
            { property: `obj${newId}_oscAnimationSpeed`, label: `Object ${newId}: Wave Animation Speed`, type: 'number', min: '0', max: '100', default: '10', description: 'Controls the speed of the oscilloscope wave movement, independent of the fill animation.' },
            { property: `obj${newId}_waveStyle`, label: `Object ${newId}: Seismic Wave Style`, type: 'combobox', default: 'wavy', values: 'wavy,round', description: '(Oscilloscope) The style of the seismic wave.' },
            { property: `obj${newId}_waveCount`, label: `Object ${newId}: Seismic Wave Count`, type: 'number', default: '5', min: '1', max: '20', description: '(Oscilloscope) The number of seismic waves to display.' },
            { property: `obj${newId}_tetrisBlockCount`, label: `Object ${newId}: Block Count`, type: 'number', default: '10', min: '1', max: '50', description: '(Tetris) The number of blocks in the animation cycle.' },
            { property: `obj${newId}_tetrisAnimation`, label: `Object ${newId}: Drop Physics`, type: 'combobox', values: 'gravity,linear,gravity-fade,fade-in-stack,fade-in-out', default: 'gravity', description: '(Tetris) The physics governing how the blocks fall.' },
            { property: `obj${newId}_tetrisSpeed`, label: `Object ${newId}: Drop/Fade-in Speed`, type: 'number', default: '5', min: '1', max: '100', description: '(Tetris) The speed of the drop animation.' },
            { property: `obj${newId}_tetrisBounce`, label: `Object ${newId}: Bounce Factor`, type: 'number', default: '50', min: '0', max: '90', description: '(Tetris) How much the blocks bounce on impact.' },
            { property: `obj${newId}_tetrisHoldTime`, label: `Object ${newId}: Hold Time`, type: 'number', default: '50', min: '0', max: '200', description: '(Tetris) For fade-in-out, the time blocks remain visible before fading out.' },
            { property: `obj${newId}_fireSpread`, label: `Object ${newId}: Fire Spread %`, type: 'number', default: '100', min: '1', max: '100', description: '(Fire Radial) Controls how far the flames spread from the center.' },
            { property: `obj${newId}_pixelArtFrames`, label: `Object ${newId}: Pixel Art Frames`, type: 'pixelarttable', default: '[{"data":"[[1]]","duration":1}]', description: '(Pixel Art) Manage animation frames.' },

            // Stroke Fill
            { property: `obj${newId}_enableStroke`, label: `Object ${newId}: Enable Stroke`, type: 'boolean', default: 'false', description: 'Enables a stroke (outline) for the shape.' },
            { property: `obj${newId}_strokeWidth`, label: `Object ${newId}: Stroke Width`, type: 'number', default: '2', min: '1', max: '50', description: 'The thickness of the shape\'s stroke.' },
            { property: `obj${newId}_strokeGradType`, label: `Object ${newId}: Stroke Type`, type: 'combobox', default: 'solid', values: 'solid,linear,radial,conic,alternating,random,rainbow,rainbow-radial,rainbow-conic', description: 'The type of color fill or gradient to use for the stroke.' },
            { property: `obj${newId}_strokeGradientStops`, label: `Object ${newId}: Stroke Gradient Colors`, type: 'gradientpicker', default: '[{"color":"#FFFFFF","position":0}]', description: 'The colors and positions of the stroke gradient.' },
            { property: `obj${newId}_strokeUseSharpGradient`, label: `Object ${newId}: Stroke Use Sharp Gradient`, type: 'boolean', default: 'false', description: 'If checked, creates a hard line between colors in the stroke gradient instead of a smooth blend.' },
            { property: `obj${newId}_strokeAnimationMode`, label: `Object ${newId}: Stroke Animation Mode`, type: 'combobox', values: 'loop,bounce', default: 'loop', description: 'Determines how the stroke gradient animation behaves.' },
            { property: `obj${newId}_strokeAnimationSpeed`, label: `Object ${newId}: Stroke Animation Speed`, type: 'number', default: '2', min: '0', max: '100', description: 'Controls the scroll speed of the stroke gradient animation.' },
            { property: `obj${newId}_strokeCycleColors`, label: `Object ${newId}: Cycle Stroke Colors`, type: 'boolean', default: 'false', description: 'Animates the stroke colors by cycling through the color spectrum.' },
            { property: `obj${newId}_strokeCycleSpeed`, label: `Object ${newId}: Stroke Color Cycle Speed`, type: 'number', default: '10', min: '0', max: '100', description: 'The speed at which stroke colors cycle when "Cycle Stroke Colors" is enabled.' },
            { property: `obj${newId}_strokeRotationSpeed`, label: `Object ${newId}: Stroke Rotation Speed`, type: 'number', default: '0', min: '-100', max: '100', description: 'The continuous rotation speed of the stroke\'s conic gradient pattern.' },
            { property: `obj${newId}_strokeScrollDir`, label: `Object ${newId}: Stroke Scroll Direction`, type: 'combobox', default: 'right', values: 'right,left,up,down,along-path,along-path-reversed', description: 'The direction the stroke gradient animation moves. "Along Path" is for Polylines only.' },
            { property: `obj${newId}_strokePhaseOffset`, label: `Object ${newId}: Stroke Phase Offset`, type: 'number', default: '10', min: '0', max: '100', description: 'Offsets the stroke gradient animation for each item in a grid, creating a cascading effect.' },

            // Audio Reactivity
            { property: `obj${newId}_enableAudioReactivity`, label: `Object ${newId}: Enable Sound Reactivity`, type: 'boolean', default: 'false', description: 'Enables the object to react to sound.' },
            { property: `obj${newId}_audioTarget`, label: `Object ${newId}: Reactive Property`, type: 'combobox', default: 'Flash', values: 'none,Flash,Size,Rotation,Path Speed', description: 'Which property of the object will be affected by the sound.' },
            { property: `obj${newId}_audioMetric`, label: `Object ${newId}: Audio Metric`, type: 'combobox', default: 'volume', values: 'volume,bass,mids,highs', description: 'Which part of the audio spectrum to react to.' },
            { property: `obj${newId}_beatThreshold`, label: `Object ${newId}: Beat Threshold`, type: 'number', default: '30', min: '1', max: '100', description: 'Sensitivity for beat detection. Higher values are MORE sensitive.' },
            { property: `obj${newId}_audioSensitivity`, label: `Object ${newId}: Sensitivity`, type: 'number', default: '50', min: '0', max: '200', description: 'How strongly the object reacts to the audio metric.' },
            { property: `obj${newId}_audioSmoothing`, label: `Object ${newId}: Smoothing`, type: 'number', default: '50', min: '0', max: '99', description: 'Smooths out the reaction to prevent flickering. Higher values are smoother.' },

            // Audio Visualizer
            { property: `obj${newId}_vizDynamicRange`, label: `Object ${newId}: Dynamic Range`, type: 'boolean', default: 'false', description: '(Visualizer) Automatically adjusts the frequency range to focus on active audio, ignoring silent higher frequencies.' },
            { property: `obj${newId}_vizSmoothing`, label: `Object ${newId}: Smoothing`, type: 'number', default: '60', min: '0', max: '99', description: '(Visualizer) How smoothly the bars react to audio changes. Higher is smoother.' },
            { property: `obj${newId}_vizDrawStyle`, label: `Object ${newId}: Draw Style`, type: 'combobox', default: 'Line', values: 'Bars,Line,Area', description: '(Visualizer) How the frequencies are rendered.' },
            { property: `obj${newId}_vizLayout`, label: `Object ${newId}: Layout`, type: 'combobox', default: 'Linear', values: 'Linear,Circular,Polyline,Circular Polyline', description: '(Visualizer) The overall layout of the visualizer.' },
            { property: `obj${newId}_vizStyle`, label: `Object ${newId}: Style`, type: 'combobox', default: 'bottom', values: 'bottom,center,top', description: '(Visualizer) The alignment of the visualizer bars.' },
            { property: `obj${newId}_vizInnerRadius`, label: `Object ${newId}: Inner Radius %`, type: 'number', default: '40', min: '0', max: '95', description: '(Visualizer) Sets the radius of the empty inner circle.' },
            { property: `obj${newId}_vizLineWidth`, label: `Object ${newId}: Line Width`, type: 'number', default: '2', min: '1', max: '20', description: '(Visualizer) The thickness of the line for the Line/Area draw styles.' },
            { property: `obj${newId}_vizAutoScale`, label: `Object ${newId}: Auto-Scale Height`, type: 'boolean', default: 'true', description: '(Visualizer) If checked, the tallest bar will always reach the top of the shape.' },
            { property: `obj${newId}_vizBarCount`, label: `Object ${newId}: Bar Count`, type: 'number', default: '32', min: '2', max: '128', description: '(Visualizer) The number of frequency bars to display.' },
            { property: `obj${newId}_vizBarSpacing`, label: `Object ${newId}: Bar Spacing`, type: 'number', default: '2', min: '0', max: '20', description: '(Visualizer) The space between each bar in pixels.' },
            { property: `obj${newId}_vizMaxBarHeight`, label: `Object ${newId}: Max Bar Height %`, type: 'number', default: '100', min: '5', max: '100', description: '(Visualizer) Sets the maximum possible length for any visualizer bar.' },
            { property: `obj${newId}_vizUseSegments`, label: `Object ${newId}: Use LED Segments`, type: 'boolean', default: 'false', description: '(Visualizer) Renders bars as discrete segments instead of solid blocks.' },
            { property: `obj${newId}_vizSegmentCount`, label: `Object ${newId}: Segment Count`, type: 'number', default: '16', min: '2', max: '64', description: '(Visualizer) The number of vertical LED segments the bar is divided into.' },
            { property: `obj${newId}_vizSegmentSpacing`, label: `Object ${newId}: Segment Spacing`, type: 'number', default: '1', min: '0', max: '10', description: '(Visualizer) The spacing between segments in a bar.' },
            { property: `obj${newId}_vizBassLevel`, label: `Object ${newId}: Bass Level %`, type: 'number', default: '100', min: '0', max: '200', description: '(Visualizer) Multiplier for the lowest frequency bars.' },
            { property: `obj${newId}_vizTrebleBoost`, label: `Object ${newId}: Treble Boost %`, type: 'number', default: '125', min: '0', max: '200', description: '(Visualizer) Multiplier for the highest frequency bars.' },

            // Sensor Reactivity
            { property: `obj${newId}_enableSensorReactivity`, label: `Object ${newId}: Enable Sensor Reactivity`, type: 'boolean', default: 'false', description: 'Enables the object to react to sensor data.' },
            { property: `obj${newId}_sensorTarget`, label: `Object ${newId}: Reactive Property`, type: 'combobox', default: 'Sensor Meter', values: 'Sensor Meter,Time Plot', description: 'Selects the specific effect that the object will perform in response to sensor data.' },
            { property: `obj${newId}_sensorValueSource`, label: `Object ${newId}: Sensor Value`, type: 'combobox', default: 'value', values: 'value,min,max', description: 'The source of the data value to use from the selected sensor (current, min, or max).' },
            { property: `obj${newId}_userSensor`, label: `Object ${newId}: Sensor`, type: 'sensor', default: 'CPU Load', description: 'The hardware sensor to monitor for reactivity.' },
            { property: `obj${newId}_timePlotLineThickness`, label: `Object ${newId}: Line Thickness`, type: 'number', default: '1', min: '1', max: '50', description: '(Time Plot) Sets the thickness of the time-plot line.' },
            { property: `obj${newId}_timePlotFillArea`, label: `Object ${newId}: Fill Area`, type: 'boolean', default: 'false', description: '(Time Plot) Fills the area under the time plot line.' },
            { property: `obj${newId}_sensorColorMode`, label: `Object ${newId}: Color Mode`, type: 'combobox', default: 'None', values: 'None,Value-Based Gradient,Thresholds', description: '(Sensor Meter) The coloring method for the sensor meter.' },
            { property: `obj${newId}_sensorMidThreshold`, label: `Object ${newId}: Mid Threshold`, type: 'number', default: '50', min: '0', max: '100', description: 'The sensor value at which the color changes from green to orange.' },
            { property: `obj${newId}_sensorMaxThreshold`, label: `Object ${newId}: Max Threshold`, type: 'number', default: '90', min: '0', max: '100', description: 'The sensor value at which the color changes from orange to red.' },
            { property: `obj${newId}_sensorMeterShowValue`, label: `Object ${newId}: Show Value`, type: 'boolean', default: 'false', description: '(Sensor Meter) Displays the current sensor value as text on the meter.' },
            { property: `obj${newId}_timePlotAxesStyle`, label: `Object ${newId}: Axes Style`, type: 'combobox', default: 'None', values: 'None,Lines Only,Lines and Values', description: '(Time Plot) Sets the style for the X and Y axes.' },
            { property: `obj${newId}_timePlotTimeScale`, label: `Object ${newId}: Time Scale (Seconds)`, type: 'number', default: '5', min: '1', max: '30', description: '(Time Plot) The total duration in seconds displayed across the width of the chart.' },

            // Strimer
            { property: `obj${newId}_strimerRows`, label: `Object ${newId}: Rows`, type: 'number', default: '4', min: '1', max: '50', description: '(Strimer) Number of horizontal rows.' },
            { property: `obj${newId}_strimerColumns`, label: `Object ${newId}: Columns`, type: 'number', default: '4', min: '1', max: '50', description: '(Strimer) Number of vertical columns.' },
            { property: `obj${newId}_strimerBlockCount`, label: `Object ${newId}: Block Count`, type: 'number', default: '4', min: '1', max: '100', description: '(Strimer) Number of animated blocks per column.' },
            { property: `obj${newId}_strimerBlockSize`, label: `Object ${newId}: Block Size`, type: 'number', default: '10', min: '1', max: '100', description: '(Strimer) Height of each block in pixels.' },
            { property: `obj${newId}_strimerAnimation`, label: `Object ${newId}: Animation`, type: 'combobox', default: 'Bounce', values: 'Bounce,Loop,Cascade,Audio Meter,Snake', description: '(Strimer) The primary animation style for the blocks.' },
            { property: `obj${newId}_strimerDirection`, label: `Object ${newId}: Direction`, type: 'combobox', default: 'Random', values: 'Up,Down,Random', description: '(Strimer) The initial direction of the blocks.' },
            { property: `obj${newId}_strimerEasing`, label: `Object ${newId}: Easing`, type: 'combobox', default: 'Linear', values: 'Linear,Ease-In,Ease-Out,Ease-In-Out', description: '(Strimer) The acceleration curve of the block movement.' },
            { property: `obj${newId}_strimerAnimationSpeed`, label: `Object ${newId}: Animation Speed`, type: 'number', default: '20', min: '0', max: '100', description: '(Strimer) The speed of the block movement, independent of the fill animation.' },
            { property: `obj${newId}_strimerSnakeDirection`, label: `Object ${newId}: Snake Direction`, type: 'combobox', default: 'Vertical', values: 'Horizontal,Vertical', description: '(Strimer) The direction of the snake.' },
            { property: `obj${newId}_strimerBlockSpacing`, label: `Object ${newId}: Block Spacing`, type: 'number', default: '5', min: '0', max: '50', description: '(Cascade) The vertical spacing between blocks in a cascade.' },
            { property: `obj${newId}_strimerGlitchFrequency`, label: `Object ${newId}: Glitch Frequency`, type: 'number', default: '0', min: '0', max: '100', description: '(Glitch) How often blocks stutter or disappear. 0 is off.' },
            { property: `obj${newId}_strimerPulseSync`, label: `Object ${newId}: Sync Columns`, type: 'boolean', default: 'true', description: '(Pulse) If checked, all columns pulse together.' },
            { property: `obj${newId}_strimerAudioSensitivity`, label: `Object ${newId}: Audio Sensitivity`, type: 'number', default: '100', min: '0', max: '200', description: '(Audio Meter) Multiplies the height of the audio bars.' },
            { property: `obj${newId}_strimerBassLevel`, label: `Object ${newId}: Bass Level %`, type: 'number', default: '100', min: '0', max: '200', description: '(Audio Meter) Multiplier for the bass column(s).' },
            { property: `obj${newId}_strimerTrebleBoost`, label: `Object ${newId}: Treble Boost %`, type: 'number', default: '150', min: '0', max: '200', description: '(Audio Meter) Multiplier for the treble/volume columns.' },
            { property: `obj${newId}_strimerAudioSmoothing`, label: `Object ${newId}: Audio Smoothing`, type: 'number', default: '60', min: '0', max: '99', description: '(Audio Meter) Smooths out the bar movement.' },
            { property: `obj${newId}_strimerPulseSpeed`, label: `Object ${newId}: Pulse Speed`, type: 'number', default: '0', min: '0', max: '100', description: '(Modifier) Speed of the breathing/pulse effect. 0 is off.' },

            // Spawner
            { property: `obj${newId}_spawn_shapeType`, label: `Object ${newId}: Particle Shape`, type: 'combobox', values: 'rectangle,circle,polygon,star,sparkle,custom,matrix,random', default: 'circle', description: '(Spawner) The geometric shape of the emitted particles.' },
            { property: `obj${newId}_spawn_animation`, label: `Object ${newId}: Emitter Style`, type: 'combobox', values: 'explode,fountain,rain,flow', default: 'explode', description: '(Spawner) The behavior and direction of particle emission.' },
            { property: `obj${newId}_spawn_count`, label: `Object ${newId}: Max Particles`, type: 'number', default: '100', min: '1', max: '500', description: '(Spawner) The maximum number of particles on screen at once.' },
            { property: `obj${newId}_spawn_spawnRate`, label: `Object ${newId}: Spawn Rate`, type: 'number', default: '50', min: '0', max: '500', description: '(Spawner) How many new particles are created per second.' },
            { property: `obj${newId}_spawn_lifetime`, label: `Object ${newId}: Lifetime (s)`, type: 'number', default: '3', min: '0.1', max: '20', description: '(Spawner) How long each particle lasts, in seconds.' },
            { property: `obj${newId}_spawn_speed`, label: `Object ${newId}: Initial Speed`, type: 'number', default: '50', min: '0', max: '500', description: '(Spawner) The average starting speed of newly created particles.' },
            { property: `obj${newId}_spawn_speedVariance`, label: `Object ${newId}: Initial Speed Variance (±)`, type: 'number', default: '0', min: '0', max: '500', description: '(Spawner) Adds randomness to the initial speed of each particle.' },
            { property: `obj${newId}_spawn_size`, label: `Object ${newId}: Particle Size`, type: 'number', default: '10', min: '1', max: '100', description: '(Spawner) The size of each particle in pixels.' },
            { property: `obj${newId}_spawn_size_randomness`, label: `Object ${newId}: Size Randomness %`, type: 'number', default: '0', min: '0', max: '100', description: '(Spawner) How much to vary each particle\'s size.' },
            { property: `obj${newId}_spawn_gravity`, label: `Object ${newId}: Gravity`, type: 'number', default: '0', min: '-200', max: '200', description: '(Spawner) A constant downward (or upward) force applied to particles.' },
            { property: `obj${newId}_spawn_spread`, label: `Object ${newId}: Spread Angle`, type: 'number', default: '360', min: '0', max: '360', description: '(Spawner) The angle (in degrees) for Explode or Fountain emitters.' },
            { property: `obj${newId}_spawn_rotationSpeed`, label: `Object ${newId}: Particle Rotation Speed`, type: 'number', default: '0', min: '-360', max: '360', description: '(Spawner) The average rotational speed of each particle in degrees per second.' },
            { property: `obj${newId}_spawn_rotationVariance`, label: `Object ${newId}: Rotation Variance (±deg/s)`, type: 'number', default: '0', min: '0', max: '360', description: '(Spawner) Sets the random range for rotation speed.' },
            { property: `obj${newId}_spawn_initialRotation_random`, label: `Object ${newId}: Random Initial Rotation`, type: 'boolean', default: 'false', description: '(Spawner) If checked, each particle starts at a random angle.' },
            { property: `obj${newId}_spawn_svg_path`, label: `Object ${newId}: Custom SVG Path`, type: 'textfield', default: 'M -20 -20 L 20 -20 L 20 20 L -20 20 Z', description: '(Spawner) The SVG `d` attribute path data for the custom particle shape.' },
            { property: `obj${newId}_spawn_matrixCharSet`, label: `Object ${newId}: Matrix Character Set`, type: 'combobox', default: 'katakana', values: 'katakana,numbers,binary,ascii', description: '(Spawner) The set of characters to use for the Matrix particle type.' },
            { property: `obj${newId}_spawn_enableTrail`, label: `Object ${newId}: Enable Trail`, type: 'boolean', default: 'false', description: '(Spawner/Trail) Enables a fading trail behind each particle.' },
            { property: `obj${newId}_spawn_trailLength`, label: `Object ${newId}: Trail Length`, type: 'number', default: '15', min: '1', max: '50', description: '(Spawner) The number of segments or characters in a particle\'s trail.' },
            { property: `obj${newId}_spawn_trailSpacing`, label: `Object ${newId}: Trail Spacing`, type: 'number', default: '1', min: '0.1', max: '10', step: '0.1', description: '(Spawner/Trail) Multiplier for the distance between trail segments.' },
            { property: `obj${newId}_spawn_matrixEnableGlow`, label: `Object ${newId}: Enable Character Glow`, type: 'boolean', default: 'false', description: '(Spawner/Matrix) Adds a glow effect to the matrix characters.' },
            { property: `obj${newId}_spawn_matrixGlowSize`, label: `Object ${newId}: Character Glow Size`, type: 'number', default: '10', min: '0', max: '50', description: '(Spawner/Matrix) The size and intensity of the glow effect.' },

            // Polyline
            { property: `obj${newId}_polylineCurveStyle`, label: `Object ${newId}: Curve Style`, type: 'combobox', default: 'straight', values: 'straight,loose-curve,tight-curve', description: '(Polyline) The style of the line segments.' },
            { property: `obj${newId}_polylineNodes`, label: `Object ${newId}: Nodes`, type: 'nodetable', default: '[{"x":50,"y":50},{"x":150,"y":100}]', description: '(Polyline) The coordinate data for the polyline nodes.' },
            { property: `obj${newId}_pathAnim_enable`, label: `Object ${newId}: Enable Animation`, type: 'boolean', default: 'false', description: 'Enables an object that travels along the path.' },
            { property: `obj${newId}_pathAnim_shape`, label: `Object ${newId}: Shape`, type: 'combobox', default: 'circle', values: 'circle,rectangle,star,polygon', description: 'The shape of the traveling object.' },
            { property: `obj${newId}_pathAnim_size`, label: `Object ${newId}: Size`, type: 'number', default: '10', min: '1', max: '100', description: 'The size of the traveling object in pixels.' },
            { property: `obj${newId}_pathAnim_speed`, label: `Object ${newId}: Speed`, type: 'number', default: '50', min: '0', max: '1000', description: 'How fast the object travels along the path (pixels per second).' },
            { property: `obj${newId}_pathAnim_gradType`, label: `Object ${newId}: Fill Type`, type: 'combobox', default: 'solid', values: 'solid,linear,radial,conic,alternating,random,rainbow,rainbow-radial,rainbow-conic' },
            { property: `obj${newId}_pathAnim_useSharpGradient`, label: `Object ${newId}: Use Sharp Gradient`, type: 'boolean', default: 'false' },
            { property: `obj${newId}_pathAnim_gradColor1`, label: `Object ${newId}: Color 1`, type: 'color', default: '#FFFFFF' },
            { property: `obj${newId}_pathAnim_gradColor2`, label: `Object ${newId}: Color 2`, type: 'color', default: '#00BFFF' },
            { property: `obj${newId}_pathAnim_animationMode`, label: `Object ${newId}: Fill Animation`, type: 'combobox', values: 'loop,bounce', default: 'loop' },
            { property: `obj${newId}_pathAnim_animationSpeed`, label: `Object ${newId}: Fill Speed`, type: 'number', default: '10', min: '0', max: '100' },
            { property: `obj${newId}_pathAnim_behavior`, label: `Object ${newId}: Behavior`, type: 'combobox', values: 'Loop,Ping-Pong', default: 'Loop', description: 'How the object behaves when it reaches the end of the path.' },
            { property: `obj${newId}_pathAnim_objectCount`, label: `Object ${newId}: Object Count`, type: 'number', default: '1', min: '1', max: '100', description: 'The number of objects to animate along the path.' },
            { property: `obj${newId}_pathAnim_objectSpacing`, label: `Object ${newId}: Object Spacing`, type: 'number', default: '25', min: '0', max: '200', description: 'The distance between each object when Object Count is greater than 1.' },
            { property: `obj${newId}_pathAnim_scrollDir`, label: `Object ${newId}: Scroll Direction`, type: 'combobox', values: 'right,left,up,down', default: 'right' },
            { property: `obj${newId}_pathAnim_cycleColors`, label: `Object ${newId}: Cycle Colors`, type: 'boolean', default: 'false' },
            { property: `obj${newId}_pathAnim_cycleSpeed`, label: `Object ${newId}: Color Cycle Speed`, type: 'number', default: '10', min: '0', max: '100' },
            { property: `obj${newId}_pathAnim_trail`, label: `Object ${newId}: Trail`, type: 'combobox', values: 'None,Fade,Solid', default: 'None', description: 'Adds a trail behind the moving object.' },
            { property: `obj${newId}_pathAnim_trailLength`, label: `Object ${newId}: Trail Length`, type: 'number', default: '20', min: '1', max: '200', description: 'The length of the trail.' },
            { property: `obj${newId}_pathAnim_trailColor`, label: `Object ${newId}: Trail Color`, type: 'combobox', values: 'Inherit,Rainbow', default: 'Inherit', description: 'The color style of the trail.' },
        ];
    }

    /**
     * Enables or disables dependent stroke controls based on the 'enableStroke' checkbox state.
     * @param {HTMLElement} fieldset - The fieldset element for a specific object.
     */
    function updateStrokeDependentControls(fieldset) {
        const id = fieldset.dataset.objectId;
        const enableStrokeToggle = fieldset.querySelector(`[name="obj${id}_enableStroke"]`);
        if (!enableStrokeToggle) return;

        const isStrokeEnabled = enableStrokeToggle.checked;

        const dependentControls = [
            'strokeWidth', 'strokeGradType', 'strokeUseSharpGradient',
            'strokeGradColor1', 'strokeGradColor2', 'strokeCycleColors', 'strokeCycleSpeed',
            'strokeAnimationSpeed', 'strokeRotationSpeed', 'strokeAnimationMode',
            'strokePhaseOffset', 'strokeScrollDir'
        ];

        dependentControls.forEach(prop => {
            const control = fieldset.querySelector(`[name="obj${id}_${prop}"]`);
            if (control) {
                control.disabled = !isStrokeEnabled;
                const slider = fieldset.querySelector(`[name="obj${id}_${prop}_slider"]`);
                if (slider) slider.disabled = !isStrokeEnabled;
                const hexInput = fieldset.querySelector(`[name="obj${id}_${prop}_hex"]`);
                if (hexInput) hexInput.disabled = !isStrokeEnabled;
            }
        });
    }

    function getLocalDateFromUTC(dateUTC) {
        const offsetInMs = dateUTC.getTimezoneOffset() * 60 * 1000;
        return new Date(dateUTC.getTime() - offsetInMs);
    }

    function serializeFontData(fontData, varName) {
        return 'const ' + varName + ' = ' + JSON.stringify(fontData) + ';';
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

        // Fallback for other formats
        return { r: 0, g: 0, b: 0, a: 1 };
    }

    async function incrementDownloadCount() {
        if (currentProjectDocId) {
            try {
                const docRef = window.doc(window.db, "projects", currentProjectDocId);
                await window.updateDoc(docRef, {
                    downloadCount: window.increment(1)
                });
            } catch (err) {
                console.warn("Could not increment download count:", err);
            }
        }
    }

    form.addEventListener('input', (e) => {
        const target = e.target;
        if (target.name) {
            dirtyProperties.add(target.name);
        }

        if (['enablePalette', 'paletteColor1', 'paletteColor2'].includes(target.name)) {
            updateColorControls();
        }

        if (target.type === 'number' && document.getElementById(`${target.id}_slider`)) {
            document.getElementById(`${target.id}_slider`).value = target.value;
        } else if (target.type === 'range' && target.id.endsWith('_slider')) {
            document.getElementById(target.id.replace('_slider', '')).value = target.value;
        }

        if (target.type === 'color' && document.getElementById(`${target.id}_hex`)) {
            document.getElementById(`${target.id}_hex`).value = target.value;
        } else if (target.type === 'text' && target.id.endsWith('_hex')) {
            const colorPicker = document.getElementById(target.id.replace('_hex', ''));
            if (colorPicker && /^#[0-9A-F]{6}$/i.test(target.value)) {
                colorPicker.value = target.value;
            }
        }

        if (target.classList.contains('node-x-input') || target.classList.contains('node-y-input')) {
            const container = target.closest('.node-table-container');
            if (container) {
                const hiddenTextarea = container.querySelector('textarea');
                const tbody = container.querySelector('tbody');
                const newNodes = Array.from(tbody.children).map(tr => ({
                    x: parseFloat(tr.querySelector('.node-x-input').value) || 0,
                    y: parseFloat(tr.querySelector('.node-y-input').value) || 0,
                }));
                hiddenTextarea.value = JSON.stringify(newNodes);
            }
        }

        if (target.classList.contains('frame-data-input') || target.classList.contains('frame-duration-input')) {
            const container = target.closest('.pixel-art-table-container');
            if (container) {
                const hiddenTextarea = container.querySelector('textarea[name$="_pixelArtFrames"]');
                const framesContainer = container.querySelector('.d-flex.flex-column.gap-2');
                if (framesContainer) {
                    const newFrames = Array.from(framesContainer.children).map(item => ({
                        data: item.querySelector('.frame-data-input').value,
                        duration: parseFloat(item.querySelector('.frame-duration-input').value) || 1,
                    }));
                    hiddenTextarea.value = JSON.stringify(newFrames);
                }
            }

            // FIX: This block now correctly redraws thumbnails with the full gradient palette.
            if (target.classList.contains('frame-data-input')) {
                const frameItem = target.closest('.pixel-art-frame-item');
                if (frameItem) {
                    const fieldset = frameItem.closest('fieldset[data-object-id]');
                    const objectId = fieldset.dataset.objectId;
                    const targetObject = objects.find(o => o.id === parseInt(objectId, 10));

                    const gradientStops = targetObject ? targetObject.gradient.stops : [];

                    const previewCanvas = frameItem.querySelector('.pixel-art-preview-canvas');
                    renderPixelArtPreview(previewCanvas, target.value, gradientStops);
                }
            }
        }

        updateObjectsFromForm();
        syncConfigStoreWithForm();
        drawFrame();
    });

    form.addEventListener('click', (e) => {
        const addNodeBtn = e.target.closest('.btn-add-node');
        const deleteNodeBtn = e.target.closest('.btn-delete-node');
        const addFrameBtn = e.target.closest('.btn-add-frame');
        const deleteFrameBtn = e.target.closest('.btn-delete-frame');

        if (addNodeBtn) {
            const container = addNodeBtn.closest('.node-table-container');
            if (container) { // Check if the container was found
                const tbody = container.querySelector('tbody');
                const newIndex = tbody.children.length;
                const lastNode = newIndex > 0 ? tbody.children[newIndex - 1] : null;
                const lastX = lastNode ? parseInt(lastNode.querySelector('.node-x-input').value, 10) : 0;
                const lastY = lastNode ? parseInt(lastNode.querySelector('.node-y-input').value, 10) : 0;
                const tr = document.createElement('tr');
                tr.dataset.index = newIndex;
                tr.innerHTML = `<td class="align-middle">${newIndex + 1}</td><td><input type="number" class="form-control form-control-sm node-x-input" value="${lastX + 50}"></td><td><input type="number" class="form-control form-control-sm node-y-input" value="${lastY + 50}"></td><td class="align-middle"><button type="button" class="btn btn-sm btn-outline-danger btn-delete-node" title="Delete Node"><i class="bi bi-trash"></i></button></td>`;
                tbody.appendChild(tr);

                const hiddenTextarea = container.querySelector('textarea');
                const newNodes = Array.from(tbody.children).map(tr => ({
                    x: parseFloat(tr.querySelector('.node-x-input').value) || 0,
                    y: parseFloat(tr.querySelector('.node-y-input').value) || 0,
                }));
                hiddenTextarea.value = JSON.stringify(newNodes);
                hiddenTextarea.dispatchEvent(new Event('input', { bubbles: true }));
                recordHistory();
            }
            return;
        }

        if (deleteNodeBtn) {
            const container = deleteNodeBtn.closest('.node-table-container');
            if (container) { // Check if the container was found
                const tbody = container.querySelector('tbody');
                if (tbody.children.length > 2) {
                    deleteNodeBtn.closest('tr').remove();
                    Array.from(tbody.children).forEach((tr, index) => {
                        tr.dataset.index = index;
                        tr.firstElementChild.textContent = index + 1;
                    });
                } else {
                    showToast("A polyline must have at least 2 nodes.", "danger");
                }
                const hiddenTextarea = container.querySelector('textarea');
                const newNodes = Array.from(tbody.children).map(tr => ({
                    x: parseFloat(tr.querySelector('.node-x-input').value) || 0,
                    y: parseFloat(tr.querySelector('.node-y-input').value) || 0,
                }));
                hiddenTextarea.value = JSON.stringify(newNodes);
                hiddenTextarea.dispatchEvent(new Event('input', { bubbles: true }));
                recordHistory();
            }
            return;
        }

        if (addFrameBtn) {
            const container = addFrameBtn.closest('.pixel-art-table-container');
            if (container) { // Check if the container was found
                const framesContainer = container.querySelector('.d-flex.flex-column.gap-2');
                const newIndex = framesContainer.children.length;
                const objectId = addFrameBtn.closest('fieldset[data-object-id]').dataset.objectId;
                const frameItem = document.createElement('div');
                frameItem.className = 'pixel-art-frame-item border rounded p-1 bg-body d-flex gap-2 align-items-center';
                frameItem.dataset.index = newIndex;
                const defaultFrameData = '[[0.7]]';
                const textareaId = `frame-data-${objectId}-${newIndex}`;

                frameItem.innerHTML = `
                    <div class="frame-drag-handle text-body-secondary me-1 d-flex align-items-center" style="cursor: grab;" title="Drag to reorder frame"><i class="bi bi-grip-vertical"></i></div>
                    <canvas class="pixel-art-preview-canvas border rounded" width="60" height="60" title="Frame Preview"></canvas>
                    <div class="flex-grow-1">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <strong class="frame-item-header small">Frame #${newIndex + 1}</strong>
                            <div>
                                <button type="button" class="btn btn-sm btn-outline-info p-1" style="line-height: 1;"
                                        data-bs-toggle="modal" data-bs-target="#pixelArtEditorModal"
                                        data-target-id="${textareaId}" title="Edit Frame">
                                    <i class="bi bi-pencil-square"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-outline-danger p-1 btn-delete-frame" title="Delete Frame" style="line-height: 1;">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div class="input-group input-group-sm">
                            <span class="input-group-text" title="Duration (seconds)"><i class="bi bi-clock"></i></span>
                            <input type="number" class="form-control form-control-sm frame-duration-input" value="0.1" min="0.01" step="0.01">
                        </div>
                        <textarea class="form-control form-control-sm frame-data-input d-none" id="${textareaId}" rows="6">${defaultFrameData}</textarea>
                    </div>
                `;
                framesContainer.appendChild(frameItem);

                const targetObject = objects.find(o => o.id === parseInt(objectId, 10));
                const color1 = targetObject.gradient.stops?.[0]?.color;
                const color2 = targetObject.gradient.stops?.[1]?.color;
                const previewCanvas = frameItem.querySelector('.pixel-art-preview-canvas');
                renderPixelArtPreview(previewCanvas, defaultFrameData, color1, color2);

                const hiddenTextarea = container.querySelector('textarea[name$="_pixelArtFrames"]');
                const newFrames = Array.from(framesContainer.children).map(item => ({
                    data: item.querySelector('.frame-data-input').value,
                    duration: parseFloat(item.querySelector('.frame-duration-input').value) || 1,
                }));
                hiddenTextarea.value = JSON.stringify(newFrames);
                hiddenTextarea.dispatchEvent(new Event('input', { bubbles: true }));
                recordHistory();
            }
            return;
        }

        if (deleteFrameBtn) {
            const container = deleteFrameBtn.closest('.pixel-art-table-container');
            if (container) { // Check if the container was found
                const framesContainer = container.querySelector('.d-flex.flex-column.gap-2');
                if (framesContainer.children.length > 1) {
                    const tooltip = bootstrap.Tooltip.getInstance(deleteFrameBtn);
                    if (tooltip) {
                        tooltip.dispose();
                    }
                    deleteFrameBtn.closest('.pixel-art-frame-item').remove();
                    Array.from(framesContainer.children).forEach((item, index) => {
                        item.dataset.index = index;
                        item.querySelector('.frame-item-header').textContent = `Frame #${index + 1}`;
                    });
                } else {
                    showToast("Pixel Art object must have at least one frame.", "warning");
                }

                const hiddenTextarea = container.querySelector('textarea[name$="_pixelArtFrames"]');
                const newFrames = Array.from(framesContainer.children).map(item => ({
                    data: item.querySelector('.frame-data-input').value,
                    duration: parseFloat(item.querySelector('.frame-duration-input').value) || 1,
                }));
                hiddenTextarea.value = JSON.stringify(newFrames);
                hiddenTextarea.dispatchEvent(new Event('input', { bubbles: true }));
                recordHistory();
            }
            return;
        }

        const fieldset = e.target.closest('fieldset[data-object-id]');
        const isInteractive = e.target.closest('button, a, input, [contenteditable="true"]');
        if (fieldset && !isInteractive) {
            const idToSelect = parseInt(fieldset.dataset.objectId, 10);
            if (!(selectedObjectIds.length === 1 && selectedObjectIds[0] === idToSelect)) {
                selectedObjectIds = [idToSelect];
                updateToolbarState();
                syncPanelsWithSelection();
                drawFrame();
            }
        }
    });

    form.addEventListener('click', (e) => {
        // --- START: CONSOLIDATED BUTTON CLICK LOGIC ---
        const addNodeBtn = e.target.closest('.btn-add-node');
        const deleteNodeBtn = e.target.closest('.btn-delete-node');
        const addFrameBtn = e.target.closest('.btn-add-frame');
        const deleteFrameBtn = e.target.closest('.btn-delete-frame');

        const uploadGifBtn = e.target.closest('.btn-upload-gif');
        if (uploadGifBtn) {
            const fieldset = uploadGifBtn.closest('fieldset[data-object-id]');
            const objectId = fieldset.dataset.objectId;
            const gifInput = document.getElementById(`gif-upload-input-${objectId}`);
            if (gifInput) {
                gifInput.click(); // Programmatically click the hidden file input
            }
            return; // Stop further processing
        }

        // Handle Polyline Node Table Additions
        if (addNodeBtn) {
            const container = addNodeBtn.closest('.node-table-container');
            const tbody = container.querySelector('tbody');
            const newIndex = tbody.children.length;
            const lastNode = newIndex > 0 ? tbody.children[newIndex - 1] : null;
            const lastX = lastNode ? parseInt(lastNode.querySelector('.node-x-input').value, 10) : 0;
            const lastY = lastNode ? parseInt(lastNode.querySelector('.node-y-input').value, 10) : 0;
            const tr = document.createElement('tr');
            tr.dataset.index = newIndex;
            tr.innerHTML = `<td class="align-middle">${newIndex + 1}</td><td><input type="number" class="form-control form-control-sm node-x-input" value="${lastX + 50}"></td><td><input type="number" class="form-control form-control-sm node-y-input" value="${lastY + 50}"></td><td class="align-middle"><button type="button" class="btn btn-sm btn-outline-danger btn-delete-node" title="Delete Node"><i class="bi bi-trash"></i></button></td>`;
            tbody.appendChild(tr);

            const hiddenTextarea = container.querySelector('textarea');
            const newNodes = Array.from(tbody.children).map(tr => ({
                x: parseFloat(tr.querySelector('.node-x-input').value) || 0,
                y: parseFloat(tr.querySelector('.node-y-input').value) || 0,
            }));
            hiddenTextarea.value = JSON.stringify(newNodes);
            hiddenTextarea.dispatchEvent(new Event('input', { bubbles: true }));
            recordHistory(); // ADDED: Record this action in the undo/redo stack
            return;
        }

        // Handle Polyline Node Table Deletions
        if (deleteNodeBtn) {
            const container = deleteNodeBtn.closest('.node-table-container');
            const tbody = container.querySelector('tbody');
            if (tbody.children.length > 2) {
                deleteNodeBtn.closest('tr').remove();
                Array.from(tbody.children).forEach((tr, index) => {
                    tr.dataset.index = index;
                    tr.firstElementChild.textContent = index + 1;
                });
            } else {
                showToast("A polyline must have at least 2 nodes.", "danger");
            }
            const hiddenTextarea = container.querySelector('textarea');
            const newNodes = Array.from(tbody.children).map(tr => ({
                x: parseFloat(tr.querySelector('.node-x-input').value) || 0,
                y: parseFloat(tr.querySelector('.node-y-input').value) || 0,
            }));
            hiddenTextarea.value = JSON.stringify(newNodes);
            hiddenTextarea.dispatchEvent(new Event('input', { bubbles: true }));
            recordHistory(); // ADDED: Record this action in the undo/redo stack
            return;
        }

        // Handle Pixel Art Frame Additions
        if (addFrameBtn) {
            const container = addFrameBtn.closest('.pixel-art-table-container');
            const framesContainer = container.querySelector('.d-flex.flex-column.gap-2');
            const newIndex = framesContainer.children.length;

            const objectId = addFrameBtn.closest('fieldset[data-object-id]').dataset.objectId;

            const frameItem = document.createElement('div');
            frameItem.className = 'pixel-art-frame-item border rounded p-1 bg-body d-flex gap-2 align-items-center';
            frameItem.dataset.index = newIndex;

            const defaultFrameData = '[[0.7]]';
            const textareaId = `frame-data-new-${Date.now()}`;

            frameItem.innerHTML = `
        <canvas class="pixel-art-preview-canvas border rounded" width="60" height="60" title="Frame Preview"></canvas>
        <div class="flex-grow-1">
            <div class="d-flex justify-content-between align-items-center mb-1">
                <strong class="frame-item-header small">Frame #${newIndex + 1}</strong>
                <div>
                    <button type="button" class="btn btn-sm btn-outline-info p-1" style="line-height: 1;"
                            data-bs-toggle="modal"
                            data-bs-target="#pixelArtEditorModal"
                            data-target-id="${textareaId}" title="Edit Frame">
                        <i class="bi bi-pencil-square"></i>
                    </button>
                    <button type="button" class="btn btn-sm btn-outline-danger p-1 btn-delete-frame" title="Delete Frame" style="line-height: 1;">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
            <div class="input-group input-group-sm">
                <span class="input-group-text" title="Duration (seconds)">
                    <i class="bi bi-clock"></i>
                </span>
                <input type="number" class="form-control form-control-sm frame-duration-input" value="0.1" min="0.1" step="0.1">
            </div>
            <textarea class="form-control form-control-sm frame-data-input d-none" id="${textareaId}" rows="6">${defaultFrameData}</textarea>
        </div>
    `;
            framesContainer.appendChild(frameItem);

            const previewCanvas = frameItem.querySelector('.pixel-art-preview-canvas');
            renderPixelArtPreview(previewCanvas, defaultFrameData);

            const hiddenTextarea = container.querySelector('textarea[name$="_pixelArtFrames"]');
            const newFrames = Array.from(framesContainer.children).map(item => ({
                data: item.querySelector('.frame-data-input').value,
                duration: parseFloat(item.querySelector('.frame-duration-input').value) || 1,
            }));
            hiddenTextarea.value = JSON.stringify(newFrames);
            hiddenTextarea.dispatchEvent(new Event('input', { bubbles: true }));
            recordHistory();
            return;
        }

        // Handle Pixel Art Frame Deletions
        if (deleteFrameBtn) {
            const container = deleteFrameBtn.closest('.pixel-art-table-container');
            const framesContainer = container.querySelector('.d-flex.flex-column.gap-2');
            if (framesContainer.children.length > 1) {
                const tooltip = bootstrap.Tooltip.getInstance(deleteFrameBtn);
                if (tooltip) {
                    // Destroy the tooltip before removing the button
                    tooltip.dispose();
                }
                deleteFrameBtn.closest('.pixel-art-frame-item').remove();
                Array.from(framesContainer.children).forEach((item, index) => {
                    item.dataset.index = index;
                    item.querySelector('.frame-item-header').textContent = `Frame #${index + 1}`;
                });
            } else {
                showToast("Pixel Art object must have at least one frame.", "warning");
            }

            const hiddenTextarea = container.querySelector('textarea[name$="_pixelArtFrames"]');
            const newFrames = Array.from(framesContainer.children).map(item => ({
                data: item.querySelector('.frame-data-input').value,
                duration: parseFloat(item.querySelector('.frame-duration-input').value) || 1,
            }));
            hiddenTextarea.value = JSON.stringify(newFrames);
            hiddenTextarea.dispatchEvent(new Event('input', { bubbles: true }));
            recordHistory(); // ADDED: Record this action in the undo/redo stack
            return;
        }
        // --- END: CONSOLIDATED BUTTON CLICK LOGIC ---

        // Original logic for selecting a panel
        const fieldset = e.target.closest('fieldset[data-object-id]');
        const isInteractive = e.target.closest('button, a, input, [contenteditable="true"]');
        if (fieldset && !isInteractive) {
            const idToSelect = parseInt(fieldset.dataset.objectId, 10);
            if (!(selectedObjectIds.length === 1 && selectedObjectIds[0] === idToSelect)) {
                selectedObjectIds = [idToSelect];
                updateToolbarState();
                syncPanelsWithSelection();
                drawFrame();
            }
        }
    });

    // MODIFIED - Added Ctrl+C and Ctrl+V keyboard shortcuts for copy/paste
    function finalizePolyline() {
        if (!isDrawingPolyline) return;

        const shape = objects.find(o => o.id === currentlyDrawingShapeId);
        if (shape) {
            // Final update to recalculate bounding box correctly
            shape.update({ polylineNodes: shape.polylineNodes });
            updateFormValuesFromObjects();
        }

        isDrawingPolyline = false;
        currentlyDrawingShapeId = null;
        previewLine.active = false;
        activeTool = 'select';
        canvasContainer.style.cursor = 'default';

        recordHistory();
        drawFrame();
        showToast("Polyline created!", "success");
    }

    canvasContainer.addEventListener('dblclick', e => {
        if (isDrawingPolyline) {
            finalizePolyline();
            return;
        }

        // Handle adding a node to an existing polyline
        if (activeTool === 'select' && selectedObjectIds.length === 1) {
            const selectedObject = objects.find(o => o.id === selectedObjectIds[0]);
            if (selectedObject && selectedObject.shape === 'polyline' && !selectedObject.locked) {
                const { x, y } = getCanvasCoordinates(e);

                // This new method will do the hard work.
                const nodeAdded = selectedObject.addNodeAtPoint(x, y);

                if (nodeAdded) {
                    // If a node was added, update the form and record history
                    updateFormValuesFromObjects();
                    recordHistory();
                    drawFrame();
                }
            }
        }
    });

    document.addEventListener('keydown', (e) => {
        if (isDrawingPolyline && (e.key === 'Enter' || e.key === 'Escape')) {
            e.preventDefault();
            finalizePolyline();
            return;
        }

        const target = e.target;
        const isInputFocused = target.tagName === 'INPUT' ||
            target.tagName === 'TEXTAREA' ||
            target.isContentEditable;

        if (e.ctrlKey || e.metaKey) {
            if (e.key.toLowerCase() === 'z') {
                e.preventDefault();
                const state = appHistory.undo();
                applyHistoryState(state);
                return;
            } else if (e.key.toLowerCase() === 'y') {
                e.preventDefault();
                const state = appHistory.redo();
                applyHistoryState(state);
                return;
            } else if (e.key.toLowerCase() === 'c') {
                if (isInputFocused) {
                    return;
                }
                e.preventDefault();
                if (selectedObjectIds.length > 0) {
                    // Trigger the same logic as the copy button click
                    document.getElementById('copy-props-btn').click();
                }
                return;
            } else if (e.key.toLowerCase() === 'v') {
                if (isInputFocused) {
                    return;
                }
                e.preventDefault();
                if (propertyClipboard && selectedObjectIds.length > 0) {
                    // Trigger the same logic as the paste button click
                    document.getElementById('paste-props-btn').click();
                }
                return;
            }
        }

        // Block other application-specific hotkeys if an input is focused.
        if (isInputFocused) {
            return;
        }

        // Handle Escape key to deselect all objects.
        if (e.key === 'Escape' && selectedObjectIds.length > 0) {
            e.preventDefault();
            selectedObjectIds = [];
            updateToolbarState();
            syncPanelsWithSelection();
            drawFrame();
        }

        // Handle keyboard movement for selected objects
        if (selectedObjectIds.length > 0) {
            let moveAmount = 4; // Corresponds to 1 UI pixel
            if (e.shiftKey) {
                moveAmount = 40; // Corresponds to 10 UI pixels
            }

            let moved = false;
            selectedObjectIds.forEach(id => {
                const obj = objects.find(o => o.id === id);
                if (obj && !obj.locked) {
                    let newX = obj.x;
                    let newY = obj.y;

                    switch (e.key) {
                        case 'ArrowUp':
                            newY -= moveAmount;
                            moved = true;
                            break;
                        case 'ArrowDown':
                            newY += moveAmount;
                            moved = true;
                            break;
                        case 'ArrowLeft':
                            newX -= moveAmount;
                            moved = true;
                            break;
                        case 'ArrowRight':
                            newX += moveAmount;
                            moved = true;
                            break;
                    }

                    if (moved) {
                        if (constrainToCanvas) {
                            newX = Math.max(0, Math.min(newX, canvas.width - obj.width));
                            newY = Math.max(0, Math.min(newY, canvas.height - obj.height));
                        }
                        obj.x = newX;
                        obj.y = newY;
                    }
                }
            });

            if (moved) {
                e.preventDefault();
                updateFormValuesFromObjects();
                drawFrame();
                recordHistory();
            }
        }

        // Handle Delete key for selected objects
        if ((e.key === 'Delete') && selectedObjectIds.length > 0) {
            e.preventDefault();
            deleteObjects([...selectedObjectIds]);
        }
    });

    /**
     * Updates the global configStore with the current state of all form controls.
     * This makes the form the single source of truth at the moment of saving.
     */
    function syncConfigStoreWithForm() {
        const formValues = getControlValues();

        configStore.forEach(conf => {
            const key = conf.property || conf.name;
            if (formValues.hasOwnProperty(key)) {
                let valueToSave = formValues[key];
                if (conf.type === 'number') {
                    valueToSave = Number(valueToSave);
                } else if (typeof valueToSave === 'boolean') {
                    valueToSave = String(valueToSave);
                }
                conf.default = valueToSave;
            }
        });
    }

    /**
     * SAVE BUTTON: Checks for duplicates before saving.
     */
    document.getElementById('save-ws-btn').addEventListener('click', async () => {
        const user = window.auth.currentUser;
        if (!user) {
            showToast("You must be logged in to save.", 'danger');
            return;
        }

        syncConfigStoreWithForm();

        const name = getControlValues()['title'] || 'Untitled Effect';
        const trimmedName = name.trim();

        const sanitizedConfigs = configStore.map(conf => {
            const sanitized = {};
            for (const key in conf) {
                if (conf[key] !== undefined) {
                    sanitized[key] = conf[key];
                }
            }
            return sanitized;
        });

        const thumbnail = generateThumbnail(document.getElementById('signalCanvas'));
        const projectData = {
            name: trimmedName,
            thumbnail: thumbnail,
            configs: sanitizedConfigs,
            objects: objects.map(o => ({ id: o.id, name: o.name, locked: o.locked })),
            updatedAt: new Date()
        };

        const q = window.query(window.collection(window.db, "projects"), window.where("userId", "==", user.uid), window.where("name", "==", trimmedName));
        const querySnapshot = await window.getDocs(q);

        if (!querySnapshot.empty) {
            const existingDocId = querySnapshot.docs[0].id;
            showConfirmModal(
                'Confirm Overwrite',
                `A project named "${trimmedName}" already exists. Do you want to overwrite it?`,
                'Overwrite',
                async () => {
                    try {
                        const docRef = window.doc(window.db, "projects", existingDocId);
                        await window.updateDoc(docRef, projectData);
                        currentProjectDocId = existingDocId;
                        updateShareButtonState();
                        showToast(`Project "${trimmedName}" was overwritten successfully!`, 'success');
                    } catch (error) {
                        console.error("Error overwriting document: ", error);
                        showToast("Error overwriting project: " + error.message, 'danger');
                    }
                }
            );
        } else {
            try {
                projectData.userId = user.uid;
                projectData.creatorName = user.displayName || 'Anonymous';
                projectData.isPublic = true;
                projectData.createdAt = new Date();

                const docRef = await window.addDoc(window.collection(window.db, "projects"), projectData);
                currentProjectDocId = docRef.id;
                updateShareButtonState();
                showToast(`Effect "${trimmedName}" was saved successfully!`, 'success');
            } catch (error) {
                console.error("Error saving new document: ", error);
                showToast("Error saving project: " + error.message, 'danger');
            }
        }
    });

    // MY PROJECTS BUTTON
    document.getElementById('load-ws-btn').addEventListener('click', () => {
        const user = window.auth.currentUser;
        if (!user) {
            showToast("You must be logged in to see your projects.", 'danger');
            const galleryOffcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('gallery-offcanvas'));
            galleryOffcanvas.hide();
            return;
        }

        document.getElementById('galleryOffcanvasLabel').textContent = 'My Effects';
        const galleryList = document.getElementById('gallery-project-list');
        galleryList.innerHTML = '<li class="list-group-item text-center"><div class="spinner-border spinner-border-sm"></div></li>';

        if (galleryListener) galleryListener();

        const q = window.query(window.collection(window.db, "projects"), window.where("userId", "==", user.uid));
        galleryListener = window.onSnapshot(q, (querySnapshot) => {
            const projects = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.createdAt && data.createdAt.toDate) data.createdAt = data.createdAt.toDate();
                projects.push({ docId: doc.id, ...data });
            });
            projects.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
            populateGallery(projects);
        }, (error) => {
            console.error("My Projects listener error:", error);
            galleryList.innerHTML = '<li class="list-group-item text-danger">Could not load your projects.</li>';
        });
    });

    /**
     * Handles toolbar button clicks for alignment and matching actions.
     * @param {Event} e - The click event.
     */
    function handleToolbarAction(e) {
        const button = e.target.closest('button');
        if (!button || button.disabled || !button.dataset.action) {
            return;
        }

        const action = button.dataset.action;
        if (selectedObjectIds.length === 0) {
            return;
        }

        const selectedObjects = selectedObjectIds.map(id => objects.find(o => o.id === id)).filter(o => o);
        if (selectedObjects.length === 0) {
            return;
        }
        const anchor = selectedObjects[0];

        switch (action) {
            case 'align-screen-left':
                selectedObjects.forEach(o => o.x = 0);
                break;
            case 'align-screen-right':
                selectedObjects.forEach(o => o.x = canvas.width - o.width);
                break;
            case 'align-screen-h-center':
                selectedObjects.forEach(o => o.x = (canvas.width - o.width) / 2);
                break;
            case 'align-screen-top':
                selectedObjects.forEach(o => o.y = 0);
                break;
            case 'align-screen-bottom':
                selectedObjects.forEach(o => o.y = canvas.height - o.height);
                break;
            case 'align-screen-v-center':
                selectedObjects.forEach(o => o.y = (canvas.height - o.height) / 2);
                break;
            case 'match-width':
                selectedObjects.slice(1).forEach(o => o.width = anchor.width);
                break;
            case 'match-height':
                selectedObjects.slice(1).forEach(o => o.height = anchor.height);
                break;
            case 'match-both':
                selectedObjects.slice(1).forEach(o => {
                    o.width = anchor.width;
                    o.height = anchor.height;
                });
                break;
            case 'fit-canvas':
                selectedObjects.forEach(o => {
                    const oldWidth = o.width;
                    const oldHeight = o.height;

                    // 1. Directly update the object's properties as before.
                    o.x = 0;
                    o.y = 0;
                    o.width = canvas.width;
                    o.height = canvas.height;

                    if (o.shape === 'polyline' && oldWidth > 0 && oldHeight > 0) {
                        const scaleX = o.width / oldWidth;
                        const scaleY = o.height / oldHeight;
                        o.polylineNodes = o.polylineNodes.map(node => ({
                            x: node.x * scaleX,
                            y: node.y * scaleY
                        }));
                        // 2. Manually invalidate the object's internal path cache. This is the critical step.
                        o._cachedPathSegments = null;
                    }

                    if (o.shape === 'text') {
                        o._updateFontSizeFromHeight();
                    }
                });

                // 3. After all objects are updated, sync the form with their new state.
                updateFormValuesFromObjects();
                break;
            case 'match-text-size':
                const textObjects = selectedObjects.filter(obj => obj.shape === 'text');
                const gridObjects = selectedObjects.filter(obj => obj.shape === 'rectangle' && (obj.numberOfRows > 1 || obj.numberOfColumns > 1));
                if (textObjects.length >= 1 && gridObjects.length >= 1) {
                    const sourceGrid = gridObjects[0];
                    const cellHeight = sourceGrid.height / sourceGrid.numberOfRows;
                    textObjects.forEach(textObject => {
                        textObject.fontSize = cellHeight * 10;
                        textObject._updateTextMetrics();
                    });
                } else if (textObjects.length >= 2 && gridObjects.length === 0) {
                    const sourceText = textObjects[0];
                    const sourceFontSize = sourceText.fontSize;
                    textObjects.slice(1).forEach(targetText => {
                        targetText.fontSize = sourceFontSize;
                        targetText._updateTextMetrics();
                    });
                }
                break;
        }

        selectedObjects.forEach(o => {
            o.x = Math.round(o.x);
            o.y = Math.round(o.y);
        });

        updateFormValuesFromObjects();
        recordHistory();
        drawFrame();
    }

    toolbar.addEventListener('click', handleToolbarAction);

    /**
     * Handles the click event for the "Constrain to Canvas" button.
     * Toggles the constrainToCanvas state and updates the button's appearance.
     */
    constrainBtn.addEventListener('click', () => {
        constrainToCanvas = !constrainToCanvas;

        // Remove all possible style classes first to avoid conflicts
        constrainBtn.classList.remove('btn-primary', 'btn-outline-secondary', 'btn-secondary');

        // Add the correct class based on the new state
        if (constrainToCanvas) {
            constrainBtn.classList.add('btn-secondary');
        } else {
            constrainBtn.classList.add('btn-outline-secondary');
        }
    });

    /**
     * Handles the mousedown event on the canvas to initiate dragging or resizing.
     * @param {MouseEvent} e - The mousedown event object.
     */
    canvasContainer.addEventListener('mousedown', e => {
        if (activeTool === 'polyline') {
            e.preventDefault();
            const { x, y } = getCanvasCoordinates(e);

            if (!isDrawingPolyline) {
                // First click: Create the shape and start the preview
                isDrawingPolyline = true;
                const newId = objects.length > 0 ? (Math.max(...objects.map(o => o.id))) + 1 : 1;
                currentlyDrawingShapeId = newId;

                const newShape = new Shape({
                    id: newId, shape: 'polyline', name: `Polyline ${newId}`,
                    x: x, y: y, width: 1, height: 1,
                    polylineNodes: [{ x: 0, y: 0 }],
                    ctx: ctx, enableStroke: true, strokeWidth: 4
                });
                objects.unshift(newShape);

                const newObjectConfigs = getDefaultObjectConfig(newId).filter(conf => {
                    const propName = conf.property.substring(conf.property.indexOf('_') + 1);
                    // Explicitly include strokeGradientStops as it's essential for new polylines
                    if (propName === 'strokeGradientStops') return true;
                    return (shapePropertyMap['polyline'] || []).includes(propName);
                });

                // Manually override the defaults for the new configs to match the instantiated shape
                const enableStrokeConf = newObjectConfigs.find(c => c.property === `obj${newId}_enableStroke`);
                if (enableStrokeConf) {
                    enableStrokeConf.default = 'true';
                }
                const strokeWidthConf = newObjectConfigs.find(c => c.property === `obj${newId}_strokeWidth`);
                if (strokeWidthConf) {
                    strokeWidthConf.default = '4';
                }

                const firstObjectConfigIndex = configStore.findIndex(c => (c.property || '').startsWith('obj'));
                if (firstObjectConfigIndex === -1) { configStore.push(...newObjectConfigs); }
                else { configStore.splice(firstObjectConfigIndex, 0, ...newObjectConfigs); }

                selectedObjectIds = [newId];
                renderForm();
                updateFormValuesFromObjects();

                // Correctly start the preview line FROM and TO the first click location
                previewLine.startX = x;
                previewLine.startY = y;
                previewLine.endX = x;
                previewLine.endY = y;
                previewLine.active = true;

            } else {
                // Subsequent clicks: Add a new node
                const shape = objects.find(o => o.id === currentlyDrawingShapeId);
                if (!shape) return;

                const center = shape.getCenter();
                const angle = -shape.getRenderAngle();
                const localClickX = (x - center.x) * Math.cos(angle) - (y - center.y) * Math.sin(angle);
                const localClickY = (x - center.x) * Math.sin(angle) + (y - center.y) * Math.cos(angle);
                const nodeX = localClickX + shape.width / 2;
                const nodeY = localClickY + shape.height / 2;

                const newNodes = [...shape.polylineNodes, { x: nodeX, y: nodeY }];
                shape.update({ polylineNodes: newNodes });

                updateFormValuesFromObjects();

                // Update the preview line's start to this new point
                previewLine.startX = x;
                previewLine.startY = y;
            }
            drawFrame();
            return;
        }

        e.preventDefault();
        const { x, y } = getCanvasCoordinates(e);
        dragStartX = x;
        dragStartY = y;

        let activeObject = null;
        if (selectedObjectIds.length === 1) {
            activeObject = objects.find(o => o.id === selectedObjectIds[0]);
        }

        if (activeObject && !activeObject.locked) {
            const handle = activeObject.getHandleAtPoint(x, y);
            if (handle) {
                // NEW: Handle Alt+Click to delete a node
                if (e.altKey && handle.type === 'node') {
                    const nodeDeleted = activeObject.deleteNode(handle.index);
                    if (nodeDeleted) {
                        updateFormValuesFromObjects();
                        recordHistory();
                        drawFrame();
                    }
                    return; // Stop further processing
                }

                if (handle.type === 'rotation') {
                    isRotating = true;
                    activeObject.isBeingManuallyRotated = true;
                    if (activeObject.rotationSpeed !== 0) {
                        activeObject._pausedRotationSpeed = activeObject.rotationSpeed;
                        activeObject.rotationSpeed = 0;
                        activeObject.rotation = activeObject.rotationAngle * 180 / Math.PI;
                    }
                    const center = activeObject.getCenter();
                    const startAngle = Math.atan2(y - center.y, x - center.x);
                    initialDragState = [{
                        id: activeObject.id,
                        startAngle: startAngle,
                        initialObjectAngle: activeObject.getRenderAngle()
                    }];
                } else if (handle.type === 'node') {
                    isDraggingNode = true;
                    activeNodeDragState = {
                        id: activeObject.id,
                        nodeIndex: handle.index
                    };
                } else {
                    isResizing = true;
                    activeResizeHandle = handle.name;
                    const oppositeHandleName = getOppositeHandle(handle.name);
                    const anchorPoint = activeObject.getWorldCoordsOfCorner(oppositeHandleName);
                    initialDragState = [{
                        id: activeObject.id, initialX: activeObject.x, initialY: activeObject.y,
                        initialWidth: activeObject.width, initialHeight: activeObject.height,
                        anchorPoint: anchorPoint,
                        diameterRatio: activeObject.shape === 'ring' ? activeObject.innerDiameter / activeObject.width : 1
                    }];
                }
            }
        }

        if (!isRotating && !isResizing && !isDraggingNode) {
            const hitObject = objects.find(obj => obj.isPointInside(x, y));
            if (hitObject) {
                const isNewlySelected = !selectedObjectIds.includes(hitObject.id);

                if (!selectedObjectIds.includes(hitObject.id)) {
                    if (e.shiftKey || e.ctrlKey || e.metaKey) {
                        selectedObjectIds.push(hitObject.id);
                    } else {
                        selectedObjectIds = [hitObject.id];
                    }
                }

                updateToolbarState();
                syncPanelsWithSelection();
                drawFrame();

                // If a single object was newly selected, scroll its panel into view.
                if (isNewlySelected && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
                    const fieldset = form.querySelector(`fieldset[data-object-id="${hitObject.id}"]`);
                    if (fieldset) {
                        // A short delay allows the collapse animation to start before scrolling.
                        setTimeout(() => {
                            fieldset.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                        }, 200);
                    }
                }

                if (!hitObject.locked) {
                    isDragging = true;
                    initialDragState = selectedObjectIds.map(id => {
                        const obj = objects.find(o => o.id === id);
                        return { id, x: obj.x, y: obj.y };
                    });
                }
            } else {
                selectedObjectIds = [];
                updateToolbarState();
                syncPanelsWithSelection();
                drawFrame();
            }
        }

        const handleMouseMove = (moveEvent) => {
            moveEvent.preventDefault();
            const { x, y } = getCanvasCoordinates(moveEvent);
            if (isRotating) {
                const initial = initialDragState[0];
                const obj = objects.find(o => o.id === initial.id);
                if (obj) {
                    const center = obj.getCenter();
                    const currentAngle = Math.atan2(y - center.y, x - center.x);
                    const angleDelta = currentAngle - initial.startAngle;
                    obj.rotation = (initial.initialObjectAngle + angleDelta) * 180 / Math.PI;
                    drawFrame();
                }
            }
        };

        const handleMouseUp = (upEvent) => {
            upEvent.preventDefault();
            window.removeEventListener('mousemove', handleMouseMove);

            const wasManipulating = isDragging || isResizing || isRotating || isDraggingNode;
            if (isRotating) {
                const obj = objects.find(o => o.id === initialDragState[0].id);
                if (obj) {
                    obj.isBeingManuallyRotated = false;
                    if (obj._pausedRotationSpeed !== null) {
                        obj.rotationSpeed = obj._pausedRotationSpeed;
                        obj.rotationAngle = obj.rotation * Math.PI / 180;
                        obj._pausedRotationSpeed = null;
                    }
                }
            }

            if (wasManipulating) {
                objects.forEach(obj => {
                    if (selectedObjectIds.includes(obj.id)) {
                        obj.x = Math.round(obj.x);
                        obj.y = Math.round(obj.y);
                        obj.width = Math.round(obj.width);
                        obj.height = Math.round(obj.height);
                        if (obj.innerDiameter) obj.innerDiameter = Math.round(obj.innerDiameter);
                        if (obj.fontSize) obj.fontSize = Math.round(obj.fontSize);
                        obj.rotation = Math.round(obj.rotation);

                        // --- START OF FIX ---
                        // Call the object's update method to save its new rotation
                        // as the "base" rotation for the audio reactivity system.
                        obj.update({ rotation: obj.rotation });
                        // --- END OF FIX ---
                    }
                });
                updateFormValuesFromObjects();
                recordHistory();
            }

            isDragging = isResizing = isRotating = isDraggingNode = false;
            activeResizeHandle = null;
            activeNodeDragState = null;
            initialDragState = [];
            snapLines = [];
            cachedSnapTargets = null;
            drawFrame();
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp, { once: true });
    });


    const debouncedUpdateForm = debounce(updateFormValuesFromObjects, 10);

    /**
     * Handles mouse movement over the canvas for dragging, resizing, and cursor updates.
     * @param {MouseEvent} e - The mousemove event object.
     */
    canvasContainer.addEventListener('mousemove', e => {
        // This part only updates the state. The 'animate' loop handles the redraw.
        if (isDrawingPolyline && previewLine.active) {
            const { x, y } = getCanvasCoordinates(e);
            previewLine.endX = x;
            previewLine.endY = y;
            // NOTE: We do NOT call drawFrame() here. We just update the state.
            return;
        }

        // --- This is the original logic for dragging, resizing, and showing coordinates ---
        if (coordsDisplay) {
            const { x, y } = getCanvasCoordinates(e);
            coordsDisplay.textContent = `${Math.round(x / 4)}, ${Math.round(y / 4)}: (${Math.round(x)}, ${Math.round(y)})`;
        }

        e.preventDefault();
        const { x, y } = getCanvasCoordinates(e);

        if (isDraggingNode) {
            const { id, nodeIndex } = activeNodeDragState;
            const shape = objects.find(o => o.id === id);
            if (!shape) return;

            const center = shape.getCenter();
            const staticAngle = -shape.getRenderAngle();
            const s = Math.sin(staticAngle);
            const c = Math.cos(staticAngle);
            const dx = x - center.x;
            const dy = y - center.y;
            const localX = dx * c - dy * s;
            const localY = dx * s + dy * c;

            let nodes = (typeof shape.polylineNodes === 'string') ? JSON.parse(shape.polylineNodes) : shape.polylineNodes;

            nodes[nodeIndex].x = localX + shape.width / 2;
            nodes[nodeIndex].y = localY + shape.height / 2;

            shape.update({ polylineNodes: nodes });

            updateFormValuesFromObjects();
            drawFrame();
            return;
        }

        if (!isDragging && !isResizing && !isRotating && e.buttons === 1 && initialDragState.length > 0) {
            const dx = x - dragStartX;
            const dy = y - dragStartY;
            if (Math.sqrt(dx * dx + dy * dy) > 5) {
                isDragging = true;
                const hitObject = [...objects].reverse().find(obj => obj.isPointInside(dragStartX, dragStartY));
                if (hitObject && !selectedObjectIds.includes(hitObject.id)) {
                    if (!e.shiftKey && !e.ctrlKey && !e.metaKey) {
                        selectedObjectIds = [hitObject.id];
                        updateToolbarState();
                        syncPanelsWithSelection();
                    }
                }
            }
        }

        if (isRotating) {
            const initial = initialDragState[0];
            const obj = objects.find(o => o.id === initial.id);
            if (obj) {
                const center = obj.getCenter();
                const currentAngle = Math.atan2(y - center.y, x - center.x);
                const angleDelta = currentAngle - initial.startAngle;

                // Use obj.update to correctly apply the new rotation and trigger a redraw.
                obj.update({ rotation: (initial.initialObjectAngle + angleDelta) * 180 / Math.PI });
            }
            // This is a necessary flag to ensure the animation loop knows to pause auto-rotation.
            objects.forEach(o => {
                if (o.id === initialDragState[0].id) {
                    o.isBeingManuallyRotated = true;
                }
            });
            debouncedUpdateForm();
            needsRedraw = true;

        } else if (isResizing) {
            snapLines = [];
            const SNAP_THRESHOLD = 10;
            const initial = initialDragState[0];
            let mouseX = x;
            let mouseY = y;
            snapLines = [];

            if (!cachedSnapTargets) {
                cachedSnapTargets = [];
                const otherObjects = objects.filter(o => !selectedObjectIds.includes(o.id));
                otherObjects.forEach(otherObj => cachedSnapTargets.push(...getWorldPoints(otherObj)));
                cachedSnapTargets.push(
                    { x: canvas.width / 2, y: canvas.height / 2, type: 'center' }, { x: canvas.width / 2, y: 0, type: 'edge' }, { x: canvas.width / 2, y: canvas.height, type: 'edge' }, { x: 0, y: canvas.height / 2, type: 'edge' }, { x: canvas.width, y: canvas.height / 2, type: 'edge' }
                );
            }

            const unSnappedState = (() => {
                const tempObj = new Shape({ ...objects.find(o => o.id === initial.id) });
                const anchorPoint = initial.anchorPoint;
                const resizeAngle = tempObj.rotation * Math.PI / 180;
                const isSideHandle = activeResizeHandle === 'top' || activeResizeHandle === 'bottom' || activeResizeHandle === 'left' || activeResizeHandle === 'right';
                if (isSideHandle) {
                    const dragVecX = x - dragStartX;
                    const dragVecY = y - dragStartY;
                    const s = Math.sin(resizeAngle);
                    const c = Math.cos(resizeAngle);
                    let newWidth = initial.initialWidth;
                    let newHeight = initial.initialHeight;
                    let centerShiftX = 0, centerShiftY = 0;
                    if (activeResizeHandle === 'right' || activeResizeHandle === 'left') {
                        const change = dragVecX * c + dragVecY * s;
                        newWidth += activeResizeHandle === 'left' ? -change : change;
                        centerShiftX = (change / 2) * c;
                        centerShiftY = (change / 2) * s;
                    } else {
                        const change = -dragVecX * s + dragVecY * c;
                        newHeight += activeResizeHandle === 'top' ? -change : change;
                        centerShiftX = (change / 2) * -s;
                        centerShiftY = (change / 2) * c;
                    }
                    const initialCenter = { x: initial.initialX + initial.initialWidth / 2, y: initial.initialY + initial.initialHeight / 2 };
                    const newCenterX = initialCenter.x + centerShiftX;
                    const newCenterY = initialCenter.y + centerShiftY;
                    tempObj.width = newWidth;
                    tempObj.height = newHeight;
                    tempObj.x = newCenterX - tempObj.width / 2;
                    tempObj.y = newCenterY - tempObj.height / 2;
                } else {
                    const worldVecX = x - anchorPoint.x;
                    const worldVecY = y - anchorPoint.y;
                    const localVecX = worldVecX * Math.cos(-resizeAngle) - worldVecY * Math.sin(-resizeAngle);
                    const localVecY = worldVecX * Math.sin(-resizeAngle) + worldVecY * Math.cos(-resizeAngle);
                    const handleXSign = activeResizeHandle.includes('left') ? -1 : 1;
                    const handleYSign = activeResizeHandle.includes('top') ? -1 : 1;
                    tempObj.width = localVecX * handleXSign;
                    tempObj.height = localVecY * handleYSign;
                    const worldSizingVecX = (tempObj.width * handleXSign) * Math.cos(resizeAngle) - (tempObj.height * handleYSign) * Math.sin(resizeAngle);
                    const worldSizingVecY = (tempObj.width * handleXSign) * Math.sin(resizeAngle) + (tempObj.height * handleYSign) * Math.cos(resizeAngle);
                    const newCenterX = anchorPoint.x + worldSizingVecX / 2;
                    const newCenterY = anchorPoint.y + worldSizingVecY / 2;
                    tempObj.x = newCenterX - tempObj.width / 2;
                    tempObj.y = newCenterY - tempObj.height / 2;
                }
                return tempObj;
            })();

            const ghostPoints = getWorldPoints(unSnappedState);
            let pointsToSnap;
            const isHorizontalOnly = activeResizeHandle === 'left' || activeResizeHandle === 'right';
            const isVerticalOnly = activeResizeHandle === 'top' || activeResizeHandle === 'bottom';

            if (isHorizontalOnly) {
                pointsToSnap = ghostPoints.filter(p => p.handle && p.handle.includes(activeResizeHandle));
            } else if (isVerticalOnly) {
                pointsToSnap = ghostPoints.filter(p => p.handle && p.handle.includes(activeResizeHandle));
            } else {
                pointsToSnap = ghostPoints;
            }

            const hSnaps = [], vSnaps = [];

            pointsToSnap.forEach(point => {
                cachedSnapTargets.forEach(target => {
                    if (point.type === target.type) {
                        if (Math.abs(point.x - target.x) < SNAP_THRESHOLD) hSnaps.push({ dist: Math.abs(point.x - target.x), adj: target.x - point.x, line: target.x });
                        if (Math.abs(point.y - target.y) < SNAP_THRESHOLD) vSnaps.push({ dist: Math.abs(point.y - target.y), adj: target.y - point.y, line: target.y });
                    }
                });
            });

            if (!isVerticalOnly && hSnaps.length > 0) {
                hSnaps.sort((a, b) => a.dist - b.dist);
                mouseX += hSnaps[0].adj;
                snapLines.push({ type: 'vertical', x: hSnaps[0].line, duration: 2 });
            }
            if (!isHorizontalOnly && vSnaps.length > 0) {
                vSnaps.sort((a, b) => a.dist - b.dist);
                mouseY += vSnaps[0].adj;
                snapLines.push({ type: 'horizontal', y: vSnaps[0].line, duration: 2 });
            }

            const obj = objects.find(o => o.id === initial.id);
            if (obj) {
                const finalState = (() => {
                    const tempObj = new Shape({ ...objects.find(o => o.id === initial.id) });
                    const anchorPoint = initial.anchorPoint;
                    const resizeAngle = tempObj.rotation * Math.PI / 180;
                    const isSideHandle = activeResizeHandle === 'top' || activeResizeHandle === 'bottom' || activeResizeHandle === 'left' || activeResizeHandle === 'right';
                    if (isSideHandle) {
                        const dragVecX = mouseX - dragStartX;
                        const dragVecY = mouseY - dragStartY;
                        const s = Math.sin(resizeAngle);
                        const c = Math.cos(resizeAngle);
                        let newWidth = initial.initialWidth;
                        let newHeight = initial.initialHeight;
                        let centerShiftX = 0, centerShiftY = 0;
                        if (activeResizeHandle === 'right' || activeResizeHandle === 'left') {
                            const change = dragVecX * c + dragVecY * s;
                            newWidth += activeResizeHandle === 'left' ? -change : change;
                            centerShiftX = (change / 2) * c;
                            centerShiftY = (change / 2) * s;
                        } else {
                            const change = -dragVecX * s + dragVecY * c;
                            newHeight += activeResizeHandle === 'top' ? -change : change;
                            centerShiftX = (change / 2) * -s;
                            centerShiftY = (change / 2) * c;
                        }
                        const initialCenter = { x: initial.initialX + initial.initialWidth / 2, y: initial.initialY + initial.initialHeight / 2 };
                        const newCenterX = initialCenter.x + centerShiftX;
                        const newCenterY = initialCenter.y + centerShiftY;
                        tempObj.width = newWidth;
                        tempObj.height = newHeight;
                        tempObj.x = newCenterX - tempObj.width / 2;
                        tempObj.y = newCenterY - tempObj.height / 2;
                    } else {
                        const worldVecX = mouseX - anchorPoint.x;
                        const worldVecY = mouseY - anchorPoint.y;
                        const localVecX = worldVecX * Math.cos(-resizeAngle) - worldVecY * Math.sin(-resizeAngle);
                        const localVecY = worldVecX * Math.sin(-resizeAngle) + worldVecY * Math.cos(-resizeAngle);
                        const handleXSign = activeResizeHandle.includes('left') ? -1 : 1;
                        const handleYSign = activeResizeHandle.includes('top') ? -1 : 1;
                        tempObj.width = localVecX * handleXSign;
                        tempObj.height = localVecY * handleYSign;
                        const worldSizingVecX = (tempObj.width * handleXSign) * Math.cos(resizeAngle) - (tempObj.height * handleYSign) * Math.sin(resizeAngle);
                        const worldSizingVecY = (tempObj.width * handleXSign) * Math.sin(resizeAngle) + (tempObj.height * handleYSign) * Math.cos(resizeAngle);
                        const newCenterX = anchorPoint.x + worldSizingVecX / 2;
                        const newCenterY = anchorPoint.y + worldSizingVecY / 2;
                        tempObj.x = newCenterX - tempObj.width / 2;
                        tempObj.y = newCenterY - tempObj.height / 2;
                    }
                    return tempObj;
                })();

                obj.update({
                    x: Math.round(finalState.x),
                    y: Math.round(finalState.y),
                    width: Math.round(Math.max(10, finalState.width)),
                    height: Math.round(Math.max(10, finalState.height)),
                    innerDiameter: obj.shape === 'ring' ? Math.round(obj.width * initial.diameterRatio) : undefined
                });

                debouncedUpdateForm();
                needsRedraw = true;
            }
        } else if (isDragging) {
            snapLines = [];
            const dx = x - dragStartX;
            const dy = y - dragStartY;
            const SNAP_THRESHOLD = 10;
            let finalDx = dx;
            let finalDy = dy;

            if (!cachedSnapTargets) {
                cachedSnapTargets = [];
                const otherObjects = objects.filter(o => !selectedObjectIds.includes(o.id));
                otherObjects.forEach(otherObj => {
                    cachedSnapTargets.push(...getWorldPoints(otherObj));
                });
                cachedSnapTargets.push(
                    { x: canvas.width / 2, y: canvas.height / 2, type: 'center' },
                    { x: canvas.width / 2, y: 0, type: 'edge' },
                    { x: canvas.width / 2, y: canvas.height, type: 'edge' },
                    { x: 0, y: canvas.height / 2, type: 'edge' },
                    { x: canvas.width, y: canvas.height / 2, type: 'edge' }
                );
            }

            const hSnaps = [], vSnaps = [];

            initialDragState.forEach(state => {
                const obj = objects.find(o => o.id === state.id);
                if (obj) {
                    const originalX = obj.x;
                    const originalY = obj.y;
                    obj.x = state.x + dx;
                    obj.y = state.y + dy;
                    const selectedPoints = getWorldPoints(obj);
                    selectedPoints.forEach(point => {
                        cachedSnapTargets.forEach(target => {
                            if (point.type === target.type) {
                                if (Math.abs(point.x - target.x) < SNAP_THRESHOLD) hSnaps.push({ dist: Math.abs(point.x - target.x), adj: target.x - point.x, line: target.x, snapType: point.type });
                                if (Math.abs(point.y - target.y) < SNAP_THRESHOLD) vSnaps.push({ dist: Math.abs(point.y - target.y), adj: target.y - point.y, line: target.y, snapType: point.type });
                            }
                        });
                    });
                    obj.x = originalX;
                    obj.y = originalY;
                }
            });

            if (hSnaps.length > 0) {
                hSnaps.sort((a, b) => a.dist - b.dist);
                finalDx += hSnaps[0].adj;
                snapLines.push({ type: 'vertical', x: hSnaps[0].line, duration: 2, snapType: hSnaps[0].snapType });
            }
            if (vSnaps.length > 0) {
                vSnaps.sort((a, b) => a.dist - b.dist);
                finalDy += vSnaps[0].adj;
                snapLines.push({ type: 'horizontal', y: vSnaps[0].line, duration: 2, snapType: vSnaps[0].snapType });
            }

            initialDragState.forEach(state => {
                const obj = objects.find(o => o.id === state.id);
                if (obj) {
                    let newX = state.x + finalDx;
                    let newY = state.y + finalDy;
                    if (constrainToCanvas) {
                        const tempObj = new Shape({ ...obj, x: newX, y: newY });
                        const { minX, minY, maxX, maxY } = getBoundingBox(tempObj);
                        if (minX < 0) newX -= minX;
                        if (maxX > canvas.width) newX -= (maxX - canvas.width);
                        if (minY < 0) newY -= minY;
                        if (maxY > canvas.height) newY -= (maxY - canvas.height);
                    }
                    obj.x = newX;
                    obj.y = newY;
                }
            });
            debouncedUpdateForm();
            needsRedraw = true;
        } else {
            let cursor = 'default';
            const topObject = [...objects].reverse().find(obj => obj.isPointInside(x, y));
            if (topObject) {
                cursor = 'pointer';
                if (selectedObjectIds.includes(topObject.id)) {
                    const handle = topObject.getHandleAtPoint(x, y);
                    if (handle) {
                        cursor = handle.cursor;
                    } else if (!topObject.locked) {
                        cursor = 'move';
                    }
                }
            }
            canvasContainer.style.cursor = cursor;
        }
    });

    /**
     * The main initialization function for the application.
     * It sets up the initial configuration, creates objects, renders the form,
     * initializes tooltips, starts the animation loop, and sets up the resizable panels.
     */
    async function init() {
        handleURLParameters();
        const constrainBtn = document.getElementById('constrain-btn');
        constrainBtn.classList.remove('btn-secondary', 'btn-outline-secondary');
        if (constrainToCanvas) {
            constrainBtn.classList.add('btn-secondary');
        } else {
            constrainBtn.classList.add('btn-outline-secondary');
        }

        const effectLoaded = await loadSharedEffect();

        if (!effectLoaded) {
            // Attempt to load a single featured effect if no shared effect was loaded.
            const featuredEffectLoaded = await loadFeaturedEffect();

            if (!featuredEffectLoaded) {
                // Fall back to the default template if neither a shared nor a featured effect was found.
                const parser = new DOMParser();
                const doc = parser.parseFromString(INITIAL_CONFIG_TEMPLATE, 'text/html');
                const metaElements = Array.from(doc.querySelectorAll('meta'));

                configStore = metaElements.map(parseMetaToConfig);
                createInitialObjects();
                renderForm();
                generateOutputScript(); // Generate script after setup
            }
        }

        // updateObjectsFromForm();
        updateToolbarState();

        fpsInterval = 1000 / fps;
        then = window.performance.now();
        requestAnimationFrame(animate);

        const savedVSizes = getCookie('split-v-sizes');
        const initialVSizes = savedVSizes ? JSON.parse(savedVSizes) : [30, 70];

        lastVSizes = initialVSizes;

        horizontalSplit = Split(['#left-panel', '#right-panel'], {
            sizes: initialVSizes,
            minSize: [400, 500],
            gutterSize: 12,
            gutter: (index, direction) => {
                const gutter = document.createElement('div');
                gutter.className = `gutter gutter-${direction}`;
                const icon = document.createElement('i');
                icon.className = 'bi bi-three-dots-vertical';
                gutter.appendChild(icon);
                return gutter;
            },
            onDragEnd: function (sizes) {
                setCookie('split-v-sizes', JSON.stringify(sizes), 365);
                lastVSizes = sizes;
                // On manual resize, update the target pixel width
                const leftPanel = document.getElementById('left-panel');
                if (leftPanel) {
                    leftPanelPixelWidth = leftPanel.offsetWidth;
                }
            }
        });

        const mainSplitEl = document.getElementById('main-split');

        // This new function handles the logic for fixing the panel width
        function fixLeftPanelWidth() {
            if (!horizontalSplit || leftPanelPixelWidth <= 0 || !mainSplitEl) return;

            const totalWidth = mainSplitEl.offsetWidth;
            if (totalWidth === 0) return;

            // Calculate the percentage the left panel *should* be to maintain its pixel width
            const newLeftPercentage = (leftPanelPixelWidth / totalWidth) * 100;
            horizontalSplit.setSizes([newLeftPercentage, 100 - newLeftPercentage]);
        }

        // Set the initial pixel width shortly after page load
        setTimeout(() => {
            const leftPanel = document.getElementById('left-panel');
            if (leftPanel) {
                leftPanelPixelWidth = leftPanel.offsetWidth;
            }
        }, 200);

        const lastUpdatedSpan = document.getElementById('last-updated-span');
        if (lastUpdatedSpan) {
            const now = new Date();
            const formattedDate = now.toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            });
            const formattedTime = now.toLocaleTimeString('en-US', {
                hour: 'numeric', minute: '2-digit', timeZoneName: 'short'
            });
            lastUpdatedSpan.textContent = `Current as of: ${formattedDate}, ${formattedTime}`;
        }

        fixLeftPanelWidth();
        initializeSortable();
        recordHistory();
        updateUndoRedoButtons();
        baselineStateForURL = getControlValues();
        initializeTooltips();
    }

    // --- SHARE BUTTON LOGIC ---
    document.getElementById('share-btn').addEventListener('click', async () => {
        const user = window.auth.currentUser;
        syncConfigStoreWithForm();
        const thumbnail = generateThumbnail(document.getElementById('signalCanvas'));
        const name = getControlValues()['title'] || 'My Shared Effect';

        const shareableData = {
            userId: user ? user.uid : 'anonymous',
            creatorName: user ? (user.displayName || 'Anonymous') : 'Anonymous',
            isPublic: true,
            createdAt: new Date(),
            name: name,
            thumbnail: thumbnail, // Add the thumbnail data
            configs: configStore,
            objects: objects.map(o => ({ id: o.id, name: o.name, locked: o.locked }))
        };

        try {
            const docRef = await window.addDoc(window.collection(window.db, "projects"), shareableData);
            const shareUrl = `${window.location.origin}${window.location.pathname}?effectId=${docRef.id}`;
            navigator.clipboard.writeText(shareUrl)
                .then(() => showToast("Share link copied to clipboard!", 'success'))
                .catch(() => prompt("Copy this link:", shareUrl));
        } catch (error) {
            console.error("Error creating share link: ", error);
            showToast("Could not create share link.", 'danger');
        }
    });

    if (galleryOffcanvasEl) {
        galleryOffcanvasEl.addEventListener('hidden.bs.offcanvas', () => {
            if (galleryListener) {
                // console.log("Detaching gallery listener.");
                galleryListener(); // This is the unsubscribe function
                galleryListener = null;
            }
        });
    }

    // BROWSE GALLERY BUTTON
    document.getElementById('browse-btn').addEventListener('click', async () => {
        document.getElementById('galleryOffcanvasLabel').textContent = 'Community Gallery';
        const galleryList = document.getElementById('gallery-project-list');
        galleryList.innerHTML = '<li class="list-group-item text-center"><div class="spinner-border spinner-border-sm"></div></li>';

        const q = window.query(window.collection(window.db, "projects"), window.where("isPublic", "==", true), window.orderBy("createdAt", "desc"));

        try {
            const querySnapshot = await window.getDocs(q);
            const projects = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.createdAt && data.createdAt.toDate) data.createdAt = data.createdAt.toDate();
                projects.push({ docId: doc.id, ...data });
            });
            populateGallery(projects);
        } catch (error) {
            console.error("Error loading public gallery:", error);
            galleryList.innerHTML = '<li class="list-group-item text-danger">Could not load effects.</li>';
        }
    });

    // --- LOAD FROM SHARE LINK LOGIC ---
    // This function runs automatically when the page loads.
    async function loadSharedEffect() {
        const params = new URLSearchParams(window.location.search);
        const effectId = params.get('effectId');

        if (effectId) {
            try {
                const effectDocRef = window.doc(window.db, "projects", effectId);
                const effectDoc = await window.getDoc(effectDocRef);

                if (effectDoc.exists()) {
                    const projectData = { docId: effectDoc.id, ...effectDoc.data() };
                    if (projectData.isPublic) {
                        loadWorkspace(projectData);
                        showToast("Shared effect loaded!", 'success');
                        return true;
                    } else {
                        showToast("This effect is not public.", 'danger');
                    }
                } else {
                    showToast("Shared effect not found.", 'danger');
                }
            } catch (error) {
                console.error("Error loading shared effect:", error);
                showToast("Could not load the shared effect.", 'danger');
            }
        }

        // If no effectId was in the URL or the loading failed, return false.
        // This removes the "featured effect" fallback and forces the app to use the default config.
        return false;
    }

    // MY PROJECTS BUTTON
    document.getElementById('load-ws-btn').addEventListener('click', async () => {
        const user = window.auth.currentUser;
        if (!user) {
            showToast("You must be logged in to see your projects.", 'danger');
            const galleryOffcanvas = bootstrap.Offcanvas.getInstance(galleryOffcanvasEl);
            if (galleryOffcanvas) galleryOffcanvas.hide();
            return;
        }

        document.getElementById('galleryOffcanvasLabel').textContent = 'My Effects';
        const galleryList = document.getElementById('gallery-project-list');
        galleryList.innerHTML = '<li class="list-group-item text-center"><div class="spinner-border spinner-border-sm"></div></li>';

        const q = window.query(window.collection(window.db, "projects"), window.where("userId", "==", user.uid), window.orderBy("createdAt", "desc"));

        try {
            const querySnapshot = await window.getDocs(q);
            const projects = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.createdAt && data.createdAt.toDate) data.createdAt = data.createdAt.toDate();
                projects.push({ docId: doc.id, ...data });
            });
            populateGallery(projects);
        } catch (error) {
            console.error("Error loading user projects:", error);
            galleryList.innerHTML = '<li class="list-group-item text-danger">Could not load your projects.</li>';
        }
    });

    // Add scroll listener for lazy loading
    galleryBody.addEventListener('scroll', () => {
        if (isLoadingMore) return;
        const { scrollTop, scrollHeight, clientHeight } = galleryBody;
        if (scrollHeight - scrollTop - clientHeight < 100) { // Load when 100px from bottom
            loadMoreProjects();
        }
    });

    // Clean up listener when offcanvas is closed
    galleryOffcanvasEl.addEventListener('hidden.bs.offcanvas', () => {
        if (galleryListener) {
            galleryListener();
            galleryListener = null;
        }
        lastVisibleDoc = null; // Reset for next time
    });

    /**
     * Displays a prominent toast notification in the bottom-right corner.
     * @param {string} message - The message to display.
     * @param {string} [type='info'] - The type of toast ('success', 'danger', 'info').
     */
    function showToast(message, type = 'info') {
        const toastEl = document.getElementById('app-toast');
        if (!toastEl) {
            console.error('Toast element #app-toast not found in HTML!');
            return;
        }
        const toastHeader = document.getElementById('app-toast-header');
        const toastTitle = document.getElementById('app-toast-title');
        const toastBody = document.getElementById('app-toast-body');
        const toastIcon = document.getElementById('app-toast-icon');

        toastBody.innerHTML = message.replace(/\n/g, '<br>');

        toastHeader.classList.remove('bg-success', 'bg-danger', 'bg-primary');
        toastIcon.className = 'bi me-2';

        switch (type) {
            case 'success':
                toastHeader.classList.add('bg-success');
                toastTitle.textContent = 'Success';
                toastIcon.classList.add('bi-check-circle-fill');
                break;
            case 'danger':
                toastHeader.classList.add('bg-danger');
                toastTitle.textContent = 'Error';
                toastIcon.classList.add('bi-exclamation-triangle-fill');
                break;
            default: // 'info'
                toastHeader.classList.add('bg-primary');
                toastTitle.textContent = 'Notification';
                toastIcon.classList.add('bi-info-circle-fill');
                break;
        }

        // Use Bootstrap's recommended 'getOrCreateInstance' method, which is more robust.
        const toast = bootstrap.Toast.getOrCreateInstance(toastEl);
        toast.show();
    }

    /**
     * Generates a small data URL thumbnail from the main canvas, ensuring no selection UI is visible.
     * @param {HTMLCanvasElement} sourceCanvas - The main canvas to capture.
     * @returns {string} A dataURL string of the thumbnail.
     */
    function generateThumbnail(sourceCanvas, width = 200) {
        // Temporarily store the current selection
        const originalSelection = [...selectedObjectIds];

        // Deselect all objects to hide the selection UI
        selectedObjectIds = [];
        drawFrame(); // Redraw the canvas without selection boxes

        const thumbnailCanvas = document.createElement('canvas');
        const thumbWidth = width;
        const thumbHeight = (sourceCanvas.height / sourceCanvas.width) * thumbWidth;
        thumbnailCanvas.width = thumbWidth;
        thumbnailCanvas.height = thumbHeight;
        const thumbCtx = thumbnailCanvas.getContext('2d');

        // Draw the clean main canvas onto the smaller thumbnail canvas
        thumbCtx.drawImage(sourceCanvas, 0, 0, thumbWidth, thumbHeight);
        const dataUrl = thumbnailCanvas.toDataURL('image/jpeg', 0.7);

        // Restore the original selection and redraw the canvas for the user
        selectedObjectIds = originalSelection;
        drawFrame();

        return dataUrl;
    }

    /**
     * Shows a generic confirmation modal and sets up a callback for the confirm button.
     * @param {string} title - The title for the modal header.
     * @param {string} body - The message for the modal body.
     * @param {string} buttonText - The text for the confirmation button (e.g., "Delete").
     * @param {function} onConfirm - The function to execute when the confirm button is clicked.
     */
    function showConfirmModal(title, body, buttonText, onConfirm) {
        const confirmModalEl = document.getElementById('confirm-overwrite-modal');
        const confirmModalInstance = bootstrap.Modal.getInstance(confirmModalEl) || new bootstrap.Modal(confirmModalEl);
        const confirmModalTitle = document.getElementById('confirmOverwriteModalLabel');
        const confirmModalBody = document.getElementById('confirm-overwrite-modal-body');
        const confirmBtn = document.getElementById('confirm-overwrite-btn');

        confirmModalTitle.textContent = title;
        confirmModalBody.textContent = body;
        confirmBtn.textContent = buttonText;
        confirmBtn.className = `btn ${buttonText.toLowerCase() === 'delete' ? 'btn-danger' : 'btn-primary'}`;

        const handleConfirm = async () => {
            if (typeof onConfirm === 'function') {
                await onConfirm();
            }
            // FIX: Remove focus from the button before closing the modal.
            confirmBtn.blur();
            confirmModalInstance.hide();
        };

        confirmBtn.addEventListener('click', handleConfirm, { once: true });

        const handleModalHide = () => {
            confirmBtn.removeEventListener('click', handleConfirm);
        };
        confirmModalEl.addEventListener('hidden.bs.modal', handleModalHide, { once: true });

        confirmModalInstance.show();
    }

    /**
     * Loads an entire workspace from a string containing HTML with meta tags.
     * This function resets the current state and builds a new one.
     * @param {string} htmlString The raw HTML content of the effect file.
     */
    function loadEffectFromMetaHTML(htmlString) {
        if (!htmlString || !htmlString.trim()) {
            showToast("The provided file or text is empty.", 'danger');
            return;
        }

        try {
            isRestoring = true;

            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlString;

            // --- 1. PARSE ALL DATA ---
            const metaElements = Array.from(tempDiv.querySelectorAll('meta'));
            const loadedConfigs = metaElements.map(parseMetaToConfig).filter(c => c.property || c.name);
            const loadedConfigMap = new Map(loadedConfigs.map(c => [(c.property || c.name), c]));

            const constantsMap = new Map();
            const scriptEl = tempDiv.querySelector('script');
            if (scriptEl) {
                const scriptContent = scriptEl.textContent;
                const regex = /const\s+([a-zA-Z0-9_]+)\s*=\s*(.*?);/sg;
                let match;
                while ((match = regex.exec(scriptContent)) !== null) {
                    if (match[1] && match[2] !== undefined) {
                        const key = match[1];
                        let value = match[2];
                        try { value = JSON.parse(value); } catch (e) { }
                        constantsMap.set(key, value);
                    }
                }
            }

            if (loadedConfigMap.size === 0 && constantsMap.size === 0) {
                showToast("No valid properties were found in the file.", 'danger');
                isRestoring = false;
                return;
            }

            // --- 2. BUILD THE NEW CONFIGURATION STORE ---
            const newConfigStore = [];

            const parser = new DOMParser();
            const doc = parser.parseFromString(INITIAL_CONFIG_TEMPLATE, 'text/html');
            // --- NEW, MORE ROBUST GENERAL CONFIG MERGING ---
            const masterGeneralConfigs = Array.from(doc.querySelectorAll('meta'))
                .map(parseMetaToConfig)
                .filter(c => !(c.property || c.name).startsWith('obj'));
            const loadedGeneralConfigs = loadedConfigs.filter(c => !(c.property || c.name).startsWith('obj'));

            const mergedGeneralConfigMap = new Map();

            // First, add all master configs to the map.
            masterGeneralConfigs.forEach(conf => {
                mergedGeneralConfigMap.set(conf.property || conf.name, { ...conf });
            });

            // Then, iterate through loaded configs. Update existing ones or add new ones.
            loadedGeneralConfigs.forEach(loadedConf => {
                const key = loadedConf.property || loadedConf.name;
                const existingConf = mergedGeneralConfigMap.get(key);
                if (existingConf) {
                    // If it exists in the master template, just update its default value.
                    existingConf.default = loadedConf.default;
                } else {
                    // If this is a property not in the master template, add it.
                    // This is important for forward-compatibility if new globals are added.
                    mergedGeneralConfigMap.set(key, loadedConf);
                }
            });

            newConfigStore.push(...Array.from(mergedGeneralConfigMap.values()));

            const allLoadedProps = new Set([...loadedConfigMap.keys(), ...constantsMap.keys()]);
            const objectIds = [...new Set(Array.from(allLoadedProps).map(p => (p || '').match(/^obj(\d+)_/)).filter(Boolean).map(match => parseInt(match[1], 10)))].sort((a, b) => a - b);

            const objectData = {};
            objectIds.forEach(id => {
                objectData[id] = { props: [], name: `Object ${id}` };
                allLoadedProps.forEach(prop => {
                    if (prop && prop.startsWith(`obj${id}_`)) {
                        objectData[id].props.push(prop.substring(prop.indexOf('_') + 1));
                    }
                });

                const aPropToGetNameFrom = Array.from(allLoadedProps).find(p => p && p.startsWith(`obj${id}_`) && loadedConfigMap.has(p));
                if (aPropToGetNameFrom) {
                    const conf = loadedConfigMap.get(aPropToGetNameFrom);
                    if (conf && conf.label) {
                        const nameParts = conf.label.split(':');
                        if (nameParts.length > 1) objectData[id].name = nameParts[0].trim();
                    }
                }
            });

            for (const id in objectData) {
                const props = objectData[id].props;
                let bestMatch = 'rectangle'; let maxScore = 0;
                for (const shapeType in shapePropertyMap) {
                    let currentScore = 0;
                    props.forEach(prop => { if (shapePropertyMap[shapeType].includes(prop)) currentScore++; });
                    if (currentScore > maxScore) { maxScore = currentScore; bestMatch = shapeType; }
                }
                objectData[id].shape = bestMatch;
            }

            objectIds.forEach(id => {
                const defaults = getDefaultObjectConfig(id);
                const { name, shape } = objectData[id];

                // --- NEW: Backward Compatibility Logic ---
                const gradColor1 = loadedConfigMap.get(`obj${id}_gradColor1`)?.default;
                const gradColor2 = loadedConfigMap.get(`obj${id}_gradColor2`)?.default;
                if ((gradColor1 || gradColor2) && !loadedConfigMap.has(`obj${id}_gradientStops`)) {
                    const stops = [
                        { color: gradColor1 || '#00ff00', position: 0 },
                        { color: gradColor2 || '#d400ff', position: 1 }
                    ];
                    constantsMap.set(`obj${id}_gradientStops`, JSON.stringify(stops));
                }
                const strokeColor1 = loadedConfigMap.get(`obj${id}_strokeGradColor1`)?.default;
                const strokeColor2 = loadedConfigMap.get(`obj${id}_strokeGradColor2`)?.default;
                if ((strokeColor1 || strokeColor2) && !loadedConfigMap.has(`obj${id}_strokeGradientStops`)) {
                    const stops = [
                        { color: strokeColor1 || '#FFFFFF', position: 0 },
                        { color: strokeColor2 || '#000000', position: 1 }
                    ];
                    constantsMap.set(`obj${id}_strokeGradientStops`, JSON.stringify(stops));
                }
                // --- END ---

                defaults.forEach(conf => {
                    const key = conf.property;
                    conf.label = `${name}: ${conf.label.split(':').slice(1).join(':').trim()}`;
                    if (key === `obj${id}_shape`) conf.default = shape;
                    if (constantsMap.has(key)) conf.default = constantsMap.get(key);
                    else if (loadedConfigMap.has(key)) conf.default = loadedConfigMap.get(key).default;
                });
                newConfigStore.push(...defaults);
            });

            // --- 3. APPLY THE NEW STATE ---
            configStore = newConfigStore;
            objects = [];
            const names = {};
            for (const id in objectData) { names[id] = objectData[id].name; }
            createInitialObjects(names);

            renderForm();

            configStore.filter(c => !(c.property || c.name).startsWith('obj')).forEach(conf => {
                const key = conf.property || conf.name;
                const el = form.elements[key];
                if (el) {
                    if (el.type === 'checkbox') {
                        el.checked = (conf.default === true || conf.default === 'true');
                    } else {
                        el.value = conf.default;
                    }
                    // Also update any dependent UI elements like sliders or hex inputs
                    const slider = form.querySelector(`#${el.id}_slider`);
                    if (slider) slider.value = conf.default;
                    const hexInput = form.querySelector(`#${el.id}_hex`);
                    if (hexInput) hexInput.value = conf.default;
                }
            });

            updateObjectsFromForm();
            drawFrame();
            recordHistory();

            showToast("Effect loaded successfully!", 'success');

            const importModalEl = document.getElementById('import-meta-modal');
            if (importModalEl) {
                const importModal = bootstrap.Modal.getInstance(importModalEl);
                if (importModal) { importModal.hide(); }
            }
        } catch (error) {
            console.error("Error importing file:", error);
            showToast("Could not parse the provided file. Please check the format.", 'danger');
        } finally {
            isRestoring = false;
        }
    }

    confirmImportBtn.addEventListener('click', () => {
        const importText = document.getElementById('import-textarea').value;
        loadEffectFromMetaHTML(importText);
    });

    // --- START: NEW Upload from File Logic ---
    const uploadEffectBtn = document.getElementById('upload-effect-btn');
    const effectFileInput = document.getElementById('effect-file-input');

    uploadEffectBtn.addEventListener('click', () => {
        effectFileInput.click(); // Programmatically click the hidden file input
    });

    effectFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const fileContent = event.target.result;
            loadEffectFromMetaHTML(fileContent);
        };
        reader.onerror = () => {
            showToast(`Error reading file: ${reader.error}`, 'danger');
        };
        reader.readAsText(file);

        // Reset the input value to allow uploading the same file again
        e.target.value = null;
    });
    // --- END: NEW Upload from File Logic ---

    /**
     * SHARE BUTTON: Opens a modal with the share link if the project is saved.
     */
    shareBtn.addEventListener('click', () => {
        if (!currentProjectDocId) {
            showToast("Please save the effect before sharing.", 'info');
            return; // Stop if not saved
        }

        // If saved, populate the input and show the modal
        const shareUrl = `${window.location.origin}${window.location.pathname}?effectId=${currentProjectDocId}`;
        const shareLinkInput = document.getElementById('share-link-input');
        shareLinkInput.value = shareUrl;

        const shareModal = new bootstrap.Modal(document.getElementById('share-modal'));
        shareModal.show();
    });

    /**
      * COPY SHARE LINK BUTTON: Copies the link from the share modal.
      */
    document.getElementById('copy-share-link-btn').addEventListener('click', () => {
        const shareLinkInput = document.getElementById('share-link-input');
        navigator.clipboard.writeText(shareLinkInput.value).then(() => {
            showToast("Link copied to clipboard!", 'success');
        });
    });

    document.getElementById('new-ws-btn').addEventListener('click', () => {
        showConfirmModal(
            'Create New Workspace',
            'Are you sure you want to clear the current workspace? Any unsaved changes will be lost.',
            'Clear Workspace',
            () => {
                resetWorkspace();
            }
        );
    });

    addPolylineBtn.addEventListener('click', () => {
        activeTool = 'polyline';
        canvasContainer.style.cursor = 'crosshair';
        isDrawingPolyline = false; // Reset state
        currentlyDrawingShapeId = null;
        previewLine.active = false;
        showToast("Polyline tool activated. Click on the canvas to start drawing. Double-click to finish.", "info");
    });

    addObjectBtn.addEventListener('click', () => {
        activeTool = 'select';
        canvasContainer.style.cursor = 'default';
        currentProjectDocId = null;
        updateShareButtonState();
        const newId = objects.length > 0 ? (Math.max(...objects.map(o => o.id))) + 1 : 1;
        const newConfigs = getDefaultObjectConfig(newId);

        // Find the insertion point (after general settings, before existing object settings).
        const firstObjectConfigIndex = configStore.findIndex(c => (c.property || c.name || '').startsWith('obj'));

        if (firstObjectConfigIndex === -1) {
            // If no other objects exist, just add the new configs to the end.
            configStore.push(...newConfigs);
        } else {
            // Otherwise, insert the new configs before the first existing object's configs.
            configStore.splice(firstObjectConfigIndex, 0, ...newConfigs);
        }

        const state = {
            id: newId,
            name: `Object ${newId}`, // Explicitly sets the default name
            gradient: {}
        };

        newConfigs.forEach(conf => {
            const key = conf.property.replace(`obj${newId}_`, '');
            let value = conf.default;

            if (conf.type === 'number') {
                value = parseFloat(value);
            } else if (conf.type === 'boolean') {
                value = (value === 'true');
            }

            if (key.startsWith('gradColor')) {
                state.gradient[key.replace('grad', '').toLowerCase()] = value;
            } else if (key === 'scrollDir') {
                state.scrollDirection = value;
            } else {
                state[key] = value;
            }
        });

        propsToScale.forEach(prop => {
            if (state[prop] !== undefined) {
                state[prop] *= 4;
            }
        });

        const newShape = new Shape({ ...state, ctx, canvasWidth: canvas.width });

        // Add the new shape to the beginning of the objects array to place it on the top layer.
        objects.unshift(newShape);


        renderForm();
        updateFormValuesFromObjects();
        drawFrame();
        recordHistory();
    });

    /**
     * CONFIRMATION MODAL: General listener for confirm button.
     */
    confirmBtn.addEventListener('click', () => {
        if (typeof confirmActionCallback === 'function') {
            confirmActionCallback();
        }
    });

    /**
     * Creates a debounced version of a function that delays invoking the function
     * until after a certain number of milliseconds have passed since the last time
     * the debounced function was invoked.
     * @param {Function} func The function to debounce.
     * @param {number} delay The number of milliseconds to delay.
     * @returns {Function} The new debounced function.
     */
    function debounce(func, delay) {
        let timeout;
        return function (...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    const debouncedRecordHistory = debounce(recordHistory, 500);


    // This handles committed changes from text boxes, dropdowns, color pickers, and checkboxes.
    form.addEventListener('change', (e) => {
        const target = e.target;

        if (target.name && target.name.endsWith('_enableStroke')) {
            const fieldset = target.closest('fieldset[data-object-id]');
            if (fieldset) {
                updateStrokeDependentControls(fieldset);
            }
        }

        if (target.name && target.name.includes('_sensorColorMode')) {
            const fieldset = target.closest('fieldset[data-object-id]');
            if (fieldset) {
                updateSensorControlVisibility(fieldset);
            }
        }

        if (target.name) {
            dirtyProperties.add(target.name); // <-- Add this line
        }

        // --- START: NEW, CORRECTED LOGIC FOR SHAPE CHANGES ---
        if (target.name && /^obj\d+_shape$/.test(target.name)) {
            const idMatch = target.name.match(/^obj(\d+)_/);
            if (!idMatch) return;

            const id = parseInt(idMatch[1], 10);
            const oldObj = objects.find(o => o.id === id);
            if (!oldObj) return;

            const newShapeType = target.value;

            // 1. Preserve essential properties from the old object (using live, scaled values)
            const preservedProps = {
                name: oldObj.name, locked: oldObj.locked,
                x: oldObj.x, y: oldObj.y, width: oldObj.width, height: oldObj.height, rotation: oldObj.rotation,
                gradient: { ...oldObj.gradient }, strokeGradient: { ...oldObj.strokeGradient },
                enableAudioReactivity: oldObj.enableAudioReactivity, audioTarget: oldObj.audioTarget,
                audioMetric: oldObj.audioMetric, beatThreshold: oldObj.beatThreshold,
                audioSensitivity: oldObj.audioSensitivity, audioSmoothing: oldObj.audioSmoothing
            };

            // 2. Find the start index and count of the old configuration block
            const startIndex = configStore.findIndex(c => c.property && c.property.startsWith(`obj${id}_`));
            if (startIndex === -1) { return; } // Should not happen

            let count = 0;
            for (let i = startIndex; i < configStore.length; i++) {
                if (configStore[i].property && configStore[i].property.startsWith(`obj${id}_`)) {
                    count++;
                } else {
                    break;
                }
            }

            // 3. Get a fresh, default set of configurations for the new shape type
            const newConfigs = getDefaultObjectConfig(id);

            // 4. Update these new default configurations with the preserved properties
            newConfigs.forEach(conf => {
                const propName = conf.property.substring(conf.property.indexOf('_') + 1);
                let valueToSet;

                if (propName === 'shape') {
                    valueToSet = newShapeType;
                } else if (propName.startsWith('gradColor')) {
                    valueToSet = preservedProps.gradient[propName.replace('gradColor', 'color')];
                } else if (propName.startsWith('strokeGradColor')) {
                    valueToSet = preservedProps.strokeGradient[propName.replace('strokeGradColor', 'color')];
                } else {
                    valueToSet = preservedProps[propName];
                }

                if (valueToSet !== undefined) {
                    if (propsToScaleDown.includes(propName)) { valueToSet /= 4; }
                    else if (propName === 'animationSpeed' || propName === 'strokeAnimationSpeed') { valueToSet *= 10; }
                    else if (propName === 'cycleSpeed' || propName === 'strokeCycleSpeed') { valueToSet *= 50; }

                    if (typeof valueToSet === 'boolean') { valueToSet = String(valueToSet); }
                    conf.default = valueToSet;
                }
                conf.label = `${preservedProps.name}: ${conf.label.split(':').slice(1).join(':').trim()}`;
            });

            // 5. Replace the old config block with the new one in-place
            configStore.splice(startIndex, count, ...newConfigs);

            // 6. Recreate the objects array from the now-correct configStore
            createInitialObjects();

            // 7. Re-render the UI and finalize the state
            renderForm();
            updateObjectsFromForm();
            drawFrame();
            debouncedRecordHistory();

            dirtyProperties.clear();
            dirtyProperties.add(target.name);

            return;
        }
        // --- END: NEW, CORRECTED LOGIC FOR SHAPE CHANGES ---

        // Handle UI re-rendering for other controls with dependencies
        if (target.name && (
            target.name.includes('_shape') ||
            target.name.includes('_vizDrawStyle') ||
            target.name.includes('_numberOfRows') ||
            target.name.includes('_numberOfColumns') ||
            target.name.includes('_oscDisplayMode') ||
            target.name.includes('_strimerAnimation')
        )) {
            updateObjectsFromForm();
            renderForm();
            updateFormValuesFromObjects();
        }

        if (target.classList.contains('gif-upload-input')) {
            const file = target.files[0];
            if (file) {
                const fieldset = target.closest('fieldset[data-object-id]');
                const objectId = fieldset.dataset.objectId;

                // We can reuse our existing GIF handler!
                handleGifPaste(file, objectId);
            }
            // Reset the input so the user can upload the same file again if they choose
            target.value = null;
        }

        debouncedRecordHistory();
    });


    // Copy and Paste section
    const copyPropsBtn = document.getElementById('copy-props-btn');
    const pastePropsBtn = document.getElementById('paste-props-btn');
    const copyPropsModalEl = document.getElementById('copy-props-modal');
    const confirmCopyBtn = document.getElementById('confirm-copy-props-btn');
    const copyPropsForm = document.getElementById('copy-props-form');

    if (copyPropsBtn && pastePropsBtn && copyPropsModalEl && confirmCopyBtn && copyPropsForm) {
        const copyPropsModal = new bootstrap.Modal(copyPropsModalEl);

        copyPropsBtn.addEventListener('click', () => {
            if (selectedObjectIds.length === 0) return;
            sourceObjectId = selectedObjectIds[0];
            const sourceObject = objects.find(o => o.id === sourceObjectId);
            if (!sourceObject) return;

            copyPropsForm.reset();

            const shapeSpecificContainer = document.getElementById('shape-specific-props-container');
            const shapeSpecificName = document.getElementById('shape-specific-name');
            const shapeSpecificProps = ['ring', 'oscilloscope', 'text', 'rectangle', 'polygon', 'star', 'tetris', 'fire-radial', 'pixel-art', 'audio-visualizer'];

            if (shapeSpecificProps.includes(sourceObject.shape)) {
                shapeSpecificName.textContent = sourceObject.shape.charAt(0).toUpperCase() + sourceObject.shape.slice(1);
                shapeSpecificContainer.classList.remove('d-none');
            } else {
                shapeSpecificContainer.classList.add('d-none');
            }

            copyPropsModal.show();
        });

        confirmCopyBtn.addEventListener('click', (event) => {
            event.preventDefault();

            const sourceObject = objects.find(o => o.id === sourceObjectId);
            if (!sourceObject) return;

            const propsToCopy = {};

            // Helper to copy properties from the source object
            const copyProps = (propNames) => {
                propNames.forEach(prop => {
                    if (sourceObject[prop] !== undefined) {
                        propsToCopy[prop] = sourceObject[prop];
                    }
                });
            };

            if (copyPropsForm.elements['copy-position'].checked) copyProps(['x', 'y']);
            if (copyPropsForm.elements['copy-size'].checked) copyProps(['width', 'height']);
            if (copyPropsForm.elements['copy-rotation'].checked) copyProps(['rotation', 'rotationSpeed']);
            if (copyPropsForm.elements['copy-fill-style'].checked) Object.assign(propsToCopy, { gradType: sourceObject.gradType, useSharpGradient: sourceObject.useSharpGradient, gradient: { stops: JSON.parse(JSON.stringify(sourceObject.gradient.stops)) } });
            if (copyPropsForm.elements['copy-animation'].checked) copyProps(['animationMode', 'animationSpeed', 'scrollDirection', 'phaseOffset']);
            if (copyPropsForm.elements['copy-color-animation'].checked) copyProps(['cycleColors', 'cycleSpeed']);
            if (copyPropsForm.elements['copy-shape-type'].checked) copyProps(['shape']);

            if (copyPropsForm.elements['copy-shape-specific'].checked) {
                // Update this
                const shapeSpecificMap = {
                    'ring': ['innerDiameter', 'numberOfSegments', 'angularWidth'],
                    'oscilloscope': ['lineWidth', 'waveType', 'frequency', 'oscDisplayMode', 'pulseDepth', 'fillShape', 'enableWaveAnimation', 'oscAnimationSpeed', 'waveStyle', 'waveCount'],
                    'text': ['text', 'fontSize', 'textAlign', 'pixelFont', 'textAnimation', 'textAnimationSpeed', 'showTime', 'showDate', 'autoWidth'],
                    'rectangle': ['numberOfRows', 'numberOfColumns'],
                    'polygon': ['sides'],
                    'star': ['points', 'starInnerRadius'],
                    'tetris': ['tetrisBlockCount', 'tetrisAnimation', 'tetrisSpeed', 'tetrisBounce'],
                    'fire-radial': ['fireSpread'],
                    'pixel-art': ['pixelArtData'],
                    'audio-visualizer': ['vizLayout', 'vizDrawStyle', 'vizStyle', 'vizLineWidth', 'vizAutoScale', 'vizMaxBarHeight', 'vizBarCount', 'vizBarSpacing', 'vizSmoothing', 'vizUseSegments', 'vizSegmentCount', 'vizSegmentSpacing', 'vizInnerRadius', 'vizBassLevel', 'vizTrebleBoost'],
                    'strimer': ['strimerRows', 'strimerColumns', 'strimerBlockCount', 'strimerBlockSize', 'strimerAnimation', 'strimerDirection', 'strimerEasing', 'strimerSnakeDirection'],
                    'spawner': ['spawn_shapeType', 'spawn_animation', 'spawn_count', 'spawn_spawnRate', 'spawn_lifetime', 'spawn_speed', 'spawn_size', 'spawn_gravity', 'spawn_spread', 'spawn_rotationSpeed', 'spawn_size_randomness', 'spawn_initialRotation_random', 'sides', 'points', 'starInnerRadius', 'spawn_svg_path']
                };
                if (shapeSpecificMap[sourceObject.shape]) {
                    copyProps(shapeSpecificMap[sourceObject.shape]);
                }
            }

            propertyClipboard = propsToCopy;
            updateToolbarState();
            showToast("Properties copied!", 'info');
            copyPropsModal.hide();
        });

        pastePropsBtn.addEventListener('click', () => {
            if (!propertyClipboard || selectedObjectIds.length === 0) return;

            const destObjects = selectedObjectIds.map(id => objects.find(o => o.id === id));
            let shapeChanged = false;

            destObjects.forEach(obj => {
                if (obj) {
                    if (propertyClipboard.shape && obj.shape !== propertyClipboard.shape) {
                        shapeChanged = true;
                    }
                    obj.update(propertyClipboard);
                }
            });

            // If the shape type was pasted, the entire form needs to be rebuilt
            if (shapeChanged) {
                // Update the central configStore to reflect the shape change
                destObjects.forEach(obj => {
                    const shapeConf = configStore.find(c => c.property === `obj${obj.id}_shape`);
                    if (shapeConf) {
                        shapeConf.default = obj.shape;
                    }
                });
                renderForm();
            }

            updateFormValuesFromObjects();
            drawFrame();
            recordHistory();
            showToast(`Properties pasted to ${destObjects.length} object(s).`, 'success');
        });
    }

    /**
     * Analyzes the current audio frame and returns calculated metrics, including average and peak values.
     * @returns {object} An object with bass, mids, highs, and volume properties.
     */
    function getAudioMetrics() {
        if (!analyser) {
            return {
                bass: { avg: 0, peak: 0 },
                mids: { avg: 0, peak: 0 },
                highs: { avg: 0, peak: 0 },
                volume: { avg: 0, peak: 0 },
                frequencyData: new Uint8Array(analyser ? analyser.frequencyBinCount : 128).fill(0)
            };
        }

        analyser.getByteFrequencyData(frequencyData);

        const bassEndIndex = Math.floor(analyser.frequencyBinCount * 0.1);
        const midsEndIndex = Math.floor(analyser.frequencyBinCount * 0.4);

        let bassTotal = 0, midsTotal = 0, highsTotal = 0;
        let bassPeak = 0, midsPeak = 0, highsPeak = 0;
        let volumeTotal = 0;

        for (let i = 0; i < analyser.frequencyBinCount; i++) {
            const value = frequencyData[i];
            volumeTotal += value;

            if (i < bassEndIndex) {
                bassTotal += value;
                if (value > bassPeak) bassPeak = value;
            } else if (i < midsEndIndex) {
                midsTotal += value;
                if (value > midsPeak) midsPeak = value;
            } else {
                highsTotal += value;
                if (value > highsPeak) highsPeak = value;
            }
        }

        const volumeAvg = (volumeTotal / analyser.frequencyBinCount) / 255;

        return {
            bass: {
                avg: (bassTotal / (bassEndIndex || 1)) / 255,
                peak: bassPeak / 255
            },
            mids: {
                avg: (midsTotal / ((midsEndIndex - bassEndIndex) || 1)) / 255,
                peak: midsPeak / 255
            },
            highs: {
                avg: (highsTotal / ((analyser.frequencyBinCount - midsEndIndex) || 1)) / 255,
                peak: highsPeak / 255
            },
            volume: {
                avg: volumeAvg,
                peak: volumeAvg
            },
            frequencyData: frequencyData // Pass the full, unfiltered array
        };
    }

    /**
    * Sets up the Web Audio API to listen to a specific browser tab's audio.
    */
    async function setupAudio() {
        if (isAudioSetup) return;

        try {
            // Step 1: Request permission to capture a tab. 
            // We must request video:true to get the audio permission prompt.
            const stream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            });

            // Step 2: Check if the user actually shared audio.
            if (stream.getAudioTracks().length === 0) {
                // Stop the video track to remove the "sharing this screen" icon.
                stream.getVideoTracks()[0].stop();
                alert("Audio sharing was not enabled. Please try again and make sure to check the 'Share tab audio' box.");
                return;
            }

            // Step 3: Create the audio context and connect the nodes (same as before).
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;

            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);

            frequencyData = new Uint8Array(analyser.frequencyBinCount);
            isAudioSetup = true;

            // Stop the video track, as we only need the audio.
            // This also removes the "sharing this screen" bar from the browser.
            stream.getVideoTracks()[0].stop();

            // Update the button UI
            const startBtn = document.getElementById('startAudioBtn');
            startBtn.textContent = 'Listening...';
            startBtn.disabled = true;
            showToast("Tab audio connected! Your visualizer is now live.", "success");

        } catch (err) {
            // This error happens if the user clicks "Cancel".
            console.error('Error capturing tab:', err);
            showToast("Tab capture was canceled or failed.", "error");
        }
    }

    /**
     * [SignalRGB Export] Analyzes SignalRGB's audio engine data and returns calculated metrics.
     * @returns {object} An object with bass, mids, highs, and volume properties (0-1 range).
     */
    function getSignalRGBAudioMetrics() {
        try {
            if (enableSound) {
                const freqArray = engine.audio.freq || new Array(200).fill(0);
                const level = engine.audio.level || -100;

                const bassEndIndex = 20;
                const midsEndIndex = 80;
                let bassTotal = 0, midsTotal = 0, highsTotal = 0;

                for (let i = 0; i < bassEndIndex; i++) { bassTotal += freqArray[i]; }
                for (let i = bassEndIndex; i < midsEndIndex; i++) { midsTotal += freqArray[i]; }
                for (let i = midsEndIndex; i < freqArray.length; i++) { highsTotal += freqArray[i]; }

                const bass = (bassTotal / (bassEndIndex || 1));
                const mids = (midsTotal / ((midsEndIndex - bassEndIndex) || 1));
                const highs = (highsTotal / ((freqArray.length - midsEndIndex) || 1));
                const volume = (level + 100) / 100.0;

                return {
                    bass: { avg: bass, peak: bass },
                    mids: { avg: mids, peak: mids },
                    highs: { avg: highs, peak: highs },
                    volume: { avg: volume, peak: volume },
                    frequencyData: freqArray // FIX: Return the full, unfiltered array
                };
            }
        } catch (e) {
            // This catch block handles cases where the 'engine' object might not be available.
        }

        return {
            bass: { avg: 0, peak: 0 },
            mids: { avg: 0, peak: 0 },
            highs: { avg: 0, peak: 0 },
            volume: { avg: 0, peak: 0 },
            frequencyData: new Array(200).fill(0)
        };
    }

    /**
     * [SignalRGB Export] A version of _applyAudioReactivity that works within SignalRGB.
     * This function is converted to a method of the Shape class during export.
     */
    function srgb_applyAudioReactivity(audioData) {
        if (this.isBeingManuallyRotated) {
            return;
        }

        // Reset properties at the start of each frame.
        this.rotation = this.baseRotation || 0;
        this.internalScale = 1.0;
        this.colorOverride = null;
        this.gradient = { ...(this.baseGradient || { color1: '#000000', color2: '#000000' }) };

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
        const randomSign = Math.random() < 0.5 ? -1 : 1;

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
                this.rotation = this.baseRotation + (randomSign * reactiveValue * 30);
                break;
        }
    }

    function applyHistoryState(state) {
        if (!state) return;
        isRestoring = true;

        // ADDED: Restore the form's configuration from history
        configStore = state.configStore;

        objects = state.objects.map(data => new Shape({ ...data, ctx }));
        selectedObjectIds = state.selectedObjectIds;

        // Now that configStore is correct, renderForm will build the correct UI
        renderForm();

        drawFrame();
        updateToolbarState();
        updateUndoRedoButtons();
        isRestoring = false;
    }

    if (undoBtn) {
        undoBtn.addEventListener('click', () => {
            const state = appHistory.undo();
            applyHistoryState(state);
        });
    }
    if (redoBtn) {
        redoBtn.addEventListener('click', () => {
            const state = appHistory.redo();
            applyHistoryState(state);
        });
    }

    /**
    * Loads the featured project from the database if no shared effect is specified.
    * @returns {Promise<boolean>} A promise that resolves to true if a featured effect was loaded, false otherwise.
    */
    async function loadFeaturedEffect() {
        try {
            const projectsRef = window.collection(window.db, "projects");
            const q = window.query(projectsRef, window.where("featured", "==", true), window.limit(1));
            const querySnapshot = await window.getDocs(q);

            if (!querySnapshot.empty) {
                const doc = querySnapshot.docs[0];
                const projectData = { docId: doc.id, ...doc.data() };
                if (projectData.createdAt && projectData.createdAt.toDate) {
                    projectData.createdAt = projectData.createdAt.toDate();
                }
                loadWorkspace(projectData);
                showToast(`Featured effect "${projectData.name}" loaded!`, 'success');
                return true;
            } else {
                console.log("No featured effect found in the database.");
                return false;
            }
        } catch (error) {
            console.error("Error loading featured effect:", error);
            return false;
        }
    }

    // --- Canvas Scaling Logic ---
    // const canvasContainer = document.getElementById('canvas-container');
    const rightPanelTop = document.getElementById('right-panel-top');

    // This observer watches the panel containing the canvas for size changes.
    const canvasResizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            // Get the available width and height from the panel.
            const rect = entry.contentRect;
            const containerWidth = rect.width;
            const containerHeight = rect.height;

            if (containerWidth === 0 || containerHeight === 0) return;

            const aspectRatio = 1280 / 800;

            // Calculate the largest size that fits within the panel while maintaining the aspect ratio.
            let newWidth = containerWidth;
            let newHeight = newWidth / aspectRatio;

            if (newHeight > containerHeight) {
                newHeight = containerHeight;
                newWidth = newHeight * aspectRatio;
            }

            // Apply the new, calculated size directly to the canvas container's style.
            canvasContainer.style.width = `${newWidth}px`;
            canvasContainer.style.height = `${newHeight}px`;
        }
    });

    // Start observing the panel.
    if (rightPanelTop) {
        canvasResizeObserver.observe(rightPanelTop);
    }

    function initializeTooltips() {
        const tooltipTriggerList = document.querySelectorAll('[title]');
        tooltipTriggerList.forEach(tooltipTriggerEl => {
            // Only initialize if it doesn't already have one
            if (!bootstrap.Tooltip.getInstance(tooltipTriggerEl)) {
                new bootstrap.Tooltip(tooltipTriggerEl);
            }
        });
    }

    /**
     * Finds and completely disposes of all tooltip instances on the page.
     */
    function disposeTooltips() {
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"], .tooltip');
        tooltipTriggerList.forEach(tooltipTriggerEl => {
            const tooltip = bootstrap.Tooltip.getInstance(tooltipTriggerEl);
            if (tooltip) {
                tooltip.dispose();
            }
        });
        // Also remove any orphaned tooltip elements from the DOM
        document.querySelectorAll('.tooltip').forEach(el => el.remove());
    }

    // When a modal or offcanvas starts to open, destroy all tooltips.
    const allModals = document.querySelectorAll('.modal');
    allModals.forEach(modal => {
        modal.addEventListener('show.bs.modal', disposeTooltips);
    });
    const allOffcanvases = document.querySelectorAll('.offcanvas');
    allOffcanvases.forEach(offcanvas => {
        offcanvas.addEventListener('show.bs.offcanvas', disposeTooltips);
    });

    // When a modal or offcanvas has finished closing, re-create all tooltips from scratch.
    allModals.forEach(modal => {
        modal.addEventListener('hidden.bs.modal', initializeTooltips);
    });
    allOffcanvases.forEach(offcanvas => {
        offcanvas.addEventListener('hidden.bs.offcanvas', initializeTooltips);
    });

    function fetchAndRenderPixelArtGallery() {
        const container = document.getElementById('modal-pixel-art-container');
        if (!container) return;
        isPixelArtGalleryLoaded = true; // Prevents re-loading
        container.innerHTML = `<div class="col text-center p-4"><div class="spinner-border" role="status"><span class="visually-hidden">Loading...</span></div></div>`;

        (async () => {
            try {
                const projectsRef = window.collection(window.db, "projects");
                const q = window.query(projectsRef, window.where("isPublic", "==", true), window.orderBy("createdAt", "desc"));
                const querySnapshot = await window.getDocs(q);

                pixelArtCache = [];

                querySnapshot.forEach(doc => {
                    const project = doc.data();
                    if (project.configs && Array.isArray(project.configs)) {
                        const pixelArtConfigs = project.configs.filter(conf =>
                            conf.property && conf.property.endsWith("_shape") && conf.default === 'pixel-art'
                        );

                        pixelArtConfigs.forEach(shapeConf => {
                            const objectIdMatch = shapeConf.property.match(/^obj(\d+)_/);
                            if (objectIdMatch) {
                                const objectId = objectIdMatch[1];
                                const framesConf = project.configs.find(c => c.property === `obj${objectId}_pixelArtFrames`);
                                const objectNameConf = project.configs.find(c => c.property === `obj${objectId}_shape`);
                                if (framesConf && framesConf.default) {
                                    pixelArtCache.push({
                                        framesData: framesConf.default,
                                        projectName: project.name,
                                        creatorName: project.creatorName || 'Anonymous',
                                        objectName: objectNameConf?.label.split(':')[0] || 'Pixel Art'
                                    });
                                }
                            }
                        });
                    }
                });

                renderPixelArtGallery();

            } catch (error) {
                console.error("Error fetching pixel art:", error);
                container.innerHTML = `<div class="col"><p class="text-danger">Could not load pixel art gallery.</p></div>`;
            }
        })();
    }

    function renderPixelArtGallery() {
        const container = document.getElementById('modal-pixel-art-container');
        const paginationContainer = document.getElementById('pixel-art-pagination-container');
        if (!container || !paginationContainer) return;

        const filteredArt = pixelArtSearchTerm
            ? pixelArtCache.filter(art =>
                art.projectName.toLowerCase().includes(pixelArtSearchTerm) ||
                art.creatorName.toLowerCase().includes(pixelArtSearchTerm) ||
                art.objectName.toLowerCase().includes(pixelArtSearchTerm)
            )
            : pixelArtCache;

        const totalPages = Math.ceil(filteredArt.length / PIXEL_ART_ITEMS_PER_PAGE);
        pixelArtCurrentPage = Math.max(1, Math.min(pixelArtCurrentPage, totalPages));

        const startIndex = (pixelArtCurrentPage - 1) * PIXEL_ART_ITEMS_PER_PAGE;
        const itemsForPage = filteredArt.slice(startIndex, startIndex + PIXEL_ART_ITEMS_PER_PAGE);

        container.innerHTML = '';
        if (itemsForPage.length === 0) {
            container.innerHTML = `<div class="col"><p class="text-body-secondary">No matching pixel art found.</p></div>`;
        }

        itemsForPage.forEach((art) => {
            const col = document.createElement('div');
            col.className = 'col';
            const card = document.createElement('div');
            card.className = 'card h-100';
            const cardBody = document.createElement('div');
            cardBody.className = 'pixel-art-card-body p-3';
            const canvas = document.createElement('canvas');
            canvas.className = 'pixel-art-canvas';
            canvas.width = 120;
            canvas.height = 120;
            const infoDiv = document.createElement('div');
            infoDiv.className = 'flex-grow-1';

            const title = document.createElement('h6');
            title.className = 'card-title';
            title.textContent = art.objectName;

            const subtitle = document.createElement('p');
            subtitle.className = 'card-text text-body-secondary mb-2';
            subtitle.innerHTML = `From: <em>${art.projectName}</em><br>By: ${art.creatorName}`;

            const insertBtn = document.createElement('button');
            insertBtn.className = 'btn btn-sm btn-outline-success';
            insertBtn.innerHTML = `<i class="bi bi-plus-lg me-1"></i> Insert`;
            insertBtn.addEventListener('click', () => handlePixelArtInsert(art.framesData));

            infoDiv.appendChild(title);
            infoDiv.appendChild(subtitle);
            infoDiv.appendChild(insertBtn);
            cardBody.appendChild(canvas);
            cardBody.appendChild(infoDiv);
            card.appendChild(cardBody);
            col.appendChild(card);
            container.appendChild(col);

            try {
                const frames = JSON.parse(art.framesData);
                let currentFrameIndex = 0;
                let frameTimer = frames[currentFrameIndex]?.duration || 1;
                let lastTime = 0;
                const animate = (time) => {
                    if (!lastTime) lastTime = time;
                    const deltaTime = (time - lastTime) / 1000;
                    lastTime = time;
                    if (frames.length > 1) {
                        frameTimer -= deltaTime;
                        if (frameTimer <= 0) {
                            currentFrameIndex = (currentFrameIndex + 1) % frames.length;
                            frameTimer += frames[currentFrameIndex]?.duration || 1;
                        }
                    }
                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    const frame = frames[currentFrameIndex];
                    if (frame && frame.data) {
                        const data = (typeof frame.data === 'string') ? JSON.parse(frame.data) : frame.data;
                        if (!Array.isArray(data) || data.length === 0 || !Array.isArray(data[0])) return;
                        const rows = data.length;
                        const cols = data[0].length;
                        const cellWidth = canvas.width / cols;
                        const cellHeight = canvas.height / rows;
                        for (let r = 0; r < rows; r++) {
                            for (let c = 0; c < cols; c++) {
                                const val = data[r]?.[c] || 0;
                                if (val > 0) {
                                    if (val === 1.0) ctx.fillStyle = '#FFFFFF';
                                    else if (val === 0.3) ctx.fillStyle = '#FF00FF';
                                    else if (val === 0.4) ctx.fillStyle = '#00FFFF';
                                    else if (val === 0.7) ctx.fillStyle = `rgba(0, 0, 0, 0)`;
                                    else ctx.fillStyle = `rgba(255, 0, 255, ${val})`;
                                    ctx.fillRect(c * cellWidth, r * cellHeight, cellWidth, cellHeight);
                                }
                            }
                        }
                    }
                    requestAnimationFrame(animate);
                };
                requestAnimationFrame(animate);
            } catch (e) { console.error("Could not animate pixel art:", art, e); }
        });

        // Render Pagination
        paginationContainer.innerHTML = '';
        if (totalPages > 1) {
            const createPageItem = (text, page, isDisabled = false, isActive = false) => {
                const li = document.createElement('li');
                li.className = `page-item ${isDisabled ? 'disabled' : ''} ${isActive ? 'active' : ''}`;
                const a = document.createElement('a');
                a.className = 'page-link';
                a.href = '#';
                a.innerHTML = text;
                if (!isDisabled) {
                    a.addEventListener('click', (e) => {
                        e.preventDefault();
                        pixelArtCurrentPage = page;
                        renderPixelArtGallery();
                    });
                }
                li.appendChild(a);
                return li;
            };

            paginationContainer.appendChild(createPageItem('&laquo;', pixelArtCurrentPage - 1, pixelArtCurrentPage === 1));
            for (let i = 1; i <= totalPages; i++) {
                paginationContainer.appendChild(createPageItem(i, i, false, i === pixelArtCurrentPage));
            }
            paginationContainer.appendChild(createPageItem('&raquo;', pixelArtCurrentPage + 1, pixelArtCurrentPage === totalPages));
        }
    }

    function handlePixelArtInsert(framesDataString) {
        if (selectedObjectIds.length !== 1) {
            showToast("Please select exactly one pixel art object to insert frames into.", "warning");
            return;
        }
        const targetObject = objects.find(o => o.id === selectedObjectIds[0]);
        if (!targetObject || targetObject.shape !== 'pixel-art') {
            showToast("The selected object is not a pixel art object.", "warning");
            return;
        }

        try {
            const newFrames = JSON.parse(framesDataString);
            if (!Array.isArray(newFrames)) throw new Error("Data is not an array.");

            const fieldset = form.querySelector(`fieldset[data-object-id="${targetObject.id}"]`);
            const hiddenTextarea = fieldset.querySelector('textarea[name$="_pixelArtFrames"]');

            const existingFrames = JSON.parse(hiddenTextarea.value);
            const combinedFrames = [...existingFrames, ...newFrames];

            const color1 = targetObject.gradient.color1;
            const color2 = targetObject.gradient.color2;

            hiddenTextarea.value = JSON.stringify(combinedFrames);
            hiddenTextarea.dispatchEvent(new Event('input', { bubbles: true }));

            const framesContainer = fieldset.querySelector('.d-flex.flex-column.gap-2');
            framesContainer.innerHTML = '';
            combinedFrames.forEach((frame, index) => {
                const frameItem = document.createElement('div');
                const textareaId = `frame-data-${targetObject.id}-${index}`;
                const frameDataStr = typeof frame.data === 'string' ? frame.data : JSON.stringify(frame.data);

                frameItem.className = 'pixel-art-frame-item border rounded p-1 bg-body d-flex gap-2 align-items-center';
                frameItem.innerHTML = `
                    <canvas class="pixel-art-preview-canvas border rounded" width="60" height="60" title="Frame Preview"></canvas>
                    <div class="flex-grow-1">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <strong class="frame-item-header small">Frame #${index + 1}</strong>
                            <div>
                                <button type="button" class="btn btn-sm btn-outline-info p-1" style="line-height: 1;"
                                        data-bs-toggle="modal"
                                        data-bs-target="#pixelArtEditorModal"
                                        data-target-id="${textareaId}" title="Edit Frame">
                                    <i class="bi bi-pencil-square"></i>
                                </button>
                                <button type="button" class="btn btn-sm btn-outline-danger p-1 btn-delete-frame" title="Delete Frame" style="line-height: 1;">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                        <div class="input-group input-group-sm">
                            <span class="input-group-text" title="Duration (seconds)">
                                <i class="bi bi-clock"></i>
                            </span>
                            <input type="number" class="form-control form-control-sm frame-duration-input" value="${frame.duration || 0.1}" min="0.1" step="0.1">
                        </div>
                        <textarea class="form-control form-control-sm frame-data-input d-none" id="${textareaId}" rows="6">${frameDataStr}</textarea>
                    </div>
                `;
                framesContainer.appendChild(frameItem);
                const previewCanvas = frameItem.querySelector('.pixel-art-preview-canvas');
                renderPixelArtPreview(previewCanvas, frameDataStr, color1, color2);
            });

            recordHistory();
            const modalInstance = bootstrap.Modal.getInstance(document.getElementById('pixel-art-gallery-modal'));
            modalInstance.hide();
            showToast(`${newFrames.length} frame(s) inserted successfully!`, 'success');

        } catch (error) {
            console.error("Insert error:", error);
            showToast("Could not insert frames. Data might be invalid.", "danger");
        }
    }

    function loadUserSpecificGalleryData() {
        // This function will re-render the gallery list if it's visible, 
        // ensuring the like buttons reflect the current user's state.
        const galleryOffcanvas = document.getElementById('gallery-offcanvas');
        if (galleryOffcanvas && galleryOffcanvas.classList.contains('show')) {
            // Find the active gallery type (My Projects or Community) and re-load it.
            const galleryLabel = document.getElementById('galleryOffcanvasLabel').textContent;
            // Check if the current user is logged in
            const isLoggedIn = !!window.auth.currentUser;

            if (galleryLabel === 'My Effects' && isLoggedIn) {
                // Re-run the 'My Effects' logic
                document.getElementById('load-ws-btn').click();
            } else if (galleryLabel.includes('Gallery') || !isLoggedIn) {
                // Re-run the 'Community Gallery' logic
                document.getElementById('browse-btn').click();
            }
            // Note: We don't need to re-run 'My Effects' if the user logs out 
            // because the 'Community Gallery' logic will show (or the list will be empty).
        }
    }
    window.loadUserSpecificGalleryData = loadUserSpecificGalleryData; // Expose globally

    // --- START: NEW LAZY LOADING GALLERY LOGIC ---
    const gallerySearchInput = document.getElementById('gallery-search-input');
    const gallerySortOptions = document.querySelectorAll('.gallery-sort-option');
    const galleryFooter = document.getElementById('gallery-footer');
    const galleryScrollContainer = document.getElementById('gallery-scroll-container'); // Added this

    let currentBaseQuery; // To store the base query for loading more

    /**
     * Fetches projects for the gallery.
     * - Uses pagination for 'createdAt' and 'name' sorts.
     * - Fetches all for 'likes' and 'downloadCount' sorts to ensure correctness.
     * - Fetches all when a search term is active.
     */
    async function fetchAndDisplayGallery(galleryType = 'community') {
        const user = window.auth.currentUser;
        if (galleryType === 'user' && !user) {
            showToast("You must be logged in to see your projects.", 'danger');
            const galleryOffcanvas = bootstrap.Offcanvas.getInstance(galleryOffcanvasEl);
            if (galleryOffcanvas) galleryOffcanvas.hide();
            return;
        }

        lastVisibleDoc = null; // Reset pagination
        const galleryList = document.getElementById('gallery-project-list');
        galleryList.innerHTML = '<div class="col-12 text-center text-body-secondary mt-4"><div class="spinner-border spinner-border-sm"></div><p class="mt-2">Loading...</p></div>';
        galleryFooter.style.display = 'none';

        const projectsRef = window.collection(window.db, "projects");

        // Set the base query based on gallery type
        if (galleryType === 'user') {
            document.getElementById('galleryOffcanvasLabel').textContent = 'My Effects';
            currentBaseQuery = window.query(projectsRef, window.where("userId", "==", user.uid));
        } else {
            document.getElementById('galleryOffcanvasLabel').textContent = 'Community Gallery';
            currentBaseQuery = window.query(projectsRef, window.where("isPublic", "==", true));
        }

        // --- START: NEW HYBRID LOADING LOGIC ---
        const searchTerm = gallerySearchInput.value.toLowerCase();
        // Determine if we can use efficient pagination or need to fetch everything
        const usePagination = (currentSortOption === 'createdAt' || currentSortOption === 'name') && !searchTerm;

        if (usePagination) {
            // BEHAVIOR 1: Efficient lazy-loading for default sorts
            isLoadingMore = true; // Prevent scroll-loading during initial fetch
            const sortDirection = currentSortOption === 'name' ? 'asc' : 'desc';
            const finalQuery = window.query(
                currentBaseQuery,
                window.orderBy(currentSortOption, sortDirection),
                window.limit(GALLERY_PAGE_SIZE)
            );
            try {
                const documentSnapshots = await window.getDocs(finalQuery);
                const projects = [];
                documentSnapshots.forEach((doc) => {
                    const data = doc.data();
                    if (data.createdAt && data.createdAt.toDate) data.createdAt = data.createdAt.toDate();
                    projects.push({ docId: doc.id, ...data });
                });

                populateGallery(projects, false);

                lastVisibleDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];
                if (documentSnapshots.docs.length < GALLERY_PAGE_SIZE) {
                    isLoadingMore = true;
                } else {
                    isLoadingMore = false;
                }
            } catch (error) {
                console.error("Gallery query error:", error);
                galleryList.innerHTML = `<div class="col-12"><p class="text-danger">Could not load effects. Please ensure database indexes are configured.</p></div>`;
            }

        } else {
            // BEHAVIOR 2: Fetch-all for searching or complex sorts ('likes', 'downloadCount')
            isLoadingMore = true; // Disable scroll loading entirely
            try {
                const querySnapshot = await window.getDocs(currentBaseQuery);
                let projects = [];
                querySnapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.createdAt && data.createdAt.toDate) data.createdAt = data.createdAt.toDate();
                    projects.push({ docId: doc.id, ...data });
                });

                // Then sort the full results client-side
                projects.sort((a, b) => {
                    // Use || 0 to handle cases where the field doesn't exist
                    const aVal = a[currentSortOption] || 0;
                    const bVal = b[currentSortOption] || 0;
                    if (currentSortOption === 'name') {
                        return (aVal || '').localeCompare(bVal || '');
                    } else {
                        return bVal - aVal;
                    }
                });

                // Finally, apply search filter if it exists
                const filteredProjects = searchTerm
                    ? projects.filter(p => p.name.toLowerCase().includes(searchTerm) || (p.creatorName && p.creatorName.toLowerCase().includes(searchTerm)))
                    : projects;

                populateGallery(filteredProjects);
                galleryFooter.style.display = 'none'; // Hide footer since all results are shown

            } catch (error) {
                console.error("Gallery search/sort error:", error);
                galleryList.innerHTML = `<div class="col-12"><p class="text-danger">Could not perform search or sort.</p></div>`;
            }
        }
        // --- END: NEW HYBRID LOADING LOGIC ---
    }

    /**
     * Fetches the next page of projects when the user scrolls.
     */
    async function loadMoreProjects() {
        if (isLoadingMore || !lastVisibleDoc || !currentBaseQuery) return;

        isLoadingMore = true;
        galleryFooter.style.display = 'block';

        const sortDirection = currentSortOption === 'name' ? 'asc' : 'desc';
        const nextQuery = window.query(
            currentBaseQuery,
            window.orderBy(currentSortOption, sortDirection),
            window.startAfter(lastVisibleDoc),
            window.limit(GALLERY_PAGE_SIZE)
        );

        try {
            const documentSnapshots = await window.getDocs(nextQuery);
            const newProjects = [];
            documentSnapshots.forEach((doc) => {
                const data = doc.data();
                if (data.createdAt && data.createdAt.toDate) data.createdAt = data.createdAt.toDate();
                newProjects.push({ docId: doc.id, ...data });
            });

            const searchTerm = gallerySearchInput.value.toLowerCase();
            const filteredProjects = searchTerm
                ? newProjects.filter(p => p.name.toLowerCase().includes(searchTerm) || (p.creatorName && p.creatorName.toLowerCase().includes(searchTerm)))
                : newProjects;

            populateGallery(filteredProjects, true); // Append new content

            lastVisibleDoc = documentSnapshots.docs[documentSnapshots.docs.length - 1];

            // If we fetched less than a full page, there are no more projects
            if (documentSnapshots.docs.length < GALLERY_PAGE_SIZE) {
                galleryFooter.style.display = 'none';
            } else {
                isLoadingMore = false; // Re-enable loading for the next page
            }
        } catch (error) {
            console.error("Error loading more projects:", error);
            showToast("Failed to load more effects.", 'danger');
        } finally {
            if (documentSnapshots.docs.length > 0) {
                galleryFooter.style.display = 'none';
            }
        }
    }

    // NEW: Scroll event listener for infinite loading
    if (galleryScrollContainer) {
        galleryScrollContainer.addEventListener('scroll', () => {
            const { scrollTop, scrollHeight, clientHeight } = galleryScrollContainer;
            // Trigger load when user is 100px from the bottom
            if (scrollHeight - scrollTop - clientHeight < 100) {
                loadMoreProjects();
            }
        });
    }

    // Update event listeners to call the new master function
    gallerySearchInput.addEventListener('input', debounce(() => {
        const galleryType = document.getElementById('galleryOffcanvasLabel').textContent === 'My Effects' ? 'user' : 'community';
        fetchAndDisplayGallery(galleryType);
    }, 300));

    gallerySortOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            e.preventDefault();
            currentSortOption = e.target.dataset.sort;
            const galleryType = document.getElementById('galleryOffcanvasLabel').textContent === 'My Effects' ? 'user' : 'community';
            fetchAndDisplayGallery(galleryType);
        });
    });

    document.getElementById('load-ws-btn').addEventListener('click', () => {
        fetchAndDisplayGallery('user');
    });

    document.getElementById('browse-btn').addEventListener('click', () => {
        fetchAndDisplayGallery('community');
    });

    galleryOffcanvasEl.addEventListener('hidden.bs.offcanvas', () => {
        lastVisibleDoc = null;
    });

    // --- END: NEW LAZY LOADING GALLERY LOGIC ---

    // Start the application.
    init();
});