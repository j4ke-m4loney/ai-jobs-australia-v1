import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';

type SubscriptionDbStatus = 'active' | 'cancelled' | 'past_due' | 'trialing' | 'inactive';

/**
 * Maps a Stripe subscription status string to our database status values.
 * Uses Australian spelling ('cancelled') and defaults unknown statuses to 'inactive'.
 */
export function mapStripeSubscriptionStatus(stripeStatus: Stripe.Subscription.Status): SubscriptionDbStatus {
  switch (stripeStatus) {
    case 'active':
      return 'active';
    case 'canceled':
      return 'cancelled';
    case 'past_due':
      return 'past_due';
    case 'trialing':
      return 'trialing';
    default:
      return 'inactive';
  }
}

/**
 * Extracts period start/end dates from a Stripe subscription.
 * In Stripe SDK v18 (basil API), period dates live on subscription items,
 * not on the subscription object directly.
 */
export function getStripeSubscriptionPeriod(subscription: Stripe.Subscription): {
  current_period_start: string;
  current_period_end: string;
} {
  const item = subscription.items.data[0];
  return {
    current_period_start: new Date(item.current_period_start * 1000).toISOString(),
    current_period_end: new Date(item.current_period_end * 1000).toISOString(),
  };
}

/**
 * Finds an existing Stripe customer by email, or creates a new one.
 */
export async function getOrCreateStripeCustomer(
  email: string,
  metadata?: Record<string, string>
): Promise<Stripe.Customer> {
  const customers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (customers.data.length > 0) {
    return customers.data[0];
  }

  return stripe.customers.create({
    email,
    metadata,
  });
}
