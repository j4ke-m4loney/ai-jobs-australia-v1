"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ROLES,
  EXPERIENCE_LEVELS,
  INTERVIEW_STAGES,
  QUESTION_CATEGORIES,
  Role,
  ExperienceLevel,
  InterviewStage,
  QuestionCategory,
} from "@/lib/interview-generator/questionData";
import {
  generateQuestions,
  GeneratedQuestionSet,
} from "@/lib/interview-generator/generator";
import QuestionResults from "./QuestionResults";
import { MessageSquare, Loader2, Settings } from "lucide-react";

export default function InterviewGenerator() {
  const [role, setRole] = useState<Role | "">("");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | "">(
    ""
  );
  const [selectedStages, setSelectedStages] = useState<InterviewStage[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<
    QuestionCategory[]
  >([]);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedQuestionSet | null>(null);

  const handleStageToggle = (stage: InterviewStage) => {
    setSelectedStages((prev) =>
      prev.includes(stage) ? prev.filter((s) => s !== stage) : [...prev, stage]
    );
  };

  const handleCategoryToggle = (category: QuestionCategory) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleGenerate = () => {
    if (!role || !experienceLevel) {
      return;
    }

    setIsGenerating(true);

    // Simulate a small delay for better UX
    setTimeout(() => {
      const generatedResult = generateQuestions({
        role,
        experienceLevel,
        stages: selectedStages,
        categories: selectedCategories,
        questionCount,
      });

      setResult(generatedResult);
      setIsGenerating(false);

      // Scroll to results
      setTimeout(() => {
        document.getElementById("results")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }, 800);
  };

  const handleClear = () => {
    setRole("");
    setExperienceLevel("");
    setSelectedStages([]);
    setSelectedCategories([]);
    setQuestionCount(10);
    setResult(null);
  };

  const handleRegenerate = () => {
    if (result) {
      handleGenerate();
    }
  };

  const canGenerate = role && experienceLevel;

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Interview Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Role *</label>
            <Select
              value={role}
              onValueChange={(value) => setRole(value as Role)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select the role you're interviewing for" />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Experience Level Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Experience Level *</label>
            <Select
              value={experienceLevel}
              onValueChange={(value) =>
                setExperienceLevel(value as ExperienceLevel)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your experience level" />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCE_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Interview Stages */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">
                Interview Stages (Optional)
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                Select specific interview rounds to focus on, or leave blank for
                all stages
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {INTERVIEW_STAGES.map((stage) => (
                <div key={stage.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`stage-${stage.value}`}
                    checked={selectedStages.includes(stage.value)}
                    onCheckedChange={() => handleStageToggle(stage.value)}
                  />
                  <label
                    htmlFor={`stage-${stage.value}`}
                    className="text-sm cursor-pointer select-none"
                  >
                    {stage.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Question Categories */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">
                Question Categories (Optional)
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                Select specific topics, or leave blank to include all categories
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {QUESTION_CATEGORIES.map((category) => (
                <div key={category} className="flex items-center space-x-2">
                  <Checkbox
                    id={`cat-${category}`}
                    checked={selectedCategories.includes(category)}
                    onCheckedChange={() => handleCategoryToggle(category)}
                  />
                  <label
                    htmlFor={`cat-${category}`}
                    className="text-sm cursor-pointer select-none"
                  >
                    {category}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Number of Questions</label>
            <Select
              value={questionCount.toString()}
              onValueChange={(value) => setQuestionCount(parseInt(value))}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 questions</SelectItem>
                <SelectItem value="10">10 questions</SelectItem>
                <SelectItem value="15">15 questions</SelectItem>
                <SelectItem value="20">20 questions</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4">
            <Button
              onClick={handleGenerate}
              disabled={!canGenerate || isGenerating}
              size="lg"
              className="min-w-[200px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Generate Questions
                </>
              )}
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              size="lg"
              disabled={
                !role &&
                !experienceLevel &&
                selectedStages.length === 0 &&
                selectedCategories.length === 0
              }
            >
              Clear All
            </Button>
          </div>

          <p className="text-xs text-muted-foreground pt-2">
            All questions are generated locally in your browser. Your selections
            are never sent to our servers.
          </p>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <div id="results">
          <QuestionResults result={result} onRegenerate={handleRegenerate} />
        </div>
      )}
    </div>
  );
}
