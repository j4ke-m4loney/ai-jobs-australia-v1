import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  requestJobRemoval,
  requestBatchJobIndexing,
  isIndexingConfigured,
} from '@/lib/google-indexing';

/**
 * POST /api/indexing
 * Request Google to index or remove job pages
 *
 * Body: { jobIds: string[], action: 'index' | 'remove' }
 *
 * Requires admin authentication
 */
export async function POST(request: NextRequest) {
  try {
    // Check if indexing is configured
    if (!isIndexingConfigured()) {
      return NextResponse.json(
        {
          error: 'Google Indexing API is not configured',
          message: 'Set GOOGLE_INDEXING_CREDENTIALS environment variable'
        },
        { status: 503 }
      );
    }

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { jobIds, action = 'index', adminId } = await request.json();

    if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
      return NextResponse.json(
        { error: 'jobIds array is required' },
        { status: 400 }
      );
    }

    if (!adminId) {
      return NextResponse.json(
        { error: 'adminId is required' },
        { status: 400 }
      );
    }

    // Verify admin permissions
    const { data: adminData, error: adminError } = await supabaseAdmin
      .from('profiles')
      .select('user_type')
      .eq('user_id', adminId)
      .single();

    if (adminError || adminData?.user_type !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }

    // Validate action
    if (!['index', 'remove'].includes(action)) {
      return NextResponse.json(
        { error: 'action must be "index" or "remove"' },
        { status: 400 }
      );
    }

    console.log(`[Indexing API] ${action} request for ${jobIds.length} jobs by admin ${adminId}`);

    let results;
    if (action === 'remove') {
      results = await Promise.all(jobIds.map(id => requestJobRemoval(id)));
    } else {
      results = await requestBatchJobIndexing(jobIds);
    }

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    return NextResponse.json({
      success: true,
      action,
      total: jobIds.length,
      successful: successful.length,
      failed: failed.length,
      results,
    });

  } catch (error) {
    console.error('[Indexing API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/indexing/status
 * Check if Google Indexing API is configured
 */
export async function GET() {
  return NextResponse.json({
    configured: isIndexingConfigured(),
    message: isIndexingConfigured()
      ? 'Google Indexing API is configured'
      : 'Set GOOGLE_INDEXING_CREDENTIALS environment variable to enable',
  });
}
