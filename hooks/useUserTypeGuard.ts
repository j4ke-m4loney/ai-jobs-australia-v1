"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { toast } from "sonner";

type UserType = "job_seeker" | "employer" | "admin";

interface UseRequireUserTypeOptions {
  redirectTo?: string;
  showError?: boolean;
  errorMessage?: string;
}

/**
 * Hook that ensures the current user has the required user type
 * Redirects to appropriate page if user type doesn't match
 */
export const useRequireUserType = (
  requiredType: UserType,
  options: UseRequireUserTypeOptions = {}
) => {
  const { user } = useAuth();
  const { profile, loading } = useProfile();
  const router = useRouter();

  const {
    redirectTo,
    showError = true,
    errorMessage = `Access denied. This page is only available for ${requiredType.replace('_', ' ')}s.`
  } = options;

  useEffect(() => {
    // Don't redirect while loading
    if (loading) return;

    // Redirect to auth if no user
    if (!user) {
      router.push("/auth");
      return;
    }

    // Wait for profile to load
    if (!profile) return;

    // Check if user type matches required type (admins can access everything)
    if (profile.user_type !== requiredType && profile.user_type !== "admin") {
      if (showError) {
        toast.error(errorMessage);
      }

      // Determine redirect destination
      let destination = redirectTo;
      if (!destination) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        switch ((profile as any).user_type) {
          case "job_seeker":
            destination = "/jobseeker";
            break;
          case "employer":
            destination = "/employer";
            break;
          case "admin":
            destination = "/admin";
            break;
          default:
            destination = "/";
        }
      }

      router.push(destination);
    }
  }, [user, profile, loading, requiredType, router, redirectTo, showError, errorMessage]);

  return {
    isAuthorized: profile?.user_type === requiredType || profile?.user_type === "admin",
    userType: profile?.user_type,
    isLoading: loading
  };
};

/**
 * Hook that provides user type checking utilities
 */
export const useUserTypeGuard = () => {
  const { user } = useAuth();
  const { profile, loading } = useProfile();

  const isUserType = (type: UserType): boolean => {
    // Admins can be considered as any type for access purposes
    if (profile?.user_type === "admin") return true;
    return profile?.user_type === type;
  };

  const isAdmin = (): boolean => {
    return profile?.user_type === "admin";
  };

  const canAccess = (allowedTypes: UserType[]): boolean => {
    if (!profile?.user_type) return false;
    // Admins can access everything
    if (profile.user_type === "admin") return true;
    return allowedTypes.includes(profile.user_type);
  };

  const getUserTypeRoute = (): string => {
    switch (profile?.user_type) {
      case "job_seeker":
        return "/jobseeker";
      case "employer":
        return "/employer";
      case "admin":
        return "/admin";
      default:
        return "/";
    }
  };

  return {
    isUserType,
    isAdmin,
    canAccess,
    getUserTypeRoute,
    userType: profile?.user_type,
    isLoading: loading,
    isAuthenticated: !!user
  };
};