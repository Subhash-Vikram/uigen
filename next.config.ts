import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  devIndicators: false,
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "zod/v4": path.resolve("./node_modules/zod/v4/index.js"),
    };
    return config;
  },
};

export default nextConfig;
