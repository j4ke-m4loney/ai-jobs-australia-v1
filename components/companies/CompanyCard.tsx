"use client";

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

interface CompanyCardProps {
  name: string;
  logo_url: string | null;
  website: string | null;
}

export function CompanyCard({ name, logo_url, website }: CompanyCardProps) {
  const handleClick = () => {
    if (website) {
      window.open(website, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Card
      className={`group transition-all duration-200 ${
        website
          ? "hover:shadow-lg hover:border-primary/50 cursor-pointer"
          : "opacity-75"
      }`}
      onClick={handleClick}
    >
      <CardContent className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          {/* Company Logo */}
          {logo_url && (
            <div className="w-24 h-24 relative flex items-center justify-center">
              <Image
                src={logo_url}
                alt={`${name} logo`}
                width={96}
                height={96}
                className="object-contain rounded-lg"
              />
            </div>
          )}

          {/* Company Name */}
          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
            {name}
          </h3>
        </div>
      </CardContent>
    </Card>
  );
}
