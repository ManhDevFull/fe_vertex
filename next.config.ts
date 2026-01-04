import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: process.env.NODE_ENV === "production",
  },
  images: {
     domains: [
      'imgs.search.brave.com', // ✅ domain cần thêm
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
    ],
  },
};
export default nextConfig;
