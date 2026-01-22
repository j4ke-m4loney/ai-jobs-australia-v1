import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { getAllJobCategories } from '@/lib/categories/generator'
import { getAllJobLocations } from '@/lib/locations/generator'

const BASE_URL = 'https://www.aijobsaustralia.com.au'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Create Supabase client inside function to avoid build-time initialization
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Fetch all approved jobs
  const { data: jobs, error: jobsError } = await supabase
    .from('jobs')
    .select('id, created_at, updated_at')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  if (jobsError) {
    console.error('Error fetching jobs for sitemap:', jobsError)
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

  // Fetch all companies with jobs
  const { data: companies, error: companiesError } = await supabase
    .from('companies')
    .select('id, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (companiesError) {
    console.error('Error fetching companies for sitemap:', companiesError)
  }

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
    {
      url: `${BASE_URL}/tools/ai-jobs-resume-keyword-analyser`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/tools/ai-ml-salary-calculator`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/tools/ai-interview-question-generator`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/tools/ai-job-description-decoder`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/tools/ai-skills-gap-analyzer`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  // Job pages
  const jobPages: MetadataRoute.Sitemap = jobs?.map((job) => ({
    url: `${BASE_URL}/jobs/${job.id}`,
    lastModified: job.updated_at ? new Date(job.updated_at) : new Date(job.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  })) || []

  // Company pages
  const companyPages: MetadataRoute.Sitemap = companies?.map((company) => ({
    url: `${BASE_URL}/company/${company.id}`,
    lastModified: company.updated_at ? new Date(company.updated_at) : new Date(company.created_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  })) || []

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

  return [...staticPages, ...categoryPages, ...locationPages, ...jobPages, ...companyPages, ...blogPages]
}
