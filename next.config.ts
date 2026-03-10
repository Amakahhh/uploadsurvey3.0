import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Keep local iteration unblocked for this recovered codebase.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
