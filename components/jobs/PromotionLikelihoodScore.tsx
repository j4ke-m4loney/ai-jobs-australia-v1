"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowUpRight } from "lucide-react";

interface PromotionLikelihoodScoreProps {
  signal: "low" | "medium" | "high" | null;
  rationale: string | null;
  confidence: "high" | "medium" | "low" | null;
  analysedAt: string | null;
  className?: string;
  compact?: boolean;
}

/**
 * Get the display info for promotion likelihood signal
 * Green = high (good for career growth), Yellow = medium, Red = low
 */
function getSignalInfo(signal: string): {
  label: string;
  textClass: string;
  gradientFrom: string;
  gradientTo: string;
  borderClass: string;
} {
  switch (signal) {
    case "high":
      return {
        label: "High",
        textClass: "text-green-700",
        gradientFrom: "from-green-400",
        gradientTo: "to-green-600",
        borderClass: "border-green-300/40",
      };
    case "medium":
      return {
        label: "Medium",
        textClass: "text-yellow-700",
        gradientFrom: "from-yellow-400",
        gradientTo: "to-yellow-600",
        borderClass: "border-yellow-300/40",
      };
    case "low":
      return {
        label: "Low",
        textClass: "text-red-700",
        gradientFrom: "from-red-400",
        gradientTo: "to-red-600",
        borderClass: "border-red-300/40",
      };
    default:
      return {
        label: "Unknown",
        textClass: "text-gray-600",
        gradientFrom: "from-gray-400",
        gradientTo: "to-gray-600",
        borderClass: "border-gray-300/40",
      };
  }
}

export function PromotionLikelihoodScore({
  signal,
  rationale,
  confidence,
  analysedAt,
  className,
  compact = false,
}: PromotionLikelihoodScoreProps) {
  // Analysis pending state
  if (analysedAt === null || signal === null) {
    return (
      <div className={cn("flex items-center gap-2 text-muted-foreground", className)}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Promotion likelihood analysis pending...</span>
      </div>
    );
  }

  const signalInfo = getSignalInfo(signal);

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-lg p-2", className)}>
        <Badge
          className={cn(
            "text-xs font-medium px-2 py-0.5 text-white border-0",
            `bg-gradient-to-r ${signalInfo.gradientFrom} ${signalInfo.gradientTo}`
          )}
        >
          Promotion: {signalInfo.label}
        </Badge>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-teal-200/40 bg-white/70 backdrop-blur-xl p-3 sm:p-5 space-y-3 shadow-lg shadow-teal-500/10",
        className
      )}
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-teal-600 rounded-t-xl" />

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <div className="font-semibold text-slate-800 text-sm sm:text-base">
              Promotion Likelihood
            </div>
            <div className="text-xs text-muted-foreground">Career progression potential</div>
          </div>
        </div>
        {confidence && (
          <Badge
            variant="outline"
            className={cn(
              "capitalize text-xs bg-white/60 backdrop-blur-sm",
              confidence === "high" && "border-green-500 text-green-700",
              confidence === "medium" && "border-yellow-500 text-yellow-700",
              confidence === "low" && "border-gray-400 text-gray-600"
            )}
          >
            {confidence} confidence
          </Badge>
        )}
      </div>

      {/* Single badge display */}
      <div
        className={cn(
          "rounded-xl border p-3 text-center bg-white/60 backdrop-blur-sm",
          signalInfo.borderClass
        )}
      >
        <Badge
          className={cn(
            "text-sm font-semibold px-4 py-1 text-white border-0 shadow-sm",
            `bg-gradient-to-r ${signalInfo.gradientFrom} ${signalInfo.gradientTo}`
          )}
        >
          {signalInfo.label}
        </Badge>
      </div>

      {rationale && (
        <p className="text-sm text-slate-600 leading-relaxed">{rationale}</p>
      )}
    </div>
  );
}
