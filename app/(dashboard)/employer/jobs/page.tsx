"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { EmployerLayout } from "@/components/employer/EmployerLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Eye,
  Edit,
  MoreHorizontal,
  MapPin,
  DollarSign,
  Clock,
  Briefcase,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Job {
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
  status: string;
  created_at: string;
  expires_at: string;
}

const EmployerJobs = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchJobs();
    }
  }, [user]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('employer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const formatSalary = (salaryMin: number | null, salaryMax: number | null): string => {
    if (!salaryMin && !salaryMax) return 'Salary not specified';
    if (salaryMin && salaryMax && salaryMin !== salaryMax) {
      return `$${salaryMin.toLocaleString()} - $${salaryMax.toLocaleString()}`;
    }
    if (salaryMin) return `$${salaryMin.toLocaleString()}`;
    if (salaryMax) return `Up to $${salaryMax.toLocaleString()}`;
    return 'Salary not specified';
  };

  const formatJobType = (jobType: string): string => {
    return jobType.charAt(0).toUpperCase() + jobType.slice(1).replace('-', ' ');
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (loading) {
    return (
      <EmployerLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-foreground">Job Postings</h1>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading jobs...</p>
          </div>
        </div>
      </EmployerLayout>
    );
  }

  if (error) {
    return (
      <EmployerLayout>
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-foreground">Job Postings</h1>
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchJobs} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </EmployerLayout>
    );
  }

  return (
    <EmployerLayout title="Job Management">
      <div className="grid gap-6">
        {/* Action Button */}
        <div className="flex justify-end">
          <Button onClick={() => router.push("/post-job")} className="gap-2 w-full sm:w-auto">
            <Plus className="w-4 h-4" />
            Post New Job
          </Button>
        </div>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Jobs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">3</div>
                    <p className="text-xs text-muted-foreground">
                      Posted this month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Active Jobs
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1</div>
                    <p className="text-xs text-muted-foreground">
                      Currently accepting applications
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Applications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">44</div>
                    <p className="text-xs text-muted-foreground">
                      +12 this week
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Views
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">286</div>
                    <p className="text-xs text-muted-foreground">
                      +45 this week
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Jobs List */}
              <Card>
                <CardHeader>
                  <CardTitle>Your Job Postings</CardTitle>
                  <CardDescription>
                    Manage your active and inactive job postings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {jobs.length === 0 ? (
                      <div className="text-center py-12">
                        <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-foreground mb-2">No jobs posted yet</h3>
                        <p className="text-muted-foreground mb-4">Start by posting your first job to attract top talent.</p>
                        <Button onClick={() => router.push('/post-job')}>
                          <Plus className="w-4 h-4 mr-2" />
                          Post Your First Job
                        </Button>
                      </div>
                    ) : (
                      jobs.map((job) => (
                      <div
                        key={job.id}
                        className="flex flex-col md:flex-row md:items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                            <h3 className="font-semibold text-lg truncate">
                              {job.title}
                            </h3>
                            <Badge className={`${getStatusColor(job.status)} w-fit`}>
                              {job.status}
                            </Badge>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{job.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{formatSalary(job.salary_min, job.salary_max)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 flex-shrink-0" />
                              <span>{formatJobType(job.job_type)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:gap-4">
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <div className="text-lg font-semibold">
                                0
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Applications
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold">
                                0
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Views
                              </div>
                            </div>
                          </div>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="w-4 h-4 mr-2" />
                                Edit Job
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                Archive Job
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))
                    )}
                  </div>
                </CardContent>
              </Card>
      </div>
    </EmployerLayout>
  );
};

export default EmployerJobs;
