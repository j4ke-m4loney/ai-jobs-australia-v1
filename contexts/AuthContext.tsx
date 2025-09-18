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
  signOut: () => Promise<void>;
  updateUserMetadata: (metadata: Record<string, any>) => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
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
    
    // Get the auth service instance only on client
    const authService = getAuthService();

    // Set up auth state listener
    const unsubscribe = authService.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Check for existing session
    authService.getSession().then((session) => {
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

  const signOut = async () => {
    const authService = getAuthService();
    await authService.signOut();
  };

  const updateUserMetadata = async (metadata: Record<string, any>) => {
    const authService = getAuthService();
    const { data, error } = await authService.updateUser({
      data: { user_metadata: metadata }
    });

    if (!error && data?.user) {
      setUser(data.user);
    }
  };

  const resetPassword = async (email: string) => {
    const authService = getAuthService();
    const result = await authService.resetPassword!(email);
    return { error: result.error ?? null };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateUserMetadata,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};