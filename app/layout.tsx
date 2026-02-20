import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClientProviders } from "@/components/providers/ClientProviders";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.aijobsaustralia.com.au"),
  title: "AI Jobs Australia | #1 Home for AI Opportunities",
  description:
    "Discover the latest AI, Machine Learning, and Data Science opportunities across Australia. Browse hundreds of jobs from top companies hiring AI professionals",
  openGraph: {
    siteName: "AI Jobs Australia",
    type: "website",
    locale: "en_AU",
    title: "#1 Home for all AI Opportunities In Australia",
    description:
      "Discover the latest AI, Machine Learning, and Data Science opportunities across Australia. Browse hundreds of jobs from top companies hiring AI professionals",
    url: "https://www.aijobsaustralia.com.au",
    images: [
      {
        url: "https://www.aijobsaustralia.com.au/og-image-temp.png",
        width: 512,
        height: 512,
        alt: "AI Jobs Australia - Find Your Dream AI Career",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@AIJobsAustralia",
    creator: "@AIJobsAustralia",
    title: "#1 Home for all AI Opportunities In Australia",
    description:
      "Discover the latest AI, Machine Learning, and Data Science opportunities across Australia. Browse hundreds of jobs from top companies hiring AI professionals",
    images: ["https://www.aijobsaustralia.com.au/twitter-card.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/aja-favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/aja-favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/aja-favicon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/aja-favicon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: [{ url: "/favicon.ico" }],
    apple: [
      { url: "/aja-favicon-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {/* WebSite Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": "https://www.aijobsaustralia.com.au/#website",
              name: "AI Jobs Australia",
              alternateName: "AI Jobs Australia",
              url: "https://www.aijobsaustralia.com.au",
              description:
                "The #1 platform for AI related roles in Australia (AI, Machine Learning, Data Science, AI Analyst, AI Marketing etc.)",
              publisher: {
                "@id": "https://www.aijobsaustralia.com.au/#organization",
              },
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate:
                    "https://www.aijobsaustralia.com.au/jobs?search={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />

        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "@id": "https://www.aijobsaustralia.com.au/#organization",
              name: "AI Jobs Australia",
              alternateName: "AIJobsAustralia.com.au",
              url: "https://www.aijobsaustralia.com.au",
              logo: {
                "@type": "ImageObject",
                "@id": "https://www.aijobsaustralia.com.au/#logo",
                url: "https://www.aijobsaustralia.com.au/aja-favicon-512.png",
                contentUrl:
                  "https://www.aijobsaustralia.com.au/aja-favicon-512.png",
                width: 512,
                height: 512,
                caption: "AI Jobs Australia Logo",
              },
              description:
                "Australia's #1 platform for AI, Machine Learning, and Data Science jobs. Connecting local talent with local opportunities.",
              email: "hello@aijobsaustralia.com.au",
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer service",
                email: "hello@aijobsaustralia.com.au",
                availableLanguage: ["English"],
                areaServed: "AU",
              },
              sameAs: [
                "https://x.com/aijobsaustralia",
                "https://www.linkedin.com/company/ai-jobs-australia/",
                "https://www.aijobsaustralia.com.au",
              ],
              address: {
                "@type": "PostalAddress",
                addressCountry: "AU",
                addressRegion: "Australia",
              },
              foundingDate: "2024",
              slogan: "#1 Home for AI Opportunities In Australia",
            }),
          }}
        />
        <Analytics />
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
        )}
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
