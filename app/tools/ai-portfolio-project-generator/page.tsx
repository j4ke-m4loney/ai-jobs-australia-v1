import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PortfolioGenerator from "@/components/portfolio-generator/PortfolioGenerator";
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
  Lightbulb,
  Shield,
  Target,
  Briefcase,
  Code,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title:
    "Free AI/ML Portfolio Project Generator | Ideas for Data Scientists & ML Engineers | AI Jobs Australia",
  description:
    "Free portfolio project generator for AI and ML roles in Australia. Get personalised project ideas for Machine Learning Engineers, Data Scientists, MLOps Engineers, NLP Engineers, and Computer Vision Engineers with tech stacks, datasets, and interview prep tips.",
  keywords: [
    "AI portfolio projects",
    "ML project ideas",
    "machine learning portfolio",
    "data science projects",
    "MLOps portfolio",
    "computer vision projects",
    "NLP projects",
    "AI jobs Australia",
    "portfolio for ML engineer",
    "data scientist portfolio",
    "free project generator",
  ],
  openGraph: {
    title: "Free AI/ML Portfolio Project Generator | AI Jobs Australia",
    description:
      "Get personalised portfolio project ideas for AI and ML roles. Tech stacks, datasets, and interview tips included.",
    type: "website",
  },
};

const faqs = [
  {
    question: "What roles is this portfolio project generator designed for?",
    answer:
      "This tool generates project ideas specifically for: Machine Learning Engineers, Data Scientists, AI/ML Researchers, Data Engineers, MLOps Engineers, Computer Vision Engineers, and NLP Engineers. Each project is tagged with which roles it's most valuable for, so you can focus on building a portfolio that directly supports your career goals.",
  },
  {
    question: "How does the project generator work?",
    answer:
      "You select your target roles, experience level, time availability, current skills, and interests. The generator then matches you with project ideas from our curated database of 20+ portfolio projects, each with detailed specifications including tech stacks, datasets, resume value, and interview preparation tips.",
  },
  {
    question: "Are these real projects that employers value?",
    answer:
      "Yes, all project ideas are designed based on what Australian tech companies and AI teams actually look for in candidates. Each project includes a 'Resume Value' section explaining why it demonstrates valuable skills, plus common interview questions you'll be able to answer after completing it.",
  },
  {
    question: "How many portfolio projects should I have?",
    answer:
      "Quality beats quantity. Most hiring managers recommend 2-3 well-documented, deployed projects over many incomplete ones. Choose projects that demonstrate different skills (e.g., one showing ML fundamentals, one showing deployment/MLOps skills) and align with your target role.",
  },
  {
    question: "What if I'm a complete beginner?",
    answer:
      "Select 'Junior' as your experience level and the generator will suggest beginner-friendly projects like an Interactive EDA Dashboard, Transfer Learning Image Classifier, or SQL Analytics Dashboard. These projects teach fundamental skills while still being impressive enough for entry-level applications.",
  },
  {
    question: "Do the projects include dataset recommendations?",
    answer:
      "Yes, each project includes suggested datasets with direct links. We prioritise freely available datasets from Kaggle, UCI ML Repository, and Australian government data sources (like AEMO energy data) to make it easy to get started.",
  },
  {
    question: "How do I make my portfolio project stand out?",
    answer:
      "Each project suggestion includes 'Ways to Extend' ideas that go beyond the basics. Additionally: write a clear README, include a blog post explaining your decisions, deploy it so there's a live demo, and be prepared to discuss every decision in interviews.",
  },
  {
    question: "Why are some projects marked as 'AU Relevant'?",
    answer:
      "Projects marked with 🇦🇺 use Australian data sources or are particularly relevant to Australian employers. For example, using AEMO energy data or building tools relevant to Australian companies like Canva, Atlassian, or the big banks shows you understand the local market.",
  },
  {
    question: "Is this tool free to use?",
    answer:
      "Yes, this portfolio project generator is completely free with no hidden costs or sign-up required. All suggestions are generated locally in your browser - your selections are never sent to our servers.",
  },
  {
    question: "Can I regenerate to get different suggestions?",
    answer:
      "Yes, click the 'Regenerate' button to get a fresh set of project ideas. The generator includes some randomisation, so you'll see different projects each time while still matching your criteria.",
  },
];

export default function PortfolioProjectGeneratorPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background">
        <div className="container max-w-6xl mx-auto px-4 pt-24 pb-16 md:py-24">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-block">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Lightbulb className="w-4 h-4" />
                Portfolio Builder
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              AI/ML Portfolio Project Generator
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground">
              Get personalised portfolio project ideas tailored to your target
              role, experience level, and interests. Each project includes tech
              stacks, datasets, and tips for impressing Australian employers.
            </p>
          </div>
        </div>
      </section>

      {/* Main Tool */}
      <section className="py-0">
        <div className="container max-w-6xl mx-auto px-4">
          <PortfolioGenerator />
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
                    <h3 className="font-semibold mb-2">Role-Specific Ideas</h3>
                    <p className="text-sm text-muted-foreground">
                      Projects tailored for ML Engineers, Data Scientists,
                      MLOps Engineers, CV Engineers, and NLP Engineers.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Code className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Complete Specs</h3>
                    <p className="text-sm text-muted-foreground">
                      Tech stacks, datasets, time estimates, and step-by-step
                      extension ideas for each project.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Interview Ready</h3>
                    <p className="text-sm text-muted-foreground">
                      Each project includes interview questions you&apos;ll be
                      able to answer and resume talking points.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Why Portfolio Projects Matter */}
      <section className="py-12 bg-muted/30">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Why Portfolio Projects Matter for AI/ML Roles
            </h2>
            <p className="text-muted-foreground">
              In AI and ML hiring, your portfolio often matters more than your
              resume. Here&apos;s why Australian employers look for strong projects:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Proves You Can Build</h3>
                    <p className="text-sm text-muted-foreground">
                      Anyone can list &quot;Python&quot; or &quot;TensorFlow&quot; on a resume.
                      A deployed project proves you can actually ship working ML
                      systems.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Shows Problem-Solving</h3>
                    <p className="text-sm text-muted-foreground">
                      Interviewers love discussing real projects. Your portfolio
                      gives you concrete examples of how you approach and solve
                      problems.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">
                      Demonstrates Domain Knowledge
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      A fraud detection project shows you understand finance. An
                      NLP project shows language understanding. Domain expertise
                      is highly valued.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-1">Fills Experience Gaps</h3>
                    <p className="text-sm text-muted-foreground">
                      No MLOps experience? Build a model serving platform. No
                      production ML? Deploy something. Projects can fill gaps in
                      your work history.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Privacy Note */}
      <section className="py-8">
        <div className="container max-w-6xl mx-auto px-4">
          <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <Shield className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-2 text-green-700 dark:text-green-300">
                    100% Private
                  </h3>
                  <p className="text-sm text-green-700 dark:text-green-300">
                    All project suggestions are generated locally in your
                    browser. Your selections, skills, and interests are never
                    sent to our servers. Your career planning stays private.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
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
              Everything you need to know about building your AI/ML portfolio
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
            name: "AI/ML Portfolio Project Generator",
            description:
              "Free portfolio project generator for AI and ML jobs in Australia",
            url: "https://aijobsaustralia.com.au/tools/ai-portfolio-project-generator",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Any",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "AUD",
            },
            featureList: [
              "Role-specific project ideas",
              "Tech stack recommendations",
              "Dataset suggestions",
              "Interview preparation tips",
              "Resume value explanations",
              "Australian market relevance",
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
