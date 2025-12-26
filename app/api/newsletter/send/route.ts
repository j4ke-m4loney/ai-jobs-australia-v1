import { NextRequest, NextResponse } from "next/server";
import { newsletterService } from "@/lib/newsletter/newsletter-service";

/**
 * Create DRAFT newsletter broadcast in Resend (does not send automatically)
 * Changed from automated sends to manual review workflow
 *
 * Protected by CRON_SECRET for security
 * After creation, review draft in Resend GUI and send manually
 *
 * POST /api/newsletter/send
 */
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret - accept via Authorization header OR query parameter
    const authHeader = request.headers.get("authorization");
    const { searchParams } = new URL(request.url);
    const secretParam = searchParams.get("secret");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("[Newsletter Send] CRON_SECRET not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Check authentication via multiple methods:
    // 1. Authorization header (for curl/API requests)
    // 2. Query parameter (for Vercel cron/manual triggers)
    // 3. Vercel cron header (automatic from Vercel infrastructure)
    const isValidAuth =
      authHeader === `Bearer ${cronSecret}` ||
      secretParam === cronSecret ||
      (process.env.VERCEL_ENV === 'production' && request.headers.get('user-agent')?.includes('vercel'));

    if (!isValidAuth) {
      console.error("[Newsletter Send] Unauthorized request", {
        hasAuthHeader: !!authHeader,
        hasSecretParam: !!secretParam,
        userAgent: request.headers.get('user-agent'),
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Newsletter Send] Starting scheduled newsletter send...");

    // Parse request body for optional parameters
    let body: { introText?: string; outroText?: string; sponsorId?: string | null } = {};
    try {
      const text = await request.text();
      if (text) {
        body = JSON.parse(text);
      }
    } catch {
      // Ignore parse errors, use defaults
    }

    // ========================================
    // Newsletter intro/outro text
    // ========================================
    const introText = body.introText ||
      "Here are the latest AI job opportunities posted this week in Australia.";
    const outroText = body.outroText || "Good luck with your applications! - Jake";
    // ========================================

    // ========================================
    // Sponsor configuration (optional)
    // If sponsorId is provided, use that sponsor
    // Otherwise, default sponsor will be used (if configured)
    // With multi-placement design, sponsor appears in 3 locations automatically
    // ========================================
    const sponsorId = body.sponsorId || null;
    // ========================================

    // Check if newsletter should be sent (enough jobs available)
    const shouldSend = await newsletterService.shouldSendNewsletter(3);

    if (!shouldSend) {
      console.log("[Newsletter Send] Not enough jobs for newsletter");
      return NextResponse.json({
        success: false,
        message: "Not enough jobs available for newsletter",
        recipientCount: 0,
        jobsCount: 0,
      });
    }

    // Send newsletter to all subscribed users
    const result = await newsletterService.sendToAllUsers({
      introText,
      outroText,
      sponsorId,
    });

    if (result.success) {
      console.log(
        `[Newsletter Send] Successfully sent to ${result.recipientCount} recipients`
      );
      return NextResponse.json({
        success: true,
        message: "Newsletter sent successfully",
        recipientCount: result.recipientCount,
        jobsCount: result.jobsCount,
        campaignId: result.campaignId,
      });
    } else {
      console.error("[Newsletter Send] Failed to send newsletter");
      return NextResponse.json(
        {
          success: false,
          message: "Failed to send newsletter",
          recipientCount: 0,
          jobsCount: 0,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("[Newsletter Send] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to send newsletter",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint for manual draft creation (admin only)
 * Creates newsletter DRAFT in Resend - review in GUI before sending
 * Can be triggered from browser for manual draft creation
 */
export async function GET(request: NextRequest) {
  try {
    // Accept authentication via query param OR Vercel infrastructure
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("[Newsletter Send GET] CRON_SECRET not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // Check authentication via multiple methods (same as POST)
    const isValidAuth =
      secret === cronSecret ||
      (process.env.VERCEL_ENV === 'production' && request.headers.get('user-agent')?.includes('vercel'));

    if (!isValidAuth) {
      console.error("[Newsletter Send GET] Unauthorized request", {
        hasSecret: !!secret,
        userAgent: request.headers.get('user-agent'),
      });
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Detect if this is from Vercel cron (send to all) or manual testing (send to test users)
    const isVercelCron = request.headers.get('user-agent')?.includes('vercel');

    if (isVercelCron) {
      console.log("[Newsletter Send] Triggered by Vercel cron via GET...");
    } else {
      console.log("[Newsletter Send] Manual trigger via GET...");
    }

    // ========================================
    // Newsletter intro/outro text
    // ========================================
    const introText = isVercelCron
      ? "Here are the latest AI job opportunities posted this week in Australia."
      : "Here are this week's latest AI jobs in Australia...";
    const outroText = "Good luck with your applications! - Jake";
    // ========================================

    // ========================================
    // Sponsor configuration (optional from query params)
    // With multi-placement design, sponsor appears in 3 locations automatically
    // ========================================
    const sponsorId = searchParams.get("sponsorId") || null;
    // ========================================

    const shouldSend = await newsletterService.shouldSendNewsletter(3);

    if (!shouldSend) {
      return NextResponse.json({
        success: false,
        message: "Not enough jobs available for newsletter",
      });
    }

    // If triggered by Vercel cron, send to all users; otherwise send to test users
    const result = isVercelCron
      ? await newsletterService.sendToAllUsers({ introText, outroText, sponsorId })
      : await newsletterService.sendToTestUsers({ introText, outroText, sponsorId });

    return NextResponse.json({
      success: result.success,
      message: result.success
        ? "Newsletter sent successfully"
        : "Failed to send newsletter",
      recipientCount: result.recipientCount,
      jobsCount: result.jobsCount,
      campaignId: result.campaignId,
    });
  } catch (error) {
    console.error("[Newsletter Send] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to send newsletter",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
