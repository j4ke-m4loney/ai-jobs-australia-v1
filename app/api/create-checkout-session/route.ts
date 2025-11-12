import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe, PRICING_CONFIG, isValidPricingTier, PricingTier } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { getSiteUrl } from '@/lib/utils/get-site-url';

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client inside route handler to avoid build-time initialization
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const {
      pricingTier,
      jobFormData,
      userId,
      userEmail
    } = await request.json();

    // Validate input
    if (!pricingTier || !isValidPricingTier(pricingTier)) {
      return NextResponse.json(
        { error: 'Invalid pricing tier' },
        { status: 400 }
      );
    }

    if (!jobFormData || !userId || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const pricingConfig = PRICING_CONFIG[pricingTier];

    // Handle annual plan differently (subscription)
    if (pricingTier === 'annual') {
      return await createSubscriptionCheckout(pricingTier, jobFormData, userId, userEmail);
    }

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

    // Create Stripe checkout session
    // Note: Annual plans are handled separately above, so this is always one-time payment
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      customer: customer.id,
      payment_method_types: ['card'],
      success_url: `${request.nextUrl.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.nextUrl.origin}/payment-cancel?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        user_id: userId,
        pricing_tier: pricingTier,
        job_title: jobFormData.jobTitle || '',
      },
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
    };

    // Standard/Featured: One-time payment
    sessionConfig.mode = 'payment';
    sessionConfig.line_items = [
      {
        price_data: {
          currency: 'aud',
          product_data: {
            name: `${pricingConfig.name} Job Posting`,
            description: pricingConfig.description,
          },
          unit_amount: pricingConfig.price,
        },
        quantity: 1,
      },
    ];

    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Store payment session in database
    const { error: dbError } = await supabaseAdmin
      .from('payment_sessions')
      .insert({
        user_id: userId,
        stripe_session_id: session.id,
        pricing_tier: pricingTier,
        amount: pricingConfig.price,
        currency: 'aud',
        status: 'pending',
        job_form_data: jobFormData,
        expires_at: new Date(session.expires_at * 1000).toISOString(),
        metadata: {
          customer_id: customer.id,
          job_title: jobFormData.jobTitle || '',
        },
      });

    if (dbError) {
      console.error('Error storing payment session:', dbError);
      return NextResponse.json(
        { error: 'Failed to store payment session' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

interface JobFormData {
  jobTitle?: string;
  [key: string]: unknown;
}

async function createSubscriptionCheckout(
  pricingTier: PricingTier,
  jobFormData: JobFormData,
  userId: string,
  userEmail: string
) {
  // For annual plan, we'll create a subscription checkout
  // This is a simplified version - in production you might want to create
  // a Stripe Product and Price for the annual plan

  try {
    // Create Supabase client inside function to avoid build-time initialization
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Create or retrieve Stripe customer
    let customer;
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
        },
      });
    }

    const pricingConfig = PRICING_CONFIG[pricingTier];

    // Create a subscription checkout session
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
              interval: 'year',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${getSiteUrl()}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getSiteUrl()}/payment-cancel?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        user_id: userId,
        pricing_tier: pricingTier,
        job_title: jobFormData.jobTitle || '',
      },
    });

    // Store payment session in database
    const { error: dbError } = await supabaseAdmin
      .from('payment_sessions')
      .insert({
        user_id: userId,
        stripe_session_id: session.id,
        pricing_tier: pricingTier,
        amount: pricingConfig.price,
        currency: 'aud',
        status: 'pending',
        job_form_data: jobFormData,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
        metadata: {
          customer_id: customer.id,
          subscription_mode: true,
          job_title: jobFormData.jobTitle || '',
        },
      });

    if (dbError) {
      console.error('Error storing payment session:', dbError);
      throw new Error('Failed to store payment session');
    }

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    });

  } catch (error) {
    console.error('Error creating subscription checkout:', error);
    return NextResponse.json(
      { error: 'Failed to create subscription checkout' },
      { status: 500 }
    );
  }
}