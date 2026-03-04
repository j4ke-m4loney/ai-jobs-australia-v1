import { SupabaseClient } from '@supabase/supabase-js';
import { ExtractedJobData } from '@/lib/job-import/extract-job-data';
import { CompanyMatch } from '@/lib/job-import/match-company';

const LOCATION_TYPE_MAP: Record<string, string> = {
  'in-person': 'onsite',
  'fully-remote': 'remote',
  'hybrid': 'hybrid',
  'on-the-road': 'onsite',
};

function convertToAnnualSalary(amount: number, period: string): number {
  const multipliers: Record<string, number> = {
    hour: 2080,
    day: 260,
    week: 52,
    month: 12,
    year: 1,
  };
  return Math.round(amount * (multipliers[period] || 1));
}

function getSalaryMin(data: ExtractedJobData): number | null {
  if (
    data.payType === 'range' &&
    data.payRangeMin &&
    data.payPeriod
  ) {
    return convertToAnnualSalary(data.payRangeMin, data.payPeriod);
  }
  if (
    data.payType === 'minimum' &&
    data.payRangeMin &&
    data.payPeriod
  ) {
    return convertToAnnualSalary(data.payRangeMin, data.payPeriod);
  }
  if (
    data.payType === 'fixed' &&
    data.payAmount &&
    data.payPeriod
  ) {
    return convertToAnnualSalary(data.payAmount, data.payPeriod);
  }
  return null;
}

function getSalaryMax(data: ExtractedJobData): number | null {
  if (
    data.payType === 'range' &&
    data.payRangeMax &&
    data.payPeriod
  ) {
    return convertToAnnualSalary(data.payRangeMax, data.payPeriod);
  }
  if (
    data.payType === 'maximum' &&
    data.payRangeMax &&
    data.payPeriod
  ) {
    return convertToAnnualSalary(data.payRangeMax, data.payPeriod);
  }
  if (
    data.payType === 'fixed' &&
    data.payAmount &&
    data.payPeriod
  ) {
    return convertToAnnualSalary(data.payAmount, data.payPeriod);
  }
  return null;
}

/**
 * Insert an extracted job into the jobs table as pending_approval.
 * Uses service role client to bypass RLS.
 * Returns the new job ID on success, or null on failure.
 */
export async function createJobFromDiscovery(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabaseAdmin: SupabaseClient<any>,
  extractedData: ExtractedJobData,
  companyMatch: CompanyMatch | null,
  sourceUrl: string
): Promise<string | null> {
  const highlights = [
    extractedData.highlight1,
    extractedData.highlight2,
    extractedData.highlight3,
  ].filter((h) => h && h.trim() !== '');

  const jobData = {
    title: extractedData.jobTitle,
    description: extractedData.jobDescription,
    location: extractedData.locationAddress || 'Australia',
    employer_id: '00000000-0000-0000-0000-000000000000', // System placeholder for auto-discovered jobs

    requirements: extractedData.requirements || null,
    location_type:
      LOCATION_TYPE_MAP[extractedData.locationType] || 'onsite',
    job_type: extractedData.jobTypes || ['full-time'],
    category: extractedData.category || 'other-ai-ml',
    salary_min: getSalaryMin(extractedData),
    salary_max: getSalaryMax(extractedData),
    show_salary: !extractedData.salaryIsEstimated,

    application_method:
      extractedData.applicationMethod === 'external'
        ? 'external'
        : 'email',
    application_url: extractedData.applicationUrl || sourceUrl,
    application_email: extractedData.applicationEmail || null,

    company_id: companyMatch?.id || null,

    status: 'pending_approval',
    payment_status: 'completed',
    is_featured: false,
    featured_order: 0,

    highlights,
    disable_utm_tracking: false,

    posted_by_admin: true,
    admin_notes: `Auto-discovered from career page: ${sourceUrl}`,

    expires_at: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from('jobs')
    .insert([jobData])
    .select('id')
    .single();

  if (error) {
    console.error(
      `[JobDiscovery] Failed to insert job "${extractedData.jobTitle}":`,
      error
    );
    return null;
  }

  return data.id;
}
