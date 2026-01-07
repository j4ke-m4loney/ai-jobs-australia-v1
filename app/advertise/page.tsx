"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Users,
  Target,
  TrendingUp,
  Globe,
  Briefcase,
  Zap,
  Star,
  Eye,
  CheckCircle,
  Building2,
  Code,
} from "lucide-react";

interface Stats {
  subscribers: number;
  openRate: number;
  topLocations: Array<{ name: string; percentage: number }>;
}

export default function AdvertisePage() {
  const [stats, setStats] = useState<Stats>({
    subscribers: 0,
    openRate: 0,
    topLocations: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/advertise/stats");
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K+`;
    }
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header />

      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-6xl mx-auto space-y-16">
          {/* Hero Section */}
          <section className="text-center space-y-6 py-12">
            <Badge className="mx-auto" variant="secondary">
              Partner with Australia&apos;s #1 AI Jobs Platform
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900">
              Reach Australia&apos;s Top
              <br />
              AI & ML Talent
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Australia&apos;s growing newsletter for AI developers, data
              scientists, and ML engineers.
              <br /> Read by hundreds of Australian professionals per week.
            </p>
            <Button
              size="lg"
              className="text-lg px-8 py-6"
              onClick={() =>
                (window.location.href =
                  "mailto:jake@aijobsaustralia.com.au?subject=Newsletter%20Advertising%20Inquiry")
              }
            >
              <Mail className="mr-2 h-5 w-5" />
              Get in Touch
            </Button>
          </section>

          {/* Stats Grid */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-8">
              Newsletter Performance
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Subscribers Card */}
              <Card>
                <CardContent className="p-6">
                  <Users className="h-12 w-12 text-blue-600 mb-4" />
                  <div className="text-sm text-muted-foreground mb-2">
                    Subscribers
                  </div>
                  <div className="text-5xl font-bold">
                    {loading ? "..." : formatNumber(stats.subscribers)}
                  </div>
                </CardContent>
              </Card>

              {/* Open Rate Card */}
              <Card>
                <CardContent className="p-6">
                  <TrendingUp className="h-12 w-12 text-green-600 mb-4" />
                  <div className="text-sm text-muted-foreground mb-2">
                    Open rate
                  </div>
                  <div className="text-5xl font-bold">
                    {loading ? "..." : `${stats.openRate}%`}
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Industry avg: 20-30%
                  </div>
                </CardContent>
              </Card>

              {/* Top Locations Card */}
              <Card>
                <CardContent className="p-6">
                  <Globe className="h-12 w-12 text-purple-600 mb-4" />
                  <div className="text-sm text-muted-foreground mb-3">
                    Top locations
                  </div>
                  {loading ? (
                    <div>Loading...</div>
                  ) : (
                    <div className="space-y-2">
                      {stats.topLocations.slice(0, 3).map((loc) => (
                        <div key={loc.name} className="flex items-center gap-2">
                          <div className="flex-1">
                            <div className="text-xs mb-1">{loc.name}</div>
                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-purple-500"
                                style={{ width: `${loc.percentage}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-xs font-semibold">
                            {loc.percentage}%
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Reader Profile Card */}
              <Card>
                <CardContent className="p-6">
                  <Briefcase className="h-12 w-12 text-orange-600 mb-4" />
                  <div className="text-sm text-muted-foreground mb-3">
                    Reader profile
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">AI developers</Badge>
                    <Badge variant="secondary">ML engineers</Badge>
                    <Badge variant="secondary">Data scientists</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Why Advertise Section */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-4">
              Why Advertise with AI Jobs Australia?
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Position your brand in front of Australia&apos;s most engaged AI and
              ML professionals
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardContent className="p-6">
                  <Target className="h-10 w-10 text-blue-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    Targeted Audience
                  </h3>
                  <p className="text-gray-600">
                    Get in the inbox of AI/ML professionals in Australia. No
                    wasted impressions.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <Zap className="h-10 w-10 text-green-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    High Engagement
                  </h3>
                  <p className="text-gray-600">
                    {stats.openRate}% open rate compared to industry average of
                    20-30%. Your message gets seen.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <Star className="h-10 w-10 text-purple-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    Premium Placements
                  </h3>
                  <p className="text-gray-600">
                    Featured position in our newsletter with logo, headline, and
                    dedicated content section.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <Eye className="h-10 w-10 text-orange-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">
                    Brand Visibility
                  </h3>
                  <p className="text-gray-600">
                    Multiple touchpoints: header logo, main card placement, and
                    footer mentions in every newsletter.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Who Reads Section */}
          <section>
            <h2 className="text-3xl font-bold text-center mb-4">
              Who Reads Our Newsletter?
            </h2>
            <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
              Our subscribers are highly skilled professionals in Australia&apos;s
              AI and ML ecosystem
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Job Titles */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-blue-600" />
                  Job Titles
                </h3>
                <ul className="space-y-2 text-gray-600">
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
                  Industries
                </h3>
                <ul className="space-y-2 text-gray-600">
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
                <ul className="space-y-2 text-gray-600">
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

              {/* Skills & Interests */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Code className="h-5 w-5 text-orange-600" />
                  Skills & Interests
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
          </section>

          {/* Advertising Options */}
          <section className="bg-blue-50 rounded-lg p-8 md:p-12">
            <h2 className="text-3xl font-bold text-center mb-4">
              Advertising Options
            </h2>
            <p className="text-center text-gray-600 mb-6 max-w-2xl mx-auto">
              We&apos;re offering various sponsorship packages to suit your needs,
              from featured placements to recurring newsletter sponsorships for
              this growing community.
            </p>
            <p className="text-center text-gray-600 max-w-2xl mx-auto">
              Contact us to discuss custom packages and pricing tailored to your
              goals.
            </p>
          </section>

          {/* Final CTA */}
          <section className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-12 text-center text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Interested to Learn More?
            </h2>
            <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
              Get in touch to discuss how we can help you connect with
              Australia&apos;s leading AI and ML professionals.
            </p>
            <Button
              size="lg"
              variant="secondary"
              className="text-lg px-8 py-6"
              onClick={() =>
                (window.location.href =
                  "mailto:jake@aijobsaustralia.com.au?subject=Newsletter%20Advertising%20Inquiry&body=Hi%20Jake,%0D%0A%0D%0AI'm%20interested%20in%20advertising%20with%20AI%20Jobs%20Australia.%0D%0A%0D%0A")
              }
            >
              <Mail className="mr-2 h-5 w-5" />
              Contact Us
            </Button>
            {/* <p className="mt-6 text-sm text-blue-100">
              Or email us directly at{" "}
              <a
                href="mailto:jake@aijobsaustralia.com.au"
                className="underline hover:text-white"
              >
                jake@aijobsaustralia.com.au
              </a>
            </p> */}
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
