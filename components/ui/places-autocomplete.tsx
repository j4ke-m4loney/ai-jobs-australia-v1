"use client";

import React, { useEffect, useRef, useState } from "react";
import { Loader } from "@googlemaps/js-api-loader";
import { cn } from "@/lib/utils";

export interface PlaceResult {
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  country: string;
  placeId: string;
}

interface PlacesAutocompleteProps {
  value: string;
  onChange: (value: string, placeResult?: PlaceResult) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

// Helper function to check if Google Places is active (exported for form-level use)
export const isGooglePlacesDropdownActive = (): boolean => {
  const pacContainer = document.querySelector('.pac-container');
  return !!(pacContainer && 
    (pacContainer as HTMLElement).style.display !== 'none' &&
    pacContainer.querySelectorAll('.pac-item').length > 0);
};

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

// Australian state mappings
const STATE_MAPPINGS: Record<string, string> = {
  // Abbreviations (already correct)
  "NSW": "NSW",
  "VIC": "VIC",
  "QLD": "QLD",
  "SA": "SA",
  "WA": "WA",
  "TAS": "TAS",
  "ACT": "ACT",
  "NT": "NT",
  // Full names to abbreviations
  "NEW SOUTH WALES": "NSW",
  "VICTORIA": "VIC",
  "QUEENSLAND": "QLD",
  "SOUTH AUSTRALIA": "SA",
  "WESTERN AUSTRALIA": "WA",
  "TASMANIA": "TAS",
  "AUSTRALIAN CAPITAL TERRITORY": "ACT",
  "NORTHERN TERRITORY": "NT",
};

export function PlacesAutocomplete({
  value,
  onChange,
  placeholder = "Start typing an address...",
  className,
  disabled = false,
}: PlacesAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [_isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Initialize Google Maps
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setError("Google Maps API key is not configured");
      return;
    }

    if (isLoaded) return;

    const loader = new Loader({
      apiKey: GOOGLE_MAPS_API_KEY,
      version: "weekly",
      libraries: ["places"],
    });

    loader
      .load()
      .then(() => {
        setIsLoaded(true);
        setError(null);
      })
      .catch((err) => {
        console.error("Failed to load Google Maps:", err);
        setError("Failed to load Google Maps");
      });
  }, []);

  // Initialize autocomplete when Google Maps is loaded
  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

    try {
      const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
        types: ["address"],
        componentRestrictions: { country: "AU" }, // Restrict to Australia
        fields: ["address_components", "formatted_address", "place_id"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        
        if (!place.address_components || !place.formatted_address) {
          return;
        }

        // Extract address components
        const components = place.address_components;
        let suburb = "";
        let state = "";
        let postcode = "";
        let country = "";

        components.forEach((component) => {
          const types = component.types;
          
          if (types.includes("locality") || types.includes("sublocality")) {
            suburb = component.long_name;
          } else if (types.includes("administrative_area_level_1")) {
            state = component.short_name; // Gets "VIC", "NSW", etc.
          } else if (types.includes("postal_code")) {
            postcode = component.long_name;
          } else if (types.includes("country")) {
            country = component.long_name;
          }
        });

        const placeResult: PlaceResult = {
          address: place.formatted_address,
          suburb,
          state,
          postcode,
          country,
          placeId: place.place_id || "",
        };

        // Create "Suburb, State" format for display
        const displayLocation = suburb && state 
          ? `${suburb}, ${state}` 
          : place.formatted_address;

        onChange(displayLocation, placeResult);
        setIsDropdownOpen(false);
      });

      autocompleteRef.current = autocomplete;
    } catch (err) {
      console.error("Failed to initialize autocomplete:", err);
      setError("Failed to initialize address autocomplete");
    }
  }, [isLoaded, onChange]);

  // Monitor Google Places dropdown visibility
  useEffect(() => {
    if (!isLoaded) return;

    // Create a MutationObserver to watch for the pac-container
    const observer = new MutationObserver(() => {
      const pacContainer = document.querySelector('.pac-container');
      if (pacContainer) {
        const isVisible = (pacContainer as HTMLElement).style.display !== 'none' &&
                         (pacContainer as HTMLElement).style.visibility !== 'hidden';
        const hasItems = pacContainer.querySelectorAll('.pac-item').length > 0;
        setIsDropdownOpen(isVisible && hasItems);
      }
    });

    // Start observing the document body for changes
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });

    return () => observer.disconnect();
  }, [isLoaded]);

  // Parse manual "Suburb, State" input
  const parseManualInput = (input: string): PlaceResult | null => {
    // Check if input contains a comma
    if (!input.includes(",")) return null;
    
    const parts = input.split(",").map(part => part.trim());
    if (parts.length !== 2) return null;
    
    const [suburb, stateInput] = parts;
    if (!suburb || !stateInput) return null;
    
    // Check if state is valid
    const stateUpper = stateInput.toUpperCase();
    const state = STATE_MAPPINGS[stateUpper];
    
    if (!state) return null;
    
    // Return parsed result
    return {
      address: input,
      suburb,
      state,
      postcode: "", // User didn't provide postcode
      country: "Australia",
      placeId: "", // No place ID for manual input
    };
  };

  // Handle manual text input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    // Check if dropdown should be open after typing
    setTimeout(() => {
      const pacContainer = document.querySelector('.pac-container');
      if (pacContainer) {
        const hasItems = pacContainer.querySelectorAll('.pac-item').length > 0;
        setIsDropdownOpen(hasItems);
      }
    }, 100);
  };

  // Handle input blur to parse manual "Suburb, State" format
  const handleInputBlur = () => {
    // Only parse if no autocomplete selection was made
    if (!value || value.trim() === "") return;
    
    // Try to parse the manual input
    const parsed = parseManualInput(value);
    if (parsed) {
      // Call onChange with the parsed result
      onChange(value, parsed);
    }
    setIsDropdownOpen(false);
  };

  // Check if Google Places dropdown is currently visible and active
  const _unusedIsGooglePlacesActive = () => {
    const pacContainer = document.querySelector('.pac-container');
    return pacContainer && 
      (pacContainer as HTMLElement).style.display !== 'none' &&
      pacContainer.querySelectorAll('.pac-item').length > 0;
  };

  // Use the same styles as the Input component
  const inputStyles = cn(
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
    className
  );

  if (error) {
    // Fallback to regular input if Google Maps fails
    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        placeholder={placeholder}
        className={inputStyles}
        disabled={disabled}
      />
    );
  }

  return (
    <input
      ref={inputRef}
      type="text"
      value={value}
      onChange={handleInputChange}
      onBlur={handleInputBlur}
      placeholder={isLoaded ? placeholder : "Loading address autocomplete..."}
      className={inputStyles}
      disabled={disabled || !isLoaded}
    />
  );
}