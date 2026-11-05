#!/usr/bin/env node
// Visits every page of the sitemap so each one is rendered and saved (edge cache + D1) before a visitor or a crawler asks.
// A page that fails (the free Worker plan sometimes kills a render) is retried with a growing pause; this script is patient.
//
//   node scripts/prewarm.mjs                      # the live site
//   node scripts/prewarm.mjs https://x.workers.dev --offset 300 --limit 200 --concurrency 4
const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const base = (args.find((a) => a.startsWith("http")) ?? "https://notesandpapers.dpdns.org").replace(/\/$/, "");
const concurrency = Number(flag("concurrency", 2));
const limit = Number(flag("limit", Infinity));
const offset = Number(flag("offset", 0));
const UA = { "user-agent": "NotesAndPapers-Prewarm/1.0" };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const onBase = (u) => base + new URL(u).pathname + new URL(u).search;

async function get(url, tries = 8) {
  let last;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: UA, redirect: "manual", signal: AbortSignal.timeout(60_000) });
      const text = await res.text();
      if (res.status < 500) return { status: res.status, text, cache: res.headers.get("x-edge-cache") };
      last = res.status;
    } catch (e) {
      last = String(e.message ?? e);
    }
    await sleep(800 * (i + 1));
  }
  return { status: 0, text: "", error: last };
}

const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const index = await get(`${base}/sitemap.xml`);
if (index.status !== 200) throw new Error(`sitemap.xml: ${index.status} ${index.error ?? ""}`);
let urls = [];
for (const child of locs(index.text)) {
  const r = await get(onBase(child));
  if (r.status !== 200) console.error(`sitemap file failed: ${child} (${r.status})`);
  else urls.push(...locs(r.text));
}
urls = [...new Set(urls.map(onBase))].slice(offset, offset + limit);
console.log(`${urls.length} pages, ${concurrency} at a time, ${base}`);

const stats = { ok: 0, failed: [], warm: 0 };
let next = 0;
const started = Date.now();
async function worker() {
  while (next < urls.length) {
    const url = urls[next++];
    const r = await get(url);
    if (r.status === 200) {
      stats.ok++;
      if (r.cache === "HIT") stats.warm++;
    } else stats.failed.push(`${r.status || "ERR"} ${r.error ?? ""} ${url}`);
    const done = stats.ok + stats.failed.length;
    if (done % 200 === 0) console.log(`  ${done}/${urls.length}  (${Math.round((Date.now() - started) / 1000)}s)`);
  }
}
await Promise.all(Array.from({ length: concurrency }, worker));
console.log(`done in ${Math.round((Date.now() - started) / 1000)}s: ${stats.ok} ok (${stats.warm} already saved), ${stats.failed.length} failed`);
for (const f of stats.failed.slice(0, 30)) console.log("  FAILED", f);
process.exit(stats.failed.length > urls.length * 0.01 ? 1 : 0);
