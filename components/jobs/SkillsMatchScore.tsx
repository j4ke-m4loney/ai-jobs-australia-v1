"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, UserPlus } from "lucide-react";
import Link from "next/link";

interface SkillsMatchScoreProps {
  percentage: number | null;
  matchedSkills: string[] | null;
  missingSkills: string[] | null;
  rationale: string | null;
  confidence: "high" | "medium" | "low" | null;
  isLoading?: boolean;
  hasNoSkills?: boolean;
  error?: string | null;
  className?: string;
}

/**
 * Get the label and colour for a Skills Match score
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
      label: "Excellent Match",
      textClass: "text-green-700",
      borderClass: "border-green-400/50",
      gradientFrom: "from-green-400",
      gradientTo: "to-green-600",
      shadowClass: "shadow-green-500/10",
    };
  }
  if (percentage >= 50) {
    return {
      label: "Good Match",
      textClass: "text-yellow-700",
      borderClass: "border-yellow-400/50",
      gradientFrom: "from-yellow-400",
      gradientTo: "to-yellow-600",
      shadowClass: "shadow-yellow-500/10",
    };
  }
  return {
    label: "Needs Development",
    textClass: "text-red-700",
    borderClass: "border-red-400/50",
    gradientFrom: "from-red-400",
    gradientTo: "to-red-600",
    shadowClass: "shadow-red-500/10",
  };
}

export function SkillsMatchScore({
  percentage,
  matchedSkills,
  missingSkills,
  rationale,
  confidence,
  isLoading = false,
  hasNoSkills = false,
  error = null,
  className,
}: SkillsMatchScoreProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className={cn("flex items-center gap-2 text-muted-foreground p-5 rounded-xl border border-dashed border-slate-300/40 bg-white/60 backdrop-blur-md", className)}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Analysing your skills match...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn("rounded-xl border border-red-200/40 bg-white/60 backdrop-blur-md p-5", className)}>
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  // No skills state - prompt user to add skills
  if (hasNoSkills) {
    return (
      <div
        className={cn(
          "rounded-xl border border-blue-200/40 bg-white/60 backdrop-blur-md p-5 space-y-3",
          className
        )}
      >
        <div className="flex items-center gap-2">
          <UserPlus className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-slate-800">Add Your Skills</span>
        </div>
        <p className="text-sm text-slate-600">
          Add skills to your profile to see how well you match this role.
        </p>
        <Link
          href="/jobseeker/profile"
          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          Go to Profile Settings →
        </Link>
      </div>
    );
  }

  // No data yet
  if (percentage === null) {
    return (
      <div className={cn("flex items-center gap-2 text-muted-foreground", className)}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Skills match analysis pending...</span>
      </div>
    );
  }

  const scoreInfo = getScoreInfo(percentage);

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

      {/* Header with score */}
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
            <div className="text-xs text-muted-foreground">Skills Match</div>
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

      {/* Matched skills */}
      {matchedSkills && matchedSkills.length > 0 && (
        <div className="bg-emerald-50/30 backdrop-blur-sm border border-emerald-200/30 rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-1 text-xs font-medium text-green-700">
            <CheckCircle2 className="w-3 h-3" />
            Matched Skills
          </div>
          <div className="flex flex-wrap gap-1">
            {matchedSkills.map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="text-xs bg-emerald-500/10 backdrop-blur-sm border-emerald-400/40 text-green-700"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Missing skills */}
      {missingSkills && missingSkills.length > 0 && (
        <div className="bg-red-50/30 backdrop-blur-sm border border-red-200/30 rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-1 text-xs font-medium text-red-700">
            <XCircle className="w-3 h-3" />
            Skills to Develop
          </div>
          <div className="flex flex-wrap gap-1">
            {missingSkills.map((skill) => (
              <Badge
                key={skill}
                variant="outline"
                className="text-xs bg-red-500/10 backdrop-blur-sm border-red-400/40 text-red-700"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Rationale */}
      {rationale && (
        <p className="text-sm text-slate-600 leading-relaxed">{rationale}</p>
      )}

      {/* Tip to update skills */}
      <div className="pt-2 border-t border-slate-200/50">
        <p className="text-xs text-muted-foreground">
          For the best match results,{" "}
          <Link
            href="/jobseeker/profile"
            className="text-primary hover:underline font-medium"
          >
            keep your skills updated
          </Link>{" "}
          in your profile.
        </p>
      </div>
    </div>
  );
}
