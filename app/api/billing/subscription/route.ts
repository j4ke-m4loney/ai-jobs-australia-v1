import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { stripe } from '@/lib/stripe';
import { mapStripeSubscriptionStatus, getStripeSubscriptionPeriod } from '@/lib/stripe-helpers';

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
          const mappedStatus = mapStripeSubscriptionStatus(stripeSubscription.status);
          const period = getStripeSubscriptionPeriod(stripeSubscription);

          await supabaseAdmin
            .from('subscriptions')
            .update({
              status: mappedStatus,
              current_period_start: period.current_period_start,
              current_period_end: period.current_period_end,
            })
            .eq('id', subscription.id);

          // Return updated data
          subscription.status = mappedStatus;
          subscription.current_period_start = period.current_period_start;
          subscription.current_period_end = period.current_period_end;
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
    // Create Supabase client inside route handler to avoid build-time initialization
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

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

export async function DELETE(request: NextRequest) {
  try {
    // Create Supabase client inside route handler to avoid build-time initialization
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user's current subscription
    const { data: subscription, error: fetchError } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (fetchError || !subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    if (subscription.status !== 'active') {
      return NextResponse.json(
        { error: 'Subscription is not active' },
        { status: 400 }
      );
    }

    // Cancel the Stripe subscription (at period end)
    if (subscription.stripe_subscription_id) {
      try {
        await stripe.subscriptions.update(subscription.stripe_subscription_id, {
          cancel_at_period_end: true,
        });
      } catch (stripeError) {
        console.error('Error cancelling Stripe subscription:', stripeError);
        return NextResponse.json(
          { error: 'Failed to cancel subscription with payment provider' },
          { status: 500 }
        );
      }
    }

    // Update subscription status in database
    const { error: updateError } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('id', subscription.id);

    if (updateError) {
      console.error('Error updating subscription status:', updateError);
      return NextResponse.json(
        { error: 'Failed to update subscription status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Subscription cancelled successfully',
      subscription: {
        ...subscription,
        status: 'cancelled',
      },
    });

  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}