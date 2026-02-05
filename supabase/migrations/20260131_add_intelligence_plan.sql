-- Add 'intelligence' plan type to subscriptions table for AJA Intelligence feature
-- This allows job seekers to subscribe for premium AI insights

-- First, drop the existing constraint
ALTER TABLE public.subscriptions
DROP CONSTRAINT IF EXISTS subscriptions_plan_type_check;

-- Add new constraint that includes 'intelligence' plan type
ALTER TABLE public.subscriptions
ADD CONSTRAINT subscriptions_plan_type_check
CHECK (plan_type IN ('professional', 'enterprise', 'free', 'intelligence'));

-- Add comment for documentation
COMMENT ON CONSTRAINT subscriptions_plan_type_check ON public.subscriptions IS 'Allowed plan types: professional, enterprise, free, intelligence';
