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
  // Major Sydney business districts kept as standalone landing pages because
  // they carry meaningful independent search demand.
  'parramatta': 'Parramatta',
  'north-sydney': 'North Sydney',
  'remote': 'Remote',
  'australia': 'Australia',
};

/**
 * Small residential/commercial suburbs that should roll up to their parent
 * city rather than having their own landing page — otherwise suburb pages
 * dilute SEO equity from the main Sydney/Melbourne pages and 404 frequently
 * as low-volume suburb job counts drop under the sitemap threshold.
 *
 * Major business districts (Parramatta, North Sydney) and genuine regional
 * cities (Newcastle, Geelong, Gold Coast, etc.) intentionally stay as
 * standalone pages and are not included here.
 */
const SUBURB_TO_CITY_SLUG: Record<string, string> = {
  // Sydney-region
  'surry-hills':    'sydney',
  'chatswood':      'sydney',
  'north-ryde':     'sydney',
  'st-leonards':    'sydney',
  'eveleigh':       'sydney',
  'kensington':     'sydney',
  'barangaroo':     'sydney',
  'bella-vista':    'sydney',
  'broadway':       'sydney',
  'macquarie-park': 'sydney',
  'sydney-cbd':     'sydney',
  // Melbourne-region
  'richmond':       'melbourne',
  'cremorne':       'melbourne',
  'parkville':      'melbourne',
  'mulgrave':       'melbourne',
  'chadstone':      'melbourne',
  'hawthorn':       'melbourne',
  'hawthorn-east':  'melbourne',
  'melbourne-cbd':  'melbourne',
};

/**
 * Returns the canonical location slug for a job's location string — runs
 * the raw extraction, then folds small suburbs into their parent city.
 * Used by both the sitemap generator (so a "Surry Hills NSW" job counts
 * toward Sydney's count) and the location/cross page filters (so
 * /jobs/location/sydney actually lists those jobs).
 */
export function canonicalLocationSlug(location: string | null | undefined): string {
  const raw = extractLocationSlug(location ?? '', null, null);
  return SUBURB_TO_CITY_SLUG[raw] ?? raw;
}

/**
 * Australian states and territories. Each state generates a location page at
 * /jobs/location/<slug> that aggregates every job whose location string
 * contains the state name or abbreviation anywhere — so "Sydney NSW",
 * "Newcastle NSW" and "New South Wales" all roll up into
 * /jobs/location/new-south-wales, capturing state-level search demand
 * alongside the existing city pages.
 */
export const AUSTRALIAN_STATES = [
  { slug: 'new-south-wales',              name: 'New South Wales',              abbr: 'NSW' },
  { slug: 'victoria',                     name: 'Victoria',                     abbr: 'VIC' },
  { slug: 'queensland',                   name: 'Queensland',                   abbr: 'QLD' },
  { slug: 'western-australia',            name: 'Western Australia',            abbr: 'WA'  },
  { slug: 'south-australia',              name: 'South Australia',              abbr: 'SA'  },
  { slug: 'tasmania',                     name: 'Tasmania',                     abbr: 'TAS' },
  { slug: 'australian-capital-territory', name: 'Australian Capital Territory', abbr: 'ACT' },
  { slug: 'northern-territory',           name: 'Northern Territory',           abbr: 'NT'  },
] as const;

export type AustralianState = typeof AUSTRALIAN_STATES[number];

const STATE_BY_SLUG = new Map<string, AustralianState>(
  AUSTRALIAN_STATES.map(s => [s.slug, s]),
);

export function getStateBySlug(slug: string): AustralianState | null {
  return STATE_BY_SLUG.get(slug) ?? null;
}

/**
 * Returns true if `location` references the given state — by full name
 * (case-insensitive substring) or by abbreviation (case-insensitive word-
 * bounded so "NSW" matches "Sydney NSW" but not "nswrap" and "SA" doesn't
 * match "Disaster").
 */
export function jobLocationMatchesState(
  location: string | null | undefined,
  state: AustralianState,
): boolean {
  if (!location) return false;
  if (location.toLowerCase().includes(state.name.toLowerCase())) return true;
  const abbrRe = new RegExp(`\\b${state.abbr}\\b`, 'i');
  return abbrRe.test(location);
}

// Minimum number of approved jobs required for a location to appear in the
// sitemap and browse UI. Prevents one-off junk slugs from polluting SEO
// while still allowing new locations to grow organically.
const MIN_JOBS_FOR_SITEMAP = 2;

/**
 * Generates a human-readable location name from slug. Checks state slugs
 * first (so "new-south-wales" -> "New South Wales"), then city slugs, then
 * falls back to naive title-casing.
 */
export function locationSlugToName(slug: string): string {
  const state = STATE_BY_SLUG.get(slug);
  if (state) return state.name;
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

  // Extract locations and count occurrences. We use `canonicalLocationSlug`
  // rather than the raw extractor so small suburbs (Surry Hills, Chatswood,
  // Richmond, etc.) roll up into their parent city instead of creating thin
  // standalone landing pages. Also explicitly skip the "australia" fallback
  // slug — it's what extractLocationSlug returns when input is unparseable
  // and should never appear as a sitemap entry.
  const locationMap = new Map<string, { count: number; state?: string | null }>();

  jobs.forEach(job => {
    const slug = canonicalLocationSlug(job.location);
    if (slug === 'australia') return;
    const existing = locationMap.get(slug) || { count: 0 };
    locationMap.set(slug, {
      count: existing.count + 1,
      state: null, // Will be populated when suburb/state columns exist
    });
  });

  // State-level aggregation — a job with "Sydney NSW" counts in both
  // /jobs/location/sydney (city) AND /jobs/location/new-south-wales (state).
  // We count independently then overwrite the entry at the state slug so
  // any collision with city-level counting (e.g. jobs literally tagged
  // "New South Wales") resolves in favour of the state-level superset.
  for (const state of AUSTRALIAN_STATES) {
    let stateCount = 0;
    for (const job of jobs) {
      if (jobLocationMatchesState(job.location, state)) stateCount++;
    }
    if (stateCount > 0) {
      locationMap.set(state.slug, { count: stateCount, state: state.abbr });
    }
  }

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
