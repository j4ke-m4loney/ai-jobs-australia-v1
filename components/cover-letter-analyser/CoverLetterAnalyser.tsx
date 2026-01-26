'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { analyseCoverLetter, CoverLetterAnalysis } from '@/lib/cover-letter-analyser/analyser';
import { AI_ROLES, AIRole } from '@/lib/cover-letter-analyser/data';
import AnalyserResults from './AnalyserResults';
import { Mail, Loader2, Building2, Briefcase } from 'lucide-react';

export default function CoverLetterAnalyser() {
  const [coverLetterText, setCoverLetterText] = useState('');
  const [targetRole, setTargetRole] = useState<AIRole | ''>('');
  const [companyName, setCompanyName] = useState('');
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [result, setResult] = useState<CoverLetterAnalysis | null>(null);

  const handleAnalyse = () => {
    if (!coverLetterText.trim()) {
      return;
    }

    setIsAnalysing(true);

    // Simulate a small delay for better UX
    setTimeout(() => {
      const analysisResult = analyseCoverLetter(
        coverLetterText,
        targetRole || undefined,
        companyName.trim() || undefined
      );
      setResult(analysisResult);
      setIsAnalysing(false);

      // Scroll to results
      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }, 800);
  };

  const handleClear = () => {
    setCoverLetterText('');
    setTargetRole('');
    setCompanyName('');
    setResult(null);
  };

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Paste Your Cover Letter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Optional inputs */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target-role" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                Target Role (Optional)
              </Label>
              <Select
                value={targetRole}
                onValueChange={(value) => setTargetRole(value as AIRole)}
              >
                <SelectTrigger id="target-role">
                  <SelectValue placeholder="Select a role for tailored analysis" />
                </SelectTrigger>
                <SelectContent>
                  {AI_ROLES.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Select your target role to get role-specific keyword suggestions
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-name" className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                Company Name (Optional)
              </Label>
              <Input
                id="company-name"
                type="text"
                placeholder="e.g., Atlassian, Canva, Google"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter the company name to check for personalisation
              </p>
            </div>
          </div>

          {/* Cover letter textarea */}
          <div className="space-y-2">
            <Textarea
              placeholder="Dear Hiring Team,

I am excited to apply for the Machine Learning Engineer position at [Company Name]. With over 5 years of experience developing production ML systems, I am drawn to your team's innovative work in...

[Paste your full cover letter here]"
              value={coverLetterText}
              onChange={(e) => setCoverLetterText(e.target.value)}
              className="min-h-[350px] text-sm md:text-base"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <p>
                Your cover letter is analysed locally in your browser. No data is sent to our
                servers.
              </p>
              <p>{coverLetterText.split(/\s+/).filter((w) => w.length > 0).length} words</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleAnalyse}
              disabled={!coverLetterText.trim() || isAnalysing}
              size="lg"
              className="min-w-[180px]"
            >
              {isAnalysing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analysing...
                </>
              ) : (
                'Analyse Cover Letter'
              )}
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              size="lg"
              disabled={!coverLetterText && !result && !targetRole && !companyName}
            >
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <div id="results">
          <AnalyserResults result={result} />
        </div>
      )}
    </div>
  );
}
