import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Quote, Users, Building, Calendar } from "lucide-react";

const SocialProof = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge
              variant="outline"
              className="mb-4 border-primary text-primary"
            >
              Community Backed
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Backed by Australia&apos;s{" "}
              <span className="bg-gradient-primary bg-clip-text text-transparent">
                AI Community
              </span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Building momentum with support from Australia&apos;s leading AI
              professionals, tech companies, and industry leaders.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <Card className="bg-gradient-card shadow-card border-0 text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2">500+</div>
                <div className="text-sm text-muted-foreground">
                  Job Seekers Signed Up
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card border-0 text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Building className="w-6 h-6 text-secondary" />
                </div>
                <div className="text-3xl font-bold text-secondary mb-2">
                  50+
                </div>
                <div className="text-sm text-muted-foreground">
                  Employers Interested
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card border-0 text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-accent" />
                </div>
                <div className="text-3xl font-bold text-accent mb-2">2025</div>
                <div className="text-sm text-muted-foreground">Launch Year</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-card shadow-card border-0 text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-aussie-gold/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Quote className="w-6 h-6 text-aussie-gold" />
                </div>
                <div className="text-3xl font-bold text-aussie-gold mb-2">
                  100%
                </div>
                <div className="text-sm text-muted-foreground">
                  Australian Focus
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Testimonial */}
          <Card className="bg-gradient-card shadow-elegant border-0 max-w-4xl mx-auto">
            <CardContent className="p-8">
              <div className="text-center">
                <Quote className="w-12 h-12 text-primary mx-auto mb-6" />
                <blockquote className="text-xl md:text-2xl italic text-foreground mb-6">
                  &quot;Finally, a dedicated platform for AI roles in Australia. As
                  someone who&apos;s been searching through countless global job
                  boards, this is exactly what our industry needs.&quot;
                </blockquote>
                <div className="flex items-center justify-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold">SK</span>
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Sarah Kim</div>
                    <div className="text-sm text-muted-foreground">
                      Senior ML Engineer, Sydney
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Community signals */}
          <div className="text-center mt-12">
            <p className="text-muted-foreground mb-4">
              Gaining momentum in the Australian AI community
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Badge
                variant="outline"
                className="border-primary/20 text-primary/80"
              >
                Featured on LinkedIn
              </Badge>
              <Badge
                variant="outline"
                className="border-secondary/20 text-secondary/80"
              >
                Tech Twitter Discussions
              </Badge>
              <Badge
                variant="outline"
                className="border-accent/20 text-accent/80"
              >
                AI Meetup Groups
              </Badge>
              <Badge
                variant="outline"
                className="border-aussie-gold/20 text-aussie-gold/80"
              >
                Industry Forums
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
