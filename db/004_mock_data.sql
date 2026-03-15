-- ============================================================
-- MOCK DATA: Sessions, age answers, countries
-- Generates ~200 sessions across 8 weeks for analytics testing
-- ============================================================

-- ── SESSIONS ─────────────────────────────────────────────────
DO $$
DECLARE
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
  countries  TEXT[] := ARRAY[
    'United States','United States','United States','United States','United States','United States',
    'Ukraine','Ukraine','Ukraine','Ukraine','Ukraine',
    'Germany','Germany','Germany','Germany',
    'United Kingdom','United Kingdom','United Kingdom',
    'France','France','France',
    'Poland','Poland',
    'Canada','Canada',
    'Brazil','Brazil',
    'Australia','Australia',
    'Netherlands','Netherlands',
    'Spain','Spain',
    'Italy','Italy',
    'Japan','Japan',
    'Sweden',
    'Norway',
    'Denmark',
    'Finland',
    'Switzerland',
    'Austria',
    'Belgium',
    'Portugal',
    'Czech Republic',
    'Romania',
    'Hungary',
    'Turkey',
    'India','India',
    'South Korea',
    'Singapore',
    'Mexico','Mexico',
    'Argentina',
    'Chile',
    'Colombia',
    'South Africa',
    'Nigeria',
    'Israel',
    'UAE',
    'Saudi Arabia',
    'New Zealand'
  ];

  drop_nodes UUID[] := ARRAY[
    '00000000-0000-0000-0000-000000000002'::UUID,
    '00000000-0000-0000-0000-000000000002'::UUID,
    '00000000-0000-0000-0000-000000000002'::UUID,
    '00000000-0000-0000-0000-000000000003'::UUID,
    '00000000-0000-0000-0000-000000000003'::UUID,
    '00000000-0000-0000-0000-000000000004'::UUID,
    '00000000-0000-0000-0000-000000000004'::UUID,
    '00000000-0000-0000-0000-000000000030'::UUID,
    '00000000-0000-0000-0000-000000000031'::UUID,
    '00000000-0000-0000-0000-000000000032'::UUID,
    '00000000-0000-0000-0000-000000000005'::UUID,
    '00000000-0000-0000-0000-000000000007'::UUID,
    '00000000-0000-0000-0000-000000000020'::UUID,
    '00000000-0000-0000-0000-000000000021'::UUID,
    '00000000-0000-0000-0000-000000000035'::UUID
  ];
  offer_ids  UUID[] := ARRAY[
    '00000000-0000-0000-0000-000000000050'::UUID,
    '00000000-0000-0000-0000-000000000051'::UUID,
    '00000000-0000-0000-0000-000000000052'::UUID,
    '00000000-0000-0000-0000-000000000053'::UUID
  ];

  sess_id        UUID;
  goal_val       TEXT;
  device_val     TEXT;
  in_app_val     TEXT;
  lang_val       TEXT;
  os_val         TEXT;
  browser_val    TEXT;
  country_val    TEXT;
  created_ts     TIMESTAMPTZ;
  is_completed   BOOLEAN;
  offer_accepted BOOLEAN;
  cur_node       UUID;
  week_offset    INT;
  n_goals    INT := array_length(goals, 1);
  n_dev      INT := array_length(devices, 1);
  n_apps     INT := array_length(in_apps, 1);
  n_langs    INT := array_length(langs, 1);
  n_oses     INT := array_length(oses, 1);
  n_brows    INT := array_length(brows, 1);
  n_countries INT := array_length(countries, 1);
  n_drop     INT := array_length(drop_nodes, 1);
  n_offers   INT := array_length(offer_ids, 1);
BEGIN
  FOR week_offset IN 0..7 LOOP
    FOR i IN 1..25 LOOP
      sess_id := gen_random_uuid();

      created_ts := NOW()
        - ((week_offset * 7 + floor(random() * 7)::int) || ' days')::INTERVAL
        - (floor(random() * 23)::int || ' hours')::INTERVAL
        - (floor(random() * 59)::int || ' minutes')::INTERVAL;

      is_completed   := random() < (0.35 + (7 - week_offset) * 0.05);
      offer_accepted := is_completed AND (random() < 0.38);

      goal_val    := goals[    1 + floor(random() * n_goals)::int    ];
      device_val  := devices[  1 + floor(random() * n_dev)::int      ];
      lang_val    := langs[    1 + floor(random() * n_langs)::int    ];
      os_val      := oses[     1 + floor(random() * n_oses)::int     ];
      browser_val := brows[    1 + floor(random() * n_brows)::int    ];
      country_val := countries[1 + floor(random() * n_countries)::int];

      IF random() < 0.40 THEN
        in_app_val := NULL;
      ELSE
        in_app_val := in_apps[1 + floor(random() * n_apps)::int];
      END IF;

      IF is_completed THEN
        cur_node := offer_ids[ 1 + floor(random() * n_offers)::int];
      ELSE
        cur_node := drop_nodes[1 + floor(random() * n_drop)::int  ];
      END IF;

      INSERT INTO sessions (
        id, current_node_id, attributes,
        completed, completed_at, created_at,
        ip, os, browser, device_type, language, referrer, in_app,
        offer_accepted, offer_accepted_at, country
      ) VALUES (
        sess_id, cur_node, jsonb_build_object('goal', goal_val),
        is_completed,
        CASE WHEN is_completed
          THEN created_ts + ((5 + floor(random() * 15)::int) || ' minutes')::INTERVAL
          ELSE NULL END,
        created_ts,
        '192.168.' || (1 + floor(random() * 254)::int) || '.' || (1 + floor(random() * 254)::int),
        os_val, browser_val, device_val, lang_val, NULL, in_app_val,
        offer_accepted,
        CASE WHEN offer_accepted
          THEN created_ts + ((8 + floor(random() * 20)::int) || ' minutes')::INTERVAL
          ELSE NULL END,
        country_val
      );

      INSERT INTO answers (id, session_id, node_id, attribute_key, value, created_at)
      VALUES (
        gen_random_uuid(), sess_id,
        '00000000-0000-0000-0000-000000000001'::UUID,
        'goal', to_jsonb(goal_val),
        created_ts + '20 seconds'::INTERVAL
      );

    END LOOP;
  END LOOP;
END $$;

-- ── AGE ANSWERS ───────────────────────────────────────────────
DO $$
DECLARE
  ages TEXT[] := ARRAY['under_25', '25_35', '25_35', '36_50', '36_50', 'over_50'];
  n    INT    := array_length(ages, 1);
  r    RECORD;
BEGIN
  FOR r IN
    SELECT s.id, s.created_at FROM sessions s
    WHERE NOT EXISTS (
      SELECT 1 FROM answers a WHERE a.session_id = s.id AND a.attribute_key = 'age'
    )
  LOOP
    INSERT INTO answers (id, session_id, node_id, attribute_key, value, created_at)
    VALUES (
      gen_random_uuid(), r.id,
      '00000000-0000-0000-0000-000000000002'::UUID,
      'age', to_jsonb(ages[1 + floor(random() * n)::int]),
      r.created_at + '45 seconds'::INTERVAL
    );
  END LOOP;
END $$;
