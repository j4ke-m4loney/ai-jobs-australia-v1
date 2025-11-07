import { Resend } from 'resend';

// Initialize Resend client with API key
const resend = new Resend(process.env.RESEND_API_KEY);

export class ResendService {
  /**
   * Send newsletter email to a single recipient
   */
  async sendNewsletterEmail(params: {
    to: string;
    subject: string;
    react: React.ReactElement;
  }) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'AI Jobs Australia <newsletter@updates.aijobsaustralia.com.au>',
        to: params.to,
        subject: params.subject,
        react: params.react,
      });

      if (error) {
        console.error('[ResendService] Error sending newsletter:', error);
        throw error;
      }

      console.log(`[ResendService] Newsletter sent successfully to ${params.to}`, data);
      return { success: true, data };
    } catch (error) {
      console.error('[ResendService] Failed to send newsletter:', error);
      throw error;
    }
  }

  /**
   * Send newsletter emails in batch
   * Resend allows up to 100 emails per batch request
   */
  async sendNewsletterBatch(params: {
    recipients: Array<{ email: string; firstName?: string }>;
    subject: string;
    react: React.ReactElement;
  }) {
    const { recipients, subject, react } = params;

    try {
      // Split into batches of 100 (Resend limit)
      const batchSize = 100;
      const batches = [];

      for (let i = 0; i < recipients.length; i += batchSize) {
        batches.push(recipients.slice(i, i + batchSize));
      }

      const results = [];

      for (const batch of batches) {
        const emails = batch.map(recipient => ({
          from: 'AI Jobs Australia <newsletter@updates.aijobsaustralia.com.au>',
          to: recipient.email,
          subject: subject,
          react: react,
        }));

        const { data, error } = await resend.batch.send(emails);

        if (error) {
          console.error('[ResendService] Batch send error:', error);
          throw error;
        }

        results.push(data);
        console.log(`[ResendService] Batch sent successfully: ${batch.length} emails`);
      }

      return {
        success: true,
        totalSent: recipients.length,
        batches: results.length,
      };
    } catch (error) {
      console.error('[ResendService] Failed to send batch:', error);
      throw error;
    }
  }

  /**
   * Send test newsletter to a single email
   */
  async sendTestNewsletter(params: {
    to: string;
    subject: string;
    react: React.ReactElement;
  }) {
    console.log(`[ResendService] Sending test newsletter to ${params.to}`);
    return this.sendNewsletterEmail(params);
  }
}

// Export singleton instance
export const resendService = new ResendService();
