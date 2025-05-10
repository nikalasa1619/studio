// src/contexts/auth-provider.tsx
"use client";

import type React from "react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { type User, onAuthStateChanged, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase/config"; // auth can be null if Firebase init failed
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthAvailable: boolean; // To indicate if Firebase Auth is usable
  signInWithGoogle: () => Promise<void>;
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
      console.warn("Firebase Auth is not available. Authentication features will be disabled. Please check your Firebase configuration in .env files.");
      // Optionally, inform the user via a persistent UI element or a toast if desired.
      // toast({
      //   title: "Authentication Service Unavailable",
      //   description: "Please check configuration or contact support.",
      //   variant: "destructive",
      //   duration: Infinity
      // });
      return;
    }

    // Only subscribe if auth is available
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [isAuthAvailable]); // Depend on isAuthAvailable

  const signInWithGoogle = async () => {
    if (!isAuthAvailable || !auth) { // Double check auth for type safety
      toast({ title: "Sign-in unavailable", description: "Authentication service is not configured correctly.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast({ title: "Signed in successfully!" });
    } catch (error) {
      console.error("Error signing in with Google:", error);
      toast({ title: "Sign-in failed", description: (error as Error).message, variant: "destructive" });
    } finally {
      // onAuthStateChanged will set loading to false after user state is updated by Firebase
      // but if there's an error before that, we might need to set it here.
      // However, if auth is unavailable, isLoading is already false.
       if (isAuthAvailable) setIsLoading(false); // Ensure loading is false if an error occurred during popup
    }
  };

  const signOutUser = async () => {
    if (!isAuthAvailable || !auth) { // Double check auth for type safety
      toast({ title: "Sign-out unavailable", description: "Authentication service is not configured correctly.", variant: "destructive" });
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      await firebaseSignOut(auth);
      toast({ title: "Signed out successfully!" });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({ title: "Sign-out failed", description: (error as Error).message, variant: "destructive" });
    } finally {
      // onAuthStateChanged will set loading to false.
       if (isAuthAvailable) setIsLoading(false); // Ensure loading is false if an error occurred
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthAvailable, signInWithGoogle, signOutUser }}>
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
