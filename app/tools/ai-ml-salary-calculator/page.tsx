import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SalaryCalculator from "@/components/salary-calculator/SalaryCalculator";
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
  Calculator,
  MapPin,
  Shield,
  Award,
} from "lucide-react";

export const metadata: Metadata = {
  title:
    "Free AI/ML Salary Calculator Australia | Estimate Tech Salaries | AI Jobs Australia",
  description:
    "Free salary calculator for AI and ML roles in Australia. Compare salaries across Sydney, Melbourne, Brisbane and more. See how your skills impact your earning potential in data science and machine learning.",
  keywords: [
    "AI salary calculator",
    "ML salary Australia",
    "data science salary",
    "machine learning salary calculator",
    "tech salary Australia",
    "AI jobs salary",
    "Sydney ML salary",
    "Melbourne data science salary",
    "free salary calculator",
  ],
  openGraph: {
    title: "Free AI/ML Salary Calculator | AI Jobs Australia",
    description:
      "Estimate salary ranges for AI and ML roles across Australia. Compare cities and see how your skills impact compensation.",
    type: "website",
  },
};

const faqs = [
  {
    question: "How accurate are the salary estimates?",
    answer:
      "Our salary estimates are based on market research and industry data for AI/ML roles in Australia (2024-2025). While we strive for accuracy, actual salaries can vary based on company size, industry, specific responsibilities, benefits, and individual negotiation. Use these figures as a general guide for salary expectations.",
  },
  {
    question: "Why do salaries vary between Australian cities?",
    answer:
      "Salaries vary due to cost of living differences, market demand, and local tech industry size. Sydney typically has the highest salaries due to its large tech sector and higher cost of living, followed closely by Melbourne. Cities like Brisbane and Adelaide offer lower costs of living with correspondingly adjusted salaries. Canberra often pays competitively due to government and defense sector roles.",
  },
  {
    question: "How do skills affect my salary?",
    answer:
      "Specific technical skills can significantly impact your earning potential. High-demand skills like Deep Learning, cloud platforms (AWS, Azure), and MLOps tools (Kubernetes, Docker) can add $5,000-$15,000+ to your base salary. The more specialized and in-demand the skill, the higher the premium. Our calculator shows exactly how each skill impacts your total compensation.",
  },
  {
    question: "What's the typical salary for a Machine Learning Engineer in Sydney?",
    answer:
      "In Sydney, ML Engineers typically earn: Junior (0-2 years): $80k-$110k, Mid-level (2-5 years): $110k-$150k, Senior (5-10 years): $140k-$190k, and Lead/Principal (10+ years): $170k-$240k. These ranges increase with additional skills like TensorFlow, PyTorch, AWS, and specialized domains like NLP or Computer Vision.",
  },
  {
    question: "How does Data Scientist salary compare to ML Engineer?",
    answer:
      "Data Scientists typically earn slightly less than ML Engineers at similar experience levels (about 5-10% lower). However, this gap narrows at senior levels, and specific skills can make a significant difference. Data Scientists with strong engineering skills (Python, cloud platforms, MLOps) often command similar salaries to ML Engineers.",
  },
  {
    question: "Is this tool really free and private?",
    answer:
      "Yes, absolutely! This calculator is 100% free with no hidden costs or sign-up required. All calculations happen locally in your browser - your selections and data never leave your device or get sent to our servers. We take your privacy seriously.",
  },
  {
    question: "Should I negotiate for the maximum salary shown?",
    answer:
      "The maximum salary represents the top end of the range, typically for candidates who exceed expectations or have unique expertise. It's good to aim high, but be realistic about your experience and skills. Use the median as a strong target, and the maximum as an aspirational goal. Always research the specific company and role before negotiating.",
  },
  {
    question: "Do these salaries include bonuses and equity?",
    answer:
      "These figures represent base salary only. Total compensation for AI/ML roles often includes performance bonuses (10-20%), equity/stock options (especially at startups and tech companies), and benefits. At senior levels, total compensation can be 20-40% higher than base salary when including all components.",
  },
  {
    question: "How often are salary ranges updated?",
    answer:
      "We update our salary data regularly to reflect current market conditions in the Australian AI/ML job market. The tech industry moves quickly, so we recommend checking back periodically and comparing our estimates with recent job postings and offers in your area.",
  },
  {
    question: "What if I'm switching from another field into AI/ML?",
    answer:
      "Career switchers typically start at junior to mid-level salaries depending on transferable skills. If you have strong software engineering or data analysis experience, you may command higher salaries than entry-level candidates. Consider highlighting relevant projects, certifications, and any ML work you've done (even personal projects) to justify higher compensation.",
  },
];

export default function SalaryCalculatorPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background">
        <div className="container max-w-6xl mx-auto px-4 pt-24 pb-16 md:py-24">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-block">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Calculator className="w-4 h-4" />
                Salary Calculator
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              AI/ML Salary Calculator for Australia
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground">
              Estimate salary ranges for AI and Machine Learning roles across
              Australia. Compare cities, see skill impact, and understand your
              market value in the tech industry.
            </p>
          </div>
        </div>
      </section>

      {/* Main Tool */}
      <section className="py-0">
        <div className="container max-w-6xl mx-auto px-4">
          <SalaryCalculator />
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
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">
                      Location-Based Estimates
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Compare salaries across Sydney, Melbourne, Brisbane,
                      Perth, Adelaide, and Canberra with location-adjusted
                      estimates.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Award className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Skill Impact Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      See exactly how each technical skill affects your earning
                      potential with detailed breakdowns.
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
                      All calculations happen in your browser. Your selections
                      and data never leave your device.
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
            Ready to Find Your Next AI Role?
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
              Everything you need to know about AI/ML salaries in Australia
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
            name: "AI/ML Salary Calculator",
            description:
              "Free salary calculator for AI and ML jobs in Australia",
            url: "https://aijobsaustralia.com.au/tools/ai-ml-salary-calculator",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Any",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "AUD",
            },
            featureList: [
              "Salary range estimation",
              "City comparison",
              "Skill impact analysis",
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
