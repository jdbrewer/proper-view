import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['images.unsplash.com', 'images.pexels.com'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;