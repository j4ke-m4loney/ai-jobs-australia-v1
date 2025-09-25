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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const resolvedParams = await params;
    const applicationId = resolvedParams.id;
    const { status, statusMessage } = await request.json();

    console.log('🔄 Application Status API - Updating status:', {
      applicationId,
      status,
      hasMessage: !!statusMessage
    });

    if (!applicationId || !status) {
      return NextResponse.json(
        { error: 'Application ID and status are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['submitted', 'reviewing', 'shortlisted', 'rejected', 'accepted'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Get application details with job and applicant info
    const { data: application, error: fetchError } = await supabaseAdmin
      .from('job_applications')
      .select(`
        id,
        status,
        applicant_id,
        job_id,
        jobs (
          id,
          title,
          company_name,
          employer_id
        )
      `)
      .eq('id', applicationId)
      .single();

    if (fetchError || !application) {
      console.error('❌ Application not found:', fetchError);
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Update the application status
    const { data: updatedApplication, error: updateError } = await supabaseAdmin
      .from('job_applications')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Failed to update application status:', updateError);
      return NextResponse.json(
        { error: 'Failed to update application status' },
        { status: 500 }
      );
    }

    console.log('✅ Application status updated successfully');

    // Get applicant's email from auth.users table
    const { data: userData, error: userError } = await supabaseAdmin
      .auth.admin.getUserById(application.applicant_id);

    const applicantEmail = userData?.user?.email;

    // Check applicant's notification preferences
    const { data: applicantPrefs } = await supabaseAdmin
      .from('user_notification_preferences')
      .select('email_application_updates')
      .eq('user_id', application.applicant_id)
      .single();

    // Send email notification to applicant if they have the preference enabled (default: true)
    const shouldSendEmail = !applicantPrefs || applicantPrefs.email_application_updates !== false;

    if (shouldSendEmail && !userError && applicantEmail) {
      try {
        // Get applicant profile information
        const { data: applicantProfile } = await supabaseAdmin
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', application.applicant_id)
          .single();

        const applicantName = applicantProfile?.first_name && applicantProfile?.last_name
          ? `${applicantProfile.first_name} ${applicantProfile.last_name}`.trim()
          : applicantProfile?.first_name || applicantProfile?.last_name || 'Job Seeker';

        await emailService.sendApplicationStatusUpdate({
          applicantName,
          applicantEmail: applicantEmail,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          jobTitle: (application.jobs as any)?.title,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          companyName: (application.jobs as any)?.company_name,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          status: status as any,
          statusMessage
        });

        console.log('✅ Status update email sent to applicant');
      } catch (emailError) {
        console.error('❌ Failed to send status update email:', emailError);
        // Don't fail the request if email fails - status was updated successfully
      }
    }

    return NextResponse.json({
      success: true,
      application: {
        id: updatedApplication.id,
        status: updatedApplication.status,
        updated_at: updatedApplication.updated_at
      }
    });

  } catch (error) {
    console.error('Error in application status API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}