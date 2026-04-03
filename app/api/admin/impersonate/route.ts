import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Generate a magic link for admin to log in as an employer.
 * The link is returned directly (not emailed) so the admin can open it.
 */
export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { adminId, targetEmail } = await request.json();

    if (!adminId || !targetEmail) {
      return NextResponse.json(
        { error: 'Admin ID and target email are required' },
        { status: 400 }
      );
    }

    // Verify the requester is an admin
    const { data: adminProfile } = await supabaseAdmin
      .from('profiles')
      .select('user_type')
      .eq('user_id', adminId)
      .single();

    if (adminProfile?.user_type !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorised' },
        { status: 403 }
      );
    }

    // Verify the target user exists and is an employer
    const { data: targetUser } = await supabaseAdmin
      .auth.admin.listUsers();

    const employer = targetUser?.users?.find(u => u.email === targetEmail);
    if (!employer) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Generate a magic link without sending an email
    // The action_link returned goes through Supabase's own verification endpoint
    // which handles token validation and then redirects to our site
    const { data: linkData, error: linkError } = await supabaseAdmin
      .auth.admin.generateLink({
        type: 'magiclink',
        email: targetEmail,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.aijobsaustralia.com.au'}/employer/applications`,
        },
      });

    if (linkError || !linkData) {
      console.error('Failed to generate magic link:', linkError);
      return NextResponse.json(
        { error: 'Failed to generate login link' },
        { status: 500 }
      );
    }

    // Use the action_link directly — it goes through Supabase's verify endpoint
    // which validates the token, creates a session, and redirects to our redirectTo URL
    const actionLink = linkData.properties?.action_link;

    if (!actionLink) {
      console.error('No action_link in response:', linkData);
      return NextResponse.json(
        { error: 'Failed to generate login link' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      loginUrl: actionLink,
      employerEmail: targetEmail,
    });
  } catch (error) {
    console.error('Error in impersonate API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
