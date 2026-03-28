import { NextRequest, NextResponse } from 'next/server';
import { processOverdueBatches, processDailyDigests } from '@/lib/email/process-email-queue';

/**
 * Cron endpoint to flush the email notification queue.
 * Runs every 15 minutes via Vercel cron.
 * Processes:
 * 1. Overdue hourly batches (scheduled_for <= now)
 * 2. Daily digest emails (once per day at the scheduled time)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron authentication
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    // Process overdue hourly batches
    const batchResult = await processOverdueBatches();

    // Process daily digests (the function checks if there are any pending)
    const digestResult = await processDailyDigests();

    return NextResponse.json({
      success: true,
      batches: {
        processed: batchResult.processedCount,
        errors: batchResult.errors.length,
      },
      digests: {
        processed: digestResult.processedCount,
        errors: digestResult.errors.length,
      },
    });
  } catch (error) {
    console.error('Error in flush-email-queue cron:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
