'use client';

import {
  GovernanceAssessment,
  getScoreLabel,
  getImportanceInfo,
} from '@/lib/governance-readiness/analyser';
import { GovernanceRole, AUSTRALIA_AI_PRINCIPLES } from '@/lib/governance-readiness/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  XCircle,
  TrendingUp,
  Shield,
  Target,
  Lightbulb,
  BookOpen,
  AlertCircle,
  ExternalLink,
  Award,
  Briefcase,
} from 'lucide-react';

interface AssessmentResultsProps {
  result: GovernanceAssessment;
  targetRole?: GovernanceRole;
}

export default function AssessmentResults({
  result,
  targetRole,
}: AssessmentResultsProps) {
  const scoreInfo = getScoreLabel(result.overallPercentage);

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Governance Readiness Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="text-6xl font-bold mb-2">
                <span className={scoreInfo.color}>{result.overallPercentage}%</span>
              </div>
              <Badge
                variant="secondary"
                className={`${scoreInfo.bgColor} text-base px-4 py-1`}
              >
                {scoreInfo.label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-center">
              {result.categoryResults.map((cat) => (
                <ScoreIndicator
                  key={cat.name}
                  label={cat.name.split(' ')[0]}
                  percentage={cat.percentage}
                />
              ))}
            </div>
          </div>

          {/* Strengths */}
          {result.strengths.length > 0 && (
            <div className="mt-6 p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 mb-3">
                <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
                <span className="font-semibold text-green-900 dark:text-green-100">
                  Your Strengths
                </span>
              </div>
              <ul className="space-y-2">
                {result.strengths.map((strength, index) => (
                  <li
                    key={index}
                    className="text-sm text-green-800 dark:text-green-200 flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                    {strength}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="font-semibold text-blue-900 dark:text-blue-100">
                  Top Recommendations
                </span>
              </div>
              <ul className="space-y-2">
                {result.recommendations.map((rec, index) => (
                  <li
                    key={index}
                    className="text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2"
                  >
                    <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Role-Specific Analysis */}
      {targetRole && result.roleSpecificScore !== null && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              {targetRole} Readiness
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl font-bold">
                <span
                  className={
                    result.roleSpecificScore >= 70
                      ? 'text-green-600'
                      : result.roleSpecificScore >= 50
                        ? 'text-blue-600'
                        : result.roleSpecificScore >= 30
                          ? 'text-yellow-600'
                          : 'text-orange-600'
                  }
                >
                  {result.roleSpecificScore}%
                </span>
              </div>
              <Progress value={result.roleSpecificScore} className="flex-1 h-3" />
            </div>
            <p className="text-sm text-muted-foreground">
              {result.roleSpecificFeedback}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Category Breakdown */}
      {result.categoryResults.map((category) => (
        <Card key={category.name}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                {category.name}
              </div>
              <Badge variant="outline">
                {category.matchedSkills.length} /{' '}
                {category.matchedSkills.length + category.missingSkills.length} skills
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground">{category.description}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-2xl font-bold">
                <span
                  className={
                    category.percentage >= 70
                      ? 'text-green-600'
                      : category.percentage >= 50
                        ? 'text-blue-600'
                        : category.percentage >= 30
                          ? 'text-yellow-600'
                          : 'text-orange-600'
                  }
                >
                  {category.percentage}%
                </span>
              </div>
              <Progress value={category.percentage} className="flex-1 h-2" />
            </div>

            {/* Matched Skills */}
            {category.matchedSkills.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    Skills Found ({category.matchedSkills.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.matchedSkills.map((skill) => {
                    const info = getImportanceInfo(skill.importance);
                    return (
                      <Badge
                        key={skill.skillName}
                        variant="secondary"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                      >
                        {skill.skillName}
                        <span className={`ml-1 text-xs opacity-70`}>
                          ({info.label})
                        </span>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {category.missingSkills.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">
                    Skills to Develop
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {category.missingSkills.map((skill) => {
                    const info = getImportanceInfo(skill.importance);
                    return (
                      <Badge
                        key={skill.skillName}
                        variant="outline"
                        className={`${info.color} border-current`}
                      >
                        {skill.skillName}
                        <span className="ml-1 text-xs opacity-70">
                          ({info.label})
                        </span>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Learning Resources for Top Gaps */}
      {result.topGaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Recommended Learning Resources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.topGaps
                .filter((gap) => gap.learningResources.length > 0)
                .slice(0, 6)
                .map((gap) => (
                  <div
                    key={gap.skillName}
                    className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <Target className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{gap.skillName}</span>
                        <Badge
                          variant="outline"
                          className={`text-xs ${getImportanceInfo(gap.importance).color}`}
                        >
                          {getImportanceInfo(gap.importance).label}
                        </Badge>
                      </div>
                      {gap.learningResources.map((resource, idx) => (
                        <a
                          key={idx}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline flex items-center gap-1 mt-1"
                        >
                          {resource.name}
                          <span className="text-xs text-muted-foreground">
                            — {resource.provider}
                            {resource.isFree ? ' (Free)' : ''}
                          </span>
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Australia's AI Ethics Principles Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Australia&apos;s 8 AI Ethics Principles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            These are the foundation of AI governance in Australia. Understanding and
            being able to apply these principles is essential for any governance role.
          </p>
          <div className="grid md:grid-cols-2 gap-3">
            {AUSTRALIA_AI_PRINCIPLES.map((principle, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary">{index + 1}</span>
                </div>
                <span className="text-sm font-medium">{principle}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper components
function ScoreIndicator({
  label,
  percentage,
}: {
  label: string;
  percentage: number;
}) {
  const color =
    percentage >= 70
      ? 'text-green-600'
      : percentage >= 50
        ? 'text-blue-600'
        : percentage >= 30
          ? 'text-yellow-600'
          : 'text-orange-600';

  return (
    <div className="p-3 bg-muted rounded-lg">
      <div className={`text-xl font-bold ${color}`}>{percentage}%</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
