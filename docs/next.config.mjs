import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Configure for static export
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Ensure client-side rendering for components that need it
  experimental: {
    esmExternals: true,
  },
  webpack: (config, { isServer }) => {
    // Ensure proper handling of client-side modules
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
  // Handle dynamic imports properly in static export
  transpilePackages: ['@unilab/urpc', '@unilab/urpc-core', '@unilab/urpc-adapters', '@unilab/ukit'],
};

export default withMDX(config);
