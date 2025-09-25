import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useSavedJobs } from "@/hooks/useSavedJobs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Heart,
  Search,
  Building2,
  MapPin,
  DollarSign,
  Calendar,
  Eye,
  Trash2,
  Filter,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";

interface SavedJob {
  id: string;
  title: string;
  description: string;
  location: string;
  location_type: string;
  job_type: string;
  category: string;
  salary_min: number | null;
  salary_max: number | null;
  is_featured: boolean;
  created_at: string;
  expires_at: string;
  saved_at: string;
}

const SavedJobs = () => {
  const { user } = useAuth();
  const router = useRouter();
  const { unsaveJob } = useSavedJobs();
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("saved_date");

  useEffect(() => {
    if (!user) {
      router.push("/auth/jobseeker");
      return;
    }

    // Check if user is a job seeker
    checkUserType();
  }, [user, router, checkUserType]);

  const checkUserType = useCallback(async () => {
    if (!user) return;

    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("user_type")
        .eq("user_id", user.id)
        .single();

      if (error || !profile) {
        toast.error("Please complete your profile");
        router.push("/profile");
        return;
      }

      if (profile.user_type !== "job_seeker") {
        toast.error("Only job seekers can access saved jobs");
        router.push("/employer/dashboard");
        return;
      }

      fetchSavedJobs();
    } catch (error) {
      console.error("Error checking user type:", error);
      router.push("/auth/jobseeker");
    }
  }, [user, router]);

  const fetchSavedJobs = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("saved_jobs")
        .select(
          `
          created_at,
          jobs!inner (
            id,
            title,
            description,
            location,
            location_type,
            job_type,
            category,
            salary_min,
            salary_max,
            is_featured,
            created_at,
            expires_at
          )
        `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedJobs =
        data?.map((item) => ({
          ...item.jobs,
          saved_at: item.created_at,
        })) || [];

      setSavedJobs(formattedJobs);
    } catch (error) {
      console.error("Error fetching saved jobs:", error);
      toast.error("Failed to load saved jobs");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsaveJob = async (jobId: string) => {
    try {
      await unsaveJob(jobId);
      setSavedJobs(savedJobs.filter((job) => job.id !== jobId));
    } catch (error) {
      console.error("Error unsaving job:", error);
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

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    const days = Math.ceil(
      (new Date(expiryDate).getTime() - new Date().getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return Math.max(0, days);
  };

  const filteredJobs = savedJobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "all" || job.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (sortBy) {
      case "title":
        return a.title.localeCompare(b.title);
      case "company":
        return "Mock Company".localeCompare("Mock Company");
      case "date_posted":
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case "expiry":
        return (
          new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime()
        );
      case "salary":
        return (b.salary_max || 0) - (a.salary_max || 0);
      case "saved_date":
        return new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime();
      default:
        return new Date(b.saved_at).getTime() - new Date(a.saved_at).getTime();
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        <div className="container mx-auto px-4 pt-20 pb-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading saved jobs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />

      <main className="container mx-auto px-4 pt-20 pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Heart className="w-8 h-8 text-red-500 fill-red-500" />
              Saved Jobs
            </h1>
            <p className="text-muted-foreground">
              {savedJobs.length} {savedJobs.length === 1 ? "job" : "jobs"} saved
              for later
            </p>
          </div>

          <Button onClick={() => router.push("/jobs")} className="gap-2">
            <Search className="w-4 h-4" />
            Browse More Jobs
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search saved jobs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="all">All Categories</option>
                <option value="ai">AI</option>
                <option value="ml">Machine Learning</option>
                <option value="data-science">Data Science</option>
                <option value="engineering">Engineering</option>
                <option value="research">Research</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="saved_date">Recently Saved</option>
                <option value="title">Job Title</option>
                <option value="company">Company</option>
                <option value="date_posted">Date Posted</option>
                <option value="expiry">Expiring Soon</option>
                <option value="salary">Highest Salary</option>
              </select>

              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {sortedJobs.length} of {savedJobs.length} jobs
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Jobs List */}
        {sortedJobs.length === 0 ? (
          <Card>
            <CardContent className="text-center py-16">
              {savedJobs.length === 0 ? (
                <>
                  <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No saved jobs yet
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Start browsing jobs and save the ones you&apos;re interested in
                    for easy access later.
                  </p>
                  <Button onClick={() => router.push("/jobs")} className="gap-2">
                    <Search className="w-4 h-4" />
                    Browse Jobs
                  </Button>
                </>
              ) : (
                <>
                  <Briefcase className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No jobs match your filters
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your search criteria or category filter.
                  </p>
                  <Button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("all");
                    }}
                    variant="outline"
                  >
                    Clear Filters
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {sortedJobs.map((job) => (
              <Card
                key={job.id}
                className="group hover:shadow-lg transition-all duration-200 cursor-pointer"
                onClick={() => router.push(`/jobs/${job.id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        {job.is_featured && (
                          <Badge className="bg-gradient-hero text-white">
                            Featured
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {getCategoryDisplay(job.category)}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="text-xs capitalize"
                        >
                          {job.job_type.replace("-", " ")}
                        </Badge>

                        {getDaysUntilExpiry(job.expires_at) <= 7 && (
                          <Badge variant="destructive" className="text-xs">
                            Expires in {getDaysUntilExpiry(job.expires_at)} days
                          </Badge>
                        )}
                      </div>

                      <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                        {job.title}
                      </CardTitle>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <span className="font-medium">Mock Company</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{job.location}</span>
                          <Badge
                            variant="outline"
                            className="text-xs capitalize"
                          >
                            {job.location_type}
                          </Badge>
                        </div>
                      </div>

                      {formatSalary(job.salary_min, job.salary_max) && (
                        <div className="flex items-center gap-2 mb-3">
                          <DollarSign className="h-4 w-4 text-green-600" />
                          <span className="font-semibold text-green-600">
                            {formatSalary(job.salary_min, job.salary_max)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <div className="w-12 h-12 rounded bg-primary/10 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-primary" />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnsaveJob(job.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/jobs/${job.id}`);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                    {job.description.length > 150
                      ? `${job.description.substring(0, 150)}...`
                      : job.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Posted {getTimeAgo(job.created_at)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3 fill-red-500 text-red-500" />
                        <span>Saved</span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/jobs/${job.id}`);
                      }}
                    >
                      <Eye className="w-3 h-3" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SavedJobs;
