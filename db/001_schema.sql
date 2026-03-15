-- ============================================================
-- SCHEMA: Complete database schema (all migrations merged)
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── DRAFT NODES ────────────────────────────────────────────────
CREATE TABLE nodes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type       VARCHAR(20) NOT NULL CHECK (type IN ('question','info','offer','conditional')),
  pos_x      FLOAT DEFAULT 0,
  pos_y      FLOAT DEFAULT 0,
  is_start   BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE question_nodes (
  node_id       UUID PRIMARY KEY REFERENCES nodes(id) ON DELETE CASCADE,
  title         TEXT NOT NULL DEFAULT '',
  question_type VARCHAR(20) CHECK (question_type IN ('single_choice','multi_choice','text_input','number_input')),
  options       JSONB,
  attribute_key TEXT,
  translations  JSONB DEFAULT '{}'
);

CREATE TABLE info_nodes (
  node_id      UUID PRIMARY KEY REFERENCES nodes(id) ON DELETE CASCADE,
  title        TEXT NOT NULL DEFAULT '',
  content      TEXT,
  translations JSONB DEFAULT '{}'
);

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
  priority     INT DEFAULT 0,
  translations JSONB DEFAULT '{}'
);

CREATE TABLE conditional_nodes (
  node_id      UUID PRIMARY KEY REFERENCES nodes(id) ON DELETE CASCADE,
  title        TEXT NOT NULL DEFAULT '',
  translations JSONB DEFAULT '{}'
);

-- ── DRAFT NODES VIEW ────────────────────────────────────────────
CREATE OR REPLACE VIEW nodes_full AS
SELECT
  n.id, n.type, n.pos_x, n.pos_y, n.is_start, n.created_at, n.updated_at,
  COALESCE(q.title, i.title, o.title, c.title, '') AS title,
  CASE n.type WHEN 'info' THEN i.content WHEN 'offer' THEN o.description ELSE NULL END AS description,
  q.question_type, q.options,
  CASE n.type WHEN 'question' THEN q.attribute_key WHEN 'offer' THEN o.slug ELSE NULL END AS attribute_key,
  o.cta_text, o.digital_plan, o.physical_kit, o.why_text,
  o.conditions AS offer_conditions, o.priority AS offer_priority,
  COALESCE(q.translations, i.translations, o.translations, c.translations, '{}') AS translations
FROM nodes n
LEFT JOIN question_nodes    q ON q.node_id = n.id
LEFT JOIN info_nodes        i ON i.node_id = n.id
LEFT JOIN offer_nodes       o ON o.node_id = n.id
LEFT JOIN conditional_nodes c ON c.node_id = n.id;

-- ── EDGES ────────────────────────────────────────────────────────
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

-- ── SESSIONS ─────────────────────────────────────────────────────
CREATE TABLE sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  current_node_id   UUID REFERENCES nodes(id),
  attributes        JSONB DEFAULT '{}',
  completed         BOOLEAN DEFAULT FALSE,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  completed_at      TIMESTAMPTZ,
  ip                TEXT,
  os                TEXT,
  browser           TEXT,
  device_type       TEXT,
  language          TEXT,
  referrer          TEXT,
  utm_source        TEXT,
  utm_medium        TEXT,
  utm_campaign      TEXT,
  in_app            TEXT,
  offer_accepted    BOOLEAN DEFAULT FALSE,
  offer_accepted_at TIMESTAMPTZ,
  country           TEXT
);

-- ── ANSWERS ──────────────────────────────────────────────────────
CREATE TABLE answers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  node_id       UUID NOT NULL,
  attribute_key TEXT,
  value         JSONB NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── PUBLISHED TABLES ─────────────────────────────────────────────
-- Snapshot of draft tables published for user-facing quiz.
-- Admin edits drafts; on Publish data is atomically copied here.

CREATE TABLE published_nodes (
  id         UUID PRIMARY KEY,
  type       VARCHAR(20) NOT NULL CHECK (type IN ('question','info','offer','conditional')),
  pos_x      FLOAT DEFAULT 0,
  pos_y      FLOAT DEFAULT 0,
  is_start   BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE published_question_nodes (
  node_id       UUID PRIMARY KEY REFERENCES published_nodes(id) ON DELETE CASCADE,
  title         TEXT NOT NULL DEFAULT '',
  question_type VARCHAR(20) CHECK (question_type IN ('single_choice','multi_choice','text_input','number_input')),
  options       JSONB,
  attribute_key TEXT,
  translations  JSONB DEFAULT '{}'
);

CREATE TABLE published_info_nodes (
  node_id      UUID PRIMARY KEY REFERENCES published_nodes(id) ON DELETE CASCADE,
  title        TEXT NOT NULL DEFAULT '',
  content      TEXT,
  translations JSONB DEFAULT '{}'
);

CREATE TABLE published_offer_nodes (
  node_id      UUID PRIMARY KEY REFERENCES published_nodes(id) ON DELETE CASCADE,
  title        TEXT NOT NULL DEFAULT '',
  description  TEXT,
  cta_text     TEXT DEFAULT 'Start My Journey',
  slug         TEXT,
  digital_plan TEXT,
  physical_kit TEXT,
  why_text     TEXT,
  conditions   JSONB,
  priority     INT DEFAULT 0,
  translations JSONB DEFAULT '{}'
);

CREATE TABLE published_conditional_nodes (
  node_id      UUID PRIMARY KEY REFERENCES published_nodes(id) ON DELETE CASCADE,
  title        TEXT NOT NULL DEFAULT '',
  translations JSONB DEFAULT '{}'
);

CREATE OR REPLACE VIEW published_nodes_full AS
SELECT
  n.id, n.type, n.pos_x, n.pos_y, n.is_start, n.created_at, n.updated_at,
  COALESCE(q.title, i.title, o.title, c.title, '') AS title,
  CASE n.type WHEN 'info' THEN i.content WHEN 'offer' THEN o.description ELSE NULL END AS description,
  q.question_type, q.options,
  CASE n.type WHEN 'question' THEN q.attribute_key WHEN 'offer' THEN o.slug ELSE NULL END AS attribute_key,
  o.cta_text, o.digital_plan, o.physical_kit, o.why_text,
  o.conditions AS offer_conditions, o.priority AS offer_priority,
  COALESCE(q.translations, i.translations, o.translations, c.translations, '{}') AS translations
FROM published_nodes n
LEFT JOIN published_question_nodes    q ON q.node_id = n.id
LEFT JOIN published_info_nodes        i ON i.node_id = n.id
LEFT JOIN published_offer_nodes       o ON o.node_id = n.id
LEFT JOIN published_conditional_nodes c ON c.node_id = n.id;

CREATE TABLE published_edges (
  id             UUID PRIMARY KEY,
  source_node_id UUID NOT NULL,
  target_node_id UUID NOT NULL,
  label          TEXT,
  conditions     JSONB,
  priority       INT DEFAULT 0,
  source_handle  TEXT,
  target_handle  TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);
