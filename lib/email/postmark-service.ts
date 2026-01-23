import { ServerClient, Models } from "postmark";

// Initialize Postmark client only on server-side where environment variables are available
const postmarkClient =
  typeof window === "undefined" && process.env.POSTMARK_SERVER_TOKEN
    ? new ServerClient(process.env.POSTMARK_SERVER_TOKEN)
    : null;

// DEBUG: Diagnostic logging for email service initialization
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔧 [EMAIL SERVICE] Initializing Postmark service...');
console.log('🔧 [EMAIL SERVICE] Running on server-side:', typeof window === "undefined");
console.log('🔧 [EMAIL SERVICE] POSTMARK_SERVER_TOKEN exists:', !!process.env.POSTMARK_SERVER_TOKEN);
console.log('🔧 [EMAIL SERVICE] POSTMARK_SERVER_TOKEN value:',
  process.env.POSTMARK_SERVER_TOKEN
    ? `${process.env.POSTMARK_SERVER_TOKEN.substring(0, 10)}...`
    : 'MISSING'
);
console.log('🔧 [EMAIL SERVICE] Postmark client created:', !!postmarkClient);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

// Helper function to check if email service is available
function isEmailServiceAvailable(): boolean {
  console.log('🔍 [EMAIL SERVICE] Checking availability...');
  console.log('🔍 [EMAIL SERVICE] postmarkClient exists:', !!postmarkClient);
  console.log('🔍 [EMAIL SERVICE] Running on server:', typeof window === "undefined");
  console.log('🔍 [EMAIL SERVICE] Token available:', !!process.env.POSTMARK_SERVER_TOKEN);

  if (!postmarkClient) {
    console.warn(
      "⚠️  [EMAIL SERVICE] Email service NOT AVAILABLE - running on client-side or missing POSTMARK_SERVER_TOKEN"
    );
    return false;
  }

  console.log('✅ [EMAIL SERVICE] Email service IS AVAILABLE!');
  return true;
}

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface JobApplicationEmailData {
  employerName: string;
  employerEmail: string;
  jobTitle: string;
  jobId: string;
  applicantName: string;
  applicantEmail: string;
  applicationDate: string;
  dashboardUrl: string;
}

export interface ApplicationStatusEmailData {
  applicantName: string;
  applicantEmail: string;
  jobTitle: string;
  companyName: string;
  status: "viewed" | "accepted" | "rejected";
  statusMessage?: string;
}

export interface JobStatusEmailData {
  employerName: string;
  employerEmail: string;
  jobTitle: string;
  jobId: string;
  status: "approved" | "rejected";
  rejectionReason?: string;
  dashboardUrl: string;
}

export interface JobSubmissionEmailData {
  employerName: string;
  employerEmail: string;
  jobTitle: string;
  jobId: string;
  companyName: string;
  location: string;
  pricingTier: string;
  dashboardUrl: string;
}

export interface JobResubmissionEmailData {
  employerName: string;
  employerEmail: string;
  jobTitle: string;
  jobId: string;
  companyName: string;
  location: string;
  changesDescription: string;
  dashboardUrl: string;
}

export interface BatchedApplicationEmailData {
  employerName: string;
  employerEmail: string;
  jobTitle: string;
  jobId: string;
  applicationCount: number;
  applicantNames: string[];
  timeFrame: string;
  dashboardUrl: string;
}

export interface ContactFormEmailData {
  firstName: string;
  lastName: string;
  email: string;
  subject: string;
  message: string;
}

export interface JobSeekerWelcomeEmailData {
  recipientEmail: string;
  recipientName: string;
  profileUrl: string;
  dashboardUrl: string;
}

export class PostmarkEmailService {
  private static instance: PostmarkEmailService;

  private constructor() {}

  public static getInstance(): PostmarkEmailService {
    if (!PostmarkEmailService.instance) {
      PostmarkEmailService.instance = new PostmarkEmailService();
    }
    return PostmarkEmailService.instance;
  }

  /**
   * Send email notification to employer when someone applies to their job
   */
  async sendJobApplicationNotification(
    data: JobApplicationEmailData
  ): Promise<boolean> {
    if (!isEmailServiceAvailable()) {
      return false;
    }

    try {
      await postmarkClient!.sendEmail({
        From: "AI Jobs Australia <noreply@aijobsaustralia.com.au>",
        To: data.employerEmail,
        Subject: `New Application: ${data.jobTitle}`,
        HtmlBody: this.getApplicationNotificationHtml(data),
        TextBody: this.getApplicationNotificationText(data),
        Tag: "job-application",
        TrackOpens: true,
        TrackLinks: Models.LinkTrackingOptions.HtmlAndText,
      });

      console.log(
        `✅ Application notification sent to ${data.employerEmail} for job: ${data.jobTitle}`
      );
      return true;
    } catch (error) {
      console.error("❌ Failed to send job application notification:", error);
      return false;
    }
  }

  /**
   * Send email notification to job seeker when application status changes
   */
  async sendApplicationStatusUpdate(
    data: ApplicationStatusEmailData
  ): Promise<boolean> {
    if (!isEmailServiceAvailable()) {
      return false;
    }

    try {
      const subject = this.getStatusUpdateSubject(data.status, data.jobTitle);

      await postmarkClient!.sendEmail({
        From: "AI Jobs Australia <noreply@aijobsaustralia.com.au>",
        To: data.applicantEmail,
        Subject: subject,
        HtmlBody: this.getStatusUpdateHtml(data),
        TextBody: this.getStatusUpdateText(data),
        Tag: "application-status",
        TrackOpens: true,
        TrackLinks: Models.LinkTrackingOptions.HtmlAndText,
      });

      console.log(
        `✅ Status update sent to ${data.applicantEmail} for status: ${data.status}`
      );
      return true;
    } catch (error) {
      console.error("❌ Failed to send application status update:", error);
      return false;
    }
  }

  /**
   * Send email notification to employer when job status changes (approved/rejected by admin)
   */
  async sendJobStatusUpdate(data: JobStatusEmailData): Promise<boolean> {
    if (!isEmailServiceAvailable()) {
      return false;
    }

    try {
      const subject =
        data.status === "approved"
          ? `Your job posting is now live: ${data.jobTitle}`
          : `Job posting requires attention: ${data.jobTitle}`;

      await postmarkClient!.sendEmail({
        From: "AI Jobs Australia <noreply@aijobsaustralia.com.au>",
        To: data.employerEmail,
        Subject: subject,
        HtmlBody: this.getJobStatusUpdateHtml(data),
        TextBody: this.getJobStatusUpdateText(data),
        Tag: "job-status",
        TrackOpens: true,
        TrackLinks: Models.LinkTrackingOptions.HtmlAndText,
      });

      console.log(
        `✅ Job status update sent to ${data.employerEmail} for status: ${data.status}`
      );
      return true;
    } catch (error) {
      console.error("❌ Failed to send job status update:", error);
      return false;
    }
  }

  /**
   * Send email confirmation to employer when job is submitted for approval
   */
  async sendJobSubmissionConfirmation(
    data: JobSubmissionEmailData
  ): Promise<boolean> {
    if (!isEmailServiceAvailable()) {
      return false;
    }

    try {
      await postmarkClient!.sendEmail({
        From: "AI Jobs Australia <noreply@aijobsaustralia.com.au>",
        To: data.employerEmail,
        Subject: `Job Submitted for Approval: ${data.jobTitle}`,
        HtmlBody: this.getJobSubmissionHtml(data),
        TextBody: this.getJobSubmissionText(data),
        Tag: "job-submission",
        TrackOpens: true,
        TrackLinks: Models.LinkTrackingOptions.HtmlAndText,
      });

      console.log(
        `✅ Job submission confirmation sent to ${data.employerEmail} for job: ${data.jobTitle}`
      );
      return true;
    } catch (error) {
      console.error("❌ Failed to send job submission confirmation:", error);
      return false;
    }
  }

  /**
   * Send email confirmation to employer when edited job is resubmitted for approval
   */
  async sendJobResubmissionConfirmation(
    data: JobResubmissionEmailData
  ): Promise<boolean> {
    if (!isEmailServiceAvailable()) {
      return false;
    }

    try {
      await postmarkClient!.sendEmail({
        From: "AI Jobs Australia <noreply@aijobsaustralia.com.au>",
        To: data.employerEmail,
        Subject: `Job Changes Under Review: ${data.jobTitle}`,
        HtmlBody: this.getJobResubmissionHtml(data),
        TextBody: this.getJobResubmissionText(data),
        Tag: "job-resubmission",
        TrackOpens: true,
        TrackLinks: Models.LinkTrackingOptions.HtmlAndText,
      });

      console.log(
        `✅ Job resubmission confirmation sent to ${data.employerEmail} for job: ${data.jobTitle}`
      );
      return true;
    } catch (error) {
      console.error("❌ Failed to send job resubmission confirmation:", error);
      return false;
    }
  }

  /**
   * Test email sending (useful for debugging)
   */
  async sendTestEmail(to: string): Promise<boolean> {
    if (!isEmailServiceAvailable()) {
      return false;
    }

    try {
      await postmarkClient!.sendEmail({
        From: "AI Jobs Australia <noreply@aijobsaustralia.com.au>",
        To: to,
        Subject: "Test Email from AI Jobs Australia",
        HtmlBody:
          "<p>This is a test email to verify Postmark integration is working correctly.</p>",
        TextBody:
          "This is a test email to verify Postmark integration is working correctly.",
        Tag: "test",
      });

      console.log(`✅ Test email sent to ${to}`);
      return true;
    } catch (error) {
      console.error("❌ Failed to send test email:", error);
      return false;
    }
  }

  /**
   * Send contact form submission email
   */
  async sendContactFormEmail(data: ContactFormEmailData): Promise<boolean> {
    if (!isEmailServiceAvailable()) {
      return false;
    }

    try {
      await postmarkClient!.sendEmail({
        From: "AI Jobs Australia <noreply@aijobsaustralia.com.au>",
        To: "hello@aijobsaustralia.com.au",
        ReplyTo: data.email,
        Subject: `Contact Form: ${data.subject}`,
        HtmlBody: this.getContactFormHtml(data),
        TextBody: this.getContactFormText(data),
        Tag: "contact-form",
        TrackOpens: true,
        TrackLinks: Models.LinkTrackingOptions.None,
      });

      console.log(`✅ Contact form email sent from ${data.email}`);
      return true;
    } catch (error) {
      console.error("❌ Failed to send contact form email:", error);
      return false;
    }
  }

  /**
   * Send welcome email to new job seekers after Google OAuth sign-in
   */
  async sendJobSeekerWelcomeEmail(
    data: JobSeekerWelcomeEmailData
  ): Promise<boolean> {
    if (!isEmailServiceAvailable()) {
      return false;
    }

    try {
      await postmarkClient!.sendEmail({
        From: "AI Jobs Australia <noreply@aijobsaustralia.com.au>",
        To: data.recipientEmail,
        Subject: "Welcome to AI Jobs Australia - Complete Your Profile",
        HtmlBody: this.getJobSeekerWelcomeEmailHtml(data),
        TextBody: this.getJobSeekerWelcomeEmailText(data),
        Tag: "welcome-job-seeker",
        TrackOpens: true,
        TrackLinks: Models.LinkTrackingOptions.HtmlAndText,
      });

      console.log(
        `✅ Welcome email sent to new job seeker: ${data.recipientEmail}`
      );
      return true;
    } catch (error) {
      console.error("❌ Failed to send welcome email:", error);
      return false;
    }
  }

  // Private helper methods for email content

  private getApplicationNotificationHtml(
    data: JobApplicationEmailData
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Job Application - AI Jobs Australia</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="padding: 24px 30px; border-bottom: 1px solid #e5e5e5; text-align: center;">
              <img src="https://aijobsaustralia.com.au/aja-email-192.png" alt="AI Jobs Australia" style="height: 36px; width: auto; vertical-align: middle;" />
              <span style="font-size: 18px; font-weight: 600; color: #333; margin-left: 12px; vertical-align: middle;">AI Jobs Australia</span>
            </div>

            <div style="padding: 30px; font-size: 14px;">
              <p style="color: #666; margin: 0 0 20px 0; text-align: center;">New Job Application</p>

              <p style="margin: 0 0 16px 0;">Hello ${data.employerName},</p>
              <p style="margin: 0 0 20px 0;">You have received a new application for your job posting.</p>

              <div style="background: #f9fafb; padding: 20px; border-radius: 6px; border-left: 3px solid #2563eb; margin-bottom: 24px;">
                <p style="margin: 0 0 12px 0; font-weight: 600; color: #333;">${data.jobTitle}</p>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0; color: #666; width: 80px;">Applicant:</td>
                    <td style="padding: 8px 0; color: #333;">${data.applicantName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Email:</td>
                    <td style="padding: 8px 0;"><a href="mailto:${data.applicantEmail}" style="color: #2563eb; text-decoration: none;">${data.applicantEmail}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Applied:</td>
                    <td style="padding: 8px 0; color: #333;">${data.applicationDate}</td>
                  </tr>
                </table>
              </div>

              <div style="text-align: center;">
                <a href="${data.dashboardUrl}"
                   style="background: #2563eb;
                          color: white;
                          padding: 12px 24px;
                          text-decoration: none;
                          border-radius: 5px;
                          font-weight: 600;
                          display: inline-block;
                          font-size: 14px;">
                  View Application
                </a>
              </div>
            </div>

            <div style="padding: 20px 30px; background: #f9fafb; border-top: 1px solid #e5e5e5; font-size: 12px; color: #666;">
              <p style="margin: 0;">You're receiving this email because you have an active job posting on AI Jobs Australia.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getApplicationNotificationText(
    data: JobApplicationEmailData
  ): string {
    return `
      AI Jobs Australia - New Job Application

      Hello ${data.employerName},

      You have received a new application for your job posting:

      Job Title: ${data.jobTitle}
      Applicant: ${data.applicantName}
      Email: ${data.applicantEmail}
      Applied: ${data.applicationDate}

      View the full application in your dashboard:
      ${data.dashboardUrl}

      You're receiving this email because you have an active job posting on AI Jobs Australia.
      You can manage your notification preferences in your account settings.
    `;
  }

  private getStatusUpdateSubject(status: string, jobTitle: string): string {
    switch (status) {
      case "viewed":
        return `Application Viewed: ${jobTitle}`;
      case "accepted":
        return `Congratulations! Application Accepted: ${jobTitle}`;
      case "rejected":
        return `Application Update: ${jobTitle}`;
      default:
        return `Application Status Update: ${jobTitle}`;
    }
  }

  private getStatusUpdateHtml(data: ApplicationStatusEmailData): string {
    const statusColor =
      data.status === "accepted"
        ? "#10b981"
        : data.status === "rejected"
        ? "#ef4444"
        : "#6b7280";

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Application Status Update - AI Jobs Australia</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="padding: 24px 30px; border-bottom: 1px solid #e5e5e5; text-align: center;">
              <img src="https://aijobsaustralia.com.au/aja-email-192.png" alt="AI Jobs Australia" style="height: 36px; width: auto; vertical-align: middle;" />
              <span style="font-size: 18px; font-weight: 600; color: #333; margin-left: 12px; vertical-align: middle;">AI Jobs Australia</span>
            </div>

            <div style="padding: 30px; font-size: 14px;">
              <p style="color: #666; margin: 0 0 20px 0; text-align: center;">Application Status Update</p>

              <p style="margin: 0 0 16px 0;">Hello ${data.applicantName},</p>
              <p style="margin: 0 0 20px 0;">Your application status has been updated.</p>

              <div style="background: #f9fafb; padding: 20px; border-radius: 6px; border-left: 3px solid ${statusColor}; margin-bottom: 24px;">
                <p style="margin: 0 0 12px 0; font-weight: 600; color: #333;">${data.jobTitle}</p>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0; color: #666; width: 80px;">Company:</td>
                    <td style="padding: 8px 0; color: #333;">${data.companyName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Status:</td>
                    <td style="padding: 8px 0;"><span style="color: ${statusColor}; font-weight: 600;">${
      data.status.charAt(0).toUpperCase() + data.status.slice(1)
    }</span></td>
                  </tr>
                  ${
                    data.statusMessage
                      ? `<tr>
                    <td style="padding: 8px 0; color: #666;">Message:</td>
                    <td style="padding: 8px 0; color: #333;">${data.statusMessage}</td>
                  </tr>`
                      : ""
                  }
                </table>
              </div>
            </div>

            <div style="padding: 20px 30px; background: #f9fafb; border-top: 1px solid #e5e5e5; font-size: 12px; color: #666;">
              <p style="margin: 0;">You're receiving this email because you applied for a job on AI Jobs Australia.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getStatusUpdateText(data: ApplicationStatusEmailData): string {
    return `
      AI Jobs Australia - Application Status Update

      Hello ${data.applicantName},

      Your application status has been updated:

      Job Title: ${data.jobTitle}
      Company: ${data.companyName}
      Status: ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}
      ${data.statusMessage ? `Message: ${data.statusMessage}` : ""}

      You're receiving this email because you applied for a job on AI Jobs Australia.
      You can manage your notification preferences in your account settings.
    `;
  }

  private getJobStatusUpdateHtml(data: JobStatusEmailData): string {
    const statusColor = data.status === "approved" ? "#10b981" : "#ef4444";

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Job Status Update - AI Jobs Australia</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="padding: 24px 30px; border-bottom: 1px solid #e5e5e5; text-align: center;">
              <img src="https://aijobsaustralia.com.au/aja-email-192.png" alt="AI Jobs Australia" style="height: 36px; width: auto; vertical-align: middle;" />
              <span style="font-size: 18px; font-weight: 600; color: #333; margin-left: 12px; vertical-align: middle;">AI Jobs Australia</span>
            </div>

            <div style="padding: 30px; font-size: 14px;">
              <p style="color: #666; margin: 0 0 20px 0; text-align: center;">Job Status Update</p>

              <p style="margin: 0 0 16px 0;">Hello ${data.employerName},</p>
              <p style="margin: 0 0 20px 0;">Your job posting status has been updated.</p>

              <div style="background: #f9fafb; padding: 20px; border-radius: 6px; border-left: 3px solid ${statusColor}; margin-bottom: 24px;">
                <p style="margin: 0 0 12px 0; font-weight: 600; color: #333;">${data.jobTitle}</p>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0; color: #666; width: 80px;">Status:</td>
                    <td style="padding: 8px 0;"><span style="color: ${statusColor}; font-weight: 600;">${
      data.status.charAt(0).toUpperCase() + data.status.slice(1)
    }</span></td>
                  </tr>
                  ${
                    data.rejectionReason
                      ? `<tr>
                    <td style="padding: 8px 0; color: #666;">Reason:</td>
                    <td style="padding: 8px 0; color: #333;">${data.rejectionReason}</td>
                  </tr>`
                      : ""
                  }
                </table>
              </div>

              <p style="margin: 0 0 24px 0;">${
                data.status === "approved"
                  ? "Congratulations! Your job is now live and visible to job seekers."
                  : "Please review the feedback and make necessary changes before resubmitting."
              }</p>

              <div style="text-align: center;">
                <a href="${data.dashboardUrl}"
                   style="background: #2563eb;
                          color: white;
                          padding: 12px 24px;
                          text-decoration: none;
                          border-radius: 5px;
                          font-weight: 600;
                          display: inline-block;
                          font-size: 14px;">
                  View in Dashboard
                </a>
              </div>
            </div>

            <div style="padding: 20px 30px; background: #f9fafb; border-top: 1px solid #e5e5e5; font-size: 12px; color: #666;">
              <p style="margin: 0;">You're receiving this email because you have posted a job on AI Jobs Australia.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getJobStatusUpdateText(data: JobStatusEmailData): string {
    return `
      AI Jobs Australia - Job Status Update

      Hello ${data.employerName},

      Your job posting status has been updated:

      Job Title: ${data.jobTitle}
      Status: ${data.status.charAt(0).toUpperCase() + data.status.slice(1)}
      ${data.rejectionReason ? `Reason: ${data.rejectionReason}` : ""}

      ${
        data.status === "approved"
          ? "Congratulations! Your job is now live and visible to job seekers."
          : "Please review the feedback and make necessary changes before resubmitting."
      }

      View your job in the dashboard:
      ${data.dashboardUrl}

      You're receiving this email because you have posted a job on AI Jobs Australia.
      You can manage your notification preferences in your account settings.
    `;
  }

  private getJobSubmissionHtml(data: JobSubmissionEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Job Submitted for Approval - AI Jobs Australia</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="padding: 24px 30px; border-bottom: 1px solid #e5e5e5; text-align: center;">
              <img src="https://aijobsaustralia.com.au/aja-email-192.png" alt="AI Jobs Australia" style="height: 36px; width: auto; vertical-align: middle;" />
              <span style="font-size: 18px; font-weight: 600; color: #333; margin-left: 12px; vertical-align: middle;">AI Jobs Australia</span>
            </div>

            <div style="padding: 30px; font-size: 14px;">
              <p style="color: #666; margin: 0 0 20px 0; text-align: center;">Job Submission Confirmed</p>

              <p style="margin: 0 0 16px 0;">Hello ${data.employerName},</p>
              <p style="margin: 0 0 20px 0;">Thank you for posting a job with AI Jobs Australia. Your job posting has been submitted and is now in our review queue.</p>

              <div style="background: #f9fafb; padding: 20px; border-radius: 6px; border-left: 3px solid #2563eb; margin-bottom: 24px;">
                <p style="margin: 0 0 12px 0; font-weight: 600; color: #333;">${data.jobTitle}</p>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0; color: #666; width: 80px;">Company:</td>
                    <td style="padding: 8px 0; color: #333;">${data.companyName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Location:</td>
                    <td style="padding: 8px 0; color: #333;">${data.location}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Plan:</td>
                    <td style="padding: 8px 0; color: #333;">${
                      data.pricingTier.charAt(0).toUpperCase() +
                      data.pricingTier.slice(1)
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Status:</td>
                    <td style="padding: 8px 0;"><span style="color: #f59e0b; font-weight: 600;">Pending Approval</span></td>
                  </tr>
                </table>
              </div>

              <div style="background: #f9fafb; padding: 20px; border-radius: 6px; margin-bottom: 24px;">
                <p style="margin: 0 0 12px 0; font-weight: 600; color: #333;">What Happens Next:</p>
                <ul style="color: #555; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 6px;">Our team will review your job posting within 24-48 hours</li>
                  <li style="margin-bottom: 6px;">We'll check for quality, compliance, and completeness</li>
                  <li style="margin-bottom: 6px;">You'll receive an email notification once approved</li>
                  <li style="margin-bottom: 0;">Your job will then go live on our platform</li>
                </ul>
              </div>

              <div style="text-align: center;">
                <a href="${data.dashboardUrl}"
                   style="background: #2563eb;
                          color: white;
                          padding: 12px 24px;
                          text-decoration: none;
                          border-radius: 5px;
                          font-weight: 600;
                          display: inline-block;
                          font-size: 14px;">
                  View Job Status
                </a>
              </div>
            </div>

            <div style="padding: 20px 30px; background: #f9fafb; border-top: 1px solid #e5e5e5; font-size: 12px; color: #666;">
              <p style="margin: 0;">Need to make changes? You can edit your job posting in your dashboard while it's pending approval.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getJobSubmissionText(data: JobSubmissionEmailData): string {
    return `
      AI Jobs Australia - Job Submission Confirmed

      Hello ${data.employerName},

      Thank you for posting a job with AI Jobs Australia! Your job posting has been successfully submitted and is now in our review queue.

      Job Details:
      Title: ${data.jobTitle}
      Company: ${data.companyName}
      Location: ${data.location}
      Plan: ${
        data.pricingTier.charAt(0).toUpperCase() + data.pricingTier.slice(1)
      }
      Status: Pending Approval

      What Happens Next?
      - Our team will review your job posting within 24-48 hours
      - We'll check for quality, compliance, and completeness
      - You'll receive an email notification once approved
      - Your job will then go live on our platform

      View your job status in the dashboard:
      ${data.dashboardUrl}

      Need to make changes? You can edit your job posting in your dashboard while it's pending approval.

      Questions? Contact our support team - we're here to help!
      You can manage your notification preferences in your account settings.
    `;
  }

  private getJobResubmissionHtml(data: JobResubmissionEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Job Changes Under Review - AI Jobs Australia</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="padding: 24px 30px; border-bottom: 1px solid #e5e5e5; text-align: center;">
              <img src="https://aijobsaustralia.com.au/aja-email-192.png" alt="AI Jobs Australia" style="height: 36px; width: auto; vertical-align: middle;" />
              <span style="font-size: 18px; font-weight: 600; color: #333; margin-left: 12px; vertical-align: middle;">AI Jobs Australia</span>
            </div>

            <div style="padding: 30px; font-size: 14px;">
              <p style="color: #666; margin: 0 0 20px 0; text-align: center;">Job Changes Under Review</p>

              <p style="margin: 0 0 16px 0;">Hello ${data.employerName},</p>
              <p style="margin: 0 0 20px 0;">Your recent changes to the job posting have been saved and are now under review.</p>

              <div style="background: #f9fafb; padding: 20px; border-radius: 6px; border-left: 3px solid #f59e0b; margin-bottom: 24px;">
                <p style="margin: 0 0 12px 0; font-weight: 600; color: #333;">${data.jobTitle}</p>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 8px 0; color: #666; width: 80px;">Company:</td>
                    <td style="padding: 8px 0; color: #333;">${data.companyName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Location:</td>
                    <td style="padding: 8px 0; color: #333;">${data.location}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Changes:</td>
                    <td style="padding: 8px 0; color: #333;">${data.changesDescription}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #666;">Status:</td>
                    <td style="padding: 8px 0;"><span style="color: #f59e0b; font-weight: 600;">Under Review</span></td>
                  </tr>
                </table>
              </div>

              <div style="background: #f9fafb; padding: 20px; border-radius: 6px; margin-bottom: 24px;">
                <p style="margin: 0 0 12px 0; font-weight: 600; color: #333;">What Happens Next:</p>
                <ul style="color: #555; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 6px;">Our team will review your changes within 24-48 hours</li>
                  <li style="margin-bottom: 6px;">We'll check for quality, compliance, and completeness</li>
                  <li style="margin-bottom: 6px;">You'll receive an email notification once approved</li>
                  <li style="margin-bottom: 0;">Your updated job will then go live on our platform</li>
                </ul>
                <p style="color: #666; margin: 16px 0 0 0; font-size: 13px;">Note: Minor changes like company info and application method are already live. Only significant content changes require review.</p>
              </div>

              <div style="text-align: center;">
                <a href="${data.dashboardUrl}"
                   style="background: #2563eb;
                          color: white;
                          padding: 12px 24px;
                          text-decoration: none;
                          border-radius: 5px;
                          font-weight: 600;
                          display: inline-block;
                          font-size: 14px;">
                  View Job Status
                </a>
              </div>
            </div>

            <div style="padding: 20px 30px; background: #f9fafb; border-top: 1px solid #e5e5e5; font-size: 12px; color: #666;">
              <p style="margin: 0;">Need to make more changes? You can continue editing in your dashboard while it's under review.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getJobResubmissionText(data: JobResubmissionEmailData): string {
    return `
      AI Jobs Australia - Job Changes Under Review

      Hello ${data.employerName},

      Your recent changes to the job posting have been successfully saved and are now under review.

      Job Details:
      Title: ${data.jobTitle}
      Company: ${data.companyName}
      Location: ${data.location}
      Changes: ${data.changesDescription}
      Status: Under Review

      What Happens Next?
      - Our team will review your changes within 24-48 hours
      - We'll check for quality, compliance, and completeness
      - You'll receive an email notification once approved
      - Your updated job will then go live on our platform

      Note: Minor changes like company info and application method are already live.
      Only significant content changes require review.

      View your job status in the dashboard:
      ${data.dashboardUrl}

      Need to make more changes? You can continue editing your job posting in your dashboard while it's under review.

      Questions? Contact our support team - we're here to help!
      You can manage your notification preferences in your account settings.
    `;
  }

  /**
   * Send batched email notification to employer for multiple applications
   */
  async sendBatchedApplicationNotification(
    data: BatchedApplicationEmailData
  ): Promise<boolean> {
    if (!isEmailServiceAvailable()) {
      return false;
    }

    try {
      await postmarkClient!.sendEmail({
        From: "AI Jobs Australia <noreply@aijobsaustralia.com.au>",
        To: data.employerEmail,
        Subject: `${data.applicationCount} new applications: ${data.jobTitle}`,
        HtmlBody: this.getBatchedApplicationNotificationHtml(data),
        TextBody: this.getBatchedApplicationNotificationText(data),
        Tag: "batch-job-application",
        TrackOpens: true,
        TrackLinks: Models.LinkTrackingOptions.None,
        MessageStream: "outbound",
      });

      console.log(
        `✅ Batched application notification sent to ${data.employerEmail} for ${data.applicationCount} applications`
      );
      return true;
    } catch (error) {
      console.error("Failed to send batched application notification:", error);
      return false;
    }
  }

  private getBatchedApplicationNotificationHtml(
    data: BatchedApplicationEmailData
  ): string {
    const applicantList = data.applicantNames
      .map(
        (name, index) =>
          `<li style="padding: 6px 0; color: #333;">${index + 1}. ${name}</li>`
      )
      .join("");

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Applications - AI Jobs Australia</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="padding: 24px 30px; border-bottom: 1px solid #e5e5e5; text-align: center;">
              <img src="https://aijobsaustralia.com.au/aja-email-192.png" alt="AI Jobs Australia" style="height: 36px; width: auto; vertical-align: middle;" />
              <span style="font-size: 18px; font-weight: 600; color: #333; margin-left: 12px; vertical-align: middle;">AI Jobs Australia</span>
            </div>

            <div style="padding: 30px; font-size: 14px;">
              <p style="color: #666; margin: 0 0 20px 0; text-align: center;">${data.applicationCount} New Applications</p>

              <p style="margin: 0 0 16px 0;">Hello ${data.employerName},</p>
              <p style="margin: 0 0 20px 0;">You've received <strong>${data.applicationCount} new applications</strong> for your job posting ${data.timeFrame}.</p>

              <div style="background: #f9fafb; padding: 20px; border-radius: 6px; border-left: 3px solid #10b981; margin-bottom: 24px;">
                <p style="margin: 0 0 12px 0; font-weight: 600; color: #333;">${data.jobTitle}</p>
                <p style="margin: 0 0 8px 0; color: #666;">New Applicants:</p>
                <ul style="list-style: none; padding: 0; margin: 0;">
                  ${applicantList}
                </ul>
              </div>

              <p style="margin: 0 0 24px 0; color: #666; font-size: 13px;">Tip: Review applications quickly to maintain candidate engagement. The best candidates often have multiple opportunities.</p>

              <div style="text-align: center;">
                <a href="${data.dashboardUrl}?job=${data.jobId}"
                   style="background: #2563eb;
                          color: white;
                          padding: 12px 24px;
                          text-decoration: none;
                          border-radius: 5px;
                          font-weight: 600;
                          display: inline-block;
                          font-size: 14px;">
                  Review Applications
                </a>
              </div>
            </div>

            <div style="padding: 20px 30px; background: #f9fafb; border-top: 1px solid #e5e5e5; font-size: 12px; color: #666;">
              <p style="margin: 0;">We group multiple applications to prevent inbox flooding. Adjust preferences in your dashboard settings.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getBatchedApplicationNotificationText(
    data: BatchedApplicationEmailData
  ): string {
    const applicantList = data.applicantNames
      .map((name, index) => `${index + 1}. ${name}`)
      .join("\n");

    return `
      AI Jobs Australia - New Job Applications

      Hello ${data.employerName},

      Great news! You've received ${data.applicationCount} new applications for your job posting ${data.timeFrame}.

      Job: ${data.jobTitle}

      New Applicants:
      ${applicantList}

      Tip: Review applications quickly to maintain candidate engagement.
      The best candidates often have multiple opportunities!

      Review applications: ${data.dashboardUrl}?job=${data.jobId}

      Email Batching Active:
      To prevent inbox flooding, we group multiple applications and send you updates when you receive 5+ applications
      or after 1 hour (whichever comes first). You can adjust these preferences in your dashboard settings.

      Questions? Contact our support team - we're here to help!
      You can manage your notification preferences in your account settings.
    `;
  }

  private getContactFormHtml(data: ContactFormEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Contact Form Submission - AI Jobs Australia</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="padding: 24px 30px; border-bottom: 1px solid #e5e5e5; text-align: center;">
              <img src="https://aijobsaustralia.com.au/aja-email-192.png" alt="AI Jobs Australia" style="height: 36px; width: auto; vertical-align: middle;" />
              <span style="font-size: 18px; font-weight: 600; color: #333; margin-left: 12px; vertical-align: middle;">AI Jobs Australia</span>
            </div>

            <div style="padding: 30px;">
              <p style="color: #666; font-size: 14px; margin: 0 0 20px 0;">Contact Form Submission</p>

              <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 14px;">
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666; width: 70px; vertical-align: top;">Name:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333;">${data.firstName} ${data.lastName}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666; vertical-align: top;">Email:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><a href="mailto:${data.email}" style="color: #2563eb; text-decoration: none;">${data.email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #666; vertical-align: top;">Subject:</td>
                  <td style="padding: 10px 0; border-bottom: 1px solid #eee; color: #333;">${data.subject}</td>
                </tr>
              </table>

              <div style="background: #f9fafb; padding: 20px; border-radius: 6px; border-left: 3px solid #2563eb; font-size: 14px;">
                <p style="margin: 0 0 8px 0; font-weight: 600; color: #333;">Message:</p>
                <p style="white-space: pre-wrap; margin: 0; color: #555;">${data.message}</p>
              </div>
            </div>

            <div style="padding: 20px 30px; background: #f9fafb; border-top: 1px solid #e5e5e5; font-size: 12px; color: #666;">
              <p style="margin: 0;">Reply directly to this email to respond to ${data.firstName}.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getContactFormText(data: ContactFormEmailData): string {
    return `
      AI Jobs Australia - Contact Form Submission

      New Message from ${data.firstName} ${data.lastName}

      Name: ${data.firstName} ${data.lastName}
      Email: ${data.email}
      Subject: ${data.subject}

      Message:
      ${data.message}

      ---
      This message was sent via the contact form on AI Jobs Australia.
      You can reply directly to this email to respond to ${data.firstName}.
    `;
  }

  private getJobSeekerWelcomeEmailHtml(
    data: JobSeekerWelcomeEmailData
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to AI Jobs Australia</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
          <div style="background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
            <div style="padding: 24px 30px; border-bottom: 1px solid #e5e5e5; text-align: center;">
              <img src="https://aijobsaustralia.com.au/aja-email-192.png" alt="AI Jobs Australia" style="height: 36px; width: auto; vertical-align: middle;" />
              <span style="font-size: 18px; font-weight: 600; color: #333; margin-left: 12px; vertical-align: middle;">AI Jobs Australia</span>
            </div>

            <div style="padding: 30px; font-size: 14px;">
              <p style="color: #666; margin: 0 0 20px 0; text-align: center;">Welcome to AI Jobs Australia!</p>

              <p style="margin: 0 0 16px 0;">Hi ${data.recipientName},</p>
              <p style="margin: 0 0 16px 0;">Thank you for joining AI Jobs Australia. We're here to help you find your next opportunity in Australia's AI industry.</p>
              <p style="margin: 0 0 24px 0;">Your account is ready. Complete your profile to get the most out of your experience.</p>

              <div style="background: #f9fafb; padding: 20px; border-radius: 6px; border-left: 3px solid #2563eb; margin-bottom: 24px;">
                <p style="margin: 0 0 12px 0; font-weight: 600; color: #333;">Complete Your Profile:</p>
                <ul style="color: #555; margin: 0; padding-left: 20px;">
                  <li style="margin-bottom: 6px;">Add your full name</li>
                  <li style="margin-bottom: 6px;">Set your location</li>
                  <li style="margin-bottom: 6px;">List your AI skills</li>
                  <li style="margin-bottom: 6px;">Add a bio about your experience</li>
                  <li style="margin-bottom: 0;">Upload your resume (optional)</li>
                </ul>
              </div>

              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${data.profileUrl}"
                   style="background: #2563eb;
                          color: white;
                          padding: 12px 24px;
                          text-decoration: none;
                          border-radius: 5px;
                          font-weight: 600;
                          display: inline-block;
                          font-size: 14px;">
                  Complete Your Profile
                </a>
              </div>

              <div style="text-align: center;">
                <a href="${data.dashboardUrl}" style="color: #2563eb; text-decoration: none; font-size: 14px;">Browse Jobs →</a>
              </div>
            </div>

            <div style="padding: 20px 30px; background: #f9fafb; border-top: 1px solid #e5e5e5; font-size: 12px; color: #666;">
              <p style="margin: 0;">Questions? Contact us at hello@aijobsaustralia.com.au</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private getJobSeekerWelcomeEmailText(
    data: JobSeekerWelcomeEmailData
  ): string {
    return `
      Welcome to AI Jobs Australia! 👋

      Hi ${data.recipientName}!

      Thank you for joining AI Jobs Australia! We're excited to help you find your next opportunity in Australia's thriving AI industry.

      Your account is ready, but there's one more step to get the most out of your experience...

      📝 COMPLETE YOUR PROFILE

      Take a few minutes to complete your profile so employers can find you and you can apply for jobs with one click.

      Profile Checklist:
      ✅ Add your full name
      ✅ Set your location (where you want to work)
      ✅ List your AI skills (Python, TensorFlow, etc.)
      ✅ Add a bio about your experience
      ✅ Upload your resume (optional but recommended)

      Complete your profile: ${data.profileUrl}

      💡 WHY COMPLETE YOUR PROFILE?

      • Get discovered by top AI companies
      • Apply faster with one-click applications
      • Better job matches based on your skills
      • Stand out from other candidates

      Ready to explore AI jobs in Australia?
      Browse jobs: ${data.dashboardUrl}

      ---

      Need help? We're here for you!
      Questions? Contact us or visit our help center.

      AI Jobs Australia
      Your gateway to AI careers in Australia
    `;
  }
}

// Export singleton instance
export const emailService = PostmarkEmailService.getInstance();
