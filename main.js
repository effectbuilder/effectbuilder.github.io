// Global speed multipliers (adjust these to change animation speeds across the board)
window.gradientSpeedMultiplier = 1;
window.shapeSpeedMultiplier = 1;
window.seismicSpeedMultiplier = 1;
window.tetrisGravityMultiplier = 4;
window.textSpeedMultiplier = 1;

const INITIAL_CONFIG_TEMPLATE = `
    <meta title="Untitled Efffect" />
    <meta description="Built with Effect Builder (https://joseamirandavelez.github.io/EffectBuilder/), by Jose Miranda" />
    <meta publisher="SRGB Interactive Effect Builder" />
    <meta property="enableAnimation" label="Enable Animation" type="boolean" default="true" />
    <meta property="enableSound" label="Enable Sound" type="boolean" default="false" />

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
    <meta property="obj1_gradientStop" label="Small Clock: Gradient Stop %" type="number" min="0" max="100" default="72" />
    <meta property="obj1_gradColor1" label="Small Clock: Color 1" type="color" default="#00ff00" />
    <meta property="obj1_gradColor2" label="Small Clock: Color 2" type="color" default="#d400ff" />
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
    <meta property="enablePalette" label="Enable Global Color Palette" type="boolean" default="false" />
    <meta property="paletteColor1" label="Palette Color 1" type="color" default="#FF8F00" />
    <meta property="paletteColor2" label="Palette Color 2" type="color" default="#00BFFF" />
    <meta property="enableGlobalCycle" label="Enable Global Color Cycle" type="boolean" default="false" />
    <meta property="globalCycleSpeed" label="Global Color Cycle Speed" type="number" default="10" min="0" max="100" />



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
    <meta property="obj2_gradientStop" label="Large Text: Gradient Stop %" type="number" min="0" max="100" default="72" />
    <meta property="obj2_gradColor1" label="Large Text: Color 1" type="color" default="#00ff00" />
    <meta property="obj2_gradColor2" label="Large Text: Color 2" type="color" default="#d400ff" />
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
    <meta property="obj3_gradColor1" label="Visualizer: Color 1" type="color" default="#00ff00" />
    <meta property="obj3_gradColor2" label="Visualizer: Color 2" type="color" default="#d400ff" />
    <meta property="obj3_animationSpeed" label="Visualizer: Animation Speed" type="number" min="1" max="50" default="10" />
    <meta property="obj3_vizLayout" label="Visualizer: Layout" type="combobox" default="Linear" values="Linear,Circular" />
    <meta property="obj3_vizDrawStyle" label="Visualizer: Draw Style" type="combobox" default="Line" values="Bars,Line,Area" />
    <meta property="obj3_vizStyle" label="Visualizer: Style" type="combobox" default="bottom" values="bottom,center,top" />
    <meta property="obj3_vizLineWidth" label="Visualizer: Line Width" type="number" default="2" min="1" max="20" />
    <meta property="obj3_vizAutoScale" label="Visualizer: Auto-Scale Height" type="boolean" default="true" />
    <meta property="obj3_vizMaxBarHeight" label="Visualizer: Max Bar Height" type="number" default="30" min="5" max="100" />
    <meta property="obj3_vizBarCount" label="Visualizer: Bar Count" type="number" default="64" min="2" max="128" />
    <meta property="obj3_vizBarSpacing" label="Visualizer: Bar Spacing" type="number" default="2" min="0" max="20" />
    <meta property="obj3_vizSmoothing" label="Visualizer: Smoothing" type="number" default="60" min="0" max="99" />
    <meta property="obj3_vizUseSegments" label="Visualizer: Use LED Segments" type="boolean" default="false" />
    <meta property="obj3_vizSegmentCount" label="Visualizer: Segment Count" type="number" default="16" min="2" max="64" />
    <meta property="obj3_vizSegmentSpacing" label="Visualizer: Segment Spacing" type="number" default="1" min="0" max="10" />
    <meta property="obj3_vizInnerRadius" label="Visualizer: Inner Radius" type="number" default="40" min="0" max="95" />
    <meta property="obj3_vizBassLevel" label="Visualizer: Bass Level" type="number" default="50" min="0" max="1000" />
    <meta property="obj3_vizTrebleBoost" label="Visualizer: Treble Boost" type="number" default="125" min="0" max="1000" />
    <meta property="obj3_vizGain" label="Visualizer: Gain" type="number" default="100" min="0" max="200" />
`;

// --- State Management ---
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
let currentGalleryQuery = null;
let currentProjectDocId = null;
let confirmActionCallback = null;
let exportPayload = {};
let propertyClipboard = null;
let sourceObjectId = null;

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
    const values = getControlValues();
    const paletteEnabled = values.enablePalette;
    const pColor1 = values.paletteColor1;
    const pColor2 = values.paletteColor2;

    const colorControlNames = ['gradColor1', 'gradColor2', 'strokeGradColor1', 'strokeGradColor2'];

    objects.forEach(obj => {
        colorControlNames.forEach(name => {
            const input = form.querySelector(`[name="obj${obj.id}_${name}"]`);
            if (input) {
                const hexInput = form.querySelector(`[name="obj${obj.id}_${name}_hex"]`);
                const isColor1 = name.endsWith('1');

                input.disabled = paletteEnabled;
                if (hexInput) hexInput.disabled = paletteEnabled;

                if (paletteEnabled) {
                    const paletteColor = isColor1 ? pColor1 : pColor2;
                    input.value = paletteColor;
                    if (hexInput) hexInput.value = paletteColor;
                } else {
                    // Restore the object's actual color
                    const originalColor = isColor1
                        ? (name.startsWith('stroke') ? obj.strokeGradient.color1 : obj.gradient.color1)
                        : (name.startsWith('stroke') ? obj.strokeGradient.color2 : obj.gradient.color2);
                    input.value = originalColor;
                    if (hexInput) hexInput.value = originalColor;
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
    // --- START: PIXEL ART EDITOR LOGIC ---
    const editorModalEl = document.getElementById('pixelArtEditorModal');
    if (editorModalEl) {
        const gridContainer = document.getElementById('pixel-editor-grid-container');
        const widthInput = document.getElementById('pixel-editor-width');
        const heightInput = document.getElementById('pixel-editor-height');
        const resizeBtn = document.getElementById('pixel-editor-resize-btn');
        const saveBtn = document.getElementById('pixel-editor-save-btn');
        const palette = document.getElementById('pixel-editor-palette');
        const color1Btn = document.getElementById('pixel-editor-color1-btn');
        const color2Btn = document.getElementById('pixel-editor-color2-btn');
        const fillBtn = document.getElementById('pixel-editor-fill-btn');
        const mirrorHBtn = document.getElementById('pixel-editor-mirror-h-btn');
        const mirrorVBtn = document.getElementById('pixel-editor-mirror-v-btn');

        let targetTextarea = null;
        let currentPaintValue = 0.7;
        let currentTool = 'paint'; // 'paint' or 'fill'
        let isPainting = false;

        const valueToColor = (value, color1, color2) => {
            if (value === 1.0) return '#FFFFFF';
            if (value === 0.3) return color1 || '#FF00FF';
            if (value === 0.4) return color2 || '#00FFFF';
            if (value === 0) return '#000000';
            // For other values (0.5, 0.7 etc.), show a checkerboard to represent the main animated fill
            return `repeating-conic-gradient(#808080 0% 25%, #a0a0a0 0% 50%) 50% / 10px 10px`;
        };

        const renderGrid = (data, color1, color2) => {
            gridContainer.innerHTML = '';
            const rows = data.length;
            const cols = data[0].length;
            gridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    const cell = document.createElement('div');
                    cell.classList.add('pixel-editor-cell');
                    cell.dataset.row = r;
                    cell.dataset.col = c;
                    const value = data[r] ? (data[r][c] || 0) : 0;
                    cell.style.backgroundColor = valueToColor(value, color1, color2);
                    cell.dataset.value = value;
                    gridContainer.appendChild(cell);
                }
            }
        };

        editorModalEl.addEventListener('show.bs.modal', (event) => {
            currentTool = 'paint'; // Reset to paint tool on open
            const button = event.relatedTarget;
            const targetId = button.getAttribute('data-target-id');
            targetTextarea = document.getElementById(targetId);

            const objectId = button.closest('fieldset[data-object-id]').dataset.objectId;
            const color1Input = form.querySelector(`[name="obj${objectId}_gradColor1"]`);
            const color1 = color1Input ? color1Input.value : '#FF00FF';
            color1Btn.style.backgroundColor = color1;

            const color2Input = form.querySelector(`[name="obj${objectId}_gradColor2"]`);
            const color2 = color2Input ? color2Input.value : '#00FFFF';
            color2Btn.style.backgroundColor = color2;

            try {
                const data = JSON.parse(targetTextarea.value);
                widthInput.value = data[0].length;
                heightInput.value = data.length;
                renderGrid(data, color1, color2);
            } catch (e) {
                renderGrid([[0]], color1, color2);
            }
        });

        palette.addEventListener('click', (e) => {
            currentTool = 'paint'; // Clicking a color always switches to paint tool
            const button = e.target.closest('button');
            if (!button) return;
            palette.querySelector('.active').classList.remove('active');
            button.classList.add('active');
            currentPaintValue = parseFloat(button.dataset.value);
        });

        fillBtn.addEventListener('click', () => {
            currentTool = 'fill';
            showToast("Fill tool selected. Click an area to fill it with the active paint color.", "info");
        });

        const readGrid = () => {
            const rows = parseInt(heightInput.value, 10);
            const cols = parseInt(widthInput.value, 10);
            const cells = gridContainer.querySelectorAll('.pixel-editor-cell');
            const data = [];
            for (let r = 0; r < rows; r++) {
                const row = [];
                for (let c = 0; c < cols; c++) {
                    row.push(parseFloat(cells[r * cols + c].dataset.value));
                }
                data.push(row);
            }
            return data;
        };

        const floodFill = (startNode) => {
            if (!startNode || !startNode.classList.contains('pixel-editor-cell')) return;

            const gridData = readGrid();
            const rows = gridData.length;
            const cols = gridData[0].length;

            const startRow = parseInt(startNode.dataset.row, 10);
            const startCol = parseInt(startNode.dataset.col, 10);
            const targetValue = gridData[startRow][startCol];

            if (targetValue === currentPaintValue) return;

            const queue = [[startRow, startCol]];
            const visited = new Set([`${startRow},${startCol}`]);
            gridData[startRow][startCol] = currentPaintValue;

            while (queue.length > 0) {
                const [r, c] = queue.shift();

                [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]].forEach(([nr, nc]) => {
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && !visited.has(`${nr},${nc}`) && gridData[nr][nc] === targetValue) {
                        visited.add(`${nr},${nc}`);
                        gridData[nr][nc] = currentPaintValue;
                        queue.push([nr, nc]);
                    }
                });
            }
            renderGrid(gridData, color1Btn.style.backgroundColor, color2Btn.style.backgroundColor);
        };

        mirrorHBtn.addEventListener('click', () => {
            let gridData = readGrid();
            gridData.forEach(row => row.reverse());
            renderGrid(gridData, color1Btn.style.backgroundColor, color2Btn.style.backgroundColor);
        });

        mirrorVBtn.addEventListener('click', () => {
            let gridData = readGrid().reverse();
            renderGrid(gridData, color1Btn.style.backgroundColor, color2Btn.style.backgroundColor);
        });

        resizeBtn.addEventListener('click', () => {
            const newWidth = parseInt(widthInput.value, 10);
            const newHeight = parseInt(heightInput.value, 10);
            const newData = Array(newHeight).fill(0).map(() => Array(newWidth).fill(0));
            renderGrid(newData, color1Btn.style.backgroundColor, color2Btn.style.backgroundColor);
        });

        gridContainer.addEventListener('mousedown', (e) => {
            if (currentTool === 'paint') {
                isPainting = true;
                paintCell(e.target);
            } else if (currentTool === 'fill') {
                floodFill(e.target);
            }
        });
        gridContainer.addEventListener('mouseover', (e) => {
            if (isPainting && currentTool === 'paint') {
                paintCell(e.target);
            }
        });
        document.addEventListener('mouseup', () => {
            isPainting = false;
        });

        const paintCell = (cell) => {
            if (!cell || !cell.classList.contains('pixel-editor-cell')) return;
            cell.dataset.value = currentPaintValue;
            cell.style.backgroundColor = valueToColor(currentPaintValue, color1Btn.style.backgroundColor, color2Btn.style.backgroundColor);
        };

        saveBtn.addEventListener('click', () => {
            if (!targetTextarea) return;
            const newData = readGrid();
            const newDataString = JSON.stringify(newData);
            targetTextarea.value = newDataString;
            targetTextarea.dispatchEvent(new Event('input', { bubbles: true }));
            bootstrap.Modal.getInstance(editorModalEl).hide();
        });
    }
    // --- END: PIXEL ART EDITOR LOGIC ---

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
            'shape', 'x', 'y', 'width', 'height', 'rotation', 'gradType', 'useSharpGradient', 'gradientStop',
            'gradColor1', 'gradColor2', 'cycleColors', 'animationMode', 'animationSpeed', 'rotationSpeed',
            'cycleSpeed', 'scrollDir', 'phaseOffset', 'numberOfRows', 'numberOfColumns',
            'enableStroke', 'strokeWidth', 'strokeGradType', 'strokeUseSharpGradient', 'strokeGradientStop', 'strokeGradColor1', 'strokeGradColor2', 'strokeCycleColors', 'strokeCycleSpeed', 'strokeAnimationSpeed', 'strokeRotationSpeed', 'strokeAnimationMode', 'strokePhaseOffset', 'strokeScrollDir',
            'enableAudioReactivity', 'audioTarget', 'audioMetric', 'beatThreshold', 'audioSensitivity', 'audioSmoothing',
            'enableSensorReactivity', 'sensorTarget', 'userSensor', 'timePlotLineThickness', 'timePlotFillArea', 'sensorMeterShowValue', 'timePlotAxesStyle', 'timePlotTimeScale', 'sensorColorMode', 'sensorMidThreshold', 'sensorMaxThreshold'
        ],
        circle: [
            'shape', 'x', 'y', 'width', 'height', 'rotation', 'gradType', 'useSharpGradient', 'gradientStop',
            'gradColor1', 'gradColor2', 'cycleColors', 'animationMode', 'animationSpeed', 'rotationSpeed',
            'cycleSpeed', 'scrollDir', 'phaseOffset',
            'enableStroke', 'strokeWidth', 'strokeGradType', 'strokeUseSharpGradient', 'strokeGradientStop', 'strokeGradColor1', 'strokeGradColor2', 'strokeCycleColors', 'strokeCycleSpeed', 'strokeAnimationSpeed', 'strokeRotationSpeed', 'strokeAnimationMode', 'strokePhaseOffset', 'strokeScrollDir',
            'enableAudioReactivity', 'audioTarget', 'audioMetric', 'beatThreshold', 'audioSensitivity', 'audioSmoothing',
            'enableSensorReactivity', 'sensorTarget', 'userSensor', 'timePlotLineThickness', 'timePlotFillArea', 'sensorMeterShowValue', 'timePlotAxesStyle', 'timePlotTimeScale', 'sensorColorMode', 'sensorMidThreshold', 'sensorMaxThreshold'
        ],
        ring: [
            'shape', 'x', 'y', 'width', 'height', 'rotation', 'gradType', 'useSharpGradient', 'gradientStop', 'gradColor1', 'gradColor2', 'cycleColors',
            'animationSpeed', 'rotationSpeed', 'cycleSpeed', 'innerDiameter', 'numberOfSegments', 'angularWidth',
            'enableStroke', 'strokeWidth', 'strokeGradType', 'strokeUseSharpGradient', 'strokeGradientStop', 'strokeGradColor1', 'strokeGradColor2', 'strokeCycleColors', 'strokeCycleSpeed', 'strokeAnimationSpeed', 'strokeRotationSpeed', 'strokeAnimationMode', 'strokePhaseOffset', 'strokeScrollDir',
            'enableAudioReactivity', 'audioTarget', 'audioMetric', 'beatThreshold', 'audioSensitivity', 'audioSmoothing',
            'enableSensorReactivity', 'sensorTarget', 'userSensor', 'timePlotLineThickness', 'timePlotFillArea', 'sensorMeterShowValue', 'timePlotAxesStyle', 'timePlotTimeScale', 'sensorColorMode', 'sensorMidThreshold', 'sensorMaxThreshold'
        ],
        polygon: [
            'shape', 'x', 'y', 'width', 'height', 'rotation', 'gradType', 'useSharpGradient', 'gradientStop',
            'gradColor1', 'gradColor2', 'cycleColors', 'animationMode', 'animationSpeed', 'rotationSpeed',
            'cycleSpeed', 'scrollDir', 'phaseOffset', 'sides',
            'enableStroke', 'strokeWidth', 'strokeGradType', 'strokeUseSharpGradient', 'strokeGradientStop', 'strokeGradColor1', 'strokeGradColor2', 'strokeCycleColors', 'strokeCycleSpeed', 'strokeAnimationSpeed', 'strokeRotationSpeed', 'strokeAnimationMode', 'strokePhaseOffset', 'strokeScrollDir',
            'enableAudioReactivity', 'audioTarget', 'audioMetric', 'beatThreshold', 'audioSensitivity', 'audioSmoothing',
            'enableSensorReactivity', 'sensorTarget', 'userSensor', 'timePlotLineThickness', 'timePlotFillArea', 'sensorMeterShowValue', 'timePlotAxesStyle', 'timePlotTimeScale', 'sensorColorMode', 'sensorMidThreshold', 'sensorMaxThreshold'
        ],
        star: [
            'shape', 'x', 'y', 'width', 'height', 'rotation', 'gradType', 'useSharpGradient', 'gradientStop',
            'gradColor1', 'gradColor2', 'cycleColors', 'animationMode', 'animationSpeed', 'rotationSpeed',
            'cycleSpeed', 'scrollDir', 'phaseOffset', 'points', 'starInnerRadius',
            'enableStroke', 'strokeWidth', 'strokeGradType', 'strokeUseSharpGradient', 'strokeGradientStop', 'strokeGradColor1', 'strokeGradColor2', 'strokeCycleColors', 'strokeCycleSpeed', 'strokeAnimationSpeed', 'strokeRotationSpeed', 'strokeAnimationMode', 'strokePhaseOffset', 'strokeScrollDir',
            'enableAudioReactivity', 'audioTarget', 'audioMetric', 'beatThreshold', 'audioSensitivity', 'audioSmoothing',
            'enableSensorReactivity', 'sensorTarget', 'userSensor', 'timePlotLineThickness', 'timePlotFillArea', 'sensorMeterShowValue', 'timePlotAxesStyle', 'timePlotTimeScale', 'sensorColorMode', 'sensorMidThreshold', 'sensorMaxThreshold'
        ],
        text: [
            'shape', 'x', 'y', 'width', 'height', 'rotation', 'rotationSpeed', 'gradType', 'useSharpGradient', 'gradientStop', 'gradColor1', 'gradColor2', 'cycleColors',
            'animationSpeed', 'text', 'fontSize', 'textAlign', 'pixelFont', 'textAnimation',
            'textAnimationSpeed', 'showTime', 'showDate',
            'enableAudioReactivity', 'audioTarget', 'audioMetric', 'beatThreshold', 'audioSensitivity', 'audioSmoothing',
        ],
        oscilloscope: [
            'shape', 'x', 'y', 'width', 'height', 'rotation', 'gradType', 'useSharpGradient', 'gradientStop', 'gradColor1', 'gradColor2', 'cycleColors',
            'animationMode', 'animationSpeed', 'rotationSpeed', 'cycleSpeed', 'scrollDir', 'phaseOffset',
            'lineWidth', 'waveType', 'frequency', 'oscDisplayMode', 'pulseDepth', 'fillShape',
            'enableWaveAnimation', 'waveStyle', 'waveCount', 'oscAnimationSpeed',
            'enableStroke', 'strokeWidth', 'strokeGradType', 'strokeUseSharpGradient', 'strokeGradientStop', 'strokeGradColor1', 'strokeGradColor2', 'strokeCycleColors', 'strokeCycleSpeed', 'strokeAnimationSpeed', 'strokeRotationSpeed', 'strokeAnimationMode', 'strokePhaseOffset', 'strokeScrollDir',
            'enableAudioReactivity', 'audioTarget', 'audioMetric', 'beatThreshold', 'audioSensitivity', 'audioSmoothing',
        ],
        'tetris': [
            'shape', 'x', 'y', 'width', 'height', 'rotation', 'gradType', 'useSharpGradient', 'gradientStop',
            'gradColor1', 'gradColor2', 'cycleColors', 'cycleSpeed', 'animationSpeed', 'phaseOffset',
            'tetrisAnimation', 'tetrisBlockCount', 'tetrisDropDelay', 'tetrisSpeed', 'tetrisBounce', 'tetrisHoldTime',
            'enableAudioReactivity', 'audioTarget', 'audioMetric', 'beatThreshold', 'audioSensitivity', 'audioSmoothing',
        ],
        fire: [
            'shape', 'x', 'y', 'width', 'height', 'rotation', 'gradType', 'useSharpGradient', 'gradientStop', 'gradColor1', 'gradColor2', 'cycleColors',
            'animationSpeed', 'cycleSpeed', 'scrollDir', 'fireSpread',
            'enableAudioReactivity', 'audioTarget', 'audioMetric', 'beatThreshold', 'audioSensitivity', 'audioSmoothing'
        ],
        'fire-radial': [
            'shape', 'x', 'y', 'width', 'height', 'rotation', 'gradType', 'useSharpGradient', 'gradientStop', 'gradColor1', 'gradColor2', 'cycleColors',
            'animationSpeed', 'cycleSpeed', 'scrollDir', 'fireSpread',
            'enableAudioReactivity', 'audioTarget', 'audioMetric', 'beatThreshold', 'audioSensitivity', 'audioSmoothing'
        ],
        'pixel-art': [
            'shape', 'x', 'y', 'width', 'height', 'rotation', 'gradType', 'useSharpGradient', 'gradientStop',
            'gradColor1', 'gradColor2', 'cycleColors', 'animationMode', 'animationSpeed', 'rotationSpeed',
            'cycleSpeed', 'scrollDir', 'phaseOffset', 'pixelArtFrames',
            'enableAudioReactivity', 'audioTarget', 'audioMetric', 'beatThreshold', 'audioSensitivity', 'audioSmoothing',
            'enableSensorReactivity', 'sensorTarget', 'userSensor', 'timePlotLineThickness', 'timePlotFillArea', 'sensorMeterShowValue', 'timePlotAxesStyle', 'timePlotTimeScale', 'sensorColorMode', 'sensorMidThreshold', 'sensorMaxThreshold'
        ],
        'audio-visualizer': [
            'shape', 'x', 'y', 'width', 'height', 'rotation', 'rotationSpeed', 'gradType', 'useSharpGradient', 'gradientStop',
            'gradColor1', 'gradColor2', 'cycleColors', 'animationSpeed', 'scrollDir',
            'vizLayout', 'vizDrawStyle', 'vizStyle',
            'vizLineWidth',
            'vizAutoScale',
            'vizBarCount', 'vizBarSpacing', 'vizSmoothing',
            'vizUseSegments', 'vizSegmentCount', 'vizSegmentSpacing',
            'vizInnerRadius', 'vizBassLevel', 'vizTrebleBoost', 'vizGain',
            'vizLowCutoff', 'vizHighCutoff', 'vizDownsampleFactor'
        ],
        'strimer': [
            'shape', 'x', 'y', 'width', 'height', 'rotation',
            'gradType', 'useSharpGradient', 'gradientStop', 'gradColor1', 'gradColor2',
            'cycleColors', 'cycleSpeed', 'animationSpeed', 'scrollDir', 'phaseOffset',
            'strimerRows', 'strimerColumns', 'strimerBlockCount', 'strimerBlockSize', 'strimerAnimation', 'strimerAnimationSpeed',
            'strimerDirection', 'strimerEasing',
            'strimerBlockSpacing', 'strimerGlitchFrequency', 'strimerPulseSync', 'strimerAudioSensitivity', 'strimerBassLevel', 'strimerTrebleBoost', 'strimerAudioSmoothing', 'strimerPulseSpeed', 'strimerSnakeDirection'
        ],
        'spawner': [
            'shape', 'x', 'y', 'width', 'height', 'rotation', 'gradType', 'useSharpGradient', 'gradientStop',
            'gradColor1', 'gradColor2', 'cycleColors', 'animationMode', 'animationSpeed', 'rotationSpeed',
            'cycleSpeed', 'scrollDir', 'phaseOffset', 'numberOfRows', 'numberOfColumns',
            'enableAudioReactivity', 'audioTarget', 'audioMetric', 'beatThreshold', 'audioSensitivity', 'audioSmoothing', 'spawn_audioTarget',
            'spawn_shapeType', 'spawn_animation', 'spawn_count', 'spawn_spawnRate', 'spawn_lifetime', 'spawn_speed', 'spawn_speedVariance', 'spawn_size', 'spawn_size_randomness', 'spawn_gravity', 'spawn_spread', 'spawn_rotationSpeed', 'spawn_rotationVariance', 'spawn_initialRotation_random',
            'spawn_matrixCharSet', 'spawn_matrixTrailLength', 'spawn_matrixEnableGlow', 'spawn_matrixGlowSize', 'spawn_matrixGlowColor',
            'spawn_enableTrail', 'spawn_trailLength', 'spawn_trailSpacing',
            'sides', 'points', 'starInnerRadius', 'spawn_svg_path'
        ],
        polyline: [
            'shape', 'x', 'y', 'width', 'height', 'rotation', 'rotationSpeed', 'polylineNodes', 'polylineCurveStyle',
            'pathAnim_enable', 'pathAnim_shape', 'pathAnim_size', 'pathAnim_speed', 'pathAnim_behavior', 'pathAnim_objectCount', 'pathAnim_objectSpacing',
            'pathAnim_gradType', 'pathAnim_useSharpGradient', 'pathAnim_gradientStop', 'pathAnim_gradColor1', 'pathAnim_gradColor2',
            'pathAnim_cycleColors', 'pathAnim_cycleSpeed', 'pathAnim_animationMode', 'pathAnim_animationSpeed', 'pathAnim_scrollDir',
            'pathAnim_trail', 'pathAnim_trailLength', 'pathAnim_trailColor',
            'enableStroke', 'strokeWidth', 'strokeGradType', 'strokeUseSharpGradient', 'strokeGradientStop', 'strokeGradColor1', 'strokeGradColor2', 'strokeCycleColors', 'strokeCycleSpeed', 'strokeAnimationSpeed', 'strokeRotationSpeed', 'strokeAnimationMode', 'strokePhaseOffset', 'strokeScrollDir',
            'enableAudioReactivity', 'audioTarget', 'audioMetric', 'beatThreshold', 'audioSensitivity', 'audioSmoothing'
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
     * Populates the gallery panel with projects. Can append or replace content.
     * @param {Array} projects - The array of project objects to display.
     * @param {boolean} [append=false] - If true, adds projects to the end of the list.
     */
    function populateGallery(projects) {
        const galleryList = document.getElementById('gallery-project-list');
        const currentUser = window.auth.currentUser;
        galleryList.innerHTML = '';

        if (projects.length === 0) {
            galleryList.innerHTML = '<li class="list-group-item disabled">No effects found.</li>';
            return;
        }

        projects.forEach(project => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.id = `gallery-item-${project.docId}`;

            const contentDiv = document.createElement('div');
            contentDiv.className = 'd-flex align-items-center flex-grow-1 me-2';

            if (project.thumbnail) {
                const img = document.createElement('img');
                img.src = project.thumbnail;
                img.style.width = '120px';
                img.style.height = '75px';
                img.style.objectFit = 'cover';
                img.className = 'rounded border me-3';
                contentDiv.appendChild(img);
            }

            const infoDiv = document.createElement('div');
            infoDiv.className = project.thumbnail ? 'ms-3' : '';
            infoDiv.style.minWidth = '0';

            const nameEl = document.createElement('strong');
            nameEl.textContent = project.name;

            const metaEl = document.createElement('small');
            metaEl.className = 'd-block text-body-secondary';
            const formattedDate = project.createdAt ? project.createdAt.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown Date';
            metaEl.textContent = `By ${project.creatorName || 'Anonymous'} on ${formattedDate}`;

            infoDiv.appendChild(nameEl);
            infoDiv.appendChild(metaEl);

            if (project.configs) {
                const descriptionConf = project.configs.find(c => c.name === 'description');
                if (descriptionConf && descriptionConf.default) {
                    const descEl = document.createElement('p');
                    descEl.className = 'mb-0 mt-1 small text-body-secondary';
                    descEl.textContent = descriptionConf.default;
                    descEl.title = descriptionConf.default;
                    infoDiv.appendChild(descEl);
                }
            }

            const statsEl = document.createElement('div');
            statsEl.className = 'mt-1 small text-body-secondary';

            const viewCount = project.viewCount || 0;
            const downloadCount = project.downloadCount || 0;

            statsEl.innerHTML = `
                <span class="me-3" title="Views"><i class="bi bi-eye-fill me-1"></i>${viewCount}</span>
                <span title="Downloads"><i class="bi bi-download me-1"></i>${downloadCount}</span>
            `;

            infoDiv.appendChild(statsEl);
            contentDiv.appendChild(infoDiv);
            li.appendChild(contentDiv);

            const controlsDiv = document.createElement('div');
            controlsDiv.className = 'd-flex flex-column gap-1';

            const loadBtn = document.createElement('button');
            loadBtn.className = 'btn btn-sm btn-outline-primary';
            loadBtn.innerHTML = '<i class="bi bi-box-arrow-down"></i>';
            loadBtn.title = "Load Effect";
            loadBtn.onclick = () => {
                const viewCountContainer = li.querySelector('span[title="Views"]');
                if (viewCountContainer) {
                    // The textContent of the span is just the number
                    const currentCount = parseInt(viewCountContainer.textContent.trim()) || 0;
                    viewCountContainer.innerHTML = `<i class="bi bi-eye-fill me-1"></i>${currentCount + 1}`;
                }

                loadWorkspace(project);
                const galleryOffcanvas = bootstrap.Offcanvas.getInstance(galleryOffcanvasEl);
                galleryOffcanvas.hide();
                showToast(`Effect "${project.name}" loaded!`, 'success');
            };
            controlsDiv.appendChild(loadBtn);

            if (currentUser && currentUser.uid === project.userId) {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'btn btn-sm btn-outline-danger';
                deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
                deleteBtn.title = "Delete Effect";
                deleteBtn.onclick = (e) => {
                    e.stopPropagation();
                    showConfirmModal(
                        'Delete Project',
                        `Are you sure you want to delete your project "${project.name}"? This cannot be undone.`,
                        'Delete',
                        async () => {
                            try {
                                await window.deleteDoc(window.doc(window.db, "projects", project.docId));
                                showToast(`Project "${project.name}" deleted.`, 'info');
                                li.remove();
                                if (galleryList.children.length === 0) {
                                    galleryList.innerHTML = '<li class="list-group-item disabled">No effects found.</li>';
                                }
                            } catch (error) {
                                showToast("Error deleting project.", 'danger');
                            }
                        }
                    );
                };
                controlsDiv.appendChild(deleteBtn);
            }

            if (currentUser && currentUser.uid === ADMIN_UID) {
                const featureBtn = document.createElement('button');
                const isFeatured = project.featured === true;

                featureBtn.className = `btn btn-sm btn-feature ${isFeatured ? 'btn-warning' : 'btn-outline-warning'}`;
                featureBtn.innerHTML = isFeatured ? '<i class="bi bi-star-fill"></i>' : '<i class="bi bi-star"></i>';
                featureBtn.title = isFeatured ? 'Unfeature this effect' : 'Feature this effect';
                featureBtn.dataset.docId = project.docId;

                featureBtn.onclick = function () {
                    toggleFeaturedStatus(this, project.docId);
                };

                controlsDiv.appendChild(featureBtn);
            }

            li.appendChild(controlsDiv);
            galleryList.appendChild(li);
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
            input.step = config.step || '1'; // This line was updated
            const slider = document.createElement('input');
            slider.type = 'range';
            slider.className = 'form-range flex-grow-1 ms-2';
            slider.id = `${controlId}_slider`;
            slider.name = `${controlId}_slider`;
            if (min) slider.min = min;
            if (max) slider.max = max;
            slider.step = config.step || '1'; // This line was added
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
            vals.sort(); // Sort the options alphabetically
            const select = document.createElement('select');
            select.id = controlId;
            select.className = 'form-select';
            select.name = controlId;
            vals.forEach(val => {
                const option = document.createElement('option');
                option.value = val;
                option.textContent = val.charAt(0).toUpperCase() + val.slice(1).replace('-', ' ');
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
            textarea.rows = (type === 'textarea') ? 10 : 3; // Give more rows for pixel art data
            textarea.textContent = defaultValue.replace(/\\n/g, '\n');
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
            colorGroup.appendChild(input);
            colorGroup.appendChild(hexInput);
            formGroup.appendChild(colorGroup);
        } else if (type === 'sensor') {
            const select = document.createElement('select');
            select.id = controlId;
            select.className = 'form-select';
            select.name = controlId;
            const cpuSensors = [
                'CPU Load', 'Memory Load', 'CPU Temperature', 'CPU Package Temp',
                ...Array.from({ length: 32 }, (_, i) => `CPU Core #${i + 1}`)
            ];
            const gpuSensors = [
                'GPU Core Voltage', 'GPU Hot Spot Temperature', 'GPU Memory Junction Temp',
                'GPU Core Temperature', 'GPU Memory Clock', 'GPU Core Clock',
                'GPU Load', 'GPU VRAM Usage'
            ];
            const fanSensors = [
                ...Array.from({ length: 4 }, (_, i) => `Fan Speed #${i + 1}`),
                ...Array.from({ length: 7 }, (_, i) => `Fan Load #${i + 1}`)
            ];
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

            // This hidden textarea will still hold the raw JSON data for the application to use.
            // The table is just a user-friendly way to edit it.
            const hiddenTextarea = document.createElement('textarea');
            hiddenTextarea.id = controlId;
            hiddenTextarea.name = controlId;
            hiddenTextarea.style.display = 'none';
            hiddenTextarea.textContent = defaultValue;

            const table = document.createElement('table');
            table.className = 'table table-dark table-sm node-table';
            table.innerHTML = `
        <thead>
            <tr>
                <th scope="col">#</th>
                <th scope="col">X</th>
                <th scope="col">Y</th>
                <th scope="col" style="width: 80px;">Actions</th>
            </tr>
        </thead>
        <tbody></tbody>`;

            const tbody = table.querySelector('tbody');
            let nodes = [];
            try {
                nodes = JSON.parse(defaultValue);
            } catch (e) { console.error("Could not parse polyline nodes for table.", e); }

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

            const addButton = document.createElement('button');
            addButton.type = 'button';
            addButton.className = 'btn btn-sm btn-outline-success mt-2 btn-add-node';
            addButton.innerHTML = '<i class="bi bi-plus-circle"></i> Add Node';

            container.appendChild(hiddenTextarea);
            container.appendChild(table);
            container.appendChild(addButton);
            formGroup.appendChild(container);
            // --- START: NEW PIXEL ART TABLE LOGIC ---
        } else if (type === 'pixelarttable') {
            const container = document.createElement('div');
            container.className = 'pixel-art-table-container';

            const hiddenTextarea = document.createElement('textarea');
            hiddenTextarea.id = controlId;
            hiddenTextarea.name = controlId;
            hiddenTextarea.style.display = 'none';
            hiddenTextarea.textContent = defaultValue;

            const framesContainer = document.createElement('div');
            framesContainer.className = 'd-flex flex-column gap-2'; // Use flexbox for spacing

            // --- START: THIS IS THE FIX ---
            // Extract the object ID from the property name (e.g., get "1" from "obj1_pixelArtFrames")
            let objectId = null;
            if (property) {
                const match = property.match(/^obj(\d+)_/);
                if (match) {
                    objectId = match[1];
                }
            }
            // --- END: THIS IS THE FIX ---

            let frames = [];
            try {
                frames = JSON.parse(defaultValue);
            } catch (e) { console.error("Could not parse pixel art frames for table.", e); }

            frames.forEach((frame, index) => {
                const frameItem = document.createElement('div');
                frameItem.className = 'pixel-art-frame-item border rounded p-2 bg-body';
                frameItem.dataset.index = index;

                // Use the newly extracted objectId to create a truly unique ID
                const textareaId = `frame-data-${objectId}-${index}`;
                const frameDataStr = frame.data || '[[0]]';

                frameItem.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <strong class="frame-item-header">Frame #${index + 1}</strong>
                        <button type="button" class="btn btn-sm btn-outline-danger btn-delete-frame" title="Delete Frame"><i class="bi bi-trash"></i></button>
                    </div>
                    <div>
                        <div class="d-flex justify-content-between align-items-center">
                            <label class="form-label-sm" for="${textareaId}">Frame Data</label>
                            <button type="button" class="btn btn-sm btn-outline-info" 
                                    data-bs-toggle="modal" 
                                    data-bs-target="#pixelArtEditorModal"
                                    data-target-id="${textareaId}">
                                <i class="bi bi-pencil-square"></i> Edit
                            </button>
                        </div>
                        <textarea class="form-control form-control-sm frame-data-input" id="${textareaId}" rows="6">${frameDataStr}</textarea>
                    </div>
                    <div class="mt-2">
                         <label class="form-label-sm">Duration (seconds)</label>
                        <input type="number" class="form-control form-control-sm frame-duration-input" value="${frame.duration || 1}" min="0.1" step="0.1">
                    </div>
                `;
                framesContainer.appendChild(frameItem);
            });

            const addButton = document.createElement('button');
            addButton.type = 'button';
            addButton.className = 'btn btn-sm btn-outline-success mt-2 btn-add-frame';
            addButton.innerHTML = '<i class="bi bi-plus-circle"></i> Add Frame';

            container.appendChild(hiddenTextarea);
            container.appendChild(framesContainer);
            container.appendChild(addButton);
            formGroup.appendChild(container);
            // --- END: REVISED PIXEL ART TABLE LOGIC ---
        }
        return formGroup;
    }

    /**
     * Generates the meta tags and JavaScript variables for the final exported HTML file.
     * This is where the "Minimize Properties" logic is applied.
     */
    function generateOutputScript() {
        let scriptHTML = '';
        let jsVars = '';
        let allKeys = [];
        const objectMetaPropMap = {};

        const minimize = document.getElementById('minimize-props-export')?.checked || false;
        const generalValues = getControlValues();

        configStore.filter(conf => !(conf.property || conf.name).startsWith('obj')).forEach(conf => {
            const key = conf.property || conf.name;
            if (generalValues[key] !== undefined) {
                allKeys.push(key);
                let exportValue = generalValues[key];
                if (conf.name && !conf.property) {
                    scriptHTML += `<meta ${key}="${exportValue}" />\n`;
                } else {
                    let finalExportValue = exportValue;
                    if (typeof finalExportValue === 'string') {
                        finalExportValue = finalExportValue.replace(/"/g, '&quot;');
                    }
                    const attrs = [`property="${conf.property}"`, `label="${conf.label}"`, `type="${conf.type}"`];
                    if (conf.values) {
                        const sortedValues = conf.values.split(',').sort().join(',');
                        attrs.push(`values="${sortedValues}"`);
                    }
                    if (conf.min) attrs.push(`min="${conf.min}"`);
                    if (conf.max) attrs.push(`max="${conf.max}"`);
                    scriptHTML += `<meta ${attrs.join(' ')} default="${finalExportValue}" />\n`;
                }
            }
        });

        objects.forEach(obj => {
            const name = obj.name || `Object ${obj.id}`;
            objectMetaPropMap[obj.id] = [];
            const objectConfigs = configStore.filter(c => c.property && c.property.startsWith(`obj${obj.id}_`));
            const validPropsForShape = shapePropertyMap[obj.shape] || shapePropertyMap['rectangle'];

            objectConfigs.forEach(conf => {
                const propName = conf.property.substring(conf.property.indexOf('_') + 1);
                let liveValue = obj[propName];

                if (propName.startsWith('gradColor')) {
                    liveValue = obj.gradient[propName.replace('gradColor', 'color')];
                } else if (propName.startsWith('strokeGradColor')) {
                    liveValue = obj.strokeGradient[propName.replace('strokeGradColor', 'color')];
                } else if (propName === 'scrollDir') {
                    liveValue = obj.scrollDirection;
                } else if (propName === 'strokeScrollDir') {
                    liveValue = obj.strokeScrollDir;
                }

                if (liveValue === undefined) {
                    liveValue = conf.default;
                    if (conf.type === 'boolean') liveValue = (liveValue === 'true');
                }

                allKeys.push(conf.property);
                let exportValue = liveValue;
                let exportType = conf.type;

                // FIX: Force the type to be 'textfield' for SignalRGB compatibility.
                if (propName === 'pixelArtFrames' || propName === 'spawn_svg_path') {
                    exportType = 'textfield';
                }

                const propsToScale = ['x', 'y', 'width', 'height', 'innerDiameter', 'fontSize', 'lineWidth', 'strokeWidth', 'pulseDepth', 'vizLineWidth', 'strimerBlockSize', 'pathAnim_size', 'pathAnim_speed', 'pathAnim_objectSpacing', 'pathAnim_trailLength'];
                if (conf.type === 'number' && typeof liveValue === 'number') {
                    exportValue = propsToScale.includes(propName) ? Math.round(liveValue / 4) : Math.round(liveValue);
                } else if (typeof liveValue === 'boolean') {
                    exportValue = String(liveValue);
                }

                const isApplicable = validPropsForShape.includes(propName);
                const objectSpecificProps = ['shape', 'x', 'y', 'width', 'height', 'rotation'];
                let writeAsMeta;

                if (!minimize) {
                    // If not minimizing, any applicable property is editable.
                    writeAsMeta = isApplicable;
                } else {
                    // When minimizing, logic is more restrictive.

                    // START OF THE FIX
                    // This comprehensive array defines all core structural properties that MUST be hard-coded.
                    const coreShapeParams = [
                        // Grid
                        'numberOfRows', 'numberOfColumns',
                        // Polygon/Star
                        'sides', 'points', 'starInnerRadius',
                        // Ring
                        'innerDiameter', 'angularWidth', 'numberOfSegments',
                        // Oscilloscope
                        'lineWidth', 'waveType', 'frequency', 'oscDisplayMode', 'pulseDepth', 'waveStyle', 'waveCount',
                        // --- ADDED FOR TETRIS ---
                        'tetrisBlockCount', 'tetrisAnimation', 'tetrisSpeed', 'tetrisBounce', 'tetrisHoldTime',
                        // --- ADDED FOR TEXT ---
                        'text', 'fontSize', 'textAlign', 'pixelFont', 'textAnimation', 'textAnimationSpeed', 'showTime', 'showDate',
                        // Fire
                        'fireSpread',
                        // Visualizer
                        'vizLayout', 'vizDrawStyle', 'vizStyle', 'vizBarCount', 'vizBarSpacing', 'vizUseSegments', 'vizSegmentCount', 'vizSegmentSpacing', 'vizInnerRadius',
                        // Strimer
                        'strimerColumns', 'strimerBlockCount', 'strimerAnimation', 'strimerRows', 'strimerBlockSize', 'strimerDirection', 'strimerEasing', 'strimerSnakeDirection',
                        // Spawner
                        'spawn_shapeType', 'spawn_animation', 'spawn_count', 'spawn_lifetime', 'spawn_speed', 'spawn_gravity', 'spawn_spread',
                        // Polyline
                        'polylineCurveStyle', 'pathAnim_shape', 'pathAnim_behavior', 'pathAnim_objectCount'
                    ];

                    // Now, check against both the transform properties AND the new core shape properties.
                    if (objectSpecificProps.includes(propName) || coreShapeParams.includes(propName)) {
                        writeAsMeta = false; // Always hard-code these fundamental properties.
                        // END OF THE FIX
                    } else {
                        // For other properties, only make them editable if their parent feature is enabled.
                        let featureIsEnabled = true; // Default for properties without a specific enable flag.

                        if (propName.startsWith('sensor') && propName !== 'enableSensorReactivity') {
                            featureIsEnabled = obj.enableSensorReactivity === true;
                        } else if (propName.startsWith('audio') && propName !== 'enableAudioReactivity') {
                            featureIsEnabled = obj.enableAudioReactivity === true;
                        } else if (propName.startsWith('stroke') && propName !== 'enableStroke') {
                            featureIsEnabled = obj.enableStroke === true;
                        } else if (propName.startsWith('pathAnim_') && propName !== 'pathAnim_enable') {
                            featureIsEnabled = obj.pathAnim_enable === true;
                        }

                        writeAsMeta = isApplicable && featureIsEnabled;
                    }
                }

                // Always hard-code complex data types regardless of the minimize setting.
                if (propName === 'polylineNodes' || propName === 'pixelArtFrames' || propName === 'spawn_svg_path') {
                    writeAsMeta = false;
                }

                if (writeAsMeta) {
                    objectMetaPropMap[obj.id].push(propName);
                    conf.label = `${name}: ${conf.label.split(':').slice(1).join(':').trim()}`;
                    const attrs = [`property="${conf.property}"`, `label="${conf.label}"`, `type="${exportType}"`];
                    if (conf.values) {
                        const sortedValues = conf.values.split(',').sort().join(',');
                        attrs.push(`values="${sortedValues}"`);
                    }
                    if (conf.min) attrs.push(`min="${conf.min}"`);
                    if (conf.max) attrs.push(`max="${conf.max}"`);
                    let finalExportValue = exportValue;

                    if (typeof finalExportValue === 'object' && finalExportValue !== null) {
                        finalExportValue = JSON.stringify(finalExportValue);
                    }

                    if (typeof finalExportValue === 'string') {
                        finalExportValue = finalExportValue.replace(/"/g, '&quot;');
                    }
                    scriptHTML += `<meta ${attrs.join(' ')} default="${finalExportValue}" />\n`;
                } else {
                    if (propName === 'polylineNodes' && Array.isArray(exportValue)) {
                        // Manually scale down the node coordinates for export.
                        const scaledNodes = exportValue.map(node => ({
                            x: Math.round(node.x / 4),
                            y: Math.round(node.y / 4)
                        }));
                        jsVars += `const ${conf.property} = ${JSON.stringify(scaledNodes)};\n`;
                    } else {
                        jsVars += `const ${conf.property} = ${JSON.stringify(exportValue)};\n`;
                    }
                }
            });
        });

        return { metaTags: scriptHTML.trim(), jsVars: jsVars.trim(), allKeys: allKeys, objectMetaPropMap };
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

                    // FIX: Ensure complex properties are stringified before being saved to the config store.
                    const complexProps = ['pixelArtFrames', 'polylineNodes', 'spawn_svg_path'];
                    if (complexProps.includes(propName) && typeof liveValue === 'object') {
                        newConf.default = JSON.stringify(liveValue);
                    } else {
                        newConf.default = liveValue;
                    }
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

        // Update this for a new property
        //Tabs
        const controlGroupMap = {
            'Geometry': { props: ['shape', 'x', 'y', 'width', 'height', 'rotation', 'rotationSpeed', 'autoWidth', 'innerDiameter', 'numberOfSegments', 'angularWidth', 'sides', 'points', 'starInnerRadius'], icon: 'bi-box-fill' },
            'Polyline': { props: ['polylineNodes', 'polylineCurveStyle'], icon: 'bi-vector-pen' },
            'Stroke': { props: ['enableStroke', 'strokeWidth', 'strokeGradType', 'strokeUseSharpGradient', 'strokeGradientStop', 'strokeGradColor1', 'strokeGradColor2', 'strokeCycleColors', 'strokeCycleSpeed', 'strokeAnimationSpeed', 'strokeRotationSpeed', 'strokeAnimationMode', 'strokePhaseOffset', 'strokeScrollDir'], icon: 'bi-brush-fill' },
            'Object': { props: ['pathAnim_enable', 'pathAnim_shape', 'pathAnim_size', 'pathAnim_speed', 'pathAnim_behavior', 'pathAnim_objectCount', 'pathAnim_objectSpacing', 'pathAnim_trail', 'pathAnim_trailLength', 'pathAnim_trailColor'], icon: 'bi-box-seam' },
            'Object Fill': { props: ['pathAnim_gradType', 'pathAnim_gradColor1', 'pathAnim_gradColor2', 'pathAnim_useSharpGradient', 'pathAnim_gradientStop', 'pathAnim_animationMode', 'pathAnim_animationSpeed', 'pathAnim_scrollDir', 'pathAnim_cycleColors', 'pathAnim_cycleSpeed'], icon: 'bi-palette-fill' },
            'Fill-Animation': { props: ['gradType', 'gradColor1', 'gradColor2', 'cycleColors', 'useSharpGradient', 'gradientStop', 'animationMode', 'scrollDir', 'phaseOffset', 'numberOfRows', 'numberOfColumns', 'animationSpeed', 'cycleSpeed', 'fillShape'], icon: 'bi-palette-fill' },
            'Text': { props: ['text', 'fontSize', 'textAlign', 'pixelFont', 'textAnimation', 'textAnimationSpeed', 'showTime', 'showDate'], icon: 'bi-fonts' },
            'Oscilloscope': { props: ['lineWidth', 'waveType', 'frequency', 'oscDisplayMode', 'pulseDepth', 'enableWaveAnimation', 'oscAnimationSpeed', 'waveStyle', 'waveCount'], icon: 'bi-graph-up-arrow' },
            'Tetris': { props: ['tetrisBlockCount', 'tetrisAnimation', 'tetrisSpeed', 'tetrisBounce', 'tetrisHoldTime'], icon: 'bi-grid-3x3-gap-fill' },
            'Fire': { props: ['fireSpread'], icon: 'bi-fire' },
            'Pixel Art': { props: ['pixelArtFrames'], icon: 'bi-image-fill' },
            'Visualizer': { props: ['vizLayout', 'vizDrawStyle', 'vizStyle', 'vizLineWidth', 'vizAutoScale', 'vizMaxBarHeight', 'vizBarCount', 'vizBarSpacing', 'vizSmoothing', 'vizUseSegments', 'vizSegmentCount', 'vizSegmentSpacing', 'vizInnerRadius', 'vizBassLevel', 'vizTrebleBoost', 'vizGain', 'vizLowCutoff', 'vizHighCutoff', 'vizDownsampleFactor'], icon: 'bi-bar-chart-line-fill' },
            'Audio Responsiveness': { props: ['enableAudioReactivity', 'audioTarget', 'audioMetric', 'beatThreshold', 'audioSensitivity', 'audioSmoothing'], icon: 'bi-mic-fill' },
            'Sensor Responsiveness': { props: ['enableSensorReactivity', 'sensorTarget', 'userSensor', 'timePlotLineThickness', 'timePlotFillArea', 'sensorMeterShowValue', 'timePlotAxesStyle', 'timePlotTimeScale', 'sensorColorMode', 'sensorMidThreshold', 'sensorMaxThreshold'], icon: 'bi-cpu-fill' },
            'Strimer': { props: ['strimerRows', 'strimerColumns', 'strimerBlockCount', 'strimerBlockSize', 'strimerAnimation', 'strimerAnimationSpeed', 'strimerDirection', 'strimerEasing', 'strimerBlockSpacing', 'strimerGlitchFrequency', 'strimerAudioSensitivity', 'strimerBassLevel', 'strimerTrebleBoost', 'strimerAudioSmoothing', 'strimerPulseSpeed', 'strimerSnakeDirection'], icon: 'bi-segmented-nav' },
            'Spawner': { props: ['spawn_animation', 'spawn_count', 'spawn_spawnRate', 'spawn_lifetime', 'spawn_speed', 'spawn_speedVariance', 'spawn_gravity', 'spawn_spread'], icon: 'bi-broadcast' },
            'Particle': { props: ['spawn_shapeType', 'spawn_size', 'spawn_size_randomness', 'spawn_rotationSpeed', 'spawn_rotationVariance', 'spawn_initialRotation_random', 'spawn_matrixCharSet', 'spawn_matrixTrailLength', 'spawn_matrixEnableGlow', 'spawn_matrixGlowSize', 'spawn_matrixGlowColor', 'spawn_svg_path', 'spawn_enableTrail', 'spawn_trailLength', 'spawn_trailSpacing'], icon: 'bi-stars' }
        };
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
        const overrideControlKeys = ['enablePalette', 'paletteColor1', 'paletteColor2', 'enableGlobalCycle', 'globalCycleSpeed'];
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
            'gradType', 'useSharpGradient', 'gradientStop', 'gradColor1', 'gradColor2',
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
            updateField('gradientStop', obj.gradientStop);
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
            const originalGradient = { ...obj.gradient };
            const originalStrokeGradient = { ...obj.strokeGradient };
            const originalCycleColors = obj.cycleColors;
            const originalCycleSpeed = obj.cycleSpeed;

            // 2. Apply ALL global overrides directly to the object's state
            if (globalCycle.enable) {
                obj.cycleColors = true;
                obj.cycleSpeed = (globalCycle.speed || 0) / 50.0;
            }
            if (palette.enablePalette) {
                const pColor1 = palette.paletteColor1;
                const pColor2 = palette.paletteColor2;
                obj.gradient.color1 = pColor1;
                obj.gradient.color2 = pColor2;
                obj.strokeGradient.color1 = pColor1;
                obj.strokeGradient.color2 = pColor2;
            }

            // 3. Animate and Draw the object using the (potentially overridden) state
            obj.updateAnimationState(audioData, sensorData, deltaTime);
            obj.draw(selectedObjectIds.includes(obj.id), audioData, {}); // Pass an empty palette now

            // 4. Restore the object's original state for the next frame
            obj.gradient = originalGradient;
            obj.strokeGradient = originalStrokeGradient;
            obj.cycleColors = originalCycleColors;
            obj.cycleSpeed = originalCycleSpeed;

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
            ctx.resetTransform(); // Draw in screen space, not subject to object transforms
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

    // MODIFIED - A new, time-based animation loop using delta time
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

        let audioData = {};
        let sensorData = {};

        if (isAudioSetup && soundEnabled) {
            // Case 1: Real audio is connected and enabled. Use it.
            audioData = getAudioMetrics();
        } else {
            // Case 2: In all other situations (no real audio, or sound is disabled), generate the mock preview data.
            const time = now / 1000;
            const randomRate = (Math.sin(time * 0.1) + 1.2); // Slower rate of change
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

        const neededSensors = [...new Set(objects.map(o => o.userSensor).filter(Boolean))];

        neededSensors.forEach((sensorName, index) => {
            // By adding the sensor's index to the sine function, each wave gets a unique phase offset.
            const mockValue = Math.sin(now / 2000 + index) * 50 + 50;
            sensorData[sensorName] = {
                value: mockValue,
                min: 0,
                max: 100
            };
        });

        const paletteProps = {
            enablePalette: generalValues.enablePalette,
            paletteColor1: generalValues.paletteColor1,
            paletteColor2: generalValues.paletteColor2
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

        // This list now includes the missing polyline animation properties.
        const propsToScale = ['x', 'y', 'width', 'height', 'innerDiameter', 'fontSize', 'lineWidth', 'strokeWidth', 'pulseDepth', 'vizLineWidth', 'strimerBlockSize', 'pathAnim_size', 'pathAnim_speed', 'pathAnim_objectSpacing', 'pathAnim_trailLength'];

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
                    value = el.value;
                }

                if (propsToScale.includes(key)) {
                    value *= 4;
                }

                if (key.startsWith('gradColor')) {
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

        generateOutputScript();
    }

    /**
     * Reads all properties from the 'objects' array and updates the form inputs to match.
     */
    function updateFormValuesFromObjects() {
        // This list now includes the missing polyline animation properties.
        const propsToScale = ['x', 'y', 'width', 'height', 'innerDiameter', 'fontSize', 'lineWidth', 'strokeWidth', 'pulseDepth', 'vizLineWidth', 'strimerBlockSize', 'pathAnim_size', 'pathAnim_speed', 'pathAnim_objectSpacing', 'pathAnim_trailLength'];

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
                } else if (key === 'gradient') {
                    updateField('gradColor1', obj.gradient.color1);
                    updateField('gradColor2', obj.gradient.color2);
                } else if (key === 'strokeGradient') {
                    updateField('strokeGradColor1', obj.strokeGradient.color1);
                    updateField('strokeGradColor2', obj.strokeGradient.color2);
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
                    value = String(value).replace(/\\n/g, '\n');
                }

                const propsToScale = ['x', 'y', 'width', 'height', 'innerDiameter', 'fontSize', 'lineWidth', 'strokeWidth', 'pulseDepth', 'vizLineWidth', 'strimerBlockSize', 'pathAnim_size', 'pathAnim_speed', 'pathAnim_objectSpacing', 'pathAnim_trailLength'];
                if (propsToScale.includes(key) && typeof value === 'number') {
                    value *= 4;
                }

                if (key.startsWith('gradColor')) {
                    configForThisObject.gradient[key.replace('grad', '').toLowerCase()] = value;
                } else if (key.startsWith('strokeGradColor')) {
                    configForThisObject.strokeGradient[key.replace('strokeGradColor', 'color').toLowerCase()] = value;
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
     * Directly updates the live objects with the scaled, correct values from the configStore.
     * This bypasses the HTML form to avoid timing issues during initial load.
     */
    function syncObjectsWithConfigStore() {
        const propsToScale = ['x', 'y', 'width', 'height', 'innerDiameter', 'fontSize', 'lineWidth', 'strokeWidth', 'pulseDepth', 'vizLineWidth', 'strimerBlockSize', 'pathAnim_size', 'pathAnim_speed', 'pathAnim_objectSpacing', 'pathAnim_trailLength'];

        objects.forEach(obj => {
            const objectConfigs = configStore.filter(c => c.property && c.property.startsWith(`obj${obj.id}_`));
            const newProps = {};

            objectConfigs.forEach(conf => {
                const key = conf.property.substring(conf.property.indexOf('_') + 1);
                let value = conf.default;

                if (conf.type === 'number') value = parseFloat(value);
                else if (conf.type === 'boolean') value = (String(value).toLowerCase() === 'true');

                if (propsToScale.includes(key) && typeof value === 'number') {
                    value *= 4;
                }

                if (key.startsWith('gradColor')) {
                    if (!newProps.gradient) newProps.gradient = {};
                    newProps.gradient[key.replace('grad', '').toLowerCase()] = value;
                } else if (key.startsWith('strokeGradColor')) {
                    if (!newProps.strokeGradient) newProps.strokeGradient = {};
                    newProps.strokeGradient[key.replace('strokeGradColor', 'color').toLowerCase()] = value;
                } else if (key === 'scrollDir') {
                    newProps.scrollDirection = value;
                } else if (key === 'strokeScrollDir') {
                    newProps.strokeScrollDir = value;
                } else {
                    newProps[key] = value;
                }
            });
            obj.update(newProps);
        });
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

            const orderedObjectIds = [];
            const seenIds = new Set();
            loadedConfigs.forEach(c => {
                const match = (c.property || '').match(/^obj(\d+)_/);
                if (match) {
                    const id = parseInt(match[1], 10);
                    if (!seenIds.has(id)) {
                        seenIds.add(id);
                        orderedObjectIds.push(id);
                    }
                }
            });
            const objectIds = orderedObjectIds;
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

            syncObjectsWithConfigStore();
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
     * Generates a filtered set of default configurations for a specific shape type.
     * @param {string} shapeType - The type of shape (e.g., 'rectangle', 'circle').
     * @param {number} newId - The ID for the new object.
     * @returns {object[]} An array of default configuration objects suitable for the given shape.
     */
    function getDefaultsForShape(shapeType, newId) {
        const fullConfig = getDefaultObjectConfig(newId);
        const validProps = shapePropertyMap[shapeType] || shapePropertyMap['rectangle'];

        return fullConfig.filter(conf => {
            const propName = conf.property.substring(conf.property.indexOf('_') + 1);
            return validProps.includes(propName);
        });
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
            { property: `obj${newId}_shape`, label: `Object ${newId}: Shape`, type: 'combobox', default: 'rectangle', values: 'rectangle,circle,ring,polygon,star,text,oscilloscope,tetris,fire,fire-radial,pixel-art,audio-visualizer,spawner,strimer,polyline', description: 'The basic shape of the object.' }, // MODIFIED: Added 'spawner'
            { property: `obj${newId}_x`, label: `Object ${newId}: X Position`, type: 'number', default: '10', min: '0', max: '320', description: 'The horizontal position of the object on the canvas.' },
            { property: `obj${newId}_y`, label: `Object ${newId}: Y Position`, type: 'number', default: '10', min: '0', max: '200', description: 'The vertical position of the object on the canvas.' },
            { property: `obj${newId}_width`, label: `Object ${newId}: Width`, type: 'number', default: '50', min: '2', max: '320', description: 'The width of the object.' },
            { property: `obj${newId}_height`, label: `Object ${newId}: Height`, type: 'number', default: '38', min: '2', max: '200', description: 'The height of the object.' },
            { property: `obj${newId}_rotation`, label: `Object ${newId}: Rotation`, type: 'number', default: '0', min: '-360', max: '360', description: 'The static rotation of the object in degrees.' },

            // Fill Style & Animation
            { property: `obj${newId}_fillShape`, label: `Object ${newId}: Fill Shape`, type: 'boolean', default: 'false', description: 'Fills the interior of the shape with the selected fill style. For polylines, this will close the path.' },
            { property: `obj${newId}_gradType`, label: `Object ${newId}: Fill Type`, type: 'combobox', default: 'linear', values: 'solid,linear,radial,conic,alternating,random,rainbow,rainbow-radial,rainbow-conic', description: 'The type of color fill or gradient to use.' },
            { property: `obj${newId}_useSharpGradient`, label: `Object ${newId}: Use Sharp Gradient`, type: 'boolean', default: 'false', description: 'If checked, creates a hard line between colors in Linear/Radial gradients instead of a smooth blend.' },
            { property: `obj${newId}_gradientStop`, label: `Object ${newId}: Gradient Stop %`, type: 'number', default: '50', min: '0', max: '100', description: 'For sharp gradients, this is the percentage width of the primary color band.' },
            { property: `obj${newId}_gradColor1`, label: `Object ${newId}: Color 1`, type: 'color', default: '#00ff00', description: 'The starting color for gradients and solid fills.' },
            { property: `obj${newId}_gradColor2`, label: `Object ${newId}: Color 2`, type: 'color', default: '#d400ff', description: 'The ending color for gradients.' },
            { property: `obj${newId}_animationMode`, label: `Object ${newId}: Animation Mode`, type: 'combobox', values: 'loop,bounce,bounce-reversed,bounce-random', default: 'loop', description: 'Determines how the gradient animation behaves.' },
            { property: `obj${newId}_animationSpeed`, label: `Object ${newId}: Animation Speed`, type: 'number', default: '2', min: '0', max: '100', description: 'Master speed for gradient scroll, random color flicker, and oscilloscope movement.' },
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
            { property: `obj${newId}_tetrisAnimation`, label: `Object ${newId}: Drop Physics`, type: 'combobox', values: 'gravity,linear,gravity-fade,fade-in-stack,fade-in-out', default: 'gravity', description: '(Tetris) The physics governing how the blocks fall. Gravity-fade removes blocks as they settle.' },
            { property: `obj${newId}_tetrisSpeed`, label: `Object ${newId}: Drop/Fade-in Speed`, type: 'number', default: '5', min: '1', max: '100', description: '(Tetris) The speed of the drop animation.' },
            { property: `obj${newId}_tetrisBounce`, label: `Object ${newId}: Bounce Factor`, type: 'number', default: '50', min: '0', max: '90', description: '(Tetris) How much the blocks bounce on impact. 0 is no bounce.' },
            { property: `obj${newId}_tetrisHoldTime`, label: `Object ${newId}: Hold Time`, type: 'number', default: '50', min: '0', max: '200', description: '(Tetris) For fade-in-out, the time blocks remain visible before fading out.' }, // <-- Add this new object
            { property: `obj${newId}_fireSpread`, label: `Object ${newId}: Fire Spread %`, type: 'number', default: '100', min: '1', max: '100', description: '(fire-radial) Controls how far the flames spread from the center.' },

            // Stroke Fill
            { property: `obj${newId}_enableStroke`, label: `Object ${newId}: Enable Stroke`, type: 'boolean', default: 'false', description: 'Enables a stroke (outline) for the shape.' },
            { property: `obj${newId}_strokeWidth`, label: `Object ${newId}: Stroke Width`, type: 'number', default: '2', min: '1', max: '50', description: 'The thickness of the shape\'s stroke.' },
            { property: `obj${newId}_strokeGradType`, label: `Object ${newId}: Stroke Type`, type: 'combobox', default: 'solid', values: 'solid,linear,radial,conic,alternating,random,rainbow,rainbow-radial,rainbow-conic', description: 'The type of color fill or gradient to use for the stroke.' },
            { property: `obj${newId}_strokeUseSharpGradient`, label: `Object ${newId}: Stroke Use Sharp Gradient`, type: 'boolean', default: 'false', description: 'If checked, creates a hard line between colors in the stroke gradient instead of a smooth blend.' },
            { property: `obj${newId}_strokeGradientStop`, label: `Object ${newId}: Stroke Gradient Stop %`, type: 'number', default: '50', min: '0', max: '100', description: 'For sharp stroke gradients, this is the percentage width of the primary color band.' },
            { property: `obj${newId}_strokeGradColor1`, label: `Object ${newId}: Stroke Color 1`, type: 'color', default: '#FFFFFF', description: 'The starting color for the stroke gradient.' },
            { property: `obj${newId}_strokeGradColor2`, label: `Object ${newId}: Stroke Color 2`, type: 'color', default: '#000000', description: 'The ending color for the stroke gradient.' },
            { property: `obj${newId}_strokeAnimationMode`, label: `Object ${newId}: Stroke Animation Mode`, type: 'combobox', values: 'loop,bounce,bounce-reversed,bounce-random', default: 'loop', description: 'Determines how the stroke gradient animation behaves.' },
            { property: `obj${newId}_strokeAnimationSpeed`, label: `Object ${newId}: Stroke Animation Speed`, type: 'number', default: '2', min: '0', max: '100', description: 'Controls the scroll speed of the stroke gradient animation.' },
            { property: `obj${newId}_strokeCycleColors`, label: `Object ${newId}: Cycle Stroke Colors`, type: 'boolean', default: 'false', description: 'Animates the stroke colors by cycling through the color spectrum.' },
            { property: `obj${newId}_strokeCycleSpeed`, label: `Object ${newId}: Stroke Color Cycle Speed`, type: 'number', default: '10', min: '0', max: '100', description: 'The speed at which stroke colors cycle when "Cycle Stroke Colors" is enabled.' },
            { property: `obj${newId}_strokeRotationSpeed`, label: `Object ${newId}: Stroke Rotation Speed`, type: 'number', default: '0', min: '-100', max: '100', description: 'The continuous rotation speed of the stroke\'s conic gradient pattern.' },
            { property: `obj${newId}_strokeScrollDir`, label: `Object ${newId}: Stroke Scroll Direction`, type: 'combobox', default: 'right', values: 'right,left,up,down,along-path,along-path-reversed', description: 'The direction the stroke gradient animation moves. "Along Path" is for Polylines only.' },
            { property: `obj${newId}_strokePhaseOffset`, label: `Object ${newId}: Stroke Phase Offset`, type: 'number', default: '10', min: '0', max: '100', description: 'Offsets the stroke gradient animation for each item in a grid, creating a cascading effect.' },

            //Audiop
            { property: `obj${newId}_enableAudioReactivity`, label: `Object ${newId}: Enable Sound Reactivity`, type: 'boolean', default: 'false', description: 'Enables the object to react to sound.' },
            { property: `obj${newId}_audioTarget`, label: `Object ${newId}: Reactive Property`, type: 'combobox', default: 'Flash', values: 'none,Flash,Size,Rotation,Volume Meter,Path Speed', description: 'Which property of the object will be affected by the sound.' },
            { property: `obj${newId}_audioMetric`, label: `Object ${newId}: Audio Metric`, type: 'combobox', default: 'volume', values: 'volume,bass,mids,highs', description: 'Which part of the audio spectrum to react to.' },
            { property: `obj${newId}_beatThreshold`, label: `Object ${newId}: Beat Threshold`, type: 'number', default: '30', min: '1', max: '100', description: 'Sensitivity for beat detection. Higher values are MORE sensitive. Default is 30.' },
            { property: `obj${newId}_audioSensitivity`, label: `Object ${newId}: Sensitivity`, type: 'number', default: '50', min: '0', max: '200', description: 'How strongly the object reacts to the audio metric.' },
            { property: `obj${newId}_audioSmoothing`, label: `Object ${newId}: Smoothing`, type: 'number', default: '50', min: '0', max: '99', description: 'Smooths out the reaction to prevent flickering. Higher values are smoother.' },
            { property: `obj${newId}_autoWidth`, label: `Object ${newId}: Auto-Width`, type: 'boolean', default: 'false', description: 'For text objects, automatically sets the object\'s width to the width of the text.' },
            { property: `obj${newId}_pixelArtFrames`, label: `Object ${newId}: Pixel Art Frames`, type: 'pixelarttable', default: '[{"data":"[[1,0,0,1],[0,1,1,0],[0,1,1,0],[1,0,0,1]]","duration":1}]', description: '(Pixel Art) Manage animation frames. Each frame has data and a duration in seconds.' },

            // Audio visualizer specific
            { property: `obj${newId}_vizSmoothing`, label: `Object ${newId}: Smoothing`, type: 'number', default: '60', min: '0', max: '99', description: '(Visualizer) How smoothly the bars react to audio changes. Higher is smoother.' },
            { property: `obj${newId}_vizDrawStyle`, label: `Object ${newId}: Draw Style`, type: 'combobox', default: 'Line', values: 'Bars,Line,Area', description: '(Visualizer) How the frequencies are rendered (as bars or a continuous line).' },
            { property: `obj${newId}_vizLayout`, label: `Object ${newId}: Layout`, type: 'combobox', default: 'Linear', values: 'Linear,Circular', description: '(Visualizer) The overall layout of the visualizer.' },
            { property: `obj${newId}_vizStyle`, label: `Object ${newId}: Style`, type: 'combobox', default: 'bottom', values: 'bottom,center,top', description: '(Visualizer) The alignment of the visualizer bars.' },
            { property: `obj${newId}_vizInnerRadius`, label: `Object ${newId}: Inner Radius`, type: 'number', default: '40', min: '0', max: '95', description: '(Visualizer) Sets the radius of the empty inner circle, as a percentage of the total size.' },
            { property: `obj${newId}_vizLineWidth`, label: `Object ${newId}: Line Width`, type: 'number', default: '2', min: '1', max: '20', description: '(Visualizer) The thickness of the line for the Line/Area draw styles.' },
            { property: `obj${newId}_vizAutoScale`, label: `Object ${newId}: Auto-Scale Height`, type: 'boolean', default: 'true', description: '(Visualizer) If checked, the tallest bar will always reach the top of the shape.' },
            { property: `obj${newId}_vizBarCount`, label: `Object ${newId}: Bar Count`, type: 'number', default: '12', min: '1', max: '128', description: '(Visualizer) The number of frequency bars to display.' },
            { property: `obj${newId}_vizBarSpacing`, label: `Object ${newId}: Bar Spacing`, type: 'number', default: '2', min: '0', max: '20', description: '(Visualizer) The space between each bar in pixels.' },
            { property: `obj${newId}_vizMaxBarHeight`, label: `Object ${newId}: Max Bar Height`, type: 'number', default: '30', min: '5', max: '100', description: '(Visualizer) Sets the maximum possible length for any visualizer bar, as a percentage of the available space.' },
            { property: `obj${newId}_vizUseSegments`, label: `Object ${newId}: Use LED Segments`, type: 'boolean', default: 'false', description: '(Visualizer) Renders bars as discrete segments instead of solid blocks.' },
            { property: `obj${newId}_vizSegmentCount`, label: `Object ${newId}: Segment Count`, type: 'number', default: '16', min: '2', max: '64', description: '(Visualizer) The number of vertical LED segments the bar is divided into.' },
            { property: `obj${newId}_vizSegmentSpacing`, label: `Object ${newId}: Segment Spacing`, type: 'number', default: '1', min: '0', max: '10', description: '(Visualizer) The spacing between segments in a bar.' },
            { property: `obj${newId}_vizBassLevel`, label: `Object ${newId}: Bass Level`, type: 'number', default: '50', min: '0', max: '1000', description: '(Visualizer) Multiplier for the lowest frequency bars. 100 is normal.' },
            { property: `obj${newId}_vizTrebleBoost`, label: `Object ${newId}: Treble Boost`, type: 'number', default: '125', min: '0', max: '1000', description: '(Visualizer) Multiplier for the highest frequency bars.' },
            { property: `obj${newId}_vizGain`, label: `Object ${newId}: Gain`, type: 'number', default: '100', min: '0', max: '1000', description: '(Visualizer) The overall gain of the visualizer to audio. 100 is normal.' },
            { property: `obj${newId}_vizLowCutoff`, label: `Object ${newId}: Low Frequency Cutoff (%)`, type: 'number', default: '0', min: '0', max: '100', description: '(Visualizer) Cuts off frequencies below this percentage of the spectrum.' },
            { property: `obj${newId}_vizHighCutoff`, label: `Object ${newId}: High Frequency Cutoff (%)`, type: 'number', default: '100', min: '0', max: '100', description: '(Visualizer) Cuts off frequencies above this percentage of the spectrum.' },
            { property: `obj${newId}_vizDownsampleFactor`, label: `Object ${newId}: Downsample Factor`, type: 'number', default: '1', min: '1', max: '16', description: '(Visualizer) Reduces frequency data resolution for performance. 1 = Off. 4 = Use every 4th data point.' },

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
            { property: `obj${newId}_strimerSnakeDirection`, label: `Object ${newId}: Snake Direction`, type: 'combobox', default: 'Vertical', values: 'Horizontal,Vertical', description: '(Strimer) The direction of the snake. Vertical (along the colum), Horizontal (across the columns).' },
            { property: `obj${newId}_strimerBlockSpacing`, label: `Object ${newId}: Block Spacing`, type: 'number', default: '5', min: '0', max: '50', description: '(Cascade) The vertical spacing between blocks in a cascade.' },
            { property: `obj${newId}_strimerGlitchFrequency`, label: `Object ${newId}: Glitch Frequency`, type: 'number', default: '0', min: '0', max: '100', description: '(Glitch) How often blocks stutter or disappear. 0 is off.' },
            { property: `obj${newId}_strimerPulseSync`, label: `Object ${newId}: Sync Columns`, type: 'boolean', default: 'true', description: '(Pulse) If checked, all columns pulse together. If unchecked, they pulse sequentially.' },
            { property: `obj${newId}_strimerAudioSensitivity`, label: `Object ${newId}: Audio Sensitivity`, type: 'number', default: '100', min: '0', max: '200', description: '(Audio Meter) Multiplies the height of the audio bars. 100 is normal.' },
            { property: `obj${newId}_strimerBassLevel`, label: `Object ${newId}: Bass Level`, type: 'number', default: '50', min: '0', max: '200', description: '(Audio Meter) Multiplier for the bass column(s). 100 is normal.' },
            { property: `obj${newId}_strimerTrebleBoost`, label: `Object ${newId}: Treble Boost`, type: 'number', default: '150', min: '0', max: '200', description: '(Audio Meter) Multiplier for the treble/volume columns.' },
            { property: `obj${newId}_strimerAudioSmoothing`, label: `Object ${newId}: Audio Smoothing`, type: 'number', default: '60', min: '0', max: '99', description: '(Audio Meter) Smooths out the bar movement. Higher is smoother.' },
            { property: `obj${newId}_strimerPulseSpeed`, label: `Object ${newId}: Pulse Speed`, type: 'number', default: '0', min: '0', max: '100', description: '(Modifier) Speed of the breathing/pulse effect. Applied on top of other animations. 0 is off.' },

            //Spawner
            { property: `obj${newId}_spawn_shapeType`, label: `Object ${newId}: Particle Shape`, type: 'combobox', values: 'rectangle,circle,polygon,star,sparkle,custom,matrix,random', default: 'circle', description: '(Spawner) The geometric shape of the emitted particles. "Random" will pick a shape for each particle individually.' },
            { property: `obj${newId}_spawn_animation`, label: `Object ${newId}: Emitter Style`, type: 'combobox', values: 'explode,fountain,rain,flow', default: 'explode', description: '(Spawner) The behavior and direction of particle emission.' },
            { property: `obj${newId}_spawn_count`, label: `Object ${newId}: Max Particles`, type: 'number', default: '100', min: '1', max: '500', description: '(Spawner) The maximum number of particles on screen at once.' },
            { property: `obj${newId}_spawn_spawnRate`, label: `Object ${newId}: Spawn Rate`, type: 'number', default: '50', min: '0', max: '500', description: '(Spawner) How many new particles are created per second.' },
            { property: `obj${newId}_spawn_lifetime`, label: `Object ${newId}: Lifetime (s)`, type: 'number', default: '3', min: '0.1', max: '20', description: '(Spawner) How long each particle lasts, in seconds.' },
            { property: `obj${newId}_spawn_speed`, label: `Object ${newId}: Initial Speed`, type: 'number', default: '50', min: '0', max: '500', description: '(Spawner) The average starting speed of newly created particles.' },
            { property: `obj${newId}_spawn_speedVariance`, label: `Object ${newId}: Initial Speed Variance (±)`, type: 'number', default: '0', min: '0', max: '500', description: '(Spawner) Adds randomness to the initial speed of each particle.' },
            { property: `obj${newId}_spawn_size`, label: `Object ${newId}: Particle Size`, type: 'number', default: '10', min: '1', max: '100', description: '(Spawner) The size of each particle in pixels.' },
            { property: `obj${newId}_spawn_size_randomness`, label: `Object ${newId}: Size Randomness %`, type: 'number', default: '0', min: '0', max: '100', description: '(Spawner) How much to vary each particle\'s size. 0% is uniform, 100% is highly varied.' },
            { property: `obj${newId}_spawn_gravity`, label: `Object ${newId}: Gravity`, type: 'number', default: '0', min: '-200', max: '200', description: '(Spawner) A constant downward (or upward) force applied to particles.' },
            { property: `obj${newId}_spawn_spread`, label: `Object ${newId}: Spread Angle`, type: 'number', default: '360', min: '0', max: '360', description: '(Spawner) The angle (in degrees) for Explode or Fountain emitters.' },
            { property: `obj${newId}_spawn_rotationSpeed`, label: `Object ${newId}: Particle Rotation Speed`, type: 'number', default: '0', min: '-360', max: '360', description: '(Spawner) The average rotational speed of each particle in degrees per second.' },
            { property: `obj${newId}_spawn_rotationVariance`, label: `Object ${newId}: Rotation Variance (±deg/s)`, type: 'number', default: '0', min: '0', max: '360', description: '(Spawner) Sets the random range for rotation speed. If base speed is 10 and variance is 5, speed will be random between 5 and 15.' },
            { property: `obj${newId}_spawn_initialRotation_random`, label: `Object ${newId}: Random Initial Rotation`, type: 'boolean', default: 'false', description: '(Spawner) If checked, each particle starts at a random angle.' },
            { property: `obj${newId}_spawn_svg_path`, label: `Object ${newId}: Custom SVG Path`, type: 'textfield', default: 'm -7.1735 47.0399 c -0.4792 -0.1767 -1.8839 -1.1913 -3.1216 -2.2546 c -1.2377 -1.0633 -2.9272 -2.2326 -3.7544 -2.5984 c -0.8272 -0.3658 -3.7682 -1.2585 -6.5357 -1.9837 c -9.9176 -2.599 -11.7218 -3.5122 -14.164 -7.1695 c -1.5926 -2.3849 -2.2275 -4.7408 -2.2275 -8.2651 c 0 -6.2533 2.5468 -11.5705 7.0838 -14.7894 c 3.2916 -2.3353 8.7752 -4.6118 12.8685 -5.3421 c 1.1812 -0.2108 4.0084 -0.359 6.9518 -0.3645 l 4.9609 -0.009 v -0.635 c 0 -0.8312 -1.7502 -9.5695 -1.9966 -9.968 c -0.2606 -0.4217 -1.4724 -0.2265 -7.5545 1.2166 c -7.2798 1.7273 -9.6611 2.0447 -14.3937 1.9184 c -4.6096 -0.123 -5.7086 -0.4664 -7.3607 -2.3004 c -1.8407 -2.0433 -2.1657 -3.1128 -2.1375 -7.0326 c 0.0238 -3.2996 0.076 -3.6119 1.2832 -7.6729 c 0.6921 -2.3283 1.3212 -4.9693 1.398 -5.8688 c 0.1281 -1.5009 0.0606 -1.7882 -0.8212 -3.492 c -1.0541 -2.0368 -1.2327 -3.4948 -0.5479 -4.4725 c 0.9177 -1.3102 3.0926 -1.7702 4.6243 -0.9781 l 0.7777 0.4021 l 1.67 -1.7032 c 1.8981 -1.9358 2.9955 -2.352 4.352 -1.6505 c 1.3396 0.6927 1.6736 2.3514 0.9746 4.8401 c -0.1087 0.3869 0.01 0.7152 0.3668 1.0187 c 1.9232 1.6337 2.403 2.2194 2.5768 3.1459 c 0.3675 1.9589 -0.5582 2.8535 -3.6119 3.4902 c -1.0738 0.2239 -2.1432 0.5798 -2.3765 0.7909 c -0.5528 0.5003 -1.7125 2.88 -2.6976 5.5355 c -1.0971 2.9575 -1.1239 4.939 -0.0869 6.438 c 1.1063 1.5991 2.1559 2.1614 4.0293 2.1587 c 2.781 -0.004 12.4578 -2.2285 16.9021 -3.8853 l 1.3229 -0.4932 l 0.1565 -4.2474 c 0.1411 -3.8282 0.2191 -4.3588 0.7909 -5.3762 c 0.7891 -1.4039 2.4436 -2.4268 3.9593 -2.4477 c 2.2352 -0.0309 3.248 1.4934 4.6276 6.9641 c 0.4807 1.9061 0.9998 3.5915 1.1537 3.7453 c 0.3499 0.3499 4.796 -0.5486 8.3011 -1.6776 c 2.8202 -0.9083 9.427 -4.1284 10.7545 -5.2416 c 1.2659 -1.0615 1.2015 -1.8925 -0.3327 -4.2905 c -1.3545 -2.1171 -1.3884 -2.6034 -0.2531 -3.6341 c 0.5926 -0.538 0.8405 -0.5893 2.092 -0.4329 c 1.0872 0.1358 1.4444 0.0929 1.5251 -0.1834 c 0.0579 -0.1984 0.2412 -0.8615 0.4072 -1.4734 c 0.4699 -1.7318 1.4456 -2.7239 2.679 -2.7239 c 1.0012 0 1.0379 0.0352 1.8649 1.7859 c 0.464 0.9823 0.891 1.8397 0.9488 1.9055 c 0.0579 0.0657 0.8814 0.1998 1.8301 0.298 c 2.072 0.2145 3.0191 0.9167 3.0191 2.2387 c 0 1.0776 -0.7527 2.0267 -2.4874 3.1364 c -1.1065 0.7078 -1.5685 1.2446 -2.3483 2.7288 c -2.304 4.3846 -6.15 8.0726 -10.917 10.4688 c -3.3572 1.6875 -4.8758 2.2252 -12.4889 4.4226 c -1.0536 0.3041 -2.2279 0.8216 -2.6097 1.1499 l -0.6941 0.597 l 0.5599 2.9266 c 0.6144 3.2115 1.1257 4.9111 1.5165 5.0414 c 0.1395 0.0465 1.4396 -0.7627 2.8889 -1.7982 c 2.9621 -2.1163 7.7385 -4.5342 11.4988 -5.8211 c 2.3746 -0.8126 2.7679 -0.8665 7.1159 -0.9742 c 2.9484 -0.0731 5.1828 -0.0008 6.2177 0.2011 c 3.6813 0.7181 8.0035 3.9741 9.7535 7.3477 c 0.8578 1.6535 1.2452 2.9272 1.6447 5.4071 c 0.2192 1.3607 -0.2753 5.0376 -1.198 8.9066 c -0.4288 1.7983 -0.7797 3.627 -0.7797 4.0638 c 0 0.4368 0.5431 2.0413 1.2068 3.5656 c 1.356 3.1141 1.3716 3.7643 0.1228 5.1011 c -0.8692 0.9305 -1.7797 1.0226 -3.8432 0.3889 c -0.7276 -0.2235 -1.6884 -0.3398 -2.1352 -0.2587 c -0.4664 0.0848 -1.9308 1.0443 -3.4396 2.2539 c -4.6511 3.7287 -6.8092 4.4998 -8.1462 2.9108 c -0.6418 -0.7627 -0.6557 -0.8491 -0.3173 -1.9734 c 0.369 -1.2261 1.1506 -2.6405 4.3881 -7.9408 c 2.4033 -3.9345 4.3309 -7.9349 4.9065 -10.182 c 0.2991 -1.1677 0.4026 -2.3933 0.3257 -3.8569 c -0.1241 -2.3648 -0.5762 -3.3923 -2.3039 -5.2362 c -3.8731 -4.1336 -11.4998 -3.4543 -18.7612 1.671 c -2.6959 1.9028 -4.8497 4.1098 -7.6193 7.8072 c -1.3066 1.7444 -2.6896 3.3478 -3.0733 3.5631 c -0.6632 0.3722 -0.8521 0.3169 -3.8245 -1.1193 c -3.9257 -1.8969 -6.3326 -2.4386 -9.8738 -2.2225 c -6.5556 0.4001 -11.7849 2.9718 -14.041 6.9051 c -1.1811 2.0592 -0.9733 5.0568 0.5623 8.1136 c 0.883 1.7575 2.0726 2.8627 4.2818 3.9779 c 3.0127 1.5208 3.4646 1.6127 8.7896 1.7875 L -5 33.5 l 0.388 1.0212 c 0.4018 1.0574 0.3032 1.7764 -0.5186 3.781 c -0.3067 0.7483 -0.2707 0.9915 0.3524 2.3813 c 0.8868 1.9776 1.293 3.8003 1.0821 4.8548 c -0.2753 1.3766 -1.9066 2.0812 -3.4774 1.5019 z m -6.841 -74.1807 c -0.3126 -0.0611 -1.0122 -0.4947 -1.5545 -0.9636 c -0.8512 -0.7358 -1.0045 -1.0439 -1.1205 -2.2516 c -0.087 -0.9059 -0.009 -1.6339 0.2219 -2.065 c 0.5026 -0.9391 2.3363 -1.9449 3.5457 -1.9449 c 0.8549 0 1.2057 0.1989 2.3259 1.3192 c 1.294 1.294 1.3167 1.3445 1.1914 2.6485 c -0.1437 1.495 -0.6427 2.1895 -2.1126 2.9397 c -0.9625 0.4913 -1.3548 0.5412 -2.4972 0.3178 z m 17.2372 -2.1886 c -2.0034 -0.8389 -2.8183 -3.8272 -1.4892 -5.4607 c 0.9736 -1.1966 2.6724 -1.5051 4.3735 -0.7944 c 1.209 0.5051 1.7459 1.3673 1.7459 2.8035 c 0 1.6255 -0.9646 3.0532 -2.3164 3.4286 c -1.1573 0.3214 -1.5909 0.3257 -2.3138 0.023 z', description: '(Spawner) The SVG `d` attribute path data for the custom particle shape.' },
            { property: `obj${newId}_spawn_matrixCharSet`, label: `Object ${newId}: Matrix Character Set`, type: 'combobox', default: 'katakana', values: 'katakana,numbers,binary,ascii', description: '(Spawner) The set of characters to use for the Matrix particle type.' },
            { property: `obj${newId}_spawn_trailLength`, label: `Object ${newId}: Trail Length`, type: 'number', default: '15', min: '1', max: '50', description: '(Spawner) The number of segments or characters in a particle\'s trail (for both generic and matrix types).' },
            { property: `obj${newId}_spawn_trailSpacing`, label: `Object ${newId}: Trail Spacing`, type: 'number', default: '1', min: '0.1', max: '10', step: '0.1', description: '(Spawner/Trail) Multiplier for the distance between trail segments. 1 = one particle size.' },
            { property: `obj${newId}_spawn_enableTrail`, label: `Object ${newId}: Enable Trail`, type: 'boolean', default: 'false', description: '(Spawner/Trail) Enables a fading trail behind each particle.' },
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
            { property: `obj${newId}_pathAnim_gradientStop`, label: `Object ${newId}: Gradient Stop %`, type: 'number', default: '50', min: '0', max: '100' },
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
            'strokeWidth', 'strokeGradType', 'strokeUseSharpGradient', 'strokeGradientStop',
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

    async function exportFile() {
        const exportButton = document.getElementById('export-btn');
        exportButton.disabled = true;
        exportButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Preparing...';

        try {
            updateObjectsFromForm();
            const { metaTags, jsVars, allKeys } = generateOutputScript();
            const effectTitle = getControlValues()['title'] || 'MyEffect';
            const thumbnailDataUrl = generateThumbnail(document.getElementById('signalCanvas'));
            const safeFilename = effectTitle.replace(/[\s\/\\?%*:|"<>]/g, '_');

            const styleContent =
                '        canvas { width: 100%; height: 100%; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: #000000; }\n' +
                '        body { background-color: #000000; overflow: hidden; margin: 0; }\n';
            const bodyContent = '<body><canvas id="signalCanvas"></canvas></body>';
            const shapeClasses = [`${Shape.toString()}`].join('\n\n');
            const formattedKeys = '[' + allKeys.map(key => `'${key}'`).join(',') + ']';

            const exportedScript = `
document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('signalCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = 320;
    canvas.height = 200;
    let objects = [];
    
    ${jsVars}

    window.gradientSpeedMultiplier = ${window.gradientSpeedMultiplier};
    window.shapeSpeedMultiplier = ${window.shapeSpeedMultiplier};
    window.seismicSpeedMultiplier = ${window.seismicSpeedMultiplier};
    window.tetrisGravityMultiplier = ${window.tetrisGravityMultiplier};
    window.textSpeedMultiplier = ${window.textSpeedMultiplier};

    const getSensorValue = (sensorName) => {
        try {
            return engine.getSensorValue(sensorName);
        } catch (e) {
            return { value: 0, min: 0, max: 100 };
        }
    };
    
    const FONT_DATA_4PX = ${JSON.stringify(FONT_DATA_4PX)};
    const FONT_DATA_5PX = ${JSON.stringify(FONT_DATA_5PX)};
    const parseColorToRgba = ${parseColorToRgba.toString()};
    const lerpColor = ${lerpColor.toString()};
    const getPatternColor = ${getPatternColor.toString()};
    const drawPixelText = ${drawPixelText.toString()};
    const getSignalRGBAudioMetrics = ${getSignalRGBAudioMetrics.toString()};
    
    const Shape = ${Shape.toString()};

    let then;
    const allPropKeys = ${formattedKeys};

    function createInitialObjects() {
        if (allPropKeys.length === 0) return;

        const uniqueIds = [...new Set(allPropKeys.map(p => {
            if (!p.startsWith('obj')) return null;
            const end = p.indexOf('_');
            if (end <= 3) return null;
            const idString = p.substring(3, end);
            const id = parseInt(idString, 10);
            return isNaN(id) ? null : String(id);
        }).filter(id => id !== null))];

        const propsToScale = ['x', 'y', 'width', 'height', 'innerDiameter', 'fontSize', 'lineWidth', 'strokeWidth', 'pulseDepth', 'vizLineWidth', 'strimerBlockSize'];
        
        objects = uniqueIds.map(id => {
            const config = { id: parseInt(id), ctx: ctx, gradient: {}, strokeGradient: {} };
            const prefix = 'obj' + id + '_';

            allPropKeys.filter(p => p.startsWith(prefix)).forEach(key => {
                const propName = key.substring(prefix.length);
                try {
                    let value = eval(key);

                    if (value === "true") value = true;
                    if (value === "false") value = false;

                    if (propsToScale.includes(propName) && typeof value === 'number') {
                        value *= 4;
                    }

                    // FIX: This logic correctly separates color and alpha properties.
                    if (propName === 'pixelArtFrames' || propName === 'polylineNodes') {
                        try {
                            config[propName] = (typeof value === 'string') ? JSON.parse(value) : value;
                        } catch(e) {
                            console.error(\`Failed to parse \${propName}\`, e);
                        }
                    } else if (propName === 'gradColor1' || propName === 'gradColor2') {
                        config.gradient[propName.replace('grad', '').toLowerCase()] = value;
                    } else if (propName === 'strokeGradColor1' || propName === 'strokeGradColor2') {
                        config.strokeGradient[propName.replace('strokeGradColor', 'color').toLowerCase()] = value;
                    } else if (propName === 'scrollDir') {
                        config.scrollDirection = value;
                    } else if (propName === 'strokeScrollDir') {
                        config.strokeScrollDir = value;
                    } else {
                        config[propName] = value;
                    }
                } catch (e) {}
            });

            return new Shape(config);
        });
    }

    function drawFrame(deltaTime = 0) {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        let shouldAnimate = false;
        try { shouldAnimate = eval('enableAnimation'); } catch(e) {}
        
        const audioData = getSignalRGBAudioMetrics();
        const sensorData = {};
        const neededSensors = [...new Set(objects.map(o => o.userSensor).filter(Boolean))];
        neededSensors.forEach(sensorName => {
            sensorData[sensorName] = getSensorValue(sensorName);
        });

        // Safely read all global properties with fallbacks
        let enablePalette = false, paletteColor1 = '#FF8F00', paletteColor2 = '#00BFFF';
        let enableGlobalCycle = false, globalCycleSpeed = 10;
        try { enablePalette = eval('enablePalette'); } catch(e) {}
        try { paletteColor1 = eval('paletteColor1'); } catch(e) {}
        try { paletteColor2 = eval('paletteColor2'); } catch(e) {}
        try { enableGlobalCycle = eval('enableGlobalCycle'); } catch(e) {}
        try { globalCycleSpeed = eval('globalCycleSpeed'); } catch(e) {}

        for (let i = objects.length - 1; i >= 0; i--) {
            const obj = objects[i];
            
            // 1. Update object with its individual properties from the UI
            const prefix = 'obj' + obj.id + '_';
            const propsToUpdate = {};
            allPropKeys.filter(p => p.startsWith(prefix)).forEach(key => {
                const propName = key.substring(prefix.length);
                try {
                    propsToUpdate[propName] = eval(key);
                } catch (e) {}
            });
            obj.update(propsToUpdate);

            // 2. Save the object's original state before applying global overrides
            const originalGradient = { ...obj.gradient };
            const originalStrokeGradient = { ...obj.strokeGradient };
            const originalCycleColors = obj.cycleColors;
            const originalCycleSpeed = obj.cycleSpeed;

            // 3. Apply the global overrides directly to the object's state
            if (enableGlobalCycle) {
                obj.cycleColors = true;
                obj.cycleSpeed = (globalCycleSpeed || 0) / 50.0;
            }
            if (enablePalette) {
                obj.gradient.color1 = paletteColor1;
                obj.gradient.color2 = paletteColor2;
                obj.strokeGradient.color1 = paletteColor1;
                obj.strokeGradient.color2 = paletteColor2;
            }

            // 4. Animate and Draw the object using the (potentially overridden) state
            if (shouldAnimate) {
                obj.updateAnimationState(audioData, sensorData, deltaTime);
            }
            obj.draw(false, audioData, {}); // Pass an empty palette

            // 5. Restore the object's original state for the next frame
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
        if (deltaTime > 0.1) {
            deltaTime = 0.1;
        }
        then = now;
        
        drawFrame(deltaTime);
    }

    function init() {
        createInitialObjects();
        then = window.performance.now();
        animate(then);
    }

    init();
});`;

            const finalHtml = [
                '<!DOCTYPE html>',
                '<html lang="en">',
                '<head>',
                '    <meta charset="UTF-8">',
                '    <title>' + effectTitle + '</title>',
                metaTags,
                '    <style>',
                styleContent,
                '    </style>',
                '</head>',
                bodyContent,
                '<script>',
                exportedScript,
                '</script>',
                '</html>'
            ].join('\n');

            exportPayload = {
                safeFilename,
                finalHtml,
                thumbnailDataUrl,
                imageExtension: 'png',
                exportDate: new Date()
            };

        } catch (error) {
            console.error('Export preparation failed:', error);
            showToast('Failed to prepare export: ' + error.message, 'danger');
        } finally {
            exportButton.disabled = false;
            exportButton.innerHTML = '<i class="bi bi-download"></i> Export';
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

        // Merged logic for node table edits
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

        // --- START: NEW PIXEL ART TABLE LOGIC ---
        // This block reads changes from the frame data/duration fields and updates the hidden master textarea
        // This block reads changes from the frame data/duration fields and updates the hidden master textarea
        if (target.classList.contains('frame-data-input') || target.classList.contains('frame-duration-input')) {

            // --- START: ADDED LOGIC TO UPDATE URL ---
            // If the changed input was the data field, update its corresponding "Edit" link
            if (target.classList.contains('frame-data-input')) {
                const newData = target.value;
                const encodedData = encodeURIComponent(newData);
                const editorUrl = `https://pixelart.nolliergb.com/?data=${encodedData}`;

                // Find the link element that is a sibling to the textarea's header
                const link = target.previousElementSibling.querySelector('a');
                if (link) {
                    link.href = editorUrl;
                }
            }
            // --- END: ADDED LOGIC TO UPDATE URL ---

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
        }
        // --- END: NEW PIXEL ART TABLE LOGIC ---

        updateObjectsFromForm();
        drawFrame();
    });

    form.addEventListener('click', (e) => {
        // --- START: CONSOLIDATED BUTTON CLICK LOGIC ---
        const addNodeBtn = e.target.closest('.btn-add-node');
        const deleteNodeBtn = e.target.closest('.btn-delete-node');
        const addFrameBtn = e.target.closest('.btn-add-frame');
        const deleteFrameBtn = e.target.closest('.btn-delete-frame');

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
            const frameItem = document.createElement('div');
            frameItem.className = 'pixel-art-frame-item border rounded p-2 bg-body';
            frameItem.dataset.index = newIndex;
            const defaultFrameData = '[[1]]';
            // Generate a unique ID for the textarea to link it to the button
            const textareaId = `frame-data-new-${Date.now()}`;

            frameItem.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <strong class="frame-item-header">Frame #${newIndex + 1}</strong>
                    <button type="button" class="btn btn-sm btn-outline-danger btn-delete-frame" title="Delete Frame"><i class="bi bi-trash"></i></button>
                </div>
                <div>
                    <div class="d-flex justify-content-between align-items-center">
                        <label class="form-label-sm" for="${textareaId}">Frame Data</label>
                        <button type="button" class="btn btn-sm btn-outline-info" 
                                data-bs-toggle="modal" 
                                data-bs-target="#pixelArtEditorModal"
                                data-target-id="${textareaId}">
                            <i class="bi bi-pencil-square"></i> Edit
                        </button>
                    </div>
                    <textarea class="form-control form-control-sm frame-data-input" id="${textareaId}" rows="6">${defaultFrameData}</textarea>
                </div>
                <div class="mt-2">
                     <label class="form-label-sm">Duration (seconds)</label>
                    <input type="number" class="form-control form-control-sm frame-duration-input" value="1" min="0.1" step="0.1">
                </div>
            `;
            framesContainer.appendChild(frameItem);

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

        // Handle Pixel Art Frame Deletions
        if (deleteFrameBtn) {
            const container = deleteFrameBtn.closest('.pixel-art-table-container');
            const framesContainer = container.querySelector('.d-flex.flex-column.gap-2');
            if (framesContainer.children.length > 1) {
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

    document.getElementById('export-copy-btn').addEventListener('click', async () => {
        // Run the export process now, with the latest checkbox value
        await exportFile();
        await incrementDownloadCount();

        if (exportPayload.finalHtml) {
            navigator.clipboard.writeText(exportPayload.finalHtml).then(() => {
                showToast("HTML code copied to clipboard!", 'success');
                const exportModal = bootstrap.Modal.getInstance(document.getElementById('export-options-modal'));
                if (exportModal) exportModal.hide();
            }).catch(err => {
                console.error('Failed to copy text: ', err);
                showToast("Could not copy code. See console for details.", 'danger');
            });
        }
    });

    document.getElementById('export-download-btn').addEventListener('click', async () => {
        // Run the export process now, with the latest checkbox value
        await exportFile();

        await incrementDownloadCount();

        const { safeFilename, finalHtml, thumbnailDataUrl, imageExtension, exportDate } = exportPayload;
        if (!finalHtml) return;

        try {
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

            const exportModal = bootstrap.Modal.getInstance(document.getElementById('export-options-modal'));
            if (exportModal) exportModal.hide();
            showToast("Zip file download started.", 'info');
        } catch (error) {
            console.error('Zip creation failed:', error);
            showToast('Failed to create .zip file.', 'danger');
        }
    });

    /**
     * Updates the global configStore with the current state of all form controls.
     * This makes the form the single source of truth at the moment of saving.
     */
    function syncConfigStoreWithState() {
        const formValues = getControlValues();

        configStore.forEach(conf => {
            const key = conf.property || conf.name;

            // Ensure we only update properties that exist in the form
            if (formValues.hasOwnProperty(key)) {
                let valueToSave = formValues[key];

                // The form holds UI-scaled values, which is what we need to save.
                // We just need to ensure the data types are correct for saving.
                if (conf.type === 'number') {
                    valueToSave = Math.round(Number(valueToSave));
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

        syncConfigStoreWithState();

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

                const newObjectConfigs = getDefaultObjectConfig(newId).filter(
                    conf => (shapePropertyMap['polyline'] || []).includes(conf.property.substring(conf.property.indexOf('_') + 1))
                );

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

    exportBtn.addEventListener('click', exportFile);

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

        updateObjectsFromForm();
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
                await onConfirm(); // Wait for the async action (like saving) to complete
            }
            confirmModalInstance.hide(); // Hide the modal after the action is done
        };

        confirmBtn.addEventListener('click', handleConfirm, { once: true });

        // This listener cleans up in case the user closes the modal without confirming
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
        const newConfigs = getDefaultsForShape('rectangle', newId);

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

        const propsToScale = [
            'x', 'y', 'width', 'height', 'innerDiameter', 'fontSize',
            'lineWidth', 'strokeWidth', 'pulseDepth', 'vizLineWidth', 'strimerBlockSize',
            'pathAnim_size', 'pathAnim_speed', 'pathAnim_objectSpacing', 'pathAnim_trailLength'
        ];
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
            dirtyProperties.add(target.name);
        }

        // START OF THE FIX: This block handles shape changes by rebuilding the object's configuration.
        if (target.name && /^obj\d+_shape$/.test(target.name)) {
            isRestoring = true; // Prevent other listeners from interfering during this complex operation

            try {
                const idMatch = target.name.match(/^obj(\d+)_/);
                if (!idMatch) return;

                const id = parseInt(idMatch[1], 10);
                const obj = objects.find(o => o.id === id);
                const newShapeType = target.value;

                if (obj && obj.shape !== newShapeType) {
                    // 1. Get ALL current values from the form for this object.
                    const currentObjectFormValues = {};
                    const prefix = `obj${id}_`;
                    const configsForObject = configStore.filter(c => c.property && c.property.startsWith(prefix));
                    configsForObject.forEach(conf => {
                        const el = form.elements[conf.property];
                        if (el) {
                            const key = conf.property.replace(prefix, '');
                            if (el.type === 'checkbox') {
                                currentObjectFormValues[key] = el.checked;
                            } else if (el.type === 'number') {
                                currentObjectFormValues[key] = el.value === '' ? 0 : parseFloat(el.value);
                            } else {
                                currentObjectFormValues[key] = el.value;
                            }
                        }
                    });
                    const fieldset = target.closest('fieldset[data-object-id]');
                    const objectName = fieldset ? fieldset.querySelector('.object-name').textContent : `Object ${id}`;

                    // 2. Find the index where this object's properties start.
                    const insertIndex = configStore.findIndex(c => c.property && c.property.startsWith(`obj${id}_`));

                    // 3. Atomically remove all old configs for this object ID.
                    if (insertIndex > -1) {
                        configStore = configStore.filter(c => !(c.property && c.property.startsWith(`obj${id}_`)));
                    }

                    // 4. Get a fresh, clean set of configs for the NEW shape type.
                    const newConfigs = getDefaultsForShape(newShapeType, id);

                    // 5. Intelligently merge the preserved form values into the new configs.
                    newConfigs.forEach(conf => {
                        const propName = conf.property.substring(conf.property.indexOf('_') + 1);
                        conf.label = `${objectName}: ${conf.label.split(':').slice(1).join(' ').trim()}`;

                        if (currentObjectFormValues.hasOwnProperty(propName)) {
                            let valueToSet = currentObjectFormValues[propName];

                            // FIX: If the value is a complex object (like from a live Shape instance),
                            // ensure it's stringified before being set as a 'default' in the configStore.
                            const complexProps = ['pixelArtFrames', 'polylineNodes', 'spawn_svg_path'];
                            if (complexProps.includes(propName) && typeof valueToSet === 'object' && valueToSet !== null) {
                                try {
                                    valueToSet = JSON.stringify(valueToSet);
                                } catch (e) {
                                    console.error(`Could not stringify complex property ${propName}`, e);
                                    valueToSet = '[]'; // Fallback to a safe default
                                }
                            }
                            conf.default = valueToSet;
                        }

                        if (propName === 'shape') {
                            conf.default = newShapeType;
                        }
                    });


                    // 6. Splice the new, correct configs back into the store.
                    if (insertIndex > -1) {
                        configStore.splice(insertIndex, 0, ...newConfigs);
                    } else {
                        configStore.push(...newConfigs);
                    }

                    // 7. Directly update the live object's shape property.
                    obj.shape = newShapeType;

                    // 8. Re-render the form from the updated configStore.
                    renderForm();

                    // 9. Sync all objects with the authoritative configStore.
                    syncObjectsWithConfigStore();
                }
            } finally {
                isRestoring = false; // Always ensure the flag is reset
                debouncedRecordHistory();
            }
            return;
        }
        // END OF THE FIX

        if (target.name && (
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
            if (copyPropsForm.elements['copy-fill-style'].checked) Object.assign(propsToCopy, { gradType: sourceObject.gradType, useSharpGradient: sourceObject.useSharpGradient, gradientStop: sourceObject.gradientStop, gradient: { ...sourceObject.gradient } });
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


    // Start the application.
    init();
});