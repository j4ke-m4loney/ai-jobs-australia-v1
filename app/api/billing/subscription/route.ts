import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';

// Server-side Supabase client with service role for database operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user's subscription from database
    const { data: subscription, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching subscription:', error);
      return NextResponse.json(
        { error: 'Failed to fetch subscription' },
        { status: 500 }
      );
    }

    // If no subscription found, return null
    if (!subscription) {
      return NextResponse.json({ subscription: null });
    }

    // If subscription exists, sync with Stripe for latest status
    if (subscription.stripe_subscription_id) {
      try {
        const stripeSubscription = await stripe.subscriptions.retrieve(
          subscription.stripe_subscription_id
        );

        // Update local subscription with Stripe data if needed
        if (stripeSubscription.status !== subscription.status) {
          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: stripeSubscription.status as any,
              current_period_start: new Date(stripeSubscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
            })
            .eq('id', subscription.id);

          // Return updated data
          subscription.status = stripeSubscription.status as any;
          subscription.current_period_start = new Date(stripeSubscription.current_period_start * 1000).toISOString();
          subscription.current_period_end = new Date(stripeSubscription.current_period_end * 1000).toISOString();
        }
      } catch (stripeError) {
        console.error('Error syncing with Stripe:', stripeError);
        // Continue with local data if Stripe sync fails
      }
    }

    return NextResponse.json({ subscription });

  } catch (error) {
    console.error('Error in subscription API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, planType } = await request.json();

    if (!userId || !planType) {
      return NextResponse.json(
        { error: 'User ID and plan type are required' },
        { status: 400 }
      );
    }

    // Check if user already has a subscription
    const { data: existingSubscription } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (existingSubscription && existingSubscription.status === 'active') {
      return NextResponse.json(
        { error: 'User already has an active subscription' },
        { status: 400 }
      );
    }

    // For annual plan, this would typically redirect to Stripe checkout
    // For now, return instructions for manual setup
    return NextResponse.json({
      message: 'Subscription creation not yet implemented',
      redirectUrl: '/post-job', // Redirect to job posting for annual plan setup
    });

  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}