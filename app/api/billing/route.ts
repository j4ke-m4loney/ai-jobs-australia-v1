import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { BillingUpdateData, PaymentMethodUpdateData } from '@/types/billing';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Use service key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET /api/billing - Get user's subscription and payment methods
export async function GET(request: NextRequest) {
  try {
    // Extract user from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    // Get user from JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user's subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (subError) {
      console.error('Error fetching subscription:', subError);
    }

    // Get user's payment methods
    const { data: paymentMethods, error: pmError } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', user.id)
      .order('is_default', { ascending: false });

    if (pmError) {
      console.error('Error fetching payment methods:', pmError);
    }

    return NextResponse.json({
      subscription,
      paymentMethods: paymentMethods || []
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/billing - Update subscription or payment method
export async function PUT(request: NextRequest) {
  try {
    const { type, data } = await request.json();
    
    // Extract user from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    // Get user from JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (type === 'subscription') {
      // Update subscription
      const updateData: BillingUpdateData = data;
      
      const { data: updatedSubscription, error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          ...updateData,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error updating subscription:', error);
        return NextResponse.json({ error: 'Failed to update subscription' }, { status: 500 });
      }

      return NextResponse.json({ subscription: updatedSubscription });
      
    } else if (type === 'payment_method') {
      // Update payment method
      const updateData: PaymentMethodUpdateData & { id?: string } = data;
      
      if (updateData.id) {
        // Update existing payment method
        const { data: updatedPaymentMethod, error } = await supabase
          .from('payment_methods')
          .update({
            ...updateData,
            updated_at: new Date().toISOString(),
          })
          .eq('id', updateData.id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating payment method:', error);
          return NextResponse.json({ error: 'Failed to update payment method' }, { status: 500 });
        }

        return NextResponse.json({ paymentMethod: updatedPaymentMethod });
      } else {
        // Create new payment method
        const { data: newPaymentMethod, error } = await supabase
          .from('payment_methods')
          .insert({
            user_id: user.id,
            ...updateData,
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating payment method:', error);
          return NextResponse.json({ error: 'Failed to create payment method' }, { status: 500 });
        }

        return NextResponse.json({ paymentMethod: newPaymentMethod });
      }
    } else {
      return NextResponse.json({ error: 'Invalid update type' }, { status: 400 });
    }

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/billing - Create subscription or payment method
export async function POST(request: NextRequest) {
  try {
    const { type, plan_type } = await request.json();
    
    // Extract user from authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'No authorization header' }, { status: 401 });
    }

    // Get user from JWT token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    if (type === 'change_plan') {
      // Mock plan change - in real implementation, this would integrate with Stripe
      const planPrices = {
        free: 0,
        professional: 9900,
        enterprise: 29900,
      };

      const { data: updatedSubscription, error } = await supabase
        .from('subscriptions')
        .upsert({
          user_id: user.id,
          plan_type,
          price_per_month: planPrices[plan_type as keyof typeof planPrices],
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) {
        console.error('Error changing plan:', error);
        return NextResponse.json({ error: 'Failed to change plan' }, { status: 500 });
      }

      return NextResponse.json({ 
        subscription: updatedSubscription,
        message: `Successfully changed to ${plan_type} plan`
      });
    }

    return NextResponse.json({ error: 'Invalid action type' }, { status: 400 });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}