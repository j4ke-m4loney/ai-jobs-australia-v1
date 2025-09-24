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
  Search,
  UserCheck,
  Calendar,
  ArrowRight,
  Building2,
  Briefcase,
  Clock,
} from "lucide-react";
import EmployerHeader from "@/components/EmployerHeader";
import Footer from "@/components/Footer";

export default function HirePage() {

  const testimonials = [
    {
      name: "Sarah Chen",
      title: "Head of Talent, TechFlow AI",
      quote:
        "AI Jobs Australia helped us find 3 exceptional machine learning engineers in just 2 weeks. The quality of candidates is outstanding.",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face",
    },
  ];

  const companies = [
    { name: "Atlassian", description: "Scaled their AI team by 40%" },
    { name: "Canva", description: "Found 15+ AI specialists" },
    { name: "Afterpay", description: "Built entire ML engineering team" },
    { name: "REA Group", description: "Recruited senior AI architects" },
  ];

  const features = [
    {
      icon: Target,
      title: "Get more visibility",
      description:
        "Your jobs reach Australia&apos;s top AI talent through our specialized platform and targeted outreach.",
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
            🚀 For Employers
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
            Join 200+ Australian companies already hiring top AI talent
          </p>
        </div>
      </section>

      {/* Customer Testimonial */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-8">
              <div className="flex items-center gap-6">
                <img
                  src={testimonials[0].avatar}
                  alt={testimonials[0].name}
                  className="w-16 h-16 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                  </div>
                  <blockquote className="text-lg italic mb-3">
                    &quot;{testimonials[0].quote}&quot;
                  </blockquote>
                  <cite className="text-sm font-medium">
                    {testimonials[0].name}, {testimonials[0].title}
                  </cite>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">
            Trusted by Australia&apos;s leading tech companies
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {companies.map((company, index) => (
              <Card
                key={index}
                className="text-center p-6 hover:shadow-md transition-shadow"
              >
                <CardContent className="space-y-3">
                  <Building2 className="w-8 h-8 mx-auto text-primary" />
                  <h3 className="font-semibold text-lg">{company.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {company.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-muted/30">
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
            Join hundreds of Australian companies who have successfully hired AI
            talent through our platform.
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
