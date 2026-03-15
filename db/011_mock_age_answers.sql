-- Add age answers for all sessions that don't have one yet
DO $$
DECLARE
  ages TEXT[] := ARRAY['under_25', '25_35', '25_35', '36_50', '36_50', 'over_50'];
  n INT := array_length(ages, 1);
  r RECORD;
BEGIN
  FOR r IN
    SELECT s.id, s.created_at
    FROM sessions s
    WHERE NOT EXISTS (
      SELECT 1 FROM answers a WHERE a.session_id = s.id AND a.attribute_key = 'age'
    )
  LOOP
    INSERT INTO answers (id, session_id, node_id, attribute_key, value, created_at)
    VALUES (
      gen_random_uuid(),
      r.id,
      '00000000-0000-0000-0000-000000000002'::UUID,
      'age',
      to_jsonb(ages[1 + floor(random() * n)::int]),
      r.created_at + '45 seconds'::INTERVAL
    );
  END LOOP;
END $$;
