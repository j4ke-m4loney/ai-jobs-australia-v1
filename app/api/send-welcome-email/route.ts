import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { emailService } from '@/lib/email/postmark-service';

// Helper function to wait/delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function POST(request: NextRequest) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📧 [WELCOME EMAIL API] Request received');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  try {
    // Get access token from request body
    const body = await request.json();
    const { accessToken } = body;

    if (!accessToken) {
      console.error('❌ [WELCOME EMAIL API] No access token provided in request');
      return NextResponse.json(
        { error: 'Access token required' },
        { status: 400 }
      );
    }

    console.log('🔑 [WELCOME EMAIL API] Access token received');

    // Create Supabase client
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: Record<string, unknown>) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: Record<string, unknown>) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    // Authenticate user using the provided access token
    console.log('🔐 [WELCOME EMAIL API] Authenticating user with token...');
    const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);

    if (userError || !user) {
      console.error('❌ [WELCOME EMAIL API] Authentication failed:', userError);
      return NextResponse.json(
        { error: 'Invalid access token' },
        { status: 401 }
      );
    }

    console.log('✅ [WELCOME EMAIL API] User authenticated:', user.id);
    console.log('📧 [WELCOME EMAIL API] User email:', user.email);
    console.log('📋 [WELCOME EMAIL API] User metadata:', JSON.stringify(user.user_metadata, null, 2));

    // Get user_type, welcome_email_sent flag, and created_at from profiles table
    console.log('🔍 [WELCOME EMAIL API] Querying profiles table...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('user_type, welcome_email_sent, created_at')
      .eq('user_id', user.id)
      .single();

    if (profileError) {
      console.error('❌ [WELCOME EMAIL API] Error fetching profile:', profileError);
    }

    const userType = profile?.user_type;
    const welcomeEmailSent = profile?.welcome_email_sent;
    const createdAt = profile?.created_at;

    // Check if this is a new account (created within last 10 minutes)
    const isNewAccount = createdAt ?
      (new Date().getTime() - new Date(createdAt).getTime()) < (10 * 60 * 1000) :
      false;

    console.log('🔍 [WELCOME EMAIL API] Checking eligibility:');
    console.log('  - User type:', userType);
    console.log('  - Welcome email already sent (from profiles):', welcomeEmailSent);
    console.log('  - Account created at:', createdAt);
    console.log('  - Is new account (< 10 min old):', isNewAccount);
    console.log('  - Is job seeker:', userType === 'job_seeker');
    console.log('  - Email not sent yet:', !welcomeEmailSent);

    // Only send to NEW job seekers who haven't received the email
    if (userType !== 'job_seeker') {
      console.log('ℹ️  [WELCOME EMAIL API] User is not a job seeker, skipping email');
      return NextResponse.json(
        { message: 'User is not a job seeker', sent: false },
        { status: 200 }
      );
    }

    if (welcomeEmailSent) {
      console.log('ℹ️  [WELCOME EMAIL API] Welcome email already sent, skipping');
      return NextResponse.json(
        { message: 'Welcome email already sent', sent: false },
        { status: 200 }
      );
    }

    if (!isNewAccount) {
      console.log('ℹ️  [WELCOME EMAIL API] Account is not new (> 10 min old), skipping email');
      console.log('   This is an existing user re-logging in, not a new signup');
      return NextResponse.json(
        { message: 'Account is not new, welcome email only sent to new signups', sent: false },
        { status: 200 }
      );
    }

    // Send welcome email
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 [WELCOME EMAIL API] Sending welcome email...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const firstName = user.user_metadata?.first_name || 'there';
    const userEmail = user.email;

    if (!userEmail) {
      console.error('❌ [WELCOME EMAIL API] No email address found for user');
      return NextResponse.json(
        { error: 'No email address found' },
        { status: 400 }
      );
    }

    const requestUrl = new URL(request.url);
    const emailResult = await emailService.sendJobSeekerWelcomeEmail({
      recipientEmail: userEmail,
      recipientName: firstName,
      profileUrl: `${requestUrl.origin}/jobseeker/profile`,
      dashboardUrl: `${requestUrl.origin}/jobseeker`,
    });

    console.log('📬 [WELCOME EMAIL API] Email send result:', emailResult);

    if (!emailResult) {
      console.error('❌ [WELCOME EMAIL API] Email send failed');
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    console.log('✅ [WELCOME EMAIL API] Email sent successfully to:', userEmail);

    // Create service role client to bypass RLS for the update
    // (We've already verified the user's identity with their access token)
    console.log('📝 [WELCOME EMAIL API] Creating service role client for update...');
    const serviceSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: Record<string, unknown>) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: Record<string, unknown>) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    // Update profiles table to mark email as sent
    console.log('📝 [WELCOME EMAIL API] Updating profiles table to mark email as sent...');
    const { data: updateData, error: updateError } = await serviceSupabase
      .from('profiles')
      .update({ welcome_email_sent: true })
      .eq('user_id', user.id)
      .select();

    console.log('📊 [WELCOME EMAIL API] Update result:', {
      data: updateData,
      error: updateError,
      errorDetails: updateError ? JSON.stringify(updateError, null, 2) : null
    });

    if (updateError) {
      console.error('❌ [WELCOME EMAIL API] Failed to update profile:', updateError);
      // Email was sent, but we couldn't mark it - log but don't fail the request
    } else {
      console.log('✅ [WELCOME EMAIL API] Profile updated - flag set to true');
      console.log('📊 [WELCOME EMAIL API] Updated profile data:', updateData);
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 [WELCOME EMAIL API] Success!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return NextResponse.json(
      {
        message: 'Welcome email sent successfully',
        sent: true,
        recipient: userEmail
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('❌ [WELCOME EMAIL API] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
