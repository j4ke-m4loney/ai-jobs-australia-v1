"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { analyseLinkedInProfile, LinkedInAnalysisResult } from "@/lib/linkedin-optimiser/analyser";
import OptimiserResults from "./OptimiserResults";
import { Linkedin, Loader2, User, FileText, Briefcase } from "lucide-react";

export default function LinkedInOptimiser() {
  const [headlineText, setHeadlineText] = useState("");
  const [aboutText, setAboutText] = useState("");
  const [experienceText, setExperienceText] = useState("");
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [result, setResult] = useState<LinkedInAnalysisResult | null>(null);

  const handleAnalyse = () => {
    if (!headlineText.trim()) {
      return;
    }

    setIsAnalysing(true);

    // 800ms UX delay
    setTimeout(() => {
      const analysisResult = analyseLinkedInProfile(
        headlineText,
        aboutText,
        experienceText
      );
      setResult(analysisResult);
      setIsAnalysing(false);

      // Smooth scroll to results
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }, 800);
  };

  const handleClear = () => {
    setHeadlineText("");
    setAboutText("");
    setExperienceText("");
    setResult(null);
  };

  const headlineCharCount = headlineText.length;
  const headlineMaxChars = 220;

  return (
    <div className="space-y-8">
      {/* Headline Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            LinkedIn Headline
          </CardTitle>
          <CardDescription>
            Your headline appears under your name and is the first thing recruiters see.
            This field is required.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Textarea
              placeholder="e.g., Machine Learning Engineer | NLP & Computer Vision | Building AI solutions that scale"
              value={headlineText}
              onChange={(e) => setHeadlineText(e.target.value)}
              className="min-h-[80px] text-sm md:text-base"
              maxLength={headlineMaxChars}
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-sm text-muted-foreground">
                Your headline is what makes recruiters click on your profile.
              </p>
              <span
                className={`text-sm ${
                  headlineCharCount > 120
                    ? headlineCharCount > headlineMaxChars
                      ? "text-red-600"
                      : "text-yellow-600"
                    : "text-muted-foreground"
                }`}
              >
                {headlineCharCount}/{headlineMaxChars}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About Section Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            About / Summary Section
          </CardTitle>
          <CardDescription>
            Your About section tells your professional story. This field is optional.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Textarea
              placeholder="Paste your LinkedIn About/Summary section here...

Example: I'm a Machine Learning Engineer with 5+ years of experience building production AI systems. I specialise in NLP and have deployed models serving millions of users..."
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              className="min-h-[200px] text-sm md:text-base"
            />
            <p className="text-sm text-muted-foreground mt-2">
              {aboutText.trim()
                ? `${aboutText.trim().split(/\s+/).length} words`
                : "Recommended: 150-300 words"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Experience Section Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Experience Section
          </CardTitle>
          <CardDescription>
            Combine text from your work experience entries. This field is optional.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Textarea
              placeholder="Paste your LinkedIn experience descriptions here...

Example:
Senior ML Engineer at TechCorp
• Led development of recommendation system serving 10M+ users
• Implemented NLP pipeline reducing processing time by 40%
• Deployed models using TensorFlow and AWS SageMaker..."
              value={experienceText}
              onChange={(e) => setExperienceText(e.target.value)}
              className="min-h-[250px] text-sm md:text-base"
            />
            <p className="text-sm text-muted-foreground mt-2">
              {experienceText.trim()
                ? `${experienceText.trim().split(/\s+/).length} words`
                : "Include descriptions from your most relevant roles"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleAnalyse}
              disabled={!headlineText.trim() || isAnalysing}
              size="lg"
              className="min-w-[180px]"
            >
              {isAnalysing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analysing...
                </>
              ) : (
                <>
                  <Linkedin className="w-4 h-4 mr-2" />
                  Analyse Profile
                </>
              )}
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              size="lg"
              disabled={!headlineText && !aboutText && !experienceText && !result}
            >
              Clear All
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Your profile text is analysed locally in your browser. No data is sent to our servers.
          </p>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <div id="results">
          <OptimiserResults result={result} />
        </div>
      )}
    </div>
  );
}
