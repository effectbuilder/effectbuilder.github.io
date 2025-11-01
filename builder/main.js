// --- IMPORT ---
import { initializeTooltips, showToast, setupThemeSwitcher } from './util.js';
import {
    auth, db, storage, ref, uploadString, getDownloadURL, deleteObject, deleteDoc,
    GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
    doc, setDoc, addDoc, collection, serverTimestamp, updateDoc,
    query, where, getDocs, orderBy, limit, startAfter, getDoc, FieldValue
} from './firebase.js';
import { setupCanvas, drawCanvas, zoomAtPoint, resetView, toggleGrid, clearPendingConnection, updateLedCount } from './canvas.js';

// --- GLOBAL SHARED STATE ---
let componentState = createDefaultComponentState(); // Initialize immediately
let viewTransform = { panX: 0, panY: 0, zoom: 1 };
let selectedLedIds = new Set();
let currentTool = 'select';
let currentComponentId = null;
let isDirty = false;
const GRID_SIZE = 10;

// --- NEW GALLERY/PAGINATION STATE ---
let lastVisibleComponent = null; // Tracks the last doc for pagination
let isGalleryLoading = false; // Prevents loading more while already loading
const GALLERY_PAGE_SIZE = 9; // How many components to load at a time
let allComponentsLoaded = false; // <-- ADDED FOR LAZY LOADING
// --- END NEW ---

// --- APP-LEVEL STATE ---
const AUTOSAVE_KEY = 'srgbComponentCreator_autoSave';
const ADMIN_UID = 'zMj8mtfMjXeFMt072027JT7Jc7i1';

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

const gallerySearchInput = document.getElementById('gallery-search-input');
const galleryFilterType = document.getElementById('gallery-filter-type');
const galleryFilterBrand = document.getElementById('gallery-filter-brand');
const galleryFilterLeds = document.getElementById('gallery-filter-leds');
const galleryLoadingSpinner = document.getElementById('gallery-loading-spinner');
const galleryFooter = document.getElementById('gallery-footer');
// const galleryLoadMoreBtn = document.getElementById('gallery-load-more-btn'); // <-- REMOVED FOR LAZY LOAD

let galleryOffcanvas = null;
const compImageInput = document.getElementById('component-image');
const imagePreview = document.getElementById('image-preview');
const imagePasteZone = document.getElementById('image-paste-zone');

const importJsonBtn = document.getElementById('import-json-btn');
const importFileInput = document.getElementById('import-file-input');

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
    isDirty = true; // <-- ADD THIS
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

/**
 * Checks if the state is dirty. If it is, asks the user for confirmation.
 * @returns {boolean} - True if it's safe to proceed, false if the user cancelled.
 */
function checkDirtyState() {
    if (!isDirty) {
        return true; // Not dirty, safe to proceed
    }
    // Is dirty, ask for confirmation
    return confirm("You have unsaved changes. Are you sure you want to proceed? All unsaved changes will be lost.");
}

function clearAutoSave() {
    console.log('Clearing autosave data.');
    localStorage.removeItem(AUTOSAVE_KEY);
}

// ---
// --- NEW HELPER FUNCTION: loadComponentState ---
// ---
/**
 * Central function to load any valid component state object into the app.
 * It handles state assignment, wiring validation/fixing, and UI updates.
 * @param {object} stateToLoad - A component state object.
 * @returns {boolean} - True if successful, false if data was invalid.
 */
function loadComponentState(stateToLoad) {
    if (!stateToLoad || typeof stateToLoad !== 'object' || !Array.isArray(stateToLoad.leds)) {
        showToast('Load Error', 'Invalid component data object.', 'danger');
        return false;
    }

    // Clear old state
    clearAutoSave();
    Object.assign(componentState, createDefaultComponentState()); // Reset to default first
    Object.assign(componentState, stateToLoad); // Then apply new state

    // --- VALIDATE AND FIX WIRING ---
    componentState.leds = componentState.leds || [];
    let loadedWiring = componentState.wiring || [];
    let appWiring = []; // This will be the string[][]

    if (Array.isArray(loadedWiring) && loadedWiring.length > 0) {
        if (typeof loadedWiring[0] === 'object' && loadedWiring[0] !== null && Array.isArray(loadedWiring[0].circuit)) {
            // Firestore format: [{circuit: [...]}]
            appWiring = loadedWiring.map(item => item.circuit || []).filter(circuit => Array.isArray(circuit));
        } else if (!Array.isArray(loadedWiring[0])) {
            // OLD flat array format: ['id1', 'id2']
            const validOldWiring = loadedWiring.filter(id => id != null && componentState.leds.some(led => led && led.id === id));
            appWiring = validOldWiring.length > 0 ? [validOldWiring] : [];
        } else {
            // Correct app format: [['id1'], ['id2']]
            appWiring = loadedWiring;
        }
    }
    componentState.wiring = appWiring;
    // --- END WIRING FIX ---

    currentComponentId = stateToLoad.dbId || null; // Reset DB id if it's not in the new state

    updateUIFromState();
    selectedLedIds.clear();
    resetView(); // This will also call drawCanvas()

    // Re-validate image state after updateUIFromState
    if (componentState.imageUrl && componentState.imageUrl.startsWith('data:')) {
        imagePreview.src = componentState.imageUrl;
        imagePreview.style.display = 'block';
    } else if (componentState.imageUrl) {
        // It's a URL, but we need to handle the preview
        imagePreview.src = componentState.imageUrl;
        imagePreview.style.display = 'block';
    } else {
        imagePreview.src = '#';
        imagePreview.style.display = 'none';
        if (compImageInput) compImageInput.value = ''; // Clear file input
    }

    // --- MODIFICATION: Removed isDirty = false ---
    // The *caller* is responsible for setting the dirty state.
    return true;
}
// --- END NEW HELPER FUNCTION ---


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

    // --- MODIFICATION: Add guard to import ---
    if (importJsonBtn && importFileInput) {
        importJsonBtn.addEventListener('click', () => {
            if (!checkDirtyState()) return; // <-- ADD GUARD
            importFileInput.click();
        });
        importFileInput.addEventListener('change', handleImportJson);
    } else {
        console.warn("Import JSON buttons not found.");
    }
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
    if (!checkDirtyState()) return;

    let stateToLoad = createDefaultComponentState();
    console.log('handleNewComponent called. showNotification:', showNotification);

    if (!showNotification) {
        const savedState = localStorage.getItem(AUTOSAVE_KEY);
        console.log('Checking localStorage...');
        if (savedState) {
            try {
                const parsedState = JSON.parse(savedState);
                if (parsedState && typeof parsedState === 'object' && Array.isArray(parsedState.leds)) {
                    if (loadComponentState(parsedState)) {
                        showToast('Welcome Back!', 'Your unsaved work has been restored.', 'info');
                        // --- MODIFICATION: Set dirty flag for autosave ---
                        isDirty = true;
                    } else {
                        loadComponentState(createDefaultComponentState()); // Fallback
                        isDirty = false; // Fresh state is not dirty
                    }
                    return; // We are done
                } else {
                    console.warn("Autosave data was invalid, creating new project.");
                    clearAutoSave();
                }
            } catch (e) { console.error("Failed to parse autosave data:", e); clearAutoSave(); }
        } else { console.log('No autosave data found in localStorage.'); }
    }

    // Standard "New" click or failed autosave
    clearAutoSave();
    loadComponentState(createDefaultComponentState()); // Load a fresh state
    isDirty = false; // --- MODIFICATION: A new project is not dirty ---
    if (showNotification) {
        showToast('New Project', 'Cleared the canvas and properties.', 'info');
    }
}

/**
 * Handles the file input 'change' event to read, parse, and load a JSON file.
 * @param {Event} e - The file input change event.
 */
function handleImportJson(e) {
    const file = e.target.files[0];
    if (!file) return; // User cancelled

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            let stateToLoad = null;

            if (data.leds && Array.isArray(data.leds)) {
                // --- 1. It's an INTERNAL format (from autosave, or a friend's state) ---
                console.log('Importing internal component format.');
                stateToLoad = data; // Directly use the data object

            } else if (data.LedCoordinates && Array.isArray(data.LedCoordinates)) {
                // --- 2. It's an EXPORTED format (ProductName, LedCoordinates, etc.) ---
                console.log('Importing exported .json format.');
                stateToLoad = createDefaultComponentState(); // Start with defaults

                stateToLoad.name = data.ProductName || 'Imported Component';
                stateToLoad.displayName = data.DisplayName || stateToLoad.name;
                stateToLoad.brand = data.Brand || 'Custom';
                stateToLoad.type = data.Type || 'Other';

                // ---
                // --- MODIFICATION: Robust check for image data ---
                // ---
                // Check if data.Image exists and is a non-empty string
                if (data.Image && data.Image.length > 0) {
                    // FIX: The app exports images as webp, so we must import them as webp.
                    stateToLoad.imageUrl = `data:image/webp;base64,${data.Image}`;
                } else {
                    stateToLoad.imageUrl = null;
                }
                // --- END MODIFICATION ---

                // Re-create LEDs from normalized coordinates
                const newLeds = [];
                const newWireIds = [];
                data.LedCoordinates.forEach((coord, index) => {
                    const newId = `imported-${Date.now()}-${index}`;
                    newLeds.push({
                        id: newId,
                        x: coord[0] * GRID_SIZE, // Apply grid scaling
                        y: coord[1] * GRID_SIZE  // Apply grid scaling
                    });
                    newWireIds.push(newId);
                });

                stateToLoad.leds = newLeds;
                // The exported format implies a single, ordered circuit
                stateToLoad.wiring = [newWireIds];

            } else {
                // --- 3. It's an UNKNOWN format ---
                showToast('Import Error', 'Invalid or unrecognized JSON file format.', 'danger');
                e.target.value = null; // Reset input
                return;
            }

            // --- Load the prepared state ---
            if (loadComponentState(stateToLoad)) {
                showToast('Import Successful', `Loaded "${stateToLoad.name}" from file.`, 'success');
                // --- MODIFICATION: Set dirty flag after successful import ---
                isDirty = true;
            }

        } catch (err) {
            console.error("Error parsing JSON file:", err);
            showToast('Import Error', 'Could not parse JSON file. It may be corrupt.', 'danger');
        } finally {
            // Reset the file input to allow loading the same file again
            e.target.value = null;
        }
    };
    reader.onerror = () => {
        showToast('File Error', 'Could not read the selected file.', 'danger');
        e.target.value = null;
    };
    reader.readAsText(file);
}


// [File: main.js] - REVISED FUNCTION

async function handleSaveComponent() {
    const user = auth.currentUser;
    if (!user) { showToast('Error', 'You must be logged in to save.', 'danger'); return; }
    showToast('Saving...', 'Saving component to the cloud.', 'info');

    componentState.name = compNameInput.value;
    componentState.displayName = compDisplayNameInput.value;
    componentState.brand = compBrandInput.value;
    componentState.type = compTypeInput.value;

    // --- Firestore wiring conversion ---
    let wiringToSave = componentState.wiring;
    if (!Array.isArray(wiringToSave)) { wiringToSave = []; }
    wiringToSave = wiringToSave.filter(circuit => Array.isArray(circuit));
    const firestoreWiring = wiringToSave.map(circuit => {
        return { circuit: circuit };
    });
    // --- End wiring conversion ---

    // --- Check permissions before saving ---
    let isOwnerOrAdmin = false;
    let isNewComponent = (currentComponentId === null); // Is this a brand-new component?

    if (!isNewComponent) {
        // This is an existing component, check ownership
        if (user.uid === componentState.ownerId || user.uid === ADMIN_UID) {
            isOwnerOrAdmin = true; // User is allowed to overwrite
            console.log("Save allowed: User is owner or admin.");
        } else {
            // User is NOT the owner. Fork the component.
            currentComponentId = null;
            componentState.dbId = null;
            isNewComponent = true; // Treat it as a new component

            // If forking, we keep the base64 'data:' string
            showToast('Forking Component...', 'Saving your version as a new component.', 'info');
            console.log("Save forking: User is not owner. Creating new component.");
        }
    }
    // --- END MODIFICATION ---


    const dataToSave = {
        ...componentState,
        wiring: firestoreWiring,
        ledCount: (componentState.leds || []).length,
        ownerId: user.uid,
        ownerName: user.displayName,
        lastUpdated: serverTimestamp(),
        // We are now explicitly saving the imageUrl (which is base64)
        imageUrl: componentState.imageUrl || null
    };
    delete dataToSave.dbId; // Don't save the local DB ID in the doc

    try {
        let docRef;
        const componentsCollection = collection(db, 'srgb-components');

        // --- ALL IMAGE UPLOAD LOGIC HAS BEEN REMOVED ---

        if (currentComponentId && isOwnerOrAdmin) {
            // --- OVERWRITE PATH ---
            docRef = doc(componentsCollection, currentComponentId);
            dataToSave.createdAt = componentState.createdAt || serverTimestamp();
            await updateDoc(docRef, dataToSave);
        } else {
            // --- NEW COMPONENT (or FORK) PATH ---
            dataToSave.createdAt = serverTimestamp();
            docRef = doc(componentsCollection); // Let Firestore generate a new ID
            await setDoc(docRef, dataToSave);
            currentComponentId = docRef.id;
            componentState.dbId = currentComponentId;
        }

        componentState.createdAt = dataToSave.createdAt;

        // --- ALL IMAGE UPLOAD LOGIC (PART 2) HAS BEEN REMOVED ---

        showToast('Save Successful', `Saved component: ${componentState.name}`, 'success');
        document.getElementById('share-component-btn').disabled = false;
        clearAutoSave();
        isDirty = false;
    } catch (error) {
        console.error("Error saving component: ", error);
        showToast('Error Saving', error.message, 'danger');
    }
}

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

        // Check if image is Base64
        const imageDataUrl = (componentState.imageUrl && componentState.imageUrl.startsWith('data:'))
            ? componentState.imageUrl
            : null;

        const ledCount = currentLeds.length;

        if (ledCount === 0) { showToast('Export Error', 'Cannot export empty component.', 'warning'); return; }

        // Determine offset for normalized 0,0 export coordinates
        let minX = Infinity, minY = Infinity;
        currentLeds.forEach(led => { if (led) { minX = Math.min(minX, led.x); minY = Math.min(minY, led.y); } });
        minX = (minX === Infinity) ? 0 : minX; minY = (minY === Infinity) ? 0 : minY;

        // --- 1. Create map for quick access to LED data ---
        const ledDataMap = new Map();
        let maxX = 0, maxY = 0;
        currentLeds.forEach(led => {
            if (led) {
                const offsetX = Math.round((led.x - minX) / GRID_SIZE);
                const offsetY = Math.round((led.y - minY) / GRID_SIZE);
                ledDataMap.set(led.id, { id: led.id, x: offsetX, y: offsetY, worldX: led.x, worldY: led.y });
                maxX = Math.max(maxX, offsetX);
                maxY = Math.max(maxY, offsetY);
            }
        });

        // --- 2. Build Set of All Wired IDs ---
        const wiredLedIds = new Set();
        if (Array.isArray(currentWiring)) {
            currentWiring.forEach(circuit => {
                if (Array.isArray(circuit)) {
                    circuit.forEach(id => wiredLedIds.add(id));
                }
            });
        }

        // --- 3. CHECK FOR UNWIRED LEDs (BLOCK EXPORT) ---
        const unwiredLedsExist = currentLeds.some(led => led && !wiredLedIds.has(led.id));

        if (unwiredLedsExist) {
            const unwiredCount = currentLeds.filter(led => led && !wiredLedIds.has(led.id)).length;
            showToast(
                'Export Blocked',
                `Cannot export: ${unwiredCount} LED${unwiredCount === 1 ? ' is' : 's are'} unwired. All LEDs must be part of a circuit.`,
                'danger'
            );
            console.error(`Export Blocked: ${unwiredCount} unwired LEDs detected.`);
            return; // EXIT the function, blocking the export
        }
        // --- END UNWIRED LED CHECK ---


        // --- 4. Build LedCoordinates array based strictly on wiring order ---
        let ledCoordinates = [];
        const exportedLedIds = new Set();

        const flatWiring = currentWiring.flat().filter(id => id != null);

        flatWiring.forEach(ledId => {
            const ledData = ledDataMap.get(ledId);
            if (ledData && !exportedLedIds.has(ledId)) {
                ledCoordinates.push([ledData.x, ledData.y]);
                exportedLedIds.add(ledId);
            }
        });

        // --- 5. Final Sanity Check (Should match if all are wired) ---
        if (ledCoordinates.length !== ledCount) {
            console.error(`Coordinate count (${ledCoordinates.length}) mismatches LED count (${ledCount}). This indicates a wiring issue.`);
            showToast('Internal Error', 'Export aborted due to mismatched LED count after wiring check.', 'danger');
            return;
        }
        console.log("Generated LedCoordinates:", ledCoordinates.length);

        const ledMapping = Array.from({ length: ledCount }, (_, i) => i);
        const width = maxX + 1; const height = maxY + 1;

        let base64ImageData = "";
        if (imageDataUrl) {
            const commaIndex = imageDataUrl.indexOf(',');
            if (commaIndex !== -1) { base64ImageData = imageDataUrl.substring(commaIndex + 1); }
        }

        const exportObject = {
            ProductName: productName, DisplayName: displayName, Brand: brand, Type: currentType, LedCount: ledCount,
            Width: width, Height: height, LedMapping: ledMapping, LedCoordinates: ledCoordinates, LedNames: Array.from({ length: ledCount }, (_, i) => `Led${i + 1}`),
            Image: base64ImageData,
            ImageUrl: "" // Deprecated, but part of the old format
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
        showToast('Saving...', 'Component is valid and ready for export.', 'info');
        exportModal.show();
    } catch (error) {
        console.error("Error during handleExport:", error);
        showToast('Export Error', `An unexpected error occurred: ${error.message}`, 'danger');
        const preview = document.getElementById('json-preview');
        if (preview) preview.textContent = `Error: ${error.message}`;
        exportModal.show();
    }
}

/**
 * Processes a File object (from paste or input), resizes it,
 * and updates the component state.
 * @param {File} file - The image file to process.
 */
function handleImageFile(file) {
    if (!file || !file.type.startsWith('image/')) {
        showToast('Image Error', 'Pasted item was not a valid image.', 'warning');
        return;
    }

    if (file && componentState) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const img = new Image();
            img.onload = () => {
                // --- Resize Image logic ---
                const MAX_WIDTH = 400;
                const MAX_HEIGHT = 400;
                let width = img.naturalWidth;
                let height = img.naturalHeight;

                // Check if resizing is needed
                if (width > MAX_WIDTH || height > MAX_HEIGHT) {
                    const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                // Create an off-screen canvas to draw the resized image
                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');

                // Draw the image onto the canvas
                ctx.drawImage(img, 0, 0, width, height);

                // Get the new image as a WebP data URL (more efficient than PNG)
                const resizedDataUrl = canvas.toDataURL('image/webp', 0.85); // 85% quality

                // Save the RESIZED dataUrl to the state
                componentState.imageUrl = resizedDataUrl;
                componentState.imageWidth = width;
                componentState.imageHeight = height;

                console.log(`Device image resized to: ${width}x${height}`);
                imagePreview.src = resizedDataUrl; // Show the resized preview
                imagePreview.style.display = 'block';
                autoSaveState();

                // Clear the file input field
                if (compImageInput) compImageInput.value = '';

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
            if (compImageInput) compImageInput.value = '';
            imagePreview.src = '#'; imagePreview.style.display = 'none';
        };
        reader.readAsDataURL(file);
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

    // --- Image File Handling ---
    if (compImageInput && imagePreview && imagePasteZone) {

        console.log('Image Handling: Attaching file, click, and paste listeners.');

        // --- 1. File Input 'change' listener ---
        compImageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                handleImageFile(file); // Use the new handler
            } else if (componentState) {
                // This logic runs if the user cancels the file dialog
                componentState.imageUrl = null; componentState.imageWidth = 500; componentState.imageHeight = 300;
                imagePreview.src = '#'; imagePreview.style.display = 'none';
                autoSaveState();
            }
        });

        // --- 2. NEW: Click listener to ensure focus ---
        // A contenteditable element must be focused to receive a paste event.
        // This makes sure that clicking the box makes it ready to paste.
        imagePasteZone.addEventListener('click', () => {
            console.log('Image Handling: Paste zone clicked, setting focus.');
            imagePasteZone.focus();
        });

        // --- 3. NEW: Image Paste Zone 'paste' listener (with DEBUGGING) ---
        imagePasteZone.addEventListener('paste', (e) => {
            console.log('Image Handling: Paste event detected.');
            e.preventDefault(); // Stop browser from pasting image as a broken element

            const items = e.clipboardData ? e.clipboardData.items : null;
            if (!items) {
                console.error('Image Handling: Browser does not support clipboard items.');
                showToast('Paste Error', 'Browser does not support clipboard items.', 'danger');
                return;
            }

            console.log(`Image Handling: Found ${items.length} clipboard items.`);
            let foundFile = null;

            // Loop through all items to find the *actual* file
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                console.log(`Item ${i}:`, { kind: item.kind, type: item.type });

                // This is the key: check *kind* is 'file' first.
                if (item.kind === 'file' && item.type.startsWith('image/')) {
                    console.log(`Image Handling: Item ${i} is an image file. Grabbing it.`);
                    foundFile = item.getAsFile();
                    break; // Found it, stop looking
                }
            }

            if (foundFile) {
                console.log('Image Handling: File successfully retrieved from clipboard.');
                handleImageFile(foundFile); // Use the same handler
            } else {
                console.log('Image Handling: No usable file found in clipboard items.');
                showToast('Paste Error', 'No image file found in clipboard.', 'warning');
            }
        });

        // [File: main.js]
        // ... (inside setupPropertyListeners, after the 'paste' listener)

        // --- 4. NEW: Delete key listener for image paste zone ---
        imagePasteZone.addEventListener('keydown', (e) => {
            if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault(); // Stop browser from trying to delete content

                // Check if there is an image to delete
                if (componentState && componentState.imageUrl) {
                    console.log('Image delete key pressed.');
                    componentState.imageUrl = null;
                    componentState.imageWidth = 500; // Reset to default
                    componentState.imageHeight = 300; // Reset to default

                    imagePreview.src = '#';
                    imagePreview.style.display = 'none';
                    if (compImageInput) compImageInput.value = ''; // Clear the file input

                    autoSaveState(); // Save the cleared state
                    showToast('Image Removed', 'The device image has been cleared.', 'info');
                }
            }
        });

        // --- 5. NEW: DRAG-AND-DROP LISTENERS ---
        imagePasteZone.addEventListener('dragover', (e) => {
            e.preventDefault(); // REQUIRED: Prevents browser from opening file
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'copy'; // Show 'copy' cursor
            imagePasteZone.classList.add('drag-over');
        });

        imagePasteZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            imagePasteZone.classList.remove('drag-over');
        });

        imagePasteZone.addEventListener('drop', (e) => {
            e.preventDefault(); // REQUIRED: Prevents browser from opening file
            e.stopPropagation();
            imagePasteZone.classList.remove('drag-over');

            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                const file = files[0]; // Get the first file
                // Check if it's an image
                if (file.type.startsWith('image/')) {
                    handleImageFile(file); // Use our existing function
                } else {
                    showToast('File Error', 'Only image files can be dropped.', 'warning');
                }
            }
        });
        // --- END DRAG-AND-DROP ---


    } else {
        console.warn("Image input, preview, or paste zone element not found.");
    }
    // --- End Image File Handling ---


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

        // This guard is very important! It prevents shortcuts while typing in text fields.
        if (e.target.tagName === 'INPUT' ||
            e.target.tagName === 'TEXTAREA' ||
            e.target.tagName === 'SELECT' ||
            e.target.isContentEditable) { // <-- This new line is the fix
            return;
        }

        // Use a boolean to see if we should prevent default browser actions
        let shortcutHandled = true;

        switch (e.key) {
            // Tool Selection
            case 'v':
            case 'V':
                setTool('select');
                break;
            case 'p':
            case 'P':
                setTool('place-led');
                break;
            case 'w':
            case 'W':
                setTool('wiring');
                break;

            // Canvas/View Actions
            case 'g':
            case 'G':
                toggleGrid();
                break;
            case '+':
            case '=': // '=' is the same key as '+' without shift
                zoomAtPoint(canvas.width / 2, canvas.height / 2, 1.2);
                break;
            case '-':
            case '_': // '_' is the same key as '-' without shift
                zoomAtPoint(canvas.width / 2, canvas.height / 2, 1 / 1.2);
                break;
            case '0':
                resetView();
                break;

            // Selection Actions
            case 's':
            case 'S':
                if (selectedLedIds.size > 0) {
                    scaleModal.show();
                } else {
                    showToast('Action Blocked', 'Select one or more LEDs to scale.', 'warning');
                }
                break;
            case 'Delete':
            case 'Backspace':
                if (selectedLedIds.size > 0) {
                    console.log('Keyboard Listener: Delete triggered');
                    componentState.leds = componentState.leds.filter(led => led && !selectedLedIds.has(led.id));

                    const newWiring = [];
                    componentState.wiring.forEach((circuit, index) => {
                        if (Array.isArray(circuit)) {
                            const filteredCircuit = circuit.filter(id => id != null && !selectedLedIds.has(id));
                            if (filteredCircuit.length > 0) {
                                newWiring.push(filteredCircuit);
                            }
                        } else { console.warn(`Keyboard Delete: Invalid circuit format at index ${index}`); }
                    });
                    componentState.wiring = newWiring;

                    selectedLedIds.clear();
                    drawCanvas();
                    autoSaveState();
                    updateLedCount(); // Moved this inside the 'if'
                }
                break;

            default:
                // If no shortcut was matched, don't prevent default
                shortcutHandled = false;
                break;
        }

        if (shortcutHandled) {
            e.preventDefault(); // Prevent browser from zooming on '+' or '-'
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

function handleAddCircle() {
    const ledCount = parseInt(document.getElementById('circle-led-count').value) || 12;

    if (ledCount <= 2) { showToast('Invalid Input', 'LED Count must be greater than 2 to form a circle.', 'danger'); return; }
    if (!canvas || !viewTransform) { showToast('Error', 'Canvas not ready.', 'danger'); return; }

    const minCircumference = ledCount * GRID_SIZE;
    const requiredRadiusFloat = minCircumference / (2 * Math.PI);
    const radiusUnits = Math.ceil(requiredRadiusFloat / GRID_SIZE);
    const radiusPx = radiusUnits * GRID_SIZE;

    console.log(`Calculated Radius: ${radiusUnits} grid units (${radiusPx}px) for ${ledCount} LEDs.`);

    const viewCenter = { x: (canvas.width / 2 - viewTransform.panX) / viewTransform.zoom, y: (canvas.height / 2 - viewTransform.panY) / viewTransform.zoom };

    const shapeWidth = radiusPx * 2;
    const shapeHeight = radiusPx * 2;
    const finalCenterX = Math.round(viewCenter.x / GRID_SIZE) * GRID_SIZE;
    const finalCenterY = Math.round(viewCenter.y / GRID_SIZE) * GRID_SIZE;

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

    const finalVertices = getVertices(startX + radiusPx, startY + radiusPx);
    const newLedsRaw = getPointsForPolygon(finalVertices, GRID_SIZE);

    const newLeds = [];
    const newWireIds = [];
    let ledCountFinal = 0;
    const addedCoords = new Set();

    for (const rawLed of newLedsRaw) {
        const key = `${rawLed.x},${rawLed.y}`;
        if (!addedCoords.has(key)) {
            const id = `${Date.now()}-circ-${ledCountFinal++}`;
            const newLed = { id, x: rawLed.x, y: rawLed.y };
            newLeds.push(newLed);
            newWireIds.push(id);
            addedCoords.add(key);
        }
    }

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
    const shapeWidth = (bLeds - 1) * GRID_SIZE;
    const shapeHeight = (aLeds - 1) * GRID_SIZE;

    const getLShapePositions = (sx, sy) => {
        const positions = [];
        const cornerY = sy + shapeHeight; // Y-coord of the corner
        for (let i = 0; i < aLeds; i++) {
            positions.push({ x: sx, y: sy + i * GRID_SIZE });
        }
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

    for (let i = 0; i < aLeds; i++) {
        const id = `${Date.now()}-la-${i}`;
        const newLed = { id, x: startX, y: startY + i * GRID_SIZE };
        newLeds.push(newLed);
        newWireIds.push(id);
    }
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

        for (let i = 0; i < aLeds; i++) addPos(sx, sy + i * GRID_SIZE);
        for (let i = 0; i < bLeds; i++) addPos(sx + i * GRID_SIZE, corner_BL_y);
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

    for (let i = 0; i < aLeds; i++) addLed(startX, startY + i * GRID_SIZE, `${Date.now()}-ua-${i}`);
    for (let i = 1; i < bLeds; i++) addLed(startX + i * GRID_SIZE, corner_BL_y, `${Date.now()}-ub-${i}`);
    for (let i = 1; i < cLeds; i++) addLed(corner_BR_x, corner_BL_y - i * GRID_SIZE, `${Date.now()}-uc-${i}`);

    if (!Array.isArray(componentState.leds)) componentState.leds = [];
    if (!Array.isArray(componentState.wiring)) componentState.wiring = [];
    componentState.leds.push(...newLeds);
    componentState.wiring.push(newWireIds); // Push as one circuit

    const shapeCenterX = startX + shapeWidth / 2;
    const shapeCenterY = startY + shapeHeight / 2;
    viewTransform.panX = canvas.width / 2 - (shapeCenterX * viewTransform.zoom);
    viewTransform.panY = canvas.height / 2 - (shapeCenterY * viewTransform.zoom);
    selectedLedIds.clear(); newLeds.forEach(led => selectedLedIds.add(led.id));
    setTool('select');
    addUShapeModal.hide(); drawCanvas(); autoSaveState();
    updateLedCount();
}

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

        for (let i = 0; i < stripLeds; i++) addPos(leftStripX, sy + stripYOffset + i * GRID_SIZE);
        for (let i = 0; i < circleLeds; i++) {
            const angle = (i / circleLeds) * 2 * Math.PI;
            addPos(circleCenterX + radiusPx * Math.cos(angle), circleCenterY + radiusPx * Math.sin(angle));
        }
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

function handleAddHexagon() {
    const ledsPerSideInput = parseInt(document.getElementById('hexagon-leds-per-side').value) || 4;
    const SIDES = 6;

    if (ledsPerSideInput <= 1) { showToast('Invalid Input', 'LEDs per Side must be greater than 1.', 'danger'); return; }
    if (!canvas || !viewTransform) { showToast('Error', 'Canvas not ready.', 'danger'); return; }

    const numSegments = ledsPerSideInput - 1;
    const s = numSegments * GRID_SIZE;
    const R = s;
    const a = R * (Math.sqrt(3) / 2);
    const shapeWidth = 2 * R;
    const shapeHeight = Math.round(2 * a / GRID_SIZE) * GRID_SIZE;
    const viewCenter = { x: (canvas.width / 2 - viewTransform.panX) / viewTransform.zoom, y: (canvas.height / 2 - viewTransform.panY) / viewTransform.zoom };
    const finalCenterX = Math.round(viewCenter.x / GRID_SIZE) * GRID_SIZE;
    const finalCenterY = Math.round(viewCenter.y / GRID_SIZE) * GRID_SIZE;

    const getVertices = (centerX, centerY) => {
        const V = [];
        const startAngle = Math.PI / 6;
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

    const { foundSpot, startX, startY } = findEmptySpotForShape(
        viewCenter,
        shapeWidth,
        shapeHeight,
        (sx, sy) => getVertices(sx + R, sy + shapeHeight / 2).map(v => ({
            x: Math.round(v.x / GRID_SIZE) * GRID_SIZE,
            y: Math.round(v.y / GRID_SIZE) * GRID_SIZE
        }))
    );

    if (!foundSpot) { showToast('No Empty Space', `Could not find an empty space for the hexagon.`, 'warning'); return; }

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

function handleAddTriangle() {
    const ledsPerSide = parseInt(document.getElementById('triangle-leds-per-side').value) || 5;

    if (ledsPerSide <= 1) { showToast('Invalid Input', 'LEDs per Side must be > 1.', 'danger'); return; }
    if (!canvas || !viewTransform) { showToast('Error', 'Canvas not ready.', 'danger'); return; }

    const viewCenter = { x: (canvas.width / 2 - viewTransform.panX) / viewTransform.zoom, y: (canvas.height / 2 - viewTransform.panY) / viewTransform.zoom };
    const numSegments = ledsPerSide - 1;
    const s = numSegments * GRID_SIZE;
    const h = s * 0.866025;
    const shapeWidth = s;
    const shapeHeight = Math.round(h / GRID_SIZE) * GRID_SIZE;
    const finalCenterX = Math.round(viewCenter.x / GRID_SIZE) * GRID_SIZE;
    const finalCenterY = Math.round(viewCenter.y / GRID_SIZE) * GRID_SIZE;

    const getVertices = (sx, sy) => [
        { x: sx, y: sy + shapeHeight },         // V1: Bottom-Left
        { x: sx + shapeWidth, y: sy + shapeHeight }, // V2: Bottom-Right
        { x: sx + shapeWidth / 2, y: sy }            // V3: Top
    ];

    const { foundSpot, startX, startY } = findEmptySpotForShape(
        viewCenter,
        shapeWidth,
        shapeHeight,
        (sx, sy) => getVertices(sx, sy).map(v => ({
            x: Math.round(v.x / GRID_SIZE) * GRID_SIZE,
            y: Math.round(v.y / GRID_SIZE) * GRID_SIZE
        }))
    );

    if (!foundSpot) { showToast('No Empty Space', `Could not find an empty space for the triangle.`, 'warning'); return; }

    const finalVertices = getVertices(startX, startY);
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
            const x = led.x - center.centerX;
            const y = led.y - center.centerY;
            let xPrime, yPrime;
            if (angleDeg === 90) {
                xPrime = -y; yPrime = x;
            } else {
                xPrime = y; yPrime = -x;
            }
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
            const x = led.x - center.centerX;
            const y = led.y - center.centerY;
            const xPrime = x * factor;
            const yPrime = y * factor;
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

/**
 * Loads components from Firestore with pagination and server-side filtering.
 * @param {boolean} reset - If true, clears the list and starts from the beginning.
 */
async function loadUserComponents(reset = false) {
    if (isGalleryLoading) return; // Don't load if already loading
    isGalleryLoading = true;

    if (!galleryComponentList) {
        console.error("Gallery list element not found.");
        isGalleryLoading = false;
        return;
    }

    const user = auth.currentUser; // For delete button logic

    // --- 1. Show appropriate loading UI ---
    if (galleryLoadingSpinner) galleryLoadingSpinner.style.display = 'block';
    // if (galleryLoadMoreBtn) galleryLoadMoreBtn.style.display = 'none'; // <-- REMOVED

    if (reset) {
        galleryComponentList.innerHTML = '';
        lastVisibleComponent = null;
        allComponentsLoaded = false; // <-- ADDED
        // Re-populate filters only on a full reset
        await populateGalleryFilters();
    }

    try {
        // --- 2. Build the Firebase Query ---
        const componentsCollection = collection(db, 'srgb-components');
        const queryConstraints = [
            orderBy('lastUpdated', 'desc'),
            limit(GALLERY_PAGE_SIZE)
        ];

        // --- 3. Get Filter Values ---
        // --- MODIFIED: Use toLowerCase() for client-side search ---
        const searchTerm = gallerySearchInput ? gallerySearchInput.value.toLowerCase() : '';
        const filterType = galleryFilterType ? galleryFilterType.value : 'all';
        const filterBrand = galleryFilterBrand ? galleryFilterBrand.value : 'all';
        const filterLeds = galleryFilterLeds ? galleryFilterLeds.value : 'all';

        // --- 4. Add Server-Side Constraints (Equality and ONE Range) ---

        // Equality filters (always OK)
        if (filterType !== 'all') {
            queryConstraints.push(where('type', '==', filterType));
        }
        if (filterBrand !== 'all') {
            queryConstraints.push(where('brand', '==', filterBrand));
        }

        // --- MODIFIED: We will ONLY apply the ledCount range filter on the server ---
        if (filterLeds !== 'all') {
            // Convert the value from the dropdown (which is a string) to a number
            const ledCount = parseInt(filterLeds, 10);
            if (!isNaN(ledCount)) {
                // Use an equality (==) filter
                queryConstraints.push(where('ledCount', '==', ledCount));
            }
        }
        // --- We NO LONGER add the 'name' filter to the server query ---

        // --- 5. Add Pagination Constraint ---
        if (lastVisibleComponent) {
            queryConstraints.push(startAfter(lastVisibleComponent));
        }

        // --- 6. Execute the Query ---
        const q = query(componentsCollection, ...queryConstraints);
        const querySnapshot = await getDocs(q);

        // --- 7. NEW: Apply Client-Side Name Filtering ---
        let finalDocs = querySnapshot.docs; // Get all docs from the server
        if (searchTerm) {
            // Filter this page's results in the browser
            finalDocs = finalDocs.filter(doc => {
                const componentName = (doc.data().name || 'untitled').toLowerCase();
                return componentName.includes(searchTerm);
            });
        }

        // --- 8. Handle "No Results" ---
        if (reset && finalDocs.length === 0) {
            if (querySnapshot.empty) {
                // Server found nothing
                galleryComponentList.innerHTML = '<div class="alert alert-secondary">No components match your filters.</div>';
            } else {
                // Server found things, but client search filtered them all
                galleryComponentList.innerHTML = '<div class="alert alert-secondary">No components on this page match your search term.</div>';
            }
        }

        // --- 9. Render Component Cards (using finalDocs) ---
        finalDocs.forEach((docSnap) => {
            const componentData = docSnap.data();
            const componentId = docSnap.id;

            const card = document.createElement('div');
            card.className = 'card bg-body-secondary mb-3';

            const ledCount = Array.isArray(componentData.leds) ? componentData.leds.length : 0;
            const lastUpdated = componentData.lastUpdated?.toDate()?.toLocaleDateString() ?? 'Unknown date';
            const ownerName = componentData.ownerName || 'Anonymous';
            const componentName = componentData.name || 'Untitled';
            const imageUrl = componentData.imageUrl;
            const ownerId = componentData.ownerId;

            let imageHtml = `
                <div class="col-md-4 d-flex align-items-center justify-content-center gallery-image-container" 
                     data-component-id="${componentId}-img"
                     style="background-color: #212529; min-height: 170px; color: #6c757d;">
                    <svg viewBox="0 0 32 32" fill="currentColor" width="64" height="64">
                        <circle cx="26" cy="16" r="3" /> <circle cx="23" cy="23" r="3" /> <circle cx="16" cy="26" r="3" />
                        <circle cx="9" cy="23" r="3" /> <circle cx="6" cy="16" r="3" /> <circle cx="9" cy="9" r="3" />
                        <circle cx="16" cy="6" r="3" /> <circle cx="23" cy="9" r="3" />
                    </svg>
                </div>`;

            if (imageUrl) {
                imageHtml = `
                    <div class="col-md-4 d-flex align-items-center justify-content-center gallery-image-container" 
                         data-component-id="${componentId}-img"
                         style="background-color: #212529; padding: 0.5rem;">
                        <img src="${imageUrl}" class="img-fluid rounded" alt="${componentName} preview" 
                             style="max-height: 170px; object-fit: contain;">
                    </div>`;
            }

            const bodyHtml = `
                <div class="col-md-8">
                    <div class="card-body d-flex flex-column h-100">
                        <h5 class="card-title">${componentName}</h5>
                        <small class="card-subtitle text-muted mb-2"> By: ${ownerName} on ${lastUpdated} </small>
                        <div class="mb-3">
                            <span class="badge bg-primary">${componentData.brand || 'N/A'}</span>
                            <span class="badge bg-info text-dark">${componentData.type || 'N/A'}</span>
                            <span class="badge bg-secondary">${ledCount} LEDs</span>
                        </div>
                        <div class="flex-grow-1"></div>
                        <div class="d-flex justify-content-between">
                            <button class="btn btn-primary btn-sm" data-component-id="${componentId}-load"> <i class="bi bi-folder2-open me-1"></i> Load </button>
                            <button class="btn btn-danger btn-sm" data-component-id="${componentId}-delete"> <i class="bi bi-trash me-1"></i> Delete </button>
                        </div>
                    </div>
                </div>`;

            card.innerHTML = `<div class="row g-0">${imageHtml}${bodyHtml}</div>`;
            galleryComponentList.appendChild(card);

            // --- Attach Listeners ---
            const doLoadComponent = () => {
                if (!checkDirtyState()) return;
                componentData.dbId = componentId;
                if (loadComponentState(componentData)) {
                    currentComponentId = componentId;
                    if (galleryOffcanvas) galleryOffcanvas.hide();
                    showToast('Component Loaded', `Loaded "${componentData.name || 'Untitled'}".`, 'success');
                    isDirty = false;
                }
            };

            card.querySelector(`[data-component-id="${componentId}-load"]`)?.addEventListener('click', doLoadComponent);
            card.querySelector(`[data-component-id="${componentId}-img"]`)?.addEventListener('click', doLoadComponent);

            const deleteButton = card.querySelector(`[data-component-id="${componentId}-delete"]`);
            if (deleteButton) {
                if (user && (user.uid === ownerId || user.uid === ADMIN_UID)) {
                    deleteButton.addEventListener('click', (e) => {
                        handleDeleteComponent(e, componentId, componentName, imageUrl, ownerId);
                    });
                } else {
                    deleteButton.remove();
                }
            }
        });

        // --- 10. Update Pagination State ---
        if (galleryLoadingSpinner) galleryLoadingSpinner.style.display = 'none';

        // --- MODIFIED: Pagination is based on the original server query ---
        if (querySnapshot.docs.length > 0) {
            lastVisibleComponent = querySnapshot.docs[querySnapshot.docs.length - 1];
        }

        // --- MODIFIED: Set flag for lazy loading ---
        // Check if we've reached the end of the components
        if (querySnapshot.size < GALLERY_PAGE_SIZE) {
            allComponentsLoaded = true;
            console.log("All components loaded.");
        }

    } catch (error) {
        console.error("Error loading user components:", error);
        galleryComponentList.innerHTML = '<div class="alert alert-danger">Error loading components. See console for details.</div>';
        showToast('Load Error', 'Could not fetch components.', 'danger');

        if (galleryLoadingSpinner) galleryLoadingSpinner.style.display = 'none';

        // --- THIS IS THE FIREBASE INDEX WARNING ---
        if (error.code === 'failed-precondition') {
            const indexErrorMsg = `This query requires a composite index. Click the link in the console error message (it looks like: ${error.message.substring(error.message.indexOf('https://'))}) to create it in Firebase, then wait a few minutes.`;
            galleryComponentList.innerHTML = `<div class="alert alert-warning">${indexErrorMsg}</div>`;
        }
    } finally {
        isGalleryLoading = false;
    }
}

/**
 * Populates all 3 filter dropdowns by fetching the metadata document from Firestore.
 * If the document doesn't exist, it performs a one-time scan of all components
 * to build and save the filter list for future use.
 */
async function populateGalleryFilters() {
    // Check for all 3 dropdowns
    if (!galleryFilterType || !galleryFilterBrand || !galleryFilterLeds) return;

    // --- 1. Preserve current user selection ---
    const currentType = galleryFilterType.value;
    const currentBrand = galleryFilterBrand.value;
    const currentLeds = galleryFilterLeds.value;

    // --- 2. Clear dropdowns (except for the 'All' option) ---
    galleryFilterType.innerHTML = '<option value="all" selected>All Types</option>';
    galleryFilterBrand.innerHTML = '<option value="all" selected>All Brands</option>';
    galleryFilterLeds.innerHTML = '<option value="all" selected>All Counts</option>';

    try {
        const filterDocRef = doc(db, "srgb-components-metadata", "filters");
        const docSnap = await getDoc(filterDocRef);

        let typesToUse = [];
        let brandsToUse = [];
        let ledCountsToUse = []; // <-- ADDED

        // --- 3. FAST PATH: Try to use the existing filters doc ---
        // --- MODIFIED: Simplified this 'if' to be more robust ---
        if (docSnap.exists() && docSnap.data()) {
            console.log("Populating filters from fast-load metadata doc.");
            const data = docSnap.data();
            if (data.allTypes) typesToUse = data.allTypes;
            if (data.allBrands) brandsToUse = data.allBrands;
            if (data.allLedCounts) ledCountsToUse = data.allLedCounts; // <-- This was the missing part of the "fast" logic

        } else {
            // --- 4. SLOW PATH: One-time scan to build the filters doc ---
            console.warn("Filters doc empty or missing. Performing one-time scan...");
            showToast("Gallery Init", "Building filter list for the first time...", "info");

            const allTypes = new Set();
            const allBrands = new Set();
            const allLedCounts = new Set();

            const componentsCollection = collection(db, 'srgb-components');
            const scanQuery = query(componentsCollection); // Query for *all* docs
            const querySnapshot = await getDocs(scanQuery);

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                if (data.type) allTypes.add(data.type);
                if (data.brand) allBrands.add(data.brand);

                // --- MODIFIED: Robust LED count check ---
                // Try to get the pre-calculated count
                let count = data.ledCount;
                // If it's missing (old component), calculate it from the leds array
                if (typeof count !== 'number' && Array.isArray(data.leds)) {
                    count = data.leds.length;
                }
                // If we have a valid count, add it
                if (typeof count === 'number' && count > 0) {
                    allLedCounts.add(count);
                }
                // --- END MODIFIED ---
            });

            typesToUse = Array.from(allTypes);
            brandsToUse = Array.from(allBrands);
            ledCountsToUse = Array.from(allLedCounts);

            // --- 5. Save the results back to the doc for next time ---
            if (typesToUse.length > 0 || brandsToUse.length > 0 || ledCountsToUse.length > 0) {
                await setDoc(filterDocRef, {
                    allTypes: typesToUse,
                    allBrands: brandsToUse,
                    allLedCounts: ledCountsToUse
                }, { merge: true }); // Use merge to be safe
                console.log("One-time scan complete. Saved results to metadata doc.");
            }
        }

        // --- 6. Populate Dropdowns ---
        typesToUse.sort().forEach(type => {
            galleryFilterType.innerHTML += `<option value="${type}">${type}</option>`;
        });
        brandsToUse.sort().forEach(brand => {
            galleryFilterBrand.innerHTML += `<option value="${brand}">${brand}</option>`;
        });

        // --- 7. NEW: Populate LED Dropdown with exact counts ---
        // Sort the numbers numerically (e.g., 8, 12, 64, 120)
        ledCountsToUse.sort((a, b) => a - b).forEach(count => {
            galleryFilterLeds.innerHTML += `<option value="${count}">${count} LEDs</option>`;
        });
        // --- END NEW LED LOGIC ---


    } catch (error) {
        console.error("Error fetching gallery filters:", error);
        showToast("Filter Error", "Could not load filter options.", "danger");
    }

    // --- 8. Restore user selection ---
    galleryFilterType.value = currentType;
    galleryFilterBrand.value = currentBrand;
    galleryFilterLeds.value = currentLeds;
}

async function handleDeleteComponent(e, docId, componentName, imageUrl, ownerId) {
    const user = auth.currentUser;
    if (!user) return; // Should not happen if button is visible

    // Confirm with the user
    if (!confirm(`Are you sure you want to delete "${componentName || 'Untitled'}"? This cannot be undone.`)) {
        return;
    }

    showToast('Deleting...', `Deleting ${componentName}...`, 'info');

    try {
        // --- (Storage deletion logic is the same) ---
        if (imageUrl && (imageUrl.startsWith('gs://') || imageUrl.startsWith('https://firebasestorage.googleapis.com'))) {
            try {
                const imageRef = ref(storage, imageUrl); // Get ref from URL
                await deleteObject(imageRef);
                console.log("Deleted component image from Storage.");
            } catch (storageError) {
                console.warn("Could not delete component image from Storage:", storageError.code);
            }
        }

        // 1. Delete the Firestore document
        const docRef = doc(db, 'srgb-components', docId);
        await deleteDoc(docRef);

        showToast('Success', `Successfully deleted "${componentName}".`, 'success');

        // 3. --- MODIFIED: Remove the card from the UI directly ---
        if (e && e.target) {
            // e.target is the button. Find the closest parent '.card' and remove it.
            const cardToRemove = e.target.closest('.card');
            if (cardToRemove) {
                cardToRemove.remove();
            }
        } else {
            // Fallback just in case, to refresh the whole list
            loadUserComponents(true);
        }

    } catch (error) {
        console.error("Error deleting component:", error);
        showToast('Error', `Failed to delete component: ${error.message}`, 'danger');
    }
}

/**
 * Triggers loading the next page when the user scrolls near the bottom.
 */
function handleGalleryScroll() {
    // Stop if we're already loading or if all components are loaded
    if (isGalleryLoading || allComponentsLoaded) return;

    const list = galleryComponentList;

    // Check if user is ~200px from the bottom
    if (list.scrollTop + list.clientHeight >= list.scrollHeight - 200) {
        console.log("Lazy load triggered...");
        loadUserComponents(false); // false = append next page
    }
}

function setupGalleryListener() {
    if (galleryOffcanvasElement) {
        galleryOffcanvas = new bootstrap.Offcanvas(galleryOffcanvasElement);
        // Load (or reload) components when the offcanvas is shown
        galleryOffcanvasElement.addEventListener('show.bs.offcanvas', () => {
            loadUserComponents(true); // true = reset/reload
        });
    } else {
        console.error("Gallery offcanvas element (#gallery-offcanvas) not found.");
    }

    // Add listeners for the filter controls
    if (gallerySearchInput) {
        gallerySearchInput.addEventListener('change', () => loadUserComponents(true));
    }
    if (galleryFilterType) {
        galleryFilterType.addEventListener('change', () => loadUserComponents(true));
    }
    if (galleryFilterBrand) {
        galleryFilterBrand.addEventListener('change', () => loadUserComponents(true));
    }
    if (galleryFilterLeds) {
        galleryFilterLeds.addEventListener('change', () => loadUserComponents(true));
    }

    // --- NEW: Add scroll listener for lazy loading ---
    if (galleryComponentList) {
        galleryComponentList.addEventListener('scroll', handleGalleryScroll);
    }
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
 *img.src = event.target.result;
                }
                reader.onerror = () => {
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

    setupThemeSwitcher(drawCanvas);
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

