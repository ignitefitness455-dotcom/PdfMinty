-- Contacts table (from contact form)
CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Feedback table
CREATE TABLE IF NOT EXISTS feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  rating INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Analytics table (privacy-first, anonymous)
CREATE TABLE IF NOT EXISTS analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tool_id TEXT,
  session_hash TEXT,
  processing_time_ms INTEGER,
  file_size_bytes INTEGER,
  page_count INTEGER,
  success BOOLEAN,
  error_type TEXT,
  country_code TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_tool ON analytics(tool_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_contacts_type ON contacts(type);
