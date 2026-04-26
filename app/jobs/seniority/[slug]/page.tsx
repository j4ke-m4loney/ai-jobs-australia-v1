import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { RecentJobCard } from '@/components/jobs/RecentJobCard';
import { SignupOrViewAllCard } from '@/components/jobs/SignupOrViewAllCard';
import { HubCrossLinks } from '@/components/jobs/HubCrossLinks';
import {
  SENIORITY_SLUGS,
  type SenioritySlug,
  senioritySlugToDisplayName,
  getSeniorityJobs,
} from '@/lib/jobs/hub-pages';

interface SeniorityPageProps {
  params: Promise<{ slug: string }>;
}

// ISR — revalidate every hour
export const revalidate = 3600;

export async function generateStaticParams() {
  return SENIORITY_SLUGS.map(slug => ({ slug }));
}

function isValidSeniority(slug: string): slug is SenioritySlug {
  return (SENIORITY_SLUGS as readonly string[]).includes(slug);
}

const META_DESCRIPTION: Record<SenioritySlug, string> = {
  senior:
    'Senior AI jobs in Australia — senior ML engineers, principal data scientists, lead AI engineers, and staff researchers. Salaries typically from $160k base.',
};

export async function generateMetadata({
  params,
}: SeniorityPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isValidSeniority(slug)) return {};

  const displayName = senioritySlugToDisplayName(slug);
  const { primaryCount } = await getSeniorityJobs(slug);
  const titlePrefix = primaryCount > 0 ? `${primaryCount} ` : '';

  return {
    title: `${titlePrefix}${displayName} AI Jobs in Australia | AI Jobs Australia`,
    description: META_DESCRIPTION[slug],
    alternates: {
      canonical: `https://www.aijobsaustralia.com.au/jobs/seniority/${slug}`,
    },
    openGraph: {
      title: `${displayName} AI Jobs in Australia`,
      description: META_DESCRIPTION[slug],
      type: 'website',
    },
  };
}

export default async function SeniorityPage({ params }: SeniorityPageProps) {
  const { slug } = await params;
  if (!isValidSeniority(slug)) notFound();

  const displayName = senioritySlugToDisplayName(slug);
  const { displayJobs, primaryCount } = await getSeniorityJobs(slug);
  const publicJobs = displayJobs.slice(0, 9);
  const hiddenJobsCount = Math.max(0, primaryCount - publicJobs.length);
  const currentHref = `/jobs/seniority/${slug}`;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            {displayName} AI Jobs in Australia
          </h1>
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
              name: `${displayName} AI Jobs in Australia`,
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
