import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
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
      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('Auth callback error:', error);
        return NextResponse.redirect(`${requestUrl.origin}/auth/error?message=${encodeURIComponent(error.message)}`);
      }

      if (session?.user) {
        const userType = session.user.user_metadata?.user_type || 'job_seeker';

        console.log('Auth callback: User confirmed', {
          userId: session.user.id,
          userType,
          email: session.user.email
        });

        // Redirect based on user type after successful email confirmation
        if (userType === 'employer') {
          return NextResponse.redirect(`${requestUrl.origin}/employer/settings?verified=true`);
        } else {
          return NextResponse.redirect(`${requestUrl.origin}/jobseeker/profile?verified=true`);
        }
      }
    } catch (error) {
      console.error('Auth callback error:', error);
      return NextResponse.redirect(`${requestUrl.origin}/auth/error?message=${encodeURIComponent('Authentication failed')}`);
    }
  }

  // No code parameter, redirect to home
  return NextResponse.redirect(`${requestUrl.origin}/`);
}