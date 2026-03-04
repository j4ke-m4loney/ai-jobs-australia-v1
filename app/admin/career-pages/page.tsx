'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Plus,
  Trash2,
  RefreshCw,
  Radar,
  ExternalLink,
  Power,
  PowerOff,
  Download,
  Loader2,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

interface Company {
  id: string;
  name: string;
}

interface CareerPage {
  id: string;
  company_id: string | null;
  url: string;
  search_keywords: string;
  check_frequency: string;
  last_checked_at: string | null;
  last_content_hash: string | null;
  is_active: boolean;
  notes: string | null;
  created_at: string;
  companies: { id: string; name: string } | null;
  discovered_jobs_count: number;
}

interface DiscoveredJob {
  id: string;
  job_url: string;
  job_title: string | null;
  status: string;
  failure_reason: string | null;
  discovered_at: string;
  processed_at: string | null;
  career_pages: { url: string; companies: { name: string } | null } | null;
}

export default function AdminCareerPagesPage() {
  const [careerPages, setCareerPages] = useState<CareerPage[]>([]);
  const [discoveredJobs, setDiscoveredJobs] = useState<DiscoveredJob[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [checkingPageId, setCheckingPageId] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  // Add form state
  const [newUrl, setNewUrl] = useState('');
  const [newCompanyId, setNewCompanyId] = useState('');
  const [newKeywords, setNewKeywords] = useState(
    'AI, machine learning, data science'
  );
  const [newFrequency, setNewFrequency] = useState('daily');
  const [newNotes, setNewNotes] = useState('');

  const fetchCareerPages = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('career_pages')
        .select('*, companies(id, name)')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get discovered job counts per career page
      const pagesWithCounts = await Promise.all(
        (data || []).map(async (page) => {
          const { count } = await supabase
            .from('discovered_jobs')
            .select('*', { count: 'exact', head: true })
            .eq('career_page_id', page.id);

          return { ...page, discovered_jobs_count: count || 0 };
        })
      );

      setCareerPages(pagesWithCounts);
    } catch (error) {
      console.error('Error fetching career pages:', error);
      toast.error('Failed to fetch career pages');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchDiscoveredJobs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('discovered_jobs')
        .select('*, career_pages(url, companies(name))')
        .order('discovered_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setDiscoveredJobs(data || []);
    } catch (error) {
      console.error('Error fetching discovered jobs:', error);
    }
  }, []);

  const fetchCompanies = useCallback(async () => {
    const { data } = await supabase
      .from('companies')
      .select('id, name')
      .order('name');
    setCompanies(data || []);
  }, []);

  useEffect(() => {
    fetchCareerPages();
    fetchDiscoveredJobs();
    fetchCompanies();
  }, [fetchCareerPages, fetchDiscoveredJobs, fetchCompanies]);

  const handleAdd = async () => {
    if (!newUrl.trim()) {
      toast.error('URL is required');
      return;
    }

    try {
      const { error } = await supabase.from('career_pages').insert({
        url: newUrl.trim(),
        company_id: newCompanyId || null,
        search_keywords: newKeywords.trim(),
        check_frequency: newFrequency,
        notes: newNotes.trim() || null,
      });

      if (error) throw error;

      toast.success('Career page added');
      setShowAddDialog(false);
      setNewUrl('');
      setNewCompanyId('');
      setNewKeywords('AI, machine learning, data science');
      setNewFrequency('daily');
      setNewNotes('');
      fetchCareerPages();
    } catch (error) {
      console.error('Error adding career page:', error);
      toast.error('Failed to add career page');
    }
  };

  const handleToggleActive = async (id: string, currentlyActive: boolean) => {
    try {
      const { error } = await supabase
        .from('career_pages')
        .update({ is_active: !currentlyActive })
        .eq('id', id);

      if (error) throw error;
      toast.success(currentlyActive ? 'Career page paused' : 'Career page activated');
      fetchCareerPages();
    } catch (error) {
      console.error('Error toggling career page:', error);
      toast.error('Failed to update career page');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this career page and all its discovered jobs?'))
      return;

    try {
      const { error } = await supabase
        .from('career_pages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Career page deleted');
      fetchCareerPages();
      fetchDiscoveredJobs();
    } catch (error) {
      console.error('Error deleting career page:', error);
      toast.error('Failed to delete career page');
    }
  };

  const handleCheckNow = async (pageId: string) => {
    setCheckingPageId(pageId);
    try {
      // Reset last_checked_at so the cron picks it up, or trigger directly
      const { error } = await supabase
        .from('career_pages')
        .update({ last_checked_at: null })
        .eq('id', pageId);

      if (error) throw error;

      // Trigger discovery endpoint
      const response = await fetch('/api/jobs/discover', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || ''}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(
          `Check complete: ${result.stats?.newJobsFound || 0} new jobs found`
        );
      } else {
        toast.error('Discovery endpoint returned an error');
      }

      fetchCareerPages();
      fetchDiscoveredJobs();
    } catch (error) {
      console.error('Error checking career page:', error);
      toast.error('Failed to check career page');
    } finally {
      setCheckingPageId(null);
    }
  };

  const handleDismissJob = async (id: string) => {
    try {
      const { error } = await supabase
        .from('discovered_jobs')
        .update({ status: 'dismissed', processed_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
      toast.success('Job dismissed');
      fetchDiscoveredJobs();
    } catch (error) {
      console.error('Error dismissing job:', error);
      toast.error('Failed to dismiss job');
    }
  };

  const handleExtractAll = async () => {
    setIsExtracting(true);
    try {
      const response = await fetch('/api/jobs/discover/extract', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET || ''}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(
          `Extraction complete: ${result.stats?.jobsExtracted || 0} imported, ${result.stats?.jobsFailed || 0} failed`
        );
      } else {
        toast.error('Extraction endpoint returned an error');
      }

      fetchDiscoveredJobs();
    } catch (error) {
      console.error('Error running extraction:', error);
      toast.error('Failed to run extraction');
    } finally {
      setIsExtracting(false);
    }
  };

  const pendingExtractionCount = discoveredJobs.filter(
    (j) => j.status === 'pending_extraction'
  ).length;

  const statusBadgeVariant = (
    status: string
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'pending_extraction':
        return 'default';
      case 'imported':
        return 'secondary';
      case 'failed':
        return 'destructive';
      case 'dismissed':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Never';
    return new Date(dateStr).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Career Pages</h1>
            <p className="text-muted-foreground">
              Monitor employer career pages for new AI job listings
            </p>
          </div>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Career Page
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Career Page</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="url">Career Page URL</Label>
                  <Input
                    id="url"
                    placeholder="https://company.com/careers"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Select
                    value={newCompanyId}
                    onValueChange={setNewCompanyId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a company..." />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="keywords">Search Keywords</Label>
                  <Input
                    id="keywords"
                    placeholder="AI, machine learning, data science"
                    value={newKeywords}
                    onChange={(e) => setNewKeywords(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="frequency">Check Frequency</Label>
                  <Select
                    value={newFrequency}
                    onValueChange={setNewFrequency}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (optional)</Label>
                  <Input
                    id="notes"
                    placeholder="Any notes about this career page..."
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                  />
                </div>
                <Button onClick={handleAdd} className="w-full">
                  Add Career Page
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Career Pages Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Radar className="h-5 w-5" />
              Monitored Career Pages
            </CardTitle>
            <CardDescription>
              {careerPages.length} career page{careerPages.length !== 1 ? 's' : ''} being monitored
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground py-8 text-center">
                Loading...
              </p>
            ) : careerPages.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">
                No career pages yet. Add one to get started.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Last Checked</TableHead>
                    <TableHead>Jobs Found</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {careerPages.map((page) => (
                    <TableRow key={page.id}>
                      <TableCell className="font-medium">
                        {page.companies?.name || 'Unlinked'}
                      </TableCell>
                      <TableCell>
                        <a
                          href={page.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-blue-600 hover:underline max-w-[200px] truncate"
                        >
                          {new URL(page.url).hostname}
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{page.check_frequency}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(page.last_checked_at)}
                      </TableCell>
                      <TableCell>{page.discovered_jobs_count}</TableCell>
                      <TableCell>
                        <Badge
                          variant={page.is_active ? 'default' : 'secondary'}
                        >
                          {page.is_active ? 'Active' : 'Paused'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleCheckNow(page.id)}
                            disabled={checkingPageId === page.id}
                            title="Check now"
                          >
                            <RefreshCw
                              className={`h-4 w-4 ${checkingPageId === page.id ? 'animate-spin' : ''}`}
                            />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              handleToggleActive(page.id, page.is_active)
                            }
                            title={
                              page.is_active ? 'Pause' : 'Activate'
                            }
                          >
                            {page.is_active ? (
                              <PowerOff className="h-4 w-4" />
                            ) : (
                              <Power className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(page.id)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Discovered Jobs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recently Discovered Jobs</CardTitle>
                <CardDescription>
                  Latest jobs found across all career pages
                </CardDescription>
              </div>
              {pendingExtractionCount > 0 && (
                <Button
                  onClick={handleExtractAll}
                  disabled={isExtracting}
                >
                  {isExtracting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Extract All ({pendingExtractionCount})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {discoveredJobs.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">
                No discovered jobs yet. Jobs will appear here once career pages
                are checked.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Job Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Discovered</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discoveredJobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>
                        <a
                          href={job.job_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                        >
                          {job.job_title || 'Untitled'}
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                      </TableCell>
                      <TableCell className="text-sm">
                        {job.career_pages?.companies?.name || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant(job.status)}>
                          {job.status.replace('_', ' ')}
                        </Badge>
                        {job.failure_reason && (
                          <p className="text-xs text-destructive mt-1 max-w-[200px] truncate">
                            {job.failure_reason}
                          </p>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(job.discovered_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        {job.status === 'pending_extraction' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDismissJob(job.id)}
                          >
                            Dismiss
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
