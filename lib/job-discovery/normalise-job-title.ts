/**
 * Normalises a job title for deduplication comparison.
 *
 * Strips trailing location qualifiers (e.g. " - Sydney, Australia"),
 * work-mode suffixes (e.g. " - Remote"), collapses whitespace, and lowercases.
 */
export function normaliseJobTitle(title: string): string {
  let normalised = title.toLowerCase().trim();

  // Strip trailing location/work-mode qualifiers like:
  //   " - Sydney, Australia"
  //   " (Australia and New Zealand)"
  //   " - Remote"
  //   " - Hybrid"
  //   " — Melbourne"
  normalised = normalised
    .replace(/\s*[-–—]\s*(remote|hybrid|on[- ]?site)\s*$/i, '')
    .replace(/\s*\([^)]*\)\s*$/, '')
    .replace(/\s*[-–—]\s*[^,]+,\s*\w[\w\s]*$/, '')
    .replace(/\s*[-–—]\s*(remote|hybrid|on[- ]?site)\s*$/i, '');

  // Collapse whitespace
  normalised = normalised.replace(/\s+/g, ' ').trim();

  return normalised;
}
