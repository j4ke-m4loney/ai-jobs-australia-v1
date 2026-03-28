import { createClient } from '@supabase/supabase-js';
import { emailService } from '@/lib/email/postmark-service';
import { getSiteUrl } from '@/lib/utils/get-site-url';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export interface QueueProcessingResult {
  processedCount: number;
  errors: string[];
}

/**
 * Process any overdue email batches from the notification queue.
 * Called by:
 * 1. The cron job at /api/cron/flush-email-queue (every 15 minutes)
 * 2. The applications POST handler (belt-and-suspenders)
 */
export async function processOverdueBatches(): Promise<QueueProcessingResult> {
  const result: QueueProcessingResult = { processedCount: 0, errors: [] };

  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Find all unprocessed queue entries that are overdue (scheduled_for <= now)
    const { data: overdueQueues } = await supabaseAdmin
      .from('email_notification_queue')
      .select(`
        id,
        job_id,
        employer_id,
        application_ids,
        applicant_names,
        created_at,
        scheduled_for
      `)
      .eq('processed', false)
      .lte('scheduled_for', new Date().toISOString())
      .order('created_at', { ascending: true });

    if (!overdueQueues || overdueQueues.length === 0) {
      return result;
    }

    // Fetch job details to check status
    const jobIds = [...new Set(overdueQueues.map(q => q.job_id))];
    const { data: jobs } = await supabaseAdmin
      .from('jobs')
      .select('id, title, status')
      .in('id', jobIds);

    const jobTitleMap = new Map();
    const expiredJobIds = new Set<string>();
    (jobs || []).forEach(job => {
      jobTitleMap.set(job.id, job.title);
      if (job.status !== 'approved') {
        expiredJobIds.add(job.id);
      }
    });

    // Process each overdue batch
    for (const queue of overdueQueues) {
      try {
        // Skip expired/rejected jobs — mark as processed but don't send email
        if (expiredJobIds.has(queue.job_id)) {
          await supabaseAdmin
            .from('email_notification_queue')
            .update({ processed: true })
            .eq('id', queue.id);
          continue;
        }

        // Get employer details
        const { data: employerUserData } = await supabaseAdmin
          .auth.admin.getUserById(queue.employer_id);

        const employerEmail = employerUserData?.user?.email;
        if (!employerEmail) continue;

        // Get employer profile for name
        const { data: employerProfile } = await supabaseAdmin
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', queue.employer_id)
          .single();

        const employerName = employerProfile?.first_name && employerProfile?.last_name
          ? `${employerProfile.first_name} ${employerProfile.last_name}`.trim()
          : employerProfile?.first_name || employerProfile?.last_name || 'Employer';

        // Calculate time frame for the email
        const queueAge = Math.round((new Date().getTime() - new Date(queue.created_at).getTime()) / (1000 * 60));
        const timeFrame = queueAge < 120 ? 'in the last hour' : `in the last ${Math.round(queueAge / 60)} hours`;

        // Send the batched email
        const jobTitle = jobTitleMap.get(queue.job_id) || 'Job Post';
        const emailSent = await emailService.sendBatchedApplicationNotification({
          employerName,
          employerEmail,
          jobTitle,
          jobId: queue.job_id,
          applicationCount: queue.application_ids.length,
          applicantNames: queue.applicant_names,
          timeFrame,
          dashboardUrl: `${getSiteUrl()}/employer/applications`
        });

        if (emailSent) {
          // Mark queue as processed
          await supabaseAdmin
            .from('email_notification_queue')
            .update({ processed: true })
            .eq('id', queue.id);

          // Update email tracking
          await supabaseAdmin
            .from('job_email_tracking')
            .upsert({
              job_id: queue.job_id,
              last_email_sent: new Date().toISOString(),
              application_count_since_last: 0
            });

          result.processedCount++;
        }
      } catch (batchError) {
        const errorMsg = `Error processing batch ${queue.id}: ${batchError instanceof Error ? batchError.message : 'Unknown error'}`;
        result.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }
  } catch (error) {
    const errorMsg = `Error in processOverdueBatches: ${error instanceof Error ? error.message : 'Unknown error'}`;
    result.errors.push(errorMsg);
    console.error(errorMsg);
  }

  return result;
}

/**
 * Process daily digest emails for employers who have application_notification_frequency = 'daily'.
 * Finds all unprocessed queue entries for daily-digest employers and sends a summary.
 */
export async function processDailyDigests(): Promise<QueueProcessingResult> {
  const result: QueueProcessingResult = { processedCount: 0, errors: [] };

  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Find employers who have daily digest preference
    const { data: dailyPrefs } = await supabaseAdmin
      .from('user_notification_preferences')
      .select('user_id')
      .eq('application_notification_frequency', 'daily');

    if (!dailyPrefs || dailyPrefs.length === 0) {
      return result;
    }

    const dailyEmployerIds = dailyPrefs.map(p => p.user_id);

    // Find unprocessed queue entries for daily-digest employers
    const { data: dailyQueues } = await supabaseAdmin
      .from('email_notification_queue')
      .select('*')
      .eq('processed', false)
      .in('employer_id', dailyEmployerIds)
      .order('created_at', { ascending: true });

    if (!dailyQueues || dailyQueues.length === 0) {
      return result;
    }

    // Group by employer
    const byEmployer = new Map<string, typeof dailyQueues>();
    for (const queue of dailyQueues) {
      const existing = byEmployer.get(queue.employer_id) || [];
      existing.push(queue);
      byEmployer.set(queue.employer_id, existing);
    }

    // Process each employer's digest
    for (const [employerId, queues] of byEmployer) {
      try {
        const { data: employerUserData } = await supabaseAdmin
          .auth.admin.getUserById(employerId);

        const employerEmail = employerUserData?.user?.email;
        if (!employerEmail) continue;

        const { data: employerProfile } = await supabaseAdmin
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', employerId)
          .single();

        const employerName = employerProfile?.first_name && employerProfile?.last_name
          ? `${employerProfile.first_name} ${employerProfile.last_name}`.trim()
          : employerProfile?.first_name || employerProfile?.last_name || 'Employer';

        // Get job titles — only include approved (non-expired) jobs
        const jobIds = [...new Set(queues.map(q => q.job_id))];
        const { data: jobs } = await supabaseAdmin
          .from('jobs')
          .select('id, title, status')
          .in('id', jobIds);

        // Filter out expired/rejected jobs
        const activeJobs = (jobs || []).filter(j => j.status === 'approved');

        const activeJobIds = new Set(activeJobs.map(j => j.id));
        const jobTitleMap = new Map();
        activeJobs.forEach(job => jobTitleMap.set(job.id, job.title));

        // Build digest summary grouped by job — only include active (non-expired) jobs
        const jobSummaries: { jobTitle: string; applicationCount: number; applicantNames: string[] }[] = [];
        for (const q of queues) {
          if (!activeJobIds.has(q.job_id)) continue; // Skip expired/rejected jobs

          const existing = jobSummaries.find(s => s.jobTitle === (jobTitleMap.get(q.job_id) || 'Job Post'));
          if (existing) {
            existing.applicationCount += q.application_ids.length;
            existing.applicantNames.push(...q.applicant_names);
          } else {
            jobSummaries.push({
              jobTitle: jobTitleMap.get(q.job_id) || 'Job Post',
              applicationCount: q.application_ids.length,
              applicantNames: [...q.applicant_names],
            });
          }
        }

        // Mark all queues as processed regardless (even for expired jobs)
        const queueIds = queues.map(q => q.id);
        await supabaseAdmin
          .from('email_notification_queue')
          .update({ processed: true })
          .in('id', queueIds);

        // If no active jobs had applications, skip sending the digest
        if (jobSummaries.length === 0) {
          result.processedCount++;
          continue;
        }

        const totalApplications = jobSummaries.reduce((sum, s) => sum + s.applicationCount, 0);

        await emailService.sendDailyApplicationDigest({
          employerName,
          employerEmail,
          jobSummaries,
          totalApplications,
          dashboardUrl: `${getSiteUrl()}/employer/applications`,
        });

        // Update tracking for active jobs
        for (const jobId of jobIds) {
          await supabaseAdmin
            .from('job_email_tracking')
            .upsert({
              job_id: jobId,
              last_email_sent: new Date().toISOString(),
              application_count_since_last: 0,
            });
        }

        result.processedCount++;
      } catch (err) {
        const errorMsg = `Error processing daily digest for employer ${employerId}: ${err instanceof Error ? err.message : 'Unknown error'}`;
        result.errors.push(errorMsg);
        console.error(errorMsg);
      }
    }
  } catch (error) {
    const errorMsg = `Error in processDailyDigests: ${error instanceof Error ? error.message : 'Unknown error'}`;
    result.errors.push(errorMsg);
    console.error(errorMsg);
  }

  return result;
}
