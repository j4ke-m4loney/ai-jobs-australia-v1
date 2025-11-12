import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';

export async function GET(request: NextRequest) {
  try {
    // Create Supabase client inside route handler to avoid build-time initialization
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user's payment methods from database
    const { data: paymentMethods, error } = await supabaseAdmin
      .from('payment_methods')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching payment methods:', error);
      return NextResponse.json(
        { error: 'Failed to fetch payment methods' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      paymentMethods: paymentMethods || [],
    });

  } catch (error) {
    console.error('Error in payment methods API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client inside route handler to avoid build-time initialization
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { userId, paymentMethodId } = await request.json();

    if (!userId || !paymentMethodId) {
      return NextResponse.json(
        { error: 'User ID and payment method ID are required' },
        { status: 400 }
      );
    }

    // Get payment method details from Stripe
    const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);

    if (paymentMethod.type !== 'card' || !paymentMethod.card) {
      return NextResponse.json(
        { error: 'Only card payment methods are supported' },
        { status: 400 }
      );
    }

    // Store payment method in database
    const { data, error } = await supabaseAdmin
      .from('payment_methods')
      .insert({
        user_id: userId,
        stripe_payment_method_id: paymentMethodId,
        card_last_four: paymentMethod.card.last4,
        card_brand: paymentMethod.card.brand,
        card_exp_month: paymentMethod.card.exp_month,
        card_exp_year: paymentMethod.card.exp_year,
        is_default: false, // User can set default separately
      })
      .select()
      .single();

    if (error) {
      console.error('Error storing payment method:', error);
      return NextResponse.json(
        { error: 'Failed to store payment method' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      paymentMethod: data,
    });

  } catch (error) {
    console.error('Error adding payment method:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Create Supabase client inside route handler to avoid build-time initialization
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { searchParams } = new URL(request.url);
    const paymentMethodId = searchParams.get('paymentMethodId');
    const userId = searchParams.get('userId');

    if (!paymentMethodId || !userId) {
      return NextResponse.json(
        { error: 'Payment method ID and user ID are required' },
        { status: 400 }
      );
    }

    // Get payment method from database to verify ownership
    const { data: paymentMethod, error: fetchError } = await supabaseAdmin
      .from('payment_methods')
      .select('*')
      .eq('id', paymentMethodId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !paymentMethod) {
      return NextResponse.json(
        { error: 'Payment method not found' },
        { status: 404 }
      );
    }

    // Detach payment method from Stripe customer if it exists
    if (paymentMethod.stripe_payment_method_id) {
      try {
        await stripe.paymentMethods.detach(paymentMethod.stripe_payment_method_id);
      } catch (stripeError) {
        console.error('Error detaching payment method from Stripe:', stripeError);
        // Continue with database deletion even if Stripe fails
      }
    }

    // Delete payment method from database
    const { error: deleteError } = await supabaseAdmin
      .from('payment_methods')
      .delete()
      .eq('id', paymentMethodId)
      .eq('user_id', userId);

    if (deleteError) {
      console.error('Error deleting payment method:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete payment method' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
    });

  } catch (error) {
    console.error('Error deleting payment method:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}