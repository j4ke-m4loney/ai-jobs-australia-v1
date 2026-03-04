import { getLocationSearchTerms } from "@/lib/locations/search-terms";

interface HighlightedLocationProps {
  location: string;
  selectedState?: string;
}

export function HighlightedLocation({
  location,
  selectedState,
}: HighlightedLocationProps) {
  if (!selectedState || selectedState === "all") {
    return <span>{location}</span>;
  }

  const searchTerms = getLocationSearchTerms(selectedState);
  if (searchTerms.length === 0) {
    return <span>{location}</span>;
  }

  const segments = location.split("|");

  // Single segment — no need to highlight
  if (segments.length <= 1) {
    return <span>{location}</span>;
  }

  return (
    <span>
      {segments.map((segment, index) => {
        const trimmed = segment.trim();
        const isMatch = searchTerms.some((term) =>
          trimmed.toLowerCase().includes(term.toLowerCase())
        );

        return (
          <span key={index}>
            {index > 0 && " | "}
            <span className={isMatch ? "font-semibold" : undefined}>
              {trimmed}
            </span>
          </span>
        );
      })}
    </span>
  );
}
