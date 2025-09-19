"use client";

import * as React from "react";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface StateSelectorProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export const AUSTRALIAN_LOCATIONS = [
  { value: "all", label: "All locations" },
  { value: "remote", label: "Remote" },
  { value: "nsw", label: "New South Wales" },
  { value: "vic", label: "Victoria" },
  { value: "qld", label: "Queensland" },
  { value: "wa", label: "Western Australia" },
  { value: "sa", label: "South Australia" },
  { value: "tas", label: "Tasmania" },
  { value: "act", label: "Australian Capital Territory" },
  { value: "nt", label: "Northern Territory" },
];

const StateSelector = React.forwardRef<
  React.ElementRef<typeof SelectTrigger>,
  StateSelectorProps
>(({ className, placeholder = "Select location", value, onValueChange, disabled, ...props }, ref) => {
  return (
    <div className="relative">
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10 pointer-events-none">
        <MapPin className="w-5 h-5" />
      </div>

      <Select value={value} onValueChange={onValueChange} disabled={disabled}>
        <SelectTrigger
          ref={ref}
          className={cn(
            "h-12 pl-10 pr-3 text-base", // Match SearchInput styling
            className
          )}
          {...props}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent>
          {AUSTRALIAN_LOCATIONS.map((location) => (
            <SelectItem
              key={location.value}
              value={location.value}
              className="cursor-pointer"
            >
              {location.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
});

StateSelector.displayName = "StateSelector";

export { StateSelector };