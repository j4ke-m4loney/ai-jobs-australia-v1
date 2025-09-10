"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface JobApplication {
  id: string;
  job_id: string;
  applicant_id: string;
  status: string;
  created_at: string;
  resume_url?: string;
  cover_letter_url?: string;
  job: {
    id: string;
    title: string;
    company_id?: string;
  };
  profiles: {
    id: string;
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
  status: string;
}

export const useEmployerApplications = (selectedJobId?: string) => {
  const { user } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [jobs, setJobs] = useState<JobWithApplicationCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = async () => {
    if (!user) return;

    try {
      // Fetch real jobs for this employer with application counts
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select(`
          id,
          title,
          status,
          created_at
        `)
        .eq("employer_id", user.id)
        .order("created_at", { ascending: false });

      if (jobsError) {
        console.error("Error fetching jobs:", jobsError);
        setError("Failed to load jobs");
        return;
      }

      // Get application counts for each job
      const jobsWithCounts = await Promise.all(
        (jobsData || []).map(async (job) => {
          const { count, error: countError } = await supabase
            .from("job_applications")
            .select("*", { count: "exact", head: true })
            .eq("job_id", job.id);

          if (countError) {
            console.error("Error counting applications for job:", job.id, countError);
          }

          return {
            id: job.id,
            title: job.title,
            status: job.status,
            application_count: count || 0,
          };
        })
      );

      setJobs(jobsWithCounts);
    } catch (error) {
      console.error("Error in fetchJobs:", error);
      setError("Failed to load jobs");
    }
  };

  const fetchApplications = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // First get the job IDs for this employer
      const { data: employerJobs, error: employerJobsError } = await supabase
        .from("jobs")
        .select("id")
        .eq("employer_id", user.id);

      if (employerJobsError) {
        console.error("Error fetching employer jobs:", employerJobsError);
        setError("Failed to load employer jobs");
        return;
      }

      const jobIds = employerJobs?.map(job => job.id) || [];

      if (jobIds.length === 0) {
        // No jobs posted yet, so no applications
        setApplications([]);
        setLoading(false);
        return;
      }

      // First get basic applications data
      let applicationsQuery = supabase
        .from("job_applications")
        .select(`
          id,
          job_id,
          applicant_id,
          status,
          created_at,
          resume_url,
          cover_letter_url
        `)
        .in("job_id", jobIds)
        .order("created_at", { ascending: false });

      // Filter by selected job if one is selected
      if (selectedJobId) {
        applicationsQuery = applicationsQuery.eq("job_id", selectedJobId);
      }

      const { data: applicationsData, error: applicationsError } = await applicationsQuery;

      if (applicationsError) {
        console.error("Error fetching applications:", applicationsError);
        console.error("Error details:", {
          message: applicationsError.message,
          details: applicationsError.details,
          hint: applicationsError.hint,
          code: applicationsError.code
        });
        setError(`Failed to load applications: ${applicationsError.message}`);
        return;
      }

      // Debug: Log resume URLs to understand the format
      console.log("=== Applications Debug ===");
      if (applicationsData) {
        applicationsData.forEach((app, index) => {
          console.log(`Application ${index + 1}:`, {
            id: app.id,
            resume_url: app.resume_url,
            cover_letter_url: app.cover_letter_url
          });
        });
      }

      if (!applicationsData || applicationsData.length === 0) {
        setApplications([]);
        setLoading(false);
        return;
      }

      // Get job details for applications
      const applicationJobIds = [...new Set(applicationsData.map(app => app.job_id))];
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("id, title, company_id")
        .in("id", applicationJobIds);

      if (jobsError) {
        console.error("Error fetching job details:", jobsError);
      }

      // Get applicant profiles
      const applicantIds = [...new Set(applicationsData.map(app => app.applicant_id))];
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          id,
          user_id,
          first_name,
          last_name,
          phone,
          location,
          experience_level
        `)
        .in("user_id", applicantIds);

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
      }

      // Create lookup maps
      const jobsMap = new Map();
      (jobsData || []).forEach(job => {
        jobsMap.set(job.id, job);
      });

      const profilesMap = new Map();
      (profilesData || []).forEach(profile => {
        profilesMap.set(profile.user_id, profile);
      });

      // Transform the data to match the expected interface
      const transformedApplications: JobApplication[] = applicationsData.map((app: any) => ({
        id: app.id,
        job_id: app.job_id,
        applicant_id: app.applicant_id,
        status: app.status || "pending",
        created_at: app.created_at,
        resume_url: app.resume_url,
        cover_letter_url: app.cover_letter_url,
        job: {
          id: app.job_id,
          title: jobsMap.get(app.job_id)?.title || "Unknown Job",
          company_id: jobsMap.get(app.job_id)?.company_id,
        },
        profiles: profilesMap.get(app.applicant_id) || null,
      }));

      setApplications(transformedApplications);
    } catch (error) {
      console.error("Error in fetchApplications:", error);
      setError("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (
    applicationId: string,
    newStatus: string
  ) => {
    try {
      const { error } = await supabase
        .from("job_applications")
        .update({ status: newStatus })
        .eq("id", applicationId);

      if (error) throw error;

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          app.id === applicationId ? { ...app, status: newStatus } : app
        )
      );

      return true;
    } catch (err) {
      console.error("Error updating application status:", err);
      return false;
    }
  };

  const updateMultipleApplicationStatus = async (
    applicationIds: string[],
    newStatus: string
  ) => {
    try {
      const { error } = await supabase
        .from("job_applications")
        .update({ status: newStatus })
        .in("id", applicationIds);

      if (error) throw error;

      // Update local state
      setApplications((prev) =>
        prev.map((app) =>
          applicationIds.includes(app.id) ? { ...app, status: newStatus } : app
        )
      );

      return true;
    } catch (err) {
      console.error("Error updating multiple application status:", err);
      return false;
    }
  };

  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
  }, [user, selectedJobId]);

  // Set up real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel("job_applications_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "job_applications",
        },
        () => {
          fetchApplications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, selectedJobId]);

  return {
    applications,
    jobs,
    loading,
    error,
    updateApplicationStatus,
    updateMultipleApplicationStatus,
    refetch: fetchApplications,
  };
};
