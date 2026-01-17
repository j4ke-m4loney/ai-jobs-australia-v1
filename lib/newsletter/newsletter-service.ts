import { createClient } from "@supabase/supabase-js";
import { contentGenerator } from "./content-generator";
import { resendService } from "../email/resend-service";
import { NewsletterEmail } from "../../emails/newsletter-template";
import { createBroadcast, sendBroadcast } from "../resend/broadcast-service";
import { getSubscriberCount } from "../resend/audience-service";
import { render } from "@react-email/render";

// Helper function to create Supabase admin client (avoids build-time initialization)
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

interface TestUser {
  id: string;
  email: string;
  first_name: string | null;
  active: boolean;
}

interface Profile {
  user_id: string;
  email: string;
  first_name: string | null;
  newsletter_subscribed: boolean;
  newsletter_unsubscribe_token: string;
}

interface Sponsor {
  id: string;
  name: string;
  logo_url: string;
  destination_url: string;
  tagline: string | null;
  hero_image_url: string | null;
  headline: string | null;
  description: string | null;
  cta_text: string;
  cta_color: string;
}

interface SendOptions {
  introText?: string;
  outroText?: string;
  sponsorId?: string | null;
  sendImmediately?: boolean; // Default true - set false to create draft broadcast
  featuredJobId?: string | null; // Optional job ID to feature prominently in the email
  showFeaturedHighlights?: boolean; // Whether to show bullet highlights in featured job card (default true)
}

export class NewsletterService {
  /**
   * Get sponsor by ID or default sponsor if no ID provided
   */
  async getSponsor(sponsorId?: string | null): Promise<Sponsor | null> {
    try {
      if (sponsorId) {
        // Fetch specific sponsor
        const { data, error } = await getSupabaseAdmin()
          .from("newsletter_sponsors")
          .select(
            "id, name, logo_url, destination_url, tagline, hero_image_url, headline, description, cta_text, cta_color"
          )
          .eq("id", sponsorId)
          .eq("is_active", true)
          .single();

        if (error) {
          console.error("[NewsletterService] Error fetching sponsor:", error);
          return null;
        }

        return data;
      } else {
        // Fetch default sponsor
        const { data, error } = await getSupabaseAdmin()
          .from("newsletter_sponsors")
          .select(
            "id, name, logo_url, destination_url, tagline, hero_image_url, headline, description, cta_text, cta_color"
          )
          .eq("is_default", true)
          .eq("is_active", true)
          .single();

        if (error) {
          // No default sponsor is fine, just return null
          return null;
        }

        return data;
      }
    } catch (error) {
      console.error("[NewsletterService] Failed to get sponsor:", error);
      return null;
    }
  }

  /**
   * Get all active test users
   */
  async getTestUsers(): Promise<TestUser[]> {
    try {
      const { data, error } = await getSupabaseAdmin()
        .from("newsletter_test_users")
        .select("id, email, first_name, active")
        .eq("active", true);

      if (error) {
        console.error("[NewsletterService] Error fetching test users:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("[NewsletterService] Failed to get test users:", error);
      throw error;
    }
  }

  /**
   * Get all users subscribed to newsletter (for future use)
   */
  async getSubscribedUsers(): Promise<Profile[]> {
    try {
      const { data, error } = await getSupabaseAdmin()
        .from("profiles")
        .select(
          "user_id, email, first_name, newsletter_subscribed, newsletter_unsubscribe_token"
        )
        .eq("newsletter_subscribed", true)
        .not("newsletter_unsubscribe_token", "is", null);

      if (error) {
        console.error(
          "[NewsletterService] Error fetching subscribed users:",
          error
        );
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(
        "[NewsletterService] Failed to get subscribed users:",
        error
      );
      throw error;
    }
  }

  /**
   * Send newsletter to test users using Resend Broadcasts
   * This allows you to see stats in Resend dashboard for test sends
   */
  async sendToTestUsers(options?: SendOptions): Promise<{
    success: boolean;
    recipientCount: number;
    jobsCount: number;
    campaignId: string | null;
    broadcastId?: string;
    isDraft?: boolean;
  }> {
    const {
      introText = "",
      outroText = "",
      sponsorId = null,
      sendImmediately = false, // Default false: Create drafts for manual review in Resend GUI
      featuredJobId = null,
      showFeaturedHighlights = true,
    } = options || {};

    try {
      console.log("[NewsletterService] Starting test newsletter broadcast...");

      // Check if test audience ID is configured
      const testAudienceId = process.env.RESEND_TEST_AUDIENCE_ID;

      if (!testAudienceId) {
        console.log(
          "[NewsletterService] RESEND_TEST_AUDIENCE_ID not set, falling back to regular audience"
        );
        // Fall back to using main audience if test audience not configured
        // This is safe because test users are in a separate table
      }

      // Get sponsor
      const sponsor = await this.getSponsor(sponsorId);

      // Get featured job if ID provided
      const featuredJob = featuredJobId
        ? await contentGenerator.getFeaturedJob(featuredJobId)
        : null;
      if (featuredJobId && featuredJob) {
        console.log(`[NewsletterService] Using featured job: ${featuredJob.title}`);
      } else if (featuredJobId && !featuredJob) {
        console.log(`[NewsletterService] Featured job not found: ${featuredJobId}`);
      }
      if (sponsor) {
        console.log(`[NewsletterService] Using sponsor: ${sponsor.name}`);
      }

      // Get test user count
      const testUsers = await this.getTestUsers();
      const testUserCount = testUsers.length;

      if (testUserCount === 0) {
        console.log("[NewsletterService] No test users found");
        return {
          success: false,
          recipientCount: 0,
          jobsCount: 0,
          campaignId: null,
        };
      }

      console.log(
        `[NewsletterService] Broadcasting to ${testUserCount} test users`
      );

      // Generate newsletter content
      const content = await contentGenerator.generateNewsletterContent({
        daysAgo: 7,
        maxPerCategory: 10,
        maxTotalJobs: 20,
      });

      if (content.totalJobsCount === 0) {
        console.log("[NewsletterService] No jobs found for newsletter");
        return {
          success: false,
          recipientCount: 0,
          jobsCount: 0,
          campaignId: null,
        };
      }

      console.log(
        `[NewsletterService] Generated content with ${content.totalJobsCount} jobs`
      );

      // Render email template to HTML with Resend placeholders
      const html = await render(
        NewsletterEmail({
          jobsByCategory: content.jobsByCategory,
          totalJobsCount: content.totalJobsCount,
          introText:
            introText || "Here are this week's latest AI jobs in Australia",
          outroText: outroText || "Good luck with your applications!",
          sponsor: sponsor,
          featuredJob: featuredJob,
          showFeaturedHighlights: showFeaturedHighlights,
        }),
        { pretty: false }
      );

      // Create subject line
      const today = new Date();
      const day = today.getDate().toString().padStart(2, "0");
      const month = today.toLocaleString("en-US", { month: "short" });
      const subject = `Your AI Jobs in Aus (${day} ${month})`;

      // Use test audience if configured, otherwise use main audience
      const audienceId = testAudienceId || process.env.RESEND_AUDIENCE_ID;

      // Debug logging
      console.log(
        "[NewsletterService] DEBUG - testAudienceId:",
        testAudienceId
      );
      console.log(
        "[NewsletterService] DEBUG - RESEND_AUDIENCE_ID:",
        process.env.RESEND_AUDIENCE_ID
      );
      console.log("[NewsletterService] DEBUG - final audienceId:", audienceId);

      if (!audienceId) {
        throw new Error(
          "RESEND_AUDIENCE_ID or RESEND_TEST_AUDIENCE_ID environment variable not set"
        );
      }

      // Create broadcast
      console.log("[NewsletterService] Creating test broadcast...");

      const broadcast = await createBroadcast({
        subject,
        from: "Jake from AI Jobs Australia <jake@aijobsaustralia.com.au>",
        reply_to: "jake@aijobsaustralia.com.au",
        html,
        audienceId,
      });

      console.log(
        `[NewsletterService] Test broadcast created: ${broadcast.id}`
      );

      // Conditionally send broadcast
      if (sendImmediately) {
        console.log("[NewsletterService] Sending test broadcast...");
        await sendBroadcast(broadcast.id);
        console.log(
          `[NewsletterService] Test broadcast sent successfully to ${testUserCount} test users`
        );
      } else {
        console.log(
          `[NewsletterService] Test broadcast created as DRAFT: ${broadcast.id}`
        );
        console.log("[NewsletterService] Preview in Resend GUI before sending");
      }

      // Only log to database if sending immediately
      // Drafts are managed in Resend GUI only
      let campaign = null;
      if (sendImmediately) {
        const { data: campaignData, error: campaignError } =
          await getSupabaseAdmin()
            .from("newsletter_campaigns")
            .insert({
              name: `Test Newsletter - ${new Date().toISOString().split("T")[0]}`,
              subject,
              recipient_count: testUserCount,
              jobs_count: content.totalJobsCount,
              status: "sent",
              sponsor_id: sponsor?.id || null,
              broadcast_id: broadcast.id, // Store Resend broadcast ID
            })
            .select()
            .single();

        if (campaignError) {
          console.error(
            "[NewsletterService] Error logging test campaign:",
            campaignError
          );
        }
        campaign = campaignData;
      } else {
        console.log(
          "[NewsletterService] Skipping database logging for draft (Resend is source of truth)"
        );
      }

      return {
        success: true,
        recipientCount: testUserCount,
        jobsCount: content.totalJobsCount,
        campaignId: campaign?.id || null,
        broadcastId: broadcast.id,
        isDraft: !sendImmediately, // Return draft status
      };
    } catch (error) {
      console.error(
        "[NewsletterService] Failed to send test newsletter:",
        error
      );
      throw error;
    }
  }

  /**
   * DEPRECATED: Old method using batch emails (no stats)
   * Kept for reference but should use sendToTestUsers() instead
   */
  async sendToTestUsersOldBatch(options?: SendOptions): Promise<{
    success: boolean;
    recipientCount: number;
    jobsCount: number;
    campaignId: string | null;
  }> {
    const { introText = "", outroText = "", sponsorId = null } = options || {};

    try {
      console.log(
        "[NewsletterService] Starting test newsletter send (old batch method)..."
      );

      // Get sponsor
      const sponsor = await this.getSponsor(sponsorId);
      if (sponsor) {
        console.log(`[NewsletterService] Using sponsor: ${sponsor.name}`);
      }

      // Get test users
      const testUsers = await this.getTestUsers();

      if (testUsers.length === 0) {
        console.log("[NewsletterService] No test users found");
        return {
          success: false,
          recipientCount: 0,
          jobsCount: 0,
          campaignId: null,
        };
      }

      console.log(`[NewsletterService] Found ${testUsers.length} test users`);

      // Generate newsletter content
      const content = await contentGenerator.generateNewsletterContent({
        daysAgo: 7,
        maxPerCategory: 10,
        maxTotalJobs: 20,
      });

      if (content.totalJobsCount === 0) {
        console.log("[NewsletterService] No jobs found for newsletter");
        return {
          success: false,
          recipientCount: 0,
          jobsCount: 0,
          campaignId: null,
        };
      }

      console.log(
        `[NewsletterService] Generated content with ${content.totalJobsCount} jobs`
      );

      // Prepare recipients with personalized data
      const recipients = testUsers.map((user) => ({
        email: user.email,
        firstName: user.first_name || "there",
      }));

      // Send emails
      const today = new Date();
      const day = today.getDate().toString().padStart(2, "0");
      const month = today.toLocaleString("en-US", { month: "short" });
      const subject = `New AI Jobs in Aus (${day} ${month})`;

      const results = await resendService.sendNewsletterBatch({
        recipients: recipients.map((r) => ({
          email: r.email,
          firstName: r.firstName,
        })),
        subject,
        reactTemplate: () =>
          NewsletterEmail({
            jobsByCategory: content.jobsByCategory,
            totalJobsCount: content.totalJobsCount,
            introText,
            outroText,
            sponsor: sponsor,
          }),
      });

      console.log(
        `[NewsletterService] Sent to ${results.totalSent} recipients in ${results.batches} batches`
      );

      // Log campaign to database
      const { data: campaign, error: campaignError } = await getSupabaseAdmin()
        .from("newsletter_campaigns")
        .insert({
          name: `Test Newsletter - ${new Date().toISOString().split("T")[0]}`,
          subject,
          recipient_count: results.totalSent,
          jobs_count: content.totalJobsCount,
          status: results.success ? "sent" : "failed",
          sponsor_id: sponsor?.id || null,
        })
        .select()
        .single();

      if (campaignError) {
        console.error(
          "[NewsletterService] Error logging campaign:",
          campaignError
        );
      }

      return {
        success: results.success,
        recipientCount: results.totalSent,
        jobsCount: content.totalJobsCount,
        campaignId: campaign?.id || null,
      };
    } catch (error) {
      console.error(
        "[NewsletterService] Failed to send test newsletter:",
        error
      );
      throw error;
    }
  }

  /**
   * Send newsletter to all subscribed users using Resend Broadcasts
   */
  async sendToAllUsers(options?: SendOptions): Promise<{
    success: boolean;
    recipientCount: number;
    jobsCount: number;
    campaignId: string | null;
    broadcastId?: string;
    isDraft?: boolean;
  }> {
    const {
      introText = "",
      outroText = "",
      sponsorId = null,
      sendImmediately = false, // Default false: Create drafts for manual review in Resend GUI
      featuredJobId = null,
      showFeaturedHighlights = true,
    } = options || {};

    try {
      console.log(
        "[NewsletterService] Starting newsletter broadcast to all users..."
      );

      // Check if RESEND_AUDIENCE_ID is configured
      if (!process.env.RESEND_AUDIENCE_ID) {
        throw new Error(
          "RESEND_AUDIENCE_ID environment variable is not set. Please run sync-resend-audience script first."
        );
      }

      // Get sponsor
      const sponsor = await this.getSponsor(sponsorId);
      if (sponsor) {
        console.log(`[NewsletterService] Using sponsor: ${sponsor.name}`);
      }

      // Get featured job if ID provided
      const featuredJob = featuredJobId
        ? await contentGenerator.getFeaturedJob(featuredJobId)
        : null;
      if (featuredJobId && featuredJob) {
        console.log(`[NewsletterService] Using featured job: ${featuredJob.title}`);
      } else if (featuredJobId && !featuredJob) {
        console.log(`[NewsletterService] Featured job not found: ${featuredJobId}`);
      }

      // Get subscriber count from local database
      const subscriberCount = await getSubscriberCount();

      if (subscriberCount === 0) {
        console.log("[NewsletterService] No subscribed users found");
        return {
          success: false,
          recipientCount: 0,
          jobsCount: 0,
          campaignId: null,
        };
      }

      console.log(
        `[NewsletterService] Broadcasting to ${subscriberCount} subscribed users`
      );

      // Generate newsletter content
      const content = await contentGenerator.generateNewsletterContent({
        daysAgo: 7,
        maxPerCategory: 10,
        maxTotalJobs: 20,
      });

      if (content.totalJobsCount === 0) {
        console.log("[NewsletterService] No jobs found for newsletter");
        return {
          success: false,
          recipientCount: 0,
          jobsCount: 0,
          campaignId: null,
        };
      }

      console.log(
        `[NewsletterService] Generated content with ${content.totalJobsCount} jobs`
      );

      // Render email template to HTML with Resend placeholders
      const html = await render(
        NewsletterEmail({
          jobsByCategory: content.jobsByCategory,
          totalJobsCount: content.totalJobsCount,
          introText,
          outroText,
          sponsor: sponsor,
          featuredJob: featuredJob,
          showFeaturedHighlights: showFeaturedHighlights,
        }),
        { pretty: false }
      );

      // Create subject line
      const today = new Date();
      const day = today.getDate().toString().padStart(2, "0");
      const month = today.toLocaleString("en-US", { month: "short" });
      const subject = `Your AI Jobs in Aus (${day} ${month})`;

      // Create broadcast
      console.log("[NewsletterService] Creating broadcast...");
      const broadcast = await createBroadcast({
        subject,
        from: "Jake from AI Jobs Australia <jake@aijobsaustralia.com.au>",
        reply_to: "jake@aijobsaustralia.com.au",
        html,
        audienceId: process.env.RESEND_AUDIENCE_ID,
      });

      console.log(`[NewsletterService] Broadcast created: ${broadcast.id}`);

      // Conditionally send broadcast
      if (sendImmediately) {
        console.log("[NewsletterService] Sending broadcast...");
        await sendBroadcast(broadcast.id);
        console.log(
          `[NewsletterService] Broadcast sent successfully to ${subscriberCount} recipients`
        );
      } else {
        console.log(
          `[NewsletterService] Broadcast created as DRAFT: ${broadcast.id}`
        );
        console.log("[NewsletterService] Preview in Resend GUI before sending");
      }

      // Only log to database if sending immediately
      // Drafts are managed in Resend GUI only
      let campaign = null;
      if (sendImmediately) {
        const { data: campaignData, error: campaignError } =
          await getSupabaseAdmin()
            .from("newsletter_campaigns")
            .insert({
              name: `Weekly Newsletter - ${new Date().toISOString().split("T")[0]}`,
              subject,
              recipient_count: subscriberCount,
              jobs_count: content.totalJobsCount,
              status: "sent",
              sponsor_id: sponsor?.id || null,
              broadcast_id: broadcast.id, // Store Resend broadcast ID
            })
            .select()
            .single();

        if (campaignError) {
          console.error(
            "[NewsletterService] Error logging campaign:",
            campaignError
          );
        }
        campaign = campaignData;
      } else {
        console.log(
          "[NewsletterService] Skipping database logging for draft (Resend is source of truth)"
        );
      }

      return {
        success: true,
        recipientCount: subscriberCount,
        jobsCount: content.totalJobsCount,
        campaignId: campaign?.id || null,
        broadcastId: broadcast.id,
        isDraft: !sendImmediately, // Return draft status
      };
    } catch (error) {
      console.error("[NewsletterService] Failed to send newsletter:", error);
      throw error;
    }
  }

  /**
   * Send an existing draft broadcast
   * Use this after previewing the broadcast in Resend GUI
   */
  async sendDraftBroadcast(campaignId: string): Promise<{
    success: boolean;
    broadcastId: string;
    recipientCount: number;
  }> {
    try {
      console.log(`[NewsletterService] Sending draft campaign: ${campaignId}`);

      // Get campaign from database
      const { data: campaign, error: fetchError } = await getSupabaseAdmin()
        .from("newsletter_campaigns")
        .select("id, broadcast_id, status, recipient_count")
        .eq("id", campaignId)
        .single();

      if (fetchError || !campaign) {
        throw new Error(`Campaign not found: ${campaignId}`);
      }

      if (!campaign.broadcast_id) {
        throw new Error(`Campaign ${campaignId} has no broadcast_id`);
      }

      if (campaign.status !== "draft") {
        throw new Error(
          `Campaign ${campaignId} is not a draft (status: ${campaign.status})`
        );
      }

      // Send the broadcast via Resend
      console.log(
        `[NewsletterService] Sending broadcast: ${campaign.broadcast_id}`
      );
      await sendBroadcast(campaign.broadcast_id);

      // Update campaign status to 'sent'
      const { error: updateError } = await getSupabaseAdmin()
        .from("newsletter_campaigns")
        .update({
          status: "sent",
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", campaignId);

      if (updateError) {
        console.error(
          `[NewsletterService] Error updating campaign status:`,
          updateError
        );
        throw updateError;
      }

      console.log(`[NewsletterService] Broadcast sent successfully`);

      return {
        success: true,
        broadcastId: campaign.broadcast_id,
        recipientCount: campaign.recipient_count,
      };
    } catch (error) {
      console.error(
        "[NewsletterService] Failed to send draft broadcast:",
        error
      );
      throw error;
    }
  }

  /**
   * List all draft campaigns
   * Useful for admin UI to show pending drafts
   */
  async listDraftCampaigns(): Promise<
    Array<{
      id: string;
      name: string;
      subject: string;
      broadcast_id: string;
      recipient_count: number;
      jobs_count: number;
      created_at: string;
      sponsor_id: string | null;
    }>
  > {
    try {
      const { data, error } = await getSupabaseAdmin()
        .from("newsletter_campaigns")
        .select(
          "id, name, subject, broadcast_id, recipient_count, jobs_count, created_at, sponsor_id"
        )
        .eq("status", "draft")
        .order("created_at", { ascending: false });

      if (error) {
        console.error(
          "[NewsletterService] Error fetching draft campaigns:",
          error
        );
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(
        "[NewsletterService] Failed to list draft campaigns:",
        error
      );
      throw error;
    }
  }

  /**
   * Send a test newsletter to a specific email
   */
  async sendTestEmail(
    email: string,
    firstName?: string,
    options?: SendOptions
  ): Promise<boolean> {
    const { introText = "", outroText = "", sponsorId = null, featuredJobId = null, showFeaturedHighlights = true } = options || {};

    try {
      console.log(`[NewsletterService] Sending test newsletter to ${email}...`);

      // Get sponsor
      const sponsor = await this.getSponsor(sponsorId);
      if (sponsor) {
        console.log(`[NewsletterService] Using sponsor: ${sponsor.name}`);
      }

      // Get featured job if ID provided
      const featuredJob = featuredJobId
        ? await contentGenerator.getFeaturedJob(featuredJobId)
        : null;
      if (featuredJobId && featuredJob) {
        console.log(`[NewsletterService] Using featured job: ${featuredJob.title}`);
      } else if (featuredJobId && !featuredJob) {
        console.log(`[NewsletterService] Featured job not found: ${featuredJobId}`);
      }

      // Generate newsletter content
      const content = await contentGenerator.generateNewsletterContent({
        daysAgo: 7,
        maxPerCategory: 10,
        maxTotalJobs: 20,
      });

      if (content.totalJobsCount === 0) {
        console.log("[NewsletterService] No jobs found for test newsletter");
        return false;
      }

      // Send test email
      const today = new Date();
      const day = today.getDate().toString().padStart(2, "0");
      const month = today.toLocaleString("en-US", { month: "short" });
      const subject = `Your AI Jobs in Aus (${day} ${month})`;

      await resendService.sendTestNewsletter({
        to: email,
        subject,
        react: NewsletterEmail({
          jobsByCategory: content.jobsByCategory,
          totalJobsCount: content.totalJobsCount,
          introText,
          outroText,
          sponsor: sponsor,
          featuredJob: featuredJob,
          showFeaturedHighlights: showFeaturedHighlights,
        }),
      });

      console.log(`[NewsletterService] Test newsletter sent to ${email}`);
      return true;
    } catch (error) {
      console.error("[NewsletterService] Failed to send test email:", error);
      return false;
    }
  }

  /**
   * Check if newsletter should be sent (enough jobs available)
   */
  async shouldSendNewsletter(minimumJobs: number = 3): Promise<boolean> {
    try {
      return await contentGenerator.hasEnoughJobs(minimumJobs);
    } catch (error) {
      console.error(
        "[NewsletterService] Error checking if newsletter should be sent:",
        error
      );
      return false;
    }
  }
}

// Export singleton instance
export const newsletterService = new NewsletterService();
