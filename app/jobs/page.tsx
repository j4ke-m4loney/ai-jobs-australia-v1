"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  MapPin,
  Search,
  Filter,
  Heart,
  Eye,
  Briefcase,
  Star,
  Calendar,
  Users,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  ExternalLink,
  Mail,
  Globe,
  ArrowLeft,
  X,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { SaveJobAuthModal } from "@/components/SaveJobAuthModal";
import { JobCard } from "@/components/jobs/JobCard";
import { JobDetailsView } from "@/components/jobs/JobDetailsView";

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

export default function JobsPage() {
  console.log("Jobs component rendering...");
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toggleSaveJob, isJobSaved } = useSavedJobs();
  console.log("useSavedJobs hook values:", { toggleSaveJob, isJobSaved });
  console.log("🔍 Auth state:", { user: user?.id, loading });

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [locationTerm, setLocationTerm] = useState(
    searchParams.get("location") || ""
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [selectedLocationTypes, setSelectedLocationTypes] = useState<string[]>(
    []
  );
  const [selectedSalary, setSelectedSalary] = useState("");
  const [dateFilter, setDateFilter] = useState("any");
  const [showFilters, setShowFilters] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
  const [sortBy, setSortBy] = useState("relevance");
  const [dateSort, setDateSort] = useState("newest"); // newest or oldest
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [hasApplied, setHasApplied] = useState<Record<string, boolean>>({});
  const [isMobile, setIsMobile] = useState(false);
  const [suggestedJobs, setSuggestedJobs] = useState<Job[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [pendingJobId, setPendingJobId] = useState<string | null>(null);

  // Track if we should sync URL params (only on initial load, not after manual actions)
  const shouldSyncFromUrl = useRef(true);
  const initialized = useRef(false);

  // Memoized filter dependencies to prevent unnecessary re-renders
  const filterDeps = useMemo(
    () => ({
      searchTerm,
      locationTerm,
      selectedCategories: selectedCategories.join(","),
      selectedLocations: selectedLocations.join(","),
      selectedJobTypes: selectedJobTypes.join(","),
      selectedLocationTypes: selectedLocationTypes.join(","),
      selectedSalary,
      dateFilter,
      dateSort,
      sortBy,
    }),
    [
      searchTerm,
      locationTerm,
      selectedCategories,
      selectedLocations,
      selectedJobTypes,
      selectedLocationTypes,
      selectedSalary,
      dateFilter,
      dateSort,
      sortBy,
    ]
  );

  // Define callback functions first
  const checkApplicationStatus = useCallback(
    async (jobId: string) => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from("job_applications")
          .select("id")
          .eq("job_id", jobId)
          .eq("applicant_id", user.id)
          .single();

        if (error && error.code !== "PGRST116") throw error;
        setHasApplied((prev) => ({ ...prev, [jobId]: !!data }));
      } catch (error) {
        console.error("Error checking application status:", error);
      }
    },
    [user]
  );

  // Function to enrich jobs with company data
  const enrichJobsWithCompanyData = async (jobs: any[]): Promise<Job[]> => {
    if (!jobs || jobs.length === 0) return [];

    // Extract unique company IDs
    const companyIds = [
      ...new Set(jobs.map((job) => job.company_id).filter(Boolean)),
    ];

    if (companyIds.length === 0) {
      // No companies to fetch, return jobs as-is with companies set to null
      return jobs.map((job) => ({ ...job, companies: null }));
    }

    // Fetch company data
    const { data: companies, error: companiesError } = await supabase
      .from("companies")
      .select("id, name, description, website, logo_url")
      .in("id", companyIds);

    if (companiesError) {
      console.error("Error fetching companies:", companiesError);
      // Return jobs without company data
      return jobs.map((job) => ({ ...job, companies: null }));
    }

    // Create a map of company_id -> company for easy lookup
    const companyMap = new Map();
    companies?.forEach((company) => {
      companyMap.set(company.id, company);
    });

    // Merge company data into jobs
    return jobs.map((job) => ({
      ...job,
      companies: job.company_id ? companyMap.get(job.company_id) : null,
    }));
  };

  const fetchSuggestions = useCallback(async () => {
    setIsLoadingSuggestions(true);
    try {
      // Fetch featured or recent jobs without any filters
      const { data: featuredJobs, error: featuredError } = await supabase
        .from("jobs")
        .select(
          `
          id,
          title,
          description,
          requirements,
          location,
          location_type,
          job_type,
          category,
          salary_min,
          salary_max,
          is_featured,
          created_at,
          expires_at,
          application_method,
          application_url,
          application_email,
          highlights,
          company_id
        `
        )
        .eq("status", "approved")
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(5);

      if (!featuredError && featuredJobs) {
        // Fetch company data for featured jobs
        const jobsWithCompanies = await enrichJobsWithCompanyData(featuredJobs);
        setSuggestedJobs(jobsWithCompanies);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      setJobsLoading(true);

      let query = supabase.from("jobs").select(`
          *,
          highlights
        `);
      // DEVELOPMENT: Show both approved and pending jobs
      // In production, change this back to only show approved jobs
      // query = query.eq("status", "approved");

      console.log("Fetching jobs - user:", user?.id || "guest");

      // Apply filters
      if (searchTerm) {
        query = query.or(
          `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
        );
      }
      if (locationTerm) {
        query = query.ilike("location", `%${locationTerm}%`);
      }
      if (selectedCategories.length > 0) {
        query = query.in("category", selectedCategories);
      }
      if (selectedJobTypes.length > 0) {
        query = query.in("job_type", selectedJobTypes);
      }
      if (selectedLocationTypes.length > 0) {
        query = query.in("location_type", selectedLocationTypes);
      }
      if (selectedLocations.length > 0) {
        const locationConditions = selectedLocations
          .map((loc) =>
            loc === "remote"
              ? "location_type.eq.remote"
              : `location.ilike.%${loc}%`
          )
          .join(",");
        query = query.or(locationConditions);
      }
      if (selectedSalary) {
        query = query.gte("salary_min", parseInt(selectedSalary));
      }

      // Sorting
      switch (sortBy) {
        case "date":
          query = query.order("created_at", {
            ascending: dateSort === "oldest",
          });
          break;
        case "salary":
          query = query.order("salary_max", {
            ascending: false,
            nullsFirst: false,
          });
          break;
        case "featured":
          query = query
            .order("is_featured", { ascending: false })
            .order("created_at", { ascending: false });
          break;
        default:
          query = query
            .order("is_featured", { ascending: false })
            .order("created_at", { ascending: false });
      }

      const { data, error } = await query;

      console.log("Jobs query result:", { data, error, count: data?.length });

      if (error) {
        console.error("Error fetching jobs:", error);
        console.error("Error details:", error.message, error.details);
        toast.error("Failed to load jobs");
        return;
      }

      const jobsData = (data as Job[]) || [];
      console.log(`Found ${jobsData.length} jobs`);
      if (jobsData.length > 0) {
        console.log("First job:", jobsData[0]);

        // Enrich jobs with company data
        const jobsWithCompanies = await enrichJobsWithCompanyData(jobsData);
        setJobs(jobsWithCompanies);
      } else {
        setJobs([]);
      }

      // Auto-select first job if none selected (this will be handled after enrichment)
      if (jobsData.length > 0 && !selectedJob) {
        // The selection will be handled after enrichment in the useEffect
      }

      // Fetch suggestions if no jobs found
      if (jobsData.length === 0) {
        console.log("No jobs found, fetching suggestions...");
        await fetchSuggestions();
      }
    } catch (error) {
      console.error("Error in fetchJobs:", error);
      toast.error("Failed to load jobs");
    } finally {
      setJobsLoading(false);
    }
  }, [
    searchTerm,
    locationTerm,
    selectedCategories,
    selectedLocations,
    selectedJobTypes,
    selectedLocationTypes,
    selectedSalary,
    dateFilter,
    dateSort,
    sortBy,
    selectedJob,
    user,
  ]);

  // Auto-select first job when jobs are loaded
  useEffect(() => {
    if (jobs.length > 0 && !selectedJob) {
      setSelectedJob(jobs[0]);
    }
  }, [jobs, selectedJob]);

  // Consolidated initialization and authentication effect
  useEffect(() => {
    console.log("🔄 Initialization effect triggered", {
      loading,
      user: user?.id || "guest",
      initialized: initialized.current,
      shouldSync: shouldSyncFromUrl.current,
    });

    if (loading) {
      console.log("⏳ Still loading, skipping initialization");
      return;
    }

    // Handle authentication redirect
    if (!user) {
      const isGuest = searchParams.get("guest") === "true";
      console.log("👤 No user, guest mode:", isGuest);
      if (!isGuest) {
        const currentUrl = `${window.location.pathname}${window.location.search}`;
        console.log("🔐 Redirecting to login");
        router.push(`/login?next=${encodeURIComponent(currentUrl)}`);
        return;
      }
    }

    // Sync URL parameters on initial load only
    if (!initialized.current && shouldSyncFromUrl.current) {
      const urlSearch = searchParams.get("search") || "";
      const urlLocation = searchParams.get("location") || "";

      console.log("🔧 Syncing URL params", { urlSearch, urlLocation });
      setSearchTerm(urlSearch);
      setLocationTerm(urlLocation);

      shouldSyncFromUrl.current = false;
      initialized.current = true;
      console.log("✅ Initialization complete");
    }
  }, [loading, user, router, searchParams]);

  // Reset sync flag when URL params actually change (new navigation)
  useEffect(() => {
    if (initialized.current) {
      shouldSyncFromUrl.current = true;
      initialized.current = false;
    }
  }, [searchParams]);

  // Initial job fetching effect - triggers on component mount
  useEffect(() => {
    console.log("🎯 Initial job loading effect triggered!");
    console.log("🚀 Calling fetchJobs immediately...");
    fetchJobs();
  }, []);

  // Job fetching effect - triggers on filter changes
  useEffect(() => {
    console.log("🔍 Filter change effect triggered", {
      filterDeps,
      initialized: initialized.current,
    });

    if (!loading && initialized.current) {
      console.log("🚀 Refetching jobs due to filter change");
      fetchJobs();
    }
  }, [filterDeps]);

  // Application status check effect
  useEffect(() => {
    if (selectedJob && user) {
      checkApplicationStatus(selectedJob.id);
    }
  }, [selectedJob?.id, user?.id, checkApplicationStatus]);

  // Handle screen size detection
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleApply = () => {
    if (!user) {
      toast.error("Please sign in to apply for jobs");
      router.push("/login");
      return;
    }

    if (!selectedJob) return;

    // Navigate to dedicated apply page with full application functionality
    router.push(`/apply/${selectedJob.id}`);
  };

  const handleToggleSaveJob = async (jobId: string) => {
    if (!user) {
      setPendingJobId(jobId);
      setAuthModalOpen(true);
      return;
    }
    await toggleSaveJob(jobId);
  };

  const handleAuthSuccess = async () => {
    if (pendingJobId) {
      await toggleSaveJob(pendingJobId);
      setPendingJobId(null);
    }
  };

  const handleCloseAuthModal = () => {
    setAuthModalOpen(false);
    setPendingJobId(null);
  };

  const handleJobClick = (job: Job) => {
    if (isMobile) {
      // On mobile, navigate to apply page
      router.push(`/apply/${job.id}`);
    } else {
      // On desktop, show in sidebar
      setSelectedJob(job);
    }
  };

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return null;
    if (min && max)
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
  };

  const getCategoryDisplay = (category: string) => {
    const categories = {
      ai: "Artificial Intelligence",
      ml: "Machine Learning",
      "data-science": "Data Science",
      engineering: "Engineering",
      research: "Research",
    };
    return categories[category as keyof typeof categories] || category;
  };

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, category]);
    } else {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    }
  };

  const handleLocationChange = (location: string, checked: boolean) => {
    if (checked) {
      setSelectedLocations([...selectedLocations, location]);
    } else {
      setSelectedLocations(selectedLocations.filter((l) => l !== location));
    }
  };

  const handleJobTypeChange = (jobType: string, checked: boolean) => {
    if (checked) {
      setSelectedJobTypes([...selectedJobTypes, jobType]);
    } else {
      setSelectedJobTypes(selectedJobTypes.filter((jt) => jt !== jobType));
    }
  };

  const handleLocationTypeChange = (locationType: string, checked: boolean) => {
    if (checked) {
      setSelectedLocationTypes([...selectedLocationTypes, locationType]);
    } else {
      setSelectedLocationTypes(
        selectedLocationTypes.filter((lt) => lt !== locationType)
      );
    }
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedLocations([]);
    setSelectedJobTypes([]);
    setSelectedLocationTypes([]);
    setSelectedSalary("");
    setDateFilter("any");
    setSearchTerm("");
    setLocationTerm("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Allow page to render for both authenticated and guest users

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />

      {/* Search Header */}
      <div className="bg-primary text-white py-8 mt-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Find Your Dream AI Job
          </h1>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchJobs();
            }}
            className="max-w-4xl mx-auto"
          >
            <div className="flex gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Job title, keywords, or company"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base bg-white text-foreground"
                />
              </div>

              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Location"
                  value={locationTerm}
                  onChange={(e) => setLocationTerm(e.target.value)}
                  className="pl-10 h-12 text-base bg-white text-foreground"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="h-12 gap-2 bg-white text-primary hover:bg-gray-100 px-6"
              >
                <Search className="w-5 h-5" />
                Search
              </Button>
            </div>

            {/* Options Link */}
            {showOptions && (
              <div className="flex justify-end mt-2">
                <button
                  onClick={() => {
                    setShowOptions(false);
                    setShowFilters(true);
                  }}
                  className="text-white/80 hover:text-white underline text-sm transition-opacity duration-300 flex items-center gap-1"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Options
                </button>
              </div>
            )}

            {/* Filter Pills */}
            {showFilters && (
              <div className="flex flex-wrap items-center gap-2 mt-2 animate-fade-in">
                {/* <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-10 pl-3 pr-8 py-2 text-sm border border-white/20 rounded-sm bg-white/10 text-white backdrop-blur-sm appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgNC41TDYgNy41TDkgNC41IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=')] bg-no-repeat bg-[length:12px_12px] bg-[calc(100%-8px)_center]"
                >
                  <option value="relevance" className="text-black">
                    All work types
                  </option>
                  <option value="date" className="text-black">
                    Most Recent
                  </option>
                  <option value="salary" className="text-black">
                    Highest Salary
                  </option>
                  <option value="featured" className="text-black">
                    Featured First
                  </option>
                </select> */}

                <select
                  value={
                    selectedJobTypes.length > 0 ? selectedJobTypes[0] : "all"
                  }
                  onChange={(e) => {
                    if (e.target.value === "all") {
                      setSelectedJobTypes([]);
                    } else {
                      setSelectedJobTypes([e.target.value]);
                    }
                  }}
                  className="h-10 pl-3 pr-2 py-2 text-sm border border-white/20 rounded-sm bg-white/10 text-white backdrop-blur-sm appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgNC41TDYgNy41TDkgNC41IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=')] bg-no-repeat bg-[length:12px_12px] bg-[calc(100%-8px)_center]"
                >
                  <option value="all" className="text-black">
                    Any job type
                  </option>
                  <option value="full-time" className="text-black">
                    Full time
                  </option>
                  <option value="part-time" className="text-black">
                    Part time
                  </option>
                  <option value="contract" className="text-black">
                    Contract
                  </option>
                  <option value="internship" className="text-black">
                    Casual/Temporary
                  </option>
                  <option value="permanent" className="text-black">
                    Permanent
                  </option>
                </select>

                <select
                  value={selectedSalary}
                  onChange={(e) => setSelectedSalary(e.target.value)}
                  className="h-10 pl-3 pr-8 py-2 text-sm border border-white/20 rounded-sm bg-white/10 text-white backdrop-blur-sm appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgNC41TDYgNy41TDkgNC41IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=')] bg-no-repeat bg-[length:12px_12px] bg-[calc(100%-8px)_center]"
                >
                  <option value="" className="text-black">
                    Any Salary
                  </option>
                  <option value="30000" className="text-black">
                    $30,000+
                  </option>
                  <option value="50000" className="text-black">
                    $50,000+
                  </option>
                  <option value="70000" className="text-black">
                    $70,000+
                  </option>
                  <option value="90000" className="text-black">
                    $90,000+
                  </option>
                  <option value="110000" className="text-black">
                    $110,000+
                  </option>
                  <option value="140000" className="text-black">
                    $140,000+
                  </option>
                </select>

                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="h-10 pl-3 pr-8 py-2 text-sm border border-white/20 rounded-sm bg-white/10 text-white backdrop-blur-sm appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgNC41TDYgNy41TDkgNC41IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=')] bg-no-repeat bg-[length:12px_12px] bg-[calc(100%-8px)_center]"
                >
                  <option value="any" className="text-black">
                    Listed any time
                  </option>
                  <option value="24h" className="text-black">
                    Last 24 hours
                  </option>
                  <option value="7d" className="text-black">
                    Last 7 days
                  </option>
                  <option value="30d" className="text-black">
                    Last 30 days
                  </option>
                </select>

                {/* Reset All Filters Link */}
                {(searchTerm ||
                  locationTerm ||
                  selectedCategories.length > 0 ||
                  selectedLocations.length > 0 ||
                  selectedJobTypes.length > 0 ||
                  selectedLocationTypes.length > 0 ||
                  selectedSalary ||
                  dateFilter !== "any") && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-white/80 hover:text-white underline transition-colors ml-2"
                  >
                    Reset all
                    <br />
                    filters
                  </button>
                )}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-0 lg:gap-1 min-h-screen">
        {/* Jobs List - Left Side */}
        <div className="w-full lg:w-2/5 border-r-0 lg:border-r border-border">
          <div className="p-4 border-b border-border bg-white mx-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge
                  variant="secondary"
                  className="bg-primary text-white font-semibold px-2 py-1 hover:bg-primary/90 transition-colors"
                >
                  {jobs.length.toLocaleString()} jobs
                </Badge>
                {/* <span className="text-sm text-muted-foreground">
                  New to you
                </span>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  99+
                </Badge> */}
              </div>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                </Button>

                {showSortDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-border rounded-md shadow-lg z-50">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setSortBy("relevance");
                          setShowSortDropdown(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors ${
                          sortBy === "relevance" ? "bg-muted font-medium" : ""
                        }`}
                      >
                        Relevance
                      </button>
                      <button
                        onClick={() => {
                          if (sortBy === "date") {
                            // Toggle between newest and oldest
                            setDateSort(
                              dateSort === "newest" ? "oldest" : "newest"
                            );
                          } else {
                            setSortBy("date");
                            setDateSort("newest");
                          }
                          setShowSortDropdown(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors ${
                          sortBy === "date" ? "bg-muted font-medium" : ""
                        }`}
                      >
                        Date{" "}
                        {sortBy === "date"
                          ? `(${
                              dateSort === "newest"
                                ? "Newest first"
                                : "Oldest first"
                            })`
                          : ""}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pb-8">
            {jobsLoading ? (
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4">
                      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-1/2 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : jobs.length === 0 ? (
              <div className="p-4 space-y-6">
                {/* No results message */}
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No exact matches found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    We couldn't find jobs matching your criteria, but here are
                    some suggestions
                  </p>

                  {/* Quick actions */}
                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    {(searchTerm ||
                      locationTerm ||
                      selectedCategories.length > 0 ||
                      selectedLocations.length > 0) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllFilters}
                        className="gap-2"
                      >
                        <X className="w-4 h-4" />
                        Clear all filters
                      </Button>
                    )}
                    {searchTerm && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSearchTerm("")}
                      >
                        Clear search term
                      </Button>
                    )}
                    {locationTerm && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocationTerm("")}
                      >
                        Clear location
                      </Button>
                    )}
                    {selectedLocationTypes.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedLocationTypes([])}
                      >
                        Show all locations
                      </Button>
                    )}
                  </div>
                </div>

                {/* Suggestions section */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-foreground px-2">
                    You might be interested in these opportunities
                  </h4>

                  {/* Popular categories */}
                  <div className="grid grid-cols-2 gap-2 px-2">
                    {["ai", "ml", "data-science", "engineering"].map(
                      (category) => (
                        <Button
                          key={category}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            clearAllFilters();
                            setSelectedCategories([category]);
                          }}
                          className="justify-start gap-2"
                        >
                          <Briefcase className="w-4 h-4" />
                          <span className="capitalize">
                            {getCategoryDisplay(category)}
                          </span>
                        </Button>
                      )
                    )}
                  </div>

                  {/* Suggested jobs */}
                  {isLoadingSuggestions ? (
                    <div className="p-4">
                      <div className="animate-pulse space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="h-24 bg-muted rounded-lg"
                          ></div>
                        ))}
                      </div>
                    </div>
                  ) : suggestedJobs.length > 0 ? (
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground px-2 pt-4">
                        Featured opportunities you can apply to now
                      </h4>
                      {suggestedJobs.map((job) => (
                        <Card
                          key={job.id}
                          className="cursor-pointer transition-all duration-200 hover:shadow-lg mx-2"
                          onClick={() => handleJobClick(job)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                {job.is_featured && (
                                  <Badge className="bg-gradient-hero text-white text-xs mb-2">
                                    Featured
                                  </Badge>
                                )}
                                <h3 className="font-semibold text-base mb-1 text-foreground">
                                  {job.title}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                  <MapPin className="w-3 h-3" />
                                  <span>{job.location}</span>
                                  <span className="text-xs px-2 py-0.5 bg-muted rounded">
                                    {job.location_type}
                                  </span>
                                </div>
                                {formatSalary(
                                  job.salary_min,
                                  job.salary_max
                                ) && (
                                  <div className="text-sm font-semibold text-green-600">
                                    {formatSalary(
                                      job.salary_min,
                                      job.salary_max
                                    )}
                                  </div>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="p-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleToggleSaveJob(job.id);
                                }}
                              >
                                <Heart
                                  className={`w-4 h-4 ${
                                    isJobSaved(job.id)
                                      ? "fill-red-500 text-red-500"
                                      : "text-muted-foreground"
                                  }`}
                                />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : null}

                  {/* Alternative suggestions */}
                  <div className="border-t pt-4 px-2 space-y-3">
                    <p className="text-sm text-muted-foreground">
                      Try searching for:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "Python Developer",
                        "Data Analyst",
                        "AI Engineer",
                        "ML Researcher",
                      ].map((term) => (
                        <Button
                          key={term}
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            clearAllFilters();
                            setSearchTerm(term);
                          }}
                          className="text-primary hover:text-primary/80"
                        >
                          {term}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 p-4 max-w-lg mx-auto">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    isSelected={selectedJob?.id === job.id}
                    onClick={handleJobClick}
                    onSaveClick={handleToggleSaveJob}
                    isJobSaved={isJobSaved(job.id)}
                  />
                ))}
              </div>
            )}

            {/* Footer spacer to ensure scrolling works */}
            <div className="h-20 p-4">
              <div className="text-center text-sm text-muted-foreground">
                End of job listings
              </div>
            </div>
          </div>
        </div>

        {/* Job Detail - Right Side */}
        <div className="hidden lg:block lg:w-3/5">
          {selectedJob ? (
            <JobDetailsView
              job={selectedJob}
              onApply={handleApply}
              onSaveClick={handleToggleSaveJob}
              isJobSaved={isJobSaved(selectedJob.id)}
              hasApplied={hasApplied[selectedJob.id] || false}
            />
          ) : (
            <div className="lg:sticky lg:top-16 lg:h-[calc(100vh-64px)] flex items-center justify-center mx-4">
              <div className="text-center">
                <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Select a job to view details
                </h3>
                <p className="text-muted-foreground">
                  Choose from the jobs listed on the left to see more
                  information.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />

      {/* Save Job Authentication Modal */}
      <SaveJobAuthModal
        isOpen={authModalOpen}
        onClose={handleCloseAuthModal}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
