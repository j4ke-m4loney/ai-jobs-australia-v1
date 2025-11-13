import { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

// Server-side Supabase client for metadata generation
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface Props {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { id } = await params;
    const { data: job } = await supabase
      .from("jobs")
      .select(`
        *,
        companies (
          name,
          logo_url,
          website
        )
      `)
      .eq("id", id)
      .eq("status", "approved")
      .single();

    if (!job || !job.companies) {
      return {
        title: "Job Not Found | AI Jobs Australia",
        description: "This job listing is no longer available.",
      };
    }

    const companyName = job.companies.name || "Company";
    const jobTitle = `${job.title} at ${companyName}`;

    // Strip HTML tags and truncate description
    const cleanDescription = job.description
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 160);

    // Use company logo if available, otherwise fall back to site OG image
    const imageUrl = job.companies.logo_url || "/og-image-temp.png";

    return {
      title: `${jobTitle} | AI Jobs Australia`,
      description: cleanDescription,
      openGraph: {
        title: jobTitle,
        description: cleanDescription,
        url: `https://www.aijobsaustralia.com.au/jobs/${id}`,
        siteName: "AI Jobs Australia",
        type: "article",
        locale: "en_AU",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: `${jobTitle} - AI Jobs Australia`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: jobTitle,
        description: cleanDescription,
        images: [imageUrl],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "AI Jobs Australia",
      description: "Find your dream AI career in Australia",
    };
  }
}

export default function JobLayout({ children }: Props) {
  return <>{children}</>;
}
