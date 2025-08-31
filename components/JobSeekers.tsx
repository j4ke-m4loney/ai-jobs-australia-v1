import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, Search, MapPin, Briefcase } from "lucide-react";

const JobSeekers = () => {
  return (
    <section id="job-seekers" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-primary-light border border-primary/20 rounded-full px-3 py-1 mb-6">
                <span className="text-sm font-medium text-primary">
                  For Job Seekers
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                Discover Your Next{" "}
                <span className="bg-gradient-hero bg-clip-text text-transparent">
                  AI Career
                </span>
              </h2>

              <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                Connect with genuine AI, Machine Learning, and Data Science
                opportunities across Australia. From startups to enterprise,
                remote to on-site.
              </p>

              <div className="grid sm:grid-cols-2 gap-6 mb-10">
                <Card className="bg-white shadow-md border-0 hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center mb-4">
                      <Search className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">
                      Curated Opportunities
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Quality over quantity - only genuine AI roles in Australia
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-md border-0 hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-accent-light rounded-lg flex items-center justify-center mb-4">
                      <MapPin className="w-6 h-6 text-accent" />
                    </div>
                    <h3 className="font-semibold mb-2">Local Focus</h3>
                    <p className="text-sm text-muted-foreground">
                      Remote, hybrid, and on-site roles across all Australian
                      cities
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-md border-0 hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-success-light rounded-lg flex items-center justify-center mb-4">
                      <Bell className="w-6 h-6 text-success" />
                    </div>
                    <h3 className="font-semibold mb-2">First Access</h3>
                    <p className="text-sm text-muted-foreground">
                      Get job alerts before anyone else when we launch
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-md border-0 hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center mb-4">
                      <Briefcase className="w-6 h-6 text-foreground" />
                    </div>
                    <h3 className="font-semibold mb-2">
                      All Experience Levels
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      From graduate roles to senior AI leadership positions
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Join the Job Seeker Waitlist
              </Button>
            </div>

            {/* Image */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-accent/10 to-primary/10">
                <div className="aspect-video flex items-center justify-center">
                  <Briefcase className="w-24 h-24 text-accent/30" />
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/10 rounded-full blur-xl" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-accent/10 rounded-full blur-xl" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JobSeekers;
