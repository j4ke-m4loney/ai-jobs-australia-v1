'use client';

import {
  CoverLetterAnalysis,
  getScoreLabel,
} from '@/lib/cover-letter-analyser/analyser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  FileText,
  Zap,
  User,
  Target,
  Lightbulb,
  AlertCircle,
} from 'lucide-react';

interface AnalyserResultsProps {
  result: CoverLetterAnalysis;
}

export default function AnalyserResults({ result }: AnalyserResultsProps) {
  const scoreInfo = getScoreLabel(result.overallPercentage);

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Overall Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="text-6xl font-bold mb-2">
                <span className={scoreInfo.color}>{result.overallPercentage}%</span>
              </div>
              <Badge variant="secondary" className={`${scoreInfo.bgColor} text-base px-4 py-1`}>
                {scoreInfo.label}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
              <ScoreIndicator
                label="Structure"
                score={result.structureScore.score}
                maxScore={result.structureScore.maxScore}
              />
              <ScoreIndicator
                label="Keywords"
                score={result.keywordScore.score}
                maxScore={result.keywordScore.maxScore}
              />
              <ScoreIndicator
                label="Personal"
                score={result.personalisationScore.score}
                maxScore={result.personalisationScore.maxScore}
              />
              <ScoreIndicator
                label="Verbs"
                score={result.actionVerbScore.score}
                maxScore={result.actionVerbScore.maxScore}
              />
              <ScoreIndicator
                label="Length"
                score={result.readabilityScore.score}
                maxScore={result.readabilityScore.maxScore}
              />
            </div>
          </div>

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
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

      {/* Red Flags */}
      {result.redFlags.length > 0 && (
        <Card className="border-red-200 dark:border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
              Red Flags Detected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.redFlags.map((flag, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg ${
                    flag.severity === 'high'
                      ? 'bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800'
                      : flag.severity === 'medium'
                        ? 'bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800'
                        : 'bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <AlertCircle
                    className={`w-5 h-5 flex-shrink-0 ${
                      flag.severity === 'high'
                        ? 'text-red-600'
                        : flag.severity === 'medium'
                          ? 'text-yellow-600'
                          : 'text-gray-500'
                    }`}
                  />
                  <div>
                    <Badge
                      variant="outline"
                      className={`mb-1 text-xs ${
                        flag.severity === 'high'
                          ? 'border-red-300 text-red-700'
                          : flag.severity === 'medium'
                            ? 'border-yellow-300 text-yellow-700'
                            : 'border-gray-300 text-gray-600'
                      }`}
                    >
                      {flag.severity === 'high' ? 'High Priority' : flag.severity === 'medium' ? 'Medium' : 'Low'}
                    </Badge>
                    <p className="text-sm text-gray-800 dark:text-gray-200">{flag.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Structure Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Structure Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <StructureItem
              label="Opening Hook"
              isGood={result.structureScore.hasStrongOpening}
              feedback={result.structureScore.openingFeedback}
            />
            <StructureItem
              label="Body Content"
              isGood={result.structureScore.hasBodyContent}
              feedback={
                result.structureScore.hasBodyContent
                  ? 'Good body content with supporting details'
                  : 'Add more substance to your body paragraphs'
              }
            />
            <StructureItem
              label="Closing & CTA"
              isGood={result.structureScore.hasClosingCTA}
              feedback={result.structureScore.closingFeedback}
            />
          </div>
        </CardContent>
      </Card>

      {/* Keyword Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Keyword Coverage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {result.keywordScore.categoryBreakdown.map((category) => (
            <div key={category.name} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{category.name}</h3>
                <Badge variant="outline">
                  {category.foundKeywords.length} /{' '}
                  {category.foundKeywords.length + category.missingKeywords.length}
                </Badge>
              </div>

              <Progress
                value={(category.score / category.maxScore) * 100}
                className="h-2"
              />

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
                          <span className="ml-1 text-xs opacity-70">x{match.count}</span>
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {category.missingKeywords.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">
                      Consider Adding
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {category.missingKeywords.slice(0, 6).map((keyword) => (
                      <Badge
                        key={keyword}
                        variant="outline"
                        className="text-muted-foreground"
                      >
                        {keyword}
                      </Badge>
                    ))}
                    {category.missingKeywords.length > 6 && (
                      <Badge variant="outline" className="text-muted-foreground">
                        +{category.missingKeywords.length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Personalisation Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Personalisation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="text-2xl font-bold text-primary">
                {result.personalisationScore.companyMentions}
              </div>
              <div className="text-sm text-muted-foreground">Company Mentions</div>
            </div>
            <div className="p-4 bg-muted rounded-lg text-center">
              <div className="text-2xl font-bold text-primary">
                {result.personalisationScore.roleMentions}
              </div>
              <div className="text-sm text-muted-foreground">Role Mentions</div>
            </div>
          </div>

          {result.personalisationScore.personalTouches.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">What&apos;s Working</span>
              </div>
              <ul className="space-y-1">
                {result.personalisationScore.personalTouches.map((touch, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                    <span className="text-green-600">•</span>
                    {touch}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.personalisationScore.genericPhrases.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-600">
                  Generic Phrases to Replace
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.personalisationScore.genericPhrases.map((phrase, index) => (
                  <Badge key={index} variant="outline" className="text-yellow-700 border-yellow-300">
                    &quot;{phrase}&quot;
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Verbs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Action Verbs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.actionVerbScore.foundVerbs.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  Power Verbs Used ({result.actionVerbScore.foundVerbs.length})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.actionVerbScore.foundVerbs.map((verb) => (
                  <Badge
                    key={verb}
                    variant="secondary"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                  >
                    {verb}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {result.actionVerbScore.suggestedVerbs.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">
                  Suggested Verbs to Try
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {result.actionVerbScore.suggestedVerbs.map((verb) => (
                  <Badge key={verb} variant="outline" className="text-blue-700 border-blue-300">
                    {verb}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Quick Stats
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatItem
              label="Words"
              value={result.stats.wordCount}
              optimal={result.stats.wordCount >= 250 && result.stats.wordCount <= 400}
              hint="250-400 optimal"
            />
            <StatItem
              label="Paragraphs"
              value={result.stats.paragraphCount}
              optimal={result.stats.paragraphCount >= 3 && result.stats.paragraphCount <= 5}
              hint="3-5 optimal"
            />
            <StatItem
              label="Sentences"
              value={result.stats.sentenceCount}
              optimal={result.stats.sentenceCount >= 8 && result.stats.sentenceCount <= 20}
              hint="8-20 optimal"
            />
            <StatItem
              label="Characters"
              value={result.stats.characterCount}
              optimal={true}
              hint=""
            />
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {result.readabilityScore.lengthFeedback}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper components
function ScoreIndicator({
  label,
  score,
  maxScore,
}: {
  label: string;
  score: number;
  maxScore: number;
}) {
  const percentage = Math.round((score / maxScore) * 100);
  const color =
    percentage >= 70
      ? 'text-green-600'
      : percentage >= 50
        ? 'text-blue-600'
        : percentage >= 30
          ? 'text-yellow-600'
          : 'text-red-600';

  return (
    <div className="p-3 bg-muted rounded-lg">
      <div className={`text-xl font-bold ${color}`}>{percentage}%</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function StructureItem({
  label,
  isGood,
  feedback,
}: {
  label: string;
  isGood: boolean;
  feedback: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
      {isGood ? (
        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
      ) : (
        <XCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
      )}
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-sm text-muted-foreground">{feedback}</div>
      </div>
    </div>
  );
}

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
      <div className={`text-2xl font-bold ${optimal ? 'text-green-600' : 'text-yellow-600'}`}>
        {value.toLocaleString()}
      </div>
      <div className="text-sm text-muted-foreground">{label}</div>
      {hint && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}
