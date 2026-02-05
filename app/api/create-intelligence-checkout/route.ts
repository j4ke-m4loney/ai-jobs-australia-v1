import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { JOBSEEKER_PRICING_CONFIG } from '@/lib/stripe-client';
import { createClient } from '@supabase/supabase-js';
import { getSiteUrl } from '@/lib/utils/get-site-url';

export async function POST(request: NextRequest) {
  try {
    // Create Supabase admin client inside route handler
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { userId, userEmail } = await request.json();

    // Validate input
    if (!userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user is a job_seeker
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('user_type')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Profile lookup error:', profileError);
      // If no profile exists, allow subscription (they might be a new user)
      if (profileError.code !== 'PGRST116') {
        return NextResponse.json(
          { error: 'Failed to verify user profile' },
          { status: 500 }
        );
      }
    }

    // Only block if profile explicitly shows user is NOT a job_seeker
    if (profile && profile.user_type && profile.user_type !== 'job_seeker') {
      return NextResponse.json(
        { error: 'Only job seekers can subscribe to AJA Intelligence' },
        { status: 403 }
      );
    }

    // Check if user already has an active intelligence subscription
    const { data: existingSubscription } = await supabaseAdmin
      .from('subscriptions')
      .select('id, status')
      .eq('user_id', userId)
      .eq('plan_type', 'intelligence')
      .eq('status', 'active')
      .single();

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'You already have an active AJA Intelligence subscription' },
        { status: 400 }
      );
    }

    const pricingConfig = JOBSEEKER_PRICING_CONFIG.intelligence;

    // Create or retrieve Stripe customer
    let customer;
    try {
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 1,
      });

      if (customers.data.length > 0) {
        customer = customers.data[0];
      } else {
        customer = await stripe.customers.create({
          email: userEmail,
          metadata: {
            user_id: userId,
            user_type: 'job_seeker',
          },
        });
      }
    } catch (error) {
      console.error('Error creating/retrieving customer:', error);
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      );
    }

    // Create subscription checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'aud',
            product_data: {
              name: pricingConfig.name,
              description: pricingConfig.description,
            },
            unit_amount: pricingConfig.price,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${getSiteUrl()}/jobseeker/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getSiteUrl()}/jobs?subscription_cancelled=true`,
      metadata: {
        user_id: userId,
        plan_type: 'intelligence',
      },
      subscription_data: {
        metadata: {
          user_id: userId,
          plan_type: 'intelligence',
        },
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating intelligence checkout:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
