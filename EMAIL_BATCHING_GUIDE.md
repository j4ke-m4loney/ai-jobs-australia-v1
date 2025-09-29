# Email Batching System - Implementation Guide

## Overview

The volume-based email batching system prevents inbox flooding while maintaining responsiveness for employers receiving job applications. Uses **lazy processing** - no cron jobs required!

## How It Works

### Batching Logic
1. **First application**: Sends email immediately ✅
2. **Applications 2-5 within 1 hour**: Queued for batching 📦
3. **At 5 applications OR 1 hour elapsed**: Sends digest email 📧
4. **Reset counter and repeat** 🔄

### Lazy Processing (No Cron Required!)
- When each new application arrives, first check for overdue batches
- Process any batches older than 1 hour automatically
- Then handle the new application with normal batching logic
- Works perfectly with free Vercel hosting!

### Database Tables

#### `email_notification_queue`
Stores batched applications waiting to be sent:
- `job_id` - Which job the applications are for
- `employer_id` - Who should receive the email
- `application_ids[]` - Array of application IDs in this batch
- `applicant_names[]` - Array of applicant names for email template
- `scheduled_for` - When to send if threshold not reached (1 hour from creation)
- `processed` - Whether this batch has been sent

#### `job_email_tracking`
Tracks when emails were last sent for each job:
- `job_id` - The job being tracked
- `last_email_sent` - Timestamp of last notification
- `application_count_since_last` - Count of applications since last email

### Configuration

```typescript
const BATCH_THRESHOLD = 5; // Send batch after 5 applications
const BATCH_TIMEOUT_HOURS = 1; // Or after 1 hour
```

## Testing the System

### Environment Variables Required

No additional environment variables needed! The lazy processing approach works with existing Postmark and Supabase configurations.

### Testing Scenarios

#### 1. First Application (Immediate Email)
1. Apply to a job that has no recent applications
2. **Expected**: Immediate email notification sent
3. **Check**: `job_email_tracking` table should have new entry

#### 2. Rapid Applications (Batching)
1. Apply to the same job 4 more times within 1 hour
2. **Expected**: No immediate emails for applications 2-4
3. **Expected**: On 5th application, batch email sent immediately
4. **Check**: `email_notification_queue` entry marked as `processed: true`

#### 3. Time-Based Batching
1. Apply to a job (gets immediate email)
2. Wait 5 minutes, apply again (gets queued)
3. Wait 55+ minutes
4. **Expected**: Cron job processes queue and sends batch email
5. **Check**: Queue entry processed, tracking table updated

#### 4. Lazy Processing Testing
- Create a batch queue (apply 2-4 times to same job)
- Wait 65+ minutes
- Apply one more time to any job
- **Expected**: Overdue batch gets processed first, then new application handled
- **Check**: Logs show "Processing X overdue email batches (lazy processing)"

## Email Templates

### Individual Application Email
- Subject: "New Application: [Job Title]"
- Content: Single applicant details
- Sent: Immediately for first application

### Batched Application Email
- Subject: "5 new applications: [Job Title]"
- Content: List of all applicants in batch
- Sent: When threshold reached or cron processes queue

## Deployment Steps

### 1. Database Migration
```bash
# Apply the migration
supabase db push
```

### 2. Deploy
```bash
vercel --prod
```

### 3. Verify System
- Test application flow works normally
- Check logs for lazy processing messages
- No cron jobs to verify - everything works automatically!

## Monitoring

### Database Queries for Monitoring

```sql
-- Check queue status
SELECT
  job_id,
  array_length(application_ids, 1) as batch_size,
  created_at,
  scheduled_for,
  processed
FROM email_notification_queue
ORDER BY created_at DESC;

-- Check email tracking
SELECT
  j.title,
  jet.last_email_sent,
  jet.application_count_since_last
FROM job_email_tracking jet
JOIN jobs j ON j.id = jet.job_id
ORDER BY jet.last_email_sent DESC;
```

### Log Messages to Watch For
- `📧 Immediate email sent (first application or timeout reached)`
- `📦 Added to existing batch queue (X applications)`
- `📧 Batch email sent for X applications`
- `📧 Processing X overdue email batches (lazy processing)`
- `✅ Processed overdue batch for job X: Y applications`

## Troubleshooting

### No Emails Being Sent
1. Check `user_notification_preferences.email_applications = true`
2. Verify Postmark configuration
3. Check application API logs for errors

### Batching Not Working
1. Verify database migration applied correctly
2. Check `job_email_tracking` table exists and has data
3. Ensure cron job is running (check Vercel logs)

### Lazy Processing Not Working
1. Check application API logs for processing messages
2. Verify overdue batches exist in database
3. Ensure new applications are still being submitted (triggers lazy processing)

## Benefits

✅ **No inbox flooding** - Maximum 1 email per hour per job
✅ **Immediate first notification** - Employers know applications are coming
✅ **Efficient batching** - Related applications grouped together
✅ **No cron jobs required** - Works on free Vercel hosting
✅ **Lazy processing** - Batches processed when traffic arrives (when it matters most)
✅ **Transparent to users** - Batching explained in email template
✅ **Simple deployment** - No infrastructure dependencies