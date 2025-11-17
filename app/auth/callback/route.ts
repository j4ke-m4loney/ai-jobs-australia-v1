import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { emailService } from '@/lib/email/postmark-service';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token = requestUrl.searchParams.get('token');
  const type = requestUrl.searchParams.get('type');
  const tokenHash = requestUrl.searchParams.get('token_hash');
  const code = requestUrl.searchParams.get('code');
  const popup = requestUrl.searchParams.get('popup'); // 'true' or null

  // Extract userType from query parameter (e.g., ?user_type=job_seeker)
  const userTypeParam = requestUrl.searchParams.get('user_type');
  const userTypeFromQuery = (userTypeParam === 'employer' || userTypeParam === 'job_seeker')
    ? userTypeParam as 'employer' | 'job_seeker'
    : null;

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔄 [CALLBACK] Handler started');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📍 [CALLBACK] Full URL:', requestUrl.toString());
  console.log('🛤️  [CALLBACK] URL Pathname:', requestUrl.pathname);
  console.log('🎯 [CALLBACK] User Type from QUERY:', userTypeFromQuery);
  console.log('🔍 [CALLBACK] Parameters:', {
    token: token ? `${token.substring(0, 10)}...` : null,
    type,
    tokenHash: tokenHash ? `${tokenHash.substring(0, 10)}...` : null,
    code: code ? `${code.substring(0, 10)}...` : null,
    popup,
    userTypeFromQuery: userTypeFromQuery,
    allParams: Object.fromEntries(requestUrl.searchParams.entries())
  });
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // SECURITY: Block employer OAuth attempts (OAuth only allowed for job seekers)
  if (code && userTypeFromQuery === 'employer') {
    console.log('🚫 [CALLBACK] REJECTED: Employer OAuth attempt blocked');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/error?message=${encodeURIComponent(
        'Google sign-in is not available for employer accounts. Please use email and password to sign in.'
      )}`
    );
  }

  if (token && type) {
    console.log('✉️ [CALLBACK] Taking EMAIL VERIFICATION path (token + type found)');

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
  } else if (code) {
    // OAuth callback flow (Google, GitHub, etc.)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 [CALLBACK] Taking OAUTH path (code found)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 [CALLBACK] OAuth Code:', code.substring(0, 10) + '...');
    console.log('🎭 [CALLBACK] Popup Mode:', popup);
    console.log('👤 [CALLBACK] user_type from QUERY:', userTypeFromQuery);
    console.log('🔍 [CALLBACK] CRITICAL: Did user_type survive redirect?', !!userTypeFromQuery);
    console.log('📋 [CALLBACK] All URL Parameters:',
      Array.from(requestUrl.searchParams.entries()).map(([key, value]) => ({
        key,
        value: key === 'code' ? value.substring(0, 10) + '...' : value
      }))
    );
    console.log('🌐 [CALLBACK] Referrer:', request.headers.get('referer'));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

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
      console.log('🔐 Exchanging OAuth code for session...');

      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error) {
        console.error('❌ OAuth code exchange error:', error);
        const isPopupMode = popup === 'true';

        // Return HTML that handles popup or redirect to error page
        return new NextResponse(
          `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Authentication Error</title>
            </head>
            <body>
              <script>
                (function() {
                  const isPopup = ${isPopupMode};

                  console.log('OAuth error callback - popup mode:', isPopup);

                  if (isPopup && window.opener && !window.opener.closed) {
                    // We're in a popup, send error to opener
                    window.opener.postMessage({
                      type: 'oauth-error',
                      error: '${error.message}'
                    }, window.location.origin);

                    setTimeout(function() {
                      window.close();
                    }, 100);
                  } else {
                    // Not in popup or no opener, redirect to error page
                    window.location.href = '${requestUrl.origin}/auth/error?message=${encodeURIComponent(error.message)}';
                  }
                })();
              </script>
              <p>Authentication failed. Redirecting...</p>
            </body>
          </html>
          `,
          {
            status: 200,
            headers: { 'Content-Type': 'text/html' },
          }
        );
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ [CALLBACK] OAuth Code Exchange Successful');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📊 Session exists:', !!data.session);
      console.log('👤 User exists:', !!data.user);
      console.log('🆔 User ID:', data.user?.id);
      console.log('📧 Email:', data.user?.email);
      console.log('📋 Full User Metadata:', JSON.stringify(data.user?.user_metadata, null, 2));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      if (data.session?.user) {
        // Check if we need to set user_type from query parameter
        const existingUserType = data.session.user.user_metadata?.user_type;
        const userType = userTypeFromQuery || existingUserType || 'job_seeker';

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔍 [CALLBACK] User Type Analysis');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('👤 User ID:', data.session.user.id);
        console.log('📧 Email:', data.session.user.email);
        console.log('🎯 user_type from QUERY:', userTypeFromQuery || 'NOT PRESENT');
        console.log('💾 user_type in metadata:', existingUserType || 'NOT PRESENT');
        console.log('✅ Final user_type to use:', userType);
        console.log('🔧 Will update?:', userTypeFromQuery && !existingUserType);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // If user_type came from query parameter and it's not already set, update user metadata and profile
        if (userTypeFromQuery && !existingUserType) {
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('🔧 [CALLBACK] Updating user_type to:', userTypeFromQuery);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

          try {
            // Update user metadata
            console.log('📝 [CALLBACK] Step 1: Updating user metadata...');
            const { data: updateData, error: updateError } = await supabase.auth.updateUser({
              data: { user_type: userTypeFromQuery }
            });

            if (updateError) {
              console.error('❌ [CALLBACK] Metadata update FAILED:', {
                error: updateError,
                message: updateError.message,
                status: updateError.status,
              });
            } else {
              console.log('✅ [CALLBACK] Metadata update SUCCESS');
              console.log('📋 [CALLBACK] Updated user metadata:', JSON.stringify(updateData?.user?.user_metadata, null, 2));
            }

            // Also update the profiles table directly in case trigger already ran with default
            console.log('📝 [CALLBACK] Step 2: Updating profiles table...');
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .update({ user_type: userTypeFromQuery })
              .eq('user_id', data.session.user.id)
              .select();

            if (profileError) {
              console.error('❌ [CALLBACK] Profile update FAILED:', {
                error: profileError,
                message: profileError.message,
                code: profileError.code,
                details: profileError.details,
                hint: profileError.hint,
              });
            } else {
              console.log('✅ [CALLBACK] Profile update SUCCESS');
              console.log('📊 [CALLBACK] Updated profile data:', profileData);
            }

            // Verification step: Read back the profile to confirm
            console.log('🔍 [CALLBACK] Step 3: Verifying profile update...');
            const { data: verifyProfile, error: verifyError } = await supabase
              .from('profiles')
              .select('user_id, user_type, first_name')
              .eq('user_id', data.session.user.id)
              .single();

            if (verifyError) {
              console.error('❌ [CALLBACK] Verification FAILED:', verifyError);
            } else {
              console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
              console.log('🎯 [CALLBACK] VERIFICATION RESULTS');
              console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
              console.log('👤 User ID:', verifyProfile?.user_id);
              console.log('📝 Profile user_type:', verifyProfile?.user_type);
              console.log('✅ Expected user_type:', userTypeFromQuery);
              console.log('✔️  Match?:', verifyProfile?.user_type === userTypeFromQuery);
              console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            }
          } catch (err) {
            console.error('❌ [CALLBACK] CRITICAL ERROR during update:', err);
          }
        } else {
          console.log('ℹ️  [CALLBACK] Skipping update:', {
            reason: !userTypeFromQuery ? 'No user_type from query parameter' : 'user_type already exists in metadata',
            userTypeFromQuery,
            existingUserType
          });
        }

        // DEBUG: Check welcome email conditions
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔍 [CALLBACK] Welcome Email Condition Check');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📊 [CALLBACK] userTypeFromQuery:', userTypeFromQuery);
        console.log('📊 [CALLBACK] existingUserType:', existingUserType);
        console.log('📊 [CALLBACK] Is job_seeker?:', userTypeFromQuery === 'job_seeker');
        console.log('📊 [CALLBACK] Is new user?:', !existingUserType);
        console.log('✅ [CALLBACK] Condition met (will send email)?:', userTypeFromQuery === 'job_seeker' && !existingUserType);
        console.log('📧 [CALLBACK] User email:', data.session.user.email);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        // Send welcome email to NEW job seekers (not employers, not returning users)
        if (userTypeFromQuery === 'job_seeker' && !existingUserType) {
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          console.log('📧 [CALLBACK] Sending welcome email to new job seeker');
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

          try {
            const firstName = data.session.user.user_metadata?.first_name || 'there';
            const userEmail = data.session.user.email;

            console.log('📧 [CALLBACK] Email data prepared:', {
              recipientEmail: userEmail,
              recipientName: firstName,
              hasEmail: !!userEmail,
            });

            // DEBUG: Check email service availability
            console.log('🔧 [CALLBACK] Checking email service availability...');
            console.log('🔧 [CALLBACK] POSTMARK_SERVER_TOKEN exists:', !!process.env.POSTMARK_SERVER_TOKEN);
            console.log('🔧 [CALLBACK] POSTMARK_SERVER_TOKEN value:',
              process.env.POSTMARK_SERVER_TOKEN
                ? `${process.env.POSTMARK_SERVER_TOKEN.substring(0, 10)}...`
                : 'MISSING'
            );

            if (userEmail) {
              console.log('📤 [CALLBACK] Attempting to send welcome email...');

              const emailResult = await emailService.sendJobSeekerWelcomeEmail({
                recipientEmail: userEmail,
                recipientName: firstName,
                profileUrl: `${requestUrl.origin}/jobseeker/profile`,
                dashboardUrl: `${requestUrl.origin}/jobseeker`,
              });

              console.log('📬 [CALLBACK] Email send result:', emailResult);

              if (emailResult) {
                console.log('✅ [CALLBACK] Welcome email sent successfully');
              } else {
                console.error('❌ [CALLBACK] Welcome email send returned FALSE (silent failure - check Postmark service)');
              }
            } else {
              console.warn('⚠️  [CALLBACK] No email address found for user');
            }
          } catch (emailError) {
            console.error('❌ [CALLBACK] Failed to send welcome email:', emailError);
            // Don't block the authentication flow if email fails
          }

          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        }

        // Determine redirect URL based on user type
        const redirectPath = userType === 'employer' ? '/employer' : '/jobseeker';
        const isPopupMode = popup === 'true';

        console.log('🎯 [CALLBACK] About to return HTML response:', {
          isPopupMode,
          popup,
          redirectPath,
          userType,
        });

        // Return HTML that handles popup or normal redirect
        return new NextResponse(
          `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Authentication Successful</title>
            </head>
            <body>
              <script>
                (function() {
                  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                  console.log('📜 [CALLBACK HTML] Script executing!');
                  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

                  // Check sessionStorage for user_type as fallback
                  let userTypeFromStorage = null;
                  try {
                    userTypeFromStorage = sessionStorage.getItem('oauth_user_type');
                    console.log('💾 [CALLBACK HTML] user_type from sessionStorage:', userTypeFromStorage);

                    // Clear it after reading
                    if (userTypeFromStorage) {
                      sessionStorage.removeItem('oauth_user_type');
                      console.log('🗑️  [CALLBACK HTML] Cleared user_type from sessionStorage');
                    }
                  } catch (e) {
                    console.warn('⚠️  [CALLBACK HTML] Could not access sessionStorage:', e);
                  }

                  const isPopup = ${isPopupMode};
                  const serverUserType = '${userType}';
                  const finalUserType = serverUserType || userTypeFromStorage || 'job_seeker';

                  console.log('🔍 [CALLBACK HTML] isPopup:', isPopup);
                  console.log('👤 [CALLBACK HTML] user_type from server:', serverUserType);
                  console.log('💾 [CALLBACK HTML] user_type from storage:', userTypeFromStorage);
                  console.log('✅ [CALLBACK HTML] Final user_type:', finalUserType);
                  console.log('🔍 [CALLBACK HTML] window.opener exists:', !!window.opener);
                  console.log('🔍 [CALLBACK HTML] window.opener.closed:', window.opener ? window.opener.closed : 'N/A');
                  console.log('🌐 [CALLBACK HTML] window.location.origin:', window.location.origin);

                  // Calculate redirect path based on final user type
                  const redirectPath = finalUserType === 'employer' ? '/employer' : '/jobseeker';
                  console.log('🎯 [CALLBACK HTML] Calculated redirect path:', redirectPath);

                  if (isPopup) {
                    console.log('🎯 [CALLBACK HTML] Popup mode detected! Notifying parent window...');

                    // Verify window.opener exists
                    if (window.opener && !window.opener.closed) {
                      console.log('✅ [CALLBACK HTML] window.opener is available!');
                      console.log('📤 [CALLBACK HTML] Sending postMessage to parent...');

                      // Send success message to parent window with user type
                      const message = {
                        type: 'oauth-success',
                        userType: finalUserType
                      };

                      console.log('📨 [CALLBACK HTML] Message to send:', message);
                      console.log('🎯 [CALLBACK HTML] Target origin:', window.location.origin);

                      window.opener.postMessage(message, window.location.origin);

                      console.log('✅ [CALLBACK HTML] postMessage sent!');

                      // Wait a moment to ensure message is delivered, then close
                      setTimeout(function() {
                        console.log('🔒 [CALLBACK HTML] Closing popup window in 100ms...');
                        window.close();
                      }, 100);
                    } else {
                      console.error('❌ [CALLBACK HTML] Window opener not found, redirecting to dashboard...');
                      window.location.href = '${requestUrl.origin}' + redirectPath;
                    }
                  } else {
                    // Not in popup, redirect to dashboard
                    console.log('🔄 [CALLBACK HTML] Normal mode (not popup), redirecting to dashboard...');
                    console.log('🔗 [CALLBACK HTML] Final redirect URL:', '${requestUrl.origin}' + redirectPath);
                    window.location.href = '${requestUrl.origin}' + redirectPath;
                  }

                  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                  console.log('📜 [CALLBACK HTML] Script finished');
                  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                })();
              </script>
              <p>Authentication successful. Redirecting...</p>
            </body>
          </html>
          `,
          {
            status: 200,
            headers: { 'Content-Type': 'text/html' },
          }
        );
      }
    } catch (error) {
      console.error('❌ OAuth callback error during processing:', error);
      return NextResponse.redirect(`${requestUrl.origin}/auth/error?message=${encodeURIComponent('Authentication failed')}`);
    }
  } else if (userTypeFromQuery) {
    // Session-based OAuth completion path
    // This handles the case where Supabase has already consumed the OAuth code
    // and redirects back to our callback with just the user_type parameter
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔐 [CALLBACK] Taking SESSION-BASED OAUTH path');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 [CALLBACK] user_type from QUERY:', userTypeFromQuery);
    console.log('ℹ️  [CALLBACK] No code parameter - checking for existing session in cookies');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

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
      // Get the current session from cookies
      console.log('🔍 [CALLBACK] Checking for session in cookies...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('❌ [CALLBACK] Error getting session:', sessionError);
        return NextResponse.redirect(`${requestUrl.origin}/auth/error?message=${encodeURIComponent('Session error')}`);
      }

      if (!session || !session.user) {
        console.log('❌ [CALLBACK] No session found in cookies - redirecting to home');
        return NextResponse.redirect(`${requestUrl.origin}/`);
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ [CALLBACK] Session Found in Cookies!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🆔 User ID:', session.user.id);
      console.log('📧 Email:', session.user.email);
      console.log('📋 User Metadata:', JSON.stringify(session.user.user_metadata, null, 2));
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // Check if this is a new user (no existing user_type in metadata)
      const existingUserType = session.user.user_metadata?.user_type;
      const userType = userTypeFromQuery || existingUserType || 'job_seeker';

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔍 [CALLBACK] User Type Analysis');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎯 user_type from QUERY:', userTypeFromQuery);
      console.log('💾 user_type in metadata:', existingUserType || 'NOT PRESENT');
      console.log('✅ Final user_type to use:', userType);
      console.log('🆕 Is new user?:', !existingUserType);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      // If user_type came from query parameter and it's not already set, update user metadata and profile
      if (userTypeFromQuery && !existingUserType) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔧 [CALLBACK] Updating user_type to:', userTypeFromQuery);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        try {
          // Update user metadata
          console.log('📝 [CALLBACK] Step 1: Updating user metadata...');
          const { data: updateData, error: updateError } = await supabase.auth.updateUser({
            data: { user_type: userTypeFromQuery }
          });

          if (updateError) {
            console.error('❌ [CALLBACK] Metadata update FAILED:', updateError);
          } else {
            console.log('✅ [CALLBACK] Metadata update SUCCESS');
            console.log('📋 [CALLBACK] Updated user metadata:', JSON.stringify(updateData?.user?.user_metadata, null, 2));
          }

          // Also update the profiles table
          console.log('📝 [CALLBACK] Step 2: Updating profiles table...');
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .update({ user_type: userTypeFromQuery })
            .eq('user_id', session.user.id)
            .select();

          if (profileError) {
            console.error('❌ [CALLBACK] Profile update FAILED:', profileError);
          } else {
            console.log('✅ [CALLBACK] Profile update SUCCESS');
            console.log('📊 [CALLBACK] Updated profile data:', profileData);
          }

          // Verification step: Read back the profile to confirm
          console.log('🔍 [CALLBACK] Step 3: Verifying profile update...');
          const { data: verifyProfile, error: verifyError } = await supabase
            .from('profiles')
            .select('user_id, user_type, first_name')
            .eq('user_id', session.user.id)
            .single();

          if (verifyError) {
            console.error('❌ [CALLBACK] Verification FAILED:', verifyError);
          } else {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🎯 [CALLBACK] VERIFICATION RESULTS');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('👤 User ID:', verifyProfile?.user_id);
            console.log('📝 Profile user_type:', verifyProfile?.user_type);
            console.log('✅ Expected user_type:', userTypeFromQuery);
            console.log('✔️  Match?:', verifyProfile?.user_type === userTypeFromQuery);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          }
        } catch (err) {
          console.error('❌ [CALLBACK] CRITICAL ERROR during update:', err);
        }
      }

      // Send welcome email to NEW job seekers
      if (userTypeFromQuery === 'job_seeker' && !existingUserType) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 [CALLBACK] Sending welcome email to new job seeker');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        try {
          const firstName = session.user.user_metadata?.first_name || 'there';
          const userEmail = session.user.email;

          console.log('📧 [CALLBACK] Email data prepared:', {
            recipientEmail: userEmail,
            recipientName: firstName,
            hasEmail: !!userEmail,
          });

          if (userEmail) {
            console.log('📤 [CALLBACK] Attempting to send welcome email...');

            const emailResult = await emailService.sendJobSeekerWelcomeEmail({
              recipientEmail: userEmail,
              recipientName: firstName,
              profileUrl: `${requestUrl.origin}/jobseeker/profile`,
              dashboardUrl: `${requestUrl.origin}/jobseeker`,
            });

            console.log('📬 [CALLBACK] Email send result:', emailResult);

            if (emailResult) {
              console.log('✅ [CALLBACK] Welcome email sent successfully to', userEmail);
            } else {
              console.error('❌ [CALLBACK] Welcome email send returned FALSE');
            }
          } else {
            console.warn('⚠️  [CALLBACK] No email address found for user');
          }
        } catch (emailError) {
          console.error('❌ [CALLBACK] Failed to send welcome email:', emailError);
          // Don't block the authentication flow if email fails
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      } else {
        console.log('ℹ️  [CALLBACK] Skipping welcome email:', {
          reason: !existingUserType ? 'Not a job seeker' : 'Returning user (user_type already exists)',
          userTypeFromQuery,
          existingUserType
        });
      }

      // Redirect to appropriate dashboard
      const redirectPath = userType === 'employer' ? '/employer' : '/jobseeker';
      console.log('🎯 [CALLBACK] Redirecting to:', redirectPath);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      return NextResponse.redirect(`${requestUrl.origin}${redirectPath}`);

    } catch (error) {
      console.error('❌ [CALLBACK] Session-based OAuth error:', error);
      return NextResponse.redirect(`${requestUrl.origin}/auth/error?message=${encodeURIComponent('Authentication failed')}`);
    }
  } else {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❌ [CALLBACK] No recognized parameters!');
    console.log('📍 [CALLBACK] URL:', requestUrl.toString());
    console.log('🔍 [CALLBACK] Params:', Object.fromEntries(requestUrl.searchParams.entries()));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }

  // No recognized parameters, redirect to home
  console.log('🏠 [CALLBACK] Taking FALLBACK path - redirecting to home page');
  return NextResponse.redirect(`${requestUrl.origin}/`);
}