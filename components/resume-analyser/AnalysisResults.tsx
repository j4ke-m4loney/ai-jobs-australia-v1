'use client';

import { AnalysisResult, getScoreLabel } from '@/lib/resume-analyser/analyzer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, TrendingUp, FileText, Clock } from 'lucide-react';

interface AnalysisResultsProps {
  result: AnalysisResult;
}

export default function AnalysisResults({ result }: AnalysisResultsProps) {
  const scoreInfo = getScoreLabel(result.percentage);

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Overall Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <div className="text-5xl font-bold mb-2">
                <span className={scoreInfo.color}>{result.percentage}%</span>
              </div>
              <div className="text-lg text-muted-foreground">
                ATS Compatibility Score
              </div>
              <Badge variant="secondary" className="mt-2">
                {scoreInfo.label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {result.totalKeywordsFound}
                </div>
                <div className="text-sm text-muted-foreground">
                  Keywords Found
                </div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {result.totalKeywordsPossible - result.totalKeywordsFound}
                </div>
                <div className="text-sm text-muted-foreground">
                  Missing Keywords
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              {result.recommendation}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Readability Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Resume Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">
                  {result.readabilityStats.wordCount.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Words</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">
                  {result.readabilityStats.characterCount.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Characters</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">
                  {result.readabilityStats.estimatedReadingTime}
                </div>
                <div className="text-sm text-muted-foreground">Min Read</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Keyword Breakdown by Category</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {result.categoryResults.map((category) => (
            <div key={category.name} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{category.name}</h3>
                <Badge variant="outline">
                  {category.foundKeywords.length} / {category.foundKeywords.length + category.missingKeywords.length}
                </Badge>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${(category.score / category.maxScore) * 100}%`,
                  }}
                />
              </div>

              {/* Found keywords */}
              {category.foundKeywords.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-600">
                      Found ({category.foundKeywords.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {category.foundKeywords.map((match) => (
                      <Badge
                        key={match.keyword}
                        variant="secondary"
                        className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                      >
                        {match.keyword}
                        {match.count > 1 && (
                          <span className="ml-1 text-xs">×{match.count}</span>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing keywords - show only first 10 */}
              {category.missingKeywords.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Missing ({category.missingKeywords.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {category.missingKeywords.slice(0, 10).map((keyword) => (
                      <Badge
                        key={keyword}
                        variant="outline"
                        className="text-muted-foreground"
                      >
                        {keyword}
                      </Badge>
                    ))}
                    {category.missingKeywords.length > 10 && (
                      <Badge variant="outline" className="text-muted-foreground">
                        +{category.missingKeywords.length - 10} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Top Missing Keywords */}
      {result.topMissingKeywords.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Top Keywords to Consider Adding</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              These high-value keywords are commonly found in AI/ML job descriptions.
              Add them if they match your actual experience.
            </p>
            <div className="flex flex-wrap gap-2">
              {result.topMissingKeywords.map((keyword) => (
                <Badge
                  key={keyword}
                  variant="secondary"
                  className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                >
                  {keyword}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
