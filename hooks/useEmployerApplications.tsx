"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface JobApplication {
  id: string;
  job_id: string;
  applicant_id: string;
  status: string;
  created_at: string;
  updated_at?: string;
  resume_url?: string;
  cover_letter_url?: string;
  viewed_at?: string | null;
  job: {
    id: string;
    title: string;
    company_id?: string;
  };
  profiles: {
    first_name?: string;
    last_name?: string;
    phone?: string;
    location?: string;
    experience_level?: string;
    user_id: string;
  } | null;
}

export interface JobWithApplicationCount {
  id: string;
  title: string;
  application_count: number;
  external_click_count: number;
  application_method?: string;
  status: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
}

export const useEmployerApplications = (selectedJobId?: string) => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [jobs, setJobs] = useState<JobWithApplicationCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [hasNewApplications, setHasNewApplications] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize] = useState(30);
  const [total, setTotal] = useState(0);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortField, setSortField] = useState<"created_at" | "name">("created_at");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Track if this is the initial load
  const isInitialLoad = useRef(true);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchJobs = useCallback(async () => {
    if (!user) return;

    try {
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("id, title, status, application_method, created_at")
        .eq("employer_id", user.id)
        .order("created_at", { ascending: false });

      if (jobsError) {
        console.error("Error fetching jobs:", jobsError);
        setError("Failed to load jobs");
        return;
      }

      const fetchedJobs = jobsData || [];

      // Get application counts in batches (internal + external separately)
      const jobIds = fetchedJobs.map((job) => job.id);
      let internalCountsByJobId: Record<string, number> = {};
      let externalCountsByJobId: Record<string, number> = {};

      if (jobIds.length > 0) {
        const BATCH_SIZE = 50;
        const allInternalData: { job_id: string }[] = [];
        const allExternalData: { job_id: string }[] = [];

        for (let i = 0; i < jobIds.length; i += BATCH_SIZE) {
          const batchIds = jobIds.slice(i, i + BATCH_SIZE);

          // Fetch internal applications and external clicks in parallel
          const [internalResult, externalResult] = await Promise.all([
            supabase
              .from("job_applications")
              .select("job_id")
              .in("job_id", batchIds)
              .not("application_type", "in", '("external","email")')
              .limit(10000),
            supabase
              .from("job_applications")
              .select("job_id")
              .in("job_id", batchIds)
              .in("application_type", ["external", "email"])
              .limit(10000),
          ]);

          if (internalResult.error) {
            console.error("Error fetching internal application counts:", internalResult.error);
          } else if (internalResult.data) {
            allInternalData.push(...internalResult.data);
          }

          if (externalResult.error) {
            console.error("Error fetching external click counts:", externalResult.error);
          } else if (externalResult.data) {
            allExternalData.push(...externalResult.data);
          }
        }

        const countByJobId = (data: { job_id: string }[]) =>
          data.reduce((acc, app) => {
            acc[app.job_id] = (acc[app.job_id] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);

        internalCountsByJobId = countByJobId(allInternalData);
        externalCountsByJobId = countByJobId(allExternalData);
      }

      const jobsWithCounts = fetchedJobs.map((job) => ({
        id: job.id,
        title: job.title,
        status: job.status,
        application_method: job.application_method,
        application_count: internalCountsByJobId[job.id] || 0,
        external_click_count: externalCountsByJobId[job.id] || 0,
      }));

      setJobs(jobsWithCounts);
    } catch (err) {
      console.error("Error in fetchJobs:", err);
      setError("Failed to load jobs");
    }
  }, [user]);

  const fetchApplications = useCallback(async () => {
    if (!user || !selectedJobId) {
      setApplications([]);
      setTotal(0);
      setStatusCounts({});
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        userId: user.id,
        type: "employer",
        jobId: selectedJobId,
        page: String(page),
        pageSize: String(pageSize),
        sort: sortField,
        order: sortOrder,
      });

      if (statusFilter && statusFilter !== "all") {
        params.set("status", statusFilter);
      }

      if (debouncedSearch.trim()) {
        params.set("search", debouncedSearch.trim());
      }

      const response = await fetch(`/api/applications?${params.toString()}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch applications");
      }

      const data = await response.json();

      setApplications(data.applications || []);
      setTotal(data.total || 0);
      setStatusCounts(data.statusCounts || {});
      setHasNewApplications(false);
    } catch (err) {
      console.error("Error in fetchApplications:", err);
      setError("Failed to load applications");
    } finally {
      setLoading(false);
      isInitialLoad.current = false;
    }
  }, [user, selectedJobId, page, pageSize, statusFilter, debouncedSearch, sortField, sortOrder]);

  const updateApplicationStatus = async (
    applicationId: string,
    newStatus: string,
    statusMessage?: string
  ) => {
    try {
      const response = await fetch(`/api/applications/${applicationId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, statusMessage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update status");
      }

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );

      // Update status counts locally
      setStatusCounts((prev) => {
        const oldStatus = applications.find((a) => a.id === applicationId)?.status;
        const updated = { ...prev };
        if (oldStatus && updated[oldStatus]) {
          updated[oldStatus] = Math.max(0, updated[oldStatus] - 1);
        }
        updated[newStatus] = (updated[newStatus] || 0) + 1;
        return updated;
      });

      return true;
    } catch (err) {
      console.error("Error updating application status:", err);
      return false;
    }
  };

  const updateMultipleApplicationStatus = async (
    applicationIds: string[],
    newStatus: string,
    statusMessage?: string
  ) => {
    try {
      const results = await Promise.allSettled(
        applicationIds.map((id) =>
          fetch(`/api/applications/${id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus, statusMessage }),
          })
        )
      );

      const allSucceeded = results.every(
        (r) => r.status === "fulfilled" && r.value.ok
      );

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          applicationIds.includes(app.id) ? { ...app, status: newStatus } : app
        )
      );

      // Refetch to get accurate counts
      fetchApplications();

      return allSucceeded;
    } catch (err) {
      console.error("Error updating multiple application status:", err);
      return false;
    }
  };

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [statusFilter, debouncedSearch, sortField, sortOrder, selectedJobId]);

  // Fetch jobs on mount
  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user, fetchJobs]);

  // Fetch applications when dependencies change
  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user, fetchApplications]);

  // Real-time subscription - show toast instead of auto-refetch
  useEffect(() => {
    if (!user || !selectedJobId) return;

    const channel = supabase
      .channel("job_applications_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "job_applications",
          filter: `job_id=eq.${selectedJobId}`,
        },
        () => {
          setHasNewApplications(true);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedJobId]);

  const totalPages = Math.ceil(total / pageSize);

  return {
    applications,
    jobs,
    loading,
    error,
    updateApplicationStatus,
    updateMultipleApplicationStatus,
    refetch: fetchApplications,
    // Pagination
    page,
    setPage,
    pageSize,
    total,
    totalPages,
    // Filters
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    // Status counts for tab badges
    statusCounts,
    // New application indicator
    hasNewApplications,
    dismissNewApplications: () => setHasNewApplications(false),
  };
};
