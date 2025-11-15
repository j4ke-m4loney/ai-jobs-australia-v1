"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

interface GoogleSignInButtonProps {
  userType: "job_seeker" | "employer";
  onError?: (error: string) => void;
  className?: string;
}

export function GoogleSignInButton({
  userType,
  onError,
  className,
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔵 [BUTTON] Starting OAuth flow');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('👤 [BUTTON] User Type:', userType);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // Store userType in BOTH sessionStorage AND cookie
      // Cookie can be read by server-side callback route
      try {
        sessionStorage.setItem('oauth_user_type', userType);
        console.log('💾 [BUTTON] Stored user_type in sessionStorage:', userType);

        // Set cookie that expires in 10 minutes (enough for OAuth flow)
        const expires = new Date();
        expires.setMinutes(expires.getMinutes() + 10);
        document.cookie = `oauth_user_type=${userType}; path=/; expires=${expires.toUTCString()}; SameSite=Lax`;
        console.log('🍪 [BUTTON] Stored user_type in cookie:', userType);
      } catch (storageError) {
        console.warn('⚠️  [BUTTON] Failed to store user_type:', storageError);
      }

      // Dynamic import to avoid SSR issues
      const { getAuthService } = await import("@/lib/auth");
      const authService = getAuthService();

      // Check if OAuth is supported
      if (!authService.signInWithOAuth) {
        throw new Error("OAuth authentication is not supported");
      }

      console.log('🔐 [BUTTON] Calling signInWithOAuth (full-page redirect)');

      // Simple OAuth flow - works for all devices
      // This will redirect the current page to Google OAuth
      // After authentication, Google redirects to /auth/callback
      // Callback route will redirect user to appropriate dashboard
      const result = await authService.signInWithOAuth("google", {
        options: {
          userType, // Pass userType so it can be encoded in redirect URL
        },
      });

      if (result.error) {
        console.error('❌ OAuth error:', result.error);
        onError?.(result.error.message || "Failed to sign in with Google");
        setIsLoading(false);
      }

      // If no error, page will redirect to OAuth provider
      // Loading state will persist until redirect happens
    } catch (error) {
      console.error("Google sign-in error:", error);
      onError?.(
        error instanceof Error ? error.message : "An unexpected error occurred"
      );
      setIsLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          <span>Connecting...</span>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span>Continue with Google</span>
        </div>
      )}
    </Button>
  );
}
