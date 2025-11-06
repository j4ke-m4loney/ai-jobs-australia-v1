import { ServerClient, Models } from "postmark";

// Initialize Postmark client only on server-side where environment variables are available
const postmarkClient =
  typeof window === "undefined" && process.env.POSTMARK_SERVER_TOKEN
    ? new ServerClient(process.env.POSTMARK_SERVER_TOKEN)
    : null;

// Helper function to check if email service is available
function isEmailServiceAvailable(): boolean {
  if (!postmarkClient) {
    console.warn(
      "Email service not available - running on client-side or missing POSTMARK_SERVER_TOKEN"
    );
    return false;
  }
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
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">AI Jobs Australia</h1>
            <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">New Job Application</p>
          </div>

          <div style="background: #f9f9f9; padding: 25px; border-radius: 8px; border-left: 4px solid #667eea; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">New Application Received</h2>
            <p>Hello ${data.employerName},</p>
            <p>You have received a new application for your job posting:</p>

            <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="margin-top: 0; color: #667eea;">${data.jobTitle}</h3>
              <p><strong>Applicant:</strong> ${data.applicantName}</p>
              <p><strong>Email:</strong> ${data.applicantEmail}</p>
              <p><strong>Applied:</strong> ${data.applicationDate}</p>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.dashboardUrl}"
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      padding: 15px 30px;
                      text-decoration: none;
                      border-radius: 5px;
                      font-weight: bold;
                      display: inline-block;
                      font-size: 16px;">
              View Application in Dashboard
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            <p>You're receiving this email because you have an active job posting on AI Jobs Australia.</p>
            <p>You can manage your notification preferences in your account settings.</p>
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
    const statusIcon =
      data.status === "accepted"
        ? "🎉"
        : data.status === "rejected"
        ? "📄"
        : "👀";

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Application Status Update - AI Jobs Australia</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">AI Jobs Australia</h1>
            <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Application Status Update</p>
          </div>

          <div style="background: #f9f9f9; padding: 25px; border-radius: 8px; border-left: 4px solid ${statusColor}; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">${statusIcon} Application ${
      data.status.charAt(0).toUpperCase() + data.status.slice(1)
    }</h2>
            <p>Hello ${data.applicantName},</p>
            <p>Your application status has been updated:</p>

            <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="margin-top: 0; color: #667eea;">${data.jobTitle}</h3>
              <p><strong>Company:</strong> ${data.companyName}</p>
              <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${
      data.status.charAt(0).toUpperCase() + data.status.slice(1)
    }</span></p>
              ${
                data.statusMessage
                  ? `<p><strong>Message:</strong> ${data.statusMessage}</p>`
                  : ""
              }
            </div>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            <p>You're receiving this email because you applied for a job on AI Jobs Australia.</p>
            <p>You can manage your notification preferences in your account settings.</p>
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
    const statusIcon = data.status === "approved" ? "✅" : "❌";

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Job Status Update - AI Jobs Australia</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">AI Jobs Australia</h1>
            <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Job Status Update</p>
          </div>

          <div style="background: #f9f9f9; padding: 25px; border-radius: 8px; border-left: 4px solid ${statusColor}; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">${statusIcon} Job ${
      data.status.charAt(0).toUpperCase() + data.status.slice(1)
    }</h2>
            <p>Hello ${data.employerName},</p>
            <p>Your job posting status has been updated:</p>

            <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="margin-top: 0; color: #667eea;">${data.jobTitle}</h3>
              <p><strong>Status:</strong> <span style="color: ${statusColor}; font-weight: bold;">${
      data.status.charAt(0).toUpperCase() + data.status.slice(1)
    }</span></p>
              ${
                data.rejectionReason
                  ? `<p><strong>Reason:</strong> ${data.rejectionReason}</p>`
                  : ""
              }
            </div>

            ${
              data.status === "approved"
                ? "<p>🎉 Congratulations! Your job is now live and visible to job seekers.</p>"
                : "<p>Please review the feedback and make necessary changes before resubmitting.</p>"
            }
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.dashboardUrl}"
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      padding: 15px 30px;
                      text-decoration: none;
                      border-radius: 5px;
                      font-weight: bold;
                      display: inline-block;
                      font-size: 16px;">
              View in Dashboard
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            <p>You're receiving this email because you have posted a job on AI Jobs Australia.</p>
            <p>You can manage your notification preferences in your account settings.</p>
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
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">AI Jobs Australia</h1>
            <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Job Submission Confirmed</p>
          </div>

          <div style="background: #f9f9f9; padding: 25px; border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">✅ Job Successfully Submitted</h2>
            <p>Hello ${data.employerName},</p>
            <p>Thank you for posting a job with AI Jobs Australia! Your job posting has been successfully submitted and is now in our review queue.</p>

            <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="margin-top: 0; color: #667eea;">${data.jobTitle}</h3>
              <p><strong>Company:</strong> ${data.companyName}</p>
              <p><strong>Location:</strong> ${data.location}</p>
              <p><strong>Plan:</strong> ${
                data.pricingTier.charAt(0).toUpperCase() +
                data.pricingTier.slice(1)
              }</p>
              <p><strong>Status:</strong> <span style="color: #f59e0b; font-weight: bold;">Pending Approval</span></p>
            </div>
          </div>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
            <h3 style="color: #92400e; margin-top: 0;">What Happens Next?</h3>
            <ul style="color: #92400e; margin: 0; padding-left: 20px;">
              <li>Our team will review your job posting within <strong>24-48 hours</strong></li>
              <li>We'll check for quality, compliance, and completeness</li>
              <li>You'll receive an email notification once approved</li>
              <li>Your job will then go live on our platform</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.dashboardUrl}"
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      padding: 15px 30px;
                      text-decoration: none;
                      border-radius: 5px;
                      font-weight: bold;
                      display: inline-block;
                      font-size: 16px;">
              View Job Status in Dashboard
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            <p>Need to make changes? You can edit your job posting in your dashboard while it's pending approval.</p>
            <p>Questions? Contact our support team - we're here to help!</p>
            <p>You can manage your notification preferences in your account settings.</p>
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
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">AI Jobs Australia</h1>
            <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Job Changes Under Review</p>
          </div>

          <div style="background: #f9f9f9; padding: 25px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">🔄 Job Changes Successfully Submitted</h2>
            <p>Hello ${data.employerName},</p>
            <p>Your recent changes to the job posting have been successfully saved and are now under review.</p>

            <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
              <h3 style="margin-top: 0; color: #667eea;">${data.jobTitle}</h3>
              <p><strong>Company:</strong> ${data.companyName}</p>
              <p><strong>Location:</strong> ${data.location}</p>
              <p><strong>Changes:</strong> ${data.changesDescription}</p>
              <p><strong>Status:</strong> <span style="color: #f59e0b; font-weight: bold;">Under Review</span></p>
            </div>
          </div>

          <div style="background: #fef3c7; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
            <h3 style="color: #92400e; margin-top: 0;">What Happens Next?</h3>
            <ul style="color: #92400e; margin: 0; padding-left: 20px;">
              <li>Our team will review your changes within <strong>24-48 hours</strong></li>
              <li>We'll check for quality, compliance, and completeness</li>
              <li>You'll receive an email notification once approved</li>
              <li>Your updated job will then go live on our platform</li>
            </ul>
            <p style="color: #92400e; margin-top: 15px; margin-bottom: 0;">
              <strong>Note:</strong> Minor changes like company info and application method are already live.
              Only significant content changes require review.
            </p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.dashboardUrl}"
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      padding: 15px 30px;
                      text-decoration: none;
                      border-radius: 5px;
                      font-weight: bold;
                      display: inline-block;
                      font-size: 16px;">
              View Job Status in Dashboard
            </a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            <p>Need to make more changes? You can continue editing your job posting in your dashboard while it's under review.</p>
            <p>Questions? Contact our support team - we're here to help!</p>
            <p>You can manage your notification preferences in your account settings.</p>
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
          `<li style="padding: 8px 0; border-bottom: 1px solid #f0f0f0;">${
            index + 1
          }. ${name}</li>`
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
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">AI Jobs Australia</h1>
            <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">New Job Applications</p>
          </div>

          <div style="background: #f9f9f9; padding: 25px; border-radius: 8px; border-left: 4px solid #10b981; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">📝 ${data.applicationCount} New Applications Received</h2>
            <p>Hello ${data.employerName},</p>
            <p>Great news! You've received <strong>${data.applicationCount} new applications</strong> for your job posting ${data.timeFrame}.</p>

            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #667eea; font-size: 20px;">${data.jobTitle}</h3>

              <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                <h4 style="color: #495057; margin-top: 0; margin-bottom: 15px;">New Applicants:</h4>
                <ul style="list-style: none; padding: 0; margin: 0;">
                  ${applicantList}
                </ul>
              </div>

              <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin-top: 15px;">
                <p style="margin: 0; color: #1565c0;">
                  <strong>💡 Tip:</strong> Review applications quickly to maintain candidate engagement.
                  The best candidates often have multiple opportunities!
                </p>
              </div>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.dashboardUrl}?job=${data.jobId}"
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                      color: white;
                      padding: 15px 30px;
                      text-decoration: none;
                      border-radius: 5px;
                      font-weight: bold;
                      display: inline-block;
                      font-size: 16px;">
              Review Applications Now
            </a>
          </div>

          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin-bottom: 20px;">
            <h3 style="color: #856404; margin-top: 0;">🔔 Email Batching Active</h3>
            <p style="color: #856404; margin-bottom: 0;">
              To prevent inbox flooding, we group multiple applications and send you updates when you receive 5+ applications
              or after 1 hour (whichever comes first). You can adjust these preferences in your dashboard settings.
            </p>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            <p>Each applicant has uploaded their resume and details for your review.</p>
            <p>Questions? Contact our support team - we're here to help!</p>
            <p>You can manage your notification preferences in your account settings.</p>
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
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">AI Jobs Australia</h1>
            <p style="color: #f0f0f0; margin: 10px 0 0 0; font-size: 16px;">Contact Form Submission</p>
          </div>

          <div style="background: #f9f9f9; padding: 25px; border-radius: 8px; border-left: 4px solid #667eea; margin-bottom: 20px;">
            <h2 style="color: #333; margin-top: 0;">New Message from ${data.firstName} ${data.lastName}</h2>

            <div style="background: white; padding: 20px; border-radius: 5px; margin: 15px 0;">
              <p style="margin: 10px 0;"><strong>Name:</strong> ${data.firstName} ${data.lastName}</p>
              <p style="margin: 10px 0;"><strong>Email:</strong> <a href="mailto:${data.email}" style="color: #667eea;">${data.email}</a></p>
              <p style="margin: 10px 0;"><strong>Subject:</strong> ${data.subject}</p>
            </div>

            <div style="background: white; padding: 20px; border-radius: 5px; margin: 15px 0;">
              <h3 style="margin-top: 0; color: #667eea;">Message:</h3>
              <p style="white-space: pre-wrap; margin: 0;">${data.message}</p>
            </div>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
            <p>This message was sent via the contact form on AI Jobs Australia.</p>
            <p>You can reply directly to this email to respond to ${data.firstName}.</p>
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
}

// Export singleton instance
export const emailService = PostmarkEmailService.getInstance();
