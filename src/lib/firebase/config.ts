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
if (
  !firebaseConfig.apiKey ||
  !firebaseConfig.authDomain ||
  !firebaseConfig.projectId ||
  !firebaseConfig.storageBucket ||
  !firebaseConfig.messagingSenderId ||
  !firebaseConfig.appId
) {
  console.warn(
    "Firebase configuration is incomplete. Please check your .env.local file and ensure all NEXT_PUBLIC_FIREBASE_ variables are set."
  );
  if (!firebaseConfig.apiKey) console.error("NEXT_PUBLIC_FIREBASE_API_KEY is missing.");
  // You can add more specific checks if needed
}


// Initialize Firebase
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

let auth: Auth;
try {
  auth = getAuth(app);
} catch (error) {
  console.error("Failed to initialize Firebase Auth:", error);
  // Provide a mock or throw, depending on how critical auth is at this stage.
  // For now, let's rethrow to make the issue visible.
  throw new Error(`Firebase Auth initialization failed. Ensure your Firebase config is correct and environment variables are loaded. Original error: ${(error as Error).message}`);
}


export { app, auth };
