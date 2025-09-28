import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get('token');
  const type = requestUrl.searchParams.get('type');
  const tokenHash = requestUrl.searchParams.get('token_hash');

  console.log('🔄 Auth callback handler started', {
    url: requestUrl.toString(),
    hasToken: !!token,
    type,
    hasTokenHash: !!tokenHash,
    tokenLength: token?.length || 0,
    searchParams: Object.fromEntries(requestUrl.searchParams.entries())
  });

  if (token && type) {
    console.log('✅ Email verification parameters found, proceeding with verification');

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

    try {
      console.log('🔐 Verifying email token...', { token: token.substring(0, 10) + '...', type });

      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash || token,
        type: type as 'email' | 'signup' | 'recovery' | 'email_change',
      });

      if (error) {
        console.error('❌ Auth verification error:', error);
        return NextResponse.redirect(`${requestUrl.origin}/auth/error?message=${encodeURIComponent(error.message)}`);
      }

      console.log('✅ Email verification successful', {
        hasSession: !!data.session,
        hasUser: !!data.user,
        userId: data.user?.id,
        userEmail: data.user?.email
      });

      if (data.session?.user) {
        const userType = data.session.user.user_metadata?.user_type || 'job_seeker';

        console.log('👤 User data analysis', {
          userId: data.session.user.id,
          email: data.session.user.email,
          userMetadata: data.session.user.user_metadata,
          detectedUserType: userType,
          allUserData: data.session.user
        });

        // Redirect based on user type after successful email confirmation
        let redirectUrl: string;
        if (userType === 'employer') {
          redirectUrl = `${requestUrl.origin}/employer/settings?verified=true`;
          console.log('🏢 Redirecting employer to:', redirectUrl);
        } else {
          redirectUrl = `${requestUrl.origin}/jobseeker/profile?verified=true`;
          console.log('👨‍💼 Redirecting job seeker to:', redirectUrl);
        }

        console.log('🚀 Executing redirect to:', redirectUrl);
        return NextResponse.redirect(redirectUrl);
      } else {
        console.log('❌ No user in session after verification');
      }
    } catch (error) {
      console.error('❌ Auth callback error during processing:', error);
      return NextResponse.redirect(`${requestUrl.origin}/auth/error?message=${encodeURIComponent('Authentication failed')}`);
    }
  } else {
    console.log('❌ No token or type parameter found in callback URL');
  }

  // No token parameter, redirect to home
  console.log('🏠 Redirecting to home page (fallback)');
  return NextResponse.redirect(`${requestUrl.origin}/`);
}