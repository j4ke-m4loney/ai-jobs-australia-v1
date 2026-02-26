import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { emailService } from '@/lib/email/postmark-service';
import { getSiteUrl } from '@/lib/utils/get-site-url';
import { requestJobIndexing, isIndexingConfigured } from '@/lib/google-indexing';
import { triggerJobAnalysis } from '@/lib/ai-focus/trigger-analysis';

// Allow up to 60 seconds — analysis runs 7 parallel Claude API calls
export const maxDuration = 60;

interface RouteParams {
  id: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const resolvedParams = await params;
    const jobId = resolvedParams.id;
    const { action, adminNotes } = await request.json();

    console.log('[AdminJobReview] Review action received:', {
      jobId,
      action,
      hasAdminNotes: !!adminNotes,
    });

    if (!jobId || !action) {
      return NextResponse.json(
        { error: 'Job ID and action are required' },
        { status: 400 }
      );
    }

    // Validate action
    if (!['approve', 'expire'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "expire"' },
        { status: 400 }
      );
    }

    // Get the current user from the request
    const authHeader = request.headers.get('authorization');
    let adminId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const {
        data: { user },
        error: authError,
      } = await supabaseAdmin.auth.getUser(token);

      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      adminId = user.id;

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
    }

    // Get job details
    const { data: job, error: jobFetchError } = await supabaseAdmin
      .from('jobs')
      .select('id, title, description, requirements, status, employer_id, check_failure_reason')
      .eq('id', jobId)
      .single();

    if (jobFetchError || !job) {
      console.error('[AdminJobReview] Job not found:', jobFetchError);
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Verify job is in needs_review status
    if (job.status !== 'needs_review') {
      return NextResponse.json(
        {
          error: `Job status is ${job.status}, not needs_review`,
        },
        { status: 400 }
      );
    }

    // Update the job status based on action
    const newStatus = action === 'approve' ? 'approved' : 'expired';
    const updateData: {
      status: string;
      updated_at: string;
      admin_notes?: string;
      expired_evidence?: string;
      reviewed_at?: string;
    } = {
      status: newStatus,
      updated_at: new Date().toISOString(),
      reviewed_at: new Date().toISOString(),
    };

    if (adminNotes) {
      updateData.admin_notes = adminNotes;
    }

    if (action === 'expire') {
      updateData.expired_evidence = `Manually expired by admin${
        job.check_failure_reason ? `: ${job.check_failure_reason}` : ''
      }`;
    }

    const { error: updateError } = await supabaseAdmin
      .from('jobs')
      .update(updateData)
      .eq('id', jobId);

    if (updateError) {
      console.error('[AdminJobReview] Error updating job:', updateError);
      return NextResponse.json(
        { error: 'Failed to update job status' },
        { status: 500 }
      );
    }

    console.log('[AdminJobReview] Job status updated successfully:', {
      jobId,
      newStatus,
    });

    // Send email notification to employer
    if (newStatus === 'approved') {
      try {
        const [userResult, profileResult] = await Promise.all([
          supabaseAdmin.auth.admin.getUserById(job.employer_id),
          supabaseAdmin
            .from('profiles')
            .select('first_name, last_name')
            .eq('user_id', job.employer_id)
            .single(),
        ]);

        const employerEmail = userResult.data?.user?.email;
        const profileData = profileResult.data;

        if (employerEmail) {
          const employerName = profileData?.first_name && profileData?.last_name
            ? `${profileData.first_name} ${profileData.last_name}`.trim()
            : profileData?.first_name || profileData?.last_name || 'Employer';

          await emailService.sendJobStatusUpdate({
            employerName,
            employerEmail,
            jobTitle: job.title,
            jobId: job.id,
            status: 'approved',
            dashboardUrl: `${getSiteUrl()}/employer/jobs/${job.id}`,
          });

          console.log('[AdminJobReview] Approval email sent to:', employerEmail);
        } else {
          console.log('[AdminJobReview] No employer email found for:', job.employer_id);
        }
      } catch (emailError) {
        console.error('[AdminJobReview] Failed to send approval email:', emailError);
        // Don't fail the request if email fails
      }
    }

    // Request Google indexing for approved jobs
    if (newStatus === 'approved' && isIndexingConfigured()) {
      try {
        const indexResult = await requestJobIndexing(jobId);
        console.log('[AdminJobReview] Google Indexing request:', indexResult);
      } catch (indexError) {
        console.error('[AdminJobReview] Google Indexing error (non-blocking):', indexError);
      }
    }

    // Trigger AJA Intelligence analysis for approved jobs
    // Must be awaited — Vercel terminates serverless functions after response is sent
    if (newStatus === 'approved') {
      try {
        await triggerJobAnalysis(
          jobId,
          job.title,
          job.description,
          job.requirements
        );
      } catch (error) {
        console.error('[AdminJobReview] AJA Intelligence analysis trigger failed:', error);
        // Don't fail the approval if analysis fails
      }
    }

    return NextResponse.json({
      success: true,
      jobId,
      newStatus,
    });
  } catch (error) {
    console.error('[AdminJobReview] Error in review API:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
