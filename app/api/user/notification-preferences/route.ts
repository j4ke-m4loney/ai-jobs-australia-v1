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
    const userId = searchParams.get('userId');

    console.log('📋 Notification Preferences API - GET request:', { userId });

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user's notification preferences
    const { data: preferences, error } = await supabaseAdmin
      .from('user_notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('❌ Failed to fetch notification preferences:', error);
      return NextResponse.json(
        { error: 'Failed to fetch notification preferences' },
        { status: 500 }
      );
    }

    console.log(`✅ Retrieved notification preferences for user: ${userId}`);

    return NextResponse.json({
      preferences: preferences || null
    });

  } catch (error) {
    console.error('Error in notification preferences GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const {
      userId,
      email_applications,
      email_job_views,
      email_weekly_reports,
      email_new_jobs,
      email_similar_jobs,
      email_application_updates,
      email_promotions
    } = await request.json();

    console.log('💾 Notification Preferences API - PUT request:', {
      userId,
      email_applications,
      email_job_views,
      email_weekly_reports,
      email_new_jobs,
      email_similar_jobs,
      email_application_updates,
      email_promotions
    });

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Upsert user notification preferences
    const { data: preferences, error } = await supabaseAdmin
      .from('user_notification_preferences')
      .upsert({
        user_id: userId,
        email_applications,
        email_job_views,
        email_weekly_reports,
        email_new_jobs,
        email_similar_jobs,
        email_application_updates,
        email_promotions,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to update notification preferences:', error);
      return NextResponse.json(
        { error: 'Failed to update notification preferences' },
        { status: 500 }
      );
    }

    console.log('✅ Notification preferences updated successfully');

    return NextResponse.json({
      success: true,
      preferences
    });

  } catch (error) {
    console.error('Error in notification preferences PUT API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}