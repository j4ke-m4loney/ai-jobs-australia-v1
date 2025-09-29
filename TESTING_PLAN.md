# AI Jobs Australia - Comprehensive Testing Plan

## Overview

This document provides a complete testing strategy for the AI Jobs Australia platform, covering all user workflows, payment processing, email notifications, and system integrations. The platform serves three distinct user types: Job Seekers, Employers, and Admins, each with specific functionality and workflows.

## User Types & Core Workflows

### 1. **JOB SEEKER WORKFLOW**

#### **Account & Profile Management**

- **Registration**: Create job seeker account via `/login` page ✅
- **Email Verification**: Confirm account via email link → `/auth/confirm` ✅
- **Profile Setup**: Complete profile at `/jobseeker/profile` ✅
- **Document Upload**: Upload resume/cover letter at `/jobseeker/documents` ✅

#### **Job Search & Application**

- **Job Browsing**: Search and filter jobs on `/jobs` page ✅
- **Job Details**: View full job details with company info ✅
- **Save Jobs**: Save interesting jobs to `/jobseeker/saved-jobs`✅
- **Apply for Jobs**: Submit applications via `/apply/[jobId]`✅
- **Application Tracking**: Monitor status in `/jobseeker/applications`✅

#### **Email Notifications (Job Seeker)**

- **Application Status Updates**: Email when application status changes (viewed/accepted/rejected)

---

### 2. **EMPLOYER WORKFLOW**

#### **Account & Profile Management**

- **Registration**: Create employer account via `/employer-login` or `/post-job-login`
- **Email Verification**: Confirm account via verification email
- **Company Profile**: Complete company details at `/employer/company-profile`
- **Billing Setup**: Configure payment methods at `/employer/billing`

#### **Job Posting & Payment**

- **Job Creation**: Post jobs via `/post-job` interface
- **Pricing Selection**: Choose from Standard ($99), Featured ($299), or Annual ($999)
- **Payment Processing**: Stripe checkout for job posting fees
- **Job Submission**: Job goes to admin for approval (pending_approval status)

#### **Job Management**

- **Job Dashboard**: View all jobs at `/employer/jobs`
- **Application Management**: Review applications at `/employer/applications`
- **Job Editing**: Modify approved jobs (triggers re-approval if significant changes)
- **Analytics**: View job performance at `/employer/analytics`

#### **Email Notifications (Employer)**

1. **Job Submission Confirmation**: Sent immediately after posting job for approval
2. **Job Approval Notification**: Sent when admin approves job (job goes live)
3. **Job Rejection Notification**: Sent when admin rejects job (with reason)
4. **Job Resubmission Confirmation**: Sent when edited job requires re-approval
5. **New Application Notification**: Sent when job seeker applies to their job

---

### 3. **ADMIN WORKFLOW**

#### **Job Review & Approval**

- **Admin Dashboard**: Access job queue at `/admin/jobs`
- **Job Review**: Detailed review at `/admin/jobs/[id]`
- **Bulk Operations**: Approve/reject multiple jobs simultaneously
- **Job Status Management**: Set jobs to approved, rejected, or pending

#### **Quality Control**

- **Content Review**: Check job descriptions for compliance
- **Company Verification**: Ensure legitimate company postings
- **Rejection Reasons**: Provide feedback for rejected jobs

#### **No Direct Email Notifications**: Admins manage through dashboard interface

---

## Complete Email System (Postmark Integration)

### **Transactional Emails Sent**

#### 1. **Job Submission Confirmation**

- **Trigger**: Employer submits job after payment
- **Recipient**: Employer
- **Subject**: `Job Submitted for Approval: [Job Title]`
- **Content**: Job details, "pending approval" status, 24-48 hour review timeline
- **Tag**: `job-submission`

#### 2. **Job Approval Notification**

- **Trigger**: Admin approves job
- **Recipient**: Employer
- **Subject**: `Your job posting is now live: [Job Title]`
- **Content**: "Job is now live" message with dashboard link
- **Tag**: `job-status`

#### 3. **Job Rejection Notification**

- **Trigger**: Admin rejects job
- **Recipient**: Employer
- **Subject**: `Job posting requires attention: [Job Title]`
- **Content**: Rejection reason, instructions to edit and resubmit
- **Tag**: `job-status`

#### 4. **Job Resubmission Confirmation**

- **Trigger**: Employer edits approved job (significant changes)
- **Recipient**: Employer
- **Subject**: `Job Changes Under Review: [Job Title]`
- **Content**: "Changes under review" message
- **Tag**: `job-resubmission`

#### 5. **New Application Notification**

- **Trigger**: Job seeker applies to employer's job
- **Recipient**: Employer
- **Subject**: `New Application: [Job Title]`
- **Content**: Applicant details, application date, dashboard link
- **Tag**: `job-application`

#### 6. **Application Status Update**

- **Trigger**: Employer changes application status
- **Recipient**: Job Seeker
- **Subject**: Varies by status:
  - `Application Viewed: [Job Title]`
  - `Congratulations! Application Accepted: [Job Title]`
  - `Application Update: [Job Title]`
- **Content**: Status change (viewed/accepted/rejected) with company message
- **Tag**: `application-status`

---

## Payment & Stripe Integration

### **Pricing Tiers**

- **Standard**: $99 AUD (30-day listing)
- **Featured**: $299 AUD (30-day featured listing)
- **Annual**: $999 AUD (unlimited postings for 1 year - subscription)

### **Payment Flow**

1. Employer selects pricing tier → Stripe Checkout
2. Payment success → Webhook processes payment
3. Job automatically submitted for admin approval
4. Confirmation email sent to employer

### **Webhook Events Handled**

- `checkout.session.completed` - Job creation after payment
- `checkout.session.expired` - Cleanup failed payments
- `payment_intent.succeeded` - Payment confirmation
- `payment_intent.payment_failed` - Payment failure handling
- `customer.subscription.created/updated/deleted` - Annual plan management

---

## Testing Scenarios by User Type

### **JOB SEEKER TESTING**

#### **Account Setup & Profile**

1. ✅ **Registration Test**

   - Navigate to `/login`
   - Create new job seeker account
   - Verify email confirmation workflow
   - Check redirect to `/jobseeker/profile?verified=true`

2. ✅ **Profile Completion**

   - Complete all required profile fields
   - Upload profile photo
   - Add skills and experience levels
   - Set location and job preferences
   - Save and verify data persistence

3. ✅ **Document Management**
   - Navigate to `/jobseeker/documents`
   - Upload resume (PDF format)
   - Upload cover letter (PDF format)
   - Verify file size limits and format validation
   - Test download functionality

#### **Job Search & Application**

4. ✅ **Job Discovery**

   - Search jobs on `/jobs` page
   - Test search filters (location, category, salary, remote)
   - Verify search results accuracy
   - Test pagination and sorting

5. ✅ **Job Interaction**

   - View job details page
   - Save jobs to favorites list
   - Verify saved jobs appear in `/jobseeker/saved-jobs`
   - Remove jobs from favorites

6. ✅ **Application Process**

   - Apply to jobs via `/apply/[jobId]`
   - Submit with custom cover letter message
   - Verify application confirmation
   - Check application appears in `/jobseeker/applications`

7. ✅ **Application Tracking**
   - Monitor application status changes
   - Verify email notifications for status updates
   - Test status categories: pending, viewed, accepted, rejected

### **EMPLOYER TESTING**

#### **Account Setup & Company Profile**

1. ✅ **Registration Test**

   - Create account via `/employer-login` or `/post-job-login`
   - Complete email verification
   - Check redirect to `/employer/settings?verified=true`

2. ✅ **Company Profile Setup**

   - Navigate to `/employer/company-profile`
   - Complete company details (name, description, website, location)
   - Upload company logo
   - Save and verify data persistence

3. ✅ **Billing Configuration**
   - Access `/employer/billing`
   - Add payment method via Stripe
   - View billing history
   - Update payment methods

#### **Job Posting & Payment**

4. ✅ **Job Creation**

   - Navigate to `/post-job`
   - Complete job form (title, description, requirements, location)
   - Select application method (email/external URL)
   - Save draft and resume editing

5. ✅ **Payment Processing**

   - **Standard Tier ($99)**:
     - Select Standard pricing
     - Complete Stripe checkout
     - Verify payment success redirect
     - Check job submission confirmation email
   - **Featured Tier ($299)**:
     - Select Featured pricing
     - Complete payment flow
     - Verify featured job benefits
   - **Annual Tier ($999)**:
     - Select Annual plan
     - Complete subscription checkout
     - Verify subscription creation

6. ✅ **Job Management**
   - View jobs in `/employer/jobs` dashboard
   - Check job status: pending_approval → approved → active
   - Edit approved jobs (test re-approval trigger)
   - View job analytics in `/employer/analytics`

#### **Application Management**

7. ✅ **Application Review**

   - Access `/employer/applications`
   - Filter applications by job and status
   - Download applicant resumes and cover letters
   - Verify security (only access own job applications)

8. ✅ **Application Status Management**
   - Update application statuses (viewed/accepted/rejected)
   - Add custom messages to status updates
   - Verify job seekers receive email notifications
   - Test bulk status updates

### **ADMIN TESTING**

#### **Authentication & Access**

1. ✅ **Admin Login**
   - Access `/admin` with admin credentials
   - Verify admin-only access restrictions
   - Test user type authentication guards

#### **Job Review & Approval**

2. ✅ **Job Queue Management**

   - Access `/admin/jobs`
   - View pending jobs queue
   - Filter jobs by status, date, pricing tier
   - Search jobs by title or company

3. ✅ **Individual Job Review**

   - Navigate to `/admin/jobs/[id]`
   - Review job details thoroughly
   - Approve jobs individually
   - Reject jobs with detailed feedback
   - Verify employers receive approval/rejection emails

4. ✅ **Bulk Operations**

   - Select multiple jobs
   - Approve jobs in bulk
   - Reject multiple jobs with reasons
   - Monitor real-time status updates

5. ✅ **Quality Control**
   - Review job content for compliance
   - Check company legitimacy
   - Ensure appropriate job categories
   - Verify pricing tier accuracy

### **EMAIL TESTING**

#### **Email Delivery Verification**

1. ✅ **Job Submission Emails**

   - Trigger: Complete job posting payment
   - Verify employer receives submission confirmation
   - Check email content accuracy and formatting

2. ✅ **Job Status Emails**

   - Trigger admin approval/rejection actions
   - Verify employers receive timely notifications
   - Test rejection emails include feedback

3. ✅ **Application Emails**

   - Submit job applications
   - Verify employers receive new application notifications
   - Test application status update emails to job seekers

4. ✅ **Email Content Testing**
   - Verify all email templates render correctly
   - Test HTML and text versions
   - Check unsubscribe links functionality
   - Validate email tracking (opens, clicks)

### **INTEGRATION TESTING**

#### **End-to-End Workflows**

1. ✅ **Complete Job Lifecycle**

   - Employer registers → posts job → pays → admin approves → job goes live
   - Job seeker registers → searches → applies → receives status updates
   - Employer manages applications → updates statuses

2. ✅ **Payment Integration**

   - Test all Stripe checkout flows
   - Verify webhook processing
   - Test payment failures and retries
   - Validate subscription management for annual plans

3. ✅ **Real-time Updates**

   - Test dashboard updates across user types
   - Verify application status syncing
   - Check job status propagation

4. ✅ **Security Testing**

   - Verify user type access restrictions
   - Test document access permissions
   - Validate job ownership controls
   - Check admin privilege boundaries

5. ✅ **Performance Testing**
   - Test job search performance with large datasets
   - Verify application management scalability
   - Check email delivery performance
   - Test file upload/download speeds

---

## Testing Checklist Summary

### **Pre-Testing Setup**

- [ ] Configure test environment with valid API keys (Stripe, Postmark)
- [ ] Set up test database with sample data
- [ ] Create test user accounts for each user type
- [ ] Configure email testing environment

### **Core Functionality**

- [ ] User registration and authentication flows
- [ ] Job posting and payment processing
- [ ] Application submission and management
- [ ] Admin approval workflows
- [ ] Email notification delivery

### **Integration Points**

- [ ] Stripe payment processing and webhooks
- [ ] Postmark email delivery
- [ ] File upload/download functionality
- [ ] Real-time dashboard updates
- [ ] Cross-user workflow interactions

### **Edge Cases & Error Handling**

- [ ] Payment failures and retries
- [ ] Email delivery failures
- [ ] File upload errors and size limits
- [ ] Invalid user access attempts
- [ ] Network connectivity issues

This comprehensive testing plan ensures all aspects of the AI Jobs Australia platform function correctly across all user types and integrations.
