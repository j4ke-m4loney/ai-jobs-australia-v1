"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, ExternalLink, AlertTriangle } from "lucide-react";
import Header from "@/components/Header";

interface Company {
  id: string;
  name: string;
  logo_url: string | null;
  description: string | null;
  website: string | null;
  created_at: string;
}

interface Job {
  id: string;
  company_id: string | null;
}

export default function CompaniesAnalysisPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: companiesData, error: companiesError } = await supabase
          .from("companies")
          .select("*")
          .order("name");

        if (companiesError) throw companiesError;
        setCompanies(companiesData || []);

        const { data: jobsData, error: jobsError } = await supabase
          .from("jobs")
          .select("id, company_id");

        if (jobsError) throw jobsError;
        setJobs(jobsData || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Analyze for potential duplicates
  const duplicateAnalysis = useMemo(() => {
    const nameMap = new Map<string, Company[]>();
    const similarPairs: { companies: Company[]; reason: string }[] = [];

    companies.forEach((company) => {
      // Normalize name for exact duplicate detection
      const normalized = company.name
        .toLowerCase()
        .replace(/\s+/g, " ")
        .replace(/\b(pty|ltd|limited|inc|incorporated|llc|group|australia|au)\b/gi, "")
        .trim();

      if (!nameMap.has(normalized)) {
        nameMap.set(normalized, []);
      }
      nameMap.get(normalized)!.push(company);
    });

    // Find exact duplicates (same normalized name)
    const exactDuplicates: { normalized: string; companies: Company[] }[] = [];
    nameMap.forEach((comps, normalized) => {
      if (comps.length > 1) {
        exactDuplicates.push({ normalized, companies: comps });
      }
    });

    // Find similar names (substring matches)
    companies.forEach((company1, i) => {
      companies.forEach((company2, j) => {
        if (i >= j) return;

        const name1 = company1.name.toLowerCase();
        const name2 = company2.name.toLowerCase();

        // Check if one is a substring of the other
        if (name1.includes(name2)) {
          similarPairs.push({
            companies: [company1, company2],
            reason: `"${company2.name}" is contained in "${company1.name}"`,
          });
        } else if (name2.includes(name1)) {
          similarPairs.push({
            companies: [company1, company2],
            reason: `"${company1.name}" is contained in "${company2.name}"`,
          });
        }
      });
    });

    return { exactDuplicates, similarPairs };
  }, [companies]);

  // Get job count for each company
  const getJobCount = (companyId: string) => {
    return jobs.filter((job) => job.company_id === companyId).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <p>Loading companies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 pt-24 pb-16 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Companies Analysis</h1>
          <p className="text-muted-foreground">
            Total companies: {companies.length}
          </p>
        </div>

        {/* Exact Duplicates */}
        {duplicateAnalysis.exactDuplicates.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-orange-500" />
              Exact Duplicates (Same Normalized Name)
            </h2>
            <div className="space-y-6">
              {duplicateAnalysis.exactDuplicates.map((dup, index) => (
                <Card key={index} className="border-orange-200 bg-orange-50/50">
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Group {index + 1}: &quot;{dup.normalized}&quot; (normalized)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {dup.companies.map((company) => (
                        <Card key={company.id}>
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-lg">{company.name}</h3>
                              <Badge variant="outline">
                                {getJobCount(company.id)} jobs
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <p>
                                <strong>ID:</strong> {company.id.substring(0, 8)}...
                              </p>
                              {company.website && (
                                <p className="flex items-center gap-1">
                                  <strong>Website:</strong>
                                  <a
                                    href={company.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline flex items-center gap-1"
                                  >
                                    {company.website}
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </p>
                              )}
                              <p>
                                <strong>Created:</strong>{" "}
                                {new Date(company.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Similar Names */}
        {duplicateAnalysis.similarPairs.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              Potentially Similar Names
            </h2>
            <div className="space-y-4">
              {duplicateAnalysis.similarPairs.map((pair, index) => (
                <Card key={index} className="border-yellow-200 bg-yellow-50/50">
                  <CardHeader>
                    <CardTitle className="text-base">{pair.reason}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      {pair.companies.map((company) => (
                        <Card key={company.id}>
                          <CardContent className="pt-6">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold">{company.name}</h3>
                              <Badge variant="outline">
                                {getJobCount(company.id)} jobs
                              </Badge>
                            </div>
                            <div className="space-y-1 text-sm text-muted-foreground">
                              <p>
                                <strong>ID:</strong> {company.id.substring(0, 8)}...
                              </p>
                              {company.website && (
                                <p className="flex items-center gap-1">
                                  <strong>Website:</strong>
                                  <a
                                    href={company.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline flex items-center gap-1"
                                  >
                                    {company.website}
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* All Companies List */}
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Building2 className="w-6 h-6" />
            All Companies ({companies.length})
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => (
              <Card key={company.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold">{company.name}</h3>
                    <Badge variant="outline">{getJobCount(company.id)} jobs</Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      <strong>ID:</strong> {company.id.substring(0, 8)}...
                    </p>
                    {company.website && (
                      <p className="flex items-center gap-1 flex-wrap">
                        <strong>Website:</strong>
                        <a
                          href={company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 break-all"
                        >
                          {company.website}
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
