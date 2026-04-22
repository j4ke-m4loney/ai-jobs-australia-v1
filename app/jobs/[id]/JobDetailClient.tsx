"use client";

import { useState, useEffect, useCallback } from "react";
import { AnalyseRoleModal } from "@/components/jobs/AnalyseRoleModal";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  DollarSign,
  Clock,
  Building2,
  Briefcase,
  Heart,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { useSubscription } from "@/hooks/useSubscription";
import { formatSalary } from "@/lib/salary-utils";
import { AJAIntelligenceModal } from "@/components/jobs/AJAIntelligenceModal";
import { getCombinedJobContent, formatJobTypes } from "@/lib/jobs/content-utils";
import { getSimilarRolesUrl } from "@/lib/jobs/similar-roles-url";
import { trackExternalApply } from "@/lib/applications/track-external-apply";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SimilarRoles } from "@/components/jobs/SimilarRoles";
import { LocationTypeBadge } from "@/components/ui/LocationTypeBadge";
import { trackEvent } from "@/lib/analytics";
import { appendUtmParams } from "@/lib/utils";
import { getTimeAgo } from "@/lib/date-utils";
import type { SimilarJobsResult } from "@/lib/jobs/similar-jobs";

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  status: "approved" | "expired";
  location: string;
  location_type: string;
  job_type: string[];
  category: string;
  salary_min: number | null;
  salary_max: number | null;
  salary_period?: string;
  show_salary?: boolean;
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
  application_method: string;
  application_url: string | null;
  application_email: string | null;
  disable_utm_tracking?: boolean;
  created_at: string;
  expires_at: string;
  is_featured: boolean;
  companies: {
    id: string;
    name: string;
    description: string | null;
    website: string | null;
    logo_url: string | null;
  } | null;
}

interface JobDetailClientProps {
  initialJob: Job;
  similarRoles: SimilarJobsResult;
}

export function JobDetailClient({ initialJob, similarRoles }: JobDetailClientProps) {
  const job = initialJob;
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { toggleSaveJob, isJobSaved } = useSavedJobs();
  const { hasAIFocusAccess } = useSubscription();
  const [hasApplied, setHasApplied] = useState(false);
  const [intelligenceModalOpen, setIntelligenceModalOpen] = useState(false);
  const [analyseModalOpen, setAnalyseModalOpen] = useState(false);

  const checkApplicationStatus = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("job_applications")
        .select("id")
        .eq("job_id", job.id)
        .eq("applicant_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      setHasApplied(!!data);
    } catch (error) {
      console.error("Error checking application status:", error);
    }
  }, [user, job.id]);

  useEffect(() => {
    if (user) {
      checkApplicationStatus();
    }
  }, [user, checkApplicationStatus]);

  useEffect(() => {
    trackEvent("job_detail_page_viewed", {
      job_id: job.id,
      job_title: job.title,
      company: job.companies?.name || "Unknown",
      location: job.location,
      is_featured: job.is_featured,
    });
  }, [job.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleApply = async () => {
    if (!user) {
      toast.error("Please sign in to apply for jobs");
      router.push("/login");
      return;
    }

    if (job.status !== "approved") {
      toast.error("This role is no longer accepting applications");
      return;
    }

    trackEvent("job_detail_apply_clicked", {
      job_id: job.id,
      job_title: job.title,
      company: job.companies?.name || "Unknown",
      location: job.location,
      is_featured: job.is_featured,
      location_type: job.location_type,
      job_type: job.job_type,
      category: job.category,
      salary_min: job.salary_min,
      salary_max: job.salary_max,
    });

    if (job.application_method === "external" && job.application_url) {
      window.open(appendUtmParams(job.application_url, job.disable_utm_tracking), "_blank");
      trackExternalApply(supabase, job.id, user.id, "external");
      setHasApplied(true);
      return;
    }

    if (job.application_method === "email" && job.application_email) {
      window.location.href = `mailto:${job.application_email}?subject=Application for ${job.title}`;
      trackExternalApply(supabase, job.id, user.id, "email");
      setHasApplied(true);
      return;
    }

    if (job.application_method === "external" || job.application_method === "email") {
      toast.error("This job does not accept internal applications");
      return;
    }

    router.push(`/apply/${job.id}`);
  };

  const isExpired = job.status === "expired";

  const jobHeaderCard = (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-4">
          {job.companies?.logo_url && (
            <Image
              src={job.companies.logo_url}
              alt={job.companies?.name || "Company logo"}
              width={64}
              height={64}
              className="w-16 h-16 rounded-lg object-contain"
            />
          )}
          <div className="flex-1">
            <div className="flex items-start gap-3 flex-wrap mb-2">
              <CardTitle className="text-2xl">{job.title}</CardTitle>
              {isExpired && (
                <Badge
                  variant="destructive"
                  className="uppercase tracking-wide text-xs mt-1"
                >
                  Expired
                </Badge>
              )}
            </div>
            {isExpired && (
              <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
                This role has expired and is no longer accepting applications.{" "}
                <Link
                  href={getSimilarRolesUrl(job)}
                  className="font-medium underline hover:no-underline"
                >
                  Browse similar roles →
                </Link>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <Building2 className="w-4 h-4" />
              <span className="font-medium">{job.companies?.name || "Unknown Company"}</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {job.location}
              </div>
              <LocationTypeBadge locationType={job.location_type} />
              <div className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                <span>{formatJobTypes(job.job_type)}</span>
              </div>
              {job.show_salary !== false &&
                (job.salary_min || job.salary_max) && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    {formatSalary(job.salary_min, job.salary_max, job.salary_period)}
                  </div>
                )}
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );

  const descriptionCard = (
    <Card>
      <CardContent className="pt-6">
        <div className="text-foreground leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_p]:mb-4 [&_strong]:font-semibold">
          <div dangerouslySetInnerHTML={{ __html: getCombinedJobContent(job.description, job.requirements) }} />
        </div>
      </CardContent>
    </Card>
  );

  const applyCard = (
    <Card>
      <CardHeader>
        <CardTitle>Apply for this job</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>Posted {getTimeAgo(job.created_at)}</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-3">
          {isExpired ? (
            <div
              aria-disabled="true"
              className="w-full inline-flex items-center justify-center rounded-md bg-blue-100 text-blue-700 px-4 py-2 text-sm font-medium cursor-not-allowed select-none"
              title="This role is expired"
            >
              This role is expired
            </div>
          ) : (
            <Button
              onClick={handleApply}
              className="w-full gap-2"
            >
              Apply
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => toggleSaveJob(job.id)}
            className="w-full gap-2"
          >
            <Heart
              className={`w-4 h-4 ${
                isJobSaved(job.id)
                  ? "fill-red-500 text-red-500"
                  : "text-muted-foreground"
              }`}
            />
            {isJobSaved(job.id) ? "Remove from Saved" : "Save Job"}
          </Button>

          {hasApplied && (
            <p className="text-xs text-muted-foreground text-center">
              <span className="font-medium text-green-600">Applied</span>
              {" · "}
              <a href="/jobseeker/applications" className="text-primary hover:underline">
                Track application
              </a>
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const ajaIntelligenceCard = user ? (
    <Card className="hidden lg:block">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          AJA Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasAIFocusAccess() ? (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Get AI-powered insights about this role
            </p>
            <Button
              onClick={() => setAnalyseModalOpen(true)}
              className="w-full gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              <Sparkles className="w-4 h-4" />
              Analyse Role
            </Button>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-3">
              Subscribe to AJA Intelligence to see AI insights including AI Focus Score and Interview Difficulty predictions.
            </p>
            <Button
              variant="outline"
              onClick={() => setIntelligenceModalOpen(true)}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Learn More
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  ) : null;

  const similarRolesInput = {
    category: job.category,
    location: job.location,
    location_type: job.location_type,
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-subtle">
        <Header />

        <div className="container mx-auto px-4 py-8 mt-16">
          {isExpired ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">{jobHeaderCard}</div>
                <div className="space-y-6">{applyCard}</div>
              </div>

              <div className="mt-10">
                <SimilarRoles
                  result={similarRoles}
                  currentJob={similarRolesInput}
                  variant="expired"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
                <div className="lg:col-span-2 space-y-6">{descriptionCard}</div>
                <div className="space-y-6">{ajaIntelligenceCard}</div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  {jobHeaderCard}
                  {descriptionCard}
                </div>
                <div className="space-y-6">
                  {applyCard}
                  {ajaIntelligenceCard}
                </div>
              </div>

              <div className="mt-12">
                <SimilarRoles
                  result={similarRoles}
                  currentJob={similarRolesInput}
                  variant="active"
                />
              </div>
            </>
          )}
        </div>

        <Footer />

        <AJAIntelligenceModal
          isOpen={intelligenceModalOpen}
          onClose={() => setIntelligenceModalOpen(false)}
          source="job_detail_page"
        />

        <AnalyseRoleModal
          isOpen={analyseModalOpen}
          onClose={() => setAnalyseModalOpen(false)}
          job={job}
          userSkills={profile?.skills}
          source="job_detail_page"
        />
      </div>
    </>
  );
}
