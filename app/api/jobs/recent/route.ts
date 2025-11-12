import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client inside route handler to avoid build-time initialization
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '9');

    // Get recent jobs ordered by creation date
    const { data: recentJobs, error } = await supabaseAdmin
      .from('jobs')
      .select(`
        id,
        title,
        description,
        location,
        location_type,
        job_type,
        salary_min,
        salary_max,
        show_salary,
        is_featured,
        highlights,
        created_at,
        updated_at,
        companies (
          id,
          name,
          logo_url,
          website
        )
      `)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching recent jobs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch recent jobs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      jobs: recentJobs || [],
      count: recentJobs?.length || 0,
    });

  } catch (error) {
    console.error('Error in recent jobs API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
