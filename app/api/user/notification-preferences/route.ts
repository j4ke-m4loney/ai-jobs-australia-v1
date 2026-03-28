import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Helper function to create Supabase admin client (avoids build-time initialization)
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

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
    const { data: preferences, error } = await getSupabaseAdmin()
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
      application_notification_frequency,
      email_job_views,
      email_weekly_reports,
      email_new_jobs,
      email_similar_jobs,
      email_application_updates,
      email_promotions
    } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Build update object with only provided fields
    const updateData: Record<string, unknown> = {
      user_id: userId,
      updated_at: new Date().toISOString(),
    };
    if (email_applications !== undefined) updateData.email_applications = email_applications;
    if (application_notification_frequency !== undefined) updateData.application_notification_frequency = application_notification_frequency;
    if (email_job_views !== undefined) updateData.email_job_views = email_job_views;
    if (email_weekly_reports !== undefined) updateData.email_weekly_reports = email_weekly_reports;
    if (email_new_jobs !== undefined) updateData.email_new_jobs = email_new_jobs;
    if (email_similar_jobs !== undefined) updateData.email_similar_jobs = email_similar_jobs;
    if (email_application_updates !== undefined) updateData.email_application_updates = email_application_updates;
    if (email_promotions !== undefined) updateData.email_promotions = email_promotions;

    // Upsert user notification preferences
    // If it fails (e.g. new column doesn't exist yet), retry without the new field
    let preferences;
    let error;

    const result = await getSupabaseAdmin()
      .from('user_notification_preferences')
      .upsert(updateData, { onConflict: 'user_id' })
      .select()
      .single();

    if (result.error && application_notification_frequency !== undefined &&
        result.error.message?.includes('application_notification_frequency')) {
      delete updateData.application_notification_frequency;
      const retryResult = await getSupabaseAdmin()
        .from('user_notification_preferences')
        .upsert(updateData, { onConflict: 'user_id' })
        .select()
        .single();
      preferences = retryResult.data;
      error = retryResult.error;
    } else {
      preferences = result.data;
      error = result.error;
    }

    if (error) {
      console.error('Failed to update notification preferences:', error);
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