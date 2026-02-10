"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sparkles,
  Check,
  FileText,
  TrendingUp,
  BarChart3,
  UserCheck,
  UserX,
  Zap,
  ArrowUpRight,
  Target,
  Shield,
  Star,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { JOBSEEKER_PRICING_CONFIG } from "@/lib/stripe-client";
import {
  trackIntelligenceModalViewed,
  trackIntelligenceBillingToggle,
  trackIntelligenceCheckoutClicked,
  trackIntelligenceSigninPrompt,
} from "@/lib/analytics";

type BillingInterval = "month" | "year";

interface AJAIntelligenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  source?: string;
}

const testimonials = [
  {
    quote:
      "The AI Focus Score saved me so much time. I stopped applying to roles that were barely AI-related and landed a proper ML Engineer role in 3 weeks.",
    name: "Sarah M.",
    role: "ML Engineer, Sydney",
    initials: "SM",
    color: "bg-purple-500",
  },
  {
    quote:
      "Interview difficulty predictions were spot on. I knew exactly which roles needed more prep, and it made a huge difference to my confidence.",
    name: "James T.",
    role: "Data Scientist, Melbourne",
    initials: "JT",
    color: "bg-blue-500",
  },
  {
    quote:
      "The 'Who It's NOT For' feature is honestly brilliant. Saved me from applying to a role that sounded great but was clearly not for someone at my level.",
    name: "Priya K.",
    role: "AI Research Engineer, Brisbane",
    initials: "PK",
    color: "bg-emerald-500",
  },
  {
    quote:
      "I love the role summaries — they cut through the corporate jargon and tell you what the job actually is. Worth every cent of the subscription.",
    name: "Daniel W.",
    role: "NLP Engineer, Perth",
    initials: "DW",
    color: "bg-orange-500",
  },
  {
    quote:
      "Skills match told me exactly what I was missing for my dream role. I upskilled in two areas and got the offer. Absolute game changer.",
    name: "Lisa C.",
    role: "Computer Vision Engineer, Adelaide",
    initials: "LC",
    color: "bg-pink-500",
  },
  {
    quote:
      "The autonomy vs process insights helped me avoid another micromanagement nightmare. Finally found a role where I can actually build things independently.",
    name: "Tom R.",
    role: "Senior ML Engineer, Canberra",
    initials: "TR",
    color: "bg-teal-500",
  },
];

export function AJAIntelligenceModal({
  isOpen,
  onClose,
  source = "unknown",
}: AJAIntelligenceModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>("year");

  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Track modal view
  useEffect(() => {
    if (isOpen) {
      trackIntelligenceModalViewed({ source });
    }
  }, [isOpen, source]);

  const features = [
    {
      icon: FileText,
      title: "Role Summaries",
      description: "Plain English explanations of what the job actually involves",
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      sample: (
        <span className="text-[11px] italic text-indigo-500/70 leading-tight line-clamp-1">
          &ldquo;Build ML pipelines for real-time fraud detection at scale&rdquo;
        </span>
      ),
    },
    {
      icon: TrendingUp,
      title: "AI Focus Score",
      description: "See how AI/ML-focused each role really is (0–100%)",
      color: "text-blue-600",
      bg: "bg-blue-50",
      sample: (
        <span className="inline-flex items-center text-[11px] font-medium rounded-full px-1.5 py-0.5 bg-blue-100 text-blue-700">
          82%
        </span>
      ),
    },
    {
      icon: BarChart3,
      title: "Interview Difficulty",
      description: "Know what you're walking into before you apply",
      color: "text-orange-600",
      bg: "bg-orange-50",
      sample: (
        <span className="inline-flex items-center text-[11px] font-medium rounded-full px-1.5 py-0.5 bg-orange-100 text-orange-700">
          Hard
        </span>
      ),
    },
    {
      icon: UserCheck,
      title: "Who It's For",
      description: "Quickly self-assess if you're the ideal candidate",
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      sample: (
        <span className="text-[11px] text-emerald-500/70 leading-tight line-clamp-1">
          ✓ Mid-level ML engineers ready to lead
        </span>
      ),
    },
    {
      icon: UserX,
      title: "Who It's NOT For",
      description: "Spot red flags and avoid wasting your time",
      color: "text-rose-600",
      bg: "bg-rose-50",
      sample: (
        <span className="text-[11px] text-rose-500/70 leading-tight line-clamp-1">
          ✗ Those seeking pure research roles
        </span>
      ),
    },
    {
      icon: Zap,
      title: "Autonomy vs Process",
      description: "Understand the role's independence and structure",
      color: "text-violet-600",
      bg: "bg-violet-50",
      sample: (
        <span className="inline-flex items-center gap-1">
          <span className="text-[11px] font-medium rounded-full px-1.5 py-0.5 bg-violet-100 text-violet-700">
            High Autonomy
          </span>
          <span className="text-[11px] font-medium rounded-full px-1.5 py-0.5 bg-violet-100 text-violet-700">
            Low Process
          </span>
        </span>
      ),
    },
    {
      icon: ArrowUpRight,
      title: "Promotion Likelihood",
      description: "Gauge career progression potential in the role",
      color: "text-teal-600",
      bg: "bg-teal-50",
      sample: (
        <span className="inline-flex items-center text-[11px] font-medium rounded-full px-1.5 py-0.5 bg-teal-100 text-teal-700">
          High
        </span>
      ),
    },
    {
      icon: Target,
      title: "Skills Match",
      description: "See how your skills stack up against requirements",
      color: "text-pink-600",
      bg: "bg-pink-50",
      sample: (
        <span className="inline-flex items-center text-[11px] font-medium rounded-full px-1.5 py-0.5 bg-pink-100 text-pink-700">
          74% match
        </span>
      ),
    },
  ];

  const pricing = JOBSEEKER_PRICING_CONFIG.intelligence;
  const isAnnual = billingInterval === "year";

  const nextTestimonial = useCallback(() => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  }, []);

  const prevTestimonial = useCallback(() => {
    setActiveTestimonial(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
  }, []);

  // Auto-rotate testimonials
  useEffect(() => {
    if (isPaused || !isOpen) return;
    const interval = setInterval(nextTestimonial, 5000);
    return () => clearInterval(interval);
  }, [isPaused, isOpen, nextTestimonial]);

  const handleSubscribe = async () => {
    if (!user?.email) {
      setError("Please sign in to subscribe");
      return;
    }

    setLoading(true);
    setError(null);

    trackIntelligenceCheckoutClicked({
      billing_interval: billingInterval,
      price: isAnnual ? pricing.annual.priceDisplay : pricing.monthly.priceDisplay,
    });

    try {
      const response = await fetch("/api/create-intelligence-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          billingInterval,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

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
      <DialogContent className="w-full max-w-lg p-0 overflow-hidden max-h-[90vh] overflow-y-auto [&>button]:text-white [&>button]:hover:text-white/80">
        {/* Gradient Header */}
        <div className="relative bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 px-6 pt-8 pb-6 text-white">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA4KSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgZmlsbD0idXJsKCNhKSIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIvPjwvc3ZnPg==')] opacity-50" />
          <DialogHeader className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center ring-1 ring-white/30">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-white">
                  AJA Intelligence
                </DialogTitle>
                <DialogDescription className="text-purple-100 text-sm">
                  Premium AI insights for smarter job hunting
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <p className="relative z-10 text-sm text-purple-100 leading-relaxed mt-2">
            Every job listing is analysed by AI to give you insights that go
            beyond the job ad. Stop guessing — start applying strategically.
          </p>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 pt-5 space-y-6">
          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div
                  className={`w-8 h-8 rounded-lg ${feature.bg} flex items-center justify-center flex-shrink-0`}
                >
                  <feature.icon className={`w-4 h-4 ${feature.color}`} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground leading-tight">
                    {feature.title}
                  </div>
                  <div className="text-xs text-muted-foreground leading-snug mt-0.5">
                    {feature.description}
                  </div>
                  {feature.sample && (
                    <div className="mt-1.5 flex items-center gap-1.5 rounded-md bg-muted/60 border border-border/40 px-2 py-1">
                      <span className="text-[10px] font-medium text-muted-foreground/60 uppercase shrink-0">e.g.</span>
                      {feature.sample}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Toggle */}
          <div className="flex flex-col items-center gap-4">
            <div className="inline-flex items-center bg-muted rounded-full p-1 gap-1">
              <button
                type="button"
                onClick={() => {
                  setBillingInterval("month");
                  trackIntelligenceBillingToggle({ selected_interval: "month" });
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  !isAnnual
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => {
                  setBillingInterval("year");
                  trackIntelligenceBillingToggle({ selected_interval: "year" });
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                  isAnnual
                    ? "bg-white text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Annual
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded-full">
                  SAVE {pricing.annual.savingsPercent}%
                </span>
              </button>
            </div>

            {/* Price Display */}
            <div className="text-center">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-foreground">
                  {isAnnual
                    ? pricing.annual.priceDisplay
                    : pricing.monthly.priceDisplay}
                </span>
                <span className="text-muted-foreground text-sm">
                  /{isAnnual ? "year" : "month"}
                </span>
              </div>
              {isAnnual && (
                <p className="text-sm text-emerald-600 font-medium mt-1">
                  Just {pricing.annual.pricePerMonth}/month — save $80.88/year
                </p>
              )}
            </div>
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
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/25 h-12 text-base"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                "Redirecting to checkout..."
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Get AJA Intelligence
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => {
                trackIntelligenceSigninPrompt({ billing_interval: billingInterval });
                onClose();
                window.location.href = "/login?redirect=/jobs";
              }}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg shadow-purple-500/25 h-12 text-base"
              size="lg"
            >
              Sign in to Subscribe
            </Button>
          )}

          {/* Trust Signals */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              <span>Cancel anytime</span>
            </div>
            <span className="text-muted-foreground/40">•</span>
            <div className="flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>No lock-in contracts</span>
            </div>
            <span className="text-muted-foreground/40">•</span>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Instant access</span>
            </div>
          </div>

          {/* Testimonials */}
          <div
            className="relative"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="rounded-xl bg-muted/40 border border-border/50 p-4">
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-full ${testimonials[activeTestimonial].color} flex items-center justify-center flex-shrink-0 text-white text-xs font-bold`}
                >
                  {testimonials[activeTestimonial].initials}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-3 h-3 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    &ldquo;{testimonials[activeTestimonial].quote}&rdquo;
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    <span className="font-medium text-foreground">
                      {testimonials[activeTestimonial].name}
                    </span>{" "}
                    — {testimonials[activeTestimonial].role}
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-3">
                <button
                  type="button"
                  onClick={prevTestimonial}
                  className="p-1 rounded-full hover:bg-muted-foreground/10 transition-colors text-muted-foreground"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1.5">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveTestimonial(i)}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        i === activeTestimonial
                          ? "bg-purple-500 w-4"
                          : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                      }`}
                      aria-label={`Go to testimonial ${i + 1}`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={nextTestimonial}
                  className="p-1 rounded-full hover:bg-muted-foreground/10 transition-colors text-muted-foreground"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
