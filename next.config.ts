import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.githubusercontent.com" },
      { protocol: "https", hostname: "**.googleusercontent.com" },
      { protocol: "https", hostname: "**.techcrunch.com" },
      { protocol: "https", hostname: "**.verge.com" },
      { protocol: "https", hostname: "**.openai.com" },
      { protocol: "https", hostname: "**.anthropic.com" },
    ],
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
  experimental: {
    optimizePackageImports: ["@prisma/client", "lucide-react"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        source: "/api/tools/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=300",
          },
        ],
      },
      {
        source: "/api/search",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=30, stale-while-revalidate=60",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/tool/:slug",
        destination: "/tools/:slug",
        permanent: true,
      },
    ];
  },
  poweredByHeader: false,
  compress: true,
};

export default nextConfig;
