import { cache } from "react";
import { createClient } from "@supabase/supabase-js";

// Cached per-request via React.cache so the layout's generateMetadata, the
// layout's JSON-LD renderer, and the page's server component all share a
// single DB round-trip per request. Deliberately returns rows regardless of
// status so callers can distinguish "expired" (render with badge) from
// "not found" (404).
export const getJobById = cache(async (id: string) => {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { data } = await supabase
    .from("jobs")
    .select(`
      *,
      companies (
        id,
        name,
        description,
        website,
        logo_url
      )
    `)
    .eq("id", id)
    .single();
  return data;
});
