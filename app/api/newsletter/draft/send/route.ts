import { NextRequest, NextResponse } from "next/server";
import { newsletterService } from "@/lib/newsletter/newsletter-service";

/**
 * POST /api/newsletter/draft/send
 * Sends an existing draft broadcast
 *
 * Body: { campaignId: string, secret: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId, secret } = body;

    // Verify secret
    if (secret !== process.env.CRON_SECRET) {
      console.error("[Newsletter Draft Send] Unauthorized request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate campaignId
    if (!campaignId || typeof campaignId !== 'string') {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    console.log(`[Newsletter Draft Send] Sending draft campaign: ${campaignId}`);

    const result = await newsletterService.sendDraftBroadcast(campaignId);

    if (result.success) {
      console.log(`[Newsletter Draft Send] Successfully sent broadcast: ${result.broadcastId}`);
      return NextResponse.json({
        success: true,
        message: "Draft broadcast sent successfully",
        broadcastId: result.broadcastId,
        recipientCount: result.recipientCount,
      });
    }

    return NextResponse.json(
      { success: false, message: "Failed to send draft" },
      { status: 500 }
    );
  } catch (error) {
    console.error("[Newsletter Draft Send] Error:", error);
    return NextResponse.json(
      {
        error: "Failed to send draft",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
