"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Briefcase } from "lucide-react";

interface Job {
  id: string;
  title: string;
  application_count: number;
  status: string;
}

interface JobSelectorProps {
  jobs: Job[];
  selectedJobId?: string;
  onJobSelect: (jobId: string) => void;
  loading?: boolean;
}

export const JobSelector = ({
  jobs,
  selectedJobId,
  onJobSelect,
  loading,
}: JobSelectorProps) => {
  const selectedJob = jobs.find((job) => job.id === selectedJobId);
  const totalApplications = jobs.reduce(
    (sum, job) => sum + job.application_count,
    0
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Select Job Posting
            </CardTitle>
            <CardDescription>
              Choose a job to view and manage its applications
            </CardDescription>
          </div>
          <Badge variant="secondary" className="w-fit">
            {totalApplications} total applications
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex-1">
            <Select
              value={selectedJobId}
              onValueChange={onJobSelect}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a job posting to view applications" />
              </SelectTrigger>
              <SelectContent>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate pr-4">{job.title}</span>
                      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                        <Badge variant="secondary" className="text-xs hidden sm:inline-flex">
                          {job.application_count} applications
                        </Badge>
                        <Badge
                          variant={
                            job.status === "approved" ? "default" : "secondary"
                          }
                          className="text-xs"
                        >
                          {job.status}
                        </Badge>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedJob && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground lg:flex-shrink-0">
              <div className="flex items-center gap-1">
                <span className="font-medium">
                  {selectedJob.application_count}
                </span>
                <span>applications</span>
              </div>
              <Badge
                variant={
                  selectedJob.status === "approved" ? "default" : "secondary"
                }
              >
                {selectedJob.status}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
