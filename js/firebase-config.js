// Firebase configuration module for PHFILME
// This file initializes Firebase services using modular SDK via CDN.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import { getStorage } from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js';

// =========================================================================
// INSTRUCTIONS FOR THE USER:
// 1. Create a Firebase project at https://console.firebase.google.com/
// 2. Add a Web App to your Firebase project.
// 3. Replace the config object below with your Firebase web app credentials.
// 4. Enable "Email/Password" in Firebase Auth -> Sign-in method.
// 5. Enable "Cloud Firestore" in Firebase Database and configure security rules.
// =========================================================================
const firebaseConfig = {
  apiKey: "AIzaSyAxeKwNTsDDAH7ilZeouhb0ZoFkM_FoEqw",
  authDomain: "phfilme-c5c6e.firebaseapp.com",
  projectId: "phfilme-c5c6e",
  storageBucket: "phfilme-c5c6e.firebasestorage.app",
  messagingSenderId: "650799829724",
  appId: "1:650799829724:web:cdac5d1389635381f49a19",
  measurementId: "G-T19EV2SVL9"
};

// Check if keys are placeholders or valid. If placeholders, run in Demo Mode.
const isDemoMode = !firebaseConfig.apiKey || firebaseConfig.apiKey.includes("YOUR_API_KEY") || firebaseConfig.apiKey === "";

let app = null;
let auth = null;
let db = null;
let storage = null;

if (!isDemoMode) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        storage = getStorage(app);
        // Configure 10-second timeout limit to prevent endless hanging on config errors
        storage.maxUploadRetryTime = 10000;
        storage.maxOperationRetryTime = 10000;
        console.log("Firebase services successfully initialized.");
    } catch (error) {
        console.error("Failed to initialize Firebase, falling back to Demo Mode:", error);
    }
} else {
    console.warn("PHFILME is running in Demo Mode using LocalStorage. Update js/firebase-config.js to link with your Firebase project.");
}

export { app, auth, db, storage, isDemoMode, firebaseConfig };
