// src/lib/firebase/config.ts
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if all required Firebase config values are present
let firebaseConfigComplete = true;
const requiredKeys: Array<keyof typeof firebaseConfig> = ['apiKey', 'authDomain', 'projectId'];

for (const key of requiredKeys) {
  if (!firebaseConfig[key]) {
    console.error(`Firebase Error: NEXT_PUBLIC_FIREBASE_${key.toUpperCase()} is missing in .env file. Firebase features dependent on this key may not work.`);
    firebaseConfigComplete = false;
  }
}

if (!process.env.GEMINI_API_KEY) {
  console.warn("Genkit Warning: GEMINI_API_KEY is missing in .env file. AI features may not work. Please add it.");
}


// Initialize Firebase
let app: FirebaseApp | null = null;
if (!getApps().length) {
  if (firebaseConfigComplete) {
    try {
      app = initializeApp(firebaseConfig);
    } catch (error) {
      console.error("Firebase initialization error:", error);
      app = null; // Set app to null if initialization fails
    }
  } else {
    console.warn("Firebase initialization was skipped due to missing critical configuration. Firebase-dependent features will be unavailable.");
    app = null; 
  }
} else {
  app = getApp();
}

let auth: Auth | null = null;
if (app) {
  try {
    auth = getAuth(app);
  } catch (error) {
    console.error("Failed to initialize Firebase Auth:", error);
    // This can happen if the API key is present but invalid, or other auth-specific config issues.
    auth = null; 
  }
} else {
  console.warn("Firebase Auth initialization skipped because Firebase app was not initialized or failed to initialize.");
  auth = null; 
}


export { app, auth };
