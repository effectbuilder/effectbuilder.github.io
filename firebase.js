import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
// import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, query, where, getDoc, onSnapshot, limit, orderBy, startAfter, updateDoc, runTransaction, increment, serverTimestamp, setDoc, writeBatch, documentId, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, query, where, getDoc, onSnapshot, limit, orderBy, startAfter, updateDoc, runTransaction, increment, serverTimestamp, setDoc, writeBatch, documentId, arrayUnion, arrayRemove} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

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

// Make Firebase services and functions globally available for other scripts
window.auth = getAuth(app);
window.db = getFirestore(app);

// --- Expose Auth Functions ---
window.GoogleAuthProvider = GoogleAuthProvider;
window.signInWithPopup = signInWithPopup;
window.signOut = signOut;
window.onAuthStateChanged = onAuthStateChanged;

// --- Expose Firestore Functions/Constants ---
window.collection = collection;
window.addDoc = addDoc;
window.getDocs = getDocs;
window.runTransaction = runTransaction;
window.doc = doc;
window.deleteDoc = deleteDoc;
window.query = query;
window.where = where;
window.getDoc = getDoc;
window.onSnapshot = onSnapshot;
window.limit = limit;
window.orderBy = orderBy;
window.startAfter = startAfter;
window.updateDoc = updateDoc;
window.increment = increment;
window.serverTimestamp = serverTimestamp;
window.setDoc = setDoc;
window.documentId = documentId; // This exports the actual function
window.writeBatch = writeBatch;
window.arrayUnion = arrayUnion;
window.arrayRemove = arrayRemove;
window.documentId = documentId; // This exports a constant string 'documentId'