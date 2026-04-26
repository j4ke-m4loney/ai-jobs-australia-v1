import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'hoggxijtowzzsugcnude.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/privacy',
        destination: '/privacy-policy',
        permanent: true,
      },
      {
        source: '/tools/ai-skills-gap-analyzer',
        destination: '/tools/ai-skills-gap-analyser',
        permanent: true,
      },
      {
        source: '/blog/how-many-references-for-a-resume-for-ai-and-data-cience-in-australia',
        destination: '/blog/how-many-references-for-a-resume-for-ai-and-data-science-in-australia',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
