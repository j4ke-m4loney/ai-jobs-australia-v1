"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface AIFocusScoreProps {
  percentage: number | null;
  rationale: string | null;
  confidence: "high" | "medium" | "low" | null;
  analysedAt: string | null;
  className?: string;
  compact?: boolean;
}

/**
 * Get the label and colour for an AI Focus score
 */
function getScoreInfo(percentage: number): {
  label: string;
  textClass: string;
  borderClass: string;
  gradientFrom: string;
  gradientTo: string;
  shadowClass: string;
} {
  if (percentage >= 80) {
    return {
      label: "Highly AI-Focused",
      textClass: "text-green-700",
      borderClass: "border-green-400/50",
      gradientFrom: "from-green-400",
      gradientTo: "to-green-600",
      shadowClass: "shadow-green-500/10",
    };
  }
  if (percentage >= 60) {
    return {
      label: "Strongly AI-Related",
      textClass: "text-blue-700",
      borderClass: "border-blue-400/50",
      gradientFrom: "from-blue-400",
      gradientTo: "to-blue-600",
      shadowClass: "shadow-blue-500/10",
    };
  }
  if (percentage >= 40) {
    return {
      label: "Moderately AI-Related",
      textClass: "text-yellow-700",
      borderClass: "border-yellow-400/50",
      gradientFrom: "from-yellow-400",
      gradientTo: "to-yellow-600",
      shadowClass: "shadow-yellow-500/10",
    };
  }
  if (percentage >= 20) {
    return {
      label: "Some AI Elements",
      textClass: "text-orange-700",
      borderClass: "border-orange-400/50",
      gradientFrom: "from-orange-400",
      gradientTo: "to-orange-600",
      shadowClass: "shadow-orange-500/10",
    };
  }
  return {
    label: "Limited AI Focus",
    textClass: "text-gray-600",
    borderClass: "border-gray-400/50",
    gradientFrom: "from-gray-400",
    gradientTo: "to-gray-600",
    shadowClass: "shadow-gray-500/10",
  };
}

export function AIFocusScore({
  percentage,
  rationale,
  confidence,
  analysedAt,
  className,
  compact = false,
}: AIFocusScoreProps) {
  // Analysis pending state
  if (analysedAt === null || percentage === null) {
    return (
      <div className={cn("flex items-center gap-2 text-muted-foreground", className)}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">AI Focus analysis pending...</span>
      </div>
    );
  }

  const scoreInfo = getScoreInfo(percentage);

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-lg p-2", className)}>
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold text-sm bg-white/90 backdrop-blur-sm shadow-sm",
            scoreInfo.textClass,
            scoreInfo.borderClass
          )}
        >
          {percentage}
        </div>
        <span className={cn("text-sm font-medium", scoreInfo.textClass)}>
          {scoreInfo.label}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-slate-200/40 bg-white/70 backdrop-blur-xl p-3 sm:p-5 space-y-3 shadow-lg",
        scoreInfo.shadowClass,
        className
      )}
    >
      {/* Top accent bar */}
      <div className={cn("absolute top-0 left-0 right-0 h-1 bg-gradient-to-r rounded-t-xl", scoreInfo.gradientFrom, scoreInfo.gradientTo)} />

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div
            className={cn(
              "flex items-center justify-center w-11 h-11 sm:w-14 sm:h-14 rounded-full border-2 font-bold text-sm sm:text-lg bg-white/90 backdrop-blur-sm shadow-lg",
              scoreInfo.textClass,
              scoreInfo.borderClass
            )}
          >
            {percentage}%
          </div>
          <div>
            <div className={cn("font-semibold text-sm sm:text-base", scoreInfo.textClass)}>
              {scoreInfo.label}
            </div>
            <div className="text-xs text-muted-foreground">AI Focus Score</div>
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

      {rationale && (
        <p className="text-sm text-slate-600 leading-relaxed">{rationale}</p>
      )}
    </div>
  );
}
