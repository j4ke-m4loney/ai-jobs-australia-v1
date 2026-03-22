"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Copy,
  Check,
  Download,
  RefreshCw,
  X,
  FileUp,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { toast } from "sonner";

interface CoverLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
  companyName?: string | null;
}

export function CoverLetterModal({
  isOpen,
  onClose,
  jobId,
  jobTitle,
  companyName,
}: CoverLetterModalProps) {
  const { user } = useAuth();
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noResume, setNoResume] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState("");
  const [generationNumber, setGenerationNumber] = useState(0);
  const [maxGenerations, setMaxGenerations] = useState(3);
  const [limitReached, setLimitReached] = useState(false);

  const generateLetter = async (isRegenerate = false) => {
    if (!user?.id) return;
    if (limitReached) return;

    setLoading(true);
    setError(null);
    setNoResume(false);
    if (isRegenerate) setCoverLetter(null);

    try {
      const response = await fetch("/api/generate-cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, jobId, regenerate: isRegenerate }),
      });

      // Safely parse — API might return HTML on server errors
      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        throw new Error("Failed to generate cover letter. Please try again later.");
      }

      if (!response.ok) {
        if (data.error === "no_resume") {
          setNoResume(true);
          return;
        }
        if (data.error === "job_limit" || data.error === "monthly_limit") {
          setLimitReached(true);
          setError(data.message);
          return;
        }
        throw new Error(data.message || data.error || "Failed to generate cover letter");
      }

      setCoverLetter(data.cover_letter);
      setEditedText(data.cover_letter);
      setWordCount(data.word_count);
      setGenerationNumber(data.generation_number ?? 0);
      setMaxGenerations(data.max_generations ?? 3);
      if (data.generation_number >= data.max_generations) {
        setLimitReached(true);
      }
    } catch (err) {
      console.error("Error generating cover letter:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate when modal opens (not a regeneration)
  useEffect(() => {
    if (isOpen && !coverLetter && !loading && !noResume && !error && !limitReached) {
      generateLetter(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  const handleCopy = async () => {
    const textToCopy = isEditing ? editedText : coverLetter;
    if (!textToCopy) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      toast.success("Cover letter copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleDownload = () => {
    const textToDownload = isEditing ? editedText : coverLetter;
    if (!textToDownload) return;

    const filename = `Cover_Letter_${jobTitle.replace(/[^a-zA-Z0-9]/g, "_")}.txt`;
    const blob = new Blob([textToDownload], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Cover letter downloaded");
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-t-xl sm:rounded-xl bg-white p-0 [&>button:last-child]:hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 px-6 pt-6 pb-4">
          <DialogClose className="absolute right-4 top-4 rounded-sm text-white/70 hover:text-white transition-opacity focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-blue-600">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
          <DialogHeader className="flex flex-col items-center text-center">
            <DialogTitle className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="text-white">Cover Letter Generator</span>
            </DialogTitle>
            <p className="text-sm text-white/70 mt-1">
              {jobTitle} {companyName && `at ${companyName}`}
            </p>
          </DialogHeader>
        </div>

        {/* Content */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-4 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center animate-pulse">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <div className="absolute inset-0 w-16 h-16 rounded-full border-2 border-blue-400 animate-ping opacity-30" />
              </div>
              <p className="mt-6 text-lg font-medium text-foreground">Writing your cover letter...</p>
              <p className="mt-1 text-sm text-muted-foreground">Tailoring it to your CV and this role</p>
            </div>
          )}

          {/* No resume state */}
          {noResume && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4 px-4">
              <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                <FileUp className="w-8 h-8 text-blue-500" />
              </div>
              <div className="text-center space-y-2">
                <p className="font-semibold text-lg text-foreground">Upload your CV to get started</p>
                <p className="text-sm text-muted-foreground max-w-sm">
                  The Cover Letter Generator uses your CV to write personalised cover letters
                  that highlight your relevant experience for each role. Upload your CV once
                  and you can generate cover letters for any job listing.
                </p>
              </div>
              <Link href="/jobseeker/documents">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                  <FileUp className="w-4 h-4" />
                  Upload Your CV
                </Button>
              </Link>
              <p className="text-xs text-muted-foreground">
                Accepts PDF, DOC, or DOCX. Your CV is stored securely.
              </p>
            </div>
          )}

          {/* Error state */}
          {error && !noResume && (
            <div className="flex flex-col items-center justify-center py-10 space-y-4 px-4">
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                <FileText className="w-8 h-8 text-red-400" />
              </div>
              <div className="text-center space-y-2">
                <p className="font-medium text-foreground">Something went wrong</p>
                <p className="text-sm text-muted-foreground max-w-sm">{error}</p>
                <p className="text-sm text-muted-foreground max-w-sm">
                  This feature requires an uploaded CV. Make sure you have a default resume set in your documents.
                </p>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Link href="/jobseeker/documents">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                    <FileUp className="w-4 h-4" />
                    Upload CV for Analysis
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => generateLetter(false)} className="text-muted-foreground">
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Try Again
                </Button>
              </div>
            </div>
          )}

          {/* Generated cover letter */}
          {coverLetter && !loading && (
            <div className="space-y-4">
              {/* Action bar */}
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  {wordCount} words
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditing(!isEditing);
                      if (!isEditing) setEditedText(coverLetter);
                    }}
                    className="text-xs"
                  >
                    {isEditing ? "Preview" : "Edit"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="text-xs"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 mr-1 text-green-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 mr-1" />
                    )}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownload}
                    className="text-xs"
                  >
                    <Download className="w-3.5 h-3.5 mr-1" />
                    Download
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => generateLetter(true)}
                    disabled={limitReached}
                    className="text-xs"
                    title={limitReached ? "Regeneration limit reached" : undefined}
                  >
                    <RefreshCw className="w-3.5 h-3.5 mr-1" />
                    {limitReached
                      ? "Limit reached"
                      : `Regenerate (${Math.max(0, maxGenerations - generationNumber)} left)`}
                  </Button>
                </div>
              </div>

              {/* Letter content */}
              {isEditing ? (
                <textarea
                  value={editedText}
                  onChange={(e) => setEditedText(e.target.value)}
                  className="w-full min-h-[400px] rounded-lg border border-slate-200 p-4 text-sm leading-relaxed font-serif focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 resize-y"
                />
              ) : (
                <div className="rounded-lg border border-slate-200 bg-white p-4 sm:p-6">
                  <div className="max-w-none">
                    {(isEditing ? editedText : coverLetter).split("\n").map((paragraph, i) => (
                      paragraph.trim() ? (
                        <p key={i} className="text-foreground leading-relaxed mb-4 last:mb-0">
                          {paragraph}
                        </p>
                      ) : null
                    ))}
                  </div>
                </div>
              )}

              {/* Footer tip */}
              <p className="text-xs text-muted-foreground text-center">
                Review and personalise before sending. Replace [Your Name] with your actual name.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
