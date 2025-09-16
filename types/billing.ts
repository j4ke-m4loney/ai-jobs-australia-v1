export interface Subscription {
  id: string;
  user_id: string;
  plan_type: 'professional' | 'enterprise' | 'free';
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  current_period_start: string | null;
  current_period_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  price_per_month: number | null; // in cents
  features: Record<string, any>;
  metadata: Record<string, any>;
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

export interface BillingPlan {
  id: string;
  name: string;
  price_per_month: number; // in cents
  price_display: string;
  description: string;
  features: string[];
  popular?: boolean;
}

export const BILLING_PLANS: Record<string, BillingPlan> = {
  free: {
    id: 'free',
    name: 'Free',
    price_per_month: 0,
    price_display: 'Free',
    description: 'Basic job posting',
    features: [
      '1 active job posting',
      'Basic search visibility',
      'Standard support',
      '30-day listing duration',
    ],
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    price_per_month: 9900, // $99.00
    price_display: '$99/month',
    description: 'Enhanced hiring tools',
    popular: true,
    features: [
      '10 active job postings',
      'Priority search ranking',
      'Advanced analytics',
      'Premium support',
      'Unlimited listing duration',
      'Candidate management tools',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price_per_month: 29900, // $299.00
    price_display: '$299/month',
    description: 'Complete hiring solution',
    features: [
      'Unlimited job postings',
      'Top search ranking',
      'Advanced analytics & reporting',
      'Dedicated account manager',
      'Custom integrations',
      'Priority support',
      'Brand customization',
      'API access',
    ],
  },
};

export interface BillingUpdateData {
  plan_type?: 'professional' | 'enterprise' | 'free';
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  current_period_start?: string;
  current_period_end?: string;
  status?: 'active' | 'cancelled' | 'past_due' | 'trialing';
  price_per_month?: number;
  features?: Record<string, any>;
}

export interface PaymentMethodUpdateData {
  stripe_payment_method_id?: string;
  card_last_four?: string;
  card_brand?: string;
  card_exp_month?: number;
  card_exp_year?: number;
  is_default?: boolean;
}