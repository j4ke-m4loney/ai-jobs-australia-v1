"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

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
  bgClass: string;
  textClass: string;
  borderClass: string;
} {
  switch (signal) {
    case "high":
      return {
        label: "High",
        bgClass: "bg-green-100",
        textClass: "text-green-800",
        borderClass: "border-green-300",
      };
    case "medium":
      return {
        label: "Medium",
        bgClass: "bg-yellow-100",
        textClass: "text-yellow-800",
        borderClass: "border-yellow-300",
      };
    case "low":
      return {
        label: "Low",
        bgClass: "bg-red-100",
        textClass: "text-red-800",
        borderClass: "border-red-300",
      };
    default:
      return {
        label: "Unknown",
        bgClass: "bg-gray-100",
        textClass: "text-gray-600",
        borderClass: "border-gray-300",
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
      <div className={cn("flex items-center gap-2", className)}>
        <Badge
          className={cn(
            "text-xs font-medium px-2 py-0.5",
            signalInfo.bgClass,
            signalInfo.textClass,
            signalInfo.borderClass,
            "border"
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
        "rounded-lg border p-4 space-y-3 bg-slate-50 border-slate-200",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-lg">📈</div>
          <div>
            <div className="font-semibold text-slate-800">
              Promotion Likelihood
            </div>
            <div className="text-xs text-muted-foreground">Career progression potential</div>
          </div>
        </div>
        {confidence && (
          <Badge
            variant="outline"
            className={cn(
              "capitalize text-xs",
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
          "rounded-lg border p-3 text-center",
          signalInfo.bgClass,
          signalInfo.borderClass
        )}
      >
        <Badge
          className={cn(
            "text-sm font-semibold px-4 py-1",
            "bg-white",
            signalInfo.textClass,
            signalInfo.borderClass,
            "border"
          )}
        >
          {signalInfo.label}
        </Badge>
      </div>

      {rationale && (
        <p className="text-sm text-foreground/80 leading-relaxed">{rationale}</p>
      )}
    </div>
  );
}
