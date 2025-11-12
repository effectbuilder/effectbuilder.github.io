// --- IMPORT ---
import { initializeTooltips, showToast, setupThemeSwitcher } from './util.js';
import {
    auth, db, storage, ref, uploadString, getDownloadURL, deleteObject, deleteDoc,
    GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
    doc, setDoc, addDoc, collection, serverTimestamp, updateDoc,
    query, where, getDocs, orderBy, limit, startAfter, getDoc, FieldValue, arrayUnion
} from './firebase.js';
import { setupCanvas, drawCanvas, zoomAtPoint, resetView, toggleGrid, clearPendingConnection, updateLedCount, setImageGuideSrc } from './canvas.js';

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

// --- NEW IMAGE GUIDE STATE ---
let imageGuideState = {
    // Current position and scale relative to canvas (before viewTransform)
    x: 0, y: 0, scale: 1, rotation: 0,
    // Whether the guide image can be moved/scaled/rotated
    isLocked: true,
    // Whether the guide image is currently visible on the canvas
    isVisible: true
};
// --- END NEW IMAGE GUIDE STATE ---

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
const addTriangleBtn = document.getElementById('add-triangle-btn');
const confirmAddTriangleBtn = document.getElementById('confirm-add-triangle-empty-btn');

const rotateSelectedBtn = document.getElementById('rotate-selected-btn');

const scaleSelectedBtn = document.getElementById('scale-selected-btn');
const confirmScaleBtn = document.getElementById('confirm-scale-btn');
const scaleFactorInput = document.getElementById('scale-factor-input');
let scaleModal = null;

const imageUploadInput = document.getElementById('image-upload-input');
const toolImageBtn = document.getElementById('tool-image-btn');
const toggleImageLockBtn = document.getElementById('toggle-image-lock-btn');
const toggleImageVisibleBtn = document.getElementById('toggle-image-visible-btn');
const imageUploadTriggerBtn = document.getElementById('image-upload-trigger-btn');
const clearImageGuideBtn = document.getElementById('clear-image-guide-btn');

let shareModal = null;
const copyShareUrlBtn = document.getElementById('copy-share-url-btn');
const shareUrlInput = document.getElementById('share-url-input');

let exportModal = null;

const MAX_GUIDE_IMAGE_DIMENSION = 1500; // Max pixels for longest side

// ---
// --- ALL FUNCTION DEFINITIONS ---
// ---

/**
 * Loads a specific component from Firestore based on a URL parameter.
 * This is called on initial page load if an 'id' is found.
 * @param {string} componentId - The document ID from Firebase.
 */
async function loadComponentFromUrl(componentId) {
    showToast('Loading Share', 'Loading component from URL...', 'info');
    try {
        const docRef = doc(db, 'srgb-components', componentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const componentData = docSnap.data();
            componentData.dbId = docSnap.id; // Add the dbId to the state

            if (loadComponentState(componentData)) {
                currentComponentId = docSnap.id;
                showToast('Load Successful', `Loaded shared component: ${componentData.name}`, 'success');
                isDirty = false;
                clearAutoSave(); // Clear any local autosave to not overwrite the loaded one

                // Enable share button so the user can re-share this link
                document.getElementById('share-component-btn').disabled = false;
            } else {
                throw new Error("Failed to parse component data.");
            }
        } else {
            showToast('Load Error', 'Component ID from URL was not found.', 'danger');
            handleNewComponent(false); // Fall back to normal load
        }
    } catch (error) {
        console.error("Error loading component from URL:", error);
        showToast('Load Error', `Could not load shared component: ${error.message}`, 'danger');
        handleNewComponent(false); // Fall back to normal load
    } finally {
        // Clean the URL (remove the ?id=...) so a refresh doesn't trigger another load
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

/**
 * Generates the share link and shows the share modal.
 */
function handleShareComponent() {
    if (!currentComponentId) {
        showToast('Share Error', 'Please save the component to the cloud first.', 'warning');
        return;
    }

    // Get the base URL (e.g., "https://user.github.io/MyRepo/index.html")
    const baseUrl = window.location.origin + window.location.pathname;
    const shareUrl = `${baseUrl}?id=${currentComponentId}`;

    const shareUrlInput = document.getElementById('share-url-input');
    if (shareUrlInput) {
        shareUrlInput.value = shareUrl;
    }

    if (shareModal) {
        shareModal.show();
        // Automatically select the text for easy copying
        if (shareUrlInput) {
            shareUrlInput.select();
        }
    }
}

/**
 * Copies the share URL to the clipboard.
 */
function handleCopyShareUrl() {
    const shareUrlInput = document.getElementById('share-url-input');
    if (!shareUrlInput) return;

    try {
        navigator.clipboard.writeText(shareUrlInput.value).then(() => {
            showToast('Copied!', 'Share link copied to clipboard.', 'success');
            if (shareModal) {
                shareModal.hide();
            }
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            showToast('Copy Error', 'Could not copy link. Please copy it manually.', 'danger');
        });
    } catch (err) {
        console.error('Clipboard API error: ', err);
        showToast('Copy Error', 'Could not copy link. Please copy it manually.', 'danger');
    }
}

function handleClearImageGuide() {
    if (!componentState.guideImageUrl) {
        showToast('Info', 'No image guide is currently loaded.', 'info');
        return;
    }

    if (!confirm("Are you sure you want to remove the image guide?")) {
        return;
    }

    // 1. Clear the image data in component state
    componentState.guideImageUrl = null;
    componentState.guideImageWidth = 500;
    componentState.guideImageHeight = 300;

    // 2. Reset the image guide's transformation state
    imageGuideState.x = 0;
    imageGuideState.y = 0;
    imageGuideState.scale = 1;
    imageGuideState.rotation = 0;
    imageGuideState.isLocked = true;
    imageGuideState.isVisible = true;

    // 3. Inform the canvas object to clear its source
    if (window.setImageGuideSrc) {
        window.setImageGuideSrc(null);
    }

    // 4. Update UI, Redraw, and Save
    updateImageGuideUI();
    window.drawCanvas();
    autoSaveState(); // Persist the cleared state to localStorage
    showToast('Image Guide', 'The image guide has been removed.', 'success');
}

// --- Local Storage Functions ---
function autoSaveState() {
    isDirty = true;
    console.log('Attempting to autosave state...');
    if (componentState && Array.isArray(componentState.leds) && Array.isArray(componentState.wiring)) {
        try {
            // Create a temporary object for saving to local storage
            const stateToSave = {
                ...componentState,
                // --- EXCLUDE LARGE DEVICE IMAGE (componentState.imageUrl) ---
                imageUrl: null,
                // --- INCLUDE RESIZED GUIDE IMAGE (componentState.guideImageUrl) ---
                guideImageUrl: componentState.guideImageUrl || null,
                // --- Re-include Guide State Metadata (which is small) ---
                imageGuideX: imageGuideState.x,
                imageGuideY: imageGuideState.y,
                imageGuideScale: imageGuideState.scale,
                imageGuideRotation: imageGuideState.rotation,
                imageGuideIsLocked: imageGuideState.isLocked,
                imageGuideIsVisible: imageGuideState.isVisible,
                // --- END MODIFICATION ---
            };

            const stateString = JSON.stringify(stateToSave);
            localStorage.setItem(AUTOSAVE_KEY, stateString);
            console.log('Autosave successful. Saved LEDs:', componentState.leds.length, 'Circuits:', componentState.wiring.length);
        } catch (e) {
            console.error('Error stringifying componentState for autosave:', e);
            if (e.name === 'QuotaExceededError') {
                // Even after resizing, if quota is low, show a warning but continue.
                showToast('Autosave Failed', 'Storage quota exceeded. Image may be lost on refresh.', 'danger');
            }
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
// --- NEW HELPER FUNCTION: loadComponentState (MODIFIED) ---
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

    // --- Load imageGuideState from stateToLoad or use defaults ---
    imageGuideState.x = stateToLoad.imageGuideX ?? 0;
    imageGuideState.y = stateToLoad.imageGuideY ?? 0;
    imageGuideState.scale = stateToLoad.imageGuideScale ?? 1;
    imageGuideState.rotation = stateToLoad.imageGuideRotation ?? 0;
    imageGuideState.isLocked = stateToLoad.imageGuideIsLocked ?? true;
    imageGuideState.isVisible = stateToLoad.imageGuideIsVisible ?? true;

    // --- VALIDATE AND FIX WIRING ---
    componentState.leds = componentState.leds || [];
    let loadedWiring = componentState.wiring || [];
    let appWiring = [];

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

    componentState.guideImageUrl = stateToLoad.guideImageUrl || null;
    if (componentState.guideImageUrl) {
        // Use a slight deferral (setTimeout) to ensure all canvas modules are registered globally
        // before attempting to set the image source.
        setTimeout(() => {
            if (window.setImageGuideSrc) {
                // This re-sends the saved URL to the canvas Image object, triggering its reload.
                window.setImageGuideSrc(componentState.guideImageUrl);
            } else {
                console.warn("Deferred image load failed: window.setImageGuideSrc not yet defined.");
            }
        }, 50); // 50ms delay
    }

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

    // --- Update the Image Guide UI on load ---
    updateImageGuideUI();

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
    exportBtn.addEventListener('click', showExportModal);

    shareModal = new bootstrap.Modal(document.getElementById('share-modal'));
    const copyShareUrlBtn = document.getElementById('copy-share-url-btn');

    if (shareBtn) {
        shareBtn.addEventListener('click', handleShareComponent);
    } else {
        console.warn("Share button not found.");
    }
    if (copyShareUrlBtn) {
        copyShareUrlBtn.addEventListener('click', handleCopyShareUrl);
    } else {
        console.warn("Copy Share URL button not found.");
    }

    // --- Init Export Modal and Listeners ---
    const exportModalElement = document.getElementById('export-component-modal');
    if (exportModalElement) {
        exportModal = new bootstrap.Modal(exportModalElement);
        // Add listeners to update preview when format changes
        document.getElementById('export-format-srgb').addEventListener('change', updateExportPreview);
        document.getElementById('export-format-wled').addEventListener('change', updateExportPreview);
        
        // --- THIS IS THE FIX ---
        document.getElementById('export-format-nolliergb').addEventListener('change', updateExportPreview);
        // --- END OF FIX ---

        // Add listener to generate preview when modal is about to show
        exportModalElement.addEventListener('show.bs.modal', updateExportPreview);
    } else {
        console.error("Export modal element not found!");
    }

    // --- Add guard to import ---
    if (importJsonBtn && importFileInput) {
        importJsonBtn.addEventListener('click', () => {
            if (!checkDirtyState()) return;
            importFileInput.click();
        });
        importFileInput.addEventListener('change', handleImportJson);
    } else {
        console.warn("Import JSON buttons not found.");
    }
}

// Added image guide default properties
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
        // --- Guide Image Properties ---
        guideImageUrl: null,
        guideImageWidth: 500,
        guideImageHeight: 300
    };
}

function handleNewComponent(showNotification = true) {
    // Check if the current canvas work is dirty and requires a confirmation dialog
    if (!checkDirtyState()) return;

    let stateToLoad = createDefaultComponentState();
    console.log('handleNewComponent called. showNotification:', showNotification);

    // Preserve Image Guide URL and Dimensions
    // Extract the guide image details from the current component state before checking autosave or resetting to defaults.
    let preservedGuideUrl = componentState.guideImageUrl;
    let preservedGuideWidth = componentState.guideImageWidth;
    let preservedGuideHeight = componentState.guideImageHeight;

    if (!showNotification) {
        const savedState = localStorage.getItem(AUTOSAVE_KEY);
        console.log('Checking localStorage...');
        if (savedState) {
            try {
                const parsedState = JSON.parse(savedState);
                if (parsedState && typeof parsedState === 'object' && Array.isArray(parsedState.leds)) {
                    if (loadComponentState(parsedState)) {
                        showToast('Welcome Back!', 'Your unsaved work has been restored.', 'info');
                        isDirty = true;
                        return; // Successfully restored and exited
                    }
                }
            } catch (e) {
                console.error("Failed to parse autosave data:", e);
                clearAutoSave();
            }
        } else {
            console.log('No autosave data found in localStorage.');
        }
    }

    // --- Standard "New" click or failed autosave fallback path ---
    clearAutoSave();

    // If the image was preserved from the previous session's memory, inject it back
    // into the default state that is about to be loaded.
    if (preservedGuideUrl) {
        stateToLoad.guideImageUrl = preservedGuideUrl;
        stateToLoad.guideImageWidth = preservedGuideWidth;
        stateToLoad.guideImageHeight = preservedGuideHeight;
    }

    loadComponentState(stateToLoad); // Will load the default state but keep the image guide URL/dims

    isDirty = false;
    if (showNotification) {
        showToast('New Project', 'Cleared the canvas and properties.', 'info');
    }
}

/**
 * NEW: Generates the JSON for WLED
 * @param {string} productName 
 * @param {Array} currentLeds 
 * @param {Array} currentWiring 
 * @param {number} minX 
 * @param {number} minY 
 * @param {number} width 
 * @param {number} height 
 * @returns {string} A pretty-printed JSON string for WLED
 */
function generateWLEDJson(productName, currentLeds, currentWiring, minX, minY, width, height) {
    const map = new Array(width * height).fill(-1);

    // Create a map of LED ID -> Wiring Index
    // This ensures LEDs are numbered strictly by their order in the wiring array
    const flatWiring = currentWiring.flat().filter(id => id != null);
    const ledIdToWiringIndex = new Map();
    let wiringIndexCounter = 0;
    flatWiring.forEach((id) => {
        if (!ledIdToWiringIndex.has(id)) {
            ledIdToWiringIndex.set(id, wiringIndexCounter++);
        }
    });

    let collisionDetected = false;

    // Place each LED into the 2D map using its wiring index
    for (const led of currentLeds) {
        if (!led) continue;

        const wiringIndex = ledIdToWiringIndex.get(led.id);
        // Skip if this LED wasn't in the final flat wiring list (shouldn't happen if validated)
        if (wiringIndex === undefined) continue;

        // Calculate grid coordinates (0-indexed from top-left)
        const x = Math.round((led.x - minX) / GRID_SIZE);
        const y = Math.round((led.y - minY) / GRID_SIZE);

        //Ensure it's within bounds
        if (x < 0 || x >= width || y < 0 || y >= height) continue;

        const mapIndex = y * width + x;

        // Check for collisions (two LEDs in one grid spot)
        if (map[mapIndex] !== -1) {
            collisionDetected = true;
            console.warn(`WLED Export Collision: LED (ID: ${led.id}) at [${x},${y}] is overwriting another LED.`);
        }

        map[mapIndex] = wiringIndex;
    }

    if (collisionDetected) {
        showToast('WLED Export Warning', 'Multiple LEDs occupy the same grid cell. Only the last LED in the wire was mapped.', 'warning');
    }

    // --- MODIFIED: Custom JSON Stringification for WLED Preview ---

    // 1. Stringify the simple parts (compactly)
    let jsonString = `{"n":${JSON.stringify(productName)},"width":${width},"height":${height},"map":[\n`;

    // 2. Build the 'map' array string with newlines for each row
    const mapRows = [];
    for (let y = 0; y < height; y++) {
        // Get the slice for the current row
        const row = map.slice(y * width, (y + 1) * width);
        // Join elements with a comma, add a comma at the end if it's not the last row
        const rowString = `${row.join(',')}${y < height - 1 ? ',' : ''}`;
        mapRows.push(rowString);
    }

    jsonString += mapRows.join('\n');

    // 3. Close the JSON
    jsonString += '\n]}';

    return jsonString;
}

/**
 * NEW: Generates the JSON for NollieRGB
 * @param {number} ledCount
 * @returns {string} A pretty-printed JSON string for NollieRGB
 */
function generateNollieRGBJson(ledCount) {
    const led_index = [];
    for (let i = 0; i < ledCount; i++) {
        led_index.push(i + 1); // 1-based indexing
    }

    const exportObject = {
        version: 1,
        led_size: ledCount,
        re_led_size: ledCount,
        led_index: led_index
    };

    return JSON.stringify(exportObject, null, 2);
}


/**f

/**
 * NEW: Generates the JSON for SignalRGB
 * @param {string} productName 
 * @param {string} displayName 
 * @param {string} brand 
 * @param {string} currentType 
 * @param {number} ledCount 
 * @param {number} width 
 * @param {number} height 
 * @param {Array} ledCoordinates 
 * @param {string} base64ImageData 
 * @returns {string} A pretty-printed JSON string for SignalRGB
 */
function generateSignalRGBJson(productName, displayName, brand, currentType, ledCount, width, height, ledCoordinates, base64ImageData) {
    const ledMapping = Array.from({ length: ledCount }, (_, i) => i);

    const exportObject = {
        ProductName: productName,
        DisplayName: displayName,
        Brand: brand,
        Type: currentType,
        LedCount: ledCount,
        Width: width,
        Height: height,
        LedMapping: ledMapping,
        LedCoordinates: ledCoordinates,
        LedNames: Array.from({ length: ledCount }, (_, i) => `Led${i + 1}`),
        Image: base64ImageData,
        ImageUrl: "" // Deprecated, but part of the old format
    };

    return JSON.stringify(exportObject, null, 2);
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
                // --- Robust check for image data ---
                // ---
                // Check if data.Image exists and is a non-empty string
                if (data.Image && data.Image.length > 0) {
                    // The app exports images as webp, so we must import them as webp.
                    stateToLoad.imageUrl = `data:image/webp;base64,${data.Image}`;
                } else {
                    stateToLoad.imageUrl = null;
                }

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
                // --- Set dirty flag after successful import ---
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
            // console.log("Save allowed: User is owner or admin.");
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

    const dataToSave = {
        ...componentState,
        wiring: firestoreWiring,
        ledCount: (componentState.leds || []).length,
        ownerId: user.uid,
        ownerName: user.displayName,
        lastUpdated: serverTimestamp(),
        // We are now explicitly saving the device imageUrl (which is base64)
        imageUrl: componentState.imageUrl || null,
        // Save image guide state to Firebase (using the resized image) ---
        guideImageUrl: componentState.guideImageUrl || null, // Stored to Firebase for cloud backup/sharing
        imageGuideX: imageGuideState.x,
        imageGuideY: imageGuideState.y,
        imageGuideScale: imageGuideState.scale,
        imageGuideRotation: imageGuideState.rotation,
        imageGuideIsLocked: imageGuideState.isLocked,
        imageGuideIsVisible: imageGuideState.isVisible,
    };
    delete dataToSave.dbId; // Don't save the local DB ID in the doc

    try {
        let docRef;
        const componentsCollection = collection(db, 'srgb-components');

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

        try {
            const filterDocRef = doc(db, "srgb-components-metadata", "filters");
            const metadataUpdate = {
                allTypes: arrayUnion(dataToSave.type),
                allBrands: arrayUnion(dataToSave.brand),
                allLedCounts: arrayUnion(dataToSave.ledCount)
            };
            // Use setDoc with merge:true to create or update the doc
            // We MUST wait for this to complete to avoid a race condition
            // where the user opens the gallery before the filters are updated.
            await setDoc(filterDocRef, metadataUpdate, { merge: true });
            console.log("Gallery filters metadata updated successfully.");
        } catch (filterError) {
            console.warn("Could not update gallery filters metadata:", filterError);
            // Don't block the user; just log a warning
        }

        showToast('Save Successful', `Saved component: ${componentState.name}`, 'success');
        document.getElementById('share-component-btn').disabled = false;
        clearAutoSave();
        isDirty = false;
    } catch (error) {
        console.error("Error saving component: ", error);
        showToast('Error Saving', error.message, 'danger');
    }
}

/**
 * Renamed from handleExport. This function *only* validates and shows the modal.
 * The actual JSON generation is done by updateExportPreview().
 */
function showExportModal() {
    console.log("showExportModal triggered.");

    if (!componentState || !Array.isArray(componentState.leds)) {
        showToast('Export Error', 'No component data.', 'danger');
        return;
    }

    try {
        const currentLeds = componentState.leds || [];
        const currentWiring = componentState.wiring || [];
        const ledCount = currentLeds.length;

        if (ledCount === 0) {
            showToast('Export Error', 'Cannot export empty component.', 'warning');
            return; // Stop
        }

        // --- CHECK FOR UNWIRED LEDs (BLOCK EXPORT) ---
        const wiredLedIds = new Set();
        if (Array.isArray(currentWiring)) {
            currentWiring.forEach(circuit => {
                if (Array.isArray(circuit)) {
                    circuit.forEach(id => wiredLedIds.add(id));
                }
            });
        }
        const unwiredLedsExist = currentLeds.some(led => led && !wiredLedIds.has(led.id));

        if (unwiredLedsExist) {
            const unwiredCount = currentLeds.filter(led => led && !wiredLedIds.has(led.id)).length;
            showToast(
                'Export Blocked',
                `Cannot export: ${unwiredCount} LED${unwiredCount === 1 ? ' is' : 's are'} unwired. All LEDs must be part of a circuit.`,
                'danger'
            );
            console.error(`Export Blocked: ${unwiredCount} unwired LEDs detected.`);
            return; // Stop
        }

        // --- Validation Passed ---
        // Reset to default format (SignalRGB) every time it's opened
        const srgbRadio = document.getElementById('export-format-srgb');
        if (srgbRadio) srgbRadio.checked = true;

        // Now, show the modal. The 'show.bs.modal' event will trigger updateExportPreview.
        if (exportModal) {
            exportModal.show();
        } else {
            console.error("Export modal instance not found!");
        }

    } catch (error) {
        console.error("Error during showExportModal validation:", error);
        showToast('Export Error', `An unexpected error occurred: ${error.message}`, 'danger');
    }
}

/**
 * NEW: This function is called when the export modal opens or a format is changed.
 * It generates the preview and sets up the download button.
 */
function updateExportPreview() {
    const format = document.querySelector('input[name="export-format"]:checked')?.value || 'srgb';
    const preview = document.getElementById('json-preview');
    const downloadBtn = document.getElementById('confirm-export-json-btn');
    const copyBtn = document.getElementById('copy-export-json-btn'); // <-- Get the new button

    if (!preview || !downloadBtn || !copyBtn) {
        console.error("Export modal preview, download, or copy button not found!");
        return;
    }

    if (!preview || !downloadBtn) {
        console.error("Export modal preview or download button not found!");
        return;
    }
    if (!componentState || !Array.isArray(componentState.leds)) {
        preview.textContent = 'Error: No component data.';
        return;
    }

    try {
        // --- 1. Collect all common data ---
        const productName = compNameInput.value || 'My Custom Component';
        const displayName = compDisplayNameInput.value || productName;
        const brand = compBrandInput.value || 'Custom';
        const currentType = compTypeInput.value || 'Other';
        const currentLeds = componentState.leds || [];
        const currentWiring = componentState.wiring || [];
        const ledCount = currentLeds.length;

        // Check if image is Base64
        const imageDataUrl = (componentState.imageUrl && componentState.imageUrl.startsWith('data:'))
            ? componentState.imageUrl
            : null;

        // Determine offset for normalized 0,0 export coordinates
        let minX = Infinity, minY = Infinity;
        let maxX_world = -Infinity, maxY_world = -Infinity;
        currentLeds.forEach(led => {
            if (led) {
                minX = Math.min(minX, led.x);
                minY = Math.min(minY, led.y);
                maxX_world = Math.max(maxX_world, led.x);
                maxY_world = Math.max(maxY_world, led.y);
            }
        });
        minX = (minX === Infinity) ? 0 : minX;
        minY = (minY === Infinity) ? 0 : minY;

        // Calculate normalized width/height in GRID units
        const maxX_norm = (maxX_world === -Infinity) ? 0 : Math.round((maxX_world - minX) / GRID_SIZE);
        const maxY_norm = (maxY_world === -Infinity) ? 0 : Math.round((maxY_world - minY) / GRID_SIZE);
        const width = maxX_norm + 1;
        const height = maxY_norm + 1;

        // --- 2. Build LedCoordinates array (for SignalRGB) ---
        // This is based strictly on wiring order
        const ledDataMap = new Map();
        currentLeds.forEach(led => {
            if (led) {
                const offsetX = Math.round((led.x - minX) / GRID_SIZE);
                const offsetY = Math.round((led.y - minY) / GRID_SIZE);
                ledDataMap.set(led.id, { x: offsetX, y: offsetY });
            }
        });

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

        // Get Base64 image data
        let base64ImageData = "";
        if (imageDataUrl) {
            const commaIndex = imageDataUrl.indexOf(',');
            if (commaIndex !== -1) { base64ImageData = imageDataUrl.substring(commaIndex + 1); }
        }

        // --- 3. Generate correct JSON and filename based on format ---
        let jsonString = "{}";
        let filename = "component.json";

        if (format === 'srgb') {
            jsonString = generateSignalRGBJson(productName, displayName, brand, currentType, ledCount, width, height, ledCoordinates, base64ImageData);
            filename = (productName || 'component').replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.json';

        } else if (format === 'wled') {
            // WLED format needs all data
            jsonString = generateWLEDJson(productName, currentLeds, currentWiring, minX, minY, width, height);
            filename = (productName || 'wled_matrix').replace(/[^a-z0-9]/gi, '_').toLowerCase() + '_wled.json';
        
        // --- THIS IS THE NEW BLOCK ---
        } else if (format === 'nolliergb') {
            jsonString = generateNollieRGBJson(ledCount);
            filename = (productName || 'nolliergb_profile').replace(/[^a-z0-9]/gi, '_').toLowerCase() + '_nollie.json';
        }
        // --- END OF NEW BLOCK ---

        preview.textContent = jsonString;

        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // Clone and replace download button to remove old listeners
        const newDownloadBtn = downloadBtn.cloneNode(true);
        downloadBtn.parentNode.replaceChild(newDownloadBtn, downloadBtn);

        newDownloadBtn.onclick = () => {
            try {
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                if (exportModal) exportModal.hide();
            } catch (downloadError) {
                console.error("Error triggering download:", downloadError);
                showToast('Download Error', 'Could not trigger file download.', 'danger');
            }
        };

        // --- 5. Add listener for the new Copy button ---
        // Clone and replace copy button as well to remove old listeners
        const newCopyBtn = copyBtn.cloneNode(true);
        copyBtn.parentNode.replaceChild(newCopyBtn, copyBtn);

        newCopyBtn.onclick = () => {
            navigator.clipboard.writeText(jsonString).then(() => {
                showToast('Copied!', 'JSON copied to clipboard.', 'success');
                // Don't close the modal on copy
            }).catch(err => {
                console.error("Error copying JSON to clipboard:", err);
                showToast('Copy Error', 'Could not copy to clipboard.', 'danger');
            });
        };

    } catch (error) {
        console.error("Error during updateExportPreview:", error);
        showToast('Export Error', `An unexpected error occurred: ${error.message}`, 'danger');
        if (preview) preview.textContent = `Error: ${error.message}`;
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

                // console.log(`Device image resized to: ${width}x${height}`);
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

// --- NEW IMAGE GUIDE FUNCTIONS ---

/**
 * Triggers the hidden file input for the image guide.
 */
function handleImageUploadTrigger() {
    imageUploadInput.click();
}

/**
 * Handles the selected image file for the canvas guide.
 * @param {Event} e - The file input change event.
 */
function handleImageGuideFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
        const img = new Image();
        img.onload = () => {
            let width = img.naturalWidth;
            let height = img.naturalHeight;

            // 1. Calculate new dimensions for resizing
            if (width > MAX_GUIDE_IMAGE_DIMENSION || height > MAX_GUIDE_IMAGE_DIMENSION) {
                const ratio = MAX_GUIDE_IMAGE_DIMENSION / Math.max(width, height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
                console.log(`Image Guide resized to: ${width}x${height}`);
            }

            // 2. Draw resized image to canvas
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // 3. Get the new image as a WebP data URL
            const resizedDataUrl = canvas.toDataURL('image/webp', 0.85); // 85% quality

            // 4. Update component state and image guide state
            componentState.guideImageUrl = resizedDataUrl;
            componentState.guideImageWidth = width;
            componentState.guideImageHeight = height;

            // Reset the guide's transform to be centered
            imageGuideState.x = 0;
            imageGuideState.y = 0;
            imageGuideState.scale = 1;
            imageGuideState.rotation = 0;
            imageGuideState.isLocked = false; // Unlock it immediately for positioning
            imageGuideState.isVisible = true;

            // 5. Apply new source and trigger save/redraw
            if (window.setImageGuideSrc) {
                window.setImageGuideSrc(componentState.guideImageUrl);
            } else {
                window.drawCanvas(); // Fallback redraw
            }
            updateImageGuideUI();
            autoSaveState(); // Save the resized image to localStorage
            showToast('Image Guide Loaded', `Image resized to ${width}x${height} and loaded.`, 'success');
        };
        img.onerror = () => {
            showToast('Image Load Error', 'Could not load guide image file.', 'danger');
        };
        img.src = event.target.result;
    };
    reader.onerror = () => {
        showToast('File Read Error', 'Could not read image file for guide.', 'danger');
    };
    reader.readAsDataURL(file);

    // Reset the file input to allow loading the same file again
    e.target.value = null;
}

/**
 * Updates the Image Guide toolbar buttons based on the current state.
 * Needs to be exported/available globally for canvas.js right-click events.
 */
function updateImageGuideUI() {
    if (!imageGuideState || !toggleImageLockBtn || !toggleImageVisibleBtn) return;
    const isImageLoaded = !!componentState.guideImageUrl;

    toggleImageLockBtn.disabled = !isImageLoaded;
    toggleImageVisibleBtn.disabled = !isImageLoaded;

    if (!isImageLoaded) {
        toggleImageLockBtn.innerHTML = '<i class="bi bi-unlock-fill"></i>';
        toggleImageLockBtn.title = 'Unlock Image (L)';
        toggleImageVisibleBtn.innerHTML = '<i class="bi bi-eye-slash-fill"></i>';
        toggleImageVisibleBtn.title = 'Hide Image (H)';
        return;
    }

    // Update Lock Button
    if (imageGuideState.isLocked) {
        toggleImageLockBtn.innerHTML = '<i class="bi bi-lock-fill"></i>';
        toggleImageLockBtn.title = 'Unlock Image (L)';
    } else {
        toggleImageLockBtn.innerHTML = '<i class="bi bi-unlock-fill"></i>';
        toggleImageLockBtn.title = 'Lock Image (L)';
    }

    // Update Visibility Button
    if (imageGuideState.isVisible) {
        toggleImageVisibleBtn.innerHTML = '<i class="bi bi-eye-fill"></i>';
        toggleImageVisibleBtn.title = 'Hide Image (H)';
    } else {
        toggleImageVisibleBtn.innerHTML = '<i class="bi bi-eye-slash-fill"></i>';
        toggleImageVisibleBtn.title = 'Show Image (H)';
    }
}
window.updateImageGuideUI = updateImageGuideUI;

/**
 * Toggles the Image Guide lock state.
 */
function toggleImageLock() {
    if (!componentState.guideImageUrl) return;
    imageGuideState.isLocked = !imageGuideState.isLocked;
    updateImageGuideUI();
    window.setAppCursor(); // Update cursor based on new lock state
    autoSaveState();
    showToast('Image Guide', imageGuideState.isLocked ? 'Image Guide Locked' : 'Image Guide Unlocked', 'info');
}

/**
 * Toggles the Image Guide visibility.
 */
function toggleImageVisibility() {
    if (!componentState.guideImageUrl) return;
    imageGuideState.isVisible = !imageGuideState.isVisible;
    updateImageGuideUI();
    window.drawCanvas(); // Redraw immediately
    autoSaveState();
    showToast('Image Guide', imageGuideState.isVisible ? 'Image Guide Visible' : 'Image Guide Hidden', 'info');
}

// --- END NEW IMAGE GUIDE FUNCTIONS ---

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

    // --- 5. DRAG-AND-DROP LISTENERS ---
    imagePasteZone.addEventListener('dragover', (e) => {
        e.preventDefault(); //Prevents browser from opening file
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
        e.preventDefault(); // Prevents browser from opening file
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

    // // --- ADDED FOR LILI ---
    // addLiLiModal = new bootstrap.Modal(document.getElementById('add-lili-modal'));
    // if (addLiLiBtn && confirmAddLiLiBtn) {
    //     addLiLiBtn.addEventListener('click', () => { addLiLiModal.show(); });
    //     confirmAddLiLiBtn.addEventListener('click', handleAddLiLi);
    // } else { console.warn("Add LiLi modal buttons not found."); }

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

    // --- IMAGE GUIDE TOOL LISTENER ---
    if (toolImageBtn) {
        toolImageBtn.addEventListener('click', () => setTool('image'));
    } else { console.warn("Image Tool button not found."); }

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

    if (clearImageGuideBtn) {
        clearImageGuideBtn.addEventListener('click', handleClearImageGuide);
    } else { console.warn("Clear Image Guide button not found."); }

    // --- IMAGE GUIDE LISTENERS ---
    if (imageUploadTriggerBtn && imageUploadInput) {
        imageUploadTriggerBtn.addEventListener('click', handleImageUploadTrigger);
        imageUploadInput.addEventListener('change', handleImageGuideFile);
    } else { console.warn("Image Upload buttons not found."); }

    if (toggleImageLockBtn) {
        toggleImageLockBtn.addEventListener('click', toggleImageLock);
    } else { console.warn("Image Lock button not found."); }

    if (toggleImageVisibleBtn) {
        toggleImageVisibleBtn.addEventListener('click', toggleImageVisibility);
    } else { console.warn("Image Visibility button not found."); }
    // --- END IMAGE GUIDE LISTENERS ---
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

    // Clear LED selection if not in select/image mode
    if (toolName !== 'select' && toolName !== 'image') selectedLedIds.clear();

    setAppCursor();
    drawCanvas();
}
window.setAppTool = setTool;

// Added 'image' tool cursor logic
function setAppCursor() {
    if (!canvas) return;
    if (currentTool === 'wiring') { canvas.style.cursor = 'crosshair'; }
    else if (currentTool === 'place-led') { canvas.style.cursor = 'crosshair'; }
    // --- Image Tool Cursor ---
    else if (currentTool === 'image') {
        if (!componentState.guideImageUrl || imageGuideState.isLocked || !imageGuideState.isVisible) {
            canvas.style.cursor = 'default';
        } else {
            // Let mousemove handle the specific handle cursor change
            canvas.style.cursor = 'default';
        }
    }
    else { canvas.style.cursor = 'default'; }
}
window.setAppCursor = setAppCursor;

// Added 'image', 'L', and 'H' shortcuts
function setupKeyboardListeners() {
    window.addEventListener('keydown', (e) => {
        if (!componentState || !Array.isArray(componentState.leds) || !Array.isArray(componentState.wiring)) return;

        // This guard is very important! It prevents shortcuts while typing in text fields.
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT' || e.target.isContentEditable) {
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
            case 'i':
            case 'I':
                setTool('image');
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
                    updateLedCount();
                }
                break;

            // --- Image Guide Shortcuts ---
            case 'l':
            case 'L':
                toggleImageLock();
                break;
            case 'h':
            case 'H':
                toggleImageVisibility();
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
    const isSerpentine = document.getElementById('matrix-serpentine').checked;
    // GRID_SIZE is globally defined

    if (cols <= 0 || rows <= 0) { showToast('Invalid Input', 'Columns and Rows must be > 0.', 'danger'); return; }
    if (!canvas || !viewTransform) { showToast('Error', 'Canvas not ready.', 'danger'); return; }

    const viewCenter = { x: (canvas.width / 2 - viewTransform.panX) / viewTransform.zoom, y: (canvas.height / 2 - viewTransform.panY) / viewTransform.zoom };
    const matrixWidth = (cols - 1) * GRID_SIZE;
    const matrixHeight = (rows - 1) * GRID_SIZE;

    // --- Define the position generator function ---
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

    const newLeds = [];
    const newWireIds = [];
    const finalMatrixWidth = (cols - 1) * GRID_SIZE;
    const finalMatrixHeight = (rows - 1) * GRID_SIZE;

    if (wiringDirection === 'horizontal') {
        for (let r = 0; r < rows; r++) {
            const isEvenRow = r % 2 === 0;
            for (let c = 0; c < cols; c++) {
                const colIndex = (isSerpentine && !isEvenRow) ? (cols - 1 - c) : c;
                const x = startX + (colIndex * GRID_SIZE);
                const y = startY + (r * GRID_SIZE);
                const id = `${Date.now()}-h-${r}-${c}`; const newLed = { id, x, y }; newLeds.push(newLed); newWireIds.push(id);
            }
        }
    } else {
        for (let c = 0; c < cols; c++) {
            const isEvenCol = c % 2 === 0;
            for (let r = 0; r < rows; r++) {
                const rowIndex = (isSerpentine && !isEvenCol) ? (rows - 1 - r) : r;
                const x = startX + (c * GRID_SIZE);
                const y = startY + (rowIndex * GRID_SIZE);
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
    // --- FIX 1: Respect the user's radius input ---
    const radiusUnits = parseInt(document.getElementById('circle-radius').value) || 5;

    if (ledCount <= 1) { showToast('Invalid Input', 'LED Count must be greater than 1.', 'danger'); return; }
    if (radiusUnits <= 0) { showToast('Invalid Input', 'Radius must be > 0.', 'danger'); return; }
    if (!canvas || !viewTransform) { showToast('Error', 'Canvas not ready.', 'danger'); return; }

    // --- Use the user's radius ---
    const radiusPx = radiusUnits * GRID_SIZE;

    console.log(`Creating circle: ${ledCount} LEDs, ${radiusUnits} unit radius (${radiusPx}px).`);

    const viewCenter = { x: (canvas.width / 2 - viewTransform.panX) / viewTransform.zoom, y: (canvas.height / 2 - viewTransform.panY) / viewTransform.zoom };

    const shapeWidth = radiusPx * 2;
    const shapeHeight = radiusPx * 2;

    // --- FIX 2: Create a new position generator that returns the *actual LED positions*, not polygon edges ---
    /**
     * Calculates the grid-snapped (x, y) coordinates for each LED on the circle's circumference.
     * @param {number} centerX - The world X coordinate of the circle's center.
     * @param {number} centerY - The world Y coordinate of the circle's center.
     * @returns {Array<object>} - Array of {x, y} grid-snapped coordinates.
     */
    const getCircleLedPositions = (centerX, centerY) => {
        const positions = [];
        for (let i = 0; i < ledCount; i++) {
            // Calculate the angle for this LED
            const angle = (i / ledCount) * 2 * Math.PI;
            // Calculate the precise (x, y)
            const rawX = centerX + radiusPx * Math.cos(angle);
            const rawY = centerY + radiusPx * Math.sin(angle);
            // Snap to the grid
            positions.push({
                x: Math.round(rawX / GRID_SIZE) * GRID_SIZE,
                y: Math.round(rawY / GRID_SIZE) * GRID_SIZE
            });
        }
        return positions;
    };

    // --- Use this new function for the overlap search ---
    // The search function findEmptySpotForShape needs a top-left (sx, sy) anchor.
    // We calculate the center from that.
    const getPositionsForSearch = (sx, sy) => {
        const centerX = sx + radiusPx;
        const centerY = sy + radiusPx;
        return getCircleLedPositions(centerX, centerY);
    };
    // --- End FIX 2 ---

    const { foundSpot, startX, startY } = findEmptySpotForShape(
        viewCenter,
        shapeWidth,
        shapeHeight,
        getPositionsForSearch
    );

    if (!foundSpot) { showToast('No Empty Space', `Could not find an empty space for the circle.`, 'warning'); return; }

    // --- FIX 3: Use the new position generator for *final* LED creation ---
    // Calculate the actual center based on where the shape was placed
    const finalCenterX = startX + radiusPx;
    const finalCenterY = startY + radiusPx;
    const newLedsRaw = getCircleLedPositions(finalCenterX, finalCenterY);
    // --- End FIX 3 ---

    const newLeds = [];
    const newWireIds = [];
    let ledCountFinal = 0;
    const addedCoords = new Set(); // To prevent overlap from grid snapping

    for (const rawLed of newLedsRaw) {
        const key = `${rawLed.x},${rawLed.y}`;
        // Add LED only if another LED doesn't already exist at this snapped coordinate
        if (!addedCoords.has(key)) {
            const id = `${Date.now()}-circ-${ledCountFinal++}`;
            const newLed = { id, x: rawLed.x, y: rawLed.y };
            newLeds.push(newLed);
            newWireIds.push(id);
            addedCoords.add(key);
        }
    }

    // --- Check if grid snapping collapsed all points ---
    if (newLeds.length === 0) {
        showToast('Error', 'Could not create circle. Radius might be too small.', 'danger');
        return;
    }

    if (newLeds.length < ledCount) {
        showToast('Warning', `Note: ${ledCount - newLeds.length} LED(s) were removed due to grid snapping overlap.`, 'info');
    }

    if (!Array.isArray(componentState.leds)) componentState.leds = [];
    if (!Array.isArray(componentState.wiring)) componentState.wiring = [];
    componentState.leds.push(...newLeds);
    componentState.wiring.push(newWireIds); // Add as one continuous circuit

    // --- FIX 4: Pan the view to the *actual* center of the new shape ---
    viewTransform.panX = canvas.width / 2 - (finalCenterX * viewTransform.zoom);
    viewTransform.panY = canvas.height / 2 - (finalCenterY * viewTransform.zoom);

    selectedLedIds.clear(); newLeds.forEach(led => selectedLedIds.add(led.id));
    setTool('select');
    addCircleModal.hide();
    drawCanvas();
    autoSaveState();
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

    // 'numSegments' is the number of gaps between LEDs.
    // If user wants 4 LEDs per side, there are 3 gaps.
    const numSegments = ledsPerSideInput - 1;

    // Base the radius on the number of segments to make it scale
    const R = numSegments * GRID_SIZE * 2; // Scaled radius

    const a = R * (Math.sqrt(3) / 2); // Apothem (for height calculation)
    const shapeWidth = 2 * R;
    const shapeHeight = 2 * a;

    const viewCenter = { x: (canvas.width / 2 - viewTransform.panX) / viewTransform.zoom, y: (canvas.height / 2 - viewTransform.panY) / viewTransform.zoom };

    const getVertices = (centerX, centerY) => {
        const V = [];
        // Use 30 degrees (PI/6) to get a flat-top hexagon
        const startAngle = Math.PI / 6;
        const angleStep = 2 * Math.PI / SIDES;
        for (let i = 0; i < SIDES; i++) {
            const angle = startAngle + i * angleStep;
            V.push({
                x: centerX + R * Math.cos(angle),
                y: centerY - R * Math.sin(angle)  // negative sin because canvas Y is inverted
            });
        }
        return V;
    };

    // findEmptySpotForShape's generator needs to return snapped points for collision checking.
    const getPositionsForSearch = (sx, sy) => {
        // sx, sy is top-left. Center is (sx + R, sy + a)
        const vertices = getVertices(sx + R, sy + a);
        return getInterpolatedPointsForPolygon(vertices, ledsPerSideInput, GRID_SIZE);
    };

    const { foundSpot, startX, startY } = findEmptySpotForShape(
        viewCenter,
        shapeWidth,
        shapeHeight,
        getPositionsForSearch
    );

    if (!foundSpot) { showToast('No Empty Space', `Could not find an empty space for the hexagon.`, 'warning'); return; }

    // --- FINAL CREATION ---
    const finalCenterX = startX + R;
    const finalCenterY = startY + a; // 'a' is half the height
    const finalVertices = getVertices(finalCenterX, finalCenterY);

    // Use the new, correct interpolation function
    const newLedsRaw = getInterpolatedPointsForPolygon(finalVertices, ledsPerSideInput, GRID_SIZE);

    const newLeds = [];
    const newWireIds = [];
    let ledCount = 0;

    for (const rawLed of newLedsRaw) {
        const id = `${Date.now()}-hex-${ledCount++}`;
        const newLed = { id, x: rawLed.x, y: rawLed.y };
        newLeds.push(newLed);
        newWireIds.push(id);
    }

    // Check if snapping caused too many LEDs to merge
    const expectedLedCount = (ledsPerSideInput - 1) * SIDES;
    if (newLeds.length < expectedLedCount * 0.9) { // Allow for some merging
        showToast('Warning', `Note: ${expectedLedCount - newLeds.length} LED(s) were removed due to grid snapping overlap.`, 'info');
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
    // Base the side length on the number of segments
    const s = numSegments * GRID_SIZE * 2; // Scaled side length
    const h = s * 0.866025; // Equilateral triangle height
    const shapeWidth = s;
    const shapeHeight = Math.round(h / GRID_SIZE) * GRID_SIZE; // Use snapped height

    const getVertices = (sx, sy) => [
        { x: sx, y: sy + shapeHeight },         // V1: Bottom-Left
        { x: sx + shapeWidth, y: sy + shapeHeight }, // V2: Bottom-Right
        { x: sx + shapeWidth / 2, y: sy }            // V3: Top
    ];

    // Use the new interpolation function for collision checking
    const getPositionsForSearch = (sx, sy) => {
        const vertices = getVertices(sx, sy);
        return getInterpolatedPointsForPolygon(vertices, ledsPerSide, GRID_SIZE);
    };

    const { foundSpot, startX, startY } = findEmptySpotForShape(
        viewCenter,
        shapeWidth,
        shapeHeight,
        getPositionsForSearch
    );

    if (!foundSpot) { showToast('No Empty Space', `Could not find an empty space for the triangle.`, 'warning'); return; }

    const finalCenterX = startX + shapeWidth / 2;
    const finalCenterY = startY + shapeHeight / 2;
    const finalVertices = getVertices(startX, startY);

    // Use the new, correct interpolation function
    const newLedsRaw = getInterpolatedPointsForPolygon(finalVertices, ledsPerSide, GRID_SIZE);

    const newLeds = [];
    const newWireIds = [];
    let ledCount = 0;

    for (const rawLed of newLedsRaw) {
        const id = `${Date.now()}-tri-${ledCount++}`;
        const newLed = { id, x: rawLed.x, y: rawLed.y };
        newLeds.push(newLed);
        newWireIds.push(id);
    }

    const expectedLedCount = (ledsPerSide - 1) * 3;
    if (newLeds.length < expectedLedCount * 0.9) {
        showToast('Warning', `Note: ${expectedLedCount - newLeds.length} LED(s) were removed due to grid snapping overlap.`, 'info');
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
        // --- Use toLowerCase() for client-side search ---
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

        // --- We will ONLY apply the ledCount range filter on the server ---
        if (filterLeds !== 'all') {
            // Convert the value from the dropdown (which is a string) to a number
            const ledCount = parseInt(filterLeds, 10);
            if (!isNaN(ledCount)) {
                queryConstraints.push(where('ledCount', '==', ledCount));
            }
        }

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
                    document.getElementById('share-component-btn').disabled = false;
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

        // --- Pagination is based on the original server query ---
        if (querySnapshot.docs.length > 0) {
            lastVisibleComponent = querySnapshot.docs[querySnapshot.docs.length - 1];
        }

        // --- Set flag for lazy loading ---
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
        let ledCountsToUse = [];
        // --- 3. FAST PATH: Try to use the existing filters doc ---
        // --- Simplified this 'if' to be more robust ---
        if (docSnap.exists() && docSnap.data()) {
            console.log("Populating filters from fast-load metadata doc.");
            const data = docSnap.data();
            if (data.allTypes) typesToUse = data.allTypes;
            if (data.allBrands) brandsToUse = data.allBrands;
            if (data.allLedCounts) ledCountsToUse = data.allLedCounts;

        } else {
            // --- 4. One-time scan to build the filters doc ---
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

                // --- Robust LED count check ---
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
        if (imageUrl && (imageUrl.startsWith('gs://') || imageUrl.startsWith('https://firebasestorage.googleapis.com'))) {
            try {
                const imageRef = ref(storage, imageUrl); // Get ref from URL
                await deleteObject(imageRef);
                // console.log("Deleted component image from Storage.");
            } catch (storageError) {
                console.warn("Could not delete component image from Storage:", storageError.code);
            }
        }

        // 1. Delete the Firestore document
        const docRef = doc(db, 'srgb-components', docId);
        await deleteDoc(docRef);

        showToast('Success', `Successfully deleted "${componentName}".`, 'success');

        // 3. --- Remove the card from the UI directly ---
        if (e && e.target) {
            // Remove closest parent .card to e
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

    // --- Add scroll listener for lazy loading ---
    if (galleryComponentList) {
        galleryComponentList.addEventListener('scroll', handleGalleryScroll);
    }
}

// --- HELPER FUNCTIONS FOR GRID PRECISION ---

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
 * Generates grid-snapped LED positions by interpolating points along polygon edges.
 * @param {Array<object>} vertices - Array of floating-point {x, y} vertices.
 * @param {number} ledsPerSide - The number of LEDs to place on *each* side (including vertices).
 * @param {number} gridSize - The global GRID_SIZE.
 * @returns {Array<object>} - Ordered array of {x, y} LED positions, snapped and deduplicated.
 */
function getInterpolatedPointsForPolygon(vertices, ledsPerSide, gridSize) {
    const allPoints = [];
    const addedCoords = new Set();
    // e.g., 4 LEDs per side = 3 segments/gaps
    const numSegments = ledsPerSide - 1;

    if (numSegments <= 0) return []; // Invalid

    for (let i = 0; i < vertices.length; i++) {
        const p1 = vertices[i];
        const p2 = vertices[(i + 1) % vertices.length];

        // We only add points *before* the end vertex of the segment.
        // The *next* segment will add that vertex, handling the corner.
        for (let j = 0; j < numSegments; j++) {
            // t goes from 0 up to (numSegments-1)/numSegments
            const t = j / numSegments;

            const rawX = lerp(p1.x, p2.x, t);
            const rawY = lerp(p1.y, p2.y, t);

            // Snap the *interpolated point* to the grid
            const snappedX = Math.round(rawX / gridSize) * gridSize;
            const snappedY = Math.round(rawY / gridSize) * gridSize;

            const key = `${snappedX},${snappedY}`;
            if (!addedCoords.has(key)) {
                allPoints.push({ x: snappedX, y: snappedY });
                addedCoords.add(key);
            }
        }
    }
    return allPoints;
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
        updateLedCount: updateLedCount,
        imageGuideState: imageGuideState
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

    // --- Check for URL parameter ---
    const urlParams = new URLSearchParams(window.location.search);
    const componentIdFromUrl = urlParams.get('id');

    if (componentIdFromUrl) {
        // If an ID is in the URL, try to load it
        loadComponentFromUrl(componentIdFromUrl);
    } else {
        // Otherwise, load from autosave or start new
        handleNewComponent(false);
    }
});