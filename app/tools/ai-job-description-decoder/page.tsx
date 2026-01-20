import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JobDecoder from "@/components/job-decoder/JobDecoder";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight,
  FileSearch,
  Shield,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title:
    "Free AI Job Description Decoder | Analyse Tech Job Postings | AI Jobs Australia",
  description:
    "Free tool to decode and analyse AI job descriptions. Extract required skills, experience level, salary hints, and spot red flags in job postings. Make informed decisions about your next AI role in Australia.",
  keywords: [
    "job description decoder",
    "job posting analyser",
    "AI job analysis",
    "tech job red flags",
    "job requirements extractor",
    "salary hints",
    "job posting decoder",
    "AI jobs Australia",
    "ML job analysis",
  ],
  openGraph: {
    title: "Free AI Job Description Decoder | AI Jobs Australia",
    description:
      "Decode job descriptions instantly. Extract skills, spot red flags, and understand what employers really want.",
    type: "website",
  },
};

const faqs = [
  {
    question: "How does the job description decoder work?",
    answer:
      "Our decoder analyses the text of job postings to identify key information: required and nice-to-have skills, experience level, salary hints, benefits, and potential red flags. It uses pattern matching to extract insights that help you understand what employers are really looking for.",
  },
  {
    question: "What are job description red flags?",
    answer:
      "Red flags are phrases or patterns in job postings that may indicate potential issues like unrealistic expectations, poor work-life balance, or unclear role definitions. Examples include terms like 'rockstar', 'wear many hats', 'fast-paced environment', or 'we're a family'. These aren't always negative, but they're worth asking about.",
  },
  {
    question: "Is my data safe when I paste a job description?",
    answer:
      "Yes, absolutely! All analysis happens locally in your browser. The job description you paste is never sent to our servers or stored anywhere. Your data never leaves your device.",
  },
  {
    question: "How accurate is the skills detection?",
    answer:
      "Our decoder recognises 50+ technical skills commonly found in AI/ML job postings, including programming languages, frameworks, cloud platforms, and soft skills. It also distinguishes between required skills and nice-to-haves based on context clues in the job description.",
  },
  {
    question: "What does the overall score mean?",
    answer:
      "The score (0-100) is a quick indicator of how well the job posting communicates the role. Higher scores indicate clear requirements, good benefits, and fewer red flags. Lower scores suggest you may need to ask more clarifying questions during the interview process.",
  },
  {
    question: "Can this tool detect salary information?",
    answer:
      "The decoder identifies salary-related hints like 'competitive salary', actual salary ranges if mentioned, equity/stock options, and bonus structures. If no salary information is found, it will let you know so you can ask directly.",
  },
  {
    question: "Should I avoid jobs with red flags?",
    answer:
      "Not necessarily. Red flags are indicators worth investigating, not automatic deal-breakers. Some 'red flags' like 'fast-paced' might be perfectly fine for you. Use them as conversation starters in interviews to understand the actual work environment.",
  },
  {
    question: "How do I use this with the other tools?",
    answer:
      "After decoding a job description, use our Resume Keyword Analyser to check if your resume includes the required skills, our Salary Calculator to estimate fair compensation, and our Interview Question Generator to prepare for the interview.",
  },
];

export default function JobDescriptionDecoderPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background">
        <div className="container max-w-6xl mx-auto px-4 pt-24 pb-16 md:py-24">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-block">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <FileSearch className="w-4 h-4" />
                Job Analysis Tool
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              AI Job Description Decoder
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground">
              Paste any AI or tech job description and instantly extract key
              information. Identify required skills, experience level, salary
              hints, and potential red flags before you apply.
            </p>
          </div>
        </div>
      </section>

      {/* Main Tool */}
      <section className="py-0">
        <div className="container max-w-6xl mx-auto px-4">
          <JobDecoder />
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
                    <h3 className="font-semibold mb-2">Skills Extraction</h3>
                    <p className="text-sm text-muted-foreground">
                      Automatically identifies required and nice-to-have skills
                      from technical jargon in job postings.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Red Flag Detection</h3>
                    <p className="text-sm text-muted-foreground">
                      Spots common warning signs like unrealistic expectations,
                      vague roles, or work-life balance concerns.
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
                      All analysis happens in your browser. Job descriptions
                      you paste never leave your device.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary/80">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Found a Role That Looks Good?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Check your resume matches the requirements and prepare for the
            interview with our other free tools
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/tools/ai-jobs-resume-keyword-analyser">
                Check Your Resume
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/30"
              asChild
            >
              <Link href="/tools/ai-interview-question-generator">
                Prepare for Interview
              </Link>
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
              Everything you need to know about decoding job descriptions
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

      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "AI Job Description Decoder",
            description:
              "Free tool to analyse and decode AI job descriptions in Australia",
            url: "https://aijobsaustralia.com.au/tools/ai-job-description-decoder",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Any",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "AUD",
            },
            featureList: [
              "Skills extraction",
              "Experience level detection",
              "Salary hints identification",
              "Red flag detection",
              "Benefits analysis",
              "Instant results",
            ],
          }),
        }}
      />

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
