"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { analyzeResume, AnalysisResult } from "@/lib/resume-analyser/analyzer";
import AnalysisResults from "./AnalysisResults";
import { FileText, Loader2 } from "lucide-react";

export default function ResumeAnalyzer() {
  const [resumeText, setResumeText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const handleAnalyze = () => {
    if (!resumeText.trim()) {
      return;
    }

    setIsAnalyzing(true);

    // Simulate a small delay for better UX (feels more "real")
    setTimeout(() => {
      const analysisResult = analyzeResume(resumeText);
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
    setResult(null);
  };

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Paste Your Resume Text
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Textarea
              placeholder="Include your work experience, skills, education, and any relevant technical details."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="min-h-[300px] text-sm md:text-base font-mono"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Your resume is analysed locally in your browser. No data is sent
              to our servers.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleAnalyze}
              disabled={!resumeText.trim() || isAnalyzing}
              size="lg"
              className="min-w-[150px]"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analysing...
                </>
              ) : (
                "Analyse Resume"
              )}
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              size="lg"
              disabled={!resumeText && !result}
            >
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div id="results" aria-live="polite">
        {result && (
          <AnalysisResults result={result} />
        )}
      </div>
    </div>
  );
}
