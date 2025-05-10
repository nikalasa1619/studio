// src/contexts/auth-provider.tsx
"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { 
  type User, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut 
} from "firebase/auth";
import { auth } from "@/lib/firebase/config"; // auth can be null if Firebase init failed
import { useToast } from "@/hooks/use-toast";
import type { SignInFormValues } from "@/components/auth/sign-in-form";
import type { SignUpFormValues } from "@/components/auth/sign-up-form";


interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthAvailable: boolean; // To indicate if Firebase Auth is usable
  signUpWithEmail: (values: SignUpFormValues) => Promise<void>;
  signInWithEmail: (values: SignInFormValues) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const isAuthAvailable = !!auth;

  useEffect(() => {
    if (!isAuthAvailable) {
      setIsLoading(false);
      console.warn("Firebase Auth is not available. Authentication features will be disabled. Please check your Firebase configuration in .env files. Ensure NEXT_PUBLIC_FIREBASE_API_KEY and other Firebase variables are set.");
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [isAuthAvailable]);

  const signUpWithEmail = async (values: SignUpFormValues) => {
    if (!isAuthAvailable || !auth) {
      toast({ title: "Sign-up unavailable", description: "Authentication service is not configured.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, values.email, values.password);
      toast({ title: "Signed up successfully!", description: "You are now logged in." });
      // onAuthStateChanged will handle setting the user and isLoading
    } catch (error: any) {
      console.error("Error signing up:", error);
      toast({ title: "Sign-up failed", description: error.message || "An unknown error occurred.", variant: "destructive" });
      setIsLoading(false); // Explicitly set loading to false on error
    }
  };

  const signInWithEmail = async (values: SignInFormValues) => {
    if (!isAuthAvailable || !auth) {
      toast({ title: "Sign-in unavailable", description: "Authentication service is not configured.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({ title: "Signed in successfully!" });
      // onAuthStateChanged will handle setting the user and isLoading
    } catch (error: any) {
      console.error("Error signing in:", error);
      toast({ title: "Sign-in failed", description: error.message || "An unknown error occurred.", variant: "destructive" });
      setIsLoading(false); // Explicitly set loading to false on error
    }
  };

  const signOutUser = async () => {
    if (!isAuthAvailable || !auth) {
      toast({ title: "Sign-out unavailable", description: "Authentication service is not configured.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      await firebaseSignOut(auth);
      toast({ title: "Signed out successfully!" });
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast({ title: "Sign-out failed", description: error.message || "An unknown error occurred.", variant: "destructive" });
    } finally {
      // onAuthStateChanged will set isLoading to false after user state is updated by Firebase
      // If auth is not available, this won't be reached, but it's safe.
      if (isAuthAvailable) setIsLoading(false); 
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthAvailable, signUpWithEmail, signInWithEmail, signOutUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
