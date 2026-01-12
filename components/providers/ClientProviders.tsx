"use client";

import { Suspense } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { Toaster } from "@/components/ui/sonner";
import { PostHogProvider } from "./PostHogProvider";
import { PostHogPageView } from "./PostHogPageView";
import { usePostHogIdentify } from "@/hooks/usePostHogIdentify";

function PostHogIdentifyWrapper({ children }: { children: React.ReactNode }) {
  usePostHogIdentify();
  return <>{children}</>;
}

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <PostHogProvider>
      <Suspense fallback={null}>
        <PostHogPageView />
      </Suspense>
      <AuthProvider>
        <ProfileProvider>
          <PostHogIdentifyWrapper>
            {children}
            <Toaster />
          </PostHogIdentifyWrapper>
        </ProfileProvider>
      </AuthProvider>
    </PostHogProvider>
  );
}