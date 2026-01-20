"use client";

import { useState } from "react";
import { GeneratedQuestionSet } from "@/lib/interview-generator/generator";
import { InterviewQuestion } from "@/lib/interview-generator/questionData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  RefreshCw,
  Lightbulb,
  CheckCircle2,
  ChevronDown,
  BookOpen,
  Target,
  Brain,
  Code,
  Calculator,
  Cloud,
  Users,
  Briefcase,
  Layers,
  GitBranch,
} from "lucide-react";

interface QuestionResultsProps {
  result: GeneratedQuestionSet;
  onRegenerate: () => void;
}

// Get icon for category
function getCategoryIcon(category: string) {
  const icons: Record<string, React.ReactNode> = {
    "ML Fundamentals": <Brain className="w-4 h-4" />,
    "Deep Learning": <Layers className="w-4 h-4" />,
    "System Design": <GitBranch className="w-4 h-4" />,
    "Coding & Algorithms": <Code className="w-4 h-4" />,
    "Statistics & Math": <Calculator className="w-4 h-4" />,
    "MLOps & Deployment": <Cloud className="w-4 h-4" />,
    "Domain Specific": <Target className="w-4 h-4" />,
    Behavioral: <Users className="w-4 h-4" />,
    "Case Study": <Briefcase className="w-4 h-4" />,
  };
  return icons[category] || <MessageSquare className="w-4 h-4" />;
}

// Get difficulty badge color
function getDifficultyColor(difficulty: string) {
  const colors: Record<string, string> = {
    Junior: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
    Mid: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
    Senior: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
    Lead: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
  };
  return colors[difficulty] || "";
}

// Group questions by category
function groupByCategory(
  questions: InterviewQuestion[]
): Map<string, InterviewQuestion[]> {
  const grouped = new Map<string, InterviewQuestion[]>();

  questions.forEach((q) => {
    if (!grouped.has(q.category)) {
      grouped.set(q.category, []);
    }
    grouped.get(q.category)!.push(q);
  });

  return grouped;
}

export default function QuestionResults({
  result,
  onRegenerate,
}: QuestionResultsProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(
    new Set()
  );
  const [showAllAnswers, setShowAllAnswers] = useState(false);

  const groupedQuestions = groupByCategory(result.questions);

  const toggleQuestion = (id: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleAllAnswers = () => {
    if (showAllAnswers) {
      setExpandedQuestions(new Set());
    } else {
      setExpandedQuestions(new Set(result.questions.map((q) => q.id)));
    }
    setShowAllAnswers(!showAllAnswers);
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Your Interview Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="secondary">{result.metadata.role}</Badge>
                <Badge className={getDifficultyColor(result.metadata.experienceLevel)}>
                  {result.metadata.experienceLevel}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Generated {result.metadata.totalGenerated} questions from{" "}
                {result.metadata.totalAvailable} available
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={toggleAllAnswers}>
                <BookOpen className="w-4 h-4 mr-2" />
                {showAllAnswers ? "Hide All Answers" : "Show All Answers"}
              </Button>
              <Button variant="outline" size="sm" onClick={onRegenerate}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            </div>
          </div>

          {/* Category summary */}
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm font-medium mb-2">Questions by Category:</p>
            <div className="flex flex-wrap gap-2">
              {Array.from(groupedQuestions.entries()).map(
                ([category, questions]) => (
                  <Badge key={category} variant="outline" className="gap-1">
                    {getCategoryIcon(category)}
                    {category} ({questions.length})
                  </Badge>
                )
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Questions by Category */}
      {Array.from(groupedQuestions.entries()).map(([category, questions]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              {getCategoryIcon(category)}
              {category}
              <Badge variant="secondary" className="ml-auto">
                {questions.length} question{questions.length !== 1 ? "s" : ""}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {questions.map((question, index) => (
              <QuestionCard
                key={question.id}
                question={question}
                number={index + 1}
                isExpanded={expandedQuestions.has(question.id)}
                onToggle={() => toggleQuestion(question.id)}
              />
            ))}
          </CardContent>
        </Card>
      ))}

      {/* Preparation Tips */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <Lightbulb className="w-5 h-5" />
            Preparation Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-900 dark:text-blue-100 space-y-2">
          <p>
            <strong>Practice out loud:</strong> Explain your answers verbally to
            build confidence and identify gaps in your understanding.
          </p>
          <p>
            <strong>Use the STAR method:</strong> For behavioural questions,
            structure your answers with Situation, Task, Action, and Result.
          </p>
          <p>
            <strong>Prepare examples:</strong> Have 3-5 specific project
            experiences ready to discuss technical decisions and outcomes.
          </p>
          <p>
            <strong>Ask clarifying questions:</strong> In real interviews, it&apos;s
            often better to ask questions than to make assumptions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Individual Question Card Component
function QuestionCard({
  question,
  number,
  isExpanded,
  onToggle,
}: {
  question: InterviewQuestion;
  number: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-4 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-start gap-3">
          <span className="flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-medium">
            {number}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm md:text-base pr-8">
              {question.question}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge
                variant="outline"
                className={getDifficultyColor(question.difficulty)}
              >
                {question.difficulty}
              </Badge>
              {question.stages.slice(0, 2).map((stage) => (
                <Badge key={stage} variant="outline" className="text-xs">
                  {stage}
                </Badge>
              ))}
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isExpanded && (question.sampleAnswer || question.tips) && (
        <div className="px-4 pb-4 pt-0 border-t bg-muted/30">
          {question.sampleAnswer && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-600">
                  Sample Answer
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {question.sampleAnswer}
              </p>
            </div>
          )}

          {question.tips && (
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-semibold text-yellow-600">
                  Interview Tip
                </span>
              </div>
              <p className="text-sm text-muted-foreground italic">
                {question.tips}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
