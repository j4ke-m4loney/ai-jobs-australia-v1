import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role for database operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    // Get total count of approved jobs (including expired ones)
    const { count, error } = await supabaseAdmin
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');

    if (error) {
      console.error('Error fetching job count:', error);
      return NextResponse.json(
        { error: 'Failed to fetch job count' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      total: count || 0,
    });

  } catch (error) {
    console.error('Error in job count API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
