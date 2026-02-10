"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { JOBSEEKER_PRICING_CONFIG, formatPrice } from "@/lib/stripe-client";
import { JobSeekerLayout } from "@/components/jobseeker/JobSeekerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Check, CreditCard, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function JobSeekerBillingPage() {
  const { user } = useAuth();
  const { subscription, loading, refetch } = useSubscription();
  const [cancelling, setCancelling] = useState(false);

  const config = JOBSEEKER_PRICING_CONFIG.intelligence;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-AU", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleCancel = async () => {
    if (!user || !subscription) return;

    const endDate = subscription.current_period_end
      ? formatDate(subscription.current_period_end)
      : "the end of your billing period";

    const confirmed = window.confirm(
      `Cancel AJA Intelligence? You'll keep access until ${endDate}.`
    );

    if (!confirmed) return;

    setCancelling(true);
    try {
      const response = await fetch("/api/billing/subscription", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to cancel subscription");
      }

      toast.success("Subscription cancelled successfully");
      refetch();
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to cancel subscription"
      );
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <JobSeekerLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
          <Card>
            <CardHeader>
              <div className="h-5 bg-muted rounded w-1/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-2/3"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </JobSeekerLayout>
    );
  }

  const isIntelligence = subscription?.plan_type === "intelligence";
  const isActive = subscription?.status === "active";
  const isCancelled = subscription?.status === "cancelled";
  const hasSubscription = subscription && isIntelligence && (isActive || isCancelled);
  const billingInterval = (subscription?.metadata as Record<string, unknown>)?.billing_interval === "year" ? "year" : "month";
  const plan = billingInterval === "year" ? config.annual : config.monthly;

  return (
    <JobSeekerLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Billing</h1>
          <p className="text-muted-foreground">
            Manage your AJA Intelligence subscription
          </p>
        </div>

        {hasSubscription ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Plan name and status */}
              <div className="flex items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">AJA Intelligence</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(plan.price)} / {billingInterval === "year" ? "year" : "month"}
                  </p>
                </div>
                {isActive ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 shrink-0">Active</Badge>
                ) : (
                  <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 shrink-0">Cancelled</Badge>
                )}
              </div>

              {/* Billing period */}
              <div className="grid gap-4 md:grid-cols-2">
                {subscription.current_period_start && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Current Period
                      </p>
                      <p className="text-sm">
                        {formatDate(subscription.current_period_start)} &ndash;{" "}
                        {subscription.current_period_end &&
                          formatDate(subscription.current_period_end)}
                      </p>
                    </div>
                  </div>
                )}
                {subscription.current_period_end && (
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-4 h-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {isActive ? "Next Renewal" : "Access Until"}
                      </p>
                      <p className="text-sm">
                        {formatDate(subscription.current_period_end)}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Cancelled notice */}
              {isCancelled && subscription.current_period_end && (
                <div className="rounded-md bg-muted/50 p-4 text-sm text-muted-foreground">
                  Your subscription has been cancelled. You&apos;ll continue to
                  have access to all AJA Intelligence features until{" "}
                  <span className="font-medium text-foreground">
                    {formatDate(subscription.current_period_end)}
                  </span>
                  .
                </div>
              )}

              {/* Features */}
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  Plan Features
                </p>
                <ul className="grid gap-2 sm:grid-cols-2">
                  {config.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-3.5 h-3.5 text-green-600 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Cancel button */}
              {isActive && (
                <div className="pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={handleCancel}
                    disabled={cancelling}
                  >
                    {cancelling ? "Cancelling…" : "Cancel Subscription"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12">
              <div className="text-center max-w-md mx-auto">
                <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Subscription</h3>
                <p className="text-muted-foreground mb-6">
                  Unlock premium AI insights on every job listing with AJA
                  Intelligence — role summaries, AI focus scores, interview
                  difficulty predictions and more.
                </p>
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/jobs">Browse Jobs &amp; Subscribe</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </JobSeekerLayout>
  );
}
