'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Loader2,
  ArrowRight,
  ArrowLeft,
  Compass,
  Shield,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { QUIZ_QUESTIONS } from '@/lib/career-quiz/quizData';
import { calculateResults, type QuizResults as QuizResultsType } from '@/lib/career-quiz/scoring';
import { QuizResults } from './QuizResults';

type QuizStage = 'intro' | 'questioning' | 'processing' | 'results';

export function CareerQuiz() {
  const [stage, setStage] = useState<QuizStage>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [results, setResults] = useState<QuizResultsType | null>(null);

  const totalQuestions = QUIZ_QUESTIONS.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;

  function handleStart() {
    setStage('questioning');
    setCurrentQuestion(0);
    setAnswers({});
    setResults(null);
  }

  function handleSelectOption(optionIndex: number) {
    const newAnswers = { ...answers, [currentQuestion]: optionIndex };
    setAnswers(newAnswers);

    // Auto-advance after a brief delay
    if (currentQuestion < totalQuestions - 1) {
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
      }, 300);
    }
  }

  function handleNext() {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Submit quiz
      setStage('processing');
      setTimeout(() => {
        const quizResults = calculateResults(answers);
        setResults(quizResults);
        setStage('results');

        setTimeout(() => {
          document.getElementById('results')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }, 100);
      }, 800);
    }
  }

  function handlePrevious() {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  }

  function handleRetake() {
    setStage('intro');
    setCurrentQuestion(0);
    setAnswers({});
    setResults(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Intro stage
  if (stage === 'intro') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="inline-flex p-3 bg-primary/10 rounded-full mx-auto mb-4">
            <Compass className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Discover Your Ideal AI Career Path</CardTitle>
          <CardDescription className="text-base mt-2">
            Answer 12 questions about your skills, interests, and work style to find
            which AI career path suits you best.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <Clock className="w-5 h-5 mx-auto text-muted-foreground" />
              <p className="text-sm font-medium">~2 minutes</p>
              <p className="text-xs text-muted-foreground">Quick & easy</p>
            </div>
            <div className="space-y-1">
              <CheckCircle2 className="w-5 h-5 mx-auto text-muted-foreground" />
              <p className="text-sm font-medium">12 questions</p>
              <p className="text-xs text-muted-foreground">Multiple choice</p>
            </div>
            <div className="space-y-1">
              <Shield className="w-5 h-5 mx-auto text-muted-foreground" />
              <p className="text-sm font-medium">100% private</p>
              <p className="text-xs text-muted-foreground">No data stored</p>
            </div>
          </div>

          <Button onClick={handleStart} size="lg" className="w-full">
            Start Quiz
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Processing stage
  if (stage === 'processing') {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="py-16 text-center space-y-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          <p className="text-lg font-medium">Analysing your responses...</p>
          <p className="text-sm text-muted-foreground">
            Matching your profile against 10 AI career paths
          </p>
        </CardContent>
      </Card>
    );
  }

  // Results stage
  if (stage === 'results' && results) {
    return <QuizResults results={results} onRetake={handleRetake} />;
  }

  // Questioning stage
  const question = QUIZ_QUESTIONS[currentQuestion];
  const hasAnswer = answers[currentQuestion] !== undefined;
  const isLastQuestion = currentQuestion === totalQuestions - 1;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            Question {currentQuestion + 1} of {totalQuestions}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">{question.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = answers[currentQuestion] === index;
            return (
              <button
                key={index}
                onClick={() => handleSelectOption(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border hover:border-primary/30 hover:bg-muted/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                      isSelected ? 'border-primary bg-primary' : 'border-muted-foreground/40'
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <span className={`text-sm ${isSelected ? 'font-medium' : ''}`}>
                    {option.label}
                  </span>
                </div>
              </button>
            );
          })}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <Button onClick={handleNext} disabled={!hasAnswer}>
          {isLastQuestion ? 'See Results' : 'Next'}
          <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>

      {/* Privacy note */}
      <p className="text-xs text-center text-muted-foreground">
        <Shield className="w-3 h-3 inline mr-1" />
        Your answers are analysed locally in your browser. No data is sent to our servers.
      </p>
    </div>
  );
}
