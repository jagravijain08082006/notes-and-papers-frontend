// Entry point of the Worker: puts Cloudflare's edge cache in front of the Next.js app.
//
// Why: every page used to be rendered by the Worker on every visit (a 7.6 MB server bundle that has to be loaded after each idle
// period, then React rendering and calls to the API). Crawlers and cold starts made that exceed the Worker's CPU limit
// (error 1102). A page that is already in the edge cache is answered here in about a millisecond, before the heavy bundle is
// even loaded. Signed-in visitors, the API routes and private pages never use it.
//
// Stale-while-revalidate: a saved page is kept for a day, but it is "fresh" only for its normal lifetime (1 hour, 6 for papers).
// A visitor who arrives after that still gets the saved copy at once, and the page is rebuilt in the background for the next
// visitor. So pages stay current without anyone waiting for a render (except the very first visit to a page in a region).
//
// The app is loaded only when a page really has to be built (a dynamic import below), never at startup. A saved page is
// therefore returned without parsing the 7.6 MB bundle at all, which keeps a cold start of a cached page far below the
// free plan's 10 ms CPU limit. (OpenNext's Durable Object classes are not re-exported: none are bound in wrangler.jsonc.)
let app;
async function openNext() {
  app ??= (await import("./.open-next/worker.js")).default;
  return app;
}

const PRIVATE = /^\/(api|admin|account|login|signup|forgot-password|upload|bookmarks|search|_next|cdn-cgi)(\/|$)/;
const SESSION = /(?:^|;\s*)np_(?:access|refresh)=/;
const TRACKING = /^(utm_|fbclid$|gclid$|msclkid$|ref$)/i;
const HOUR = 3600;
const KEEP_SECONDS = 24 * HOUR; // how long a saved copy may still be served while it is being rebuilt

function ttlFor(path) {
  if (path === "/indexnow-key.txt") return 0;
  if (/^\/(papers|exams\/[^/]+\/[^/]+)\//.test(path) || /^\/papers\/[^/]+$/.test(path)) return 6 * HOUR;
  return HOUR;
}

function cacheKey(url, deploy) {
  const u = new URL(url);
  for (const k of [...u.searchParams.keys()]) if (TRACKING.test(k)) u.searchParams.delete(k);
  u.searchParams.sort();
  // A saved page names the CSS and JS files of the deploy that built it, and those files are deleted by the next deploy.
  // Each deploy therefore gets its own entries; the old ones are simply never asked for again.
  u.searchParams.set("__deploy", deploy);
  return new Request(u.toString(), { method: "GET" });
}

/** Renders the page through the app; saves it when it is worth saving. Returns the response for the visitor. */
async function render(request, env, ctx, cache, key, url) {
  const res = await (await openNext()).fetch(request, env, ctx);
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
  const fresh = res.status === 404 ? 600 : ttl;
  out.headers.set("cache-control", `public, max-age=60, s-maxage=${res.status === 404 ? 3600 : KEEP_SECONDS}`);
  out.headers.set("x-edge-fresh-seconds", String(fresh));
  out.headers.set("x-edge-saved-at", String(Date.now()));
  out.headers.set("x-edge-cache", "MISS");
  ctx.waitUntil(cache.put(key, out.clone()));
  return out;
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
    if (!cacheable) return (await openNext()).fetch(request, env, ctx);

    const cache = caches.default;
    const key = cacheKey(request.url, env.CF_VERSION_METADATA?.id ?? "dev");
    const hit = await cache.match(key);
    if (hit) {
      const ageSeconds = (Date.now() - Number(hit.headers.get("x-edge-saved-at") || 0)) / 1000;
      const freshSeconds = Number(hit.headers.get("x-edge-fresh-seconds") || ttlFor(url.pathname));
      const res = new Response(hit.body, hit);
      if (ageSeconds <= freshSeconds) {
        res.headers.set("x-edge-cache", "HIT");
      } else {
        // Out of date: answer with the saved copy now, rebuild it for the next visitor.
        res.headers.set("x-edge-cache", "STALE");
        ctx.waitUntil(
          render(new Request(request.url, { headers: request.headers }), env, ctx, cache, key, url)
            .then((r) => r.body?.cancel())
            .catch(() => {}),
        );
      }
      return res;
    }

    return render(request, env, ctx, cache, key, url);
  },
};
