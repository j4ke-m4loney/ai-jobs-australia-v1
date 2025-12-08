import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
      .select('id, title, status, employer_id, check_failure_reason')
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
