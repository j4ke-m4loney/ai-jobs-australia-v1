"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Head from "next/head";
import {
  Building2,
  Globe,
  MapPin,
  Calendar,
  Briefcase,
  ArrowLeft,
  ExternalLink,
  Mail,
} from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Image from "next/image";

interface Company {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  created_at: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  location: string;
  location_type: string;
  job_type: string;
  salary_min: number | null;
  salary_max: number | null;
  is_featured: boolean;
  created_at: string;
  expires_at: string;
}

export default function CompanyProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [jobsLoading, setJobsLoading] = useState(true);

  const fetchCompanyData = useCallback(async () => {
    try {
      // Fetch company details
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .select("*")
        .eq("id", id)
        .single();

      if (companyError) throw companyError;
      setCompany(companyData);

      // Fetch company jobs
      const { data: jobsData, error: jobsError } = await supabase
        .from("jobs")
        .select("*")
        .eq("company_id", id)
        .eq("status", "approved")
        .order("is_featured", { ascending: false })
        .order("created_at", { ascending: false });

      if (jobsError) throw jobsError;
      setJobs(jobsData || []);
    } catch (error) {
      console.error("Error fetching company data:", error);
      toast.error("Company not found");
      router.push("/jobs");
    } finally {
      setLoading(false);
      setJobsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    if (!id) {
      router.push("/jobs");
      return;
    }
    fetchCompanyData();
  }, [id, router, fetchCompanyData]);

  const formatSalary = (min: number | null, max: number | null) => {
    if (!min && !max) return "Salary not specified";
    if (min && max)
      return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    return `Up to $${max?.toLocaleString()}`;
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === 0) return "Today";
    if (diffInDays === 1) return "Yesterday";
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        <div className="container mx-auto px-4 pt-20 pb-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading company profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Header />
        <div className="container mx-auto px-4 pt-20 pb-8 flex items-center justify-center">
          <div className="text-center">
            <Building2 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Company not found
            </h2>
            <p className="text-muted-foreground mb-6">
              The company you&apos;re looking for doesn&apos;t exist.
            </p>
            <Button onClick={() => router.push("/jobs")}>Browse Jobs</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <link rel="canonical" href={`https://www.aijobsaustralia.com.au/company/${id}`} />
      </Head>
      <div className="min-h-screen bg-gradient-subtle">
        <Header />

      <main className="container mx-auto px-4 pt-20 pb-8">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.push("/jobs")}
          className="mb-6 gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Button>

        {/* Company Header */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {company.logo_url ? (
                <Image
                  src={company.logo_url}
                  alt={`${company.name} logo`}
                  width={96}
                  height={96}
                  className="w-24 h-24 rounded-lg object-contain bg-white border"
                />
              ) : (
                <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center">
                  <Building2 className="w-12 h-12 text-muted-foreground" />
                </div>
              )}

              <div className="flex-1">
                <CardTitle className="text-3xl mb-3">{company.name}</CardTitle>

                <div className="flex flex-wrap items-center gap-4 mb-4">
                  {company.website && (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <Globe className="w-4 h-4" />
                      Visit Website
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Founded {new Date(company.created_at).getFullYear()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase className="w-4 h-4" />
                    <span>
                      {jobs.length.toLocaleString()} open{" "}
                      {jobs.length === 1 ? "position" : "positions"}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button className="gap-2">
                    <Mail className="w-4 h-4" />
                    Follow Company
                  </Button>
                  {/* <Button variant="outline" className="gap-2">
                    <Users className="w-4 h-4" />
                    View All Jobs
                  </Button> */}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Company Description */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>About {company.name}</CardTitle>
              </CardHeader>
              <CardContent>
                {company.description ? (
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {company.description}
                  </p>
                ) : (
                  <p className="text-muted-foreground italic">
                    No company description available.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Open Positions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Open Positions ({jobs.length.toLocaleString()})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {jobsLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                    ))}
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No open positions at this time.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <Card
                        key={job.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => router.push(`/jobs/${job.id}`)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {job.is_featured && (
                                  <Badge className="bg-gradient-hero text-white">
                                    Featured
                                  </Badge>
                                )}
                                <Badge variant="outline" className="capitalize">
                                  {job.job_type.replace("-", " ")}
                                </Badge>
                              </div>
                              <h3 className="font-semibold text-lg mb-2">
                                {job.title}
                              </h3>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {job.location} • {job.location_type}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {getTimeAgo(job.created_at)}
                                </div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">
                              View Job
                            </Button>
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                            {job.description.length > 120
                              ? `${job.description.substring(0, 120)}...`
                              : job.description}
                          </p>

                          {(job.salary_min || job.salary_max) && (
                            <div className="text-sm font-medium text-green-600">
                              {formatSalary(job.salary_min, job.salary_max)}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Company Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Open Jobs</span>
                  <span className="font-semibold">
                    {jobs.length.toLocaleString()}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Featured Jobs</span>
                  <span className="font-semibold">
                    {jobs.filter((job) => job.is_featured).length}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Company Since</span>
                  <span className="font-semibold">
                    {new Date(company.created_at).getFullYear()}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      </div>
    </>
  );
}
