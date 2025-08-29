import { Navigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { User, Briefcase, ArrowRight } from "lucide-react";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  // If user is already logged in, redirect appropriately
  if (user) {
    const userType = user.user_metadata?.user_type;
    const defaultRedirect =
      userType === "employer" ? "/employer/dashboard" : "/jobseeker/dashboard";
    const next = searchParams.get("next") || defaultRedirect;
    return <Navigate to={next} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Welcome to AI Jobs Australia
          </CardTitle>
          <CardDescription>
            Choose how you'd like to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            asChild
            variant="outline"
            className="w-full h-auto p-6 flex flex-col items-center gap-3 hover:bg-muted/50"
          >
            <Link to="/auth/jobseeker">
              <User className="w-8 h-8 text-primary" />
              <div className="text-center">
                <div className="font-semibold">I'm looking for a job</div>
                <div className="text-sm text-muted-foreground">
                  Browse and apply for AI positions
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-full h-auto p-6 flex flex-col items-center gap-3 hover:bg-muted/50"
          >
            <Link to="/auth/employer">
              <Briefcase className="w-8 h-8 text-primary" />
              <div className="text-center">
                <div className="font-semibold">I want to hire talent</div>
                <div className="text-sm text-muted-foreground">
                  Post jobs and find the best candidates
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </Link>
          </Button>

          <div className="text-center text-sm text-muted-foreground mt-6">
            Already have an account?{" "}
            <Link to="/auth/jobseeker" className="text-primary hover:underline">
              Job Seeker Sign In
            </Link>
            {" | "}
            <Link to="/auth/employer" className="text-primary hover:underline">
              Employer Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
