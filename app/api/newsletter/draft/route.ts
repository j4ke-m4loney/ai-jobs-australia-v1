import { NextRequest, NextResponse } from "next/server";
import { newsletterService } from "@/lib/newsletter/newsletter-service";

/**
 * POST /api/newsletter/draft
 * Creates a draft newsletter broadcast (does not send)
 *
 * Body: {
 *   secret: string,
 *   type: 'test' | 'production',
 *   introText?: string,
 *   outroText?: string,
 *   sponsorId?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { secret, type, introText, outroText, sponsorId } = body;

    // Verify secret
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate type
    if (!type || (type !== 'test' && type !== 'production')) {
      return NextResponse.json(
        { error: "Type must be 'test' or 'production'" },
        { status: 400 }
      );
    }

    console.log(`[Newsletter Draft] Creating ${type} draft broadcast...`);

    // Check if enough jobs
    const shouldSend = await newsletterService.shouldSendNewsletter(3);
    if (!shouldSend) {
      return NextResponse.json({
        success: false,
        message: "Not enough jobs available for newsletter",
      }, { status: 400 });
    }

    // Create draft (sendImmediately: false)
    const result = type === 'test'
      ? await newsletterService.sendToTestUsers({
          introText,
          outroText,
          sponsorId,
          sendImmediately: false,  // Create as draft
        })
      : await newsletterService.sendToAllUsers({
          introText,
          outroText,
          sponsorId,
          sendImmediately: false,  // Create as draft
        });

    if (result.success) {
      console.log(`[Newsletter Draft] Draft created: ${result.broadcastId}`);
      return NextResponse.json({
        success: true,
        message: "Draft broadcast created successfully",
        campaignId: result.campaignId,
        broadcastId: result.broadcastId,
        recipientCount: result.recipientCount,
        jobsCount: result.jobsCount,
        isDraft: result.isDraft,
        resendUrl: `https://resend.com/broadcasts/${result.broadcastId}`,
      });
    }

    return NextResponse.json(
      { success: false, message: "Failed to create draft" },
      { status: 500 }
    );
  } catch (error) {
    console.error("[Newsletter Draft] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to create draft",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/newsletter/draft?secret=xxx
 * Lists all draft broadcasts
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");

    // Verify secret
    if (secret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const drafts = await newsletterService.listDraftCampaigns();

    return NextResponse.json({
      success: true,
      count: drafts.length,
      drafts: drafts.map(draft => ({
        ...draft,
        resendUrl: `https://resend.com/broadcasts/${draft.broadcast_id}`,
      })),
    });
  } catch (error) {
    console.error("[Newsletter Draft] Error listing drafts:", error);
    return NextResponse.json(
      {
        error: "Failed to list drafts",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
