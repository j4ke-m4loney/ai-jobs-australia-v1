"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ArrowRight } from "lucide-react";
import { getCategoryIcon } from "@/lib/categories/category-icons";

interface Category {
  slug: string;
  name: string;
  count: number;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/jobs/categories?limit=100");
        if (!response.ok) throw new Error("Failed to fetch categories");
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-28 pb-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            All Categories
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Browse AI, Machine Learning, Data Science, and AI Emergent roles across all
            specialisations
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6 text-center">
                    <div className="w-10 h-10 bg-muted rounded-full mx-auto mb-3" />
                    <div className="h-5 bg-muted rounded w-3/4 mx-auto mb-2" />
                    <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
                  </CardContent>
                </Card>
              ))
            : categories.map((category) => {
                const Icon = getCategoryIcon(category.slug);
                return (
                  <Link
                    key={category.slug}
                    href={`/jobs?category=${category.slug}`}
                  >
                    <Card className="hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer group h-full">
                      <CardContent className="p-6 text-center">
                        <Icon className="w-10 h-10 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                        <h3 className="font-semibold text-lg mb-1">
                          {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {category.count} open position
                          {category.count !== 1 ? "s" : ""}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
        </div>
        {!loading && categories.length > 0 && (
          <div className="text-center mt-12">
            <Link href="/jobs">
              <Button
                size="lg"
                className="gap-2 bg-gradient-hero hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                View all{" "}
                {categories.reduce((sum, c) => sum + c.count, 0).toLocaleString()}
                + Jobs
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
