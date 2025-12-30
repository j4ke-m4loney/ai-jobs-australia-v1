#!/usr/bin/env tsx

/**
 * Sync unsubscribe status from Resend to database
 * What the Script Does

  1. Fetches all contacts from your Resend audiences (both main and test)
  2. Identifies which contacts have unsubscribed: true in Resend
  3. Updates your database to set newsletter_subscribed: false for those emails
  4. Shows a summary of what was synced
 *
 * This script fetches all contacts from Resend audiences and updates
 * the database to match Resend's subscription status.
 *
 * Usage:
 *   npx tsx scripts/sync-unsubscribes-from-resend.ts
 *
 * Use cases:
 * - One-time migration/reconciliation
 * - Periodic sync as backup to webhooks
 * - Moving from Resend to another provider
 */

import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";
import type { Contact } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Create Supabase admin client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function syncUnsubscribesFromResend() {
  console.log("🔄 Starting sync of unsubscribe status from Resend...\n");

  // Get all audience IDs to sync
  const audienceIds = [
    process.env.RESEND_AUDIENCE_ID,
    process.env.RESEND_TEST_AUDIENCE_ID,
  ].filter(Boolean) as string[];

  if (audienceIds.length === 0) {
    console.error(
      "❌ No audience IDs configured. Set RESEND_AUDIENCE_ID in .env"
    );
    process.exit(1);
  }

  console.log(`📋 Syncing ${audienceIds.length} audience(s):\n`);

  let totalUnsubscribed = 0;
  let totalErrors = 0;
  let totalProcessed = 0;

  for (const audienceId of audienceIds) {
    console.log(`\n📊 Processing audience: ${audienceId}`);

    try {
      // Fetch all contacts from this audience
      const { data, error } = await resend.contacts.list({ audienceId });

      if (error) {
        console.error(`❌ Error fetching contacts from Resend:`, error);
        totalErrors++;
        continue;
      }

      if (!data?.data || data.data.length === 0) {
        console.log("   No contacts found in this audience");
        continue;
      }

      console.log(`   Found ${data.data.length} contacts`);

      // Filter contacts that are unsubscribed in Resend
      const unsubscribedContacts = data.data.filter(
        (contact: Contact) => contact.unsubscribed === true
      );

      console.log(
        `   ${unsubscribedContacts.length} are unsubscribed in Resend`
      );

      if (unsubscribedContacts.length === 0) {
        console.log("   ✅ No unsubscribes to sync");
        continue;
      }

      // Update database for each unsubscribed contact
      for (const contact of unsubscribedContacts) {
        totalProcessed++;

        const { error: updateError } = await supabase
          .from("profiles")
          .update({ newsletter_subscribed: false })
          .eq("email", contact.email);

        if (updateError) {
          console.error(
            `   ❌ Failed to update ${contact.email}:`,
            updateError.message
          );
          totalErrors++;
        } else {
          console.log(`   ✅ Unsubscribed ${contact.email}`);
          totalUnsubscribed++;
        }

        // Rate limiting - wait 100ms between updates
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error(`❌ Error processing audience ${audienceId}:`, error);
      totalErrors++;
    }
  }

  // Summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 Sync Summary:");
  console.log("=".repeat(60));
  console.log(`✅ Successfully unsubscribed: ${totalUnsubscribed}`);
  console.log(`❌ Errors: ${totalErrors}`);
  console.log(`📋 Total processed: ${totalProcessed}`);
  console.log("=".repeat(60) + "\n");

  if (totalErrors > 0) {
    console.log("⚠️  Some errors occurred. Check logs above for details.\n");
    process.exit(1);
  } else {
    console.log("✨ Sync completed successfully!\n");
    process.exit(0);
  }
}

// Run the sync
syncUnsubscribesFromResend().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
