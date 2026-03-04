import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  fetchAndExtractText,
  extractJobData,
} from '@/lib/job-import/extract-job-data';
import { matchCompany } from '@/lib/job-import/match-company';
import { createJobFromDiscovery } from '@/lib/job-discovery/create-job-from-discovery';
import { normaliseJobTitle } from '@/lib/job-discovery/normalise-job-title';

export const maxDuration = 300;

const BATCH_SIZE = 10;

const AUSTRALIAN_LOCATION_PATTERN = /\b(NSW|VIC|QLD|WA|SA|TAS|ACT|NT|New South Wales|Victoria|Queensland|Western Australia|South Australia|Tasmania|Australian Capital Territory|Northern Territory|Sydney|Melbourne|Brisbane|Perth|Adelaide|Canberra|Hobart|Darwin|Gold Coast|Newcastle|Wollongong|Geelong|Townsville|Cairns|Toowoomba|Ballarat|Bendigo|Launceston|Parramatta|Australia)\b/i;

export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Auth check
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
      jobsExtracted: 0,
      jobsFailed: 0,
    };

    console.log('[JobExtraction] Starting extraction run');

    // Get pending discovered jobs
    const { data: pendingJobs, error: fetchError } = await supabaseAdmin
      .from('discovered_jobs')
      .select('*, career_pages(company_id, companies(id, name))')
      .eq('status', 'pending_extraction')
      .order('discovered_at', { ascending: true })
      .limit(BATCH_SIZE);

    if (fetchError) {
      console.error(
        '[JobExtraction] Error fetching pending jobs:',
        fetchError
      );
      return NextResponse.json(
        { error: 'Failed to fetch pending jobs' },
        { status: 500 }
      );
    }

    if (!pendingJobs || pendingJobs.length === 0) {
      console.log('[JobExtraction] No pending jobs to extract');
      return NextResponse.json({
        message: 'Extraction complete — no pending jobs',
        stats,
      });
    }

    console.log(
      `[JobExtraction] Found ${pendingJobs.length} jobs to extract`
    );

    // Fetch companies list once for matching
    const { data: companies } = await supabaseAdmin
      .from('companies')
      .select('id, name')
      .order('name');

    for (const discovered of pendingJobs) {
      // Time guard
      if (Date.now() - startTime > 240000) {
        console.log('[JobExtraction] Time guard triggered, stopping');
        break;
      }

      try {
        console.log(
          `[JobExtraction] Extracting: ${discovered.job_title || discovered.job_url}`
        );

        // Check if this URL already exists as a job (by application_url)
        const { data: existingJob } = await supabaseAdmin
          .from('jobs')
          .select('id')
          .eq('application_url', discovered.job_url)
          .eq('status', 'approved')
          .limit(1)
          .maybeSingle();

        if (existingJob) {
          console.log(
            `[JobExtraction] Job URL already exists: ${discovered.job_url}`
          );
          await supabaseAdmin
            .from('discovered_jobs')
            .update({
              status: 'imported',
              job_id: existingJob.id,
              processed_at: new Date().toISOString(),
            })
            .eq('id', discovered.id);
          continue;
        }

        // Fetch and extract text from the job page
        const text = await fetchAndExtractText(discovered.job_url);

        // Extract structured job data using Claude
        const extractedData = await extractJobData(text, discovered.job_url);

        // Skip if AI focus is too low
        if (extractedData.aiFocusPercentage < 30) {
          console.log(
            `[JobExtraction] Skipping "${extractedData.jobTitle}" — AI focus ${extractedData.aiFocusPercentage}% (below 30% threshold)`
          );
          await supabaseAdmin
            .from('discovered_jobs')
            .update({
              status: 'dismissed',
              failure_reason: `AI focus too low: ${extractedData.aiFocusPercentage}%`,
              processed_at: new Date().toISOString(),
            })
            .eq('id', discovered.id);
          continue;
        }

        // Skip if location is not in Australia
        const locationStr = extractedData.locationAddress || '';
        if (!AUSTRALIAN_LOCATION_PATTERN.test(locationStr)) {
          console.log(
            `[JobExtraction] Skipping "${extractedData.jobTitle}" — non-Australian location: "${locationStr}"`
          );
          await supabaseAdmin
            .from('discovered_jobs')
            .update({
              status: 'dismissed',
              failure_reason: `Non-Australian location: ${locationStr}`,
              processed_at: new Date().toISOString(),
            })
            .eq('id', discovered.id);
          continue;
        }

        // Match company — prefer the career page's linked company
        let companyMatch = null;
        const linkedCompany = discovered.career_pages?.companies;

        if (linkedCompany) {
          companyMatch = {
            id: linkedCompany.id,
            name: linkedCompany.name,
          };
        } else if (extractedData.companyName && companies) {
          companyMatch = await matchCompany(
            extractedData.companyName,
            companies
          );
        }

        // Check for duplicate by company + normalised title
        if (companyMatch) {
          const normalisedTitle = normaliseJobTitle(extractedData.jobTitle);
          const { data: existingByTitle } = await supabaseAdmin
            .from('jobs')
            .select('id, title, application_url')
            .eq('company_id', companyMatch.id)
            .eq('status', 'approved')
            .limit(50);

          const duplicate = existingByTitle?.find(
            (j) => normaliseJobTitle(j.title) === normalisedTitle
          );

          if (duplicate) {
            console.log(
              `[JobExtraction] Duplicate detected: "${extractedData.jobTitle}" matches existing job ${duplicate.id} ("${duplicate.title}") for company ${companyMatch.name}`
            );
            await supabaseAdmin
              .from('discovered_jobs')
              .update({
                status: 'imported',
                job_id: duplicate.id,
                processed_at: new Date().toISOString(),
              })
              .eq('id', discovered.id);
            continue;
          }
        }

        // Insert job
        const jobId = await createJobFromDiscovery(
          supabaseAdmin,
          extractedData,
          companyMatch,
          discovered.job_url
        );

        if (jobId) {
          await supabaseAdmin
            .from('discovered_jobs')
            .update({
              status: 'imported',
              job_id: jobId,
              processed_at: new Date().toISOString(),
            })
            .eq('id', discovered.id);

          stats.jobsExtracted++;
          console.log(
            `[JobExtraction] Successfully created job ${jobId} from ${discovered.job_url}`
          );
        } else {
          throw new Error('createJobFromDiscovery returned null');
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.error(
          `[JobExtraction] Failed to extract ${discovered.job_url}:`,
          errorMessage
        );

        await supabaseAdmin
          .from('discovered_jobs')
          .update({
            status: 'failed',
            failure_reason: errorMessage.slice(0, 500),
            processed_at: new Date().toISOString(),
          })
          .eq('id', discovered.id);

        stats.jobsFailed++;
      }
    }

    const duration = Date.now() - startTime;
    console.log('[JobExtraction] Extraction complete', { stats, duration });

    return NextResponse.json({
      message: 'Extraction complete',
      stats,
      duration,
    });
  } catch (error) {
    console.error('[JobExtraction] Error in extraction:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
