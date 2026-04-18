import { cache } from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

// Statuses that have a public, indexable detail page.
// Everything else (pending, rejected, needs_review, draft) returns a 404 so it
// never accumulates in Google's index.
const PUBLIC_STATUSES = new Set(["approved", "expired"]);

// Server-side Supabase client for metadata generation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Cached per-request — deduplicates across generateMetadata, JobLayout, and JobStructuredData
// Fetches job regardless of status so we can distinguish "expired" from "not found"
const getJobById = cache(async (id: string) => {
  const { data } = await supabase
    .from("jobs")
    .select(`
      *,
      companies (
        name,
        logo_url,
        website
      )
    `)
    .eq("id", id)
    .single();
  return data;
});

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const job = await getJobById(id);

    if (!job) {
      notFound();
    }

    // Jobs that aren't publicly visible (pending, rejected, needs_review) —
    // 404 via notFound() so Google drops them from its index.
    if (!PUBLIC_STATUSES.has(job.status)) {
      notFound();
    }

    // Jobs may have a missing `companies` relation (company deleted, never
    // linked, or orphaned after admin cleanup) — render the page anyway with
    // "Company" as a safe fallback rather than 404'ing. Losing the company
    // name is better than losing the SEO value of the whole page.
    const isExpired = job.status === "expired";
    const companyName = job.companies?.name || "Company";
    const jobTitle = isExpired
      ? `${job.title} at ${companyName} (Expired)`
      : `${job.title} at ${companyName}`;

    // Strip HTML tags and truncate description
    const cleanDescription = (job.description || "")
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 160);

    // Use company logo if available, otherwise fall back to site OG image
    const ogImageUrl = job.companies?.logo_url || "https://www.aijobsaustralia.com.au/og-image-temp.png";
    const twitterImageUrl = job.companies?.logo_url || "https://www.aijobsaustralia.com.au/twitter-card.png";

    return {
      title: `${jobTitle} | AI Jobs Australia`,
      description: cleanDescription,
      alternates: {
        canonical: `https://www.aijobsaustralia.com.au/jobs/${id}`,
      },
      openGraph: {
        title: jobTitle,
        description: cleanDescription,
        url: `https://www.aijobsaustralia.com.au/jobs/${id}`,
        siteName: "AI Jobs Australia",
        type: "article",
        locale: "en_AU",
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `${jobTitle} - AI Jobs Australia`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        site: "@AIJobsAustralia",
        creator: "@AIJobsAustralia",
        title: jobTitle,
        description: cleanDescription,
        images: [twitterImageUrl],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    notFound();
  }
}

// Helper to map job_type to schema.org employmentType
function getEmploymentType(jobType: string): string {
  const mapping: Record<string, string> = {
    'full-time': 'FULL_TIME',
    'part-time': 'PART_TIME',
    'contract': 'CONTRACTOR',
    'casual': 'TEMPORARY',
    'internship': 'INTERN',
  };
  return mapping[jobType?.toLowerCase()] || 'FULL_TIME';
}

// Helper to map location_type to jobLocationType
function getJobLocationType(locationType: string): string | null {
  if (locationType === 'remote') return 'TELECOMMUTE';
  return null;
}

// Parse location strings like "Melbourne VIC", "Sydney, NSW", or "Melbourne VIC | Sydney NSW"
function parseLocations(location: string): Array<{ locality: string; region: string | null }> {
  const parts = location.split('|').map(p => p.trim()).filter(Boolean);

  return parts.map(part => {
    // Match "Suburb STATE" or "Suburb, STATE" where STATE is 2-3 uppercase letters
    const match = part.match(/^(.+?)[\s,]+([A-Z]{2,3})$/);
    if (match) {
      return { locality: match[1].trim(), region: match[2] };
    }
    return { locality: part, region: null };
  });
}

// Server component to render structured data.
// Per Google's job posting guidelines, expired postings must NOT include
// JobPosting structured data — otherwise the listing is flagged as a violation.
async function JobStructuredData({ id }: { id: string }) {
  const job = await getJobById(id);

  if (!job || !job.companies) return null;
  if (job.status !== "approved") return null;

  // Strip HTML for description
  const cleanDescription = job.description
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // Build the JobPosting schema
  const jobPostingSchema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description: cleanDescription,
    datePosted: job.created_at,
    validThrough: job.expires_at,
    employmentType: Array.isArray(job.job_type)
      ? job.job_type.map(getEmploymentType)
      : getEmploymentType(job.job_type),
    hiringOrganization: {
      "@type": "Organization",
      name: job.companies.name,
      ...(job.companies.logo_url && { logo: job.companies.logo_url }),
      ...(job.companies.website && { sameAs: job.companies.website }),
    },
    jobLocation: (() => {
      const locations = parseLocations(job.location || '');
      const places = locations.map(loc => ({
        "@type": "Place" as const,
        address: {
          "@type": "PostalAddress" as const,
          addressLocality: loc.locality,
          ...(loc.region && { addressRegion: loc.region }),
          addressCountry: "AU",
        },
      }));
      return places.length === 1 ? places[0] : places;
    })(),
    identifier: {
      "@type": "PropertyValue",
      name: "AI Jobs Australia",
      value: job.id,
    },
  };

  // Add remote work indicator if applicable
  const jobLocationType = getJobLocationType(job.location_type);
  if (jobLocationType) {
    jobPostingSchema.jobLocationType = jobLocationType;
    jobPostingSchema.applicantLocationRequirements = {
      "@type": "Country",
      name: "Australia",
    };
  }

  // Add salary if shown and available
  if (job.show_salary !== false && (job.salary_min || job.salary_max)) {
    const salaryPeriod = job.salary_period || 'year';
    const unitText = salaryPeriod === 'year' ? 'YEAR' : salaryPeriod === 'hour' ? 'HOUR' : 'YEAR';

    jobPostingSchema.baseSalary = {
      "@type": "MonetaryAmount",
      currency: "AUD",
      value: {
        "@type": "QuantitativeValue",
        ...(job.salary_min && job.salary_max
          ? { minValue: job.salary_min, maxValue: job.salary_max }
          : job.salary_min
          ? { value: job.salary_min }
          : { value: job.salary_max }),
        unitText,
      },
    };
  }

  // Add direct apply URL if external
  if (job.application_method === "external" && job.application_url) {
    jobPostingSchema.directApply = true;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jobPostingSchema),
      }}
    />
  );
}

export default async function JobLayout({ children, params }: Props) {
  const { id } = await params;

  const job = await getJobById(id);

  // Job doesn't exist at all — genuine 404
  if (!job) {
    notFound();
  }

  // Non-public statuses (pending, rejected, needs_review) 404 so they never
  // show up in search. Approved + expired pass through to the client page;
  // the expired state is handled there (badge + disabled apply button).
  if (!PUBLIC_STATUSES.has(job.status)) {
    notFound();
  }

  return (
    <>
      <JobStructuredData id={id} />
      {children}
    </>
  );
}
