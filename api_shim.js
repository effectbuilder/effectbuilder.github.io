
// api_shim.js - Firebase Replacement using php-crud-api

const API_BASE = 'api.php/records';
const AUTH_API = 'auth.php';

// --- Authentication ---

class Auth {
    constructor() {
        this.currentUser = null;
        this.listeners = [];
        this.checkSession();
    }

    async checkSession() {
        try {
            const res = await fetch(`${AUTH_API}?action=me`);
            const data = await res.json();
            if (data.user) {
                this.currentUser = { ...data.user, uid: data.user.id.toString() }; // Map ID to uid
            } else {
                this.currentUser = null;
            }
            this.notifyListeners();
        } catch (e) {
            console.error("Auth check failed", e);
            this.currentUser = null;
            this.notifyListeners();
        }
    }

    onAuthStateChanged(callback) {
        this.listeners.push(callback);
        // Immediately verify session
        this.checkSession().then(() => callback(this.currentUser));
        return () => {
            this.listeners = this.listeners.filter(l => l !== callback);
        };
    }

    notifyListeners() {
        this.listeners.forEach(cb => cb(this.currentUser));
    }

    async signInWithPopup(provider) {
        // Trigger the Google Login flow handled by index.html script
        // This is a shim, so we simulate the popup flow or redirect
        // For Google, we use the GSI client in index.html.
        // If provider is GoogleAuthProvider, we expect the UI to handle it.
        // But main.js calls signInWithPopup directly.
        // We will show our own modal.
        const modal = new bootstrap.Modal(document.getElementById('login-modal'));
        modal.show();

        return new Promise((resolve, reject) => {
             // We can't easily return a promise here that resolves when the user *actually* signs in
             // via the modal, unless we hook into the modal's success event.
             // We'll dispatch a custom event when login succeeds.
             const onLogin = (e) => {
                 window.removeEventListener('srgb-login-success', onLogin);
                 resolve({ user: this.currentUser });
             };
             window.addEventListener('srgb-login-success', onLogin);
        });
    }

    async signOut() {
        await fetch(`${AUTH_API}?action=logout`, { method: 'POST' });
        this.currentUser = null;
        this.notifyListeners();
    }
}

export const auth = new Auth();
export const getAuth = () => auth;
export class GoogleAuthProvider {}
export const signInWithPopup = (auth, provider) => auth.signInWithPopup(provider);
export const signOut = (auth) => auth.signOut();
export const onAuthStateChanged = (auth, cb) => auth.onAuthStateChanged(cb);


// --- Firestore Shim ---

class Firestore {
    constructor() {}
}

export const db = new Firestore();
export const getFirestore = () => db;

// Collection Reference
export const collection = (db, path) => ({ type: 'collection', path });

// Document Reference
export const doc = (db, path, id) => {
    if (path.type === 'collection') path = path.path;
    if (!id && path.includes('/')) {
        const parts = path.split('/');
        return { type: 'doc', path: parts[0], id: parts[1] };
    }
    return { type: 'doc', path, id };
};

// Query Construction
export const query = (collectionRef, ...constraints) => {
    return {
        type: 'query',
        path: collectionRef.path,
        constraints
    };
};

export const where = (field, op, value) => ({ type: 'where', field, op, value });
export const orderBy = (field, dir = 'asc') => ({ type: 'orderBy', field, dir });
export const limit = (n) => ({ type: 'limit', n });
export const startAfter = (docSnapshot) => ({ type: 'startAfter', doc: docSnapshot });

// Fetch Data
export const getDoc = async (docRef) => {
    try {
        const res = await fetch(`${API_BASE}/${docRef.path}/${docRef.id}`);
        if (!res.ok) throw new Error('Doc not found');
        const data = await res.json();
        return {
            exists: () => !!data,
            id: docRef.id.toString(),
            data: () => processData(data),
            ref: docRef
        };
    } catch (e) {
        return { exists: () => false, data: () => undefined, id: docRef.id.toString() };
    }
};

export const getDocs = async (queryObj) => {
    let url = `${API_BASE}/${queryObj.path}?`;
    const params = [];

    // Default page size if not specified
    let pageSize = 1000;
    let page = 1;

    // Process constraints
    if (queryObj.constraints) {
        queryObj.constraints.forEach(c => {
            if (c.type === 'where') {
                if (c.op === 'array-contains') {
                    params.push(`filter=${c.field},cs,${c.value}`);
                } else {
                    let op = 'eq';
                    if (c.op === '>') op = 'gt';
                    if (c.op === '>=') op = 'ge';
                    if (c.op === '<') op = 'lt';
                    if (c.op === '<=') op = 'le';
                    params.push(`filter=${c.field},${op},${c.value}`);
                }
            } else if (c.type === 'orderBy') {
                params.push(`order=${c.field},${c.dir}`);
            } else if (c.type === 'limit') {
                pageSize = c.n;
            } else if (c.type === 'startAfter') {
                // Here is the tricky part. We need to find the page number.
                // If the docSnapshot has a _page index, we use it.
                if (c.doc._page) {
                    page = c.doc._page + 1;
                }
            }
        });
    }

    params.push(`page=${page},${pageSize}`);

    const res = await fetch(url + params.join('&'));
    const json = await res.json();
    const records = json.records || [];

    const docs = records.map((rec, index) => ({
        id: rec.id.toString(),
        data: () => processData(rec),
        exists: () => true,
        // Attach metadata for pagination
        _page: page,
        _index: index
    }));

    return {
        docs,
        empty: docs.length === 0,
        size: docs.length,
        forEach: (cb) => docs.forEach(cb)
    };
};

// Write Data
export const addDoc = async (collectionRef, data) => {
    const payload = prepareData(data);
    const res = await fetch(`${API_BASE}/${collectionRef.path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
    const id = await res.json(); // API returns the ID
    return { id: id.toString() };
};

export const updateDoc = async (docRef, data) => {
    // Check for special operations
    let hasSpecialOps = false;
    for (const key in data) {
        if (data[key] && typeof data[key] === 'object' && data[key].__op) {
            hasSpecialOps = true;
            break;
        }
    }

    if (hasSpecialOps) {
        // Fetch current data to apply operations
        const currentDoc = await getDoc(docRef);
        if (!currentDoc.exists()) throw new Error("Document does not exist");
        const currentData = currentDoc.data();

        const newData = { ...currentData };
        for (const key in data) {
            const val = data[key];
            if (val && typeof val === 'object' && val.__op) {
                if (val.__op === 'increment') {
                    newData[key] = (currentData[key] || 0) + val.n;
                } else if (val.__op === 'arrayUnion') {
                    const arr = Array.isArray(currentData[key]) ? currentData[key] : [];
                    if (!arr.includes(val.val)) arr.push(val.val);
                    newData[key] = arr;
                } else if (val.__op === 'arrayRemove') {
                    const arr = Array.isArray(currentData[key]) ? currentData[key] : [];
                    newData[key] = arr.filter(item => item !== val.val);
                }
            } else {
                newData[key] = val;
            }
        }
        const payload = prepareData(newData);
        await fetch(`${API_BASE}/${docRef.path}/${docRef.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    } else {
        const payload = prepareData(data);
        await fetch(`${API_BASE}/${docRef.path}/${docRef.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
    }
};

export const deleteDoc = async (docRef) => {
    await fetch(`${API_BASE}/${docRef.path}/${docRef.id}`, {
        method: 'DELETE'
    });
};

export const setDoc = async (docRef, data) => {
    // Treat as update or create with specific ID if API supports it.
    // php-crud-api supports POST with ID to create specific ID.
    const payload = prepareData(data);
    await fetch(`${API_BASE}/${docRef.path}/${docRef.id}`, {
        method: 'PUT', // or POST if creating new
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });
};

export const runTransaction = async (db, updateFunction) => {
    // Mock transaction: Fetch -> Run Logic -> Update
    // Pass a fake "transaction" object
    const transaction = {
        get: async (docRef) => await getDoc(docRef),
        update: async (docRef, data) => await updateDoc(docRef, data)
    };
    await updateFunction(transaction);
};

// Real-time (Polling)
export const onSnapshot = (queryOrRef, callback, errorCallback) => {
    const fetchData = async () => {
        try {
            let snapshot;
            if (queryOrRef.type === 'query') {
                snapshot = await getDocs(queryOrRef);
            } else {
                const doc = await getDoc(queryOrRef);
                snapshot = doc; // For doc, snapshot IS the doc
            }
            callback(snapshot);
        } catch (e) {
            if (errorCallback) errorCallback(e);
        }
    };

    fetchData(); // Initial load
    const interval = setInterval(fetchData, 5000); // Poll every 5s
    return () => clearInterval(interval);
};

// Helpers
export const serverTimestamp = () => new Date().toISOString().slice(0, 19).replace('T', ' '); // MySQL format
export const increment = (n) => ({ __op: 'increment', n }); // Not supported directly, need manual handling in app or backend
export const arrayUnion = (val) => ({ __op: 'arrayUnion', val });
export const arrayRemove = (val) => ({ __op: 'arrayRemove', val });
export const documentId = () => 'id';

// Data Processing
function prepareData(data) {
    // Handle nested objects (JSON columns) and special ops
    const processed = {};
    for (const key in data) {
        const val = data[key];
        if (val && typeof val === 'object' && val.__op) {
            // Skip special ops for now, they need read-modify-write in the app logic
            // The shim's runTransaction handles the read-modify-write.
            // But if used in updateDoc directly, we might ignore them or log warning.
            console.warn(`Operation ${val.__op} not fully supported in shim without transaction.`);
        } else if (val instanceof Date) {
            processed[key] = val.toISOString().slice(0, 19).replace('T', ' ');
        } else if (typeof val === 'object' && val !== null) {
            // Automatically JSON stringify objects for JSON columns?
            // php-crud-api might handle JSON if column type is JSON.
            // But usually we send the object and the API handles it.
            processed[key] = val;
        } else {
            processed[key] = val;
        }
    }
    return processed;
}

function processData(data) {
    // Parse JSON strings back to objects if necessary, convert dates
    const processed = { ...data };
    // We might need to guess which fields are JSON or Dates.
    // For now, return as is. The app expects JSON objects for 'configs' and 'objects'.
    // php-crud-api usually returns JSON columns as objects automatically.

    // Handle specific fields known to be dates
    if (processed.createdAt) processed.createdAt = { toDate: () => new Date(processed.createdAt) };
    if (processed.updatedAt) processed.updatedAt = { toDate: () => new Date(processed.updatedAt) };
    if (processed.timestamp) processed.timestamp = { toDate: () => new Date(processed.timestamp) };

    return processed;
}

// WriteBatch
export const writeBatch = (db) => ({
    commit: async () => {}, // No-op
    update: (ref, data) => updateDoc(ref, data),
    set: (ref, data) => setDoc(ref, data),
    delete: (ref) => deleteDoc(ref)
});

// Initialize
export const initializeApp = () => {};

// Global export for compatibility
window.auth = auth;
window.db = db;
window.collection = collection;
window.doc = doc;
window.getDoc = getDoc;
window.getDocs = getDocs;
window.addDoc = addDoc;
window.updateDoc = updateDoc;
window.deleteDoc = deleteDoc;
window.query = query;
window.where = where;
window.orderBy = orderBy;
window.limit = limit;
window.startAfter = startAfter;
window.onSnapshot = onSnapshot;
window.serverTimestamp = serverTimestamp;
window.runTransaction = runTransaction;
window.signInWithPopup = signInWithPopup;
window.signOut = signOut;
window.onAuthStateChanged = onAuthStateChanged;
window.GoogleAuthProvider = GoogleAuthProvider;
window.writeBatch = writeBatch;
window.increment = increment;
window.arrayUnion = arrayUnion;
window.arrayRemove = arrayRemove;
