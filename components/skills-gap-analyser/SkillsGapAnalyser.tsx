"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analyseSkillsGap, GapAnalysisResult } from "@/lib/skills-gap-analyser/analyser";
import GapResults from "./GapResults";
import { Search, Loader2, FileText, Briefcase } from "lucide-react";

export default function SkillsGapAnalyser() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<GapAnalysisResult | null>(null);

  const handleAnalyze = () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      return;
    }

    setIsAnalyzing(true);

    // Simulate a small delay for better UX
    setTimeout(() => {
      const analysisResult = analyseSkillsGap(resumeText, jobDescription);
      setResult(analysisResult);
      setIsAnalyzing(false);

      // Scroll to results
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }, 800);
  };

  const handleClear = () => {
    setResumeText("");
    setJobDescription("");
    setResult(null);
  };

  const canAnalyze = resumeText.trim().length > 0 && jobDescription.trim().length > 0;

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Resume Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Your Resume / Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Textarea
                placeholder="Paste your resume text here, or list your skills and experience. Include technical skills, tools, frameworks, and any relevant qualifications."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                className="min-h-[250px] text-sm md:text-base"
              />
              <p className="text-sm text-muted-foreground mt-2">
                {resumeText.length > 0
                  ? `${resumeText.split(/\s+/).filter((w) => w.length > 0).length} words`
                  : "Paste your resume or list your skills"}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Job Description Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Job Description
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Textarea
                placeholder="Paste the job description here. Include requirements, responsibilities, and any mentioned skills or qualifications."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[250px] text-sm md:text-base"
              />
              <p className="text-sm text-muted-foreground mt-2">
                {jobDescription.length > 0
                  ? `${jobDescription.split(/\s+/).filter((w) => w.length > 0).length} words`
                  : "Paste the target job description"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              Your data is analysed locally in your browser. Nothing is sent to our servers.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleAnalyze}
                disabled={!canAnalyze || isAnalyzing}
                size="lg"
                className="min-w-[180px]"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Analysing...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Analyse Skills Gap
                  </>
                )}
              </Button>
              <Button
                onClick={handleClear}
                variant="outline"
                size="lg"
                disabled={!resumeText && !jobDescription && !result}
              >
                Clear All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <div id="results">
          <GapResults result={result} />
        </div>
      )}
    </div>
  );
}
