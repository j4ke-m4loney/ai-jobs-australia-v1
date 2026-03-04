export function getLocationSearchTerms(stateCode: string): string[] {
  const stateMapping: Record<string, string[]> = {
    all: [], // Return empty array for "all" - no filtering needed
    nsw: ["NSW", "New South Wales", "Sydney", "Newcastle", "Wollongong"],
    vic: ["VIC", "Victoria", "Melbourne", "Geelong", "Ballarat"],
    qld: [
      "QLD",
      "Queensland",
      "Brisbane",
      "Gold Coast",
      "Cairns",
      "Townsville",
    ],
    wa: ["WA", "Western Australia", "Perth", "Fremantle"],
    sa: ["SA", "South Australia", "Adelaide"],
    tas: ["TAS", "Tasmania", "Hobart", "Launceston"],
    act: ["ACT", "Australian Capital Territory", "Canberra"],
    nt: ["NT", "Northern Territory", "Darwin", "Alice Springs"],
    remote: ["Remote", "Work from home", "WFH", "Anywhere"],
  };

  return stateMapping[stateCode] || [];
}
