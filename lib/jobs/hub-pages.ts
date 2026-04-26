import { cache } from 'react';
import { createClient } from '@supabase/supabase-js';

// Hub pages = SEO landing pages along non-location/non-category axes:
// seniority, job type, salary tier. Each axis has its own slug list and
// filter predicate. The shared fetcher loads all approved jobs once per
// request (React.cache de-dupes), then each page filters in memory.
//
// Same pattern as /jobs/category/[slug] and /jobs/location/[city] — load
// everything, filter, never silently truncate. Salary jobs deliberately
// IGNORE show_salary: we use salary_min/max to filter (since that data
// exists in the DB even when hidden from the public card), and the
// RecentJobCard component itself respects show_salary for display.

export interface HubJob {
  id: string;
  title: string;
  description: string;
  location: string;
  location_type: 'onsite' | 'remote' | 'hybrid';
  job_type: string[];
  salary_min: number | null;
  salary_max: number | null;
  show_salary: boolean;
  created_at: string;
  is_featured: boolean;
  highlights?: string[] | null;
  companies?: {
    id: string;
    name: string;
    logo_url: string | null;
    website: string | null;
  } | null;
}

interface HubJobsResult {
  /** Up to `targetCount` jobs matching the filter, newest first. */
  displayJobs: HubJob[];
  /** Total count of approved jobs matching the filter. Used for the
   *  subtitle and metadata. */
  primaryCount: number;
}

// ────────────────────────────────────────────────────────────────────────────
// Slug definitions — exported so route handlers and sitemap can iterate
// ────────────────────────────────────────────────────────────────────────────

export const SENIORITY_SLUGS = ['senior'] as const;
export type SenioritySlug = typeof SENIORITY_SLUGS[number];

// Slugs deliberately omit 'full-time' — ~90% of approved jobs are full-time
// so /jobs/type/full-time would be near-duplicate of /jobs and Google would
// fold them. Add only when there's a meaningfully filtered subset.
export const JOB_TYPE_SLUGS = ['contract', 'internship'] as const;
export type JobTypeSlug = typeof JOB_TYPE_SLUGS[number];

export const SALARY_SLUGS = ['100k-plus', '120k-plus', '150k-plus', '200k-plus'] as const;
export type SalarySlug = typeof SALARY_SLUGS[number];

const SALARY_THRESHOLDS: Record<SalarySlug, number> = {
  '100k-plus': 100000,
  '120k-plus': 120000,
  '150k-plus': 150000,
  '200k-plus': 200000,
};

// ────────────────────────────────────────────────────────────────────────────
// Display names
// ────────────────────────────────────────────────────────────────────────────

export function senioritySlugToDisplayName(slug: SenioritySlug): string {
  if (slug === 'senior') return 'Senior';
  return slug;
}

export function jobTypeSlugToDisplayName(slug: JobTypeSlug): string {
  if (slug === 'contract') return 'Contract';
  if (slug === 'internship') return 'Internship';
  return slug;
}

export function salarySlugToDisplayName(slug: SalarySlug): string {
  // "100k-plus" → "$100k+"
  const threshold = SALARY_THRESHOLDS[slug];
  return `$${Math.floor(threshold / 1000)}k+`;
}

// ────────────────────────────────────────────────────────────────────────────
// Filter predicates
// ────────────────────────────────────────────────────────────────────────────

// Match common senior-level title prefixes. Inclusive on purpose — "Lead"
// and "Head of" roles are functionally senior even when the explicit word
// "senior" is missing. Conservative on "Manager" because manager roles
// span a wide seniority range.
const SENIOR_TITLE_REGEX = /\b(senior|sr\.?|principal|staff|lead|head\s+of)\b/i;

function isSeniorJob(job: { title?: string | null }): boolean {
  if (!job.title) return false;
  return SENIOR_TITLE_REGEX.test(job.title);
}

function hasJobType(slug: JobTypeSlug) {
  return (job: { job_type?: string[] | null }): boolean => {
    if (!Array.isArray(job.job_type)) return false;
    if (slug === 'contract') {
      // 'fixed-term' is functionally a contract from the searcher's POV
      return job.job_type.some(t => t === 'contract' || t === 'fixed-term');
    }
    return job.job_type.includes(slug);
  };
}

function meetsSalaryThreshold(threshold: number) {
  return (job: { salary_min?: number | null; salary_max?: number | null }): boolean => {
    const min = job.salary_min ?? 0;
    const max = job.salary_max ?? 0;
    return min >= threshold || max >= threshold;
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Fetcher — paginated, cached per request
// ────────────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type RawJobRow = any;

const fetchAllApprovedJobs = cache(async (): Promise<RawJobRow[]> => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('[hub-pages] Missing Supabase env vars, returning empty array');
    return [];
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );

  const BATCH = 1000;
  const jobs: RawJobRow[] = [];
  for (let offset = 0; ; offset += BATCH) {
    const { data, error } = await supabaseAdmin
      .from('jobs')
      .select(`
        *,
        highlights,
        companies (
          id,
          name,
          logo_url,
          website
        )
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .range(offset, offset + BATCH - 1);
    if (error) {
      console.error('[hub-pages] Error fetching jobs:', error);
      return [];
    }
    if (!data || data.length === 0) break;
    jobs.push(...data);
    if (data.length < BATCH) break;
  }
  return jobs;
});

function transformJob(raw: RawJobRow): HubJob {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    location: raw.location,
    location_type: raw.location_type,
    job_type: raw.job_type,
    salary_min: raw.salary_min,
    salary_max: raw.salary_max,
    show_salary: raw.show_salary,
    created_at: raw.created_at,
    is_featured: raw.is_featured,
    highlights: raw.highlights,
    companies:
      Array.isArray(raw.companies) && raw.companies.length > 0
        ? raw.companies[0]
        : raw.companies || null,
  };
}

async function getJobsByPredicate(
  predicate: (job: RawJobRow) => boolean,
  targetCount: number,
): Promise<HubJobsResult> {
  const all = await fetchAllApprovedJobs();
  const matched = all.filter(predicate);
  return {
    displayJobs: matched.slice(0, targetCount).map(transformJob),
    primaryCount: matched.length,
  };
}

// ────────────────────────────────────────────────────────────────────────────
// Public API — one helper per axis
// ────────────────────────────────────────────────────────────────────────────

export async function getSeniorityJobs(
  slug: SenioritySlug,
  targetCount: number = 9,
): Promise<HubJobsResult> {
  if (slug !== 'senior') return { displayJobs: [], primaryCount: 0 };
  return getJobsByPredicate(isSeniorJob, targetCount);
}

export async function getJobTypeJobs(
  slug: JobTypeSlug,
  targetCount: number = 9,
): Promise<HubJobsResult> {
  return getJobsByPredicate(hasJobType(slug), targetCount);
}

export async function getSalaryJobs(
  slug: SalarySlug,
  targetCount: number = 9,
): Promise<HubJobsResult> {
  const threshold = SALARY_THRESHOLDS[slug];
  return getJobsByPredicate(meetsSalaryThreshold(threshold), targetCount);
}
