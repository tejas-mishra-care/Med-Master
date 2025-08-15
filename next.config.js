/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['three', 'three-stdlib'],
  webpack: (config, { isServer }) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
      // Force Next.js to use our patched navigation hooks
       ...(isServer ? {} : { 'next/navigation': path.resolve(__dirname, './src/hooks/use-safe-router') }),
    };
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