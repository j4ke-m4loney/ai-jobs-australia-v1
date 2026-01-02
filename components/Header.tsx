"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut, User, Briefcase, Menu, X, Search, FileText, LogIn, Building, Wrench } from "lucide-react";

const Header = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Helper function to get user type with profiles-first approach
  const getUserType = () => {
    return profile?.user_type || user?.user_metadata?.user_type;
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    setMobileMenuOpen(false); // Close mobile menu
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  // Close mobile menu on screen resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3">
          <Image
            src="/aja-300x300-blue-logo.svg"
            alt="AI Jobs Australia Logo"
            width={32}
            height={32}
            className="w-8 h-8"
          />
          <span className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            AI Jobs Australia
          </span>
        </Link>

        {/* Center Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          <Link
            href={user ? "/jobs" : "/login"}
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
          <Link
            href="/tools"
            className="text-muted-foreground hover:text-foreground transition-all font-medium"
          >
            Free Tools
          </Link>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center space-x-3">
          {user ? (
            <>
              <Link
                href={
                  getUserType() === "employer"
                    ? "/employer"
                    : "/jobseeker"
                }
                className="text-muted-foreground hover:text-foreground transition-all font-medium flex items-center gap-1"
              >
                {getUserType() === "employer" ? (
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
              <Link href="/hire">
                <Button variant="default" size="sm">
                  Employer / Post Job
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={toggleMobileMenu}
          className="block lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>
    </header>

    {/* Mobile Menu Overlay */}
    {mobileMenuOpen && (
      <div 
        className="fixed inset-0 z-30 bg-black/50 lg:hidden"
        onClick={closeMobileMenu}
        aria-hidden="true"
      />
    )}

    {/* Mobile Menu */}
    {mobileMenuOpen && (
      <div className="fixed top-16 left-0 right-0 lg:hidden bg-white border-t border-border/50 z-50">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {/* Mobile Navigation Links */}
            <Link
              href={user ? "/jobs" : "/login"}
              onClick={closeMobileMenu}
              className="flex items-center gap-3 py-3 px-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors font-medium"
            >
              <Search className="w-5 h-5 flex-shrink-0" />
              Browse Jobs
            </Link>
            <Link
              href="/blog"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 py-3 px-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors font-medium"
            >
              <FileText className="w-5 h-5 flex-shrink-0" />
              Blog
            </Link>
            <Link
              href="/tools"
              onClick={closeMobileMenu}
              className="flex items-center gap-3 py-3 px-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors font-medium"
            >
              <Wrench className="w-5 h-5 flex-shrink-0" />
              Free Tools
            </Link>

            {/* Mobile Actions */}
            <div className="border-t border-border/30 pt-4 space-y-3">
              {user ? (
                <>
                  <Link
                    href={
                      getUserType() === "employer"
                        ? "/employer"
                        : "/jobseeker"
                    }
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 py-3 px-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors font-medium"
                  >
                    {getUserType() === "employer" ? (
                      <Briefcase className="w-5 h-5 flex-shrink-0" />
                    ) : (
                      <User className="w-5 h-5 flex-shrink-0" />
                    )}
                    Dashboard
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 py-3 px-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors font-medium w-full"
                  >
                    <LogOut className="w-5 h-5 flex-shrink-0" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/auth" 
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 py-3 px-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors font-medium"
                  >
                    <LogIn className="w-5 h-5 flex-shrink-0" />
                    Sign In
                  </Link>
                  <Link 
                    href="/hire" 
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 py-3 px-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors font-medium"
                  >
                    <Building className="w-5 h-5 flex-shrink-0" />
                    Employer / Post Job
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
