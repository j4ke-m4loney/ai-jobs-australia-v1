import { cache } from 'react';
import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import {
  locationSlugToName,
  getPopularLocations,
  getStateBySlug,
  jobLocationMatchesState,
  canonicalLocationSlug,
} from '@/lib/locations/generator';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { RecentJobCard } from '@/components/jobs/RecentJobCard';
import { SignupOrViewAllCard } from '@/components/jobs/SignupOrViewAllCard';

// Map of old state-appended slugs to their canonical form.
// These were previously indexed by Google before the location parser
// was updated to strip trailing state abbreviations.
const LEGACY_SLUG_REDIRECTS: Record<string, string> = {
  // Major cities — strip trailing state abbrs
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
  // Business districts kept as standalone pages — strip state abbr only
  'parramatta-nsw': 'parramatta',
  'north-sydney-nsw': 'north-sydney',
  // Small Sydney suburbs — 308 single-hop to Sydney so consolidated SEO
  // equity funnels into the main city page instead of a thin suburb page.
  'surry-hills':         'sydney',
  'surry-hills-nsw':     'sydney',
  'chatswood':           'sydney',
  'chatswood-nsw':       'sydney',
  'north-ryde':          'sydney',
  'north-ryde-nsw':      'sydney',
  'st-leonards':         'sydney',
  'st-leonards-nsw':     'sydney',
  'eveleigh':            'sydney',
  'eveleigh-nsw':        'sydney',
  'kensington':          'sydney',
  'kensington-nsw':      'sydney',
  'barangaroo':          'sydney',
  'barangaroo-nsw':      'sydney',
  'bella-vista':         'sydney',
  'bella-vista-nsw':     'sydney',
  'broadway':            'sydney',
  'broadway-nsw':        'sydney',
  'macquarie-park':      'sydney',
  'macquarie-park-nsw':  'sydney',
  'sydney-cbd':          'sydney',
  'sydney-cbd-nsw':      'sydney',
  // Small Melbourne suburbs — 308 single-hop to Melbourne.
  'richmond':            'melbourne',
  'richmond-vic':        'melbourne',
  'cremorne':            'melbourne',
  'cremorne-vic':        'melbourne',
  'parkville':           'melbourne',
  'parkville-vic':       'melbourne',
  'mulgrave':            'melbourne',
  'mulgrave-vic':        'melbourne',
  'chadstone':           'melbourne',
  'chadstone-vic':       'melbourne',
  'hawthorn':            'melbourne',
  'hawthorn-vic':        'melbourne',
  'hawthorn-east':       'melbourne',
  'hawthorn-east-vic':   'melbourne',
  'melbourne-cbd':       'melbourne',
  'melbourne-cbd-vic':   'melbourne',
  // Multi-location slugs (old parser didn't split on |)
  'melbourne-vic-sydney-nsw': 'melbourne',
  'sydney-nsw-melbourne-vic': 'sydney',
  'sydney-nsw-brisbane-qld-melbourne-vic': 'sydney',
  'melbourne-vic-sydney-nsw-brisbane-qld': 'melbourne',
  // State abbreviation shortcuts → canonical state slug so /jobs/location/nsw
  // redirects to /jobs/location/new-south-wales (one canonical URL per state).
  'nsw': 'new-south-wales',
  'vic': 'victoria',
  'qld': 'queensland',
  'wa': 'western-australia',
  'sa': 'south-australia',
  'tas': 'tasmania',
  'act': 'australian-capital-territory',
  'nt': 'northern-territory',
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

  // Paginate to get all approved jobs. PostgREST caps a single response at
  // ~1,000 rows by default, and niche locations/categories often have jobs
  // outside the top N — a hard limit silently returns 0 matches and 404s
  // the page. Since slug matching happens client-side after parsing the
  // location string, we need the full set before filtering.
  const BATCH = 1000;
  type JobRow = {
    id: string;
    title: string;
    description: string;
    location: string;
    location_type: 'onsite' | 'remote' | 'hybrid';
    job_type: string[];
    salary_min: number | null;
    salary_max: number | null;
    show_salary: boolean;
    created_at: string;
    is_featured: boolean;
    highlights: string[] | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    companies: any;
  };
  const jobs: JobRow[] = [];
  for (let offset = 0; ; offset += BATCH) {
    const { data, error } = await supabaseAdmin
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
      .range(offset, offset + BATCH - 1);
    if (error) {
      console.error('Error fetching jobs:', error);
      break;
    }
    if (!data || data.length === 0) break;
    jobs.push(...(data as JobRow[]));
    if (data.length < BATCH) break;
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

  // State-level slug (e.g. "new-south-wales") — aggregate every job whose
  // location string references the state by full name or abbreviation.
  // "Sydney NSW", "Newcastle NSW", and "New South Wales" all qualify.
  const state = getStateBySlug(citySlug);
  if (state) {
    return jobs
      .filter(job => jobLocationMatchesState(job.location, state))
      .map(transformJob);
  }

  // Filter by city slug. Use canonicalLocationSlug so "Surry Hills NSW"
  // et al. roll up into the Sydney page rather than being filtered out —
  // mirrors the sitemap-side aggregation in getAllJobLocations().
  const locationJobs = jobs
    .filter(job => canonicalLocationSlug(job.location) === citySlug)
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
            {allJobs.length} AI, Machine Learning, and Data Science {allJobs.length === 1 ? 'position' : 'positions'} available in {cityName}
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
              'description': `Find AI and Machine Learning jobs in ${cityName}, Australia`,
              'numberOfItems': allJobs.length,
            }),
          }}
        />
      </main>

      <Footer />
    </div>
  );
}
