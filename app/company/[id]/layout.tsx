import { Metadata } from "next";

/**
 * Company profile pages are tagged noindex, follow:
 *
 * - The client page is a simple listing of a company's jobs, which are
 *   already indexed individually at /jobs/<id>. Indexing the company page
 *   alongside each job creates near-duplicate content and dilutes equity.
 * - The URL is an opaque UUID (/company/<uuid>), useless to rank for any
 *   query a human would type.
 *
 * `follow` stays on so Google still traverses the links through to the
 * individual job pages. Sitemap no longer advertises these URLs either,
 * but we keep the layout-level noindex as the primary signal — Google
 * drops pages from its index on the next crawl regardless of whether
 * they're in the sitemap.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function CompanyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
