"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Download,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  Link,
  FileText,
  Building2,
  Check,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { ExtractedJobData } from "@/lib/job-import/extract-job-data";
import { CompanyCombobox } from "@/components/admin/CompanyCombobox";

interface CompanyMatch {
  id: string;
  name: string;
}

interface JobImportCardProps {
  onImport: (data: ExtractedJobData) => void;
  companies: Array<{ id: string; name: string }>;
}

export function JobImportCard({ onImport, companies }: JobImportCardProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [url, setUrl] = useState("");
  const [rawText, setRawText] = useState("");
  const [activeTab, setActiveTab] = useState("url");

  // Company matching state
  const [extractedData, setExtractedData] = useState<ExtractedJobData | null>(null);
  const [selectedCompanyName, setSelectedCompanyName] = useState("");

  const handleExtract = async () => {
    setError(null);
    setSuggestion(null);
    setExtractedData(null);
    setSelectedCompanyName("");
    setIsLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setError("You must be logged in.");
        return;
      }

      const body: { adminId: string; url?: string; rawText?: string } = {
        adminId: user.id,
      };

      if (activeTab === "url") {
        if (!url.trim()) {
          setError("Please enter a URL.");
          return;
        }
        body.url = url.trim();
      } else {
        if (!rawText.trim()) {
          setError("Please paste some job listing text.");
          return;
        }
        body.rawText = rawText.trim();
      }

      const response = await fetch("/api/admin/import-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.error || "Import failed.");
        if (result.suggestion) {
          setSuggestion(result.suggestion);
        }
        return;
      }

      const data = result.data as ExtractedJobData;
      const match = result.companyMatch as CompanyMatch | null;

      // Always show company confirmation step
      setExtractedData(data);
      if (match) {
        setSelectedCompanyName(match.name);
      } else {
        setSelectedCompanyName(data.companyName);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmCompany = () => {
    if (!extractedData || !selectedCompanyName.trim()) return;

    const finalData = { ...extractedData, companyName: selectedCompanyName.trim() };
    onImport(finalData);
    setIsOpen(false);
    setExtractedData(null);
    setSelectedCompanyName("");
  };

  // Company confirmation step
  if (extractedData) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Company Match</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            The extracted company name is{" "}
            <strong>&ldquo;{extractedData.companyName}&rdquo;</strong>. Search
            for an existing company or create a new one.
          </p>

          <CompanyCombobox
            value={selectedCompanyName}
            onChange={setSelectedCompanyName}
            companies={companies}
          />

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setExtractedData(null);
                setSelectedCompanyName("");
              }}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleConfirmCompany}
              disabled={!selectedCompanyName.trim()}
              className="flex-1"
            >
              <Check className="mr-2 h-4 w-4" />
              Confirm &amp; Fill Form
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        className="cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Import Job Listing</CardTitle>
          </div>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        {!isOpen && (
          <p className="text-sm text-muted-foreground mt-1">
            Click to expand — paste a URL or job listing text to pre-fill the
            form
          </p>
        )}
      </CardHeader>

      {isOpen && (
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Paste a job listing URL or raw text and Claude will extract the
            structured data to pre-fill the form below.
          </p>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="url" className="gap-1.5">
                <Link className="h-3.5 w-3.5" />
                From URL
              </TabsTrigger>
              <TabsTrigger value="text" className="gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                Paste Text
              </TabsTrigger>
            </TabsList>

            <TabsContent value="url">
              <Input
                placeholder="https://www.seek.com.au/job/12345678"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isLoading}
              />
            </TabsContent>

            <TabsContent value="text">
              <Textarea
                placeholder="Paste the full job listing text here..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={6}
                disabled={isLoading}
              />
            </TabsContent>
          </Tabs>

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <div>
                <p>{error}</p>
                {suggestion && (
                  <p className="mt-1 text-muted-foreground">{suggestion}</p>
                )}
              </div>
            </div>
          )}

          <Button
            onClick={handleExtract}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Extracting job data...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                {activeTab === "url" ? "Import from URL" : "Extract from Text"}
              </>
            )}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
