"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  Suspense,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { StateSelector } from "@/components/ui/state-selector";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import {
  MapPin,
  Search,
  Briefcase,
  SlidersHorizontal,
  X,
  Heart,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { useSubscription } from "@/hooks/useSubscription";
import { SaveJobAuthModal } from "@/components/SaveJobAuthModal";
import { AJAIntelligenceModal } from "@/components/jobs/AJAIntelligenceModal";
import { JobCard } from "@/components/jobs/JobCard";
import { JobDetailsView } from "@/components/jobs/JobDetailsView";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { trackJobSearch } from "@/lib/analytics";
import { categorySlugToName } from "@/lib/categories/generator";
import { appendUtmParams } from "@/lib/utils";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { JOB_CATEGORIES } from "@/lib/job-import/categories";

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
  job_type: "full-time" | "part-time" | "contract" | "internship" | "casual";
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
  disable_utm_tracking?: boolean;
  status?: "pending" | "approved" | "rejected" | "expired";
  company_id?: string | null;
  highlights?: string[] | null;
  ai_focus_percentage?: number | null;
  ai_focus_rationale?: string | null;
  ai_focus_confidence?: "high" | "medium" | "low" | null;
  ai_focus_analysed_at?: string | null;
  interview_difficulty_level?: "easy" | "medium" | "hard" | "very_hard" | null;
  interview_difficulty_rationale?: string | null;
  interview_difficulty_confidence?: "high" | "medium" | "low" | null;
  interview_difficulty_analysed_at?: string | null;
  role_summary_one_liner?: string | null;
  role_summary_plain_english?: string | null;
  role_summary_confidence?: "high" | "medium" | "low" | null;
  role_summary_analysed_at?: string | null;
  who_role_is_for_bullets?: string[] | null;
  who_role_is_for_confidence?: "high" | "medium" | "low" | null;
  who_role_is_for_analysed_at?: string | null;
  who_role_is_not_for_bullets?: string[] | null;
  who_role_is_not_for_confidence?: "high" | "medium" | "low" | null;
  who_role_is_not_for_analysed_at?: string | null;
  companies?: {
    id: string;
    name: string;
    description: string | null;
    website: string | null;
    logo_url: string | null;
  } | null;
}

interface JobWithRelevance extends Job {
  _relevanceScore?: number;
}

// Calculate search relevance score for better result ranking
// Check if search term matches any word in the title exactly
function hasExactWordMatch(title: string, searchTerm: string): boolean {
  const titleWords = title.toLowerCase().split(/[\s\-]+/); // Split on spaces and hyphens
  const searchWords = searchTerm.toLowerCase().split(/[\s\-]+/);

  return searchWords.every((searchWord) =>
    titleWords.some((titleWord) => titleWord === searchWord)
  );
}

// Check if search term matches the beginning of any word in title
function hasWordStartMatch(title: string, searchTerm: string): boolean {
  const titleWords = title.toLowerCase().split(/[\s\-]+/);
  const searchWords = searchTerm.toLowerCase().split(/[\s\-]+/);

  return searchWords.every((searchWord) =>
    titleWords.some((titleWord) => titleWord.startsWith(searchWord))
  );
}

function calculateSearchRelevance(job: Job, searchTerm: string): number {
  // Safety check for null/undefined job or missing title
  if (!job || !job.title) {
    console.warn("⚠️ calculateSearchRelevance called with invalid job:", job);
    return 0;
  }

  // Use original search term, just lowercase and trim it
  const search = searchTerm.toLowerCase().trim();
  const title = job.title.toLowerCase();
  const companyName = job.companies?.name?.toLowerCase() || "";

  let score = 0;

  // TITLE SCORING - Check exact matches first with highest priority

  // Perfect exact match of entire title
  if (title === search) {
    score = 10000;
  }
  // All search words appear as exact words in title (e.g., "software" matches "Junior Software Engineer")
  else if (hasExactWordMatch(title, search)) {
    score = 5000;
  }
  // Title starts with the exact search term
  else if (title.startsWith(search + " ") || title.startsWith(search + "-")) {
    score = 3000;
  }
  // All search words appear as word prefixes (e.g., "soft" matches "software")
  else if (hasWordStartMatch(title, search)) {
    score = 1000;
  }
  // Search term appears as a complete word (with boundaries)
  else if (
    title.includes(" " + search + " ") ||
    title.startsWith(search + " ") ||
    title.endsWith(" " + search) ||
    title.includes("-" + search + "-") ||
    title.includes("-" + search + " ") ||
    title.includes(" " + search + "-")
  ) {
    score = 500;
  }
  // General substring match (lowest priority for titles)
  else if (title.includes(search)) {
    score = 100;
  }

  // COMPANY NAME SCORING - exact matches should rank highly
  if (companyName === search) {
    score += 2000;  // Exact company match ranks above title substrings
  } else if (companyName.includes(search)) {
    score += 50;    // Partial company match as secondary signal
  }

  // MINIMAL FEATURED BONUS (should never override relevance)
  if (job.is_featured) {
    score += 0.5;
  }

  return score;
}

// Convert state codes to appropriate search terms for database filtering
function getLocationSearchTerms(stateCode: string): string[] {
  const stateMapping: Record<string, string[]> = {
    all: [], // Return empty array for "all" - no filtering needed
    nsw: ["NSW", "New South Wales", "Sydney", "Newcastle", "Wollongong"],
    vic: ["VIC", "Victoria", "Melbourne", "Geelong", "Ballarat"],
    qld: [
      "QLD",
      "Queensland",
      "Brisbane",
      "Gold Coast",
      "Cairns",
      "Townsville",
    ],
    wa: ["WA", "Western Australia", "Perth", "Fremantle"],
    sa: ["SA", "South Australia", "Adelaide"],
    tas: ["TAS", "Tasmania", "Hobart", "Launceston"],
    act: ["ACT", "Australian Capital Territory", "Canberra"],
    nt: ["NT", "Northern Territory", "Darwin", "Alice Springs"],
    remote: ["Remote", "Work from home", "WFH", "Anywhere"],
  };

  return stateMapping[stateCode] || [];
}

// Loading component for Suspense fallback
function JobsLoading() {
  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />
      <div className="bg-primary text-white py-8 mt-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-6 text-center">
            Find Your Dream AI Job
          </h1>
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-4">
              <div className="flex-1 h-12 bg-white/20 rounded animate-pulse"></div>
              <div className="flex-1 h-12 bg-white/20 rounded animate-pulse"></div>
              <div className="h-12 w-32 bg-white/20 rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading jobs...</p>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Main component that uses useSearchParams
function JobsContent() {
  const { user, loading } = useAuth();
  const { profile } = useProfile();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toggleSaveJob, isJobSaved } = useSavedJobs();
  const { hasAIFocusAccess } = useSubscription();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobsLoading, setJobsLoading] = useState(true);
  // Initialize with server-safe defaults to prevent hydration mismatch
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [selectedLocationTypes, setSelectedLocationTypes] = useState<string[]>(
    []
  );
  const [selectedSalary, setSelectedSalary] = useState("");
  const [dateFilter, setDateFilter] = useState("any");
  const [showFilters, setShowFilters] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
  const [activePill, setActivePill] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("relevance");
  const [dateSort, setDateSort] = useState("newest"); // newest or oldest

  // Company search safeguards
  const companySearchInProgress = useRef(false);
  const companySearchTimeouts = useRef<Set<NodeJS.Timeout>>(new Set());
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [hasApplied, setHasApplied] = useState<Record<string, boolean>>({});
  const [isMobile, setIsMobile] = useState(false);
  const [suggestedJobs, setSuggestedJobs] = useState<Job[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [intelligenceModalOpen, setIntelligenceModalOpen] = useState(false);
  const [pendingJobId, setPendingJobId] = useState<string | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isDrawerClosing, setIsDrawerClosing] = useState(false);
  const [isDesktopTransitioning, setIsDesktopTransitioning] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);
  const JOBS_PER_PAGE = 25;

  // Track if we should sync URL params (only on initial load, not after manual actions)
  const shouldSyncFromUrl = useRef(true);
  const initialized = useRef(false);
  const previousSearchParamsRef = useRef<string>("");

  // Refs for stable filter effect - prevents unnecessary re-fetches
  const previousFilterDepsRef = useRef<string>("");
  const fetchJobsRef = useRef<(() => Promise<void>) | null>(null);

  // Debounce search term to prevent race conditions during rapid typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch category counts on mount (lightweight - one column only)
  useEffect(() => {
    const fetchCategoryCounts = async () => {
      const { data } = await supabase
        .from("jobs")
        .select("category")
        .eq("status", "approved");
      const counts: Record<string, number> = {};
      data?.forEach((job) => {
        if (job.category) {
          counts[job.category] = (counts[job.category] || 0) + 1;
        }
      });
      setCategoryCounts(counts);
    };
    fetchCategoryCounts();
  }, []);

  // Memoized filter dependencies to prevent unnecessary re-renders
  const filterDeps = useMemo(
    () => ({
      searchTerm: debouncedSearchTerm,
      selectedState,
      selectedCategories: selectedCategories.join(","),
      selectedLocations: selectedLocations.join(","),
      selectedJobTypes: selectedJobTypes.join(","),
      selectedLocationTypes: selectedLocationTypes.join(","),
      selectedSalary,
      dateFilter,
      dateSort,
      sortBy,
      currentPage,
    }),
    [
      debouncedSearchTerm,
      selectedState,
      selectedCategories,
      selectedLocations,
      selectedJobTypes,
      selectedLocationTypes,
      selectedSalary,
      dateFilter,
      dateSort,
      sortBy,
      currentPage,
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
          salary_period,
          show_salary,
          is_featured,
          created_at,
          expires_at,
          application_method,
          application_url,
          application_email,
          highlights,
          company_id,
          companies (
            id,
            name,
            description,
            website,
            logo_url
          )
        `
        )
        .eq("status", "approved")
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(5);

      if (!featuredError && featuredJobs) {
        // Company data is now included in the query, cast to Job type
        setSuggestedJobs(featuredJobs as unknown as Job[]);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, []);

  const fetchJobs = useCallback(
    async (overrideSearch?: string, overrideLocation?: string) => {
      const startTime = Date.now();
      const MINIMUM_LOADING_TIME = 400; // Minimum ms to show loading state for smoother UX

      try {
        setJobsLoading(true);

        // Use override parameters if provided, otherwise use state values
        const effectiveSearchTerm =
          overrideSearch !== undefined ? overrideSearch : debouncedSearchTerm;
        const effectiveLocationTerm =
          overrideLocation !== undefined ? overrideLocation : selectedState;

        let query = supabase.from("jobs").select(
          `
          *,
          highlights,
          companies (
            id,
            name,
            description,
            website,
            logo_url
          )
        `,
          { count: "exact" }
        );
        // Only show approved jobs in public listing
        query = query.eq("status", "approved");

        // Apply filters with title search (working solution)
        if (effectiveSearchTerm) {
          query = query.ilike("title", `%${effectiveSearchTerm}%`);
        }
        if (effectiveLocationTerm && effectiveLocationTerm !== "all") {
          if (effectiveLocationTerm === "remote") {
            // Handle remote jobs by filtering location_type
            query = query.eq("location_type", "remote");
          } else {
            // Handle state-based filtering using OR conditions
            const searchTerms = getLocationSearchTerms(effectiveLocationTerm);
            if (searchTerms.length > 0) {
              const locationConditions = searchTerms
                .map((term) => `location.ilike.%${term}%`)
                .join(",");
              query = query.or(locationConditions);
            } else {
              // Fallback: treat as direct location search (for backward compatibility)
              query = query.ilike("location", `%${effectiveLocationTerm}%`);
            }
          }
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

        // Apply date filter
        if (dateFilter !== "any") {
          const now = new Date();
          let cutoffDate;

          switch (dateFilter) {
            case "24h":
              cutoffDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
              break;
            case "7d":
              cutoffDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
              break;
            case "30d":
              cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
              break;
          }

          if (cutoffDate) {
            query = query.gte("created_at", cutoffDate.toISOString());
          }
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

        // Apply pagination - calculate offset
        const offset = (currentPage - 1) * JOBS_PER_PAGE;
        const {
          data,
          error,
          count: totalCount,
        } = await query.range(offset, offset + JOBS_PER_PAGE - 1);

        // Set total count for pagination
        if (totalCount !== null) {
          setTotalJobs(totalCount);
        }

        if (error) {
          toast.error("Failed to load jobs");
          return;
        }

        let jobsData = (data as Job[]) || [];

        // Filter out any null/invalid jobs from the initial query
        jobsData = jobsData.filter((job) => job && job.title && job.id);

        // Company name search - search for jobs by company name
        if (effectiveSearchTerm && effectiveSearchTerm.trim()) {
          // Safeguard: Prevent duplicate simultaneous company searches
          if (companySearchInProgress.current) {
            return;
          }

          companySearchInProgress.current = true;

          // Safeguard: Set timeout to prevent hanging
          const companySearchTimeout = setTimeout(() => {
            companySearchInProgress.current = false;
          }, 10000);
          companySearchTimeouts.current.add(companySearchTimeout);

          try {
            // Search for jobs by company name using a separate query
            let companyQuery = supabase.from("jobs").select(`
            *,
            highlights,
            companies (
              id,
              name,
              description,
              website,
              logo_url
            )
          `);

            // Apply same status filter as main query
            companyQuery = companyQuery.eq("status", "approved");

            // Apply all the same filters except title search
            if (effectiveLocationTerm && effectiveLocationTerm !== "all") {
              if (effectiveLocationTerm === "remote") {
                // Handle remote jobs by filtering location_type
                companyQuery = companyQuery.eq("location_type", "remote");
              } else {
                // Handle state-based filtering using OR conditions
                const searchTerms = getLocationSearchTerms(
                  effectiveLocationTerm
                );
                if (searchTerms.length > 0) {
                  const locationConditions = searchTerms
                    .map((term) => `location.ilike.%${term}%`)
                    .join(",");
                  companyQuery = companyQuery.or(locationConditions);
                } else {
                  // Fallback: treat as direct location search (for backward compatibility)
                  companyQuery = companyQuery.ilike(
                    "location",
                    `%${effectiveLocationTerm}%`
                  );
                }
              }
            }
            if (selectedCategories.length > 0) {
              companyQuery = companyQuery.in("category", selectedCategories);
            }
            if (selectedJobTypes.length > 0) {
              companyQuery = companyQuery.in("job_type", selectedJobTypes);
            }
            if (selectedLocationTypes.length > 0) {
              companyQuery = companyQuery.in(
                "location_type",
                selectedLocationTypes
              );
            }
            if (selectedLocations.length > 0) {
              const locationConditions = selectedLocations
                .map((loc) =>
                  loc === "remote"
                    ? "location_type.eq.remote"
                    : `location.ilike.%${loc}%`
                )
                .join(",");
              companyQuery = companyQuery.or(locationConditions);
            }
            if (selectedSalary) {
              companyQuery = companyQuery.gte(
                "salary_min",
                parseInt(selectedSalary)
              );
            }

            // Find companies that match the search term
            const { data: matchingCompanies } = await supabase
              .from("companies")
              .select("id")
              .ilike("name", `%${effectiveSearchTerm}%`);

            if (matchingCompanies && matchingCompanies.length > 0) {
              const companyIds = matchingCompanies.map((c) => c.id);
              companyQuery = companyQuery.in("company_id", companyIds);

              const { data: companyJobs, error: companyError } =
                await companyQuery;

              if (!companyError && companyJobs) {
                const companyJobsData = companyJobs as Job[];

                // Merge results and remove duplicates by job ID
                const existingJobIds = new Set(jobsData.map((job) => job.id));
                const newJobs = companyJobsData.filter(
                  (job) =>
                    job && job.title && job.id && !existingJobIds.has(job.id)
                );
                jobsData = [...jobsData, ...newJobs];
              }
            }

            // Cleanup: Clear timeout and release lock
            companySearchTimeouts.current.forEach((timeout) =>
              clearTimeout(timeout)
            );
            companySearchTimeouts.current.clear();
            companySearchInProgress.current = false;
          } catch {
            // Cleanup: Clear timeout and release lock on error
            companySearchTimeouts.current.forEach((timeout) =>
              clearTimeout(timeout)
            );
            companySearchTimeouts.current.clear();
            companySearchInProgress.current = false;
            // Continue with title search results only
          }
        }

        // Add relevance scoring when search term exists
        if (
          effectiveSearchTerm &&
          effectiveSearchTerm.trim() &&
          jobsData.length > 0
        ) {
          // Filter out any null/invalid jobs before processing
          jobsData = jobsData
            .filter((job) => job && job.title)
            .map((job) => ({
              ...job,
              _relevanceScore: calculateSearchRelevance(
                job,
                effectiveSearchTerm.trim()
              ),
            }));
        }

        // Apply sorting to merged results
        if (jobsData.length > 0) {
          switch (sortBy) {
            case "date":
              jobsData.sort((a, b) => {
                const dateA = new Date(a.created_at).getTime();
                const dateB = new Date(b.created_at).getTime();
                return dateSort === "oldest" ? dateA - dateB : dateB - dateA;
              });
              break;
            case "salary":
              jobsData.sort((a, b) => {
                // If search exists, prioritize relevance first
                if (effectiveSearchTerm && effectiveSearchTerm.trim()) {
                  const relevanceA =
                    (a as JobWithRelevance)._relevanceScore || 0;
                  const relevanceB =
                    (b as JobWithRelevance)._relevanceScore || 0;
                  if (relevanceA !== relevanceB) {
                    return relevanceB - relevanceA;
                  }
                }
                const salaryA = a.salary_max || 0;
                const salaryB = b.salary_max || 0;
                return salaryB - salaryA;
              });
              break;
            case "featured":
              jobsData.sort((a, b) => {
                // If search exists, prioritize relevance first
                if (effectiveSearchTerm && effectiveSearchTerm.trim()) {
                  const relevanceA =
                    (a as JobWithRelevance)._relevanceScore || 0;
                  const relevanceB =
                    (b as JobWithRelevance)._relevanceScore || 0;
                  if (relevanceA !== relevanceB) {
                    return relevanceB - relevanceA;
                  }
                }
                if (a.is_featured && !b.is_featured) return -1;
                if (!a.is_featured && b.is_featured) return 1;
                return (
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
                );
              });
              break;
            default:
              jobsData.sort((a, b) => {
                // If search exists, prioritize relevance first
                if (effectiveSearchTerm && effectiveSearchTerm.trim()) {
                  const relevanceA =
                    (a as JobWithRelevance)._relevanceScore || 0;
                  const relevanceB =
                    (b as JobWithRelevance)._relevanceScore || 0;
                  if (relevanceA !== relevanceB) {
                    return relevanceB - relevanceA;
                  }
                }
                if (a.is_featured && !b.is_featured) return -1;
                if (!a.is_featured && b.is_featured) return 1;
                return (
                  new Date(b.created_at).getTime() -
                  new Date(a.created_at).getTime()
                );
              });
          }
        }

        // Update total jobs count after merging company search results
        // Only override the database count when we have a search term (company search adds extra results)
        if (effectiveSearchTerm && effectiveSearchTerm.trim()) {
          setTotalJobs(jobsData.length);
        }

        // Track search event with PostHog
        trackJobSearch({
          search_query: effectiveSearchTerm || undefined,
          location_filter:
            effectiveLocationTerm !== "all" ? effectiveLocationTerm : undefined,
          category_filter:
            selectedCategories.length > 0
              ? selectedCategories.join(",")
              : undefined,
          salary_filter: selectedSalary || undefined,
          results_count: jobsData.length,
        });

        if (jobsData.length > 0) {
          setJobs(jobsData);
        } else {
          setJobs([]);
          // Fetch suggestions if no jobs found
          await fetchSuggestions();
        }
      } catch {
        toast.error("Failed to load jobs");
      } finally {
        // Ensure minimum loading time for smoother UX
        const elapsedTime = Date.now() - startTime;
        const remainingTime = MINIMUM_LOADING_TIME - elapsedTime;
        if (remainingTime > 0) {
          await new Promise((resolve) => setTimeout(resolve, remainingTime));
        }
        setJobsLoading(false);
      }
    },
    [
      debouncedSearchTerm,
      selectedState,
      selectedCategories,
      selectedLocations,
      selectedJobTypes,
      selectedLocationTypes,
      selectedSalary,
      dateFilter,
      dateSort,
      sortBy,
      currentPage,
      JOBS_PER_PAGE,
      fetchSuggestions,
    ]
  );

  // Keep fetchJobsRef in sync with the latest fetchJobs callback
  useEffect(() => {
    fetchJobsRef.current = fetchJobs;
  }, [fetchJobs]);

  // Sync URL parameters with state after hydration (prevents hydration mismatch)
  useEffect(() => {
    const urlSearch = searchParams.get("search");
    const urlLocation = searchParams.get("location");

    if (urlSearch && urlSearch !== searchTerm) {
      setSearchTerm(urlSearch);
    }

    if (urlLocation && urlLocation !== selectedState) {
      setSelectedState(urlLocation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once after initial mount to prevent hydration mismatch

  // Auto-select first job when jobs are loaded (desktop only)
  useEffect(() => {
    if (jobs.length > 0 && !selectedJob && !isMobile) {
      setSelectedJob(jobs[0]);
    }
  }, [jobs, selectedJob, isMobile]);

  // Consolidated initialization and authentication effect
  useEffect(() => {
    if (loading) {
      return;
    }

    // Handle authentication redirect
    // Allow guest access with guest=true parameter
    if (!user) {
      const isGuest = searchParams.get("guest") === "true";
      if (!isGuest) {
        // Redirect to login, preserving the current URL for "Maybe Later"
        const currentUrl = `${window.location.pathname}${window.location.search}`;
        router.push(`/login?next=${encodeURIComponent(currentUrl)}`);
        return;
      }
    }

    // Sync URL parameters on initial load only
    if (!initialized.current && shouldSyncFromUrl.current) {
      const urlSearch = searchParams.get("search") || "";
      const urlLocation = searchParams.get("location") || "all";

      setSearchTerm(urlSearch);
      setSelectedState(urlLocation);

      shouldSyncFromUrl.current = false;
      initialized.current = true;

      // Use a micro-task to ensure initialization is complete before filter effect runs
      setTimeout(() => {
        fetchJobs();
      }, 0);
    } else if (!initialized.current && !loading) {
      // No URL params to sync, just mark as initialized
      initialized.current = true;
      // Use a micro-task to ensure initialization is complete before job fetching
      setTimeout(() => {
        fetchJobs();
      }, 0);
    }
  }, [loading, user, router, searchParams, fetchJobs]);

  // Reset sync flag when URL params actually change (new navigation)
  useEffect(() => {
    const isGuest = searchParams.get("guest") === "true";

    // Get current search params without jobId (filter params only)
    const currentParams = new URLSearchParams(searchParams.toString());
    currentParams.delete("jobId"); // Ignore jobId changes
    const currentFilterParams = currentParams.toString();

    // Only reset if filter params changed, not just jobId
    const filterParamsChanged =
      previousSearchParamsRef.current !== "" &&
      previousSearchParamsRef.current !== currentFilterParams;

    // Update the ref for next comparison
    if (previousSearchParamsRef.current === "") {
      previousSearchParamsRef.current = currentFilterParams;
    }

    // Don't reset during initial guest mode setup or if only jobId changed
    if (initialized.current && !isGuest && filterParamsChanged) {
      shouldSyncFromUrl.current = true;
      initialized.current = false;
      previousSearchParamsRef.current = currentFilterParams;
    }
  }, [searchParams, loading]);
  // Job fetching effect - triggers on filter changes
  // Uses refs to prevent re-fetches when only fetchJobs reference changes (e.g., on auth state changes)
  useEffect(() => {
    // Simplified condition: fetch jobs when initialized, regardless of auth loading
    const shouldProceed = initialized.current;

    // Serialize current filter values to compare with previous
    const currentFilterString = JSON.stringify(filterDeps);
    const filtersActuallyChanged = previousFilterDepsRef.current !== currentFilterString;

    // Only refetch if filters actually changed, not just because fetchJobs reference changed
    if (shouldProceed && filtersActuallyChanged) {
      previousFilterDepsRef.current = currentFilterString;
      if (fetchJobsRef.current) {
        fetchJobsRef.current();
      }
    }
  }, [filterDeps, user, loading]);

  // Reset to page 1 when filters change
  useEffect(() => {
    if (initialized.current) {
      setCurrentPage(1);
    }
  }, [
    searchTerm,
    selectedState,
    selectedCategories,
    selectedLocations,
    selectedJobTypes,
    selectedLocationTypes,
    selectedSalary,
    dateSort,
    sortBy,
  ]);

  // Scroll to top when page changes
  useEffect(() => {
    if (currentPage > 1) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!activePill) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      // Check if click is outside all filter dropdowns
      if (!target.closest(".relative")) {
        setActivePill(null);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [activePill]);

  // Application status check effect
  useEffect(() => {
    if (selectedJob && user) {
      checkApplicationStatus(selectedJob.id);
    }
  }, [selectedJob, user, checkApplicationStatus]);

  // Handle screen size detection and prevent scroll restoration
  useEffect(() => {
    // Prevent browser scroll restoration globally
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }

    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => {
      window.removeEventListener("resize", checkScreenSize);
    };
  }, []);

  // Handle direct links on initial page load only (one-time check)
  useEffect(() => {
    const jobIdParam = new URLSearchParams(window.location.search).get("jobId");
    if (jobIdParam && jobs.length > 0 && !selectedJob) {
      const job = jobs.find((j) => j.id === jobIdParam);
      if (job) {
        setSelectedJob(job);
      }
    }
  }, [jobs, selectedJob]);

  // Lock scroll to target position during drawer close animation
  useEffect(() => {
    if (!isDrawerClosing || !isMobile) {
      return;
    }

    const handleScroll = () => {
      if (window.scrollY !== scrollPosition) {
        window.scrollTo({ top: scrollPosition, behavior: 'instant' });
      }
    };

    // Lock scroll immediately
    window.scrollTo({ top: scrollPosition, behavior: 'instant' });

    // Add scroll listener to prevent scroll drift
    window.addEventListener('scroll', handleScroll, { passive: false });

    // Release lock after drawer animation completes (~300ms + buffer)
    const timeout = setTimeout(() => {
      window.removeEventListener('scroll', handleScroll);
      setIsDrawerClosing(false);

      // Final scroll restoration
      window.scrollTo({ top: scrollPosition, behavior: 'instant' });

      // Check again after paint
      requestAnimationFrame(() => {
        if (window.scrollY !== scrollPosition) {
          window.scrollTo({ top: scrollPosition, behavior: 'instant' });
        }
      });
    }, 400);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isDrawerClosing, isMobile, scrollPosition]);

  // Lock scroll during desktop job selection transition
  // Prevents scroll flash caused by layout recalculation when job details panel updates
  useEffect(() => {
    if (!isDesktopTransitioning || isMobile || scrollPosition === 0) {
      return;
    }

    // Aggressively restore scroll position during desktop job selection
    const handleScroll = () => {
      if (window.scrollY !== scrollPosition) {
        window.scrollTo({ top: scrollPosition, behavior: 'instant' });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: false });

    // Force restore at multiple intervals to counter layout shifts from job panel re-render
    const intervals = [0, 10, 30, 50, 100, 150, 200];
    const timeouts = intervals.map(ms =>
      setTimeout(() => {
        if (window.scrollY !== scrollPosition) {
          window.scrollTo({ top: scrollPosition, behavior: 'instant' });
        }
      }, ms)
    );

    // Release lock after job details panel has rendered
    const releaseTimeout = setTimeout(() => {
      window.removeEventListener('scroll', handleScroll);
      setIsDesktopTransitioning(false);
    }, 300);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      timeouts.forEach(t => clearTimeout(t));
      clearTimeout(releaseTimeout);
    };
  }, [isDesktopTransitioning, isMobile, scrollPosition]);

  const handleApply = () => {
    if (!user) {
      toast.error("Please sign in to apply for jobs");
      router.push("/login");
      return;
    }

    if (!selectedJob) return;

    // If external application, open link
    if (
      selectedJob.application_method === "external" &&
      selectedJob.application_url
    ) {
      window.open(appendUtmParams(selectedJob.application_url, selectedJob.disable_utm_tracking), "_blank");
      return;
    }

    // If email application, open email client
    if (
      selectedJob.application_method === "email" &&
      selectedJob.application_email
    ) {
      window.location.href = `mailto:${selectedJob.application_email}?subject=Application for ${selectedJob.title}`;
      return;
    }

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

  const handleCloseJobDetails = () => {
    // On mobile, immediately restore scroll and activate scroll lock before closing
    if (isMobile) {
      window.scrollTo({ top: scrollPosition, behavior: 'instant' });
      setIsDrawerClosing(true);
    }

    // Close the drawer
    setSelectedJob(null);

    // Remove jobId from URL
    const params = new URLSearchParams(window.location.search);
    params.delete("jobId");
    const newUrl = params.toString() ? `/jobs?${params.toString()}` : "/jobs";
    window.history.pushState(null, "", newUrl);
  };

  const jobDetailsScrollRef = useRef<HTMLDivElement>(null);

  const handleJobClick = (job: Job) => {
    // Store scroll position for both mobile and desktop
    const currentScroll = window.scrollY;
    setScrollPosition(currentScroll);

    if (!isMobile) {
      // Desktop: Activate desktop transitioning scroll lock
      setIsDesktopTransitioning(true);
    }

    // Update URL without triggering router change (prevents refetch)
    const params = new URLSearchParams(window.location.search);
    params.set("jobId", job.id);
    window.history.pushState(null, "", `/jobs?${params.toString()}`);

    // Reset scroll position of job details panel
    if (jobDetailsScrollRef.current) {
      jobDetailsScrollRef.current.scrollTop = 0;
    }

    setSelectedJob(job);
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
    return (
      categories[category as keyof typeof categories] ||
      categorySlugToName(category)
    );
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedLocations([]);
    setSelectedJobTypes([]);
    setSelectedLocationTypes([]);
    setSelectedSalary("");
    setDateFilter("any");
    setSearchTerm("");
    setSelectedState("all");
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
            <div className="flex flex-col md:flex-row gap-4 mb-4">
              <div className="w-full md:flex-1">
                <SearchInput
                  key="jobs-search-input"
                  placeholder="Job title, keywords, or company"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onClear={() => setSearchTerm("")}
                  leftIcon={<Search className="h-5 w-5" />}
                  className="h-12 text-base bg-white text-gray-900"
                />
              </div>

              <div className="w-full md:flex-1">
                <StateSelector
                  placeholder="Select location"
                  value={selectedState}
                  onValueChange={setSelectedState}
                  className="h-12 text-base bg-white text-gray-900"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="h-12 gap-2 bg-white text-primary hover:bg-gray-100 px-6 w-full md:w-auto"
              >
                <Search className="w-5 h-5" />
                Search Jobs
              </Button>
            </div>

            {/* Options Link */}
            {showOptions && (
              <div className="flex justify-end mt-2">
                <button
                  type="button"
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
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2 animate-fade-in">
                {/* Category Filter (Multi-select) */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setActivePill(activePill === "category" ? null : "category")
                    }
                    className={`h-8 md:h-10 pl-2 md:pl-3 pr-6 md:pr-8 py-1 md:py-2 text-xs md:text-sm border rounded-sm appearance-none relative transition-all duration-200 ${
                      activePill === "category"
                        ? "bg-white text-gray-900 border-gray-200"
                        : "bg-white/10 text-white border-white/20 backdrop-blur-sm"
                    } ${activePill && activePill !== "category" ? "opacity-60" : "opacity-100"}`}
                  >
                    {selectedCategories.length === 0
                      ? "All categories"
                      : selectedCategories.length === 1
                        ? getCategoryDisplay(selectedCategories[0])
                        : `${selectedCategories.length} categories`}
                    <svg
                      className="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 pointer-events-none w-3 h-3 md:w-3 md:h-3"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M3 4.5L6 7.5L9 4.5"
                        stroke={activePill === "category" ? "#111827" : "white"}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  {activePill === "category" && (
                    <div className="absolute top-full left-0 mt-1 min-w-[240px] bg-white border border-gray-200 rounded-sm overflow-hidden z-50 shadow-lg max-h-80 overflow-y-auto">
                      {selectedCategories.length > 0 && (
                        <button
                          onClick={() => setSelectedCategories([])}
                          className="w-full text-left px-3 py-2 text-sm text-primary hover:bg-gray-100 transition-colors whitespace-nowrap border-b border-gray-100"
                        >
                          All categories
                        </button>
                      )}
                      {[...JOB_CATEGORIES]
                        .sort((a, b) => a.label.localeCompare(b.label))
                        .map((cat) => {
                          const isChecked = selectedCategories.includes(cat.value);
                          const count = categoryCounts[cat.value] || 0;
                          return (
                            <label
                              key={cat.value}
                              className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => {
                                  setSelectedCategories((prev) =>
                                    isChecked
                                      ? prev.filter((c) => c !== cat.value)
                                      : [...prev, cat.value]
                                  );
                                }}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                              />
                              <span className="flex-1">{cat.label}</span>
                              {count > 0 && (
                                <span className="text-xs text-gray-400 tabular-nums">
                                  {count}
                                </span>
                              )}
                            </label>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* Job Type Filter */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setActivePill(activePill === "jobType" ? null : "jobType")
                    }
                    className={`h-8 md:h-10 pl-2 md:pl-3 pr-6 md:pr-8 py-1 md:py-2 text-xs md:text-sm border rounded-sm appearance-none relative transition-all duration-200 ${
                      activePill === "jobType"
                        ? "bg-white text-gray-900 border-gray-200"
                        : "bg-white/10 text-white border-white/20 backdrop-blur-sm"
                    } ${activePill && activePill !== "jobType" ? "opacity-60" : "opacity-100"}`}
                  >
                    {selectedJobTypes.length > 0
                      ? selectedJobTypes[0] === "full-time"
                        ? "Full time"
                        : selectedJobTypes[0] === "part-time"
                          ? "Part time"
                          : selectedJobTypes[0] === "contract"
                            ? "Contract"
                            : selectedJobTypes[0] === "internship"
                              ? "Internship"
                              : selectedJobTypes[0] === "casual"
                                ? "Casual/Temporary"
                                : "Any job type"
                      : "Any job type"}
                    <svg
                      className="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 pointer-events-none w-3 h-3 md:w-3 md:h-3"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M3 4.5L6 7.5L9 4.5"
                        stroke={activePill === "jobType" ? "#111827" : "white"}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  {activePill === "jobType" && (
                    <div className="absolute top-full left-0 mt-1 min-w-full bg-white border border-gray-200 rounded-sm overflow-hidden z-50 shadow-lg">
                      {selectedJobTypes.length > 0 && (
                        <button
                          onClick={() => {
                            setSelectedJobTypes([]);
                            setActivePill(null);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors"
                        >
                          Any job type
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedJobTypes(["full-time"]);
                          setActivePill(null);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors"
                      >
                        Full time
                      </button>
                      <button
                        onClick={() => {
                          setSelectedJobTypes(["part-time"]);
                          setActivePill(null);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors"
                      >
                        Part time
                      </button>
                      <button
                        onClick={() => {
                          setSelectedJobTypes(["contract"]);
                          setActivePill(null);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors"
                      >
                        Contract
                      </button>
                      <button
                        onClick={() => {
                          setSelectedJobTypes(["internship"]);
                          setActivePill(null);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors"
                      >
                        Internship
                      </button>
                      <button
                        onClick={() => {
                          setSelectedJobTypes(["casual"]);
                          setActivePill(null);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors"
                      >
                        Casual/Temporary
                      </button>
                    </div>
                  )}
                </div>

                {/* Salary Filter */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setActivePill(activePill === "salary" ? null : "salary")
                    }
                    className={`h-8 md:h-10 pl-2 md:pl-3 pr-6 md:pr-8 py-1 md:py-2 text-xs md:text-sm border rounded-sm appearance-none relative transition-all duration-200 ${
                      activePill === "salary"
                        ? "bg-white text-gray-900 border-gray-200"
                        : "bg-white/10 text-white border-white/20 backdrop-blur-sm"
                    } ${activePill && activePill !== "salary" ? "opacity-60" : "opacity-100"}`}
                  >
                    {selectedSalary
                      ? `$${parseInt(selectedSalary).toLocaleString()}+`
                      : "Any Salary"}
                    <svg
                      className="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 pointer-events-none w-3 h-3 md:w-3 md:h-3"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M3 4.5L6 7.5L9 4.5"
                        stroke={activePill === "salary" ? "#111827" : "white"}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  {activePill === "salary" && (
                    <div className="absolute top-full left-0 mt-1 min-w-full bg-white border border-gray-200 rounded-sm overflow-hidden z-50 shadow-lg">
                      {selectedSalary && (
                        <button
                          onClick={() => {
                            setSelectedSalary("");
                            setActivePill(null);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors whitespace-nowrap"
                        >
                          Any Salary
                        </button>
                      )}
                      {[50000, 70000, 100000, 130000, 160000, 200000, 250000, 350000].map((salary) => (
                        <button
                          key={salary}
                          onClick={() => {
                            setSelectedSalary(String(salary));
                            setActivePill(null);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors whitespace-nowrap"
                        >
                          ${salary.toLocaleString()}+
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Date Filter */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setActivePill(activePill === "date" ? null : "date")
                    }
                    className={`h-8 md:h-10 pl-2 md:pl-3 pr-6 md:pr-8 py-1 md:py-2 text-xs md:text-sm border rounded-sm appearance-none relative transition-all duration-200 ${
                      activePill === "date"
                        ? "bg-white text-gray-900 border-gray-200"
                        : "bg-white/10 text-white border-white/20 backdrop-blur-sm"
                    } ${activePill && activePill !== "date" ? "opacity-60" : "opacity-100"}`}
                  >
                    {dateFilter === "any"
                      ? "Listed any time"
                      : dateFilter === "24h"
                        ? "Last 24 hours"
                        : dateFilter === "7d"
                          ? "Last 7 days"
                          : dateFilter === "30d"
                            ? "Last 30 days"
                            : "Listed any time"}
                    <svg
                      className="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 pointer-events-none w-3 h-3 md:w-3 md:h-3"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M3 4.5L6 7.5L9 4.5"
                        stroke={activePill === "date" ? "#111827" : "white"}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  {activePill === "date" && (
                    <div className="absolute top-full left-0 mt-1 min-w-full bg-white border border-gray-200 rounded-sm overflow-hidden z-50 shadow-lg">
                      {dateFilter !== "any" && (
                        <button
                          onClick={() => {
                            setDateFilter("any");
                            setActivePill(null);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors whitespace-nowrap"
                        >
                          Listed any time
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setDateFilter("24h");
                          setActivePill(null);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors whitespace-nowrap"
                      >
                        Last 24 hours
                      </button>
                      <button
                        onClick={() => {
                          setDateFilter("7d");
                          setActivePill(null);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors whitespace-nowrap"
                      >
                        Last 7 days
                      </button>
                      <button
                        onClick={() => {
                          setDateFilter("30d");
                          setActivePill(null);
                        }}
                        className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 transition-colors whitespace-nowrap"
                      >
                        Last 30 days
                      </button>
                    </div>
                  )}
                </div>

                {/* Reset All Filters Link */}
                {(searchTerm ||
                  (selectedState && selectedState !== "all") ||
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

      {/* Main Content - 3-column layout */}
      <div className="flex justify-center min-h-screen">
        {/* Left ad column - hidden below 1280px */}
        <div className="hidden xl:block w-[160px] shrink-0">
          {/* Future ad space */}
        </div>

        {/* Middle content */}
        <div className="flex-1 max-w-6xl">
          <div className="flex flex-col lg:flex-row gap-0 lg:gap-4">
            {/* Jobs List - Left Side */}
            <div className="w-full lg:w-2/5">
              <div className="p-4 border-b border-border bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {(() => {
                  // Check if any filters or search are active
                  const hasActiveFilters =
                    searchTerm ||
                    (selectedState && selectedState !== "all") ||
                    selectedCategories.length > 0 ||
                    selectedLocations.length > 0 ||
                    selectedJobTypes.length > 0 ||
                    selectedLocationTypes.length > 0 ||
                    selectedSalary ||
                    dateFilter !== "any";

                  return (
                    <Badge
                      variant="secondary"
                      className="bg-primary text-white font-semibold px-2 py-1 hover:bg-primary/90 transition-colors"
                    >
                      {jobsLoading
                        ? "Loading..."
                        : !hasActiveFilters
                          ? "All jobs"
                          : `${totalJobs > 0 ? totalJobs.toLocaleString() : jobs.length.toLocaleString()} jobs`}
                    </Badge>
                  );
                })()}
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
            ) : !jobsLoading && jobs.length === 0 ? (
              <div className="p-4 space-y-6">
                {/* No results message */}
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No exact matches found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    We couldn&apos;t find jobs matching your criteria, but here
                    are some suggestions
                  </p>

                  {/* Quick actions */}
                  <div className="flex flex-wrap gap-2 justify-center mb-6">
                    {(searchTerm ||
                      (selectedState && selectedState !== "all") ||
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
                    {selectedState && selectedState !== "all" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedState("all")}
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
                                <h3 className="font-semibold text-base mb-1 text-foreground">
                                  {job.title}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                  <MapPin className="w-3 h-3" />
                                  <span>{job.location}</span>
                                  {job.location_type !== "onsite" && (
                                    <span className="text-xs px-2 py-0.5 bg-muted rounded capitalize">
                                      {job.location_type}
                                    </span>
                                  )}
                                </div>
                                {job.show_salary !== false &&
                                  formatSalary(
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
                        "Data Scientist",
                        "AI Engineer",
                        "ML Engineer",
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
              <ErrorBoundary>
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
              </ErrorBoundary>
            )}

            {/* Pagination Controls */}
            {totalJobs > JOBS_PER_PAGE && (
              <div className="flex items-center justify-center gap-2 p-4">
                {/* Previous Button */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-10 w-10"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </Button>

                {/* Page Numbers */}
                {Array.from(
                  { length: Math.min(5, Math.ceil(totalJobs / JOBS_PER_PAGE)) },
                  (_, i) => {
                    const totalPages = Math.ceil(totalJobs / JOBS_PER_PAGE);
                    let pageNum;

                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={pageNum}
                        variant={
                          currentPage === pageNum ? "default" : "outline"
                        }
                        size="icon"
                        onClick={() => setCurrentPage(pageNum)}
                        className="h-10 w-10"
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                )}

                {/* Next Button */}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    setCurrentPage((p) =>
                      Math.min(Math.ceil(totalJobs / JOBS_PER_PAGE), p + 1)
                    )
                  }
                  disabled={currentPage >= Math.ceil(totalJobs / JOBS_PER_PAGE)}
                  className="h-10 w-10"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Button>
              </div>
            )}

            {/* Footer spacer to ensure scrolling works */}
            <div className="h-20 p-4">
              <div className="text-center text-sm text-muted-foreground">
                {totalJobs > 0 &&
                  `Showing ${Math.min((currentPage - 1) * JOBS_PER_PAGE + 1, totalJobs)} - ${Math.min(currentPage * JOBS_PER_PAGE, totalJobs)}`}
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
              scrollContainerRef={jobDetailsScrollRef}
              hasAIFocusAccess={hasAIFocusAccess()}
              onIntelligenceCTAClick={user ? () => setIntelligenceModalOpen(true) : undefined}
              userSkills={profile?.skills}
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
        </div>

        {/* Right ad column - hidden below 1280px */}
        <div className="hidden xl:block w-[160px] shrink-0">
          {/* Future ad space */}
        </div>
      </div>

      <Footer />

      {/* Custom overlay for non-modal drawer */}
      {isMobile && selectedJob && (
        <div
          className="fixed inset-0 z-40 bg-black/80 transition-opacity"
          onClick={handleCloseJobDetails}
          aria-hidden="true"
        />
      )}

      {/* Mobile Job Details Drawer */}
      <Drawer
        open={isMobile && !!selectedJob}
        onOpenChange={(open) => {
          if (!open) {
            // handleCloseJobDetails handles scroll lock activation on mobile
            handleCloseJobDetails();
          }
        }}
        modal={false}
        shouldScaleBackground={false}
        noBodyStyles
        repositionInputs={false}
      >
        <DrawerContent className="max-h-[90vh]">
          <div className="sticky top-0 z-10 bg-background border-b px-4 py-3 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCloseJobDetails}
              className="h-8 w-8"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Button>
            <DrawerTitle className="text-base font-semibold">Jobs</DrawerTitle>
          </div>
          <div className="overflow-y-auto pb-4">
            {selectedJob && (
              <JobDetailsView
                job={selectedJob}
                onApply={handleApply}
                onSaveClick={handleToggleSaveJob}
                isJobSaved={isJobSaved(selectedJob.id)}
                hasApplied={hasApplied[selectedJob.id] || false}
                scrollContainerRef={jobDetailsScrollRef}
                hasAIFocusAccess={hasAIFocusAccess()}
                onIntelligenceCTAClick={user ? () => setIntelligenceModalOpen(true) : undefined}
                userSkills={profile?.skills}
              />
            )}
          </div>
        </DrawerContent>
      </Drawer>

      {/* Save Job Authentication Modal */}
      <SaveJobAuthModal
        isOpen={authModalOpen}
        onClose={handleCloseAuthModal}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* AJA Intelligence Modal */}
      <AJAIntelligenceModal
        isOpen={intelligenceModalOpen}
        onClose={() => setIntelligenceModalOpen(false)}
        source="jobs_page"
      />
    </div>
  );
}

// Main page component with Suspense wrapper
export default function JobsPage() {
  return (
    <Suspense fallback={<JobsLoading />}>
      <JobsContent />
    </Suspense>
  );
}
