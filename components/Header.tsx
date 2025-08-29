import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, User, Briefcase } from "lucide-react";

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
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
            to="/jobs"
            className="text-muted-foreground hover:text-foreground transition-all font-medium"
          >
            Browse Jobs
          </Link>
          <Link
            to="/blog"
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
                to={
                  user.user_metadata?.user_type === "employer"
                    ? "/employer/dashboard"
                    : "/jobseeker/dashboard"
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
              <Button variant="outline" size="sm" asChild>
                <Link to="/auth/jobseeker">Sign In</Link>
              </Button>
              <Button variant="default" size="sm" asChild>
                <Link to="/post-job">Post Job</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
