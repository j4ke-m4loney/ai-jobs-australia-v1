"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { useEffect } from "react";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
      const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;

      if (apiKey && host) {
        posthog.init(apiKey, {
          api_host: host,
          person_profiles: "identified_only", // Only create profiles for logged-in users
          capture_pageview: false, // We'll manually capture pageviews with Next.js router
          capture_pageleave: true, // Track time on page
          autocapture: {
            dom_event_allowlist: ["click"], // Only autocapture clicks
            url_allowlist: [
              "aijobsaustralia.com.au",
              "localhost",
              "127.0.0.1",
            ],
          },
          session_recording: {
            recordCrossOriginIframes: false,
          },
          loaded: (posthog) => {
            if (process.env.NODE_ENV === "development") {
              console.log("PostHog loaded");
            }
          },
        });
      }
    }
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
