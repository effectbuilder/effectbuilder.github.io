// --- IMPORT ---
// [MODIFIED] Import timeAgo
import { initializeTooltips, showToast, setupThemeSwitcher, renderComponentThumbnail, timeAgo } from './util.js';
import {
    auth, db,
    GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
    doc, deleteDoc, setDoc,
    query, where, getDocs, orderBy, limit, startAfter, getDoc, collection,
    // [MODIFIED] Add notification-related imports
    onSnapshot,
    updateDoc,
    writeBatch,
    documentId // [MODIFIED] Import documentId instead of FieldPath
} from './firebase.js';

// --- CONSTANTS ---
const ADMIN_UID = 'zMj8mtfMjXeFMt072027JT7Jc7i1';
const GALLERY_PAGE_SIZE = 12; // Load 12 per page for a 3-col grid

// --- GALLERY STATE ---
let lastVisibleComponent = null;
let isGalleryLoading = false;
let allComponentsLoaded = false;

// --- DOM Elements ---
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userSessionGroup = document.getElementById('user-session-group');
const userDisplay = document.getElementById('user-display');
const userPhoto = document.getElementById('user-photo');

const galleryComponentList = document.getElementById('user-component-list');
const gallerySearchInput = document.getElementById('gallery-search-input');
const galleryFilterType = document.getElementById('gallery-filter-type');
const galleryFilterBrand = document.getElementById('gallery-filter-brand');
const galleryFilterLeds = document.getElementById('gallery-filter-leds');
const galleryFilterSort = document.getElementById('gallery-filter-sort');
const galleryLoadingSpinner = document.getElementById('gallery-loading-spinner');
const galleryEndMessage = document.getElementById('gallery-end-message');

// ---
// --- AUTH FUNCTIONS (Copied from main.js) ---
// ---
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
    if (loginBtn) loginBtn.addEventListener('click', handleLogin);
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    onAuthStateChanged(auth, (user) => {
        const isLoggedIn = !!user;
        const defaultIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0iYmkgYmktcGVyc29uLWNpcmNsZSIgdmlld0JveD0iMCAwIDE2IDE2Ij4KICA8cGF0aCBkPSJNMTFhMyAzIDAgMTEtNiAwIDMgMyAwIDAxNiAweiIvPgogIDxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgZD0iTTAgOGE4IDggMCAxMDE2IDBBOCA4IDAgMDAwIDh6bTgtN2E3IDcgMCAwMTcgNzdhNyA3IDAgMDEtNyA3QTcgNyAwIDAxMSA4YTcgNyAwIDAxNy03eiIvPjwvIHN2Zz4=';

        if (isLoggedIn) {
            if (userDisplay) userDisplay.textContent = user.displayName || user.email;
            if (userPhoto) userPhoto.src = user.photoURL || defaultIcon;
            if (userSessionGroup) userSessionGroup.classList.remove('d-none');
            if (loginBtn) loginBtn.classList.add('d-none');
        } else {
            if (userSessionGroup) userSessionGroup.classList.add('d-none');
            if (loginBtn) loginBtn.classList.remove('d-none');
        }

        // Reload components on auth change to show/hide delete buttons
        loadUserComponents(true);
    });
}

// --- [NEW] NOTIFICATION FUNCTIONS (Copied from main.js) ---

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
        const componentIds = new Set();

        snapshot.forEach(doc => {
            const data = doc.data();
            allNotifications.push({ ...data, docId: doc.id });
            senderUids.add(data.senderId);
            if (data.projectId) {
                componentIds.add(data.projectId);
            }
        });

        const namesMap = await fetchDisplayNames(Array.from(senderUids));
        const componentNamesMap = await fetchComponentNames(Array.from(componentIds));

        const finalNotifications = allNotifications.map(notification => ({
            ...notification,
            senderName: namesMap.get(notification.senderId) || 'A User',
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
 * Handles clicking a notification on the GALLERY page.
 * Redirects to the builder and marks as read.
 */
async function handleNotificationClick(componentId, notificationId) {
    // 1. Mark the notification as read
    try {
        const notifDocRef = doc(db, "notifications", notificationId);
        await updateDoc(notifDocRef, { read: true });
    } catch (error) {
        console.error("Error marking notification as read:", error);
    }

    // 2. Redirect to the builder page with the component ID
    // (This is different from main.js, which loads it in-page)
    window.location.href = `index.html?id=${componentId}`;
}

async function markAllNotificationsAsRead() {
    const user = auth.currentUser;
    if (!user) return;

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

// ---
// --- GALLERY FUNCTIONS (Adapted from main.js) ---
// ---

/**
 * [MODIFIED] Populates all 3 filter dropdowns from the metadata document.
 * Includes one-time scan logic to build the filter list if it's missing.
 */
async function populateGalleryFilters() {
    if (!galleryFilterType || !galleryFilterBrand || !galleryFilterLeds) return;

    const currentType = galleryFilterType.value;
    const currentBrand = galleryFilterBrand.value;
    const currentLeds = galleryFilterLeds.value;

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
                let count = data.ledCount;
                if (typeof count !== 'number' && Array.isArray(data.leds)) {
                    count = data.leds.length;
                }
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
                }, { merge: true });
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

        // --- 7. Populate LED Dropdown ---
        ledCountsToUse.sort((a, b) => a - b).forEach(count => {
            galleryFilterLeds.innerHTML += `<option value="${count}">${count} LEDs</option>`;
        });

    } catch (error) {
        console.error("Error fetching gallery filters:", error);
        showToast("Filter Error", "Could not load filter options.", "danger");
    }

    // --- 8. Restore user selection ---
    galleryFilterType.value = currentType;
    galleryFilterBrand.value = currentBrand;
    galleryFilterLeds.value = currentLeds;
}

/**
 * Loads components from Firestore with pagination and server-side filtering.
 * @param {boolean} reset - If true, clears the list and starts from the beginning.
 */
async function loadUserComponents(reset = false) {
    if (isGalleryLoading) return;
    isGalleryLoading = true;

    if (!galleryComponentList) {
        console.error("Gallery list element not found.");
        isGalleryLoading = false;
        return;
    }

    const user = auth.currentUser;

    if (galleryLoadingSpinner) galleryLoadingSpinner.style.display = 'block';
    if (galleryEndMessage) galleryEndMessage.style.display = 'none';

    if (reset) {
        galleryComponentList.innerHTML = '';
        lastVisibleComponent = null;
        allComponentsLoaded = false;
        await populateGalleryFilters();
    }

    if (allComponentsLoaded && !reset) {
        isGalleryLoading = false;
        if (galleryLoadingSpinner) galleryLoadingSpinner.style.display = 'none';
        if (galleryEndMessage) galleryEndMessage.style.display = 'block';
        return;
    }

    try {
        const componentsCollection = collection(db, 'srgb-components');

        // --- SORTING LOGIC ---
        // Ensure the element exists before accessing .value
        const sortElement = document.getElementById('gallery-filter-sort');
        const sortField = sortElement ? sortElement.value : 'lastUpdated';

        const queryConstraints = [
            orderBy(sortField, 'desc'),
            limit(GALLERY_PAGE_SIZE)
        ];

        const searchTerm = gallerySearchInput ? gallerySearchInput.value.toLowerCase() : '';
        const filterType = galleryFilterType ? galleryFilterType.value : 'all';
        const filterBrand = galleryFilterBrand ? galleryFilterBrand.value : 'all';
        const filterLeds = galleryFilterLeds ? galleryFilterLeds.value : 'all';

        if (filterType !== 'all') queryConstraints.push(where('type', '==', filterType));
        if (filterBrand !== 'all') queryConstraints.push(where('brand', '==', filterBrand));
        if (filterLeds !== 'all') {
            const ledCount = parseInt(filterLeds, 10);
            if (!isNaN(ledCount)) queryConstraints.push(where('ledCount', '==', ledCount));
        }

        if (lastVisibleComponent) queryConstraints.push(startAfter(lastVisibleComponent));

        const q = query(componentsCollection, ...queryConstraints);
        const querySnapshot = await getDocs(q);

        let finalDocs = querySnapshot.docs;
        if (searchTerm) {
            finalDocs = finalDocs.filter(doc => {
                const componentName = (doc.data().name || 'untitled').toLowerCase();
                return componentName.includes(searchTerm);
            });
        }

        if (reset && finalDocs.length === 0) {
            galleryComponentList.innerHTML = '<div class="col"><p class="text-muted">No components match your filters.</p></div>';
        }

        finalDocs.forEach((docSnap) => {
            const componentData = docSnap.data();
            const componentId = docSnap.id;

            // --- DEFINITIONS ---
            const ledCount = componentData.ledCount || (Array.isArray(componentData.leds) ? componentData.leds.length : 0);
            const lastUpdated = componentData.lastUpdated?.toDate()?.toLocaleDateString() ?? 'Unknown date';
            const ownerName = componentData.ownerName || 'Anonymous';
            const componentName = componentData.name || 'Untitled';
            const imageUrl = componentData.imageUrl;
            const ownerId = componentData.ownerId;
            const likeCount = componentData.likeCount || 0;
            const viewCount = componentData.viewCount || 0;

            // --- [NEW] KEBAB MENU LOGIC ---
            // Only generate this HTML if the user is allowed to delete
            let kebabMenuHtml = '';
            if (user && (user.uid === ownerId || user.uid === ADMIN_UID)) {
                kebabMenuHtml = `
                    <div class="dropdown position-absolute top-0 end-0 mt-2 me-2" style="z-index: 10;">
                        <button class="btn btn-light btn-sm rounded-circle shadow-sm opacity-75" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end shadow">
                            <li>
                                <button class="dropdown-item text-danger" data-component-id="${componentId}-delete">
                                    <i class="bi bi-trash me-2"></i>Delete
                                </button>
                            </li>
                        </ul>
                    </div>`;
            }

            const col = document.createElement('div');
            col.className = 'col';

            // Image HTML (Same as before)
            let imageHtml = `
                <div class="card-img-top d-flex align-items-center justify-content-center gallery-image-container" 
                     data-component-id="${componentId}-img"
                     style="background-color: #212529; height: 180px; color: #6c757d; border-bottom: 1px solid var(--bs-border-color);">
                    <canvas id="thumb-${componentId}" width="180" height="180" style="padding: 10px;"></canvas>
                </div>`;

            if (imageUrl) {
                imageHtml = `
                    <div class="card-img-top d-flex align-items-center justify-content-center gallery-image-container" 
                         data-component-id="${componentId}-img"
                         style="background-color: #212529; height: 180px; padding: 0.5rem; border-bottom: 1px solid var(--bs-border-color);">
                        <img src="${imageUrl}" class="img-fluid rounded" alt="${componentName} preview" 
                             style="max-height: 100%; object-fit: contain;">
                    </div>`;
            }

            // --- RENDER CARD ---
            // Added 'position-relative' to the card so the kebab menu is positioned correctly
            col.innerHTML = `
                <div class="card h-100 bg-body-tertiary position-relative">
                    ${kebabMenuHtml}
                    ${imageHtml}
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title text-truncate" title="${componentName}">${componentName}</h5>
                        <small class="card-subtitle text-muted mb-2">By: ${ownerName}</small>
                        <div class="mb-3">
                            <span class="badge bg-primary">${componentData.brand || 'N/A'}</span>
                            <span class="badge bg-info text-dark">${componentData.type || 'N/A'}</span>
                            <span class="badge bg-secondary">${ledCount} LEDs</span>
                        </div>
                        <div class="mt-auto">
                            <button class="btn btn-primary w-100" data-component-id="${componentId}-load">
                                <i class="bi bi-folder2-open me-1"></i> Load in Builder
                            </button>
                        </div>
                    </div>
                    <div class="card-footer text-muted d-flex justify-content-between align-items-center" style="font-size: 0.85rem;">
                        <span>${lastUpdated}</span>
                        <div class="d-flex gap-3">
                            <span title="Likes"><i class="bi bi-heart-fill text-danger me-1"></i> ${likeCount}</span>
                            <span title="Views"><i class="bi bi-eye-fill text-secondary me-1"></i> ${viewCount}</span>
                        </div>
                    </div>
                </div>
            `;

            galleryComponentList.appendChild(col);

            // --- THUMBNAIL LOGIC ---
            if (!imageUrl) {
                const thumbCanvas = col.querySelector(`#thumb-${componentId}`);
                if (thumbCanvas) renderComponentThumbnail(thumbCanvas, componentData);
            }

            // --- EVENT LISTENERS ---
            const loadUrl = `index.html?id=${componentId}`;
            col.querySelector(`[data-component-id="${componentId}-load"]`)?.addEventListener('click', () => window.location.href = loadUrl);
            col.querySelector(`[data-component-id="${componentId}-img"]`)?.addEventListener('click', () => window.location.href = loadUrl);

            // Attach listener to the new dropdown delete button
            const deleteButton = col.querySelector(`[data-component-id="${componentId}-delete"]`);
            if (deleteButton) {
                deleteButton.addEventListener('click', (e) => {
                    e.preventDefault(); // Prevent menu closing weirdness
                    handleDeleteComponent(e, componentId, componentName, imageUrl, ownerId);
                });
            }
        });

        if (galleryLoadingSpinner) galleryLoadingSpinner.style.display = 'none';

        if (querySnapshot.docs.length > 0) {
            lastVisibleComponent = querySnapshot.docs[querySnapshot.docs.length - 1];
        }

        if (querySnapshot.size < GALLERY_PAGE_SIZE) {
            allComponentsLoaded = true;
            if (galleryEndMessage) galleryEndMessage.style.display = 'block';
        }

    } catch (error) {
        console.error("Error loading user components:", error);
        galleryComponentList.innerHTML = '<div class="col"><div class="alert alert-danger">Error loading components. See console for details.</div></div>';

        // Helper for Index Errors
        if (error.code === 'failed-precondition') {
            galleryComponentList.innerHTML = '<div class="col"><div class="alert alert-warning">Sort Index Missing. Click the link in the console to create it.</div></div>';
        }

        showToast('Load Error', 'Could not fetch components.', 'danger');
        if (galleryLoadingSpinner) galleryLoadingSpinner.style.display = 'none';
    } finally {
        isGalleryLoading = false;
    }
}

/**
 * Deletes a component from Firestore and Storage.
 */
async function handleDeleteComponent(e, docId, componentName, imageUrl, ownerId) {
    const user = auth.currentUser;
    if (!user || (user.uid !== ownerId && user.uid !== ADMIN_UID)) return;

    if (!confirm(`Are you sure you want to delete "${componentName || 'Untitled'}"? This cannot be undone.`)) {
        return;
    }

    showToast('Deleting...', `Deleting ${componentName}...`, 'info');

    // Disable the button to prevent double-click
    const button = e.target.closest('button');
    if (button) button.disabled = true;

    try {
        // Note: We don't delete images from storage, as they might be shared.
        // This is a simple implementation. Deleting storage objects is complex.

        const docRef = doc(db, 'srgb-components', docId);
        await deleteDoc(docRef);

        showToast('Success', `Successfully deleted "${componentName}".`, 'success');

        const cardToRemove = e.target.closest('.col');
        if (cardToRemove) {
            cardToRemove.remove();
        }

    } catch (error) {
        console.error("Error deleting component:", error);
        showToast('Error', `Failed to delete component: ${error.message}`, 'danger');
        if (button) button.disabled = false;
    }
}

/**
 * [MODIFIED] Triggers loading the next page when the user scrolls the correct container.
 */
function handleGalleryScroll(e) {
    if (isGalleryLoading || allComponentsLoaded) return;

    // Get the scrolling element from the event
    const listElement = e.target;
    if (!listElement) return;

    const buffer = 300; // px from bottom
    // Check if user is near the bottom of *this element*
    if (listElement.scrollTop + listElement.clientHeight >= listElement.scrollHeight - buffer) {
        console.log("Lazy load triggered by page scroll...");
        loadUserComponents(false); // false = append next page
    }
}

// ---
// --- INITIALIZATION ---
// ---
document.addEventListener('DOMContentLoaded', () => {
    initializeTooltips();

    // Setup theme switcher first so colors are correct
    setupThemeSwitcher(null); // No canvas to redraw

    // Setup auth listeners
    setupAuthListeners();

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
    if (galleryFilterSort) {
        galleryFilterSort.addEventListener('change', () => loadUserComponents(true));
    }

    // --- [NEW] Event listener for Delete All Read button ---
    const deleteAllReadBtn = document.getElementById('delete-all-read-btn');
    if (deleteAllReadBtn) {
        deleteAllReadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Stop the dropdown from closing
            deleteAllReadNotifications();
        });
    }

    // --- [MODIFIED] Attach scroll listener to the correct element ---
    // The scrolling container is the parent element of the component list
    const galleryScrollingContainer = galleryComponentList ? galleryComponentList.parentElement : null;

    if (galleryScrollingContainer) {
        galleryScrollingContainer.addEventListener('scroll', handleGalleryScroll);
    } else {
        console.error("Could not find gallery scrolling container for lazy-loading.");
    }
    // --- [END MODIFIED] ---

    // Initial load of components (triggered by auth listener)
    // We call it here just in case auth is delayed
    // if (!auth.currentUser) {
    //     loadUserComponents(true);
    // }
});