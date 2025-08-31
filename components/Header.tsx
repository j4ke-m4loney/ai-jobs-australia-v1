"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User, Briefcase } from "lucide-react";

const Header = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <span className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            AI Jobs Australia
          </span>
        </Link>

        {/* Center Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link
            href="/jobs"
            className="text-muted-foreground hover:text-foreground transition-all font-medium"
          >
            Browse Jobs
          </Link>
          <Link
            href="/blog"
            className="text-muted-foreground hover:text-foreground transition-all font-medium"
          >
            Blog
          </Link>
        </nav>

        {/* Right Side Actions */}
        <div className="hidden md:flex items-center space-x-3">
          {user ? (
            <>
              <Link
                href={
                  user.user_metadata?.user_type === "employer"
                    ? "/employer"
                    : "/jobseeker"
                }
                className="text-muted-foreground hover:text-foreground transition-all font-medium flex items-center gap-1"
              >
                {user.user_metadata?.user_type === "employer" ? (
                  <Briefcase className="w-4 h-4" />
                ) : (
                  <User className="w-4 h-4" />
                )}
                Dashboard
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSignOut}
                className="gap-2"
              >
                <LogOut className="w-3 h-3" />
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth">
                <Button variant="outline" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link href="/employer-login?next=/post-job">
                <Button variant="default" size="sm">
                  Post Job
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
