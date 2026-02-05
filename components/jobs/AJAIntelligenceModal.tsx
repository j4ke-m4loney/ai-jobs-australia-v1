"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { Sparkles, Check, Lock, TrendingUp, Target, BarChart3, FileText, UserCheck, UserX } from "lucide-react";
import { JOBSEEKER_PRICING_CONFIG } from "@/lib/stripe-client";

interface AJAIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AJAIntelligenceModal({ isOpen, onClose }: AJAIntelligenceModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pricing = JOBSEEKER_PRICING_CONFIG.intelligence;

  const handleSubscribe = async () => {
    if (!user?.email) {
      setError("Please sign in to subscribe");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/create-intelligence-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md">
        <DialogHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
          <DialogTitle className="text-xl font-bold">
            AJA Intelligence
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Premium AI insights to power your job search
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-6">
          {/* What is AJA Intelligence */}
          <div className="space-y-3">
            <h3 className="font-semibold text-foreground">
              What is AJA Intelligence?
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every job on AI Jobs Australia is analysed by our AI to provide valuable insights. Get <strong>Role Summaries</strong> in plain English, <strong>AI Focus Scores</strong> to see how AI/ML-focused each role is, <strong>Interview Difficulty</strong> predictions, <strong>Who This Role Is For</strong>, and <strong>Who This Role Is NOT For</strong> to quickly assess if a job is right for you.
            </p>
          </div>

          {/* Score Previews (locked) */}
          <div className="relative rounded-lg border border-dashed border-muted-foreground/30 p-4 bg-muted/30 space-y-3">
            <div className="flex items-center gap-3 opacity-50">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-indigo-300 bg-indigo-100">
                <FileText className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <div className="font-semibold text-indigo-800">
                  Role Summary
                </div>
                <div className="text-xs text-muted-foreground">Plain English explanation</div>
              </div>
            </div>
            <div className="flex items-center gap-3 opacity-50">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-blue-300 bg-blue-100 font-bold text-sm text-blue-800">
                72%
              </div>
              <div>
                <div className="font-semibold text-blue-800">
                  Strongly AI-Related
                </div>
                <div className="text-xs text-muted-foreground">AI Focus Score</div>
              </div>
            </div>
            <div className="flex items-center gap-3 opacity-50">
              <div className="flex items-center justify-center w-10 h-6 rounded border border-orange-300 bg-orange-100 font-semibold text-xs text-orange-800">
                Hard
              </div>
              <div>
                <div className="font-semibold text-orange-800">
                  Interview Difficulty
                </div>
                <div className="text-xs text-muted-foreground">Predicted challenge level</div>
              </div>
            </div>
            <div className="flex items-center gap-3 opacity-50">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-emerald-300 bg-emerald-100">
                <UserCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <div className="font-semibold text-emerald-800">
                  Who This Is For
                </div>
                <div className="text-xs text-muted-foreground">Ideal candidate profile</div>
              </div>
            </div>
            <div className="flex items-center gap-3 opacity-50">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-amber-300 bg-amber-100">
                <UserX className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <div className="font-semibold text-amber-800">
                  Who This Is NOT For
                </div>
                <div className="text-xs text-muted-foreground">Consider carefully if...</div>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-lg">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Lock className="w-4 h-4" />
                <span className="text-sm font-medium">Subscribe to unlock</span>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Role summaries in plain English</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">AI Focus scores on all job listings</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Interview difficulty predictions</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Who this role is for - self-assess fit</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              <div className="flex items-center gap-2">
                <UserX className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Who this role is NOT for - spot red flags</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Check className="w-3 h-3 text-green-600" />
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">Prioritise your applications effectively</span>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="text-center pt-2">
            <div className="text-3xl font-bold text-foreground">
              {pricing.priceDisplay}
            </div>
            <div className="text-sm text-muted-foreground">per month</div>
          </div>

          {/* Error message */}
          {error && (
            <div className="text-sm text-red-600 text-center bg-red-50 rounded-md p-2">
              {error}
            </div>
          )}

          {/* CTA */}
          {user ? (
            <Button
              onClick={handleSubscribe}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                "Redirecting to checkout..."
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Subscribe Now
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => {
                onClose();
                window.location.href = "/login?redirect=/jobs";
              }}
              className="w-full"
              size="lg"
            >
              Sign in to Subscribe
            </Button>
          )}

          {/* Footer */}
          <p className="text-xs text-center text-muted-foreground">
            Cancel anytime. No lock-in contracts.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
