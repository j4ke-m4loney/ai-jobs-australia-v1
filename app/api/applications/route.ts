import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { emailService } from '@/lib/email/postmark-service';
import { getSiteUrl } from '@/lib/utils/get-site-url';
import { processOverdueBatches } from '@/lib/email/process-email-queue';

// Helper function to create Supabase admin client (avoids build-time initialization)
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Volume-based batching configuration
const BATCH_THRESHOLD = 5; // Send batch email after 5 applications

interface EmailBatchingParams {
  jobId: string;
  employerId: string;
  employerName: string;
  employerEmail: string;
  jobTitle: string;
  applicantName: string;
  applicantEmail: string;
  applicationId: string;
}

// processOverdueBatches is imported from @/lib/email/process-email-queue

/**
 * Handles volume-based email batching for application notifications
 * Logic: First application sends immediately, subsequent applications are batched
 * until 5 applications are received OR 1 hour passes
 */
async function handleEmailBatching(params: EmailBatchingParams): Promise<void> {
  const {
    jobId,
    employerId,
    employerName,
    employerEmail,
    jobTitle,
    applicantName,
    applicantEmail,
    applicationId
  } = params;

  // Check current email tracking for this job
  const { data: emailTracking } = await getSupabaseAdmin()
    .from('job_email_tracking')
    .select('*')
    .eq('job_id', jobId)
    .single();

  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - (60 * 60 * 1000));

  // If this is the first application OR more than 1 hour has passed, send immediately
  if (!emailTracking || new Date(emailTracking.last_email_sent) < oneHourAgo) {
    // Send immediate notification for first application or after timeout
    await emailService.sendJobApplicationNotification({
      employerName,
      employerEmail,
      jobTitle,
      jobId,
      applicantName,
      applicantEmail,
      applicationDate: now.toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      dashboardUrl: `${getSiteUrl()}/employer/applications`
    });

    // Update tracking table
    await getSupabaseAdmin()
      .from('job_email_tracking')
      .upsert({
        job_id: jobId,
        last_email_sent: now.toISOString(),
        application_count_since_last: 1
      });

    console.log('📧 Immediate email sent (first application or timeout reached)');
    return;
  }

  // Otherwise, add to batch queue
  const currentCount = emailTracking.application_count_since_last + 1;

  // Check if we have an existing unprocessed queue entry for this job
  const { data: existingQueue } = await getSupabaseAdmin()
    .from('email_notification_queue')
    .select('*')
    .eq('job_id', jobId)
    .eq('processed', false)
    .single();

  if (existingQueue) {
    // Add to existing queue
    const updatedApplicationIds = [...existingQueue.application_ids, applicationId];
    const updatedApplicantNames = [...existingQueue.applicant_names, applicantName];

    await getSupabaseAdmin()
      .from('email_notification_queue')
      .update({
        application_ids: updatedApplicationIds,
        applicant_names: updatedApplicantNames
      })
      .eq('id', existingQueue.id);

    console.log(`📦 Added to existing batch queue (${updatedApplicationIds.length} applications)`);

    // If we've reached the threshold, send the batch immediately
    if (updatedApplicationIds.length >= BATCH_THRESHOLD) {
      await sendBatchEmail({
        queueId: existingQueue.id,
        jobId,
        employerName,
        employerEmail,
        jobTitle,
        applicationIds: updatedApplicationIds,
        applicantNames: updatedApplicantNames
      });
    }
  } else {
    // Create new queue entry
    await getSupabaseAdmin()
      .from('email_notification_queue')
      .insert({
        job_id: jobId,
        employer_id: employerId,
        application_ids: [applicationId],
        applicant_names: [applicantName],
        scheduled_for: new Date(now.getTime() + (60 * 60 * 1000)).toISOString() // 1 hour from now
      });

    console.log(`📦 Created new batch queue entry`);
  }

  // Update application count
  await getSupabaseAdmin()
    .from('job_email_tracking')
    .update({
      application_count_since_last: currentCount
    })
    .eq('job_id', jobId);
}

/**
 * Sends a batched email notification and marks the queue entry as processed
 */
async function sendBatchEmail(params: {
  queueId: string;
  jobId: string;
  employerName: string;
  employerEmail: string;
  jobTitle: string;
  applicationIds: string[];
  applicantNames: string[];
}): Promise<void> {
  const {
    queueId,
    jobId,
    employerName,
    employerEmail,
    jobTitle,
    applicationIds,
    applicantNames
  } = params;

  // Send the batched email
  await emailService.sendBatchedApplicationNotification({
    employerName,
    employerEmail,
    jobTitle,
    jobId,
    applicationCount: applicationIds.length,
    applicantNames,
    timeFrame: applicationIds.length === 1 ? 'today' : 'in the last hour',
    dashboardUrl: `${getSiteUrl()}/employer/applications`
  });

  // Mark queue as processed
  await getSupabaseAdmin()
    .from('email_notification_queue')
    .update({ processed: true })
    .eq('id', queueId);

  // Update email tracking
  await getSupabaseAdmin()
    .from('job_email_tracking')
    .update({
      last_email_sent: new Date().toISOString(),
      application_count_since_last: 0
    })
    .eq('job_id', jobId);

  console.log(`📧 Batch email sent for ${applicationIds.length} applications`);
}

export async function POST(request: NextRequest) {
  try {
    const {
      jobId,
      applicantId,
      resumeUrl,
      coverLetterUrl,
    } = await request.json();

    console.log('📝 Application API - Creating application:', {
      jobId,
      applicantId,
      hasResumeUrl: !!resumeUrl,
      hasCoverLetterUrl: !!coverLetterUrl
    });

    if (!jobId || !applicantId) {
      return NextResponse.json(
        { error: 'Job ID and Applicant ID are required' },
        { status: 400 }
      );
    }

    // Get job and employer details for email notification
    const { data: jobData, error: jobError } = await getSupabaseAdmin()
      .from('jobs')
      .select(`
        id,
        title,
        company_name,
        employer_id,
        application_method
      `)
      .eq('id', jobId)
      .single();

    if (jobError || !jobData) {
      console.error('❌ Job not found:', jobError);
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Reject internal applications for jobs configured as email or external
    if (jobData.application_method === 'email' || jobData.application_method === 'external') {
      return NextResponse.json(
        { error: 'This job does not accept internal applications' },
        { status: 400 }
      );
    }

    // Get applicant details from profiles and auth.users
    const { data: applicantData, error: applicantError } = await getSupabaseAdmin()
      .from('profiles')
      .select('first_name, last_name')
      .eq('user_id', applicantId)
      .single();

    if (applicantError || !applicantData) {
      console.error('❌ Applicant not found:', applicantError);
      return NextResponse.json(
        { error: 'Applicant not found' },
        { status: 404 }
      );
    }

    // Fetch applicant email for employer notification
    const { data: applicantUserData } = await getSupabaseAdmin()
      .auth.admin.getUserById(applicantId);
    const applicantEmail = applicantUserData?.user?.email || 'Not available';

    // Check if application already exists
    const { data: existingApplication } = await getSupabaseAdmin()
      .from('job_applications')
      .select('id')
      .eq('job_id', jobId)
      .eq('applicant_id', applicantId)
      .single();

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You have already applied for this job' },
        { status: 409 }
      );
    }

    // Create the application
    const { data: application, error: applicationError } = await getSupabaseAdmin()
      .from('job_applications')
      .insert({
        job_id: jobId,
        applicant_id: applicantId,
        resume_url: resumeUrl,
        cover_letter_url: coverLetterUrl,
        status: 'submitted',
      })
      .select()
      .single();

    if (applicationError) {
      console.error('❌ Failed to create application:', applicationError);
      return NextResponse.json(
        { error: 'Failed to create application' },
        { status: 500 }
      );
    }

    console.log('✅ Application created successfully:', application.id);

    // Get employer's email from auth.users table
    const { data: employerUserData, error: employerUserError } = await getSupabaseAdmin()
      .auth.admin.getUserById(jobData.employer_id);

    const employerEmail = employerUserData?.user?.email;

    // Check employer's notification preferences
    // Use select('*') for backward compatibility — application_notification_frequency may not exist yet
    const { data: employerPrefs } = await getSupabaseAdmin()
      .from('user_notification_preferences')
      .select('*')
      .eq('user_id', jobData.employer_id)
      .single();

    // Determine notification frequency: immediate, hourly, daily, or off
    const notificationFrequency = employerPrefs?.application_notification_frequency || 'immediate';

    // Send email notification to employer if they have the preference enabled (default: true)
    // If frequency is 'off', skip entirely
    const shouldSendEmail = notificationFrequency !== 'off' &&
      (!employerPrefs || employerPrefs.email_applications !== false);

    if (shouldSendEmail && !employerUserError && employerEmail) {
      try {
        // Get employer profile information
        const { data: employerProfile } = await getSupabaseAdmin()
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', jobData.employer_id)
          .single();

        const employerName = employerProfile?.first_name && employerProfile?.last_name
          ? `${employerProfile.first_name} ${employerProfile.last_name}`.trim()
          : employerProfile?.first_name || employerProfile?.last_name || 'Employer';

        const applicantName = applicantData?.first_name && applicantData?.last_name
          ? `${applicantData.first_name} ${applicantData.last_name}`.trim()
          : applicantData?.first_name || applicantData?.last_name || 'Job Seeker';

        // First, process any overdue batches (lazy processing - belt and suspenders with cron)
        await processOverdueBatches();

        if (notificationFrequency === 'immediate') {
          // Send immediate notification
          await emailService.sendJobApplicationNotification({
            employerName,
            employerEmail,
            jobTitle: jobData.title,
            jobId: jobData.id,
            applicantName,
            applicantEmail,
            applicationDate: new Date().toLocaleDateString('en-AU', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }),
            dashboardUrl: `${getSiteUrl()}/employer/applications`
          });
        } else {
          // For 'hourly' and 'daily' - use batching logic
          await handleEmailBatching({
            jobId: jobData.id,
            employerId: jobData.employer_id,
            employerName,
            employerEmail,
            jobTitle: jobData.title,
            applicantName,
            applicantEmail,
            applicationId: application.id
          });
        }
      } catch (emailError) {
        console.error('❌ Failed to handle application notification:', emailError);
        // Don't fail the request if email fails - application was created successfully
      }
    } else {
      console.log('📧 Email notification skipped:', {
        reason: !shouldSendEmail ? 'notification preference disabled' :
                employerUserError ? 'employer user error' :
                !employerEmail ? 'no employer email' : 'unknown'
      });
    }

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        status: application.status,
        created_at: application.created_at
      }
    });

  } catch (error) {
    console.error('Error in applications API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const jobId = searchParams.get('jobId');
    const type = searchParams.get('type'); // 'employer' or 'applicant'
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '20', 10)));
    const status = searchParams.get('status'); // filter by status
    const search = searchParams.get('search'); // search by applicant name
    const sort = searchParams.get('sort') || 'created_at'; // created_at or name
    const order = searchParams.get('order') || 'desc'; // asc or desc

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    if (type === 'employer' && jobId) {
      // Employer viewing applications for a specific job - paginated with search/sort
      // First verify this employer owns the job
      const { data: jobData, error: jobError } = await supabaseAdmin
        .from('jobs')
        .select('id, employer_id')
        .eq('id', jobId)
        .eq('employer_id', userId)
        .single();

      if (jobError || !jobData) {
        return NextResponse.json(
          { error: 'Job not found or access denied' },
          { status: 404 }
        );
      }

      // Get status counts for all statuses (for tab badges) - always unfiltered
      // Exclude external/email application clicks from employer view
      const { data: allAppsForCounts } = await supabaseAdmin
        .from('job_applications')
        .select('status')
        .eq('job_id', jobId)
        .not('application_type', 'in', '("external","email")');

      const statusCounts: Record<string, number> = {};
      (allAppsForCounts || []).forEach((app) => {
        statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
      });

      // If search is provided, we need to find matching applicant IDs first
      let matchingApplicantIds: string[] | null = null;
      if (search && search.trim()) {
        const searchTerm = search.trim();
        const { data: matchingProfiles } = await supabaseAdmin
          .from('profiles')
          .select('user_id')
          .or(`first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%`);

        matchingApplicantIds = (matchingProfiles || []).map((p) => p.user_id);

        if (matchingApplicantIds.length === 0) {
          // No matching profiles - return empty results
          return NextResponse.json({
            applications: [],
            total: 0,
            page,
            pageSize,
            statusCounts,
          });
        }
      }

      // Build the paginated query — exclude external/email clicks from employer view
      let query = supabaseAdmin
        .from('job_applications')
        .select('*')
        .eq('job_id', jobId)
        .not('application_type', 'in', '("external","email")');

      // Apply status filter
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }

      // Apply search filter (matching applicant IDs)
      if (matchingApplicantIds) {
        query = query.in('applicant_id', matchingApplicantIds);
      }

      // Get filtered count before pagination
      let countQuery = supabaseAdmin
        .from('job_applications')
        .select('id', { count: 'exact', head: true })
        .eq('job_id', jobId)
        .not('application_type', 'in', '("external","email")');

      if (status && status !== 'all') {
        countQuery = countQuery.eq('status', status);
      }
      if (matchingApplicantIds) {
        countQuery = countQuery.in('applicant_id', matchingApplicantIds);
      }

      const { count: filteredTotal } = await countQuery;

      // Apply sorting
      if (sort === 'created_at') {
        query = query.order('created_at', { ascending: order === 'asc' });
      } else {
        // For name sorting we still sort by created_at server-side; name sorting happens after profile join
        query = query.order('created_at', { ascending: order === 'asc' });
      }

      // Apply pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data: applications, error: appsError } = await query;

      if (appsError) {
        console.error('Failed to fetch applications:', appsError);
        return NextResponse.json(
          { error: 'Failed to fetch applications' },
          { status: 500 }
        );
      }

      // Fetch profiles for the applicants on this page
      const applicantIds = [...new Set((applications || []).map((a) => a.applicant_id))];
      const profilesMap: Record<string, { first_name?: string; last_name?: string; phone?: string; location?: string; experience_level?: string; user_id: string }> = {};

      if (applicantIds.length > 0) {
        const { data: profiles } = await supabaseAdmin
          .from('profiles')
          .select('user_id, first_name, last_name, phone, location, experience_level')
          .in('user_id', applicantIds);

        (profiles || []).forEach((p) => {
          profilesMap[p.user_id] = p;
        });
      }

      // Fetch job title
      const { data: job } = await supabaseAdmin
        .from('jobs')
        .select('id, title, company_id')
        .eq('id', jobId)
        .single();

      // Combine applications with profiles
      const enrichedApplications = (applications || []).map((app) => ({
        ...app,
        job: job ? { id: job.id, title: job.title, company_id: job.company_id } : { id: jobId, title: 'Unknown Job' },
        profiles: profilesMap[app.applicant_id] || null,
      }));

      // If sorting by name, sort client-side after enrichment
      if (sort === 'name') {
        enrichedApplications.sort((a, b) => {
          const nameA = `${a.profiles?.first_name || ''} ${a.profiles?.last_name || ''}`.trim().toLowerCase();
          const nameB = `${b.profiles?.first_name || ''} ${b.profiles?.last_name || ''}`.trim().toLowerCase();
          return order === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        });
      }

      return NextResponse.json({
        applications: enrichedApplications,
        total: filteredTotal ?? 0,
        page,
        pageSize,
        statusCounts,
      });
    }

    // Fallback: non-paginated query for applicant view or legacy employer view
    let query = supabaseAdmin.from('job_applications').select(`
      id,
      status,
      created_at,
      updated_at,
      resume_url,
      cover_letter_url,
      jobs (
        id,
        title,
        company_name,
        location,
        employer_id
      )
    `);

    if (type === 'employer') {
      query = query.eq('jobs.employer_id', userId);
    } else {
      query = query.eq('applicant_id', userId);
    }

    if (jobId) {
      query = query.eq('job_id', jobId);
    }

    const { data: applications, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch applications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      applications: applications || []
    });

  } catch (error) {
    console.error('Error in applications GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}