import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { RecentJobCard } from '@/components/jobs/RecentJobCard';
import { SignupOrViewAllCard } from '@/components/jobs/SignupOrViewAllCard';
import { HubCrossLinks } from '@/components/jobs/HubCrossLinks';
import {
  JOB_TYPE_SLUGS,
  type JobTypeSlug,
  jobTypeSlugToDisplayName,
  getJobTypeJobs,
} from '@/lib/jobs/hub-pages';

interface JobTypePageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  return JOB_TYPE_SLUGS.map(slug => ({ slug }));
}

function isValidJobType(slug: string): slug is JobTypeSlug {
  return (JOB_TYPE_SLUGS as readonly string[]).includes(slug);
}

const META_DESCRIPTION: Record<JobTypeSlug, string> = {
  contract:
    'Contract AI jobs in Australia. Day rates $1,000–$1,800 for senior data scientists and ML engineers. 3–12 month engagements with banks, government, and consultancies.',
  internship:
    'AI and data science internships in Australia. Industry placements at top employers. Open to penultimate and final-year university students; pay typically $30–45/hour.',
};

const HEADING: Record<JobTypeSlug, string> = {
  contract: 'Contract AI Jobs in Australia',
  internship: 'AI Internships in Australia',
};

export async function generateMetadata({
  params,
}: JobTypePageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isValidJobType(slug)) return {};

  const { primaryCount } = await getJobTypeJobs(slug);
  const titlePrefix = primaryCount > 0 ? `${primaryCount} ` : '';

  return {
    title: `${titlePrefix}${HEADING[slug]} | AI Jobs Australia`,
    description: META_DESCRIPTION[slug],
    alternates: {
      canonical: `https://www.aijobsaustralia.com.au/jobs/type/${slug}`,
    },
    openGraph: {
      title: HEADING[slug],
      description: META_DESCRIPTION[slug],
      type: 'website',
    },
  };
}

export default async function JobTypePage({ params }: JobTypePageProps) {
  const { slug } = await params;
  if (!isValidJobType(slug)) notFound();

  const displayName = jobTypeSlugToDisplayName(slug);
  const { displayJobs, primaryCount } = await getJobTypeJobs(slug);
  const publicJobs = displayJobs.slice(0, 9);
  const hiddenJobsCount = Math.max(0, primaryCount - publicJobs.length);
  const currentHref = `/jobs/type/${slug}`;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{HEADING[slug]}</h1>
          <p className="text-xl text-muted-foreground">
            {primaryCount} {displayName.toLowerCase()} AI{' '}
            {primaryCount === 1 ? 'position' : 'positions'} available
          </p>
          {primaryCount > publicJobs.length && (
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1 mt-3 text-primary hover:underline font-medium"
            >
              View all {primaryCount} {displayName.toLowerCase()} AI jobs →
            </Link>
          )}
        </div>

        <div className="relative">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {publicJobs.map((job, index) => (
              <div
                key={job.id}
                className={`h-full ${index >= 6 ? 'pointer-events-none' : ''}`}
              >
                <RecentJobCard job={job} />
              </div>
            ))}
          </div>

          <div
            className="absolute bottom-0 left-0 right-0 pointer-events-none z-10"
            style={{
              height: '550px',
              background:
                'linear-gradient(to bottom, transparent 0%, transparent 40%, hsl(var(--background)) 95%, hsl(var(--background)) 100%)',
            }}
          />
        </div>

        <SignupOrViewAllCard
          hiddenJobsCount={hiddenJobsCount}
          categoryName={`${displayName} AI`}
          redirectPath={currentHref}
        />

        <HubCrossLinks currentHref={currentHref} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'JobPostingCollection',
              name: HEADING[slug],
              description: META_DESCRIPTION[slug],
              numberOfItems: primaryCount,
            }),
          }}
        />
      </main>

      <Footer />
    </div>
  );
}
