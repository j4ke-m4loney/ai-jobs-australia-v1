"use client";

import { useState } from "react";
import { GeneratedProjectSet, getComplexityBadge } from "@/lib/portfolio-generator/generator";
import { ProjectTemplate } from "@/lib/portfolio-generator/projectData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Lightbulb,
  RefreshCw,
  ChevronDown,
  Clock,
  Briefcase,
  Code,
  Database,
  MessageSquare,
  ExternalLink,
  Star,
  CheckCircle2,
  Rocket,
  Target,
  GraduationCap,
  AlertCircle,
  Search,
} from "lucide-react";

interface ProjectResultsProps {
  result: GeneratedProjectSet;
  onRegenerate: () => void;
}

export default function ProjectResults({
  result,
  onRegenerate,
}: ProjectResultsProps) {
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(
    new Set()
  );

  const toggleProject = (id: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedProjects(new Set(result.projects.map((p) => p.id)));
  };

  const collapseAll = () => {
    setExpandedProjects(new Set());
  };

  // Empty state when no projects match
  if (result.projects.length === 0) {
    return (
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="inline-flex p-3 bg-amber-100 dark:bg-amber-900 rounded-full">
              <Search className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-xl font-semibold text-amber-800 dark:text-amber-200">
              No Projects Match Your Criteria
            </h3>
            <p className="text-amber-700 dark:text-amber-300 max-w-md mx-auto">
              Your filters are quite specific. Try broadening your search to see more project ideas.
            </p>

            <div className="bg-white dark:bg-amber-900/50 rounded-lg p-4 mt-4 text-left max-w-lg mx-auto">
              <p className="font-medium text-amber-800 dark:text-amber-200 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Try these adjustments:
              </p>
              <ul className="space-y-2 text-sm text-amber-700 dark:text-amber-300">
                {result.metadata.roles.length > 0 && (
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">→</span>
                    <span><strong>Fewer roles:</strong> Uncheck some target roles to see projects for related positions</span>
                  </li>
                )}
                {result.metadata.timeCommitments.length === 1 && (
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">→</span>
                    <span><strong>More time options:</strong> Select additional time commitments (e.g., both &quot;Weekend&quot; and &quot;2 Weeks&quot;)</span>
                  </li>
                )}
                {result.metadata.skills.length > 3 && (
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">→</span>
                    <span><strong>Fewer skills:</strong> You&apos;ve selected {result.metadata.skills.length} skills — try selecting just your top 2-3</span>
                  </li>
                )}
                {result.metadata.interests.length > 2 && (
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500">→</span>
                    <span><strong>Fewer interests:</strong> Select only 1-2 interest areas to broaden matches</span>
                  </li>
                )}
                <li className="flex items-start gap-2">
                  <span className="text-amber-500">→</span>
                  <span><strong>Clear optional filters:</strong> Leave skills, interests, and time blank to see all projects for your experience level</span>
                </li>
              </ul>
            </div>

            <Button onClick={onRegenerate} variant="outline" className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5" />
            Your Project Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="secondary">
                  {result.metadata.experienceLevel} Level
                </Badge>
                {result.metadata.roles.slice(0, 2).map((role) => (
                  <Badge key={role} variant="outline">
                    {role}
                  </Badge>
                ))}
                {result.metadata.roles.length > 2 && (
                  <Badge variant="outline">
                    +{result.metadata.roles.length - 2} more
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Found {result.metadata.totalGenerated} project ideas from{" "}
                {result.metadata.totalAvailable} matching projects
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={
                  expandedProjects.size === result.projects.length
                    ? collapseAll
                    : expandAll
                }
              >
                {expandedProjects.size === result.projects.length
                  ? "Collapse All"
                  : "Expand All"}
              </Button>
              <Button variant="outline" size="sm" onClick={onRegenerate}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Cards */}
      {result.projects.map((project, index) => (
        <ProjectCard
          key={project.id}
          project={project}
          number={index + 1}
          isExpanded={expandedProjects.has(project.id)}
          onToggle={() => toggleProject(project.id)}
        />
      ))}

      {/* Tips Section */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <GraduationCap className="w-5 h-5" />
            Portfolio Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-900 dark:text-blue-100 space-y-2">
          <p>
            <strong>Quality over quantity:</strong> One well-documented project
            beats five incomplete ones. Aim for 2-3 strong portfolio pieces.
          </p>
          <p>
            <strong>Document everything:</strong> Write a clear README with
            problem statement, approach, results, and what you learned.
          </p>
          <p>
            <strong>Show your thinking:</strong> Include a blog post or notebook
            explaining your decisions and trade-offs.
          </p>
          <p>
            <strong>Deploy it:</strong> A live demo is worth more than code in a
            repo. Use Streamlit, Hugging Face Spaces, or Vercel.
          </p>
          <p>
            <strong>Be ready to discuss:</strong> Know your project inside out —
            interviewers will ask about every decision you made.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// Individual Project Card Component
function ProjectCard({
  project,
  number,
  isExpanded,
  onToggle,
}: {
  project: ProjectTemplate;
  number: number;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const complexityBadge = getComplexityBadge(project.complexity);

  return (
    <Card className="overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-6 text-left hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-start gap-4">
          <span className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">
            {number}
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-2 pr-8">{project.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {project.description}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge className={complexityBadge.color}>
                {complexityBadge.label}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Clock className="w-3 h-3" />
                {project.timeRequired
                  .map((t) =>
                    t === "weekend"
                      ? "Weekend"
                      : t === "2-weeks"
                      ? "2 Weeks"
                      : t === "1-month"
                      ? "1 Month"
                      : "2+ Months"
                  )
                  .join(" / ")}
              </Badge>
              {project.australianRelevance && (
                <Badge
                  variant="outline"
                  className="gap-1 bg-yellow-50 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-100"
                >
                  🇦🇺 AU Relevant
                </Badge>
              )}
            </div>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-muted-foreground transition-transform flex-shrink-0 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 border-t bg-muted/30 space-y-6">
          {/* Target Roles */}
          <div className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Best For</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {project.targetRoles.map((role) => (
                <Badge key={role} variant="secondary">
                  {role}
                </Badge>
              ))}
            </div>
          </div>

          {/* Tech Stack */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Code className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold">Tech Stack</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <Badge key={tech} variant="outline">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>

          {/* Skills You'll Learn */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-600">
                Skills You&apos;ll Demonstrate
              </span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              {project.skillsLearned.map((skill, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0" />
                  {skill}
                </li>
              ))}
            </ul>
          </div>

          {/* Datasets */}
          {project.datasets.length > 0 && project.datasets[0].url && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Suggested Datasets</span>
              </div>
              <div className="space-y-2">
                {project.datasets.map((dataset, i) => (
                  <div
                    key={i}
                    className="text-sm p-3 bg-background rounded-lg border"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{dataset.name}</span>
                      {dataset.url && (
                        <a
                          href={dataset.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Link
                        </a>
                      )}
                    </div>
                    <p className="text-muted-foreground text-xs mt-1">
                      {dataset.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Resume Value */}
          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                Why This Looks Great on Your Resume
              </span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">
              {project.resumeValue}
            </p>
          </div>

          {/* Interview Talking Points */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-semibold text-blue-600">
                Interview Questions You&apos;ll Be Ready For
              </span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-2">
              {project.interviewTalkingPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">Q:</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Extended Features */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Rocket className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-600">
                Ways to Extend (Impress Employers)
              </span>
            </div>
            <ul className="text-sm text-muted-foreground space-y-1">
              {project.extendedFeatures.map((feature, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-purple-600">→</span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Australian Relevance */}
          {project.australianRelevance && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🇦🇺</span>
                <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                  Australian Market Relevance
                </span>
              </div>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                {project.australianRelevance}
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
