-- Expand nodes.type constraint to support all UI node types
ALTER TABLE nodes DROP CONSTRAINT IF EXISTS nodes_type_check;
ALTER TABLE nodes ADD CONSTRAINT nodes_type_check
  CHECK (type IN ('question', 'info', 'offer', 'conditional'));
