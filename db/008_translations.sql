-- Add translations JSONB to all type-specific node tables.
-- Structure: {"uk": {"title": "...", "description": "..."}, "ru": {"title": "..."}}
-- EN content stays in the existing fields (default/fallback).

ALTER TABLE question_nodes    ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}';
ALTER TABLE info_nodes        ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}';
ALTER TABLE offer_nodes       ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}';
ALTER TABLE conditional_nodes ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}';
-- delay_nodes may not exist in all environments
DO $$ BEGIN
  ALTER TABLE delay_nodes ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}';
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Published tables too
ALTER TABLE published_question_nodes    ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}';
ALTER TABLE published_info_nodes        ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}';
ALTER TABLE published_offer_nodes       ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}';
ALTER TABLE published_conditional_nodes ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}';
DO $$ BEGIN
  ALTER TABLE published_delay_nodes ADD COLUMN IF NOT EXISTS translations JSONB DEFAULT '{}';
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Recreate views with translations
-- Use DO block to handle delay_nodes which may or may not exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'delay_nodes') THEN
    EXECUTE '
      CREATE OR REPLACE VIEW nodes_full AS
      SELECT n.id, n.type, n.pos_x, n.pos_y, n.is_start, n.created_at, n.updated_at,
        COALESCE(q.title, i.title, o.title, c.title, d.title, '''') AS title,
        CASE n.type WHEN ''info'' THEN i.content WHEN ''offer'' THEN o.description ELSE NULL END AS description,
        q.question_type, q.options,
        CASE n.type WHEN ''question'' THEN q.attribute_key WHEN ''offer'' THEN o.slug ELSE NULL END AS attribute_key,
        o.cta_text, d.delay_seconds, o.digital_plan, o.physical_kit, o.why_text,
        o.conditions AS offer_conditions, o.priority AS offer_priority,
        COALESCE(q.translations, i.translations, o.translations, c.translations, d.translations, ''{}'') AS translations
      FROM nodes n
      LEFT JOIN question_nodes q ON q.node_id = n.id
      LEFT JOIN info_nodes i ON i.node_id = n.id
      LEFT JOIN offer_nodes o ON o.node_id = n.id
      LEFT JOIN conditional_nodes c ON c.node_id = n.id
      LEFT JOIN delay_nodes d ON d.node_id = n.id';
  ELSE
    EXECUTE '
      CREATE OR REPLACE VIEW nodes_full AS
      SELECT n.id, n.type, n.pos_x, n.pos_y, n.is_start, n.created_at, n.updated_at,
        COALESCE(q.title, i.title, o.title, c.title, '''') AS title,
        CASE n.type WHEN ''info'' THEN i.content WHEN ''offer'' THEN o.description ELSE NULL END AS description,
        q.question_type, q.options,
        CASE n.type WHEN ''question'' THEN q.attribute_key WHEN ''offer'' THEN o.slug ELSE NULL END AS attribute_key,
        o.cta_text, o.digital_plan, o.physical_kit, o.why_text,
        o.conditions AS offer_conditions, o.priority AS offer_priority,
        COALESCE(q.translations, i.translations, o.translations, c.translations, ''{}'') AS translations
      FROM nodes n
      LEFT JOIN question_nodes q ON q.node_id = n.id
      LEFT JOIN info_nodes i ON i.node_id = n.id
      LEFT JOIN offer_nodes o ON o.node_id = n.id
      LEFT JOIN conditional_nodes c ON c.node_id = n.id';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'published_delay_nodes') THEN
    EXECUTE '
      CREATE OR REPLACE VIEW published_nodes_full AS
      SELECT n.id, n.type, n.pos_x, n.pos_y, n.is_start, n.created_at, n.updated_at,
        COALESCE(q.title, i.title, o.title, c.title, d.title, '''') AS title,
        CASE n.type WHEN ''info'' THEN i.content WHEN ''offer'' THEN o.description ELSE NULL END AS description,
        q.question_type, q.options,
        CASE n.type WHEN ''question'' THEN q.attribute_key WHEN ''offer'' THEN o.slug ELSE NULL END AS attribute_key,
        o.cta_text, d.delay_seconds, o.digital_plan, o.physical_kit, o.why_text,
        o.conditions AS offer_conditions, o.priority AS offer_priority,
        COALESCE(q.translations, i.translations, o.translations, c.translations, d.translations, ''{}'') AS translations
      FROM published_nodes n
      LEFT JOIN published_question_nodes q ON q.node_id = n.id
      LEFT JOIN published_info_nodes i ON i.node_id = n.id
      LEFT JOIN published_offer_nodes o ON o.node_id = n.id
      LEFT JOIN published_conditional_nodes c ON c.node_id = n.id
      LEFT JOIN published_delay_nodes d ON d.node_id = n.id';
  ELSE
    EXECUTE '
      CREATE OR REPLACE VIEW published_nodes_full AS
      SELECT n.id, n.type, n.pos_x, n.pos_y, n.is_start, n.created_at, n.updated_at,
        COALESCE(q.title, i.title, o.title, c.title, '''') AS title,
        CASE n.type WHEN ''info'' THEN i.content WHEN ''offer'' THEN o.description ELSE NULL END AS description,
        q.question_type, q.options,
        CASE n.type WHEN ''question'' THEN q.attribute_key WHEN ''offer'' THEN o.slug ELSE NULL END AS attribute_key,
        o.cta_text, o.digital_plan, o.physical_kit, o.why_text,
        o.conditions AS offer_conditions, o.priority AS offer_priority,
        COALESCE(q.translations, i.translations, o.translations, c.translations, ''{}'') AS translations
      FROM published_nodes n
      LEFT JOIN published_question_nodes q ON q.node_id = n.id
      LEFT JOIN published_info_nodes i ON i.node_id = n.id
      LEFT JOIN published_offer_nodes o ON o.node_id = n.id
      LEFT JOIN published_conditional_nodes c ON c.node_id = n.id';
  END IF;
END $$;
