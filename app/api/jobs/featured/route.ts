import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role for database operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '8');

    // Get featured jobs by querying jobs table directly
    const { data: featuredJobs, error } = await supabaseAdmin
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
        is_featured,
        featured_until,
        featured_order,
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
      .eq('is_featured', true)
      .eq('status', 'approved')
      .gt('featured_until', new Date().toISOString())
      .order('featured_order', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching featured jobs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch featured jobs' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      jobs: featuredJobs || [],
      count: featuredJobs?.length || 0,
    });

  } catch (error) {
    console.error('Error in featured jobs API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Admin endpoint to manually set featured status (for testing)
export async function POST(request: NextRequest) {
  try {
    const { jobId, featured, featuredUntil } = await request.json();

    if (!jobId) {
      return NextResponse.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {
      is_featured: featured,
    };

    if (featured && featuredUntil) {
      updateData.featured_until = new Date(featuredUntil).toISOString();
    } else if (featured) {
      // Default to 3 days from now
      updateData.featured_until = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    } else {
      updateData.featured_until = null;
    }

    const { data, error } = await supabaseAdmin
      .from('jobs')
      .update(updateData)
      .eq('id', jobId)
      .select()
      .single();

    if (error) {
      console.error('Error updating job featured status:', error);
      return NextResponse.json(
        { error: 'Failed to update job featured status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      job: data,
    });

  } catch (error) {
    console.error('Error in featured jobs POST API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}