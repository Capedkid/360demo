import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Plain static site in /out — deployable to any static host (Cloudflare Pages, Netlify, S3...)
  output: "export",
  images: { unoptimized: true },
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
