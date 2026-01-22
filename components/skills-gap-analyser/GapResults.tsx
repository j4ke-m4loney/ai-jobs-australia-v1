"use client";

import {
  GapAnalysisResult,
  getScoreInfo,
  getPriorityInfo,
} from "@/lib/skills-gap-analyser/analyser";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  XCircle,
  TrendingUp,
  Target,
  BookOpen,
  Lightbulb,
  ExternalLink,
  Plus,
  AlertCircle,
} from "lucide-react";

interface GapResultsProps {
  result: GapAnalysisResult;
}

export default function GapResults({ result }: GapResultsProps) {
  const scoreInfo = getScoreInfo(result.overallMatchScore);

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Skills Gap Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Score */}
            <div className="text-center md:text-left">
              <div className="text-5xl font-bold mb-2">
                <span className={scoreInfo.color}>
                  {result.overallMatchScore}%
                </span>
              </div>
              <Badge className={`${scoreInfo.bgColor} ${scoreInfo.color}`}>
                {scoreInfo.label}
              </Badge>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {result.matchedSkillsCount}
                </div>
                <div className="text-sm text-muted-foreground">
                  Skills Matched
                </div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {result.missingSkillsCount}
                </div>
                <div className="text-sm text-muted-foreground">Skills Gaps</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {result.totalJobSkills}
                </div>
                <div className="text-sm text-muted-foreground">
                  Job Skills
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              {result.summary}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      {result.categoryAnalysis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Skills by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.categoryAnalysis.map((category) => (
                <div
                  key={category.category}
                  className="p-4 bg-muted/50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{category.category}</h4>
                    <Badge
                      variant="outline"
                      className={
                        category.matchPercentage >= 70
                          ? "text-green-600 border-green-300"
                          : category.matchPercentage >= 40
                          ? "text-yellow-600 border-yellow-300"
                          : "text-orange-600 border-orange-300"
                      }
                    >
                      {category.matchPercentage}% match
                    </Badge>
                  </div>
                  <Progress
                    value={category.matchPercentage}
                    className="h-2 mb-3"
                  />
                  <div className="flex flex-wrap gap-2">
                    {category.matches.map((match) => (
                      <Badge
                        key={match.skill.name}
                        variant="secondary"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        {match.skill.name}
                      </Badge>
                    ))}
                    {category.gaps.map((gap) => (
                      <Badge
                        key={gap.skill.name}
                        variant="outline"
                        className="text-orange-600 border-orange-300"
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        {gap.skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Matched Skills */}
      {result.strongMatches.length > 0 && (
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-700">
              <CheckCircle2 className="w-5 h-5" />
              Skills You Have
              <Badge variant="secondary" className="ml-auto">
                {result.strongMatches.length} matched
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              These skills from your resume match what the employer is looking
              for. Highlight these prominently in your application.
            </p>
            <div className="flex flex-wrap gap-2">
              {result.strongMatches.map((match) => (
                <Badge
                  key={match.skill.name}
                  variant="secondary"
                  className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 py-1.5"
                >
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {match.skill.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Missing Skills (Gaps) */}
      {result.missingSkills.length > 0 && (
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="w-5 h-5" />
              Skills to Develop
              <Badge
                variant="secondary"
                className="ml-auto bg-orange-100 text-orange-800"
              >
                {result.missingSkills.length} gaps
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              These skills are mentioned in the job description but not found in
              your resume. Consider developing these to strengthen your
              application.
            </p>
            <div className="space-y-3">
              {result.missingSkills.map((gap) => {
                const priorityInfo = getPriorityInfo(gap.priority);
                return (
                  <div
                    key={gap.skill.name}
                    className={`p-4 rounded-lg border ${priorityInfo.bgColor} ${priorityInfo.borderColor}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{gap.skill.name}</span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${priorityInfo.color} ${priorityInfo.borderColor}`}
                          >
                            {priorityInfo.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {gap.reason}
                        </p>
                      </div>
                    </div>

                    {/* Learning Resources */}
                    {gap.learningResources.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-dashed">
                        <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                          <BookOpen className="w-3 h-3" />
                          Learning Resources
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {gap.learningResources.map((resource, idx) => (
                            <a
                              key={idx}
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs px-2 py-1 bg-white dark:bg-gray-800 rounded border hover:border-primary transition-colors"
                            >
                              {resource.name}
                              <ExternalLink className="w-3 h-3" />
                              {resource.isFree && (
                                <Badge
                                  variant="secondary"
                                  className="text-[10px] px-1 py-0 ml-1"
                                >
                                  Free
                                </Badge>
                              )}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Skills */}
      {result.additionalSkills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-blue-600" />
              Your Additional Skills
              <Badge variant="secondary" className="ml-auto">
                {result.additionalSkills.length} skills
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              These skills are in your resume but not specifically mentioned in
              this job description. They could still be valuable - consider
              which ones might differentiate you.
            </p>
            <div className="flex flex-wrap gap-2">
              {result.additionalSkills.map((skill) => (
                <Badge
                  key={skill.name}
                  variant="outline"
                  className="text-blue-600 border-blue-300"
                >
                  {skill.name}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {result.recommendations.length > 0 && (
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <Lightbulb className="w-5 h-5" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {result.recommendations.map((rec, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-blue-900 dark:text-blue-100"
                >
                  <span className="text-blue-500 mt-1">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>
            <strong>1. Update your resume:</strong> Ensure matching skills are
            clearly visible and use similar terminology to the job description.
          </p>
          <p>
            <strong>2. Address gaps:</strong> For high-priority gaps, consider
            taking online courses or working on portfolio projects.
          </p>
          <p>
            <strong>3. Prepare for interview:</strong> Be ready to discuss both
            your matching skills and how you&apos;re developing in gap areas.
          </p>
          <p>
            <strong>4. Use our other tools:</strong> Try our Interview Question
            Generator to practice, or check salary expectations with our Salary
            Calculator.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
