"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, Mail, Users, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const Hero = () => {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-primary-light/20 pt-16">
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="max-w-5xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-primary-light border border-primary/20 rounded-full px-4 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Launching in 2025
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight bg-gradient-hero bg-clip-text text-transparent">
            The Home for AI Jobs in Australia
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed max-w-3xl mx-auto">
            Find your next role in Artificial Intelligence, Machine Learning,
            and Data Science — connecting Australian talent with Australian
            opportunities.
          </p>

          {/* Email Capture Form */}
          <div className="max-w-2xl mx-auto mb-16">
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-border/50">
              <h3 className="text-2xl font-semibold mb-6 text-foreground">
                Join the Waitlist
              </h3>

              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <Input
                  type="email"
                  placeholder="johndoe@email.com"
                  className="flex-1 h-12 text-base border-border/50 focus:border-primary"
                />
                <select className="h-12 px-4 rounded-lg border border-border/50 bg-background text-foreground text-base focus:border-primary focus:outline-none">
                  <option value="job-seeker">I&apos;m a Job Seeker</option>
                  <option value="employer">I&apos;m an Employer</option>
                </select>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {user ? (
                  <>
                    <Button
                      variant="primary"
                      size="lg"
                      className="flex-1"
                      onClick={() => router.push("/jobseeker")}
                    >
                      <Mail className="w-5 h-5" />
                      Job Seeker Dashboard
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex-1"
                      onClick={() => router.push("/employer")}
                    >
                      <Users className="w-5 h-5" />
                      Employer Dashboard
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="primary"
                      size="lg"
                      className="flex-1"
                      onClick={() => router.push("/login")}
                    >
                      <Mail className="w-5 h-5" />
                      Join as Job Seeker
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="flex-1"
                      onClick={() => router.push("/login")}
                    >
                      <Users className="w-5 h-5" />
                      Register as Employer
                    </Button>
                  </>
                )}
              </div>

              <p className="text-sm text-muted-foreground mt-4">
                Get first access when we launch. No spam, just opportunities.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <div className="text-muted-foreground font-medium">
                Job Seekers Waiting
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-accent mb-2">50+</div>
              <div className="text-muted-foreground font-medium">
                Employers Interested
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-success mb-2">2025</div>
              <div className="text-muted-foreground font-medium">
                Launch Year
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-muted-foreground" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
