import React from "react";

interface LocationTypeBadgeProps {
  locationType: "remote" | "hybrid" | "onsite" | string;
}

export function LocationTypeBadge({ locationType }: LocationTypeBadgeProps) {
  // Don't render anything if it's onsite
  if (locationType === "onsite") {
    return null;
  }

  return (
    <span className="capitalize text-xs bg-green-50 text-green-700 border border-green-200 rounded-md px-2.5 py-0.5 inline-flex items-center font-semibold">
      {locationType}
    </span>
  );
}
