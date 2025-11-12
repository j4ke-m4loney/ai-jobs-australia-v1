import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

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

  return [...staticPages, ...jobPages, ...companyPages]
}
