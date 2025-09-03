"use client";

import { useRouter } from "next/navigation";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const EmployerJobs = () => {
  const router = useRouter();

  // Mock job data - will be replaced with real data later
  const jobs = [
    {
      id: "1",
      title: "Senior AI Engineer",
      company: "TechCorp AI",
      location: "Sydney, NSW",
      type: "Full-time",
      salary: "$120,000 - $160,000",
      status: "active",
      applications: 24,
      views: 145,
      postedDate: "2024-01-15",
    },
    {
      id: "2",
      title: "Machine Learning Researcher",
      company: "AI Research Lab",
      location: "Melbourne, VIC",
      type: "Full-time",
      salary: "$100,000 - $140,000",
      status: "pending",
      applications: 12,
      views: 89,
      postedDate: "2024-01-10",
    },
    {
      id: "3",
      title: "Data Scientist",
      company: "DataFlow Solutions",
      location: "Brisbane, QLD",
      type: "Contract",
      salary: "$80,000 - $110,000",
      status: "paused",
      applications: 8,
      views: 52,
      postedDate: "2024-01-05",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success";
      case "pending":
        return "bg-warning";
      case "paused":
        return "bg-muted";
      default:
        return "bg-muted";
    }
  };

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
                    {jobs.map((job) => (
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
                              <span className="truncate">{job.salary}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 flex-shrink-0" />
                              <span>{job.type}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:gap-4">
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <div className="text-lg font-semibold">
                                {job.applications}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Applications
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-semibold">
                                {job.views}
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
                    ))}
                  </div>
                </CardContent>
              </Card>
      </div>
    </EmployerLayout>
  );
};

export default EmployerJobs;
