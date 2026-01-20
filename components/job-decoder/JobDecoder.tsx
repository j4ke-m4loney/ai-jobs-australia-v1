"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { decodeJobDescription, JobDecoderResult } from "@/lib/job-decoder/decoder";
import DecoderResults from "./DecoderResults";
import { FileSearch, Loader2 } from "lucide-react";

export default function JobDecoder() {
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<JobDecoderResult | null>(null);

  const handleAnalyze = () => {
    if (!jobDescription.trim()) {
      return;
    }

    setIsAnalyzing(true);

    // Simulate a small delay for better UX
    setTimeout(() => {
      const decoderResult = decodeJobDescription(jobDescription);
      setResult(decoderResult);
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
    setJobDescription("");
    setResult(null);
  };

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSearch className="w-5 h-5" />
            Paste Job Description
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Textarea
              placeholder="Paste the full job description here. Include requirements, responsibilities, benefits, and any other details from the job posting."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="min-h-[300px] text-sm md:text-base"
            />
            <p className="text-sm text-muted-foreground mt-2">
              Your job description is analysed locally in your browser. No data is sent to our servers.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleAnalyze}
              disabled={!jobDescription.trim() || isAnalyzing}
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
                  <FileSearch className="w-4 h-4 mr-2" />
                  Decode Job Description
                </>
              )}
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              size="lg"
              disabled={!jobDescription && !result}
            >
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <div id="results">
          <DecoderResults result={result} />
        </div>
      )}
    </div>
  );
}
