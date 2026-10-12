import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    agentFeedback: true,
    // Winner proof screenshots go through a server action; the 1MB default
    // rejects most phone screenshots. Vercel caps request bodies at 4.5MB.
    serverActions: {
      bodySizeLimit: "4.5mb",
    },
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
