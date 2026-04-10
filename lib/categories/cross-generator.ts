import { createClient } from '@supabase/supabase-js';
import { VALID_CATEGORY_SLUGS } from '@/lib/job-import/categories';
import { extractLocationSlug } from '@/lib/locations/generator';

// Minimum number of approved jobs required for a category×location cross page
// to appear in the sitemap and be pre-rendered. Higher threshold than single-
// dimension pages because cross pages are more likely to go empty.
const MIN_JOBS_FOR_CROSS_PAGE = 6;

export interface CategoryLocationCombo {
  categorySlug: string;
  locationSlug: string;
  count: number;
}

/**
 * Fetches all category×location combinations that meet the minimum job threshold.
 * Used by the sitemap and generateStaticParams.
 */
export async function getAllCategoryLocationCombos(): Promise<CategoryLocationCombo[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('[getAllCategoryLocationCombos] Missing Supabase env vars, returning empty array');
    return [];
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: jobs, error } = await supabaseAdmin
    .from('jobs')
    .select('category, location, location_type')
    .eq('status', 'approved');

  if (error || !jobs) {
    console.error('Error fetching jobs for cross combos:', error);
    return [];
  }

  const validSlugs = new Set<string>(VALID_CATEGORY_SLUGS);
  const comboMap = new Map<string, number>();

  const normaliseCategory = (raw: string) =>
    raw.toLowerCase().replace(/&/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');

  for (const job of jobs) {
    if (!job.category) continue;

    const catSlug = normaliseCategory(job.category);
    if (!validSlugs.has(catSlug)) continue;

    // Handle remote as a location
    const locSlug = job.location_type === 'remote'
      ? 'remote'
      : extractLocationSlug(job.location, null, null);

    const key = `${catSlug}::${locSlug}`;
    comboMap.set(key, (comboMap.get(key) || 0) + 1);
  }

  const combos: CategoryLocationCombo[] = [];
  for (const [key, count] of comboMap) {
    if (count >= MIN_JOBS_FOR_CROSS_PAGE) {
      const [categorySlug, locationSlug] = key.split('::');
      combos.push({ categorySlug, locationSlug, count });
    }
  }

  return combos.sort((a, b) => b.count - a.count);
}
