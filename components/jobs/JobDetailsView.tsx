import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Clock, DollarSign, Heart } from "lucide-react";

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
}

// Helper functions
const formatSalary = (min: number | null, max: number | null) => {
  if (!min && !max) return null;
  if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
  if (min) return `From $${min.toLocaleString()}`;
  if (max) return `Up to $${max.toLocaleString()}`;
};

const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );

  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  return date.toLocaleDateString();
};

const getDaysUntilExpiry = (expiryDate: string) => {
  const days = Math.ceil(
    (new Date(expiryDate).getTime() - new Date().getTime()) /
      (1000 * 60 * 60 * 24)
  );
  return Math.max(0, days);
};

export const JobDetailsView: React.FC<JobDetailsViewProps> = ({
  job,
  onApply,
  onSaveClick,
  isJobSaved,
  hasApplied,
}) => {
  return (
    <div className="lg:sticky lg:top-16 lg:h-[calc(100vh-64px)] lg:overflow-y-auto">
      <div className="border border-primary/50 bg-white m-4 rounded-lg">
        {/* Job Header */}
        <div className="p-6 border-b mx-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              {/* Company Logo - only show if exists */}
              {job.companies?.logo_url && (
                <div className="mb-4">
                  <img
                    src={job.companies.logo_url}
                    alt={job.companies.name || "Company logo"}
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
                <Button variant="link" className="p-0 h-auto text-primary">
                  View all jobs
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm text-foreground mb-3">
                <div className="flex items-center gap-1">
                  {job.location_display || job.location} ({job.location_type})
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span className="capitalize">{job.job_type}</span>
                </div>
              </div>

              {formatSalary(job.salary_min, job.salary_max) && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="font-semibold text-green-600 text-lg">
                    {formatSalary(job.salary_min, job.salary_max)}
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

            <div className="flex gap-2">
              {hasApplied ? (
                <div className="text-center py-2 px-4">
                  <div className="text-sm font-medium text-green-600">
                    Application Submitted
                  </div>
                  <div className="text-xs text-muted-foreground">
                    You've applied for this position
                  </div>
                </div>
              ) : (
                <Button
                  onClick={onApply}
                  className="bg-primary hover:bg-primary/90 text-white px-6"
                >
                  Apply
                </Button>
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

          {/* Placeholder for company info */}

          {/* Apply Section */}
          <div className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1">Ready to apply?</h3>
                <p className="text-sm text-muted-foreground">
                  Expires in {getDaysUntilExpiry(job.expires_at)} days
                </p>
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
