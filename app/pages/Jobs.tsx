import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  Building,
  Clock,
  DollarSign,
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
} from "lucide-react";
import Header from "@/components/Header";
import { toast } from "sonner";
import { useSavedJobs } from "@/hooks/useSavedJobs";

interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string | null;
  location: string;
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
}

const Jobs = () => {
  console.log("Jobs component rendering...");
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toggleSaveJob, isJobSaved } = useSavedJobs();
  console.log("useSavedJobs hook values:", { toggleSaveJob, isJobSaved });
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedJobTypes, setSelectedJobTypes] = useState<string[]>([]);
  const [selectedLocationTypes, setSelectedLocationTypes] = useState<string[]>(
    []
  );
  const [salaryRange, setSalaryRange] = useState({ min: "", max: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
  const [sortBy, setSortBy] = useState("relevance");
  const [hasApplied, setHasApplied] = useState<Record<string, boolean>>({});

  // Redirect to job seeker auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      const currentUrl = `${window.location.pathname}${window.location.search}`;
      navigate(`/auth/jobseeker?next=${encodeURIComponent(currentUrl)}`);
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [
    user,
    searchTerm,
    selectedCategories,
    selectedLocations,
    selectedJobTypes,
    selectedLocationTypes,
    salaryRange,
    sortBy,
  ]);

  useEffect(() => {
    if (selectedJob && user) {
      checkApplicationStatus(selectedJob.id);
    }
  }, [selectedJob, user]);

  const fetchJobs = async () => {
    setJobsLoading(true);

    let query = supabase
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
        application_email
      `
      )
      .eq("status", "approved");

    console.log("Fetching jobs with user:", user?.id);

    // Apply filters
    if (searchTerm) {
      query = query.or(
        `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`
      );
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
    if (salaryRange.min) {
      query = query.gte("salary_min", parseInt(salaryRange.min));
    }
    if (salaryRange.max) {
      query = query.lte("salary_max", parseInt(salaryRange.max));
    }

    // Sorting
    switch (sortBy) {
      case "date":
        query = query.order("created_at", { ascending: false });
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

    if (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs");
    } else {
      const jobsData = (data as Job[]) || [];
      setJobs(jobsData);
      // Auto-select first job if none selected
      if (jobsData.length > 0 && !selectedJob) {
        setSelectedJob(jobsData[0]);
      }
    }
    setJobsLoading(false);
  };

  const checkApplicationStatus = async (jobId: string) => {
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
  };

  const handleApply = () => {
    if (!user) {
      toast.error("Please sign in to apply for jobs");
      navigate("/auth/jobseeker");
      return;
    }

    if (!selectedJob) return;

    // Navigate to apply page for the selected job
    navigate(`/apply/${selectedJob.id}`);
  };

  const handleToggleSaveJob = async (jobId: string) => {
    await toggleSaveJob(jobId);
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

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }

    return date.toLocaleDateString();
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const days = Math.ceil(
      (new Date(expiryDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return Math.max(0, days);
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
    setSalaryRange({ min: "", max: "" });
    setSearchTerm("");
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

  if (!user) {
    return null; // Will redirect to auth
  }

  return (
    <div className="min-h-screen bg-gradient-subtle flex flex-col">
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
                  className="pl-10 h-12 text-base bg-white"
                />
              </div>

              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Location"
                  className="pl-10 h-12 text-base bg-white"
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
              <div className="flex flex-wrap gap-2 mt-2 animate-fade-in">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="h-10 pl-3 pr-8 py-2 text-sm border border-white/20 rounded-full bg-white/10 text-white backdrop-blur-sm appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgNC41TDYgNy41TDkgNC41IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=')] bg-no-repeat bg-[length:12px_12px] bg-[calc(100%-8px)_center]"
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
                </select>

                <select className="h-10 pl-3 pr-8 py-2 text-sm border border-white/20 rounded-full bg-white/10 text-white backdrop-blur-sm appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgNC41TDYgNy41TDkgNC41IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=')] bg-no-repeat bg-[length:12px_12px] bg-[calc(100%-8px)_center]">
                  <option className="text-black">All remote options</option>
                  <option className="text-black">Remote</option>
                  <option className="text-black">Hybrid</option>
                  <option className="text-black">On-site</option>
                </select>

                <select className="h-10 pl-3 pr-8 py-2 text-sm border border-white/20 rounded-full bg-white/10 text-white backdrop-blur-sm appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgNC41TDYgNy41TDkgNC41IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=')] bg-no-repeat bg-[length:12px_12px] bg-[calc(100%-8px)_center]">
                  <option className="text-black">paying $0</option>
                  <option className="text-black">$50K+</option>
                  <option className="text-black">$100K+</option>
                  <option className="text-black">$150K+</option>
                </select>

                <select className="h-10 pl-3 pr-8 py-2 text-sm border border-white/20 rounded-full bg-white/10 text-white backdrop-blur-sm appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgNC41TDYgNy41TDkgNC41IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=')] bg-no-repeat bg-[length:12px_12px] bg-[calc(100%-8px)_center]">
                  <option className="text-black">to $350K+</option>
                  <option className="text-black">to $200K</option>
                  <option className="text-black">to $300K</option>
                  <option className="text-black">$350K+</option>
                </select>

                <select className="h-10 pl-3 pr-8 py-2 text-sm border border-white/20 rounded-full bg-white/10 text-white backdrop-blur-sm appearance-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTMgNC41TDYgNy41TDkgNC41IiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=')] bg-no-repeat bg-[length:12px_12px] bg-[calc(100%-8px)_center]">
                  <option className="text-black">listed any time</option>
                  <option className="text-black">Last 24 hours</option>
                  <option className="text-black">Last 30 days</option>
                </select>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Jobs List - Left Side */}
        <div className="w-1/2 border-r border-border">
          <div className="p-4 border-b border-border bg-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge
                  variant="secondary"
                  className="bg-primary text-white font-semibold px-3 py-1"
                >
                  {jobs.length} jobs
                </Badge>
                <span className="text-sm text-muted-foreground">
                  New to you
                </span>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800"
                >
                  99+
                </Badge>
              </div>
              <Button variant="ghost" size="sm">
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="h-[calc(100vh-280px)] overflow-y-auto">
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
              <div className="p-8 text-center">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No jobs found
                </h3>
                <p className="text-muted-foreground">
                  Try adjusting your search criteria.
                </p>
              </div>
            ) : (
              <div className="space-y-2 p-2">
                {jobs.map((job) => (
                  <Card
                    key={job.id}
                    className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedJob?.id === job.id
                        ? "ring-2 ring-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    } ${job.is_featured ? "border-l-4 border-l-primary" : ""}`}
                    onClick={() => setSelectedJob(job)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {job.is_featured && (
                              <Badge className="bg-gradient-hero text-white text-xs">
                                Featured
                              </Badge>
                            )}
                          </div>

                          <h3 className="font-semibold text-base mb-1 line-clamp-2">
                            {job.title}
                          </h3>

                          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                            <span className="font-medium">Mock Company</span>
                          </div>

                          <div className="text-sm text-muted-foreground mb-2">
                            {job.location} ({job.location_type})
                          </div>

                          {formatSalary(job.salary_min, job.salary_max) && (
                            <div className="text-sm text-muted-foreground mb-2">
                              {formatSalary(job.salary_min, job.salary_max)}
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Posted {getTimeAgo(job.created_at)}</span>
                            <span>•</span>
                            <span>High application volume</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                            <Building className="w-5 h-5 text-primary" />
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-1"
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
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Job Detail - Right Side */}
        <div className="w-1/2">
          {selectedJob ? (
            <div className="h-[calc(100vh-280px)] overflow-y-auto">
              {/* Job Header */}
              <div className="p-6 border-b border-border bg-white">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-16 h-16 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building className="w-8 h-8 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {selectedJob.is_featured && (
                          <Badge className="bg-gradient-hero text-white">
                            Featured
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {getCategoryDisplay(selectedJob.category)}
                        </Badge>
                      </div>

                      <h1 className="text-2xl font-bold text-foreground mb-1">
                        {selectedJob.title}
                      </h1>

                      <div className="flex items-center gap-2 text-muted-foreground mb-2">
                        <span className="font-medium text-lg">
                          Mock Company
                        </span>
                        <Button
                          variant="link"
                          className="p-0 h-auto text-primary"
                        >
                          View all jobs
                        </Button>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {selectedJob.location} ({selectedJob.location_type})
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span className="capitalize">
                            {selectedJob.job_type}
                          </span>
                        </div>
                      </div>

                      {formatSalary(
                        selectedJob.salary_min,
                        selectedJob.salary_max
                      ) && (
                        <div className="flex items-center gap-2 mb-4">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-green-600 text-lg">
                            {formatSalary(
                              selectedJob.salary_min,
                              selectedJob.salary_max
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Heart icon aligned with company logo */}
                  <div className="w-16 h-16 flex items-center justify-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleSaveJob(selectedJob.id);
                      }}
                      className="p-2"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          isJobSaved(selectedJob.id)
                            ? "fill-red-500 text-red-500"
                            : "text-muted-foreground"
                        }`}
                      />
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Posted {getTimeAgo(selectedJob.created_at)}</span>
                    <span>•</span>
                    <span>High application volume</span>
                  </div>

                  <div className="flex gap-2">
                    {hasApplied[selectedJob.id] ? (
                      <div className="text-center py-2 px-4">
                        <div className="text-sm font-medium text-green-600">
                          Application Submitted
                        </div>
                        <div className="text-xs text-muted-foreground">
                          You've applied for this position
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={handleApply}
                        className="bg-primary hover:bg-primary/90 text-white px-6"
                      >
                        Apply
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Job Content */}
              <div className="p-6 space-y-6">
                {/* Match Score */}
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                      <span className="font-semibold">How you match</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Matches based on your career history
                    </p>
                  </CardContent>
                </Card>

                {/* Job Description */}
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Job Description
                  </h2>
                  <div className="prose max-w-none">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {selectedJob.description}
                    </p>
                  </div>
                </div>

                {/* Requirements */}
                {selectedJob.requirements && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Requirements</h2>
                    <div className="prose max-w-none">
                      <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                        {selectedJob.requirements}
                      </p>
                    </div>
                  </div>
                )}

                {/* Placeholder for company info */}

                {/* Apply Section */}
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg mb-1">
                        Ready to apply?
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Expires in {getDaysUntilExpiry(selectedJob.expires_at)}{" "}
                        days
                      </p>
                    </div>

                    {!hasApplied[selectedJob.id] && (
                      <Button
                        onClick={handleApply}
                        size="lg"
                        className="bg-primary hover:bg-primary/90 text-white px-8"
                      >
                        Apply
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-[calc(100vh-280px)] flex items-center justify-center">
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
  );
};

export default Jobs;
