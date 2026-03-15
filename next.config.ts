import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow RSS fetch from external sources
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
    ];
  },
};

export default nextConfig;
