import React from "react";
import { useRouter } from "next/navigation";
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
  Clock,
  Plus,
  Building,
  Settings,
  Activity,
  AlertCircle,
} from "lucide-react";
import { useAnalytics } from "@/hooks/useAnalytics";

export function DashboardOverview() {
  const router = useRouter();
  const { data: stats, loading, error } = useAnalytics();

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            Dashboard Overview
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
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
          <h2 className="text-2xl font-bold text-foreground">
            Dashboard Overview
          </h2>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">Error loading analytics: {error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Use actual data from analytics hook with fallback
  const displayStats = stats || {
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    reviewedApplications: 0,
    recentApplications: [],
  };

  const StatCard = ({
    icon: Icon,
    title,
    value,
    description,
    variant = "default",
  }: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    value: string | number;
    description?: string;
    variant?: "default" | "warning" | "success";
  }) => {
    const getVariantStyles = () => {
      switch (variant) {
        case "warning":
          return "bg-orange-50 text-orange-600 dark:bg-orange-950/20";
        case "success":
          return "bg-green-50 text-green-600 dark:bg-green-950/20";
        default:
          return "bg-primary/10 text-primary";
      }
    };

    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{title}</p>
              <p className="text-2xl font-bold">{value}</p>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center ${getVariantStyles()}`}
            >
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const getStatusBadgeVariant = (
    status: string
  ): "default" | "destructive" | "outline" | "secondary" => {
    switch (status) {
      case "pending":
        return "outline";
      case "reviewed":
      case "shortlisted":
        return "secondary";
      case "rejected":
        return "destructive";
      default:
        return "default";
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days} ${days === 1 ? "day" : "days"} ago`;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Dashboard Overview
          </h2>
          <p className="text-muted-foreground">
            Manage your job postings and track applications
          </p>
        </div>
        <Button
          onClick={() => router.push("/post-job")}
          size="sm"
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Post New Job
        </Button>
      </div>

      {/* Key Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Briefcase}
          title="Total Jobs"
          value={displayStats.totalJobs}
          description="All job postings"
        />
        <StatCard
          icon={Activity}
          title="Active Jobs"
          value={displayStats.activeJobs}
          description="Currently accepting applications"
          variant={displayStats.activeJobs > 0 ? "success" : "default"}
        />
        <StatCard
          icon={Users}
          title="Total Applications"
          value={displayStats.totalApplications}
          description="Across all jobs"
        />
        <StatCard
          icon={Clock}
          title="Applicants Pending Review"
          value={displayStats.pendingApplications}
          description="Awaiting your response"
          variant={displayStats.pendingApplications > 0 ? "warning" : "default"}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Applications</CardTitle>
            <CardDescription>
              Latest candidates who applied to your jobs
            </CardDescription>
          </CardHeader>
          <CardContent>
            {displayStats.recentApplications.length > 0 ? (
              <div className="space-y-4">
                {displayStats.recentApplications.map((application) => (
                  <div
                    key={application.id}
                    className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <p className="font-medium text-sm">
                        {application.applicantName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Applied for {application.jobTitle}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(application.appliedAt)}
                      </p>
                    </div>
                    <Badge variant={getStatusBadgeVariant(application.status)}>
                      {application.status}
                    </Badge>
                  </div>
                ))}
                {displayStats.totalApplications > 5 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/employer/applications")}
                  >
                    View All Applications
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No applications yet. Post a job to start receiving
                  applications.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage your hiring process</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push("/employer/jobs")}
            >
              <Briefcase className="w-4 h-4 mr-2" />
              Manage Jobs
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push("/employer/applications")}
            >
              <Users className="w-4 h-4 mr-2" />
              Review Applications
              {displayStats.pendingApplications > 0 && (
                <Badge className="ml-auto" variant="destructive">
                  {displayStats.pendingApplications}
                </Badge>
              )}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push("/employer/company-profile")}
            >
              <Building className="w-4 h-4 mr-2" />
              Company Profile
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => router.push("/employer/settings")}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Getting Started
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Post Your First Job</h4>
              <p className="text-xs text-muted-foreground">
                Create a compelling job listing to attract top talent
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Complete Company Profile</h4>
              <p className="text-xs text-muted-foreground">
                Add company details to build trust with candidates
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Review Applications</h4>
              <p className="text-xs text-muted-foreground">
                Respond quickly to maintain a good employer reputation
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
