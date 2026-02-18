/**
 * Combines job description and requirements for display.
 * For existing jobs with separate fields, merges them seamlessly.
 * For new jobs, returns just the description.
 *
 * TODO: CLEANUP OPPORTUNITY (after ~Feb 2026)
 * Once all existing jobs with separate `requirements` data have expired (jobs last 30 days),
 * this utility function can be removed. At that point:
 * 1. Remove this file and all imports of `getCombinedJobContent`
 * 2. Replace all usages with just `job.description`
 * 3. Remove the separate Requirements editor in employer edit mode
 *    (/app/(dashboard)/employer/jobs/[id]/page.tsx - TabsContent "description")
 * 4. Optionally drop the `requirements` column from the jobs table
 *
 * Before cleanup, verify no jobs have `requirements` data:
 * SELECT COUNT(*) FROM jobs WHERE requirements IS NOT NULL AND requirements != '';
 */
/**
 * Formats a single job type slug (e.g. "full-time") into display text ("Full Time").
 */
function formatJobTypeSlug(type: string): string {
  return type
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Formats a job_type array for display, e.g. ["part-time", "internship"] → "Part Time / Internship"
 */
export function formatJobTypes(types: string[]): string {
  return types.map(formatJobTypeSlug).join(" / ");
}

export function getCombinedJobContent(
  description: string,
  requirements: string | null | undefined
): string {
  if (!requirements || requirements.trim() === '') {
    return description;
  }
  return `${description}\n\n${requirements}`;
}
