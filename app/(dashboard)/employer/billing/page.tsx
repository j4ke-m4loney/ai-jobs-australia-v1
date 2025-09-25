"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CreditCard,
  Calendar,
  DollarSign,
  FileText,
  Plus,
  Download,
  Star,
  Check,
  AlertCircle,
  Trash2,
  Edit,
} from 'lucide-react';
import { formatPrice, PRICING_CONFIG } from '@/lib/stripe-client';

interface Subscription {
  id: string;
  plan_type: 'standard' | 'featured' | 'annual';
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  price_per_month: number;
  features: string[];
}

interface Payment {
  id: string;
  pricing_tier: 'standard' | 'featured' | 'annual';
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending' | 'refunded';
  payment_method_type: string;
  receipt_url: string;
  created_at: string;
}

interface PaymentMethod {
  id: string;
  card_last_four: string;
  card_brand: string;
  card_exp_month: number;
  card_exp_year: number;
  is_default: boolean;
}

export default function BillingPage() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBillingData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('💳 Billing Page - Fetching data for user:', user.id);

      // Fetch real data from APIs
      const [subscriptionResponse, paymentHistoryResponse, paymentMethodsResponse] = await Promise.all([
        fetch(`/api/billing/subscription?userId=${user.id}`),
        fetch(`/api/billing/payment-history?userId=${user.id}`),
        fetch(`/api/billing/payment-methods?userId=${user.id}`)
      ]);

      console.log('💳 Billing Page - API responses received:', {
        subscription: { status: subscriptionResponse.status, ok: subscriptionResponse.ok },
        paymentHistory: { status: paymentHistoryResponse.status, ok: paymentHistoryResponse.ok },
        paymentMethods: { status: paymentMethodsResponse.status, ok: paymentMethodsResponse.ok }
      });

      // Handle subscription data
      if (subscriptionResponse.ok) {
        const subscriptionData = await subscriptionResponse.json();
        console.log('💳 Billing Page - Subscription data:', subscriptionData);
        setSubscription(subscriptionData.subscription);
      } else {
        console.error('Failed to fetch subscription data:', subscriptionResponse.status);
        setSubscription(null);
      }

      // Handle payment history
      if (paymentHistoryResponse.ok) {
        const paymentData = await paymentHistoryResponse.json();
        console.log('💳 Billing Page - Payment history data:', {
          paymentsReceived: paymentData.payments?.length || 0,
          total: paymentData.total,
          samplePayment: paymentData.payments?.[0],
          fullData: paymentData
        });
        setPayments(paymentData.payments || []);
      } else {
        console.error('Failed to fetch payment history:', paymentHistoryResponse.status);
        setPayments([]);
      }

      // Handle payment methods
      if (paymentMethodsResponse.ok) {
        const paymentMethodsData = await paymentMethodsResponse.json();
        console.log('💳 Billing Page - Payment methods data:', paymentMethodsData);
        setPaymentMethods(paymentMethodsData.paymentMethods || []);
      } else {
        console.error('Failed to fetch payment methods:', paymentMethodsResponse.status);
        setPaymentMethods([]);
      }

    } catch (err: unknown) {
      console.error('Error fetching billing data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      // Set empty data on error
      setSubscription(null);
      setPayments([]);
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchBillingData();
    }
  }, [user, fetchBillingData]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      succeeded: 'bg-green-100 text-green-800',
      active: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-gray-100 text-gray-800',
      past_due: 'bg-orange-100 text-orange-800',
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            Error loading billing information: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Billing</h1>
          <p className="text-muted-foreground">
            Manage your subscription, payment methods, and billing history
          </p>
        </div>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    {PRICING_CONFIG[subscription.plan_type].name}
                  </h3>
                  <p className="text-muted-foreground">
                    {formatPrice(subscription.price_per_month)} per month
                  </p>
                </div>
                {getStatusBadge(subscription.status)}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Current Period</p>
                  <p className="text-sm">
                    {formatDate(subscription.current_period_start)} - {formatDate(subscription.current_period_end)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Next Billing Date</p>
                  <p className="text-sm">{formatDate(subscription.current_period_end)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Plan Features</p>
                <ul className="space-y-1">
                  {PRICING_CONFIG[subscription.plan_type].features.map((feature, index) => (
                    <li key={index} className="text-sm flex items-center gap-2">
                      <Check className="w-3 h-3 text-green-600" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Change Plan
                </Button>
                <Button variant="outline" size="sm">
                  Cancel Subscription
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Active Subscription</h3>
              <p className="text-muted-foreground mb-4">
                Upgrade to an annual plan for unlimited featured job postings
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Choose a Plan
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Payment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paymentMethods.length > 0 ? (
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center">
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {method.card_brand.toUpperCase()} •••• {method.card_last_four}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Expires {method.card_exp_month}/{method.card_exp_year}
                        {method.is_default && <span className="ml-2 text-primary">• Default</span>}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Payment Methods</h3>
              <p className="text-muted-foreground mb-4">
                Add a payment method to make job posting easier
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Payment Method
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Payment History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                      <DollarSign className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {PRICING_CONFIG[payment.pricing_tier].name} Job Posting
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(payment.created_at)} • {payment.payment_method_type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(payment.amount)}</p>
                      {getStatusBadge(payment.status)}
                    </div>
                    {payment.receipt_url && (
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Payment History</h3>
              <p className="text-muted-foreground">
                Your payment history will appear here after your first job posting
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage & Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Usage This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">3</div>
              <p className="text-sm text-muted-foreground">Jobs Posted</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">2</div>
              <p className="text-sm text-muted-foreground">Featured Jobs</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">147</div>
              <p className="text-sm text-muted-foreground">Total Views</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}