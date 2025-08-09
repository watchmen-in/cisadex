-- items (articles/advisories)
CREATE TABLE IF NOT EXISTS items (
  id TEXT PRIMARY KEY,            -- uuid or content hash
  url TEXT, title TEXT, source TEXT, source_type TEXT,
  published_at TEXT, fetched_at TEXT,
  summary TEXT, content TEXT,
  cve TEXT, exploited INTEGER, severity REAL, epss REAL,
  vendor TEXT, product TEXT,
  content_hash TEXT
);
CREATE INDEX IF NOT EXISTS idx_items_pub ON items(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_items_src ON items(source);
CREATE INDEX IF NOT EXISTS idx_items_cve ON items(cve);

-- lightweight FTS
CREATE VIRTUAL TABLE IF NOT EXISTS items_fts USING fts5(title, summary, content, content='');

-- iocs
CREATE TABLE IF NOT EXISTS iocs (
  item_id TEXT, kind TEXT, value TEXT,
  PRIMARY KEY(item_id, kind, value)
);
