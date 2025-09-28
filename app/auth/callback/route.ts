import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  console.log('🔄 Auth callback handler started', {
    url: requestUrl.toString(),
    hasCode: !!code,
    codeLength: code?.length || 0,
    searchParams: Object.fromEntries(requestUrl.searchParams.entries())
  });

  if (code) {
    console.log('✅ Code parameter found, proceeding with authentication');

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
      console.log('🔐 Exchanging code for session...');
      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('❌ Auth callback error:', error);
        return NextResponse.redirect(`${requestUrl.origin}/auth/error?message=${encodeURIComponent(error.message)}`);
      }

      console.log('✅ Session exchange successful', {
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
        userEmail: session?.user?.email
      });

      if (session?.user) {
        const userType = session.user.user_metadata?.user_type || 'job_seeker';

        console.log('👤 User data analysis', {
          userId: session.user.id,
          email: session.user.email,
          userMetadata: session.user.user_metadata,
          detectedUserType: userType,
          allUserData: session.user
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
        console.log('❌ No user in session after authentication');
      }
    } catch (error) {
      console.error('❌ Auth callback error during processing:', error);
      return NextResponse.redirect(`${requestUrl.origin}/auth/error?message=${encodeURIComponent('Authentication failed')}`);
    }
  } else {
    console.log('❌ No code parameter found in callback URL');
  }

  // No code parameter, redirect to home
  console.log('🏠 Redirecting to home page (fallback)');
  return NextResponse.redirect(`${requestUrl.origin}/`);
}