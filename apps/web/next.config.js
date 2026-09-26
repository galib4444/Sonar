/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Handle canvas required by pdf-parse
    config.resolve.alias.canvas = false;
    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse'],
  },
};

module.exports = nextConfig;
