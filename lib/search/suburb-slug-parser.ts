import { CURATED_SEARCH_KEYWORDS } from './generator';
import { findSuburb, type AuSuburb } from '@/lib/locations/au-suburbs';

type Keyword = typeof CURATED_SEARCH_KEYWORDS[number];

const STATE_ABBRS = new Set(['nsw', 'vic', 'qld', 'wa', 'sa', 'tas', 'act', 'nt']);

// Longest keyword first so "machine-learning" wins over a hypothetical
// "machine" prefix match when parsing "machine-learning-bondi-nsw".
const KEYWORDS_BY_LENGTH: readonly Keyword[] = [...CURATED_SEARCH_KEYWORDS].sort(
  (a, b) => b.slug.length - a.slug.length,
);

export interface SuburbSearchMatch {
  keyword: Keyword;
  suburb: AuSuburb;
}

/**
 * Parses a slug of the form "<keyword-slug>-<suburb-slug>-<state-abbr>"
 * into its component parts. Returns null if the slug does not match a
 * curated keyword + curated suburb + valid state combination.
 *
 * Example:
 *   "ai-engineer-richmond-vic" → { keyword: AI Engineer, suburb: Richmond VIC }
 *   "ai-engineer-richmond-nsw" → { keyword: AI Engineer, suburb: Richmond NSW }
 *   "ai-engineer"              → null (plain keyword slug, caller handles)
 *   "ai-engineer-fakeburb-vic" → null (suburb not in curated list)
 */
export function parseSuburbSearchSlug(slug: string): SuburbSearchMatch | null {
  if (!slug) return null;

  for (const keyword of KEYWORDS_BY_LENGTH) {
    const prefix = `${keyword.slug}-`;
    if (!slug.startsWith(prefix)) continue;

    const remainder = slug.slice(prefix.length);
    if (!remainder) continue;

    const lastDash = remainder.lastIndexOf('-');
    if (lastDash <= 0) continue;

    const stateAbbr = remainder.slice(lastDash + 1).toLowerCase();
    if (!STATE_ABBRS.has(stateAbbr)) continue;

    const suburbSlug = remainder.slice(0, lastDash);
    if (!suburbSlug) continue;

    const suburb = findSuburb(suburbSlug, stateAbbr);
    if (!suburb) continue;

    return { keyword, suburb };
  }

  return null;
}
