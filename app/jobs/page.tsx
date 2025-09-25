"use client";

import { useState, useEffect, useRef, useCallback, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/search-input";
import { StateSelector } from "@/components/ui/state-selector";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  MapPin,
  Search,
  Briefcase,
  Star,
  SlidersHorizontal,
  X,
  Heart,
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

interface JobWithRelevance extends Job {
  _relevanceScore?: number;
}

// Calculate search relevance score for better result ranking
// Check if search term matches any word in the title exactly
function hasExactWordMatch(title: string, searchTerm: string): boolean {
  const titleWords = title.toLowerCase().split(/[\s\-]+/); // Split on spaces and hyphens
  const searchWords = searchTerm.toLowerCase().split(/[\s\-]+/);

  return searchWords.every(searchWord =>
    titleWords.some(titleWord => titleWord === searchWord)
  );
}

// Check if search term matches the beginning of any word in title
function hasWordStartMatch(title: string, searchTerm: string): boolean {
  const titleWords = title.toLowerCase().split(/[\s\-]+/);
  const searchWords = searchTerm.toLowerCase().split(/[\s\-]+/);

  return searchWords.every(searchWord =>
    titleWords.some(titleWord => titleWord.startsWith(searchWord))
  );
}

function calculateSearchRelevance(job: Job, searchTerm: string): number {
  // Use original search term, just lowercase and trim it
  const search = searchTerm.toLowerCase().trim();
  const title = job.title.toLowerCase();
  const companyName = job.companies?.name?.toLowerCase() || '';

  let score = 0;
  let matchType = '';

  // TITLE SCORING - Check exact matches first with highest priority

  // Perfect exact match of entire title
  if (title === search) {
    score = 10000; // Absolute highest priority
    matchType = 'EXACT-TITLE';
  }
  // All search words appear as exact words in title (e.g., "software" matches "Junior Software Engineer")
  else if (hasExactWordMatch(title, search)) {
    score = 5000; // Very high priority for exact word matches
    matchType = 'EXACT-WORDS';
  }
  // Title starts with the exact search term
  else if (title.startsWith(search + ' ') || title.startsWith(search + '-')) {
    score = 3000;
    matchType = 'TITLE-STARTS-EXACT';
  }
  // All search words appear as word prefixes (e.g., "soft" matches "software")
  else if (hasWordStartMatch(title, search)) {
    score = 1000;
    matchType = 'WORD-PREFIX';
  }
  // Search term appears as a complete word (with boundaries)
  else if (
    title.includes(' ' + search + ' ') ||
    title.startsWith(search + ' ') ||
    title.endsWith(' ' + search) ||
    title.includes('-' + search + '-') ||
    title.includes('-' + search + ' ') ||
    title.includes(' ' + search + '-')
  ) {
    score = 500;
    matchType = 'WORD-BOUNDARY';
  }
  // General substring match (lowest priority for titles)
  else if (title.includes(search)) {
    score = 100;
    matchType = 'SUBSTRING';
  }

  // COMPANY NAME SCORING (much lower priority, only as tiebreaker)
  if (companyName === search) {
    score += 20;
    matchType += '+company-exact';
  }
  else if (companyName.includes(search)) {
    score += 5;
    matchType += '+company-contains';
  }

  // MINIMAL FEATURED BONUS (should never override relevance)
  if (job.is_featured) {
    score += 0.5; // Tiny bonus, only matters for identical scores
    matchType += '+feat';
  }

  // Enhanced debug logging
  console.log(`🔍 Search: "${search}" | Job: "${job.title}" | Score: ${score} | Type: ${matchType}`);

  return score;
}

// Convert state codes to appropriate search terms for database filtering
function getLocationSearchTerms(stateCode: string): string[] {
  const stateMapping: Record<string, string[]> = {
    "all": [], // Return empty array for "all" - no filtering needed
    "nsw": ["NSW", "New South Wales", "Sydney", "Newcastle", "Wollongong"],
    "vic": ["VIC", "Victoria", "Melbourne", "Geelong", "Ballarat"],
    "qld": ["QLD", "Queensland", "Brisbane", "Gold Coast", "Cairns", "Townsville"],
    "wa": ["WA", "Western Australia", "Perth", "Fremantle"],
    "sa": ["SA", "South Australia", "Adelaide"],
    "tas": ["TAS", "Tasmania", "Hobart", "Launceston"],
    "act": ["ACT", "Australian Capital Territory", "Canberra"],
    "nt": ["NT", "Northern Territory", "Darwin", "Alice Springs"],
    "remote": ["Remote", "Work from home", "WFH", "Anywhere"]
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
  // Initialize with server-safe defaults to prevent hydration mismatch
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [selectedLocationTypes, setSelectedLocationTypes] = useState<string[]>(
    []
  );
  const [selectedSalary, setSelectedSalary] = useState("");
  const [dateFilter, setDateFilter] = useState("any");
  const [showFeaturedOnly, setShowFeaturedOnly] = useState<boolean>(
    searchParams.get("featured") === "true"
  );
  const [showFilters, setShowFilters] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
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
  const [pendingJobId, setPendingJobId] = useState<string | null>(null);

  // Track if we should sync URL params (only on initial load, not after manual actions)
  const shouldSyncFromUrl = useRef(true);
  const initialized = useRef(false);

  // Memoized filter dependencies to prevent unnecessary re-renders
  const filterDeps = useMemo(
    () => ({
      searchTerm,
      selectedState,
      selectedCategories: selectedCategories.join(","),
      selectedLocations: selectedLocations.join(","),
      selectedJobTypes: selectedJobTypes.join(","),
      selectedLocationTypes: selectedLocationTypes.join(","),
      selectedSalary,
      dateFilter,
      showFeaturedOnly,
      dateSort,
      sortBy,
    }),
    [
      searchTerm,
      selectedState,
      selectedCategories,
      selectedLocations,
      selectedJobTypes,
      selectedLocationTypes,
      selectedSalary,
      dateFilter,
      showFeaturedOnly,
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

  const fetchJobs = useCallback(async (overrideSearch?: string, overrideLocation?: string) => {
    try {
      setJobsLoading(true);

      // Use override parameters if provided, otherwise use state values
      const effectiveSearchTerm = overrideSearch !== undefined ? overrideSearch : searchTerm;
      const effectiveLocationTerm = overrideLocation !== undefined ? overrideLocation : selectedState;

      console.log("🔍 fetchJobs called with:", {
        effectiveSearchTerm,
        effectiveLocationTerm,
        fromOverride: overrideSearch !== undefined || overrideLocation !== undefined
      });

      let query = supabase.from("jobs").select(`
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
      // Only show approved jobs in public listing
      query = query.eq("status", "approved");

      console.log("Fetching jobs - user:", user?.id || "guest");

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
              .map(term => `location.ilike.%${term}%`)
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
      if (showFeaturedOnly) {
        query = query.eq("is_featured", true);
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

      console.log("🎯 EXECUTING SUPABASE QUERY NOW with filters:", {
        searchTerm: effectiveSearchTerm,
        location: effectiveLocationTerm,
        user: user?.id || "guest"
      });

      const { data, error } = await query;

      console.log("🎯 SUPABASE QUERY COMPLETED:", {
        resultCount: data?.length || 0,
        error: error?.message,
        hasData: !!data,
        firstJobTitle: data?.[0]?.title
      });

      console.log("🔍 Checking for errors after query...");

      if (error) {
        console.error("Error fetching jobs:", error);
        console.error("Error details:", error.message, error.details);
        toast.error("Failed to load jobs");
        return;
      }

      let jobsData = (data as Job[]) || [];

      console.log("🔍 Initial jobsData from main query:", {
        length: jobsData.length,
        hasData: !!jobsData,
        effectiveSearchTerm
      });

      // TESTING: Company search with comprehensive logging and safeguards
      // TODO: Monitor for hanging issues
      if (true && effectiveSearchTerm && effectiveSearchTerm.trim()) {
        console.log("🔍 Entering company search block...");
        console.log("🔍 Company search - search term:", effectiveSearchTerm);

        // Safeguard: Prevent duplicate simultaneous company searches
        if (companySearchInProgress.current) {
          console.log("🚨 Company search already in progress, skipping duplicate");
          return;
        }

        companySearchInProgress.current = true;
        console.log("🔍 Company search lock acquired");

        // Safeguard: Set timeout to prevent hanging
        const companySearchTimeout = setTimeout(() => {
          console.error("🚨 Company search timeout after 10 seconds");
          companySearchInProgress.current = false;
        }, 10000);
        companySearchTimeouts.current.add(companySearchTimeout);

        try {
          console.log("🔍 Step 1: Building company jobs query...");
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
          console.log("🔍 Step 1 complete: Base query created");

          // Apply same status filter as main query
          companyQuery = companyQuery.eq("status", "approved");

          // Apply all the same filters except title search
          if (effectiveLocationTerm && effectiveLocationTerm !== "all") {
            if (effectiveLocationTerm === "remote") {
              // Handle remote jobs by filtering location_type
              companyQuery = companyQuery.eq("location_type", "remote");
            } else {
              // Handle state-based filtering using OR conditions
              const searchTerms = getLocationSearchTerms(effectiveLocationTerm);
              if (searchTerms.length > 0) {
                const locationConditions = searchTerms
                  .map(term => `location.ilike.%${term}%`)
                  .join(",");
                companyQuery = companyQuery.or(locationConditions);
              } else {
                // Fallback: treat as direct location search (for backward compatibility)
                companyQuery = companyQuery.ilike("location", `%${effectiveLocationTerm}%`);
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
            companyQuery = companyQuery.in("location_type", selectedLocationTypes);
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
            companyQuery = companyQuery.gte("salary_min", parseInt(selectedSalary));
          }
          if (showFeaturedOnly) {
            companyQuery = companyQuery.eq("is_featured", true);
          }

          console.log("🔍 Step 2: Applying filters to company jobs query...");
          // Apply all filters here first
          console.log("🔍 Step 2 complete: Filters applied");

          console.log("🔍 Step 3: Searching for companies matching term...");
          // First, find companies that match the search term
          const { data: matchingCompanies } = await supabase
            .from("companies")
            .select("id")
            .ilike("name", `%${effectiveSearchTerm}%`);
          console.log("🔍 Step 3 complete: Company search finished", {
            foundCompanies: matchingCompanies?.length || 0,
            hasData: !!matchingCompanies
          });

          if (matchingCompanies && matchingCompanies.length > 0) {
            console.log("🔍 Step 4: Processing company IDs...");
            const companyIds = matchingCompanies.map(c => c.id);
            console.log("🔍 Company IDs extracted:", companyIds);
            companyQuery = companyQuery.in("company_id", companyIds);
            console.log("🔍 Step 4 complete: Company filter applied to jobs query");

            console.log("🔍 Step 5: Executing company jobs query...");
            const { data: companyJobs, error: companyError } = await companyQuery;
            console.log("🔍 Step 5 complete: Company jobs query finished", {
              jobCount: companyJobs?.length || 0,
              hasError: !!companyError,
              errorMessage: companyError?.message
            });

            if (!companyError && companyJobs) {
              console.log("🔍 Step 6: Processing and merging company jobs...");
              const companyJobsData = companyJobs as Job[];
              console.log(`🔍 Found ${companyJobsData.length} jobs by company search`);

              console.log("🔍 Creating existing job IDs set...");
              // Merge results and remove duplicates by job ID
              const existingJobIds = new Set(jobsData.map(job => job.id));
              console.log("🔍 Existing job IDs count:", existingJobIds.size);

              console.log("🔍 Filtering new jobs...");
              const newJobs = companyJobsData.filter(job => !existingJobIds.has(job.id));
              console.log("🔍 New jobs to add:", newJobs.length);

              console.log("🔍 Merging job arrays...");
              jobsData = [...jobsData, ...newJobs];
              console.log(`🔍 Step 6 complete: Total jobs after merging: ${jobsData.length}`);
            } else if (companyError) {
              console.error("🚨 Company jobs query error:", companyError);
            } else {
              console.log("🔍 No company jobs data returned");
            }
          } else {
            console.log("🔍 Step 4-6: No matching companies found, skipping company jobs query");
            console.log("🔍 Continuing with title search results only");
          }

          // Cleanup: Clear timeout and release lock
          companySearchTimeouts.current.forEach(timeout => clearTimeout(timeout));
          companySearchTimeouts.current.clear();
          companySearchInProgress.current = false;
          console.log("🔍 Company search lock released (success)");

        } catch (companySearchError) {
          console.error("🚨 Company search failed:", companySearchError);

          // Cleanup: Clear timeout and release lock on error
          companySearchTimeouts.current.forEach(timeout => clearTimeout(timeout));
          companySearchTimeouts.current.clear();
          companySearchInProgress.current = false;
          console.log("🔍 Company search lock released (error)");

          // Continue with title search results only
        }
        console.log("🔍 Completed company search block");
      } else {
        console.log("🔍 Skipping company search - no search term");
      }

      // Add relevance scoring when search term exists
      console.log("🔍 Checking if relevance scoring should apply...", {
        hasSearchTerm: !!effectiveSearchTerm?.trim(),
        jobCount: jobsData.length
      });

      if (effectiveSearchTerm && effectiveSearchTerm.trim() && jobsData.length > 0) {
        jobsData = jobsData.map(job => ({
          ...job,
          _relevanceScore: calculateSearchRelevance(job, effectiveSearchTerm.trim())
        }));
      }

      // Apply sorting to merged results
      if (jobsData.length > 0) {
        switch (sortBy) {
          case "date":
            jobsData.sort((a, b) => {
              // If search exists, prioritize relevance first
              if (effectiveSearchTerm && effectiveSearchTerm.trim()) {
                const relevanceA = (a as JobWithRelevance)._relevanceScore || 0;
                const relevanceB = (b as JobWithRelevance)._relevanceScore || 0;
                if (relevanceA !== relevanceB) {
                  return relevanceB - relevanceA;
                }
              }
              const dateA = new Date(a.created_at).getTime();
              const dateB = new Date(b.created_at).getTime();
              return dateSort === "oldest" ? dateA - dateB : dateB - dateA;
            });
            break;
          case "salary":
            jobsData.sort((a, b) => {
              // If search exists, prioritize relevance first
              if (effectiveSearchTerm && effectiveSearchTerm.trim()) {
                const relevanceA = (a as JobWithRelevance)._relevanceScore || 0;
                const relevanceB = (b as JobWithRelevance)._relevanceScore || 0;
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
                const relevanceA = (a as JobWithRelevance)._relevanceScore || 0;
                const relevanceB = (b as JobWithRelevance)._relevanceScore || 0;
                if (relevanceA !== relevanceB) {
                  return relevanceB - relevanceA;
                }
              }
              if (a.is_featured && !b.is_featured) return -1;
              if (!a.is_featured && b.is_featured) return 1;
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
            break;
          default:
            jobsData.sort((a, b) => {
              // If search exists, prioritize relevance first
              if (effectiveSearchTerm && effectiveSearchTerm.trim()) {
                const relevanceA = (a as JobWithRelevance)._relevanceScore || 0;
                const relevanceB = (b as JobWithRelevance)._relevanceScore || 0;
                if (relevanceA !== relevanceB) {
                  return relevanceB - relevanceA;
                }
              }
              if (a.is_featured && !b.is_featured) return -1;
              if (!a.is_featured && b.is_featured) return 1;
              return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
            });
        }
      }

      console.log("🔍 About to log job count...");
      console.log(`🎯 FINAL RESULT: Found ${jobsData.length} jobs`);
      if (jobsData.length > 0) {
        console.log("First job:", jobsData[0]);

        // Company data is now included in the query, no need to enrich separately
        setJobs(jobsData);
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
    selectedState,
    selectedCategories,
    selectedLocations,
    selectedJobTypes,
    selectedLocationTypes,
    selectedSalary,
    dateSort,
    sortBy,
    selectedJob,
    user,
    fetchSuggestions,
    showFeaturedOnly,
  ]);

  // Sync URL parameters with state after hydration (prevents hydration mismatch)
  useEffect(() => {
    const urlSearch = searchParams.get("search");
    const urlLocation = searchParams.get("location");

    if (urlSearch && urlSearch !== searchTerm) {
      console.log("🔗 Syncing search term from URL:", urlSearch);
      setSearchTerm(urlSearch);
    }

    if (urlLocation && urlLocation !== selectedState) {
      console.log("🔗 Syncing location from URL:", urlLocation);
      setSelectedState(urlLocation);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once after initial mount to prevent hydration mismatch

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
    // Allow guest access with guest=true parameter
    if (!user) {
      const isGuest = searchParams.get("guest") === "true";
      console.log("👤 No user, guest mode:", isGuest);
      if (!isGuest) {
        // Redirect to login, preserving the current URL for "Maybe Later"
        const currentUrl = `${window.location.pathname}${window.location.search}`;
        console.log("🔐 Redirecting to login with next:", currentUrl);
        router.push(`/login?next=${encodeURIComponent(currentUrl)}`);
        return;
      }
      console.log("👤 Continuing as guest");
    }

    // Sync URL parameters on initial load only
    if (!initialized.current && shouldSyncFromUrl.current) {
      const urlSearch = searchParams.get("search") || "";
      const urlLocation = searchParams.get("location") || "all";

      console.log("🔧 Syncing URL params", { urlSearch, urlLocation });
      setSearchTerm(urlSearch);
      setSelectedState(urlLocation);

      shouldSyncFromUrl.current = false;
      initialized.current = true;
      console.log("✅ Initialization complete");

      // Force filter effect to re-evaluate by triggering a state update
      console.log("✅ URL sync complete - triggering filter effect");
      // Use a micro-task to ensure initialization is complete before filter effect runs
      setTimeout(() => {
        console.log("🔄 Forcing filter effect re-evaluation");
        fetchJobs();
      }, 0);
    } else if (!initialized.current && !loading) {
      // No URL params to sync, just mark as initialized
      initialized.current = true;
      console.log("📋 No URL params to sync - triggering job fetch");
      // Use a micro-task to ensure initialization is complete before job fetching
      setTimeout(() => {
        console.log("🔄 Forcing job fetch for no-params case");
        fetchJobs();
      }, 0);
    }
  }, [loading, user, router, searchParams, fetchJobs]);

  // Reset sync flag when URL params actually change (new navigation)
  useEffect(() => {
    const isGuest = searchParams.get("guest") === "true";

    // Don't reset during initial guest mode setup
    if (initialized.current && !isGuest) {
      shouldSyncFromUrl.current = true;
      initialized.current = false;
    }
  }, [searchParams, loading, fetchJobs]);

  // Initial job fetching effect - now handled in initialization effect above
  // This ensures jobs are fetched AFTER URL params are synced
  useEffect(() => {
    console.log("🎯 Component mounted - waiting for initialization to fetch jobs");
    // fetchJobs is now called in the initialization effect after URL params are synced
  }, [fetchJobs]);

  // Job fetching effect - triggers on filter changes
  useEffect(() => {
    const isGuest = searchParams.get("guest") === "true";
    // Simplified condition: fetch jobs when initialized, regardless of auth loading
    // This ensures both guest and authenticated users get search results immediately
    const shouldProceed = initialized.current;

    console.log("🔍 Filter change effect triggered", {
      filterDeps,
      initialized: initialized.current,
      loading,
      isGuest,
      hasUser: !!user,
      condition: shouldProceed,
    });

    if (shouldProceed) {
      console.log("🚀 Refetching jobs due to filter change");
      fetchJobs();
    } else {
      console.log("❌ Filter effect conditions not met", {
        loading,
        initialized: initialized.current,
        isGuest,
        hasUser: !!user,
      });
    }
  }, [filterDeps, fetchJobs, user, loading, searchParams]);

  // Application status check effect
  useEffect(() => {
    if (selectedJob && user) {
      checkApplicationStatus(selectedJob.id);
    }
  }, [selectedJob, user, checkApplicationStatus]);

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


  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedLocations([]);
    setSelectedJobTypes([]);
    setSelectedLocationTypes([]);
    setSelectedSalary("");
    setDateFilter("any");
    setShowFeaturedOnly(false);
    setSearchTerm("");
    setSelectedState("all");
  };

  // Debug: Monitor searchTerm state changes
  useEffect(() => {
    console.log("🔍 DEBUG: searchTerm state changed:", {
      searchTerm,
      length: searchTerm.length,
      userAuthenticated: !!user,
      userId: user?.id || 'guest'
    });
  }, [searchTerm, user]);


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
              <div className="flex-1">
                <SearchInput
                  key="jobs-search-input"
                  placeholder="Job title, keywords, or company"
                  value={searchTerm}
                  onChange={(e) => {
                    console.log("🔍 DEBUG: SearchInput onChange fired", {
                      newValue: e.target.value,
                      currentSearchTerm: searchTerm,
                      userAuthenticated: !!user,
                      userId: user?.id || 'guest'
                    });
                    setSearchTerm(e.target.value);
                    console.log("🔍 DEBUG: setSearchTerm called with:", e.target.value);
                  }}
                  onClear={() => {
                    console.log("🧹 DEBUG: SearchInput onClear fired");
                    setSearchTerm("");
                  }}
                  leftIcon={<Search className="h-5 w-5" />}
                  className="h-12 text-base bg-white text-gray-900"
                />
              </div>

              <div className="flex-1">
                <StateSelector
                  placeholder="Select location"
                  value={selectedState}
                  onValueChange={(value) => {
                    console.log("🗺️ Jobs page - State selected:", value);
                    setSelectedState(value);
                  }}
                  className="h-12 text-base bg-white text-gray-900"
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="h-12 gap-2 bg-white text-primary hover:bg-gray-100 px-6"
              >
                <Search className="w-5 h-5" />
                Search Jobs
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

                {/* Featured Jobs Toggle */}
                <label className="flex items-center gap-2 px-3 py-2 text-sm text-white bg-white/10 rounded-sm backdrop-blur-sm cursor-pointer hover:bg-white/20 transition-colors">
                  <Checkbox
                    checked={showFeaturedOnly}
                    onCheckedChange={(checked) => setShowFeaturedOnly(checked as boolean)}
                    className="border-white/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                  <Star className="w-4 h-4" />
                  Featured only
                </label>

                {/* Reset All Filters Link */}
                {(searchTerm ||
                  (selectedState && selectedState !== "all") ||
                  selectedCategories.length > 0 ||
                  selectedLocations.length > 0 ||
                  selectedJobTypes.length > 0 ||
                  selectedLocationTypes.length > 0 ||
                  selectedSalary ||
                  dateFilter !== "any" ||
                  showFeaturedOnly) && (
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
            ) : !jobsLoading && jobs.length === 0 ? (
              <div className="p-4 space-y-6">
                {/* No results message */}
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    No exact matches found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    We couldn&apos;t find jobs matching your criteria, but here are
                    some suggestions
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

// Main page component with Suspense wrapper
export default function JobsPage() {
  return (
    <Suspense fallback={<JobsLoading />}>
      <JobsContent />
    </Suspense>
  );
}
