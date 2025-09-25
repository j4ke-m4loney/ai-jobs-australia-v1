"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Profile {
  id?: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  user_type: "job_seeker" | "employer" | "admin";
  company_name: string | null;
  resume_url: string | null;
  cover_letter_url: string | null;
  bio: string | null;
  location: string | null;
  phone: string | null;
  skills: string[] | null;
  experience_level: "entry" | "mid" | "senior" | "executive" | null;
  created_at?: string;
  updated_at?: string;
}

interface ProfileContextType {
  profile: Profile | null;
  loading: boolean;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
};

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      // If no profile exists, automatically create one from auth metadata
      if (!data && user) {
        console.log("No profile found, creating automatic profile for user:", user.id);
        try {
          const initialProfile = {
            first_name: user.user_metadata?.first_name || null,
            user_type: (user.user_metadata?.user_type as "job_seeker" | "employer") || "job_seeker"
          };
          
          await updateProfile(initialProfile);
          // updateProfile will set the profile state, so we don't need to call setProfile here
          return;
        } catch (createError) {
          console.error("Failed to create automatic profile:", createError);
          // Continue with null profile if creation fails
        }
      }

      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    // Check if this is initial profile creation (no existing profile)
    const isNewProfile = !profile;
    const { user_type, ...otherUpdates } = updates;

    let safeUpdates: Partial<Profile>;
    if (user_type && !isNewProfile) {
      console.warn("Attempted to update user_type on existing profile - this field is immutable");
      safeUpdates = otherUpdates;
    } else if (user_type && isNewProfile) {
      // Allow user_type to be set during initial profile creation
      console.log("Setting user_type for new profile:", user_type);
      safeUpdates = { ...otherUpdates, user_type };
    } else {
      safeUpdates = otherUpdates;
    }

    try {
      console.log("Updating profile with data:", { user_id: user.id, ...safeUpdates });
      
      const { data, error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          ...safeUpdates,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error("Supabase error details:", error);
        throw error;
      }

      // Sync display name changes with auth.user_metadata
      if (safeUpdates.first_name !== undefined || safeUpdates.last_name !== undefined) {
        try {
          const updatedMetadata = { ...user.user_metadata };
          
          if (safeUpdates.first_name !== undefined) {
            updatedMetadata.first_name = safeUpdates.first_name || undefined;
          }
          if (safeUpdates.last_name !== undefined) {
            updatedMetadata.last_name = safeUpdates.last_name || undefined;
          }

          const { error: authError } = await supabase.auth.updateUser({
            data: { user_metadata: updatedMetadata }
          });

          if (authError) {
            console.warn("Failed to sync display name with auth metadata:", authError);
            // Don't throw error - profile update succeeded, auth sync is optional
          }
        } catch (authSyncError) {
          console.warn("Error syncing with auth metadata:", authSyncError);
          // Continue - profile update succeeded
        }
      }

      setProfile(data);
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  const refreshProfile = async () => {
    setLoading(true);
    await fetchProfile();
  };

  useEffect(() => {
    if (!authLoading) {
      fetchProfile();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const value = {
    profile,
    loading,
    updateProfile,
    refreshProfile,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
};

// Profile type is already exported at the top of the file