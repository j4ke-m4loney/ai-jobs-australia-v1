"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

import {
  Star,
  Users,
  Target,
  CheckCircle,
  UserCheck,
  Calendar,
  ArrowRight,
  Building2,
  Briefcase,
  Clock,
  TrendingUp,
  Code,
} from "lucide-react";
import EmployerHeader from "@/components/EmployerHeader";
import Footer from "@/components/Footer";

export default function HirePage() {
  // Platform stats - static values, update manually as platform grows
  const platformStats = {
    activeJobs: "50+",
    aiProfessionals: "1K+",
    weeklyApplications: "100+",
    companiesHiring: "30+",
  };

  const features = [
    {
      icon: Target,
      title: "Get more visibility",
      description:
        "Your jobs reach Australia's top AI talent through our specialized platform and targeted outreach.",
    },
    {
      icon: UserCheck,
      title: "Find quality applicants",
      description:
        "Access pre-screened candidates with verified AI/ML skills and experience in Australian companies.",
    },
    {
      icon: CheckCircle,
      title: "Verify abilities",
      description:
        "Review portfolios, GitHub profiles, and technical assessments to ensure the right fit.",
    },
    {
      icon: Users,
      title: "Organize candidates",
      description:
        "Manage applications with our intuitive dashboard and streamlined hiring workflow.",
    },
  ];

  const steps = [
    {
      number: "1",
      title: "Create account",
      description: "Set up your employer profile in under 2 minutes",
      icon: UserCheck,
    },
    {
      number: "2",
      title: "Build job post",
      description: "Use our guided form to create compelling job descriptions",
      icon: Briefcase,
    },
    {
      number: "3",
      title: "Post job",
      description: "Go live and start receiving qualified applications",
      icon: Calendar,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <EmployerHeader />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-6">
            For Employers
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
            Get started in minutes!
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Post your AI and machine learning jobs to Australia&apos;s
            fastest-growing tech talent community. Reach qualified candidates
            faster than ever.
          </p>

          <Link href="/post-job-login">
            <Button
              size="lg"
              className="bg-gradient-hero hover:opacity-90 text-white font-semibold px-8 py-6 text-lg"
            >
              Start Posting Jobs →
            </Button>
          </Link>

          <p className="text-sm text-muted-foreground mt-4">
            Post your job to Australia&apos;s AI talent community
          </p>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-8">
            Platform Overview
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Briefcase className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                <div className="text-sm text-muted-foreground mb-1">
                  Active AI Jobs
                </div>
                <div className="text-4xl font-bold">
                  {platformStats.activeJobs}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Users className="h-10 w-10 text-green-600 mx-auto mb-3" />
                <div className="text-sm text-muted-foreground mb-1">
                  AI Professionals
                </div>
                <div className="text-4xl font-bold">
                  {platformStats.aiProfessionals}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <TrendingUp className="h-10 w-10 text-purple-600 mx-auto mb-3" />
                <div className="text-sm text-muted-foreground mb-1">
                  Weekly Applications
                </div>
                <div className="text-4xl font-bold">
                  {platformStats.weeklyApplications}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Building2 className="h-10 w-10 text-orange-600 mx-auto mb-3" />
                <div className="text-sm text-muted-foreground mb-1">
                  Companies Hiring
                </div>
                <div className="text-4xl font-bold">
                  {platformStats.companiesHiring}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Why choose AI Jobs Australia?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to find and hire Australia&apos;s best AI and
              machine learning talent
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-md transition-shadow"
              >
                <CardContent className="space-y-4">
                  <feature.icon className="w-10 h-10 text-primary" />
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Who's Looking for AI Jobs */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Who&apos;s Looking for AI Jobs?
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Our platform attracts highly skilled professionals in Australia&apos;s
            AI and ML ecosystem
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Job Titles */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                Job Titles Seeking
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  Machine Learning Engineers
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  Data Scientists
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  AI Researchers
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  Data Engineers
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  MLOps Engineers
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  AI Product Managers
                </li>
              </ul>
            </div>

            {/* Industries */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                Industries They Come From
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  Technology & SaaS
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  Finance & Fintech
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  Healthcare & Biotech
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  E-commerce & Retail
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  Research & Academia
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  Consulting
                </li>
              </ul>
            </div>

            {/* Experience Levels */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Experience Levels
              </h3>
              <ul className="space-y-3 text-muted-foreground">
                <li>
                  <div className="flex justify-between mb-1">
                    <span>Junior (0-2 yrs)</span>
                    <span className="font-semibold">20%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: "20%" }}
                    />
                  </div>
                </li>
                <li>
                  <div className="flex justify-between mb-1">
                    <span>Mid (2-5 yrs)</span>
                    <span className="font-semibold">35%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: "35%" }}
                    />
                  </div>
                </li>
                <li>
                  <div className="flex justify-between mb-1">
                    <span>Senior (5-10 yrs)</span>
                    <span className="font-semibold">30%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: "30%" }}
                    />
                  </div>
                </li>
                <li>
                  <div className="flex justify-between mb-1">
                    <span>Lead (10+ yrs)</span>
                    <span className="font-semibold">15%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-500"
                      style={{ width: "15%" }}
                    />
                  </div>
                </li>
              </ul>
            </div>

            {/* Skills & Technologies */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Code className="h-5 w-5 text-orange-600" />
                Skills & Technologies
              </h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Python</Badge>
                <Badge variant="outline">TensorFlow</Badge>
                <Badge variant="outline">PyTorch</Badge>
                <Badge variant="outline">Deep Learning</Badge>
                <Badge variant="outline">NLP</Badge>
                <Badge variant="outline">Computer Vision</Badge>
                <Badge variant="outline">LLMs</Badge>
                <Badge variant="outline">Generative AI</Badge>
                <Badge variant="outline">MLOps</Badge>
                <Badge variant="outline">AWS</Badge>
                <Badge variant="outline">Azure</Badge>
                <Badge variant="outline">GCP</Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How it works</h2>
            <p className="text-lg text-muted-foreground">
              Get your job posting live in 3 simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto">
                  {step.number}
                </div>
                <step.icon className="w-8 h-8 text-primary mx-auto" />
                <h3 className="font-semibold text-lg">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
                {index < steps.length - 1 && (
                  <ArrowRight className="w-6 h-6 text-muted-foreground mx-auto mt-6 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Sponsored Jobs Info */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-2 border-primary/20">
            <CardContent className="p-8 text-center">
              <div className="space-y-6">
                <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold">
                  Boost your job&apos;s visibility
                </h2>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Premium job placements get 3x more visibility and reach the
                  top of search results. Perfect for senior roles and urgent
                  hiring needs.
                </p>
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Featured placement
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Priority support
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Enhanced analytics
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to find your next AI hire?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start reaching qualified AI candidates today.
          </p>
          <div className="space-y-4">
            <Link href="/post-job-login">
              <Button
                size="lg"
                className="bg-gradient-hero hover:opacity-90 text-white font-semibold px-8 py-6 text-lg"
              >
                Post Your First Job →
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground">
              <Clock className="w-4 h-4 inline mr-1" />
              Average setup time: 3 minutes
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
