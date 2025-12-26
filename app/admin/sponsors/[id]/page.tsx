'use client';

import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function EditSponsorPage() {
  const router = useRouter();
  const params = useParams();
  const sponsorId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    destination_url: '',
    tagline: '',
    hero_image_url: '',
    headline: '',
    description: '',
    cta_text: 'Learn More',
    cta_color: '#009306',
    is_active: true,
    is_default: false,
  });

  useEffect(() => {
    const fetchSponsor = async () => {
      try {
        const { data, error } = await supabase
          .from('newsletter_sponsors')
          .select('*')
          .eq('id', sponsorId)
          .single();

        if (error) throw error;

        if (data) {
          setFormData({
            name: data.name,
            logo_url: data.logo_url,
            destination_url: data.destination_url,
            tagline: data.tagline || '',
            hero_image_url: data.hero_image_url || '',
            headline: data.headline || '',
            description: data.description || '',
            cta_text: data.cta_text || 'Learn More',
            cta_color: data.cta_color || '#009306',
            is_active: data.is_active,
            is_default: data.is_default,
          });
        }
      } catch (error) {
        console.error('Error fetching sponsor:', error);
        toast.error('Failed to load sponsor');
        router.push('/admin/sponsors');
      } finally {
        setLoading(false);
      }
    };

    fetchSponsor();
  }, [sponsorId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validation
      if (!formData.name.trim()) {
        toast.error('Sponsor name is required');
        setSaving(false);
        return;
      }

      if (!formData.logo_url.trim()) {
        toast.error('Logo URL is required');
        setSaving(false);
        return;
      }

      if (!formData.destination_url.trim()) {
        toast.error('Destination URL is required');
        setSaving(false);
        return;
      }

      // Validate URL format
      try {
        new URL(formData.destination_url);
      } catch {
        toast.error('Please enter a valid destination URL');
        setSaving(false);
        return;
      }

      // Update in database
      const { error } = await supabase
        .from('newsletter_sponsors')
        .update({
          name: formData.name.trim(),
          logo_url: formData.logo_url.trim(),
          destination_url: formData.destination_url.trim(),
          tagline: formData.tagline.trim() || null,
          hero_image_url: formData.hero_image_url.trim() || null,
          headline: formData.headline.trim() || null,
          description: formData.description.trim() || null,
          cta_text: formData.cta_text.trim() || 'Learn More',
          cta_color: formData.cta_color || '#009306',
          is_active: formData.is_active,
          is_default: formData.is_default,
        })
        .eq('id', sponsorId);

      if (error) throw error;

      toast.success('Sponsor updated successfully');
      router.push('/admin/sponsors');
    } catch (error) {
      console.error('Error updating sponsor:', error);
      toast.error('Failed to update sponsor');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <Link href="/admin/sponsors">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sponsors
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Edit Sponsor</h1>
          <p className="text-muted-foreground mt-1">
            Update sponsor details
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Essential sponsor details and click destination
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Sponsor Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="e.g., Presentations.AI, DataRobot"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              {/* Destination URL */}
              <div className="space-y-2">
                <Label htmlFor="destination_url">
                  Destination URL <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="destination_url"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.destination_url}
                  onChange={(e) => setFormData({ ...formData, destination_url: e.target.value })}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Where users will be directed when they click on the sponsor
                </p>
              </div>

              {/* Active and Default Checkboxes */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_active: checked as boolean })
                    }
                  />
                  <Label htmlFor="is_active" className="cursor-pointer">
                    Active (sponsor can be used in newsletters)
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_default"
                    checked={formData.is_default}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_default: checked as boolean })
                    }
                  />
                  <Label htmlFor="is_default" className="cursor-pointer">
                    Set as default sponsor (used when no sponsor is explicitly selected)
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Header Placement Content */}
          <Card>
            <CardHeader>
              <CardTitle>Header Placement</CardTitle>
              <CardDescription>
                Appears at the top with &quot;Supported by...&quot; label
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Logo */}
              <div className="space-y-2">
                <Label>
                  Logo <span className="text-red-500">*</span>
                </Label>
                <ImageUpload
                  value={formData.logo_url}
                  onChange={(url) => setFormData({ ...formData, logo_url: url })}
                  bucket="newsletter-images"
                  folder="sponsor-logos"
                />
                <p className="text-sm text-muted-foreground">
                  Upload a logo (recommended: 180px width, transparent background)
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Main Card Content */}
          <Card>
            <CardHeader>
              <CardTitle>Main Card Placement</CardTitle>
              <CardDescription>
                Featured sponsor showcase with hero image, headline, and description
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Hero Image */}
              <div className="space-y-2">
                <Label>Hero Image (Optional)</Label>
                <ImageUpload
                  value={formData.hero_image_url}
                  onChange={(url) => setFormData({ ...formData, hero_image_url: url })}
                  bucket="newsletter-images"
                  folder="sponsor-heroes"
                />
                <p className="text-sm text-muted-foreground">
                  Large product/brand image (recommended: 1200x600px)
                </p>
              </div>

              {/* Headline */}
              <div className="space-y-2">
                <Label htmlFor="headline">Headline (Optional)</Label>
                <Input
                  id="headline"
                  type="text"
                  placeholder='e.g., "Create Decks That Impress."'
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  Bold headline for the main sponsor card
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  placeholder="Rich description text about your sponsor... Can include multiple paragraphs."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={6}
                />
                <p className="text-sm text-muted-foreground">
                  Detailed description of the sponsor&apos;s offering (supports multiple paragraphs)
                </p>
              </div>

              {/* CTA Button Text */}
              <div className="space-y-2">
                <Label htmlFor="cta_text">CTA Button Text</Label>
                <Input
                  id="cta_text"
                  type="text"
                  placeholder="Learn More"
                  value={formData.cta_text}
                  onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                />
                <p className="text-sm text-muted-foreground">
                  Text for the call-to-action button (e.g., &quot;Try for Free!&quot;, &quot;Learn More&quot;)
                </p>
              </div>

              {/* CTA Button Color */}
              <div className="space-y-2">
                <Label htmlFor="cta_color">CTA Button Color</Label>
                <div className="flex gap-3 items-center">
                  <Input
                    id="cta_color"
                    type="color"
                    value={formData.cta_color}
                    onChange={(e) => setFormData({ ...formData, cta_color: e.target.value })}
                    className="w-20 h-10 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={formData.cta_color}
                    onChange={(e) => setFormData({ ...formData, cta_color: e.target.value })}
                    placeholder="#009306"
                    className="flex-1"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Hex color for the CTA button background
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Footer Placement - Uses same description */}
          <Card>
            <CardHeader>
              <CardTitle>Footer Placement</CardTitle>
              <CardDescription>
                Secondary mention at the bottom using the description and CTA from above
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                The footer placement automatically uses the description and CTA button settings from the Main Card section above.
                Your sponsor will appear 3 times total: Header (logo), Main Card (full showcase), and Footer (reinforcement).
              </p>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Link href="/admin/sponsors">
              <Button type="button" variant="outline" disabled={saving}>
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
}
