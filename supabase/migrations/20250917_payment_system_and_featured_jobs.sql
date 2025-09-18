-- Update subscriptions table to match our pricing tiers
ALTER TABLE public.subscriptions
DROP CONSTRAINT IF EXISTS subscriptions_plan_type_check;

ALTER TABLE public.subscriptions
ADD CONSTRAINT subscriptions_plan_type_check
CHECK (plan_type IN ('standard', 'featured', 'annual'));

-- Create payment_sessions table for tracking Stripe checkout sessions
CREATE TABLE public.payment_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_session_id TEXT NOT NULL UNIQUE,
  pricing_tier TEXT CHECK (pricing_tier IN ('standard', 'featured', 'annual')) NOT NULL,
  amount INTEGER NOT NULL, -- in cents
  currency TEXT NOT NULL DEFAULT 'aud',
  status TEXT CHECK (status IN ('pending', 'completed', 'expired', 'cancelled')) NOT NULL DEFAULT 'pending',
  job_form_data JSONB, -- Store job form data during payment process
  metadata JSONB DEFAULT '{}',
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payments table for completed payment records
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  payment_session_id UUID REFERENCES public.payment_sessions(id) ON DELETE SET NULL,
  stripe_payment_intent_id TEXT UNIQUE,
  stripe_charge_id TEXT,
  pricing_tier TEXT CHECK (pricing_tier IN ('standard', 'featured', 'annual')) NOT NULL,
  amount INTEGER NOT NULL, -- in cents
  currency TEXT NOT NULL DEFAULT 'aud',
  status TEXT CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled', 'refunded')) NOT NULL DEFAULT 'pending',
  payment_method_type TEXT, -- card, bank_transfer, etc.
  receipt_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add featured job fields to jobs table
ALTER TABLE public.jobs
ADD COLUMN IF NOT EXISTS payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS featured_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS featured_order INTEGER DEFAULT 0;

-- Update jobs status constraint to include payment-related statuses
ALTER TABLE public.jobs
DROP CONSTRAINT IF EXISTS jobs_status_check;

ALTER TABLE public.jobs
ADD CONSTRAINT jobs_status_check
CHECK (status IN ('draft', 'pending_payment', 'pending_approval', 'approved', 'rejected', 'expired', 'paused'));

-- Enable Row Level Security
ALTER TABLE public.payment_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Create policies for payment_sessions
CREATE POLICY "Users can view their own payment sessions" ON public.payment_sessions FOR
SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own payment sessions" ON public.payment_sessions FOR
UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment sessions" ON public.payment_sessions FOR
INSERT WITH CHECK (auth.uid() = user_id);

-- Create policies for payments
CREATE POLICY "Users can view their own payments" ON public.payments FOR
SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own payments" ON public.payments FOR
UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payments" ON public.payments FOR
INSERT WITH CHECK (auth.uid() = user_id);

-- Create triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payment_sessions_updated_at BEFORE
UPDATE ON public.payment_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE
UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_payment_sessions_user_id ON public.payment_sessions(user_id);
CREATE INDEX idx_payment_sessions_stripe_session_id ON public.payment_sessions(stripe_session_id);
CREATE INDEX idx_payment_sessions_status ON public.payment_sessions(status);
CREATE INDEX idx_payment_sessions_expires_at ON public.payment_sessions(expires_at);

CREATE INDEX idx_payments_user_id ON public.payments(user_id);
CREATE INDEX idx_payments_stripe_payment_intent_id ON public.payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_status ON public.payments(status);
CREATE INDEX idx_payments_pricing_tier ON public.payments(pricing_tier);

CREATE INDEX idx_jobs_payment_id ON public.jobs(payment_id);
CREATE INDEX idx_jobs_is_featured ON public.jobs(is_featured);
CREATE INDEX idx_jobs_featured_until ON public.jobs(featured_until);
CREATE INDEX idx_jobs_featured_order ON public.jobs(featured_order);

-- Create a view for active featured jobs
CREATE OR REPLACE VIEW public.featured_jobs AS
SELECT *
FROM public.jobs
WHERE is_featured = true
  AND featured_until > now()
  AND status = 'approved'
ORDER BY featured_order ASC, created_at DESC;

-- Create function to automatically expire featured jobs
CREATE OR REPLACE FUNCTION public.expire_featured_jobs()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE public.jobs
  SET is_featured = false
  WHERE is_featured = true
    AND featured_until <= now();

  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Add comments for documentation
COMMENT ON TABLE public.payment_sessions IS 'Tracks Stripe checkout sessions for job posting payments';
COMMENT ON TABLE public.payments IS 'Records of completed payment transactions';
COMMENT ON VIEW public.featured_jobs IS 'View of currently active featured jobs';
COMMENT ON FUNCTION public.expire_featured_jobs() IS 'Function to automatically expire featured jobs past their featured_until date';

-- Grant necessary permissions
GRANT SELECT ON public.featured_jobs TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.expire_featured_jobs() TO authenticated;