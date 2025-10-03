import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import Image from "next/image";
import { formatSalary } from "@/lib/salary-utils";

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

interface JobCardProps {
  job: Job;
  isSelected: boolean;
  onClick: (job: Job) => void;
  onSaveClick: (jobId: string) => void;
  isJobSaved: boolean;
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

export const JobCard: React.FC<JobCardProps> = ({
  job,
  isSelected,
  onClick,
  onSaveClick,
  isJobSaved,
}) => {
  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:shadow-lg border border-primary/50 ${
        isSelected
          ? "ring-2 ring-primary bg-primary/5 shadow-md"
          : "hover:bg-muted/30 hover:border-border"
      } ${job.is_featured ? "border-l-4 border-l-primary" : ""}`}
      onClick={() => onClick(job)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {job.is_featured && (
              <Badge className="bg-gradient-hero text-white text-xs mb-2">
                Featured
              </Badge>
            )}

            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-lg line-clamp-2 text-foreground">
                {job.title}
              </h3>
              {job.status === "pending" && (
                <Badge variant="secondary" className="shrink-0">
                  Pending
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1 text-base text-foreground mb-3">
              <span className="font-medium">
                {job.companies?.name || "Company"}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-foreground mb-3">
              <div className="flex items-center gap-1">
                <span>{job.location_display || job.location}</span>
              </div>
              <span className="capitalize px-2 py-1 bg-muted rounded text-xs">
                {job.location_type}
              </span>
            </div>

            {job.show_salary !== false &&
              formatSalary(job.salary_min, job.salary_max, job.salary_period) && (
                <div className="text-sm font-semibold text-green-600 mb-3">
                  {formatSalary(job.salary_min, job.salary_max, job.salary_period)}
                </div>
              )}

            {/* Job Highlights */}
            {job.highlights && job.highlights.length > 0 && (
              <div className="mb-3">
                <ul className="space-y-1 text-sm text-foreground">
                  {job.highlights
                    .filter((highlight) => highlight.trim().length > 0)
                    .slice(0, 3)
                    .map((highlight, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 shrink-0"></span>
                        <span className="leading-relaxed">{highlight}</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              Posted {getTimeAgo(job.created_at)}
            </div>
          </div>

          <div className="flex flex-col items-center gap-3 ml-4">
            {/* Company Logo - only show if exists */}
            {job.companies?.logo_url && (
              <div className="w-12 h-12">
                <Image
                  src={job.companies.logo_url}
                  alt={job.companies.name || "Company logo"}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded object-contain"
                />
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onClick={(e) => {
                e.stopPropagation();
                onSaveClick(job.id);
              }}
            >
              <Heart
                className={`w-5 h-5 ${
                  isJobSaved
                    ? "fill-red-500 text-red-500"
                    : "text-muted-foreground hover:text-red-400"
                }`}
              />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
