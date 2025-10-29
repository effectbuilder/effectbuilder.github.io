// --- IMPORT ---
import { initializeTooltips, showToast, setupThemeSwitcher } from './util.js';
import { auth, db, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, doc, setDoc, addDoc, collection, serverTimestamp, updateDoc, query, where, getDocs, orderBy } from './firebase.js';
import { setupCanvas, drawCanvas, zoomAtPoint, resetView, toggleGrid } from './canvas.js';

// --- GLOBAL SHARED STATE ---
let componentState = createDefaultComponentState(); // Initialize immediately
let viewTransform = { panX: 0, panY: 0, zoom: 1 };
let selectedLedIds = new Set();
let currentTool = 'select';
let currentComponentId = null;
const GRID_SIZE = 10;

// --- APP-LEVEL STATE ---
const AUTOSAVE_KEY = 'srgbComponentCreator_autoSave';

// --- DOM Elements ---
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userSessionGroup = document.getElementById('user-session-group');
const userDisplay = document.getElementById('user-display');
const userPhoto = document.getElementById('user-photo');
const newBtn = document.getElementById('new-component-btn');
const saveBtn = document.getElementById('save-component-btn');
const loadBtn = document.getElementById('load-component-btn');
const shareBtn = document.getElementById('share-component-btn');
const exportBtn = document.getElementById('export-component-btn');
const compNameInput = document.getElementById('component-name');
const compTypeInput = document.getElementById('component-type');
const rightPanelTop = document.getElementById('right-panel-top');
const canvas = document.getElementById('componentCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let addMatrixModal = null;
const addMatrixBtn = document.getElementById('add-matrix-btn');
const confirmAddMatrixBtn = document.getElementById('confirm-add-matrix-btn');
const matrixColsInput = document.getElementById('matrix-cols');
const matrixRowsInput = document.getElementById('matrix-rows');
const galleryOffcanvasElement = document.getElementById('gallery-offcanvas');
const galleryComponentList = document.getElementById('user-component-list');
let galleryOffcanvas = null;
const compImageInput = document.getElementById('component-image');
const imagePreview = document.getElementById('image-preview');

// ---
// --- ALL FUNCTION DEFINITIONS ---
// ---

// --- Local Storage Functions ---
function autoSaveState() {
  console.log('Attempting to autosave state...');
  if (componentState && Array.isArray(componentState.leds) && Array.isArray(componentState.wiring)) {
    try {
      const stateString = JSON.stringify(componentState);
      localStorage.setItem(AUTOSAVE_KEY, stateString);
      console.log('Autosave successful. Saved LEDs:', componentState.leds.length, 'Circuits:', componentState.wiring.length);
    } catch (e) {
      console.error('Error stringifying componentState for autosave:', e);
    }
  } else {
      console.warn('Skipping autosave, componentState seems invalid:', componentState);
  }
}
function clearAutoSave() {
  console.log('Clearing autosave data.');
  localStorage.removeItem(AUTOSAVE_KEY);
}

// --- Auth & Project Management ---
async function handleLogin() {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Error during sign-in:", error);
    showToast('Login Error', error.message, 'danger');
  }
}

async function handleLogout() {
  try {
    await signOut(auth);
    showToast('Logged Out', 'You have been signed out.', 'info');
  } catch (error) {
    console.error("Error during sign-out:", error);
    showToast('Logout Error', error.message, 'danger');
  }
}

function setupAuthListeners() {
  loginBtn.addEventListener('click', handleLogin);
  logoutBtn.addEventListener('click', handleLogout);

  onAuthStateChanged(auth, (user) => {
    const isLoggedIn = !!user;
    const defaultIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0iYmkgYmktcGVyc29uLWNpcmNsZSIgdmlld0JveD0iMCAwIDE2IDE2Ij4KICA8cGF0aCBkPSJNMTFhMyAzIDAgMTEtNiAwIDMgMyAwIDAxNiAweiIvPgogIDxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgZD0iTTAgOGE4IDggMCAxMDE2IDBBOCA4IDAgMDAwIDh6bTgtN2E3IDcgMCAwMTcgNzdhNyA3IDAgMDEtNyA3QTcgNyAwIDAxMSA4YTcgNyAwIDAxNy03eiIvPjwvIHN2Zz4=';
    if (isLoggedIn) {
      if(userDisplay) userDisplay.textContent = user.displayName || user.email;
      if(userPhoto) userPhoto.src = user.photoURL || defaultIcon;
      if(userSessionGroup) userSessionGroup.classList.remove('d-none');
      if(loginBtn) loginBtn.classList.add('d-none');
      if(saveBtn) saveBtn.disabled = false;
      if(loadBtn) loadBtn.disabled = false;
      const userDocRef = doc(db, "users", user.uid);
      setDoc(userDocRef, {
          displayName: user.displayName || 'Anonymous User',
          photoURL: user.photoURL || null
      }, { merge: true }).catch(err => {
          console.error("Failed to save user profile to Firestore:", err);
      });
    } else {
      if(userSessionGroup) userSessionGroup.classList.add('d-none');
      if(loginBtn) loginBtn.classList.remove('d-none');
      if(saveBtn) saveBtn.disabled = true;
      if(loadBtn) loadBtn.disabled = true;
      if(shareBtn) shareBtn.disabled = true;
    }
  });
}
function setupProjectListeners() {
  newBtn.addEventListener('click', () => handleNewComponent(true));
  saveBtn.addEventListener('click', handleSaveComponent);
  exportBtn.addEventListener('click', handleExport);
}

function createDefaultComponentState() {
  return {
    name: "My Custom Component",
    type: "Strip",
    leds: [],
    wiring: [], // Will be an array of arrays: string[][]
    imageUrl: null,
    imageWidth: 500,
    imageHeight: 300,
  };
}

function handleNewComponent(showNotification = true) {
  let loadedSuccessfully = false;
  let stateToLoad = createDefaultComponentState();
  console.log('handleNewComponent called. showNotification:', showNotification);

  if (!showNotification) {
    const savedState = localStorage.getItem(AUTOSAVE_KEY);
    console.log('Checking localStorage...');
    if (savedState) {
      console.log('Found saved state:', savedState);
      try {
        const parsedState = JSON.parse(savedState);
        console.log('Parsed state:', parsedState);
        if (parsedState && typeof parsedState === 'object' && Array.isArray(parsedState.leds)) {
           stateToLoad = parsedState;
           // --- CONVERT OLD WIRING FORMAT TO NEW ---
           if (Array.isArray(stateToLoad.wiring) && stateToLoad.wiring.length > 0 && !Array.isArray(stateToLoad.wiring[0])) {
               console.warn("handleNewComponent: Converting loaded wiring from [] to [[]].");
               // Filter out any bad IDs that might be in the old array
               const validOldWiring = stateToLoad.wiring.filter(id => id != null && stateToLoad.leds.some(led => led && led.id === id));
               stateToLoad.wiring = validOldWiring.length > 0 ? [validOldWiring] : [];
           } else if (!Array.isArray(stateToLoad.wiring)) {
               console.warn("handleNewComponent: Loaded wiring was invalid, resetting.");
               stateToLoad.wiring = []; // Ensure it's at least an empty array
           }
           // --- END CONVERSION ---
          loadedSuccessfully = true;
          console.log('Autosave loaded successfully.');
          showToast('Welcome Back!', 'Your unsaved work has been restored.', 'info');
        } else {
           console.warn("Autosave data was invalid, creating new project."); clearAutoSave();
        }
      } catch (e) { console.error("Failed to parse autosave data:", e); clearAutoSave(); }
    } else { console.log('No autosave data found in localStorage.'); }
  }

  if (showNotification || !loadedSuccessfully) {
    if (showNotification) {
        console.log('Clearing autosave because showNotification is true.'); clearAutoSave();
        if(loadedSuccessfully) stateToLoad = createDefaultComponentState();
        showToast('New Project', 'Cleared the canvas and properties.', 'info');
    } else { console.log('Proceeding with default state.'); }
     if (!loadedSuccessfully) stateToLoad = createDefaultComponentState();
  }

  Object.assign(componentState, stateToLoad); // Update the existing global state object
  // Final safety check
  if (!Array.isArray(componentState.wiring)) {
      console.error("handleNewComponent: wiring still invalid! Forcing empty array.");
      componentState.wiring = [];
  }

  console.log('Final componentState:', JSON.parse(JSON.stringify(componentState)));
  currentComponentId = componentState.dbId || null;
  updateUIFromState();
  if (canvas) { viewTransform.panX = (canvas.width / 2); viewTransform.panY = (canvas.height / 2); }
  viewTransform.zoom = 5;
  selectedLedIds.clear();
  requestAnimationFrame(drawCanvas);
}


async function handleSaveComponent() {
  const user = auth.currentUser;
  if (!user) { showToast('Error', 'You must be logged in to save.', 'danger'); return; }
  showToast('Saving...', 'Saving component to the cloud.', 'info');
  componentState.name = compNameInput.value;
  componentState.type = compTypeInput.value;

  // Ensure wiring is saved in the correct array-of-arrays format
  let wiringToSave = componentState.wiring;
  if (!Array.isArray(wiringToSave)) {
      wiringToSave = []; // Ensure it's an array
  }
  // Filter out any potential non-array circuits (shouldn't happen, but good check)
  wiringToSave = wiringToSave.filter(circuit => Array.isArray(circuit));

  const dataToSave = {
    ...componentState,
    wiring: wiringToSave, // Save the [][] format
    ownerId: user.uid,
    ownerName: user.displayName,
    lastUpdated: serverTimestamp()
  };
  delete dataToSave.dbId;

  try {
    let docRef;
    const componentsCollection = collection(db, 'srgb-components');
    if (currentComponentId) {
      docRef = doc(componentsCollection, currentComponentId);
      dataToSave.createdAt = componentState.createdAt || serverTimestamp();
      await updateDoc(docRef, dataToSave);
    } else {
      dataToSave.createdAt = serverTimestamp();
      docRef = await addDoc(componentsCollection, dataToSave);
      currentComponentId = docRef.id; componentState.dbId = currentComponentId;
    }
    componentState.createdAt = dataToSave.createdAt;
    showToast('Save Successful', `Saved component: ${componentState.name}`, 'success');
    document.getElementById('share-component-btn').disabled = false;
    clearAutoSave();
  } catch (error) { console.error("Error saving component: ", error); showToast('Error Saving', error.message, 'danger'); }
}

function handleExport() {
  console.log("handleExport triggered.");
  const exportModalElement = document.getElementById('export-component-modal');
  if (!exportModalElement) { console.error("Export modal element not found!"); showToast('Export Error', 'Modal element is missing.', 'danger'); return; }
  const exportModal = bootstrap.Modal.getInstance(exportModalElement) || new bootstrap.Modal(exportModalElement);

  if (!componentState || !Array.isArray(componentState.leds)) { showToast('Export Error', 'No component data.', 'danger'); return; }

  try {
    const currentName = compNameInput.value || 'My Custom Component';
    const currentType = compTypeInput.value || 'Other';
    const currentLeds = componentState.leds || [];
    const currentWiring = componentState.wiring || []; // This is string[][]
    const imageDataUrl = componentState.imageUrl || null;
    const ledCount = currentLeds.length;
    console.log(`Exporting: ${currentName}, Type: ${currentType}, LEDs: ${ledCount}`);

    if (ledCount === 0) { showToast('Export Error', 'Cannot export empty component.', 'warning'); return; }

    let minX = Infinity, minY = Infinity;
    currentLeds.forEach(led => { if (led) { minX = Math.min(minX, led.x); minY = Math.min(minY, led.y); }});
    minX = (minX === Infinity) ? 0 : minX; minY = (minY === Infinity) ? 0 : minY;
    console.log(`Calculated offset: minX=${minX}, minY=${minY}`);

    const ledDataMap = new Map();
    let maxX = 0, maxY = 0;
    currentLeds.forEach(led => {
        if (led) {
            const offsetX = Math.round((led.x - minX) / GRID_SIZE);
            const offsetY = Math.round((led.y - minY) / GRID_SIZE);
            ledDataMap.set(led.id, { id: led.id, x: offsetX, y: offsetY });
            maxX = Math.max(maxX, offsetX); maxY = Math.max(maxY, offsetY);
        }
    });
    console.log(`Created ledDataMap. Max offset coords: maxX=${maxX}, maxY=${maxY}`);

    const ledMapping = Array.from({ length: ledCount }, (_, i) => i);
    let ledCoordinates = [];
    const exportedLedIds = new Set();

    // --- UPDATED: Flatten the [][] wiring array for export ---
    if (Array.isArray(currentWiring)) {
      console.log("Using defined wiring order (flattening circuits) for coordinates.");
      // Flatten all circuits into one list
      const flatWiring = currentWiring.flat().filter(id => id != null);
      
      flatWiring.forEach(ledId => {
          const ledData = ledDataMap.get(ledId);
          if (ledData && !exportedLedIds.has(ledId)) { // Check for duplicates
              ledCoordinates.push([ledData.x, ledData.y]);
              exportedLedIds.add(ledId);
          } else if (!ledData) { console.warn(`Wiring Error: LED ID ${ledId} not found.`); }
      });
    } else {
      console.warn("Wiring data is invalid. Exporting unwired.");
    }

    // Add any unwired LEDs
    currentLeds.forEach(led => {
        if (led && !exportedLedIds.has(led.id)) {
            const ledData = ledDataMap.get(led.id);
            if (ledData) {
                console.warn(`Export: Appending unwired LED ID ${led.id} to coordinates.`);
                ledCoordinates.push([ledData.x, ledData.y]);
                exportedLedIds.add(led.id);
            }
        }
    });

    // Pad/Truncate
    if (ledCoordinates.length < ledCount) {
        console.error(`Coordinate count (${ledCoordinates.length}) mismatches LED count (${ledCount}). Padding.`);
        while(ledCoordinates.length < ledCount) { ledCoordinates.push([0,0]); }
    }
    if (ledCoordinates.length > ledCount) {
        console.error(`Coordinate count (${ledCoordinates.length}) exceeds LED count (${ledCount}). Truncating.`);
        ledCoordinates = ledCoordinates.slice(0, ledCount);
    }
    console.log("Generated LedCoordinates:", ledCoordinates.length);

    const ledNames = Array.from({ length: ledCount }, (_, i) => `Led${i + 1}`);
    const width = maxX + 1; const height = maxY + 1;
    console.log(`Calculated Width=${width}, Height=${height}`);

    let base64ImageData = "";
    if (imageDataUrl && imageDataUrl.startsWith('data:image')) {
        const commaIndex = imageDataUrl.indexOf(',');
        if (commaIndex !== -1) { base64ImageData = imageDataUrl.substring(commaIndex + 1); }
    }

    const exportObject = {
      ProductName: currentName, DisplayName: currentName, Brand: "Custom", Type: currentType, LedCount: ledCount,
      Width: width, Height: height, LedMapping: ledMapping, LedCoordinates: ledCoordinates, LedNames: ledNames,
      Image: base64ImageData, ImageUrl: ""
    };

    const jsonString = JSON.stringify(exportObject, null, 2);
    const preview = document.getElementById('json-preview');
    if (preview) { preview.textContent = jsonString; console.log("Updated json-preview."); }
    else { console.error("json-preview element NOT FOUND!"); }

    const downloadBtn = document.getElementById('confirm-export-json-btn');
    if (!downloadBtn) { console.error("confirm-export-json-btn element not found!"); exportModal.show(); return; }

    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const filename = (currentName || 'component').replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.json';
    const newDownloadBtn = downloadBtn.cloneNode(true);
    downloadBtn.parentNode.replaceChild(newDownloadBtn, downloadBtn);

    newDownloadBtn.onclick = () => {
      console.log("Download button clicked.");
      try {
          const a = document.createElement('a'); a.href = url; a.download = filename;
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
          URL.revokeObjectURL(url);
          console.log("Download triggered for:", filename);
          exportModal.hide();
      } catch(downloadError) { console.error("Error triggering download:", downloadError); showToast('Download Error', 'Could not trigger file download.', 'danger'); }
    };
    console.log("Download button event listener attached.");
    exportModal.show();
  } catch (error) {
    console.error("Error during handleExport:", error);
    showToast('Export Error', `An unexpected error occurred: ${error.message}`, 'danger');
    const preview = document.getElementById('json-preview');
    if(preview) preview.textContent = `Error: ${error.message}`;
    exportModal.show();
  }
}

// --- UI & Tool Listeners ---
function setupPropertyListeners() {
  compNameInput.addEventListener('input', (e) => {
    console.log('Property Listener: Name changed');
    if (componentState) { componentState.name = e.target.value; autoSaveState(); }
    else { console.warn('setupPropertyListeners: componentState not ready.'); }
  });
  compTypeInput.addEventListener('input', (e) => {
    console.log('Property Listener: Type changed');
     if (componentState) { componentState.type = e.target.value; autoSaveState(); }
     else { console.warn('setupPropertyListeners: componentState not ready.'); }
  });

  if(compImageInput && imagePreview) {
      compImageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && componentState) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const img = new Image();
                img.onload = () => {
                    componentState.imageUrl = event.target.result; componentState.imageWidth = img.naturalWidth; componentState.imageHeight = img.naturalHeight;
                    console.log('Device image loaded:', componentState.imageWidth, 'x', componentState.imageHeight);
                    imagePreview.src = event.target.result; imagePreview.style.display = 'block';
                    autoSaveState();
                };
                img.onerror = () => {
                    showToast('Image Error', 'Could not load image file.', 'danger');
                    componentState.imageUrl = null; componentState.imageWidth = 500; componentState.imageHeight = 300;
                    imagePreview.src = '#'; imagePreview.style.display = 'none';
                    autoSaveState();
                };
                img.src = event.target.result;
            }
            reader.onerror = () => {
                 showToast('File Read Error', 'Could not read file.', 'danger');
                 compImageInput.value = ''; imagePreview.src = '#'; imagePreview.style.display = 'none';
            };
            reader.readAsDataURL(file);
        } else if (componentState) {
            componentState.imageUrl = null; componentState.imageWidth = 500; componentState.imageHeight = 300;
            imagePreview.src = '#'; imagePreview.style.display = 'none';
            autoSaveState();
        }
      });
  } else { console.warn("Image input or preview element not found."); }


  addMatrixModal = new bootstrap.Modal(document.getElementById('add-matrix-modal'));
  if (addMatrixBtn && confirmAddMatrixBtn) {
      addMatrixBtn.addEventListener('click', () => { addMatrixModal.show(); });
      confirmAddMatrixBtn.addEventListener('click', handleAddMatrix);
  } else { console.warn("Add matrix modal buttons not found."); }
}

function setupToolbarListeners() {
  document.getElementById('tool-select-btn').addEventListener('click', () => setTool('select'));
  document.getElementById('tool-place-led-btn').addEventListener('click', () => setTool('place-led'));
  document.getElementById('tool-wiring-btn').addEventListener('click', () => setTool('wiring'));
  document.getElementById('zoom-in-btn').addEventListener('click', () => zoomAtPoint(canvas.width / 2, canvas.height / 2, 1.2));
  document.getElementById('zoom-out-btn').addEventListener('click', () => zoomAtPoint(canvas.width / 2, canvas.height / 2, 1 / 1.2));
  document.getElementById('zoom-reset-btn').addEventListener('click', resetView);
  document.getElementById('toggle-grid-btn').addEventListener('click', () => { toggleGrid(); });
}

function setTool(toolName) {
  if (toolName === 'wiring' && currentTool === 'wiring') {
      const confirmClear = confirm("Are you sure you want to clear all wiring paths?");
      if (confirmClear) {
          console.log('SetTool: Clearing wiring (confirmed)');
          if (componentState) componentState.wiring = []; // Reset to empty array of arrays
          drawCanvas(); autoSaveState();
      } else { console.log('SetTool: Clear wiring cancelled.'); }
      return;
  }
  currentTool = toolName;
  document.querySelectorAll('#toolbar .btn-group[role="group"] .btn').forEach(btn => btn.classList.remove('active'));
  const toolBtn = document.getElementById(`tool-${toolName}-btn`);
  if (toolBtn) toolBtn.classList.add('active');
  if (toolName !== 'select') selectedLedIds.clear();
  setAppCursor();
  drawCanvas();
}
window.setAppTool = setTool;

function setAppCursor() {
  if (!canvas) return;
  if (currentTool === 'wiring') { canvas.style.cursor = 'crosshair'; }
  else if (currentTool === 'place-led') { canvas.style.cursor = 'crosshair'; }
  else { canvas.style.cursor = 'default'; }
}
window.setAppCursor = setAppCursor;

function setupKeyboardListeners() {
  window.addEventListener('keydown', (e) => {
    if (!componentState || !Array.isArray(componentState.leds) || !Array.isArray(componentState.wiring)) return;
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedLedIds.size > 0) {
        console.log('Keyboard Listener: Delete triggered'); e.preventDefault();
        componentState.leds = componentState.leds.filter(led => led && !selectedLedIds.has(led.id));
        
        // --- UPDATED: Remove deleted LEDs from all wiring circuits ---
        const newWiring = [];
        componentState.wiring.forEach((circuit, index) => {
          if (Array.isArray(circuit)) { // Check if it's an array
            const filteredCircuit = circuit.filter(id => id != null && !selectedLedIds.has(id));
            if (filteredCircuit.length > 0) {
              newWiring.push(filteredCircuit);
            }
          } else { console.warn(`Keyboard Delete: Invalid circuit format at index ${index}`); }
        });
        componentState.wiring = newWiring;
        // --- END UPDATED ---

        selectedLedIds.clear(); drawCanvas(); autoSaveState();
      }
    }
  });
}

// --- Shape Generators ---
function checkOverlap(potentialPositions) {
  const existingLedPositions = new Set((componentState.leds || []).map(led => `${led.x},${led.y}`));
  for (const pos of potentialPositions) { if (existingLedPositions.has(`${pos.x},${pos.y}`)) return true; }
  return false;
}

function handleAddMatrix() {
  const cols = parseInt(document.getElementById('matrix-cols').value) || 1;
  const rows = parseInt(document.getElementById('matrix-rows').value) || 1;
  const wiringDirection = document.getElementById('matrix-wiring').value;
  // GRID_SIZE is globally defined

  if (cols <= 0 || rows <= 0) { showToast('Invalid Input', 'Columns and Rows must be > 0.', 'danger'); return; }
  if (!canvas || !viewTransform) { showToast('Error', 'Canvas not ready.', 'danger'); return; }

  const viewCenter = { x: (canvas.width / 2 - viewTransform.panX) / viewTransform.zoom, y: (canvas.height / 2 - viewTransform.panY) / viewTransform.zoom };
  const matrixWidth = (cols - 1) * GRID_SIZE; const matrixHeight = (rows - 1) * GRID_SIZE;
  let startX = Math.round((viewCenter.x - matrixWidth / 2) / GRID_SIZE) * GRID_SIZE;
  let startY = Math.round((viewCenter.y - matrixHeight / 2) / GRID_SIZE) * GRID_SIZE;

  let potentialPositions = [];
  let foundSpot = false;
  const maxSearchRadius = 50;

  for (let r = 0; r < rows; r++) { for (let c = 0; c < cols; c++) { potentialPositions.push({ x: startX + c * GRID_SIZE, y: startY + r * GRID_SIZE }); } }

  if (!checkOverlap(potentialPositions)) { foundSpot = true; }
  else {
      console.log("Center spot overlaps, searching...");
      searchLoop:
      for (let radius = 1; radius <= maxSearchRadius; radius++) {
          for (let side = 0; side < 4; side++) {
              for (let step = 0; step < radius * 2; step++) {
                  let dx = 0, dy = 0;
                  switch (side) {
                      case 0: dx = radius; dy = -radius + step; break; case 1: dx = radius - step; dy = radius; break;
                      case 2: dx = -radius; dy = radius - step; break; case 3: dx = -radius + step; dy = -radius; break;
                  }
                  if ((side === 0 && step === radius * 2 -1) || (side === 1 && step === radius * 2 -1) || (side === 2 && step === radius * 2 -1)) { continue; }
                  let currentStartX = Math.round((viewCenter.x - matrixWidth / 2) / GRID_SIZE) * GRID_SIZE + dx * GRID_SIZE;
                  let currentStartY = Math.round((viewCenter.y - matrixHeight / 2) / GRID_SIZE) * GRID_SIZE + dy * GRID_SIZE;
                  potentialPositions = [];
                  for (let r = 0; r < rows; r++) { for (let c = 0; c < cols; c++) { potentialPositions.push({ x: currentStartX + c * GRID_SIZE, y: currentStartY + r * GRID_SIZE }); } }
                  if (!checkOverlap(potentialPositions)) { startX = currentStartX; startY = currentStartY; foundSpot = true; console.log(`Found spot at offset dx=${dx}, dy=${dy}`); break searchLoop; }
              }
          }
      }
  }

  if (!foundSpot) { showToast('No Empty Space', `Could not find an empty ${cols}x${rows} space.`, 'warning'); return; }

  const newLeds = [];
  const newWireIds = []; // IDs for this matrix, will become a new circuit
  const finalMatrixWidth = (cols - 1) * GRID_SIZE; const finalMatrixHeight = (rows - 1) * GRID_SIZE;

  if (wiringDirection === 'horizontal') {
    for (let r = 0; r < rows; r++) {
      const isEvenRow = r % 2 === 0;
      for (let c = 0; c < cols; c++) {
        const colIndex = isEvenRow ? c : (cols - 1 - c); const x = startX + (colIndex * GRID_SIZE); const y = startY + (r * GRID_SIZE);
        const id = `${Date.now()}-h-${r}-${c}`; const newLed = { id, x, y }; newLeds.push(newLed); newWireIds.push(id);
      }
    }
  } else {
     for (let c = 0; c < cols; c++) {
      const isEvenCol = c % 2 === 0;
      for (let r = 0; r < rows; r++) {
        const rowIndex = isEvenCol ? r : (rows - 1 - r); const x = startX + (c * GRID_SIZE); const y = startY + (rowIndex * GRID_SIZE);
        const id = `${Date.now()}-v-${c}-${r}`; const newLed = { id, x, y }; newLeds.push(newLed); newWireIds.push(id);
      }
    }
  }

  // --- Ensure arrays are valid and ADD NEW CIRCUIT ---
  if (!Array.isArray(componentState.leds)) componentState.leds = [];
  if (!Array.isArray(componentState.wiring)) componentState.wiring = []; // Ensure outer array exists
  
  componentState.leds.push(...newLeds);
  componentState.wiring.push(newWireIds); // Push the matrix as a new inner array
  // --- END ADD NEW CIRCUIT ---

  const matrixCenterX = startX + finalMatrixWidth / 2; const matrixCenterY = startY + finalMatrixHeight / 2;
  viewTransform.panX = canvas.width / 2 - (matrixCenterX * viewTransform.zoom);
  viewTransform.panY = canvas.height / 2 - (matrixCenterY * viewTransform.zoom);
  selectedLedIds.clear(); newLeds.forEach(led => selectedLedIds.add(led.id));
  setTool('select');
  addMatrixModal.hide(); drawCanvas(); autoSaveState();
}

// --- Rendering ---
function updateUIFromState() {
  if(compNameInput) compNameInput.value = componentState?.name || '';
  if(compTypeInput) compTypeInput.value = componentState?.type || 'Strip';
  if (componentState?.imageUrl && imagePreview) {
      imagePreview.src = componentState.imageUrl; imagePreview.style.display = 'block';
  } else if (imagePreview) {
      imagePreview.src = '#'; imagePreview.style.display = 'none';
      if (compImageInput) compImageInput.value = '';
  }
}

// --- Gallery Functions ---
async function loadUserComponents() {
  const user = auth.currentUser;
  if (!galleryComponentList) { console.error("Gallery list element not found."); return; }
  galleryComponentList.innerHTML = '';
  if (!user) { galleryComponentList.innerHTML = '<li class="list-group-item">Please sign in...</li>'; return; }
  galleryComponentList.innerHTML = '<li class="list-group-item">Loading...</li>';

  try {
    const q = query(collection(db, 'srgb-components'), where('ownerId', '==', user.uid), orderBy('lastUpdated', 'desc'));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) { galleryComponentList.innerHTML = '<li class="list-group-item">No saved components.</li>'; return; }

    galleryComponentList.innerHTML = '';
    querySnapshot.forEach((docSnap) => {
      const componentData = docSnap.data();
      const listItem = document.createElement('button');
      listItem.type = 'button'; listItem.classList.add('list-group-item', 'list-group-item-action', 'd-flex', 'justify-content-between', 'align-items-center');
      const nameSpan = document.createElement('span'); nameSpan.textContent = componentData.name || 'Untitled';
      const dateSpan = document.createElement('small'); dateSpan.classList.add('text-muted');
      dateSpan.textContent = componentData.lastUpdated?.toDate()?.toLocaleDateString() ?? 'Unknown date';
      listItem.appendChild(nameSpan); listItem.appendChild(dateSpan);
      listItem.addEventListener('click', () => {
        clearAutoSave();
        Object.assign(componentState, componentData); // Load data
        
        // --- FORCE WIRING FORMAT CHECK ON LOAD ---
        componentState.leds = componentState.leds || []; // Ensure leds array exists
        if (Array.isArray(componentState.wiring) && componentState.wiring.length > 0 && !Array.isArray(componentState.wiring[0])) {
            console.warn("loadUserComponents: Converting loaded wiring from [] to [[]].");
            // Filter invalid IDs
            const validOldWiring = componentState.wiring.filter(id => id != null && componentState.leds.some(led => led && led.id === id));
            componentState.wiring = validOldWiring.length > 0 ? [validOldWiring] : [];
        } else if (!Array.isArray(componentState.wiring)) {
            console.warn("loadUserComponents: Loaded wiring invalid, resetting."); componentState.wiring = [];
        }
        // --- END FORCE ---

        currentComponentId = docSnap.id; componentState.dbId = docSnap.id;
        updateUIFromState(); selectedLedIds.clear();
        resetView(); drawCanvas();
        if(galleryOffcanvas) galleryOffcanvas.hide();
        showToast('Component Loaded', `Loaded "${componentData.name || 'Untitled'}".`, 'success');
      });
      galleryComponentList.appendChild(listItem);
    });
  } catch (error) {
    console.error("Error loading user components:", error);
    galleryComponentList.innerHTML = '<li class="list-group-item text-danger">Error loading components.</li>';
    showToast('Load Error', 'Could not fetch components.', 'danger');
  }
}

function setupGalleryListener() {
    if(galleryOffcanvasElement) {
        galleryOffcanvas = new bootstrap.Offcanvas(galleryOffcanvasElement);
        galleryOffcanvasElement.addEventListener('show.bs.offcanvas', loadUserComponents);
    } else { console.error("Gallery offcanvas element (#gallery-offcanvas) not found."); }
}


// ---
// --- INITIALIZATION ---
// ---
document.addEventListener('DOMContentLoaded', () => {
  initializeTooltips();
  setupThemeSwitcher();

  if (!ctx) {
      console.error("Failed to get 2D context for canvas. Aborting initialization.");
      return;
  }

  const appState = {
    canvas: canvas, ctx: ctx, componentState: componentState, viewTransform: viewTransform,
    selectedLedIds: selectedLedIds, rightPanelTop: rightPanelTop, autoSave: autoSaveState,
    getCurrentTool: () => currentTool,
  };
  setupCanvas(appState); // Initialize canvas engine FIRST

  // Setup all other app listeners
  setupAuthListeners();
  setupProjectListeners();
  setupToolbarListeners();
  setupKeyboardListeners();
  setupPropertyListeners();
  setupGalleryListener();

  // Load initial component (tries autosave first)
  handleNewComponent(false);
});

