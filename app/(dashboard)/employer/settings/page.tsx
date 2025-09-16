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
import { Subscription, PaymentMethod, BILLING_PLANS } from "@/types/billing";
import { EmployerLayout } from "@/components/employer/EmployerLayout";
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
  phone: z.string().min(1, "Phone number is required").regex(/^(\+?61|0)[2-9]\d{8}$/, "Please enter a valid Australian phone number"),
  company: z.string().min(1, "Company name is required").max(100, "Company name must be less than 100 characters"),
  position: z.string().min(1, "Position is required").max(100, "Position must be less than 100 characters"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const EmployerSettings = () => {
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  
  // Billing state
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [billingLoading, setBillingLoading] = useState(true);
  const [changingPlan, setChangingPlan] = useState(false);
  
  // Email change modal state
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailChangeData, setEmailChangeData] = useState<{
    oldEmail: string;
    newEmail: string;
    formData: ProfileFormData;
  } | null>(null);

  // Initialize form with profile data
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: profile?.first_name || "",
      lastName: profile?.last_name || "",
      email: user?.email || "",
      phone: profile?.phone || "",
      company: profile?.company_name || "",
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
        company: profile.company_name || "",
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
        
        const response = await fetch('/api/billing', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setSubscription(data.subscription);
          setPaymentMethods(data.paymentMethods);
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
  const changePlan = async (planType: string) => {
    if (!user) return;
    
    setChangingPlan(true);
    try {
      // Get session token from Supabase
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) return;
      
      const response = await fetch('/api/billing', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'change_plan',
          plan_type: planType
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubscription(data.subscription);
        toast.success(data.message || 'Plan changed successfully!');
      } else {
        throw new Error('Failed to change plan');
      }
    } catch (error) {
      console.error('Error changing plan:', error);
      toast.error('Failed to change plan. Please try again.');
    } finally {
      setChangingPlan(false);
    }
  };

  // TODO: Uncomment for future MVP iterations
  // const [notificationSettings, setNotificationSettings] = useState({
  //   emailApplications: true,
  //   emailJobViews: false,
  //   emailWeeklyReports: true,
  //   pushApplications: true,
  //   pushMessages: true,
  // });

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
        company_name: formData.company,
        // Note: position field would need to be added to database schema if needed
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

  const handleLogout = async () => {
    await signOut();
    router.push("/");
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
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. +61 400 123 456" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="company"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your company name" {...field} />
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
                              <FormLabel>Position</FormLabel>
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
                      </div>

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
              {/* Current Plan */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Plan</CardTitle>
                  <CardDescription>
                    Manage your subscription and billing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {billingLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium">
                          {subscription ? BILLING_PLANS[subscription.plan_type]?.name : 'Free Plan'}
                        </h4>
                        <Badge className={subscription?.plan_type === 'professional' ? "bg-primary" : 
                                          subscription?.plan_type === 'enterprise' ? "bg-purple-600" : "bg-gray-600"}>
                          {subscription ? BILLING_PLANS[subscription.plan_type]?.name : 'Free'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-4">
                        {subscription ? BILLING_PLANS[subscription.plan_type]?.price_display : 'Free'} • 
                        {subscription ? BILLING_PLANS[subscription.plan_type]?.description : 'Basic job posting'}
                      </p>
                      <div className="space-y-2 mb-4">
                        {subscription && BILLING_PLANS[subscription.plan_type]?.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            {feature}
                          </div>
                        ))}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          // Show plan selection
                          toast.info('Plan selection coming soon!');
                        }}
                        disabled={changingPlan}
                      >
                        {changingPlan ? 'Updating...' : 'Change Plan'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Available Plans */}
              <Card>
                <CardHeader>
                  <CardTitle>Available Plans</CardTitle>
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
                          subscription?.plan_type === plan.id ? 'border-primary bg-primary/5' : 'border-border'
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
                          variant={subscription?.plan_type === plan.id ? "outline" : "default"}
                          onClick={() => changePlan(plan.id)}
                          disabled={subscription?.plan_type === plan.id || changingPlan}
                        >
                          {subscription?.plan_type === plan.id ? 'Current Plan' : 
                           changingPlan ? 'Updating...' : `Switch to ${plan.name}`}
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

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
                            <Button variant="outline" size="sm">
                              Update
                            </Button>
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
                      <Button variant="outline">
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
      </div>
    </EmployerLayout>
  );
};

export default EmployerSettings;
