"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  CheckCircle2,
  XCircle,
  Plus,
  FileUp,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface MatchScoreResult {
  match_percentage: number;
  matched_skills: string[];
  missing_skills: string[];
  keywords_to_add: string[];
  experience_fit: "strong" | "moderate" | "stretch";
  summary: string;
  confidence: "high" | "medium" | "low";
  cached: boolean;
}

interface MatchScoreCardProps {
  jobId: string;
  className?: string;
  autoLoad?: boolean;
}

function getScoreInfo(percentage: number) {
  if (percentage >= 85) {
    return {
      label: "Exceptional Match",
      textClass: "text-green-700",
      borderClass: "border-green-400/50",
      gradientFrom: "from-green-400",
      gradientTo: "to-green-600",
      shadowClass: "shadow-green-500/10",
      bgClass: "bg-green-50/30",
    };
  }
  if (percentage >= 70) {
    return {
      label: "Strong Match",
      textClass: "text-emerald-700",
      borderClass: "border-emerald-400/50",
      gradientFrom: "from-emerald-400",
      gradientTo: "to-emerald-600",
      shadowClass: "shadow-emerald-500/10",
      bgClass: "bg-emerald-50/30",
    };
  }
  if (percentage >= 50) {
    return {
      label: "Moderate Match",
      textClass: "text-yellow-700",
      borderClass: "border-yellow-400/50",
      gradientFrom: "from-yellow-400",
      gradientTo: "to-yellow-600",
      shadowClass: "shadow-yellow-500/10",
      bgClass: "bg-yellow-50/30",
    };
  }
  if (percentage >= 30) {
    return {
      label: "Stretch Role",
      textClass: "text-orange-700",
      borderClass: "border-orange-400/50",
      gradientFrom: "from-orange-400",
      gradientTo: "to-orange-600",
      shadowClass: "shadow-orange-500/10",
      bgClass: "bg-orange-50/30",
    };
  }
  return {
    label: "Skills Gap",
    textClass: "text-red-700",
    borderClass: "border-red-400/50",
    gradientFrom: "from-red-400",
    gradientTo: "to-red-600",
    shadowClass: "shadow-red-500/10",
    bgClass: "bg-red-50/30",
  };
}

function getExperienceFitLabel(fit: string) {
  switch (fit) {
    case "strong":
      return { label: "Experience aligns well", color: "text-green-700 bg-green-50 border-green-200" };
    case "moderate":
      return { label: "Experience mostly aligns", color: "text-yellow-700 bg-yellow-50 border-yellow-200" };
    case "stretch":
      return { label: "Would be a level-up", color: "text-orange-700 bg-orange-50 border-orange-200" };
    default:
      return { label: fit, color: "text-slate-700 bg-slate-50 border-slate-200" };
  }
}

export function MatchScoreCard({
  jobId,
  className,
  autoLoad = true,
}: MatchScoreCardProps) {
  const { user } = useAuth();
  const [result, setResult] = useState<MatchScoreResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noResume, setNoResume] = useState(false);

  const fetchMatchScore = useCallback(async () => {
    if (!user?.id || !jobId) return;

    setLoading(true);
    setError(null);
    setNoResume(false);

    try {
      const response = await fetch("/api/match-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, jobId }),
      });

      // Safely parse the response — API might return HTML on server errors
      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        throw new Error("Failed to analyse match. Please try again later.");
      }

      if (!response.ok) {
        if (data.error === "no_resume") {
          setNoResume(true);
          return;
        }
        if (data.error === "monthly_limit") {
          setError(data.message || "Monthly match score limit reached.");
          return;
        }
        throw new Error(data.message || data.error || "Failed to get match score");
      }

      setResult(data as MatchScoreResult);
    } catch (err) {
      console.error("Error fetching match score:", err);
      setError(err instanceof Error ? err.message : "Failed to analyse match");
    } finally {
      setLoading(false);
    }
  }, [user?.id, jobId]);

  useEffect(() => {
    if (autoLoad && user?.id) {
      fetchMatchScore();
    }
  }, [autoLoad, user?.id, fetchMatchScore]);

  // No resume uploaded
  if (noResume) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-blue-200/40 bg-white/70 backdrop-blur-xl p-3 sm:p-5 space-y-3 shadow-lg",
          className
        )}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-purple-500 rounded-t-xl" />
        <div className="flex items-center gap-2">
          <FileUp className="w-5 h-5 text-blue-600" />
          <span className="font-semibold text-slate-800">Upload your CV to unlock Match Scores</span>
        </div>
        <p className="text-sm text-slate-600">
          Your AJA Intelligence subscription includes personalised CV Match Scores for every job listing.
          Upload your CV (PDF) once to see:
        </p>
        <ul className="text-sm text-slate-600 space-y-1 ml-1">
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span>How well your skills match each role (0–100%)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span>Which of your skills are a match and which are missing</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-0.5">✓</span>
            <span>Keywords to add to your application</span>
          </li>
        </ul>
        <Link
          href="/jobseeker/documents"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
        >
          <FileUp className="w-3.5 h-3.5" />
          Upload CV
        </Link>
        <p className="text-xs text-muted-foreground">
          Accepts PDF, DOC, or DOCX. Your CV is stored securely and only used for your match analysis.
        </p>
      </div>
    );
  }

  // Loading
  if (loading) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-purple-200/40 bg-white/70 backdrop-blur-xl p-3 sm:p-5 shadow-lg",
          className
        )}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 to-blue-500 rounded-t-xl" />
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
          <div>
            <p className="text-sm font-medium text-slate-800">Analysing your CV against this role...</p>
            <p className="text-xs text-muted-foreground mt-0.5">This takes a few seconds</p>
          </div>
        </div>
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className={cn("rounded-xl border border-red-200/40 bg-white/60 backdrop-blur-md p-5 space-y-3", className)}>
        <p className="text-sm text-red-700">{error}</p>
        <p className="text-sm text-slate-600">
          This feature requires an uploaded CV. Make sure you have a default resume set in your documents.
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/jobseeker/documents"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            <FileUp className="w-3.5 h-3.5" />
            Upload CV for Analysis
          </Link>
          <button
            onClick={fetchMatchScore}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // No result yet (not loaded)
  if (!result) return null;

  const scoreInfo = getScoreInfo(result.match_percentage);
  const fitInfo = getExperienceFitLabel(result.experience_fit);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-slate-200/40 bg-white/70 backdrop-blur-xl p-3 sm:p-5 space-y-3 shadow-lg",
        scoreInfo.shadowClass,
        className
      )}
    >
      {/* Top accent bar */}
      <div
        className={cn(
          "absolute top-0 left-0 right-0 h-1 bg-gradient-to-r rounded-t-xl",
          scoreInfo.gradientFrom,
          scoreInfo.gradientTo
        )}
      />

      {/* Header with score */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div
            className={cn(
              "flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full border-2 font-bold text-base sm:text-xl bg-white/90 backdrop-blur-sm shadow-lg",
              scoreInfo.textClass,
              scoreInfo.borderClass
            )}
          >
            {result.match_percentage}%
          </div>
          <div>
            <div className={cn("font-semibold text-sm sm:text-base", scoreInfo.textClass)}>
              {scoreInfo.label}
            </div>
            <div className="text-xs text-muted-foreground">CV Match Score</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge
            variant="outline"
            className={cn("text-xs border", fitInfo.color)}
          >
            <Briefcase className="w-3 h-3 mr-1" />
            {fitInfo.label}
          </Badge>
        </div>
      </div>

      {/* Summary */}
      {result.summary && (
        <p className="text-sm text-slate-600 leading-relaxed">
          {result.summary}
        </p>
      )}

      {/* Matched skills */}
      {result.matched_skills.length > 0 && (
        <div className="bg-emerald-50/30 backdrop-blur-sm border border-emerald-200/30 rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-1 text-xs font-medium text-green-700">
            <CheckCircle2 className="w-3 h-3" />
            Your Matching Skills
          </div>
          <div className="flex flex-wrap gap-1">
            {[...new Set(result.matched_skills)].map((skill, i) => (
              <Badge
                key={`${skill}-${i}`}
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
      {result.missing_skills.length > 0 && (
        <div className="bg-red-50/30 backdrop-blur-sm border border-red-200/30 rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-1 text-xs font-medium text-red-700">
            <XCircle className="w-3 h-3" />
            Skills to Develop
          </div>
          <div className="flex flex-wrap gap-1">
            {[...new Set(result.missing_skills)].map((skill, i) => (
              <Badge
                key={`${skill}-${i}`}
                variant="outline"
                className="text-xs bg-red-500/10 backdrop-blur-sm border-red-400/40 text-red-700"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Keywords to add */}
      {result.keywords_to_add.length > 0 && (
        <div className="bg-blue-50/30 backdrop-blur-sm border border-blue-200/30 rounded-lg p-3 space-y-1">
          <div className="flex items-center gap-1 text-xs font-medium text-blue-700">
            <Plus className="w-3 h-3" />
            Keywords to Add to Your Application
          </div>
          <div className="flex flex-wrap gap-1">
            {[...new Set(result.keywords_to_add)].map((keyword, i) => (
              <Badge
                key={`${keyword}-${i}`}
                variant="outline"
                className="text-xs bg-blue-500/10 backdrop-blur-sm border-blue-400/40 text-blue-700"
              >
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="pt-2 border-t border-slate-200/50">
        <p className="text-xs text-muted-foreground">
          Matched against your{" "}
          <Link
            href="/jobseeker/documents"
            className="text-primary hover:underline font-medium"
          >
            uploaded CV
          </Link>
          . Upload a new version to refresh scores.
        </p>
      </div>
    </div>
  );
}
