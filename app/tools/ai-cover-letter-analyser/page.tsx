import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CoverLetterAnalyser from '@/components/cover-letter-analyser/CoverLetterAnalyser';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ArrowRight, CheckCircle2, TrendingUp, Shield, Target } from 'lucide-react';
import { FAQ_CONTENT } from '@/lib/cover-letter-analyser/data';

export const metadata: Metadata = {
  title:
    'Free AI Cover Letter Analyser | Optimise for ML & Data Science Roles | AI Jobs Australia',
  description:
    'Free cover letter analyser for AI and ML roles in Australia. Get instant feedback on structure, keywords, personalisation, and actionable tips to make your application stand out.',
  keywords: [
    'cover letter analyser',
    'AI cover letter',
    'ML cover letter',
    'cover letter tips',
    'AI jobs Australia',
    'machine learning jobs',
    'data science cover letter',
    'cover letter optimisation',
    'free cover letter tool',
  ],
  openGraph: {
    title: 'Free AI Cover Letter Analyser | AI Jobs Australia',
    description:
      'Analyse your cover letter for AI and ML roles. Get instant feedback on structure, keywords, and personalisation.',
    type: 'website',
  },
};

export default function CoverLetterAnalyserPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background">
        <div className="container max-w-6xl mx-auto px-4 pt-24 pb-16 md:py-24">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-block">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Target className="w-4 h-4" />
                Cover Letter Tool
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Free Cover Letter Analyser for AI Jobs
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground">
              Optimise your cover letter for AI, Machine Learning, and Data Science roles
              in Australia. Get instant feedback on structure, keywords, personalisation,
              and actionable tips to stand out.
            </p>
          </div>
        </div>
      </section>

      {/* Main Tool */}
      <section className="py-0">
        <div className="container max-w-6xl mx-auto px-4">
          <CoverLetterAnalyser />
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
                    <h3 className="font-semibold mb-2">Structure Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      Get feedback on your opening hook, body content, and closing
                      call-to-action to ensure your letter flows well.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">100% Private</h3>
                    <p className="text-sm text-muted-foreground">
                      All analysis happens in your browser. Your cover letter data
                      never leaves your device.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Red Flag Detection</h3>
                    <p className="text-sm text-muted-foreground">
                      Catch common mistakes like generic openings, weak language,
                      and missing personalisation before you hit send.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* What We Analyse */}
      <section className="py-12 bg-muted/30">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">What We Analyse</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our tool evaluates your cover letter across five key dimensions
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-background p-4 rounded-lg border text-center">
              <div className="text-2xl font-bold text-primary mb-1">20%</div>
              <div className="font-medium">Structure</div>
              <p className="text-xs text-muted-foreground mt-1">
                Opening, body, closing
              </p>
            </div>
            <div className="bg-background p-4 rounded-lg border text-center">
              <div className="text-2xl font-bold text-primary mb-1">25%</div>
              <div className="font-medium">Keywords</div>
              <p className="text-xs text-muted-foreground mt-1">
                AI/ML technical terms
              </p>
            </div>
            <div className="bg-background p-4 rounded-lg border text-center">
              <div className="text-2xl font-bold text-primary mb-1">20%</div>
              <div className="font-medium">Personalisation</div>
              <p className="text-xs text-muted-foreground mt-1">
                Company-specific content
              </p>
            </div>
            <div className="bg-background p-4 rounded-lg border text-center">
              <div className="text-2xl font-bold text-primary mb-1">15%</div>
              <div className="font-medium">Action Verbs</div>
              <p className="text-xs text-muted-foreground mt-1">
                Power words & impact
              </p>
            </div>
            <div className="bg-background p-4 rounded-lg border text-center">
              <div className="text-2xl font-bold text-primary mb-1">20%</div>
              <div className="font-medium">Length</div>
              <p className="text-xs text-muted-foreground mt-1">
                250-400 words optimal
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary/80">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Land Your Dream AI Job?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Discover hundreds of AI, Machine Learning, and Data Science roles across
            Australia
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
              Everything you need to know about writing a winning AI cover letter
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
            name: 'AI Cover Letter Analyser',
            description:
              'Free cover letter analyser for AI and ML jobs in Australia',
            url: 'https://aijobsaustralia.com.au/tools/ai-cover-letter-analyser',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Any',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'AUD',
            },
            featureList: [
              'Cover letter structure analysis',
              'AI/ML keyword suggestions',
              'Personalisation scoring',
              'Red flag detection',
              'Action verb analysis',
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
