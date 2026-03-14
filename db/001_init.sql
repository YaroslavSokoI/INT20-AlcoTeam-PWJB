CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE nodes (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type          VARCHAR(20) NOT NULL CHECK (type IN ('question', 'info', 'offer', 'conditional', 'delay')),
  title         TEXT NOT NULL,
  description   TEXT,
  question_type VARCHAR(20) CHECK (question_type IN ('single_choice', 'multi_choice', 'text_input', 'number_input')),
  options       JSONB,
  attribute_key TEXT,
  pos_x         FLOAT DEFAULT 0,
  pos_y         FLOAT DEFAULT 0,
  is_start      BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE offers (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  slug         TEXT UNIQUE NOT NULL,
  description  TEXT,
  digital_plan TEXT,
  physical_kit TEXT,
  why_text     TEXT,
  cta_text     TEXT DEFAULT 'Start My Journey',
  conditions   JSONB,
  priority     INT DEFAULT 0,
  is_addon     BOOLEAN DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  current_node_id UUID REFERENCES nodes(id),
  attributes      JSONB DEFAULT '{}',
  completed       BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);

CREATE TABLE answers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id    UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  node_id       UUID NOT NULL,
  attribute_key TEXT,
  value         JSONB NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);
