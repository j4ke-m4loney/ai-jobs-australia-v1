'use client';

import { useState } from 'react';
import { GeneratedJD, getQualityColor } from '@/lib/jd-generator/generator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  ClipboardCopy,
  Check,
  DollarSign,
  ShieldCheck,
  BarChart3,
} from 'lucide-react';

interface JDResultsProps {
  result: GeneratedJD;
}

export default function JDResults({ result }: JDResultsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.fullText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = result.fullText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const passCount = result.qualityChecks.filter((c) => c.status === 'pass').length;
  const warnCount = result.qualityChecks.filter((c) => c.status === 'warning').length;
  const failCount = result.qualityChecks.filter((c) => c.status === 'fail').length;

  return (
    <div className="space-y-6">
      {/* Generated JD */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {result.title}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopy}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <ClipboardCopy className="w-4 h-4" />
                  Copy JD
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {result.sections.map((section, index) => (
              <div key={index} className="mb-6">
                <h3 className="text-lg font-semibold mb-3">{section.heading}</h3>
                {section.type === 'paragraph' ? (
                  <p className="text-muted-foreground leading-relaxed">
                    {section.content}
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {section.content
                      .split('\n')
                      .filter((line) => line.startsWith('•'))
                      .map((line, i) => (
                        <li
                          key={i}
                          className="text-muted-foreground flex items-start gap-2"
                        >
                          <span className="text-primary mt-0.5">•</span>
                          <span>{line.slice(2)}</span>
                        </li>
                      ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            JD Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatItem
              label="Words"
              value={result.stats.wordCount}
              optimal={result.stats.wordCount >= 500 && result.stats.wordCount <= 800}
              hint="500-800 optimal"
            />
            <StatItem
              label="Required Skills"
              value={result.stats.requiredSkillCount}
              optimal={
                result.stats.requiredSkillCount >= 4 &&
                result.stats.requiredSkillCount <= 8
              }
              hint="4-8 optimal"
            />
            <StatItem
              label="Nice-to-Have"
              value={result.stats.niceToHaveCount}
              optimal={result.stats.niceToHaveCount >= 3}
              hint="3-4 optimal"
            />
            <StatItem
              label="Responsibilities"
              value={result.stats.responsibilityCount}
              optimal={
                result.stats.responsibilityCount >= 5 &&
                result.stats.responsibilityCount <= 8
              }
              hint="5-8 optimal"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quality Checks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5" />
              Quality Checks
            </div>
            <div className="flex items-center gap-2">
              {passCount > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                >
                  {passCount} passed
                </Badge>
              )}
              {warnCount > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                >
                  {warnCount} warnings
                </Badge>
              )}
              {failCount > 0 && (
                <Badge
                  variant="secondary"
                  className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
                >
                  {failCount} issues
                </Badge>
              )}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {result.qualityChecks.map((check, index) => {
              const Icon =
                check.status === 'pass'
                  ? CheckCircle2
                  : check.status === 'warning'
                    ? AlertTriangle
                    : XCircle;

              return (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    check.status === 'pass'
                      ? 'bg-green-50 dark:bg-green-950'
                      : check.status === 'warning'
                        ? 'bg-yellow-50 dark:bg-yellow-950'
                        : 'bg-red-50 dark:bg-red-950'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 flex-shrink-0 mt-0.5 ${getQualityColor(check.status)}`}
                  />
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        check.status === 'pass'
                          ? 'text-green-800 dark:text-green-200'
                          : check.status === 'warning'
                            ? 'text-yellow-800 dark:text-yellow-200'
                            : 'text-red-800 dark:text-red-200'
                      }`}
                    >
                      {check.message}
                    </p>
                    {check.suggestion && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {check.suggestion}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Salary Benchmark */}
      {result.salaryBenchmark && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Salary Benchmark
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <div className="text-sm text-muted-foreground mb-1">
                    Market Range
                  </div>
                  <div className="text-lg font-bold text-primary">
                    ${result.salaryBenchmark.marketMin.toLocaleString()} –{' '}
                    ${result.salaryBenchmark.marketMax.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">+ super</div>
                </div>
                {result.salaryBenchmark.listedMin &&
                  result.salaryBenchmark.listedMax && (
                    <div className="p-4 bg-muted rounded-lg text-center">
                      <div className="text-sm text-muted-foreground mb-1">
                        Your Range
                      </div>
                      <div className="text-lg font-bold">
                        <span
                          className={
                            result.salaryBenchmark.competitiveness === 'above'
                              ? 'text-green-600'
                              : result.salaryBenchmark.competitiveness === 'competitive'
                                ? 'text-blue-600'
                                : 'text-orange-600'
                          }
                        >
                          ${result.salaryBenchmark.listedMin.toLocaleString()} –{' '}
                          ${result.salaryBenchmark.listedMax.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <Badge
                          variant="outline"
                          className={`text-xs mt-1 ${
                            result.salaryBenchmark.competitiveness === 'above'
                              ? 'text-green-600 border-green-300'
                              : result.salaryBenchmark.competitiveness === 'competitive'
                                ? 'text-blue-600 border-blue-300'
                                : 'text-orange-600 border-orange-300'
                          }`}
                        >
                          {result.salaryBenchmark.competitiveness === 'above'
                            ? 'Above Market'
                            : result.salaryBenchmark.competitiveness === 'competitive'
                              ? 'Competitive'
                              : 'Below Market'}
                        </Badge>
                      </div>
                    </div>
                  )}
              </div>
              <p className="text-sm text-muted-foreground">
                {result.salaryBenchmark.feedback}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Helper component
function StatItem({
  label,
  value,
  optimal,
  hint,
}: {
  label: string;
  value: number;
  optimal: boolean;
  hint: string;
}) {
  return (
    <div className="text-center p-3 bg-muted rounded-lg">
      <div
        className={`text-2xl font-bold ${optimal ? 'text-green-600' : 'text-yellow-600'}`}
      >
        {value}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
      {hint && (
        <div className="text-xs text-muted-foreground mt-1">{hint}</div>
      )}
    </div>
  );
}
