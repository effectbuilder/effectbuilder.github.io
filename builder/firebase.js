// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
// [MODIFIED] Added FieldPath AND documentId
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, query, where, getDoc, onSnapshot, limit, orderBy, startAfter, updateDoc, runTransaction, increment, serverTimestamp, FieldValue, setDoc, writeBatch, arrayUnion, FieldPath, documentId, arrayRemove } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { getStorage, ref, uploadString, getDownloadURL, deleteObject } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBIzgQqxHMTdCsW0UG4MOEuFWwjEYAFYbk",
    authDomain: "effect-builder.firebaseapp.com",
    projectId: "effect-builder",
    storageBucket: "effect-builder.appspot.com",
    messagingSenderId: "638106955712",
    appId: "1:638106955712:web:e98ee4cd023fd84d466225",
    measurementId: "G-4TBX7711GH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app); // <-- We must export the storage service

// Export functions and constants for convenience
export {
    // Auth
    GoogleAuthProvider,
    signInWithPopup,
    signOut,
    onAuthStateChanged,
    
    // Firestore
    collection,
    addDoc,
    getDocs,
    runTransaction,
    doc,
    deleteDoc,
    query,
    where,
    getDoc,
    onSnapshot,
    limit,
    orderBy,
    startAfter,
    updateDoc,
    increment,
    arrayRemove,
    serverTimestamp,
    FieldValue,
    setDoc,
    writeBatch,
    arrayUnion,
    FieldPath,
    documentId,

    // Storage <-- We must export the storage functions
    ref,
    uploadString,
    getDownloadURL,
    deleteObject
};