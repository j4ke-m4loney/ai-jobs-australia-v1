import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { emailService } from '@/lib/email/postmark-service';

// Server-side Supabase client with service role for database operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Volume-based batching configuration
const BATCH_THRESHOLD = 5; // Send batch email after 5 applications
const BATCH_TIMEOUT_HOURS = 1; // Or after 1 hour, whichever comes first

interface EmailBatchingParams {
  jobId: string;
  employerId: string;
  employerName: string;
  employerEmail: string;
  jobTitle: string;
  applicantName: string;
  applicationId: string;
}

/**
 * Process any overdue email batches before handling new application
 * This is "lazy processing" - we check for overdue batches when new apps arrive
 */
async function processOverdueBatches(): Promise<void> {
  try {
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
        scheduled_for,
        jobs!inner(title)
      `)
      .eq('processed', false)
      .lte('scheduled_for', new Date().toISOString())
      .order('created_at', { ascending: true });

    if (!overdueQueues || overdueQueues.length === 0) {
      return; // No overdue batches
    }

    console.log(`📧 Processing ${overdueQueues.length} overdue email batches (lazy processing)`);

    // Process each overdue batch
    for (const queue of overdueQueues) {
      try {
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
        const emailSent = await emailService.sendBatchedApplicationNotification({
          employerName,
          employerEmail,
          jobTitle: queue.jobs.title,
          jobId: queue.job_id,
          applicationCount: queue.application_ids.length,
          applicantNames: queue.applicant_names,
          timeFrame,
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/employer/applications`
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

          console.log(`✅ Processed overdue batch for job ${queue.job_id}: ${queue.application_ids.length} applications`);
        }
      } catch (batchError) {
        console.error(`❌ Error processing overdue batch ${queue.id}:`, batchError);
      }
    }
  } catch (error) {
    console.error('❌ Error in lazy processing of overdue batches:', error);
  }
}

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
    applicationId
  } = params;

  // Check current email tracking for this job
  const { data: emailTracking } = await supabaseAdmin
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
      applicantEmail: 'Not displayed', // We removed email display for privacy
      applicationDate: now.toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/employer/applications`
    });

    // Update tracking table
    await supabaseAdmin
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
  const { data: existingQueue } = await supabaseAdmin
    .from('email_notification_queue')
    .select('*')
    .eq('job_id', jobId)
    .eq('processed', false)
    .single();

  if (existingQueue) {
    // Add to existing queue
    const updatedApplicationIds = [...existingQueue.application_ids, applicationId];
    const updatedApplicantNames = [...existingQueue.applicant_names, applicantName];

    await supabaseAdmin
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
        employerId,
        employerName,
        employerEmail,
        jobTitle,
        applicationIds: updatedApplicationIds,
        applicantNames: updatedApplicantNames
      });
    }
  } else {
    // Create new queue entry
    const { data: newQueue } = await supabaseAdmin
      .from('email_notification_queue')
      .insert({
        job_id: jobId,
        employer_id: employerId,
        application_ids: [applicationId],
        applicant_names: [applicantName],
        scheduled_for: new Date(now.getTime() + (60 * 60 * 1000)).toISOString() // 1 hour from now
      })
      .select()
      .single();

    console.log(`📦 Created new batch queue entry`);
  }

  // Update application count
  await supabaseAdmin
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
  employerId: string;
  employerName: string;
  employerEmail: string;
  jobTitle: string;
  applicationIds: string[];
  applicantNames: string[];
}): Promise<void> {
  const {
    queueId,
    jobId,
    employerId,
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
    dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/employer/applications`
  });

  // Mark queue as processed
  await supabaseAdmin
    .from('email_notification_queue')
    .update({ processed: true })
    .eq('id', queueId);

  // Update email tracking
  await supabaseAdmin
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
      coverLetterUrl
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
    const { data: jobData, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select(`
        id,
        title,
        company_name,
        employer_id
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

    // Get applicant details from profiles and auth.users
    const { data: applicantData, error: applicantError } = await supabaseAdmin
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

    // Get applicant email from auth.users table
    const { data: applicantUserData } = await supabaseAdmin
      .auth.admin.getUserById(applicantId);

    const applicantEmail = applicantUserData?.user?.email;

    // Check if application already exists
    const { data: existingApplication } = await supabaseAdmin
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
    const { data: application, error: applicationError } = await supabaseAdmin
      .from('job_applications')
      .insert({
        job_id: jobId,
        applicant_id: applicantId,
        resume_url: resumeUrl,
        cover_letter_url: coverLetterUrl,
        status: 'submitted'
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
    const { data: employerUserData, error: employerUserError } = await supabaseAdmin
      .auth.admin.getUserById(jobData.employer_id);

    const employerEmail = employerUserData?.user?.email;

    // Check employer's notification preferences
    const { data: employerPrefs } = await supabaseAdmin
      .from('user_notification_preferences')
      .select('email_applications')
      .eq('user_id', jobData.employer_id)
      .single();

    // Send email notification to employer if they have the preference enabled (default: true)
    const shouldSendEmail = !employerPrefs || employerPrefs.email_applications !== false;

    if (shouldSendEmail && !employerUserError && employerEmail) {
      try {
        // Get employer profile information
        const { data: employerProfile } = await supabaseAdmin
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

        // First, process any overdue batches (lazy processing)
        await processOverdueBatches();

        // Then handle the current application with batching logic
        await handleEmailBatching({
          jobId: jobData.id,
          employerId: jobData.employer_id,
          employerName,
          employerEmail,
          jobTitle: jobData.title,
          applicantName,
          applicationId: application.id
        });

        console.log('✅ Application notification handled with batching logic');
      } catch (emailError) {
        console.error('❌ Failed to handle application notification:', emailError);
        // Don't fail the request if email fails - application was created successfully
      }
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

    console.log('📋 Applications API - GET request:', { userId, jobId, type });

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

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
      ),
      profiles (
        user_id,
        first_name,
        last_name
      )
    `);

    if (type === 'employer') {
      // Get applications for jobs posted by this employer
      query = query.eq('jobs.employer_id', userId);
    } else {
      // Get applications made by this user
      query = query.eq('applicant_id', userId);
    }

    if (jobId) {
      query = query.eq('job_id', jobId);
    }

    const { data: applications, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Failed to fetch applications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch applications' },
        { status: 500 }
      );
    }

    console.log(`✅ Retrieved ${applications?.length || 0} applications`);

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