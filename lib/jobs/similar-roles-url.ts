import { VALID_CATEGORY_SLUGS } from "@/lib/job-import/categories";
import { extractLocationSlug } from "@/lib/locations/generator";

function normaliseCategorySlug(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/&/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

interface SimilarRolesInput {
  category?: string | null;
  location?: string | null;
  location_type?: string | null;
}

// Returns the best on-site destination for "Browse similar roles →" on an
// expired job page. We ladder from most-targeted to most-reliable:
//
//   1. Cross page (/jobs/category/<cat>/<loc>) when we can derive a clean
//      location slug — the cross route has a graceful empty state (no 404)
//      and when the combo has jobs it's the most relevant landing page.
//   2. Category SEO page (/jobs/category/<cat>) — its getCategoryJobs helper
//      always fills to 9 results using related categories, so it never goes
//      thin even if this exact category has few approved jobs right now.
//   3. /jobs as the catch-all for jobs with legacy/non-canonical categories
//      (those would permanent-redirect from the category page anyway).
//
// Keeps the visitor on-site with relevant jobs — the whole point of showing
// an expired job instead of 404'ing it.
export function getSimilarRolesUrl(job: SimilarRolesInput): string {
  if (!job.category) return "/jobs";

  const categorySlug = normaliseCategorySlug(job.category);
  if (!(VALID_CATEGORY_SLUGS as readonly string[]).includes(categorySlug)) {
    return "/jobs";
  }

  let locationSlug: string | null = null;
  if (job.location_type === "remote") {
    locationSlug = "remote";
  } else if (job.location) {
    const extracted = extractLocationSlug(job.location, null, null);
    // "australia" is the fallback extractLocationSlug returns for unparseable
    // locations — treat it as no-location and use the category page instead.
    if (extracted && extracted !== "australia") {
      locationSlug = extracted;
    }
  }

  if (locationSlug) {
    return `/jobs/category/${categorySlug}/${locationSlug}`;
  }

  return `/jobs/category/${categorySlug}`;
}
