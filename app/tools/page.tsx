import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowRight,
  FileText,
  Wrench,
  Sparkles,
  TrendingUp,
  Calculator,
  MessageSquare,
  FileSearch,
  Search,
} from "lucide-react";

export const metadata: Metadata = {
  title:
    "Free AI Job Search Tools | Resume Analyser, Skills Gap Analyser & Salary Calculator | AI Jobs Australia",
  description:
    "Free tools to help you land your dream AI job in Australia. Resume keyword analyser, skills gap analyser, salary calculator, interview prep, and more career tools for AI, ML, and data science professionals.",
  keywords: [
    "AI job tools",
    "resume tools",
    "salary calculator",
    "ATS checker",
    "skills gap analyser",
    "AI jobs Australia",
    "career tools",
    "job search tools",
    "free resume tools",
  ],
  openGraph: {
    title: "Free AI Job Search Tools | AI Jobs Australia",
    description:
      "Free tools to optimise your job search. Resume analyser, salary calculator, and more for AI and ML professionals.",
    type: "website",
  },
};

const tools = [
  {
    title: "Resume Keyword Analyser",
    description:
      "Optimise your resume for AI and ML roles. Get instant feedback on keyword coverage, ATS compatibility, and actionable suggestions.",
    icon: FileText,
    href: "/tools/ai-jobs-resume-keyword-analyser",
    badge: "Popular",
    features: [
      "ATS compatibility check",
      "Keyword analysis",
      "Instant feedback",
      "100% private",
    ],
  },
  {
    title: "Job Description Decoder",
    description:
      "Paste any job description to extract required skills, experience level, salary hints, and spot potential red flags before you apply.",
    icon: FileSearch,
    href: "/tools/ai-job-description-decoder",
    badge: "New",
    features: [
      "Skills extraction",
      "Red flag detection",
      "Salary hints",
      "100% private",
    ],
  },
  {
    title: "AI/ML Salary Calculator",
    description:
      "Estimate salary ranges for AI and ML roles across Australia. Compare cities and see how your skills impact compensation.",
    icon: Calculator,
    href: "/tools/ai-ml-salary-calculator",
    badge: null,
    features: [
      "Location-based estimates",
      "Skill impact analysis",
      "City comparison",
      "100% private",
    ],
  },
  {
    title: "Interview Question Generator",
    description:
      "Practice interview questions tailored to your target AI/ML role. Get sample answers and tips for technical, behavioural, and system design rounds.",
    icon: MessageSquare,
    href: "/tools/ai-interview-question-generator",
    badge: null,
    features: [
      "Role-specific questions",
      "Sample answers & tips",
      "All interview stages",
      "100% private",
    ],
  },
  {
    title: "Skills Gap Analyser",
    description:
      "Compare your resume against job descriptions to identify matching skills, gaps, and get personalised learning recommendations to improve your fit.",
    icon: Search,
    href: "/tools/ai-skills-gap-analyser",
    badge: "New",
    features: [
      "Resume vs job comparison",
      "Gap identification",
      "Learning resources",
      "100% private",
    ],
  },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background">
        <div className="container max-w-6xl mx-auto px-4 pt-24 pb-16 md:py-24">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-block">
              <span className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Wrench className="w-4 h-4" />
                Career Tools
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Free Tools to Land Your Dream AI Job
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground">
              Free tools designed specifically for AI, Machine Learning, and
              Data Science professionals in Australia. Optimise your job search
              and stand out from the crowd.
            </p>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="py-16">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            {tools.map((tool, index) => {
              const Icon = tool.icon;
              return (
                <Card
                  key={index}
                  className="group hover:shadow-lg transition-shadow border-2 hover:border-primary/50"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      {tool.badge && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary text-white text-xs font-medium">
                          <Sparkles className="w-3 h-3" />
                          {tool.badge}
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-2xl mb-2">
                      {tool.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6">
                      {tool.description}
                    </p>

                    {tool.features && (
                      <ul className="space-y-2 mb-6">
                        {tool.features.map((feature, featureIndex) => (
                          <li
                            key={featureIndex}
                            className="flex items-center gap-2 text-sm"
                          >
                            <TrendingUp className="w-4 h-4 text-primary flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    )}

                    <Button asChild className="w-full group/btn">
                      <Link href={tool.href}>
                        Try it Free
                        <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary/80">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Find Your Next AI Role?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Discover hundreds of AI, Machine Learning, and Data Science
            opportunities across Australia
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/jobs">
                Browse AI Jobs
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/30"
              asChild
            >
              <Link href="/login">Create Free Profile</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Use Our Tools?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built specifically for AI and ML professionals in the Australian
              job market
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                AI-Specific Insights
              </h3>
              <p className="text-muted-foreground">
                Tools tailored for AI, ML, and data science roles with
                industry-specific keywords and requirements.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">100% Free</h3>
              <p className="text-muted-foreground">
                All our tools are completely free to use. No hidden costs, no
                credit card required.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Instant Results</h3>
              <p className="text-muted-foreground">
                Get immediate feedback and actionable insights to improve your
                job applications right away.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
