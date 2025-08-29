import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, FileText, User, MapPin, Phone, Mail, Edit } from "lucide-react";
import { toast } from "sonner";
import { useSavedJobs } from "@/hooks/useSavedJobs";

interface Application {
  id: string;
  status: string;
  created_at: string;
  job: {
    id: string;
    title: string;
    location: string;
    location_type: string;
    job_type: string;
    salary_min: number | null;
    salary_max: number | null;
  };
}

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  location: string | null;
  phone: string | null;
  skills: string[] | null;
  experience_level: string | null;
  resume_url: string | null;
}

export const JobSeekerDashboardOverview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { savedJobIds } = useSavedJobs();
  const [applications, setApplications] = useState<Application[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // Fetch applications
      const { data: applicationsData, error: applicationsError } =
        await supabase
          .from("job_applications")
          .select(
            `
          *,
          jobs:job_id (
            id,
            title,
            location,
            location_type,
            job_type,
            salary_min,
            salary_max
          )
        `
          )
          .eq("applicant_id", user?.id)
          .order("created_at", { ascending: false })
          .limit(5);

      if (applicationsError) throw applicationsError;

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (profileError && profileError.code !== "PGRST116") {
        throw profileError;
      }

      const applicationsWithJobs =
        applicationsData?.map((app) => ({
          ...app,
          job: app.jobs,
        })) || [];

      setApplications(applicationsWithJobs);
      setProfile(profileData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getProfileCompleteness = () => {
    if (!profile) return 0;
    const fields = [
      "first_name",
      "last_name",
      "location",
      "phone",
      "bio",
      "skills",
      "experience_level",
    ];
    const completedFields = fields.filter(
      (field) => profile[field as keyof Profile]
    ).length;
    return Math.round((completedFields / fields.length) * 100);
  };

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return "Not specified";
    if (min && max)
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    return `Up to $${max?.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const profileComplete = getProfileCompleteness();
  const pendingApplications = applications.filter(
    (app) => app.status === "submitted"
  ).length;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {profile?.first_name || "Job Seeker"}!
          </h1>
          <p className="text-muted-foreground">
            Manage your profile and track your job search progress
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Applications
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{applications.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingApplications} pending review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Jobs</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{savedJobIds.size}</div>
            <p className="text-xs text-muted-foreground">Ready to apply</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Profile Complete
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profileComplete}%</div>
            <p className="text-xs text-muted-foreground">
              {profileComplete < 80 ? "Needs attention" : "Looking good!"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Your Profile
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/jobseeker/profile")}
            className="gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit Profile
          </Button>
        </CardHeader>
        <CardContent>
          {!profile ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Create your profile
              </h3>
              <p className="text-muted-foreground mb-4">
                Add your details to help employers find you.
              </p>
              <Button onClick={() => navigate("/jobseeker/profile")}>
                Create Profile
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">
                      {profile.first_name && profile.last_name
                        ? `${profile.first_name} ${profile.last_name}`
                        : "Name not provided"}
                    </p>
                  </div>
                </div>

                {profile.location && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-muted-foreground" />
                    <p className="text-muted-foreground">{profile.location}</p>
                  </div>
                )}

                {profile.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground" />
                    <p className="text-muted-foreground">{profile.phone}</p>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                  <p className="text-muted-foreground">{user?.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                {profile.experience_level && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Experience Level
                    </p>
                    <p className="text-muted-foreground capitalize">
                      {profile.experience_level}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium text-foreground mb-2">
                    Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills?.length ? (
                      profile.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No skills added yet
                      </p>
                    )}
                  </div>
                </div>

                {profile.bio && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-1">
                      Bio
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {profile.bio}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Applications */}
      {applications.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Recent Applications
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/jobseeker/applications")}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {applications.slice(0, 3).map((application) => (
                <div
                  key={application.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-medium">{application.job.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {application.job.location} • {application.job.job_type}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        application.status === "submitted"
                          ? "secondary"
                          : "default"
                      }
                    >
                      {application.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(application.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
