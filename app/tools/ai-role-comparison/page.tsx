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
  ArrowLeftRight,
  DollarSign,
  Shield,
} from "lucide-react";
import { RoleComparison } from "@/components/role-comparison/RoleComparison";

export const metadata: Metadata = {
  title:
    "AI Role Comparison Tool | Compare AI Careers Side by Side | AI Jobs Australia",
  description:
    "Compare AI and ML career paths side by side. See salary differences, skill overlap, day-to-day work, career progression, and pros & cons for 10 AI roles in Australia including ML Engineer, Data Scientist, LLM Engineer, and more.",
  keywords: [
    "AI role comparison",
    "ML engineer vs data scientist",
    "compare AI careers",
    "AI career comparison",
    "machine learning career paths",
    "data science vs machine learning",
    "AI jobs comparison Australia",
    "AI salary comparison",
    "LLM engineer vs ML engineer",
    "AI career paths Australia",
  ],
  openGraph: {
    title: "AI Role Comparison Tool | Compare AI Careers Side by Side",
    description:
      "Compare 10 AI career paths side by side — salaries, skills, day-to-day work, and career progression in the Australian market.",
    type: "website",
  },
};

const faqs = [
  {
    question: "What AI roles can I compare?",
    answer:
      "You can compare any two of our 10 AI career paths: Machine Learning Engineer, Data Scientist, AI/ML Researcher, Data Engineer, MLOps Engineer, NLP Engineer, Computer Vision Engineer, AI Product Manager, AI Ethics & Governance Specialist, and Conversational AI / LLM Engineer.",
  },
  {
    question: "How accurate are the salary ranges?",
    answer:
      "Salary ranges are estimated based on the Australian AI job market in 2025. They reflect typical ranges across major cities and may vary by company, location, specific experience, and negotiation. Use our Salary Calculator tool for more detailed location-based estimates.",
  },
  {
    question: "How is skill overlap calculated?",
    answer:
      "Skill overlap is calculated by comparing the key skills listed for each role. Shared skills are those that appear in both roles, and the overlap percentage shows what proportion of the combined unique skills are shared. A higher percentage means an easier transition between roles.",
  },
  {
    question: "Can I use this to plan a career transition?",
    answer:
      "Absolutely! The comparison shows which skills transfer between roles, what new skills you would need to develop, and provides transition tips. Combined with our Skills Gap Analyser and Portfolio Project Generator, you can build a concrete transition plan.",
  },
  {
    question: "Which AI role has the highest salary in Australia?",
    answer:
      "At the senior and lead levels, AI/ML Researchers and LLM Engineers tend to have the highest salary ceilings (up to $250k–$260k). However, demand and number of available positions also matter — Data Engineers and ML Engineers have more positions available and consistently strong salaries.",
  },
  {
    question: "Which AI career path has the most demand?",
    answer:
      "Machine Learning Engineers, Data Engineers, and LLM Engineers currently have 'Very High' demand in Australia. Data Scientists, MLOps Engineers, and NLP Engineers are in 'High' demand. AI Ethics & Governance is a rapidly growing field as Australian organisations adopt AI governance frameworks.",
  },
  {
    question: "Is this tool free to use?",
    answer:
      "Yes, completely free with no sign-up required. The comparison runs entirely in your browser — we don't collect or store any of your selections. It's part of our suite of free career tools for AI professionals in Australia.",
  },
  {
    question: "What should I do after comparing roles?",
    answer:
      "Once you've identified your preferred role, use our Career Path Quiz to confirm it's a good fit, the Salary Calculator for location-specific pay data, the Skills Gap Analyser to identify what to learn, and then browse relevant job listings directly from the comparison results.",
  },
  {
    question: "How often is the data updated?",
    answer:
      "Role data including salary ranges, demand levels, and skill requirements are reviewed and updated regularly based on the Australian AI job market. The current data reflects the 2025 market.",
  },
  {
    question: "Can I compare more than two roles at once?",
    answer:
      "Currently the tool compares two roles at a time. This keeps the comparison focused and easy to read. You can run multiple comparisons to explore different combinations — for instance, compare ML Engineer vs Data Scientist, then ML Engineer vs LLM Engineer.",
  },
];

export default function AIRoleComparisonPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background">
        <div className="container max-w-6xl mx-auto px-4 pt-24 pb-16 md:py-24">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-block">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <ArrowLeftRight className="w-4 h-4" />
                Career Comparison
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              Compare AI Career Paths Side by Side
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground">
              Not sure which AI role is right for you? Compare salaries, skills,
              day-to-day work, and career progression for 10 AI career paths in
              Australia.
            </p>
          </div>
        </div>
      </section>

      {/* Comparison Tool Section */}
      <section className="py-8 md:py-12">
        <div className="container max-w-6xl mx-auto px-4">
          <RoleComparison />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Salary Comparison
              </h3>
              <p className="text-muted-foreground">
                Compare salary ranges across four experience levels with
                Australian market data, from junior to lead positions.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
                <ArrowLeftRight className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Skills & Tools Overlap
              </h3>
              <p className="text-muted-foreground">
                See which skills transfer between roles, what you already know,
                and what you would need to learn for a career switch.
              </p>
            </div>

            <div className="text-center">
              <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">100% Private</h3>
              <p className="text-muted-foreground">
                Everything runs in your browser. We never collect, store, or
                share your selections. No sign-up required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-primary/80">
        <div className="container max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Found Your Ideal AI Role?
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
              <Link href="/tools/ai-career-path-quiz">Take the Career Quiz</Link>
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
            name: "AI Role Comparison Tool",
            description:
              "Compare AI and ML career paths side by side. See salary differences, skill overlap, day-to-day work, and career progression for 10 AI roles in Australia.",
            url: "https://www.aijobs.com.au/tools/ai-role-comparison",
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
