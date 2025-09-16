"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function EmailConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    // Function to handle the redirect
    const handleRedirect = () => {
      // Get user type from URL parameter or user metadata
      const urlUserType = searchParams.get("userType");
      const userType = urlUserType || user?.user_metadata?.user_type || user?.metadata?.userType;

      // Determine redirect path based on user type
      let redirectPath = "/";

      if (userType === "employer") {
        redirectPath = "/employer/settings?verified=true";
      } else if (userType === "job_seeker") {
        redirectPath = "/jobseeker/profile?verified=true";
      } else if (user) {
        // If user exists but no type specified, check their actual type
        const actualUserType = user.user_metadata?.user_type || user.metadata?.userType;
        if (actualUserType === "employer") {
          redirectPath = "/employer/settings?verified=true";
        } else if (actualUserType === "job_seeker") {
          redirectPath = "/jobseeker/profile?verified=true";
        }
      } else {
        // No user and no type, redirect to login
        redirectPath = "/login?verified=true";
      }

      // Perform the redirect
      router.push(redirectPath);
    };

    // Small delay to ensure auth state is loaded
    const timer = setTimeout(() => {
      handleRedirect();
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, searchParams, router]);

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