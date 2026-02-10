import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Subscription {
  id: string;
  user_id: string;
  plan_type: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  price_per_month: number | null;
  features: Record<string, unknown> | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export const useSubscription = () => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // No subscription found is not an error
        if (error.code === 'PGRST116') {
          setSubscription(null);
        } else {
          console.error('Error fetching subscription:', error);
        }
      } else {
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  /**
   * Check if the user has access to AI Focus scores
   * Requires an active 'intelligence' subscription
   */
  const hasAIFocusAccess = useCallback((): boolean => {
    if (!subscription) return false;
    return subscription.plan_type === 'intelligence' && subscription.status === 'active';
  }, [subscription]);

  /**
   * Check if the subscription is currently active
   */
  const isActive = useCallback((): boolean => {
    if (!subscription) return false;
    return subscription.status === 'active';
  }, [subscription]);

  /**
   * Get the subscription end date
   */
  const getEndDate = useCallback((): Date | null => {
    if (!subscription?.current_period_end) return null;
    return new Date(subscription.current_period_end);
  }, [subscription]);

  return {
    subscription,
    loading,
    hasAIFocusAccess,
    isActive,
    getEndDate,
    refetch: fetchSubscription,
  };
};
