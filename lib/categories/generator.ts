import { createClient } from '@supabase/supabase-js';
import { VALID_CATEGORY_SLUGS } from '@/lib/job-import/categories';

/**
 * Extracts and normalizes job category from job title
 * Examples:
 * - "Senior AI Engineer" → "ai-engineer"
 * - "Machine Learning Researcher | Remote" → "machine-learning-researcher"
 * - "Data Scientist (Python)" → "data-scientist"
 */
export function extractCategorySlug(jobTitle: string): string {
  // Remove common prefixes and suffixes
  const normalized = jobTitle
    .toLowerCase()
    .replace(/\b(senior|junior|mid-level|lead|principal|staff|entry-level)\b/g, '')
    .replace(/\s*[\|\(\[\{].*$/, '') // Remove everything after |, (, [, {
    .replace(/\s*-\s*remote.*$/i, '') // Remove "- Remote" suffix
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens

  return normalized || 'other';
}

/**
 * Generates a human-readable category name from slug
 */
export function categorySlugToName(slug: string): string {
  // Common acronyms that should be fully uppercase
  const acronyms = new Set(['ai', 'ml', 'nlp', 'cv', 'llm', 'api', 'ui', 'ux', 'aws', 'gcp', 'devops', 'mlops']);

  return slug
    .split('-')
    .map(word => {
      const lowerWord = word.toLowerCase();
      // If it's a known acronym, return it in uppercase
      if (acronyms.has(lowerWord)) {
        return word.toUpperCase();
      }
      // Otherwise, capitalize first letter only
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Fetches all unique job categories from the database
 */
export async function getAllJobCategories(): Promise<Array<{ slug: string; name: string; count: number }>> {
  // Check for required env vars - return empty array if missing (allows build to proceed)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('[getAllJobCategories] Missing Supabase env vars, returning empty array');
    return [];
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Get all approved jobs with their stored category
  const { data: jobs, error } = await supabaseAdmin
    .from('jobs')
    .select('category')
    .eq('status', 'approved')
    .not('category', 'is', null);

  if (error || !jobs) {
    console.error('Error fetching jobs for categories:', error);
    return [];
  }

  // Count occurrences using the stored category column, normalised to canonical slugs
  const validSlugs = new Set(VALID_CATEGORY_SLUGS);
  const categoryMap = new Map<string, number>();

  jobs.forEach(job => {
    if (job.category) {
      const slug = job.category.toLowerCase().replace(/&/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');
      // Only include categories from the canonical list
      if (validSlugs.has(slug)) {
        categoryMap.set(slug, (categoryMap.get(slug) || 0) + 1);
      }
    }
  });

  // Convert to array and sort by count (most popular first)
  const categories = Array.from(categoryMap.entries())
    .map(([slug, count]) => ({
      slug,
      name: categorySlugToName(slug),
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return categories;
}

/**
 * Gets the top N most popular job categories
 */
export async function getPopularCategories(limit: number = 20): Promise<Array<{ slug: string; name: string; count: number }>> {
  const allCategories = await getAllJobCategories();
  return allCategories.slice(0, limit);
}

/**
 * Checks if a category exists (has jobs)
 */
export async function categoryExists(categorySlug: string): Promise<boolean> {
  const allCategories = await getAllJobCategories();
  return allCategories.some(cat => cat.slug === categorySlug);
}
