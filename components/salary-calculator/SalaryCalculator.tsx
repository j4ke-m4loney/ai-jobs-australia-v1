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
  LOCATIONS,
  Role,
  ExperienceLevel,
  Location,
  getSkillCategories,
  getSkillsByCategory,
} from "@/lib/salary-calculator/salaryData";
import {
  calculateSalary,
  compareCities,
  SalaryResult,
  CityComparison,
} from "@/lib/salary-calculator/calculator";
import SalaryResults from "./SalaryResults";
import { Calculator, Loader2, Settings } from "lucide-react";

export default function SalaryCalculator() {
  const [role, setRole] = useState<Role | "">("");
  const [experienceLevel, setExperienceLevel] = useState<ExperienceLevel | "">(
    ""
  );
  const [location, setLocation] = useState<Location | "">("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [result, setResult] = useState<{
    salaryResult: SalaryResult;
    cityComparison: CityComparison[];
  } | null>(null);

  const skillCategories = getSkillCategories();

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill)
        ? prev.filter((s) => s !== skill)
        : [...prev, skill]
    );
  };

  const handleCalculate = () => {
    if (!role || !experienceLevel || !location) {
      return;
    }

    setIsCalculating(true);

    // Simulate a small delay for better UX
    setTimeout(() => {
      const salaryResult = calculateSalary(
        role,
        experienceLevel,
        location,
        selectedSkills
      );
      const cityComparison = compareCities(
        role,
        experienceLevel,
        selectedSkills,
        location
      );

      setResult({ salaryResult, cityComparison });
      setIsCalculating(false);

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
    setLocation("");
    setSelectedSkills([]);
    setResult(null);
  };

  const canCalculate = role && experienceLevel && location;

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Your Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <Select value={role} onValueChange={(value) => setRole(value as Role)}>
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
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
            <label className="text-sm font-medium">Experience Level</label>
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

          {/* Location Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Location</label>
            <Select
              value={location}
              onValueChange={(value) => setLocation(value as Location)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your city" />
              </SelectTrigger>
              <SelectContent>
                {LOCATIONS.map((loc) => (
                  <SelectItem key={loc} value={loc}>
                    {loc}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Skills Selection */}
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">
                Skills (Select all that apply)
              </label>
              <p className="text-xs text-muted-foreground mt-1">
                Skills increase your estimated salary based on market demand
              </p>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {skillCategories.map((category) => {
                const categorySkills = getSkillsByCategory(category);
                return (
                  <div key={category} className="space-y-2">
                    <h4 className="text-sm font-semibold text-primary">
                      {category}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {categorySkills.map((skillMod) => (
                        <div
                          key={skillMod.skill}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={skillMod.skill}
                            checked={selectedSkills.includes(skillMod.skill)}
                            onCheckedChange={() =>
                              handleSkillToggle(skillMod.skill)
                            }
                          />
                          <label
                            htmlFor={skillMod.skill}
                            className="text-sm cursor-pointer select-none"
                          >
                            {skillMod.skill}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedSkills.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {selectedSkills.length} skill{selectedSkills.length !== 1 ? "s" : ""}{" "}
                selected
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-4">
            <Button
              onClick={handleCalculate}
              disabled={!canCalculate || isCalculating}
              size="lg"
              className="min-w-[180px]"
            >
              {isCalculating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4 mr-2" />
                  Calculate Salary
                </>
              )}
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              size="lg"
              disabled={!role && !experienceLevel && !location && selectedSkills.length === 0}
            >
              Clear All
            </Button>
          </div>

          <p className="text-xs text-muted-foreground pt-2">
            All calculations happen locally in your browser. Your data is never
            sent to our servers.
          </p>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div id="results" aria-live="polite">
        {result && (
          <SalaryResults
            result={result.salaryResult}
            cityComparison={result.cityComparison}
          />
        )}
      </div>
    </div>
  );
}
