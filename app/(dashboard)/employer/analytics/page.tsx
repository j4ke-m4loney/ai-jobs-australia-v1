"use client";

import { EmployerLayout } from "@/components/employer/EmployerLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SimpleChart } from "@/components/ui/simple-chart";
import {
  TrendingUp,
  Eye,
  Users,
  BarChart3,
  Calendar,
  Target,
  Award,
  Clock,
} from "lucide-react";

const EmployerAnalytics = () => {

  // Mock analytics data
  const viewsData = [
    { date: "Mon", applications: 24, views: 24 },
    { date: "Tue", applications: 31, views: 31 },
    { date: "Wed", applications: 45, views: 45 },
    { date: "Thu", applications: 38, views: 38 },
    { date: "Fri", applications: 52, views: 52 },
    { date: "Sat", applications: 29, views: 29 },
    { date: "Sun", applications: 18, views: 18 },
  ];

  const applicationsData = [
    { date: "Mon", applications: 4, views: 24 },
    { date: "Tue", applications: 7, views: 31 },
    { date: "Wed", applications: 9, views: 45 },
    { date: "Thu", applications: 6, views: 38 },
    { date: "Fri", applications: 12, views: 52 },
    { date: "Sat", applications: 5, views: 29 },
    { date: "Sun", applications: 3, views: 18 },
  ];

  const topJobsData = [
    { job: "Senior AI Engineer", views: 145, applications: 24 },
    { job: "ML Researcher", views: 89, applications: 12 },
    { job: "Data Scientist", views: 52, applications: 8 },
  ];

  return (
    <EmployerLayout title="Analytics">
      <div className="grid gap-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Job Views
                    </CardTitle>
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,247</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-success">+12%</span> from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Applications Received
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">186</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-success">+8%</span> from last month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Application Rate
                    </CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">14.9%</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-success">+2.1%</span> from last
                      month
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Avg. Time to Fill
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">18 days</div>
                    <p className="text-xs text-muted-foreground">
                      <span className="text-warning">-3 days</span> from last
                      month
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Job Views This Week
                    </CardTitle>
                    <CardDescription>
                      Daily views across all your job postings
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SimpleChart data={viewsData} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Applications This Week
                    </CardTitle>
                    <CardDescription>
                      Daily application submissions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <SimpleChart data={applicationsData} />
                  </CardContent>
                </Card>
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      Top Performing Jobs
                    </CardTitle>
                    <CardDescription>
                      Jobs with highest engagement this month
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {topJobsData.map((job, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                        >
                          <div>
                            <h4 className="font-medium">{job.job}</h4>
                            <p className="text-sm text-muted-foreground">
                              {job.views} views • {job.applications}{" "}
                              applications
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {((job.applications / job.views) * 100).toFixed(
                                1
                              )}
                              %
                            </div>
                            <div className="text-xs text-muted-foreground">
                              conversion rate
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Monthly Overview
                    </CardTitle>
                    <CardDescription>
                      Key performance indicators for this month
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Jobs Posted</span>
                        <span className="text-lg font-bold">3</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Active Jobs</span>
                        <span className="text-lg font-bold">2</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          Total Applicants
                        </span>
                        <span className="text-lg font-bold">44</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          Interviews Scheduled
                        </span>
                        <span className="text-lg font-bold">8</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          Offers Extended
                        </span>
                        <span className="text-lg font-bold">2</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">
                          Positions Filled
                        </span>
                        <span className="text-lg font-bold">1</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
      </div>
    </EmployerLayout>
  );
};

export default EmployerAnalytics;
