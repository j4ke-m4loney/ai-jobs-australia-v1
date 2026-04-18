import { cache } from 'react';
import { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { categorySlugToName, getPopularCategories } from '@/lib/categories/generator';
import { VALID_CATEGORY_SLUGS } from '@/lib/job-import/categories';
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

interface CategoryPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// ISR - Revalidate every hour
export const revalidate = 3600;

// Generate static params for popular categories
export async function generateStaticParams() {
  const popularCategories = await getPopularCategories(20);
  return popularCategories.map(category => ({
    slug: category.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categoryName = categorySlugToName(slug);

  if (!(VALID_CATEGORY_SLUGS as readonly string[]).includes(slug)) {
    return {};
  }

  const jobs = await getCategoryJobs(slug);
  const count = jobs.length;

  return {
    title: count > 0
      ? `${count} ${categoryName} Jobs in Australia | AI Jobs Australia`
      : `${categoryName} Jobs in Australia | AI Jobs Australia`,
    description: `Browse ${count > 0 ? count + ' ' : ''}${categoryName} jobs in Australia. Find the latest ${categoryName} opportunities from top companies. New ${categoryName} positions added daily.`,
    alternates: {
      canonical: `https://www.aijobsaustralia.com.au/jobs/category/${slug}`,
    },
    openGraph: {
      title: count > 0 ? `${count} ${categoryName} Jobs in Australia` : `${categoryName} Jobs in Australia`,
      description: `Browse ${categoryName} opportunities in AI and Machine Learning`,
      type: 'website',
    },
  };
}

// Get related categories to fill to 9 jobs
function getRelatedCategories(categorySlug: string): string[] {
  const relatedMap: Record<string, string[]> = {
    'ai-engineer': ['machine-learning-engineer', 'ml-engineer', 'software-engineer', 'data-scientist'],
    'machine-learning-engineer': ['ai-engineer', 'ml-engineer', 'data-scientist', 'software-engineer'],
    'data-scientist': ['data-analyst', 'machine-learning-engineer', 'ai-engineer', 'ml-engineer'],
    'data-analyst': ['data-scientist', 'business-analyst', 'ml-engineer'],
    'ml-engineer': ['ai-engineer', 'machine-learning-engineer', 'data-scientist'],
    'software-engineer': ['ai-engineer', 'machine-learning-engineer', 'full-stack-engineer'],
  };

  return relatedMap[categorySlug] || ['ai-engineer', 'machine-learning-engineer', 'data-scientist'];
}

const getCategoryJobs = cache(async function getCategoryJobs(categorySlug: string, targetCount: number = 9): Promise<Job[]> {
  // Check for required env vars - return empty array if missing (allows build to proceed)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('[getCategoryJobs] Missing Supabase env vars, returning empty array');
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

  // Normalise a raw category value to canonical slug for comparison
  const normaliseSlug = (raw: string) =>
    raw.toLowerCase().replace(/&/g, '').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').replace(/-+/g, '-');

  // Get primary category jobs using the stored category column
  const primaryJobs = jobs
    .filter(job => job.category && normaliseSlug(job.category) === categorySlug)
    .map(transformJob);

  // If we have enough jobs, return them
  if (primaryJobs.length >= targetCount) {
    return primaryJobs.slice(0, targetCount);
  }

  // Otherwise, fill with related category jobs
  const relatedCategories = getRelatedCategories(categorySlug);
  const relatedJobs = jobs
    .filter(job => {
      const jobCatSlug = job.category ? normaliseSlug(job.category) : '';
      return relatedCategories.includes(jobCatSlug) &&
             !primaryJobs.some(pj => pj.id === job.id); // Avoid duplicates
    })
    .map(transformJob);

  // Combine and return exactly targetCount jobs
  const allJobs = [...primaryJobs, ...relatedJobs];
  return allJobs.slice(0, targetCount);
});

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;

  // Permanently redirect non-canonical category slugs to /jobs
  // (clears ~499 stale Google-indexed URLs that were generating 404s)
  if (!(VALID_CATEGORY_SLUGS as readonly string[]).includes(slug)) {
    permanentRedirect('/jobs');
  }

  const categoryName = categorySlugToName(slug);
  const allJobs = await getCategoryJobs(slug);

  // Split jobs: first 9 public, rest behind signup
  const publicJobs = allJobs.slice(0, 9);
  const hiddenJobsCount = Math.max(0, allJobs.length - 9);


  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-8">
        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{categoryName} Jobs in Australia</h1>
          <p className="text-xl text-muted-foreground">
            {allJobs.length} {categoryName} {allJobs.length === 1 ? 'position' : 'positions'} available
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
          categoryName={categoryName}
          redirectPath={`/jobs/category/${slug}`}
        />

        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'JobPostingCollection',
              'name': `${categoryName} Jobs in Australia`,
              'description': `Find ${categoryName} jobs in Australia on AI Jobs Australia`,
              'numberOfItems': allJobs.length,
            }),
          }}
        />
      </main>

      <Footer />
    </div>
  );
}
