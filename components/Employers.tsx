import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Target, Zap, Award } from "lucide-react";

const Employers = () => {
  return (
    <section id="employers" className="py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Image */}
            <div className="relative order-2 lg:order-1">
              <div className="rounded-2xl overflow-hidden shadow-lg bg-gradient-to-br from-primary/10 to-accent/10">
                <div className="aspect-video flex items-center justify-center">
                  <Users className="w-24 h-24 text-primary/30" />
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-accent/10 rounded-full blur-xl" />
              <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-xl" />
            </div>

            {/* Content */}
            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-6">
                <Badge variant="outline" className="border-accent text-accent">
                  For Employers
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-success-light text-success border-success/20"
                >
                  Early Access
                </Badge>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
                Hire Australia&apos;s{" "}
                <span className="bg-gradient-hero bg-clip-text text-transparent">
                  AI Talent
                </span>
              </h2>

              <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
                Connect with local AI, ML, and Data Science professionals who
                are actively seeking opportunities. Skip the global noise and
                find the right talent for your Australian team.
              </p>

              <div className="space-y-6 mb-10">
                <Card className="bg-white shadow-md border-0 hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary-light rounded-lg flex items-center justify-center flex-shrink-0">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">
                          Quality Candidates
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Access Australia&apos;s growing pool of AI professionals
                          who are specifically looking for local opportunities.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-md border-0 hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-accent-light rounded-lg flex items-center justify-center flex-shrink-0">
                        <Target className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Targeted Reach</h3>
                        <p className="text-sm text-muted-foreground">
                          Your job posts reach candidates specifically
                          interested in AI roles, eliminating irrelevant
                          applications.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-md border-0 hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-success-light rounded-lg flex items-center justify-center flex-shrink-0">
                        <Award className="w-6 h-6 text-success" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">Cost Effective</h3>
                        <p className="text-sm text-muted-foreground">
                          More affordable than broad job boards, with higher
                          quality candidates specifically in the AI space.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-md border-0 hover:shadow-lg transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Zap className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2">
                          Early Adopter Benefits
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Register now for discounted job postings when we
                          launch, plus priority support and features.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Button variant="accent" size="lg" className="w-full sm:w-auto">
                Register as Early Employer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Employers;
