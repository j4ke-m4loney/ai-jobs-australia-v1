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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Star,
  Download,
  Mail,
  Phone,
  MapPin,
  Calendar,
  ChevronDown,
  Briefcase,
  Plus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { JobSelector } from "@/components/employer/JobSelector";
import {
  useEmployerApplications,
  JobApplication,
} from "@/hooks/useEmployerApplications";
import { useToast } from "@/hooks/use-toast";
import { downloadResume, downloadCoverLetter } from "@/utils/documentDownload";

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
  } = useEmployerApplications(selectedJobId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "reviewing":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100 hover:text-yellow-800 hover:border-yellow-200";
      case "shortlisted":
        return "bg-green-100 text-green-800 border-green-200 hover:bg-green-100 hover:text-green-800 hover:border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200 hover:bg-red-100 hover:text-red-800 hover:border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100 hover:text-gray-800 hover:border-gray-200";
    }
  };

  const capitalizeStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const filterApplications = (status: string) => {
    if (status === "all") return applications;
    return applications.filter((app) => app.status === status);
  };

  const handleStatusUpdate = async (
    applicationId: string,
    newStatus: string
  ) => {
    const success = await updateApplicationStatus(applicationId, newStatus);
    if (success) {
      toast({
        title: "Status Updated",
        description: `Application moved to ${newStatus}`,
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
        description: `${selectedApplications.length} applications moved to ${newStatus}`,
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

  const selectAllApplications = (applications: JobApplication[]) => {
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

  const ApplicationCard = ({
    application,
    isSelected,
    onToggleSelect,
    applicationNumber,
  }: {
    application: JobApplication;
    isSelected: boolean;
    onToggleSelect: (id: string) => void;
    applicationNumber?: number;
  }) => {
    const applicantName =
      `${application.profiles?.first_name || ""} ${
        application.profiles?.last_name || ""
      }`.trim() || "Unknown Applicant";
    const userEmail = application.profiles?.email || "Email not provided";

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
              <Avatar className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                <AvatarFallback>
                  {applicantName
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {applicationNumber && (
                    <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-medium bg-blue-100 text-blue-800 rounded-full flex-shrink-0">
                      {applicationNumber}
                    </span>
                  )}
                  <h3 className="font-semibold text-base sm:text-lg truncate">
                    {applicantName}
                  </h3>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-4 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span className="truncate">{userEmail}</span>
            </div>
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
            {/* Commented out experience level display - not useful for employers */}
            {/* <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-warning flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium truncate">
                {application.profiles?.experience_level ||
                  "Experience level not specified"}
              </span>
            </div> */}

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
              
              {/* Show indicators when documents are not available */}
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

        {selectedJobId && !loading && !error && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Applications
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {applications.length}
                  </div>
                  <p className="text-xs text-muted-foreground">For this job</p>
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
                    {filterApplications("reviewing").length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Need attention
                  </p>
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
                    {filterApplications("shortlisted").length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ready for interview
                  </p>
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
                    {filterApplications("rejected").length}
                  </div>
                  <p className="text-xs text-muted-foreground">Not a fit</p>
                </CardContent>
              </Card>
            </div>

            {/* Applications List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Applications</CardTitle>
                    <CardDescription>
                      Review and manage candidate applications
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
                            onClick={() =>
                              handleBulkStatusUpdate("shortlisted")
                            }
                          >
                            Move to Shortlisted
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
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 bg-gray-100">
                    <TabsTrigger
                      value="all"
                      className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-600"
                    >
                      All ({applications.length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="reviewing"
                      className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-600"
                    >
                      {capitalizeStatus("reviewing")} (
                      {filterApplications("reviewing").length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="shortlisted"
                      className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-600"
                    >
                      {capitalizeStatus("shortlisted")} (
                      {filterApplications("shortlisted").length})
                    </TabsTrigger>
                    <TabsTrigger
                      value="rejected"
                      className="text-xs sm:text-sm data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-600"
                    >
                      {capitalizeStatus("rejected")} (
                      {filterApplications("rejected").length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="mt-6">
                    <div className="mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => selectAllApplications(applications)}
                      >
                        {selectedApplications.length === applications.length
                          ? "Deselect All"
                          : "Select All"}
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {applications.length === 0 ? (
                        <div className="text-center py-12">
                          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No Applications Yet</h3>
                          <p className="text-muted-foreground">
                            This job posting hasn&apos;t received any applications yet. Once candidates apply, you&apos;ll see them here.
                          </p>
                        </div>
                      ) : (
                        applications.map((application, index) => (
                          <ApplicationCard
                            key={application.id}
                            application={application}
                            isSelected={selectedApplications.includes(
                              application.id
                            )}
                            onToggleSelect={toggleApplicationSelection}
                            applicationNumber={index + 1}
                          />
                        ))
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="reviewing" className="mt-6">
                    <div className="mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() =>
                          selectAllApplications(filterApplications("reviewing"))
                        }
                      >
                        {selectedApplications.length ===
                          filterApplications("reviewing").length &&
                        filterApplications("reviewing").length > 0
                          ? "Deselect All"
                          : "Select All"}
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {filterApplications("reviewing").map((application, index) => (
                        <ApplicationCard
                          key={application.id}
                          application={application}
                          isSelected={selectedApplications.includes(
                            application.id
                          )}
                          onToggleSelect={toggleApplicationSelection}
                          applicationNumber={index + 1}
                        />
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="shortlisted" className="mt-6">
                    <div className="mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() =>
                          selectAllApplications(
                            filterApplications("shortlisted")
                          )
                        }
                      >
                        {selectedApplications.length ===
                          filterApplications("shortlisted").length &&
                        filterApplications("shortlisted").length > 0
                          ? "Deselect All"
                          : "Select All"}
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {filterApplications("shortlisted").map((application, index) => (
                        <ApplicationCard
                          key={application.id}
                          application={application}
                          isSelected={selectedApplications.includes(
                            application.id
                          )}
                          onToggleSelect={toggleApplicationSelection}
                          applicationNumber={index + 1}
                        />
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="rejected" className="mt-6">
                    <div className="mb-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() =>
                          selectAllApplications(filterApplications("rejected"))
                        }
                      >
                        {selectedApplications.length ===
                          filterApplications("rejected").length &&
                        filterApplications("rejected").length > 0
                          ? "Deselect All"
                          : "Select All"}
                      </Button>
                    </div>
                    <div className="space-y-4">
                      {filterApplications("rejected").map((application, index) => (
                        <ApplicationCard
                          key={application.id}
                          application={application}
                          isSelected={selectedApplications.includes(
                            application.id
                          )}
                          onToggleSelect={toggleApplicationSelection}
                          applicationNumber={index + 1}
                        />
                      ))}
                    </div>
                  </TabsContent>
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
