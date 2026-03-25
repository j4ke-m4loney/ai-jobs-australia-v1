import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import JDGenerator from '@/components/jd-generator/JDGenerator';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ArrowRight, CheckCircle2, Shield, FileText, Users } from 'lucide-react';
import { FAQ_CONTENT } from '@/lib/jd-generator/data';

export const metadata: Metadata = {
  title:
    'Free AI/ML Job Description Generator | Write Better JDs | AI Jobs Australia',
  description:
    'Free AI/ML job description generator for hiring managers. Generate structured JDs with bias detection, salary benchmarking, and quality checks. Tailored for Australian AI and ML roles.',
  keywords: [
    'AI job description generator',
    'ML job description',
    'write AI job description',
    'hiring AI engineer',
    'machine learning job posting',
    'data scientist job description',
    'AI hiring Australia',
    'job description template AI',
    'inclusive job description',
    'bias-free job posting',
  ],
  openGraph: {
    title: 'Free AI/ML Job Description Generator | AI Jobs Australia',
    description:
      'Generate structured AI/ML job descriptions with bias detection, salary benchmarking, and quality checks.',
    type: 'website',
  },
};

export default function JDGeneratorPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background">
        <div className="container max-w-6xl mx-auto px-4 pt-24 pb-16 md:py-24">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-block">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <FileText className="w-4 h-4" />
                Hiring Manager Tool
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              AI/ML Job Description Generator
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground">
              Generate structured, inclusive job descriptions for AI, Machine Learning,
              and Data Science roles. Get bias detection, salary benchmarking, and
              quality checks to attract the best candidates in Australia.
            </p>
          </div>
        </div>
      </section>

      {/* Main Tool */}
      <section className="py-0">
        <div className="container max-w-6xl mx-auto px-4">
          <JDGenerator />
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
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Bias Detection</h3>
                    <p className="text-sm text-muted-foreground">
                      Automatically flags gendered, ageist, and exclusionary language
                      with inclusive alternatives to attract a diverse candidate pool.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <CheckCircle2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Quality Checks</h3>
                    <p className="text-sm text-muted-foreground">
                      Validates requirement count, word length, salary transparency, and
                      structure against best practices for high-performing JDs.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Salary Benchmarking</h3>
                    <p className="text-sm text-muted-foreground">
                      Compare your salary range against Australian market data for the
                      role and seniority level to stay competitive.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What's Included */}
      <section className="py-12 bg-muted/30">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">What You Get</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A complete, ready-to-post job description with built-in quality assurance
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-background p-4 rounded-lg border text-center">
              <div className="text-2xl font-bold text-primary mb-1">10</div>
              <div className="font-medium">AI/ML Roles</div>
              <p className="text-xs text-muted-foreground mt-1">
                From MLE to Head of AI
              </p>
            </div>
            <div className="bg-background p-4 rounded-lg border text-center">
              <div className="text-2xl font-bold text-primary mb-1">6</div>
              <div className="font-medium">Seniority Levels</div>
              <p className="text-xs text-muted-foreground mt-1">
                Junior to Director
              </p>
            </div>
            <div className="bg-background p-4 rounded-lg border text-center">
              <div className="text-2xl font-bold text-primary mb-1">35+</div>
              <div className="font-medium">Technologies</div>
              <p className="text-xs text-muted-foreground mt-1">
                Select your tech stack
              </p>
            </div>
            <div className="bg-background p-4 rounded-lg border text-center">
              <div className="text-2xl font-bold text-primary mb-1">6</div>
              <div className="font-medium">Quality Checks</div>
              <p className="text-xs text-muted-foreground mt-1">
                Bias, length, salary & more
              </p>
            </div>
            <div className="bg-background p-4 rounded-lg border text-center">
              <div className="text-2xl font-bold text-primary mb-1">$</div>
              <div className="font-medium">Salary Benchmark</div>
              <p className="text-xs text-muted-foreground mt-1">
                Australian market data
              </p>
            </div>
            <div className="bg-background p-4 rounded-lg border text-center">
              <div className="text-2xl font-bold text-primary mb-1">1-Click</div>
              <div className="font-medium">Copy to Clipboard</div>
              <p className="text-xs text-muted-foreground mt-1">
                Ready to post anywhere
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary/80">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Post Your AI Role?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Post your AI, Machine Learning, or Data Science job to reach thousands of
            qualified candidates across Australia
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/post-a-job">
                Post a Job
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
              Tips for writing effective AI/ML job descriptions
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
            name: 'AI/ML Job Description Generator',
            description:
              'Free AI/ML job description generator for hiring managers in Australia',
            url: 'https://aijobsaustralia.com.au/tools/ai-ml-job-description-generator',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Any',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'AUD',
            },
            featureList: [
              'AI/ML job description generation',
              'Bias and exclusionary language detection',
              'Salary benchmarking against Australian market',
              'Quality checks for inclusive hiring',
              'Tech stack customisation',
              'One-click copy to clipboard',
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
