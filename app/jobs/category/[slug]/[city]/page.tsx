import { Metadata } from 'next';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { categorySlugToName } from '@/lib/categories/generator';
import { canonicalLocationSlug, locationSlugToName } from '@/lib/locations/generator';
import { VALID_CATEGORY_SLUGS } from '@/lib/job-import/categories';
import { getAllCategoryLocationCombos } from '@/lib/categories/cross-generator';
import { legacyCategorySlugToRedirect } from '@/lib/search/generator';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { RecentJobCard } from '@/components/jobs/RecentJobCard';
import { SignupOrViewAllCard } from '@/components/jobs/SignupOrViewAllCard';
import { Button } from '@/components/ui/button';

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

interface CrossPageProps {
  params: Promise<{
    slug: string;
    city: string;
  }>;
}

// ISR - Revalidate every hour
export const revalidate = 3600;

// Pre-render combinations that meet the minimum threshold
export async function generateStaticParams() {
  const combos = await getAllCategoryLocationCombos();
  return combos.map(combo => ({
    slug: combo.categorySlug,
    city: combo.locationSlug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CrossPageProps): Promise<Metadata> {
  const { slug, city } = await params;
  const categoryName = categorySlugToName(slug);
  const cityName = locationSlugToName(city);

  const title = city === 'remote'
    ? `Remote ${categoryName} Jobs in Australia | AI Jobs Australia`
    : `${categoryName} Jobs in ${cityName} | AI Jobs Australia`;

  const description = city === 'remote'
    ? `Find remote ${categoryName} jobs in Australia. Browse work-from-home ${categoryName} opportunities from top companies. Apply today.`
    : `Find ${categoryName} jobs in ${cityName}, Australia. Browse ${categoryName} opportunities from top companies in ${cityName}. Apply today.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://www.aijobsaustralia.com.au/jobs/category/${slug}/${city}`,
    },
    openGraph: {
      title: city === 'remote'
        ? `Remote ${categoryName} Jobs in Australia`
        : `${categoryName} Jobs in ${cityName}`,
      description: city === 'remote'
        ? `Browse remote ${categoryName} opportunities in Australia`
        : `Browse ${categoryName} opportunities in ${cityName}`,
      type: 'website',
    },
  };
}

async function getCrossJobs(categorySlug: string, citySlug: string): Promise<Job[]> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('[getCrossJobs] Missing Supabase env vars, returning empty array');
    return [];
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Paginate all approved jobs — see location/category page for the
  // underlying "limit silently 404s niche pages" bug.
  const BATCH = 1000;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  type JobRow = any;
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
      console.error('Error fetching cross jobs:', error);
      break;
    }
    if (!data || data.length === 0) break;
    jobs.push(...data);
    if (data.length < BATCH) break;
  }

  const transformJob = (job: JobRow): Job => ({
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

  const normaliseCategory = (raw: string) =>
    raw.toLowerCase().replace(/&/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');

  // Filter by both category AND location
  const matchingJobs = jobs.filter(job => {
    // Check category
    if (!job.category) return false;
    if (normaliseCategory(job.category) !== categorySlug) return false;

    // Check location
    if (citySlug === 'remote') {
      return job.location_type === 'remote';
    }
    const jobLocationSlug = canonicalLocationSlug(job.location);
    return jobLocationSlug === citySlug;
  });

  return matchingJobs.map(transformJob);
}

export default async function CategoryLocationPage({ params }: CrossPageProps) {
  const { slug, city } = await params;

  // Redirect invalid category slugs — delegates to the same ladder used
  // by the single-slug category page: strip location suffixes, try to map
  // to a curated search keyword, else fall back to /jobs?search=<query>.
  if (!(VALID_CATEGORY_SLUGS as readonly string[]).includes(slug)) {
    const { permanentRedirect } = await import('next/navigation');
    permanentRedirect(legacyCategorySlugToRedirect(slug));
  }

  const categoryName = categorySlugToName(slug);
  const cityName = locationSlugToName(city);
  const allJobs = await getCrossJobs(slug, city);

  const pageTitle = city === 'remote'
    ? `Remote ${categoryName} Jobs in Australia`
    : `${categoryName} Jobs in ${cityName}`;

  // Empty state — page stays alive with useful links, no 404
  if (allJobs.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 pt-24 pb-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{pageTitle}</h1>
            <p className="text-xl text-muted-foreground">
              No {categoryName} positions currently available in {cityName}.
            </p>
          </div>

          <div className="max-w-2xl mx-auto text-center py-12">
            <p className="text-lg text-muted-foreground mb-8">
              New roles are added daily. Browse related opportunities or sign up
              to get notified when {categoryName} jobs are posted in {cityName}.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href={`/jobs/category/${slug}`}>
                <Button variant="outline" size="lg">
                  All {categoryName} Jobs
                </Button>
              </Link>
              <Link href={`/jobs/location/${city}`}>
                <Button variant="outline" size="lg">
                  All Jobs in {cityName}
                </Button>
              </Link>
              <Link href="/jobs">
                <Button size="lg">
                  Browse All Jobs
                </Button>
              </Link>
            </div>

            <div className="border rounded-lg p-6 bg-muted/50">
              <h2 className="text-lg font-semibold mb-2">Get Notified</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Create a free account and we&apos;ll alert you when new {categoryName} roles
                are posted in {cityName}.
              </p>
              <Link
                href={`/login?next=${encodeURIComponent(`/jobs/category/${slug}/${city}`)}`}
                className="inline-block bg-primary text-primary-foreground hover:bg-primary/90 font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Sign Up Free
              </Link>
            </div>
          </div>

          {/* Structured data — even with 0 jobs, keeps the page semantically valid */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'JobPostingCollection',
                'name': pageTitle,
                'description': `Find ${categoryName} jobs in ${cityName}, Australia`,
                'numberOfItems': 0,
              }),
            }}
          />
        </main>
        <Footer />
      </div>
    );
  }

  // Split jobs: first 9 public, rest behind signup
  const publicJobs = allJobs.slice(0, 9);
  const hiddenJobsCount = Math.max(0, allJobs.length - 9);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-8">
        {/* Breadcrumb navigation */}
        <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li><Link href="/" className="hover:text-foreground transition-colors">Home</Link></li>
            <li>/</li>
            <li><Link href="/jobs" className="hover:text-foreground transition-colors">Jobs</Link></li>
            <li>/</li>
            <li><Link href={`/jobs/category/${slug}`} className="hover:text-foreground transition-colors">{categoryName}</Link></li>
            <li>/</li>
            <li className="text-foreground font-medium">{cityName}</li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{pageTitle}</h1>
          <p className="text-xl text-muted-foreground">
            {allJobs.length} {categoryName} {allJobs.length === 1 ? 'position' : 'positions'} available in {cityName}
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
          {allJobs.length > 6 && (
            <div
              className="absolute bottom-0 left-0 right-0 pointer-events-none z-10"
              style={{
                height: '550px',
                background: 'linear-gradient(to bottom, transparent 0%, transparent 40%, hsl(var(--background)) 95%, hsl(var(--background)) 100%)'
              }}
            />
          )}
        </div>

        {/* Signup or View All Card */}
        <SignupOrViewAllCard
          hiddenJobsCount={hiddenJobsCount}
          categoryName={`${categoryName} in ${cityName}`}
          redirectPath={`/jobs/category/${slug}/${city}`}
        />

        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'JobPostingCollection',
              'name': pageTitle,
              'description': `Find ${categoryName} jobs in ${cityName}, Australia`,
              'numberOfItems': allJobs.length,
            }),
          }}
        />

        {/* Breadcrumb structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              'itemListElement': [
                {
                  '@type': 'ListItem',
                  'position': 1,
                  'name': 'Home',
                  'item': 'https://www.aijobsaustralia.com.au',
                },
                {
                  '@type': 'ListItem',
                  'position': 2,
                  'name': 'Jobs',
                  'item': 'https://www.aijobsaustralia.com.au/jobs',
                },
                {
                  '@type': 'ListItem',
                  'position': 3,
                  'name': categoryName,
                  'item': `https://www.aijobsaustralia.com.au/jobs/category/${slug}`,
                },
                {
                  '@type': 'ListItem',
                  'position': 4,
                  'name': cityName,
                  'item': `https://www.aijobsaustralia.com.au/jobs/category/${slug}/${city}`,
                },
              ],
            }),
          }}
        />
      </main>

      <Footer />
    </div>
  );
}
