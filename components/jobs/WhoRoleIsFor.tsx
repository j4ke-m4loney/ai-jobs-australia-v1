"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserCheck, CheckCircle2 } from "lucide-react";

interface WhoRoleIsForProps {
  bullets: string[] | null;
  confidence: "high" | "medium" | "low" | null;
  analysedAt: string | null;
  className?: string;
  compact?: boolean;
}

export function WhoRoleIsFor({
  bullets,
  confidence,
  analysedAt,
  className,
  compact = false,
}: WhoRoleIsForProps) {
  // Analysis pending state
  if (analysedAt === null || bullets === null || bullets.length === 0) {
    return (
      <div className={cn("flex items-center gap-2 text-muted-foreground", className)}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Who is this for analysis pending...</span>
      </div>
    );
  }

  if (compact) {
    const firstBullet = bullets[0];
    const remainingCount = bullets.length - 1;

    return (
      <div className={cn("flex items-start gap-2 bg-white/50 backdrop-blur-sm rounded-lg p-2", className)}>
        <UserCheck className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-xs font-medium text-emerald-700">Who This Is For</span>
          <p className="text-sm text-foreground line-clamp-1">
            {firstBullet}
            {remainingCount > 0 && (
              <span className="text-muted-foreground"> +{remainingCount} more</span>
            )}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-emerald-200/40 bg-white/70 backdrop-blur-xl p-3 sm:p-5 space-y-3 shadow-lg shadow-emerald-500/10",
        className
      )}
    >
      {/* Left accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-emerald-400 to-emerald-600 rounded-l-xl" />

      <div className="flex flex-wrap items-start gap-2 sm:gap-3">
        <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-slate-800 text-sm sm:text-base">Who This Role Is For</div>
            <div className="text-xs text-muted-foreground">Ideal candidate profile</div>
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

      <ul className="space-y-2">
        {bullets.map((bullet, index) => (
          <li key={index} className="flex items-start gap-2 p-2 rounded-lg hover:bg-emerald-50/50 transition-colors">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-slate-600 leading-relaxed">{bullet}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
