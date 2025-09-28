"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

// Loading component for Suspense fallback
function EmailConfirmLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-lg font-medium">Loading...</p>
      </div>
    </div>
  );
}

// Main component that uses useSearchParams
function EmailConfirmContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refreshSession, loading } = useAuth();

  useEffect(() => {
    // Don't do anything while auth is still loading
    if (loading) {
      console.log("Email confirmation: Auth context still loading...");
      return;
    }

    // Function to handle the redirect
    const handleRedirect = async () => {
      console.log("Email confirmation: Starting redirect flow");
      console.log("Email confirmation: Current auth state", {
        user: user ? "exists" : "null",
        loading,
        userId: user?.id,
        metadata: user?.user_metadata,
      });

      // First, try to refresh the session to ensure we have the latest user data
      try {
        console.log("Email confirmation: Refreshing session...");
        await refreshSession();
        console.log("Email confirmation: Session refreshed successfully");
      } catch (error) {
        console.error("Email confirmation: Failed to refresh session", error);
      }

      // Wait a bit more for the session to be fully processed
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get user type from user metadata (no longer using URL parameters)
      let userType = null;
      if (user) {
        userType = user.user_metadata?.user_type || user.metadata?.userType;
        console.log("Email confirmation: User stored type:", userType);
      }

      console.log("Email confirmation: Final user type determination", {
        finalUserType: userType,
        user: user ? `${user.id} (${user.email})` : "null",
      });

      // Determine redirect path based on user type
      let redirectPath = "/";

      if (userType === "employer") {
        redirectPath = "/employer/settings?verified=true";
        console.log("Email confirmation: Redirecting employer to settings");
      } else if (userType === "job_seeker") {
        redirectPath = "/jobseeker/profile?verified=true";
        console.log("Email confirmation: Redirecting job seeker to profile");
      } else if (user) {
        // If user exists but no clear type, default to job seeker (most common case)
        console.log("Email confirmation: No clear user type, defaulting to job seeker");
        redirectPath = "/jobseeker/profile?verified=true";
      } else {
        // No user authenticated, redirect to login
        console.log("Email confirmation: No authenticated user, redirecting to login");
        redirectPath = "/login?verified=true&message=Please log in to complete verification";
      }

      console.log("Email confirmation: Final redirect decision:", redirectPath);

      // Perform the redirect
      router.push(redirectPath);
    };

    // Wait for Supabase to process the email confirmation
    // This needs to be longer to ensure the auth state is properly updated
    const timer = setTimeout(() => {
      handleRedirect();
    }, 3000); // Increased to 3 seconds for more reliable processing

    return () => clearTimeout(timer);
  }, [user, loading, searchParams, router, refreshSession]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted">
      <div className="text-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        <h2 className="text-xl font-semibold">Confirming your email...</h2>
        <p className="text-muted-foreground">
          Please wait while we redirect you to your dashboard.
        </p>
      </div>
    </div>
  );
}

// Main page component with Suspense wrapper
export default function EmailConfirmPage() {
  return (
    <Suspense fallback={<EmailConfirmLoading />}>
      <EmailConfirmContent />
    </Suspense>
  );
}