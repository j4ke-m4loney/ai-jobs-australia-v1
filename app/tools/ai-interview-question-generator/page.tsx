import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import InterviewGenerator from "@/components/interview-generator/InterviewGenerator";
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
  MessageSquare,
  Shield,
  Target,
  Brain,
} from "lucide-react";

export const metadata: Metadata = {
  title:
    "Free AI Interview Question Generator | Practice for ML Jobs | AI Jobs Australia",
  description:
    "Free interview question generator for AI and ML roles in Australia. Practice technical, behavioural, and system design questions with sample answers. Prepare for Machine Learning Engineer, Data Scientist, and AI Researcher interviews.",
  keywords: [
    "AI interview questions",
    "ML interview preparation",
    "machine learning interview",
    "data science interview questions",
    "AI job interview",
    "technical interview practice",
    "system design interview",
    "behavioural interview AI",
    "free interview prep",
  ],
  openGraph: {
    title: "Free AI Interview Question Generator | AI Jobs Australia",
    description:
      "Practice interview questions for AI and ML roles. Get personalised questions with sample answers for your target role and experience level.",
    type: "website",
  },
};

const faqs = [
  {
    question: "How does the interview question generator work?",
    answer:
      "Our generator uses a curated database of real interview questions commonly asked at AI and ML companies in Australia. You select your target role, experience level, and interview stage, and we generate a personalised set of questions with sample answers and interview tips.",
  },
  {
    question: "Are these real interview questions?",
    answer:
      "Yes, our question bank is compiled from real interview experiences, common industry questions, and standard technical assessments used by Australian tech companies. Questions cover machine learning fundamentals, deep learning, system design, coding, and behavioural topics.",
  },
  {
    question: "What roles does this cover?",
    answer:
      "The generator covers major AI/ML roles including Machine Learning Engineer, Data Scientist, AI Researcher, Data Engineer, and MLOps Engineer. Questions are tailored to each role's specific requirements and expectations.",
  },
  {
    question: "What experience levels are supported?",
    answer:
      "We support all experience levels from Junior (0-2 years) to Lead/Principal (10+ years). The difficulty and depth of questions automatically adjusts based on your selected experience level.",
  },
  {
    question: "Can I focus on specific interview stages?",
    answer:
      "Yes, you can filter questions by interview stage including Phone Screen, Technical Interview, System Design, Behavioural, and Final Round. This helps you prepare for each stage of the interview process.",
  },
  {
    question: "Is this tool free to use?",
    answer:
      "Yes, this interview question generator is completely free with no hidden costs or sign-up required. All questions are generated locally in your browser - your selections are never sent to our servers.",
  },
  {
    question: "How should I use the sample answers?",
    answer:
      "Sample answers provide a framework for your response, not a script to memorise. Use them to understand what interviewers are looking for, then practice answering in your own words using your own experiences and examples.",
  },
  {
    question: "How often are new questions added?",
    answer:
      "We regularly update our question bank with new questions reflecting current industry trends, including topics like large language models, MLOps practices, and emerging AI technologies.",
  },
  {
    question: "Can I regenerate different questions?",
    answer:
      "Yes, click the 'Regenerate' button to get a fresh set of questions. Each generation shuffles the question bank, so you'll get different questions to practice with each time.",
  },
  {
    question: "What's the best way to prepare for AI interviews?",
    answer:
      "Practice answering questions out loud, prepare specific examples from your experience, understand fundamental concepts deeply rather than memorising answers, and be ready to discuss your past projects in detail. Use this tool regularly in the weeks leading up to your interview.",
  },
];

export default function InterviewQuestionGeneratorPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background">
        <div className="container max-w-6xl mx-auto px-4 pt-24 pb-16 md:py-24">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-block">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <MessageSquare className="w-4 h-4" />
                Interview Preparation
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              AI Interview Question Generator
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground">
              Practice interview questions tailored to your target AI/ML role
              and experience level. Get sample answers, tips, and prepare with
              confidence for your next interview.
            </p>
          </div>
        </div>
      </section>

      {/* Main Tool */}
      <section className="py-0">
        <div className="container max-w-6xl mx-auto px-4">
          <InterviewGenerator />
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
                    <h3 className="font-semibold mb-2">Role-Specific Questions</h3>
                    <p className="text-sm text-muted-foreground">
                      Questions tailored to ML Engineer, Data Scientist, AI
                      Researcher, and more with appropriate difficulty levels.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Brain className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Sample Answers & Tips</h3>
                    <p className="text-sm text-muted-foreground">
                      Learn what interviewers are looking for with sample
                      answers and expert tips for each question.
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
                      All questions are generated in your browser. Your
                      selections and data never leave your device.
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
            Ready to Land Your Dream AI Role?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Discover hundreds of AI, Machine Learning, and Data Science roles
            across Australia with competitive salaries
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
              Everything you need to know about preparing for AI/ML interviews
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
            name: "AI Interview Question Generator",
            description:
              "Free interview question generator for AI and ML jobs in Australia",
            url: "https://aijobsaustralia.com.au/tools/ai-interview-question-generator",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Any",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "AUD",
            },
            featureList: [
              "Role-specific interview questions",
              "Sample answers and tips",
              "Multiple experience levels",
              "Technical and behavioural questions",
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
