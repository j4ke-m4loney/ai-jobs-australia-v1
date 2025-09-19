"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "./input";

interface SearchInputProps extends React.ComponentProps<"input"> {
  onClear?: () => void;
  leftIcon?: React.ReactNode;
  showClearButton?: boolean;
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onClear, leftIcon, showClearButton = true, value, ...props }, ref) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [isHovered, setIsHovered] = React.useState(false);
    const hasValue = Boolean(value && String(value).length > 0);
    const showClear = showClearButton && hasValue && (isFocused || isHovered);

    const handleClear = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      console.log("🧹 SearchInput handleClear called");
      if (onClear) {
        console.log("🧹 SearchInput calling onClear callback");
        onClear();
      } else {
        console.log("⚠️ SearchInput no onClear callback provided");
      }
    };

    return (
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {leftIcon}
          </div>
        )}

        <Input
          ref={ref}
          value={value}
          className={cn(
            leftIcon ? "pl-10" : "pl-3",
            showClear ? "pr-10" : "pr-3",
            className
          )}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          {...props}
        />

        {showClear && (
          <button
            type="button"
            onMouseDown={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:text-foreground"
            tabIndex={-1}
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    );
  }
);

SearchInput.displayName = "SearchInput";

export { SearchInput, type SearchInputProps };