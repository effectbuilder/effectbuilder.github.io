// --- IMPORT SHARED FUNCTIONS ---
import { showToast } from './util.js';

// --- CANVAS-SPECIFIC STATE ---
let canvas, ctx;
let canvasBgColor = '#343a40'; // Default dark background
let gridStrokeColor = 'rgba(255, 255, 255, 0.07)'; // Default dark grid
let componentState = null;
let viewTransform = null;
let selectedLedIds = null;
let currentToolGetter = () => 'select';
let autoSave = () => { };

let isPanning = false;
let isDragging = false;
let isMarqueeSelecting = false;
let marqueeStartPos = { x: 0, y: 0 };
let marqueeEndPos = { x: 0, y: 0 };
let didDrag = false;
let ledDragOffsets = [];
let isGridVisible = true;
const GRID_SIZE = 10;
const LED_RADIUS = 10; // Screen pixels
let pendingConnectionStartLed = null; // Track first click for wiring connection { ledId: string, circuitIndex: number, isStart: boolean, isEnd: boolean, circuitInfo: object | null }
const ledCountDisplay = document.getElementById('led-count-display');
const ledWarningDisplay = document.getElementById('led-warning-display');

// --- NEW IMAGE GUIDE STATE ---
let imageGuideState = null; // Will be set in setupCanvas
let imageGuideImg = null; // CRITICAL: Declared as global image object
let isImageGuideDragging = false;
let isImageGuideScaling = false;
let isImageGuideRotating = false;
let imageDragOffset = { x: 0, y: 0 };
let imageGuideHandle = null; // 'move', 'scale', or 'rotate'
const HANDLE_SIZE = 15; // Screen pixels
// --- END NEW ---

// --- INITIALIZATION ---
export function setupCanvas(appState) {
    canvas = appState.canvas;
    ctx = appState.ctx;
    componentState = appState.componentState;
    viewTransform = appState.viewTransform;
    selectedLedIds = appState.selectedLedIds;
    currentToolGetter = appState.getCurrentTool;
    autoSave = appState.autoSave;
    // --- NEW: Set up new state variables and image element ---
    imageGuideState = appState.imageGuideState; // CRITICAL: Assign the state object
    imageGuideImg = new Image(); // CRITICAL: Initialize the Image object

    // Handler to update the component state when image loads
    imageGuideImg.onload = () => {
        componentState.guideImageWidth = imageGuideImg.naturalWidth;
        componentState.guideImageHeight = imageGuideImg.naturalHeight;
        drawCanvas();
    };
    imageGuideImg.onerror = () => {
        componentState.guideImageUrl = null;
        componentState.guideImageWidth = 500;
        componentState.guideImageHeight = 300;
        showToast('Image Load Error', 'Could not load guide image.', 'danger');
    };

    // If an image URL exists in the loaded state, set the src
    if (componentState.guideImageUrl) {
        imageGuideImg.src = componentState.guideImageUrl;
    }
    // --- END NEW ---

    // Check wiring format on setup
    if (!Array.isArray(componentState.wiring)) {
        console.warn("setupCanvas: componentState.wiring is not an array. Resetting.");
        componentState.wiring = [];
    } else if (componentState.wiring.length > 0 && !Array.isArray(componentState.wiring[0])) {
        // Attempt to convert old format
        console.warn("setupCanvas: Converting old wiring format [] to [[]].");
        componentState.wiring = [componentState.wiring];
    }

    setupCanvasListeners(appState.rightPanelTop);
}

// --- HELPER FUNCTIONS ---

/**
 * Sets the source URL for the image guide object.
 * This is exposed globally for main.js to call after a file upload.
 */
export function setImageGuideSrc(url) {
    if (imageGuideImg) {
        imageGuideImg.src = url;
    } else {
        // If imageGuideImg is somehow null, re-init it (emergency fallback)
        imageGuideImg = new Image();
        imageGuideImg.onload = () => {
            componentState.guideImageWidth = imageGuideImg.naturalWidth;
            componentState.guideImageHeight = imageGuideImg.naturalHeight;
            drawCanvas();
        };
        imageGuideImg.onerror = () => {
            // ... (error handling)
        };
        imageGuideImg.src = url;
    }
}
window.setImageGuideSrc = setImageGuideSrc; // Expose globally

/**
 * Reads colors from the document root based on the active theme and updates canvas variables.
 */
function getCanvasStyles() {
    const rootStyle = getComputedStyle(document.documentElement);
    const theme = document.documentElement.getAttribute('data-bs-theme') || 'dark';

    // 1. Read Canvas Background Color
    // Get the *actual computed color* of the container (which we set in styles.css)
    const container = document.getElementById('component-canvas-container');
    canvasBgColor = container ? getComputedStyle(container).backgroundColor : '#212529'; // Fallback

    // 2. Set Grid Stroke Color
    if (theme === 'light') {
        // Light theme: Use dark, semi-transparent line
        gridStrokeColor = 'rgba(0, 0, 0, 0.2)';
    } else { // dark theme
        // Dark theme: Use light, low-transparency line
        gridStrokeColor = 'rgba(255, 255, 255, 0.07)';
    }
}

function findHitLed(worldPos) {
    if (!componentState || !Array.isArray(componentState.leds) || !viewTransform) return null;
    const hitRadius = LED_RADIUS / viewTransform.zoom;
    for (let i = componentState.leds.length - 1; i >= 0; i--) {
        const led = componentState.leds[i];
        if (!led) continue;
        const dx = worldPos.x - led.x; const dy = worldPos.y - led.y;
        if (dx * dx + dy * dy < hitRadius * hitRadius) return led;
    }
    return null;
}

function findHitWireSegment(worldPos) {
    if (!componentState || !Array.isArray(componentState.wiring) || !viewTransform) return null;

    // --- MODIFIED: Increased threshold from 5 to 8 for easier clicking ---
    const hitThreshold = 8 / viewTransform.zoom;

    // Loop through each circuit
    for (let i = 0; i < componentState.wiring.length; i++) {
        const circuit = componentState.wiring[i];
        if (!Array.isArray(circuit) || circuit.length < 2) continue;
        // Loop through segments in this circuit
        for (let j = 0; j < circuit.length - 1; j++) {
            const led1Id = circuit[j];
            const led2Id = circuit[j + 1];
            const led1 = componentState.leds.find(l => l && l.id === led1Id);
            const led2 = componentState.leds.find(l => l && l.id === led2Id);
            if (!led1 || !led2) continue;

            // Simple midpoint + bounding box check
            const midX = (led1.x + led2.x) / 2; const midY = (led1.y + led2.y) / 2;
            const dxMid = worldPos.x - midX; const dyMid = worldPos.y - midY;
            if (dxMid * dxMid + dyMid * dyMid < hitThreshold * hitThreshold * 4) { // Generous midpoint check
                const minX = Math.min(led1.x, led2.x) - hitThreshold; const maxX = Math.max(led1.x, led2.x) + hitThreshold;
                const minY = Math.min(led1.y, led2.y) - hitThreshold; const maxY = Math.max(led1.y, led2.y) + hitThreshold;
                if (worldPos.x >= minX && worldPos.x <= maxX && worldPos.y >= minY && worldPos.y <= maxY) {
                    // Return info about the segment and its circuit
                    return { circuitIndex: i, segmentStartIndex: j, led1Id, led2Id };
                }
            }
        }
    }
    return null; // No segment hit
}

function getLedsInMarquee(pos1, pos2) {
    if (!componentState || !Array.isArray(componentState.leds)) return [];
    const minX = Math.min(pos1.x, pos2.x); const maxX = Math.max(pos1.x, pos2.x);
    const minY = Math.min(pos1.y, pos2.y); const maxY = Math.max(pos1.y, pos2.y);
    return componentState.leds.filter(led => {
        if (!led) return false;
        return led.x >= minX && led.x <= maxX && led.y >= minY && led.y <= maxY;
    });
}

function checkOverlap(potentialPositions) {
    // Ensure componentState and leds array exist
    if (!componentState || !Array.isArray(componentState.leds)) return true; // Assume overlap if state is bad
    const existingLedPositions = new Set(componentState.leds.map(led => `${led.x},${led.y}`));
    for (const pos of potentialPositions) {
        if (existingLedPositions.has(`${pos.x},${pos.y}`)) return true;
    }
    return false;
}

// Finds which circuit (if any) an LED belongs to
function findLedInWiring(ledId) {
    if (!componentState || !Array.isArray(componentState.wiring)) return null;
    for (let i = 0; i < componentState.wiring.length; i++) {
        const circuit = componentState.wiring[i];
        if (!Array.isArray(circuit)) continue; // Skip if format is wrong
        const indexInCircuit = circuit.indexOf(ledId);
        if (indexInCircuit > -1) {
            return {
                circuitIndex: i,
                indexInCircuit: indexInCircuit,
                circuit: circuit,
                isStart: indexInCircuit === 0,
                isEnd: indexInCircuit === circuit.length - 1
            };
        }
    }
    return null; // LED not found in any circuit
}

/**
 * Checks if the world position hits any of the image guide's handles.
 * @param {object} worldPos - The mouse position in world coordinates.
 * @returns {string|null} - 'move', 'scale', 'rotate', or null.
 */
function findHitImageHandle(worldPos) {
    if (!imageGuideImg || !componentState.guideImageUrl || !imageGuideState.isVisible) return null;

    // Exit if image is locked
    if (imageGuideState.isLocked) return null;

    // Convert guide's world (x,y) to world coordinates (centered at origin)
    const worldX = imageGuideState.x;
    const worldY = imageGuideState.y;
    const worldScale = imageGuideState.scale;

    // Calculate image guide's corners in WORLD coordinates
    const guideWidth = componentState.guideImageWidth * worldScale;
    const guideHeight = componentState.guideImageHeight * worldScale;

    // Top-Left (for rotation handle)
    let rotX = worldX;
    let rotY = worldY;

    // Bottom-Right (for scaling handle)
    let scaleX = worldX + guideWidth;
    let scaleY = worldY + guideHeight;

    // Apply rotation transformation to the handle positions
    const angleRad = imageGuideState.rotation * (Math.PI / 180);
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);

    // Center of the image (for rotation calculations)
    const imgCenterX = worldX + guideWidth / 2;
    const imgCenterY = worldY + guideHeight / 2;

    // Function to rotate a point around the image center
    const rotatePoint = (px, py) => {
        const x = px - imgCenterX;
        const y = py - imgCenterY;
        const xPrime = x * cos - y * sin;
        const yPrime = x * sin + y * cos;
        return { x: xPrime + imgCenterX, y: yPrime + imgCenterY };
    };

    const rotHandleWorld = rotatePoint(rotX, rotY);
    const scaleHandleWorld = rotatePoint(scaleX, scaleY);

    // Transform handle sizes to world units (smaller when zoomed in)
    const worldHandleSize = HANDLE_SIZE / viewTransform.zoom;
    const hitRadiusSq = worldHandleSize * worldHandleSize;

    // 1. Check ROTATE Handle (Top-Left)
    const dxRot = worldPos.x - rotHandleWorld.x;
    const dyRot = worldPos.y - rotHandleWorld.y;
    if (dxRot * dxRot + dyRot * dyRot < hitRadiusSq) {
        return 'rotate';
    }

    // 2. Check SCALE Handle (Bottom-Right)
    const dxScale = worldPos.x - scaleHandleWorld.x;
    const dyScale = worldPos.y - scaleHandleWorld.y;
    if (dxScale * dxScale + dyScale * dyScale < hitRadiusSq) {
        return 'scale';
    }

    // 3. Check MOVE Handle (Center)
    // Simple bounding box check for the main image area.
    if (worldPos.x >= worldX && worldPos.x <= worldX + guideWidth &&
        worldPos.y >= worldY && worldPos.y <= worldY + guideHeight) {
        return 'move';
    }

    return null;
}
// --- END NEW IMAGE GUIDE HELPERS ---


// --- CANVAS LISTENERS ---
function setupCanvasListeners(rightPanelTop) {
    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            const rect = entry.contentRect;
            if (canvas) {
                canvas.width = rect.width;
                canvas.height = rect.height;
                drawCanvas();
            }
        }
    });
    if (rightPanelTop) {
        resizeObserver.observe(rightPanelTop);
    } else {
        console.error("setupCanvasListeners: rightPanelTop element not found!");
    }

    canvas.addEventListener('mousemove', (e) => handleCanvasMouseMove(e));
    canvas.addEventListener('mousedown', (e) => handleCanvasMouseDown(e));
    canvas.addEventListener('mouseup', (e) => handleCanvasMouseUp(e));
    canvas.addEventListener('mouseleave', (e) => handleCanvasMouseLeave(e));
    canvas.addEventListener('wheel', (e) => handleCanvasWheel(e));
    canvas.addEventListener('contextmenu', (e) => handleContextMenu(e)); // Use contextmenu for Right (2)
}

function handleContextMenu(e) {
    console.log(`>>> contextmenu event triggered. Tool=${currentToolGetter()}`);
    // Only handle right-clicks when the wiring tool is active or image tool is active
    if (currentToolGetter() === 'wiring') {
        e.preventDefault(); // Prevent default menu *only* in wiring mode

        if (!componentState || !Array.isArray(componentState.leds) || !Array.isArray(componentState.wiring)) return;

        const worldPos = screenToWorld(e.offsetX, e.offsetY);
        const hitLed = findHitLed(worldPos);
        let stateChanged = false;

        console.log("--- Wiring Right Click Start (via contextmenu) ---");
        console.log("Wiring State BEFORE:", JSON.parse(JSON.stringify(componentState.wiring)));

        if (hitLed) {
            console.log(`Right Click Hit LED: ${hitLed.id}`);
            const circuitInfo = findLedInWiring(hitLed.id);
            if (circuitInfo) { // Hit a wired LED
                console.log(`Wiring: Right-click on LED in circuit ${circuitInfo.circuitIndex} at index ${circuitInfo.indexInCircuit}, removing it.`);
                // Remove only that one LED from its circuit
                componentState.wiring[circuitInfo.circuitIndex].splice(circuitInfo.indexInCircuit, 1);
                // If the circuit becomes empty after removal, remove the circuit itself
                if (componentState.wiring[circuitInfo.circuitIndex].length === 0) {
                    componentState.wiring.splice(circuitInfo.circuitIndex, 1);
                }
                stateChanged = true; // State has changed
                if (pendingConnectionStartLed && pendingConnectionStartLed.ledId === hitLed.id) {
                    pendingConnectionStartLed = null;
                }
            } else {
                console.log('Right-click on unwired LED, no action.');
            }
        } else {
            const hitSegment = findHitWireSegment(worldPos);
            if (hitSegment) {
                console.log(`Wiring: Right-click on segment in circuit ${hitSegment.circuitIndex}, breaking path after index ${hitSegment.segmentStartIndex}.`);
                const originalCircuit = componentState.wiring[hitSegment.circuitIndex];

                // --- MODIFIED LOGIC FOR SPLITTING ---

                // First part goes up to and includes the first LED of the segment
                const firstPart = originalCircuit.slice(0, hitSegment.segmentStartIndex + 1);
                // Second part starts from the second LED of the segment
                const secondPart = originalCircuit.slice(hitSegment.segmentStartIndex + 1);

                // Now, replace the one circuit with the new parts, filtering out any empty arrays
                const newParts = [firstPart, secondPart].filter(part => Array.isArray(part) && part.length > 0);

                if (newParts.length > 0) {
                    // Replace 1 element at circuitIndex with all elements in newParts
                    // e.g., splice(1, 1, [A], [B]) -> replaces [A,B,C] with [A], [B], [C]
                    console.log(`... splitting circuit ${hitSegment.circuitIndex} into ${newParts.length} new circuit(s).`);
                    componentState.wiring.splice(hitSegment.circuitIndex, 1, ...newParts);
                } else {
                    // This happens if the original circuit only had 2 LEDs
                    console.log(`... removing now-empty circuit ${hitSegment.circuitIndex}.`);
                    componentState.wiring.splice(hitSegment.circuitIndex, 1);
                }

                // --- END MODIFIED LOGIC ---

                stateChanged = true; // State has changed
            } else {
                console.log('Right-click on empty space, no action.');
            }
        }

        if (stateChanged) {
            console.log("Wiring State AFTER:", JSON.parse(JSON.stringify(componentState.wiring)));
            pendingConnectionStartLed = null; // Cancel any pending connection on right click change
            drawCanvas();
            autoSave();
        } else {
            console.log("No state change from right click.");
        }
        console.log("--- Wiring Right Click End ---");

    } else if (currentToolGetter() === 'place-led') {
        e.preventDefault(); // Prevent context menu
        if (pendingConnectionStartLed) {
            console.log("Place-LED: Right click, cancelling chain.");
            pendingConnectionStartLed = null;
            drawCanvas(); // Redraw to remove highlight
        }
    } else if (currentToolGetter() === 'image') {
        e.preventDefault(); // Prevent context menu
        if (componentState.guideImageUrl) {
            // Right-click in Image Tool toggles lock state
            imageGuideState.isLocked = !imageGuideState.isLocked;
            // The global function set in main.js is needed to update the DOM button/title
            if (window.updateImageGuideUI) {
                window.updateImageGuideUI();
                window.setAppCursor();
            }
            autoSave();
            drawCanvas();
            showToast('Image Guide', imageGuideState.isLocked ? 'Image Guide Locked' : 'Image Guide Unlocked', 'info');
        }
    } else {
        console.log("Context menu event ignored (not in wiring or image mode).");
        // Allow default context menu to appear
    }
} // --- End handleContextMenu ---

// --- Function to update LED count and warning ---
export function updateLedCount() {
    if (!componentState || !Array.isArray(componentState.leds) || !ledCountDisplay || !ledWarningDisplay) {
        return;
    }

    const count = componentState.leds.length;
    ledCountDisplay.textContent = `${count} LED${count === 1 ? '' : 's'}`;

    if (count > 120) {
        ledCountDisplay.classList.remove('bg-secondary');
        ledCountDisplay.classList.add('bg-warning', 'text-dark');
        ledWarningDisplay.classList.remove('d-none');
    } else {
        ledCountDisplay.classList.add('bg-secondary');
        ledCountDisplay.classList.remove('bg-warning', 'text-dark');
        ledWarningDisplay.classList.add('d-none');
    }
}

function handleCanvasMouseDown(e) {
    console.log(`>>> mousedown event: Button=${e.button}, Tool=${currentToolGetter()}`);
    if (!componentState || !Array.isArray(componentState.leds) || !Array.isArray(componentState.wiring)) return;

    // --- Pan on Middle click OR Right click (if NOT wiring/placing/image) ---
    if (e.button === 1 || (e.button === 2 && currentToolGetter() !== 'wiring' && currentToolGetter() !== 'place-led' && currentToolGetter() !== 'image')) {
        console.log("Starting Pan...");
        isPanning = true; canvas.style.cursor = 'grabbing'; e.preventDefault(); return;
    }

    // --- Right Click: Handled by contextmenu listener OR cancel place-led ---
    if (e.button === 2) {
        if (currentToolGetter() === 'wiring' || currentToolGetter() === 'image') {
            e.preventDefault(); // Already handled by contextmenu listener
        } else if (currentToolGetter() === 'place-led') {
            e.preventDefault(); // Prevent context menu
            if (pendingConnectionStartLed) {
                console.log("Place-LED: Right click, cancelling chain.");
                pendingConnectionStartLed = null;
                drawCanvas(); // Redraw to remove highlight
            }
        }
        return; // Stop further mousedown processing for right click
    }

    // --- Left Click Logic ---
    if (e.button === 0) {
        didDrag = false;
        const worldPos = screenToWorld(e.offsetX, e.offsetY);
        const hitLed = findHitLed(worldPos);
        let stateChanged = false;
        console.log(`Left Mouse Down: Tool=${currentToolGetter()}, Hit LED=${hitLed ? hitLed.id : 'None'}`);

        // --- NEW: Image Tool Logic ---
        if (currentToolGetter() === 'image' && componentState.guideImageUrl && imageGuideState.isVisible && !imageGuideState.isLocked) {
            imageGuideHandle = findHitImageHandle(worldPos);
            console.log(`Image Tool: Hit Handle: ${imageGuideHandle}`);

            if (imageGuideHandle === 'move') {
                isImageGuideDragging = true;
                imageDragOffset.x = worldPos.x - imageGuideState.x;
                imageDragOffset.y = worldPos.y - imageGuideState.y;
                canvas.style.cursor = 'grabbing';
                e.preventDefault();
            } else if (imageGuideHandle === 'scale') {
                isImageGuideScaling = true;
                canvas.style.cursor = 'nwse-resize';
                e.preventDefault();
            } else if (imageGuideHandle === 'rotate') {
                isImageGuideRotating = true;
                canvas.style.cursor = 'crosshair'; // Will be handled by mousemove cursor logic
                e.preventDefault();
            }
            if (imageGuideHandle) return; // Stop if we hit a handle
        }
        // --- END NEW ---

        if (currentToolGetter() === 'place-led') {
            if (hitLed) {
                // Clicking an existing LED breaks the chain and selects it
                if (pendingConnectionStartLed) {
                    console.log("Place-LED: Clicked existing LED, cancelling chain.");
                    pendingConnectionStartLed = null;
                }
                window.setAppTool('select'); selectedLedIds.clear(); selectedLedIds.add(hitLed.id); drawCanvas();
            } else {
                const x = Math.round(worldPos.x / GRID_SIZE) * GRID_SIZE; const y = Math.round(worldPos.y / GRID_SIZE) * GRID_SIZE;
                if (!checkOverlap([{ x, y }])) {
                    const newId = Date.now().toString(); const newLed = { id: newId, x: x, y: y };
                    if (!Array.isArray(componentState.leds)) componentState.leds = [];
                    componentState.leds.push(newLed);

                    // --- NEW WIRING LOGIC ---
                    const newLedId = newLed.id;
                    let newLedCircuitInfo = null;

                    if (pendingConnectionStartLed) { // This is the 2nd, 3rd, etc. LED
                        const startLedId = pendingConnectionStartLed.ledId;
                        const startLedCircuitInfo = findLedInWiring(startLedId);

                        if (startLedCircuitInfo) { // Start LED was in a circuit
                            console.log(`Place-LED: Appending ${newLedId} to circuit ${startLedCircuitInfo.circuitIndex}`);
                            componentState.wiring[startLedCircuitInfo.circuitIndex].push(newLedId);
                            newLedCircuitInfo = findLedInWiring(newLedId); // Get its new info
                        } else { // Should not happen if logic is correct, but fallback
                            console.warn(`Place-LED: Start LED ${startLedId} not in circuit? Creating new.`);
                            componentState.wiring.push([startLedId, newLedId]);
                            newLedCircuitInfo = findLedInWiring(newLedId);
                        }
                    } else { // This is the FIRST LED in a chain
                        console.log(`Place-LED: Starting new chain with ${newLedId}`);
                        componentState.wiring.push([newLedId]); // Create a new circuit for it
                        newLedCircuitInfo = findLedInWiring(newLedId);
                    }

                    // Set this new LED as the next pending start
                    pendingConnectionStartLed = { ledId: newLedId, ...newLedCircuitInfo };
                    // --- END NEW WIRING LOGIC ---

                    updateLedCount();
                    drawCanvas(); stateChanged = true;
                    console.log('handleCanvasMouseDown (place): State changed.');
                } else {
                    console.log("Place LED blocked by overlap."); showToast("Overlap", "Cannot place an LED on top of another.", "warning");
                }
            }
        }

        if (currentToolGetter() === 'select') {
            if (hitLed) {
                console.log(`Select Tool: Hit LED ${hitLed.id}. Shift: ${e.shiftKey}`);

                isDragging = true;
                canvas.style.cursor = 'grabbing';
                let selectionChanged = false;

                // --- MODIFIED LOGIC START ---
                if (e.shiftKey) {
                    // SHIFT: Add or remove from existing selection
                    if (selectedLedIds.has(hitLed.id)) {
                        selectedLedIds.delete(hitLed.id);
                    } else {
                        selectedLedIds.add(hitLed.id);
                    }
                    selectionChanged = true;
                    // If selection changed, we should NOT start dragging the new set until mouse up
                    // Setting isDragging=false here forces the user to re-click after modifying the selection
                    isDragging = false;
                    canvas.style.cursor = 'default';
                } else if (!selectedLedIds.has(hitLed.id)) {
                    // NO SHIFT, clicked an UNSELECTED LED: Clear current selection and start a new one
                    selectedLedIds.clear();
                    selectedLedIds.add(hitLed.id);
                    selectionChanged = true;
                }
                // NO SHIFT, clicked an ALREADY SELECTED LED: Do nothing, preserve the selection, and proceed to drag.

                if (selectionChanged) { drawCanvas(); }

                // Only prepare for drag if the hit LED is currently part of the selection
                if (selectedLedIds.has(hitLed.id)) {
                    // Set isDragging true and prepare offsets for the entire group
                    isDragging = true;
                    canvas.style.cursor = 'grabbing';
                    ledDragOffsets = [];
                    componentState.leds.forEach(led => {
                        if (!led) return;
                        if (selectedLedIds.has(led.id)) {
                            ledDragOffsets.push({
                                led: led,
                                offsetX: led.x - worldPos.x,
                                offsetY: led.y - worldPos.y
                            });
                        }
                    });
                    console.log(`Prepared ${ledDragOffsets.length} LEDs for dragging.`);
                } else {
                    // If Shift was used to deselect the last LED, prevent drag
                    isDragging = false;
                    canvas.style.cursor = 'default';
                }
                // --- MODIFIED LOGIC END ---

            } else {
                console.log("Select Tool: Clicked empty space. Starting Marquee.");
                isMarqueeSelecting = true;
                marqueeStartPos = { x: worldPos.x, y: worldPos.y };
                marqueeEndPos = { x: worldPos.x, y: worldPos.y };
                if (!e.shiftKey) {
                    if (selectedLedIds.size > 0) {
                        selectedLedIds.clear();
                    }
                }
                requestAnimationFrame(drawCanvas);
            }
        } // End Select Tool

        if (currentToolGetter() === 'wiring') {
            console.log("--- Wiring Click Start ---");
            console.log("Current Wiring State:", JSON.parse(JSON.stringify(componentState.wiring)));
            console.log("Current Pending Start:", pendingConnectionStartLed ? { ...pendingConnectionStartLed, circuitInfo: pendingConnectionStartLed.circuitInfo ? { ...pendingConnectionStartLed.circuitInfo, circuit: '[Ref]' } : null } : null);

            if (hitLed) {
                const hitLedId = hitLed.id;
                let hitLedCircuitInfo = findLedInWiring(hitLedId);
                console.log(`Hit LED: ${hitLedId}. Circuit Info:`, hitLedCircuitInfo ? { ...hitLedCircuitInfo, circuit: '[Ref]' } : null);

                if (pendingConnectionStartLed) { // == SECOND CLICK (Attempt Connection) ==
                    const startLedId = pendingConnectionStartLed.ledId;
                    const startLedCircuitInfo = findLedInWiring(startLedId); // Get fresh info for start LED

                    console.log(`Attempting Connection: From ${startLedId} TO ${hitLedId}`);

                    // --- Pre-connection validation ---
                    if (hitLedId === startLedId) { console.log("Cannot connect LED to itself. Cancelling."); pendingConnectionStartLed = null; }
                    else if (startLedCircuitInfo && startLedCircuitInfo.circuit.includes(hitLedId)) { console.log("Cannot connect back into the same circuit segment. Cancelling."); pendingConnectionStartLed = null; }
                    else {
                        // --- Determine Connection Type ---
                        let canConnect = false;
                        let connectAction = null;

                        // Condition 1: Start LED must be an endpoint or unwired.
                        const isStartValid = !startLedCircuitInfo || startLedCircuitInfo.isEnd;

                        if (isStartValid) {
                            if (!hitLedCircuitInfo) { // Target is UNWIRED
                                canConnect = true;
                                connectAction = startLedCircuitInfo ? 'append' : 'newCircuit';

                            } else { // Target IS WIRED
                                // Check for different circuits (safety check)
                                if (startLedCircuitInfo && startLedCircuitInfo.circuitIndex === hitLedCircuitInfo.circuitIndex) {
                                    console.log("Cannot connect within the same circuit.");
                                }
                                else if (hitLedCircuitInfo.isStart) {
                                    // Standard Merge: (End of C1 / Unwired) -> Start of C2
                                    canConnect = true;
                                    connectAction = 'merge';
                                } else if (hitLedCircuitInfo.isEnd) {
                                    // NEW Merge-Reverse: (End of C1 / Unwired) -> End of C2
                                    canConnect = true;
                                    connectAction = 'merge-reverse';
                                } else {
                                    console.log("Invalid connection: Target LED is in the middle of a circuit.");
                                }
                            }
                        } else {
                            console.log("Invalid start point. Must be end of path or unwired.");
                        }

                        console.log(`Connection Check: canConnect=${canConnect}, action=${connectAction}`);

                        // --- Perform Connection ---
                        if (canConnect) {
                            let newlyAddedLedId = hitLedId;
                            let finalCircuitIndex = -1;

                            console.log("Wiring State BEFORE Connect Action:", JSON.parse(JSON.stringify(componentState.wiring)));
                            if (connectAction === 'append') {
                                const currentStartIndex = findLedInWiring(startLedId)?.circuitIndex;
                                if (currentStartIndex > -1 && componentState.wiring[currentStartIndex]) {
                                    componentState.wiring[currentStartIndex].push(hitLedId);
                                    finalCircuitIndex = currentStartIndex;
                                } else { console.error("Append Error: Start circuit index not valid."); connectAction = null; }
                            } else if (connectAction === 'newCircuit') {
                                componentState.wiring.push([startLedId, hitLedId]);
                                finalCircuitIndex = componentState.wiring.length - 1;
                            } else if (connectAction === 'merge') {
                                const currentTargetIndex = findLedInWiring(hitLedId)?.circuitIndex;
                                if (currentTargetIndex > -1 && componentState.wiring[currentTargetIndex]) {
                                    const targetCircuit = componentState.wiring.splice(currentTargetIndex, 1)[0];
                                    if (startLedCircuitInfo) {
                                        const currentStartIndex = findLedInWiring(startLedId)?.circuitIndex;
                                        if (currentStartIndex > -1 && componentState.wiring[currentStartIndex]) {
                                            componentState.wiring[currentStartIndex].push(...targetCircuit);
                                            finalCircuitIndex = currentStartIndex;
                                        } else { console.error("Merge error: Start circuit not found after splice."); componentState.wiring.push([startLedId, ...targetCircuit]); finalCircuitIndex = componentState.wiring.length - 1; }
                                    } else { componentState.wiring.push([startLedId, ...targetCircuit]); finalCircuitIndex = componentState.wiring.length - 1; }
                                } else { console.error("Merge error: Target circuit not found."); connectAction = null; }

                            } else if (connectAction === 'merge-reverse') {
                                const currentTargetIndex = findLedInWiring(hitLedId)?.circuitIndex;
                                if (currentTargetIndex > -1 && componentState.wiring[currentTargetIndex]) {
                                    // Get the target circuit and REVERSE it
                                    const targetCircuit = componentState.wiring.splice(currentTargetIndex, 1)[0];
                                    console.log("...reversing target circuit:", JSON.stringify(targetCircuit));
                                    targetCircuit.reverse(); // <-- The core of the new logic

                                    if (startLedCircuitInfo) {
                                        const currentStartIndex = findLedInWiring(startLedId)?.circuitIndex;
                                        if (currentStartIndex > -1 && componentState.wiring[currentStartIndex]) {
                                            componentState.wiring[currentStartIndex].push(...targetCircuit);
                                            finalCircuitIndex = currentStartIndex;
                                        } else {
                                            console.error("Merge-reverse error: Start circuit not found after splice.");
                                            componentState.wiring.push([startLedId, ...targetCircuit]);
                                            finalCircuitIndex = componentState.wiring.length - 1;
                                        }
                                    } else {
                                        // Start LED was unwired
                                        componentState.wiring.push([startLedId, ...targetCircuit]);
                                        finalCircuitIndex = componentState.wiring.length - 1;
                                    }
                                } else { console.error("Merge-reverse error: Target circuit not found."); connectAction = null; }
                            }

                            console.log("Wiring State AFTER Connect Action:", JSON.parse(JSON.stringify(componentState.wiring)));

                            if (connectAction) {
                                stateChanged = true;
                                const nextCircuitInfo = findLedInWiring(newlyAddedLedId);
                                if (nextCircuitInfo) {
                                    pendingConnectionStartLed = { ledId: newlyAddedLedId, ...nextCircuitInfo };
                                    console.log(`Wiring: Chaining - ${newlyAddedLedId} is now pending start.`);
                                } else { console.warn("Wiring: Chaining failed. Clearing pending."); pendingConnectionStartLed = null; }
                            } else { console.log("Wiring: Connection action failed. Clearing pending."); pendingConnectionStartLed = null; }
                            drawCanvas();
                        } else {
                            console.log("Wiring: Invalid connection. Treating as NEW first click.");
                            pendingConnectionStartLed = { ledId: hitLedId, ...hitLedCircuitInfo };
                            drawCanvas();
                        }
                    }
                } else { // == FIRST CLICK ==
                    if (!hitLedCircuitInfo || hitLedCircuitInfo.isEnd) {
                        console.log(`Wiring: First click -> Pending Start = ${hitLedId}`);
                        pendingConnectionStartLed = { ledId: hitLedId, ...hitLedCircuitInfo };
                        // If starting from an unwired LED, create a new single-LED circuit
                        if (!hitLedCircuitInfo) {
                            componentState.wiring.push([hitLedId]);
                            console.log("Starting new wire with first LED as new circuit.");
                            stateChanged = true;
                        }
                        drawCanvas();
                    } else {
                        console.log("Wiring: Invalid start point. Must be end of path or unwired. Clearing pending.");
                        pendingConnectionStartLed = null; drawCanvas();
                    }
                }
            } else { // Clicked empty space
                if (pendingConnectionStartLed) {
                    console.log("Wiring: Clicked empty space -> Cancelling Pending Start.");
                    pendingConnectionStartLed = null; drawCanvas();
                } else { console.log("Wiring: Clicked empty space, no pending start."); }
            }
            console.log("--- Wiring Click End ---");
            console.log("Final Pending Start:", pendingConnectionStartLed ? { ...pendingConnectionStartLed, circuitInfo: pendingConnectionStartLed.circuitInfo ? { ...pendingConnectionStartLed.circuitInfo, circuit: '[Ref]' } : null } : null);
        } // --- End Wiring Tool Logic ---

        if (stateChanged) autoSave();
    } // --- End Left Click ---
} // --- End handleCanvasMouseDown ---


function handleCanvasMouseMove(e) {
    if (!viewTransform) return;
    const worldPos = screenToWorld(e.offsetX, e.offsetY);
    const coordsDisplay = document.getElementById('coords-display');
    if (coordsDisplay) {
        const gridX = Math.round(worldPos.x / GRID_SIZE);
        const gridY = -Math.round(worldPos.y / GRID_SIZE);
        coordsDisplay.textContent = `${gridX}, ${gridY}`;
    }
    if (isPanning) {
        viewTransform.panX += e.movementX; viewTransform.panY += e.movementY;
        drawCanvas();
    } else if (isDragging) {
        didDrag = true;
        ledDragOffsets.forEach(item => { item.led.x = worldPos.x + item.offsetX; item.led.y = worldPos.y + item.offsetY; });
        drawCanvas();
    } else if (isMarqueeSelecting) {
        didDrag = true; marqueeEndPos = worldPos;
        drawCanvas();
    } else if (isImageGuideDragging || isImageGuideScaling || isImageGuideRotating) {
        didDrag = true;
        const worldPos = screenToWorld(e.offsetX, e.offsetY);
        let stateChanged = false;

        if (isImageGuideDragging) {
            imageGuideState.x = worldPos.x - imageDragOffset.x;
            imageGuideState.y = worldPos.y - imageDragOffset.y;
            stateChanged = true;
        } else if (isImageGuideScaling) {
            // Calculate un-rotated world position of the mouse relative to the image's top-left corner
            const dx = worldPos.x - imageGuideState.x;
            const dy = worldPos.y - imageGuideState.y;
            const newScaleX = dx / componentState.guideImageWidth;
            const newScaleY = dy / componentState.guideImageHeight;

            // Use the larger scale factor to maintain aspect ratio
            const newScale = Math.max(0.1, Math.max(newScaleX, newScaleY));
            imageGuideState.scale = newScale;
            stateChanged = true;
        } else if (isImageGuideRotating) {
            // Calculate angle from image center to mouse
            const imgScale = imageGuideState.scale;
            const imgWidth = componentState.guideImageWidth * imgScale;
            const imgHeight = componentState.guideImageHeight * imgScale;
            const guideCenterX = imageGuideState.x + imgWidth / 2;
            const guideCenterY = imageGuideState.y + imgHeight / 2;

            const angleRad = Math.atan2(worldPos.y - guideCenterY, worldPos.x - guideCenterX);
            let angleDeg = angleRad * (180 / Math.PI);

            // Normalize angle (0 to 360) and snap to 15-degree increments
            angleDeg = (angleDeg + 360) % 360;
            const snappedAngle = Math.round(angleDeg / 15) * 15;
            imageGuideState.rotation = snappedAngle;
            stateChanged = true;
        }

        if (stateChanged) drawCanvas();
    } else if (currentToolGetter() === 'image' && componentState.guideImageUrl && imageGuideState.isVisible && !imageGuideState.isLocked) {
        // Hovering over handles in 'image' tool
        const hitHandle = findHitImageHandle(worldPos);
        if (hitHandle === 'move') {
            canvas.style.cursor = 'grab';
        } else if (hitHandle === 'scale') {
            canvas.style.cursor = 'nwse-resize';
        } else if (hitHandle === 'rotate') {
            canvas.style.cursor = 'crosshair';
        } else {
            canvas.style.cursor = 'default';
        }
    }
}

function handleCanvasMouseUp(e) {
    if (!componentState || !Array.isArray(componentState.leds) || !selectedLedIds) return;
    // Stop Panning (Middle or Right)
    if (e.button === 1 || e.button === 2) {
        if (isPanning) {
            console.log("Mouse Up: Stopping Pan.");
            isPanning = false; window.setAppCursor(); e.preventDefault();
        }
    }
    // Left Mouse Up
    if (e.button === 0) {
        let stateChanged = false;
        if (isDragging) {
            console.log("Mouse Up: Stopping Drag.");
            isDragging = false; window.setAppCursor();
            ledDragOffsets.forEach(item => {
                item.led.x = Math.round(item.led.x / GRID_SIZE) * GRID_SIZE;
                item.led.y = Math.round(item.led.y / GRID_SIZE) * GRID_SIZE;
            });
            ledDragOffsets = []; drawCanvas(); stateChanged = true;
            console.log('handleCanvasMouseUp (drag end): Calling autoSave');
        } else if (isMarqueeSelecting) {
            console.log("Mouse Up: Stopping Marquee.");
            isMarqueeSelecting = false;
            const initialSelectionSize = selectedLedIds.size;
            const ledsInBox = getLedsInMarquee(marqueeStartPos, marqueeEndPos);
            (ledsInBox || []).forEach(led => selectedLedIds.add(led.id));
            if (selectedLedIds.size !== initialSelectionSize) {
                stateChanged = true; console.log('handleCanvasMouseUp (marquee end): Selection changed.');
            } else { console.log('handleCanvasMouseUp (marquee end): Selection did not change.'); }
            marqueeStartPos = {}; marqueeEndPos = {}; drawCanvas();
        } else if (isImageGuideDragging || isImageGuideScaling || isImageGuideRotating) {
            // --- NEW: Image Tool Mouse Up ---
            console.log("Mouse Up: Stopping Image Guide Interaction.");
            isImageGuideDragging = false;
            isImageGuideScaling = false;
            isImageGuideRotating = false;
            imageGuideHandle = null;
            window.setAppCursor(); // Will call setAppCursor which updates based on tool
            drawCanvas();
            if (didDrag) stateChanged = true; // Only save if a move/scale/rotate actually happened
            // --- END NEW ---
        }
        if (stateChanged) autoSave();
        didDrag = false;
    }
}

function handleCanvasMouseLeave(e) {
    if (!componentState || !Array.isArray(componentState.leds)) return;
    const coordsDisplay = document.getElementById('coords-display');
    if (coordsDisplay) coordsDisplay.textContent = '---, ---';
    let stateChanged = false;
    if (isPanning) { console.log("Mouse Leave: Stopping Pan."); isPanning = false; window.setAppCursor(); }
    if (isDragging) {
        console.log("Mouse Leave: Stopping Drag."); isDragging = false; window.setAppCursor();
        ledDragOffsets.forEach(item => {
            item.led.x = Math.round(item.led.x / GRID_SIZE) * GRID_SIZE;
            item.led.y = Math.round(item.led.y / GRID_SIZE) * GRID_SIZE;
        });
        ledDragOffsets = []; stateChanged = true;
        console.log('handleCanvasMouseLeave (drag end): Changes detected.');
    }
    if (isMarqueeSelecting) { console.log("Mouse Leave: Stopping Marquee."); isMarqueeSelecting = false; }
    // --- NEW: Image Tool Mouse Leave ---
    if (isImageGuideDragging || isImageGuideScaling || isImageGuideRotating) {
        console.log("Mouse Leave: Stopping Image Guide Interaction.");
        isImageGuideDragging = false;
        isImageGuideScaling = false;
        isImageGuideRotating = false;
        imageGuideHandle = null;
        window.setAppCursor();
        stateChanged = true; // Force save if an operation was mid-flight
    }
    // --- END NEW ---
    drawCanvas(); if (stateChanged) autoSave();
}

function handleCanvasWheel(e) {
    e.preventDefault(); const zoomIntensity = 0.1; const zoomDirection = e.deltaY < 0 ? 1 : -1;
    const zoomFactor = 1 + (zoomDirection * zoomIntensity); zoomAtPoint(e.offsetX, e.offsetY, zoomFactor);
}

// --- COORDINATE & VIEWPORT ---
function screenToWorld(screenX, screenY) {
    if (!viewTransform) return { x: screenX, y: screenY };
    return { x: (screenX - viewTransform.panX) / viewTransform.zoom, y: (screenY - viewTransform.panY) / viewTransform.zoom };
}
function worldToScreen(worldX, worldY) {
    if (!viewTransform) return { x: worldX, y: worldY };
    return { x: (worldX * viewTransform.zoom) + viewTransform.panX, y: (worldY * viewTransform.zoom) + viewTransform.panY };
}
export function zoomAtPoint(screenX, screenY, zoomFactor) {
    if (!viewTransform) return;
    const worldPos = screenToWorld(screenX, screenY);
    const newZoom = Math.max(0.1, Math.min(10, viewTransform.zoom * zoomFactor));
    viewTransform.panX = screenX - (worldPos.x * newZoom); viewTransform.panY = screenY - (worldPos.y * newZoom);
    viewTransform.zoom = newZoom; drawCanvas();
}
function calculateLedBounds() {
    if (!componentState || !Array.isArray(componentState.leds) || componentState.leds.length === 0) return null;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    componentState.leds.forEach(led => {
        if (!led) return;
        minX = Math.min(minX, led.x); minY = Math.min(minY, led.y);
        maxX = Math.max(maxX, led.x); maxY = Math.max(maxY, led.y);
    });
    if (minX === Infinity) return null;
    return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY, centerX: minX + (maxX - minX) / 2, centerY: minY + (maxY - minY) / 2 };
}
export function resetView() {
    if (!viewTransform || !canvas) return;
    const bounds = calculateLedBounds();
    if (!bounds || bounds.width < 0 || bounds.height < 0) {
        viewTransform.zoom = 5; viewTransform.panX = canvas.width / 2; viewTransform.panY = canvas.height / 2;
        console.log("Reset View: No LEDs found, centering on origin.");
    } else {
        const padding = 50; const canvasWidth = canvas.width - padding * 2; const canvasHeight = canvas.height - padding * 2;
        const boundsWidth = Math.max(GRID_SIZE, bounds.width); const boundsHeight = Math.max(GRID_SIZE, bounds.height);
        const zoomX = canvasWidth > 0 ? canvasWidth / boundsWidth : 1;
        const zoomY = canvasHeight > 0 ? canvasHeight / boundsHeight : 1;
        viewTransform.zoom = Math.max(0.1, Math.min(zoomX, zoomY, 10));
        viewTransform.panX = canvas.width / 2 - bounds.centerX * viewTransform.zoom;
        viewTransform.panY = canvas.height / 2 - bounds.centerY * viewTransform.zoom;
        console.log("Reset View: Zooming to fit bounds.", bounds);
    }
    drawCanvas();
}

export function clearPendingConnection() {
    if (pendingConnectionStartLed) {
        console.log("Clearing pending connection state.");
        pendingConnectionStartLed = null;
        drawCanvas(); // Redraw to remove highlight
    }
}

export function toggleGrid() {
    isGridVisible = !isGridVisible; drawCanvas();
}

// --- RENDERING ---
function snap(n) { return Math.floor(n) + 0.5; }
function drawGrid() {
    if (!ctx || !viewTransform || !canvas) return;
    const scaledGrid = GRID_SIZE * viewTransform.zoom;

    // --- Draw Grid Lines ---
    // NOTE: This function draws in SCREEN SPACE (untransformed)
    if (scaledGrid >= 5) {
        ctx.beginPath();
        ctx.strokeStyle = gridStrokeColor;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        const originScreen = worldToScreen(0, 0);
        const worldTopLeft = screenToWorld(0, 0);
        const worldBotRight = screenToWorld(canvas.width, canvas.height);
        const xStepsLeft = Math.floor(worldTopLeft.x / GRID_SIZE);
        const xStepsRight = Math.ceil(worldBotRight.x / GRID_SIZE);
        const yStepsTop = Math.floor(worldTopLeft.y / GRID_SIZE);
        const yStepsBottom = Math.ceil(worldBotRight.y / GRID_SIZE);
        for (let i = xStepsLeft; i <= xStepsRight; i++) {
            const screenX = snap(originScreen.x + (i * scaledGrid));
            ctx.moveTo(screenX, 0);
            ctx.lineTo(screenX, canvas.height);
        }
        for (let i = yStepsTop; i <= yStepsBottom; i++) {
            const screenY = snap(originScreen.y + (i * scaledGrid));
            ctx.moveTo(0, screenY);
            ctx.lineTo(canvas.width, screenY);
        }
        ctx.stroke();
    }

    // --- NEW: Draw Origin (0,0) Crosshair ---
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // Reset transform to screen space
    ctx.setLineDash([]); // Ensure solid line

    const originScreen = worldToScreen(0, 0);
    const originX = snap(originScreen.x);
    const originY = snap(originScreen.y);
    const crosshairSize = 8; // Screen pixels

    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.7)'; // Red color
    ctx.lineWidth = 2; // Thicker line

    // Horizontal line
    ctx.moveTo(originX - crosshairSize, originY);
    ctx.lineTo(originX + crosshairSize, originY);

    // Vertical line
    ctx.moveTo(originX, originY - crosshairSize);
    ctx.lineTo(originX, originY + crosshairSize);

    ctx.stroke();
    ctx.restore(); // Restore grid transform/settings (though we're at the end)
}

/**
 * Draws the guide image on the canvas using its world-space transform.
 */
function drawImageGuide() {
    if (!ctx || !imageGuideImg || !componentState.guideImageUrl || !imageGuideState.isVisible) return;

    // Ensure the image object has loaded and has natural dimensions before drawing.
    if (imageGuideImg.naturalWidth === 0 || imageGuideImg.naturalHeight === 0) {
        return;
    }

    ctx.save();

    // The image's transformation is applied *after* the canvas's main transform (translate/scale)
    const imgX = imageGuideState.x;
    const imgY = imageGuideState.y;
    const imgScale = imageGuideState.scale;
    const imgRot = imageGuideState.rotation;

    const imgWidth = componentState.guideImageWidth * imgScale;
    const imgHeight = componentState.guideImageHeight * imgScale;
    const imgCenterX = imgX + imgWidth / 2;
    const imgCenterY = imgY + imgHeight / 2;

    // Apply translation, rotation, and re-translation to draw in world space
    ctx.translate(imgCenterX, imgCenterY);
    ctx.rotate(imgRot * Math.PI / 180);
    ctx.translate(-imgCenterX, -imgCenterY);

    // Draw the image
    ctx.globalAlpha = 0.5; // Draw transparently
    ctx.drawImage(imageGuideImg, imgX, imgY, imgWidth, imgHeight);
    ctx.globalAlpha = 1.0;

    // Draw Handles if Tool is Active and Unlocked
    if (currentToolGetter() === 'image' && !imageGuideState.isLocked) {
        // Since we are in the main canvas transform scope, we can draw the handles easily
        const handleRadius = HANDLE_SIZE / viewTransform.zoom;
        const color = 'rgba(255, 0, 0, 0.8)'; // Red handles

        ctx.fillStyle = color;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1 / viewTransform.zoom;

        // 1. ROTATE Handle (Top-Left)
        ctx.beginPath();
        ctx.arc(imgX, imgY, handleRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // 2. SCALE Handle (Bottom-Right)
        ctx.beginPath();
        ctx.arc(imgX + imgWidth, imgY + imgHeight, handleRadius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        // 3. Move Handle (Center) - Simple crosshair for visual guide
        const crosshairSize = handleRadius * 0.8;
        ctx.beginPath();
        ctx.moveTo(imgCenterX - crosshairSize, imgCenterY);
        ctx.lineTo(imgCenterX + crosshairSize, imgCenterY);
        ctx.moveTo(imgCenterX, imgCenterY - crosshairSize);
        ctx.lineTo(imgCenterX, imgCenterY + crosshairSize);
        ctx.strokeStyle = color;
        ctx.lineWidth = 3 / viewTransform.zoom;
        ctx.stroke();
    }

    ctx.restore(); // Restore the main canvas transform
}


function drawMarqueeBox() {
    if (!ctx || !isMarqueeSelecting || !viewTransform) return;
    if (typeof marqueeStartPos.x !== 'number' || typeof marqueeEndPos.x !== 'number') return;
    const startScreen = worldToScreen(marqueeStartPos.x, marqueeStartPos.y); const endScreen = worldToScreen(marqueeEndPos.x, marqueeEndPos.y);
    const w = endScreen.x - startScreen.x; const h = endScreen.y - startScreen.y;
    if (Math.abs(w) < 1 && Math.abs(h) < 1) return;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = 'rgba(13, 110, 253, 0.2)'; ctx.strokeStyle = '#0d6efd'; ctx.lineWidth = 1;
    ctx.fillRect(startScreen.x, startScreen.y, w, h); ctx.strokeRect(startScreen.x, startScreen.y, w, h);
    ctx.restore();
}
function drawWiringNumbers() {
    if (!ctx || !componentState || !Array.isArray(componentState.wiring) || !Array.isArray(componentState.leds) || !viewTransform) return;

    const flatWiringOrder = (componentState.wiring || []).flat().filter(id => id != null);
    if (flatWiringOrder.length === 0) return;
    const numberedLedIds = new Set();

    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0);

    const theme = document.documentElement.getAttribute('data-bs-theme') || 'dark';
    ctx.fillStyle = (theme === 'light') ? '#000000' : '#ffffff'; // Black text on light, white on dark

    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const fontSize = Math.max(6, Math.min(12, (LED_RADIUS * viewTransform.zoom) * 0.5)); // Smaller font
    ctx.font = `bold ${fontSize}px sans-serif`;

    console.log("Wiring Order for Numbering:", JSON.stringify(flatWiringOrder));

    flatWiringOrder.forEach((id, index) => {
        if (!numberedLedIds.has(id)) {
            const led = componentState.leds.find(l => l && l.id === id);
            if (!led) { console.warn(`drawWiringNumbers: LED ID ${id} not found.`); numberedLedIds.add(id); return; }
            const screenPos = worldToScreen(led.x, led.y);
            if (screenPos.x < -fontSize || screenPos.x > (canvas?.width ?? 0) + fontSize || screenPos.y < -fontSize || screenPos.y > (canvas?.height ?? 0) + fontSize) {
                numberedLedIds.add(id); return;
            }
            const numberToDraw = index + 1;
            console.log(`Drawing number ${numberToDraw} for LED ID ${id} at flattened index ${index}`);
            ctx.fillText(numberToDraw.toString(), screenPos.x, screenPos.y);
            numberedLedIds.add(id);
        } else { console.log(`Skipping duplicate draw for LED ID ${id} at index ${index}`); }
    });
    ctx.restore();
}

export function drawCanvas() {
    if (!ctx || !canvas || !componentState || !Array.isArray(componentState.leds) || !viewTransform) {
        if (ctx && canvas) { ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.restore(); }
        return;
    }
    // This check is now crucial
    if (!Array.isArray(componentState.wiring)) {
        console.error("drawCanvas: wiring state is not an array! Resetting.");
        componentState.wiring = [];
    }

    getCanvasStyles();

    // 1. Clear canvas (Screen space)
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.restore();

    // 2. Apply main canvas transform (World space)
    ctx.save(); ctx.translate(viewTransform.panX, viewTransform.panY); ctx.scale(viewTransform.zoom, viewTransform.zoom);

    // 3. Draw Image Guide (WORLD SPACE - UNDER everything else)
    drawImageGuide();

    // 4. Restore the World Transform before drawing the grid in Screen Space
    ctx.restore();

    // 5. Draw Grid (SCREEN SPACE - relies on the global viewTransform but not ctx.translate/scale)
    if (isGridVisible) drawGrid();

    // 6. Re-apply main canvas transform for LEDs/Wires/Objects
    ctx.save(); ctx.translate(viewTransform.panX, viewTransform.panY); ctx.scale(viewTransform.zoom, viewTransform.zoom);

    // 7. Drawing of LEDs and Wires (World space)

    // ... (All existing LED/Wire drawing logic follows here)

    // --- MODIFICATION: Define colors based on theme ---
    const theme = document.documentElement.getAttribute('data-bs-theme') || 'dark';

    const greenFill = 'rgba(0, 200, 0, 0.7)';
    const redFill = 'rgba(255, 0, 0, 0.7)';
    const orangeFill = 'rgba(255, 165, 0, 0.7)';
    const dimRedFill = 'rgba(100, 0, 0, 0.3)';

    const whiteStroke = (theme === 'light') ? '#000000' : '#ffffff'; // Black for light, White for dark
    const dimStroke = (theme === 'light') ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)';
    const highlightStroke = '#FFFF00'; // Yellow highlight works on both

    const lineWidth = 1 / viewTransform.zoom;
    const ledRadius = LED_RADIUS * lineWidth;
    // --- END MODIFICATION ---

    const ledsToDraw = componentState.leds;
    const allWiredLedIds = new Set();
    (componentState.wiring || []).forEach(circuit => { if (Array.isArray(circuit)) circuit.forEach(id => allWiredLedIds.add(id)); });

    // --- Logic to find orange LEDs ---
    const hasMultipleCircuits = componentState.wiring.length >= 2;
    let orangeLedIds = new Set();

    if (hasMultipleCircuits) {
        let overallFirstLedId = null;
        let overallLastLedId = null;

        if (componentState.wiring.length > 0 && Array.isArray(componentState.wiring[0]) && componentState.wiring[0].length > 0) {
            overallFirstLedId = componentState.wiring[0][0];
        }

        const lastCircuitIndex = componentState.wiring.length - 1;
        if (lastCircuitIndex >= 0 && Array.isArray(componentState.wiring[lastCircuitIndex]) && componentState.wiring[lastCircuitIndex].length > 0) {
            const lastCircuit = componentState.wiring[lastCircuitIndex];
            overallLastLedId = lastCircuit[lastCircuit.length - 1];
        }

        for (const circuit of componentState.wiring) {
            if (Array.isArray(circuit) && circuit.length > 0) {
                orangeLedIds.add(circuit[0]);
                if (circuit.length > 1) {
                    orangeLedIds.add(circuit[circuit.length - 1]);
                }
            }
        }
        if (overallFirstLedId) orangeLedIds.delete(overallFirstLedId);
        if (overallLastLedId) orangeLedIds.delete(overallLastLedId);
    }
    // --- END LOGIC ---

    ctx.lineWidth = lineWidth;

    if (componentState.wiring && componentState.wiring.length > 0) {
        ctx.strokeStyle = '#0d6efd'; ctx.lineWidth = 2 * lineWidth;
        ctx.setLineDash([5 * lineWidth, 5 * lineWidth]);
        (componentState.wiring || []).forEach(circuit => {
            if (!Array.isArray(circuit) || circuit.length < 2) return;
            ctx.beginPath(); let lastLed = null;
            for (const id of circuit) {
                const led = ledsToDraw.find(l => l && l.id === id); if (!led) continue;
                if (lastLed) { ctx.moveTo(lastLed.x, lastLed.y); ctx.lineTo(led.x, led.y); }
                lastLed = led;
            }
            ctx.stroke();
        });
        ctx.setLineDash([]);
    }

    for (const led of ledsToDraw) {
        if (!led) continue;
        const isWired = allWiredLedIds.has(led.id);
        const isPendingStart = pendingConnectionStartLed && pendingConnectionStartLed.ledId === led.id;
        const isOrange = orangeLedIds.has(led.id);
        const isWiringToolActive = currentToolGetter() === 'wiring' || currentToolGetter() === 'place-led';

        // --- MODIFIED: Re-ordered logic to prioritize highlights and orange ---
        if (isPendingStart) {
            // Pending highlight overrides everything
            ctx.fillStyle = isWired ? greenFill : dimRedFill;
            ctx.strokeStyle = highlightStroke;
        } else if (isOrange) {
            // Orange overrides standard green/red
            ctx.fillStyle = orangeFill;
            ctx.strokeStyle = isWiringToolActive ? (isWired ? whiteStroke : dimStroke) : whiteStroke;
        } else if (isWiringToolActive) {
            // Standard wiring tool colors
            ctx.fillStyle = isWired ? greenFill : dimRedFill;
            ctx.strokeStyle = isWired ? whiteStroke : dimStroke;
        } else {
            // Standard select tool colors
            ctx.fillStyle = isWired ? greenFill : redFill;
            ctx.strokeStyle = whiteStroke;
        }

        ctx.lineWidth = isPendingStart ? lineWidth * 3 : lineWidth; // Set width
        ctx.beginPath(); ctx.arc(led.x, led.y, ledRadius, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
        ctx.lineWidth = lineWidth; // Reset for next loop
        // --- END MODIFIED ---
    }

    // 8. Restore the final main canvas transform
    ctx.restore();

    // 9. Draw screen-space overlays (Numbers, Marquee)
    if (componentState.wiring && componentState.wiring.length > 0) {
        if (componentState.wiring.some(c => Array.isArray(c) && c.length > 0)) {
            drawWiringNumbers();
        }
    }
    drawMarqueeBox();
}
window.drawCanvas = drawCanvas;