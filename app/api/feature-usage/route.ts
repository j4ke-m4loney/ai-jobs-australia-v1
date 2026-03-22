import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { MONTHLY_LIMITS } from '@/lib/usage-limits';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * GET /api/feature-usage?userId=xxx
 * Returns current month's usage for match scores and cover letters.
 */
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    try {
      const { data } = await supabase
        .from('feature_usage')
        .select('feature, call_count')
        .eq('user_id', userId)
        .eq('month', month);

      const usageMap: Record<string, number> = {};
      if (data) {
        for (const row of data) {
          usageMap[row.feature] = row.call_count;
        }
      }

      return NextResponse.json({
        match_score: {
          used: usageMap['match_score'] ?? 0,
          limit: MONTHLY_LIMITS.match_score,
        },
        cover_letter: {
          used: usageMap['cover_letter'] ?? 0,
          limit: MONTHLY_LIMITS.cover_letter,
        },
        month,
      });
    } catch {
      // Table may not exist yet — return defaults
      return NextResponse.json({
        match_score: { used: 0, limit: MONTHLY_LIMITS.match_score },
        cover_letter: { used: 0, limit: MONTHLY_LIMITS.cover_letter },
        month,
      });
    }
  } catch (error) {
    console.error('Error fetching feature usage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch usage data' },
      { status: 500 }
    );
  }
}
