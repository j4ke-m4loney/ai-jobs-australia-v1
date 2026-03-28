import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Fire-and-forget tracking of external/email apply clicks.
 * Creates a lightweight job_applications record so the click
 * appears in the job seeker's "Applied Jobs" dashboard.
 */
export function trackExternalApply(
  supabase: SupabaseClient,
  jobId: string,
  applicantId: string,
  applicationType: 'external' | 'email'
): void {
  supabase
    .from('job_applications')
    .upsert(
      {
        job_id: jobId,
        applicant_id: applicantId,
        application_type: applicationType,
        status: 'applied',
      },
      { onConflict: 'job_id,applicant_id', ignoreDuplicates: true }
    )
    .then(({ error }) => {
      if (error) {
        console.error('Failed to track external application:', error);
      }
    });
}
