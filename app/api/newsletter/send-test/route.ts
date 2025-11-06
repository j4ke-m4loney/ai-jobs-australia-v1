import { NextRequest, NextResponse } from 'next/server';
import { newsletterService } from '@/lib/newsletter/newsletter-service';

/**
 * Send a test newsletter to a specific email
 * Useful for testing the newsletter design and content
 *
 * POST /api/newsletter/send-test
 * Body: { email: string, firstName?: string, secret: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, secret } = body;

    // Verify secret (same as CRON_SECRET for simplicity)
    if (secret !== process.env.CRON_SECRET) {
      console.error('[Newsletter Test] Unauthorized request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    console.log(`[Newsletter Test] Sending test newsletter to ${email}...`);

    const success = await newsletterService.sendTestEmail(email, firstName);

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Test newsletter sent to ${email}`,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Failed to send test newsletter',
      }, { status: 500 });
    }
  } catch (error) {
    console.error('[Newsletter Test] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send test newsletter',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
