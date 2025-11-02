// --- IMPORTS ---
import { initializeTooltips, showToast, setupThemeSwitcher } from '../builder/util.js';
import {
    auth, db,
    GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged,
    collection, getDocs, query
} from '../builder/firebase.js';

// --- CONSTANTS ---
// Copied from your main.js. Make sure it matches!
const ADMIN_UID = 'zMj8mtfMjXeFMt072027JT7Jc7i1';
const COLLECTIONS_TO_BACKUP = [
    'users',                        // Shared user data
    'srgb-components',              // From Component Builder
    'srgb-components-metadata',     // From Component Builder
    'projects',                     // From Effect Builder
    'bans',                         // From Effect Builder
    'admins',                       // From Effect Builder
    'notifications'                 // From Effect Builder
];

// --- DOM ELEMENTS ---
const loadingEl = document.getElementById('admin-loading');
const deniedEl = document.getElementById('admin-denied');
const contentEl = document.getElementById('admin-content');
const downloadBtn = document.getElementById('download-zip-btn');

// Navbar Elements (for auth)
const loginBtn = document.getElementById('login-btn');
const logoutBtn = document.getElementById('logout-btn');
const userSessionGroup = document.getElementById('user-session-group');
const userDisplay = document.getElementById('user-display');
const userPhoto = document.getElementById('user-photo');

// --- AUTHENTICATION LOGIC ---

/**
 * Shows the admin content
 */
function showAdminContent() {
    loadingEl.classList.add('d-none');
    deniedEl.classList.add('d-none');
    contentEl.classList.remove('d-none');
}

/**
 * Shows the access denied message
 */
function showAccessDenied() {
    loadingEl.classList.add('d-none');
    deniedEl.classList.remove('d-none');
    contentEl.classList.add('d-none');
}

/**
 * Sets up the navbar authentication listeners
 */
function setupAuthListeners() {
    loginBtn.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error("Error during sign-in:", error);
            showToast('Login Error', error.message, 'danger');
        }
    });

    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            showToast('Logged Out', 'You have been signed out.', 'info');
        } catch (error) {
            console.error("Error during sign-out:", error);
            showToast('Logout Error', error.message, 'danger');
        }
    });

    onAuthStateChanged(auth, (user) => {
        const isLoggedIn = !!user;
        const defaultIcon = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iY3VycmVudENvbG9yIiBjbGFzcz0iYmkgYmktcGVyc29uLWNpcmNsZSIgdmlld0JveD0iMCAwIDE2IDE2Ij4KICA8cGF0aCBkPSJNMTFhMyAzIDAgMTEtNiAwIDMgMyAwIDAxNiAweiIvPgogIDxwYXRoIGZpbGwtcnVsZT0iZXZlbm9kZCIgZD0iTTAgOGE4IDggMCAxMDE2IDBBOCA4IDAgMDAwIDh6bTgtN2E3IDcgMCAwMTcgNzdhNyA3IDAgMDEtNyA3QTcgNyAwIDAxMSA4YTcgNyAwIDAxNy03eiIvPjwvIHN2Zz4=';

        if (isLoggedIn) {
            // Update the Navbar UI
            if (userDisplay) userDisplay.textContent = user.displayName || user.email;
            if (userPhoto) userPhoto.src = user.photoURL || defaultIcon;
            if (userSessionGroup) userSessionGroup.classList.remove('d-none');
            if (loginBtn) loginBtn.classList.add('d-none');

            // --- Admin Permission Check ---
            if (user.uid === ADMIN_UID) {
                showAdminContent();
            } else {
                showAccessDenied();
            }
        } else {
            // Not logged in, show access denied
            if (userSessionGroup) userSessionGroup.classList.add('d-none');
            if (loginBtn) loginBtn.classList.remove('d-none');
            showAccessDenied();
        }
    });
}

// --- DOWNLOAD LOGIC ---

/**
 * Fetches all documents in a collection and returns them as an object
 * @param {string} collectionName The name of the Firestore collection
 * @returns {Promise<object>} An object where the keys are the document IDs
 */
async function fetchCollectionData(collectionName) {
    const collectionRef = collection(db, collectionName);
    const q = query(collectionRef);
    const querySnapshot = await getDocs(q);

    const collectionData = {};
    querySnapshot.forEach((doc) => {
        collectionData[doc.id] = doc.data();
    });

    console.log(`Fetched ${querySnapshot.size} documents from ${collectionName}`);
    return collectionData;
}

/**
 * Triggers the browser download for a blob
 * @param {Blob} blob The file content
 * @param {string} filename The filename to download
 */
function triggerZipDownload(blob, filename) {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
}

/**
 * Main handler for the download button
 */
async function handleDownloadZip() {
    // Check if JSZip is loaded
    if (typeof JSZip === 'undefined') {
        showToast('Error', 'JSZip library could not be loaded.', 'danger');
        console.error("JSZip is not loaded!");
        return;
    }

    showToast('Starting Backup', 'Fetching all collections...', 'info');
    downloadBtn.disabled = true;
    downloadBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Fetching data...';

    try {
        const zip = new JSZip();

        // An array of promises to fetch all collections in parallel
        const fetchPromises = COLLECTIONS_TO_BACKUP.map(async (collectionName) => {
            const data = await fetchCollectionData(collectionName);
            const jsonString = JSON.stringify(data, null, 2);
            zip.file(`${collectionName}.json`, jsonString);
        });

        // Wait for all collections to be processed
        await Promise.all(fetchPromises);

        showToast('Generating ZIP', 'Compressing files...', 'info');
        downloadBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Zipping...';

        // Generate the zip file
        const zipBlob = await zip.generateAsync({
            type: "blob",
            compression: "DEFLATE",
            compressionOptions: {
                level: 9
            }
        });

        // Generate a timestamped filename
        const timestamp = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD'
        const filename = `srgb-builder-backup-${timestamp}.zip`;

        // Trigger the download
        triggerZipDownload(zipBlob, filename);

        showToast('Success', 'The backup download has started.', 'success');

    } catch (error) {
        console.error("Error creating zip backup:", error);
        showToast('Backup Failed', `Error: ${error.message}`, 'danger');
    } finally {
        // Re-enable the button
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = '<i class="bi bi-file-earmark-zip-fill me-2"></i> Download Database Backup';
    }
}


// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initializeTooltips();
    setupThemeSwitcher(null); // No canvas to redraw
    setupAuthListeners();

    // Bind the download button
    downloadBtn.addEventListener('click', handleDownloadZip);
});