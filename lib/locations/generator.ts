import { createClient } from '@supabase/supabase-js';

// Australian state/territory abbreviations used to strip trailing state codes
// from location strings (e.g. "Sydney NSW" → "Sydney", "Melbourne VIC" → "Melbourne")
const STATE_ABBRS = new Set(['nsw', 'vic', 'qld', 'wa', 'sa', 'tas', 'act', 'nt']);

/**
 * Strips a trailing Australian state abbreviation from a location string.
 * "Sydney NSW" → "Sydney", "North Sydney NSW" → "North Sydney",
 * "Melbourne" → "Melbourne" (no change)
 */
function stripTrailingState(location: string): string {
  const parts = location.trim().split(/\s+/);
  if (parts.length >= 2 && STATE_ABBRS.has(parts[parts.length - 1].toLowerCase())) {
    return parts.slice(0, -1).join(' ');
  }
  return location;
}

/**
 * Extracts and normalizes location from location string.
 *
 * Handles multi-location strings ("Sydney NSW | Melbourne VIC" → "sydney"),
 * strips trailing state abbreviations, and normalises to a URL-safe slug.
 *
 * Examples:
 * - "Melbourne, VIC" → "melbourne"
 * - "Sydney NSW" → "sydney"
 * - "Sydney NSW | Melbourne VIC" → "sydney"
 * - "North Sydney NSW" → "north-sydney"
 * - "Remote" → "remote"
 *
 * Note: suburb and state parameters are optional and may be null if the
 * database columns don't exist yet. They will be used when available.
 */
export function extractLocationSlug(
  location: string,
  suburb?: string | null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _state?: string | null // Reserved for future use
): string {
  // Prefer structured suburb data if available
  if (suburb && suburb.trim()) {
    const stripped = stripTrailingState(suburb);
    return stripped
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  // Take first location before pipe or slash separators (multi-location strings)
  const firstLocation = location
    .split(/[|/]/)[0]
    .split(',')[0] // Take first part before comma
    .trim();

  // Strip trailing state abbreviation ("Sydney NSW" → "Sydney")
  const withoutState = stripTrailingState(firstLocation);

  const normalized = withoutState
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized || 'australia';
}

/**
 * Map of known city slugs to proper display names.
 */
const KNOWN_CITY_NAMES: Record<string, string> = {
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

// Minimum number of approved jobs required for a location to appear in the
// sitemap and browse UI. Prevents one-off junk slugs from polluting SEO
// while still allowing new locations to grow organically.
const MIN_JOBS_FOR_SITEMAP = 2;

/**
 * Generates a human-readable location name from slug
 */
export function locationSlugToName(slug: string): string {
  return KNOWN_CITY_NAMES[slug] || slug
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
  // Check for required env vars - return empty array if missing (allows build to proceed)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('[getAllJobLocations] Missing Supabase env vars, returning empty array');
    return [];
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
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

  // Convert to array, filter out locations with too few jobs (prevents junk
  // slugs from one-off bad data polluting the sitemap), and sort by count
  const locations = Array.from(locationMap.entries())
    .filter(([, data]) => data.count >= MIN_JOBS_FOR_SITEMAP)
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
