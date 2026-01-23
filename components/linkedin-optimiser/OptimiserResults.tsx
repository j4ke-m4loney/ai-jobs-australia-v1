"use client";

import {
  LinkedInAnalysisResult,
  getScoreLabel,
} from "@/lib/linkedin-optimiser/analyser";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  TrendingUp,
  Lightbulb,
  Target,
  User,
  FileText,
  Briefcase,
  Copy,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface OptimiserResultsProps {
  result: LinkedInAnalysisResult;
}

export default function OptimiserResults({ result }: OptimiserResultsProps) {
  const scoreInfo = getScoreLabel(result.overallScore);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Overall Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Profile Optimisation Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="text-6xl font-bold mb-2">
                <span className={scoreInfo.color}>{result.overallScore}%</span>
              </div>
              <Badge variant="secondary" className="text-base px-3 py-1">
                {scoreInfo.label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {result.stats.totalKeywordsFound}
                </div>
                <div className="text-sm text-muted-foreground">Keywords Found</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {result.stats.sectionsAnalysed}
                </div>
                <div className="text-sm text-muted-foreground">Sections Analysed</div>
              </div>
              <div className="p-4 bg-muted rounded-lg col-span-2 md:col-span-1">
                <div className="text-2xl font-bold text-purple-600">
                  {result.stats.totalCharacters.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Characters</div>
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

      {/* Headline Analysis Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Headline Analysis
          </CardTitle>
          <CardDescription>
            Score: {result.headlineAnalysis.structureScore}/100
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Headline Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-muted rounded-lg text-center">
              <div className="text-lg font-semibold">
                {result.headlineAnalysis.length}/{result.headlineAnalysis.maxLength}
              </div>
              <div className="text-xs text-muted-foreground">Characters</div>
            </div>
            <div className="p-3 bg-muted rounded-lg text-center">
              <div className={`text-lg font-semibold ${result.headlineAnalysis.roleDetected ? 'text-green-600' : 'text-yellow-600'}`}>
                {result.headlineAnalysis.roleDetected ? '✓' : '✗'}
              </div>
              <div className="text-xs text-muted-foreground">Role Detected</div>
            </div>
            <div className="p-3 bg-muted rounded-lg text-center">
              <div className={`text-lg font-semibold ${result.headlineAnalysis.hasValueProp ? 'text-green-600' : 'text-yellow-600'}`}>
                {result.headlineAnalysis.hasValueProp ? '✓' : '✗'}
              </div>
              <div className="text-xs text-muted-foreground">Value Prop</div>
            </div>
            <div className="p-3 bg-muted rounded-lg text-center">
              <div className="text-lg font-semibold text-blue-600">
                {result.headlineAnalysis.keywordsFound.length}
              </div>
              <div className="text-xs text-muted-foreground">Keywords</div>
            </div>
          </div>

          {/* Keywords Found in Headline */}
          {result.headlineAnalysis.keywordsFound.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  Keywords in Headline
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.headlineAnalysis.keywordsFound.map((keyword) => (
                  <Badge
                    key={keyword}
                    variant="secondary"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                  >
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Headline Tips */}
          {result.headlineAnalysis.tips.length > 0 && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="font-medium text-yellow-800 dark:text-yellow-200">
                  Improvement Tips
                </span>
              </div>
              <ul className="list-disc list-inside space-y-1">
                {result.headlineAnalysis.tips.map((tip, index) => (
                  <li key={index} className="text-sm text-yellow-800 dark:text-yellow-200">
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Alternative Headline Suggestions */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span className="font-medium">Alternative Headline Suggestions</span>
            </div>
            <div className="space-y-2">
              {result.headlineAnalysis.suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-lg"
                >
                  <span className="text-sm flex-1 mr-2">{suggestion}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(suggestion, index)}
                    className="shrink-0"
                  >
                    {copiedIndex === index ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About Section Analysis */}
      {result.aboutAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              About Section Analysis
            </CardTitle>
            <CardDescription>
              {result.aboutAnalysis.wordCount} words • {result.aboutAnalysis.keywordsFound.length} keywords found
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-muted-foreground">Keyword Coverage</span>
                <span className="text-sm font-medium">
                  {Math.round((result.aboutAnalysis.score / result.aboutAnalysis.maxScore) * 100)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${(result.aboutAnalysis.score / result.aboutAnalysis.maxScore) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Power Words Found */}
            {result.aboutAnalysis.powerWordsFound.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium">Power Words Detected</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.aboutAnalysis.powerWordsFound.map((word) => (
                    <Badge key={word} variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                      {word}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            {result.aboutAnalysis.tips.length > 0 && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800 dark:text-yellow-200">
                    Recommendations
                  </span>
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {result.aboutAnalysis.tips.map((tip, index) => (
                    <li key={index} className="text-sm text-yellow-800 dark:text-yellow-200">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Experience Section Analysis */}
      {result.experienceAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              Experience Section Analysis
            </CardTitle>
            <CardDescription>
              {result.experienceAnalysis.wordCount} words • {result.experienceAnalysis.keywordsFound.length} keywords found
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-muted-foreground">Keyword Coverage</span>
                <span className="text-sm font-medium">
                  {Math.round((result.experienceAnalysis.score / result.experienceAnalysis.maxScore) * 100)}%
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${(result.experienceAnalysis.score / result.experienceAnalysis.maxScore) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Power Words Found */}
            {result.experienceAnalysis.powerWordsFound.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium">Action Verbs Used</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.experienceAnalysis.powerWordsFound.map((word) => (
                    <Badge key={word} variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100">
                      {word}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            {result.experienceAnalysis.tips.length > 0 && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800 dark:text-yellow-200">
                    Recommendations
                  </span>
                </div>
                <ul className="list-disc list-inside space-y-1">
                  {result.experienceAnalysis.tips.map((tip, index) => (
                    <li key={index} className="text-sm text-yellow-800 dark:text-yellow-200">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Category Breakdown Card */}
      <Card>
        <CardHeader>
          <CardTitle>Keyword Breakdown by Category</CardTitle>
          <CardDescription>
            Keywords detected across all profile sections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {result.categoryBreakdown.map((category) => (
            <div key={category.name} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{category.name}</h3>
                <Badge variant="outline">
                  {category.foundKeywords.length} / {category.foundKeywords.length + category.missingKeywords.length}
                </Badge>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${category.maxScore > 0 ? (category.score / category.maxScore) * 100 : 0}%`,
                  }}
                />
              </div>

              {/* Found Keywords */}
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
                          <span className="ml-1 text-xs opacity-70">×{match.count}</span>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Keywords */}
              {category.missingKeywords.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Consider Adding ({category.missingKeywords.length})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {category.missingKeywords.slice(0, 8).map((keyword) => (
                      <Badge key={keyword} variant="outline" className="text-muted-foreground">
                        {keyword}
                      </Badge>
                    ))}
                    {category.missingKeywords.length > 8 && (
                      <Badge variant="outline" className="text-muted-foreground">
                        +{category.missingKeywords.length - 8} more
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
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Priority Keywords to Add
            </CardTitle>
            <CardDescription>
              High-impact keywords that recruiters commonly search for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {result.topMissingKeywords.map((keyword) => (
                <Badge
                  key={keyword}
                  variant="outline"
                  className="text-sm px-3 py-1 border-primary/50 text-primary"
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
