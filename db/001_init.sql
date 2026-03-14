CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── BASE NODE TABLE ────────────────────────────────────────────
-- Common fields only. Type-specific data lives in separate tables.
-- Used as FK target by edges and sessions.
CREATE TABLE nodes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type       VARCHAR(20) NOT NULL CHECK (type IN ('question','info','offer','conditional')),
  pos_x      FLOAT DEFAULT 0,
  pos_y      FLOAT DEFAULT 0,
  is_start   BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── TYPE-SPECIFIC TABLES ───────────────────────────────────────

CREATE TABLE question_nodes (
  node_id       UUID PRIMARY KEY REFERENCES nodes(id) ON DELETE CASCADE,
  title         TEXT NOT NULL DEFAULT '',
  question_type VARCHAR(20) CHECK (question_type IN ('single_choice','multi_choice','text_input','number_input')),
  options       JSONB,
  attribute_key TEXT
);

CREATE TABLE info_nodes (
  node_id UUID PRIMARY KEY REFERENCES nodes(id) ON DELETE CASCADE,
  title   TEXT NOT NULL DEFAULT '',
  content TEXT
);

-- offer_nodes holds all offer data (was previously split across offer_nodes + offers table)
CREATE TABLE offer_nodes (
  node_id      UUID PRIMARY KEY REFERENCES nodes(id) ON DELETE CASCADE,
  title        TEXT NOT NULL DEFAULT '',
  description  TEXT,
  cta_text     TEXT DEFAULT 'Start My Journey',
  slug         TEXT UNIQUE,
  digital_plan TEXT,
  physical_kit TEXT,
  why_text     TEXT,
  conditions   JSONB,
  priority     INT DEFAULT 0
);

CREATE TABLE conditional_nodes (
  node_id UUID PRIMARY KEY REFERENCES nodes(id) ON DELETE CASCADE,
  title   TEXT NOT NULL DEFAULT ''
);

-- ── UNIFIED READ VIEW ──────────────────────────────────────────
CREATE OR REPLACE VIEW nodes_full AS
SELECT
  n.id,
  n.type,
  n.pos_x,
  n.pos_y,
  n.is_start,
  n.created_at,
  n.updated_at,
  COALESCE(q.title, i.title, o.title, c.title, '') AS title,
  CASE n.type
    WHEN 'info'  THEN i.content
    WHEN 'offer' THEN o.description
    ELSE NULL
  END AS description,
  q.question_type,
  q.options,
  CASE n.type
    WHEN 'question' THEN q.attribute_key
    WHEN 'offer'    THEN o.slug
    ELSE NULL
  END AS attribute_key,
  o.cta_text,
  o.digital_plan,
  o.physical_kit,
  o.why_text,
  o.conditions  AS offer_conditions,
  o.priority    AS offer_priority
FROM nodes n
LEFT JOIN question_nodes    q ON q.node_id = n.id
LEFT JOIN info_nodes        i ON i.node_id = n.id
LEFT JOIN offer_nodes       o ON o.node_id = n.id
LEFT JOIN conditional_nodes c ON c.node_id = n.id;

-- ── EDGES ──────────────────────────────────────────────────────
CREATE TABLE edges (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  target_node_id UUID NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
  label          TEXT,
  conditions     JSONB,
  priority       INT DEFAULT 0,
  source_handle  TEXT,
  target_handle  TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ── SESSIONS ───────────────────────────────────────────────────
CREATE TABLE sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  current_node_id UUID REFERENCES nodes(id),
  attributes      JSONB DEFAULT '{}',
  completed       BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ,
  ip              TEXT,
  os              TEXT,
  browser         TEXT,
  device_type     TEXT,
  language        TEXT,
  referrer        TEXT,
  utm_source      TEXT,
  utm_medium      TEXT,
  utm_campaign    TEXT,
  in_app          TEXT
);

-- ── ANSWERS ────────────────────────────────────────────────────
CREATE TABLE answers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  node_id       UUID NOT NULL,
  attribute_key TEXT,
  value         JSONB NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
