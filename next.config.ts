import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["three"],
  turbopack: {
    root: path.resolve(process.cwd()),
  },
};

export default nextConfig;
