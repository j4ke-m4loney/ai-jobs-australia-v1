import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advertise with AI Jobs Australia | Reach Top AI & ML Talent",
  description:
    "Connect with Australia's leading AI developers, data scientists, and ML engineers. High open rates, targeted audience, premium placements.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function AdvertiseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
