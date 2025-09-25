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

    // Debug logging for state tracking
    React.useEffect(() => {
      console.log("🔍 SearchInput state update:", {
        value: value,
        hasValue,
        isFocused,
        isHovered,
        showClear,
        valueType: typeof value,
        valueLength: value ? String(value).length : 0,
        browser: typeof navigator !== 'undefined' ? (navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other') : 'Unknown'
      });
    }, [value, hasValue, isFocused, isHovered, showClear]);

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
          data-debug-value={value || ''}
          data-debug-has-value={hasValue.toString()}
          data-debug-focused={isFocused.toString()}
          data-debug-show-clear={showClear.toString()}
          className={cn(
            leftIcon ? "pl-10" : "pl-3",
            showClear ? "pr-10" : "pr-3",
            className
          )}
          onFocus={(e) => {
            console.log("🎯 SearchInput onFocus fired", {
              value: e.target.value,
              browser: typeof navigator !== 'undefined' ? (navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other') : 'SSR'
            });
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            console.log("🎯 SearchInput onBlur fired", {
              value: e.target.value,
              browser: typeof navigator !== 'undefined' ? (navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other') : 'SSR'
            });
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          onChange={(e) => {
            console.log("🎯 SearchInput onChange fired", {
              value: e.target.value,
              browser: typeof navigator !== 'undefined' ? (navigator.userAgent.includes('Chrome') ? 'Chrome' : 'Other') : 'SSR'
            });
            props.onChange?.(e);
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