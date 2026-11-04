import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

// Gives `next dev` access to the Cloudflare bindings declared in wrangler.jsonc.
initOpenNextCloudflareForDev();

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Cloudflare Workers has no image optimiser without an extra paid product; the site only shows a few small icons.
  images: { unoptimized: true },
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // The first release served one university at /rajasthan-university; keep those links (and their ranking) alive.
  async redirects() {
    return [
      {
        source: "/rajasthan-university/:path*",
        destination: "/universities/rajasthan-university/:path*",
        permanent: true,
      },
      {
        source: "/rajasthan-university",
        destination: "/universities/rajasthan-university",
        permanent: true,
      },
      // Rajasthan Board class and subject pages moved to a shorter address.
      {
        source: "/exams/uni-rajasthanboard/:channel(class-9|class-10|class-11|class-12|model-papers)/:subject",
        destination: "/rajasthanboard/:channel/:subject",
        permanent: true,
      },
      {
        source: "/exams/uni-rajasthanboard/:channel(class-9|class-10|class-11|class-12|model-papers)",
        destination: "/rajasthanboard/:channel",
        permanent: true,
      },
      // The board's front page stays where it is; /rajasthanboard on its own leads there.
      { source: "/rajasthanboard", destination: "/exams/uni-rajasthanboard", permanent: false },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/:type(papers|courses|subjects|exams|static)/:file(\\d+\\.xml)",
        destination: "/sitemaps/:type/:file",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
