import React from "react";
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
  Briefcase,
  Users,
  Eye,
  TrendingUp,
  Calendar,
  Star,
  Plus,
  FileText,
  BarChart3,
  Activity,
} from "lucide-react";
import { SimpleChart } from "@/components/ui/simple-chart";
import { useAnalytics } from "@/hooks/useAnalytics";

export function DashboardOverview() {
  const { data: stats, trends, loading, error } = useAnalytics();

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Dashboard Overview</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Dashboard Overview</h2>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">Error loading analytics: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Use actual data from analytics hook
  const displayStats = stats || {
    totalJobs: 15,
    activeJobs: 8,
    totalApplications: 247,
    newApplications: 23,
    jobViews: 1542,
    responseRate: 16.0,
  };

  const displayTrends =
    trends.length > 0
      ? trends
      : [
          { date: "2024-01-01", applications: 5, views: 45 },
          { date: "2024-01-02", applications: 8, views: 52 },
          { date: "2024-01-03", applications: 3, views: 38 },
          { date: "2024-01-04", applications: 12, views: 65 },
          { date: "2024-01-05", applications: 7, views: 48 },
          { date: "2024-01-06", applications: 15, views: 78 },
          { date: "2024-01-07", applications: 9, views: 56 },
        ];

  const StatCard = ({
    icon: Icon,
    title,
    value,
    change,
    changeType,
  }: {
    icon: any;
    title: string;
    value: string | number;
    change?: string;
    changeType?: "increase" | "decrease";
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change && (
              <div className="flex items-center gap-1">
                <TrendingUp
                  className={`w-3 h-3 ${
                    changeType === "increase"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                />
                <span
                  className={`text-xs ${
                    changeType === "increase"
                      ? "text-green-500"
                      : "text-red-500"
                  }`}
                >
                  {change}
                </span>
              </div>
            )}
          </div>
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Track your hiring performance and manage your job postings
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <BarChart3 className="w-4 h-4 mr-2" />
            <span className="hidden xs:inline">View Analytics</span>
            <span className="xs:hidden">Analytics</span>
          </Button>
          <Button
            onClick={() => (window.location.href = "/post-job")}
            size="sm"
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            <span className="hidden xs:inline">Post New Job</span>
            <span className="xs:hidden">Post Job</span>
          </Button>
        </div>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Briefcase}
          title="Total Jobs"
          value={displayStats.totalJobs}
          change="+2 this month"
          changeType="increase"
        />
        <StatCard
          icon={Activity}
          title="Active Jobs"
          value={displayStats.activeJobs}
          change="+1 this week"
          changeType="increase"
        />
        <StatCard
          icon={Users}
          title="Total Applications"
          value={displayStats.totalApplications}
          change={`+${displayStats.newApplications} this week`}
          changeType="increase"
        />
        <StatCard
          icon={Eye}
          title="Job Views"
          value={displayStats.jobViews}
          change="+89 this week"
          changeType="increase"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={TrendingUp}
          title="Response Rate"
          value={`${displayStats.responseRate}%`}
          change="+2.1% vs last month"
          changeType="increase"
        />
        <StatCard
          icon={Calendar}
          title="Avg Time to Hire"
          value="12 days"
          change="-3 days vs last month"
          changeType="increase"
        />
        <StatCard
          icon={Star}
          title="Conversion Rate"
          value={`${displayStats.responseRate}%`}
          change="+1.2% vs last month"
          changeType="increase"
        />
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Trends */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Application Trends</CardTitle>
            <CardDescription>
              Applications and views over the last 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SimpleChart data={displayTrends} />
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your job postings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">
                    New application from Sarah Chen
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Senior React Developer - 3 min ago
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">Interview scheduled</p>
                  <p className="text-xs text-muted-foreground">
                    UX Designer candidate - 45 min ago
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">
                    Job posting expires soon
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Product Manager - 2 days remaining
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">5 new applications</p>
                  <p className="text-xs text-muted-foreground">
                    Frontend Developer - 4 hours ago
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common tasks to manage your hiring process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm">Post Job</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Users className="w-5 h-5" />
              <span className="text-sm">Review Applications</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <FileText className="w-5 h-5" />
              <span className="text-sm">Create Template</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm">View Analytics</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
            >
              <Calendar className="w-5 h-5" />
              <span className="text-sm">Schedule Interview</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
