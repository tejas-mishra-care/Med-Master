/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three', 'three-stdlib'],
  webpack: (config, { isServer }) => {
    return config;
  },
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

module.exports = nextConfig;