import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // The download step of a paper is a noindex page: crawlers gain nothing from it and each fetch costs a full render.
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/account", "/search", "/papers/*/download"] },
      // Answer engines and AI assistants are welcome on the public pages (same private areas stay closed).
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
        disallow: ["/admin", "/api", "/account", "/search", "/papers/*/download"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
