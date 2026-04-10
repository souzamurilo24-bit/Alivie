import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

/**
 * SECURITY CHECKLIST FOR FIREBASE:
 * 
 * ⚠️  CRITICAL: Set up Firestore Security Rules in Firebase Console
 * 
 * Current status: Rules are likely permissive (allow all authenticated users)
 * 
 * Recommended Rules:
 * match /profiles/{userId} {
 *   allow read, write: if request.auth.uid == userId;
 * }
 * 
 * This ensures users can only access their own profile data.
 */

// Firebase configuration - should be loaded from environment variables in production
// For security: NEVER commit actual API keys. Use .env file and build process to inject.
const firebaseConfig = {
  apiKey: import.meta.env?.VITE_FIREBASE_API_KEY || "AIzaSyB-5M4PBd-t3nNtp6bMkRnKT2TJDKfCC3k",
  authDomain: import.meta.env?.VITE_FIREBASE_AUTH_DOMAIN || "alivie-project.firebaseapp.com",
  projectId: import.meta.env?.VITE_FIREBASE_PROJECT_ID || "alivie-project",
  storageBucket: import.meta.env?.VITE_FIREBASE_STORAGE_BUCKET || "alivie-project.firebasestorage.app",
  messagingSenderId: import.meta.env?.VITE_FIREBASE_MESSAGING_SENDER_ID || "263866194556",
  appId: import.meta.env?.VITE_FIREBASE_APP_ID || "1:263866194556:web:6f1e05e43ec173aa0c87f9",
  measurementId: import.meta.env?.VITE_FIREBASE_MEASUREMENT_ID || "G-QRY40YC97E"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
