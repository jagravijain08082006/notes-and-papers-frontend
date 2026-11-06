import { getSitemapPage } from "@/lib/api/public";

/**
 * Hub pages (exams, courses, terms, subjects: about 1,300 pages) are built once at deploy time on Vercel and then served from its
 * cache, so a visitor never waits for them to be built. Papers (about 12,000) are too many to build at deploy time; they are built
 * on the first visit and cached from then on (and `npm run prewarm` can visit them all after a deploy).
 *
 * Only on Vercel: on other hosts nothing is built in advance (Cloudflare's free plan cannot store pre-built pages).
 * The sitemap API lists exactly the published pages, so this never builds a page that does not exist.
 */
const PREBUILD = process.env.VERCEL === "1";

/** Path segments of every page of one sitemap type, e.g. ["exams", "gate"]. Empty when not prebuilding or if the API is down. */
export async function prebuiltPaths(type: "exams" | "courses" | "subjects"): Promise<string[][]> {
  if (!PREBUILD) return [];
  try {
    const out: string[][] = [];
    let totalPages = 1;
    for (let page = 1; page <= totalPages; page++) {
      const data = await getSitemapPage(type, page);
      totalPages = data.total_pages;
      for (const item of data.items) out.push(item.path.split("/").filter(Boolean));
    }
    return out;
  } catch {
    // A hiccup at deploy time must not fail the deploy: those pages are simply built on their first visit instead.
    return [];
  }
}
