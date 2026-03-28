"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [open, setOpen] = useState(false);
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
            {totalApplications.toLocaleString()} Applications Across All Jobs
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="flex-1">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  disabled={loading}
                  className="w-full justify-between font-normal h-10"
                >
                  {selectedJob ? (
                    <span className="truncate">{selectedJob.title}</span>
                  ) : (
                    <span className="text-muted-foreground">
                      Select a job posting to view applications
                    </span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search jobs..." />
                  <CommandList className="max-h-[300px]">
                    <CommandEmpty>No jobs found.</CommandEmpty>
                    <CommandGroup>
                      {jobs.map((job) => (
                        <CommandItem
                          key={job.id}
                          value={job.id}
                          keywords={[job.title]}
                          onSelect={(id) => {
                            onJobSelect(id);
                            setOpen(false);
                          }}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Check
                              className={cn(
                                "h-4 w-4 shrink-0",
                                selectedJobId === job.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <span className="truncate">{job.title}</span>
                          </div>
                          <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-2">
                            <Badge variant="secondary" className="text-xs">
                              {job.application_count} Applications
                            </Badge>
                            <Badge
                              variant={
                                job.status === "approved" ? "default" : "secondary"
                              }
                              className="text-xs"
                            >
                              Status: {job.status}
                            </Badge>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {selectedJob && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground lg:flex-shrink-0">
              <div className="flex items-center gap-1">
                <span className="font-medium">
                  {selectedJob.application_count.toLocaleString()}
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
