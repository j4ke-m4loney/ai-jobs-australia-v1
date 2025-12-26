#!/usr/bin/env tsx

/**
 * One-time sync script to migrate existing newsletter subscribers to Resend Audiences
 *
 * This script will:
 * 1. Create a new audience in Resend
 * 2. Sync all subscribed users from local database to Resend
 * 3. Output the audience ID to add to .env file
 *
 * Usage: npm run sync-resend-audience
 *
 * Note: Environment variables are loaded via tsx --env-file flag in package.json
 */

import {
  createNewsletterAudience,
  syncSubscribersToAudience,
  getSubscriberCount,
} from '../lib/resend/audience-service';

async function main() {
  console.log('\n🚀 Starting Resend Audience Sync\n');
  console.log('='.repeat(50));

  try {
    // Step 1: Check current subscriber count
    console.log('\n📊 Step 1: Checking subscriber count...');
    const count = await getSubscriberCount();
    console.log(`Found ${count} subscribed users in local database`);

    if (count === 0) {
      console.log('⚠️  No subscribers found. Exiting.');
      process.exit(0);
    }

    // Step 2: Get or create audience in Resend
    let audienceId: string;

    if (process.env.RESEND_AUDIENCE_ID) {
      console.log('\n🎯 Step 2: Using existing audience from .env...');
      audienceId = process.env.RESEND_AUDIENCE_ID;
      console.log(`✅ Using audience ID: ${audienceId}`);
    } else {
      console.log('\n🎯 Step 2: Creating new audience in Resend...');
      audienceId = await createNewsletterAudience('AI Jobs Australia Newsletter');
      console.log(`✅ Audience created with ID: ${audienceId}`);
    }

    // Step 3: Sync subscribers to audience
    console.log('\n📤 Step 3: Syncing subscribers to Resend...');
    console.log('This may take a few minutes...\n');

    const result = await syncSubscribersToAudience(audienceId);

    // Step 4: Display results
    console.log('\n' + '='.repeat(50));
    console.log('\n📈 Sync Results:\n');
    console.log(`  Total subscribers: ${count}`);
    console.log(`  Successfully synced: ${result.syncedCount}`);
    console.log(`  Failed: ${result.failedCount}`);

    if (result.errors.length > 0) {
      console.log('\n❌ Errors:');
      result.errors.forEach((err) => {
        console.log(`  - ${err.email}: ${err.error}`);
      });
    }

    // Step 5: Next steps
    console.log('\n' + '='.repeat(50));
    console.log('\n✅ Sync Complete!\n');
    console.log('📝 Next Steps:\n');
    console.log('1. Add the following to your .env file:');
    console.log(`   RESEND_AUDIENCE_ID=${audienceId}\n`);
    console.log('2. Verify the audience in your Resend dashboard:');
    console.log('   https://resend.com/audiences\n');
    console.log('3. Continue with the migration by running the next migration step');
    console.log('   to add broadcast_id column to newsletter_campaigns table\n');
    console.log('='.repeat(50) + '\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during sync:', error);
    console.error('\nPlease check the error message above and try again.');
    process.exit(1);
  }
}

// Run the main function
main();
