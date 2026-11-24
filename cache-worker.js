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
// This Worker is only the front door. The Next.js app (a 7.6 MB bundle) runs in a second Worker, "notes-and-papers-app",
// reached through the APP service binding. Two reasons:
//  - this file never loads the app, so a saved page is answered in about a millisecond at any cold start;
//  - Cloudflare's free plan kills a Worker that uses more than 10 ms of CPU, and that cannot be caught inside the same Worker.
//    From here it can: the call to the app throws, and the render is simply tried again (a new try starts a fresh Worker).
//    If every try fails the visitor gets a small page that reloads itself, not Cloudflare's error 1102 page.
const TRIES = 4;

function busyPage(method) {
  const headers = { "retry-after": "3", "cache-control": "no-store" };
  if (method !== "GET" && method !== "HEAD") {
    return new Response("The server is busy. Please try again in a moment.", { status: 503, headers });
  }
  const html =
    '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<meta http-equiv="refresh" content="3"><meta name="robots" content="noindex"><title>Loading... | Notes &amp; Papers</title>' +
    "<style>body{font-family:system-ui,sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;background:#fffdf5;color:#1a1a1a}" +
    "main{text-align:center;padding:24px}h1{font-size:1.4rem;margin:0 0 8px}p{margin:0;color:#555}</style></head><body><main>" +
    "<h1>Just a moment...</h1><p>The page is being prepared. It will reload by itself.</p></main></body></html>";
  return new Response(method === "HEAD" ? null : html, {
    status: 503,
    headers: { ...headers, "content-type": "text/html; charset=utf-8" },
  });
}

/** Asks the app Worker for a response. Safe requests (GET/HEAD) are retried when the app Worker is killed or fails to start. */
async function callApp(request, env) {
  const safe = request.method === "GET" || request.method === "HEAD";
  const tries = safe ? TRIES : 1;
  for (let i = 0; i < tries; i++) {
    try {
      // A call that hangs is given up after a while and tried again, instead of leaving the visitor waiting a minute.
      let timer;
      const giveUp = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error("app did not answer")), Number(env.APP_TIMEOUT_MS) || 15000);
      });
      try {
        return await Promise.race([env.APP.fetch(i < tries - 1 ? request.clone() : request), giveUp]);
      } finally {
        clearTimeout(timer);
      }
    } catch {
      // killed for CPU time, or failed to start: wait a moment (waiting costs no CPU) and try again
      if (i < tries - 1) await new Promise((r) => setTimeout(r, 150 * (i + 1)));
    }
  }
  return busyPage(request.method);
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

/** The URL without tracking parameters and with the others in a fixed order, so equal pages share one saved copy. */
function normalize(url) {
  const u = new URL(url);
  for (const k of [...u.searchParams.keys()]) if (TRACKING.test(k)) u.searchParams.delete(k);
  u.searchParams.sort();
  return u;
}

function cacheKey(u, deploy) {
  const k = new URL(u.toString());
  // A saved page names the CSS and JS files of the deploy that built it, and those files are deleted by the next deploy.
  // Each deploy therefore gets its own entries; the old ones are simply never asked for again.
  k.searchParams.set("__deploy", deploy);
  return new Request(k.toString(), { method: "GET" });
}

// ---- Saved pages in D1 (a free SQLite database, the same for every Cloudflare location).
// The edge cache above is separate in every location and forgets pages; D1 keeps them. A page is rendered once, saved here,
// and from then on every visitor and every crawler, anywhere, gets it from this table without the app being loaded at all.
// Only plain pages are saved (no query string, or only ?page=), so a crawler inventing URLs cannot fill the database.
const SAVED_PARAMS = new Set(["page"]);
const KEEP_HEADERS_OUT = new Set(["content-length", "content-encoding", "transfer-encoding", "set-cookie", "date", "connection", "x-edge-cache"]);

function savedId(u, deploy) {
  return [...u.searchParams.keys()].every((k) => SAVED_PARAMS.has(k)) ? `${deploy}|${u.pathname}${u.search}` : null;
}

async function readSaved(env, id) {
  if (!env.DB || !id) return null;
  try {
    const row = await env.DB.prepare("SELECT status, headers, body FROM pages WHERE key = ?").bind(id).first();
    if (!row) return null;
    return new Response(row.body, { status: row.status, headers: JSON.parse(row.headers) });
  } catch {
    return null; // the database is an extra, never a reason to fail
  }
}

async function writeSaved(env, id, deploy, res) {
  if (!env.DB || !id || res.status !== 200) return;
  try {
    const body = await res.text();
    if (body.length > 1_500_000) return; // a D1 row holds at most 2 MB
    const headers = {};
    res.headers.forEach((v, k) => {
      if (!KEEP_HEADERS_OUT.has(k)) headers[k] = v;
    });
    await env.DB.prepare(
      "INSERT OR REPLACE INTO pages (key, deploy, saved_at, status, headers, body) VALUES (?, ?, ?, ?, ?, ?)",
    )
      .bind(id, deploy, Date.now(), res.status, JSON.stringify(headers), body)
      .run();
  } catch {
    // ignore
  }
}

/** Renders the page through the app; saves it when it is worth saving. Returns the response for the visitor. */
async function render(request, env, ctx, cache, key, url, saved) {
  const res = await callApp(request, env);
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
  if (saved) ctx.waitUntil(writeSaved(env, saved.id, saved.deploy, out.clone()));
  return out;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // `?_rsc=...` is Next.js's internal page-data request. A real browser always sends the `rsc` header with it; crawlers do
    // not (they copy the URL out of the page's code and ask for it as if it were a page). Those requests are answered with a
    // redirect to the real page, which is cheap and never loads the app, instead of a full render that fails on the free plan.
    if ((request.method === "GET" || request.method === "HEAD") && url.searchParams.has("_rsc") && !request.headers.has("rsc")) {
      url.searchParams.delete("_rsc");
      return new Response(null, {
        status: 301,
        headers: { location: url.toString(), "cache-control": "public, max-age=86400" },
      });
    }
    // Public pages do not depend on who is signed in (the header asks /api/me from the browser), so a signed-in visitor is
    // served the same saved page as everyone else. On a miss it is rendered WITHOUT the visitor's cookies, so the saved
    // copy can never contain anything private. Page-data (`rsc`) requests of signed-in visitors still go to the app.
    const hasSession = SESSION.test(request.headers.get("cookie") || "") || request.headers.has("authorization");
    const cacheable =
      request.method === "GET" &&
      !PRIVATE.test(url.pathname) &&
      !url.hostname.startsWith("www.") &&
      !(hasSession && request.headers.has("rsc")) &&
      !request.headers.has("range");
    if (!cacheable) return callApp(request, env);
    if (hasSession) {
      const headers = new Headers(request.headers);
      headers.delete("cookie");
      headers.delete("authorization");
      request = new Request(request.url, { method: "GET", headers });
    }

    const cache = caches.default;
    const deploy = env.CF_VERSION_METADATA?.id ?? "dev";
    const norm = normalize(request.url);
    const key = cacheKey(norm, deploy);
    const id = savedId(norm, deploy);
    const saved = id ? { id, deploy } : null;
    let hit = await cache.match(key);
    if (!hit) {
      hit = await readSaved(env, id);
      if (hit) ctx.waitUntil(cache.put(key, hit.clone())); // warm this location's cache for the next visitor
    }
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
          render(new Request(request.url, { headers: request.headers }), env, ctx, cache, key, url, saved)
            .then((r) => r.body?.cancel())
            .catch(() => {}),
        );
      }
      return res;
    }

    return render(request, env, ctx, cache, key, url, saved);
  },

  // Daily: forget saved pages of older deploys (they point at CSS and JS files that no longer exist).
  async scheduled(_event, env) {
    if (!env.DB || !env.CF_VERSION_METADATA?.id) return;
    await env.DB.prepare("DELETE FROM pages WHERE deploy <> ?").bind(env.CF_VERSION_METADATA.id).run();
  },
};
