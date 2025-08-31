"use client";

import { useState } from "react";
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
import { useRouter } from "next/navigation";

export default function BlogPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const router = useRouter();

  const blogPosts = [
    {
      id: 1,
      title: "The Future of AI Jobs in Australia: Trends to Watch in 2025",
      excerpt:
        "Exploring the emerging opportunities and skills that will define the Australian AI job market in the coming year.",
      author: "Sarah Chen",
      publishedAt: "2025-01-15",
      readTime: "5 min read",
      category: "Industry Trends",
      image: "🤖",
      featured: true,
    },
    {
      id: 2,
      title:
        "Machine Learning Engineer vs Data Scientist: Which Path is Right for You?",
      excerpt:
        "A comprehensive comparison of two popular AI career paths, including salary expectations and required skills.",
      author: "Michael Rodriguez",
      publishedAt: "2025-01-12",
      readTime: "8 min read",
      category: "Career Advice",
      image: "🎯",
      featured: false,
    },
    {
      id: 3,
      title: "Top 10 AI Skills Australian Employers Want in 2025",
      excerpt:
        "Based on our analysis of thousands of job postings, here are the most in-demand AI skills right now.",
      author: "Emma Thompson",
      publishedAt: "2025-01-10",
      readTime: "6 min read",
      category: "Skills Development",
      image: "📊",
      featured: true,
    },
    {
      id: 4,
      title: "Interview Success: How to Ace Your AI Job Interview",
      excerpt:
        "Practical tips and common questions to help you prepare for technical AI interviews at Australian companies.",
      author: "David Kim",
      publishedAt: "2025-01-08",
      readTime: "7 min read",
      category: "Career Advice",
      image: "💼",
      featured: false,
    },
    {
      id: 5,
      title:
        "Spotlight: How Atlassian is Building the Future of AI-Powered Collaboration",
      excerpt:
        "An inside look at one of Australia's tech giants and their approach to AI integration in their products.",
      author: "Lisa Zhang",
      publishedAt: "2025-01-05",
      readTime: "4 min read",
      category: "Company Spotlight",
      image: "🏢",
      featured: false,
    },
    {
      id: 6,
      title: "Remote AI Jobs: The Complete Guide for Australian Professionals",
      excerpt:
        "Everything you need to know about finding and succeeding in remote AI positions from Australia.",
      author: "James Wilson",
      publishedAt: "2025-01-03",
      readTime: "9 min read",
      category: "Remote Work",
      image: "🌐",
      featured: false,
    },
  ];

  const categories = [
    "all",
    "Industry Trends",
    "Career Advice",
    "Skills Development",
    "Company Spotlight",
    "Remote Work",
  ];

  const filteredPosts = blogPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = blogPosts.filter((post) => post.featured);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-20 pb-16 bg-gradient-to-br from-background via-muted/30 to-primary-light/20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-hero bg-clip-text text-transparent">
              AI Career Insights & News
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Stay ahead in your AI career with expert insights, industry
              trends, and practical advice from Australia's leading AI
              professionals.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  placeholder="Search articles, topics, or authors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12 text-base bg-white/80 backdrop-blur-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Posts Section */}
      {featuredPosts.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-8">
              <TrendingUp className="w-6 h-6 text-primary" />
              <h2 className="text-3xl font-bold text-foreground">Featured Articles</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPosts.map((post) => (
                <Card
                  key={post.id}
                  className="hover:shadow-lg transition-all cursor-pointer group overflow-hidden"
                >
                  <div className="text-6xl p-6 text-center bg-gradient-to-br from-primary/10 to-accent/10">
                    {post.image}
                  </div>
                  <CardHeader>
                    <Badge variant="secondary" className="w-fit mb-2">
                      {post.category}
                    </Badge>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {post.author}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {post.readTime}
                        </span>
                      </div>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
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
                <h2 className="text-3xl font-bold text-foreground">Latest Articles</h2>
                <div className="text-sm text-muted-foreground">
                  {filteredPosts.length} articles found
                </div>
              </div>

              <div className="space-y-6">
                {filteredPosts.map((post) => (
                  <Card
                    key={post.id}
                    className="hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex flex-col md:flex-row">
                      <div className="md:w-32 h-32 flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 text-4xl">
                        {post.image}
                      </div>
                      <div className="flex-1">
                        <CardHeader>
                          <div className="flex items-start justify-between mb-2">
                            <Badge variant="outline">{post.category}</Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(post.publishedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <CardTitle className="text-xl group-hover:text-primary transition-colors">
                            {post.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground mb-4">
                            {post.excerpt}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {post.author}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {post.readTime}
                              </span>
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
                ))}
              </div>
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
                          ? blogPosts.length
                          : blogPosts.filter(
                              (post) => post.category === category
                            ).length;

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

              {/* Newsletter Signup */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Stay Updated</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get the latest AI career insights and job opportunities
                    delivered to your inbox weekly.
                  </p>
                  <div className="space-y-3">
                    <Input placeholder="johndoe@email.com" className="h-10" />
                    <Button className="w-full" size="sm">
                      Subscribe to Newsletter
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    No spam, unsubscribe anytime.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

