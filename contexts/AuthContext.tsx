"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuthService } from "@/lib/auth";
import type { AuthUser, AuthSession, AuthError } from "@/types/auth.types";

interface AuthContextType {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    firstName?: string,
    userType?: "job_seeker" | "employer"
  ) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: (userType: "job_seeker" | "employer") => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateUserMetadata: (metadata: Record<string, string | number | boolean | undefined>) => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // In development, sometimes this can be called before provider is ready
    console.warn(
      "useAuth called outside AuthProvider - this might be a development environment issue"
    );
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    console.log('🔐 [AuthContext] Initializing auth...');

    // Get the auth service instance only on client
    const authService = getAuthService();

    // Set up auth state listener
    const unsubscribe = authService.onAuthStateChange((event, session) => {
      console.log('🔐 [AuthContext] Auth state changed:', {
        event,
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
      });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Check for existing session
    authService.getSession().then((session) => {
      console.log('🔐 [AuthContext] Initial session check:', {
        hasSession: !!session,
        userId: session?.user?.id,
        userEmail: session?.user?.email,
      });
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return unsubscribe;
  }, [mounted]);

  const signUp = async (
    email: string,
    password: string,
    firstName?: string,
    userType?: "job_seeker" | "employer"
  ) => {
    const authService = getAuthService();
    const result = await authService.signUp({
      email,
      password,
      metadata: {
        ...(firstName && { firstName }),
        ...(userType && { userType }),
      },
    });
    
    return { error: result.error ?? null };
  };

  const signIn = async (email: string, password: string) => {
    const authService = getAuthService();
    const result = await authService.signIn({
      email,
      password,
    });

    return { error: result.error ?? null };
  };

  const signInWithGoogle = async (userType: "job_seeker" | "employer") => {
    const authService = getAuthService();
    if (!authService || !authService.signInWithOAuth) {
      return { error: new Error("OAuth sign-in not supported") as AuthError };
    }

    const result = await authService.signInWithOAuth("google", {
      options: {
        userType, // Pass userType to be encoded in redirect URL
      },
    });

    // Note: OAuth redirect flow means we don't get immediate user/session
    // User will be redirected to Google and back to /auth/callback
    return { error: result.error ?? null };
  };

  const signOut = async () => {
    const authService = getAuthService();
    await authService.signOut();
  };

  const updateUserMetadata = async (metadata: Record<string, string | number | boolean | undefined>) => {
    const authService = getAuthService();
    if (!authService || !authService.updateUser) return;

    const { data, error } = await authService.updateUser({
      data: { user_metadata: metadata }
    });

    if (!error && data?.user) {
      setUser(data.user);
    }
  };

  const resetPassword = async (email: string) => {
    const authService = getAuthService();
    if (!authService || !authService.resetPassword) {
      return { error: new Error("Auth service not available") as AuthError };
    }

    const result = await authService.resetPassword(email);
    return { error: result.error ?? null };
  };

  const refreshSession = async () => {
    const authService = getAuthService();
    if (!authService || !authService.refreshSession) {
      console.error("Auth service does not support session refresh");
      return;
    }

    const result = await authService.refreshSession();
    if (result.session) {
      setSession(result.session);
      if (result.user) {
        setUser(result.user);
      }
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateUserMetadata,
    resetPassword,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};