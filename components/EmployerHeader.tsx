"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { LogOut, User, Menu, X } from "lucide-react";

const EmployerHeader = () => {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
    setMobileMenuOpen(false);
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

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [mobileMenuOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo - links to /hire instead of home */}
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

          {/* Desktop Actions - Simplified for employer focus */}
          <div className="hidden lg:flex items-center">
            {user ? (
              <>
                <Link
                  href={
                    user.user_metadata?.user_type === "employer"
                      ? "/employer"
                      : "/jobseeker"
                  }
                  className="text-muted-foreground hover:text-foreground transition-all font-medium flex items-center gap-1 mr-3"
                >
                  <User className="w-4 h-4" />
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
              <Link href="/post-job-login">
                <Button variant="default" size="sm">
                  Sign In
                </Button>
              </Link>
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
          <div className="container mx-auto px-4 py-4">
            <div className="border-t border-border/30 pt-4">
              {user ? (
                <>
                  <Link
                    href={
                      user.user_metadata?.user_type === "employer"
                        ? "/employer"
                        : "/jobseeker"
                    }
                    onClick={closeMobileMenu}
                    className="flex items-center gap-3 py-3 px-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors font-medium mb-2"
                  >
                    <User className="w-5 h-5 flex-shrink-0" />
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
                <Link
                  href="/employer-login"
                  onClick={closeMobileMenu}
                  className="flex items-center gap-3 py-3 px-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors font-medium"
                >
                  <User className="w-5 h-5 flex-shrink-0" />
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EmployerHeader;
