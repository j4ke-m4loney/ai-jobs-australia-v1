import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { fetchCareerPage } from '@/lib/job-discovery/fetch-career-page';
import { identifyAIJobs } from '@/lib/job-discovery/identify-ai-jobs';

export const maxDuration = 300;

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Auth check — same pattern as cleanup cron
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const stats = {
      pagesChecked: 0,
      pagesSkipped: 0,
      newJobsFound: 0,
      errors: 0,
    };

    console.log('[JobDiscovery] Starting discovery run');

    // Get active career pages due for checking
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const { data: careerPages, error: fetchError } = await supabaseAdmin
      .from('career_pages')
      .select('*, companies(id, name)')
      .eq('is_active', true)
      .or(
        `last_checked_at.is.null,` +
          `and(check_frequency.eq.daily,last_checked_at.lt.${oneDayAgo.toISOString()}),` +
          `and(check_frequency.eq.weekly,last_checked_at.lt.${oneWeekAgo.toISOString()})`
      )
      .order('last_checked_at', { ascending: true, nullsFirst: true });

    if (fetchError) {
      console.error('[JobDiscovery] Error fetching career pages:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch career pages' },
        { status: 500 }
      );
    }

    if (!careerPages || careerPages.length === 0) {
      console.log('[JobDiscovery] No career pages to check');
      return NextResponse.json({
        message: 'Discovery complete — no pages to check',
        stats,
      });
    }

    console.log(
      `[JobDiscovery] Found ${careerPages.length} career pages to check`
    );

    for (const page of careerPages) {
      // Time guard: stop if we've been running for 240s (leave buffer before 300s timeout)
      if (Date.now() - startTime > 240000) {
        console.log('[JobDiscovery] Time guard triggered, stopping');
        break;
      }

      try {
        console.log(
          `[JobDiscovery] Checking: ${page.companies?.name || 'Unknown'} — ${page.url}`
        );

        // Fetch page content
        const content = await fetchCareerPage(page.url);
        if (!content) {
          console.log(`[JobDiscovery] Failed to fetch ${page.url}, skipping`);
          stats.errors++;
          continue;
        }

        // Skip if content hasn't changed since last check
        if (page.last_content_hash && content.hash === page.last_content_hash) {
          console.log(
            `[JobDiscovery] Content unchanged for ${page.url}, skipping`
          );
          stats.pagesSkipped++;

          // Update last_checked_at even if skipped
          await supabaseAdmin
            .from('career_pages')
            .update({ last_checked_at: now.toISOString() })
            .eq('id', page.id);

          continue;
        }

        // Identify AI jobs using Claude
        const discoveredJobs = await identifyAIJobs(
          content.text,
          page.url,
          page.search_keywords || 'AI, machine learning, data science'
        );

        console.log(
          `[JobDiscovery] Found ${discoveredJobs.length} potential AI jobs on ${page.url}`
        );

        // Insert new discovered jobs (skip duplicates via UNIQUE constraint on job_url)
        for (const job of discoveredJobs) {
          // Only insert high/medium confidence jobs
          if (job.confidence === 'low') continue;

          // Skip if this URL already exists as a job in the jobs table
          const { data: existingJob } = await supabaseAdmin
            .from('jobs')
            .select('id')
            .eq('application_url', job.url)
            .eq('status', 'approved')
            .limit(1)
            .maybeSingle();

          if (existingJob) {
            console.log(
              `[JobDiscovery] Skipping "${job.title}" — already exists in jobs table`
            );
            continue;
          }

          const { error: insertError } = await supabaseAdmin
            .from('discovered_jobs')
            .upsert(
              {
                career_page_id: page.id,
                job_url: job.url,
                job_title: job.title,
                status: 'pending_extraction',
                discovered_at: now.toISOString(),
              },
              { onConflict: 'job_url', ignoreDuplicates: true }
            );

          if (insertError) {
            // UNIQUE violation is expected for already-discovered jobs
            if (!insertError.message?.includes('duplicate')) {
              console.error(
                `[JobDiscovery] Error inserting discovered job:`,
                insertError
              );
            }
          } else {
            stats.newJobsFound++;
          }
        }

        // Update career page tracking
        await supabaseAdmin
          .from('career_pages')
          .update({
            last_checked_at: now.toISOString(),
            last_content_hash: content.hash,
            updated_at: now.toISOString(),
          })
          .eq('id', page.id);

        stats.pagesChecked++;
      } catch (error) {
        console.error(
          `[JobDiscovery] Error processing ${page.url}:`,
          error
        );
        stats.errors++;
      }
    }

    const duration = Date.now() - startTime;
    console.log('[JobDiscovery] Discovery complete', { stats, duration });

    return NextResponse.json({
      message: 'Discovery complete',
      stats,
      duration,
    });
  } catch (error) {
    console.error('[JobDiscovery] Error in discovery:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
