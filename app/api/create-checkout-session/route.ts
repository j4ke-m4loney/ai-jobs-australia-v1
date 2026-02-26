import { NextRequest, NextResponse } from 'next/server';
import { stripe, isValidPricingTier } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { getSiteUrl } from '@/lib/utils/get-site-url';
import { getOrCreateStripeCustomer } from '@/lib/stripe-helpers';

// Stripe Price IDs — created in the Stripe dashboard, stored as env vars.
// PRICING_CONFIG in stripe-client.ts is for display only; these are used at checkout time.
const STRIPE_PRICE_IDS: Record<string, string | undefined> = {
  standard: process.env.STRIPE_STANDARD_JOB_PRICE_ID,
  featured: process.env.STRIPE_FEATURED_JOB_PRICE_ID,
};

export async function POST(request: NextRequest) {
  try {
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

    // Validate pricing tier (only standard and featured go through checkout)
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

    const priceId = STRIPE_PRICE_IDS[pricingTier as string];
    if (!priceId) {
      console.error(`Missing Stripe Price ID for tier "${pricingTier}". Set STRIPE_${(pricingTier as string).toUpperCase()}_JOB_PRICE_ID in env vars.`);
      return NextResponse.json(
        { error: `Stripe Price ID not configured for ${pricingTier} tier` },
        { status: 500 }
      );
    }

    // Create or retrieve Stripe customer
    let customer;
    try {
      customer = await getOrCreateStripeCustomer(userEmail, { user_id: userId });
    } catch (error) {
      console.error('Error creating/retrieving customer:', error);
      return NextResponse.json(
        { error: 'Failed to create customer' },
        { status: 500 }
      );
    }

    const siteUrl = getSiteUrl();

    // Create Stripe checkout session (one-time payment)
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/payment-cancel?session_id={CHECKOUT_SESSION_ID}`,
      metadata: {
        user_id: userId,
        pricing_tier: pricingTier,
        job_title: jobFormData.jobTitle || '',
      },
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
    });

    // Store payment session in database
    // We fetch the Price to get the unit_amount so the DB record stays accurate
    const stripePrice = await stripe.prices.retrieve(priceId);
    const amount = stripePrice.unit_amount ?? 0;

    const { error: dbError } = await supabaseAdmin
      .from('payment_sessions')
      .insert({
        user_id: userId,
        stripe_session_id: session.id,
        pricing_tier: pricingTier,
        amount,
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
