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
  { params }: { params: RouteParams }
) {
  try {
    const jobId = params.id;
    const { status, rejectionReason, adminId } = await request.json();

    console.log('🔐 Admin Job Status API - Updating job status:', {
      jobId,
      status,
      hasRejectionReason: !!rejectionReason,
      adminId
    });

    if (!jobId || !status || !adminId) {
      return NextResponse.json(
        { error: 'Job ID, status, and admin ID are required' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['pending_approval', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    // Verify admin permissions
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('user_type')
      .eq('user_id', adminId)
      .single();

    if (adminError || adminData?.user_type !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Get job details
    const { data: job, error: jobFetchError } = await supabaseAdmin
      .from('jobs')
      .select('id, title, status, employer_id')
      .eq('id', jobId)
      .single();

    if (jobFetchError || !job) {
      console.error('❌ Job not found:', jobFetchError);
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Update the job status
    const updateData: any = {
      status,
      updated_at: new Date().toISOString()
    };

    // Add rejection reason if provided
    if (status === 'rejected' && rejectionReason) {
      updateData.rejection_reason = rejectionReason;
    }

    const { data: updatedJob, error: updateError } = await supabaseAdmin
      .from('jobs')
      .update(updateData)
      .eq('id', jobId)
      .select()
      .single();

    if (updateError) {
      console.error('❌ Failed to update job status:', updateError);
      return NextResponse.json(
        { error: 'Failed to update job status' },
        { status: 500 }
      );
    }

    console.log('✅ Job status updated successfully');

    // Get employer's email from auth.users table and profile info
    console.log('🔍 Getting employer email for employer ID:', job.employer_id);
    const [userResult, profileResult] = await Promise.all([
      supabaseAdmin.auth.admin.getUserById(job.employer_id),
      supabaseAdmin
        .from('profiles')
        .select('first_name, last_name')
        .eq('user_id', job.employer_id)
        .single()
    ]);

    const { data: userData, error: userError } = userResult;
    const { data: profileData, error: profileError } = profileResult;

    console.log('👤 User data result:', {
      userError: userError,
      hasUserData: !!userData,
      email: userData?.user?.email,
      profileError: profileError,
      hasProfileData: !!profileData
    });

    const employerEmail = userData?.user?.email;

    // Job approval/rejection emails are critical status updates - always send them
    // These are different from general job view notifications
    console.log('📧 Attempting to send job status update email (critical notification)');
    console.log('📧 Email check:', {
      hasUserError: !!userError,
      hasEmployerEmail: !!employerEmail,
      employerEmail: employerEmail
    });

    if (!userError && employerEmail) {
      try {
        const employerName = profileData?.first_name && profileData?.last_name
          ? `${profileData.first_name} ${profileData.last_name}`.trim()
          : profileData?.first_name || profileData?.last_name || 'Employer';

        console.log('📧 Preparing email with data:', {
          employerName,
          employerEmail,
          jobTitle: job.title,
          jobId: job.id,
          status,
          hasRejectionReason: !!rejectionReason
        });

        console.log('📧 Calling emailService.sendJobStatusUpdate...');
        await emailService.sendJobStatusUpdate({
          employerName,
          employerEmail: employerEmail,
          jobTitle: job.title,
          jobId: job.id,
          status: status as 'approved' | 'rejected',
          rejectionReason,
          dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/employer/jobs/${job.id}`
        });

        console.log('✅ Job status update email sent successfully to:', employerEmail);
      } catch (emailError) {
        console.error('❌ Failed to send job status update email:', {
          error: emailError,
          message: emailError?.message,
          stack: emailError?.stack
        });
        // Don't fail the request if email fails - status was updated successfully
      }
    } else {
      console.log('❌ Email not sent - reasons:', {
        userError: userError?.message,
        hasEmployerEmail: !!employerEmail,
        employerEmail
      });
    }

    return NextResponse.json({
      success: true,
      job: {
        id: updatedJob.id,
        status: updatedJob.status,
        updated_at: updatedJob.updated_at,
        rejection_reason: updatedJob.rejection_reason
      }
    });

  } catch (error) {
    console.error('Error in admin job status API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}