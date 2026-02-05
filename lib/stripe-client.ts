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

// Pricing configuration that matches our database
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
  annual: {
    name: 'Annual Plan',
    price: 99900, // $999.00 in cents
    priceDisplay: '$999',
    description: 'Unlimited postings for 1 year',
    isFeatured: true,
    isSubscription: true,
    features: [
      'Unlimited job postings',
      'All featured benefits',
      'Dedicated account manager',
      'Custom branding',
      'API access',
      'Priority placement',
    ],
  },
} as const;

export type PricingTier = keyof typeof PRICING_CONFIG;

// Job seeker subscription pricing
export const JOBSEEKER_PRICING_CONFIG = {
  intelligence: {
    name: 'AJA Intelligence',
    price: 1499, // $14.99/month in cents
    priceDisplay: '$14.99/mo',
    description: 'Premium AI insights for job seekers',
    features: [
      'AI Focus scores on all job listings',
      'Understand AI/ML relevance at a glance',
      'Prioritise your applications effectively',
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