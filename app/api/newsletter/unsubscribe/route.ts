import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * Unsubscribe a user from the newsletter
 * Handles both test users and regular users
 *
 * POST /api/newsletter/unsubscribe
 * Body: { token: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    console.log(`[Newsletter Unsubscribe] Processing unsubscribe for token: ${token}`);

    // First, try to find in test users table (MVP)
    const { data: testUser, error: testUserError } = await supabaseAdmin
      .from('newsletter_test_users')
      .select('id, email')
      .eq('id', token)
      .single();

    if (testUser && !testUserError) {
      // Update test user to inactive
      const { error: updateError } = await supabaseAdmin
        .from('newsletter_test_users')
        .update({ active: false })
        .eq('id', token);

      if (updateError) {
        console.error('[Newsletter Unsubscribe] Error updating test user:', updateError);
        return NextResponse.json(
          { error: 'Failed to unsubscribe' },
          { status: 500 }
        );
      }

      console.log(`[Newsletter Unsubscribe] Test user unsubscribed: ${testUser.email}`);
      return NextResponse.json({
        success: true,
        message: 'Successfully unsubscribed from newsletter',
      });
    }

    // If not a test user, try to find in profiles table
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('user_id, email')
      .eq('newsletter_unsubscribe_token', token)
      .single();

    if (!profile || profileError) {
      console.error('[Newsletter Unsubscribe] User not found:', profileError);
      return NextResponse.json(
        { error: 'Invalid unsubscribe token' },
        { status: 404 }
      );
    }

    // Update profile to unsubscribe
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ newsletter_subscribed: false })
      .eq('newsletter_unsubscribe_token', token);

    if (updateError) {
      console.error('[Newsletter Unsubscribe] Error updating profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to unsubscribe' },
        { status: 500 }
      );
    }

    console.log(`[Newsletter Unsubscribe] User unsubscribed: ${profile.email}`);
    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter',
    });
  } catch (error) {
    console.error('[Newsletter Unsubscribe] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process unsubscribe request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
