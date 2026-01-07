import { NextResponse } from "next/server";
import { supabase } from "@/integrations/supabase/client";

export async function GET() {
  try {
    // Get total number of profiles from database
    const { count, error } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    if (error) {
      throw error;
    }

    // Round up to nearest 10 for marketing purposes
    const roundedCount = count ? Math.ceil(count / 10) * 10 : 0;

    // Return stats (open rate and locations are currently static but can be made dynamic)
    return NextResponse.json({
      subscribers: roundedCount,
      openRate: 61, // Average open rate - can be calculated from newsletter_campaigns table
      topLocations: [
        { name: "Australia", percentage: 93 },
        { name: "United States", percentage: 3 },
        { name: "India", percentage: 2 },
        { name: "Europe", percentage: 1 },
        { name: "Other", percentage: 1 },
      ],
    });
  } catch (error) {
    console.error("Failed to fetch advertise stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
