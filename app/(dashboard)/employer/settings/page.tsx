"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { JobPurchase, PaymentMethod, BILLING_PLANS } from "@/types/billing";
import { EmployerLayout } from "@/components/employer/EmployerLayout";
import { AddPaymentMethodModal } from "@/components/billing/AddPaymentMethodModal";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  User,
  Bell,
  Shield,
  CreditCard,
  LogOut,
  Save,
  Mail,
  AlertTriangle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// Validation schema for profile form
const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50, "First name must be less than 50 characters"),
  lastName: z.string().min(1, "Last name is required").max(50, "Last name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional().refine((val) => !val || /^(\+?61|0)[2-9]\d{8}$/.test(val), "Please enter a valid Australian phone number"),
  position: z.string().optional().refine((val) => !val || val.length <= 100, "Position must be less than 100 characters"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface Subscription {
  id: string;
  plan_type: 'standard' | 'featured' | 'annual';
  status: 'active' | 'cancelled' | 'past_due' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  price_per_month: number;
}

const EmployerSettings = () => {
  const { user, signOut, updateUserMetadata } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  
  // Billing state
  const [jobPurchases, setJobPurchases] = useState<JobPurchase[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [billingLoading, setBillingLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string>('standard');
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [cancellingSubscription, setCancellingSubscription] = useState(false);
  
  // Email change modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailChangeData, setEmailChangeData] = useState<{
    oldEmail: string;
    newEmail: string;
    formData: ProfileFormData;
  } | null>(null);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);

  // Initialize form with profile data
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile?.first_name || "",
      lastName: profile?.last_name || "",
      email: user?.email || "",
      phone: profile?.phone || "",
      position: "", // This field doesn't exist in profile yet
    },
  });

  // Reset form when profile loads
  React.useEffect(() => {
    if (profile) {
      form.reset({
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        email: user?.email || "",
        phone: profile.phone || "",
        position: "", // This field doesn't exist in profile yet
      });
    }
  }, [profile, user, form]);

  // Load billing data
  React.useEffect(() => {
    const loadBillingData = async () => {
      if (!user) return;

      try {
        // Get session token from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        // Check for active subscription (annual plan)
        const subscriptionResponse = await fetch(`/api/billing/subscription?userId=${user.id}`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });

        if (subscriptionResponse.ok) {
          const { subscription: userSubscription } = await subscriptionResponse.json();
          setSubscription(userSubscription);
        }

        // Load job purchases and payment methods
        try {
          const [paymentHistoryResponse, paymentMethodsResponse] = await Promise.all([
            fetch(`/api/billing/payment-history?userId=${user.id}`),
            fetch(`/api/billing/payment-methods?userId=${user.id}`)
          ]);

          if (paymentHistoryResponse.ok) {
            const paymentData = await paymentHistoryResponse.json();
            // Map payments to JobPurchase format for the settings page
            const mappedPurchases = paymentData.payments.map((payment: {
              id: string;
              pricing_tier: 'standard' | 'featured' | 'annual';
              amount: number;
              status: 'pending' | 'completed' | 'failed' | 'refunded';
              created_at: string;
              stripe_session_id: string | null;
            }) => ({
              id: payment.id,
              user_id: user.id,
              job_id: null, // Not available in payments table
              pricing_tier: payment.pricing_tier,
              amount_paid: payment.amount, // Already in cents
              stripe_payment_intent_id: payment.stripe_payment_intent_id,
              stripe_session_id: null, // Not available in this response
              status: payment.status === 'succeeded' ? 'completed' : payment.status,
              created_at: payment.created_at,
              updated_at: payment.created_at
            }));
            setJobPurchases(mappedPurchases);
          } else {
            console.error('Failed to fetch payment history for settings page');
            setJobPurchases([]);
          }

          if (paymentMethodsResponse.ok) {
            const paymentMethodsData = await paymentMethodsResponse.json();
            setPaymentMethods(paymentMethodsData.paymentMethods || []);
          } else {
            console.error('Failed to fetch payment methods for settings page');
            setPaymentMethods([]);
          }
        } catch (error) {
          console.error('Error fetching billing data for settings page:', error);
          setJobPurchases([]);
          setPaymentMethods([]);
        }

        // Load notification preferences
        try {
          const prefsResponse = await fetch(`/api/user/notification-preferences?userId=${user.id}`, {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          });

          if (prefsResponse.ok) {
            const { preferences } = await prefsResponse.json();
            if (preferences) {
              setNotificationSettings({
                emailApplications: preferences.email_applications,
                emailJobViews: preferences.email_job_views,
                emailWeeklyReports: preferences.email_weekly_reports,
                pushApplications: true, // Not stored in DB yet
                pushMessages: false,    // Not stored in DB yet
              });
            }
          }
          setNotificationPrefsLoaded(true);
        } catch (error) {
          console.error('Error loading notification preferences:', error);
          setNotificationPrefsLoaded(true);
        }
      } catch (error) {
        console.error('Error loading billing data:', error);
      } finally {
        setBillingLoading(false);
      }
    };

    if (user) {
      loadBillingData();
    }
  }, [user]);

  // Billing functions
  const handlePostJob = (planType: string) => {
    setSelectedPlan(planType);
    // Redirect to post job with selected plan
    router.push(`/post-job?plan=${planType}`);
  };

  const handleCancelSubscription = async () => {
    if (!user || !subscription) return;

    const confirmed = window.confirm(
      `Cancel your annual plan? You'll keep unlimited posting until ${
        subscription.current_period_end
          ? new Date(subscription.current_period_end).toLocaleDateString()
          : 'the end of your billing period'
      }.`
    );

    if (!confirmed) return;

    setCancellingSubscription(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;

      const response = await fetch('/api/billing/subscription', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: user.id })
      });

      if (response.ok) {
        const updatedSubscription = { ...subscription, status: 'cancelled' };
        setSubscription(updatedSubscription);
        toast.success('Annual plan cancelled successfully. You can continue posting jobs until the end of your billing period.');
      } else {
        throw new Error('Failed to cancel subscription');
      }
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast.error('Failed to cancel subscription. Please try again or contact support.');
    } finally {
      setCancellingSubscription(false);
    }
  };

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailApplications: true,
    emailJobViews: false,
    emailWeeklyReports: false,
    pushApplications: true,
    pushMessages: false,
  });
  const [notificationPrefsLoaded, setNotificationPrefsLoaded] = useState(false);

  // const [privacySettings, setPrivacySettings] = useState({
  //   profileVisible: true,
  //   showCompanyLogo: true,
  //   allowDirectMessages: true,
  //   dataAnalytics: true,
  // });

  const handleSaveProfile = async (formData: ProfileFormData) => {
    // Check if email has changed
    if (formData.email !== user?.email) {
      // Show confirmation modal for email change
      setEmailChangeData({
        oldEmail: user?.email || "",
        newEmail: formData.email,
        formData: formData,
      });
      setShowEmailModal(true);
      return; // Don't proceed with form submission yet
    }

    // If no email change, proceed normally
    await handleProfileUpdate(formData);
  };

  const handleProfileUpdate = async (formData: ProfileFormData, skipEmailUpdate = false) => {
    if (!user) return;
    
    setSaving(true);
    try {
      await updateProfile({
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        // Note: position field would need to be added to database schema if needed
      });

      // Update user metadata to keep auth table in sync
      await updateUserMetadata({
        first_name: formData.firstName,
        last_name: formData.lastName,
        display_name: `${formData.firstName} ${formData.lastName}`.trim(),
      });

      // Update email if changed and not skipped
      if (!skipEmailUpdate && formData.email !== user?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email,
        });
        if (emailError) throw emailError;
        toast.success(
          "Profile updated! Please check your email to confirm the new address."
        );
      } else {
        toast.success("Profile updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
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

  const handleSaveNotificationPreferences = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const response = await fetch('/api/user/notification-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          email_applications: notificationSettings.emailApplications,
          email_job_views: notificationSettings.emailJobViews,
          email_weekly_reports: notificationSettings.emailWeeklyReports,
          // Job seeker preferences are null for employers
          email_new_jobs: null,
          email_similar_jobs: null,
          email_application_updates: null,
          email_promotions: null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save notification preferences');
      }

      toast.success("Notification preferences updated successfully!");
    } catch (error) {
      console.error("Error saving notification preferences:", error);
      toast.error("Failed to update notification preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  // Payment method handlers
  const handleAddPaymentMethod = () => {
    setShowAddPaymentModal(true);
  };

  const handlePaymentMethodAdded = async () => {
    // Refresh billing data after adding a payment method
    try {
      const response = await fetch(`/api/billing/payment-methods?userId=${user.id}`);
      if (response.ok) {
        const data = await response.json();
        setPaymentMethods(data.paymentMethods || []);
        toast.success("Payment method added successfully!");
      }
    } catch (error) {
      console.error("Error refreshing payment methods:", error);
    }
  };

  const handleDeletePaymentMethod = async (paymentMethodId: string) => {
    if (!confirm("Are you sure you want to remove this payment method?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/billing/payment-methods?paymentMethodId=${paymentMethodId}&userId=${user.id}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        setPaymentMethods(prev => prev.filter(pm => pm.id !== paymentMethodId));
        toast.success("Payment method removed successfully!");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to remove payment method");
      }
    } catch (error) {
      console.error("Error deleting payment method:", error);
      toast.error("Failed to remove payment method");
    }
  };

  return (
    <EmployerLayout title="Settings">
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            {/* TODO: Uncomment for future MVP iterations
            <TabsTrigger
              value="notifications"
              className="flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Privacy
            </TabsTrigger>
            */}
            <TabsTrigger value="billing" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Billing
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and contact details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {profileLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSaveProfile)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>First Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your first name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Last Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your last name" {...field} />
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
                                  placeholder="Enter your email address"
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
                              <Input placeholder="e.g. +61 400 123 456" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="position"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Position (Optional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your position" {...field} />
                            </FormControl>
                            <FormMessage />
                            <p className="text-sm text-muted-foreground">
                              This field will be saved for future use
                            </p>
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="gap-2 w-full sm:w-auto"
                        disabled={saving}
                      >
                        <Save className="w-4 h-4" />
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* TODO: Uncomment for future MVP iterations
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to be notified about activities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-4">Email Notifications</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-applications">
                          New Applications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified when someone applies to your jobs
                        </p>
                      </div>
                      <Switch
                        id="email-applications"
                        checked={notificationSettings.emailApplications}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            emailApplications: checked,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-views">Job Views</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified about job view milestones
                        </p>
                      </div>
                      <Switch
                        id="email-views"
                        checked={notificationSettings.emailJobViews}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            emailJobViews: checked,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="email-reports">Weekly Reports</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive weekly analytics and performance reports
                        </p>
                      </div>
                      <Switch
                        id="email-reports"
                        checked={notificationSettings.emailWeeklyReports}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            emailWeeklyReports: checked,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-4">Push Notifications</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="push-applications">
                          New Applications
                        </Label>
                        <p className="text-sm text-muted-foreground">
                          Real-time notifications for new applications
                        </p>
                      </div>
                      <Switch
                        id="push-applications"
                        checked={notificationSettings.pushApplications}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            pushApplications: checked,
                          })
                        }
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="push-messages">Direct Messages</Label>
                        <p className="text-sm text-muted-foreground">
                          Get notified about candidate messages
                        </p>
                      </div>
                      <Switch
                        id="push-messages"
                        checked={notificationSettings.pushMessages}
                        onCheckedChange={(checked) =>
                          setNotificationSettings({
                            ...notificationSettings,
                            pushMessages: checked,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t">
                  <Button
                    onClick={handleSaveNotificationPreferences}
                    disabled={saving || !notificationPrefsLoaded}
                    className="w-full sm:w-auto"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Saving..." : "Save Notification Preferences"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Control your privacy and data sharing preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="profile-visible">
                        Profile Visibility
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Make your employer profile visible to job seekers
                      </p>
                    </div>
                    <Switch
                      id="profile-visible"
                      checked={privacySettings.profileVisible}
                      onCheckedChange={(checked) =>
                        setPrivacySettings({
                          ...privacySettings,
                          profileVisible: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-logo">Show Company Logo</Label>
                      <p className="text-sm text-muted-foreground">
                        Display your company logo on job postings
                      </p>
                    </div>
                    <Switch
                      id="show-logo"
                      checked={privacySettings.showCompanyLogo}
                      onCheckedChange={(checked) =>
                        setPrivacySettings({
                          ...privacySettings,
                          showCompanyLogo: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="direct-messages">
                        Allow Direct Messages
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Let candidates send you direct messages
                      </p>
                    </div>
                    <Switch
                      id="direct-messages"
                      checked={privacySettings.allowDirectMessages}
                      onCheckedChange={(checked) =>
                        setPrivacySettings({
                          ...privacySettings,
                          allowDirectMessages: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="data-analytics">Data Analytics</Label>
                      <p className="text-sm text-muted-foreground">
                        Help us improve by sharing anonymized usage data
                      </p>
                    </div>
                    <Switch
                      id="data-analytics"
                      checked={privacySettings.dataAnalytics}
                      onCheckedChange={(checked) =>
                        setPrivacySettings({
                          ...privacySettings,
                          dataAnalytics: checked,
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          */}

          <TabsContent value="billing">
            <div className="space-y-6">
              {/* Active Subscription (if exists) */}
              {subscription && subscription.status === 'active' && (
                <Card>
                  <CardHeader>
                    <CardTitle>Current Subscription</CardTitle>
                    <CardDescription>
                      Your active annual plan
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-foreground">Annual Plan - Unlimited Postings</p>
                          <p className="text-sm text-muted-foreground">
                            Active until {subscription.current_period_end
                              ? new Date(subscription.current_period_end).toLocaleDateString()
                              : 'end of billing period'}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                          <button
                            onClick={handleCancelSubscription}
                            disabled={cancellingSubscription}
                            className="text-sm text-red-600 hover:text-red-800 underline disabled:opacity-50"
                          >
                            {cancellingSubscription ? 'Cancelling...' : 'Cancel Plan'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Job Posting History */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {subscription && subscription.status === 'active'
                      ? 'Recent Job Postings'
                      : 'Job Posting History'}
                  </CardTitle>
                  <CardDescription>
                    {subscription && subscription.status === 'active'
                      ? 'Jobs posted with your annual plan'
                      : 'View your previous job postings and payments'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {billingLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : jobPurchases.length > 0 ? (
                    <div className="space-y-4">
                      {jobPurchases.map((purchase) => (
                        <div key={purchase.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">
                                {BILLING_PLANS[purchase.pricing_tier]?.name} Job Posting
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(purchase.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">
                                ${(purchase.amount_paid / 100).toFixed(2)}
                              </p>
                              <Badge variant={purchase.status === 'completed' ? 'default' : 'secondary'}>
                                {purchase.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">
                        {subscription && subscription.status === 'active'
                          ? 'No jobs posted yet'
                          : 'No job postings yet'}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {subscription && subscription.status === 'active'
                          ? 'Start posting unlimited jobs with your annual plan'
                          : 'Post your first job to start hiring top AI talent'}
                      </p>
                      <Button onClick={() => router.push('/post-job')}>
                        {subscription && subscription.status === 'active'
                          ? 'Post Unlimited Jobs'
                          : 'Post Your First Job'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Available Job Posting Plans - Only show if no active subscription */}
              {!(subscription && subscription.status === 'active') && (
                <Card>
                  <CardHeader>
                    <CardTitle>Post a New Job</CardTitle>
                    <CardDescription>
                      Choose the plan that best fits your hiring needs
                    </CardDescription>
                  </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.values(BILLING_PLANS).map((plan) => (
                      <div
                        key={plan.id}
                        className={`p-4 border rounded-lg relative ${
                          selectedPlan === plan.id ? 'border-primary bg-primary/5' : 'border-border'
                        } ${plan.popular ? 'ring-2 ring-primary' : ''}`}
                      >
                        {plan.popular && (
                          <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                            <Badge className="bg-primary">Most Popular</Badge>
                          </div>
                        )}
                        <div className="text-center mb-4">
                          <h3 className="font-semibold text-lg">{plan.name}</h3>
                          <div className="text-2xl font-bold text-primary">{plan.price_display}</div>
                          <p className="text-sm text-muted-foreground">{plan.description}</p>
                        </div>
                        <ul className="space-y-2 mb-4">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-2 text-sm">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              {feature}
                            </li>
                          ))}
                        </ul>
                        <Button
                          className="w-full"
                          variant={selectedPlan === plan.id ? "default" : "outline"}
                          onClick={() => handlePostJob(plan.id)}
                        >
                          Post Job - {plan.price_display}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
                </Card>
              )}

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>
                    Manage your payment information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {paymentMethods.length > 0 ? (
                    <div className="space-y-4">
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                                <CreditCard className="w-4 h-4 text-blue-600" />
                              </div>
                              <div>
                                <p className="font-medium">
                                  •••• •••• •••• {method.card_last_four}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {method.card_brand} • Expires {method.card_exp_month}/{method.card_exp_year}
                                </p>
                              </div>
                              {method.is_default && (
                                <Badge variant="secondary">Default</Badge>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm">
                                Update
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeletePaymentMethod(method.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No payment method</h3>
                      <p className="text-muted-foreground mb-4">
                        Add a payment method to upgrade your plan
                      </p>
                      <Button variant="outline" onClick={handleAddPaymentMethod}>
                        Add Payment Method
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

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

        {/* Danger Zone */}

        {/* Add Payment Method Modal */}
        {user && (
          <AddPaymentMethodModal
            isOpen={showAddPaymentModal}
            onClose={() => setShowAddPaymentModal(false)}
            onSuccess={handlePaymentMethodAdded}
            userId={user.id}
          />
        )}
      </div>
    </EmployerLayout>
  );
};

export default EmployerSettings;
