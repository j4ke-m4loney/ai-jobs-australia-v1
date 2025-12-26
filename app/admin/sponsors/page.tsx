'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, RefreshCw, Star } from 'lucide-react';
import Link from 'next/link';
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
} from '@/components/ui/card';
import { toast } from 'sonner';

interface Sponsor {
  id: string;
  name: string;
  logo_url: string;
  destination_url: string;
  tagline: string | null;
  headline: string | null;
  is_active: boolean;
  is_default: boolean;
  created_at: string;
}

export default function AdminSponsorsPage() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSponsors = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('newsletter_sponsors')
        .select('id, name, logo_url, destination_url, tagline, headline, is_active, is_default, created_at')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSponsors(data || []);
    } catch (error) {
      console.error('Error fetching sponsors:', error);
      toast.error('Failed to fetch sponsors');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSponsors();
  }, [fetchSponsors]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const { error } = await supabase
        .from('newsletter_sponsors')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Sponsor deleted successfully');
      fetchSponsors();
    } catch (error) {
      console.error('Error deleting sponsor:', error);
      toast.error('Failed to delete sponsor');
    }
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('newsletter_sponsors')
        .update({ is_active: !currentState })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Sponsor ${!currentState ? 'activated' : 'deactivated'} successfully`);
      fetchSponsors();
    } catch (error) {
      console.error('Error toggling sponsor active state:', error);
      toast.error('Failed to update sponsor');
    }
  };

  const handleSetDefault = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('newsletter_sponsors')
        .update({ is_default: !currentState })
        .eq('id', id);

      if (error) throw error;

      toast.success(`Default sponsor ${!currentState ? 'set' : 'unset'} successfully`);
      fetchSponsors();
    } catch (error) {
      console.error('Error setting default sponsor:', error);
      toast.error('Failed to update sponsor');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Newsletter Sponsors</h1>
            <p className="text-muted-foreground mt-1">
              Manage sponsors for your email newsletters
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchSponsors}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Link href="/admin/sponsors/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Sponsor
              </Button>
            </Link>
          </div>
        </div>

        {/* Sponsors Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Sponsors ({sponsors.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : sponsors.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">No sponsors yet</p>
                <Link href="/admin/sponsors/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Sponsor
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Logo</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Destination URL</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Default</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sponsors.map((sponsor) => (
                      <TableRow key={sponsor.id}>
                        <TableCell>
                          <img
                            src={sponsor.logo_url}
                            alt={sponsor.name}
                            className="w-10 h-10 rounded object-cover border"
                          />
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{sponsor.name}</div>
                            {sponsor.headline && (
                              <div className="text-xs font-semibold text-primary/70 mt-0.5">
                                {sponsor.headline}
                              </div>
                            )}
                            {sponsor.tagline && !sponsor.headline && (
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {sponsor.tagline}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <a
                            href={sponsor.destination_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm truncate max-w-xs block"
                          >
                            {sponsor.destination_url}
                          </a>
                        </TableCell>
                        <TableCell>
                          <Badge variant={sponsor.is_active ? 'default' : 'secondary'}>
                            {sponsor.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {sponsor.is_default && (
                            <Badge variant="outline" className="bg-yellow-50">
                              <Star className="h-3 w-3 mr-1 fill-yellow-500 text-yellow-500" />
                              Default
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleActive(sponsor.id, sponsor.is_active)}
                              title={sponsor.is_active ? 'Deactivate' : 'Activate'}
                            >
                              {sponsor.is_active ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSetDefault(sponsor.id, sponsor.is_default)}
                              title={sponsor.is_default ? 'Unset as default' : 'Set as default'}
                            >
                              <Star className={sponsor.is_default ? 'h-4 w-4 fill-yellow-500 text-yellow-500' : 'h-4 w-4'} />
                            </Button>
                            <Link href={`/admin/sponsors/${sponsor.id}`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(sponsor.id, sponsor.name)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
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
    </AdminLayout>
  );
}
