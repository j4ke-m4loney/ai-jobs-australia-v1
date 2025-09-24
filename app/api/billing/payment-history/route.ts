import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side Supabase client with service role for database operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log('🔍 Payment History API - Request received:', {
      userId,
      limit,
      offset,
      hasUserId: !!userId
    });

    if (!userId) {
      console.log('❌ Payment History API - No user ID provided');
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Payment History API - Querying database for user:', userId);

    // Get user's payment history from database
    const { data: payments, error, count } = await supabaseAdmin
      .from('payments')
      .select(`
        id,
        pricing_tier,
        amount,
        currency,
        status,
        payment_method_type,
        receipt_url,
        created_at,
        stripe_payment_intent_id,
        stripe_charge_id
      `, { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    console.log('🔍 Payment History API - Database query result:', {
      paymentsCount: payments?.length || 0,
      totalCount: count,
      hasError: !!error,
      errorMessage: error?.message,
      samplePayment: payments?.[0] ? {
        id: payments[0].id,
        pricing_tier: payments[0].pricing_tier,
        amount: payments[0].amount,
        status: payments[0].status
      } : null
    });

    if (error) {
      console.error('❌ Payment History API - Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch payment history' },
        { status: 500 }
      );
    }

    const response = {
      payments: payments || [],
      total: count || 0,
      hasMore: (count || 0) > offset + limit,
    };

    console.log('✅ Payment History API - Sending response:', {
      paymentsReturned: response.payments.length,
      total: response.total,
      hasMore: response.hasMore
    });

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error in payment history API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}