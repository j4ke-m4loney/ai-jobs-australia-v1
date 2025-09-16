"use client";

import { EmployerLayout } from "@/components/employer/EmployerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Clock } from "lucide-react";

const EmployerCompany = () => {
  return (
    <EmployerLayout title="Company Profile">
      <div className="max-w-2xl mx-auto">
        <Card className="text-center">
          <CardHeader>
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-2xl">Company Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
              <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                <Clock className="w-5 h-5" />
                <span className="font-medium">Coming Soon</span>
              </div>
              <p className="text-muted-foreground">
                The standalone company profile management will be available in a
                future update.
              </p>
              <p className="text-sm text-muted-foreground mt-3">
                For now, you can manage your company information when posting or
                editing jobs.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </EmployerLayout>
  );

  /* 
  TODO: FUTURE FEATURE - Standalone Company Profile Management
  
  The code below implements a full company profile management interface.
  This will be enabled in a future release to allow employers to:
  - Manage company information independently of job postings
  - View company statistics and performance metrics
  - Upload company logos and branding
  - Maintain consistent company data across all job postings
  
  When implemented, this will integrate with the companies database table
  and synchronize with the job posting process.
  */

  /*
  const [isEditing, setIsEditing] = useState(false);

  // Mock company data
  const [companyData, setCompanyData] = useState({
    name: "TechCorp AI Solutions",
    website: "https://techcorp-ai.com",
    description:
      "We are a leading AI solutions company specializing in machine learning, natural language processing, and computer vision. Our team of expert engineers and researchers work on cutting-edge projects that transform businesses across various industries.",
    industry: "Artificial Intelligence & Technology",
    size: "50-100 employees",
    location: "Sydney, NSW, Australia",
    founded: "2019",
    logo: "",
  });

  const handleSave = () => {
    // Here you would typically save to the database
    setIsEditing(false);
    // Show success toast
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset any changes
  };

  return (
    <EmployerLayout title="Company Profile">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-start items-center justify-center mb-6 gap-3">
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto">
            Edit Profile
          </Button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
              Cancel
            </Button>
            <Button onClick={handleSave} className="w-full sm:w-auto">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>
      
      <div className="max-w-4xl mx-auto grid gap-6">
              // Company Header 
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
                    <div className="relative flex-shrink-0">
                      <Avatar className="w-20 h-20 sm:w-24 sm:h-24">
                        <AvatarImage src={companyData.logo} />
                        <AvatarFallback className="text-xl sm:text-2xl">
                          <Building2 className="w-10 h-10 sm:w-12 sm:h-12" />
                        </AvatarFallback>
                      </Avatar>
                      {isEditing && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="absolute -bottom-2 -right-2 w-8 h-8 p-0"
                        >
                          <Camera className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="flex-1 text-center sm:text-left w-full sm:w-auto">
                      {isEditing ? (
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="companyName">Company Name</Label>
                            <Input
                              id="companyName"
                              value={companyData.name}
                              onChange={(e) =>
                                setCompanyData({
                                  ...companyData,
                                  name: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="website">Website</Label>
                            <Input
                              id="website"
                              value={companyData.website}
                              onChange={(e) =>
                                setCompanyData({
                                  ...companyData,
                                  website: e.target.value,
                                })
                              }
                              placeholder="https://yourcompany.com"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="w-full">
                          <h1 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-2">
                            {companyData.name}
                          </h1>
                          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-muted-foreground text-sm sm:text-base">
                            <div className="flex items-center gap-1">
                              <Globe className="w-4 h-4 flex-shrink-0" />
                              <a
                                href={companyData.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary transition-colors truncate"
                              >
                                {companyData.website}
                              </a>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{companyData.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{companyData.size}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              // Company Details 
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                    <CardDescription>
                      Basic information about your company
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      {isEditing ? (
                        <Input
                          id="industry"
                          value={companyData.industry}
                          onChange={(e) =>
                            setCompanyData({
                              ...companyData,
                              industry: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">
                          {companyData.industry}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="size">Company Size</Label>
                      {isEditing ? (
                        <Input
                          id="size"
                          value={companyData.size}
                          onChange={(e) =>
                            setCompanyData({
                              ...companyData,
                              size: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">
                          {companyData.size}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="founded">Founded</Label>
                      {isEditing ? (
                        <Input
                          id="founded"
                          value={companyData.founded}
                          onChange={(e) =>
                            setCompanyData({
                              ...companyData,
                              founded: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">
                          {companyData.founded}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="location">Location</Label>
                      {isEditing ? (
                        <Input
                          id="location"
                          value={companyData.location}
                          onChange={(e) =>
                            setCompanyData({
                              ...companyData,
                              location: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <p className="text-sm text-muted-foreground mt-1">
                          {companyData.location}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Company Description</CardTitle>
                    <CardDescription>
                      Tell candidates about your company
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <Textarea
                        value={companyData.description}
                        onChange={(e) =>
                          setCompanyData({
                            ...companyData,
                            description: e.target.value,
                          })
                        }
                        className="min-h-[200px]"
                        placeholder="Describe your company, culture, and what makes you unique..."
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {companyData.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              // Company Stats 
              <Card>
                <CardHeader>
                  <CardTitle>Company Statistics</CardTitle>
                  <CardDescription>
                    Your company's performance on the platform
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                    <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold">3</div>
                      <div className="text-xs sm:text-sm text-muted-foreground leading-tight">
                        Active Jobs
                      </div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold">286</div>
                      <div className="text-xs sm:text-sm text-muted-foreground leading-tight">
                        Total Views
                      </div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold">44</div>
                      <div className="text-xs sm:text-sm text-muted-foreground leading-tight">
                        Applications
                      </div>
                    </div>
                    <div className="text-center p-3 sm:p-4 bg-muted/50 rounded-lg">
                      <div className="text-xl sm:text-2xl font-bold">2</div>
                      <div className="text-xs sm:text-sm text-muted-foreground leading-tight">
                        Hires Made
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
    </EmployerLayout>
  );
  */
};

export default EmployerCompany;
