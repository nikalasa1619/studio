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
// For email/password auth, apiKey, authDomain, and projectId are typically most critical.
// Other services might require others.
const requiredKeys: Array<keyof typeof firebaseConfig> = ['apiKey', 'authDomain', 'projectId']; 

console.log("Firebase Config Check:");
for (const key of requiredKeys) {
  if (!firebaseConfig[key]) {
    console.error(`Firebase Error: Crucial config NEXT_PUBLIC_FIREBASE_${key.toUpperCase()} is MISSING in .env. Firebase features will likely fail.`);
    firebaseConfigComplete = false;
  } else {
    // console.log(`NEXT_PUBLIC_FIREBASE_${key.toUpperCase()}: PRESENT`); // Uncomment for debugging
  }
}
if (!firebaseConfig.apiKey) {
    console.error("Firebase Error: NEXT_PUBLIC_FIREBASE_API_KEY is UNDEFINED. Authentication will FAIL. Please set it in your .env file.");
}


if (!process.env.GEMINI_API_KEY) {
  console.warn("Genkit Warning: GEMINI_API_KEY is missing in .env file. AI features may not work. Please add it.");
}


// Initialize Firebase
let app: FirebaseApp | null = null;
if (firebaseConfigComplete) { // Only attempt to initialize if critical configs are present
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
      console.log("Firebase app initialized successfully.");
    } catch (error) {
      console.error("Firebase initialization error:", error);
      app = null; 
    }
  } else {
    app = getApp();
    console.log("Firebase app already initialized.");
  }
} else {
  console.warn("Firebase initialization SKIPPED due to missing critical configuration. Firebase-dependent features (like Auth) will be unavailable.");
  app = null; 
}

let auth: Auth | null = null;
if (app) {
  try {
    auth = getAuth(app);
    console.log("Firebase Auth initialized successfully.");
  } catch (error) {
    console.error("Failed to initialize Firebase Auth:", error);
    auth = null; 
  }
} else {
  console.warn("Firebase Auth initialization SKIPPED because Firebase app was not initialized or failed to initialize.");
  auth = null; 
}


export { app, auth };
