"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface SearchPageRedirectProps {
  keyword: string;
}

/**
 * Client-side redirect to /jobs with the search keyword pre-filled.
 * Googlebot renders the server HTML (metadata, job list, structured data) for indexing.
 * Real users see a brief loading screen then land on the full interactive /jobs page.
 */
export function SearchPageRedirect({ keyword }: SearchPageRedirectProps) {
  const router = useRouter();

  useEffect(() => {
    router.replace(`/jobs?search=${encodeURIComponent(keyword)}&guest=true&match=broad`);
  }, [router, keyword]);

  // Full-screen overlay hides the server-rendered SEO content during redirect
  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading jobs...</p>
      </div>
    </div>
  );
}
