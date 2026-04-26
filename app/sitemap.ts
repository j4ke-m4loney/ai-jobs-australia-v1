import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { readdirSync, statSync } from 'fs'
import { join } from 'path'
import { getAllJobCategories } from '@/lib/categories/generator'
import { getAllJobLocations } from '@/lib/locations/generator'
import { getAllCategoryLocationCombos } from '@/lib/categories/cross-generator'
import { getAllSearchKeywords } from '@/lib/search/generator'
import { SENIORITY_SLUGS, JOB_TYPE_SLUGS, SALARY_SLUGS } from '@/lib/jobs/hub-pages'

const BASE_URL = 'https://www.aijobsaustralia.com.au'

/**
 * Auto-discovers tool pages from /app/tools/[slug]/page.tsx.
 * Any new tool directory with a page.tsx is automatically included.
 */
function discoverToolPages(): MetadataRoute.Sitemap {
  const toolsDir = join(process.cwd(), 'app', 'tools')
  try {
    const entries = readdirSync(toolsDir)
    return entries
      .filter(entry => {
        // Only include subdirectories that contain a page.tsx
        const entryPath = join(toolsDir, entry)
        return (
          statSync(entryPath).isDirectory() &&
          statSync(join(entryPath, 'page.tsx')).isFile()
        )
      })
      .map(slug => ({
        url: `${BASE_URL}/tools/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
      }))
  } catch {
    console.warn('[sitemap] Could not discover tool pages, returning empty array')
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Create Supabase client inside function to avoid build-time initialization
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Fetch approved + expired jobs. Expired jobs stay indexed with a clear
  // "expired" UI treatment (no JobPosting structured data, disabled apply
  // button) so we retain their SEO equity and referral traffic. Rejected,
  // pending, and needs_review jobs are excluded — they 404 at the page layer.
  //
  // Paginated because PostgREST caps a single response at ~1,000 rows by
  // default — without this loop the sitemap silently truncated after the
  // most recent 1,000 jobs, leaving ~1,800 expired URLs off the map.
  type SitemapJob = {
    id: string
    created_at: string
    updated_at: string | null
    company_id: string | null
    status: string
  }
  const JOB_BATCH_SIZE = 1000
  const jobs: SitemapJob[] = []
  for (let offset = 0; ; offset += JOB_BATCH_SIZE) {
    const { data, error } = await supabase
      .from('jobs')
      .select('id, created_at, updated_at, company_id, status')
      .in('status', ['approved', 'expired'])
      .order('created_at', { ascending: false })
      .range(offset, offset + JOB_BATCH_SIZE - 1)

    if (error) {
      console.error('Error fetching jobs for sitemap:', error)
      break
    }
    if (!data || data.length === 0) break
    jobs.push(...(data as SitemapJob[]))
    if (data.length < JOB_BATCH_SIZE) break
  }

  // Fetch all published blog posts
  const { data: blogPosts, error: blogError } = await supabase
    .from('blog_posts')
    .select('slug, published_at, updated_at')
    .eq('status', 'published')
    .order('published_at', { ascending: false })

  if (blogError) {
    console.error('Error fetching blog posts for sitemap:', blogError)
  }

  // Company profile pages (/company/<uuid>) are disabled — the route returns
  // 404 from app/company/[id]/page.tsx. They were opaque UUID duplicates of
  // the individual /jobs/<id> pages and will eventually be rebuilt under
  // human-readable /companies/<slug> URLs. See the TODO in that page file.

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/jobs`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/hire`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/tools`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    // Tool pages are auto-discovered from the filesystem so new tools
    // are included in the sitemap without manual updates.
    ...discoverToolPages(),
    {
      url: `${BASE_URL}/companies`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/categories`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ]

  // Job pages. For expired jobs we set lastModified to now so Google recrawls
  // them promptly and picks up the new indexable expired treatment (they used
  // to carry a noindex header, which de-indexed ~1,800 pages — we want them
  // back in the index).
  const now = new Date()
  const jobPages: MetadataRoute.Sitemap = jobs?.map((job) => {
    const isExpired = job.status === 'expired'
    return {
      url: `${BASE_URL}/jobs/${job.id}`,
      lastModified: isExpired
        ? now
        : job.updated_at
          ? new Date(job.updated_at)
          : new Date(job.created_at),
      changeFrequency: isExpired ? ('monthly' as const) : ('weekly' as const),
      priority: isExpired ? 0.4 : 0.8,
    }
  }) || []

  // Blog post pages
  const blogPages: MetadataRoute.Sitemap = blogPosts?.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.updated_at ? new Date(post.updated_at) : new Date(post.published_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  })) || []

  // Category pages
  const categories = await getAllJobCategories()
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${BASE_URL}/jobs/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.85, // High priority for SEO
  }))

  // Location pages
  const locations = await getAllJobLocations()
  const locationPages: MetadataRoute.Sitemap = locations.map((location) => ({
    url: `${BASE_URL}/jobs/location/${location.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.85, // High priority for local SEO
  }))

  // Category × Location cross pages (only combos with 6+ jobs)
  const crossCombos = await getAllCategoryLocationCombos()
  const crossPages: MetadataRoute.Sitemap = crossCombos.map((combo) => ({
    url: `${BASE_URL}/jobs/category/${combo.categorySlug}/${combo.locationSlug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  // Search keyword pages (SEO landing pages for job title searches)
  const searchKeywords = await getAllSearchKeywords()
  const searchPages: MetadataRoute.Sitemap = searchKeywords.map((kw) => ({
    url: `${BASE_URL}/jobs/search/${kw.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.85,
  }))

  // Note: keyword × suburb × state URLs (/jobs/search/<kw>-<suburb>-<state>)
  // are deliberately NOT in the sitemap. The route still 308-redirects to
  // /jobs?search=&location= for any inbound traffic, but listing ~1,000
  // redirect-only URLs in the sitemap produced no ranking lift (the
  // destination is a faceted state of /jobs with no self-canonical or
  // unique content, which Google folds back into /jobs) while bloating the
  // GSC "Page with redirect" report. See conversation 2026-04-21.

  // Hub pages — SEO landing pages by seniority, job type, salary tier.
  // Each slug list is curated in lib/jobs/hub-pages.ts to only include
  // axes with reliable 6+ job volume so the destination always has
  // content (avoiding the soft-404 trap that hit keyword×suburb).
  const hubPages: MetadataRoute.Sitemap = [
    ...SENIORITY_SLUGS.map(slug => ({
      url: `${BASE_URL}/jobs/seniority/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.85,
    })),
    ...JOB_TYPE_SLUGS.map(slug => ({
      url: `${BASE_URL}/jobs/type/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.85,
    })),
    ...SALARY_SLUGS.map(slug => ({
      url: `${BASE_URL}/jobs/salary/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.85,
    })),
  ]

  return [...staticPages, ...categoryPages, ...locationPages, ...crossPages, ...searchPages, ...hubPages, ...jobPages, ...blogPages]
}
