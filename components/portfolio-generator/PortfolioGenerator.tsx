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
import { Badge } from "@/components/ui/badge";
import {
  TARGET_ROLES,
  EXPERIENCE_LEVELS,
  TIME_COMMITMENTS,
  SKILL_CATEGORIES,
  INTEREST_AREAS,
  TargetRole,
  ExperienceLevel,
  TimeCommitment,
  SkillCategory,
  InterestArea,
} from "@/lib/portfolio-generator/projectData";
import {
  generateProjects,
  GeneratedProjectSet,
} from "@/lib/portfolio-generator/generator";
import ProjectResults from "./ProjectResults";
import { Lightbulb, Loader2, Settings, Info } from "lucide-react";

export default function PortfolioGenerator() {
  const [selectedRoles, setSelectedRoles] = useState<TargetRole[]>([]);
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | "">(
    ""
  );
  const [selectedTimeCommitments, setSelectedTimeCommitments] = useState<
    TimeCommitment[]
  >([]);
  const [selectedSkills, setSelectedSkills] = useState<SkillCategory[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<InterestArea[]>(
    []
  );
  const [projectCount, setProjectCount] = useState<number>(3);
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedProjectSet | null>(null);

  const handleRoleToggle = (role: TargetRole) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleTimeToggle = (time: TimeCommitment) => {
    setSelectedTimeCommitments((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );
  };

  const handleSkillToggle = (skill: SkillCategory) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const handleInterestToggle = (interest: InterestArea) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleGenerate = () => {
    if (!experienceLevel) {
      return;
    }

    setIsGenerating(true);

    // Simulate a small delay for better UX
    setTimeout(() => {
      const generatedResult = generateProjects({
        roles: selectedRoles,
        experienceLevel,
        timeCommitments: selectedTimeCommitments,
        skills: selectedSkills,
        interests: selectedInterests,
        projectCount,
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
    setSelectedRoles([]);
    setExperienceLevel("");
    setSelectedTimeCommitments([]);
    setSelectedSkills([]);
    setSelectedInterests([]);
    setProjectCount(3);
    setResult(null);
  };

  const handleRegenerate = () => {
    if (result) {
      handleGenerate();
    }
  };

  const canGenerate = experienceLevel !== "";

  return (
    <div className="space-y-8">
      {/* Roles this tool is for */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm mb-2">
                This tool generates portfolio project ideas for these AI/ML roles:
              </p>
              <div className="flex flex-wrap gap-2">
                {TARGET_ROLES.map((role) => (
                  <Badge key={role} variant="secondary" className="text-xs">
                    {role}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Projects are tailored to demonstrate skills that Australian employers value for each role.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Your Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Target Roles */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">
                Target Roles (Optional)
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                Select the roles you&apos;re targeting, or leave blank for general suggestions
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {TARGET_ROLES.map((role) => (
                <div key={role} className="flex items-center space-x-2">
                  <Checkbox
                    id={`role-${role}`}
                    checked={selectedRoles.includes(role)}
                    onCheckedChange={() => handleRoleToggle(role)}
                  />
                  <label
                    htmlFor={`role-${role}`}
                    className="text-sm cursor-pointer select-none"
                  >
                    {role}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Experience Level */}
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
                    <div className="flex flex-col">
                      <span>{level.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {level.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Time Commitment */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">
                Time Available (Optional)
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                How much time can you dedicate to a portfolio project?
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TIME_COMMITMENTS.map((time) => (
                <div
                  key={time.value}
                  className="flex items-start space-x-2 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={`time-${time.value}`}
                    checked={selectedTimeCommitments.includes(time.value)}
                    onCheckedChange={() => handleTimeToggle(time.value)}
                    className="mt-0.5"
                  />
                  <label
                    htmlFor={`time-${time.value}`}
                    className="cursor-pointer select-none flex-1"
                  >
                    <span className="text-sm font-medium">{time.label}</span>
                    <span className="text-xs text-muted-foreground block">
                      {time.hours} — {time.description}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Current Skills */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">
                Your Current Skills (Optional)
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                Select skills you already have — we&apos;ll suggest projects that build on them
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {SKILL_CATEGORIES.map((skill) => (
                <div key={skill} className="flex items-center space-x-2">
                  <Checkbox
                    id={`skill-${skill}`}
                    checked={selectedSkills.includes(skill)}
                    onCheckedChange={() => handleSkillToggle(skill)}
                  />
                  <label
                    htmlFor={`skill-${skill}`}
                    className="text-sm cursor-pointer select-none"
                  >
                    {skill}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Interest Areas */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">
                Interest Areas (Optional)
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                What domains interest you? Projects you enjoy are easier to complete
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {INTEREST_AREAS.map((interest) => (
                <div key={interest} className="flex items-center space-x-2">
                  <Checkbox
                    id={`interest-${interest}`}
                    checked={selectedInterests.includes(interest)}
                    onCheckedChange={() => handleInterestToggle(interest)}
                  />
                  <label
                    htmlFor={`interest-${interest}`}
                    className="text-sm cursor-pointer select-none"
                  >
                    {interest}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Project Count */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Number of Suggestions</label>
            <Select
              value={projectCount.toString()}
              onValueChange={(value) => setProjectCount(parseInt(value))}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 projects</SelectItem>
                <SelectItem value="5">5 projects</SelectItem>
                <SelectItem value="7">7 projects</SelectItem>
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
                  <Lightbulb className="w-4 h-4 mr-2" />
                  Generate Project Ideas
                </>
              )}
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              size="lg"
              disabled={
                selectedRoles.length === 0 &&
                !experienceLevel &&
                selectedTimeCommitments.length === 0 &&
                selectedSkills.length === 0 &&
                selectedInterests.length === 0
              }
            >
              Clear All
            </Button>
          </div>

          <p className="text-xs text-muted-foreground pt-2">
            All suggestions are generated locally in your browser. Your
            selections are never sent to our servers.
          </p>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <div id="results">
          <ProjectResults result={result} onRegenerate={handleRegenerate} />
        </div>
      )}
    </div>
  );
}
