CREATE TABLE IF NOT EXISTS analyses (
  id TEXT PRIMARY KEY,
  analyzed_at TEXT NOT NULL,
  file_name TEXT,
  mime_type TEXT,
  model_type TEXT NOT NULL CHECK (model_type IN ('multimodal', 'text', 'image', 'video')),
  model_name TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  result TEXT
);