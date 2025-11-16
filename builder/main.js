// --- IMPORT ---
import { initializeTooltips, showToast, setupThemeSwitcher, renderComponentThumbnail, timeAgo } from './util.js';
import {
    auth, db, storage, ref, uploadString, getDownloadURL, deleteObject, deleteDoc,
    GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
    doc, setDoc, addDoc, collection, serverTimestamp, updateDoc,
    query, where, getDocs, orderBy, limit, startAfter, getDoc, FieldValue, arrayUnion,
    onSnapshot,
    writeBatch,
    FieldPath,
    documentId
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

let commentsUnsubscribe = null; // Holds the Firestore listener unsubscribe function
let currentUserIsAdmin = false;
let notificationListenerCleanup = null;

const DISALLOWED_WORDS = [
    'asshole', 'bitch', 'cock', 'cunt', 'damn', 'dick', 'fag', 'faggot', 'fuck', 'nigger', 'nigga', 'penis',
    'pussy', 'shit', 'slut', 'twat', 'vagina', 'whore'];

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

// --- [NEW] COMMENT DOM Elements ---
const commentSection = document.getElementById('component-comments-section');
const commentList = document.getElementById('comment-list');
const commentForm = document.getElementById('comment-form');
const commentTextarea = document.getElementById('comment-textarea');
const commentSubmitBtn = document.getElementById('comment-submit-btn');
const commentLoginPrompt = document.getElementById('comment-login-prompt');
const commentLoginLink = document.getElementById('comment-login-link');
const commentsLoadingPlaceholder = document.getElementById('comments-loading-placeholder');
const commentsSavePrompt = document.getElementById('comments-save-prompt');

let shareModal = null;
const copyShareUrlBtn = document.getElementById('copy-share-url-btn');
const shareUrlInput = document.getElementById('share-url-input');

let exportModal = null;

const MAX_GUIDE_IMAGE_DIMENSION = 1500; // Max pixels for longest side

// ---
// --- ALL FUNCTION DEFINITIONS ---
// ---

// --- [NEW] NOTIFICATION FUNCTIONS ---

/**
 * Fetches display names for a list of user IDs from the 'users' collection.
 * @param {string[]} uids - An array of user IDs.
 * @returns {Promise<Map<string, string>>} A Map where key is UID and value is display name.
 */
async function fetchDisplayNames(uids) {
    const namesMap = new Map();
    if (!uids || uids.length === 0) {
        return namesMap;
    }
    const usersRef = collection(db, "users");
    const uniqueUids = [...new Set(uids)];
    const uidBatches = [];
    for (let i = 0; i < uniqueUids.length; i += 30) {
        uidBatches.push(uniqueUids.slice(i, i + 30));
    }

    try {
        for (const batch of uidBatches) {
            const q = query(usersRef, where(documentId(), 'in', batch));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(doc => {
                namesMap.set(doc.id, doc.data().displayName || 'Anonymous User');
            });
        }
    } catch (e) {
        console.error("Error fetching display names:", e);
    }
    return namesMap;
}

/**
 * Fetches component names for a list of component IDs.
 * @param {string[]} componentIds - An array of component document IDs.
 * @returns {Promise<Map<string, string>>} A Map where key is component ID and value is component name.
 */
async function fetchComponentNames(componentIds) {
    const namesMap = new Map();
    if (!componentIds || componentIds.length === 0) {
        return namesMap;
    }

    const uniqueIds = [...new Set(componentIds)];
    const idBatches = [];
    for (let i = 0; i < uniqueIds.length; i += 30) {
        idBatches.push(uniqueIds.slice(i, i + 30));
    }

    try {
        for (const batch of idBatches) {
            const componentsRef = collection(db, "srgb-components");
            const q = query(componentsRef, where(documentId(), 'in', batch));
            const querySnapshot = await getDocs(q);
            querySnapshot.forEach(doc => {
                namesMap.set(doc.id, doc.data().name || 'Untitled Component');
            });
        }
    } catch (e) {
        console.error("Error fetching component names:", e);
    }
    return namesMap;
}

/**
 * Sets up the real-time listener for notifications for the logged-in user.
 * @param {object|null} user - The Firebase auth user object, or null if logged out.
 */
function setupNotificationListener(user) {
    if (notificationListenerCleanup) {
        notificationListenerCleanup();
        notificationListenerCleanup = null;
    }

    const toggleBtn = document.getElementById('notification-dropdown-toggle');
    const notificationBadge = document.getElementById('notification-badge');
    const listContainer = document.getElementById('notification-list-container');

    if (!user) {
        if (listContainer) {
            listContainer.innerHTML = `
            <li class="dropdown-item disabled text-center text-body-secondary small p-3">
                <i class="bi bi-person-fill me-1"></i> Sign in to view notifications.
            </li>`;
        }
        toggleBtn.disabled = true;
        notificationBadge.classList.add('d-none');
        return;
    }

    toggleBtn.disabled = false;

    const notificationsRef = collection(db, "notifications");

    // [MODIFIED] Added the notificationType filter
    const q = query(
        notificationsRef,
        where("recipientId", "==", user.uid),
        where("notificationType", "==", "component"), // <-- [NEW] ADD THIS FILTER
        orderBy("timestamp", "desc"),
        limit(30)
    );

    notificationListenerCleanup = onSnapshot(q, async (snapshot) => {
        const allNotifications = [];
        const senderUids = new Set();
        const componentIds = new Set(); // Changed from projectIds

        snapshot.forEach(doc => {
            const data = doc.data();
            allNotifications.push({ ...data, docId: doc.id });
            senderUids.add(data.senderId);

            // Check if the notification is for a component (srgb-components)
            // We check this by seeing if projectId (the ID) exists at all.
            if (data.projectId) {
                componentIds.add(data.projectId);
            }
        });

        const namesMap = await fetchDisplayNames(Array.from(senderUids));
        // Use the new function to get component names
        const componentNamesMap = await fetchComponentNames(Array.from(componentIds));

        const finalNotifications = allNotifications.map(notification => ({
            ...notification,
            senderName: namesMap.get(notification.senderId) || 'A User',
            // Use the component map
            projectName: componentNamesMap.get(notification.projectId) || 'Untitled Component'
        }));

        const newUnreadCount = finalNotifications.filter(n => !n.read).length;

        notificationBadge.textContent = newUnreadCount;
        if (newUnreadCount > 0) {
            notificationBadge.classList.remove('d-none');
        } else {
            notificationBadge.classList.add('d-none');
        }

        renderNotificationDropdown(finalNotifications);

    }, (err) => {
        console.error("Error setting up notification listener:", err);
    });
}

/**
     * Renders the notification dropdown list.
     * @param {Array} allNotifications - A list of notification objects (read and unread).
     */
function renderNotificationDropdown(allNotifications) {
    const listContainer = document.getElementById('notification-list-container');
    const markAllBtn = document.getElementById('mark-all-read-btn');
    const deleteAllReadBtn = document.getElementById('delete-all-read-btn'); // [NEW] Get new button
    const toggleBtn = document.getElementById('notification-dropdown-toggle');
    const user = auth.currentUser;

    if (!listContainer || !deleteAllReadBtn || !markAllBtn) return; // [MODIFIED] Add guard

    if (!user) {
        listContainer.innerHTML = `
                <li class="dropdown-item disabled text-center text-body-secondary small p-3">
                    <i class="bi bi-person-fill me-1"></i> Sign in to view notifications.
                </li>
            `;
        markAllBtn.style.display = 'none';
        deleteAllReadBtn.style.display = 'none'; // [NEW] Hide
        return;
    }

    // --- [MODIFIED] Show buttons based on notification state ---
    const hasUnread = allNotifications.some(n => !n.read);
    const hasRead = allNotifications.some(n => n.read); // [NEW] Check for read

    markAllBtn.style.display = hasUnread ? 'inline' : 'none';
    deleteAllReadBtn.style.display = hasRead ? 'inline' : 'none'; // [NEW] Show if read notifications exist
    // --- [END MODIFICATION] ---

    if (allNotifications.length === 0) {
        listContainer.innerHTML = '<li class="dropdown-item disabled text-center text-body-secondary small p-3">You have no new notifications.</li>';
        return;
    }

    listContainer.innerHTML = '';

    allNotifications.forEach(notification => {
        const item = document.createElement('li');

        let notificationText = '';
        let notificationIcon = '';

        if (notification.eventType === 'like') {
            notificationText = `Your component <strong>${notification.projectName}</strong> was liked by <strong>${notification.senderName}</strong>!`;
            notificationIcon = `<i class="bi bi-heart-fill text-danger fs-5 mt-1 flex-shrink-0"></i>`;
        } else if (notification.eventType === 'comment') {
            // Use 'projectName' which we mapped to the component name
            notificationText = `<strong>${notification.senderName}</strong> commented on your component <strong>${notification.projectName}</strong>.`;
            notificationIcon = `<i class="bi bi-chat-left-text-fill text-info fs-5 mt-1 flex-shrink-0"></i>`;
        } else {
            notificationText = `New event: ${notification.eventType} from <strong>${notification.senderName}</strong>.`;
            notificationIcon = `<i class="bi bi-bell-fill text-warning fs-5 mt-1 flex-shrink-0"></i>`;
        }

        const timestamp = notification.timestamp && notification.timestamp.toDate
            ? notification.timestamp.toDate()
            : new Date();

        const readStyle = notification.read ? 'opacity: 0.65; background-color: rgba(255,255,255,0.03);' : '';

        item.innerHTML = `
                <a href="#" style="${readStyle}" class="dropdown-item d-flex align-items-start gap-2 p-3 notification-link" data-project-id="${notification.projectId}" data-notification-id="${notification.docId}">
                    ${notificationIcon}
                    <div class="flex-grow-1">
                        <p class="mb-0 small">
                            ${notificationText}
                        </p>
                        <small class="text-body-secondary">${timeAgo(timestamp)} ago</small> 
                    </div>
                </a>
            `;
        listContainer.appendChild(item);
    });

    toggleBtn.disabled = false;
}

/**
 * Handles the click event on a notification item: loads the component and marks the notification as read.
 * @param {string} componentId - The ID of the component to load.
 * @param {string} notificationId - The ID of the notification document to mark as read.
 */
async function handleNotificationClick(componentId, notificationId) {
    const user = auth.currentUser;
    if (!user) {
        showToast("Please sign in to load components.", "warning");
        return;
    }

    // 1. Load the Component from the database
    try {
        const componentDocRef = doc(db, "srgb-components", componentId);
        const componentDoc = await getDoc(componentDocRef);

        if (!componentDoc.exists()) {
            showToast("The associated component was not found.", "danger");
            // Do not return, still mark as read
        } else {
            const componentData = { dbId: componentDoc.id, ...componentDoc.data() };

            // This is the main component load function
            if (loadComponentState(componentData)) {
                currentComponentId = componentDoc.id;
                document.getElementById('share-component-btn').disabled = false;
                isDirty = false;
                clearAutoSave();
            } else {
                showToast("Load Error", "Failed to parse component data.", "danger");
            }
        }

    } catch (error) {
        console.error("Error loading component from notification:", error);
        showToast("Failed to load the component.", "danger");
    }

    // 2. Mark the specific notification as read
    try {
        const notifDocRef = doc(db, "notifications", notificationId);
        await updateDoc(notifDocRef, { read: true });
    } catch (error) {
        console.error("Error marking notification as read:", error);
    }
}

/**
 * [NEW] Deletes all READ notifications for the current user.
 */
async function deleteAllReadNotifications() {
    const user = auth.currentUser;
    if (!user) {
        showToast("You must be logged in to perform this action.", "warning");
        return;
    }

    if (!confirm("Are you sure you want to delete all *read* notifications? This cannot be undone.")) {
        return;
    }

    console.log("Deleting all read notifications...");
    const notificationsRef = collection(db, "notifications");
    const q = query(
        notificationsRef,
        where("recipientId", "==", user.uid),
        where("notificationType", "==", "component"), // Filter for component notifications
        where("read", "==", true) // Only delete read ones
    );

    try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) {
            showToast("No read notifications to delete.", "info");
            return;
        }

        // Use a batch write to delete all found documents
        const batch = writeBatch(db);
        querySnapshot.forEach(doc => {
            batch.delete(doc.ref);
        });

        await batch.commit();
        showToast("Success", `Cleared ${querySnapshot.size} read notifications.`, "success");
        // The real-time listener will automatically update the list.

    } catch (error) {
        console.error("Error deleting all read notifications:", error);
        showToast("Error", "Could not delete read notifications.", "danger");
    }
}

/**
 * Marks all unread notifications for the current user as read.
 */
async function markAllNotificationsAsRead() {
    const user = auth.currentUser;
    if (!user) {
        showToast("You must be logged in to perform this action.", "warning");
        return;
    }

    const notificationsRef = collection(db, "notifications");
    const q = query(
        notificationsRef,
        where("recipientId", "==", user.uid),
        where("read", "==", false)
    );

    try {
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) return;

        const batch = writeBatch(db);
        querySnapshot.forEach(doc => {
            batch.update(doc.ref, { read: true });
        });

        await batch.commit();
    } catch (error) {
        console.error("Error marking all notifications as read:", error);
        showToast("Could not mark all notifications as read.", "danger");
    }
}

// --- [END NEW] NOTIFICATION FUNCTIONS ---

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
                loadComments(currentComponentId);
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
    // console.log('Attempting to autosave state...');
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
            // console.log('Autosave successful. Saved LEDs:', componentState.leds.length, 'Circuits:', componentState.wiring.length);
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
    // console.log('Clearing autosave data.');
    localStorage.removeItem(AUTOSAVE_KEY);
}

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

    unsubscribeFromComments();

    // Clear old state
    clearAutoSave();
    Object.assign(componentState, createDefaultComponentState()); // Reset to default first
    Object.assign(componentState, stateToLoad); // Then apply new state\
    componentState.originalDbName = stateToLoad.name;

    // --- Load imageGuideState from stateToLoad or use defaults ---
    imageGuideState.x = stateToLoad.imageGuideX ?? 0;
    imageGuideState.y = stateToLoad.imageGuideY ?? 0;
    imageGuideState.scale = stateToLoad.imageGuideScale ?? 1;
    imageGuideState.rotation = stateToLoad.imageGuideRotation ?? 0;
    imageGuideState.isLocked = stateToLoad.imageGuideIsLocked ?? true;
    imageGuideState.isVisible = stateToLoad.imageGuideIsVisible ?? true;

    // --- NEW FIX: CONVERT DATABASE WEBP IMAGES TO PNG ---
    if (componentState.imageUrl && componentState.imageUrl.startsWith('data:image/webp')) {
        console.warn("loadComponentState: Detected WebP image from database. Converting to PNG in memory...");

        const webPDataUrl = componentState.imageUrl;
        // Set to null temporarily so the UI doesn't try to load the (broken) WebP
        componentState.imageUrl = null;

        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth; // Use naturalWidth for correct dimensions
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            // Get the new PNG data URL
            const pngDataUrl = canvas.toDataURL('image/png');

            // Update the component state with the correct format
            componentState.imageUrl = pngDataUrl;
            componentState.imageWidth = img.naturalWidth; // Also update dimensions
            componentState.imageHeight = img.naturalHeight;

            // console.log("loadComponentState: WebP converted to PNG successfully.");

            // Re-run UI update and autosave with the new PNG data
            updateUIFromState();
            autoSaveState();
        };
        img.onerror = () => {
            console.error("loadComponentState: Failed to convert WebP to PNG.");
            // Image is already null, so it will just stay blank.
        };
        img.src = webPDataUrl; // Start the conversion
    }
    // --- END NEW FIX ---


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

    if (currentComponentId) {
        // It's a saved component, load the comments
        loadComments(currentComponentId);
    } else {
        // It's a new component, show the "Save" prompt
        if (commentsLoadingPlaceholder) commentsLoadingPlaceholder.style.display = 'none';
        if (commentsSavePrompt) commentsSavePrompt.style.display = 'block';
    }

    updateUIFromState(); // Run initial update
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

    // [MODIFIED] Made the callback async to check for admin status
    onAuthStateChanged(auth, async (user) => {
        const isLoggedIn = !!user;
        const defaultIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0iYmkgYmktcGVyc29uLWNpcmNsZSIgdmlld0JveD0iMCAwIDE2IDE2Ij4KICA8cGF0aCBkPSJNMTFhMyAzIDAgMTEtNiAwIDMgMyAwIDAxNiAweiIvPgogIDxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgZD0iTTAgOGE4IDggMCAxMDE2IDBBOCA4IDAgMDAwIDh6bTgtN2E3IDcgMCAwMTcgNzdhNyA3IDAgMDEtNyA3QTcgNyAwIDAxMSA4YTcgNyAwIDAxNy03eiIvPjwvIHN2Zz4=';

        if (isLoggedIn) {
            if (userDisplay) userDisplay.textContent = user.displayName || user.email;
            if (userPhoto) userPhoto.src = user.photoURL || defaultIcon;
            if (userSessionGroup) userSessionGroup.classList.remove('d-none');
            if (loginBtn) loginBtn.classList.add('d-none');
            if (saveBtn) saveBtn.disabled = false;
            if (loadBtn) loadBtn.disabled = false;

            if (commentForm) commentForm.style.display = 'block';
            if (commentLoginPrompt) commentLoginPrompt.style.display = 'none';

            // --- [NEW] Check for Admin Status ---
            currentUserIsAdmin = false; // Reset on every auth change
            if (user.uid === ADMIN_UID) {
                currentUserIsAdmin = true;
            } else {
                // Check the /admins collection, as per your security rules
                const adminDocRef = doc(db, "admins", user.uid);
                try {
                    const adminDocSnap = await getDoc(adminDocRef);
                    if (adminDocSnap.exists()) {
                        currentUserIsAdmin = true;
                    }
                } catch (err) {
                    console.error("Error checking admin status:", err);
                }
            }
            // console.log("User Admin Status:", currentUserIsAdmin);
            // --- [END NEW] ---

            const userDocRef = doc(db, "users", user.uid);
            setDoc(userDocRef, {
                displayName: user.displayName || 'Anonymous User',
                photoURL: user.photoURL || null
            }, { merge: true }).catch(err => {
                console.error("Failed to save user profile to Firestore:", err);
            });
            setupNotificationListener(user);
        } else {
            if (userSessionGroup) userSessionGroup.classList.add('d-none');
            if (loginBtn) loginBtn.classList.remove('d-none');
            if (saveBtn) saveBtn.disabled = true;
            if (loadBtn) loadBtn.disabled = true;
            if (shareBtn) shareBtn.disabled = true;

            // --- [NEW] Reset admin status on logout ---
            currentUserIsAdmin = false;
            // --- [END NEW] ---

            if (commentForm) commentForm.style.display = 'none';
            if (commentLoginPrompt) commentLoginPrompt.style.display = 'block';
            setupNotificationListener(null);
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
        guideImageHeight: 300,

        // --- ADD THIS LINE ---
        originalDbName: "My Custom Component" // Give it the default name
    };
}

function handleNewComponent(showNotification = true) {
    // Check if the current canvas work is dirty and requires a confirmation dialog
    if (!checkDirtyState()) return;
    unsubscribeFromComments();

    let stateToLoad = createDefaultComponentState();
    // console.log('handleNewComponent called. showNotification:', showNotification);

    // Preserve Image Guide URL and Dimensions
    // Extract the guide image details from the current component state before checking autosave or resetting to defaults.
    let preservedGuideUrl = componentState.guideImageUrl;
    let preservedGuideWidth = componentState.guideImageWidth;
    let preservedGuideHeight = componentState.guideImageHeight;

    if (!showNotification) {
        const savedState = localStorage.getItem(AUTOSAVE_KEY);
        // console.log('Checking localStorage...');
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
            // console.log('No autosave data found in localStorage.');
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
                // console.log('Importing internal component format.');
                stateToLoad = data; // Directly use the data object

            } else if (data.LedCoordinates && Array.isArray(data.LedCoordinates)) {
                // --- 2. It's an EXPORTED format (ProductName, LedCoordinates, etc.) ---
                // console.log('Importing exported .json format.');
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
                    stateToLoad.imageUrl = `data:image/png;base64,${data.Image}`;
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

/**
 * Performs the actual save/update to Firebase after user confirmation.
 * @param {boolean} isNew - True if this is a new doc (setDoc), false (updateDoc).
 * @param {boolean} [isForking=false] - True if this is a non-owner saving.
 */
async function performSave(isNew, isForking = false) {
    const user = auth.currentUser; // Re-check user
    if (!user) {
        showToast('Error', 'You must be logged in to save.', 'danger');
        return;
    }

    // 1. Apply changes from inputs to the state *now*
    componentState.name = compNameInput.value;
    componentState.displayName = compDisplayNameInput.value;
    componentState.brand = compBrandInput.value;
    componentState.type = compTypeInput.value;

    // 2. Show toast
    if (isForking) {
        showToast('Forking Component...', 'Saving your version as a new component.', 'info');
    } else {
        showToast('Saving...', 'Saving component to the cloud.', 'info');
    }

    // 3. Prepare data for Firebase
    let wiringToSave = componentState.wiring;
    if (!Array.isArray(wiringToSave)) { wiringToSave = []; }
    wiringToSave = wiringToSave.filter(circuit => Array.isArray(circuit));
    const firestoreWiring = wiringToSave.map(circuit => {
        return { circuit: circuit };
    });

    // If it's a new component (or forking/saving as new), clear the old ID
    if (isNew) {
        currentComponentId = null;
        componentState.dbId = null;
    }

    const dataToSave = {
        ...componentState,
        wiring: firestoreWiring,
        ledCount: (componentState.leds || []).length,
        ownerId: user.uid,
        ownerName: user.displayName,
        lastUpdated: serverTimestamp(),
        imageUrl: componentState.imageUrl || null,
        guideImageUrl: componentState.guideImageUrl || null,
        imageGuideX: imageGuideState.x,
        imageGuideY: imageGuideState.y,
        imageGuideScale: imageGuideState.scale,
        imageGuideRotation: imageGuideState.rotation,
        imageGuideIsLocked: imageGuideState.isLocked,
        imageGuideIsVisible: imageGuideState.isVisible,
    };
    delete dataToSave.dbId; // Don't save the local DB ID in the doc

    // 4. Execute Firebase save
    try {
        let docRef;
        const componentsCollection = collection(db, 'srgb-components');

        if (isNew) {
            // --- NEW COMPONENT (or FORK/SaveAsNew) PATH ---
            dataToSave.createdAt = serverTimestamp();
            docRef = doc(componentsCollection); // Let Firestore generate a new ID
            await setDoc(docRef, dataToSave);
            currentComponentId = docRef.id;
            componentState.dbId = currentComponentId;
        } else {
            // --- OVERWRITE PATH ---
            docRef = doc(componentsCollection, currentComponentId);
            dataToSave.createdAt = componentState.createdAt || serverTimestamp(); // Preserve original create date
            await updateDoc(docRef, dataToSave);
        }

        componentState.createdAt = dataToSave.createdAt; // Ensure state has create date
        componentState.originalDbName = componentState.name;

        loadComments(currentComponentId);

        // 5. Update metadata (no change here)
        try {
            const filterDocRef = doc(db, "srgb-components-metadata", "filters");
            const metadataUpdate = {
                allTypes: arrayUnion(dataToSave.type),
                allBrands: arrayUnion(dataToSave.brand),
                allLedCounts: arrayUnion(dataToSave.ledCount)
            };
            await setDoc(filterDocRef, metadataUpdate, { merge: true });
        } catch (filterError) {
            console.warn("Could not update gallery filters metadata:", filterError);
        }

        // 6. Finalize
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
 * Gatekeeper function for saving.
 * Checks permissions and name changes, then asks user for confirmation
 * before calling performSave().
 */
async function handleSaveComponent() {
    const user = auth.currentUser;
    if (!user) {
        showToast('Error', 'You must be logged in to save.', 'danger');
        return;
    }

    // --- 1. Get new values BUT DON'T apply them yet ---
    const newName = compNameInput.value;
    const originalName = componentState.originalDbName;

    // --- 2. Determine save conditions ---
    const isNewComponent = (currentComponentId === null);
    const isOwnerOrAdmin = !isNewComponent && (user.uid === componentState.ownerId || user.uid === ADMIN_UID);
    const isForking = !isNewComponent && !isOwnerOrAdmin;
    const nameChanged = (newName !== originalName);

    // --- 3. Route the save logic ---
    if (isNewComponent) {
        // A. It's a brand new component. Save it.
        // console.log("Save Route: New Component");
        performSave(true, false); // isNew=true, isForking=false

    } else if (isForking) {
        // B. User is not owner. Force a fork (save as new).
        // console.log("Save Route: Forking");
        performSave(true, true); // isNew=true, isForking=true

    } else if (isOwnerOrAdmin) {
        // C. User is the owner.
        if (nameChanged) {
            // C1. Name changed: Save as New AUTOMATICALLY. No questions asked.
            // console.log("Save Route: Owner Save As New (Name Changed) - Automatic");
            performSave(true, false); // isNew=true, isForking=false
        } else {
            // C2. Name is the same: Ask to Overwrite (This is the only time we ask)
            const overwrite = confirm(
                'This component already exists.\n\n' +
                'Click "OK" to OVERWRITE it with your current changes.\n' +
                '(Click "Cancel" to do nothing).'
            );
            if (overwrite) {
                // console.log("Save Route: Owner Overwrite (Same Name)");
                performSave(false, false); // isNew=false, isForking=false
            } else {
                showToast('Save Cancelled', 'No changes were saved.', 'info');
            }
        }
    } else {
        // Fallback for any unhandled case
        console.error("Save logic error: Unhandled case.");
    }
}

/**
 * Renamed from handleExport. This function *only* validates and shows the modal.
 * The actual JSON generation is done by updateExportPreview().
 */
function showExportModal() {
    // console.log("showExportModal triggered.");

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

    // --- GET THE BUTTONS (DO NOT CLONE) ---
    const downloadBtn = document.getElementById('confirm-export-json-btn');
    const copyBtn = document.getElementById('copy-export-json-btn');

    if (!preview || !downloadBtn || !copyBtn) {
        console.error("Export modal preview, download, or copy button not found!");
        return;
    }

    // Disable buttons until new data is ready
    downloadBtn.disabled = true;
    copyBtn.disabled = true;

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
            // Use the PNG data you fixed before
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
            jsonString = generateWLEDJson(productName, currentLeds, currentWiring, minX, minY, width, height);
            filename = (productName || 'wled_matrix').replace(/[^a-z0-9]/gi, '_').toLowerCase() + '_wled.json';
        } else if (format === 'nolliergb') {
            jsonString = generateNollieRGBJson(ledCount);
            filename = (productName || 'nolliergb_profile').replace(/[^a-z0-9]/gi, '_').toLowerCase() + '_nollie.json';
        }

        preview.textContent = jsonString;

        // --- 4. CREATE BLOB AND URL ---
        const blob = new Blob([jsonString], { type: 'application/json' });

        // Revoke the *old* URL if it exists to prevent memory leaks
        if (downloadBtn._objectURL) {
            URL.revokeObjectURL(downloadBtn._objectURL);
        }

        const url = URL.createObjectURL(blob);
        downloadBtn._objectURL = url; // Store the new URL on the button

        // --- 5. ASSIGN ONCLICK HANDLERS DIRECTLY ---

        downloadBtn.onclick = () => {
            try {
                const a = document.createElement('a');
                a.href = url;
                a.download = filename;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                // Do not revoke URL here; let the next update handle it.
                if (exportModal) exportModal.hide();
            } catch (downloadError) {
                console.error("Error triggering download:", downloadError);
                showToast('Download Error', 'Could not trigger file download.', 'danger');
            }
        };

        copyBtn.onclick = () => {
            navigator.clipboard.writeText(jsonString).then(() => {
                showToast('Copied!', 'JSON copied to clipboard.', 'success');
            }).catch(err => {
                console.error("Error copying JSON to clipboard:", err);
                showToast('Copy Error', 'Could not copy to clipboard.', 'danger');
            });
        };

        // Re-enable the buttons
        downloadBtn.disabled = false;
        copyBtn.disabled = false;

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
                const resizedDataUrl = canvas.toDataURL('image/png');

                // Save the RESIZED dataUrl to the state
                componentState.imageUrl = resizedDataUrl;
                componentState.imageWidth = width;
                componentState.imageHeight = height;

                // // console.log(`Device image resized to: ${width}x${height}`);
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
                // console.log(`Image Guide resized to: ${width}x${height}`);
            }

            // 2. Draw resized image to canvas
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // 3. Get the new image as a WebP data URL
            const resizedDataUrl = canvas.toDataURL('image/png');

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

/**
 * Sets up listeners for the comment form.
 */
function setupCommentListeners() {
    if (commentForm) {
        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const commentText = commentTextarea.value.trim();
            if (commentText) {
                handlePostComment(commentText);
            }
        });
    }

    // Add listener to the "sign in" link in the prompt
    if (commentLoginLink) {
        commentLoginLink.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogin();
        });
    }

    // --- [NEW] Event delegation for deleting comments ---
    if (commentList) {
        commentList.addEventListener('click', (e) => {
            // Find the closest delete link (handles clicking the icon inside the link)
            const deleteLink = e.target.closest('[data-comment-id]');
            if (deleteLink) {
                e.preventDefault();
                const commentId = deleteLink.dataset.commentId;
                handleDeleteComment(commentId);
            }
        });
    }
    // --- [END NEW] ---
}

/**
 * Unsubscribes from the current real-time comment listener (if one exists).
 * Hides and clears the comment section UI.
 */
function unsubscribeFromComments() {
    if (commentsUnsubscribe) {
        // console.log("Unsubscribing from comments listener.");
        commentsUnsubscribe();
        commentsUnsubscribe = null;
    }
    // Hide and clear the UI
    if (commentList) commentList.innerHTML = '';
    // Hide all placeholders
    if (commentsLoadingPlaceholder) commentsLoadingPlaceholder.style.display = 'none';
    if (commentsSavePrompt) commentsSavePrompt.style.display = 'none';
}


/**
 * Deletes a comment from Firestore.
 * @param {string} commentId - The document ID of the comment to delete.
 */
async function handleDeleteComment(commentId) {
    if (!commentId) return;

    // Get confirmation
    if (!confirm("Are you sure you want to permanently delete this comment?")) {
        return;
    }

    showToast('Deleting...', 'Removing comment...', 'info');

    try {
        const docRef = doc(db, "srgb-component-comments", commentId);
        await deleteDoc(docRef);
        // No need to remove from UI, onSnapshot will handle it.
        showToast('Success', 'Comment deleted.', 'success');
    } catch (error) {
        console.error("Error deleting comment:", error);
        showToast('Error', 'Could not delete comment.', 'danger');
    }
}

/**
 * Loads and listens for real-time comments for a specific component ID.
 * @param {string} componentId - The Firestore document ID of the component.
 */
function loadComments(componentId) {
    if (!componentId) return;

    // 1. Unsubscribe from any old listener
    unsubscribeFromComments(); // This clears the list and hides placeholders

    // console.log(`Loading comments for component ID: ${componentId}`);

    // 2. [MODIFIED] Show loading, hide save prompt
    if (commentSection) commentSection.style.display = 'block'; // Ensure section is visible
    if (commentList) commentList.innerHTML = ''; // Clear list
    if (commentsLoadingPlaceholder) commentsLoadingPlaceholder.style.display = 'block';
    if (commentsSavePrompt) commentsSavePrompt.style.display = 'none'; // Hide save prompt

    // 3. Create the query
    const commentsRef = collection(db, 'srgb-component-comments');
    const q = query(commentsRef, where('componentId', '==', componentId), orderBy('createdAt', 'asc'));

    // 4. Start the real-time listener
    commentsUnsubscribe = onSnapshot(q, (querySnapshot) => {
        // console.log("Comment snapshot received.");
        // Hide loading placeholder once data arrives
        if (commentsLoadingPlaceholder) commentsLoadingPlaceholder.style.display = 'none';
        if (commentsSavePrompt) commentsSavePrompt.style.display = 'none'; // Ensure save prompt is hidden

        if (querySnapshot.empty && commentList.innerHTML === '') {
            commentList.innerHTML = '<p id="no-comments-placeholder" class="text-muted">No comments yet. Be the first!</p>';
            return;
        }

        // Use docChanges to efficiently update the list (optional, but good practice)
        // For simplicity in this step, we'll just re-render all docs.
        commentList.innerHTML = ''; // Clear list on each update
        querySnapshot.forEach((doc) => {
            // [MODIFIED] Pass the full doc to renderComment so we can get its ID
            renderComment(doc);
        });

    }, (error) => {
        console.error("Error loading comments:", error);
        showToast('Comment Error', 'Could not load comments.', 'danger');
        if (commentsLoadingPlaceholder) commentsLoadingPlaceholder.style.display = 'none';
        if (commentsSavePrompt) commentsSavePrompt.style.display = 'none'; // Ensure save prompt is hidden on error too
        if (commentList) commentList.innerHTML = '<p class="text-danger">Error loading comments.</p>';
    });
}

/**
 * Renders a single comment object into the DOM.
 * @param {object} doc - The comment document snapshot from Firestore.
 */
function renderComment(doc) { // [MODIFIED] Changed parameter
    if (!commentList) return;

    // [NEW] Get data and ID from the doc
    const data = doc.data();
    const commentId = doc.id;

    // Remove the "no comments" placeholder if it exists
    const placeholder = document.getElementById('no-comments-placeholder');
    if (placeholder) placeholder.remove();

    const defaultIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0iYmkgYmktcGVyc29uLWNpcmNsZSIgdmlld0JveD0iMCAwIDE2IDE2Ij4KICA8cGF0aCBkPSJNMTFhMyAzIDAgMTEtNiAwIDMgMyAwIDAxNiAweiIvPgogIDxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgZD0iTTAgOGE4IDggMCAxMDE2IDBBOCA4IDAgMDAwIDh6bTgtN2E3IDcgMCAwMTcgNzdhNyA3IDAgMDEtNyA3QTcgNyAwIDAxMSA4YTcgNyAwIDAxNy03eiIvPjwvIHN2Zz4=';

    const div = document.createElement('div');
    div.className = 'comment-item';

    const authorName = data.ownerName || 'Anonymous';
    const authorPhoto = data.ownerPhoto || defaultIcon;
    const commentDate = data.createdAt?.toDate()?.toLocaleString() || 'just now';
    const commentText = data.text || '';

    // --- [NEW] Check if the current user can delete this comment ---
    const user = auth.currentUser;
    const canDelete = user && (currentUserIsAdmin || user.uid === data.ownerId);
    // --- [END NEW] ---

    // [MODIFIED] Added delete button logic to the header
    div.innerHTML = `
        <img src="${authorPhoto}" alt="${authorName}" class="comment-avatar">
        <div class="comment-body">
            <div class="comment-header">
                <span class="comment-author">${authorName}</span>
                <span class="comment-date">${commentDate}</span>
                ${canDelete ? `
                    <span class="comment-delete ms-auto">
                        <a href="#" data-comment-id="${commentId}" class="text-danger" title="Delete comment">
                            <i class="bi bi-trash"></i>
                        </a>
                    </span>
                ` : ''}
            </div>
            <p class="comment-text"></p>
        </div>
    `;

    // Set textContent to prevent XSS from user-submitted comment text
    div.querySelector('.comment-text').textContent = commentText;

    commentList.appendChild(div);
    // Scroll to bottom
    commentList.scrollTop = commentList.scrollHeight;
}

/**
 * Handles the logic for posting a new comment to Firestore.
 * @param {string} commentText - The text of the comment.
 */
async function handlePostComment(commentText) {
    // --- [NEW] Word Filter Check ---
    const lowerComment = commentText.toLowerCase();
    const foundWord = DISALLOWED_WORDS.find(word => lowerComment.includes(word));
    if (foundWord) {
        showToast('Moderation', 'Your comment contains a disallowed word. Please revise it.', 'warning');
        return; // Stop the function
    }
    // --- [END NEW] ---

    const user = auth.currentUser;
    if (!user) {
        showToast('Error', 'You must be logged in to comment.', 'danger');
        return;
    }
    if (!currentComponentId) {
        showToast('Error', 'Cannot post comment: No component selected.', 'danger');
        return;
    }

    commentSubmitBtn.disabled = true;
    commentSubmitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Posting...';

    const commentData = {
        componentId: currentComponentId,
        ownerId: user.uid,
        ownerName: user.displayName || 'Anonymous',
        ownerPhoto: user.photoURL || null,
        text: commentText,
        createdAt: serverTimestamp()
    };

    try {
        const commentsRef = collection(db, 'srgb-component-comments');
        await addDoc(commentsRef, commentData);

        // Clear the textarea
        commentTextarea.value = '';
        // The onSnapshot listener will automatically display the new comment.
        // We just need to re-enable the button.

        // --- [MODIFIED] NOTIFICATION LOGIC ---
        // 1. Get the component owner's ID
        let componentOwnerId = null;
        try {
            const componentDocRef = doc(db, "srgb-components", currentComponentId);
            const componentDoc = await getDoc(componentDocRef);
            if (componentDoc.exists()) {
                componentOwnerId = componentDoc.data().ownerId;
            }
        } catch (err) {
            console.error("Error fetching component owner for notification:", err);
        }

        // 2. Create a notification for the component owner (if they aren't the commenter)
        if (componentOwnerId && componentOwnerId !== user.uid) {
            await addDoc(collection(db, "notifications"), {
                recipientId: componentOwnerId,
                senderId: user.uid,
                projectId: currentComponentId, // Use projectId to store componentId
                eventType: 'comment',
                notificationType: 'component', // <-- [NEW] ADD THIS TAG
                timestamp: serverTimestamp(),
                read: false
            });
        }

        // 3. Create a notification for the Admin
        if (ADMIN_UID && ADMIN_UID !== componentOwnerId) {
            await addDoc(collection(db, "notifications"), {
                recipientId: ADMIN_UID,
                senderId: user.uid,
                projectId: currentComponentId, // Use projectId to store componentId
                eventType: 'comment',
                notificationType: 'component', // <-- [NEW] ADD THIS TAG
                timestamp: serverTimestamp(),
                read: false
            });
        }
        // --- [END MODIFICATION] ---

    } catch (error) {
        console.error("Error posting comment:", error);
        showToast('Error', 'Could not post your comment.', 'danger');
    } finally {
        commentSubmitBtn.disabled = false;
        commentSubmitBtn.innerHTML = '<i class="bi bi-send me-1"></i> Post Comment';
    }
}

// /**
//      * Handles the logic for posting a new comment to Firestore.
//      * @param {string} commentText - The text of the comment.
//      */
// async function handlePostComment(commentText) {
//     // --- Word Filter Check ---
//     const lowerComment = commentText.toLowerCase();
//     const foundWord = DISALLOWED_WORDS.find(word => lowerComment.includes(word));
//     if (foundWord) {
//         showToast('Moderation', 'Your comment contains a disallowed word. Please revise it.', 'warning');
//         return;
//     }

//     const user = auth.currentUser;
//     if (!user) {
//         showToast('Error', 'You must be logged in to comment.', 'danger');
//         return;
//     }
//     if (!currentComponentId) {
//         showToast('Error', 'Cannot post comment: No component selected.', 'danger');
//         return;
//     }

//     commentSubmitBtn.disabled = true;
//     commentSubmitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Posting...';

//     const commentData = {
//         componentId: currentComponentId,
//         ownerId: user.uid,
//         ownerName: user.displayName || 'Anonymous',
//         ownerPhoto: user.photoURL || null,
//         text: commentText,
//         createdAt: serverTimestamp()
//     };

//     try {
//         const commentsRef = collection(db, 'srgb-component-comments');
//         await addDoc(commentsRef, commentData);

//         // Clear the textarea
//         commentTextarea.value = '';

//         // --- [MODIFIED] NOTIFICATION LOGIC ---

//         // 1. Get the component owner's ID from the database
//         let componentOwnerId = null;
//         try {
//             const componentDocRef = doc(db, "srgb-components", currentComponentId);
//             const componentDoc = await getDoc(componentDocRef);
//             if (componentDoc.exists()) {
//                 componentOwnerId = componentDoc.data().ownerId; // This might be null/undefined
//             }
//         } catch (err) {
//             console.error("Error fetching component owner for notification:", err);
//         }

//         // 2. Determine the *actual* recipient.
//         // If the component has an owner, use that.
//         // If it doesn't (ownerId is null), assume the person commenting is the owner.
//         let recipientId = componentOwnerId;
//         if (!recipientId) {
//             recipientId = user.uid; // Send notification to the commenter
//         }

//         // 3. Create a notification for the recipient (Owner or Commenter-as-Owner)
//         if (recipientId) {
//             await addDoc(collection(db, "notifications"), {
//                 recipientId: recipientId,
//                 senderId: user.uid,
//                 projectId: currentComponentId,
//                 eventType: 'comment',
//                 notificationType: 'component',
//                 timestamp: serverTimestamp(),
//                 read: false
//             });
//         }

//         // 4. Create a notification for the Admin (if the Admin isn't already the recipient)
//         if (ADMIN_UID && ADMIN_UID !== recipientId) {
//             await addDoc(collection(db, "notifications"), {
//                 recipientId: ADMIN_UID,
//                 senderId: user.uid,
//                 projectId: currentComponentId,
//                 eventType: 'comment',
//                 notificationType: 'component',
//                 timestamp: serverTimestamp(),
//                 read: false
//             });
//         }
//         // --- [END MODIFICATION] ---

//     } catch (error) {
//         console.error("Error posting comment:", error);
//         showToast('Error', 'Could not post your comment.', 'danger');
//     } finally {
//         commentSubmitBtn.disabled = false;
//         commentSubmitBtn.innerHTML = '<i class="bi bi-send me-1"></i> Post Comment';
//     }
// }


// --- UI & Tool Listeners ---
function setupPropertyListeners() {
    compNameInput.addEventListener('input', (e) => {
        // console.log('Property Listener: Product Name changed');
        if (!componentState) {
            console.warn('setupPropertyListeners: componentState not ready.');
            return;
        }

        // Get the new name from the input
        const newName = e.target.value;

        // Get the name *before* this change
        const oldName = componentState.name;

        // Check if the display name was synced to the *old* product name
        const wasSynced = !compDisplayNameInput.value || compDisplayNameInput.value === oldName;

        // Now, update the component state's name
        componentState.name = newName;

        // If it was synced, update the display name input and its state
        if (wasSynced) {
            compDisplayNameInput.value = newName;
            componentState.displayName = newName;
        }

        // Save to local storage
        autoSaveState();
    });

    // ADDED Listener for Display Name
    compDisplayNameInput.addEventListener('input', (e) => {
        // console.log('Property Listener: Display Name changed');
        if (componentState) { componentState.displayName = e.target.value; autoSaveState(); }
        else { console.warn('setupPropertyListeners: componentState not ready.'); }
    });

    // ADDED Listener for Brand
    compBrandInput.addEventListener('input', (e) => {
        // console.log('Property Listener: Brand changed');
        if (componentState) { componentState.brand = e.target.value; autoSaveState(); }
        else { console.warn('setupPropertyListeners: componentState not ready.'); }
    });

    compTypeInput.addEventListener('input', (e) => {
        // console.log('Property Listener: Type changed');
        if (componentState) { componentState.type = e.target.value; autoSaveState(); }
        else { console.warn('setupPropertyListeners: componentState not ready.'); }
    });

    // --- Image File Handling ---
    // console.log('Image Handling: Attaching file, click, and paste listeners.');

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
        // console.log('Image Handling: Paste zone clicked, setting focus.');
        imagePasteZone.focus();
    });

    // --- 3. NEW: Image Paste Zone 'paste' listener (with DEBUGGING) ---
    imagePasteZone.addEventListener('paste', (e) => {
        // console.log('Image Handling: Paste event detected.');
        e.preventDefault(); // Stop browser from pasting image as a broken element

        const items = e.clipboardData ? e.clipboardData.items : null;
        if (!items) {
            console.error('Image Handling: Browser does not support clipboard items.');
            showToast('Paste Error', 'Browser does not support clipboard items.', 'danger');
            return;
        }

        // console.log(`Image Handling: Found ${items.length} clipboard items.`);
        let foundFile = null;

        // Loop through all items to find the *actual* file
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            // console.log(`Item ${i}:`, { kind: item.kind, type: item.type });

            // This is the key: check *kind* is 'file' first.
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                // console.log(`Image Handling: Item ${i} is an image file. Grabbing it.`);
                foundFile = item.getAsFile();
                break; // Found it, stop looking
            }
        }

        if (foundFile) {
            // console.log('Image Handling: File successfully retrieved from clipboard.');
            handleImageFile(foundFile); // Use the same handler
        } else {
            // console.log('Image Handling: No usable file found in clipboard items.');
            showToast('Paste Error', 'No image file found in clipboard.', 'warning');
        }
    });

    // --- 4. NEW: Delete key listener for image paste zone ---
    imagePasteZone.addEventListener('keydown', (e) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault(); // Stop browser from trying to delete content

            // Check if there is an image to delete
            if (componentState && componentState.imageUrl) {
                // console.log('Image delete key pressed.');
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
    // console.log("Center spot overlaps, searching...");
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
                    // console.log(`Found spot at offset dx=${dx}, dy=${dy}`);
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

    const reverseSelectedBtn = document.getElementById('reverse-selected-btn');
    if (reverseSelectedBtn) {
        reverseSelectedBtn.addEventListener('click', handleReverseSelected);
    } else { console.warn("Reverse selected button not found."); }

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
            // console.log('SetTool: Clearing wiring (confirmed)');
            if (componentState) componentState.wiring = []; // Reset to empty array of arrays
            drawCanvas(); autoSaveState();
        } else {
            // console.log('SetTool: Clear wiring cancelled.');
        }
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
            case 'r':
            case 'R':
                handleReverseSelected();
                break;
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
                    // console.log('Keyboard Listener: Delete triggered');
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

    // console.log(`Creating circle: ${ledCount} LEDs, ${radiusUnits} unit radius (${radiusPx}px).`);

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

/**
 * Reverses the wiring order of the currently selected LEDs
 * within their respective circuits.
 */
function handleReverseSelected() {
    if (selectedLedIds.size === 0) {
        showToast('Action Blocked', 'Select two or more LEDs in a circuit to reverse.', 'warning');
        return;
    }

    let stateChanged = false;
    let totalReversedCount = 0;

    componentState.wiring.forEach((circuit, circuitIndex) => {
        if (!Array.isArray(circuit) || circuit.length < 2) {
            return; // Skip empty or single-LED circuits
        }

        // 1. Find the selected LEDs *in this circuit* and their indices
        const selectedInCircuit = []; // Stores { id, index }
        circuit.forEach((ledId, index) => {
            if (selectedLedIds.has(ledId)) {
                selectedInCircuit.push({ id: ledId, index: index });
            }
        });

        if (selectedInCircuit.length < 2) {
            // Need at least 2 selected LEDs in *this* circuit to reverse
            return;
        }

        // 2. We found selected LEDs. Time to reverse.
        stateChanged = true;
        totalReversedCount += selectedInCircuit.length;

        // 3. Get just the IDs in reverse order
        const reversedIds = selectedInCircuit.map(item => item.id).reverse();

        // 4. Go back to the original circuit and replace the LEDs at their
        //    original indices with the new reversed list.
        selectedInCircuit.forEach((item, i) => {
            // item.index is the *original* position (e.g., 1, 2, 3)
            // reversedIds[i] is the *new* ID for that position (e.g., 'd', 'c', 'b')
            componentState.wiring[circuitIndex][item.index] = reversedIds[i];
        });
    });

    if (stateChanged) {
        showToast('Wiring Reversed', `Reversed the order of ${totalReversedCount} selected LEDs.`, 'success');
        autoSaveState();
        drawCanvas();
    } else {
        showToast('Action Blocked', 'Select two or more LEDs *from the same circuit* to reverse.', 'warning');
    }
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
                    
                    <canvas id="thumb-${componentId}" width="170" height="170" style="padding: 10px;"></canvas>
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

            // --- [NEW] Render thumbnail if no image ---
            if (!imageUrl) {
                const thumbCanvas = card.querySelector(`#thumb-${componentId}`);
                if (thumbCanvas) {
                    renderComponentThumbnail(thumbCanvas, componentData);
                }
            }
            // --- [END NEW] ---

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

        // --- 7. [MODIFIED] Populate LED Dropdown with exact counts ---
        // Sort the numbers numerically (e.g., 8, 12, 64, 120)
        ledCountsToUse.sort((a, b) => a - b).forEach(count => {
            galleryFilterLeds.innerHTML += `<option value="${count}">${count} LEDs</option>`;
        });
        // --- END MODIFICATION ---


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
        // console.log("Lazy load triggered...");
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
    setupCommentListeners();

    // --- [NEW] Event listener for clicking a notification ---
    const notificationListContainer = document.getElementById('notification-list-container');
    if (notificationListContainer) {
        notificationListContainer.addEventListener('click', (e) => {
            const link = e.target.closest('.notification-link');
            if (link) {
                e.preventDefault();
                const { projectId, notificationId } = link.dataset;
                if (projectId && notificationId) {
                    // Use projectId, which holds the componentId
                    handleNotificationClick(projectId, notificationId);

                    // Manually close the dropdown
                    const dropdownToggle = document.getElementById('notification-dropdown-toggle');
                    if (dropdownToggle) {
                        const bsDropdown = bootstrap.Dropdown.getInstance(dropdownToggle);
                        if (bsDropdown) {
                            bsDropdown.hide();
                        }
                    }
                }
            }
        });
    }

    const deleteAllReadBtn = document.getElementById('delete-all-read-btn');
    if (deleteAllReadBtn) {
        deleteAllReadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Stop the dropdown from closing
            deleteAllReadNotifications();
        });
    }

    // --- [NEW] Event listener for Mark All Read button ---
    const markAllReadBtn = document.getElementById('mark-all-read-btn');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Stop the dropdown from closing
            markAllNotificationsAsRead();
        });
    }
    // --- [END NEW] ---

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

    // Show the welcome tutorial for new users ---
    // We run this after the initial component has been loaded
    try {
        const tutorialSeen = localStorage.getItem('srgbTutorialSeen');

        // If 'tutorialSeen' does not exist, show the modal
        if (!tutorialSeen) {
            // console.log("First visit: Showing the help modal.");
            const helpModalElement = document.getElementById('help-modal');

            if (helpModalElement) {
                // Use a short delay to ensure the main UI is stable
                setTimeout(() => {
                    // Get the Bootstrap modal instance
                    const helpModal = new bootstrap.Modal(helpModalElement);
                    helpModal.show();

                    // Mark as seen so it doesn't show again
                    localStorage.setItem('srgbTutorialSeen', 'true');
                }, 1000); // 1-second delay
            }
        }
    } catch (e) {
        // Catch errors (e.g., if localStorage is disabled)
        console.error("Error checking/showing tutorial modal:", e);
    }

});