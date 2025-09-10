"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Search,
  MapPin,
  Building,
  Clock,
  TrendingUp,
  Users,
  Star,
  ArrowRight,
  CheckCircle,
  Zap,
  Shield,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const router = useRouter();
  const { user } = useAuth();

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append("search", searchTerm);
    if (location) params.append("location", location);
    router.push(`/jobs?${params.toString()}`);
  };

  const handleJobClick = (jobId: number) => {
    if (!user) {
      router.push("/auth");
      return;
    }
    // If authenticated, navigate to job details
    router.push(`/jobs/${jobId}`);
  };

  const featuredJobs = [
    {
      id: 1,
      title: "Senior Machine Learning Engineer",
      company: "AI Innovations",
      location: "Sydney, NSW",
      salary: "$120,000 - $150,000",
      type: "Full-time",
      posted: "2 days ago",
      skills: ["Python", "TensorFlow", "AWS"],
    },
    {
      id: 2,
      title: "Data Scientist",
      company: "Tech Solutions",
      location: "Melbourne, VIC",
      salary: "$100,000 - $130,000",
      type: "Full-time",
      posted: "1 week ago",
      skills: ["R", "SQL", "Python"],
    },
    {
      id: 3,
      title: "AI Product Manager",
      company: "Future Labs",
      location: "Brisbane, QLD",
      salary: "$110,000 - $140,000",
      type: "Full-time",
      posted: "3 days ago",
      skills: ["Product Strategy", "Agile", "AI/ML"],
    },
  ];

  const categories = [
    { name: "Machine Learning", count: 45, icon: TrendingUp },
    { name: "Data Science", count: 32, icon: Users },
    { name: "AI Research", count: 18, icon: Star },
    { name: "Computer Vision", count: 24, icon: Building },
  ];

  const howItWorksSteps = [
    {
      step: "1",
      title: "Create Your Profile",
      description:
        "Build a compelling profile showcasing your AI/ML skills and experience with our smart profile builder",
      icon: Users,
    },
    {
      step: "2",
      title: "Search & Apply",
      description:
        "Browse curated AI jobs and apply with one click using your profile",
      icon: Search,
    },
    {
      step: "3",
      title: "Get Hired Fast",
      description:
        "Connect with top Australian companies and land your dream AI role",
      icon: CheckCircle,
    },
  ];

  const topCompanies = [
    { name: "Google", logo: "🔍", jobs: 12 },
    { name: "Microsoft", logo: "💻", jobs: 8 },
    { name: "Atlassian", logo: "🔵", jobs: 15 },
    { name: "Canva", logo: "🎨", jobs: 6 },
    { name: "Xero", logo: "💚", jobs: 4 },
    { name: "Salesforce", logo: "☁️", jobs: 9 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* Hero Search Section */}
        <section className="pt-20 pb-16 bg-gradient-to-br from-background via-muted/30 to-primary-light/20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="pt-10 text-4xl md:text-6xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
                Find Your Dream AI Job
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Discover the latest opportunities in Artificial Intelligence,
                Machine Learning, and Data Science across Australia.
              </p>

              {/* Search Form */}
              <div className="bg-card rounded-2xl p-6 shadow-xl border-4 border-border/50 mb-12">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      placeholder="Job title, keywords, or company"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 h-12 text-base border-primary/50"
                    />
                  </div>
                  <div className="flex-1 relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                    <Input
                      placeholder="City, state, or remote"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="pl-10 h-12 text-base border-primary/50"
                    />
                  </div>
                  <Button
                    onClick={handleSearch}
                    size="lg"
                    className="h-12 px-8"
                  >
                    Search Jobs
                  </Button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    150+
                  </div>
                  <div className="text-muted-foreground">Active Jobs</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent mb-2">50+</div>
                  <div className="text-muted-foreground">Companies</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-success mb-2">
                    1000+
                  </div>
                  <div className="text-muted-foreground">Job Seekers</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Job Categories */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-foreground text-3xl font-bold text-center mb-12">
              Browse by Category
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <Card
                    key={category.name}
                    className="!shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group"
                  >
                    <CardContent className="p-6 text-center">
                      <Icon className="w-12 h-12 text-primary mx-auto mb-4 group-hover:scale-110 transition-transform" />
                      <h3 className="font-semibold mb-2">{category.name}</h3>
                      <p className="text-muted-foreground">
                        {category.count} jobs available
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Jobs */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h2 className="text-foreground text-3xl font-bold mb-3">
                  Featured Jobs
                </h2>
                <p className="text-xl text-muted-foreground leading-relaxed">
                  Roles from Australia's most innovative companies
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() =>
                  user ? router.push("/jobs") : router.push("/login")
                }
                className="gap-2 shadow-lg"
              >
                View All Jobs
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.map((job) => (
                <Card
                  key={job.id}
                  className="!shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer"
                  onClick={() => handleJobClick(job.id)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline">{job.type}</Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {job.posted}
                      </span>
                    </div>
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building className="w-4 h-4" />
                      <span>{job.company}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{job.location}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-semibold text-primary mb-3">
                      {job.salary}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {job.skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="text-xs"
                        >
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold mb-4">
                Your AI Career Journey
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                From profile creation to your first day - we're with you every
                step of the way
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {howItWorksSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.step}
                    className="text-center group"
                    style={{ animationDelay: `${index * 0.3}s` }}
                  >
                    <div className="relative mb-8">
                      <div className="w-20 h-20 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-all duration-500 shadow-lg">
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent rounded-full flex items-center justify-center text-white font-bold text-sm animate-bounce">
                        {step.step}
                      </div>
                      {index < howItWorksSteps.length - 1 && (
                        <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-primary to-accent opacity-30"></div>
                      )}
                    </div>
                    <h3 className="text-2xl font-semibold mb-4 group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Top Companies */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-foreground text-3xl font-bold mb-4">
                Top Companies Hiring
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Join thousands of professionals working at Australia's leading
                tech companies.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
              {topCompanies.map((company) => (
                <Card
                  key={company.name}
                  className="!shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer group p-6"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                      {company.logo}
                    </div>
                    <h3 className="font-semibold mb-2">{company.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {company.jobs} open roles
                    </p>
                  </div>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() =>
                  user ? router.push("/jobs") : router.push("/login")
                }
                className="gap-2"
              >
                <Building className="w-5 h-5" />
                View All Companies
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Final CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
              Ready to Shape Australia's AI Future?
            </h2>
            <p className="text-xl text-foreground mb-12 leading-relaxed">
              Join thousands of AI professionals who have already discovered
              their dream careers. Your next breakthrough is just one click
              away.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Button
                size="lg"
                className="h-16 px-12 text-lg bg-gradient-hero hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                onClick={() =>
                  user
                    ? router.push("/jobseeker/dashboard")
                    : router.push("/auth/jobseeker")
                }
              >
                <Zap className="w-6 h-6 mr-3" />
                Start Your AI Journey
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="h-16 px-12 text-lg hover:bg-primary hover:text-primary-foreground transition-all duration-300 transform hover:scale-105"
                onClick={() =>
                  user ? router.push("/hire") : router.push("/hire")
                }
              >
                <Users className="w-6 h-6 mr-3" />
                Hire AI Talent
              </Button>
            </div>

            <p className="text-sm text-muted-foreground mt-8">
              Join our community of <strong>1,000+</strong> AI professionals and{" "}
              <strong>150+</strong> innovative companies
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
