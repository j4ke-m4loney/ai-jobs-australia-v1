"use client";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { JobSeekerLayout } from "@/components/jobseeker/JobSeekerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
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
import { Settings, Mail, Bell, AlertTriangle } from "lucide-react";

const settingsSchema = z.object({
  email: z.string().email("Invalid email address"),
  notifications_new_jobs: z.boolean(),
  notifications_application_updates: z.boolean(),
  notifications_job_expiry: z.boolean(),
  notifications_rejection_feedback: z.boolean(),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

const JobSeekerSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      email: "",
      notifications_new_jobs: true,
      notifications_application_updates: true,
      notifications_job_expiry: false,
      notifications_rejection_feedback: false,
    },
  });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchSettings();
  }, [user, navigate]);

  const fetchSettings = async () => {
    try {
      // Wait a bit to ensure user is fully loaded
      if (!user?.email) {
        setLoading(false);
        return;
      }

      // In a real implementation, you would fetch notification preferences from a user_settings table
      // For now, we'll use default values
      form.reset({
        email: user.email,
        notifications_new_jobs: true,
        notifications_application_updates: true,
        notifications_job_expiry: false,
        notifications_rejection_feedback: false,
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: SettingsFormData) => {
    setSaving(true);
    try {
      // Update email if changed
      if (data.email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: data.email,
        });
        if (emailError) throw emailError;
        toast.success(
          "Email updated! Please check your email to confirm the new address."
        );
      }

      // TODO: Save notification preferences to a user_settings table
      // For now, we'll just show a success message
      toast.success("Settings updated successfully");
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  // Don't render form until we have user data and form is ready
  if (loading || !user) {
    return (
      <JobSeekerLayout title="Settings">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </JobSeekerLayout>
    );
  }

  return (
    <JobSeekerLayout title="Settings">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Settings className="w-6 h-6 text-primary" />
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account and notification preferences
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Account Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Account Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormDescription>
                          Your email address for account access and
                          notifications
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Email Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-base font-medium">
                      New Job Opportunities
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when new jobs matching your profile are
                      posted
                    </p>
                  </div>
                  <Switch
                    checked={form.watch("notifications_new_jobs")}
                    onCheckedChange={(checked) =>
                      form.setValue("notifications_new_jobs", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-base font-medium">
                      Application Updates
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when employers view or update your
                      applications
                    </p>
                  </div>
                  <Switch
                    checked={form.watch("notifications_application_updates")}
                    onCheckedChange={(checked) =>
                      form.setValue(
                        "notifications_application_updates",
                        checked
                      )
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-base font-medium">
                      Job Expiry Alerts
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when job listings you're interested in are
                      about to expire
                    </p>
                  </div>
                  <Switch
                    checked={form.watch("notifications_job_expiry")}
                    onCheckedChange={(checked) =>
                      form.setValue("notifications_job_expiry", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-base font-medium">
                      Rejection Feedback
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Get notified if you're unlikely to progress (marked as
                      unlikely by employer)
                    </p>
                  </div>
                  <Switch
                    checked={form.watch("notifications_rejection_feedback")}
                    onCheckedChange={(checked) =>
                      form.setValue("notifications_rejection_feedback", checked)
                    }
                  />
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-start gap-3 p-3 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
                    <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-orange-900 dark:text-orange-100">
                        TODO: Enhanced Employer Dashboard Features
                      </p>
                      <p className="text-orange-700 dark:text-orange-300 mt-1">
                        The employer dashboard will be enhanced with features to
                        mark applications as "unlikely to progress" and provide
                        feedback to job seekers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </JobSeekerLayout>
  );
};

export default JobSeekerSettings;
