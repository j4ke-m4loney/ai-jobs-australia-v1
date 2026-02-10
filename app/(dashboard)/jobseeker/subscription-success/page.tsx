"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Sparkles,
  ArrowRight,
  FileText,
  TrendingUp,
  BarChart3,
  UserCheck,
  UserX,
  Zap,
  ArrowUpRight,
  Target,
} from "lucide-react";
import { useSubscription } from "@/hooks/useSubscription";
import { trackIntelligenceSubscribed } from "@/lib/analytics";

const features = [
  {
    icon: FileText,
    title: "Role Summaries",
    description: "Plain English explanations of what the job actually involves",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    icon: TrendingUp,
    title: "AI Focus Score",
    description: "See how AI/ML-focused each role really is (0–100%)",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: BarChart3,
    title: "Interview Difficulty",
    description: "Know what you're walking into before you apply",
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
  {
    icon: UserCheck,
    title: "Who It's For",
    description: "Quickly self-assess if you're the ideal candidate",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    icon: UserX,
    title: "Who It's NOT For",
    description: "Spot red flags and avoid wasting your time",
    color: "text-rose-600",
    bg: "bg-rose-50",
  },
  {
    icon: Zap,
    title: "Autonomy vs Process",
    description: "Understand the role's independence and structure",
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    icon: ArrowUpRight,
    title: "Promotion Likelihood",
    description: "Gauge career progression potential in the role",
    color: "text-teal-600",
    bg: "bg-teal-50",
  },
  {
    icon: Target,
    title: "Skills Match",
    description: "See how your skills stack up against requirements",
    color: "text-pink-600",
    bg: "bg-pink-50",
  },
];

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refetch } = useSubscription();
  const hasTracked = useRef(false);

  useEffect(() => {
    // Refetch subscription status to update the UI
    refetch();

    // Track subscription success (once)
    if (!hasTracked.current) {
      hasTracked.current = true;
      trackIntelligenceSubscribed({
        session_id: searchParams.get("session_id") ?? undefined,
      });
    }
  }, [refetch, searchParams]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold">Welcome to AJA Intelligence!</h1>
        <p className="text-muted-foreground mt-2">
          Your subscription is now active. Every job listing now comes with AI-powered insights to help you apply smarter.
        </p>
      </div>

      {/* How to use it */}
      <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50 p-5 mb-8">
        <h2 className="font-semibold text-sm text-purple-900 mb-3">How to use AJA Intelligence</h2>
        <div className="flex items-start gap-4">
          <div className="flex-1 space-y-2 text-sm text-purple-800">
            <p>
              When viewing any job listing, look for the{" "}
              <span className="inline-flex items-center gap-1 font-medium text-purple-600">
                <Sparkles className="w-3 h-3" />
                Analyse Role
              </span>{" "}
              link. Click it to open a full AI analysis of the role.
            </p>
          </div>
          <div className="flex-shrink-0">
            <div className="rounded-lg border border-purple-200 bg-white px-4 py-3 shadow-sm">
              <div className="text-[10px] text-muted-foreground mb-1">Posted 2 days ago</div>
              <button
                className="flex items-center gap-1 text-xs text-purple-600 font-medium"
                tabIndex={-1}
                aria-hidden
              >
                <Sparkles className="w-3 h-3" />
                Analyse Role
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="mb-8">
        <h2 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide mb-4">What&apos;s included in your subscription</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card"
            >
              <div
                className={`w-9 h-9 rounded-lg ${feature.bg} flex items-center justify-center flex-shrink-0`}
              >
                <feature.icon className={`w-4.5 h-4.5 ${feature.color}`} />
              </div>
              <div>
                <div className="text-sm font-medium">{feature.title}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {feature.description}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-3">
        <Button
          onClick={() => router.push("/jobs")}
          className="w-full gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white h-12 text-base"
          size="lg"
        >
          <Sparkles className="w-4 h-4" />
          Browse Jobs with Intelligence
          <ArrowRight className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push("/jobseeker")}
          className="w-full"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
