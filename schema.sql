-- Saved pages for cache-worker.js: one row per page per deploy. Safe to run again.
CREATE TABLE IF NOT EXISTS pages (
  key      TEXT PRIMARY KEY,   -- "<deploy id>|/path?page=2"
  deploy   TEXT NOT NULL,
  saved_at INTEGER NOT NULL,   -- milliseconds
  status   INTEGER NOT NULL,
  headers  TEXT NOT NULL,      -- JSON object of the response headers worth keeping
  body     TEXT NOT NULL
);
