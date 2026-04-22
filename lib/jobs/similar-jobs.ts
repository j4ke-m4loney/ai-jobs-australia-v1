import type { SupabaseClient } from "@supabase/supabase-js";
import { extractLocationSlug } from "@/lib/locations/generator";

export interface SimilarJob {
  id: string;
  title: string;
  description: string;
  location: string;
  location_type: "onsite" | "remote" | "hybrid";
  job_type: string[];
  salary_min: number | null;
  salary_max: number | null;
  show_salary?: boolean;
  is_featured: boolean;
  created_at: string;
  highlights?: string[] | null;
  companies: {
    id: string;
    name: string;
    logo_url: string | null;
    website: string | null;
  } | null;
}

const JOB_FIELDS = `
  id,
  title,
  description,
  location,
  location_type,
  job_type,
  salary_min,
  salary_max,
  show_salary,
  is_featured,
  created_at,
  highlights,
  companies (
    id,
    name,
    logo_url,
    website
  )
`;

// Kept in sync with the related-categories map in
// /app/jobs/category/[slug]/page.tsx:84. If either changes, update both.
function getRelatedCategories(categorySlug: string): string[] {
  const relatedMap: Record<string, string[]> = {
    "ai-engineer": ["machine-learning-engineer", "ml-engineer", "software-engineer", "data-scientist"],
    "machine-learning-engineer": ["ai-engineer", "ml-engineer", "data-scientist", "software-engineer"],
    "data-scientist": ["data-analyst", "machine-learning-engineer", "ai-engineer", "ml-engineer"],
    "data-analyst": ["data-scientist", "business-analyst", "ml-engineer"],
    "ml-engineer": ["ai-engineer", "machine-learning-engineer", "data-scientist"],
    "software-engineer": ["ai-engineer", "machine-learning-engineer", "full-stack-engineer"],
  };
  return relatedMap[categorySlug] || ["ai-engineer", "machine-learning-engineer", "data-scientist"];
}

// Supabase may return the `companies` relation as either an object or a
// 1-element array depending on how PostgREST parses the join — normalise.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normaliseJob(row: any): SimilarJob {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    location: row.location,
    location_type: row.location_type,
    job_type: row.job_type,
    salary_min: row.salary_min,
    salary_max: row.salary_max,
    show_salary: row.show_salary,
    is_featured: row.is_featured,
    created_at: row.created_at,
    highlights: row.highlights,
    companies: Array.isArray(row.companies)
      ? row.companies[0] ?? null
      : row.companies ?? null,
  };
}

interface GetSimilarJobsOptions {
  currentJobId: string;
  currentCategory: string | null;
  currentLocation: string | null;
  currentLocationType: string | null;
  limit: number;
}

export interface SimilarJobsResult {
  jobs: SimilarJob[];
  // 'similar' means the results came from the category/related-category
  // ladder and are topically relevant. 'broad' means we fell back to a
  // random selection of recent approved jobs because nothing matched —
  // the calling UI should switch its CTA accordingly.
  fallback: "similar" | "broad";
}

// Returns up to `limit` approved jobs relevant to the current job, using a
// narrow-to-wide ladder:
//   1. same category, same location (highest relevance)
//   2. same category, any location (backfill within category)
//   3. related categories, any location (final backfill)
//   4. random recent approved jobs (broad fallback — keeps the section
//      populated on pages where the category has no siblings, and varies
//      per pageload so SEO duplicate-content risk is low)
// Sorted by is_featured DESC, created_at DESC (except the broad fallback,
// which is randomised). Excludes the current job. Only approved jobs ever
// appear — showing an expired role on a similar-roles list would defeat
// the purpose.
export async function getSimilarJobs(
  supabase: SupabaseClient,
  options: GetSimilarJobsOptions,
): Promise<SimilarJobsResult> {
  const { currentJobId, currentCategory, currentLocation, currentLocationType, limit } = options;

  const currentLocationSlug = currentLocationType === "remote"
    ? "remote"
    : currentLocation
      ? extractLocationSlug(currentLocation, null, null)
      : null;

  const collected: SimilarJob[] = [];
  const seenIds = new Set<string>([currentJobId]);

  // Step 1: same category — fetch a chunk then split by location client-side
  // so we can prefer same-location matches without two round-trips.
  if (currentCategory) {
    const { data, error } = await supabase
      .from("jobs")
      .select(JOB_FIELDS)
      .eq("status", "approved")
      .eq("category", currentCategory)
      .neq("id", currentJobId)
      .order("is_featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      console.error("[getSimilarJobs] Step 1 query failed:", error);
    } else if (data) {
      const jobs = data.map(normaliseJob);
      const sameLocation: SimilarJob[] = [];
      const otherLocation: SimilarJob[] = [];
      for (const job of jobs) {
        const jobLocSlug = job.location_type === "remote"
          ? "remote"
          : extractLocationSlug(job.location || "", null, null);
        if (currentLocationSlug && jobLocSlug === currentLocationSlug) {
          sameLocation.push(job);
        } else {
          otherLocation.push(job);
        }
      }
      for (const job of [...sameLocation, ...otherLocation]) {
        if (collected.length >= limit) break;
        if (!seenIds.has(job.id)) {
          collected.push(job);
          seenIds.add(job.id);
        }
      }
    }
  }

  if (collected.length >= limit) return { jobs: collected, fallback: "similar" };

  // Step 2: related-category backfill so we rarely need the broad fallback.
  if (currentCategory) {
    const related = getRelatedCategories(currentCategory);
    if (related.length > 0) {
      const { data, error } = await supabase
        .from("jobs")
        .select(JOB_FIELDS)
        .eq("status", "approved")
        .in("category", related)
        .neq("id", currentJobId)
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(limit * 2);

      if (error) {
        console.error("[getSimilarJobs] Step 2 query failed:", error);
      } else if (data) {
        for (const row of data) {
          if (collected.length >= limit) break;
          const job = normaliseJob(row);
          if (!seenIds.has(job.id)) {
            collected.push(job);
            seenIds.add(job.id);
          }
        }
      }
    }
  }

  // Keep any narrow matches we found rather than replacing them with a broad
  // selection — relevance beats count when we have at least one match.
  if (collected.length > 0) return { jobs: collected, fallback: "similar" };

  // Step 3: broad fallback — pool the most recent approved jobs, shuffle,
  // take `limit`. Ensures the section stays populated on pages where nothing
  // category-adjacent exists, and varies per pageload so Google doesn't see
  // identical "similar roles" blocks across different expired URLs.
  const { data: broadData, error: broadError } = await supabase
    .from("jobs")
    .select(JOB_FIELDS)
    .eq("status", "approved")
    .neq("id", currentJobId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (broadError) {
    console.error("[getSimilarJobs] Step 3 (broad) query failed:", broadError);
    return { jobs: [], fallback: "broad" };
  }
  if (!broadData || broadData.length === 0) {
    return { jobs: [], fallback: "broad" };
  }

  const pool = broadData.map(normaliseJob);
  // Fisher-Yates shuffle.
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return { jobs: pool.slice(0, limit), fallback: "broad" };
}
