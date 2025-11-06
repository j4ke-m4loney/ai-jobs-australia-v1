import { NextRequest, NextResponse } from 'next/server';
import { newsletterService } from '@/lib/newsletter/newsletter-service';

/**
 * Send newsletter to test users (or all users in production)
 * Protected by CRON_SECRET to ensure only Vercel Cron can trigger
 *
 * POST /api/newsletter/send
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('[Newsletter Send] CRON_SECRET not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('[Newsletter Send] Unauthorized request');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Newsletter Send] Starting scheduled newsletter send...');

    // Check if newsletter should be sent (enough jobs available)
    const shouldSend = await newsletterService.shouldSendNewsletter(3);

    if (!shouldSend) {
      console.log('[Newsletter Send] Not enough jobs for newsletter');
      return NextResponse.json({
        success: false,
        message: 'Not enough jobs available for newsletter',
        recipientCount: 0,
        jobsCount: 0,
      });
    }

    // Send newsletter to test users
    // TODO: Change to sendToAllUsers() when ready for production
    const result = await newsletterService.sendToTestUsers();

    if (result.success) {
      console.log(`[Newsletter Send] Successfully sent to ${result.recipientCount} recipients`);
      return NextResponse.json({
        success: true,
        message: 'Newsletter sent successfully',
        recipientCount: result.recipientCount,
        jobsCount: result.jobsCount,
        campaignId: result.campaignId,
      });
    } else {
      console.error('[Newsletter Send] Failed to send newsletter');
      return NextResponse.json({
        success: false,
        message: 'Failed to send newsletter',
        recipientCount: 0,
        jobsCount: 0,
      }, { status: 500 });
    }
  } catch (error) {
    console.error('[Newsletter Send] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send newsletter',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for manual testing (admin only)
 * Can be used to manually trigger newsletter send from browser
 */
export async function GET(request: NextRequest) {
  try {
    // For manual testing, we'll add a simple query param authentication
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');

    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Newsletter Send] Manual trigger via GET...');

    const shouldSend = await newsletterService.shouldSendNewsletter(3);

    if (!shouldSend) {
      return NextResponse.json({
        success: false,
        message: 'Not enough jobs available for newsletter',
      });
    }

    const result = await newsletterService.sendToTestUsers();

    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Newsletter sent successfully' : 'Failed to send newsletter',
      recipientCount: result.recipientCount,
      jobsCount: result.jobsCount,
      campaignId: result.campaignId,
    });
  } catch (error) {
    console.error('[Newsletter Send] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to send newsletter',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
