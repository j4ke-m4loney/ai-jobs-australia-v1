#!/usr/bin/env tsx

/**
 * Script to create and send New Year 2026 broadcast email to Resend
 *
 * This script will:
 * 1. Render the New Year email template to HTML
 * 2. Create a broadcast in Resend (as draft by default)
 * 3. Output the broadcast ID to review in Resend dashboard
 *
 * Usage:
 *   npm run send-new-year-broadcast           # Create as draft (default)
 *   npm run send-new-year-broadcast --send    # Send immediately
 *
 * Note: Environment variables are loaded via tsx --env-file flag in package.json
 */

import { render } from "@react-email/render";
import { createBroadcast, sendBroadcast } from "../lib/resend/broadcast-service";
import { getSubscriberCount } from "../lib/resend/audience-service";
import NewYear2026Email from "../emails/new-year-2026";

async function main() {
  console.log('\n🎉 New Year 2026 Broadcast Email\n');
  console.log('='.repeat(50));

  // Check for --send flag
  const sendImmediately = process.argv.includes('--send');

  try {
    // Step 1: Check if RESEND_AUDIENCE_ID is configured
    console.log('\n📊 Step 1: Checking configuration...');

    if (!process.env.RESEND_AUDIENCE_ID) {
      throw new Error(
        'RESEND_AUDIENCE_ID environment variable is not set. Please run sync-resend-audience script first.'
      );
    }

    const subscriberCount = await getSubscriberCount();
    console.log(`✅ Found ${subscriberCount} subscribers in audience`);

    if (subscriberCount === 0) {
      console.log('⚠️  No subscribers found. Exiting.');
      process.exit(0);
    }

    // Step 2: Render email template to HTML
    console.log('\n📧 Step 2: Rendering email template...');
    const html = await render(NewYear2026Email(), { pretty: false });
    console.log('✅ Email rendered to HTML');

    // Step 3: Create broadcast
    console.log('\n📤 Step 3: Creating broadcast in Resend...');

    const subject = 'Happy New Year from AI Jobs Australia! 🎉';

    const broadcast = await createBroadcast({
      subject,
      from: 'Jake from AI Jobs Australia <jake@aijobsaustralia.com.au>',
      reply_to: 'jake@aijobsaustralia.com.au',
      html,
      audienceId: process.env.RESEND_AUDIENCE_ID,
    });

    console.log(`✅ Broadcast created: ${broadcast.id}`);

    // Step 4: Conditionally send broadcast
    if (sendImmediately) {
      console.log('\n🚀 Step 4: Sending broadcast immediately...');
      await sendBroadcast(broadcast.id);
      console.log(`✅ Broadcast sent to ${subscriberCount} subscribers!`);
    } else {
      console.log('\n✅ Broadcast created as DRAFT');
    }

    // Step 5: Display results and next steps
    console.log('\n' + '='.repeat(50));
    console.log('\n📊 Summary:\n');
    console.log(`  Subject: ${subject}`);
    console.log(`  Broadcast ID: ${broadcast.id}`);
    console.log(`  Recipients: ${subscriberCount}`);
    console.log(`  Status: ${sendImmediately ? 'SENT' : 'DRAFT'}`);

    if (!sendImmediately) {
      console.log('\n' + '='.repeat(50));
      console.log('\n📝 Next Steps:\n');
      console.log('1. Preview the broadcast in your Resend dashboard:');
      console.log('   https://resend.com/broadcasts\n');
      console.log('2. To send the broadcast, either:');
      console.log('   a) Click "Send" in the Resend dashboard, or');
      console.log(`   b) Run: npm run send-new-year-broadcast --send\n`);
    }

    console.log('='.repeat(50) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error);
    console.error('\nPlease check the error message above and try again.');
    process.exit(1);
  }
}

// Run the main function
main();
