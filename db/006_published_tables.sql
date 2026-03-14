-- Published snapshot tables for user-facing quiz.
-- Admin edits draft tables. On Publish, data is atomically copied here.

-- ── BASE ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS published_nodes (
  id         UUID PRIMARY KEY,
  type       VARCHAR(20) NOT NULL CHECK (type IN ('question','info','offer','conditional','delay')),
  pos_x      FLOAT DEFAULT 0,
  pos_y      FLOAT DEFAULT 0,
  is_start   BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── TYPE-SPECIFIC ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS published_question_nodes (
  node_id       UUID PRIMARY KEY REFERENCES published_nodes(id) ON DELETE CASCADE,
  title         TEXT NOT NULL DEFAULT '',
  question_type VARCHAR(20) CHECK (question_type IN ('single_choice','multi_choice','text_input','number_input')),
  options       JSONB,
  attribute_key TEXT
);

CREATE TABLE IF NOT EXISTS published_info_nodes (
  node_id UUID PRIMARY KEY REFERENCES published_nodes(id) ON DELETE CASCADE,
  title   TEXT NOT NULL DEFAULT '',
  content TEXT
);

CREATE TABLE IF NOT EXISTS published_offer_nodes (
  node_id      UUID PRIMARY KEY REFERENCES published_nodes(id) ON DELETE CASCADE,
  title        TEXT NOT NULL DEFAULT '',
  description  TEXT,
  cta_text     TEXT DEFAULT 'Start My Journey',
  slug         TEXT,
  digital_plan TEXT,
  physical_kit TEXT,
  why_text     TEXT,
  conditions   JSONB,
  priority     INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS published_conditional_nodes (
  node_id UUID PRIMARY KEY REFERENCES published_nodes(id) ON DELETE CASCADE,
  title   TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS published_delay_nodes (
  node_id       UUID PRIMARY KEY REFERENCES published_nodes(id) ON DELETE CASCADE,
  title         TEXT NOT NULL DEFAULT '',
  delay_seconds INT DEFAULT 0
);

-- ── UNIFIED READ VIEW ──────────────────────────────────────────────────
CREATE OR REPLACE VIEW published_nodes_full AS
SELECT
  n.id,
  n.type,
  n.pos_x,
  n.pos_y,
  n.is_start,
  n.created_at,
  n.updated_at,
  COALESCE(q.title, i.title, o.title, c.title, d.title, '') AS title,
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
  d.delay_seconds,
  o.digital_plan,
  o.physical_kit,
  o.why_text,
  o.conditions  AS offer_conditions,
  o.priority    AS offer_priority
FROM published_nodes n
LEFT JOIN published_question_nodes    q ON q.node_id = n.id
LEFT JOIN published_info_nodes        i ON i.node_id = n.id
LEFT JOIN published_offer_nodes       o ON o.node_id = n.id
LEFT JOIN published_conditional_nodes c ON c.node_id = n.id
LEFT JOIN published_delay_nodes       d ON d.node_id = n.id;

-- ── EDGES ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS published_edges (
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

-- ── INITIAL POPULATE from draft ────────────────────────────────────────
INSERT INTO published_nodes (id, type, pos_x, pos_y, is_start, created_at, updated_at)
  SELECT id, type, pos_x, pos_y, is_start, created_at, updated_at FROM nodes
  ON CONFLICT (id) DO NOTHING;

INSERT INTO published_question_nodes (node_id, title, question_type, options, attribute_key)
  SELECT node_id, title, question_type, options, attribute_key FROM question_nodes
  ON CONFLICT (node_id) DO NOTHING;

INSERT INTO published_info_nodes (node_id, title, content)
  SELECT node_id, title, content FROM info_nodes
  ON CONFLICT (node_id) DO NOTHING;

INSERT INTO published_offer_nodes (node_id, title, description, cta_text, slug, digital_plan, physical_kit, why_text, conditions, priority)
  SELECT node_id, title, description, cta_text, slug, digital_plan, physical_kit, why_text, conditions, priority
  FROM offer_nodes
  ON CONFLICT (node_id) DO NOTHING;

INSERT INTO published_conditional_nodes (node_id, title)
  SELECT node_id, title FROM conditional_nodes
  ON CONFLICT (node_id) DO NOTHING;

INSERT INTO published_delay_nodes (node_id, title, delay_seconds)
  SELECT node_id, title, delay_seconds FROM delay_nodes
  ON CONFLICT (node_id) DO NOTHING;

INSERT INTO published_edges SELECT * FROM edges ON CONFLICT (id) DO NOTHING;
