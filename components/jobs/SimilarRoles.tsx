"use client";

import Link from "next/link";
import { RecentJobCard } from "@/components/jobs/RecentJobCard";
import type { SimilarJobsResult } from "@/lib/jobs/similar-jobs";
import { getSimilarRolesUrl } from "@/lib/jobs/similar-roles-url";

interface SimilarRolesProps {
  result: SimilarJobsResult;
  currentJob: {
    category: string;
    location: string;
    location_type: string;
  };
  variant: "active" | "expired";
}

const VARIANT_CONFIG = {
  active: {
    heading: "Similar roles",
    gridClass: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr",
  },
  expired: {
    heading: "These roles are hiring now",
    gridClass: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr",
  },
} as const;

export function SimilarRoles({ result, currentJob, variant }: SimilarRolesProps) {
  if (result.jobs.length === 0) return null;

  const config = VARIANT_CONFIG[variant];
  const isBroadFallback = result.fallback === "broad";
  const ctaText = isBroadFallback ? "View all AI roles →" : "View all similar roles →";
  const ctaUrl = isBroadFallback
    ? "/jobs"
    : getSimilarRolesUrl({
        category: currentJob.category,
        location: currentJob.location,
        location_type: currentJob.location_type,
      });

  return (
    <section aria-labelledby="similar-roles-heading">
      <div className="flex items-end justify-between mb-6">
        <h2
          id="similar-roles-heading"
          className="text-2xl font-bold text-foreground"
        >
          {config.heading}
        </h2>
        <Link
          href={ctaUrl}
          className="text-sm font-medium text-primary hover:underline whitespace-nowrap"
        >
          {ctaText}
        </Link>
      </div>
      <div className={config.gridClass}>
        {result.jobs.map((job) => (
          <RecentJobCard key={job.id} job={job} />
        ))}
      </div>
    </section>
  );
}
