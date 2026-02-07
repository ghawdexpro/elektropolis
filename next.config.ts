import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "fgikvllfbtetzwkzwxqg.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/s/files/**",
      },
      {
        protocol: "https",
        hostname: "cdn.1avant.com",
        pathname: "/ventura-operations/**",
      },
      {
        protocol: "https",
        hostname: "pc21.deante.pl",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.edesa.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
    ],
  },
  output: "standalone",
};

export default nextConfig;
