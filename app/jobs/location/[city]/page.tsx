import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { extractLocationSlug, locationSlugToName, getPopularLocations } from '@/lib/locations/generator';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { RecentJobCard } from '@/components/jobs/RecentJobCard';
import { SignupOrViewAllCard } from '@/components/jobs/SignupOrViewAllCard';

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  location_type: "onsite" | "remote" | "hybrid";
  job_type: "full-time" | "part-time" | "contract" | "internship";
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
  const cityName = locationSlugToName(city);

  return {
    title: `AI Jobs in ${cityName} | AI Jobs Australia`,
    description: `Find the latest AI and machine learning jobs in ${cityName}, Australia. Browse ${cityName} opportunities from top companies. Apply for AI, ML, and data science positions in ${cityName} today.`,
    openGraph: {
      title: `AI Jobs in ${cityName}`,
      description: `Browse AI and machine learning opportunities in ${cityName}`,
      type: 'website',
    },
  };
}

async function getLocationJobs(citySlug: string): Promise<Job[]> {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
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
}

export default async function LocationPage({ params }: LocationPageProps) {
  const { city } = await params;
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
