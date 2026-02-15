'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Trophy,
  Medal,
  ArrowRight,
  RotateCcw,
  DollarSign,
  TrendingUp,
  Zap,
  Calculator,
  Search,
  FileText,
} from 'lucide-react';
import {
  type QuizResults as QuizResultsType,
  type CareerPathResult,
  formatSalaryRange,
  getDemandLevelColour,
} from '@/lib/career-quiz/scoring';

interface QuizResultsProps {
  results: QuizResultsType;
  onRetake: () => void;
}

function CareerPathCard({
  result,
  rank,
  featured,
}: {
  result: CareerPathResult;
  rank: number;
  featured?: boolean;
}) {
  const salaryText = formatSalaryRange(result.path.salaryRange.min, result.path.salaryRange.max);
  const demandColour = getDemandLevelColour(result.path.demandLevel);

  return (
    <Card
      className={
        featured
          ? 'border-2 border-primary bg-primary/5'
          : 'border hover:border-primary/50 transition-colors'
      }
    >
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {rank === 1 && <Trophy className="w-6 h-6 text-yellow-500 flex-shrink-0" />}
            {rank === 2 && <Medal className="w-5 h-5 text-gray-400 flex-shrink-0" />}
            {rank === 3 && <Medal className="w-5 h-5 text-amber-600 flex-shrink-0" />}
            <CardTitle className={featured ? 'text-2xl' : 'text-xl'}>
              {result.path.name}
            </CardTitle>
          </div>
          <div className="text-right flex-shrink-0">
            <span className={`text-2xl font-bold ${featured ? 'text-primary' : ''}`}>
              {result.percentage}%
            </span>
            <p className="text-xs text-muted-foreground">match</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground">{result.path.description}</p>

        <div className="flex flex-wrap gap-2">
          {result.path.keySkills.map((skill) => (
            <Badge key={skill} variant="secondary">
              {skill}
            </Badge>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            <span>{salaryText}</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-4 h-4 flex-shrink-0 ${demandColour}`} />
            <span className={demandColour}>{result.path.demandLevel} demand</span>
          </div>
        </div>

        <Button asChild className="w-full group/btn">
          <Link href={`/jobs?q=${encodeURIComponent(result.path.jobSearchSlug)}`}>
            Browse {result.path.name} Jobs
            <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function QuizResults({ results, onRetake }: QuizResultsProps) {
  return (
    <div id="results" className="space-y-10">
      {/* Top Match */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-bold">Your Top Match</h2>
        </div>
        <CareerPathCard result={results.topMatch} rank={1} featured />
      </div>

      {/* Runner-ups */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold">Strong Matches</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {results.runnerUps.map((result, index) => (
            <CareerPathCard key={result.path.id} result={result} rank={index + 2} />
          ))}
        </div>
      </div>

      {/* All Scores */}
      <Card>
        <CardHeader>
          <CardTitle>All Career Path Scores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {results.allResults.map((result) => (
            <div key={result.path.id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{result.path.name}</span>
                <span className="text-muted-foreground">{result.percentage}%</span>
              </div>
              <Progress value={result.percentage} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link
              href="/tools/ai-ml-salary-calculator"
              className="flex items-center gap-3 p-3 rounded-lg bg-background border hover:border-primary/50 transition-colors"
            >
              <Calculator className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Salary Calculator</p>
                <p className="text-xs text-muted-foreground">Check your earning potential</p>
              </div>
            </Link>
            <Link
              href="/tools/ai-skills-gap-analyser"
              className="flex items-center gap-3 p-3 rounded-lg bg-background border hover:border-primary/50 transition-colors"
            >
              <Search className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Skills Gap Analyser</p>
                <p className="text-xs text-muted-foreground">Find what to learn next</p>
              </div>
            </Link>
            <Link
              href="/tools/ai-jobs-resume-keyword-analyser"
              className="flex items-center gap-3 p-3 rounded-lg bg-background border hover:border-primary/50 transition-colors"
            >
              <FileText className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="font-medium text-sm">Resume Analyser</p>
                <p className="text-xs text-muted-foreground">Optimise for AI roles</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Retake */}
      <div className="text-center">
        <Button variant="outline" size="lg" onClick={onRetake}>
          <RotateCcw className="w-4 h-4 mr-2" />
          Retake Quiz
        </Button>
      </div>
    </div>
  );
}
