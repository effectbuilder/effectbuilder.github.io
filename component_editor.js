// --- Global State ---
let componentState = {
    ProductName: 'Custom_Component',
    DisplayName: 'My Custom Component',
    Brand: 'CustomBrand',
    Type: 'Strip',
    LedCount: 16,
    Width: 16, // Pixel Buffer Width (max X is Width - 1)
    Height: 16, // Pixel Buffer Height (max Y is Height - 1)
    LedCoordinates: [], // Array of {x: 0-(Width-1), y: 0-(Height-1)}
    LedMapping: [],
    Groups: {},
    ImageUrl: null,
    // Internal State
    ledSize: 12,
    showLedNumbers: true,
    lastModified: Date.now(),
};

let componentDocId = null;
let isRestoring = false;
let isDraggingLed = false;
let selectedLedIndex = -1;
let dragStartOffset = { x: 0, y: 0 };
let currentProjectDocId = null;
let imageUploadFile = null;

// --- DOM Elements ---
// We define these as global constants but check their existence later in init().
const canvas = document.getElementById('componentCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const ledsOverlay = document.getElementById('leds-overlay');
const visualizerContainer = document.getElementById('component-visualizer'); 
const form = document.getElementById('component-form');
const ledCountStatus = document.getElementById('led-count-status');
const imageUploadInput = document.getElementById('imageUpload');
const clearImageBtn = document.getElementById('clearImageBtn');
const ledSizeInput = document.getElementById('ledSize');
const selectedLedInfo = document.getElementById('selected-led-info');

// --- Helper Functions (Reused from user's original utilities) ---

/**
 * Displays a prominent toast notification in the bottom-right corner.
 */
function showToast(message, type = 'info') {
    const toastEl = document.getElementById('app-toast');
    if (!toastEl) { console.error('Toast element not found.'); return; }
    const toastHeader = document.getElementById('app-toast-header');
    const toastTitle = document.getElementById('app-toast-title');
    const toastBody = document.getElementById('app-toast-body');
    const toastIcon = document.getElementById('app-toast-icon');
    toastBody.innerHTML = message.replace(/\n/g, '<br>');
    toastHeader.classList.remove('bg-success', 'bg-danger', 'bg-primary');
    toastIcon.className = 'bi me-2';
    switch (type) {
        case 'success': toastHeader.classList.add('bg-success'); toastTitle.textContent = 'Success'; toastIcon.classList.add('bi-check-circle-fill'); break;
        case 'danger': toastHeader.classList.add('bg-danger'); toastTitle.textContent = 'Error'; toastIcon.classList.add('bi-exclamation-triangle-fill'); break;
        default: toastHeader.classList.add('bg-primary'); toastTitle.textContent = 'Notification'; toastIcon.classList.add('bi-info-circle-fill'); break;
    }
    const toast = bootstrap.Toast.getOrCreateInstance(toastEl);
    toast.show();
}

/**
 * Shows a generic confirmation modal and sets up a callback for the confirm button.
 */
function showConfirmModal(title, body, buttonText, onConfirm) {
    const confirmModalEl = document.getElementById('confirm-overwrite-modal');
    const confirmModalInstance = bootstrap.Modal.getInstance(confirmModalEl) || new bootstrap.Modal(confirmModalEl);
    const confirmModalTitle = document.getElementById('confirmOverwriteModalLabel');
    const confirmModalBody = document.getElementById('confirm-overwrite-modal-body');
    const confirmBtn = document.getElementById('confirm-overwrite-btn');

    confirmModalTitle.textContent = title;
    confirmModalBody.innerHTML = body;
    confirmBtn.textContent = buttonText;
    confirmBtn.className = `btn ${buttonText.toLowerCase().includes('delete') ? 'btn-danger' : 'btn-primary'}`;

    const handleConfirm = async () => {
        if (typeof onConfirm === 'function') {
            await onConfirm();
        }
        confirmBtn.blur();
        confirmModalInstance.hide();
    };

    confirmBtn.removeEventListener('click', handleConfirm); // Remove previous listener
    confirmBtn.addEventListener('click', handleConfirm, { once: true });

    const handleModalHide = () => {
        confirmBtn.removeEventListener('click', handleConfirm);
    };
    confirmModalEl.removeEventListener('hidden.bs.modal', handleModalHide);
    confirmModalEl.addEventListener('hidden.bs.modal', handleModalHide, { once: true });

    confirmModalInstance.show();
}

// --- Main Drawing & UI Functions ---

/**
 * Converts screen coordinates (in px) relative to the canvas into
 * snap-to-grid integer coordinates (0 to Width-1, 0 to Height-1).
 */
function normalizeCoords(x, y) {
    const rect = canvas.getBoundingClientRect();
    const W = parseInt(componentState.Width, 10);
    const H = parseInt(componentState.Height, 10);

    // Calculate grid cell size based on rendered canvas size
    const cellWidth = rect.width / W;
    const cellHeight = rect.height / H;

    // Convert mouse position to position within the grid (0 to W, 0 to H)
    const gridX = (x - rect.left) / cellWidth;
    const gridY = (y - rect.top) / cellHeight;
    
    // Snap to the nearest integer grid cell center
    const snappedX = Math.round(gridX - 0.5);
    const snappedY = Math.round(gridY - 0.5);

    // Clamp to valid coordinate range (0 to W-1, 0 to H-1)
    return {
        x: Math.min(W - 1, Math.max(0, snappedX)),
        y: Math.min(H - 1, Math.max(0, snappedY))
    };
}

/**
 * Converts integer grid coordinates (0 to W-1, 0 to H-1) to pixel coordinates
 * relative to the canvas overlay (0, 0 is top-left of the overlay).
 */
function toPixelCoords(gridX, gridY) {
    const rect = canvas.getBoundingClientRect();
    const W = parseInt(componentState.Width, 10);
    const H = parseInt(componentState.Height, 10);

    const cellWidth = rect.width / W;
    const cellHeight = rect.height / H;

    return {
        // Calculate center of the cell: (grid index + 0.5) * cell size
        x: (gridX + 0.5) * cellWidth,
        y: (gridY + 0.5) * cellHeight
    };
}

/**
 * Renders the LED dots on the overlay div.
 */
function renderLeds() {
    // Check for null elements first, which resolves the Uncaught TypeError
    if (!canvas || !ledsOverlay || !visualizerContainer) {
        console.error("DOM elements for canvas/overlay not ready.");
        return;
    }
    
    // Clear the existing dots
    ledsOverlay.innerHTML = '';
    
    // Get the current rendered size and position of the canvas element
    const canvasRect = canvas.getBoundingClientRect();
    const renderedWidth = canvasRect.width;
    const renderedHeight = canvasRect.height;
    
    // Calculate the overlay's position relative to its container (component-visualizer)
    const containerRect = visualizerContainer.getBoundingClientRect();

    // Set the overlay size and position to match the canvas's viewport coordinates
    ledsOverlay.style.position = 'absolute';
    ledsOverlay.style.top = `${canvasRect.top - containerRect.top}px`;
    ledsOverlay.style.left = `${canvasRect.left - containerRect.left}px`;
    ledsOverlay.style.width = `${renderedWidth}px`;
    ledsOverlay.style.height = `${renderedHeight}px`;
    ledsOverlay.style.zIndex = '10';

    const ledSize = parseInt(ledSizeInput.value, 10);
    const halfSize = ledSize / 2;

    componentState.LedCoordinates.forEach((coord, index) => {
        // Use integer grid coordinates to calculate pixel position 
        const pixelCoord = toPixelCoords(coord.x, coord.y);
        
        const dot = document.createElement('div');
        dot.className = `led-dot ${index === selectedLedIndex ? 'selected' : ''}`;
        dot.dataset.index = index;
        dot.style.width = `${ledSize}px`;
        dot.style.height = `${ledSize}px`;
        
        // Position relative to the top-left of the ledsOverlay (which is now exactly covering the canvas)
        dot.style.left = `${pixelCoord.x - halfSize}px`;
        dot.style.top = `${pixelCoord.y - halfSize}px`;
        dot.style.pointerEvents = 'auto'; // Make the dot itself clickable/draggable

        if (componentState.showLedNumbers) {
            dot.textContent = index;
            dot.style.lineHeight = `${ledSize - 2}px`;
        }

        dot.addEventListener('mousedown', startLedDrag);
        dot.addEventListener('click', (e) => {
            e.stopPropagation();
            if (selectedLedIndex !== index) {
                selectLed(index);
            }
        });

        ledsOverlay.appendChild(dot);
    });
}

function selectLed(index) {
    selectedLedIndex = index;
    const dots = ledsOverlay.querySelectorAll('.led-dot');
    dots.forEach(dot => dot.classList.remove('selected'));
    if (index >= 0) {
        const dot = ledsOverlay.querySelector(`.led-dot[data-index="${index}"]`);
        if (dot) dot.classList.add('selected');
        updateSelectedLedInfo(index);
    } else {
        selectedLedInfo.classList.add('d-none');
    }
}

function updateSelectedLedInfo(index) {
    const coord = componentState.LedCoordinates[index];
    if (coord) {
        selectedLedInfo.classList.remove('d-none');
        document.getElementById('selected-led-index').textContent = index;
        // Coordinates are already integers, no need for toFixed()
        document.getElementById('selected-led-x').value = coord.x;
        document.getElementById('selected-led-y').value = coord.y;
    } else {
        selectedLedInfo.classList.add('d-none');
    }
}

function startLedDrag(e) {
    e.preventDefault();
    e.stopPropagation();

    if (e.target.classList.contains('led-dot')) {
        isDraggingLed = true;
        const index = parseInt(e.target.dataset.index, 10);
        selectLed(index);

        const rect = e.target.getBoundingClientRect();
        
        // Offset is calculated relative to the mouse down position
        dragStartOffset = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };

        ledsOverlay.style.pointerEvents = 'auto'; 
    }
}

function handleLedDrag(e) {
    if (!isDraggingLed || selectedLedIndex < 0) return;

    const canvasRect = canvas.getBoundingClientRect();
    const W = parseInt(componentState.Width, 10);
    const H = parseInt(componentState.Height, 10);
    
    // 1. Calculate the mouse position relative to the canvas container's top-left corner
    const rawX = e.clientX - canvasRect.left;
    const rawY = e.clientY - canvasRect.top;
    
    // 2. Adjust for the drag offset (to ensure the dot is centered on the cursor)
    const adjustedX = rawX - dragStartOffset.x + (parseInt(ledSizeInput.value, 10) / 2);
    const adjustedY = rawY - dragStartOffset.y + (parseInt(ledSizeInput.value, 10) / 2);

    // 3. Convert absolute pixel position to integer grid coordinates
    const cellWidth = canvasRect.width / W;
    const cellHeight = canvasRect.height / H;

    const snappedX = Math.round((adjustedX / cellWidth) - 0.5);
    const snappedY = Math.round((adjustedY / cellHeight) - 0.5);

    // 4. Clamp to valid coordinate range
    const clampedX = Math.min(W - 1, Math.max(0, snappedX));
    const clampedY = Math.min(H - 1, Math.max(0, snappedY));
    
    // 5. Update state (now using integers)
    componentState.LedCoordinates[selectedLedIndex].x = clampedX;
    componentState.LedCoordinates[selectedLedIndex].y = clampedY;
    componentState.lastModified = Date.now();
    updateLedMapping();
    renderLeds(); // Rerender to snap the dot visually
    updateSelectedLedInfo(selectedLedIndex);
}

function stopLedDrag() {
    if (isDraggingLed) {
        isDraggingLed = false;
        ledsOverlay.style.pointerEvents = 'none'; 
        saveComponentDebounced();
    }
}

/**
 * Updates the LedMapping array to be sequential based on LedCoordinates count.
 */
function updateLedMapping() {
    const count = componentState.LedCoordinates.length;
    componentState.LedMapping = Array.from({ length: count }, (_, i) => i);
    componentState.LedCount = count;
    updateUIStatus();
}

/**
 * Converts the component state into the final SignalRGB JSON format.
 */
function generateComponentJson() {
    const { ProductName, DisplayName, Brand, Type, LedCount, Width, Height, LedCoordinates, LedMapping, ImageUrl } = componentState;

    // Coordinates are already integers in the correct range (0 to W-1, 0 to H-1)
    const pixelCoordinates = LedCoordinates.map(coord => [
        coord.x,
        coord.y
    ]);

    // Ensure all required fields exist
    if (!ProductName || LedCount === 0 || Width === 0 || Height === 0) {
        showToast("JSON generation failed: ProductName, LedCount, Width, and Height are required.", "danger");
        return null;
    }

    return {
        ProductName: ProductName.trim(),
        DisplayName: DisplayName.trim(),
        Brand: Brand.trim(),
        Type: Type.trim(),
        LedCount: LedCount,
        Width: Width,
        Height: Height,
        LedCoordinates: pixelCoordinates,
        LedMapping: LedMapping,
        // Optional fields
        LedNames: Array.from({ length: LedCount }, (_, i) => `LED ${i}`),
        ImageUrl: ImageUrl || undefined,
        Groups: {
            "All": LedMapping // Default "All" group
        }
    };
}

function updateUIStatus() {
    const width = parseInt(componentState.Width, 10) || 0;
    const height = parseInt(componentState.Height, 10) || 0;
    ledCountStatus.textContent = `Total LEDs: ${componentState.LedCoordinates.length} / Buffer: ${width}x${height}`;
}

/**
 * Draws a background image onto the canvas style.
 * @param {string} url - Data URL of the image.
 */
function drawBackgroundImage(url) {
    if (url) {
        canvas.style.backgroundImage = `url('${url}')`;
    } else {
        canvas.style.backgroundImage = 'none';
    }
}

// --- Component Tool Functions ---

function autoMapLeds() {
    const currentCount = parseInt(form.elements.ledCount.value, 10) || 0;
    if (currentCount <= 0) {
        showToast("Please set a positive LED Count first.", "warning");
        return;
    }

    const type = form.elements.type.value;
    let newCoords = [];

    const W = parseInt(componentState.Width, 10);
    const H = parseInt(componentState.Height, 10);

    if (type === 'Fan' || type === 'AIO Tube') {
        // Center of the pixel buffer grid
        const centerX = (W - 1) / 2;
        const centerY = (H - 1) / 2;

        // Radius is constrained by the smallest dimension of the buffer, with a margin
        const maxR = Math.min(W, H) / 2;
        const radius = Math.floor(maxR * 0.95); // Use 95% of the max available radius for margin

        for (let i = 0; i < currentCount; i++) {
            const angle = (i / currentCount) * 2 * Math.PI - (Math.PI / 2);
            
            // Calculate coordinates within the W x H grid
            const x = Math.round(centerX + radius * Math.cos(angle));
            const y = Math.round(centerY + radius * Math.sin(angle));
            
            newCoords.push({
                // Clamp coordinates to ensure they are strictly within the [0, W-1] x [0, H-1] range
                x: Math.min(W - 1, Math.max(0, x)),
                y: Math.min(H - 1, Math.max(0, y))
            });
        }
        
    } else if (type === 'Led Matrix') {
        // Map as a snake-pattern grid
        let ledIndex = 0;
        for (let r = 0; r < H && ledIndex < currentCount; r++) {
            for (let c = 0; c < W && ledIndex < currentCount; c++) {
                let colX;
                // Snake pattern: odd rows go right-to-left
                if (r % 2 === 0) {
                     colX = c;
                } else {
                     colX = W - 1 - c;
                }
                
                newCoords.push({ x: colX, y: r });
                ledIndex++;
            }
        }
    } else {
        // Map in a straight line (default for Strip, Strimer, Custom)
        const centerY = Math.floor(H / 2);
        for (let i = 0; i < currentCount; i++) {
            // Distribute across the entire width
            const x = Math.round(i / Math.max(1, currentCount - 1) * (W - 1));
            newCoords.push({
                x: x,
                y: centerY
            });
        }
    }

    componentState.LedCoordinates = newCoords;
    updateLedMapping();
    renderLeds();
    showToast(`${currentCount} LEDs auto-mapped for ${type}.`, 'success');
    saveComponentDebounced();
}

function handleAddLed(e) {
    if (!e || e.target !== canvas) return;
    // Get the snapped integer grid coordinates
    const { x, y } = normalizeCoords(e.clientX, e.clientY);

    // Check for duplicate to prevent accidentally placing two in the same grid cell
    const isDuplicate = componentState.LedCoordinates.some(coord => coord.x === x && coord.y === y);
    if (isDuplicate) {
        showToast(`LED already exists at coordinate (${x}, ${y}).`, 'warning');
        return;
    }

    const newLed = { x: x, y: y };
    componentState.LedCoordinates.push(newLed);
    componentState.lastModified = Date.now();
    updateLedMapping();
    renderLeds();
    selectLed(componentState.LedCoordinates.length - 1);
    saveComponentDebounced();
}

function handleClearAllLeds() {
    showConfirmModal(
        'Clear All LEDs',
        'Are you sure you want to remove ALL LED dots from the component?',
        'Yes, Clear All',
        () => {
            componentState.LedCoordinates = [];
            componentState.lastModified = Date.now();
            updateLedMapping();
            selectLed(-1);
            renderLeds();
            showToast("All LEDs removed.", 'info');
            saveComponentDebounced();
        }
    );
}

function deleteSelectedLed() {
    if (selectedLedIndex >= 0) {
        componentState.LedCoordinates.splice(selectedLedIndex, 1);
        componentState.lastModified = Date.now();
        updateLedMapping();
        // Adjust new selection index
        const newSelection = Math.min(selectedLedIndex, componentState.LedCoordinates.length - 1);
        selectLed(newSelection);
        renderLeds();
        saveComponentDebounced();
    }
}

// --- Firebase and I/O Functions ---

// The key change is here: the path is now dynamically generated based on the current user's ID
function getComponentCollectionRef() {
    const userId = window.auth.currentUser?.uid || 'anonymous';
    // Use window.appId and window.db which are globally available from firebase.js
    const collectionPath = `/artifacts/${window.appId}/users/${userId}/components`;
    return window.collection(window.db, collectionPath);
}

async function saveComponentToDatabase() {
    const user = window.auth.currentUser;
    if (!user) {
        showToast("You must be signed in to save components.", 'danger');
        return;
    }

    const { ProductName, DisplayName, ImageUrl } = componentState;
    if (!ProductName) {
        showToast("Please set a Product Name.", 'warning');
        return;
    }

    // 1. Prepare data (only save core state properties)
    const stateToSave = {
        ProductName, DisplayName, Brand: componentState.Brand, Type: componentState.Type,
        LedCount: componentState.LedCount, Width: componentState.Width, Height: componentState.Height,
        LedCoordinates: componentState.LedCoordinates, LedMapping: componentState.LedMapping,
        ImageUrl: ImageUrl,
        ledSize: componentState.ledSize,
        showLedNumbers: componentState.showLedNumbers,
    };

    // 2. Prepare Firestore document
    const componentData = {
        name: DisplayName.trim() || ProductName.trim(),
        productName: ProductName.trim(),
        brand: componentState.Brand.trim(),
        type: componentState.Type.trim(),
        userId: user.uid,
        creatorName: user.displayName || 'Anonymous',
        isPublic: true, // Note: This is an internal flag, the security rules still apply
        data: stateToSave,
        updatedAt: window.serverTimestamp(),
    };

    if (currentProjectDocId) {
        // Update existing
        try {
            const docRef = window.doc(getComponentCollectionRef(), currentProjectDocId);
            await window.updateDoc(docRef, componentData);
            showToast(`Component "${DisplayName}" overwritten successfully!`, 'success');
        } catch (error) {
            console.error("Error overwriting document:", error);
            showToast("Error overwriting component: Missing or insufficient permissions. Please sign out and sign back in.", 'danger');
        }
    } else {
        // Add new
        try {
            componentData.createdAt = window.serverTimestamp();
            const colRef = getComponentCollectionRef();
            const docRef = await window.addDoc(colRef, componentData);
            currentProjectDocId = docRef.id;
            showToast(`Component "${DisplayName}" saved successfully!`, 'success');
        } catch (error) {
            console.error("Error saving new document:", error);
            showToast("Error saving new component: Missing or insufficient permissions. This usually means you are not signed in or your authentication token has expired.", 'danger');
        }
    }
}

const saveComponentDebounced = debounce(saveComponentToDatabase, 1000);

/**
 * Loads the component state from the database.
 * @param {object} project - The project object from the Firestore query.
 */
function loadComponentFromDatabase(project) {
    isRestoring = true;

    try {
        const loadedState = project.data;
        Object.assign(componentState, {
            ProductName: loadedState.ProductName || 'Custom_Component',
            DisplayName: loadedState.DisplayName || 'My Custom Component',
            Brand: loadedState.Brand || 'CustomBrand',
            Type: loadedState.Type || 'Strip',
            LedCount: loadedState.LedCount || 0,
            Width: loadedState.Width || 16,
            Height: loadedState.Height || 16,
            LedCoordinates: loadedState.LedCoordinates || [],
            LedMapping: loadedState.LedMapping || [],
            ImageUrl: loadedState.ImageUrl || null,
            ledSize: loadedState.ledSize || 12,
            showLedNumbers: loadedState.showLedNumbers !== undefined ? loadedState.showLedNumbers : true,
        });

        // 1. Update form fields
        for (const key in componentState) {
            const el = form.elements[key];
            if (el) {
                if (el.type === 'checkbox') el.checked = componentState[key];
                else el.value = componentState[key];
            }
        }
        ledSizeInput.value = componentState.ledSize;
        document.getElementById('toggleLedNumbersBtn').classList.toggle('btn-success', componentState.showLedNumbers);

        // 2. Update image
        drawBackgroundImage(componentState.ImageUrl);

        // 3. Update Canvas Buffer Size
        const width = parseInt(componentState.Width, 10) || 16;
        const height = parseInt(componentState.Height, 10) || 16;
        canvas.width = width * 32;
        canvas.height = height * 32;
        canvas.style.aspectRatio = `${width} / ${height}`;

        // 4. Update UI and render LEDs
        currentProjectDocId = project.docId;
        updateUIStatus();
        selectLed(-1);
        renderLeds();

        showToast(`Component "${project.name}" loaded.`, 'success');
    } catch (error) {
        console.error("Error loading component:", error);
        showToast("Failed to load component data.", 'danger');
    } finally {
        isRestoring = false;
    }
}

/**
 * Fetches and populates the component gallery.
 */
async function fetchAndPopulateGallery(searchTerm = '') {
    const galleryList = document.getElementById('gallery-project-list');
    galleryList.innerHTML = '<div class="col-12 text-center text-body-secondary mt-4"><div class="spinner-border spinner-border-sm"></div><p class="mt-2">Loading Components...</p></div>';

    // Fetch from the public path for gallery viewing
    const publicCollectionPath = `/artifacts/${window.appId}/public/data/components`;
    let q = window.query(window.collection(window.db, publicCollectionPath), window.orderBy("updatedAt", "desc"));

    try {
        const querySnapshot = await window.getDocs(q);
        let projects = [];

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Since we are querying the public path, we assume isPublic is true, 
            // but we ensure all data is present.
            projects.push({ docId: doc.id, ...data });
        });

        // Client-side search filtering
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            projects = projects.filter(p =>
                p.name.toLowerCase().includes(lowerSearch) ||
                p.productName.toLowerCase().includes(lowerSearch) ||
                p.brand.toLowerCase().includes(lowerSearch) ||
                p.creatorName.toLowerCase().includes(lowerSearch)
            );
        }

        galleryList.innerHTML = ''; // Clear loading spinner

        if (projects.length === 0) {
            galleryList.innerHTML = '<div class="col-12 text-center text-body-secondary mt-4"><p>No components found.</p></div>';
            return;
        }

        projects.forEach(project => {
            const col = document.createElement('div');
            col.className = 'col';

            // Ensure we use the latest LED count/buffer values from the nested 'data' object for display
            const ledCount = project.data?.LedCount || 0;
            const width = project.data?.Width || 0;
            const height = project.data?.Height || 0;

            const card = document.createElement('div');
            card.className = 'card h-100 bg-body-secondary';

            card.innerHTML = `
                <div class="card-body p-3">
                    <h6 class="card-title text-info">${project.name}</h6>
                    <small class="text-body-secondary">Brand: ${project.brand} | Type: ${project.type}</small>
                    <p class="card-text mt-2 small">LEDs: ${ledCount} | Buffer: ${width}x${height}</p>
                </div>
                <div class="card-footer d-flex justify-content-end gap-2">
                    <button class="btn btn-sm btn-primary load-comp-btn" data-id="${project.docId}" data-name="${project.name}">
                        <i class="bi bi-folder2-open me-1"></i> Import to Edit
                    </button>
                    <button class="btn btn-sm btn-secondary export-json-btn" data-id="${project.docId}" data-name="${project.name}" data-product="${project.productName}">
                        <i class="bi bi-download me-1"></i> Export
                    </button>
                </div>
            `;
            col.appendChild(card);
            galleryList.appendChild(col);
        });
    } catch (error) {
        console.error("Error fetching gallery:", error);
        // Fallback for anonymous users if read access is not public
        galleryList.innerHTML = '<div class="col-12 text-danger">Failed to load component gallery. Please ensure database rules allow public read access for the gallery.</div>';
    }
}

// --- Event Handlers & Initialization ---

function handleNewComponent() {
    showConfirmModal(
        'New Component',
        'Are you sure you want to clear the current component data? Any unsaved changes will be lost.',
        'Clear',
        () => {
            componentState = {
                ProductName: 'New_Component',
                DisplayName: 'New Custom Component',
                Brand: 'CustomBrand',
                Type: 'Strip',
                LedCount: 16,
                Width: 16,
                Height: 16,
                LedCoordinates: [],
                LedMapping: [],
                Groups: {},
                ImageUrl: null,
                ledSize: 12,
                showLedNumbers: true,
                lastModified: Date.now(),
            };
            currentProjectDocId = null;
            imageUploadFile = null;
            drawBackgroundImage(null);
            document.getElementById('imageUpload').value = '';
            for (const key in componentState) {
                const el = form.elements[key];
                if (el) el.value = componentState[key];
            }
            document.getElementById('ledSize').value = componentState.ledSize;
            const width = parseInt(componentState.Width, 10);
            const height = parseInt(componentState.Height, 10);
            canvas.width = width * 32; 
            canvas.height = height * 32;
            canvas.style.aspectRatio = `${width} / ${height}`;
            updateUIStatus();
            selectLed(-1);
            renderLeds();
            showToast("New component workspace created.", "info");
        }
    );
}

function initListeners() {
    // Canvas & Overlay Interaction
    if (canvas) canvas.addEventListener('click', handleAddLed);
    if (ledsOverlay) {
        ledsOverlay.addEventListener('mousemove', handleLedDrag);
        window.addEventListener('mouseup', stopLedDrag);
    }
    if (canvas) canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        deleteSelectedLed();
    });

    // Mouse movement to update coordinates display
    if (canvas) canvas.addEventListener('mousemove', (e) => {
        const { x, y } = normalizeCoords(e.clientX, e.clientY);
        document.getElementById('canvas-coords').textContent = `X: ${x} Y: ${y}`;
    });

    // Form & Button Listeners
    if (form) {
        form.addEventListener('input', (e) => {
            if (e.target.name) {
                let value = e.target.type === 'number' ? parseFloat(e.target.value) : e.target.value;
                if (e.target.type === 'range') value = parseInt(value, 10);
                componentState[e.target.name] = value;
                componentState.lastModified = Date.now();

                // Handle canvas size change
                if (e.target.name === 'Width' || e.target.name === 'Height') {
                    const width = parseInt(componentState.Width, 10) || 16;
                    const height = parseInt(componentState.Height, 10) || 16;
                    canvas.width = width * 32;
                    canvas.height = height * 32;
                    canvas.style.aspectRatio = `${width} / ${height}`;
                }
                updateUIStatus();
                renderLeds(); // Rerender on buffer size change to resize dots
                saveComponentDebounced();
            }
        });
    }

    if (selectedLedInfo) {
        selectedLedInfo.addEventListener('input', (e) => {
            const index = selectedLedIndex;
            if (index < 0) return;
            const x = parseInt(document.getElementById('selected-led-x').value, 10);
            const y = parseInt(document.getElementById('selected-led-y').value, 10);
            const W = parseInt(componentState.Width, 10);
            const H = parseInt(componentState.Height, 10);

            componentState.LedCoordinates[index].x = Math.max(0, Math.min(W - 1, x));
            componentState.LedCoordinates[index].y = Math.max(0, Math.min(H - 1, y));
            componentState.lastModified = Date.now();
            renderLeds();
            saveComponentDebounced();
        });
    }

    // Tools
    document.getElementById('new-comp-btn').addEventListener('click', handleNewComponent);
    document.getElementById('save-comp-btn').addEventListener('click', saveComponentToDatabase);
    document.getElementById('autoMapBtn').addEventListener('click', autoMapLeds);
    document.getElementById('clearAllLedsBtn').addEventListener('click', handleClearAllLeds);
    document.getElementById('deleteSelectedLedBtn').addEventListener('click', deleteSelectedLed);

    document.getElementById('addLedBtn').addEventListener('click', () => {
        showToast("Click on the component preview to add an LED dot.", 'info');
        // Temporarily disable auto-add on canvas click to prevent accidental clicks
        canvas.removeEventListener('click', handleAddLed);
        // Re-enable after 5 seconds or a subsequent click
        setTimeout(() => canvas.addEventListener('click', handleAddLed), 5000);
    });

    // Image Upload
    if (imageUploadInput) {
        imageUploadInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (file.size > 500000) { // Check file size (500KB limit)
                showToast("Image file size exceeds 500KB. Please use a smaller file.", "danger");
                imageUploadInput.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const base64Url = event.target.result;
                componentState.ImageUrl = base64Url;
                drawBackgroundImage(base64Url);
                componentState.lastModified = Date.now();
                saveComponentDebounced();
            };
            reader.readAsDataURL(file);
        });
    }

    if (clearImageBtn) {
        clearImageBtn.addEventListener('click', () => {
            componentState.ImageUrl = null;
            imageUploadInput.value = '';
            drawBackgroundImage(null);
            componentState.lastModified = Date.now();
            saveComponentDebounced();
        });
    }

    // LED Size
    if (ledSizeInput) ledSizeInput.addEventListener('input', (e) => {
        componentState.ledSize = parseInt(e.target.value, 10);
        renderLeds();
    });

    // Toggle Numbers
    document.getElementById('toggleLedNumbersBtn').addEventListener('click', (e) => {
        componentState.showLedNumbers = !componentState.showLedNumbers;
        e.currentTarget.classList.toggle('btn-success', componentState.showLedNumbers);
        renderLeds();
        saveComponentDebounced();
    });

    // JSON Export
    document.getElementById('export-json-btn').addEventListener('click', () => {
        const json = generateComponentJson();
        if (json) {
            const jsonString = JSON.stringify(json, null, 4);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${json.ProductName.replace(/\\s/g, '_')}.json`;
            link.click();
            URL.revokeObjectURL(url);
            showToast("JSON file generated and downloaded.", 'success');
        }
    });

    // Gallery and Load/Import
    document.getElementById('open-gallery-btn').addEventListener('click', () => {
        fetchAndPopulateGallery();
    });

    const galleryContainer = document.getElementById('gallery-list-container');
    if (galleryContainer) {
        galleryContainer.addEventListener('click', async (e) => {
            const loadBtn = e.target.closest('.load-comp-btn');
            const exportBtn = e.target.closest('.export-json-btn');
            const docId = loadBtn?.dataset.id || exportBtn?.dataset.id;

            if (!docId) return;

            try {
                // Determine the correct path to fetch from (private or public)
                let collectionPath = `/artifacts/${window.appId}/public/data/components`;
                
                // If the user is signed in and trying to load, try to check their private space too (though gallery should only show public)
                // For simplicity here, we assume gallery items are in the public collection path.
                const docRef = window.doc(window.db, collectionPath, docId);
                const docSnap = await window.getDoc(docRef);

                if (docSnap.exists()) {
                    const project = { docId: docSnap.id, ...docSnap.data() };
                    if (loadBtn) {
                        // IMPORT/LOAD: Load into current workspace
                        showConfirmModal(
                            `Import Component: ${project.name}`,
                            'Importing will overwrite your current workspace. The imported component will be saved under your account as a NEW component if you click Save.',
                            'Import & Overwrite',
                            () => {
                                loadComponentFromDatabase(project);
                                // Set docId to null so the imported version is saved as a new component
                                currentProjectDocId = null; 
                                document.getElementById('open-gallery-btn').click(); // Close gallery
                            }
                        );
                    } else if (exportBtn) {
                        // EXPORT JSON: Generate JSON directly from saved data
                        const json = generateComponentJson(project.data);
                        if (json) {
                            const jsonString = JSON.stringify(json, null, 4);
                            const blob = new Blob([jsonString], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = `${project.productName.replace(/\\s/g, '_')}.json`;
                            link.click();
                            URL.revokeObjectURL(url);
                            showToast(`JSON for "${project.name}" downloaded.`, 'success');
                        }
                    }
                } else {
                    showToast("Component not found in gallery.", 'danger');
                }
            } catch (error) {
                console.error("Error fetching component from gallery:", error);
                showToast("Failed to fetch component from the database.", 'danger');
            }
        });

        document.getElementById('gallery-search-input').addEventListener('input', debounce((e) => {
            fetchAndPopulateGallery(e.target.value);
        }, 300));
    }

    // Enable/Disable Save Button on Auth State Change
    window.onAuthStateChanged(window.auth, user => {
        const saveBtn = document.getElementById('save-comp-btn');
        if (saveBtn) saveBtn.disabled = !user;
    });
}

function init() {
    // This is the crucial check to ensure all DOM elements are loaded before running logic
    if (!canvas || !ledsOverlay || !visualizerContainer || !form) {
        console.error("Critical DOM elements failed to load. Cannot initialize editor.");
        return;
    }
    
    initListeners();
    // The call to handleNewComponent must run only once initListeners is complete.
    handleNewComponent(); 
}

// MODIFIED: We now only attach init to the standard DOMContentLoaded event.
document.addEventListener('DOMContentLoaded', init);
