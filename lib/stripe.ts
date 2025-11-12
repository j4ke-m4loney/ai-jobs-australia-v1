// Server-side Stripe client
import StripeServer from 'stripe';

// Lazy initialization to avoid build-time environment variable access
let stripeInstance: StripeServer | null = null;

function getStripe(): StripeServer {
  if (stripeInstance) {
    return stripeInstance;
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    console.error('❌ STRIPE_SECRET_KEY is not set in environment variables');
    console.error('Available env vars:', Object.keys(process.env).filter(key => key.includes('STRIPE')));
    throw new Error('STRIPE_SECRET_KEY environment variable is required');
  }

  console.log('✅ Stripe secret key found:', stripeSecretKey.substring(0, 12) + '...');

  stripeInstance = new StripeServer(
    stripeSecretKey,
    {
      apiVersion: '2025-08-27.basil',
      typescript: true,
    }
  );

  return stripeInstance;
}

export const stripe = new Proxy({} as StripeServer, {
  get: (target, prop) => {
    const stripeClient = getStripe();
    const value = stripeClient[prop as keyof StripeServer];
    if (typeof value === 'function') {
      return value.bind(stripeClient);
    }
    return value;
  }
});

// Re-export client-safe items for server-side use
export { PRICING_CONFIG, isValidPricingTier, getPricingInfo, formatPrice } from './stripe-client';
export type { PricingTier } from './stripe-client';

// Webhook event types we handle
export const WEBHOOK_EVENTS = {
  PAYMENT_INTENT_SUCCEEDED: 'payment_intent.succeeded',
  PAYMENT_INTENT_PAYMENT_FAILED: 'payment_intent.payment_failed',
  CHECKOUT_SESSION_COMPLETED: 'checkout.session.completed',
  CHECKOUT_SESSION_EXPIRED: 'checkout.session.expired',
  INVOICE_PAYMENT_SUCCEEDED: 'invoice.payment_succeeded',
  INVOICE_PAYMENT_FAILED: 'invoice.payment_failed',
  CUSTOMER_SUBSCRIPTION_CREATED: 'customer.subscription.created',
  CUSTOMER_SUBSCRIPTION_UPDATED: 'customer.subscription.updated',
  CUSTOMER_SUBSCRIPTION_DELETED: 'customer.subscription.deleted',
} as const;

// Error types for better error handling
export class StripeError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'StripeError';
  }
}

export class PaymentError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'PaymentError';
  }
}