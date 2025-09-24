"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  MapPin,
  Building,
  Clock,
  DollarSign,
  Star,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface Company {
  id: string;
  name: string;
  logo_url?: string;
  website?: string;
}

interface FeaturedJob {
  id: string;
  title: string;
  description: string;
  location: string;
  location_type: string;
  job_type: string;
  salary_min?: number;
  salary_max?: number;
  is_featured: boolean;
  featured_until: string;
  highlights: string[];
  created_at: string;
  companies?: Company;
}

export default function FeaturedJobs() {
  const [jobs, setJobs] = useState<FeaturedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    fetchFeaturedJobs();
  }, []);

  const fetchFeaturedJobs = async () => {
    try {
      const response = await fetch('/api/jobs/featured?limit=6');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch featured jobs');
      }

      setJobs(data.jobs || []);
    } catch (err: unknown) {
      console.error('Error fetching featured jobs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch featured jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleJobClick = (jobId: string) => {
    if (!user) {
      router.push("/auth");
      return;
    }
    router.push(`/jobs/${jobId}`);
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return 'Salary not specified';

    const formatAmount = (amount: number) => {
      if (amount >= 1000) {
        return `$${(amount / 1000).toFixed(0)}k`;
      }
      return `$${amount.toLocaleString()}`;
    };

    if (min && max) {
      return `${formatAmount(min)} - ${formatAmount(max)}`;
    }
    if (min) {
      return `From ${formatAmount(min)}`;
    }
    if (max) {
      return `Up to ${formatAmount(max)}`;
    }
    return 'Salary not specified';
  };

  const formatJobType = (jobType: string) => {
    return jobType
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatLocationType = (locationType: string) => {
    const mapping: { [key: string]: string } = {
      'remote': 'Remote',
      'onsite': 'On-site',
      'hybrid': 'Hybrid',
    };
    return mapping[locationType] || locationType;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) return 'Today';
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} week${Math.floor(diffInDays / 7) > 1 ? 's' : ''} ago`;
    return `${Math.floor(diffInDays / 30)} month${Math.floor(diffInDays / 30) > 1 ? 's' : ''} ago`;
  };

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
              <h2 className="text-3xl font-bold text-foreground">Featured Jobs</h2>
            </div>
            <p className="text-muted-foreground text-lg">
              Premium opportunities from top AI companies
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || jobs.length === 0) {
    return null; // Don't show section if there are no featured jobs
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">Featured Jobs</h2>
          </div>
          <p className="text-muted-foreground text-lg">
            Premium opportunities from top AI companies
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {jobs.map((job) => (
            <Card
              key={job.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-300 border-2 border-primary/20 relative overflow-hidden"
              onClick={() => handleJobClick(job.id)}
            >
              {/* Featured badge */}
              <div className="absolute top-4 right-4">
                <Badge className="bg-primary text-primary-foreground flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Featured
                </Badge>
              </div>

              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-foreground pr-20">
                  {job.title}
                </CardTitle>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building className="w-4 h-4" />
                  <span className="text-sm">
                    {job.companies?.name || 'Company Name'}
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{job.location}</span>
                    <span>•</span>
                    <span>{formatLocationType(job.location_type)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{formatJobType(job.job_type)}</span>
                    <span>•</span>
                    <span>{formatTimeAgo(job.created_at)}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="w-4 h-4" />
                    <span>{formatSalary(job.salary_min, job.salary_max)}</span>
                  </div>
                </div>

                {job.highlights && job.highlights.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {job.highlights.slice(0, 3).map((highlight, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {highlight}
                      </Badge>
                    ))}
                    {job.highlights.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{job.highlights.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                <div className="pt-2">
                  <Button variant="outline" className="w-full group">
                    View Details
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button
            onClick={() => router.push('/jobs?featured=true')}
            size="lg"
            className="group"
          >
            View All Featured Jobs
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </section>
  );
}