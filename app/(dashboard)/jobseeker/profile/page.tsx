"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { JobSeekerLayout } from "@/components/jobseeker/JobSeekerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { toast } from "sonner";
import { User, MapPin, Phone, Mail, Briefcase, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const profileSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  location: z.string().min(1, "Location is required"),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address"),
  bio: z.string().optional(),
  skills: z.string().optional(),
  experience_level: z.enum(["entry", "mid", "senior", "executive", ""]).optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const JobSeekerProfile = () => {
  const { user, updateUserMetadata } = useAuth();
  const { profile, updateProfile, loading } = useProfile();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailChangeData, setEmailChangeData] = useState<{
    oldEmail: string;
    newEmail: string;
    formData: ProfileFormData;
  } | null>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      location: "",
      phone: "",
      email: user?.email || "",
      bio: "",
      skills: "",
      experience_level: "",
    },
  });

  useEffect(() => {
    if (!user) {
      router.push("/auth");
      return;
    }
  }, [user, router]);

  useEffect(() => {
    if (profile) {
      form.reset({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        location: profile.location || "",
        phone: profile.phone || "",
        email: user?.email || "",
        bio: profile.bio || "",
        skills: profile.skills?.join(", ") || "",
        experience_level: profile.experience_level || "",
      });
      setSkills(profile.skills || []);
    }
  }, [profile, user?.email, form]);

  // Profile data is now handled by ProfileContext

  const addSkill = (skill: string) => {
    if (skill && !skills.includes(skill)) {
      const newSkills = [...skills, skill];
      setSkills(newSkills);
      form.setValue("skills", newSkills.join(", "));
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    const newSkills = skills.filter(s => s !== skillToRemove);
    setSkills(newSkills);
    form.setValue("skills", newSkills.join(", "));
  };

  const onSubmit = async (data: ProfileFormData) => {
    // Check if email has changed
    if (data.email !== user?.email) {
      // Show confirmation modal for email change
      setEmailChangeData({
        oldEmail: user?.email || "",
        newEmail: data.email,
        formData: data,
      });
      setShowEmailModal(true);
      return; // Don't proceed with form submission yet
    }

    // If no email change, proceed normally
    await handleProfileUpdate(data);
  };

  const handleProfileUpdate = async (data: ProfileFormData, skipEmailUpdate = false) => {
    setSaving(true);
    try {
      // Parse skills from comma-separated string
      const skillsArray = data.skills 
        ? data.skills.split(",").map(s => s.trim()).filter(s => s)
        : [];

      // Update profile using ProfileContext
      await updateProfile({
        first_name: data.first_name,
        last_name: data.last_name,
        location: data.location,
        phone: data.phone || null,
        bio: data.bio || null,
        skills: skillsArray.length > 0 ? skillsArray : null,
        experience_level: data.experience_level || null,
      });

      // Update user metadata to keep sidebar in sync
      await updateUserMetadata({
        first_name: data.first_name,
        last_name: data.last_name,
        display_name: `${data.first_name} ${data.last_name}`.trim(),
      });

      // Update email if changed and not skipped
      if (!skipEmailUpdate && data.email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email,
        });
        if (emailError) throw emailError;
        toast.success(
          "Profile updated! Please check your email to confirm the new address."
        );
      } else {
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleEmailChangeConfirm = async () => {
    if (!emailChangeData) return;
    
    setShowEmailModal(false);
    await handleProfileUpdate(emailChangeData.formData);
    setEmailChangeData(null);
  };

  const handleEmailChangeCancel = () => {
    // Revert email field to original value
    if (emailChangeData && user?.email) {
      form.setValue("email", user.email);
    }
    setShowEmailModal(false);
    setEmailChangeData(null);
  };

  if (loading) {
    return (
      <JobSeekerLayout title="Profile Settings">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </JobSeekerLayout>
    );
  }

  return (
    <JobSeekerLayout title="Profile Settings">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <User className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground">
              Manage your personal and professional information
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="email"
                            placeholder="johndoe@email.com"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="e.g. +61 4XX XXX XXX"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location (Suburb, State)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="e.g. Sydney, NSW"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Professional Information Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about yourself, your experience, and what you're looking for..."
                          className="min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A brief description about your professional background and career goals
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experience_level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience Level</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your experience level" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                          <SelectItem value="mid">Mid Level (3-5 years)</SelectItem>
                          <SelectItem value="senior">Senior Level (6-10 years)</SelectItem>
                          <SelectItem value="executive">Executive (10+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Skills</FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Add a skill (e.g., Python, Machine Learning)"
                              value={skillInput}
                              onChange={(e) => setSkillInput(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addSkill(skillInput);
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => addSkill(skillInput)}
                            >
                              Add
                            </Button>
                          </div>
                          {skills.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {skills.map((skill) => (
                                <Badge
                                  key={skill}
                                  variant="secondary"
                                  className="cursor-pointer"
                                  onClick={() => removeSkill(skill)}
                                >
                                  {skill} ✕
                                </Badge>
                              ))}
                            </div>
                          )}
                          <Input type="hidden" {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Add your technical and professional skills. Click on a skill to remove it.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <div className="flex justify-center sm:justify-end">
              <Button type="submit" disabled={saving} className="w-full sm:w-auto">
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>

        {/* Email Change Confirmation Modal */}
        <AlertDialog open={showEmailModal} onOpenChange={setShowEmailModal}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Confirm Email Change
              </AlertDialogTitle>
              <AlertDialogDescription>
                You are about to change your email address from{" "}
                <strong>{emailChangeData?.oldEmail}</strong> to{" "}
                <strong>{emailChangeData?.newEmail}</strong>.
                <br />
                <br />
                You will need to verify the new email address before you can use it to sign in.
                Are you sure you want to proceed?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleEmailChangeCancel}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction onClick={handleEmailChangeConfirm}>
                Confirm Change
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </JobSeekerLayout>
  );
};

export default JobSeekerProfile;