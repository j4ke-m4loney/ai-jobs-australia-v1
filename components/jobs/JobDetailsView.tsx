import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Heart } from "lucide-react";
import Image from "next/image";
import { formatSalary } from "@/lib/salary-utils";
import { LocationTypeBadge } from "@/components/ui/LocationTypeBadge";

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  location: string;
  suburb?: string | null;
  state?: string | null;
  location_display?: string | null;
  location_type: "onsite" | "remote" | "hybrid";
  job_type: "full-time" | "part-time" | "contract" | "internship";
  category: "ai" | "ml" | "data-science" | "engineering" | "research";
  salary_min: number | null;
  salary_max: number | null;
  salary_period?: string;
  show_salary?: boolean;
  is_featured: boolean;
  created_at: string;
  expires_at: string;
  application_method: string;
  application_url: string | null;
  application_email: string | null;
  status?: "pending" | "approved" | "rejected" | "expired";
  company_id?: string | null;
  highlights?: string[] | null;
  companies?: {
    id: string;
    name: string;
    description: string | null;
    website: string | null;
    logo_url: string | null;
  } | null;
}

interface JobDetailsViewProps {
  job: Job;
  onApply: () => void;
  onSaveClick: (jobId: string) => void;
  isJobSaved: boolean;
  hasApplied: boolean;
  scrollContainerRef?: React.RefObject<HTMLDivElement | null>;
}

// Helper functions
const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60)
  );

  // Less than 60 minutes - show minutes
  if (diffInMinutes < 60) {
    return `${diffInMinutes}min ago`;
  }

  // Less than 24 hours - show hours
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  // Less than 30 days - show days
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays <= 30) {
    return `${diffInDays}d ago`;
  }

  // Show months
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths === 1) {
    return "1 month ago";
  }
  return `${diffInMonths} months ago`;
};


export const JobDetailsView: React.FC<JobDetailsViewProps> = ({
  job,
  onApply,
  onSaveClick,
  isJobSaved,
  hasApplied,
  scrollContainerRef,
}) => {
  return (
    <div
      ref={scrollContainerRef}
      className="lg:sticky lg:top-16 lg:h-[calc(100vh-64px)] lg:overflow-y-auto"
      style={{
        overscrollBehavior: 'contain'
      }}
    >
      <div className="border border-primary/50 bg-white m-4 rounded-lg">
        {/* Job Header */}
        <div className="p-6 border-b mx-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {/* Company Logo - only show if exists */}
              {job.companies?.logo_url && (
                <div className="mb-4">
                  <Image
                    src={job.companies.logo_url}
                    alt={job.companies.name || "Company logo"}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-lg object-contain"
                  />
                </div>
              )}

              <div className="flex items-center gap-2 mb-2">
                {job.is_featured && (
                  <Badge className="bg-gradient-hero text-white">
                    Featured
                  </Badge>
                )}
              </div>

              <h1 className="text-2xl font-bold text-foreground mb-1">
                {job.title}
              </h1>

              <div className="flex items-center gap-2 text-foreground mb-2">
                <span className="font-medium text-lg">
                  {job.companies?.name || "Company"}
                </span>
                {/* <Button variant="link" className="p-0 h-auto text-primary">
                  View all jobs
                </Button> */}
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-foreground mb-3">
                <div className="flex items-center gap-1">
                  {job.location_display || job.location}
                </div>
                <LocationTypeBadge locationType={job.location_type} />
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span className="capitalize">{job.job_type}</span>
                </div>
              </div>

              {job.show_salary !== false && formatSalary(job.salary_min, job.salary_max, job.salary_period) && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-semibold text-green-600 text-lg">
                    {formatSalary(job.salary_min, job.salary_max, job.salary_period)}
                  </span>
                </div>
              )}
            </div>

            {/* Heart icon aligned with company logo */}
            <div className="w-16 h-16 flex items-center justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSaveClick(job.id);
                }}
                className="p-2"
              >
                <Heart
                  className={`w-5 h-5 ${
                    isJobSaved
                      ? "fill-red-500 text-red-500"
                      : "text-muted-foreground"
                  }`}
                />
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-foreground">
              <span>Posted {getTimeAgo(job.created_at)}</span>
            </div>

            <div className="flex items-center gap-3">
              {hasApplied ? (
                <div className="text-center py-2 px-4">
                  <div className="text-sm font-medium text-green-600">
                    Application Submitted
                  </div>
                  <div className="text-xs text-muted-foreground">
                    You&apos;ve applied for this position
                  </div>
                </div>
              ) : (
                <>
                  <Link
                    href={`/jobs/${job.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    View
                  </Link>
                  <Button
                    onClick={onApply}
                    className="bg-primary hover:bg-primary/90 text-white px-6"
                  >
                    Apply
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Job Content */}
        <div className="p-6 space-y-6">
          {/* Job Description */}
          <div>
            <div className="text-foreground leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_p]:mb-4 [&_strong]:font-semibold">
              <div dangerouslySetInnerHTML={{ __html: job.description }} />
            </div>
          </div>

          {/* Requirements */}
          {job.requirements && (
            <div>
              <div className="text-foreground leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_p]:mb-4 [&_strong]:font-semibold">
                <div dangerouslySetInnerHTML={{ __html: job.requirements }} />
              </div>
            </div>
          )}

          {/* Company Info Section */}
          {(job.companies?.description || job.companies?.website) && (
            <div>
              <h3 className="font-semibold text-lg mb-3">
                About {job.companies?.name || "the Company"}
              </h3>

              {job.companies?.description && (
                <div className="text-foreground leading-relaxed mb-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_p]:mb-4 [&_strong]:font-semibold">
                  <div dangerouslySetInnerHTML={{ __html: job.companies.description }} />
                </div>
              )}

              {/* Commenting out company website link to keep users focused on Apply/Save actions
              {job.companies?.website && (
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-primary" />
                  <a
                    href={job.companies.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Visit Company Website
                  </a>
                </div>
              )} */}
            </div>
          )}

          {/* Apply Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1">Ready to apply?</h3>
                {/* <p className="text-sm text-muted-foreground">
                  Expires in {getDaysUntilExpiry(job.expires_at)} days
                </p> */}
              </div>

              {!hasApplied && (
                <Button
                  onClick={onApply}
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white px-8"
                >
                  Apply
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
