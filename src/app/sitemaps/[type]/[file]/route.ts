import { getSitemapPage } from "@/lib/api/public";
import { SITE_URL } from "@/lib/env";
import { STATIC_PATHS, isSitemapType, urlsetXml, xmlResponse } from "@/lib/sitemap";

export const revalidate = 86400;

export async function GET(req: Request, ctx: RouteContext<"/sitemaps/[type]/[file]">) {
  const origin = new URL(req.url).origin;
  const baseUrl = origin && !origin.includes("localhost") ? origin : SITE_URL;
  const { type, file } = await ctx.params;
  const match = /^(\d+)\.xml$/.exec(file);
  if (!match || !isSitemapType(type)) return new Response("Not found", { status: 404 });
  const page = Number(match[1]);

  if (type === "static") {
    const lastmod = new Date().toISOString().split("T")[0];
    return xmlResponse(urlsetXml(STATIC_PATHS.map((path) => ({ path, lastmod })), baseUrl));
  }

  try {
    const data = await getSitemapPage(type, page);
    // Never return an empty <urlset></urlset> because Google Search Console flags it as "1 error: Empty sitemap"
    const items =
      data.items.length > 0
        ? data.items
        : type === "notes"
          ? [{ path: "/notes", lastmod: new Date().toISOString() }]
          : [];
    if (items.length === 0) return new Response("Not found", { status: 404 });
    return xmlResponse(urlsetXml(items, baseUrl));
  } catch {
    return new Response("Sitemap temporarily unavailable", { status: 503 });
  }
}
