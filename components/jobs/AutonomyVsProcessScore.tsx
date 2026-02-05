"use client";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";

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
  bgClass: string;
  textClass: string;
  borderClass: string;
} {
  switch (level) {
    case "high":
      return {
        label: "High",
        bgClass: "bg-green-100",
        textClass: "text-green-800",
        borderClass: "border-green-300",
      };
    case "medium":
      return {
        label: "Medium",
        bgClass: "bg-yellow-100",
        textClass: "text-yellow-800",
        borderClass: "border-yellow-300",
      };
    case "low":
      return {
        label: "Low",
        bgClass: "bg-red-100",
        textClass: "text-red-800",
        borderClass: "border-red-300",
      };
    default:
      return {
        label: "Unknown",
        bgClass: "bg-gray-100",
        textClass: "text-gray-600",
        borderClass: "border-gray-300",
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
  bgClass: string;
  textClass: string;
  borderClass: string;
} {
  switch (level) {
    case "low":
      return {
        label: "Low",
        bgClass: "bg-green-100",
        textClass: "text-green-800",
        borderClass: "border-green-300",
      };
    case "medium":
      return {
        label: "Medium",
        bgClass: "bg-yellow-100",
        textClass: "text-yellow-800",
        borderClass: "border-yellow-300",
      };
    case "high":
      return {
        label: "High",
        bgClass: "bg-red-100",
        textClass: "text-red-800",
        borderClass: "border-red-300",
      };
    default:
      return {
        label: "Unknown",
        bgClass: "bg-gray-100",
        textClass: "text-gray-600",
        borderClass: "border-gray-300",
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
      <div className={cn("flex items-center gap-2", className)}>
        <Badge
          className={cn(
            "text-xs font-medium px-2 py-0.5",
            autonomyInfo.bgClass,
            autonomyInfo.textClass,
            autonomyInfo.borderClass,
            "border"
          )}
        >
          Autonomy: {autonomyInfo.label}
        </Badge>
        <Badge
          className={cn(
            "text-xs font-medium px-2 py-0.5",
            processInfo.bgClass,
            processInfo.textClass,
            processInfo.borderClass,
            "border"
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
        "rounded-lg border p-4 space-y-3 bg-slate-50 border-slate-200",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-lg">🎯</div>
          <div>
            <div className="font-semibold text-slate-800">
              Autonomy vs Process
            </div>
            <div className="text-xs text-muted-foreground">Builder-friendliness assessment</div>
          </div>
        </div>
        {confidence && (
          <Badge
            variant="outline"
            className={cn(
              "capitalize text-xs",
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
            "flex-1 rounded-lg border p-3 text-center",
            autonomyInfo.bgClass,
            autonomyInfo.borderClass
          )}
        >
          <div className="text-xs text-muted-foreground mb-1">Autonomy</div>
          <Badge
            className={cn(
              "text-sm font-semibold px-3 py-1",
              "bg-white",
              autonomyInfo.textClass,
              autonomyInfo.borderClass,
              "border"
            )}
          >
            {autonomyInfo.label}
          </Badge>
        </div>
        <div
          className={cn(
            "flex-1 rounded-lg border p-3 text-center",
            processInfo.bgClass,
            processInfo.borderClass
          )}
        >
          <div className="text-xs text-muted-foreground mb-1">Process</div>
          <Badge
            className={cn(
              "text-sm font-semibold px-3 py-1",
              "bg-white",
              processInfo.textClass,
              processInfo.borderClass,
              "border"
            )}
          >
            {processInfo.label}
          </Badge>
        </div>
      </div>

      {rationale && (
        <p className="text-sm text-foreground/80 leading-relaxed">{rationale}</p>
      )}
    </div>
  );
}
