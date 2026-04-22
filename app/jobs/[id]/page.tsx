import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { getJobById } from "@/lib/jobs/get-job-by-id";
import { getSimilarJobs } from "@/lib/jobs/similar-jobs";
import { JobDetailClient, type Job } from "./JobDetailClient";

// Kept in sync with layout.tsx PUBLIC_STATUSES. Non-public statuses
// (pending, rejected, needs_review) 404 so they never accumulate in
// Google's index.
const PUBLIC_STATUSES = new Set(["approved", "expired"]);

interface JobDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params;

  // Shares a React.cache()-deduped call with layout.tsx — single DB
  // round-trip for the job across metadata, JSON-LD, and this page.
  const rawJob = await getJobById(id);

  if (!rawJob || !PUBLIC_STATUSES.has(rawJob.status)) {
    notFound();
  }

  const job = rawJob as Job;

  // Service-role client for the similar-roles fetch so RLS quirks don't
  // starve the section. Matches the pattern used by /jobs/category/[slug].
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  const similarRoles = await getSimilarJobs(supabaseAdmin, {
    currentJobId: job.id,
    currentCategory: job.category,
    currentLocation: job.location,
    currentLocationType: job.location_type,
    limit: job.status === "expired" ? 4 : 3,
  });

  return <JobDetailClient initialJob={job} similarRoles={similarRoles} />;
}
