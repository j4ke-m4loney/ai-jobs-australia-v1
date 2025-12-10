"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Search,
  Calendar,
  Clock,
  User,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import Link from "next/link";
import { format } from "date-fns";

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author_name: string | null;
  published_at: string;
  read_time_minutes: number | null;
  category: string | null;
  featured_image_url: string | null;
}

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  async function fetchPosts() {
    try {
      const { data, error } = await supabase
        .from("blog_posts")
        .select(
          "id, slug, title, excerpt, author_name, published_at, read_time_minutes, category, featured_image_url"
        )
        .eq("status", "published")
        .order("published_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setPosts(data);

        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(data.map((post) => post.category).filter(Boolean))
        ) as string[];
        setCategories(["all", ...uniqueCategories]);
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.excerpt &&
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory =
      selectedCategory === "all" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // For now, we'll consider the first 3 posts as featured
  // You could add a `featured` boolean column to the database later
  const featuredPosts = posts.slice(0, 3);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-20 pb-8 bg-gradient-to-br from-background via-muted/30 to-primary-light/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 pb-2 bg-gradient-hero bg-clip-text text-transparent">
              AI Career Insights & News
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stay ahead in your AI career with expert insights, industry
              trends, and practical advice from Australia&apos;s leading AI
              professionals.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      {featuredPosts.length > 0 && (
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-8">
              <TrendingUp className="w-6 h-6 text-primary" />
              <h2 className="text-3xl font-bold text-foreground">
                Featured Articles
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`}>
                  <Card className="hover:shadow-lg transition-all cursor-pointer group overflow-hidden h-full">
                    {post.featured_image_url ? (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={post.featured_image_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-primary/10 to-accent/10" />
                    )}
                    <CardHeader>
                      {post.category && (
                        <Badge variant="secondary" className="w-fit mb-2">
                          {post.category}
                        </Badge>
                      )}
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {post.excerpt && (
                        <p className="text-muted-foreground mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          {post.read_time_minutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {post.read_time_minutes} min
                            </span>
                          )}
                        </div>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {format(new Date(post.published_at), "MMM d")}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Blog Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold text-foreground">
                  Latest Articles
                </h2>
                <div className="text-sm text-muted-foreground">
                  {filteredPosts.length} articles found
                </div>
              </div>

              {filteredPosts.length === 0 ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground">
                    No articles found matching your criteria.
                  </p>
                </Card>
              ) : (
                <div className="space-y-6">
                  {filteredPosts.map((post) => (
                    <Link key={post.id} href={`/blog/${post.slug}`}>
                      <Card className="hover:shadow-md transition-all cursor-pointer group">
                        <div className="flex flex-col md:flex-row">
                          {post.featured_image_url ? (
                            <div className="md:w-48 h-48 overflow-hidden">
                              <img
                                src={post.featured_image_url}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                          ) : (
                            <div className="md:w-48 h-48 bg-gradient-to-br from-primary/10 to-accent/10" />
                          )}
                          <div className="flex-1">
                            <CardHeader>
                              <div className="flex items-start justify-between mb-2">
                                {post.category && (
                                  <Badge variant="outline">
                                    {post.category}
                                  </Badge>
                                )}
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {format(
                                    new Date(post.published_at),
                                    "MMM d, yyyy"
                                  )}
                                </span>
                              </div>
                              <CardTitle className="text-xl group-hover:text-primary transition-colors">
                                {post.title}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              {post.excerpt && (
                                <p className="text-muted-foreground mb-4">
                                  {post.excerpt}
                                </p>
                              )}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  {post.read_time_minutes && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {post.read_time_minutes} min read
                                    </span>
                                  )}
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="gap-2 group-hover:gap-3 transition-all"
                                >
                                  Read More
                                  <ArrowRight className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardContent>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:w-80">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categories.map((category) => {
                      const postCount =
                        category === "all"
                          ? posts.length
                          : posts.filter((post) => post.category === category)
                              .length;

                      return (
                        <button
                          key={category}
                          onClick={() => setSelectedCategory(category)}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                            selectedCategory === category
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="capitalize">
                              {category === "all" ? "All Articles" : category}
                            </span>
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                selectedCategory === category
                                  ? "bg-primary-foreground/20"
                                  : "bg-muted"
                              }`}
                            >
                              {postCount}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
