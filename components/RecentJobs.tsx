"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { RecentJobCard } from "@/components/jobs/RecentJobCard";
import { ArrowRight } from "lucide-react";

interface Company {
  id: string;
  name: string;
  logo_url: string | null;
  website: string | null;
}

interface RecentJob {
  id: string;
  title: string;
  description: string;
  location: string;
  location_type: "onsite" | "remote" | "hybrid";
  job_type: string[];
  salary_min: number | null;
  salary_max: number | null;
  show_salary?: boolean;
  is_featured: boolean;
  highlights?: string[] | null;
  created_at: string;
  companies?: Company | null;
}

export default function RecentJobs() {
  const [jobs, setJobs] = useState<RecentJob[]>([]);
  const [totalJobs, setTotalJobs] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchRecentJobs();
    fetchJobCount();
  }, []);

  const fetchRecentJobs = async () => {
    try {
      const response = await fetch("/api/jobs/recent?limit=9");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch recent jobs");
      }

      setJobs(data.jobs || []);
    } catch (err: unknown) {
      console.error("Error fetching recent jobs:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch recent jobs"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchJobCount = async () => {
    try {
      const response = await fetch("/api/jobs/count");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch job count");
      }

      setTotalJobs(data.total || 0);
    } catch (err: unknown) {
      console.error("Error fetching job count:", err);
      // Don't set error state, just use default count
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Recently Published
            </h2>
            <Badge variant="secondary" className="text-base px-4 py-1">
              241+ AI Jobs
            </Badge>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
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
    return null; // Don't show section if there are no recent jobs
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Recently Published
          </h2>
          <Badge variant="secondary" className="text-base px-4 py-1">
            {totalJobs > 0 ? `${totalJobs.toLocaleString()}+` : "241+"} AI Jobs
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {jobs
            .filter((job) => job && job.title && job.id)
            .map((job) => (
              <RecentJobCard key={job.id} job={job} />
            ))}
        </div>

        <div className="text-center">
          <Button
            onClick={() => router.push("/jobs")}
            size="lg"
            className="group bg-gradient-hero hover:opacity-90 text-white"
          >
            View all {totalJobs > 0 ? `${totalJobs.toLocaleString()}+` : "241+"}{" "}
            Jobs
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
}
