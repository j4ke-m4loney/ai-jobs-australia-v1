/**
 * Smart truncation utilities that preserve word boundaries
 */

/**
 * Truncates text at the last complete word before the maxLength limit.
 * Adds an ellipsis if text was truncated.
 *
 * @param text - The text to truncate
 * @param maxLength - Maximum character length
 * @param ellipsis - Whether to add "..." when truncated (default: true)
 * @returns Truncated text that ends at a word boundary
 */
export function truncateAtWordBoundary(
  text: string,
  maxLength: number,
  ellipsis: boolean = true
): string {
  if (!text || text.length <= maxLength) {
    return text || '';
  }

  // Account for ellipsis in the max length
  const effectiveMax = ellipsis ? maxLength - 3 : maxLength;

  // Find the last space within the limit
  const truncated = text.slice(0, effectiveMax);
  const lastSpaceIndex = truncated.lastIndexOf(' ');

  // If no space found, just cut at the limit (rare for long text)
  if (lastSpaceIndex === -1) {
    return text.slice(0, effectiveMax) + (ellipsis ? '...' : '');
  }

  // Cut at the last word boundary
  const result = truncated.slice(0, lastSpaceIndex).trim();

  // Remove trailing punctuation that looks awkward before ellipsis (like commas, dashes)
  const cleanedResult = result.replace(/[,\-–—:;]$/, '').trim();

  return cleanedResult + (ellipsis ? '...' : '');
}

/**
 * Truncates each string in an array at word boundaries
 *
 * @param items - Array of strings to truncate
 * @param maxLength - Maximum character length per item
 * @param maxItems - Maximum number of items to keep
 * @returns Array of truncated strings
 */
export function truncateArrayItems(
  items: string[],
  maxLength: number,
  maxItems: number = 3
): string[] {
  if (!items || !Array.isArray(items)) {
    return [];
  }

  return items
    .slice(0, maxItems)
    .map(item => truncateAtWordBoundary(item, maxLength))
    .filter(item => item.length > 0);
}
