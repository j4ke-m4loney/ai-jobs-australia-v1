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
  const { user, refreshSession } = useAuth();

  useEffect(() => {
    // Function to handle the redirect
    const handleRedirect = async () => {
      // First, try to refresh the session to ensure we have the latest user data
      console.log("Email confirmation: Starting redirect flow");

      try {
        await refreshSession();
        console.log("Email confirmation: Session refreshed");
      } catch (error) {
        console.error("Email confirmation: Failed to refresh session", error);
      }

      // Small delay to ensure the auth state is fully updated
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get user type from URL parameter or user metadata
      const urlUserType = searchParams.get("userType");
      const userType = urlUserType || user?.user_metadata?.user_type || user?.metadata?.userType;

      console.log("Email confirmation: User type detected", {
        urlUserType,
        userType,
        user: user ? "exists" : "null",
        metadata: user?.user_metadata,
      });

      // Determine redirect path based on user type
      let redirectPath = "/";

      if (userType === "employer") {
        redirectPath = "/employer/settings?verified=true";
      } else if (userType === "job_seeker") {
        redirectPath = "/jobseeker/profile?verified=true";
      } else if (user) {
        // If user exists but no type specified, check their actual type
        const actualUserType = user.user_metadata?.user_type || user.metadata?.userType;
        console.log("Email confirmation: Falling back to user's actual type", actualUserType);

        if (actualUserType === "employer") {
          redirectPath = "/employer/settings?verified=true";
        } else if (actualUserType === "job_seeker") {
          redirectPath = "/jobseeker/profile?verified=true";
        }
      } else {
        // No user and no type, redirect to login
        console.log("Email confirmation: No user or type found, redirecting to login");
        redirectPath = "/login?verified=true";
      }

      console.log("Email confirmation: Redirecting to", redirectPath);
      // Perform the redirect
      router.push(redirectPath);
    };

    // Start the redirect process with a longer initial delay
    const timer = setTimeout(() => {
      handleRedirect();
    }, 2000); // Increased delay to ensure Supabase has processed the confirmation

    return () => clearTimeout(timer);
  }, [user, searchParams, router, refreshSession]);

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