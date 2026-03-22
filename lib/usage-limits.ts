import { SupabaseClient } from '@supabase/supabase-js';

// Monthly caps per subscriber
export const MONTHLY_LIMITS = {
  match_score: 75,
  cover_letter: 30,
} as const;

// Max cover letter generations per job (server-side enforcement)
export const MAX_COVER_LETTERS_PER_JOB = 3;

type Feature = keyof typeof MONTHLY_LIMITS;

/**
 * Get the current month string in 'YYYY-MM' format.
 */
function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * Check and increment feature usage atomically.
 * Returns { allowed, currentCount, limit } or null if the table/function doesn't exist yet.
 */
export async function checkAndIncrementUsage(
  supabase: SupabaseClient,
  userId: string,
  feature: Feature
): Promise<{ allowed: boolean; currentCount: number; limit: number } | null> {
  const month = getCurrentMonth();
  const limit = MONTHLY_LIMITS[feature];

  try {
    const { data, error } = await supabase.rpc('increment_feature_usage', {
      p_user_id: userId,
      p_feature: feature,
      p_month: month,
      p_limit: limit,
    });

    if (error) {
      console.error('Usage check error:', error);
      return null; // Fail open — don't block users if tracking is down
    }

    const row = Array.isArray(data) ? data[0] : data;
    return {
      allowed: row?.allowed ?? true,
      currentCount: row?.current_count ?? 0,
      limit,
    };
  } catch {
    // Table/function may not exist yet — fail open
    return null;
  }
}

/**
 * Get current usage without incrementing.
 */
export async function getUsage(
  supabase: SupabaseClient,
  userId: string,
  feature: Feature
): Promise<{ currentCount: number; limit: number }> {
  const month = getCurrentMonth();
  const limit = MONTHLY_LIMITS[feature];

  try {
    const { data } = await supabase
      .from('feature_usage')
      .select('call_count')
      .eq('user_id', userId)
      .eq('feature', feature)
      .eq('month', month)
      .single();

    return {
      currentCount: data?.call_count ?? 0,
      limit,
    };
  } catch {
    return { currentCount: 0, limit };
  }
}

/**
 * Check how many cover letters have been generated for a specific job.
 */
export async function getCoverLetterCountForJob(
  supabase: SupabaseClient,
  userId: string,
  jobId: string,
  resumeDocumentId: string
): Promise<number> {
  try {
    const { data } = await supabase
      .from('cover_letters')
      .select('generation_number')
      .eq('user_id', userId)
      .eq('job_id', jobId)
      .eq('resume_document_id', resumeDocumentId)
      .order('generation_number', { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      return data[0].generation_number;
    }
    return 0;
  } catch {
    return 0;
  }
}
