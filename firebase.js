import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

/**
 * FIREBASE SECURITY SETUP
 * ======================
 * 
 * ⚠️  CRITICAL: Deploy Firestore Security Rules
 * 
 * The firestore.rules file in this directory contains secure rules that:
 * - Ensure users can ONLY access their own data (profiles, forms, stats)
 * - Validate data structure before writes
 * - Prevent unauthorized access to other users' data
 * 
 * TO DEPLOY RULES:
 * 1. Install Firebase CLI: npm install -g firebase-tools
 * 2. Login: firebase login
 * 3. Init: firebase init (select Firestore)
 * 4. Copy rules from firestore.rules to firebase project
 * 5. Deploy: firebase deploy --only firestore:rules
 * 
 * OR manually copy rules from firestore.rules to Firebase Console:
 * https://console.firebase.google.com/project/alivie-project/firestore/rules
 * 
 * SECURITY FEATURES IMPLEMENTED:
 * ✅ User isolation - users can only access their own documents
 * ✅ Data validation - validates required fields
 * ✅ Authentication required - all reads/writes need auth
 * ✅ Default deny - unknown collections are blocked
 */

// Firebase configuration - MUST be loaded from environment variables
// ⚠️  CRITICAL SECURITY: NEVER hardcode API keys in source code
// See .env.example for required variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Validate required configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error(
    'Firebase configuration is missing. Please set environment variables in .env.local. ' +
    'See .env.example for required variables.'
  );
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
