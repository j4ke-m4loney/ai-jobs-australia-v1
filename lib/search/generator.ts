import { createClient } from '@supabase/supabase-js';

/**
 * Curated search keywords for SEO landing pages.
 * Each keyword generates a page at /jobs/search/[slug].
 * Jobs are matched via broad ILIKE on title + description.
 */
export const CURATED_SEARCH_KEYWORDS = [
  { slug: 'ai-engineer', keyword: 'AI Engineer', displayName: 'AI Engineer' },
  { slug: 'data-scientist', keyword: 'Data Scientist', displayName: 'Data Scientist' },
  { slug: 'machine-learning', keyword: 'Machine Learning', displayName: 'Machine Learning' },
  { slug: 'data-engineer', keyword: 'Data Engineer', displayName: 'Data Engineer' },
  { slug: 'software-engineer', keyword: 'Software Engineer', displayName: 'Software Engineer' },
  { slug: 'mlops', keyword: 'MLOps', displayName: 'MLOps' },
  { slug: 'ai-platform', keyword: 'AI Platform', displayName: 'AI Platform' },
  { slug: 'deep-learning', keyword: 'Deep Learning', displayName: 'Deep Learning' },
  { slug: 'nlp', keyword: 'NLP', displayName: 'NLP' },
  { slug: 'computer-vision', keyword: 'Computer Vision', displayName: 'Computer Vision' },
  { slug: 'data-analyst', keyword: 'Data Analyst', displayName: 'Data Analyst' },
  { slug: 'ai-governance', keyword: 'AI Governance', displayName: 'AI Governance' },
  { slug: 'ai-architect', keyword: 'AI Architect', displayName: 'AI Architect' },
  { slug: 'ai-researcher', keyword: 'AI Researcher', displayName: 'AI Researcher' },
  { slug: 'python', keyword: 'Python', displayName: 'Python' },
] as const;

type SearchSlug = typeof CURATED_SEARCH_KEYWORDS[number]['slug'];
const VALID_SEARCH_SLUGS = new Set<string>(CURATED_SEARCH_KEYWORDS.map(k => k.slug));

const MIN_JOBS_FOR_SEARCH_PAGE = 5;

/**
 * Related keywords map for internal cross-linking on search pages.
 */
export const RELATED_KEYWORDS: Record<string, SearchSlug[]> = {
  'ai-engineer': ['machine-learning', 'deep-learning', 'mlops', 'python', 'ai-platform'],
  'data-scientist': ['machine-learning', 'python', 'deep-learning', 'data-analyst', 'nlp'],
  'machine-learning': ['ai-engineer', 'deep-learning', 'data-scientist', 'mlops', 'python'],
  'data-engineer': ['data-scientist', 'python', 'mlops', 'ai-platform', 'software-engineer'],
  'software-engineer': ['ai-engineer', 'python', 'data-engineer', 'mlops', 'ai-platform'],
  'mlops': ['data-engineer', 'ai-platform', 'machine-learning', 'software-engineer', 'python'],
  'ai-platform': ['ai-engineer', 'mlops', 'data-engineer', 'software-engineer', 'deep-learning'],
  'deep-learning': ['machine-learning', 'ai-engineer', 'computer-vision', 'nlp', 'ai-researcher'],
  'nlp': ['deep-learning', 'machine-learning', 'ai-researcher', 'data-scientist', 'python'],
  'computer-vision': ['deep-learning', 'machine-learning', 'ai-engineer', 'ai-researcher', 'python'],
  'data-analyst': ['data-scientist', 'python', 'data-engineer', 'machine-learning', 'ai-governance'],
  'ai-governance': ['ai-architect', 'data-analyst', 'ai-engineer', 'ai-researcher', 'ai-platform'],
  'ai-architect': ['ai-engineer', 'ai-platform', 'ai-governance', 'machine-learning', 'deep-learning'],
  'ai-researcher': ['deep-learning', 'nlp', 'machine-learning', 'computer-vision', 'ai-engineer'],
  'python': ['data-scientist', 'data-engineer', 'software-engineer', 'machine-learning', 'mlops'],
};

/**
 * Check if a slug is a valid search keyword.
 */
export function isValidSearchSlug(slug: string): boolean {
  return VALID_SEARCH_SLUGS.has(slug);
}

/**
 * Get the display name for a search slug.
 */
export function searchSlugToDisplayName(slug: string): string {
  const entry = CURATED_SEARCH_KEYWORDS.find(k => k.slug === slug);
  return entry?.displayName ?? slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get the search keyword for a slug (used in ILIKE queries).
 */
export function searchSlugToKeyword(slug: string): string {
  const entry = CURATED_SEARCH_KEYWORDS.find(k => k.slug === slug);
  return entry?.keyword ?? slug.replace(/-/g, ' ');
}

interface SearchJob {
  id: string;
  title: string;
  description: string;
  location: string;
  location_type: 'onsite' | 'remote' | 'hybrid';
  job_type: string[];
  salary_min: number | null;
  salary_max: number | null;
  salary_period?: string;
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

/**
 * Fetch approved jobs matching a keyword in title or description.
 * Results are ordered by: featured first, then newest.
 */
export async function getSearchKeywordJobs(keyword: string, limit: number = 50): Promise<SearchJob[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('[getSearchKeywordJobs] Missing Supabase env vars, returning empty array');
    return [];
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: jobs, error } = await supabaseAdmin
    .from('jobs')
    .select(`
      id,
      title,
      description,
      location,
      location_type,
      job_type,
      salary_min,
      salary_max,
      salary_period,
      show_salary,
      created_at,
      is_featured,
      highlights,
      companies (
        id,
        name,
        logo_url,
        website
      )
    `)
    .eq('status', 'approved')
    .or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`)
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[getSearchKeywordJobs] Error:', error);
    return [];
  }

  // Transform: Supabase may return companies as array or single object
  return (jobs ?? []).map(job => ({
    ...job,
    companies: Array.isArray(job.companies) && job.companies.length > 0
      ? job.companies[0]
      : job.companies || null,
  })) as SearchJob[];
}

/**
 * Get all curated search keywords with live job counts.
 * Only returns keywords with enough jobs to warrant a page.
 */
export async function getAllSearchKeywords(): Promise<Array<{ slug: string; displayName: string; count: number }>> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('[getAllSearchKeywords] Missing Supabase env vars, returning empty array');
    return [];
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const results: Array<{ slug: string; displayName: string; count: number }> = [];

  for (const entry of CURATED_SEARCH_KEYWORDS) {
    const { count, error } = await supabaseAdmin
      .from('jobs')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'approved')
      .or(`title.ilike.%${entry.keyword}%,description.ilike.%${entry.keyword}%`);

    if (error) {
      console.error(`[getAllSearchKeywords] Error for ${entry.slug}:`, error);
      continue;
    }

    if ((count ?? 0) >= MIN_JOBS_FOR_SEARCH_PAGE) {
      results.push({
        slug: entry.slug,
        displayName: entry.displayName,
        count: count ?? 0,
      });
    }
  }

  return results.sort((a, b) => b.count - a.count);
}
