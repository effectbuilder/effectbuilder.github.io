// --- IMPORT ---
import { initializeTooltips, showToast, setupThemeSwitcher } from './util.js';
import { auth, db, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, doc, setDoc, addDoc, collection, serverTimestamp, updateDoc, query, where, getDocs, orderBy } from './firebase.js';
import { setupCanvas, drawCanvas, zoomAtPoint, resetView, toggleGrid, clearPendingConnection, updateLedCount } from './canvas.js';

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
const compDisplayNameInput = document.getElementById('component-display-name');
const compBrandInput = document.getElementById('component-brand');
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

let addStripModal = null;
const addStripBtn = document.getElementById('add-strip-btn');
const confirmAddStripBtn = document.getElementById('confirm-add-strip-btn');

let addCircleModal = null;
const addCircleBtn = document.getElementById('add-circle-btn');
const confirmAddCircleBtn = document.getElementById('confirm-add-circle-btn');

let addLShapeModal = null;
const addLShapeBtn = document.getElementById('add-l-shape-btn');
const confirmAddLShapeBtn = document.getElementById('confirm-add-l-shape-btn');

let addUShapeModal = null;
const addUShapeBtn = document.getElementById('add-u-shape-btn');
const confirmAddUShapeBtn = document.getElementById('confirm-add-u-shape-btn');

let addLiLiModal = null;
const addLiLiBtn = document.getElementById('add-lili-btn');
const confirmAddLiLiBtn = document.getElementById('confirm-add-lili-btn');

let addHexagonModal = null;
const addHexagonBtn = document.getElementById('add-hexagon-btn');
const confirmAddHexagonBtn = document.getElementById('confirm-add-hexagon-btn');

let addTriangleModal = null;
const addTriangleBtn = document.getElementById('add-triangle-empty-btn');
const confirmAddTriangleBtn = document.getElementById('confirm-add-triangle-empty-btn');

const rotateSelectedBtn = document.getElementById('rotate-selected-btn');

const scaleSelectedBtn = document.getElementById('scale-selected-btn');
const confirmScaleBtn = document.getElementById('confirm-scale-btn');
const scaleFactorInput = document.getElementById('scale-factor-input');
let scaleModal = null;

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
            if (userDisplay) userDisplay.textContent = user.displayName || user.email;
            if (userPhoto) userPhoto.src = user.photoURL || defaultIcon;
            if (userSessionGroup) userSessionGroup.classList.remove('d-none');
            if (loginBtn) loginBtn.classList.add('d-none');
            if (saveBtn) saveBtn.disabled = false;
            if (loadBtn) loadBtn.disabled = false;
            const userDocRef = doc(db, "users", user.uid);
            setDoc(userDocRef, {
                displayName: user.displayName || 'Anonymous User',
                photoURL: user.photoURL || null
            }, { merge: true }).catch(err => {
                console.error("Failed to save user profile to Firestore:", err);
            });
        } else {
            if (userSessionGroup) userSessionGroup.classList.add('d-none');
            if (loginBtn) loginBtn.classList.remove('d-none');
            if (saveBtn) saveBtn.disabled = true;
            if (loadBtn) loadBtn.disabled = true;
            if (shareBtn) shareBtn.disabled = true;
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
        displayName: "My Custom Component",
        brand: "Custom",
        type: "Strip",
        leds: [],
        wiring: [],
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
            if (loadedSuccessfully) stateToLoad = createDefaultComponentState();
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
    componentState.displayName = compDisplayNameInput.value; // ADDED
    componentState.brand = compBrandInput.value; // ADDED
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

// --- MODIFIED FUNCTION: handleExport (Ensures Wired Order in JSON) ---
function handleExport() {
    console.log("handleExport triggered.");
    const exportModalElement = document.getElementById('export-component-modal');
    if (!exportModalElement) { showToast('Export Error', 'Modal element is missing.', 'danger'); return; }
    const exportModal = bootstrap.Modal.getInstance(exportModalElement) || new bootstrap.Modal(exportModalElement);

    if (!componentState || !Array.isArray(componentState.leds)) { showToast('Export Error', 'No component data.', 'danger'); return; }

    try {
        const productName = compNameInput.value || 'My Custom Component';
        const displayName = compDisplayNameInput.value || productName;
        const brand = compBrandInput.value || 'Custom';
        const currentType = compTypeInput.value || 'Other';
        const currentLeds = componentState.leds || [];
        const currentWiring = componentState.wiring || []; // This is string[][]
        const imageDataUrl = componentState.imageUrl || null;
        const ledCount = currentLeds.length;
        console.log(`Exporting: ${productName}, Display: ${displayName}, Brand: ${brand}, Type: ${currentType}, LEDs: ${ledCount}`);

        if (ledCount === 0) { showToast('Export Error', 'Cannot export empty component.', 'warning'); return; }

        let minX = Infinity, minY = Infinity;
        currentLeds.forEach(led => { if (led) { minX = Math.min(minX, led.x); minY = Math.min(minY, led.y); } });
        minX = (minX === Infinity) ? 0 : minX; minY = (minY === Infinity) ? 0 : minY;
        console.log(`Calculated offset: minX=${minX}, minY=${minY}`);

        // --- 1. Create a map for quick access to LED data (including offset coords) ---
        const ledDataMap = new Map();
        let maxX = 0, maxY = 0;
        currentLeds.forEach(led => {
            if (led) {
                // Calculate export coordinates (offset and converted to grid units)
                const offsetX = Math.round((led.x - minX) / GRID_SIZE);
                const offsetY = Math.round((led.y - minY) / GRID_SIZE);
                
                ledDataMap.set(led.id, { id: led.id, x: offsetX, y: offsetY });
                maxX = Math.max(maxX, offsetX); 
                maxY = Math.max(maxY, offsetY);
            }
        });
        console.log(`Created ledDataMap. Max offset coords: maxX=${maxX}, maxY=${maxY}`);

        let ledCoordinates = [];
        const exportedLedIds = new Set();
        
        // --- 2. Build LedCoordinates array based strictly on wiring order ---
        if (Array.isArray(currentWiring)) {
            console.log("Using defined wiring order (flattening circuits) for coordinates.");
            
            // Flatten all circuits into one list of IDs (maintaining order)
            const flatWiring = currentWiring.flat().filter(id => id != null);

            flatWiring.forEach(ledId => {
                const ledData = ledDataMap.get(ledId);
                // ONLY add if the LED exists and has not been added yet (handles multi-circuit overlaps, though less common now)
                if (ledData && !exportedLedIds.has(ledId)) { 
                    // Push the [x, y] coordinate pair
                    ledCoordinates.push([ledData.x, ledData.y]);
                    exportedLedIds.add(ledId);
                } else if (!ledData) { 
                    console.warn(`Wiring Error: LED ID ${ledId} not found in LED list.`); 
                }
            });
        } else {
            console.warn("Wiring data is invalid. Exporting unwired.");
        }

        // --- 3. Append any UNWIRED LEDs (order of unwired doesn't strictly matter) ---
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

        // --- 4. Final Sanity Check ---
        if (ledCoordinates.length !== ledCount) {
             console.error(`Coordinate count (${ledCoordinates.length}) mismatches LED count (${ledCount}). Padding/Truncating.`);
            // Pad/Truncate for safety, though it shouldn't be needed with the new logic
            while (ledCoordinates.length < ledCount) { ledCoordinates.push([0, 0]); }
            if (ledCoordinates.length > ledCount) { ledCoordinates = ledCoordinates.slice(0, ledCount); }
        }
        console.log("Generated LedCoordinates:", ledCoordinates.length);

        const ledMapping = Array.from({ length: ledCount }, (_, i) => i);
        const width = maxX + 1; const height = maxY + 1;

        let base64ImageData = "";
        if (imageDataUrl && imageDataUrl.startsWith('data:image')) {
            const commaIndex = imageDataUrl.indexOf(',');
            if (commaIndex !== -1) { base64ImageData = imageDataUrl.substring(commaIndex + 1); }
        }

        const exportObject = {
            ProductName: productName, DisplayName: displayName, Brand: brand, Type: currentType, LedCount: ledCount,
            Width: width, Height: height, LedMapping: ledMapping, LedCoordinates: ledCoordinates, LedNames: Array.from({ length: ledCount }, (_, i) => `Led${i + 1}`),
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
        const filename = (productName || 'component').replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.json';
        const newDownloadBtn = downloadBtn.cloneNode(true);
        downloadBtn.parentNode.replaceChild(newDownloadBtn, downloadBtn);

        newDownloadBtn.onclick = () => {
            try {
                const a = document.createElement('a'); a.href = url; a.download = filename;
                document.body.appendChild(a); a.click(); document.body.removeChild(a);
                URL.revokeObjectURL(url);
                exportModal.hide();
            } catch (downloadError) { console.error("Error triggering download:", downloadError); showToast('Download Error', 'Could not trigger file download.', 'danger'); }
        };
        exportModal.show();
    } catch (error) {
        console.error("Error during handleExport:", error);
        showToast('Export Error', `An unexpected error occurred: ${error.message}`, 'danger');
        const preview = document.getElementById('json-preview');
        if (preview) preview.textContent = `Error: ${error.message}`;
        exportModal.show();
    }
}

// --- UI & Tool Listeners ---
function setupPropertyListeners() {
    compNameInput.addEventListener('input', (e) => {
        console.log('Property Listener: Product Name changed');
        if (componentState) {
            componentState.name = e.target.value;
            // Sync Display Name if it's currently empty or identical to the old product name
            if (!compDisplayNameInput.value || compDisplayNameInput.value === componentState.name) {
                compDisplayNameInput.value = e.target.value;
                componentState.displayName = e.target.value;
            }
            autoSaveState();
        }
        else { console.warn('setupPropertyListeners: componentState not ready.'); }
    });

    // ADDED Listener for Display Name
    compDisplayNameInput.addEventListener('input', (e) => {
        console.log('Property Listener: Display Name changed');
        if (componentState) { componentState.displayName = e.target.value; autoSaveState(); }
        else { console.warn('setupPropertyListeners: componentState not ready.'); }
    });

    // ADDED Listener for Brand
    compBrandInput.addEventListener('input', (e) => {
        console.log('Property Listener: Brand changed');
        if (componentState) { componentState.brand = e.target.value; autoSaveState(); }
        else { console.warn('setupPropertyListeners: componentState not ready.'); }
    });

    compTypeInput.addEventListener('input', (e) => {
        console.log('Property Listener: Type changed');
        if (componentState) { componentState.type = e.target.value; autoSaveState(); }
        else { console.warn('setupPropertyListeners: componentState not ready.'); }
    });

    if (compImageInput && imagePreview) {
        compImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file && componentState) {
                const reader = new FileReader();
                reader.onload = function (event) {
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


    // --- MODAL LISTENERS ---
    addMatrixModal = new bootstrap.Modal(document.getElementById('add-matrix-modal'));
    if (addMatrixBtn && confirmAddMatrixBtn) {
        addMatrixBtn.addEventListener('click', () => { addMatrixModal.show(); });
        confirmAddMatrixBtn.addEventListener('click', handleAddMatrix);
    } else { console.warn("Add matrix modal buttons not found."); }

    // --- ADDED FOR STRIP ---
    addStripModal = new bootstrap.Modal(document.getElementById('add-strip-modal'));
    if (addStripBtn && confirmAddStripBtn) {
        addStripBtn.addEventListener('click', () => { addStripModal.show(); });
        confirmAddStripBtn.addEventListener('click', handleAddStrip);
    } else { console.warn("Add strip modal buttons not found."); }

    // --- ADDED FOR CIRCLE ---
    addCircleModal = new bootstrap.Modal(document.getElementById('add-circle-modal'));
    if (addCircleBtn && confirmAddCircleBtn) {
        addCircleBtn.addEventListener('click', () => { addCircleModal.show(); });
        confirmAddCircleBtn.addEventListener('click', handleAddCircle);
    } else { console.warn("Add circle modal buttons not found."); }

    // --- ADDED FOR L-SHAPE ---
    addLShapeModal = new bootstrap.Modal(document.getElementById('add-l-shape-modal'));
    if (addLShapeBtn && confirmAddLShapeBtn) {
        addLShapeBtn.addEventListener('click', () => { addLShapeModal.show(); });
        confirmAddLShapeBtn.addEventListener('click', handleAddLShape);
    } else { console.warn("Add L-Shape modal buttons not found."); }

    // --- ADDED FOR U-SHAPE ---
    addUShapeModal = new bootstrap.Modal(document.getElementById('add-u-shape-modal'));
    if (addUShapeBtn && confirmAddUShapeBtn) {
        addUShapeBtn.addEventListener('click', () => { addUShapeModal.show(); });
        confirmAddUShapeBtn.addEventListener('click', handleAddUShape);
    } else { console.warn("Add U-Shape modal buttons not found."); }

    // --- ADDED FOR LILI ---
    addLiLiModal = new bootstrap.Modal(document.getElementById('add-lili-modal'));
    if (addLiLiBtn && confirmAddLiLiBtn) {
        addLiLiBtn.addEventListener('click', () => { addLiLiModal.show(); });
        confirmAddLiLiBtn.addEventListener('click', handleAddLiLi);
    } else { console.warn("Add LiLi modal buttons not found."); }

    // --- ADDED FOR HEXAGON ---
    addHexagonModal = new bootstrap.Modal(document.getElementById('add-hexagon-modal'));
    if (addHexagonBtn && confirmAddHexagonBtn) {
        addHexagonBtn.addEventListener('click', () => { addHexagonModal.show(); });
        confirmAddHexagonBtn.addEventListener('click', handleAddHexagon);
    } else { console.warn("Add Hexagon modal buttons not found."); }

    // --- ADDED FOR TRIANGLE ---
    addTriangleModal = new bootstrap.Modal(document.getElementById('add-triangle-empty-modal'));
    if (addTriangleBtn && confirmAddTriangleBtn) {
        addTriangleBtn.addEventListener('click', () => { addTriangleModal.show(); });
        confirmAddTriangleBtn.addEventListener('click', handleAddTriangle);
    } else { console.warn("Add Triangle modal buttons not found."); }
}

/**
 * Finds an empty spot on the grid for a new shape by searching outwards from the view center.
 * @param {object} viewCenter - The {x, y} center of the current canvas view (in world coords).
 * @param {number} shapeWidth - The total width of the shape in pixels.
 * @param {number} shapeHeight - The total height of the shape in pixels.
 * @param {function(number, number): Array<object>} positionGenerator - A function that takes (startX, startY) and returns an array of {x, y} world coordinates for all LEDs in the shape.
 * @returns {object} - An object { foundSpot: boolean, startX: number, startY: number }.
 */
function findEmptySpotForShape(viewCenter, shapeWidth, shapeHeight, positionGenerator) {
    const maxSearchRadius = 50; // How many grid units to search outwards
    let potentialPositions = [];

    // Calculate initial top-left corner based on view center and shape dimensions
    let baseStartX = Math.round((viewCenter.x - shapeWidth / 2) / GRID_SIZE) * GRID_SIZE;
    let baseStartY = Math.round((viewCenter.y - shapeHeight / 2) / GRID_SIZE) * GRID_SIZE;

    // Check initial spot (center of view)
    potentialPositions = positionGenerator(baseStartX, baseStartY);
    if (!checkOverlap(potentialPositions)) {
        return { foundSpot: true, startX: baseStartX, startY: baseStartY };
    }

    // If center is taken, spiral outwards
    console.log("Center spot overlaps, searching...");
    searchLoop:
    for (let radius = 1; radius <= maxSearchRadius; radius++) {
        for (let side = 0; side < 4; side++) { // 4 sides of the search square
            for (let step = 0; step < radius * 2; step++) {
                let dx = 0, dy = 0;
                switch (side) {
                    case 0: dx = radius; dy = -radius + step; break; // Right
                    case 1: dx = radius - step; dy = radius; break; // Bottom
                    case 2: dx = -radius; dy = radius - step; break; // Left
                    case 3: dx = -radius + step; dy = -radius; break; // Top
                }
                // Skip corners (they are covered by the next side's start)
                if ((side === 0 && step === radius * 2 - 1) || (side === 1 && step === radius * 2 - 1) || (side === 2 && step === radius * 2 - 1)) {
                    continue;
                }

                let currentStartX = baseStartX + dx * GRID_SIZE;
                let currentStartY = baseStartY + dy * GRID_SIZE;

                potentialPositions = positionGenerator(currentStartX, currentStartY);

                if (!checkOverlap(potentialPositions)) {
                    console.log(`Found spot at offset dx=${dx}, dy=${dy}`);
                    return { foundSpot: true, startX: currentStartX, startY: currentStartY };
                }
            }
        }
    }

    // No spot found
    return { foundSpot: false, startX: 0, startY: 0 };
}

function setupToolbarListeners() {
    document.getElementById('tool-select-btn').addEventListener('click', () => setTool('select'));
    document.getElementById('tool-place-led-btn').addEventListener('click', () => setTool('place-led'));
    document.getElementById('tool-wiring-btn').addEventListener('click', () => setTool('wiring'));
    document.getElementById('zoom-in-btn').addEventListener('click', () => zoomAtPoint(canvas.width / 2, canvas.height / 2, 1.2));
    document.getElementById('zoom-out-btn').addEventListener('click', () => zoomAtPoint(canvas.width / 2, canvas.height / 2, 1 / 1.2));
    document.getElementById('zoom-reset-btn').addEventListener('click', resetView);
    document.getElementById('toggle-grid-btn').addEventListener('click', () => { toggleGrid(); });

    if (rotateSelectedBtn) {
        rotateSelectedBtn.addEventListener('click', (e) => {
            if (selectedLedIds.size === 0) {
                showToast('Action Blocked', 'Select one or more LEDs to rotate.', 'warning');
            } else {
                // Check for Shift key to determine direction:
                // Shift key down = -90° (Clockwise)
                // Shift key up = +90° (Counter-Clockwise)
                const angle = e.shiftKey ? -90 : 90;
                handleRotateSelected(angle);
            }
        });
    } else { console.warn("Rotate button not found."); }
    // --- END MODIFIED ROTATION LISTENER ---

    // Keep scale modal initialization here (it still uses a modal for factor input)
    scaleModal = new bootstrap.Modal(document.getElementById('scale-selected-modal'));
    if (scaleSelectedBtn && confirmScaleBtn) {
        scaleSelectedBtn.addEventListener('click', () => {
            if (selectedLedIds.size === 0) {
                showToast('Action Blocked', 'Select one or more LEDs to scale.', 'warning');
            } else {
                scaleModal.show();
            }
        });
        confirmScaleBtn.addEventListener('click', handleScaleSelected);
    } else { console.warn("Scale buttons not found."); }
}

function setTool(toolName) {
    // Clear any pending connection from 'wiring' or 'place-led' tools
    clearPendingConnection();

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
            updateLedCount();
        }
    });
}

function lerp(a, b, t) {
    return a + (b - a) * t;
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
    const matrixWidth = (cols - 1) * GRID_SIZE;
    const matrixHeight = (rows - 1) * GRID_SIZE;

    // --- NEW: Define the position generator function ---
    const getMatrixPositions = (sx, sy) => {
        const positions = [];
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                positions.push({ x: sx + c * GRID_SIZE, y: sy + r * GRID_SIZE });
            }
        }
        return positions;
    };

    const { foundSpot, startX, startY } = findEmptySpotForShape(viewCenter, matrixWidth, matrixHeight, getMatrixPositions);

    if (!foundSpot) {
        showToast('No Empty Space', `Could not find an empty ${cols}x${rows} space.`, 'warning');
        return;
    }

    // --- This part remains the same ---
    const newLeds = [];
    const newWireIds = [];
    const finalMatrixWidth = (cols - 1) * GRID_SIZE;
    const finalMatrixHeight = (rows - 1) * GRID_SIZE;

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

    if (!Array.isArray(componentState.leds)) componentState.leds = [];
    if (!Array.isArray(componentState.wiring)) componentState.wiring = [];

    componentState.leds.push(...newLeds);
    componentState.wiring.push(newWireIds);

    const matrixCenterX = startX + finalMatrixWidth / 2;
    const matrixCenterY = startY + finalMatrixHeight / 2;
    viewTransform.panX = canvas.width / 2 - (matrixCenterX * viewTransform.zoom);
    viewTransform.panY = canvas.height / 2 - (matrixCenterY * viewTransform.zoom);
    selectedLedIds.clear(); newLeds.forEach(led => selectedLedIds.add(led.id));
    setTool('select');
    addMatrixModal.hide(); drawCanvas(); autoSaveState();
    updateLedCount();
}

// --- Rendering ---
function updateUIFromState() {
    if (compNameInput) compNameInput.value = componentState?.name || '';
    if (compDisplayNameInput) compDisplayNameInput.value = componentState?.displayName || '';
    if (compBrandInput) compBrandInput.value = componentState?.brand || 'Custom';
    if (compTypeInput) compTypeInput.value = componentState?.type || 'Strip'; if (componentState?.imageUrl && imagePreview) {
        imagePreview.src = componentState.imageUrl; imagePreview.style.display = 'block';
    } else if (imagePreview) {
        imagePreview.src = '#'; imagePreview.style.display = 'none';
        if (compImageInput) compImageInput.value = '';
    }
    updateLedCount();
}

function handleAddStrip() {
    const ledCount = parseInt(document.getElementById('strip-led-count').value) || 1;
    const orientation = document.getElementById('strip-orientation').value;

    if (ledCount <= 0) { showToast('Invalid Input', 'LED Count must be > 0.', 'danger'); return; }
    if (!canvas || !viewTransform) { showToast('Error', 'Canvas not ready.', 'danger'); return; }

    const viewCenter = { x: (canvas.width / 2 - viewTransform.panX) / viewTransform.zoom, y: (canvas.height / 2 - viewTransform.panY) / viewTransform.zoom };
    const shapeWidth = (orientation === 'horizontal') ? (ledCount - 1) * GRID_SIZE : 0;
    const shapeHeight = (orientation === 'vertical') ? (ledCount - 1) * GRID_SIZE : 0;

    const getStripPositions = (sx, sy) => {
        const positions = [];
        for (let i = 0; i < ledCount; i++) {
            const x = sx + (orientation === 'horizontal' ? i * GRID_SIZE : 0);
            const y = sy + (orientation === 'vertical' ? i * GRID_SIZE : 0);
            positions.push({ x, y });
        }
        return positions;
    };

    const { foundSpot, startX, startY } = findEmptySpotForShape(viewCenter, shapeWidth, shapeHeight, getStripPositions);

    if (!foundSpot) {
        showToast('No Empty Space', `Could not find an empty space for the strip.`, 'warning');
        return;
    }

    const newLeds = [];
    const newWireIds = [];
    for (let i = 0; i < ledCount; i++) {
        const x = startX + (orientation === 'horizontal' ? i * GRID_SIZE : 0);
        const y = startY + (orientation === 'vertical' ? i * GRID_SIZE : 0);
        const id = `${Date.now()}-s-${i}`;
        const newLed = { id, x, y };
        newLeds.push(newLed);
        newWireIds.push(id);
    }

    if (!Array.isArray(componentState.leds)) componentState.leds = [];
    if (!Array.isArray(componentState.wiring)) componentState.wiring = [];
    componentState.leds.push(...newLeds);
    componentState.wiring.push(newWireIds); // Push as a new circuit

    const shapeCenterX = startX + shapeWidth / 2;
    const shapeCenterY = startY + shapeHeight / 2;
    viewTransform.panX = canvas.width / 2 - (shapeCenterX * viewTransform.zoom);
    viewTransform.panY = canvas.height / 2 - (shapeCenterY * viewTransform.zoom);
    selectedLedIds.clear(); newLeds.forEach(led => selectedLedIds.add(led.id));
    setTool('select');
    addStripModal.hide(); drawCanvas(); autoSaveState();
    updateLedCount();
}

// --- MODIFIED FUNCTION: handleAddCircle (Calculates Required Radius) ---
function handleAddCircle() {
    // We now rely solely on the LED Count input
    const ledCount = parseInt(document.getElementById('circle-led-count').value) || 12;

    if (ledCount <= 2) { showToast('Invalid Input', 'LED Count must be greater than 2 to form a circle.', 'danger'); return; }
    if (!canvas || !viewTransform) { showToast('Error', 'Canvas not ready.', 'danger'); return; }

    // --- 1. CALCULATE MINIMAL GRID-ALIGNED RADIUS ---
    // Minimal Circumference (C) needed is LED_COUNT * GRID_SIZE to ensure non-overlap
    // C = 2 * PI * R  =>  R = C / (2 * PI)
    const minCircumference = ledCount * GRID_SIZE;
    const requiredRadiusFloat = minCircumference / (2 * Math.PI);

    // Round UP to the nearest multiple of GRID_SIZE to guarantee spacing
    const radiusUnits = Math.ceil(requiredRadiusFloat / GRID_SIZE);
    const radiusPx = radiusUnits * GRID_SIZE;

    console.log(`Calculated Radius: ${radiusUnits} grid units (${radiusPx}px) for ${ledCount} LEDs.`);

    const viewCenter = { x: (canvas.width / 2 - viewTransform.panX) / viewTransform.zoom, y: (canvas.height / 2 - viewTransform.panY) / viewTransform.zoom };

    // Bounding box of the circle
    const shapeWidth = radiusPx * 2;
    const shapeHeight = radiusPx * 2;

    // Calculate the snapped center and bounding box start
    const finalCenterX = Math.round(viewCenter.x / GRID_SIZE) * GRID_SIZE;
    const finalCenterY = Math.round(viewCenter.y / GRID_SIZE) * GRID_SIZE;

    const baseStartX = finalCenterX - radiusPx;
    const baseStartY = finalCenterY - radiusPx;


    // --- 2. DEFINE FLOATING-POINT VERTICES (Each LED position acts as a vertex) ---
    const getVertices = (centerX, centerY) => {
        const V = [];
        for (let i = 0; i < ledCount; i++) {
            const angle = (i / ledCount) * 2 * Math.PI;
            V.push({
                x: centerX + radiusPx * Math.cos(angle),
                y: centerY + radiusPx * Math.sin(angle)
            });
        }
        return V;
    };


    // --- 3. NON-OVERLAP SEARCH ---
    // The complexity of Bresenham's is not strictly necessary here, but we use the
    // existing robust snapping and deduplication logic inside getPointsForPolygon.

    // We rely on simple snapping of the vertices for overlap checking
    const getPositionsForSearch = (sx, sy) => getVertices(sx + radiusPx, sy + radiusPx).map(v => ({
        x: Math.round(v.x / GRID_SIZE) * GRID_SIZE,
        y: Math.round(v.y / GRID_SIZE) * GRID_SIZE
    }));

    const { foundSpot, startX, startY } = findEmptySpotForShape(
        viewCenter,
        shapeWidth,
        shapeHeight,
        getPositionsForSearch
    );

    if (!foundSpot) { showToast('No Empty Space', `Could not find an empty space for the circle.`, 'warning'); return; }


    // --- 4. GENERATE PRECISE LED POINTS ---
    const finalVertices = getVertices(startX + radiusPx, startY + radiusPx);

    // Use getPointsForPolygon (which uses Bresenham's) to place points accurately.
    // NOTE: For a perfect circle, Bresenham's isn't ideal, but since we are placing
    // *discrete* LEDs at the calculated vertex locations, we only need the snapping/dedupe.
    const newLedsRaw = getPointsForPolygon(finalVertices, GRID_SIZE);

    const newLeds = [];
    const newWireIds = [];
    let ledCountFinal = 0;

    // Use only the first 'ledCount' points, as Bresenham's might add intermediate points
    // that we don't want for a discrete circle. We should use the raw snapped vertices.
    const addedCoords = new Set();

    for (const rawLed of newLedsRaw) {
        // We only want the *snapped* vertex points, which are all contained in newLedsRaw.
        const key = `${rawLed.x},${rawLed.y}`;
        if (!addedCoords.has(key)) {
            const id = `${Date.now()}-circ-${ledCountFinal++}`;
            const newLed = { id, x: rawLed.x, y: rawLed.y };
            newLeds.push(newLed);
            newWireIds.push(id);
            addedCoords.add(key);
        }
    }


    // --- Final steps ---
    if (!Array.isArray(componentState.leds)) componentState.leds = [];
    if (!Array.isArray(componentState.wiring)) componentState.wiring = [];
    componentState.leds.push(...newLeds);
    componentState.wiring.push(newWireIds);

    viewTransform.panX = canvas.width / 2 - (finalCenterX * viewTransform.zoom);
    viewTransform.panY = canvas.height / 2 - (finalCenterY * viewTransform.zoom);
    selectedLedIds.clear(); newLeds.forEach(led => selectedLedIds.add(led.id));
    setTool('select');
    document.getElementById('add-circle-modal').classList.remove('show');
    addCircleModal.hide(); drawCanvas(); autoSaveState();
    updateLedCount();
}

function handleAddLShape() {
    const aLeds = parseInt(document.getElementById('l-shape-a-leds').value) || 3; // Vertical
    const bLeds = parseInt(document.getElementById('l-shape-b-leds').value) || 3; // Horizontal

    if (aLeds <= 0 || bLeds <= 0) { showToast('Invalid Input', 'LED Counts must be > 0.', 'danger'); return; }
    if (!canvas || !viewTransform) { showToast('Error', 'Canvas not ready.', 'danger'); return; }

    const viewCenter = { x: (canvas.width / 2 - viewTransform.panX) / viewTransform.zoom, y: (canvas.height / 2 - viewTransform.panY) / viewTransform.zoom };
    // L-shape with corner at bottom-left
    const shapeWidth = (bLeds - 1) * GRID_SIZE;
    const shapeHeight = (aLeds - 1) * GRID_SIZE;

    // sx/sy is the TOP-LEFT corner of the shape (top of vertical bar)
    const getLShapePositions = (sx, sy) => {
        const positions = [];
        const cornerY = sy + shapeHeight; // Y-coord of the corner
        // Side A (Vertical)
        for (let i = 0; i < aLeds; i++) {
            positions.push({ x: sx, y: sy + i * GRID_SIZE });
        }
        // Side B (Horizontal), skipping corner
        for (let i = 1; i < bLeds; i++) {
            positions.push({ x: sx + i * GRID_SIZE, y: cornerY });
        }
        return positions;
    };

    const { foundSpot, startX, startY } = findEmptySpotForShape(viewCenter, shapeWidth, shapeHeight, getLShapePositions);

    if (!foundSpot) {
        showToast('No Empty Space', `Could not find an empty space for the L-shape.`, 'warning');
        return;
    }

    const newLeds = [];
    const newWireIds = [];
    const cornerY = startY + shapeHeight;

    // Side A (Vertical) - Top to Bottom
    for (let i = 0; i < aLeds; i++) {
        const id = `${Date.now()}-la-${i}`;
        const newLed = { id, x: startX, y: startY + i * GRID_SIZE };
        newLeds.push(newLed);
        newWireIds.push(id);
    }
    // Side B (Horizontal) - Left to Right, skipping corner
    for (let i = 1; i < bLeds; i++) {
        const id = `${Date.now()}-lb-${i}`;
        const newLed = { id, x: startX + i * GRID_SIZE, y: cornerY };
        newLeds.push(newLed);
        newWireIds.push(id);
    }

    if (!Array.isArray(componentState.leds)) componentState.leds = [];
    if (!Array.isArray(componentState.wiring)) componentState.wiring = [];
    componentState.leds.push(...newLeds);
    componentState.wiring.push(newWireIds);

    const shapeCenterX = startX + shapeWidth / 2;
    const shapeCenterY = startY + shapeHeight / 2;
    viewTransform.panX = canvas.width / 2 - (shapeCenterX * viewTransform.zoom);
    viewTransform.panY = canvas.height / 2 - (shapeCenterY * viewTransform.zoom);
    selectedLedIds.clear(); newLeds.forEach(led => selectedLedIds.add(led.id));
    setTool('select');
    addLShapeModal.hide(); drawCanvas(); autoSaveState();
    updateLedCount();
}

function handleAddUShape() {
    const aLeds = parseInt(document.getElementById('u-shape-a-leds').value) || 1; // Left
    const bLeds = parseInt(document.getElementById('u-shape-b-leds').value) || 1; // Bottom
    const cLeds = parseInt(document.getElementById('u-shape-c-leds').value) || 1; // Right

    if (aLeds <= 0 || bLeds <= 0 || cLeds <= 0) { showToast('Invalid Input', 'LED Counts must be > 0.', 'danger'); return; }
    if (!canvas || !viewTransform) { showToast('Error', 'Canvas not ready.', 'danger'); return; }

    const viewCenter = { x: (canvas.width / 2 - viewTransform.panX) / viewTransform.zoom, y: (canvas.height / 2 - viewTransform.panY) / viewTransform.zoom };

    // Shape dimensions (U-shape, starts top-left)
    const shapeWidth = (bLeds - 1) * GRID_SIZE;
    const shapeHeight = Math.max(aLeds - 1, cLeds - 1) * GRID_SIZE;

    const getUShapePositions = (sx, sy) => {
        const positions = [];
        const addedCoords = new Set();
        const addPos = (x, y) => {
            const key = `${x},${y}`;
            if (!addedCoords.has(key)) {
                positions.push({ x, y });
                addedCoords.add(key);
            }
        };

        const corner_BL_y = sy + (aLeds - 1) * GRID_SIZE;
        const corner_BR_x = sx + (bLeds - 1) * GRID_SIZE;
        const corner_TR_y = corner_BL_y - (cLeds - 1) * GRID_SIZE;

        // Side A (Left, Top-to-Bottom)
        for (let i = 0; i < aLeds; i++) addPos(sx, sy + i * GRID_SIZE);
        // Side B (Bottom, Left-to-Right)
        for (let i = 0; i < bLeds; i++) addPos(sx + i * GRID_SIZE, corner_BL_y);
        // Side C (Right, Bottom-to-Top)
        for (let i = 0; i < cLeds; i++) addPos(corner_BR_x, corner_BL_y - i * GRID_SIZE);

        return positions;
    };

    const { foundSpot, startX, startY } = findEmptySpotForShape(viewCenter, shapeWidth, shapeHeight, getUShapePositions);

    if (!foundSpot) { showToast('No Empty Space', `Could not find an empty space for the U-shape.`, 'warning'); return; }

    const newLeds = [];
    const newWireIds = [];
    const addedCoords = new Set();
    const addLed = (x, y, id) => {
        const key = `${x},${y}`;
        if (!addedCoords.has(key)) {
            const newLed = { id, x, y };
            newLeds.push(newLed);
            newWireIds.push(id);
            addedCoords.add(key);
            return true;
        }
        return false;
    };

    const corner_BL_y = startY + (aLeds - 1) * GRID_SIZE;
    const corner_BR_x = startX + (bLeds - 1) * GRID_SIZE;

    // Side A (Left, Top-to-Bottom)
    for (let i = 0; i < aLeds; i++) addLed(startX, startY + i * GRID_SIZE, `${Date.now()}-ua-${i}`);
    // Side B (Bottom, Left-to-Right, skip corner)
    for (let i = 1; i < bLeds; i++) addLed(startX + i * GRID_SIZE, corner_BL_y, `${Date.now()}-ub-${i}`);
    // Side C (Right, Bottom-to-Top, skip corner)
    for (let i = 1; i < cLeds; i++) addLed(corner_BR_x, corner_BL_y - i * GRID_SIZE, `${Date.now()}-uc-${i}`);

    if (!Array.isArray(componentState.leds)) componentState.leds = [];
    if (!Array.isArray(componentState.wiring)) componentState.wiring = [];
    componentState.leds.push(...newLeds);
    componentState.wiring.push(newWireIds); // Push as one circuit

    const shapeCenterX = startX + shapeWidth / 2;
    const shapeCenterY = startY + shapeHeight / 2; // This might be off-center depending on A/C, but good enough
    viewTransform.panX = canvas.width / 2 - (shapeCenterX * viewTransform.zoom);
    viewTransform.panY = canvas.height / 2 - (shapeCenterY * viewTransform.zoom);
    selectedLedIds.clear(); newLeds.forEach(led => selectedLedIds.add(led.id));
    setTool('select');
    addUShapeModal.hide(); drawCanvas(); autoSaveState();
    updateLedCount();
}

// --- NEW FUNCTION: handleAddLiLi ---
function handleAddLiLi() {
    const stripLeds = parseInt(document.getElementById('lili-strip-leds').value) || 3;
    const circleLeds = parseInt(document.getElementById('lili-circle-leds').value) || 8;
    const circleRadius = parseInt(document.getElementById('lili-circle-radius').value) || 4;
    const spacing = parseInt(document.getElementById('lili-spacing').value) || 2;

    if (stripLeds <= 0 || circleLeds <= 0 || circleRadius <= 0 || spacing <= 0) { showToast('Invalid Input', 'Inputs must be > 0.', 'danger'); return; }
    if (!canvas || !viewTransform) { showToast('Error', 'Canvas not ready.', 'danger'); return; }

    const viewCenter = { x: (canvas.width / 2 - viewTransform.panX) / viewTransform.zoom, y: (canvas.height / 2 - viewTransform.panY) / viewTransform.zoom };

    const radiusPx = circleRadius * GRID_SIZE;
    const spacingPx = spacing * GRID_SIZE;
    const circleWidth = radiusPx * 2;
    const stripHeight = (stripLeds - 1) * GRID_SIZE;
    const circleHeight = radiusPx * 2;

    const shapeWidth = (spacingPx * 2) + circleWidth;
    const shapeHeight = Math.max(stripHeight, circleHeight);

    const getLiLiPositions = (sx, sy) => {
        const positions = [];
        const addedCoords = new Set();
        const addPos = (x, y) => {
            const rX = Math.round(x / GRID_SIZE) * GRID_SIZE;
            const rY = Math.round(y / GRID_SIZE) * GRID_SIZE;
            const key = `${rX},${rY}`;
            if (!addedCoords.has(key)) {
                positions.push({ x: rX, y: rY });
                addedCoords.add(key);
            }
        };

        const stripYOffset = (shapeHeight - stripHeight) / 2;
        const circleYOffset = (shapeHeight - circleHeight) / 2;

        const leftStripX = sx;
        const circleCenterX = sx + spacingPx + radiusPx;
        const circleCenterY = sy + circleYOffset + radiusPx;
        const rightStripX = sx + spacingPx * 2 + circleWidth;

        // Left Strip
        for (let i = 0; i < stripLeds; i++) addPos(leftStripX, sy + stripYOffset + i * GRID_SIZE);
        // Circle
        for (let i = 0; i < circleLeds; i++) {
            const angle = (i / circleLeds) * 2 * Math.PI;
            addPos(circleCenterX + radiusPx * Math.cos(angle), circleCenterY + radiusPx * Math.sin(angle));
        }
        // Right Strip
        for (let i = 0; i < stripLeds; i++) addPos(rightStripX, sy + stripYOffset + i * GRID_SIZE);

        return positions;
    };

    const { foundSpot, startX, startY } = findEmptySpotForShape(viewCenter, shapeWidth, shapeHeight, getLiLiPositions);

    if (!foundSpot) { showToast('No Empty Space', `Could not find an empty space for the LiLi shape.`, 'warning'); return; }

    const allNewLeds = [];
    const strip1_Leds = [], strip1_Wires = [];
    const strip2_Leds = [], strip2_Wires = [];
    const circle_Leds = [], circle_Wires = [];

    const stripYOffset = (shapeHeight - stripHeight) / 2;
    const circleYOffset = (shapeHeight - circleHeight) / 2;
    const leftStripX = startX;
    const circleCenterX = startX + spacingPx + radiusPx;
    const circleCenterY = startY + circleYOffset + radiusPx;
    const rightStripX = startX + spacingPx * 2 + circleWidth;

    const addedCoords = new Set();

    // Left Strip
    for (let i = 0; i < stripLeds; i++) {
        const x = leftStripX;
        const y = startY + stripYOffset + i * GRID_SIZE;
        const key = `${x},${y}`;
        if (!addedCoords.has(key)) {
            const id = `${Date.now()}-lili-s1-${i}`;
            const newLed = { id, x, y };
            strip1_Leds.push(newLed);
            strip1_Wires.push(id);
            allNewLeds.push(newLed);
            addedCoords.add(key);
        }
    }
    // Circle
    for (let i = 0; i < circleLeds; i++) {
        const angle = (i / circleLeds) * 2 * Math.PI;
        const x = Math.round((circleCenterX + radiusPx * Math.cos(angle)) / GRID_SIZE) * GRID_SIZE;
        const y = Math.round((circleCenterY + radiusPx * Math.sin(angle)) / GRID_SIZE) * GRID_SIZE;
        const key = `${x},${y}`;
        if (!addedCoords.has(key)) {
            const id = `${Date.now()}-lili-c-${i}`;
            const newLed = { id, x, y };
            circle_Leds.push(newLed);
            circle_Wires.push(id);
            allNewLeds.push(newLed);
            addedCoords.add(key);
        }
    }
    // Right Strip
    for (let i = 0; i < stripLeds; i++) {
        const x = rightStripX;
        const y = startY + stripYOffset + i * GRID_SIZE;
        const key = `${x},${y}`;
        if (!addedCoords.has(key)) {
            const id = `${Date.now()}-lili-s2-${i}`;
            const newLed = { id, x, y };
            strip2_Leds.push(newLed);
            strip2_Wires.push(id);
            allNewLeds.push(newLed);
            addedCoords.add(key);
        }
    }

    if (!Array.isArray(componentState.leds)) componentState.leds = [];
    if (!Array.isArray(componentState.wiring)) componentState.wiring = [];
    componentState.leds.push(...allNewLeds);
    // Add as THREE separate circuits
    if (strip1_Wires.length > 0) componentState.wiring.push(strip1_Wires);
    if (circle_Wires.length > 0) componentState.wiring.push(circle_Wires);
    if (strip2_Wires.length > 0) componentState.wiring.push(strip2_Wires);

    const shapeCenterX = startX + shapeWidth / 2;
    const shapeCenterY = startY + shapeHeight / 2;
    viewTransform.panX = canvas.width / 2 - (shapeCenterX * viewTransform.zoom);
    viewTransform.panY = canvas.height / 2 - (shapeCenterY * viewTransform.zoom);
    selectedLedIds.clear(); allNewLeds.forEach(led => selectedLedIds.add(led.id));
    setTool('select');
    addLiLiModal.hide(); drawCanvas(); autoSaveState();
    updateLedCount();
}

// --- MODIFIED FUNCTION: handleAddHexagon (Reset to True Regular Hexagon) ---
function handleAddHexagon() {
    // The input defines the segments along one side
    const ledsPerSideInput = parseInt(document.getElementById('hexagon-leds-per-side').value) || 4;
    const SIDES = 6;

    if (ledsPerSideInput <= 1) { showToast('Invalid Input', 'LEDs per Side must be greater than 1.', 'danger'); return; }
    if (!canvas || !viewTransform) { showToast('Error', 'Canvas not ready.', 'danger'); return; }

    // --- GEOMETRY SETUP ---
    const numSegments = ledsPerSideInput - 1;
    const s = numSegments * GRID_SIZE; // Side length (s = radius of circumcircle)
    const R = s;
    const a = R * (Math.sqrt(3) / 2); // Apothem (half height)

    // Bounding Box dimensions (for a flat-top hexagon)
    const shapeWidth = 2 * R;
    const shapeHeight = Math.round(2 * a / GRID_SIZE) * GRID_SIZE; // Snapped height

    const viewCenter = { x: (canvas.width / 2 - viewTransform.panX) / viewTransform.zoom, y: (canvas.height / 2 - viewTransform.panY) / viewTransform.zoom };

    // Calculate the snapped center and bounding box start
    const finalCenterX = Math.round(viewCenter.x / GRID_SIZE) * GRID_SIZE;
    const finalCenterY = Math.round(viewCenter.y / GRID_SIZE) * GRID_SIZE;

    const baseStartX = finalCenterX - R;
    const baseStartY = finalCenterY - (shapeHeight / 2);

    // --- 1. DEFINE FLOATING-POINT VERTICES ---
    const getVertices = (centerX, centerY) => {
        const V = [];
        const startAngle = Math.PI / 6; // Start at 30 degrees for flat top/bottom
        const angleStep = 2 * Math.PI / SIDES;

        for (let i = 0; i < SIDES; i++) {
            const angle = startAngle + i * angleStep;
            V.push({
                x: centerX + R * Math.cos(angle),
                y: centerY - R * Math.sin(angle)
            });
        }
        return V;
    };

    // --- 2. NON-OVERLAP SEARCH ---
    const { foundSpot, startX, startY } = findEmptySpotForShape(
        viewCenter,
        shapeWidth,
        shapeHeight,
        // Use snapped vertices for the overlap check
        (sx, sy) => getVertices(sx + R, sy + shapeHeight / 2).map(v => ({
            x: Math.round(v.x / GRID_SIZE) * GRID_SIZE,
            y: Math.round(v.y / GRID_SIZE) * GRID_SIZE
        }))
    );

    if (!foundSpot) { showToast('No Empty Space', `Could not find an empty space for the hexagon.`, 'warning'); return; }

    // --- 3. GENERATE PRECISE LED POINTS ---
    const finalVertices = getVertices(startX + R, startY + shapeHeight / 2);
    const newLedsRaw = getPointsForPolygon(finalVertices, GRID_SIZE);

    const newLeds = [];
    const newWireIds = [];
    let ledCount = 0;

    for (const rawLed of newLedsRaw) {
        const id = `${Date.now()}-hex-${ledCount++}`;
        const newLed = { id, x: rawLed.x, y: rawLed.y };
        newLeds.push(newLed);
        newWireIds.push(id);
    }

    // --- Final steps ---
    if (!Array.isArray(componentState.leds)) componentState.leds = [];
    if (!Array.isArray(componentState.wiring)) componentState.wiring = [];
    componentState.leds.push(...newLeds);
    componentState.wiring.push(newWireIds);

    viewTransform.panX = canvas.width / 2 - (finalCenterX * viewTransform.zoom);
    viewTransform.panY = canvas.height / 2 - (finalCenterY * viewTransform.zoom);
    selectedLedIds.clear(); newLeds.forEach(led => selectedLedIds.add(led.id));
    setTool('select');
    addHexagonModal.hide(); drawCanvas(); autoSaveState();
    updateLedCount();
}

// --- MODIFIED FUNCTION: handleAddTriangle (Uses getPointsForPolygon) ---
function handleAddTriangle() {
    const ledsPerSide = parseInt(document.getElementById('triangle-leds-per-side').value) || 5;

    if (ledsPerSide <= 1) { showToast('Invalid Input', 'LEDs per Side must be > 1.', 'danger'); return; }
    if (!canvas || !viewTransform) { showToast('Error', 'Canvas not ready.', 'danger'); return; }

    const viewCenter = { x: (canvas.width / 2 - viewTransform.panX) / viewTransform.zoom, y: (canvas.height / 2 - viewTransform.panY) / viewTransform.zoom };

    // --- GEOMETRY SETUP ---
    // The side length 's' in pixels is a multiple of GRID_SIZE
    const numSegments = ledsPerSide - 1;
    const s = numSegments * GRID_SIZE;
    const h = s * 0.866025; // Height of an equilateral triangle

    // Bounding Box dimensions 
    const shapeWidth = s;
    const shapeHeight = Math.round(h / GRID_SIZE) * GRID_SIZE; // Ensure bounding box height is snapped

    // Calculate the snapped center and bounding box start
    const finalCenterX = Math.round(viewCenter.x / GRID_SIZE) * GRID_SIZE;
    const finalCenterY = Math.round(viewCenter.y / GRID_SIZE) * GRID_SIZE;

    const baseStartX = finalCenterX - (shapeWidth / 2);
    const baseStartY = finalCenterY - (shapeHeight / 2);

    // --- 1. DEFINE FLOATING-POINT VERTICES ---
    // Vertices for a pointing-up equilateral triangle, anchored to the bounding box (sx, sy)
    const getVertices = (sx, sy) => [
        { x: sx, y: sy + shapeHeight },         // V1: Bottom-Left
        { x: sx + shapeWidth, y: sy + shapeHeight }, // V2: Bottom-Right
        { x: sx + shapeWidth / 2, y: sy }            // V3: Top
    ];

    // --- 2. NON-OVERLAP SEARCH ---
    const { foundSpot, startX, startY } = findEmptySpotForShape(
        viewCenter,
        shapeWidth,
        shapeHeight,
        // Use snapped vertices for the overlap check
        (sx, sy) => getVertices(sx, sy).map(v => ({
            x: Math.round(v.x / GRID_SIZE) * GRID_SIZE,
            y: Math.round(v.y / GRID_SIZE) * GRID_SIZE
        }))
    );

    if (!foundSpot) { showToast('No Empty Space', `Could not find an empty space for the triangle.`, 'warning'); return; }

    // --- 3. GENERATE PRECISE LED POINTS ---
    const finalVertices = getVertices(startX, startY);

    // Use Bresenham's to trace the line between the 3 vertices
    const newLedsRaw = getPointsForPolygon(finalVertices, GRID_SIZE);

    const newLeds = [];
    const newWireIds = [];
    let ledCount = 0;

    for (const rawLed of newLedsRaw) {
        const id = `${Date.now()}-tri-${ledCount++}`;
        const newLed = { id, x: rawLed.x, y: rawLed.y };
        newLeds.push(newLed);
        newWireIds.push(id);
    }

    // --- Final steps ---
    if (!Array.isArray(componentState.leds)) componentState.leds = [];
    if (!Array.isArray(componentState.wiring)) componentState.wiring = [];
    componentState.leds.push(...newLeds);
    componentState.wiring.push(newWireIds);

    viewTransform.panX = canvas.width / 2 - (finalCenterX * viewTransform.zoom);
    viewTransform.panY = canvas.height / 2 - (finalCenterY * viewTransform.zoom);
    selectedLedIds.clear(); newLeds.forEach(led => selectedLedIds.add(led.id));
    setTool('select');
    addTriangleModal.hide(); drawCanvas(); autoSaveState();
    updateLedCount();
}

// --- MODIFIED FUNCTION: handleRotateSelected (Fixed 90° increments) ---
function handleRotateSelected(angleDeg) {
    if (selectedLedIds.size === 0) return;

    const center = getSelectionCenter();
    if (!center) return;

    let stateChanged = false;
    let rotationType = '';

    if (angleDeg === 90) {
        rotationType = '+90° (CCW)';
    } else if (angleDeg === -90) {
        rotationType = '-90° (CW)';
    } else {
        console.error("handleRotateSelected called with non-90° angle.");
        return;
    }

    componentState.leds.forEach(led => {
        if (led && selectedLedIds.has(led.id)) {
            // Translate point to origin
            const x = led.x - center.centerX;
            const y = led.y - center.centerY;

            let xPrime, yPrime;

            // Simplified 90-degree rotation matrix:
            if (angleDeg === 90) {
                xPrime = -y; // x' = -y
                yPrime = x;  // y' = x
            } else { // angleDeg === -90
                xPrime = y;  // x' = y
                yPrime = -x; // y' = -x
            }

            // Translate back and snap to nearest grid point
            led.x = Math.round((xPrime + center.centerX) / GRID_SIZE) * GRID_SIZE;
            led.y = Math.round((yPrime + center.centerY) / GRID_SIZE) * GRID_SIZE;
            
            stateChanged = true;
        }
    });

    if (stateChanged) {
        showToast('Rotation Complete', `Rotated ${selectedLedIds.size} LEDs by ${rotationType}. Hold Shift for other direction.`, 'success');
        autoSaveState();
        drawCanvas();
    }
}

// --- NEW FUNCTION: handleScaleSelected ---
function handleScaleSelected() {
    const factor = parseFloat(scaleFactorInput.value);
    if (isNaN(factor) || factor <= 0 || selectedLedIds.size === 0) {
        showToast('Invalid Input', 'Invalid scale factor (must be > 0) or no LEDs selected.', 'danger');
        return;
    }

    const center = getSelectionCenter();
    if (!center) return;
    
    let stateChanged = false;

    componentState.leds.forEach(led => {
        if (led && selectedLedIds.has(led.id)) {
            // Translate point to origin
            const x = led.x - center.centerX;
            const y = led.y - center.centerY;

            // Scale
            const xPrime = x * factor;
            const yPrime = y * factor;

            // Translate back and snap to grid
            led.x = Math.round((xPrime + center.centerX) / GRID_SIZE) * GRID_SIZE;
            led.y = Math.round((yPrime + center.centerY) / GRID_SIZE) * GRID_SIZE;
            
            stateChanged = true;
        }
    });

    if (stateChanged) {
        showToast('Scaling Complete', `Scaled ${selectedLedIds.size} LEDs by x${factor}`, 'success');
        autoSaveState();
        drawCanvas();
    }
    scaleModal.hide();
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
                if (galleryOffcanvas) galleryOffcanvas.hide();
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
    if (galleryOffcanvasElement) {
        galleryOffcanvas = new bootstrap.Offcanvas(galleryOffcanvasElement);
        galleryOffcanvasElement.addEventListener('show.bs.offcanvas', loadUserComponents);
    } else { console.error("Gallery offcanvas element (#gallery-offcanvas) not found."); }
}

// --- NEW HELPER FUNCTIONS FOR GRID PRECISION ---

/**
 * Calculates the geometric center of all currently selected LEDs.
 * @returns {object|null} - {centerX, centerY} or null if no LEDs are selected.
 */
function getSelectionCenter() {
    if (selectedLedIds.size === 0 || !componentState || !Array.isArray(componentState.leds)) return null;

    let sumX = 0;
    let sumY = 0;
    let count = 0;

    componentState.leds.forEach(led => {
        if (led && selectedLedIds.has(led.id)) {
            sumX += led.x;
            sumY += led.y;
            count++;
        }
    });

    if (count === 0) return null;

    return {
        centerX: sumX / count,
        centerY: sumY / count
    };
}

/**
 * Bresenham's Line Algorithm (Integer Grid Traversal).
 * Determines the set of integer coordinates that best approximates a straight line
 * between two given integer points (x0, y0) and (x1, y1).
 * @param {number} x0 - Start X (must be an integer, rounded prior to calling).
 * @param {number} y0 - Start Y (must be an integer, rounded prior to calling).
 * @param {number} x1 - End X (must be an integer, rounded prior to calling).
 * @param {number} y1 - End Y (must be an integer, rounded prior to calling).
 * @returns {Array<object>} - Array of {x, y} integer coordinates.
 */
function bresenhamLine(x0, y0, x1, y1) {
    const points = [];
    let dx = Math.abs(x1 - x0);
    let dy = Math.abs(y1 - y0);
    const sx = (x0 < x1) ? 1 : -1;
    const sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    while (true) {
        points.push({ x: x0, y: y0 });
        if (x0 === x1 && y0 === y1) {
            break;
        }
        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x0 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y0 += sy;
        }
    }
    return points;
}


/**
 * Converts a list of floating-point shape vertices into an ordered list of snapped
 * LED coordinates using Bresenham's algorithm for precise grid placement.
 * @param {Array<object>} vertices - Array of floating-point {x, y} vertices defining the shape perimeter.
 * @param {number} gridSize - The global GRID_SIZE constant.
 * @returns {Array<object>} - Ordered array of {x, y} LED positions, snapped and deduplicated.
 */
function getPointsForPolygon(vertices, gridSize) {
    let gridPoints = [];

    for (let i = 0; i < vertices.length; i++) {
        const p1 = vertices[i];
        const p2 = vertices[(i + 1) % vertices.length];

        // 1. Calculate the intended coordinates in Grid Units (floating point)
        const x0_f = p1.x / gridSize;
        const y0_f = p1.y / gridSize;
        const x1_f = p2.x / gridSize;
        const y1_f = p2.y / gridSize;

        // 2. Round/Snap the coordinates to the nearest INTEGER Grid Unit for Bresenham's
        const x0 = Math.round(x0_f);
        const y0 = Math.round(y0_f);
        const x1 = Math.round(x1_f);
        const y1 = Math.round(y1_f);

        // 3. Use Bresenham's to trace the line path across the integer grid
        const segmentPoints = bresenhamLine(x0, y0, x1, y1);

        // 4. Convert integer grid units back to World Pixels and store
        for (const point of segmentPoints) {
            gridPoints.push({
                x: point.x * gridSize,
                y: point.y * gridSize
            });
        }
    }

    // Remove duplicates while preserving order
    const seen = new Set();
    const uniquePoints = [];
    for (const point of gridPoints) {
        const key = `${point.x},${point.y}`;
        if (!seen.has(key)) {
            uniquePoints.push(point);
            seen.add(key);
        }
    }
    return uniquePoints;
}
// --- END NEW HELPER FUNCTIONS ---


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
        updateLedCount: updateLedCount
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

