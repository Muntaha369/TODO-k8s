import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://todo-server-service:5000/api/:path*'
      },
    ];
  },
};

export default nextConfig;
