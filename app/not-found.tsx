"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Search, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import SlimFooter from "@/components/SlimFooter";

export default function NotFound() {
  const pathname = usePathname();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      pathname
    );
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-subtle">
      {/* Centered content area */}
      <div className="flex-1 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6">
            <div className="mb-6 flex justify-center">
              <Image
                src="/aja-300x300-blue-logo.svg"
                alt="AI Jobs Australia Logo"
                width={96}
                height={96}
                className="w-24 h-24"
              />
            </div>
            <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-foreground mb-4">
              Page Not Found
            </h2>
            <p className="text-muted-foreground mb-8">
              Oops! The page you&apos;re looking for doesn&apos;t exist. It might have been
              moved, deleted, or you entered the wrong URL.
            </p>
            
            <div className="space-y-3">
              <Link href="/" className="block">
                <Button className="w-full gap-2">
                  <Home className="w-4 h-4" />
                  Go to Homepage
                </Button>
              </Link>
              
              <Link href="/jobs" className="block">
                <Button variant="outline" className="w-full gap-2">
                  <Search className="w-4 h-4" />
                  Browse Jobs
                </Button>
              </Link>
              
              <Button 
                variant="ghost" 
                onClick={() => window.history.back()} 
                className="w-full gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Go Back
              </Button>
            </div>
            
            <div className="mt-6 text-xs text-muted-foreground">
              Error Code: 404 | Path: {pathname}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Footer at bottom */}
      <SlimFooter />
    </div>
  );
}