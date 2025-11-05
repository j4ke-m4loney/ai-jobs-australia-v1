// Re-export pricing from job2.ts to maintain consistency across codebase
export { PRICING_TIERS } from '@/types/job2';

export interface JobPurchase {
  id: string;
  user_id: string;
  job_id: string;
  pricing_tier: 'standard' | 'featured' | 'annual';
  amount_paid: number; // in cents
  stripe_payment_intent_id: string | null;
  stripe_session_id: string | null;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  created_at: string;
  updated_at: string;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  stripe_payment_method_id: string | null;
  card_last_four: string | null;
  card_brand: string | null;
  card_exp_month: number | null;
  card_exp_year: number | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserBalance {
  id: string;
  user_id: string;
  standard_credits: number;
  featured_credits: number;
  annual_credits: number;
  total_spent: number; // in cents
  created_at: string;
  updated_at: string;
}

export interface BillingUpdateData {
  plan_type?: string;
  status?: string;
  current_period_start?: string;
  current_period_end?: string;
  price_per_month?: number;
  [key: string]: unknown; // Allow additional properties
}

export interface PaymentMethodUpdateData {
  stripe_payment_method_id?: string;
  card_last_four?: string;
  card_brand?: string;
  card_exp_month?: number;
  card_exp_year?: number;
  is_default?: boolean;
  [key: string]: unknown; // Allow additional properties
}

// Legacy support for existing code - gradually migrate away from these
export interface BillingPlan {
  id: string;
  name: string;
  price: number; // Updated to match job2 pricing (dollars, not cents)
  price_display: string;
  description: string;
  features: string[];
  popular?: boolean;
}

// Map job2 pricing to legacy billing format for backward compatibility
export const BILLING_PLANS: Record<string, BillingPlan> = {
  standard: {
    id: 'standard',
    name: 'Standard Job Posting',
    price: 99,
    price_display: '$99',
    description: '30-day job posting',
    features: [
      '30-day listing',
      'Basic search ranking',
      'Standard support',
      'Job analytics',
    ],
  },
  featured: {
    id: 'featured',
    name: 'Featured Job Posting',
    price: 299,
    price_display: '$299',
    description: 'Featured 30-day posting',
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
    id: 'annual',
    name: 'Annual Plan',
    price: 999,
    price_display: '$999',
    description: 'Unlimited postings for 1 year',
    features: [
      'Unlimited job postings',
      'All featured benefits',
      'Dedicated account manager',
      'Custom branding',
      'API access',
      'Priority placement',
    ],
  },
};