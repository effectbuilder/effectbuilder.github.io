// --- IMPORT ---
import { initializeTooltips, showToast, setupThemeSwitcher } from './util.js';
import {
    auth, db,
    GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
    doc, deleteDoc,
    query, where, getDocs, orderBy, limit, startAfter, getDoc, collection
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

// ---
// --- GALLERY FUNCTIONS (Adapted from main.js) ---
// ---

/**
 * Populates all 3 filter dropdowns from the metadata document.
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

        if (docSnap.exists() && docSnap.data()) {
            const data = docSnap.data();
            if (data.allTypes) typesToUse = data.allTypes;
            if (data.allBrands) brandsToUse = data.allBrands;
            if (data.allLedCounts) ledCountsToUse = data.allLedCounts;
        } else {
            console.warn("Filters doc empty or missing.");
            // We don't do the one-time scan here for performance.
            // It will be built next time someone saves a component.
        }

        typesToUse.sort().forEach(type => {
            galleryFilterType.innerHTML += `<option value="${type}">${type}</option>`;
        });
        brandsToUse.sort().forEach(brand => {
            galleryFilterBrand.innerHTML += `<option value="${brand}">${brand}</option>`;
        });
        ledCountsToUse.sort((a, b) => a - b).forEach(count => {
            galleryFilterLeds.innerHTML += `<option value="${count}">${count} LEDs</option>`;
        });

    } catch (error) {
        console.error("Error fetching gallery filters:", error);
        showToast("Filter Error", "Could not load filter options.", "danger");
    }

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
    
    // If all are loaded and we're not resetting, just exit.
    if (allComponentsLoaded && !reset) {
        isGalleryLoading = false;
        if (galleryLoadingSpinner) galleryLoadingSpinner.style.display = 'none';
        if (galleryEndMessage) galleryEndMessage.style.display = 'block';
        return;
    }

    try {
        const componentsCollection = collection(db, 'srgb-components');
        const queryConstraints = [
            orderBy('lastUpdated', 'desc'),
            limit(GALLERY_PAGE_SIZE)
        ];

        const searchTerm = gallerySearchInput ? gallerySearchInput.value.toLowerCase() : '';
        const filterType = galleryFilterType ? galleryFilterType.value : 'all';
        const filterBrand = galleryFilterBrand ? galleryFilterBrand.value : 'all';
        const filterLeds = galleryFilterLeds ? galleryFilterLeds.value : 'all';

        if (filterType !== 'all') {
            queryConstraints.push(where('type', '==', filterType));
        }
        if (filterBrand !== 'all') {
            queryConstraints.push(where('brand', '==', filterBrand));
        }
        if (filterLeds !== 'all') {
            const ledCount = parseInt(filterLeds, 10);
            if (!isNaN(ledCount)) {
                queryConstraints.push(where('ledCount', '==', ledCount));
            }
        }

        if (lastVisibleComponent) {
            queryConstraints.push(startAfter(lastVisibleComponent));
        }

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
            
            const col = document.createElement('div');
            col.className = 'col';

            const ledCount = componentData.ledCount || (Array.isArray(componentData.leds) ? componentData.leds.length : 0);
            const lastUpdated = componentData.lastUpdated?.toDate()?.toLocaleDateString() ?? 'Unknown date';
            const ownerName = componentData.ownerName || 'Anonymous';
            const componentName = componentData.name || 'Untitled';
            const imageUrl = componentData.imageUrl;
            const ownerId = componentData.ownerId;

            let imageHtml = `
                <div class="card-img-top d-flex align-items-center justify-content-center gallery-image-container" 
                     data-component-id="${componentId}-img"
                     style="background-color: #212529; height: 180px; color: #6c757d; border-bottom: 1px solid var(--bs-border-color);">
                    <svg viewBox="0 0 32 32" fill="currentColor" width="64" height="64">
                        <circle cx="26" cy="16" r="3" /> <circle cx="23" cy="23" r="3" /> <circle cx="16" cy="26" r="3" />
                        <circle cx="9" cy="23" r="3" /> <circle cx="6" cy="16" r="3" /> <circle cx="9" cy="9" r="3" />
                        <circle cx="16" cy="6" r="3" /> <circle cx="23" cy="9" r="3" />
                    </svg>
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
            
            const deleteButtonHtml = (user && (user.uid === ownerId || user.uid === ADMIN_UID))
                ? `<button class="btn btn-danger btn-sm" data-component-id="${componentId}-delete" title="Delete Component"><i class="bi bi-trash"></i></button>`
                : '';

            col.innerHTML = `
                <div class="card h-100 bg-body-tertiary">
                    ${imageHtml}
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${componentName}</h5>
                        <small class="card-subtitle text-muted mb-2">By: ${ownerName}</small>
                        <div class="mb-3">
                            <span class="badge bg-primary">${componentData.brand || 'N/A'}</span>
                            <span class="badge bg-info text-dark">${componentData.type || 'N/A'}</span>
                            <span class="badge bg-secondary">${ledCount} LEDs</span>
                        </div>
                        <div class="mt-auto d-flex justify-content-between align-items-center">
                            <button class="btn btn-primary" data-component-id="${componentId}-load">
                                <i class="bi bi-folder2-open me-1"></i> Load in Builder
                            </button>
                            ${deleteButtonHtml}
                        </div>
                    </div>
                    <div class="card-footer text-muted" style="font-size: 0.85rem;">
                        Updated: ${lastUpdated}
                    </div>
                </div>
            `;
            
            galleryComponentList.appendChild(col);

            // --- Attach Listeners ---
            // On this page, "Load" just links to the builder with the ID
            const loadUrl = `index.html?id=${componentId}`;
            col.querySelector(`[data-component-id="${componentId}-load"]`)?.addEventListener('click', () => {
                window.location.href = loadUrl;
            });
            col.querySelector(`[data-component-id="${componentId}-img"]`)?.addEventListener('click', () => {
                 window.location.href = loadUrl;
            });

            const deleteButton = col.querySelector(`[data-component-id="${componentId}-delete"]`);
            if (deleteButton) {
                deleteButton.addEventListener('click', (e) => {
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
            console.log("All components loaded.");
        }

    } catch (error) {
        console.error("Error loading user components:", error);
        galleryComponentList.innerHTML = '<div class="col"><div class="alert alert-danger">Error loading components. See console for details.</div></div>';
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
 * Triggers loading the next page when the user scrolls near the bottom.
 */
function handleGalleryScroll() {
    if (isGalleryLoading || allComponentsLoaded) return;

    // We check the scroll position of the whole window
    const buffer = 300; // px from bottom
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - buffer) {
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

    // Add scroll listener for lazy loading
    window.addEventListener('scroll', handleGalleryScroll);

    // Initial load of components (triggered by auth listener)
    // We call it here just in case auth is delayed
    if (!auth.currentUser) {
         loadUserComponents(true);
    }
});