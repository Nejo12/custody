import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/learn/:slug",
        destination: "/learn/item?slug=:slug",
      },
    ];
  },
};

export default nextConfig;
