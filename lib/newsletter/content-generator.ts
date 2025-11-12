import { createClient } from '@supabase/supabase-js';

// Helper function to create Supabase admin client (avoids build-time initialization)
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export interface NewsletterJob {
  id: string;
  title: string;
  location: string;
  location_type: string;
  salary_min: number | null;
  salary_max: number | null;
  show_salary: boolean;
  category: string;
  created_at: string;
  companies: {
    name: string;
    logo_url: string | null;
  } | null;
}

export interface JobsByCategory {
  [category: string]: NewsletterJob[];
}

export interface NewsletterContent {
  jobsByCategory: JobsByCategory;
  totalJobsCount: number;
  dateRange: {
    from: string;
    to: string;
  };
}

export class ContentGenerator {
  /**
   * Get jobs posted in the last N days
   */
  async getRecentJobs(daysAgo: number = 7): Promise<NewsletterJob[]> {
    try {
      // Calculate date N days ago
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - daysAgo);

      const { data, error } = await getSupabaseAdmin()
        .from('jobs')
        .select(`
          id,
          title,
          location,
          location_type,
          salary_min,
          salary_max,
          show_salary,
          category,
          created_at,
          companies (
            name,
            logo_url
          )
        `)
        .eq('status', 'approved')
        .gte('created_at', dateThreshold.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[ContentGenerator] Error fetching jobs:', error);
        throw error;
      }

      // Debug: Log raw data from Supabase
      console.log('[ContentGenerator] Raw data from Supabase (first job):',
        data && data.length > 0 ? JSON.stringify(data[0], null, 2) : 'No data');

      // Data from Supabase is already in the correct format (companies as single object)
      const transformedData: NewsletterJob[] = (data || []) as unknown as NewsletterJob[];

      return transformedData;
    } catch (error) {
      console.error('[ContentGenerator] Failed to get recent jobs:', error);
      throw error;
    }
  }

  /**
   * Group jobs by category
   */
  groupJobsByCategory(jobs: NewsletterJob[], maxPerCategory: number = 5): JobsByCategory {
    const grouped: JobsByCategory = {};

    for (const job of jobs) {
      const category = job.category || 'other';

      if (!grouped[category]) {
        grouped[category] = [];
      }

      // Limit jobs per category
      if (grouped[category].length < maxPerCategory) {
        grouped[category].push(job);
      }
    }

    return grouped;
  }

  /**
   * Generate complete newsletter content
   */
  async generateNewsletterContent(options: {
    daysAgo?: number;
    maxPerCategory?: number;
    maxTotalJobs?: number;
  } = {}): Promise<NewsletterContent> {
    const {
      daysAgo = 7,
      maxPerCategory = 5,
      maxTotalJobs = 20,
    } = options;

    try {
      console.log(`[ContentGenerator] Generating newsletter content for last ${daysAgo} days`);

      // Get recent jobs
      const recentJobs = await this.getRecentJobs(daysAgo);

      console.log(`[ContentGenerator] Found ${recentJobs.length} recent jobs`);

      if (recentJobs.length === 0) {
        return {
          jobsByCategory: {},
          totalJobsCount: 0,
          dateRange: {
            from: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
            to: new Date().toISOString(),
          },
        };
      }

      // Limit total jobs
      const limitedJobs = recentJobs.slice(0, maxTotalJobs);

      // Group by category
      const jobsByCategory = this.groupJobsByCategory(limitedJobs, maxPerCategory);

      console.log('[ContentGenerator] Jobs grouped by category:',
        Object.entries(jobsByCategory).map(([cat, jobs]) => `${cat}: ${jobs.length}`).join(', ')
      );

      return {
        jobsByCategory,
        totalJobsCount: limitedJobs.length,
        dateRange: {
          from: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
          to: new Date().toISOString(),
        },
      };
    } catch (error) {
      console.error('[ContentGenerator] Failed to generate newsletter content:', error);
      throw error;
    }
  }

  /**
   * Check if there are enough jobs for a newsletter
   */
  async hasEnoughJobs(minimumJobs: number = 3): Promise<boolean> {
    try {
      const jobs = await this.getRecentJobs(7);
      return jobs.length >= minimumJobs;
    } catch (error) {
      console.error('[ContentGenerator] Error checking job count:', error);
      return false;
    }
  }
}

// Export singleton instance
export const contentGenerator = new ContentGenerator();
