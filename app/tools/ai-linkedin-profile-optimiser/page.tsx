import { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LinkedInOptimiser from "@/components/linkedin-optimiser/LinkedInOptimiser";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Linkedin,
  Search,
  Sparkles,
  Shield,
  ArrowRight,
  FileText,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Free LinkedIn Profile Optimiser for AI/ML Jobs | AI Jobs Australia",
  description:
    "Optimise your LinkedIn profile for AI and Machine Learning job opportunities in Australia. Get keyword suggestions, headline alternatives, and a profile score. 100% private - runs in your browser.",
  keywords: [
    "LinkedIn optimiser",
    "LinkedIn profile AI",
    "machine learning LinkedIn",
    "AI jobs LinkedIn",
    "LinkedIn headline generator",
    "LinkedIn keywords AI",
    "Australia AI jobs",
  ],
  openGraph: {
    title: "Free LinkedIn Profile Optimiser for AI/ML Jobs | AI Jobs Australia",
    description:
      "Optimise your LinkedIn for AI/ML roles. Get keyword suggestions, headline alternatives, and profile scoring.",
    type: "website",
  },
};

const faqs = [
  {
    question: "How does the LinkedIn Profile Optimiser work?",
    answer:
      "The tool analyses your LinkedIn headline, About section, and Experience text for AI/ML-specific keywords. It compares your content against what recruiters typically search for and provides a score, keyword suggestions, and alternative headline options. All analysis happens locally in your browser for complete privacy.",
  },
  {
    question: "What makes a good LinkedIn headline for AI/ML roles?",
    answer:
      "An effective AI/ML headline typically includes: your job title (e.g., Machine Learning Engineer), your specialty (e.g., NLP, Computer Vision), and a value proposition (what you help achieve). The optimal length is around 120 characters to ensure it displays fully across devices. Including searchable keywords like 'Python', 'TensorFlow', or 'Deep Learning' also helps recruiters find you.",
  },
  {
    question: "How long should my LinkedIn About section be?",
    answer:
      "For AI/ML professionals, aim for 150-300 words in your About section. This gives you enough space to tell your professional story, highlight key achievements, and include relevant keywords without overwhelming readers. Use first-person language for a more personal connection, and consider including a call-to-action at the end.",
  },
  {
    question: "What keywords should I include for AI/ML roles?",
    answer:
      "Focus on keywords across several categories: Programming Languages (Python, R, SQL), ML Frameworks (TensorFlow, PyTorch, Scikit-learn), Cloud Platforms (AWS, GCP, Azure), Techniques (NLP, Computer Vision, Deep Learning), and soft skills (Leadership, Cross-functional). The specific keywords depend on your target roles, but having a mix shows both technical depth and breadth.",
  },
  {
    question: "How do I make my LinkedIn profile more discoverable to recruiters?",
    answer:
      "Recruiters use LinkedIn's search function extensively. To improve discoverability: include exact job titles you're targeting, add industry-standard tool names (not just acronyms), use location-based keywords if targeting specific regions like Australia, and ensure your Skills section mirrors keywords in your headline and About section. Regularly updating your profile also signals to LinkedIn's algorithm that you're active.",
  },
  {
    question: "Should I use first-person or third-person in my About section?",
    answer:
      "First-person ('I build machine learning systems...') is generally recommended for LinkedIn as it creates a more personal, approachable tone. Third-person can feel formal and disconnected. However, consistency is key - pick one style and stick with it throughout your profile.",
  },
  {
    question: "Is my LinkedIn data safe when using this tool?",
    answer:
      "Yes, completely. This tool runs entirely in your browser using JavaScript. Your LinkedIn text never leaves your device or gets sent to any server. We don't store, log, or have access to any content you paste. You can verify this by using the tool offline after the page loads.",
  },
  {
    question: "How often should I update my LinkedIn profile?",
    answer:
      "Review your profile every 3-6 months, or whenever you learn a new skill, complete a significant project, or change roles. For AI/ML professionals, the field moves quickly, so updating with new technologies you've learned (like new LLM tools or frameworks) keeps your profile current and signals to recruiters that you're actively developing your skills.",
  },
];

export default function LinkedInOptimiserPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-muted/50 to-background">
        <div className="container max-w-6xl mx-auto px-4 pt-24 pb-16 md:py-24">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <div className="inline-block">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Linkedin className="w-4 h-4" />
                Free Career Tool
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              LinkedIn Profile Optimiser for AI Jobs
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground">
              Analyse your LinkedIn profile for AI/ML keyword optimisation. Get
              headline suggestions, keyword recommendations, and a profile score
              to help recruiters find you.
            </p>
          </div>
        </div>
      </section>

      {/* Target Roles Section */}
      <section className="pb-8">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 text-muted-foreground shrink-0">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Optimised for:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                "Machine Learning Engineer",
                "Data Scientist",
                "AI Engineer",
                "MLOps Engineer",
                "Data Engineer",
                "AI Researcher",
                "NLP Engineer",
                "Computer Vision Engineer",
              ].map((role) => (
                <Badge key={role} variant="secondary" className="text-xs">
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Main Tool Section */}
      <section className="py-0">
        <div className="container max-w-6xl mx-auto px-4">
          <LinkedInOptimiser />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-background">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Search className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Keyword Optimisation</h3>
                    <p className="text-sm text-muted-foreground">
                      Identify AI/ML keywords recruiters search for and find gaps
                      in your profile to improve discoverability.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Headline Generator</h3>
                    <p className="text-sm text-muted-foreground">
                      Get personalised headline suggestions that showcase your
                      role, specialty, and value proposition.
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
                      Your profile text is analysed entirely in your browser. No
                      data is ever sent to our servers.
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
            Optimise your resume too and start applying to top AI jobs in
            Australia.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link href="/tools/ai-jobs-resume-keyword-analyser">
                <FileText className="mr-2 w-4 h-4" />
                Analyse Your Resume
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-transparent text-white border-white hover:bg-white/10"
              asChild
            >
              <Link href="/">
                Browse AI Jobs
                <ArrowRight className="ml-2 w-4 h-4" />
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
              Common questions about optimising your LinkedIn for AI/ML roles
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

      {/* Schema.org - WebApplication */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "LinkedIn Profile Optimiser for AI/ML Jobs",
            description:
              "Free tool to analyse and optimise LinkedIn profiles for AI and Machine Learning job opportunities in Australia.",
            url: "https://aijobsaustralia.com.au/tools/ai-linkedin-profile-optimiser",
            applicationCategory: "BusinessApplication",
            operatingSystem: "Any",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "AUD",
            },
            featureList: [
              "LinkedIn headline analysis and suggestions",
              "AI/ML keyword optimisation",
              "Profile score calculation",
              "Alternative headline generator",
              "Section-specific recommendations",
              "100% browser-based privacy",
            ],
          }),
        }}
      />

      {/* Schema.org - FAQPage */}
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
