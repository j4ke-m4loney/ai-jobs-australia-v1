import { notFound } from "next/navigation";

// TODO(company-pages): This route is intentionally disabled and returns 404.
//
// The previous implementation was a client component that listed a company's
// jobs, keyed on the opaque Supabase UUID (/company/<uuid>). That produced
// 274 thin, near-duplicate pages that diluted the SEO equity on the
// individual /jobs/<id> pages they mirrored.
//
// The full original page.tsx is preserved in git history — see commit
// 903f7ab (or earlier) if you need to retrieve it:
//     git show 903f7ab:app/company/[id]/page.tsx
//
// When this is rebuilt, prefer:
//   1. A dedicated `slug` column on the `companies` table so URLs become
//      human-readable (e.g. /companies/atlassian) rather than UUIDs.
//   2. A server component with generateMetadata + generateStaticParams so
//      each page has proper SEO metadata from the edge.
//   3. Richer content than just a job list — company description, size,
//      sector, hiring cadence — to justify a standalone landing page.
export default function CompanyProfilePage() {
  notFound();
}
