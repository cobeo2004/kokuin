export const SCHEMA_VERSION = 1;

export const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS nodes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL,
  name TEXT NOT NULL,
  qualified_name TEXT NOT NULL UNIQUE,
  file_path TEXT NOT NULL,
  line_start INTEGER NOT NULL,
  line_end INTEGER NOT NULL,
  language TEXT NOT NULL,
  parent_name TEXT,
  params TEXT,
  return_type TEXT,
  modifiers TEXT,
  is_test INTEGER NOT NULL DEFAULT 0,
  file_hash TEXT,
  extra TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS edges (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source_id INTEGER NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  target_id INTEGER NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  weight REAL NOT NULL DEFAULT 1.0,
  extra TEXT,
  UNIQUE(source_id, target_id, kind)
);

CREATE INDEX IF NOT EXISTS idx_nodes_file_path ON nodes(file_path);
CREATE INDEX IF NOT EXISTS idx_nodes_kind ON nodes(kind);
CREATE INDEX IF NOT EXISTS idx_nodes_name ON nodes(name);
CREATE INDEX IF NOT EXISTS idx_edges_source ON edges(source_id);
CREATE INDEX IF NOT EXISTS idx_edges_target ON edges(target_id);
CREATE INDEX IF NOT EXISTS idx_edges_kind ON edges(kind);
`;

export const CREATE_FTS_SQL = `
CREATE VIRTUAL TABLE IF NOT EXISTS nodes_fts USING fts5(
  name,
  qualified_name,
  file_path,
  params,
  content=nodes,
  content_rowid=id,
  tokenize='porter unicode61'
);
`;

export const REBUILD_FTS_SQL = `
DELETE FROM nodes_fts;
INSERT INTO nodes_fts(rowid, name, qualified_name, file_path, params)
  SELECT id, name, qualified_name, file_path, COALESCE(params, '') FROM nodes;
`;
