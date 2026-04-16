import { cache } from 'react';
import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { extractLocationSlug, locationSlugToName, getPopularLocations } from '@/lib/locations/generator';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { RecentJobCard } from '@/components/jobs/RecentJobCard';
import { SignupOrViewAllCard } from '@/components/jobs/SignupOrViewAllCard';

// Map of old state-appended slugs to their canonical form.
// These were previously indexed by Google before the location parser
// was updated to strip trailing state abbreviations.
const LEGACY_SLUG_REDIRECTS: Record<string, string> = {
  // Major cities
  'sydney-nsw': 'sydney',
  'melbourne-vic': 'melbourne',
  'brisbane-qld': 'brisbane',
  'perth-wa': 'perth',
  'adelaide-sa': 'adelaide',
  'canberra-act': 'canberra',
  'gold-coast-qld': 'gold-coast',
  'newcastle-nsw': 'newcastle',
  'hobart-tas': 'hobart',
  'darwin-nt': 'darwin',
  // Suburbs
  'sydney-cbd-nsw': 'sydney-cbd',
  'north-sydney-nsw': 'north-sydney',
  'parramatta-nsw': 'parramatta',
  'surry-hills-nsw': 'surry-hills',
  'barangaroo-nsw': 'barangaroo',
  'bella-vista-nsw': 'bella-vista',
  'broadway-nsw': 'broadway',
  'macquarie-park-nsw': 'macquarie-park',
  'richmond-vic': 'richmond',
  'cremorne-vic': 'cremorne',
  'parkville-vic': 'parkville',
  'mulgrave-vic': 'mulgrave',
  // Multi-location slugs (old parser didn't split on |)
  'melbourne-vic-sydney-nsw': 'melbourne',
  'sydney-nsw-melbourne-vic': 'sydney',
  'sydney-nsw-brisbane-qld-melbourne-vic': 'sydney',
  'melbourne-vic-sydney-nsw-brisbane-qld': 'melbourne',
};

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  location_type: "onsite" | "remote" | "hybrid";
  job_type: string[];
  salary_min: number | null;
  salary_max: number | null;
  show_salary: boolean;
  created_at: string;
  is_featured: boolean;
  highlights?: string[] | null;
  companies?: {
    id: string;
    name: string;
    logo_url: string | null;
    website: string | null;
  } | null;
}

interface LocationPageProps {
  params: Promise<{
    city: string;
  }>;
}

// ISR - Revalidate every hour
export const revalidate = 3600;

// Generate static params for popular locations
export async function generateStaticParams() {
  const popularLocations = await getPopularLocations(20);
  return popularLocations.map(location => ({
    city: location.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: LocationPageProps): Promise<Metadata> {
  const { city } = await params;
  // Use canonical slug for metadata if this is a legacy URL
  const resolvedCity = LEGACY_SLUG_REDIRECTS[city] || city;
  const cityName = locationSlugToName(resolvedCity);

  const jobs = await getLocationJobs(resolvedCity);
  const count = jobs.length;

  return {
    title: count > 0
      ? `${count} AI Jobs in ${cityName} | AI Jobs Australia`
      : `AI Jobs in ${cityName} | AI Jobs Australia`,
    description: `Browse ${count > 0 ? count + ' ' : ''}AI and Machine Learning jobs in ${cityName}, Australia. Find the latest AI, ML, and Data Science opportunities from top companies in ${cityName}. New positions added daily.`,
    alternates: {
      canonical: `https://www.aijobsaustralia.com.au/jobs/location/${resolvedCity}`,
    },
    openGraph: {
      title: count > 0 ? `${count} AI Jobs in ${cityName}` : `AI Jobs in ${cityName}`,
      description: `Browse AI and Machine Learning opportunities in ${cityName}`,
      type: 'website',
    },
  };
}

const getLocationJobs = cache(async function getLocationJobs(citySlug: string): Promise<Job[]> {
  // Check for required env vars - return empty array if missing (allows build to proceed)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('[getLocationJobs] Missing Supabase env vars, returning empty array');
    return [];
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Get all approved jobs - using same pattern as /jobs page
  const { data: jobs, error } = await supabaseAdmin
    .from('jobs')
    .select(`
      *,
      highlights,
      companies (
        id,
        name,
        logo_url,
        website
      )
    `)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .limit(200);

  if (error || !jobs) {
    console.error('Error fetching jobs:', error);
    return [];
  }

  // Transform job - Supabase may return companies as array or single object
  const transformJob = (job: typeof jobs[0]): Job => ({
    id: job.id,
    title: job.title,
    description: job.description,
    location: job.location,
    location_type: job.location_type,
    job_type: job.job_type,
    salary_min: job.salary_min,
    salary_max: job.salary_max,
    show_salary: job.show_salary,
    created_at: job.created_at,
    is_featured: job.is_featured,
    highlights: job.highlights,
    companies: Array.isArray(job.companies) && job.companies.length > 0
      ? job.companies[0]
      : job.companies || null
  });

  // Filter jobs by location
  // Handle "remote" as special case
  if (citySlug === 'remote') {
    return jobs
      .filter(job => job.location_type === 'remote')
      .map(transformJob);
  }

  // Filter by city slug (parse location string)
  // Note: suburb and state columns may not exist yet
  const locationJobs = jobs
    .filter(job => {
      const jobLocationSlug = extractLocationSlug(job.location, null, null);
      return jobLocationSlug === citySlug;
    })
    .map(transformJob);

  return locationJobs;
});

export default async function LocationPage({ params }: LocationPageProps) {
  const { city } = await params;

  // Redirect old state-appended slugs (e.g. /jobs/location/sydney-nsw → /jobs/location/sydney)
  const canonicalSlug = LEGACY_SLUG_REDIRECTS[city];
  if (canonicalSlug) {
    permanentRedirect(`/jobs/location/${canonicalSlug}`);
  }

  const cityName = locationSlugToName(city);
  const allJobs = await getLocationJobs(city);

  // Show 404 if location has no jobs
  if (allJobs.length === 0) {
    notFound();
  }

  // Split jobs: first 9 public, rest behind signup
  const publicJobs = allJobs.slice(0, 9);
  const hiddenJobsCount = Math.max(0, allJobs.length - 9);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">AI Jobs in {cityName}</h1>
          <p className="text-xl text-muted-foreground">
            {allJobs.length} AI, machine learning, and data science {allJobs.length === 1 ? 'position' : 'positions'} available in {cityName}
          </p>
        </div>

        {/* Job Listings - Public (First 9) with gradient fade-out */}
        <div className="relative">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {publicJobs.map((job, index) => (
              <div key={job.id} className={`h-full ${index >= 6 ? 'pointer-events-none' : ''}`}>
                <RecentJobCard job={job} />
              </div>
            ))}
          </div>

          {/* Gradient fade-out overlay - gentle fade on bottom 3 cards */}
          <div
            className="absolute bottom-0 left-0 right-0 pointer-events-none z-10"
            style={{
              height: '550px',
              background: 'linear-gradient(to bottom, transparent 0%, transparent 40%, hsl(var(--background)) 95%, hsl(var(--background)) 100%)'
            }}
          />
        </div>

        {/* Signup or View All Card - Shows signup for anonymous, "View All" for logged-in users */}
        <SignupOrViewAllCard
          hiddenJobsCount={hiddenJobsCount}
          cityName={cityName}
          redirectPath={`/jobs/location/${city}`}
          isLocation={true}
        />

        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'JobPostingCollection',
              'name': `AI Jobs in ${cityName}`,
              'description': `Find AI and machine learning jobs in ${cityName}, Australia`,
              'numberOfItems': allJobs.length,
            }),
          }}
        />
      </main>

      <Footer />
    </div>
  );
}
