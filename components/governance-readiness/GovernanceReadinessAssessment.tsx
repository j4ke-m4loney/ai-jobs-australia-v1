'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  analyseGovernanceReadiness,
  GovernanceAssessment,
} from '@/lib/governance-readiness/analyser';
import { GOVERNANCE_ROLES, GovernanceRole } from '@/lib/governance-readiness/data';
import AssessmentResults from './AssessmentResults';
import { Shield, Loader2, Briefcase } from 'lucide-react';

export default function GovernanceReadinessAssessment() {
  const [inputText, setInputText] = useState('');
  const [targetRole, setTargetRole] = useState<GovernanceRole | ''>('');
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [result, setResult] = useState<GovernanceAssessment | null>(null);

  const handleAnalyse = () => {
    if (!inputText.trim()) {
      return;
    }

    setIsAnalysing(true);

    // Simulate a small delay for better UX
    setTimeout(() => {
      const analysisResult = analyseGovernanceReadiness(
        inputText,
        targetRole || undefined
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
    setInputText('');
    setTargetRole('');
    setResult(null);
  };

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Paste Your Resume or Describe Your Experience
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Target role selector */}
          <div className="space-y-2">
            <Label htmlFor="target-role" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-muted-foreground" />
              Target Governance Role (Optional)
            </Label>
            <Select
              value={targetRole}
              onValueChange={(value) => setTargetRole(value as GovernanceRole)}
            >
              <SelectTrigger id="target-role" className="max-w-md">
                <SelectValue placeholder="Select a role for tailored analysis" />
              </SelectTrigger>
              <SelectContent>
                {GOVERNANCE_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Select a role to get specific feedback on your readiness for that position
            </p>
          </div>

          {/* Main textarea */}
          <div className="space-y-2">
            <Textarea
              placeholder="Paste your resume here, or describe your experience with AI governance, ethics, risk management, compliance, and related areas.

Example:
I have 5 years of experience in risk management and compliance, with 2 years focused on AI governance. I've developed AI ethics policies aligned with Australia's AI Ethics Principles, conducted algorithmic impact assessments, and established an AI register for my organisation. I hold ISO 42001 certification and have experience with bias detection and explainability frameworks..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[350px] text-sm md:text-base"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <p>
                Your data is analysed locally in your browser. No data is sent to our
                servers.
              </p>
              <p>{inputText.split(/\s+/).filter((w) => w.length > 0).length} words</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleAnalyse}
              disabled={!inputText.trim() || isAnalysing}
              size="lg"
              className="min-w-[180px]"
            >
              {isAnalysing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analysing...
                </>
              ) : (
                'Assess Readiness'
              )}
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              size="lg"
              disabled={!inputText && !result && !targetRole}
            >
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <div id="results">
          <AssessmentResults result={result} targetRole={targetRole || undefined} />
        </div>
      )}
    </div>
  );
}
