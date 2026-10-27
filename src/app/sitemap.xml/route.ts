import { getSitemapPage } from "@/lib/api/public";
import { SITE_URL } from "@/lib/env";
import { API_SITEMAP_TYPES, sitemapIndexXml, xmlResponse } from "@/lib/sitemap";

export const revalidate = 3600;

export async function GET(req: Request) {
  const origin = new URL(req.url).origin;
  const baseUrl = origin && !origin.includes("localhost") ? origin : SITE_URL;
  const now = new Date().toISOString().split("T")[0];
  const items = [{ loc: `${baseUrl}/sitemaps/static/1.xml`, lastmod: now }];

  const results = await Promise.allSettled(API_SITEMAP_TYPES.map((t) => getSitemapPage(t, 1)));
  results.forEach((r, i) => {
    if (r.status !== "fulfilled") return; // API down: omit that type rather than fail the whole index
    const totalPages = r.value.total_pages;
    const itemsCount = r.value.items?.length ?? 0;
    // Skip empty sitemaps (e.g. notes with 0 published items) so Google never errors on an empty <urlset>
    if (totalPages <= 0 || itemsCount === 0) return;
    for (let n = 1; n <= totalPages; n++) {
      items.push({ loc: `${baseUrl}/sitemaps/${API_SITEMAP_TYPES[i]}/${n}.xml`, lastmod: now });
    }
  });

  return xmlResponse(sitemapIndexXml(items));
}
