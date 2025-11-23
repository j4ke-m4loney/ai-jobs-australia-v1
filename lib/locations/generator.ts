import { createClient } from '@supabase/supabase-js';

/**
 * Extracts and normalizes location from location string
 * Examples:
 * - "Melbourne, VIC" → "melbourne"
 * - "Sydney NSW" → "sydney"
 * - "Remote" → "remote"
 *
 * Note: suburb and state parameters are optional and may be null if the
 * database columns don't exist yet. They will be used when available.
 */
export function extractLocationSlug(
  location: string,
  suburb?: string | null,
  _state?: string | null // Prefixed with _ since it's not used yet
): string {
  // Prefer structured suburb data if available
  if (suburb && suburb.trim()) {
    return suburb
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // Parse from location string
  // "Melbourne, VIC" → "melbourne"
  // "Sydney NSW" → "sydney"
  const normalized = location
    .toLowerCase()
    .split(',')[0] // Take first part before comma
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized || 'australia';
}

/**
 * Generates a human-readable location name from slug
 */
export function locationSlugToName(slug: string): string {
  // Map of known city slugs to proper names
  const cityMap: Record<string, string> = {
    'sydney': 'Sydney',
    'melbourne': 'Melbourne',
    'brisbane': 'Brisbane',
    'perth': 'Perth',
    'adelaide': 'Adelaide',
    'canberra': 'Canberra',
    'gold-coast': 'Gold Coast',
    'newcastle': 'Newcastle',
    'wollongong': 'Wollongong',
    'geelong': 'Geelong',
    'hobart': 'Hobart',
    'darwin': 'Darwin',
    'cairns': 'Cairns',
    'townsville': 'Townsville',
    'remote': 'Remote',
    'australia': 'Australia',
  };

  return cityMap[slug] || slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Generates state name from abbreviation
 */
export function stateToName(stateAbbr: string): string {
  const stateMap: Record<string, string> = {
    'NSW': 'New South Wales',
    'VIC': 'Victoria',
    'QLD': 'Queensland',
    'WA': 'Western Australia',
    'SA': 'South Australia',
    'TAS': 'Tasmania',
    'ACT': 'Australian Capital Territory',
    'NT': 'Northern Territory',
  };

  return stateMap[stateAbbr.toUpperCase()] || stateAbbr;
}

/**
 * Fetches all unique job locations from the database
 */
export async function getAllJobLocations(): Promise<Array<{
  slug: string;
  name: string;
  count: number;
  state?: string | null;
}>> {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get all approved jobs with location data
  // Note: suburb and state columns may not exist yet - only query location
  const { data: jobs, error } = await supabaseAdmin
    .from('jobs')
    .select('location')
    .eq('status', 'approved');

  if (error || !jobs) {
    console.error('Error fetching jobs for locations:', error);
    return [];
  }

  // Extract locations and count occurrences
  const locationMap = new Map<string, { count: number; state?: string | null }>();

  jobs.forEach(job => {
    const slug = extractLocationSlug(job.location, null, null);
    const existing = locationMap.get(slug) || { count: 0 };
    locationMap.set(slug, {
      count: existing.count + 1,
      state: null, // Will be populated when suburb/state columns exist
    });
  });

  // Convert to array and sort by count (most popular first)
  const locations = Array.from(locationMap.entries())
    .map(([slug, data]) => ({
      slug,
      name: locationSlugToName(slug),
      count: data.count,
      state: data.state,
    }))
    .sort((a, b) => b.count - a.count);

  return locations;
}

/**
 * Gets the top N most popular job locations
 */
export async function getPopularLocations(limit: number = 20): Promise<Array<{
  slug: string;
  name: string;
  count: number;
  state?: string | null;
}>> {
  const allLocations = await getAllJobLocations();
  return allLocations.slice(0, limit);
}

/**
 * Checks if a location exists (has jobs)
 */
export async function locationExists(locationSlug: string): Promise<boolean> {
  const allLocations = await getAllJobLocations();
  return allLocations.some(loc => loc.slug === locationSlug);
}
