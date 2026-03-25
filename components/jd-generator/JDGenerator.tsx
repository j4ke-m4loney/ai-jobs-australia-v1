'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  generateJobDescription,
  GeneratedJD,
  JDInput,
} from '@/lib/jd-generator/generator';
import {
  AIML_ROLES,
  AIMLRole,
  SENIORITY_LEVELS,
  SeniorityLevel,
  COMPANY_SIZES,
  CompanySize,
  WORK_ARRANGEMENTS,
  WorkArrangement,
  AUSTRALIAN_CITIES,
  TECH_OPTIONS,
} from '@/lib/jd-generator/data';
import JDResults from './JDResults';
import { FileText, Loader2, Building2, Briefcase, MapPin, X } from 'lucide-react';

export default function JDGenerator() {
  const [role, setRole] = useState<AIMLRole | ''>('');
  const [seniority, setSeniority] = useState<SeniorityLevel | ''>('');
  const [companySize, setCompanySize] = useState<CompanySize | ''>('');
  const [companyName, setCompanyName] = useState('');
  const [teamContext, setTeamContext] = useState('');
  const [techStack, setTechStack] = useState<string[]>([]);
  const [location, setLocation] = useState('');
  const [workArrangement, setWorkArrangement] = useState<WorkArrangement | ''>('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [customResponsibilities, setCustomResponsibilities] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedJD | null>(null);

  const handleGenerate = () => {
    if (!role || !seniority || !companySize) return;

    setIsGenerating(true);

    setTimeout(() => {
      const input: JDInput = {
        role,
        seniority,
        companySize,
        companyName: companyName.trim(),
        teamContext: teamContext.trim(),
        techStack,
        location,
        workArrangement: workArrangement || 'Flexible',
        salaryMin: salaryMin ? parseInt(salaryMin) : undefined,
        salaryMax: salaryMax ? parseInt(salaryMax) : undefined,
        customResponsibilities,
      };

      const generated = generateJobDescription(input);
      setResult(generated);
      setIsGenerating(false);

      setTimeout(() => {
        document.getElementById('results')?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }, 100);
    }, 800);
  };

  const handleClear = () => {
    setRole('');
    setSeniority('');
    setCompanySize('');
    setCompanyName('');
    setTeamContext('');
    setTechStack([]);
    setLocation('');
    setWorkArrangement('');
    setSalaryMin('');
    setSalaryMax('');
    setCustomResponsibilities('');
    setResult(null);
  };

  const toggleTech = (tech: string) => {
    setTechStack((prev) =>
      prev.includes(tech) ? prev.filter((t) => t !== tech) : [...prev, tech]
    );
  };

  const isValid = role && seniority && companySize;

  // Group tech options by category
  const techByCategory = TECH_OPTIONS.reduce(
    (acc, opt) => {
      if (!acc[opt.category]) acc[opt.category] = [];
      acc[opt.category].push(opt.name);
      return acc;
    },
    {} as Record<string, string[]>
  );

  return (
    <div className="space-y-8">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Role Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Row 1: Role + Seniority */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-muted-foreground" />
                Role *
              </Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as AIMLRole)}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select AI/ML role" />
                </SelectTrigger>
                <SelectContent>
                  {AIML_ROLES.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seniority">Seniority Level *</Label>
              <Select
                value={seniority}
                onValueChange={(value) => setSeniority(value as SeniorityLevel)}
              >
                <SelectTrigger id="seniority">
                  <SelectValue placeholder="Select seniority" />
                </SelectTrigger>
                <SelectContent>
                  {SENIORITY_LEVELS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Company + Size */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company-name" className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                Company Name (Optional)
              </Label>
              <Input
                id="company-name"
                type="text"
                placeholder="e.g., Atlassian, Canva, ANZ"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company-size">Company Size *</Label>
              <Select
                value={companySize}
                onValueChange={(value) => setCompanySize(value as CompanySize)}
              >
                <SelectTrigger id="company-size">
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  {COMPANY_SIZES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 3: Location + Work Arrangement */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                Location (Optional)
              </Label>
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger id="location">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {AUSTRALIAN_CITIES.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="work-arrangement">Work Arrangement</Label>
              <Select
                value={workArrangement}
                onValueChange={(value) =>
                  setWorkArrangement(value as WorkArrangement)
                }
              >
                <SelectTrigger id="work-arrangement">
                  <SelectValue placeholder="Select arrangement" />
                </SelectTrigger>
                <SelectContent>
                  {WORK_ARRANGEMENTS.map((w) => (
                    <SelectItem key={w} value={w}>
                      {w}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Salary Range */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salary-min">Salary Min (AUD, Optional)</Label>
              <Input
                id="salary-min"
                type="number"
                placeholder="e.g., 150000"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary-max">Salary Max (AUD, Optional)</Label>
              <Input
                id="salary-max"
                type="number"
                placeholder="e.g., 200000"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
              />
            </div>
          </div>

          {/* Tech Stack */}
          <div className="space-y-3">
            <Label>Tech Stack (Optional)</Label>
            {techStack.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {techStack.map((tech) => (
                  <Badge
                    key={tech}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive/10 gap-1"
                    onClick={() => toggleTech(tech)}
                  >
                    {tech}
                    <X className="w-3 h-3" />
                  </Badge>
                ))}
              </div>
            )}
            {Object.entries(techByCategory).map(([category, techs]) => (
              <div key={category}>
                <p className="text-xs text-muted-foreground mb-1.5">{category}</p>
                <div className="flex flex-wrap gap-1.5">
                  {techs.map((tech) => (
                    <Badge
                      key={tech}
                      variant={techStack.includes(tech) ? 'default' : 'outline'}
                      className="cursor-pointer text-xs"
                      onClick={() => toggleTech(tech)}
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Team Context */}
          <div className="space-y-2">
            <Label htmlFor="team-context">Team Context (Optional)</Label>
            <Textarea
              id="team-context"
              placeholder="e.g., a team of 8 ML engineers working on recommendation systems for our e-commerce platform"
              value={teamContext}
              onChange={(e) => setTeamContext(e.target.value)}
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">
              Describe the team size, what they work on, or reporting line
            </p>
          </div>

          {/* Custom Responsibilities */}
          <div className="space-y-2">
            <Label htmlFor="custom-responsibilities">
              Additional Responsibilities (Optional)
            </Label>
            <Textarea
              id="custom-responsibilities"
              placeholder="Add any role-specific responsibilities, one per line"
              value={customResponsibilities}
              onChange={(e) => setCustomResponsibilities(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Privacy + Actions */}
          <p className="text-sm text-muted-foreground">
            All generation happens locally in your browser. No data is sent to our
            servers.
          </p>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleGenerate}
              disabled={!isValid || isGenerating}
              size="lg"
              className="min-w-[200px]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Job Description'
              )}
            </Button>
            <Button
              onClick={handleClear}
              variant="outline"
              size="lg"
              disabled={!role && !seniority && !companySize && !result}
            >
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      {result && (
        <div id="results">
          <JDResults result={result} />
        </div>
      )}
    </div>
  );
}
