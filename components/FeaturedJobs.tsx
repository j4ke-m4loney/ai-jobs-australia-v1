"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { formatSalary } from "@/lib/salary-utils";
import { LocationTypeBadge } from "@/components/ui/LocationTypeBadge";
import { Sparkles } from "lucide-react";
import { formatJobTypes } from "@/lib/jobs/content-utils";

interface Company {
  id: string;
  name: string;
  logo_url?: string;
  website?: string;
}

interface FeaturedJob {
  id: string;
  title: string;
  description: string;
  location: string;
  location_type: string;
  job_type: string[];
  salary_min?: number;
  salary_max?: number;
  salary_period?: string;
  show_salary?: boolean;
  is_featured: boolean;
  featured_until: string;
  highlights: string[];
  created_at: string;
  companies?: Company;
}

export default function FeaturedJobs() {
  const [jobs, setJobs] = useState<FeaturedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    fetchFeaturedJobs();
  }, []);

  const fetchFeaturedJobs = async () => {
    try {
      const response = await fetch("/api/jobs/featured?limit=6");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch featured jobs");
      }

      setJobs(data.jobs || []);
    } catch (err: unknown) {
      console.error("Error fetching featured jobs:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch featured jobs"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleJobClick = (jobId: string) => {
    if (!user) {
      router.push("/login");
      return;
    }
    router.push(`/jobs/${jobId}`);
  };


  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
              <h2 className="text-3xl font-bold text-foreground">
                Featured Jobs
              </h2>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-5">
                  <div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || jobs.length === 0) {
    return null; // Don't show section if there are no featured jobs
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">
              Featured Jobs
            </h2>
          </div>
          {/* <p className="text-muted-foreground text-lg">
            Premuim opportunities from top AI companies
          </p> */}
        </div>

        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {jobs
            .filter((job) => job && job.title && job.id)
            .map((job) => (
              <Card
                key={job.id}
                className="w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)] h-full transition-all duration-200 hover:shadow-lg border border-primary/50 hover:bg-muted/30 hover:border-border border-l-4 border-l-primary cursor-pointer"
                onClick={() => handleJobClick(job.id)}
              >
                <CardContent className="p-5 flex flex-col h-full">
                  {/* Job Title */}
                  <h3 className="font-semibold text-lg line-clamp-2 text-foreground mb-1">
                    {job.title}
                  </h3>

                  {/* Company Name */}
                  <div className="flex items-center gap-1 text-base text-foreground mb-3">
                    <span className="font-medium">
                      {job.companies?.name || "Company"}
                    </span>
                  </div>

                  {/* Location + Location Type Badge */}
                  <div className="flex items-center gap-4 text-sm text-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <span>{job.location}</span>
                    </div>
                    <LocationTypeBadge locationType={job.location_type} />
                  </div>

                  {/* Job Type */}
                  <div className="text-sm text-foreground mb-3">
                    {formatJobTypes(job.job_type)}
                  </div>

                  {/* Salary */}
                  {job.show_salary !== false &&
                    formatSalary(
                      job.salary_min ?? null,
                      job.salary_max ?? null,
                      job.salary_period
                    ) && (
                      <div className="text-sm font-semibold text-green-600 mb-3">
                        {formatSalary(
                          job.salary_min ?? null,
                          job.salary_max ?? null,
                          job.salary_period
                        )}
                      </div>
                    )}

                  {/* Job Highlights - Bullet Points */}
                  {job.highlights && job.highlights.length > 0 && (
                    <div className="mb-3">
                      <ul className="space-y-1 text-sm text-foreground">
                        {job.highlights
                          .filter((highlight) => highlight.trim().length > 0)
                          .slice(0, 3)
                          .map((highlight, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="w-1 h-1 bg-muted-foreground rounded-full mt-2 shrink-0"></span>
                              <span className="leading-relaxed">
                                {highlight}
                              </span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                  {/* View Job Button - at the bottom */}
                  <div className="mt-auto pt-3">
                    <Button variant="default" className="w-full">
                      View Job
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </section>
  );
}
