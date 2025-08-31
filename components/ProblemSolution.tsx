import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, CheckCircle } from "lucide-react";

const ProblemSolution = () => {
  return (
    <section id="about" className="py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 leading-tight">
              Why AI Jobs Australia?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              The AI talent landscape in Australia is fragmented across global
              platforms, making it difficult to find genuine local
              opportunities.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-start">
            {/* Problem */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <h3 className="text-2xl font-bold text-destructive">
                  The Challenge
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-3 flex-shrink-0" />
                  <p className="text-muted-foreground leading-relaxed">
                    AI talent and opportunities scattered across global job
                    boards
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-3 flex-shrink-0" />
                  <p className="text-muted-foreground leading-relaxed">
                    Difficult to find genuine Australian-based AI, ML, and Data
                    Science roles
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-3 flex-shrink-0" />
                  <p className="text-muted-foreground leading-relaxed">
                    Local companies struggle to reach Australian AI
                    professionals
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-destructive rounded-full mt-3 flex-shrink-0" />
                  <p className="text-muted-foreground leading-relaxed">
                    Time wasted filtering through irrelevant global
                    opportunities
                  </p>
                </div>
              </div>
            </div>

            {/* Solution */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success" />
                </div>
                <h3 className="text-2xl font-bold text-success">
                  Our Solution
                </h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-success rounded-full mt-3 flex-shrink-0" />
                  <p className="text-muted-foreground leading-relaxed">
                    A dedicated platform built exclusively for the Australian AI
                    community
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-success rounded-full mt-3 flex-shrink-0" />
                  <p className="text-muted-foreground leading-relaxed">
                    Curated AI, ML, and Data Science roles only available in
                    Australia
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-success rounded-full mt-3 flex-shrink-0" />
                  <p className="text-muted-foreground leading-relaxed">
                    Direct connection between local talent and local companies
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-success rounded-full mt-3 flex-shrink-0" />
                  <p className="text-muted-foreground leading-relaxed">
                    Clean, fast, and distraction-free job search experience
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolution;
