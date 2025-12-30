import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

// Helper function to create Supabase admin client
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(req: NextRequest) {
  try {
    console.log("[Resend Webhook] Received webhook request");

    // 1. Get raw body and signature
    const body = await req.text();
    const signature = req.headers.get("svix-signature");

    console.log("[Resend Webhook] Signature present:", !!signature);

    // 2. Verify webhook signature
    const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("[Resend Webhook] RESEND_WEBHOOK_SECRET not configured");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    if (!verifySignature(body, signature, webhookSecret)) {
      console.error("[Resend Webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    console.log("[Resend Webhook] Signature verified");

    // 3. Parse payload
    const event = JSON.parse(body);

    console.log("[Resend Webhook] Event type:", event.type);

    // 4. Handle event types
    switch (event.type) {
      case "email.bounced":
        if (event.data?.bounce_type === "hard") {
          console.log(
            "[Resend Webhook] Processing hard bounce for:",
            event.data.email
          );
          await handleUnsubscribe(event.data.email, "hard_bounce");
        } else {
          console.log(
            "[Resend Webhook] Soft bounce ignored for:",
            event.data.email
          );
        }
        break;

      case "email.complained":
        console.log(
          "[Resend Webhook] Processing spam complaint for:",
          event.data.email
        );
        await handleUnsubscribe(event.data.email, "spam_complaint");
        break;

      case "contact.deleted":
        console.log(
          "[Resend Webhook] Processing contact deletion for:",
          event.data.email
        );
        await handleUnsubscribe(event.data.email, "resend_unsubscribe");
        break;

      default:
        console.log(
          "[Resend Webhook] Unhandled event type:",
          event.type,
          "- ignoring"
        );
    }

    console.log("[Resend Webhook] Event processed successfully");
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Resend Webhook] Error processing webhook:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}

async function handleUnsubscribe(email: string, reason: string) {
  try {
    const supabase = getSupabaseAdmin();

    const { error } = await supabase
      .from("profiles")
      .update({ newsletter_subscribed: false })
      .eq("email", email);

    if (error) {
      console.error(`[Resend Webhook] Failed to unsubscribe ${email}:`, error);
      throw error;
    }

    console.log(`[Resend Webhook] Unsubscribed ${email} (reason: ${reason})`);
  } catch (error) {
    console.error(
      `[Resend Webhook] Exception handling unsubscribe for ${email}:`,
      error
    );
    throw error;
  }
}

function verifySignature(
  body: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature || !secret) {
    console.log(
      "[Resend Webhook] Missing signature or secret:",
      !!signature,
      !!secret
    );
    return false;
  }

  try {
    // Resend uses Svix for webhook signatures
    // Signature header format: "v1,t=timestamp,v1=signature"
    const parts = signature.split(",");
    const timestamp = parts.find((p) => p.startsWith("t="))?.slice(2);
    const sig = parts.find((p) => p.startsWith("v1="))?.slice(3);

    if (!timestamp || !sig) {
      console.log(
        "[Resend Webhook] Invalid signature format:",
        !!timestamp,
        !!sig
      );
      return false;
    }

    // Create signed payload
    const signedPayload = `${timestamp}.${body}`;
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(signedPayload)
      .digest("base64");

    // Use timing-safe comparison
    return crypto.timingSafeEqual(
      Buffer.from(sig),
      Buffer.from(expectedSig)
    );
  } catch (error) {
    console.error("[Resend Webhook] Error verifying signature:", error);
    return false;
  }
}
