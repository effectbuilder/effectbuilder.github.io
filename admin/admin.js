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
    'notifications',                // From Effect Builder
    'srgb-component-comments',      // Comments on components
    'srgb-effect-comments',         // Comments on effects
    'showcase_stats',               // Statistics for the showcase page
    'srgb-effect-notifications'     // Notifications related to effects
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
        provider.addScope('https://www.googleapis.com/auth/drive.file');

        try {
            const result = await signInWithPopup(auth, provider);
            // This is the specific Google Token required for Drive API
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;

            if (token) {
                sessionStorage.setItem('googleDriveToken', token);
            }
        } catch (error) {
            console.error("Error during sign-in:", error);
            showToast('Login Error', error.message, 'danger');
        }
    });

    logoutBtn.addEventListener('click', async () => {
        try {
            await signOut(auth);
            sessionStorage.removeItem('googleDriveToken');
        } catch (error) {
            console.error("Error during sign-out:", error);
        }
    });

    onAuthStateChanged(auth, (user) => {
        if (user) {
            if (user.uid === ADMIN_UID) {
                showAdminContent();
                userDisplay.textContent = user.displayName || user.email;
                userPhoto.src = user.photoURL || '';
                userSessionGroup.classList.remove('d-none');
                loginBtn.classList.add('d-none');
            } else {
                showAccessDenied();
            }
        } else {
            loadingEl.classList.add('d-none');
            deniedEl.classList.add('d-none');
            contentEl.classList.add('d-none');
            userSessionGroup.classList.add('d-none');
            loginBtn.classList.remove('d-none');
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

        showToast('Cloud Sync', 'Uploading backup to Google Drive...', 'info');
        await uploadToDrive(zipBlob, filename);
        showToast('Success', 'Backup sucessfully uploaded!', 'success');

    } catch (error) {
        console.error("Error creating zip backup:", error);
        showToast('Backup Failed', `Error: ${error.message}`, 'danger');
    } finally {
        // Re-enable the button
        downloadBtn.disabled = false;
        downloadBtn.innerHTML = '<i class="bi bi-file-earmark-zip-fill me-2"></i> Download Database Backup';
    }
}

/**
 * Finds a folder by name or creates it if it doesn't exist.
 * Returns the folder ID.
 */
async function getOrCreateFolder(token, folderName) {
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(
        `name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
    )}`;

    // 1. Search for the folder
    const searchRes = await fetch(searchUrl, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const searchData = await searchRes.json();

    if (searchData.files && searchData.files.length > 0) {
        return searchData.files[0].id; // Return existing folder ID
    }

    // 2. Create the folder if not found
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder'
        })
    });
    const folder = await createRes.json();
    return folder.id;
}

/**
 * Uploads the blob to a specific folder in Google Drive
 */
async function uploadToDrive(zipBlob, filename) {
    const token = sessionStorage.getItem('googleDriveToken');
    if (!token) {
        showToast('Drive Error', 'Please sign in again to enable Drive upload.', 'danger');
        return;
    }

    try {
        // Step 1: Get or create the destination folder
        const folderId = await getOrCreateFolder(token, 'SRGB_Backups');

        // Step 2: Prepare multipart upload with the 'parents' field
        const metadata = {
            name: filename,
            mimeType: 'application/zip',
            parents: [folderId] // This line puts it in the specific folder
        };

        const formData = new FormData();
        formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        formData.append('file', zipBlob);

        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });

        if (response.ok) {
            showToast('Cloud Backup', `Saved to 'SRGB_Backups' folder!`, 'success');
        } else {
            const err = await response.json();
            throw new Error(err.error.message);
        }
    } catch (error) {
        console.error("Drive Error:", error);
        showToast('Drive Failed', error.message, 'danger');
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