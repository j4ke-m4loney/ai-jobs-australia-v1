import { createClient } from "@supabase/supabase-js";
import { contentGenerator } from "./content-generator";
import { resendService } from "../email/resend-service";
import { NewsletterEmail } from "../../emails/newsletter-template";

// Server-side Supabase client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

export class NewsletterService {
  /**
   * Get all active test users
   */
  async getTestUsers(): Promise<TestUser[]> {
    try {
      const { data, error } = await supabaseAdmin
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
      const { data, error } = await supabaseAdmin
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
   * Send newsletter to test users
   */
  async sendToTestUsers(options?: {
    introText?: string;
    outroText?: string;
  }): Promise<{
    success: boolean;
    recipientCount: number;
    jobsCount: number;
    campaignId: string | null;
  }> {
    const { introText = "", outroText = "" } = options || {};

    try {
      console.log("[NewsletterService] Starting test newsletter send...");

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
        maxPerCategory: 5,
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
        // For test users, we'll use their ID as the unsubscribe token
        // In production, we'll use the actual newsletter_unsubscribe_token from profiles
        unsubscribeToken: user.id,
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
          unsubscribeToken: r.unsubscribeToken,
        })),
        subject,
        reactTemplate: (recipientData) => NewsletterEmail({
          recipientName: recipientData.firstName,
          jobsByCategory: content.jobsByCategory,
          totalJobsCount: content.totalJobsCount,
          unsubscribeToken: recipientData.unsubscribeToken,
          introText,
          outroText,
        }),
      });

      console.log(
        `[NewsletterService] Sent to ${results.totalSent} recipients in ${results.batches} batches`
      );

      // Log campaign to database
      const { data: campaign, error: campaignError } = await supabaseAdmin
        .from("newsletter_campaigns")
        .insert({
          name: `Test Newsletter - ${new Date().toISOString().split("T")[0]}`,
          subject,
          recipient_count: results.totalSent,
          jobs_count: content.totalJobsCount,
          status: results.success ? "sent" : "failed",
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
   * Send newsletter to all subscribed users (for future use)
   */
  async sendToAllUsers(options?: {
    introText?: string;
    outroText?: string;
  }): Promise<{
    success: boolean;
    recipientCount: number;
    jobsCount: number;
    campaignId: string | null;
  }> {
    const { introText = "", outroText = "" } = options || {};

    try {
      console.log(
        "[NewsletterService] Starting newsletter send to all users..."
      );

      // Get subscribed users
      const users = await this.getSubscribedUsers();

      if (users.length === 0) {
        console.log("[NewsletterService] No subscribed users found");
        return {
          success: false,
          recipientCount: 0,
          jobsCount: 0,
          campaignId: null,
        };
      }

      console.log(`[NewsletterService] Found ${users.length} subscribed users`);

      // Generate newsletter content
      const content = await contentGenerator.generateNewsletterContent({
        daysAgo: 7,
        maxPerCategory: 5,
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
      const recipients = users.map((user) => ({
        email: user.email,
        firstName: user.first_name || "there",
        unsubscribeToken: user.newsletter_unsubscribe_token,
      }));

      // Send emails
      const today = new Date();
      const day = today.getDate().toString().padStart(2, "0");
      const month = today.toLocaleString("en-US", { month: "short" });
      const subject = `Your AI Jobs in Aus (${day} ${month})`;

      const results = await resendService.sendNewsletterBatch({
        recipients: recipients.map((r) => ({
          email: r.email,
          firstName: r.firstName,
          unsubscribeToken: r.unsubscribeToken,
        })),
        subject,
        reactTemplate: (recipientData) => NewsletterEmail({
          recipientName: recipientData.firstName,
          jobsByCategory: content.jobsByCategory,
          totalJobsCount: content.totalJobsCount,
          unsubscribeToken: recipientData.unsubscribeToken,
          introText,
          outroText,
        }),
      });

      console.log(
        `[NewsletterService] Sent to ${results.totalSent} recipients in ${results.batches} batches`
      );

      // Log campaign to database
      const { data: campaign, error: campaignError } = await supabaseAdmin
        .from("newsletter_campaigns")
        .insert({
          name: `Weekly Newsletter - ${new Date().toISOString().split("T")[0]}`,
          subject,
          recipient_count: results.totalSent,
          jobs_count: content.totalJobsCount,
          status: results.success ? "sent" : "failed",
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
      console.error("[NewsletterService] Failed to send newsletter:", error);
      throw error;
    }
  }

  /**
   * Send a test newsletter to a specific email
   */
  async sendTestEmail(
    email: string,
    firstName?: string,
    options?: {
      introText?: string;
      outroText?: string;
    }
  ): Promise<boolean> {
    const { introText = "", outroText = "" } = options || {};

    try {
      console.log(`[NewsletterService] Sending test newsletter to ${email}...`);

      // Generate newsletter content
      const content = await contentGenerator.generateNewsletterContent({
        daysAgo: 7,
        maxPerCategory: 5,
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
          recipientName: firstName || "there",
          jobsByCategory: content.jobsByCategory,
          totalJobsCount: content.totalJobsCount,
          unsubscribeToken: "test-token", // Test token
          introText,
          outroText,
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
