"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { trackSignUp, trackLogin } from "@/lib/analytics";

/**
 * Tracks OAuth signup/login events when users are redirected back from OAuth providers
 * This component should be included in layouts where OAuth redirects land
 */
export function OAuthSignupTracker() {
  const searchParams = useSearchParams();
  const { user } = useAuth();

  useEffect(() => {
    // Check if this is an OAuth redirect
    const isNewUser = searchParams?.get("verified") === "true";

    if (user && isNewUser) {
      const userType = (user.user_metadata?.user_type as "job_seeker" | "employer") || "job_seeker";

      // Check if this was an OAuth signup (user created recently)
      const userCreatedAt = new Date(user.createdAt || "");
      const now = new Date();
      const timeSinceCreation = now.getTime() - userCreatedAt.getTime();
      const isRecentlyCreated = timeSinceCreation < 60000; // Within last minute

      if (isRecentlyCreated) {
        // Track as signup
        trackSignUp({
          user_type: userType,
          auth_method: "google",
        });
      } else {
        // Track as login
        trackLogin({
          user_type: userType as "job_seeker" | "employer" | "admin",
          auth_method: "google",
        });
      }
    }
  }, [user, searchParams]);

  return null; // This component doesn't render anything
}
