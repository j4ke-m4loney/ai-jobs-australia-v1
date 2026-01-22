import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SkillsGapAnalyser from "@/components/skills-gap-analyser/SkillsGapAnalyser";
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
  Search,
  Shield,
  Target,
  BookOpen,
} from "lucide-react";

export const metadata: Metadata = {
  title:
    "Free AI Skills Gap Analyser | Compare Resume to Job Requirements | AI Jobs Australia",
  description:
    "Free tool to analyse your skills gap for AI and ML roles. Compare your resume against job descriptions to identify matching skills, missing skills, and get personalised learning recommendations.",
  keywords: [
    "skills gap analyser",
    "skills gap analysis",
    "resume job match",
    "AI job skills",
    "ML skills assessment",
    "career development",
    "skill matching tool",
    "AI jobs Australia",
    "job skills comparison",
    "resume analyser",
  ],
  openGraph: {
    title: "Free AI Skills Gap Analyser | AI Jobs Australia",
    description:
      "Compare your resume against job descriptions. Identify skill matches, gaps, and get learning recommendations.",
    type: "website",
  },
};

const faqs = [
  {
    question: "How does the Skills Gap Analyser work?",
    answer:
      "The analyser compares your resume text against a job description to identify matching skills and gaps. It uses a comprehensive database of 100+ AI/ML-related skills across categories like programming languages, frameworks, cloud platforms, and soft skills. The tool detects skills in both texts and calculates your match percentage.",
  },
  {
    question: "What information should I include in my resume text?",
    answer:
      "Include all relevant technical skills, tools, frameworks, certifications, and experience. You can paste your full resume or just the skills and experience sections. The more comprehensive your input, the more accurate the analysis will be.",
  },
  {
    question: "How are skill priorities determined?",
    answer:
      "Skills are prioritised based on two factors: whether they're listed as required (vs nice-to-have) in the job description, and their general importance in AI/ML roles. 'High priority' means the skill is both required and essential for AI/ML roles. 'Medium priority' indicates important but not critical skills. 'Nice to have' skills are mentioned but not strictly required.",
  },
  {
    question: "Is my data safe when I use this tool?",
    answer:
      "Yes, completely! All analysis happens locally in your browser using JavaScript. Your resume and job description text are never sent to our servers or stored anywhere. Your data stays on your device.",
  },
  {
    question: "What does the match percentage mean?",
    answer:
      "The match percentage shows how many of the skills mentioned in the job description are also found in your resume. An 80%+ match is excellent, 60-80% is good, 40-60% is moderate, and below 40% indicates significant skill gaps to address.",
  },
  {
    question: "Should I apply if I have skill gaps?",
    answer:
      "It depends on the gaps. If you're missing 'nice to have' skills, definitely apply - many employers list ideal candidates but are flexible. For high-priority gaps, consider if you can quickly learn the skill or have transferable experience. A 60%+ match with strong fundamentals is often enough to get an interview.",
  },
  {
    question: "How do I address the skill gaps identified?",
    answer:
      "For each missing skill, we provide learning resources including online courses, documentation, and certifications. Focus on high-priority gaps first. Consider building portfolio projects that demonstrate these skills, or highlight related experience in your cover letter.",
  },
  {
    question: "Why are some of my skills showing as 'additional'?",
    answer:
      "Additional skills are ones you have that aren't specifically mentioned in this particular job description. They're still valuable - many employers appreciate candidates with broader skill sets. Consider which additional skills might differentiate you and mention them strategically in your application.",
  },
];

export default function SkillsGapAnalyzerPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background">
        <div className="container max-w-6xl mx-auto px-4 pt-24 pb-16 md:py-24">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-block">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Search className="w-4 h-4" />
                Skills Analysis Tool
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              AI Skills Gap Analyser
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground">
              Compare your resume against any job description to instantly see
              which skills match, which are missing, and get personalised
              recommendations to bridge the gap.
            </p>
          </div>
        </div>
      </section>

      {/* Main Tool */}
      <section className="py-0">
        <div className="container max-w-6xl mx-auto px-4">
          <SkillsGapAnalyser />
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
                    <Target className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Instant Comparison</h3>
                    <p className="text-sm text-muted-foreground">
                      Compare your skills against job requirements in seconds.
                      See exactly where you match and where to improve.
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
                    <h3 className="font-semibold mb-2">Learning Resources</h3>
                    <p className="text-sm text-muted-foreground">
                      Get curated course and certification recommendations for
                      each skill gap to accelerate your learning.
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
                      All analysis happens in your browser. Your resume and job
                      descriptions never leave your device.
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
            Found Skills to Work On?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Use our other tools to optimise your resume, check salary
            expectations, and prepare for interviews
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/tools/ai-jobs-resume-keyword-analyser">
                Optimise Your Resume
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
                Practice Interview Questions
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
              Everything you need to know about the Skills Gap Analyser
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
            name: "AI Skills Gap Analyser",
            description:
              "Free tool to analyse skills gaps for AI and ML roles in Australia",
            url: "https://aijobsaustralia.com.au/tools/ai-skills-gap-analyser",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Any",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "AUD",
            },
            featureList: [
              "Resume to job description comparison",
              "Skill matching analysis",
              "Gap identification",
              "Learning resource recommendations",
              "Priority-based skill ranking",
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
