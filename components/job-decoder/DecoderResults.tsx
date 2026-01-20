"use client";

import { JobDecoderResult, getScoreLabel, getSeverityColor } from "@/lib/job-decoder/decoder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  DollarSign,
  Award,
  TrendingUp,
  Star,
  AlertCircle,
  Gift,
} from "lucide-react";

interface DecoderResultsProps {
  result: JobDecoderResult;
}

export default function DecoderResults({ result }: DecoderResultsProps) {
  const scoreInfo = getScoreLabel(result.overallScore);

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Job Analysis Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="text-5xl font-bold mb-2">
                <span className={scoreInfo.color}>{result.overallScore}</span>
                <span className="text-2xl text-muted-foreground">/100</span>
              </div>
              <Badge variant="secondary" className="mt-1">
                {scoreInfo.label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {result.stats.totalSkillsFound}
                </div>
                <div className="text-sm text-muted-foreground">Skills Found</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {result.stats.benefitCount}
                </div>
                <div className="text-sm text-muted-foreground">Benefits</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className={`text-2xl font-bold ${result.stats.redFlagCount > 0 ? "text-orange-600" : "text-green-600"}`}>
                  {result.stats.redFlagCount}
                </div>
                <div className="text-sm text-muted-foreground">Red Flags</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-gray-600">
                  {result.stats.wordCount}
                </div>
                <div className="text-sm text-muted-foreground">Words</div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              {result.summary}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Experience Level */}
      {result.experienceLevel && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Experience Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Briefcase className="w-8 h-8 text-primary" />
              </div>
              <div>
                <div className="text-xl font-semibold">{result.experienceLevel.level}</div>
                <div className="text-muted-foreground">{result.experienceLevel.yearsRange}</div>
                <Badge variant="outline" className="mt-1">
                  {result.experienceLevel.confidence} confidence
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Required Skills */}
      {result.requiredSkills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Required Skills
              <Badge variant="secondary" className="ml-auto">
                {result.requiredSkills.length} skills
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from(result.skillsByCategory.entries()).map(([category, skills]) => {
                const requiredInCategory = skills.filter((s) => s.isRequired);
                if (requiredInCategory.length === 0) return null;

                return (
                  <div key={category}>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                      {category}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {requiredInCategory.map((skill) => (
                        <Badge
                          key={skill.skill}
                          variant="secondary"
                          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                        >
                          {skill.skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Nice to Have Skills */}
      {result.niceToHaveSkills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-600" />
              Nice to Have Skills
              <Badge variant="secondary" className="ml-auto">
                {result.niceToHaveSkills.length} skills
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.niceToHaveSkills.map((skill) => (
                <Badge
                  key={skill.skill}
                  variant="outline"
                  className="text-yellow-700 border-yellow-300"
                >
                  {skill.skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Salary Hints */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Salary & Compensation Hints
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {result.salaryHints.map((hint, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-muted rounded-lg"
              >
                <DollarSign className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">{hint.hint}</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {hint.interpretation}
                  </p>
                  {hint.matchedText && (
                    <p className="text-xs text-muted-foreground mt-1 italic">
                      Found: &ldquo;{hint.matchedText}&rdquo;
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Benefits */}
      {result.benefits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-green-600" />
              Benefits & Perks
              <Badge variant="secondary" className="ml-auto">
                {result.benefits.length} found
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.benefits.map((benefit, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                >
                  {benefit.benefit}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Red Flags */}
      <Card className={result.redFlags.length > 0 ? "border-orange-200" : ""}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className={`w-5 h-5 ${result.redFlags.length > 0 ? "text-orange-600" : "text-green-600"}`} />
            {result.redFlags.length > 0 ? "Potential Red Flags" : "No Red Flags Detected"}
            {result.redFlags.length > 0 && (
              <Badge variant="secondary" className="ml-auto bg-orange-100 text-orange-800">
                {result.redFlags.length} found
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {result.redFlags.length === 0 ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
              <p className="text-green-800 dark:text-green-100">
                No significant red flags were detected in this job description. This is a positive sign!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {result.redFlags.map((flag, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg border ${getSeverityColor(flag.severity)}`}
                >
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      {flag.flag}
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          flag.severity === "high"
                            ? "border-red-300 text-red-600"
                            : flag.severity === "medium"
                            ? "border-orange-300 text-orange-600"
                            : "border-yellow-300 text-yellow-600"
                        }`}
                      >
                        {flag.severity}
                      </Badge>
                    </div>
                    <p className="text-sm mt-1 opacity-90">{flag.explanation}</p>
                    <p className="text-xs mt-1 italic opacity-75">
                      Found: &ldquo;{flag.matchedText}&rdquo;
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <Award className="w-5 h-5" />
            Interview Preparation Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-900 dark:text-blue-100 space-y-2">
          <p>
            <strong>Research the company:</strong> Look up recent news, their tech blog, and employee reviews on Glassdoor.
          </p>
          <p>
            <strong>Prepare for skill questions:</strong> Be ready to discuss your experience with the required skills identified above.
          </p>
          {result.redFlags.length > 0 && (
            <p>
              <strong>Ask about red flags:</strong> Prepare tactful questions about the potential concerns noted to get clarity during the interview.
            </p>
          )}
          <p>
            <strong>Salary research:</strong> Use our Salary Calculator to estimate market rates for this role before negotiating.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
