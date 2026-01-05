"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SalaryResult,
  CityComparison,
  formatSalary,
  formatPercentage,
  getRecommendation,
} from "@/lib/salary-calculator/calculator";
import {
  DollarSign,
  MapPin,
  TrendingUp,
  Award,
  Info,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";

interface SalaryResultsProps {
  result: SalaryResult;
  cityComparison: CityComparison[];
}

export default function SalaryResults({
  result,
  cityComparison,
}: SalaryResultsProps) {
  const recommendation = getRecommendation(result);

  // Calculate the percentage of skill bonus vs base
  const skillBonusPercentage =
    result.baseSalary.median > 0
      ? (result.skillBonus / result.baseSalary.median) * 100
      : 0;

  return (
    <div className="space-y-6">
      {/* Main Salary Range */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <DollarSign className="w-6 h-6 text-primary" />
            Estimated Salary Range
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-background rounded-lg border">
              <p className="text-sm text-muted-foreground mb-1">Minimum</p>
              <p className="text-2xl font-bold text-primary">
                {formatSalary(result.totalSalary.min)}
              </p>
            </div>
            <div className="text-center p-4 bg-primary/10 rounded-lg border-2 border-primary">
              <p className="text-sm text-muted-foreground mb-1">Median</p>
              <p className="text-3xl font-bold text-primary">
                {formatSalary(result.totalSalary.median)}
              </p>
            </div>
            <div className="text-center p-4 bg-background rounded-lg border">
              <p className="text-sm text-muted-foreground mb-1">Maximum</p>
              <p className="text-2xl font-bold text-primary">
                {formatSalary(result.totalSalary.max)}
              </p>
            </div>
          </div>

          {/* Salary Breakdown */}
          <div className="space-y-3">
            <h4 className="font-semibold text-sm text-muted-foreground">
              Salary Breakdown
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                <span className="text-sm">Base Salary</span>
                <span className="font-semibold">
                  {formatSalary(result.baseSalary.median)}
                </span>
              </div>
              {result.skillBonus > 0 && (
                <div className="flex justify-between items-center p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <span className="text-sm flex items-center gap-2">
                    <Award className="w-4 h-4 text-primary" />
                    Skills Bonus
                    <span className="text-xs text-muted-foreground">
                      (+{skillBonusPercentage.toFixed(0)}%)
                    </span>
                  </span>
                  <span className="font-semibold text-primary">
                    +{formatSalary(result.skillBonus)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="space-y-2">
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all"
                style={{
                  width: `${Math.min(
                    ((result.totalSalary.median - 70000) / 180000) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Entry Level</span>
              <span>Principal Level</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skills Impact */}
      {result.skillImpacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Skills Impact on Salary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {result.skillImpacts.map((impact, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Award className="w-4 h-4 text-primary flex-shrink-0" />
                    <div>
                      <span className="font-medium">{impact.skill}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {impact.category}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-primary">
                    +{formatSalary(impact.modifier)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* City Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Salary by Australian City
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {cityComparison.map((city, index) => {
              const isCurrentCity = city.location === result.location;
              const Icon =
                city.difference > 0
                  ? ArrowUp
                  : city.difference < 0
                    ? ArrowDown
                    : Minus;
              const diffColor =
                city.difference > 0
                  ? "text-green-600"
                  : city.difference < 0
                    ? "text-red-600"
                    : "text-muted-foreground";

              return (
                <div
                  key={index}
                  className={`flex justify-between items-center p-3 rounded-lg transition-colors ${
                    isCurrentCity
                      ? "bg-primary/10 border-2 border-primary"
                      : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <MapPin
                      className={`w-4 h-4 ${isCurrentCity ? "text-primary" : "text-muted-foreground"} flex-shrink-0`}
                    />
                    <div>
                      <span
                        className={`font-medium ${isCurrentCity ? "text-primary" : ""}`}
                      >
                        {city.location}
                      </span>
                      {isCurrentCity && (
                        <span className="text-xs text-primary ml-2">
                          (Selected)
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">
                      {formatSalary(city.salary.median)}
                    </span>
                    {!isCurrentCity && (
                      <span
                        className={`text-xs flex items-center gap-1 ${diffColor}`}
                      >
                        <Icon className="w-3 h-3" />
                        {formatPercentage(city.difference)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommendation */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold mb-2">Recommendation</h4>
              <p className="text-sm text-muted-foreground">{recommendation}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <p className="text-xs text-muted-foreground text-center">
            <strong>Disclaimer:</strong> Salary estimates are based on market
            research and industry data for AI/ML roles in Australia (2024-2025).
            Actual salaries may vary based on company size, industry, specific
            responsibilities, benefits, and individual negotiation. Use these
            figures as a general guide for salary expectations.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
