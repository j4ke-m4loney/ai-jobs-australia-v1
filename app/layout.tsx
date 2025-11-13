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
  title: "AI Jobs Australia | #1 Home for AI Opportunities In Australia",
  description:
    "Discover the latest AI, Machine Learning, and Data Science opportunities across Australia. Browse hundreds of jobs from top companies hiring AI professionals",
  openGraph: {
    siteName: "AI Jobs Australia",
    type: "website",
    locale: "en_AU",
    title: "AI Jobs Australia | #1 Home for AI Opportunities In Australia",
    description:
      "Discover the latest AI, Machine Learning, and Data Science opportunities across Australia. Browse hundreds of jobs from top companies hiring AI professionals",
    url: "https://www.aijobsaustralia.com.au",
    images: [
      {
        url: "/og-image-temp.png",
        width: 512,
        height: 512,
        alt: "AI Jobs Australia - Find Your Dream AI Career",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Jobs Australia | #1 Home for AI Opportunities In Australia",
    description:
      "Discover the latest AI, Machine Learning, and Data Science opportunities across Australia. Browse hundreds of jobs from top companies hiring AI professionals",
    images: ["/og-image-temp.png"],
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
    shortcut: [
      { url: "/favicon.ico" },
    ],
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "AI Jobs Australia",
              alternateName: "AI Jobs Australia",
              url: "https://www.aijobsaustralia.com.au",
              description:
                "The #1 platform for AI, Machine Learning, and Data Science jobs in Australia",
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
