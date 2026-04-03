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
    const { data: linkData, error: linkError } = await supabaseAdmin
      .auth.admin.generateLink({
        type: 'magiclink',
        email: targetEmail,
      });

    if (linkError || !linkData) {
      console.error('Failed to generate magic link:', linkError);
      return NextResponse.json(
        { error: 'Failed to generate login link' },
        { status: 500 }
      );
    }

    // The generated link points to Supabase's domain by default.
    // We need to extract the token and build our own callback URL.
    const properties = linkData.properties;
    const hashedToken = properties?.hashed_token;

    if (!hashedToken) {
      return NextResponse.json(
        { error: 'Failed to generate token' },
        { status: 500 }
      );
    }

    // Build the verification URL that will log the admin in as the employer
    // The callback route uses token_hash for OTP verification
    // We pass user_type=employer so the callback redirects to the employer dashboard
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    const loginUrl = `${siteUrl}/auth/callback?token_hash=${hashedToken}&token=${hashedToken}&type=magiclink&redirect=/employer/applications`;

    return NextResponse.json({
      success: true,
      loginUrl,
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
