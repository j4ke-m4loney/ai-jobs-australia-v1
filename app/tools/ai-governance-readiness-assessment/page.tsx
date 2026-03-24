import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GovernanceReadinessAssessment from '@/components/governance-readiness/GovernanceReadinessAssessment';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ArrowRight, CheckCircle2, Shield, Scale, BookOpen } from 'lucide-react';
import { FAQ_CONTENT } from '@/lib/governance-readiness/data';

export const metadata: Metadata = {
  title:
    'Free AI Governance Readiness Assessment | AI Ethics & Compliance | AI Jobs Australia',
  description:
    "Free AI governance readiness assessment for Australia. Score your experience against AI ethics frameworks, Australia's AI Ethics Principles, risk management, and compliance. Get personalised recommendations for AI governance roles.",
  keywords: [
    'AI governance',
    'AI ethics',
    'responsible AI',
    'AI compliance',
    'AI risk management',
    'AI governance jobs Australia',
    'AI ethics principles Australia',
    'AI policy',
    'AI auditor',
    'AI governance readiness',
    'mandatory AI guardrails',
    'ISO 42001',
  ],
  openGraph: {
    title: 'Free AI Governance Readiness Assessment | AI Jobs Australia',
    description:
      "Assess your readiness for AI governance roles. Score your experience against Australia's AI Ethics Principles, risk frameworks, and compliance requirements.",
    type: 'website',
  },
};

export default function GovernanceReadinessPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background">
        <div className="container max-w-6xl mx-auto px-4 pt-24 pb-16 md:py-24">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-block">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Shield className="w-4 h-4" />
                Governance Tool
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              AI Governance Readiness Assessment
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground">
              Assess your readiness for AI governance, ethics, and compliance roles in
              Australia. Get scored against key frameworks including Australia&apos;s AI
              Ethics Principles, with personalised recommendations to build your
              governance career.
            </p>
          </div>
        </div>
      </section>

      {/* Main Tool */}
      <section className="py-0">
        <div className="container max-w-6xl mx-auto px-4">
          <GovernanceReadinessAssessment />
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-background">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Australian Focus</h3>
                    <p className="text-sm text-muted-foreground">
                      Scored against Australia&apos;s AI Ethics Principles and upcoming
                      mandatory guardrails, plus international frameworks like OECD and
                      EU AI Act.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Scale className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">6 Key Dimensions</h3>
                    <p className="text-sm text-muted-foreground">
                      Assessed across frameworks, technical understanding, risk
                      management, compliance, stakeholder engagement, and implementation.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Learning Pathways</h3>
                    <p className="text-sm text-muted-foreground">
                      Get curated learning resources for each skill gap, from free
                      government frameworks to industry certifications.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What We Assess */}
      <section className="py-12 bg-muted/30">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">What We Assess</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your governance readiness is evaluated across six key dimensions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-background p-4 rounded-lg border text-center">
              <div className="text-2xl font-bold text-primary mb-1">25%</div>
              <div className="font-medium">Frameworks & Principles</div>
              <p className="text-xs text-muted-foreground mt-1">
                AI ethics frameworks & standards
              </p>
            </div>
            <div className="bg-background p-4 rounded-lg border text-center">
              <div className="text-2xl font-bold text-primary mb-1">20%</div>
              <div className="font-medium">Risk Assessment</div>
              <p className="text-xs text-muted-foreground mt-1">
                AI risk identification & mitigation
              </p>
            </div>
            <div className="bg-background p-4 rounded-lg border text-center">
              <div className="text-2xl font-bold text-primary mb-1">15%</div>
              <div className="font-medium">Technical Understanding</div>
              <p className="text-xs text-muted-foreground mt-1">
                Bias, explainability, AI safety
              </p>
            </div>
            <div className="bg-background p-4 rounded-lg border text-center">
              <div className="text-2xl font-bold text-primary mb-1">15%</div>
              <div className="font-medium">Compliance & Regulation</div>
              <p className="text-xs text-muted-foreground mt-1">
                Privacy, data protection, audit
              </p>
            </div>
            <div className="bg-background p-4 rounded-lg border text-center">
              <div className="text-2xl font-bold text-primary mb-1">15%</div>
              <div className="font-medium">Implementation</div>
              <p className="text-xs text-muted-foreground mt-1">
                Governance operations & tooling
              </p>
            </div>
            <div className="bg-background p-4 rounded-lg border text-center">
              <div className="text-2xl font-bold text-primary mb-1">10%</div>
              <div className="font-medium">Stakeholder Engagement</div>
              <p className="text-xs text-muted-foreground mt-1">
                Communication & policy writing
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary/80">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Land Your AI Governance Role?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Discover AI governance, ethics, and compliance roles across Australia
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
              <Link href="/tools">View All Tools</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about AI governance careers in Australia
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-4">
            {FAQ_CONTENT.map((faq, index) => (
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

      {/* Schema.org structured data - WebApplication */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'AI Governance Readiness Assessment',
            description:
              'Free AI governance readiness assessment for AI ethics and compliance roles in Australia',
            url: 'https://aijobsaustralia.com.au/tools/ai-governance-readiness-assessment',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Any',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'AUD',
            },
            featureList: [
              'AI governance readiness scoring',
              "Australia's AI Ethics Principles assessment",
              'Risk management evaluation',
              'Compliance knowledge check',
              'Role-specific analysis',
              'Learning resource recommendations',
              'Instant results',
            ],
          }),
        }}
      />

      {/* Schema.org structured data - FAQPage */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: FAQ_CONTENT.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: {
                '@type': 'Answer',
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
