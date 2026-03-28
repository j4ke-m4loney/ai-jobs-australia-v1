import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface RouteParams {
  id: string;
}

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET - Fetch notes for an application
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const resolvedParams = await params;
    const applicationId = resolvedParams.id;

    const { data: notes, error } = await getSupabaseAdmin()
      .from('application_notes')
      .select('id, content, created_at, updated_at')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch notes:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notes' },
        { status: 500 }
      );
    }

    return NextResponse.json({ notes: notes || [] });
  } catch (error) {
    console.error('Error in notes GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST - Add a note to an application
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<RouteParams> }
) {
  try {
    const resolvedParams = await params;
    const applicationId = resolvedParams.id;
    const { content, employerId } = await request.json();

    if (!content || !employerId) {
      return NextResponse.json(
        { error: 'Content and employer ID are required' },
        { status: 400 }
      );
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { error: 'Note content must be under 5000 characters' },
        { status: 400 }
      );
    }

    // Verify the employer owns the job this application belongs to
    const { data: application } = await getSupabaseAdmin()
      .from('job_applications')
      .select('job_id, jobs(employer_id)')
      .eq('id', applicationId)
      .single();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!application || (application.jobs as any)?.employer_id !== employerId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    const { data: note, error } = await getSupabaseAdmin()
      .from('application_notes')
      .insert({
        application_id: applicationId,
        employer_id: employerId,
        content,
      })
      .select('id, content, created_at')
      .single();

    if (error) {
      console.error('Failed to create note:', error);
      return NextResponse.json(
        { error: 'Failed to create note' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, note });
  } catch (error) {
    console.error('Error in notes POST API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
