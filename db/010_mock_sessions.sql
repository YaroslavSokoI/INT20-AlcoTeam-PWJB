-- ============================================================
-- MOCK SESSIONS SEED (for analytics chart testing)
--
-- Generates ~200 sessions across 8 weeks:
--   - Weekly completion trend (improving over time)
--   - Top goals distribution
--   - Drop-off by node
--   - Device types, traffic sources, languages
-- ============================================================

DO $$
DECLARE
  -- Random pools
  goals      TEXT[] := ARRAY[
    'weight_loss','weight_loss','weight_loss','weight_loss',
    'strength','strength','strength',
    'flexibility','flexibility',
    'stress_relief','stress_relief',
    'endurance'
  ];
  devices    TEXT[] := ARRAY['mobile','mobile','mobile','mobile','desktop','desktop','tablet'];
  in_apps    TEXT[] := ARRAY['facebook','facebook','instagram','tiktok','tiktok'];
  langs      TEXT[] := ARRAY['en','en','en','uk','uk','uk','ru','de','fr'];
  oses       TEXT[] := ARRAY['iOS','iOS','Android','Android','Windows','Windows','macOS'];
  brows      TEXT[] := ARRAY['Safari','Chrome','Chrome','Firefox','Safari','Edge','Chrome'];

  -- Nodes where incomplete sessions are stuck (drop-off chart)
  drop_nodes UUID[] := ARRAY[
    '00000000-0000-0000-0000-000000000002'::UUID,  -- Q2: age
    '00000000-0000-0000-0000-000000000002'::UUID,
    '00000000-0000-0000-0000-000000000002'::UUID,
    '00000000-0000-0000-0000-000000000003'::UUID,  -- Q3: gender
    '00000000-0000-0000-0000-000000000003'::UUID,
    '00000000-0000-0000-0000-000000000004'::UUID,  -- Q4: fitness level
    '00000000-0000-0000-0000-000000000004'::UUID,
    '00000000-0000-0000-0000-000000000030'::UUID,  -- info: weight loss tip
    '00000000-0000-0000-0000-000000000031'::UUID,  -- info: strength tip
    '00000000-0000-0000-0000-000000000032'::UUID,  -- info: flexibility tip
    '00000000-0000-0000-0000-000000000005'::UUID,  -- Q5a: workout location
    '00000000-0000-0000-0000-000000000007'::UUID,  -- Q5b: equipment
    '00000000-0000-0000-0000-000000000020'::UUID,  -- Q7: time available
    '00000000-0000-0000-0000-000000000021'::UUID,  -- Q8: biggest barrier
    '00000000-0000-0000-0000-000000000035'::UUID   -- info: plan ready
  ];

  -- Offer nodes for completed sessions
  offer_ids  UUID[] := ARRAY[
    '00000000-0000-0000-0000-000000000050'::UUID,
    '00000000-0000-0000-0000-000000000051'::UUID,
    '00000000-0000-0000-0000-000000000052'::UUID,
    '00000000-0000-0000-0000-000000000053'::UUID
  ];

  -- Session variables
  sess_id          UUID;
  goal_val         TEXT;
  device_val       TEXT;
  in_app_val       TEXT;
  lang_val         TEXT;
  os_val           TEXT;
  browser_val      TEXT;
  created_ts       TIMESTAMPTZ;
  is_completed     BOOLEAN;
  offer_accepted   BOOLEAN;
  cur_node         UUID;
  week_offset      INT;  -- 0 = current week, 7 = 8 weeks ago
  n_goals  INT := array_length(goals, 1);
  n_dev    INT := array_length(devices, 1);
  n_apps   INT := array_length(in_apps, 1);
  n_langs  INT := array_length(langs, 1);
  n_oses   INT := array_length(oses, 1);
  n_brows  INT := array_length(brows, 1);
  n_drop   INT := array_length(drop_nodes, 1);
  n_offers INT := array_length(offer_ids, 1);
BEGIN
  FOR week_offset IN 0..7 LOOP
    FOR i IN 1..25 LOOP
      sess_id := gen_random_uuid();

      -- Spread sessions randomly within the week
      created_ts := NOW()
        - ((week_offset * 7 + floor(random() * 7)::int) || ' days')::INTERVAL
        - (floor(random() * 23)::int || ' hours')::INTERVAL
        - (floor(random() * 59)::int || ' minutes')::INTERVAL;

      -- Completion rate trends upward in more recent weeks:
      --   week 7 (oldest) ~35%, week 0 (current) ~70%
      is_completed := random() < (0.35 + (7 - week_offset) * 0.05);

      -- ~38% of completed sessions accepted the offer
      offer_accepted := is_completed AND (random() < 0.38);

      -- Random attribute picks
      goal_val   := goals[  1 + floor(random() * n_goals)::int  ];
      device_val := devices[ 1 + floor(random() * n_dev)::int   ];
      lang_val   := langs[   1 + floor(random() * n_langs)::int ];
      os_val     := oses[    1 + floor(random() * n_oses)::int  ];
      browser_val := brows[  1 + floor(random() * n_brows)::int ];

      -- ~40% direct traffic (NULL), rest from social
      IF random() < 0.40 THEN
        in_app_val := NULL;
      ELSE
        in_app_val := in_apps[ 1 + floor(random() * n_apps)::int ];
      END IF;

      -- Current node
      IF is_completed THEN
        cur_node := offer_ids[ 1 + floor(random() * n_offers)::int ];
      ELSE
        cur_node := drop_nodes[ 1 + floor(random() * n_drop)::int ];
      END IF;

      -- Insert session row
      INSERT INTO sessions (
        id, current_node_id, attributes,
        completed, completed_at, created_at,
        ip, os, browser, device_type, language, referrer, in_app,
        offer_accepted, offer_accepted_at
      ) VALUES (
        sess_id,
        cur_node,
        jsonb_build_object('goal', goal_val),
        is_completed,
        CASE WHEN is_completed
          THEN created_ts + ((5 + floor(random() * 15)::int) || ' minutes')::INTERVAL
          ELSE NULL
        END,
        created_ts,
        '192.168.' || (1 + floor(random() * 254)::int) || '.' || (1 + floor(random() * 254)::int),
        os_val,
        browser_val,
        device_val,
        lang_val,
        NULL,
        in_app_val,
        offer_accepted,
        CASE WHEN offer_accepted
          THEN created_ts + ((8 + floor(random() * 20)::int) || ' minutes')::INTERVAL
          ELSE NULL
        END
      );

      -- Insert 'goal' answer for every session (everyone answered Q1)
      INSERT INTO answers (id, session_id, node_id, attribute_key, value, created_at)
      VALUES (
        gen_random_uuid(),
        sess_id,
        '00000000-0000-0000-0000-000000000001'::UUID,
        'goal',
        to_jsonb(goal_val),
        created_ts + '20 seconds'::INTERVAL
      );

    END LOOP;
  END LOOP;
END $$;
