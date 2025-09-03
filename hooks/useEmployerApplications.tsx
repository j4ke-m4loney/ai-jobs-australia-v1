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

    // Mock jobs data from Job Management
    const mockJobs = [
      {
        id: "1",
        title: "Senior AI Engineer",
        status: "approved",
        application_count: 24,
      },
      {
        id: "2",
        title: "Machine Learning Researcher",
        status: "pending",
        application_count: 12,
      },
      {
        id: "3",
        title: "Data Scientist",
        status: "approved",
        application_count: 8,
      },
    ];

    setJobs(mockJobs);
  };

  const fetchApplications = async () => {
    if (!user) return;

    // Mock applications data
    const mockApplications = [
      {
        id: "1",
        job_id: "1",
        applicant_id: "user1",
        status: "reviewing",
        created_at: "2024-01-20T10:00:00Z",
        resume_url: "#",
        cover_letter_url: "#",
        job: {
          id: "1",
          title: "Senior AI Engineer",
          company_id: "comp1",
        },
        profiles: {
          id: "profile1",
          first_name: "Sarah",
          last_name: "Johnson",
          phone: "+61 400 123 456",
          location: "Sydney, NSW",
          experience_level: "5+ years",
          user_id: "user1",
        },
      },
      {
        id: "2",
        job_id: "1",
        applicant_id: "user2",
        status: "shortlisted",
        created_at: "2024-01-18T14:30:00Z",
        resume_url: "#",
        cover_letter_url: "#",
        job: {
          id: "1",
          title: "Senior AI Engineer",
          company_id: "comp1",
        },
        profiles: {
          id: "profile2",
          first_name: "Michael",
          last_name: "Chen",
          phone: "+61 400 789 012",
          location: "Melbourne, VIC",
          experience_level: "7+ years",
          user_id: "user2",
        },
      },
      {
        id: "3",
        job_id: "2",
        applicant_id: "user3",
        status: "reviewing",
        created_at: "2024-01-15T09:15:00Z",
        resume_url: "#",
        cover_letter_url: undefined,
        job: {
          id: "2",
          title: "Machine Learning Researcher",
          company_id: "comp2",
        },
        profiles: {
          id: "profile3",
          first_name: "Emily",
          last_name: "Rodriguez",
          phone: "+61 400 345 678",
          location: "Brisbane, QLD",
          experience_level: "4+ years",
          user_id: "user3",
        },
      },
      {
        id: "4",
        job_id: "3",
        applicant_id: "user4",
        status: "rejected",
        created_at: "2024-01-12T16:45:00Z",
        resume_url: "#",
        cover_letter_url: "#",
        job: {
          id: "3",
          title: "Data Scientist",
          company_id: "comp3",
        },
        profiles: {
          id: "profile4",
          first_name: "David",
          last_name: "Kim",
          phone: "+61 400 567 890",
          location: "Perth, WA",
          experience_level: "3+ years",
          user_id: "user4",
        },
      },
    ];

    // Filter by selected job if one is selected
    const filteredApplications = selectedJobId
      ? mockApplications.filter((app) => app.job_id === selectedJobId)
      : mockApplications;

    setApplications(filteredApplications);
    setLoading(false);
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
    fetchJobs();
  }, [user]);

  useEffect(() => {
    fetchApplications();
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
