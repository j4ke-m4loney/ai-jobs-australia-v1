"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sparkles, Loader2, X } from "lucide-react";
import {
  trackAnalyseRoleModalOpened,
  trackSkillsMatchAnalysed,
} from "@/lib/analytics";
import { AIFocusScore } from "@/components/jobs/AIFocusScore";
import { InterviewDifficultyScore } from "@/components/jobs/InterviewDifficultyScore";
import { RoleSummary } from "@/components/jobs/RoleSummary";
import { WhoRoleIsFor } from "@/components/jobs/WhoRoleIsFor";
import { WhoRoleIsNotFor } from "@/components/jobs/WhoRoleIsNotFor";
import { AutonomyVsProcessScore } from "@/components/jobs/AutonomyVsProcessScore";
import { PromotionLikelihoodScore } from "@/components/jobs/PromotionLikelihoodScore";
import { SkillsMatchScore } from "@/components/jobs/SkillsMatchScore";

// Skills match result interface
interface SkillsMatchResult {
  percentage: number;
  matched_skills: string[];
  missing_skills: string[];
  rationale: string;
  confidence: "high" | "medium" | "low";
}

// Cache structure for localStorage
interface CachedSkillsMatch {
  result: SkillsMatchResult;
  timestamp: number;
  userSkillsHash: string;
}

// Generate a simple hash of skills array for cache invalidation
function hashSkills(skills: string[]): string {
  return skills.sort().join("|").toLowerCase();
}

// Cache duration: 24 hours
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;

function FeatureLoadingPlaceholder({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-dashed border-purple-300/40 bg-white/40 backdrop-blur-md shadow-sm">
      <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

interface Job {
  id: string;
  title: string;
  description?: string;
  requirements?: string | null;
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
  userSkills?: string[] | null;
  source?: string;
}

export function AnalyseRoleModal({ isOpen, onClose, job, userSkills, source = "unknown" }: AnalyseRoleModalProps) {
  const [showInitialLoader, setShowInitialLoader] = useState(true);
  // 0 = none visible, 1 = first visible, 2 = first two visible, etc.
  const [visibleFeatures, setVisibleFeatures] = useState<number>(0);

  // Skills match state
  const [skillsMatchResult, setSkillsMatchResult] = useState<SkillsMatchResult | null>(null);
  const [skillsMatchLoading, setSkillsMatchLoading] = useState(false);
  const [skillsMatchError, setSkillsMatchError] = useState<string | null>(null);

  // Fetch skills match analysis
  const fetchSkillsMatch = useCallback(async () => {
    if (!job || !userSkills || userSkills.length === 0 || !job.description) {
      return;
    }

    const cacheKey = `skills_match_${job.id}`;
    const currentSkillsHash = hashSkills(userSkills);

    // Check localStorage cache
    try {
      const cachedData = localStorage.getItem(cacheKey);
      if (cachedData) {
        const cached: CachedSkillsMatch = JSON.parse(cachedData);
        const isExpired = Date.now() - cached.timestamp > CACHE_DURATION_MS;
        const skillsChanged = cached.userSkillsHash !== currentSkillsHash;

        if (!isExpired && !skillsChanged) {
          setSkillsMatchResult(cached.result);
          return;
        }
      }
    } catch {
      // Cache read failed, continue with fresh fetch
    }

    setSkillsMatchLoading(true);
    setSkillsMatchError(null);

    try {
      const response = await fetch('/api/analyse-skills-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userSkills,
          jobTitle: job.title,
          jobDescription: job.description,
          jobRequirements: job.requirements,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyse skills match');
      }

      const result: SkillsMatchResult = await response.json();
      setSkillsMatchResult(result);

      if (job) {
        trackSkillsMatchAnalysed({
          job_id: job.id,
          match_percentage: result.percentage,
        });
      }

      // Cache the result
      try {
        const cacheData: CachedSkillsMatch = {
          result,
          timestamp: Date.now(),
          userSkillsHash: currentSkillsHash,
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      } catch {
        // Cache write failed, continue without caching
      }
    } catch (error) {
      console.error('Error fetching skills match:', error);
      setSkillsMatchError(error instanceof Error ? error.message : 'Failed to analyse skills match');
    } finally {
      setSkillsMatchLoading(false);
    }
  }, [job, userSkills]);

  // Show initial loader, then staggered reveal of features
  useEffect(() => {
    if (isOpen && job) {
      trackAnalyseRoleModalOpened({
        job_id: job.id,
        job_title: job.title,
        source,
      });

      setShowInitialLoader(true);
      setVisibleFeatures(0);

      // Reset skills match state when modal opens with a new job
      setSkillsMatchResult(null);
      setSkillsMatchError(null);

      // Show initial loader for 1s, then start staggered reveals
      const initialTimer = setTimeout(() => {
        setShowInitialLoader(false);
      }, 1000);

      // Staggered feature reveals (starting after initial loader) - now 8 features
      const featureDelays = [1200, 1800, 2400, 3000, 3600, 4200, 4800, 5400]; // ms from modal open
      const featureTimers = featureDelays.map((delay, index) =>
        setTimeout(() => setVisibleFeatures(index + 1), delay)
      );

      // Fetch skills match when modal opens (if user has skills)
      if (userSkills && userSkills.length > 0) {
        fetchSkillsMatch();
      }

      return () => {
        clearTimeout(initialTimer);
        featureTimers.forEach(clearTimeout);
      };
    }
  }, [isOpen, fetchSkillsMatch, userSkills, job, source]);

  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-t-xl sm:rounded-xl bg-white p-0 [&>button:last-child]:hidden">
        <div className="relative bg-gradient-to-r from-purple-600 to-blue-600 px-6 pt-6 pb-4">
          <DialogClose className="absolute right-4 top-4 rounded-sm text-white/70 hover:text-white transition-opacity focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-purple-600">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <DialogHeader className="flex flex-col items-center text-center">
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-white">AJA Intelligence</span>
            </DialogTitle>
            <p className="text-sm text-white/70 mt-1">
              {job.title} {job.companies?.name && `at ${job.companies.name}`}
            </p>
          </DialogHeader>
        </div>

        <div className="px-3 sm:px-6 pb-4 sm:pb-6 pt-3 sm:pt-4 overflow-y-auto max-h-[calc(90vh-100px)]">
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

              {/* Feature 8: Skills Match (user-specific, computed on-demand) */}
              {visibleFeatures >= 8 ? (
                <div className="animate-in fade-in duration-300">
                  <SkillsMatchScore
                    percentage={skillsMatchResult?.percentage ?? null}
                    matchedSkills={skillsMatchResult?.matched_skills ?? null}
                    missingSkills={skillsMatchResult?.missing_skills ?? null}
                    rationale={skillsMatchResult?.rationale ?? null}
                    confidence={skillsMatchResult?.confidence ?? null}
                    isLoading={skillsMatchLoading}
                    hasNoSkills={!userSkills || userSkills.length === 0}
                    error={skillsMatchError}
                  />
                </div>
              ) : (
                <FeatureLoadingPlaceholder label="Analysing your skills match..." />
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
