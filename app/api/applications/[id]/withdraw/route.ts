import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface RouteParams {
  id: string;
}

/**
 * Withdraw a job application.
 * Only allowed when status is 'submitted' or 'reviewing'.
 * Applicant must be the owner of the application.
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const resolvedParams = await params;
    const applicationId = resolvedParams.id;
    const { applicantId } = await request.json();

    if (!applicationId || !applicantId) {
      return NextResponse.json(
        { error: 'Application ID and applicant ID are required' },
        { status: 400 }
      );
    }

    // Fetch the application and verify ownership
    const { data: application, error: fetchError } = await supabaseAdmin
      .from('job_applications')
      .select('id, status, applicant_id, job_id')
      .eq('id', applicationId)
      .single();

    if (fetchError || !application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    if (application.applicant_id !== applicantId) {
      return NextResponse.json(
        { error: 'You can only withdraw your own applications' },
        { status: 403 }
      );
    }

    // Only allow withdrawal from submitted or reviewing status
    const withdrawableStatuses = ['submitted', 'reviewing'];
    if (!withdrawableStatuses.includes(application.status)) {
      return NextResponse.json(
        { error: `Cannot withdraw an application with status "${application.status}". Withdrawal is only allowed for submitted or under-review applications.` },
        { status: 400 }
      );
    }

    // Build update payload
    const updatePayload: Record<string, unknown> = {
      status: 'withdrawn',
      updated_at: new Date().toISOString(),
    };

    // Try to include status_history if column exists
    const { data: historyData } = await supabaseAdmin
      .from('job_applications')
      .select('status_history')
      .eq('id', applicationId)
      .single();

    if (historyData && 'status_history' in historyData) {
      const existingHistory = (historyData.status_history as unknown[]) || [];
      updatePayload.status_history = [...existingHistory, {
        status: 'withdrawn',
        timestamp: new Date().toISOString(),
        note: 'Application withdrawn by applicant',
      }];
    }

    // Update the application
    const { data: updatedApplication, error: updateError } = await supabaseAdmin
      .from('job_applications')
      .update(updatePayload)
      .eq('id', applicationId)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to withdraw application:', updateError);
      return NextResponse.json(
        { error: 'Failed to withdraw application' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      application: {
        id: updatedApplication.id,
        status: updatedApplication.status,
        updated_at: updatedApplication.updated_at,
      },
    });
  } catch (error) {
    console.error('Error in application withdraw API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
