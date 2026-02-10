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
      <div className={cn("flex items-start gap-2 bg-white/50 backdrop-blur-sm rounded-lg p-2", className)}>
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
        "relative overflow-hidden rounded-xl border border-indigo-200/40 bg-white/70 backdrop-blur-xl p-3 sm:p-5 space-y-3 shadow-lg shadow-indigo-500/10",
        className
      )}
    >
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-400 to-indigo-600 rounded-l-xl" />

      <div className="flex flex-wrap items-start gap-2 sm:gap-3">
        <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-800 text-sm sm:text-base">Role Summary</div>
            <div className="text-xs text-muted-foreground">Plain English explanation</div>
          </div>
        </div>
        {confidence && (
          <Badge
            variant="outline"
            className={cn(
              "capitalize text-xs flex-shrink-0 bg-white/60 backdrop-blur-sm",
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
        <p className="text-sm font-medium text-slate-800 leading-relaxed">
          {oneLiner}
        </p>
      )}

      {plainEnglish && (
        <p className="text-sm text-slate-600 leading-relaxed">
          {plainEnglish}
        </p>
      )}
    </div>
  );
}
