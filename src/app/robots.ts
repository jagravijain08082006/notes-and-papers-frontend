import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";

// Closed to every crawler:
//  - private areas;
//  - the download step of a paper (a noindex page: crawlers gain nothing from it and each fetch costs a full render);
//  - Next.js's internal page-data requests (`?_rsc=...`). They are not pages. Crawlers find them in the page's own code and
//    then ask for each one, which doubles the load for nothing.
const CLOSED = ["/admin", "/api", "/account", "/search", "/papers/*/download", "/*?_rsc=", "/*&_rsc="];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: CLOSED },
      // Answer engines and AI assistants are welcome on the public pages (same closed areas as everyone else).
      {
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-User",
          "Claude-SearchBot",
          "PerplexityBot",
          "Google-Extended",
          "Applebot-Extended",
          "CCBot",
        ],
        allow: "/",
        disallow: CLOSED,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
