"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  CheckCircle,
  UserCheck,
  Calendar,
  ArrowRight,
  Building2,
  Briefcase,
  Clock,
  TrendingUp,
  Code,
  X,
  Check,
  Home,
  Search,
  Mail,
  Target,
  ShieldCheck,
  DollarSign,
  Quote,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import EmployerHeader from "@/components/EmployerHeader";
import Footer from "@/components/Footer";
import { PostHogEmbed } from "@/components/hire/PostHogEmbed";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "How long does it take to post a job?",
    answer:
      "Listing go live within 12-24 hours after approval. Just create an account, fill in the job details, and pay — you'll be emailed as soon as your job is live.",
  },
  {
    question: "How long does my job listing stay active?",
    answer:
      "All listings (Standard and Featured) run for 30 days from the date of posting.",
  },
  {
    question: "Can I edit my job post after it's live?",
    answer:
      "Yes, you can update your job title, description, and other details at any time from your employer dashboard.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major credit and debit cards (Visa, Mastercard, Amex) via Stripe. All payments are processed securely.",
  },
  {
    question: "What's the difference between Standard and Featured?",
    answer:
      "Standard ($99) gives you a 30-day listing that appears in search results. Featured ($299) adds homepage placement, top search positioning, inclusion in our weekly newsletter, social media promotion, and priority support — typically delivering 3x more visibility.",
  },
  {
    question: "How many applicants can I expect?",
    answer:
      "This varies by role, location, and seniority. You can see our real-time apply click data above to get a sense of platform engagement. Featured listings typically receive significantly more applications than Standard.",
  },
  {
    question: "What kind of candidates use AI Jobs Australia?",
    answer:
      "Our audience includes machine learning engineers, data scientists, AI researchers, data engineers, MLOps engineers, and AI product managers across all experience levels — from junior to lead.",
  },
  {
    question: "Is AI Jobs Australia only for Australian roles?",
    answer:
      "Yes. We're focused exclusively on the Australian AI and machine learning job market, which means your listing reaches a highly targeted local audience.",
  },
  {
    question: "Do you screen or verify candidates?",
    answer:
      "We don't screen candidates directly. We provide the platform for employers to receive applications and manage their hiring process. All applications come directly to you.",
  },
  {
    question: "Can I get a refund if I don't receive any applications?",
    answer:
      "We don't offer refunds as job visibility begins immediately upon posting. However, if you're not seeing the results you expected, we'll work with you to optimise your listing at no extra cost — just email us at hello@aijobsaustralia.com.au.",
  },
  {
    question: "Do you offer bulk or enterprise pricing?",
    answer:
      "Yes! Our Enterprise Unlimited plan gives you unlimited job postings with all Featured benefits, a dedicated account manager, and custom branding. Email us at hello@aijobsaustralia.com.au for a quote.",
  },
  {
    question: "Can I promote multiple roles at once?",
    answer:
      "Absolutely. Each role is posted as a separate listing. If you're hiring for multiple positions, our Enterprise plan may be the most cost-effective option.",
  },
];

export default function HirePage() {
  const posthogVisitorsUrl =
    process.env.NEXT_PUBLIC_POSTHOG_EMBED_VISITORS || "";
  const posthogApplyClicksUrl =
    process.env.NEXT_PUBLIC_POSTHOG_EMBED_APPLY_CLICKS || "";

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

      {/* 1. Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge variant="secondary" className="mb-6">
            For Employers
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
            Hire Australia&apos;s Best AI Talent!
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Reach AI professionals in all fields actively looking for their next
            role
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/post-job-login">
              <Button
                size="lg"
                className="bg-gradient-hero hover:opacity-90 text-white font-semibold px-8 py-6 text-lg"
              >
                Post a Job <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="mailto:hello@aijobsaustralia.com.au">
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
                <Mail className="mr-2 h-5 w-5" />
                Prefer to chat first? Email us
              </Button>
            </a>
          </div>

          <p className="text-sm text-muted-foreground mt-6">
            Take only 2-3 Minutes to post your job!
          </p>
        </div>
      </section>

      {/* 2. "Why AJA" Trust Strip */}
      <section className="py-10 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center text-center md:flex-row md:items-start md:text-left gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Target className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Niche Audience</h3>
                <p className="text-sm text-muted-foreground">
                  100% AI &amp; ML focused — no generic job board noise
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center md:flex-row md:items-start md:text-left gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Risk-Free</h3>
                <p className="text-sm text-muted-foreground">
                  Not seeing results? We&apos;ll optimise your listing at no
                  extra cost
                </p>
              </div>
            </div>
            <div className="flex flex-col items-center text-center md:flex-row md:items-start md:text-left gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Affordable</h3>
                <p className="text-sm text-muted-foreground">
                  From $99 — a fraction of other major job boards
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PostHog Live Analytics Embeds */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">
              Real-Time Platform Activity
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Live data from our analytics — see the traffic and engagement your
              job posts will receive.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
            <PostHogEmbed
              title="Job Seeker Traffic"
              description="Live data of active jobs seekers on AI Jobs Australia"
              iframeSrc={posthogVisitorsUrl}
              height={400}
            />
            <PostHogEmbed
              title="Application Activity"
              description="Live apply clicks across all listings on AI Jobs Australia"
              iframeSrc={posthogApplyClicksUrl}
              height={400}
            />
          </div>
        </div>
      </section>

      {/* Employer Testimonial */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-3xl text-center">
          <Quote className="h-10 w-10 text-primary/30 mx-auto mb-6" />
          <blockquote className="text-xl md:text-2xl font-medium italic mb-6">
            &ldquo;The benefit was we received highly relevant applicants within
            2 weeks. I think the niche focus meant we weren&apos;t sifting
            through hundreds of unqualified resumes.&rdquo;
          </blockquote>
          <p className="font-semibold">— Manager, Sydney AI Startup</p>
        </div>
      </section>

      {/* 4. Audience Profile — "Your Talent Pool" */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">
            Your Talent Pool
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            Here&apos;s who you&apos;ll reach — highly skilled AI and ML
            professionals across Australia, actively searching for their next
            opportunity.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Job Titles */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                Roles They&apos;re Seeking
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                {[
                  "Machine Learning Engineers",
                  "AI Engineers",
                  "Data Scientists",
                  "Data Engineers",
                  "AI Researchers",
                  "AI Analysts",
                  "MLOps Engineers",
                  "AI Product Managers",
                  "And more...",
                ].map((title) => (
                  <li key={title} className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    {title}
                  </li>
                ))}
              </ul>
            </div>

            {/* Industries */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                Industries They Come From
              </h3>
              <ul className="space-y-2 text-muted-foreground">
                {[
                  "Technology & SaaS",
                  "Mining & Resources",
                  "Finance & Fintech",
                  "Insurance",
                  "Government & Defence",
                  "Healthcare & Biotech",
                  "E-commerce & Retail",
                  "Research & Academia",
                  "And more...",
                ].map((industry) => (
                  <li key={industry} className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    {industry}
                  </li>
                ))}
              </ul>
            </div>

            {/* Experience Levels */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Experience Levels
              </h3>
              <ul className="space-y-3 text-muted-foreground">
                {[
                  { label: "Junior (0-2 yrs)", pct: 20 },
                  { label: "Mid (2-5 yrs)", pct: 35 },
                  { label: "Senior (5-10 yrs)", pct: 30 },
                  { label: "Lead (10+ yrs)", pct: 15 },
                ].map((level) => (
                  <li key={level.label}>
                    <div className="flex justify-between mb-1">
                      <span>{level.label}</span>
                      <span className="font-semibold">{level.pct}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${level.pct}%` }}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Skills & Technologies */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Code className="h-5 w-5 text-orange-600" />
                Skills &amp; Technologies
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "Python",
                  "TensorFlow",
                  "PyTorch",
                  "Scikit-learn",
                  "Deep Learning",
                  "NLP",
                  "Computer Vision",
                  "LLMs",
                  "Generative AI",
                  "RAG",
                  "Hugging Face",
                  "LangChain",
                  "Prompt Engineering",
                  "Transformers",
                  "Reinforcement Learning",
                  "MLOps",
                  "Kubernetes",
                  "Docker",
                  "Spark",
                  "SQL",
                  "R",
                  "Databricks",
                  "Snowflake",
                  "dbt",
                  "Airflow",
                  "SageMaker",
                  "Vertex AI",
                  "AWS",
                  "Azure",
                  "GCP",
                  "And many more...",
                ].map((skill) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Featured vs Standard Comparison */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">
              Standard vs Featured Posts
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See what you get with a Featured listing, maximum visibility for
              your most important roles.
            </p>
          </div>

          {/* Part A — Feature comparison */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
            {/* Standard Card */}
            <Card>
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl">Standard</CardTitle>
                <div className="text-3xl font-bold">$99</div>
                <p className="text-sm text-muted-foreground">30-day listing</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    { feature: "30-day listing", included: true },
                    { feature: "Appears in search results", included: true },
                    { feature: "Homepage featured section", included: false },
                    { feature: "Newsletter inclusion", included: false },
                    { feature: "Social media promotion", included: false },
                    { feature: "Priority support", included: false },
                  ].map((item) => (
                    <li key={item.feature} className="flex items-center gap-2">
                      {item.included ? (
                        <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground/40 flex-shrink-0" />
                      )}
                      <span
                        className={cn(
                          "text-sm",
                          !item.included && "text-muted-foreground/60",
                        )}
                      >
                        {item.feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Featured Card */}
            <Card className="ring-2 ring-primary relative">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                Recommended
              </Badge>
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl">Featured</CardTitle>
                <div className="text-3xl font-bold">$299</div>
                <p className="text-sm text-muted-foreground">
                  30-day featured listing
                </p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {[
                    { feature: "3x more visibility", included: true },
                    { feature: "30-day listing", included: true },
                    {
                      feature: "Appears in search results (top position)",
                      included: true,
                    },
                    { feature: "Homepage featured section", included: true },
                    { feature: "Newsletter inclusion", included: true },
                    { feature: "Social media promotion", included: true },
                    { feature: "Priority support", included: true },
                  ].map((item) => (
                    <li key={item.feature} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm">{item.feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Part B — Where Featured Jobs Appear */}
          <div className="max-w-4xl mx-auto">
            <h3 className="text-xl font-semibold text-center mb-6">
              Where{" "}
              <span className="underline decoration-wavy decoration-primary decoration-2 underline-offset-4">
                Featured
              </span>{" "}
              Jobs Appear
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="text-center">
                <CardContent className="p-6">
                  <Home className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Homepage</h4>
                  <p className="text-sm text-muted-foreground">
                    Pinned in the Featured Jobs section, the first thing
                    visitors see.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Search className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Search Results</h4>
                  <p className="text-sm text-muted-foreground">
                    Appears at the top of results with a featured badge.
                  </p>
                </CardContent>
              </Card>
              <Card className="text-center">
                <CardContent className="p-6">
                  <Mail className="h-10 w-10 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold mb-2">Newsletter</h4>
                  <p className="text-sm text-muted-foreground">
                    Featured in our weekly email to AI professionals.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* SEEK/LinkedIn comparison */}
          <p className="text-center text-muted-foreground text-sm mt-10 max-w-2xl mx-auto">
            Compared to other broad job boards, AI Jobs Australia gives you
            direct access to a niche AI audience — at a fraction of the cost.
          </p>
        </div>
      </section>

      {/* 7. How It Works */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">How It Works</h2>
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

      {/* 9. FAQ Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Common questions from employers about posting on AI Jobs Australia
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-background border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* 9. Final CTA + Chat */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to hire Australia&apos;s next AI star?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start reaching qualified AI candidates today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/post-job-login">
              <Button
                size="lg"
                className="bg-gradient-hero hover:opacity-90 text-white font-semibold px-8 py-6 text-lg"
              >
                Post a Job <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <a href="mailto:hello@aijobsaustralia.com.au">
              <Button variant="outline" size="lg" className="px-8 py-6 text-lg">
                <Mail className="mr-2 h-5 w-5" />
                Questions? Email Us
              </Button>
            </a>
          </div>
          <p className="text-sm text-muted-foreground mt-6">
            <Clock className="w-4 h-4 inline mr-1" />
            Average setup time: 3 minutes
          </p>
        </div>
      </section>

      {/* FAQPage Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((faq) => ({
              "@type": "Question",
              name: faq.question,
              acceptedAnswer: {
                "@type": "Answer",
                text: faq.answer,
              },
            })),
          }),
        }}
      />

      <Footer />
    </div>
  );
}
