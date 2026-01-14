"use client";

import { useState, useEffect, useCallback } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Mail, Send, ExternalLink, Loader2, Code } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Sponsor {
  id: string;
  name: string;
  logo_url: string;
  is_default: boolean;
}

interface Draft {
  id: string;
  name: string;
  subject: string;
  broadcast_id: string;
  recipient_count: number;
  jobs_count: number;
  created_at: string;
  sponsor_id: string | null;
  status: string;
  resendUrl?: string;
}

export default function AdminNewsletterPage() {
  // Form state
  const [introText, setIntroText] = useState<string>("");
  const [outroText, setOutroText] = useState<string>("");
  const [introHtmlMode, setIntroHtmlMode] = useState<boolean>(false);
  const [outroHtmlMode, setOutroHtmlMode] = useState<boolean>(false);
  const [selectedSponsorId, setSelectedSponsorId] = useState<string | null>(
    null
  );
  const [featuredJobId, setFeaturedJobId] = useState<string>("");
  const [showFeaturedHighlights, setShowFeaturedHighlights] = useState<boolean>(true);
  const [newsletterType, setNewsletterType] = useState<"test" | "production">(
    "test"
  );

  // Data state
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);

  // UI state
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [isSendingDraft, setIsSendingDraft] = useState(false);
  const [isLoadingSponsors, setIsLoadingSponsors] = useState(true);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(true);

  // Dialog state
  const [sendTestDialogOpen, setSendTestDialogOpen] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [sendDraftDialogOpen, setSendDraftDialogOpen] = useState(false);
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);

  // Fetch sponsors on mount
  const fetchSponsors = useCallback(async () => {
    setIsLoadingSponsors(true);
    try {
      const { data, error } = await supabase
        .from("newsletter_sponsors")
        .select("id, name, logo_url, is_default")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;

      if (data) {
        setSponsors(data);
        // Auto-select default sponsor
        const defaultSponsor = data.find((s) => s.is_default);
        if (defaultSponsor) {
          setSelectedSponsorId(defaultSponsor.id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch sponsors:", error);
      toast.error("Failed to load sponsors");
    } finally {
      setIsLoadingSponsors(false);
    }
  }, []);

  // Fetch drafts
  const fetchDrafts = useCallback(async () => {
    setIsLoadingDrafts(true);
    try {
      const secret = process.env.NEXT_PUBLIC_CRON_SECRET;
      if (!secret) {
        console.error("NEXT_PUBLIC_CRON_SECRET not found");
        return;
      }

      const response = await fetch(
        `/api/newsletter/draft?secret=${secret}`
      );
      const result = await response.json();

      if (result.success) {
        setDrafts(result.drafts || []);
      } else {
        throw new Error(result.message || "Failed to fetch drafts");
      }
    } catch (error) {
      console.error("Failed to fetch drafts:", error);
      toast.error("Failed to load drafts");
    } finally {
      setIsLoadingDrafts(false);
    }
  }, []);

  useEffect(() => {
    fetchSponsors();
    fetchDrafts();
  }, [fetchSponsors, fetchDrafts]);

  // Create draft
  const handleCreateDraft = async () => {
    setIsCreatingDraft(true);
    try {
      const secret = process.env.NEXT_PUBLIC_CRON_SECRET;
      if (!secret) {
        toast.error("Configuration error: CRON_SECRET not set");
        return;
      }

      const response = await fetch("/api/newsletter/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret,
          type: newsletterType,
          introText: introText || undefined,
          outroText: outroText || undefined,
          sponsorId: selectedSponsorId || undefined,
          featuredJobId: featuredJobId || undefined,
          showFeaturedHighlights: featuredJobId ? showFeaturedHighlights : undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          `Draft created successfully! ${result.jobsCount} jobs included.`
        );

        // Show Resend link
        if (result.resendUrl) {
          toast.info(
            <div className="flex items-center gap-2">
              <span>View draft in Resend</span>
              <a
                href={result.resendUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                Open
              </a>
            </div>,
            { duration: 10000 }
          );
        }

        // Refresh drafts list
        fetchDrafts();

        // Optionally clear form
        // setIntroText('');
        // setOutroText('');
      } else {
        toast.error(result.message || "Failed to create draft");
      }
    } catch (error) {
      console.error("Error creating draft:", error);
      toast.error("Error creating draft");
    } finally {
      setIsCreatingDraft(false);
    }
  };

  // Send test email
  const handleSendTest = async () => {
    if (!testEmail || !testEmail.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }

    setIsSendingTest(true);
    try {
      const secret = process.env.NEXT_PUBLIC_CRON_SECRET;
      if (!secret) {
        toast.error("Configuration error: CRON_SECRET not set");
        return;
      }

      const response = await fetch("/api/newsletter/send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret,
          email: testEmail,
          firstName: "Test User",
          introText: introText || undefined,
          outroText: outroText || undefined,
          sponsorId: selectedSponsorId || undefined,
          featuredJobId: featuredJobId || undefined,
          showFeaturedHighlights: featuredJobId ? showFeaturedHighlights : undefined,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(`Test email sent to ${testEmail}`);
        setSendTestDialogOpen(false);
        setTestEmail("");
      } else {
        toast.error(result.message || "Failed to send test");
      }
    } catch (error) {
      console.error("Error sending test email:", error);
      toast.error("Error sending test email");
    } finally {
      setIsSendingTest(false);
    }
  };

  // Send draft
  const handleSendDraft = async () => {
    if (!selectedDraft) return;

    setIsSendingDraft(true);
    try {
      const secret = process.env.NEXT_PUBLIC_CRON_SECRET;
      if (!secret) {
        toast.error("Configuration error: CRON_SECRET not set");
        return;
      }

      const response = await fetch("/api/newsletter/draft/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret,
          campaignId: selectedDraft.id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          `Newsletter sent to ${result.recipientCount} recipients!`
        );
        fetchDrafts();
        setSendDraftDialogOpen(false);
        setSelectedDraft(null);
      } else {
        toast.error(result.message || "Failed to send draft");
      }
    } catch (error) {
      console.error("Error sending draft:", error);
      toast.error("Error sending draft");
    } finally {
      setIsSendingDraft(false);
    }
  };

  // Email validation
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Newsletter Management</h1>
          <p className="text-muted-foreground">
            Create and manage newsletter drafts with custom intro/outro text
          </p>
        </div>

        {/* Newsletter Form */}
        <Card>
          <CardHeader>
            <CardTitle>Newsletter Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Newsletter Type Toggle */}
            <div className="space-y-2">
              <Label>Newsletter Type</Label>
              <div className="flex gap-4">
                <button
                  onClick={() => setNewsletterType("test")}
                  className={`flex-1 p-4 border-2 rounded-lg transition-colors ${
                    newsletterType === "test"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-semibold">Test Newsletter</div>
                  <div className="text-sm text-muted-foreground">
                    Send to test users only
                  </div>
                </button>
                <button
                  onClick={() => setNewsletterType("production")}
                  className={`flex-1 p-4 border-2 rounded-lg transition-colors ${
                    newsletterType === "production"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="font-semibold">Production Newsletter</div>
                  <div className="text-sm text-muted-foreground">
                    Create draft for all subscribers
                  </div>
                </button>
              </div>
            </div>

            {/* Intro Text */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="intro-text">Intro Text</Label>
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-muted-foreground" />
                  <Label
                    htmlFor="intro-html-mode"
                    className="text-sm font-normal cursor-pointer"
                  >
                    HTML Mode
                  </Label>
                  <Switch
                    id="intro-html-mode"
                    checked={introHtmlMode}
                    onCheckedChange={setIntroHtmlMode}
                  />
                </div>
              </div>
              <Textarea
                id="intro-text"
                placeholder={
                  introHtmlMode
                    ? "Enter HTML code here... Example: <p>Hello <strong>world</strong>!</p>"
                    : "Enter your intro text here... You can use multiple paragraphs and basic formatting."
                }
                value={introText}
                onChange={(e) => setIntroText(e.target.value)}
                rows={8}
                className={`resize-y ${introHtmlMode ? "font-mono text-sm" : ""}`}
              />
              <div className="text-sm text-muted-foreground flex items-center justify-between">
                <span>{introText.length} characters</span>
                {introHtmlMode && (
                  <span className="text-xs">
                    HTML will be rendered in the email
                  </span>
                )}
              </div>
            </div>

            {/* Outro Text */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="outro-text">Outro Text</Label>
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-muted-foreground" />
                  <Label
                    htmlFor="outro-html-mode"
                    className="text-sm font-normal cursor-pointer"
                  >
                    HTML Mode
                  </Label>
                  <Switch
                    id="outro-html-mode"
                    checked={outroHtmlMode}
                    onCheckedChange={setOutroHtmlMode}
                  />
                </div>
              </div>
              <Textarea
                id="outro-text"
                placeholder={
                  outroHtmlMode
                    ? "Enter HTML code here... Example: <p>Thanks!<br/><strong>Jake</strong></p>"
                    : "Enter your outro text here... Keep it brief and friendly."
                }
                value={outroText}
                onChange={(e) => setOutroText(e.target.value)}
                rows={6}
                className={`resize-y ${outroHtmlMode ? "font-mono text-sm" : ""}`}
              />
              <div className="text-sm text-muted-foreground flex items-center justify-between">
                <span>{outroText.length} characters</span>
                {outroHtmlMode && (
                  <span className="text-xs">
                    HTML will be rendered in the email
                  </span>
                )}
              </div>
            </div>

            {/* Sponsor Selector */}
            <div className="space-y-2">
              <Label htmlFor="sponsor">Sponsor (Optional)</Label>
              {isLoadingSponsors ? (
                <div className="text-sm text-muted-foreground">
                  Loading sponsors...
                </div>
              ) : (
                <Select
                  value={selectedSponsorId || "none"}
                  onValueChange={(value) =>
                    setSelectedSponsorId(value === "none" ? null : value)
                  }
                >
                  <SelectTrigger id="sponsor">
                    <SelectValue placeholder="Select a sponsor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Sponsor</SelectItem>
                    {sponsors.map((sponsor) => (
                      <SelectItem key={sponsor.id} value={sponsor.id}>
                        {sponsor.name}
                        {sponsor.is_default && " (Default)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {selectedSponsorId && (
                <div className="text-sm text-muted-foreground">
                  Selected sponsor will appear in header, main card, and footer
                </div>
              )}
            </div>

            {/* Featured Job ID */}
            <div className="space-y-2">
              <Label htmlFor="featured-job-id">Featured Job ID (Optional)</Label>
              <Input
                id="featured-job-id"
                placeholder="Enter job ID to highlight (e.g., abc123-def456-...)"
                value={featuredJobId}
                onChange={(e) => setFeaturedJobId(e.target.value)}
              />
              <div className="text-sm text-muted-foreground">
                This job will appear in a highlighted &quot;Featured Opportunity&quot; section after the intro text
              </div>
              {featuredJobId && (
                <div className="flex items-center gap-2 pt-2">
                  <Switch
                    id="show-highlights"
                    checked={showFeaturedHighlights}
                    onCheckedChange={setShowFeaturedHighlights}
                  />
                  <Label
                    htmlFor="show-highlights"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Show bullet highlights in featured job card
                  </Label>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={() => setSendTestDialogOpen(true)}
            variant="outline"
            className="gap-2"
          >
            <Send className="h-4 w-4" />
            Send Test Email
          </Button>
          <Button
            onClick={handleCreateDraft}
            disabled={isCreatingDraft}
            className="gap-2"
          >
            {isCreatingDraft ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating Draft...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4" />
                Create Draft
              </>
            )}
          </Button>
        </div>

        {/* Recent Drafts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Drafts</CardTitle>
              <Button
                onClick={fetchDrafts}
                variant="outline"
                size="sm"
                disabled={isLoadingDrafts}
              >
                {isLoadingDrafts ? "Loading..." : "Refresh"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingDrafts ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading drafts...
              </div>
            ) : drafts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No drafts found. Create your first draft above!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Recipients</TableHead>
                      <TableHead>Jobs</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drafts.map((draft) => (
                      <TableRow key={draft.id}>
                        <TableCell className="font-medium">
                          {draft.name}
                        </TableCell>
                        <TableCell>{draft.subject}</TableCell>
                        <TableCell>{draft.recipient_count}</TableCell>
                        <TableCell>{draft.jobs_count}</TableCell>
                        <TableCell>
                          {formatDistanceToNow(new Date(draft.created_at), {
                            addSuffix: true,
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              draft.status === "sent" ? "default" : "secondary"
                            }
                          >
                            {draft.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {draft.resendUrl && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  window.open(draft.resendUrl, "_blank")
                                }
                                className="gap-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Resend
                              </Button>
                            )}
                            {draft.status === "draft" && (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                  setSelectedDraft(draft);
                                  setSendDraftDialogOpen(true);
                                }}
                                className="gap-1"
                              >
                                <Send className="h-3 w-3" />
                                Send
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Send Test Email Dialog */}
      <Dialog open={sendTestDialogOpen} onOpenChange={setSendTestDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Test Newsletter</DialogTitle>
            <DialogDescription>
              Send a test newsletter to preview the content with your current
              intro/outro text and sponsor selection.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="test-email">Email Address</Label>
              <Input
                id="test-email"
                type="email"
                placeholder="your.email@example.com"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSendTestDialogOpen(false);
                setTestEmail("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendTest}
              disabled={isSendingTest || !isValidEmail(testEmail)}
            >
              {isSendingTest ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Test"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Draft Confirmation Dialog */}
      <Dialog
        open={sendDraftDialogOpen}
        onOpenChange={setSendDraftDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Newsletter to Production?</DialogTitle>
            <DialogDescription className="text-amber-600">
              This will send the newsletter to{" "}
              {selectedDraft?.recipient_count} subscribers. This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedDraft && (
            <div className="bg-muted p-4 rounded-md space-y-1">
              <p>
                <strong>Campaign:</strong> {selectedDraft.name}
              </p>
              <p>
                <strong>Subject:</strong> {selectedDraft.subject}
              </p>
              <p>
                <strong>Recipients:</strong> {selectedDraft.recipient_count}
              </p>
              <p>
                <strong>Jobs:</strong> {selectedDraft.jobs_count}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSendDraftDialogOpen(false);
                setSelectedDraft(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleSendDraft}
              disabled={isSendingDraft}
            >
              {isSendingDraft ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send to All Subscribers"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
