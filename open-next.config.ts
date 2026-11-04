import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * Page caching is done by the edge cache in cache-worker.js (Cloudflare's Cache API: free and unlimited writes), not by
 * Workers KV. KV's free plan allows only about 1,000 writes a day; every background page rebuild and every deploy wrote to it,
 * the limit was hit and deploys and pages started failing. With these "dummy" caches the app writes nothing to KV at all.
 * A page is rebuilt at most once per edge-cache lifetime (1 hour; 6 hours for papers).
 */
export default defineCloudflareConfig({
  incrementalCache: "dummy",
  tagCache: "dummy",
  queue: "dummy",
});
