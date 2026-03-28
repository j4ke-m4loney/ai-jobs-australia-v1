import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface RouteParams {
  id: string;
}

/**
 * Mark an application as viewed by the employer.
 * Sets viewed_at timestamp if not already set.
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

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    // Only set viewed_at if not already set
    const { data, error } = await supabaseAdmin
      .from('job_applications')
      .update({ viewed_at: new Date().toISOString() })
      .eq('id', applicationId)
      .is('viewed_at', null)
      .select('id, viewed_at')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Failed to mark application as viewed:', error);
      return NextResponse.json(
        { error: 'Failed to update application' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, viewed_at: data?.viewed_at });
  } catch (error) {
    console.error('Error in application view API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
