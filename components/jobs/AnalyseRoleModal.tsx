"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, Loader2 } from "lucide-react";
import { AIFocusScore } from "@/components/jobs/AIFocusScore";
import { InterviewDifficultyScore } from "@/components/jobs/InterviewDifficultyScore";
import { RoleSummary } from "@/components/jobs/RoleSummary";
import { WhoRoleIsFor } from "@/components/jobs/WhoRoleIsFor";
import { WhoRoleIsNotFor } from "@/components/jobs/WhoRoleIsNotFor";
import { AutonomyVsProcessScore } from "@/components/jobs/AutonomyVsProcessScore";
import { PromotionLikelihoodScore } from "@/components/jobs/PromotionLikelihoodScore";

function FeatureLoadingPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-lg border border-dashed border-muted-foreground/30 bg-muted/20">
      <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

interface Job {
  id: string;
  title: string;
  ai_focus_percentage?: number | null;
  ai_focus_rationale?: string | null;
  ai_focus_confidence?: "high" | "medium" | "low" | null;
  ai_focus_analysed_at?: string | null;
  interview_difficulty_level?: "easy" | "medium" | "hard" | "very_hard" | null;
  interview_difficulty_rationale?: string | null;
  interview_difficulty_confidence?: "high" | "medium" | "low" | null;
  interview_difficulty_analysed_at?: string | null;
  role_summary_one_liner?: string | null;
  role_summary_plain_english?: string | null;
  role_summary_confidence?: "high" | "medium" | "low" | null;
  role_summary_analysed_at?: string | null;
  who_role_is_for_bullets?: string[] | null;
  who_role_is_for_confidence?: "high" | "medium" | "low" | null;
  who_role_is_for_analysed_at?: string | null;
  who_role_is_not_for_bullets?: string[] | null;
  who_role_is_not_for_confidence?: "high" | "medium" | "low" | null;
  who_role_is_not_for_analysed_at?: string | null;
  autonomy_level?: "low" | "medium" | "high" | null;
  process_load?: "low" | "medium" | "high" | null;
  autonomy_vs_process_rationale?: string | null;
  autonomy_vs_process_confidence?: "high" | "medium" | "low" | null;
  autonomy_vs_process_analysed_at?: string | null;
  promotion_likelihood_signal?: "low" | "medium" | "high" | null;
  promotion_likelihood_rationale?: string | null;
  promotion_likelihood_confidence?: "high" | "medium" | "low" | null;
  promotion_likelihood_analysed_at?: string | null;
  companies?: {
    name: string;
  } | null;
}

interface AnalyseRoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
}

export function AnalyseRoleModal({ isOpen, onClose, job }: AnalyseRoleModalProps) {
  const [showInitialLoader, setShowInitialLoader] = useState(true);
  // 0 = none visible, 1 = first visible, 2 = first two visible, etc.
  const [visibleFeatures, setVisibleFeatures] = useState<number>(0);

  // Show initial loader, then staggered reveal of features
  useEffect(() => {
    if (isOpen) {
      setShowInitialLoader(true);
      setVisibleFeatures(0);

      // Show initial loader for 1s, then start staggered reveals
      const initialTimer = setTimeout(() => {
        setShowInitialLoader(false);
      }, 1000);

      // Staggered feature reveals (starting after initial loader)
      const featureDelays = [1200, 1800, 2400, 3000, 3600, 4200, 4800]; // ms from modal open
      const featureTimers = featureDelays.map((delay, index) =>
        setTimeout(() => setVisibleFeatures(index + 1), delay)
      );

      return () => {
        clearTimeout(initialTimer);
        featureTimers.forEach(clearTimeout);
      };
    }
  }, [isOpen]);

  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span>AJA Intelligence</span>
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-1">
            {job.title} {job.companies?.name && `at ${job.companies.name}`}
          </p>
        </DialogHeader>

        <div className="mt-4">
          {showInitialLoader ? (
            // Initial loading animation
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center animate-pulse">
                  <Sparkles className="w-8 h-8 text-white animate-spin" style={{ animationDuration: '2s' }} />
                </div>
                <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-purple-400 animate-ping opacity-30" />
              </div>
              <p className="mt-6 text-lg font-medium text-foreground">Analysing role...</p>
              <p className="mt-1 text-sm text-muted-foreground">Generating AI insights for this position</p>
            </div>
          ) : (
            // Staggered feature reveals
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Feature 1: Role Summary */}
              {visibleFeatures >= 1 ? (
                <div className="animate-in fade-in duration-300">
                  <RoleSummary
                    oneLiner={job.role_summary_one_liner ?? null}
                    plainEnglish={job.role_summary_plain_english ?? null}
                    confidence={job.role_summary_confidence ?? null}
                    analysedAt={job.role_summary_analysed_at ?? null}
                  />
                </div>
              ) : (
                <FeatureLoadingPlaceholder label="Analysing role summary..." />
              )}

              {/* Feature 2: AI Focus Score */}
              {visibleFeatures >= 2 ? (
                <div className="animate-in fade-in duration-300">
                  <AIFocusScore
                    percentage={job.ai_focus_percentage ?? null}
                    rationale={job.ai_focus_rationale ?? null}
                    confidence={job.ai_focus_confidence ?? null}
                    analysedAt={job.ai_focus_analysed_at ?? null}
                  />
                </div>
              ) : (
                <FeatureLoadingPlaceholder label="Calculating AI focus..." />
              )}

              {/* Feature 3: Interview Difficulty */}
              {visibleFeatures >= 3 ? (
                <div className="animate-in fade-in duration-300">
                  <InterviewDifficultyScore
                    level={job.interview_difficulty_level ?? null}
                    rationale={job.interview_difficulty_rationale ?? null}
                    confidence={job.interview_difficulty_confidence ?? null}
                    analysedAt={job.interview_difficulty_analysed_at ?? null}
                  />
                </div>
              ) : (
                <FeatureLoadingPlaceholder label="Assessing interview difficulty..." />
              )}

              {/* Feature 4: Who Role Is For */}
              {visibleFeatures >= 4 ? (
                <div className="animate-in fade-in duration-300">
                  <WhoRoleIsFor
                    bullets={job.who_role_is_for_bullets ?? null}
                    confidence={job.who_role_is_for_confidence ?? null}
                    analysedAt={job.who_role_is_for_analysed_at ?? null}
                  />
                </div>
              ) : (
                <FeatureLoadingPlaceholder label="Identifying ideal candidates..." />
              )}

              {/* Feature 5: Who Role Is NOT For */}
              {visibleFeatures >= 5 ? (
                <div className="animate-in fade-in duration-300">
                  <WhoRoleIsNotFor
                    bullets={job.who_role_is_not_for_bullets ?? null}
                    confidence={job.who_role_is_not_for_confidence ?? null}
                    analysedAt={job.who_role_is_not_for_analysed_at ?? null}
                  />
                </div>
              ) : (
                <FeatureLoadingPlaceholder label="Identifying mismatches..." />
              )}

              {/* Feature 6: Autonomy vs Process */}
              {visibleFeatures >= 6 ? (
                <div className="animate-in fade-in duration-300">
                  <AutonomyVsProcessScore
                    autonomyLevel={job.autonomy_level ?? null}
                    processLoad={job.process_load ?? null}
                    rationale={job.autonomy_vs_process_rationale ?? null}
                    confidence={job.autonomy_vs_process_confidence ?? null}
                    analysedAt={job.autonomy_vs_process_analysed_at ?? null}
                  />
                </div>
              ) : (
                <FeatureLoadingPlaceholder label="Assessing autonomy vs process..." />
              )}

              {/* Feature 7: Promotion Likelihood */}
              {visibleFeatures >= 7 ? (
                <div className="animate-in fade-in duration-300">
                  <PromotionLikelihoodScore
                    signal={job.promotion_likelihood_signal ?? null}
                    rationale={job.promotion_likelihood_rationale ?? null}
                    confidence={job.promotion_likelihood_confidence ?? null}
                    analysedAt={job.promotion_likelihood_analysed_at ?? null}
                  />
                </div>
              ) : (
                <FeatureLoadingPlaceholder label="Assessing promotion likelihood..." />
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
