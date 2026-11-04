// Entry point of the Worker: puts Cloudflare's edge cache in front of the Next.js app.
//
// Why: every page used to be rendered by the Worker on every visit (a 7.6 MB server bundle that has to be loaded after each idle
// period, then React rendering and calls to the API). Crawlers and cold starts made that exceed the Worker's CPU limit
// (error 1102). A page that is already in the edge cache is answered here in about a millisecond, before the heavy bundle is
// even loaded. Signed-in visitors, the API routes and private pages never use it.
import openNext from "./.open-next/worker.js";

export { DOQueueHandler, DOShardedTagCache, BucketCachePurge } from "./.open-next/worker.js";

const PRIVATE = /^\/(api|admin|account|login|signup|forgot-password|upload|bookmarks|downloads|search|_next|cdn-cgi)(\/|$)/;
const SESSION = /(?:^|;\s*)np_(?:access|refresh)=/;
const TRACKING = /^(utm_|fbclid$|gclid$|msclkid$|ref$)/i;
const HOUR = 3600;

function ttlFor(path) {
  if (path === "/indexnow-key.txt") return 0;
  if (/^\/(papers|exams\/[^/]+\/[^/]+)\//.test(path) || /^\/papers\/[^/]+$/.test(path)) return 6 * HOUR;
  return HOUR;
}

function cacheKey(url) {
  const u = new URL(url);
  for (const k of [...u.searchParams.keys()]) if (TRACKING.test(k)) u.searchParams.delete(k);
  u.searchParams.sort();
  return new Request(u.toString(), { method: "GET" });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const cacheable =
      request.method === "GET" &&
      !PRIVATE.test(url.pathname) &&
      !url.hostname.startsWith("www.") &&
      !SESSION.test(request.headers.get("cookie") || "") &&
      !request.headers.has("authorization") &&
      !request.headers.has("range");
    if (!cacheable) return openNext.fetch(request, env, ctx);

    const cache = caches.default;
    const key = cacheKey(request.url);
    const hit = await cache.match(key);
    if (hit) {
      const res = new Response(hit.body, hit);
      res.headers.set("x-edge-cache", "HIT");
      return res;
    }

    const res = await openNext.fetch(request, env, ctx);
    const type = res.headers.get("content-type") || "";
    const ttl = ttlFor(url.pathname);
    const storable =
      ttl > 0 &&
      (res.status === 200 || res.status === 404) &&
      !res.headers.has("set-cookie") &&
      /text\/html|xml|text\/plain/.test(type);
    if (!storable) return res;

    const out = new Response(res.body, res);
    // A missing page is remembered for a short time only: bots asking for dead URLs must not cost a render each time.
    const edgeTtl = res.status === 404 ? 600 : ttl;
    out.headers.set("cache-control", `public, max-age=60, s-maxage=${edgeTtl}`);
    out.headers.set("x-edge-cache", "MISS");
    ctx.waitUntil(cache.put(key, out.clone()));
    return out;
  },
};
