import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { emailService } from '@/lib/email/postmark-service';

// Server-side Supabase client with service role for database operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Cron job to process overdue email batches
 * This runs every 15 minutes to check for queued emails that should be sent
 * (when 1 hour has passed since they were queued)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request (basic security)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🕐 Starting email queue processing...');

    // Find all unprocessed queue entries that are overdue (scheduled_for <= now)
    const { data: overdueQueues, error } = await supabaseAdmin
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

    if (error) {
      console.error('❌ Error fetching overdue queues:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    if (!overdueQueues || overdueQueues.length === 0) {
      console.log('✅ No overdue email batches found');
      return NextResponse.json({
        success: true,
        message: 'No overdue batches',
        processed: 0
      });
    }

    console.log(`📧 Found ${overdueQueues.length} overdue email batches to process`);

    let processedCount = 0;
    let errorCount = 0;

    // Process each overdue batch
    for (const queue of overdueQueues) {
      try {
        // Get employer details
        const { data: employerUserData } = await supabaseAdmin
          .auth.admin.getUserById(queue.employer_id);

        const employerEmail = employerUserData?.user?.email;

        if (!employerEmail) {
          console.error(`❌ No email found for employer ${queue.employer_id}`);
          errorCount++;
          continue;
        }

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

          console.log(`✅ Processed batch for job ${queue.job_id}: ${queue.application_ids.length} applications`);
          processedCount++;
        } else {
          console.error(`❌ Failed to send email for batch ${queue.id}`);
          errorCount++;
        }

      } catch (batchError) {
        console.error(`❌ Error processing batch ${queue.id}:`, batchError);
        errorCount++;
      }
    }

    console.log(`🏁 Email queue processing complete: ${processedCount} sent, ${errorCount} errors`);

    return NextResponse.json({
      success: true,
      processed: processedCount,
      errors: errorCount,
      message: `Processed ${processedCount} email batches`
    });

  } catch (error) {
    console.error('❌ Cron job error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Also support POST requests for manual testing
export async function POST(request: NextRequest) {
  return GET(request);
}