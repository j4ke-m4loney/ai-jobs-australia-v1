import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All AI Job Categories | AI Jobs Australia",
  description:
    "Browse AI, Machine Learning, and Data Science job categories in Australia. Find roles across specialisations including ML Engineering, Data Science, AI Governance, and more.",
  openGraph: {
    title: "All AI Job Categories | AI Jobs Australia",
    description:
      "Browse AI, Machine Learning, and Data Science job categories in Australia. Find roles across specialisations including ML Engineering, Data Science, AI Governance, and more.",
  },
};

export default function CategoriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
