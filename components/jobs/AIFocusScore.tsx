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
  bgClass: string;
  textClass: string;
  borderClass: string;
} {
  if (percentage >= 80) {
    return {
      label: "Highly AI-Focused",
      bgClass: "bg-green-100",
      textClass: "text-green-800",
      borderClass: "border-green-300",
    };
  }
  if (percentage >= 60) {
    return {
      label: "Strongly AI-Related",
      bgClass: "bg-blue-100",
      textClass: "text-blue-800",
      borderClass: "border-blue-300",
    };
  }
  if (percentage >= 40) {
    return {
      label: "Moderately AI-Related",
      bgClass: "bg-yellow-100",
      textClass: "text-yellow-800",
      borderClass: "border-yellow-300",
    };
  }
  if (percentage >= 20) {
    return {
      label: "Some AI Elements",
      bgClass: "bg-orange-100",
      textClass: "text-orange-800",
      borderClass: "border-orange-300",
    };
  }
  return {
    label: "Limited AI Focus",
    bgClass: "bg-gray-100",
    textClass: "text-gray-600",
    borderClass: "border-gray-300",
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
      <div className={cn("flex items-center gap-2", className)}>
        <div
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold text-sm",
            scoreInfo.bgClass,
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
        "rounded-lg border p-4 space-y-3",
        scoreInfo.bgClass,
        scoreInfo.borderClass,
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-full border-2 font-bold text-lg",
              "bg-white",
              scoreInfo.textClass,
              scoreInfo.borderClass
            )}
          >
            {percentage}%
          </div>
          <div>
            <div className={cn("font-semibold", scoreInfo.textClass)}>
              {scoreInfo.label}
            </div>
            <div className="text-xs text-muted-foreground">AI Focus Score</div>
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

      {rationale && (
        <p className="text-sm text-foreground/80 leading-relaxed">{rationale}</p>
      )}
    </div>
  );
}
