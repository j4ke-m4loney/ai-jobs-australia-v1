import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { RecentJobCard } from '@/components/jobs/RecentJobCard';
import { SignupOrViewAllCard } from '@/components/jobs/SignupOrViewAllCard';
import { HubCrossLinks } from '@/components/jobs/HubCrossLinks';
import {
  SALARY_SLUGS,
  type SalarySlug,
  salarySlugToDisplayName,
  getSalaryJobs,
} from '@/lib/jobs/hub-pages';

interface SalaryPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateStaticParams() {
  return SALARY_SLUGS.map(slug => ({ slug }));
}

function isValidSalary(slug: string): slug is SalarySlug {
  return (SALARY_SLUGS as readonly string[]).includes(slug);
}

const META_DESCRIPTION: Record<SalarySlug, string> = {
  '100k-plus':
    'AI roles in Australia paying $100k+ base salary. Junior ML engineers, mid-level data scientists, and entry-level AI product managers. Browse current openings.',
  '120k-plus':
    'AI jobs paying $120k+ in Australia. Mid-level ML engineers and data scientists with 2–4 years experience. Sydney, Melbourne, Brisbane, and remote-friendly roles.',
  '150k-plus':
    'AI jobs paying $150k+ in Australia. Senior individual contributors and engineering managers. Total compensation often $180–220k including super, bonuses, and equity.',
  '200k-plus':
    'AI jobs paying $200k+ in Australia. Principal ML engineers, staff data scientists, AI architects, and ML/data engineering managers at top employers.',
};

export async function generateMetadata({
  params,
}: SalaryPageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!isValidSalary(slug)) return {};

  const displayName = salarySlugToDisplayName(slug);
  const { primaryCount } = await getSalaryJobs(slug);
  const titlePrefix = primaryCount > 0 ? `${primaryCount} ` : '';

  return {
    title: `${titlePrefix}AI Jobs Paying ${displayName} in Australia | AI Jobs Australia`,
    description: META_DESCRIPTION[slug],
    alternates: {
      canonical: `https://www.aijobsaustralia.com.au/jobs/salary/${slug}`,
    },
    openGraph: {
      title: `AI Jobs Paying ${displayName} in Australia`,
      description: META_DESCRIPTION[slug],
      type: 'website',
    },
  };
}

export default async function SalaryPage({ params }: SalaryPageProps) {
  const { slug } = await params;
  if (!isValidSalary(slug)) notFound();

  const displayName = salarySlugToDisplayName(slug);
  const { displayJobs, primaryCount } = await getSalaryJobs(slug);
  const publicJobs = displayJobs.slice(0, 9);
  const hiddenJobsCount = Math.max(0, primaryCount - publicJobs.length);
  const currentHref = `/jobs/salary/${slug}`;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">
            AI Jobs Paying {displayName} in Australia
          </h1>
          <p className="text-xl text-muted-foreground">
            {primaryCount} AI {primaryCount === 1 ? 'position' : 'positions'} paying {displayName}
          </p>
          {primaryCount > publicJobs.length && (
            <Link
              href="/jobs"
              className="inline-flex items-center gap-1 mt-3 text-primary hover:underline font-medium"
            >
              View all {primaryCount} AI jobs paying {displayName} →
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
          categoryName={`AI roles paying ${displayName}`}
          redirectPath={currentHref}
        />

        <HubCrossLinks currentHref={currentHref} />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'JobPostingCollection',
              name: `AI Jobs Paying ${displayName} in Australia`,
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
