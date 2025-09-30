import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { emailService } from '@/lib/email/postmark-service';

// Server-side Supabase client with service role for database operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface RouteParams {
  id: string;
}

interface ResubmissionEmailRequest {
  employerName: string;
  jobTitle: string;
  companyName: string;
  location: string;
  changesDescription: string;
  dashboardUrl: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const resolvedParams = await params;
    const jobId = resolvedParams.id;
    const requestData: ResubmissionEmailRequest = await request.json();

    console.log('📧 Job resubmission email API called for job:', jobId);

    // Get user ID from custom header sent by client
    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID required' },
        { status: 400 }
      );
    }

    // Verify the user owns this job
    const { data: job, error: jobError } = await supabaseAdmin
      .from('jobs')
      .select('id, employer_id, status')
      .eq('id', jobId)
      .eq('employer_id', userId)
      .single();

    if (jobError || !job) {
      console.error('❌ Job not found or access denied:', jobError);
      return NextResponse.json(
        { error: 'Job not found or access denied' },
        { status: 404 }
      );
    }

    // Note: We don't validate status here since this endpoint is called
    // immediately after updating job status, and the status validation
    // is already handled in the calling code

    // Get employer's email from auth.users table
    const { data: userData, error: userError } = await supabaseAdmin
      .auth.admin.getUserById(userId);

    const employerEmail = userData?.user?.email;

    if (userError || !employerEmail) {
      console.error('❌ Failed to get employer email:', userError);
      return NextResponse.json(
        { error: 'Failed to get employer email' },
        { status: 500 }
      );
    }

    // Check if the employer is an admin - don't send emails for admin-edited jobs
    const { data: employerProfile } = await supabaseAdmin
      .from('profiles')
      .select('user_type')
      .eq('user_id', userId)
      .single();

    const isEmployerAdmin = employerProfile?.user_type === 'admin';

    if (isEmployerAdmin) {
      console.log('⚠️ Skipping resubmission email - employer is admin');
      return NextResponse.json({
        success: true,
        message: 'Email skipped - admin user',
        skipped: true
      });
    }

    // Send the resubmission confirmation email
    const emailResult = await emailService.sendJobResubmissionConfirmation({
      employerName: requestData.employerName,
      employerEmail: employerEmail,
      jobTitle: requestData.jobTitle,
      jobId: jobId,
      companyName: requestData.companyName,
      location: requestData.location,
      changesDescription: requestData.changesDescription,
      dashboardUrl: requestData.dashboardUrl,
    });

    if (emailResult) {
      console.log('✅ Job resubmission confirmation email sent successfully');
      return NextResponse.json({
        success: true,
        message: 'Resubmission email sent successfully',
        emailSentTo: employerEmail
      });
    } else {
      console.error('❌ Failed to send resubmission email');
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in job resubmission email API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}