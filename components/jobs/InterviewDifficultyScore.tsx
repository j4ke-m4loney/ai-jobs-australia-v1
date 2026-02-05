"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

interface InterviewDifficultyScoreProps {
  level: "easy" | "medium" | "hard" | "very_hard" | null;
  rationale: string | null;
  confidence: "high" | "medium" | "low" | null;
  analysedAt: string | null;
  className?: string;
  compact?: boolean;
}

/**
 * Get the display info for an interview difficulty level
 */
function getDifficultyInfo(level: string): {
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
} {
  switch (level) {
    case "easy":
      return {
        label: "Easy",
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
    case "hard":
      return {
        label: "Hard",
        bgClass: "bg-orange-100",
        textClass: "text-orange-800",
        borderClass: "border-orange-300",
      };
    case "very_hard":
      return {
        label: "Very Hard",
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

export function InterviewDifficultyScore({
  level,
  rationale,
  confidence,
  analysedAt,
  className,
  compact = false,
}: InterviewDifficultyScoreProps) {
  // Analysis pending state
  if (analysedAt === null || level === null) {
    return (
      <div className={cn("flex items-center gap-2 text-muted-foreground", className)}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Interview difficulty analysis pending...</span>
      </div>
    );
  }

  const difficultyInfo = getDifficultyInfo(level);

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Badge
          className={cn(
            "text-xs font-medium px-2 py-0.5",
            difficultyInfo.bgClass,
            difficultyInfo.textClass,
            difficultyInfo.borderClass,
            "border"
          )}
        >
          {difficultyInfo.label}
        </Badge>
        <span className="text-sm text-muted-foreground">Interview Difficulty</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border p-4 space-y-3",
        difficultyInfo.bgClass,
        difficultyInfo.borderClass,
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge
            className={cn(
              "text-sm font-semibold px-3 py-1",
              "bg-white",
              difficultyInfo.textClass,
              difficultyInfo.borderClass,
              "border"
            )}
          >
            {difficultyInfo.label}
          </Badge>
          <div>
            <div className={cn("font-semibold", difficultyInfo.textClass)}>
              Interview Difficulty
            </div>
            <div className="text-xs text-muted-foreground">Predicted challenge level</div>
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
