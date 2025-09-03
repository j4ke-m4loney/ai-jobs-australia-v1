"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const EmployerSettings = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  // Mock settings state
  const [profileSettings, setProfileSettings] = useState({
    firstName: user?.user_metadata?.first_name || "",
    lastName: user?.user_metadata?.last_name || "",
    email: user?.email || "",
    phone: "+61 400 123 456",
    company: "TechCorp AI Solutions",
    position: "HR Manager",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailApplications: true,
    emailJobViews: false,
    emailWeeklyReports: true,
    pushApplications: true,
    pushMessages: true,
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisible: true,
    showCompanyLogo: true,
    allowDirectMessages: true,
    dataAnalytics: true,
  });

  const handleSaveProfile = () => {
    // Save profile settings
    console.log("Saving profile settings:", profileSettings);
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <EmployerLayout title="Settings">
      <div className="max-w-4xl mx-auto">
        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileSettings.firstName}
                      onChange={(e) =>
                        setProfileSettings({
                          ...profileSettings,
                          firstName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileSettings.lastName}
                      onChange={(e) =>
                        setProfileSettings({
                          ...profileSettings,
                          lastName: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileSettings.email}
                    onChange={(e) =>
                      setProfileSettings({
                        ...profileSettings,
                        email: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={profileSettings.phone}
                    onChange={(e) =>
                      setProfileSettings({
                        ...profileSettings,
                        phone: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={profileSettings.company}
                      onChange={(e) =>
                        setProfileSettings({
                          ...profileSettings,
                          company: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="position">Position</Label>
                    <Input
                      id="position"
                      value={profileSettings.position}
                      onChange={(e) =>
                        setProfileSettings({
                          ...profileSettings,
                          position: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <Button onClick={handleSaveProfile} className="gap-2 w-full sm:w-auto">
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

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

          <TabsContent value="billing">
            <Card>
              <CardHeader>
                <CardTitle>Billing Information</CardTitle>
                <CardDescription>
                  Manage your subscription and payment methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Current Plan</h4>
                    <Badge className="bg-primary">Professional</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    $99/month • Unlimited job postings • Advanced analytics
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Change Plan
                    </Button>
                    <Button variant="outline" size="sm">
                      View Billing History
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-4">Payment Method</h4>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                          <CreditCard className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">•••• •••• •••• 4242</p>
                          <p className="text-sm text-muted-foreground">
                            Expires 12/25
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Update
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Danger Zone */}
      </div>
    </EmployerLayout>
  );
};

export default EmployerSettings;
