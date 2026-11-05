// The Next.js app, as its own Worker. It has no public address: only the front Worker (cache-worker.js) calls it, through
// the APP service binding in wrangler.jsonc. See cache-worker.js for why.
export { default } from "./.open-next/worker.js";
