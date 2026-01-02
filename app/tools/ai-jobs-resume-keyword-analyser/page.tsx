import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ResumeAnalyzer from "@/components/resume-analyser/ResumeAnalyzer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, CheckCircle2, TrendingUp, Shield } from "lucide-react";

export const metadata: Metadata = {
  title:
    "Free AI Resume Keyword Analyser | Optimise for ATS | AI Jobs Australia",
  description:
    "Free resume keyword analyser for AI and ML roles in Australia. Check your resume for important keywords, improve ATS compatibility, and optimise for machine learning, data science, and AI jobs.",
  keywords: [
    "resume keyword analyser",
    "AI resume checker",
    "ATS resume checker",
    "machine learning resume keywords",
    "data science resume optimiser",
    "AI jobs Australia",
    "resume optimisation tool",
    "free resume analyser",
  ],
  openGraph: {
    title: "Free AI Resume Keyword Analyser | AI Jobs Australia",
    description:
      "Optimise your resume for AI and ML roles. Free instant analysis with keyword suggestions for ATS compatibility.",
    type: "website",
  },
};

const faqs = [
  {
    question: "What is a resume keyword analyser?",
    answer:
      "A resume keyword analyser scans your resume for important keywords that recruiters and Applicant Tracking Systems (ATS) look for. It helps you optimise your resume to pass automated screening and get more interview calls.",
  },
  {
    question: "How does the AI resume analyser work?",
    answer:
      "Our tool analyses your resume text against a comprehensive database of AI/ML keywords including programming languages (Python, R), frameworks (TensorFlow, PyTorch), cloud platforms (AWS, Azure), and ML techniques (Deep Learning, NLP). It shows what keywords you have and what you're missing.",
  },
  {
    question: "Is my resume data safe?",
    answer:
      "Yes, absolutely! All analysis happens locally in your browser. Your resume text is never sent to our servers or stored anywhere. We take your privacy seriously.",
  },
  {
    question: "What keywords should I include in my AI/ML resume?",
    answer:
      "For AI and ML roles in Australia, important keywords include: Python, TensorFlow, PyTorch, Machine Learning, Deep Learning, NLP, Computer Vision, AWS, Azure, SQL, and specific frameworks you've used. Our analyser shows you exactly which ones are relevant for your target role.",
  },
  {
    question: "Will this help me pass ATS systems?",
    answer:
      "Yes! Most companies use Applicant Tracking Systems (ATS) that scan resumes for relevant keywords before a human sees them. By optimising your resume with the right keywords, you significantly increase your chances of passing the initial ATS screening.",
  },
  {
    question: "How can I improve my resume score?",
    answer:
      "Add relevant keywords that match your actual experience. Don't stuff keywords you don't have - instead, focus on technical skills, frameworks, and tools you've genuinely used. Aim for a 50-70% keyword match for best results.",
  },
  {
    question: "What is a good keyword percentage?",
    answer:
      "A score of 50-70% is excellent for AI/ML roles. Below 30% means you may need to add more technical keywords. Above 70% is great but make sure you're not keyword stuffing - quality over quantity matters.",
  },
  {
    question: "Can I use this for other tech roles?",
    answer:
      "While this tool is optimised for AI, ML, and Data Science roles in Australia, it also works well for related tech positions like Software Engineering, Data Engineering, and Research roles that involve similar technologies.",
  },
];

export default function ResumeKeywordAnalyzerPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background">
        <div className="container max-w-6xl mx-auto px-4 pt-24 pb-16 md:py-24">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-block">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                Resume Optimisation Tool
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Free Resume Keyword Analyser for AI Jobs
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground">
              Optimise your resume for AI and Machine Learning roles in
              Australia. Get instant feedback on keyword coverage, ATS
              compatibility, and actionable suggestions to improve your
              application.
            </p>
          </div>
        </div>
      </section>

      {/* Main Tool */}
      <section className="py-0">
        <div className="container max-w-6xl mx-auto px-4">
          <ResumeAnalyzer />
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
                    <h3 className="font-semibold mb-2">ATS-Optimised</h3>
                    <p className="text-sm text-muted-foreground">
                      Ensure your resume passes Applicant Tracking Systems used
                      by top Australian AI companies.
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
                      All analysis happens in your browser. Your resume data
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
                    <h3 className="font-semibold mb-2">Instant Feedback</h3>
                    <p className="text-sm text-muted-foreground">
                      Get immediate insights with keyword breakdown, score, and
                      suggestions to improve.
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
            Ready to Land Your Dream AI Job?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Discover hundreds of AI, Machine Learning, and Data Science roles
            across Australia
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

      {/* FAQ Section */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about optimising your AI resume
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
            name: "AI Resume Keyword Analyser",
            description:
              "Free resume keyword analyser for AI and ML jobs in Australia",
            url: "https://aijobsaustralia.com.au/tools/ai-jobs-resume-keyword-analyser",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Any",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "AUD",
            },
            featureList: [
              "Resume keyword analysis",
              "ATS compatibility check",
              "AI/ML keyword suggestions",
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
