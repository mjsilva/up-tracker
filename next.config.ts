import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "p198.p4.n0.cdn.zight.com",
      },
    ],
  },
};

export default nextConfig;
