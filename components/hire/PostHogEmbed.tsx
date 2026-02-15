"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

interface PostHogEmbedProps {
  title: string;
  description: string;
  iframeSrc: string;
  height?: number;
}

export function PostHogEmbed({
  title,
  description,
  iframeSrc,
  height = 300,
}: PostHogEmbedProps) {
  if (!iframeSrc) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{title}</CardTitle>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardHeader>
        <CardContent>
          <div
            className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30"
            style={{ height }}
          >
            <BarChart3 className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              Analytics embed coming soon
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              PostHog insight URL not configured
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent>
        <iframe
          src={iframeSrc}
          width="100%"
          height={height}
          className="rounded-lg border-0"
          title={title}
          loading="lazy"
        />
      </CardContent>
    </Card>
  );
}
