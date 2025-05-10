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
if (!firebaseConfig.apiKey) {
  console.error("Firebase Error: NEXT_PUBLIC_FIREBASE_API_KEY is missing in .env file. Please add it.");
  firebaseConfigComplete = false;
}
if (!firebaseConfig.authDomain) {
  console.error("Firebase Error: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is missing in .env file. Please add it.");
  firebaseConfigComplete = false;
}
if (!firebaseConfig.projectId) {
  console.error("Firebase Error: NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing in .env file. Please add it.");
  firebaseConfigComplete = false;
}
// Other Firebase config checks can be added here if necessary

if (!process.env.GEMINI_API_KEY) {
  console.error("Genkit Error: GEMINI_API_KEY is missing in .env file. AI features may not work. Please add it.");
}


// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  if (firebaseConfigComplete) {
    try {
      app = initializeApp(firebaseConfig);
    } catch (error) {
      console.error("Firebase initialization error:", error);
      // @ts-ignore
      app = null; // Set app to null or a mock if initialization fails
    }
  } else {
    console.warn("Firebase initialization skipped due to missing configuration.");
    // @ts-ignore
    app = null; 
  }
} else {
  app = getApp();
}

let auth: Auth;
// @ts-ignore
if (app) {
  try {
    auth = getAuth(app);
  } catch (error) {
    console.error("Failed to initialize Firebase Auth:", error);
    // Provide a mock or throw, depending on how critical auth is at this stage.
    // @ts-ignore
    auth = null; 
  }
} else {
  console.warn("Firebase Auth initialization skipped because Firebase app was not initialized.");
  // @ts-ignore
  auth = null; 
}


export { app, auth };
