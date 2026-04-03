"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  Phone,
  MapPin,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Plus,
  Search,
  ArrowUpDown,
  RefreshCw,
  Star,
  Eye,
  ExternalLink,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobSelector } from "@/components/employer/JobSelector";
import {
  useEmployerApplications,
  JobApplication,
} from "@/hooks/useEmployerApplications";
import { useToast } from "@/hooks/use-toast";
import { downloadResume, downloadCoverLetter } from "@/utils/documentDownload";

const STATUS_TABS = [
  { value: "all", label: "All" },
  { value: "submitted", label: "New" },
  { value: "reviewing", label: "Reviewing" },
  { value: "shortlisted", label: "Shortlisted" },
  { value: "interview", label: "Interview" },
  { value: "rejected", label: "Rejected" },
];

function MobileStatusCarousel({
  statusFilter,
  onStatusChange,
  totalApplications,
  statusCounts,
}: {
  statusFilter: string;
  onStatusChange: (value: string) => void;
  totalApplications: number;
  statusCounts: Record<string, number>;
}) {
  const getCount = (value: string) =>
    value === "all" ? totalApplications : statusCounts[value] || 0;

  const currentIndex = Math.max(0, STATUS_TABS.findIndex(t => t.value === statusFilter));
  const current = STATUS_TABS[currentIndex];

  return (
    <>
    <style>{`
      @media (min-width: 768px) { .mobile-status-carousel { display: none !important; } }
      @media (max-width: 767px) { .desktop-status-tabs { display: none !important; } }
    `}</style>
    <div className="mobile-status-carousel flex items-center justify-between bg-gray-100 rounded-lg p-2 mb-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onStatusChange(STATUS_TABS[currentIndex - 1].value)}
        disabled={currentIndex <= 0}
        className="h-8 w-8"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <span className="text-sm font-medium text-foreground">
        {current.label} ({getCount(current.value)})
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onStatusChange(STATUS_TABS[currentIndex + 1].value)}
        disabled={currentIndex >= STATUS_TABS.length - 1}
        className="h-8 w-8"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
    </>
  );
}

const EmployerApplications = () => {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedJobId, setSelectedJobId] = useState<string>();
  const [selectedApplications, setSelectedApplications] = useState<string[]>(
    []
  );
  const [downloadingResume, setDownloadingResume] = useState<string | null>(null);
  const [downloadingCoverLetter, setDownloadingCoverLetter] = useState<string | null>(null);

  const {
    applications,
    jobs,
    loading,
    error,
    updateApplicationStatus,
    updateMultipleApplicationStatus,
    refetch,
    // Pagination
    page,
    setPage,
    total,
    totalPages,
    pageSize,
    // Filters
    statusFilter,
    setStatusFilter,
    searchQuery,
    setSearchQuery,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    // Status counts
    statusCounts,
    // New application indicator
    hasNewApplications,
    dismissNewApplications,
  } = useEmployerApplications(selectedJobId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100 hover:text-blue-800 hover:border-blue-200";
      case "reviewing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100 hover:text-yellow-800 hover:border-yellow-200";
      case "shortlisted":
        return "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-100 hover:text-purple-800 hover:border-purple-200";
      case "interview":
        return "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100 hover:text-orange-800 hover:border-orange-200";
      case "accepted":
        return "bg-green-100 text-green-800 border-green-200 hover:bg-green-100 hover:text-green-800 hover:border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200 hover:bg-red-100 hover:text-red-800 hover:border-red-200";
      case "withdrawn":
        return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100 hover:text-gray-800 hover:border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100 hover:text-gray-800 hover:border-gray-200";
    }
  };

  const capitalizeStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const totalApplications = Object.values(statusCounts).reduce((a, b) => a + b, 0);
  const selectedJob = jobs.find((j) => j.id === selectedJobId);
  const isExternalJob = selectedJob?.application_method === "external" || selectedJob?.application_method === "email";
  const externalClickCount = selectedJob?.external_click_count ?? 0;

  const handleStatusUpdate = async (
    applicationId: string,
    newStatus: string
  ) => {
    const success = await updateApplicationStatus(applicationId, newStatus);
    if (success) {
      toast({
        title: "Status Updated",
        description: `Application moved to ${capitalizeStatus(newStatus)}`,
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to update application status",
        variant: "destructive",
      });
    }
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selectedApplications.length === 0) return;

    const success = await updateMultipleApplicationStatus(
      selectedApplications,
      newStatus
    );
    if (success) {
      toast({
        title: "Status Updated",
        description: `${selectedApplications.length} applications moved to ${capitalizeStatus(newStatus)}`,
      });
      setSelectedApplications([]);
    } else {
      toast({
        title: "Error",
        description: "Failed to update application statuses",
        variant: "destructive",
      });
    }
  };

  const toggleApplicationSelection = (applicationId: string) => {
    setSelectedApplications((prev) =>
      prev.includes(applicationId)
        ? prev.filter((id) => id !== applicationId)
        : [...prev, applicationId]
    );
  };

  const selectAllApplications = () => {
    const allIds = applications.map((app) => app.id);
    setSelectedApplications((prev) =>
      prev.length === allIds.length ? [] : allIds
    );
  };

  const handleDownloadResume = async (application: JobApplication) => {
    if (!application.resume_url || downloadingResume === application.id) return;

    setDownloadingResume(application.id);

    const applicantName = `${application.profiles?.first_name || ""} ${
      application.profiles?.last_name || ""
    }`.trim() || "Applicant";

    try {
      await downloadResume(application.resume_url, applicantName);
    } finally {
      setDownloadingResume(null);
    }
  };

  const handleDownloadCoverLetter = async (application: JobApplication) => {
    if (!application.cover_letter_url || downloadingCoverLetter === application.id) return;

    setDownloadingCoverLetter(application.id);

    const applicantName = `${application.profiles?.first_name || ""} ${
      application.profiles?.last_name || ""
    }`.trim() || "Applicant";

    try {
      await downloadCoverLetter(application.cover_letter_url, applicantName);
    } finally {
      setDownloadingCoverLetter(null);
    }
  };

  const handleRefresh = () => {
    dismissNewApplications();
    refetch();
  };

  const handleTabChange = (value: string) => {
    setStatusFilter(value);
    setSelectedApplications([]);
  };

  const ApplicationCard = ({
    application,
    isSelected,
    onToggleSelect,
  }: {
    application: JobApplication;
    isSelected: boolean;
    onToggleSelect: (id: string) => void;
  }) => {
    const applicantName =
      `${application.profiles?.first_name || ""} ${
        application.profiles?.last_name || ""
      }`.trim() || "Unknown Applicant";

    const isNew = !application.viewed_at;

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-3 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onToggleSelect(application.id)}
                className="flex-shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-base sm:text-lg truncate">
                    {applicantName}
                  </h3>
                  {isNew && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500 text-white flex-shrink-0">
                      New
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">
                  {application.job.title}
                </p>
              </div>
            </div>
            <Badge
              className={`${getStatusColor(application.status)} flex-shrink-0`}
            >
              {capitalizeStatus(application.status)}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 mb-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">
                {application.profiles?.phone || "Not provided"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">
                {application.profiles?.location || "Not provided"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">
                Applied {new Date(application.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              {application.resume_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadResume(application)}
                  disabled={downloadingResume === application.id}
                  className="w-full sm:w-auto text-xs sm:text-sm hover:bg-blue-50 hover:border-blue-300 disabled:opacity-50"
                >
                  {downloadingResume === application.id ? "Downloading..." : "Resume"}
                  <Download className="w-4 h-4 ml-2" />
                </Button>
              )}
              {application.cover_letter_url && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadCoverLetter(application)}
                  disabled={downloadingCoverLetter === application.id}
                  className="w-full sm:w-auto text-xs sm:text-sm hover:bg-green-50 hover:border-green-300 disabled:opacity-50"
                >
                  {downloadingCoverLetter === application.id ? "Downloading..." : "Cover Letter"}
                  <Download className="w-4 h-4 ml-2" />
                </Button>
              )}

              {!application.resume_url && !application.cover_letter_url && (
                <span className="text-xs text-muted-foreground">
                  No documents available
                </span>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    className="w-full sm:w-auto text-xs sm:text-sm"
                  >
                    Manage
                    <ChevronDown className="w-4 h-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() =>
                      handleStatusUpdate(application.id, "reviewing")
                    }
                  >
                    Move to Reviewing
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      handleStatusUpdate(application.id, "shortlisted")
                    }
                  >
                    Move to Shortlisted
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      handleStatusUpdate(application.id, "interview")
                    }
                  >
                    Move to Interview
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      handleStatusUpdate(application.id, "accepted")
                    }
                  >
                    Move to Accepted
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      handleStatusUpdate(application.id, "rejected")
                    }
                  >
                    Move to Rejected
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <EmployerLayout title="Applications">
      <div className="grid gap-6">
        {/* Job Selection */}
        <JobSelector
          jobs={jobs}
          selectedJobId={selectedJobId}
          onJobSelect={setSelectedJobId}
          loading={loading}
        />

        {/* New Applications Banner */}
        {hasNewApplications && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-700">
              <Eye className="h-5 w-5" />
              <span className="font-medium">New applications received</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </Button>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-700">
                <XCircle className="h-5 w-5" />
                <span className="font-medium">Error Loading Data</span>
              </div>
              <p className="mt-2 text-sm text-red-600">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Empty State - No Jobs */}
        {!loading && !error && jobs.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Job Postings Yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  You haven&apos;t posted any jobs yet. Create your first job posting to start receiving applications.
                </p>
                <Button
                  onClick={() => router.push("/post-job")}
                  className="gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Post Your First Job
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedJobId && !error && (
          <>
            {/* Stats Cards */}
            <div className={`grid grid-cols-2 sm:grid-cols-3 ${isExternalJob ? "lg:grid-cols-6" : "lg:grid-cols-5"} gap-4`}>
              {isExternalJob && (
                <Card className="border-sky-200 bg-sky-50/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Apply Clicks
                    </CardTitle>
                    <ExternalLink className="h-4 w-4 text-sky-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-sky-600">
                      {externalClickCount}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedJob?.application_method === "email"
                        ? "Clicks to your email address"
                        : "Clicks to your external ATS"}
                    </p>
                  </CardContent>
                </Card>
              )}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {totalApplications}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    New
                  </CardTitle>
                  <Star className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {statusCounts.submitted || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Reviewing
                  </CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statusCounts.reviewing || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Shortlisted
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statusCounts.shortlisted || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Rejected
                  </CardTitle>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {statusCounts.rejected || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Sort Controls */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by applicant name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-3">
                <Select
                  value={`${sortField}-${sortOrder}`}
                  onValueChange={(value) => {
                    const [field, order] = value.split("-") as ["created_at" | "name", "asc" | "desc"];
                    setSortField(field);
                    setSortOrder(order);
                  }}
                >
                  <SelectTrigger className="flex-1 sm:flex-none sm:w-[200px]">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at-desc">Newest first</SelectItem>
                    <SelectItem value="created_at-asc">Oldest first</SelectItem>
                    <SelectItem value="name-asc">Name A-Z</SelectItem>
                    <SelectItem value="name-desc">Name Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Applications List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Applications</CardTitle>
                    <CardDescription>
                      Review and manage candidate applications
                      {total > 0 && (
                        <span className="ml-1">
                          — showing {((page - 1) * pageSize) + 1}-{Math.min(page * pageSize, total)} of {total}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  {selectedApplications.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {selectedApplications.length} selected
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            Bulk Actions
                            <ChevronDown className="w-4 h-4 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleBulkStatusUpdate("reviewing")}
                          >
                            Move to Reviewing
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleBulkStatusUpdate("shortlisted")}
                          >
                            Move to Shortlisted
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleBulkStatusUpdate("interview")}
                          >
                            Move to Interview
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleBulkStatusUpdate("accepted")}
                          >
                            Move to Accepted
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleBulkStatusUpdate("rejected")}
                          >
                            Move to Rejected
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <MobileStatusCarousel
                  statusFilter={statusFilter}
                  onStatusChange={handleTabChange}
                  totalApplications={totalApplications}
                  statusCounts={statusCounts}
                />

                <Tabs value={statusFilter} onValueChange={handleTabChange} className="w-full">
                  {/* Desktop only: tab bar */}
                  <TabsList className="desktop-status-tabs grid w-full grid-cols-6 bg-gray-100">
                    <TabsTrigger
                      value="all"
                      className="text-sm data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-600"
                    >
                      All ({totalApplications})
                    </TabsTrigger>
                    <TabsTrigger
                      value="submitted"
                      className="text-sm data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-600"
                    >
                      New ({statusCounts.submitted || 0})
                    </TabsTrigger>
                    <TabsTrigger
                      value="reviewing"
                      className="text-sm data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-600"
                    >
                      Reviewing ({statusCounts.reviewing || 0})
                    </TabsTrigger>
                    <TabsTrigger
                      value="shortlisted"
                      className="text-sm data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-600"
                    >
                      Shortlisted ({statusCounts.shortlisted || 0})
                    </TabsTrigger>
                    <TabsTrigger
                      value="interview"
                      className="text-sm data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-600"
                    >
                      Interview ({statusCounts.interview || 0})
                    </TabsTrigger>
                    <TabsTrigger
                      value="rejected"
                      className="text-sm data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-600"
                    >
                      Rejected ({statusCounts.rejected || 0})
                    </TabsTrigger>
                  </TabsList>

                  {/* Single content area for all tabs since filtering is server-side */}
                  <div className="mt-6">
                    {applications.length > 0 && (
                      <div className="mb-4">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full sm:w-auto"
                          onClick={selectAllApplications}
                        >
                          {selectedApplications.length === applications.length && applications.length > 0
                            ? "Deselect All"
                            : "Select All"}
                        </Button>
                      </div>
                    )}

                    {loading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : applications.length === 0 ? (
                      <div className="text-center py-12">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          {searchQuery ? "No Matching Applications" : "No Applications Yet"}
                        </h3>
                        <p className="text-muted-foreground">
                          {searchQuery
                            ? `No applications match "${searchQuery}". Try a different search.`
                            : "This job posting hasn\u2019t received any applications yet. Once candidates apply, you\u2019ll see them here."}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {applications.map((application) => (
                          <ApplicationCard
                            key={application.id}
                            application={application}
                            isSelected={selectedApplications.includes(
                              application.id
                            )}
                            onToggleSelect={toggleApplicationSelection}
                          />
                        ))}
                      </div>
                    )}

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t">
                        <p className="text-sm text-muted-foreground">
                          Page {page} of {totalPages}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page - 1)}
                            disabled={page <= 1}
                            className="gap-1"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPage(page + 1)}
                            disabled={page >= totalPages}
                            className="gap-1"
                          >
                            Next
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </>
        )}

        {!selectedJobId && !loading && jobs.length > 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <Briefcase className="h-12 w-12 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">
                    Select a Job to View Applications
                  </h3>
                  <p className="text-muted-foreground">
                    Choose a job posting above to see and manage its
                    applications.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && jobs.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center gap-4">
                <Briefcase className="h-12 w-12 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">
                    No Job Postings Found
                  </h3>
                  <p className="text-muted-foreground">
                    You haven&apos;t posted any jobs yet. Create your first job
                    posting to start receiving applications.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </EmployerLayout>
  );
};

export default EmployerApplications;
