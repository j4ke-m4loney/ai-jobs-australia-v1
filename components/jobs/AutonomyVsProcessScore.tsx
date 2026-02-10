"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Loader2, Zap } from "lucide-react";

interface AutonomyVsProcessScoreProps {
  autonomyLevel: "low" | "medium" | "high" | null;
  processLoad: "low" | "medium" | "high" | null;
  rationale: string | null;
  confidence: "high" | "medium" | "low" | null;
  analysedAt: string | null;
  className?: string;
  compact?: boolean;
}

/**
 * Get the display info for autonomy level
 * Green = high (good for builders), Yellow = medium, Red = low
 */
function getAutonomyInfo(level: string): {
  label: string;
  textClass: string;
  gradientFrom: string;
  gradientTo: string;
  borderClass: string;
} {
  switch (level) {
    case "high":
      return {
        label: "High",
        textClass: "text-green-700",
        gradientFrom: "from-green-400",
        gradientTo: "to-green-600",
        borderClass: "border-green-300/40",
      };
    case "medium":
      return {
        label: "Medium",
        textClass: "text-yellow-700",
        gradientFrom: "from-yellow-400",
        gradientTo: "to-yellow-600",
        borderClass: "border-yellow-300/40",
      };
    case "low":
      return {
        label: "Low",
        textClass: "text-red-700",
        gradientFrom: "from-red-400",
        gradientTo: "to-red-600",
        borderClass: "border-red-300/40",
      };
    default:
      return {
        label: "Unknown",
        textClass: "text-gray-600",
        gradientFrom: "from-gray-400",
        gradientTo: "to-gray-600",
        borderClass: "border-gray-300/40",
      };
  }
}

/**
 * Get the display info for process load
 * Green = low (good for builders), Yellow = medium, Red = high
 * Note: Inverted from autonomy - low process is desirable for builders
 */
function getProcessInfo(level: string): {
  label: string;
  textClass: string;
  gradientFrom: string;
  gradientTo: string;
  borderClass: string;
} {
  switch (level) {
    case "low":
      return {
        label: "Low",
        textClass: "text-green-700",
        gradientFrom: "from-green-400",
        gradientTo: "to-green-600",
        borderClass: "border-green-300/40",
      };
    case "medium":
      return {
        label: "Medium",
        textClass: "text-yellow-700",
        gradientFrom: "from-yellow-400",
        gradientTo: "to-yellow-600",
        borderClass: "border-yellow-300/40",
      };
    case "high":
      return {
        label: "High",
        textClass: "text-red-700",
        gradientFrom: "from-red-400",
        gradientTo: "to-red-600",
        borderClass: "border-red-300/40",
      };
    default:
      return {
        label: "Unknown",
        textClass: "text-gray-600",
        gradientFrom: "from-gray-400",
        gradientTo: "to-gray-600",
        borderClass: "border-gray-300/40",
      };
  }
}

export function AutonomyVsProcessScore({
  autonomyLevel,
  processLoad,
  rationale,
  confidence,
  analysedAt,
  className,
  compact = false,
}: AutonomyVsProcessScoreProps) {
  // Analysis pending state
  if (analysedAt === null || autonomyLevel === null || processLoad === null) {
    return (
      <div className={cn("flex items-center gap-2 text-muted-foreground", className)}>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Autonomy vs process analysis pending...</span>
      </div>
    );
  }

  const autonomyInfo = getAutonomyInfo(autonomyLevel);
  const processInfo = getProcessInfo(processLoad);

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-lg p-2", className)}>
        <Badge
          className={cn(
            "text-xs font-medium px-2 py-0.5 text-white border-0",
            `bg-gradient-to-r ${autonomyInfo.gradientFrom} ${autonomyInfo.gradientTo}`
          )}
        >
          Autonomy: {autonomyInfo.label}
        </Badge>
        <Badge
          className={cn(
            "text-xs font-medium px-2 py-0.5 text-white border-0",
            `bg-gradient-to-r ${processInfo.gradientFrom} ${processInfo.gradientTo}`
          )}
        >
          Process: {processInfo.label}
        </Badge>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-violet-200/40 bg-white/70 backdrop-blur-xl p-3 sm:p-5 space-y-3 shadow-lg shadow-violet-500/10",
        className
      )}
    >
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-400 to-violet-600 rounded-t-xl" />

      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-violet-400 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-md">
            <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div>
            <div className="font-semibold text-slate-800 text-sm sm:text-base">
              Autonomy vs Process
            </div>
            <div className="text-xs text-muted-foreground">Builder-friendliness assessment</div>
          </div>
        </div>
        {confidence && (
          <Badge
            variant="outline"
            className={cn(
              "capitalize text-xs bg-white/60 backdrop-blur-sm",
              confidence === "high" && "border-green-500 text-green-700",
              confidence === "medium" && "border-yellow-500 text-yellow-700",
              confidence === "low" && "border-gray-400 text-gray-600"
            )}
          >
            {confidence} confidence
          </Badge>
        )}
      </div>

      {/* Two badges side by side */}
      <div className="flex gap-3">
        <div
          className={cn(
            "flex-1 rounded-xl border p-3 text-center bg-white/60 backdrop-blur-sm",
            autonomyInfo.borderClass
          )}
        >
          <div className="text-xs text-muted-foreground mb-1">Autonomy</div>
          <Badge
            className={cn(
              "text-sm font-semibold px-3 py-1 text-white border-0 shadow-sm",
              `bg-gradient-to-r ${autonomyInfo.gradientFrom} ${autonomyInfo.gradientTo}`
            )}
          >
            {autonomyInfo.label}
          </Badge>
        </div>
        <div
          className={cn(
            "flex-1 rounded-xl border p-3 text-center bg-white/60 backdrop-blur-sm",
            processInfo.borderClass
          )}
        >
          <div className="text-xs text-muted-foreground mb-1">Process</div>
          <Badge
            className={cn(
              "text-sm font-semibold px-3 py-1 text-white border-0 shadow-sm",
              `bg-gradient-to-r ${processInfo.gradientFrom} ${processInfo.gradientTo}`
            )}
          >
            {processInfo.label}
          </Badge>
        </div>
      </div>

      {rationale && (
        <p className="text-sm text-slate-600 leading-relaxed">{rationale}</p>
      )}
    </div>
  );
}
