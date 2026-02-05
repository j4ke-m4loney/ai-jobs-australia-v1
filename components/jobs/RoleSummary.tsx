"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText } from "lucide-react";

interface RoleSummaryProps {
  oneLiner: string | null;
  plainEnglish: string | null;
  confidence: "high" | "medium" | "low" | null;
  analysedAt: string | null;
  className?: string;
  compact?: boolean;
}

export function RoleSummary({
  oneLiner,
  plainEnglish,
  confidence,
  analysedAt,
  className,
  compact = false,
}: RoleSummaryProps) {
  // Analysis pending state
  if (analysedAt === null || oneLiner === null) {
    return (
      <div className={cn("flex items-center gap-2 text-muted-foreground", className)}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Role summary analysis pending...</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={cn("flex items-start gap-2", className)}>
        <FileText className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-indigo-700">Role Summary</span>
          <p className="text-sm text-foreground line-clamp-2">{oneLiner}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-lg border border-indigo-200 bg-indigo-50 p-4 space-y-3",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <FileText className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-indigo-900">Role Summary</div>
            <div className="text-xs text-muted-foreground">Plain English explanation</div>
          </div>
        </div>
        {confidence && (
          <Badge
            variant="outline"
            className={cn(
              "capitalize text-xs flex-shrink-0",
              confidence === "high" && "border-green-500 text-green-700",
              confidence === "medium" && "border-yellow-500 text-yellow-700",
              confidence === "low" && "border-gray-400 text-gray-600"
            )}
          >
            {confidence} confidence
          </Badge>
        )}
      </div>

      {oneLiner && (
        <p className="text-sm font-medium text-indigo-800 leading-relaxed">
          {oneLiner}
        </p>
      )}

      {plainEnglish && (
        <p className="text-sm text-foreground/80 leading-relaxed">
          {plainEnglish}
        </p>
      )}
    </div>
  );
}
