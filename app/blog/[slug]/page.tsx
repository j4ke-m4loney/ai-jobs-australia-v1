"use client";

import { useEffect, useState, useCallback } from "react";
import { use } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  featured_image_url: string | null;
  author_name: string | null;
  published_at: string;
  read_time_minutes: number | null;
  category: string | null;
  tags: string[] | null;
}

interface RelatedPost {
  id: string;
  slug: string;
  title: string;
  read_time_minutes: number | null;
  published_at: string;
  category: string | null;
}

export default function BlogArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPost = useCallback(async () => {
    try {
      // Fetch main post
      const { data: postData, error: postError } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .eq("status", "published")
        .single();

      if (postError) {
        console.error("Error fetching post:", postError);
        setLoading(false);
        return;
      }

      if (postData) {
        setPost(postData);

        // Fetch related posts (same category, different slug)
        const { data: related } = await supabase
          .from("blog_posts")
          .select("id, slug, title, read_time_minutes, published_at, category")
          .eq("status", "published")
          .neq("slug", slug)
          .order("published_at", { ascending: false })
          .limit(5);

        // Filter by category if post has one
        if (related) {
          const filteredRelated = postData.category
            ? related.filter((r) => r.category === postData.category)
            : related;
          setRelatedPosts(filteredRelated.slice(0, 4));
        }
      }
    } catch (error) {
      console.error("Error in fetchPost:", error);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The article you&apos;re looking for doesn&apos;t exist or has been
              removed.
            </p>
            <Link href="/blog">
              <Button>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        {/* Main Content */}
        <div className="container mx-auto px-4 pt-24 py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Article Content - Left Side */}
            <article className="flex-1 max-w-3xl">
              {/* Title */}
              <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-4 text-xs text-muted-foreground">
                {post.read_time_minutes && (
                  <span>{post.read_time_minutes} min read</span>
                )}
                <span>
                  {format(new Date(post.published_at), "d MMM, yyyy")}
                </span>
                {post.category && (
                  <Badge className="text-xs" variant="secondary">
                    {post.category}
                  </Badge>
                )}
              </div>

              {/* Featured Image */}
              {post.featured_image_url && (
                <div className="mb-8">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.featured_image_url}
                    alt={post.title}
                    className="w-full rounded-lg object-cover"
                    style={{ maxHeight: "500px" }}
                  />
                </div>
              )}

              {/* Article Content */}
              <div
                className="prose prose-lg max-w-none
                prose-headings:font-bold prose-headings:text-foreground
                prose-p:text-muted-foreground prose-p:leading-relaxed
                prose-a:text-primary prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground prose-strong:font-semibold
                prose-ul:text-muted-foreground prose-ol:text-muted-foreground
                prose-li:text-muted-foreground
                prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                prose-pre:bg-muted prose-pre:border prose-pre:border-border
                prose-img:rounded-lg"
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
            </article>

            {/* Sticky Sidebar - Right Side */}
            <aside className="lg:w-80 shrink-0">
              <div className="sticky top-20 space-y-6">
                {/* Related Articles Card */}
                {relatedPosts.length > 0 && (
                  <Card className="border-0 shadow-none">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle className="text-sm italic">
                        Related Articles
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 px-0">
                      {relatedPosts.map((relatedPost) => (
                        <Link
                          key={relatedPost.id}
                          href={`/blog/${relatedPost.slug}`}
                          className="block group"
                        >
                          <div className="pb-4 border-b last:border-b-0 last:pb-0">
                            <h4 className="text-sm font-medium leading-snug group-hover:text-primary transition-colors">
                              {relatedPost.title}
                            </h4>
                          </div>
                        </Link>
                      ))}
                    </CardContent>
                  </Card>
                )}

                {/* More Articles Button */}
                <Link href="/blog">
                  <Button className="w-fit">More articles</Button>
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
