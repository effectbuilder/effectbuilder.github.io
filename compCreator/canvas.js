// --- IMPORT SHARED FUNCTIONS ---
import { showToast } from './util.js';

// --- CANVAS-SPECIFIC STATE ---
let canvas, ctx;
let componentState = null;
let viewTransform = null;
let selectedLedIds = null;
let currentToolGetter = () => 'select';
let autoSave = () => {};

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

// --- INITIALIZATION ---
export function setupCanvas(appState) {
    canvas = appState.canvas;
    ctx = appState.ctx;
    componentState = appState.componentState;
    viewTransform = appState.viewTransform;
    selectedLedIds = appState.selectedLedIds;
    currentToolGetter = appState.getCurrentTool;
    autoSave = appState.autoSave;

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
    const hitThreshold = 5 / viewTransform.zoom;
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
                 if(worldPos.x >= minX && worldPos.x <= maxX && worldPos.y >= minY && worldPos.y <= maxY) {
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
    // Only handle right-clicks when the wiring tool is active
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
                // First part goes up to and includes the first LED of the segment
                const firstPart = originalCircuit.slice(0, hitSegment.segmentStartIndex + 1);
                // Second part starts from the second LED of the segment
                const secondPart = originalCircuit.slice(hitSegment.segmentStartIndex + 1);

                // Replace original with first part (if not empty)
                if (firstPart.length > 0) {
                    componentState.wiring.splice(hitSegment.circuitIndex, 1, firstPart);
                } else {
                     // If first part is empty, just remove the original circuit
                     componentState.wiring.splice(hitSegment.circuitIndex, 1);
                }
                // Add second part as new circuit (if not empty)
                if (secondPart.length > 0) {
                    componentState.wiring.push(secondPart);
                }
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

    } else {
         console.log("Context menu event ignored (not in wiring mode).");
         // Allow default context menu to appear
    }
} // --- End handleContextMenu ---

function handleCanvasMouseDown(e) {
  console.log(`>>> mousedown event: Button=${e.button}, Tool=${currentToolGetter()}`);
  if (!componentState || !Array.isArray(componentState.leds) || !Array.isArray(componentState.wiring)) return;

  // --- Pan on Middle click OR Right click (if NOT wiring) ---
  if (e.button === 1 || (e.button === 2 && currentToolGetter() !== 'wiring')) {
    console.log("Starting Pan...");
    isPanning = true; canvas.style.cursor = 'grabbing'; e.preventDefault(); return;
  }

  // --- Right Click: Handled by contextmenu listener ---
  if (e.button === 2) {
      if(currentToolGetter() === 'wiring') e.preventDefault(); // Still prevent default if wiring tool
      return; // Stop further mousedown processing for right click
  }

  // --- Left Click Logic ---
  if (e.button === 0) {
    didDrag = false;
    const worldPos = screenToWorld(e.offsetX, e.offsetY);
    const hitLed = findHitLed(worldPos);
    let stateChanged = false;
    console.log(`Left Mouse Down: Tool=${currentToolGetter()}, Hit LED=${hitLed ? hitLed.id : 'None'}`);

    if (currentToolGetter() === 'place-led') {
        if (hitLed) {
            window.setAppTool('select'); selectedLedIds.clear(); selectedLedIds.add(hitLed.id); drawCanvas();
        } else {
            const x = Math.round(worldPos.x / GRID_SIZE) * GRID_SIZE; const y = Math.round(worldPos.y / GRID_SIZE) * GRID_SIZE;
            if (!checkOverlap([{x,y}])) {
                const newId = Date.now().toString(); const newLed = { id: newId, x: x, y: y };
                if (!Array.isArray(componentState.leds)) componentState.leds = [];
                componentState.leds.push(newLed);
                drawCanvas(); stateChanged = true;
                console.log('handleCanvasMouseDown (place): State changed.');
            } else {
                console.log("Place LED blocked by overlap."); showToast("Overlap", "Cannot place an LED on top of another.", "warning");
            }
        }
    }

    if (currentToolGetter() === 'select') {
      if (hitLed) {
        console.log(`Select Tool: Hit LED ${hitLed.id}. Shift: ${e.shiftKey}`); console.log("Selection BEFORE:", Array.from(selectedLedIds));
        isDragging = true; canvas.style.cursor = 'grabbing'; let selectionChanged = false;
        if (!e.shiftKey) { if (!selectedLedIds.has(hitLed.id) || selectedLedIds.size > 1) { selectedLedIds.clear(); selectedLedIds.add(hitLed.id); selectionChanged = true; } }
        else { if (selectedLedIds.has(hitLed.id)) { selectedLedIds.delete(hitLed.id); } else { selectedLedIds.add(hitLed.id); } selectionChanged = true; }
        console.log("Selection AFTER:", Array.from(selectedLedIds)); if (selectionChanged) { drawCanvas(); }
        ledDragOffsets = []; componentState.leds.forEach(led => { if (!led) return; if (selectedLedIds.has(led.id)) { ledDragOffsets.push({ led: led, offsetX: led.x - worldPos.x, offsetY: led.y - worldPos.y }); } });
        console.log(`Prepared ${ledDragOffsets.length} LEDs for dragging.`);
      } else {
        console.log("Select Tool: Clicked empty space. Starting Marquee."); isMarqueeSelecting = true;
        marqueeStartPos = { x: worldPos.x, y: worldPos.y }; marqueeEndPos = { x: worldPos.x, y: worldPos.y };
        console.log("Marquee Start Pos (World):", marqueeStartPos);
        if (!e.shiftKey) { if (selectedLedIds.size > 0) { selectedLedIds.clear(); } }
        requestAnimationFrame(drawCanvas);
      }
    } // End Select Tool

    if (currentToolGetter() === 'wiring') {
      console.log("--- Wiring Click Start ---");
      console.log("Current Wiring State:", JSON.parse(JSON.stringify(componentState.wiring)));
      console.log("Current Pending Start:", pendingConnectionStartLed ? {...pendingConnectionStartLed, circuitInfo: pendingConnectionStartLed.circuitInfo ? { ...pendingConnectionStartLed.circuitInfo, circuit: '[Ref]' } : null } : null);

      if (hitLed) {
        const hitLedId = hitLed.id;
        let hitLedCircuitInfo = findLedInWiring(hitLedId);
        console.log(`Hit LED: ${hitLedId}. Circuit Info:`, hitLedCircuitInfo ? {...hitLedCircuitInfo, circuit: '[Ref]'} : null);

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
            if (!hitLedCircuitInfo) { // Target is UNWIRED
              if (!startLedCircuitInfo || startLedCircuitInfo.isEnd) {
                  canConnect = true; connectAction = startLedCircuitInfo ? 'append' : 'newCircuit';
              }
            } else { // Target IS WIRED
              if (hitLedCircuitInfo.isStart &&
                  (!startLedCircuitInfo || startLedCircuitInfo.isEnd) &&
                  (!startLedCircuitInfo || startLedCircuitInfo.circuitIndex !== hitLedCircuitInfo.circuitIndex) )
              { canConnect = true; connectAction = 'merge'; }
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
      console.log("Final Pending Start:", pendingConnectionStartLed ? {...pendingConnectionStartLed, circuitInfo: pendingConnectionStartLed.circuitInfo ? { ...pendingConnectionStartLed.circuitInfo, circuit: '[Ref]' } : null } : null);
    } // --- End Wiring Tool Logic ---

    if (stateChanged) autoSave();
  } // --- End Left Click ---
} // --- End handleCanvasMouseDown ---


function handleCanvasMouseMove(e) {
  if (!viewTransform) return;
  const worldPos = screenToWorld(e.offsetX, e.offsetY);
  const coordsDisplay = document.getElementById('coords-display');
   if (coordsDisplay) { coordsDisplay.textContent = `${Math.round(worldPos.x)}, ${Math.round(worldPos.y)}`; }
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
    }
    if (stateChanged) autoSave();
    didDrag = false;
  }
}

function handleCanvasMouseLeave(e) {
  if (!componentState || !Array.isArray(componentState.leds)) return;
  const coordsDisplay = document.getElementById('coords-display');
  if(coordsDisplay) coordsDisplay.textContent = '---, ---';
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
export function toggleGrid() {
    isGridVisible = !isGridVisible; drawCanvas();
}

// --- RENDERING ---
function snap(n) { return Math.floor(n) + 0.5; }
function drawGrid() {
  if (!ctx || !viewTransform || !canvas) return;
  const scaledGrid = GRID_SIZE * viewTransform.zoom; if (scaledGrid < 5) return;
  ctx.beginPath(); ctx.strokeStyle = 'rgba(255, 255, 255, 0.07)'; ctx.lineWidth = 1;
  const originScreen = worldToScreen(0, 0); const worldTopLeft = screenToWorld(0, 0); const worldBotRight = screenToWorld(canvas.width, canvas.height);
  const xStepsLeft = Math.floor(worldTopLeft.x / GRID_SIZE); const xStepsRight = Math.ceil(worldBotRight.x / GRID_SIZE);
  const yStepsTop = Math.floor(worldTopLeft.y / GRID_SIZE); const yStepsBottom = Math.ceil(worldBotRight.y / GRID_SIZE);
  for (let i = xStepsLeft; i <= xStepsRight; i++) { const screenX = snap(originScreen.x + (i * scaledGrid)); ctx.moveTo(screenX, 0); ctx.lineTo(screenX, canvas.height); }
  for (let i = yStepsTop; i <= yStepsBottom; i++) { const screenY = snap(originScreen.y + (i * scaledGrid)); ctx.moveTo(0, screenY); ctx.lineTo(canvas.width, screenY); }
  ctx.stroke();
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
    ctx.fillStyle = '#ffffff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
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

  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.restore();
  if (isGridVisible) drawGrid();
  ctx.save(); ctx.translate(viewTransform.panX, viewTransform.panY); ctx.scale(viewTransform.zoom, viewTransform.zoom);

  const lineWidth = 1 / viewTransform.zoom; const ledRadius = LED_RADIUS * lineWidth;
  const ledsToDraw = componentState.leds;
  const allWiredLedIds = new Set();
  (componentState.wiring || []).forEach(circuit => { if(Array.isArray(circuit)) circuit.forEach(id => allWiredLedIds.add(id)); });

  const greenFill = 'rgba(0, 200, 0, 0.7)'; const redFill = 'rgba(255, 0, 0, 0.7)';
  const dimGreenFill = 'rgba(0, 100, 0, 0.3)'; const dimRedFill = 'rgba(100, 0, 0, 0.3)';
  const whiteStroke = '#ffffff'; const dimStroke = 'rgba(255, 255, 255, 0.4)';
  const highlightStroke = '#FFFF00';
  ctx.lineWidth = lineWidth;

  for (const led of ledsToDraw) {
      if (!led) continue;
      const isWired = allWiredLedIds.has(led.id);
      const isPendingStart = pendingConnectionStartLed && pendingConnectionStartLed.ledId === led.id; // Use object's ledId
      const isWiringToolActive = currentToolGetter() === 'wiring';

      if (isWiringToolActive) {
          ctx.fillStyle = isWired ? greenFill : dimRedFill;
          ctx.strokeStyle = isPendingStart ? highlightStroke : (isWired ? whiteStroke : dimStroke);
      } else {
          ctx.fillStyle = isWired ? greenFill : redFill;
          ctx.strokeStyle = whiteStroke;
      }
      ctx.lineWidth = isPendingStart ? lineWidth * 3 : lineWidth;
      ctx.beginPath(); ctx.arc(led.x, led.y, ledRadius, 0, 2 * Math.PI); ctx.fill(); ctx.stroke();
      ctx.lineWidth = lineWidth;
  }

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

  if (currentToolGetter() === 'select' && selectedLedIds && selectedLedIds.size > 0) {
      ctx.strokeStyle = '#0d6efd'; const selectionRadius = (LED_RADIUS + 3) * lineWidth; ctx.lineWidth = 2 * lineWidth;
      for (const led of ledsToDraw) {
          if (!led) continue;
          if (selectedLedIds.has(led.id)) { ctx.beginPath(); ctx.arc(led.x, led.y, selectionRadius, 0, 2 * Math.PI); ctx.stroke(); }
      }
  }

  ctx.restore();

  if (componentState.wiring && componentState.wiring.length > 0) {
      if (componentState.wiring.some(c => Array.isArray(c) && c.length > 0)) {
           drawWiringNumbers();
      }
  }
  drawMarqueeBox();
}
