import { loadStripe, Stripe } from '@stripe/stripe-js';

// Frontend Stripe client
let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!publishableKey) {
      throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
    }
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

// Display-only pricing for job posting tiers.
// At checkout time, the actual Stripe Price IDs come from env vars
// (STRIPE_STANDARD_JOB_PRICE_ID, STRIPE_FEATURED_JOB_PRICE_ID).
// The annual/enterprise tier is "Contact Us" and lives in PRICING_TIERS in types/job2.ts.
export const PRICING_CONFIG = {
  standard: {
    name: 'Standard',
    price: 9900, // $99.00 in cents
    priceDisplay: '$99',
    description: '30-day job posting',
    isFeatured: false,
    features: [
      '30-day listing',
      'Basic search ranking',
      'Standard support',
      'Job analytics',
    ],
  },
  featured: {
    name: 'Featured',
    price: 29900, // $299.00 in cents
    priceDisplay: '$299',
    description: 'Featured 30-day posting',
    isFeatured: true,
    popular: true,
    features: [
      '30-day featured listing',
      'Top search ranking',
      'Homepage feature',
      'Priority support',
      'Advanced analytics',
      'Social media promotion',
    ],
  },
} as const;

export type PricingTier = keyof typeof PRICING_CONFIG;

// Job seeker subscription pricing
export const JOBSEEKER_PRICING_CONFIG = {
  intelligence: {
    monthly: {
      name: 'AJA Intelligence - Monthly',
      price: 1499, // $14.99/month in cents
      priceDisplay: '$14.99',
      interval: 'month' as const,
      description: 'Premium AI insights for job seekers',
    },
    annual: {
      name: 'AJA Intelligence - Annual',
      price: 9900, // $99/year in cents
      priceDisplay: '$99',
      pricePerMonth: '$8.25',
      interval: 'year' as const,
      description: 'Premium AI insights for job seekers - annual plan',
      savingsPercent: 45,
    },
    features: [
      'Role summaries in plain English',
      'AI Focus scores on all job listings',
      'Interview difficulty predictions',
      'Who this role is for — self-assess fit',
      'Who this role is NOT for — spot red flags',
      'Autonomy vs process insights',
      'Promotion likelihood signals',
      'Skills match analysis',
    ],
  },
} as const;

export type JobSeekerPricingTier = keyof typeof JOBSEEKER_PRICING_CONFIG;

// Helper function to validate pricing tier
export function isValidPricingTier(tier: string): tier is PricingTier {
  return tier in PRICING_CONFIG;
}

// Helper function to get pricing info
export function getPricingInfo(tier: PricingTier) {
  return PRICING_CONFIG[tier];
}

// Helper function to format price for display
export function formatPrice(amountInCents: number, currency: string = 'AUD'): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: currency,
  }).format(amountInCents / 100);
}