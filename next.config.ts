import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // TODO: Add specific S3 bucket hostname(s) here. Remember to set .env variables.
      {
        protocol: 'https',
        hostname: 's3.amazonaws.com', // Placeholder
      },
    ],
  },
};

export default nextConfig;
