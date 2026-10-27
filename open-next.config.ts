import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
import memoryQueue from "@opennextjs/cloudflare/overrides/queue/memory-queue";
import kvNextTagCache from "@opennextjs/cloudflare/overrides/tag-cache/kv-next-tag-cache";

/**
 * Where Next.js keeps its page cache on Cloudflare:
 * Everything lives in one KV namespace (no R2 or card needed): ISR pages under NEXT_INC_CACHE_KV, and tags
 * (revalidateTag from POST /api/revalidate, called by the backend after an import) under NEXT_TAG_CACHE_KV.
 * Both bindings are declared in wrangler.jsonc. To move the page cache to R2 later, switch to r2-incremental-cache.
 *
 * ISR revalidation queue:
 * Uses memoryQueue with the WORKER_SELF_REFERENCE service binding declared in wrangler.jsonc.
 */
export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
  tagCache: kvNextTagCache,
  queue: memoryQueue,
});
