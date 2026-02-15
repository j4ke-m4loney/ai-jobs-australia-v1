import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowRight,
  Compass,
  Target,
  Globe,
  Shield,
} from "lucide-react";
import { CareerQuiz } from "@/components/career-quiz/CareerQuiz";

export const metadata: Metadata = {
  title:
    "AI Career Path Quiz | Find Your Ideal AI Career | AI Jobs Australia",
  description:
    "Take our free AI career path quiz to discover which artificial intelligence career suits you best. Covers 10 AI career paths including Machine Learning Engineer, Data Scientist, LLM Engineer, and more. Personalised results with Australian salary data.",
  keywords: [
    "AI career quiz",
    "AI career path quiz",
    "what AI career is right for me",
    "machine learning career quiz",
    "data science career quiz",
    "AI job quiz",
    "AI career test",
    "ML career path",
    "artificial intelligence career quiz",
    "AI careers Australia",
  ],
  openGraph: {
    title: "AI Career Path Quiz | Find Your Ideal AI Career",
    description:
      "Discover which AI career path suits you best. Free quiz covering 10 career paths with Australian salary data and demand levels.",
    type: "website",
  },
};

const faqs = [
  {
    question: "How does the AI Career Path Quiz work?",
    answer:
      "The quiz asks 12 multiple-choice questions about your technical background, work preferences, communication style, and career goals. Each answer is scored against 10 different AI career paths. Your results show a match percentage for each path based on how well your responses align with the typical profile for that role.",
  },
  {
    question: "What AI career paths does the quiz cover?",
    answer:
      "The quiz covers 10 in-demand AI career paths: Machine Learning Engineer, Data Scientist, AI/ML Researcher, Data Engineer, MLOps Engineer, NLP Engineer, Computer Vision Engineer, AI Product Manager, AI Ethics & Governance Specialist, and Conversational AI / LLM Engineer.",
  },
  {
    question: "How accurate is the quiz?",
    answer:
      "The quiz provides a helpful starting point based on your stated preferences and background. It uses weighted scoring across multiple dimensions to match you with career paths, but real career decisions should also consider your specific experience, education, and local market conditions. Think of it as a compass, not a GPS.",
  },
  {
    question: "What salary ranges can I expect for AI roles in Australia?",
    answer:
      "AI salaries in Australia vary significantly by role and experience. Entry-level positions typically start from $88k–$110k, while senior roles can reach $220k–$260k. The quiz results include specific salary ranges for each career path based on current Australian market data.",
  },
  {
    question: "Which AI career paths are in highest demand in Australia?",
    answer:
      "Machine Learning Engineers, Data Engineers, and Conversational AI / LLM Engineers currently have 'Very High' demand in Australia. Data Scientists, MLOps Engineers, and NLP Engineers are in 'High' demand. AI Ethics & Governance is a rapidly growing field as Australian organisations adopt AI governance frameworks.",
  },
  {
    question: "Can I retake the quiz?",
    answer:
      "Absolutely! You can retake the quiz as many times as you like. Your previous answers are not saved, so each attempt is a fresh start. Try answering differently to explore other potential career paths you might not have considered.",
  },
  {
    question: "Is the quiz really free?",
    answer:
      "Yes, the quiz is completely free with no hidden costs or sign-up required. It runs entirely in your browser — we don't collect or store any of your answers. It's part of our suite of free career tools for AI professionals in Australia.",
  },
  {
    question: "What if I get an unexpected result?",
    answer:
      "An unexpected result might reveal strengths or interests you haven't fully explored. Read through the career path description and key skills — you might find it resonates more than you initially thought. You can also retake the quiz with different answers to see how your results change.",
  },
  {
    question: "What should I do after taking the quiz?",
    answer:
      "Start by exploring job listings for your top career match using the links in your results. Then use our Salary Calculator to check earning potential, the Skills Gap Analyser to identify what to learn next, and the Resume Keyword Analyser to optimise your resume for your target role.",
  },
  {
    question: "Do I need experience in AI to take the quiz?",
    answer:
      "Not at all! The quiz is designed for everyone from complete beginners exploring AI careers to experienced professionals considering a pivot. The questions focus on your natural preferences, work style, and interests rather than existing technical knowledge.",
  },
];

export default function AICareerPathQuizPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background">
        <div className="container max-w-6xl mx-auto px-4 pt-24 pb-16 md:py-24">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-block">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Compass className="w-4 h-4" />
                Career Discovery
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Which AI Career Path Is Right for You?
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground">
              Answer 12 quick questions to discover your ideal AI career path.
              Get personalised recommendations with Australian salary data and
              demand levels.
            </p>
          </div>
        </div>
      </section>

      {/* Quiz Section */}
      <section className="py-8 md:py-12">
        <div className="container max-w-6xl mx-auto px-4">
          <CareerQuiz />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
                <Target className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Personalised Results
              </h3>
              <p className="text-muted-foreground">
                Your top 3 matches ranked by fit, with detailed descriptions,
                key skills, and direct links to relevant job listings.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
                <Globe className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Australian Market Data
              </h3>
              <p className="text-muted-foreground">
                Salary ranges and demand levels based on the Australian AI job
                market, so you can make informed career decisions.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">100% Private</h3>
              <p className="text-muted-foreground">
                Everything runs in your browser. We never collect, store, or
                share your quiz answers. No sign-up required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary/80">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Start Your AI Career?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Browse hundreds of AI, Machine Learning, and Data Science roles
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
      <section className="py-16">
        <div className="container max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`faq-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent>{faq.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "AI Career Path Quiz",
            description:
              "Free quiz to discover your ideal AI career path. Covers 10 career paths with Australian salary data and demand levels.",
            url: "https://www.aijobs.com.au/tools/ai-career-path-quiz",
            applicationCategory: "Career Tool",
            operatingSystem: "Any",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "AUD",
            },
            creator: {
              "@type": "Organization",
              name: "AI Jobs Australia",
              url: "https://www.aijobs.com.au",
            },
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
