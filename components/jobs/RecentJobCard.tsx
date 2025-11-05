"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { formatSalary } from "@/lib/salary-utils";
import { LocationTypeBadge } from "@/components/ui/LocationTypeBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  location_type: "onsite" | "remote" | "hybrid";
  job_type: "full-time" | "part-time" | "contract" | "internship";
  salary_min: number | null;
  salary_max: number | null;
  show_salary?: boolean;
  is_featured: boolean;
  created_at: string;
  highlights?: string[] | null;
  companies?: {
    id: string;
    name: string;
    logo_url: string | null;
    website: string | null;
  } | null;
}

interface RecentJobCardProps {
  job: Job;
}

// Helper function
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

export const RecentJobCard: React.FC<RecentJobCardProps> = ({ job }) => {
  const { user } = useAuth();
  const router = useRouter();

  const handleViewJob = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!user) {
      // Redirect to login with the job details page as the next destination
      router.push(`/login?next=${encodeURIComponent(`/jobs/${job.id}`)}`);
    } else {
      // If logged in, go directly to job details
      router.push(`/jobs/${job.id}`);
    }
  };

  return (
    <Card
      className={`transition-all duration-200 hover:shadow-lg border border-primary/50 hover:bg-muted/30 hover:border-border ${
        job.is_featured ? "border-l-4 border-l-primary" : ""
      }`}
    >
      <CardContent className="p-5 flex flex-col h-full">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            {job.is_featured && (
              <Badge className="bg-gradient-hero text-white text-xs mb-2">
                Featured
              </Badge>
            )}

            <h3 className="font-semibold text-lg line-clamp-2 text-foreground mb-1">
              {job.title}
            </h3>

            <div className="flex items-center gap-1 text-base text-foreground mb-3">
              <span className="font-medium">
                {job.companies?.name || "Company"}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm text-foreground mb-3">
              <div className="flex items-center gap-1">
                <span>{job.location}</span>
              </div>
              <LocationTypeBadge locationType={job.location_type} />
            </div>

            {job.show_salary !== false && formatSalary(job.salary_min, job.salary_max) && (
              <div className="text-sm font-semibold text-green-600 mb-3">
                {formatSalary(job.salary_min, job.salary_max)}
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

          {/* Company Logo */}
          {job.companies?.logo_url && (
            <div className="w-12 h-12 ml-4">
              <Image
                src={job.companies.logo_url}
                alt={job.companies.name || "Company logo"}
                width={48}
                height={48}
                className="w-12 h-12 rounded object-contain"
              />
            </div>
          )}
        </div>

        {/* View Job Button - at the bottom */}
        <div className="mt-auto pt-3">
          <Button
            onClick={handleViewJob}
            variant="default"
            className="w-full"
          >
            View Job
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
