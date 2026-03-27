CREATE TABLE IF NOT EXISTS analyses (
  id TEXT PRIMARY KEY,
  mode TEXT NOT NULL CHECK (mode IN ('text', 'image', 'video')),
  file_name TEXT,
  file_size INTEGER NOT NULL DEFAULT 0,
  mime_type TEXT,
  r2_key TEXT NOT NULL,
  analyzed_at TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  result TEXT
);