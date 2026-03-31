'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowRight,
  ArrowLeftRight,
  Loader2,
  DollarSign,
  TrendingUp,
  Briefcase,
  GraduationCap,
  ThumbsUp,
  ThumbsDown,
  Lightbulb,
  Wrench,
  CheckCircle2,
  XCircle,
  Minus,
} from 'lucide-react';
import { ROLES, getRoleById, type RoleId, type RoleData } from '@/lib/role-comparison/data';
import { compareRoles, type RoleComparison as RoleComparisonType } from '@/lib/role-comparison/comparison';
import Link from 'next/link';

function formatSalary(amount: number): string {
  return `$${Math.round(amount / 1000)}k`;
}

function DemandBadge({ level }: { level: string }) {
  const variant =
    level === 'Very High'
      ? 'default'
      : level === 'High'
        ? 'secondary'
        : 'outline';
  return <Badge variant={variant}>{level} Demand</Badge>;
}

function SalaryBar({
  min,
  max,
  globalMax,
  label,
}: {
  min: number;
  max: number;
  globalMax: number;
  label: string;
}) {
  const leftPct = (min / globalMax) * 100;
  const widthPct = ((max - min) / globalMax) * 100;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {formatSalary(min)} – {formatSalary(max)}
        </span>
      </div>
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        <div
          className="absolute h-full rounded-full bg-primary/80"
          style={{ left: `${leftPct}%`, width: `${Math.max(widthPct, 2)}%` }}
        />
      </div>
    </div>
  );
}

function SkillOverlapSection({
  title,
  icon,
  shared,
  onlyA,
  onlyB,
  roleAName,
  roleBName,
  overlapPct,
}: {
  title: string;
  icon: React.ReactNode;
  shared: string[];
  onlyA: string[];
  onlyB: string[];
  roleAName: string;
  roleBName: string;
  overlapPct: number;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <div className="flex items-center gap-3 mt-2">
          <Progress value={overlapPct} className="flex-1" />
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            {overlapPct}% overlap
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {shared.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              Shared
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {shared.map((s) => (
                <Badge key={s} variant="secondary" className="text-xs">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {onlyA.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <Minus className="w-3.5 h-3.5 text-blue-500" />
              {roleAName} only
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {onlyA.map((s) => (
                <Badge key={s} variant="outline" className="text-xs">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {onlyB.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
              <Minus className="w-3.5 h-3.5 text-purple-500" />
              {roleBName} only
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {onlyB.map((s) => (
                <Badge key={s} variant="outline" className="text-xs">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RoleSummaryCard({ role, label }: { role: RoleData; label: string }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {label}
          </Badge>
          <DemandBadge level={role.demandLevel} />
        </div>
        <CardTitle className="text-xl mt-2">{role.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{role.tagline}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm">{role.description}</p>

        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-muted-foreground" />
            Typical Education
          </h4>
          <p className="text-sm text-muted-foreground">{role.educationTypical}</p>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-muted-foreground" />
            Day-to-Day
          </h4>
          <ul className="space-y-1">
            {role.dayToDay.map((item) => (
              <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary mt-1.5 flex-shrink-0">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            Career Progression
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {role.careerProgression.map((step, i) => (
              <span key={step} className="flex items-center gap-1 text-xs text-muted-foreground">
                {i > 0 && <ArrowRight className="w-3 h-3" />}
                <span className={i === 0 ? 'font-medium text-foreground' : ''}>{step}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <ThumbsUp className="w-4 h-4 text-green-500" />
              Pros
            </h4>
            <ul className="space-y-1">
              {role.pros.map((item) => (
                <li key={item} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-green-500 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <ThumbsDown className="w-4 h-4 text-red-500" />
              Cons
            </h4>
            <ul className="space-y-1">
              {role.cons.map((item) => (
                <li key={item} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <XCircle className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Button asChild variant="outline" className="w-full">
          <Link href={`/jobs?search=${encodeURIComponent(role.jobSearchSlug)}`}>
            Browse {role.name} Jobs
            <ArrowRight className="ml-2 w-4 h-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export function RoleComparison() {
  const [roleAId, setRoleAId] = useState<RoleId | ''>('');
  const [roleBId, setRoleBId] = useState<RoleId | ''>('');
  const [comparison, setComparison] = useState<RoleComparisonType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  function handleCompare() {
    if (!roleAId || !roleBId) return;
    const roleA = getRoleById(roleAId);
    const roleB = getRoleById(roleBId);
    if (!roleA || !roleB) return;

    setIsProcessing(true);
    setTimeout(() => {
      setComparison(compareRoles(roleA, roleB));
      setIsProcessing(false);
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }, 800);
  }

  function handleSwap() {
    const tempA = roleAId;
    setRoleAId(roleBId);
    setRoleBId(tempA);
    setComparison(null);
  }

  const globalMaxSalary = 260000;

  return (
    <div className="space-y-8">
      {/* Role Selectors */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="text-sm font-medium mb-2 block">Role A</label>
              <Select
                value={roleAId}
                onValueChange={(val) => {
                  setRoleAId(val as RoleId);
                  setComparison(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role..." />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.id} value={r.id} disabled={r.id === roleBId}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleSwap}
              disabled={!roleAId || !roleBId}
              className="shrink-0"
              aria-label="Swap roles"
            >
              <ArrowLeftRight className="w-5 h-5" />
            </Button>

            <div className="flex-1 w-full">
              <label className="text-sm font-medium mb-2 block">Role B</label>
              <Select
                value={roleBId}
                onValueChange={(val) => {
                  setRoleBId(val as RoleId);
                  setComparison(null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role..." />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.id} value={r.id} disabled={r.id === roleAId}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleCompare}
              disabled={!roleAId || !roleBId || roleAId === roleBId || isProcessing}
              className="shrink-0 w-full md:w-auto"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  Comparing...
                </>
              ) : (
                <>
                  Compare Roles
                  <ArrowRight className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          {roleAId && roleBId && roleAId === roleBId && (
            <p className="text-sm text-destructive mt-2">Please select two different roles to compare.</p>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      {comparison && (
        <div ref={resultsRef} id="results" className="space-y-8">
          {/* Role Summary Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            <RoleSummaryCard role={comparison.roleA} label="Role A" />
            <RoleSummaryCard role={comparison.roleB} label="Role B" />
          </div>

          {/* Salary Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-primary" />
                Salary Comparison (Australian Market)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {comparison.salaryComparison.map((level) => (
                <div key={level.level} className="space-y-2">
                  <h4 className="text-sm font-medium">{level.level}</h4>
                  <SalaryBar
                    min={level.roleA.min}
                    max={level.roleA.max}
                    globalMax={globalMaxSalary}
                    label={comparison.roleA.name}
                  />
                  <SalaryBar
                    min={level.roleB.min}
                    max={level.roleB.max}
                    globalMax={globalMaxSalary}
                    label={comparison.roleB.name}
                  />
                  <p className="text-xs text-muted-foreground">{level.difference}</p>
                </div>
              ))}
              <p className="text-xs text-muted-foreground mt-4">
                Salary estimates based on the Australian AI job market (2025). Actual salaries vary by company, location, and individual experience.
              </p>
            </CardContent>
          </Card>

          {/* Skill Overlap */}
          <SkillOverlapSection
            title="Key Skills Overlap"
            icon={<TrendingUp className="w-5 h-5 text-primary" />}
            shared={comparison.skillOverlap.shared}
            onlyA={comparison.skillOverlap.onlyRoleA}
            onlyB={comparison.skillOverlap.onlyRoleB}
            roleAName={comparison.roleA.name}
            roleBName={comparison.roleB.name}
            overlapPct={comparison.skillOverlap.overlapPercentage}
          />

          {/* Tool Overlap */}
          <SkillOverlapSection
            title="Typical Tools Overlap"
            icon={<Wrench className="w-5 h-5 text-primary" />}
            shared={comparison.toolOverlap.shared}
            onlyA={comparison.toolOverlap.onlyRoleA}
            onlyB={comparison.toolOverlap.onlyRoleB}
            roleAName={comparison.roleA.name}
            roleBName={comparison.roleB.name}
            overlapPct={comparison.toolOverlap.overlapPercentage}
          />

          {/* Transition Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-primary" />
                Thinking of Switching?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {comparison.transitionTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <ArrowRight className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    {tip}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Privacy Note */}
          <p className="text-center text-sm text-muted-foreground">
            This comparison runs entirely in your browser. No data is collected or stored.
          </p>
        </div>
      )}
    </div>
  );
}
