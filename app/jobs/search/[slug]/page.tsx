import { Metadata } from 'next';
import { permanentRedirect } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { RecentJobCard } from '@/components/jobs/RecentJobCard';
import {
  isValidSearchSlug,
  searchSlugToDisplayName,
  searchSlugToKeyword,
  getSearchKeywordJobs,
  getAllSearchKeywords,
  RELATED_KEYWORDS,
} from '@/lib/search/generator';
import { parseSuburbSearchSlug } from '@/lib/search/suburb-slug-parser';
import { SearchPageRedirect } from './SearchPageRedirect';

interface SearchPageProps {
  params: Promise<{
    slug: string;
  }>;
}

// ISR — revalidate every hour
export const revalidate = 3600;

// Pre-render pages for all curated keywords with enough jobs
export async function generateStaticParams() {
  const keywords = await getAllSearchKeywords();
  return keywords.map(kw => ({
    slug: kw.slug,
  }));
}

// SEO metadata with dynamic job count
export async function generateMetadata({ params }: SearchPageProps): Promise<Metadata> {
  const { slug } = await params;

  // Suburb-level slugs (e.g. ai-engineer-richmond-vic) never render —
  // the default export 301-redirects them. Return empty metadata so
  // we don't bother running the keyword job count query for them.
  if (parseSuburbSearchSlug(slug)) {
    return {};
  }

  if (!isValidSearchSlug(slug)) {
    return {};
  }

  const displayName = searchSlugToDisplayName(slug);
  const keyword = searchSlugToKeyword(slug);
  const jobs = await getSearchKeywordJobs(keyword);
  const count = jobs.length;

  return {
    title: `${count} ${displayName} Jobs in Australia | AI Jobs Australia`,
    description: `Browse ${count} ${displayName} jobs in Australia. Find the latest ${displayName} opportunities from top companies. New ${displayName} positions added daily.`,
    alternates: {
      canonical: `https://www.aijobsaustralia.com.au/jobs/search/${slug}`,
    },
    openGraph: {
      title: `${count} ${displayName} Jobs in Australia`,
      description: `Browse ${count} ${displayName} opportunities in AI and machine learning`,
      type: 'website',
    },
  };
}

export default async function SearchPage({ params }: SearchPageProps) {
  const { slug } = await params;

  // Suburb-level SEO URL (e.g. /jobs/search/ai-engineer-richmond-vic).
  // 308-redirect to the state-filtered job search so the ranking signal
  // consolidates onto the canonical /jobs?search=&location= page and the
  // user lands on /jobs with both the keyword and state dropdown pre-filled.
  //
  // `match=broad` mirrors SearchPageRedirect behaviour for the curated
  // keyword pages — searches title OR description (not title-only), so a
  // "AI Engineer" job listing with the role in the description still
  // surfaces. `guest=true` skips the auth redirect for unauthenticated
  // visitors landing from search.
  const suburbMatch = parseSuburbSearchSlug(slug);
  if (suburbMatch) {
    const { keyword, suburb } = suburbMatch;
    permanentRedirect(
      `/jobs?search=${encodeURIComponent(keyword.keyword)}&location=${suburb.state}&guest=true&match=broad`,
    );
  }

  // Invalid slug — redirect to main jobs page
  if (!isValidSearchSlug(slug)) {
    permanentRedirect('/jobs');
  }

  const displayName = searchSlugToDisplayName(slug);
  const keyword = searchSlugToKeyword(slug);
  const allJobs = await getSearchKeywordJobs(keyword);

  // Related search pages for internal linking
  const relatedSlugs = RELATED_KEYWORDS[slug] ?? [];

  return (
    <div className="min-h-screen bg-background">
      {/* Client-side redirect: sends real users to /jobs?search=keyword
          Googlebot sees the server-rendered HTML below for indexing */}
      <SearchPageRedirect keyword={keyword} />

      <Header />

      <main className="container mx-auto px-4 pt-24 pb-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <ol className="flex items-center gap-1.5 flex-wrap">
            <li><Link href="/" className="hover:text-foreground">Home</Link></li>
            <li>/</li>
            <li><Link href="/jobs" className="hover:text-foreground">Jobs</Link></li>
            <li>/</li>
            <li className="text-foreground font-medium">{displayName}</li>
          </ol>
        </nav>

        {/* Hero Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{displayName} Jobs in Australia</h1>
          <p className="text-xl text-muted-foreground">
            {allJobs.length} {displayName} {allJobs.length === 1 ? 'position' : 'positions'} available
          </p>
        </div>

        {/* Server-rendered job list for SEO — users are redirected before seeing this */}
        {allJobs.length > 0 && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {allJobs.slice(0, 9).map(job => (
              <div key={job.id} className="h-full">
                <RecentJobCard job={job} />
              </div>
            ))}
          </div>
        )}

        {/* Related Searches — internal cross-linking for SEO */}
        {relatedSlugs.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold mb-4">Related Searches</h2>
            <div className="flex flex-wrap gap-3">
              {relatedSlugs.map(relatedSlug => (
                <Link
                  key={relatedSlug}
                  href={`/jobs/search/${relatedSlug}`}
                  className="inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {searchSlugToDisplayName(relatedSlug)} Jobs
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'CollectionPage',
              'name': `${displayName} Jobs in Australia`,
              'description': `Find ${displayName} jobs in Australia on AI Jobs Australia`,
              'numberOfItems': allJobs.length,
              'url': `https://www.aijobsaustralia.com.au/jobs/search/${slug}`,
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
                  'name': `${displayName} Jobs`,
                  'item': `https://www.aijobsaustralia.com.au/jobs/search/${slug}`,
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
