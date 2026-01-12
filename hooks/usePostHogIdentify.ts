"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { identifyUser, resetUser } from "@/lib/analytics";

export function usePostHogIdentify() {
  const { user } = useAuth();
  const { profile } = useProfile();

  useEffect(() => {
    if (user && profile) {
      // Identify the user in PostHog with their profile data
      identifyUser(user.id, {
        email: user.email || undefined,
        name: profile.first_name
          ? `${profile.first_name} ${profile.last_name || ""}`.trim()
          : undefined,
        user_type: profile.user_type,
        location: profile.location || undefined,
        company_name: profile.company_name || undefined,
        experience_level: profile.experience_level || undefined,
        has_resume: !!profile.resume_url,
        has_cover_letter: !!profile.cover_letter_url,
        skills_count: profile.skills?.length || 0,
      });
    } else if (!user) {
      // Reset PostHog when user logs out
      resetUser();
    }
  }, [user, profile]);
}
