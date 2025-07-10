import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  transpilePackages: [
    "@unilab/urpc",
    "@unilab/urpc-core",
    "@unilab/urpc-next",
    "@unilab/uniweb3",
    "@unilab/builtin-plugin",
  ],
};

export default nextConfig;
