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
  textClass: string;
  gradientFrom: string;
  gradientTo: string;
  glowColour: string;
  shadowClass: string;
} {
  switch (level) {
    case "easy":
      return {
        label: "Easy",
        textClass: "text-green-700",
        gradientFrom: "from-green-400",
        gradientTo: "to-green-600",
        glowColour: "bg-green-400/20",
        shadowClass: "shadow-green-500/10",
      };
    case "medium":
      return {
        label: "Medium",
        textClass: "text-yellow-700",
        gradientFrom: "from-yellow-400",
        gradientTo: "to-yellow-600",
        glowColour: "bg-yellow-400/20",
        shadowClass: "shadow-yellow-500/10",
      };
    case "hard":
      return {
        label: "Hard",
        textClass: "text-orange-700",
        gradientFrom: "from-orange-400",
        gradientTo: "to-orange-600",
        glowColour: "bg-orange-400/20",
        shadowClass: "shadow-orange-500/10",
      };
    case "very_hard":
      return {
        label: "Very Hard",
        textClass: "text-red-700",
        gradientFrom: "from-red-400",
        gradientTo: "to-red-600",
        glowColour: "bg-red-400/20",
        shadowClass: "shadow-red-500/10",
      };
    default:
      return {
        label: "Unknown",
        textClass: "text-gray-600",
        gradientFrom: "from-gray-400",
        gradientTo: "to-gray-600",
        glowColour: "bg-gray-400/20",
        shadowClass: "shadow-gray-500/10",
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
            "text-xs font-medium px-2 py-0.5 text-white border-0",
            `bg-gradient-to-r ${difficultyInfo.gradientFrom} ${difficultyInfo.gradientTo}`
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
        "relative overflow-hidden rounded-xl border border-slate-200/40 bg-white/70 backdrop-blur-xl p-3 sm:p-5 space-y-3 shadow-lg",
        difficultyInfo.shadowClass,
        className
      )}
    >
      {/* Corner glow */}
      <div className={cn("absolute -top-8 -right-8 w-24 h-24 rounded-full blur-3xl", difficultyInfo.glowColour)} />

      <div className="flex flex-wrap items-center gap-2 sm:gap-3 relative">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <Badge
            className={cn(
              "text-sm font-semibold px-3 py-1 text-white border-0 shadow-md",
              `bg-gradient-to-r ${difficultyInfo.gradientFrom} ${difficultyInfo.gradientTo}`
            )}
          >
            {difficultyInfo.label}
          </Badge>
          <div>
            <div className="font-semibold text-slate-800 text-sm sm:text-base">
              Interview Difficulty
            </div>
            <div className="text-xs text-muted-foreground">Predicted challenge level</div>
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
