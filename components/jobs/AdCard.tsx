import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, ArrowRight } from "lucide-react";
import Image from "next/image";

interface AdCardProps {
  companyName: string;
  companyLogo?: string;
  tagline: string;
  targetUrl: string;
}

export function AdCard({
  companyName,
  companyLogo,
  tagline,
  targetUrl,
}: AdCardProps) {
  const handleClick = () => {
    console.log(`Ad clicked: ${companyName} -> ${targetUrl}`);
    if (targetUrl && targetUrl !== "#") {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Card
      onClick={handleClick}
      className="cursor-pointer transition-all duration-200 hover:shadow-lg border border-primary/50 hover:bg-muted/30 hover:border-border"
    >
      <CardContent className="px-3 py-5 md:px-6">
        {/* Company Logo and Name */}
        <div className="flex items-center gap-3 mb-3">
          {/* Company Logo */}
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            {companyLogo ? (
              <Image
                src={companyLogo}
                alt={companyName}
                width={48}
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <Building2 className="w-6 h-6 text-muted-foreground" />
            )}
          </div>

          {/* Company Name */}
          <div className="flex-1">
            <h3 className="font-semibold text-lg text-foreground">
              {companyName}
            </h3>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-sm text-foreground leading-relaxed">{tagline}</p>

        {/* Promoted Label and Learn More Link */}
        <div className="flex items-center justify-between mt-3">
          <div className="text-xs text-muted-foreground">Promoted</div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <span>Learn more</span>
            <ArrowRight className="w-3 h-3 mt-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
