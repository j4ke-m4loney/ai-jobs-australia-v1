import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  MapPin,
  Briefcase,
  FileText,
  Plus,
  X,
  Save,
  ArrowLeft,
} from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";

interface Profile {
  id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  bio: string | null;
  location: string | null;
  skills: string[] | null;
  experience_level: string | null;
  resume_url: string | null;
  cover_letter_url: string | null;
  company_name: string | null;
  user_type: string;
}

const EditProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchProfile();
  }, [user, navigate]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user?.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setProfile(data);
      } else {
        // Create a new profile
        const newProfile = {
          user_id: user?.id,
          first_name: "",
          last_name: "",
          bio: "",
          location: "",
          skills: [],
          experience_level: "entry",
          resume_url: "",
          cover_letter_url: "",
          company_name: "",
          user_type: "job_seeker",
        };
        setProfile(newProfile as Profile);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = (field: keyof Profile, value: any) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
  };

  const addSkill = () => {
    if (!newSkill.trim() || !profile) return;

    const skills = profile.skills || [];
    if (skills.includes(newSkill.trim())) {
      toast.error("Skill already added");
      return;
    }

    updateProfile("skills", [...skills, newSkill.trim()]);
    setNewSkill("");
  };

  const removeSkill = (skillToRemove: string) => {
    if (!profile) return;
    const skills = profile.skills || [];
    updateProfile(
      "skills",
      skills.filter((skill) => skill !== skillToRemove)
    );
  };

  const saveProfile = async () => {
    if (!profile || !user) return;

    setSaving(true);
    try {
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (existingProfile) {
        // Update existing profile
        const { error } = await supabase
          .from("profiles")
          .update({
            first_name: profile.first_name,
            last_name: profile.last_name,
            bio: profile.bio,
            location: profile.location,
            skills: profile.skills,
            experience_level: profile.experience_level,
            company_name: profile.company_name,
            user_type: profile.user_type,
          })
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        // Insert new profile
        const { error } = await supabase.from("profiles").insert({
          user_id: user.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
          bio: profile.bio,
          location: profile.location,
          skills: profile.skills,
          experience_level: profile.experience_level,
          company_name: profile.company_name,
          user_type: profile.user_type,
        });

        if (error) throw error;
      }

      toast.success("Profile saved successfully!");
      navigate("/jobseeker/dashboard");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        <div className="container mx-auto px-4 pt-20 pb-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        <div className="container mx-auto px-4 pt-20 pb-8 flex items-center justify-center">
          <div className="text-center">
            <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Profile not found
            </h2>
            <p className="text-muted-foreground mb-6">
              Unable to load your profile.
            </p>
            <Button onClick={() => navigate("/jobseeker/dashboard")}>
              Go to Dashboard
            </Button>
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate("/jobseeker/dashboard")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Edit Profile
              </h1>
              <p className="text-muted-foreground">
                Keep your profile updated to attract employers
              </p>
            </div>
          </div>
          <Button onClick={saveProfile} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? "Saving..." : "Save Profile"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile.first_name || ""}
                      onChange={(e) =>
                        updateProfile("first_name", e.target.value)
                      }
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.last_name || ""}
                      onChange={(e) =>
                        updateProfile("last_name", e.target.value)
                      }
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Email cannot be changed here. Contact support if needed.
                  </p>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={profile.location || ""}
                    onChange={(e) => updateProfile("location", e.target.value)}
                    placeholder="e.g., Sydney, NSW"
                  />
                </div>

                <div>
                  <Label htmlFor="userType">Profile Type</Label>
                  <select
                    id="userType"
                    value={profile.user_type}
                    onChange={(e) => updateProfile("user_type", e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="job_seeker">Job Seeker</option>
                    <option value="employer">Employer</option>
                  </select>
                </div>

                {profile.user_type === "employer" && (
                  <div>
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      value={profile.company_name || ""}
                      onChange={(e) =>
                        updateProfile("company_name", e.target.value)
                      }
                      placeholder="Enter your company name"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Professional Details */}
            {profile.user_type === "job_seeker" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Professional Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="experienceLevel">Experience Level</Label>
                    <select
                      id="experienceLevel"
                      value={profile.experience_level || "entry"}
                      onChange={(e) =>
                        updateProfile("experience_level", e.target.value)
                      }
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    >
                      <option value="entry">Entry Level (0-2 years)</option>
                      <option value="mid">Mid Level (2-5 years)</option>
                      <option value="senior">Senior Level (5-10 years)</option>
                      <option value="lead">Lead Level (10+ years)</option>
                      <option value="executive">Executive Level</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="bio">Professional Bio</Label>
                    <Textarea
                      id="bio"
                      value={profile.bio || ""}
                      onChange={(e) => updateProfile("bio", e.target.value)}
                      placeholder="Tell employers about your experience, skills, and career goals..."
                      rows={4}
                    />
                  </div>

                  {/* Skills */}
                  <div>
                    <Label>Skills</Label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {(profile.skills || []).map((skill, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="gap-1"
                        >
                          {skill}
                          <button
                            onClick={() => removeSkill(skill)}
                            className="hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill (e.g., Python, React, Machine Learning)"
                        onKeyPress={(e) =>
                          e.key === "Enter" && (e.preventDefault(), addSkill())
                        }
                      />
                      <Button
                        type="button"
                        onClick={addSkill}
                        variant="outline"
                        className="gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Documents */}
            {profile.user_type === "job_seeker" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Documents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="resumeUrl">Resume URL</Label>
                    <Input
                      id="resumeUrl"
                      value={profile.resume_url || ""}
                      onChange={(e) =>
                        updateProfile("resume_url", e.target.value)
                      }
                      placeholder="Link to your resume (Google Drive, Dropbox, etc.)"
                    />
                  </div>

                  <div>
                    <Label htmlFor="coverLetterUrl">Cover Letter URL</Label>
                    <Input
                      id="coverLetterUrl"
                      value={profile.cover_letter_url || ""}
                      onChange={(e) =>
                        updateProfile("cover_letter_url", e.target.value)
                      }
                      placeholder="Link to your cover letter template"
                    />
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Upload your documents to cloud storage and paste the public
                    links here.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Profile Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        profile.first_name && profile.last_name
                          ? "bg-green-500"
                          : "bg-muted"
                      }`}
                    ></div>
                    <span className="text-sm">Personal Information</span>
                  </div>

                  {profile.user_type === "job_seeker" && (
                    <>
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full ${
                            profile.bio && profile.experience_level
                              ? "bg-green-500"
                              : "bg-muted"
                          }`}
                        ></div>
                        <span className="text-sm">Professional Details</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full ${
                            profile.skills && profile.skills.length > 0
                              ? "bg-green-500"
                              : "bg-muted"
                          }`}
                        ></div>
                        <span className="text-sm">Skills</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full ${
                            profile.resume_url ? "bg-green-500" : "bg-muted"
                          }`}
                        ></div>
                        <span className="text-sm">Resume</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-6">
                  <Button
                    onClick={saveProfile}
                    disabled={saving}
                    className="w-full gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Profile"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditProfile;
