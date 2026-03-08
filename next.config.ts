import type { NextConfig } from "next";
import { dirname } from "path";
import { fileURLToPath } from "url";

const configDir = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  typedRoutes: true,
  cacheComponents: true,
  turbopack: {
    root: configDir,
  },
};

export default nextConfig;
