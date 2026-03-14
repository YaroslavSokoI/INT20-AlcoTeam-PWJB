-- ============================================================
-- SEED v3: BetterMe full wellness quiz DAG + offer catalog
--
-- Graph flow:
--   Q1(goal) → Q2(level) → Q3(age) → Q4(gender) → Q5(context)
--   → branch:
--       weight_loss+home    → Q6a(time_available)
--       strength/wl+gym     → Q6b(injuries)
--       endurance+outdoor   → Q6c(run_level)
--       flexibility         → INFO_flex → Q6d(flex_pref)
--       stress_relief/other → skip to universal
--   → Q7(barrier) → Q8(stress) → Q9(sleep) → Q10(energy)
--   → INFO "plan ready" (node 15)
--   → [conditional routing] → OFFER node (16–22)  ← terminal
--
-- Offer nodes are auto-advanced in the user app:
--   session completes → offer fetched from offers table → shown
-- ============================================================

-- ---- QUESTION / INFO NODES ---------------------------------

-- 1. Main goal (START)
INSERT INTO nodes (id, type, title, description, question_type, options, attribute_key, pos_x, pos_y, is_start)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'question',
  'What is your main wellness goal?',
  'We''ll build a program tailored to exactly what you want to achieve.',
  'single_choice',
  '[
    {"value":"weight_loss",  "label":"Lose Weight",    "icon":"🔥"},
    {"value":"strength",     "label":"Build Strength", "icon":"💪"},
    {"value":"flexibility",  "label":"Get Flexible",   "icon":"🧘"},
    {"value":"stress_relief","label":"Reduce Stress",  "icon":"🌿"},
    {"value":"endurance",    "label":"Boost Endurance","icon":"🏃"}
  ]',
  'goal', 0, 0, TRUE
);

-- 2. Fitness level
INSERT INTO nodes (id, type, title, description, question_type, options, attribute_key, pos_x, pos_y)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'question',
  'How would you describe your current fitness level?',
  'Be honest — there are no wrong answers. We''ll calibrate the right intensity for you.',
  'single_choice',
  '[
    {"value":"beginner",    "label":"Beginner — just starting out",        "icon":"🌱"},
    {"value":"intermediate","label":"Intermediate — work out occasionally","icon":"⚡"},
    {"value":"advanced",    "label":"Advanced — train regularly",          "icon":"🚀"}
  ]',
  'level', 0, 200
);

-- 3. Age range
INSERT INTO nodes (id, type, title, description, question_type, options, attribute_key, pos_x, pos_y)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'question',
  'What is your age range?',
  'Age helps us fine-tune intensity, recovery time, and program length.',
  'single_choice',
  '[
    {"value":"under_25","label":"Under 25","icon":"🌱"},
    {"value":"25_35",   "label":"25–35",   "icon":"⚡"},
    {"value":"36_50",   "label":"36–50",   "icon":"🎯"},
    {"value":"over_50", "label":"50+",     "icon":"🌟"}
  ]',
  'age', 0, 400
);

-- 4. Gender
INSERT INTO nodes (id, type, title, description, question_type, options, attribute_key, pos_x, pos_y)
VALUES (
  '00000000-0000-0000-0000-000000000004',
  'question',
  'What is your gender?',
  'Programs can be optimised differently. You can always select "Prefer not to say".',
  'single_choice',
  '[
    {"value":"male",             "label":"Male",              "icon":"👨"},
    {"value":"female",           "label":"Female",            "icon":"👩"},
    {"value":"non_binary",       "label":"Non-binary",        "icon":"🧑"},
    {"value":"prefer_not_to_say","label":"Prefer not to say", "icon":"🔒"}
  ]',
  'gender', 0, 600
);

-- 5. Workout context / location
INSERT INTO nodes (id, type, title, description, question_type, options, attribute_key, pos_x, pos_y)
VALUES (
  '00000000-0000-0000-0000-000000000005',
  'question',
  'Where do you prefer to work out?',
  'Your environment shapes your program — equipment, space, and schedule all matter.',
  'single_choice',
  '[
    {"value":"home",   "label":"At Home",   "icon":"🏠"},
    {"value":"gym",    "label":"At the Gym","icon":"🏋️"},
    {"value":"outdoor","label":"Outdoors",  "icon":"🌳"}
  ]',
  'context', 0, 800
);

-- 6a. Time available (branch: weight_loss + home)
INSERT INTO nodes (id, type, title, description, question_type, options, attribute_key, pos_x, pos_y)
VALUES (
  '00000000-0000-0000-0000-000000000006',
  'question',
  'How much time can you dedicate to training each day?',
  'We''ll match the intensity and volume to fit your available schedule.',
  'single_choice',
  '[
    {"value":"10_15",  "label":"10–15 minutes","icon":"⚡"},
    {"value":"20_30",  "label":"20–30 minutes","icon":"🕐"},
    {"value":"45_plus","label":"45+ minutes",  "icon":"💥"}
  ]',
  'time_available', -500, 1050
);

-- 6b. Injuries / limitations (branch: strength or weight_loss + gym)
INSERT INTO nodes (id, type, title, description, question_type, options, attribute_key, pos_x, pos_y)
VALUES (
  '00000000-0000-0000-0000-000000000007',
  'question',
  'Do you have any injuries or physical limitations?',
  'We want to make sure your plan is safe, effective, and built around your body.',
  'single_choice',
  '[
    {"value":"none",    "label":"No injuries",         "icon":"✅"},
    {"value":"knee",    "label":"Knee issues",         "icon":"🦵"},
    {"value":"back",    "label":"Back / spine issues", "icon":"🔙"},
    {"value":"shoulder","label":"Shoulder issues",     "icon":"💪"}
  ]',
  'injuries', 0, 1050
);

-- 6c. Running experience (branch: endurance + outdoor)
INSERT INTO nodes (id, type, title, description, question_type, options, attribute_key, pos_x, pos_y)
VALUES (
  '00000000-0000-0000-0000-000000000008',
  'question',
  'What''s your running experience?',
  'We''ll calibrate the right starting point for your endurance journey.',
  'single_choice',
  '[
    {"value":"never",     "label":"Never run before", "icon":"🐢"},
    {"value":"occasional","label":"Run occasionally", "icon":"🚶"},
    {"value":"regular",   "label":"Run regularly",    "icon":"🏃"}
  ]',
  'run_level', 500, 1050
);

-- INFO: Flexibility motivation (branch: flexibility goal)
INSERT INTO nodes (id, type, title, description, question_type, options, attribute_key, pos_x, pos_y)
VALUES (
  '00000000-0000-0000-0000-000000000009',
  'info',
  'Flexibility is the foundation of a healthy body 🧘',
  'People who improve mobility report 40% less pain and significantly better posture within just 4 weeks. Small, consistent daily sessions make a huge difference.',
  NULL, NULL, NULL,
  -1000, 1050
);

-- 6d. Flexibility format preference (branch: flexibility, after info)
INSERT INTO nodes (id, type, title, description, question_type, options, attribute_key, pos_x, pos_y)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  'question',
  'What type of flexibility training appeals to you?',
  'We''ll design your daily routine around the style you''ll actually enjoy and stick to.',
  'single_choice',
  '[
    {"value":"yoga",      "label":"Yoga flows",                "icon":"🧘"},
    {"value":"stretching","label":"Deep stretching / mobility","icon":"🤸"},
    {"value":"pilates",   "label":"Pilates",                   "icon":"🏋️"}
  ]',
  'flex_pref', -1000, 1250
);

-- 7. Main barrier (universal convergence)
INSERT INTO nodes (id, type, title, description, question_type, options, attribute_key, pos_x, pos_y)
VALUES (
  '00000000-0000-0000-0000-000000000011',
  'question',
  'What''s the biggest thing getting in the way of your wellness goals?',
  'Understanding your barriers helps us build a realistic plan that actually fits your life.',
  'single_choice',
  '[
    {"value":"time_lack",     "label":"Not enough time",                        "icon":"⏰"},
    {"value":"low_motivation","label":"Lack of motivation or discipline",        "icon":"😔"},
    {"value":"stress_fatigue","label":"Stress and fatigue",                      "icon":"😰"},
    {"value":"no_guidance",   "label":"No guidance — don''t know where to start","icon":"🤷"},
    {"value":"nothing",       "label":"Nothing — I''m ready to go!",            "icon":"🚀"}
  ]',
  'barrier', 0, 1450
);

-- 8. Stress level (universal)
INSERT INTO nodes (id, type, title, description, question_type, options, attribute_key, pos_x, pos_y)
VALUES (
  '00000000-0000-0000-0000-000000000012',
  'question',
  'How would you rate your current stress level?',
  'Stress is the hidden blocker of most wellness journeys. Knowing your level helps us support your recovery properly.',
  'single_choice',
  '[
    {"value":"low",   "label":"Low — I feel calm and balanced",  "icon":"😊"},
    {"value":"medium","label":"Medium — some tension day-to-day","icon":"😐"},
    {"value":"high",  "label":"High — I often feel overwhelmed", "icon":"😰"}
  ]',
  'stress_level', 0, 1650
);

-- 9. Sleep quality (universal)
INSERT INTO nodes (id, type, title, description, question_type, options, attribute_key, pos_x, pos_y)
VALUES (
  '00000000-0000-0000-0000-000000000013',
  'question',
  'How is your sleep quality lately?',
  'Sleep is where real recovery happens. It directly impacts your results, mood, and energy.',
  'single_choice',
  '[
    {"value":"good","label":"Good — 7–8h, I wake up rested",        "icon":"😴"},
    {"value":"fair","label":"Fair — inconsistent, could be better", "icon":"🌙"},
    {"value":"poor","label":"Poor — I often wake up tired",         "icon":"😵"}
  ]',
  'sleep_quality', 0, 1850
);

-- 10. Energy level (universal)
INSERT INTO nodes (id, type, title, description, question_type, options, attribute_key, pos_x, pos_y)
VALUES (
  '00000000-0000-0000-0000-000000000014',
  'question',
  'How would you describe your typical daily energy levels?',
  'We''ll match your program intensity to your real-life energy capacity so you actually finish sessions.',
  'single_choice',
  '[
    {"value":"high",  "label":"High — energized most of the day","icon":"⚡"},
    {"value":"medium","label":"Medium — ups and downs",          "icon":"🔋"},
    {"value":"low",   "label":"Low — I often feel drained",      "icon":"🪫"}
  ]',
  'energy_level', 0, 2050
);

-- 15. INFO: Plan ready (transition — routes to offer nodes)
INSERT INTO nodes (id, type, title, description, question_type, options, attribute_key, pos_x, pos_y)
VALUES (
  '00000000-0000-0000-0000-000000000015',
  'info',
  'Your personalized wellness plan is ready! 🎉',
  'Based on your answers, we''ve crafted a program that matches your lifestyle, goals, schedule, and current wellbeing. Thousands of people with your exact profile have already transformed their health.',
  NULL, NULL, NULL,
  0, 2250
);

-- ---- OFFER NODES (terminal — no outgoing edges) ------------

-- 16. OFFER: Weight Loss Starter (home, 20-30+ min)
INSERT INTO nodes (id, type, title, description, question_type, options, attribute_key, pos_x, pos_y)
VALUES (
  '00000000-0000-0000-0000-000000000016',
  'offer',
  'Weight Loss Starter',
  '4-week home fat-burn program — 20–30 min daily, no equipment',
  NULL, NULL, 'weight-loss-starter',
  -900, 2500
);

-- 17. OFFER: Quick Fit Micro-Workouts (home, 10-15 min)
INSERT INTO nodes (id, type, title, description, question_type, options, attribute_key, pos_x, pos_y)
VALUES (
  '00000000-0000-0000-0000-000000000017',
  'offer',
  'Quick Fit Micro-Workouts',
  '10–15 min daily HIIT micro-workouts — proven fat loss for busy people',
  NULL, NULL, 'quick-fit-micro',
  -600, 2500
);

-- 18. OFFER: Lean Strength Builder (gym, no injuries)
INSERT INTO nodes (id, type, title, description, question_type, options, attribute_key, pos_x, pos_y)
VALUES (
  '00000000-0000-0000-0000-000000000018',
  'offer',
  'Lean Strength Builder',
  'Progressive 6-week gym strength program — compound lifts + hypertrophy',
  NULL, NULL, 'lean-strength-builder',
  -300, 2500
);

-- 19. OFFER: Low-Impact Fat Burn (gym, with injuries)
INSERT INTO nodes (id, type, title, description, question_type, options, attribute_key, pos_x, pos_y)
VALUES (
  '00000000-0000-0000-0000-000000000019',
  'offer',
  'Low-Impact Fat Burn',
  'Joint-friendly program for knee, back, and shoulder issues',
  NULL, NULL, 'low-impact-fat-burn',
  0, 2500
);

-- 20. OFFER: Run Your First 5K (outdoor)
INSERT INTO nodes (id, type, title, description, question_type, options, attribute_key, pos_x, pos_y)
VALUES (
  '00000000-0000-0000-0000-000000000020',
  'offer',
  'Run Your First 5K',
  '8-week Couch-to-5K outdoor running program — 3 sessions/week',
  NULL, NULL, 'run-first-5k',
  300, 2500
);

-- 21. OFFER: Yoga & Mobility (flexibility)
INSERT INTO nodes (id, type, title, description, question_type, options, attribute_key, pos_x, pos_y)
VALUES (
  '00000000-0000-0000-0000-000000000021',
  'offer',
  'Yoga & Mobility Program',
  'Daily 10–25 min yoga and mobility sessions — flexibility and posture',
  NULL, NULL, 'yoga-mobility',
  600, 2500
);

-- 22. OFFER: Stress Reset Program (stress_relief)
INSERT INTO nodes (id, type, title, description, question_type, options, attribute_key, pos_x, pos_y)
VALUES (
  '00000000-0000-0000-0000-000000000022',
  'offer',
  'Stress Reset Program',
  '4-week mental reset — breathwork, meditation, and anti-stress routines',
  NULL, NULL, 'stress-reset',
  900, 2500
);


-- ---- EDGES -------------------------------------------------

-- Main linear path: Q1 → Q2 → Q3 → Q4 → Q5
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002',NULL,NULL,0);
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000003',NULL,NULL,0);
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000004',NULL,NULL,0);
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000005',NULL,NULL,0);

-- Q5 → Q6a: weight_loss + home
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES (
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000006',
  'Weight loss at home',
  '{"type":"compound","operator":"AND","conditions":[
    {"type":"simple","attribute":"goal","op":"eq","value":"weight_loss"},
    {"type":"simple","attribute":"context","op":"eq","value":"home"}
  ]}',
  10
);

-- Q5 → Q6b: strength + gym
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES (
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000007',
  'Strength at gym',
  '{"type":"compound","operator":"AND","conditions":[
    {"type":"simple","attribute":"goal","op":"eq","value":"strength"},
    {"type":"simple","attribute":"context","op":"eq","value":"gym"}
  ]}',
  10
);

-- Q5 → Q6b: weight_loss + gym
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES (
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000007',
  'Weight loss at gym',
  '{"type":"compound","operator":"AND","conditions":[
    {"type":"simple","attribute":"goal","op":"eq","value":"weight_loss"},
    {"type":"simple","attribute":"context","op":"eq","value":"gym"}
  ]}',
  9
);

-- Q5 → Q6c: endurance + outdoor
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES (
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000008',
  'Endurance outdoors',
  '{"type":"compound","operator":"AND","conditions":[
    {"type":"simple","attribute":"goal","op":"eq","value":"endurance"},
    {"type":"simple","attribute":"context","op":"eq","value":"outdoor"}
  ]}',
  10
);

-- Q5 → INFO flex: flexibility
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES (
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000009',
  'Flexibility path',
  '{"type":"simple","attribute":"goal","op":"eq","value":"flexibility"}',
  10
);

-- Q5 → Q7: stress_relief (skip branching)
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES (
  '00000000-0000-0000-0000-000000000005',
  '00000000-0000-0000-0000-000000000011',
  'Stress relief direct',
  '{"type":"simple","attribute":"goal","op":"eq","value":"stress_relief"}',
  10
);

-- Q5 → Q7: default fallback (strength+home, endurance+gym, etc.)
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000011',NULL,NULL,0);

-- Branch exits → Q7 (universal convergence)
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000011',NULL,NULL,0);
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000011',NULL,NULL,0);
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000011',NULL,NULL,0);

-- Flexibility info → Q6d
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000009','00000000-0000-0000-0000-000000000010',NULL,NULL,0);
-- Q6d → Q7
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000010','00000000-0000-0000-0000-000000000011',NULL,NULL,0);

-- Universal path: Q7 → Q8 → Q9 → Q10 → INFO(15)
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000012',NULL,NULL,0);
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000012','00000000-0000-0000-0000-000000000013',NULL,NULL,0);
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000013','00000000-0000-0000-0000-000000000014',NULL,NULL,0);
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000014','00000000-0000-0000-0000-000000000015',NULL,NULL,0);

-- ── DECISION TREE: conditional nodes 23–30 ──────────────────────────────
--
--  15 (INFO)
--  └─► 23 (goal = weight_loss?)
--        TRUE  ─► 24 (context = home?)
--                   TRUE  ─► 25 (time = 10_15?)
--                              TRUE  ─► OFFER 17 Quick Fit
--                              FALSE ─► OFFER 16 Weight Loss Starter
--                   FALSE ─► 26 (injuries = none?)
--                              TRUE  ─► OFFER 16 Weight Loss Starter
--                              FALSE ─► OFFER 19 Low Impact
--        FALSE ─► 27 (goal = strength?)
--                   TRUE  ─► 28 (injuries = none?)
--                              TRUE  ─► OFFER 18 Lean Strength
--                              FALSE ─► OFFER 19 Low Impact
--                   FALSE ─► 29 (goal = endurance?)
--                              TRUE  ─► OFFER 20 Run 5K
--                              FALSE ─► 30 (goal = flexibility?)
--                                         TRUE  ─► OFFER 21 Yoga
--                                         FALSE ─► OFFER 22 Stress Reset

-- Node 23: Is goal weight_loss?
INSERT INTO nodes (id, type, title, description, attribute_key, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000023','conditional','goal = weight_loss?',NULL,'goal',0,2500);

-- Node 24: Is context home? (within weight_loss)
INSERT INTO nodes (id, type, title, description, attribute_key, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000024','conditional','context = home?',NULL,'context',-700,2700);

-- Node 25: Is time 10–15 min? (weight_loss + home)
INSERT INTO nodes (id, type, title, description, attribute_key, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000025','conditional','time = 10–15 min?',NULL,'time_available',-1000,2900);

-- Node 26: No injuries? (weight_loss + gym)
INSERT INTO nodes (id, type, title, description, attribute_key, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000026','conditional','injuries = none?',NULL,'injuries',-400,2900);

-- Node 27: Is goal strength?
INSERT INTO nodes (id, type, title, description, attribute_key, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000027','conditional','goal = strength?',NULL,'goal',700,2700);

-- Node 28: No injuries? (strength)
INSERT INTO nodes (id, type, title, description, attribute_key, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000028','conditional','injuries = none?',NULL,'injuries',400,2900);

-- Node 29: Is goal endurance?
INSERT INTO nodes (id, type, title, description, attribute_key, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000029','conditional','goal = endurance?',NULL,'goal',1000,2900);

-- Node 30: Is goal flexibility?
INSERT INTO nodes (id, type, title, description, attribute_key, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000030','conditional','goal = flexibility?',NULL,'goal',1300,3100);

-- ── EDGES: decision tree ─────────────────────────────────────────────────

-- 15 → 23 (single unconditional entry)
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority, source_handle, target_handle)
VALUES ('00000000-0000-0000-0000-000000000015','00000000-0000-0000-0000-000000000023',NULL,NULL,0,'source',NULL);

-- 23 → 24 TRUE (weight_loss)
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority, source_handle, target_handle)
VALUES ('00000000-0000-0000-0000-000000000023','00000000-0000-0000-0000-000000000024','weight_loss','{"type":"simple","attribute":"goal","op":"eq","value":"weight_loss"}',10,'true',NULL);
-- 23 → 27 FALSE (fallback)
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority, source_handle, target_handle)
VALUES ('00000000-0000-0000-0000-000000000023','00000000-0000-0000-0000-000000000027',NULL,NULL,0,'false',NULL);

-- 24 → 25 TRUE (home)
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority, source_handle, target_handle)
VALUES ('00000000-0000-0000-0000-000000000024','00000000-0000-0000-0000-000000000025','home','{"type":"simple","attribute":"context","op":"eq","value":"home"}',10,'true',NULL);
-- 24 → 26 FALSE (gym)
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority, source_handle, target_handle)
VALUES ('00000000-0000-0000-0000-000000000024','00000000-0000-0000-0000-000000000026','gym',NULL,0,'false',NULL);

-- 25 → OFFER 17 TRUE (10_15 min)
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority, source_handle, target_handle)
VALUES ('00000000-0000-0000-0000-000000000025','00000000-0000-0000-0000-000000000017','10–15 min','{"type":"simple","attribute":"time_available","op":"eq","value":"10_15"}',10,'true',NULL);
-- 25 → OFFER 16 FALSE (20–30 / 45+ min)
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority, source_handle, target_handle)
VALUES ('00000000-0000-0000-0000-000000000025','00000000-0000-0000-0000-000000000016','20–30 / 45+ min',NULL,0,'false',NULL);

-- 26 → OFFER 16 TRUE (no injuries)
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority, source_handle, target_handle)
VALUES ('00000000-0000-0000-0000-000000000026','00000000-0000-0000-0000-000000000016','no injuries','{"type":"simple","attribute":"injuries","op":"eq","value":"none"}',10,'true',NULL);
-- 26 → OFFER 19 FALSE (has injuries)
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority, source_handle, target_handle)
VALUES ('00000000-0000-0000-0000-000000000026','00000000-0000-0000-0000-000000000019','has injuries',NULL,0,'false',NULL);

-- 27 → 28 TRUE (strength)
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority, source_handle, target_handle)
VALUES ('00000000-0000-0000-0000-000000000027','00000000-0000-0000-0000-000000000028','strength','{"type":"simple","attribute":"goal","op":"eq","value":"strength"}',10,'true',NULL);
-- 27 → 29 FALSE (fallback)
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority, source_handle, target_handle)
VALUES ('00000000-0000-0000-0000-000000000027','00000000-0000-0000-0000-000000000029',NULL,NULL,0,'false',NULL);

-- 28 → OFFER 18 TRUE (no injuries)
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority, source_handle, target_handle)
VALUES ('00000000-0000-0000-0000-000000000028','00000000-0000-0000-0000-000000000018','no injuries','{"type":"simple","attribute":"injuries","op":"eq","value":"none"}',10,'true',NULL);
-- 28 → OFFER 19 FALSE (has injuries)
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority, source_handle, target_handle)
VALUES ('00000000-0000-0000-0000-000000000028','00000000-0000-0000-0000-000000000019','has injuries',NULL,0,'false',NULL);

-- 29 → OFFER 20 TRUE (endurance)
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority, source_handle, target_handle)
VALUES ('00000000-0000-0000-0000-000000000029','00000000-0000-0000-0000-000000000020','endurance','{"type":"simple","attribute":"goal","op":"eq","value":"endurance"}',10,'true',NULL);
-- 29 → 30 FALSE (fallback)
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority, source_handle, target_handle)
VALUES ('00000000-0000-0000-0000-000000000029','00000000-0000-0000-0000-000000000030',NULL,NULL,0,'false',NULL);

-- 30 → OFFER 21 TRUE (flexibility)
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority, source_handle, target_handle)
VALUES ('00000000-0000-0000-0000-000000000030','00000000-0000-0000-0000-000000000021','flexibility','{"type":"simple","attribute":"goal","op":"eq","value":"flexibility"}',10,'true',NULL);
-- 30 → OFFER 22 FALSE (stress_relief / other)
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority, source_handle, target_handle)
VALUES ('00000000-0000-0000-0000-000000000030','00000000-0000-0000-0000-000000000022','stress / other',NULL,0,'false',NULL);

-- OFFER nodes 16–22 are terminal (no outgoing edges) —
-- when reached, the session is marked complete and the
-- offer is resolved from the offers table by the backend.


-- ---- OFFERS TABLE ------------------------------------------

-- 1. Weight Loss Starter
INSERT INTO offers (id, name, slug, description, digital_plan, physical_kit, why_text, cta_text, conditions, priority, is_addon)
VALUES (
  '10000000-0000-0000-0000-000000000001',
  'Weight Loss Starter',
  'weight-loss-starter',
  '4-week home fat-burn program — 20–30 min daily sessions, no equipment needed',
  'Structured 4-week progressive plan: cardio intervals + bodyweight circuits. Daily 20–30 min sessions. Includes a nutrition guidance sheet and weekly progress tracker.',
  'Home Fat-Burn Kit: resistance bands, jump rope, shaker bottle, electrolytes + healthy snack',
  'Based on your goal to lose weight at home with 20–30 minutes daily, this plan delivers exactly the right intensity to see real results without overcommitting.',
  'Get My Weight Loss Plan',
  '{"type":"compound","operator":"AND","conditions":[
    {"type":"simple","attribute":"goal","op":"eq","value":"weight_loss"},
    {"type":"simple","attribute":"context","op":"eq","value":"home"},
    {"type":"simple","attribute":"time_available","op":"in","value":["20_30","45_plus"]}
  ]}',
  100, FALSE
);

-- 2. Lean Strength Builder
INSERT INTO offers (id, name, slug, description, digital_plan, physical_kit, why_text, cta_text, conditions, priority, is_addon)
VALUES (
  '10000000-0000-0000-0000-000000000002',
  'Lean Strength Builder',
  'lean-strength-builder',
  'Progressive gym strength program — 6 weeks, compound lifts + hypertrophy work',
  'Periodized 6-week strength program: compound lifts + hypertrophy work. 3–4 sessions/week with progressive overload tracking. Includes a printable workout log and deload guidance.',
  'Gym Support Kit: wrist wraps/straps, mini loop band, compact towel, electrolytes/protein snack',
  'With gym access and no injuries holding you back, you''re in the perfect position to build serious strength with a smart progressive program.',
  'Build My Strength Plan',
  '{"type":"compound","operator":"AND","conditions":[
    {"type":"simple","attribute":"goal","op":"eq","value":"strength"},
    {"type":"simple","attribute":"context","op":"eq","value":"gym"},
    {"type":"simple","attribute":"injuries","op":"eq","value":"none"}
  ]}',
  100, FALSE
);

-- 3. Low-Impact Fat Burn
INSERT INTO offers (id, name, slug, description, digital_plan, physical_kit, why_text, cta_text, conditions, priority, is_addon)
VALUES (
  '10000000-0000-0000-0000-000000000003',
  'Low-Impact Fat Burn',
  'low-impact-fat-burn',
  'Joint-friendly strength and fat-burn program — safe for knees, back, and shoulders',
  '5-week low-impact program: resistance band work, modified exercises, and swimming-inspired movements. Protects your joints while still delivering measurable results.',
  'Joint-Friendly Kit: knee sleeve/brace, massage ball, mini loop bands, cooling patch/recovery gel',
  'Given your physical limitations, we''ve designed a plan that protects your joints while still helping you reach your goals safely and effectively.',
  'Start My Joint-Safe Plan',
  '{"type":"compound","operator":"AND","conditions":[
    {"type":"simple","attribute":"goal","op":"in","value":["strength","weight_loss"]},
    {"type":"simple","attribute":"context","op":"eq","value":"gym"},
    {"type":"simple","attribute":"injuries","op":"in","value":["knee","back","shoulder"]}
  ]}',
  100, FALSE
);

-- 4. Run Your First 5K
INSERT INTO offers (id, name, slug, description, digital_plan, physical_kit, why_text, cta_text, conditions, priority, is_addon)
VALUES (
  '10000000-0000-0000-0000-000000000004',
  'Run Your First 5K',
  'run-first-5k',
  '8-week outdoor Couch-to-5K running program — 3 sessions/week',
  '8-week Couch-to-5K: 3 sessions/week with walk-run intervals. GPS route suggestions, pacing guide, and post-run recovery protocols included.',
  'Runner Starter Kit: electrolytes, reflective armband/safety light, blister prevention kit, running belt',
  'Your outdoor preference and endurance goal make you the perfect candidate for our 5K program.',
  'Start My 5K Journey',
  '{"type":"compound","operator":"AND","conditions":[
    {"type":"simple","attribute":"goal","op":"eq","value":"endurance"},
    {"type":"simple","attribute":"context","op":"eq","value":"outdoor"}
  ]}',
  100, FALSE
);

-- 5. Yoga & Mobility
INSERT INTO offers (id, name, slug, description, digital_plan, physical_kit, why_text, cta_text, conditions, priority, is_addon)
VALUES (
  '10000000-0000-0000-0000-000000000005',
  'Yoga & Mobility Program',
  'yoga-mobility',
  'Daily 10–25 min yoga and mobility sessions — flexibility, posture, and pain relief',
  '6-week progressive yoga + mobility program: morning flows, deep stretching sessions, and posture correction routines. Adapts to all levels.',
  'Mobility Kit: travel yoga mat or yoga strap, massage ball, mini foam roller',
  'Flexibility training is one of the most underrated investments in your body. This program will have you moving pain-free within weeks.',
  'Start My Flexibility Journey',
  '{"type":"simple","attribute":"goal","op":"eq","value":"flexibility"}',
  100, FALSE
);

-- 6. Stress Reset Program
INSERT INTO offers (id, name, slug, description, digital_plan, physical_kit, why_text, cta_text, conditions, priority, is_addon)
VALUES (
  '10000000-0000-0000-0000-000000000006',
  'Stress Reset Program',
  'stress-reset',
  '4-week mental reset — breathwork, meditation, and anti-stress daily routines',
  '4-week stress reset: daily 10-min breathwork sessions, guided meditations, sleep optimization routines, and mood-tracking micro-habits.',
  'Calm-Now Kit: eye mask, aroma roll-on/mini candle, herbal tea sticks, stress ball/fidget, quick reset card',
  'Chronic stress is the hidden blocker of every wellness goal. This program gives you science-backed tools to reset your nervous system.',
  'Reset My Stress Today',
  '{"type":"simple","attribute":"goal","op":"eq","value":"stress_relief"}',
  100, FALSE
);

-- 7. Quick Fit Micro-Workouts
INSERT INTO offers (id, name, slug, description, digital_plan, physical_kit, why_text, cta_text, conditions, priority, is_addon)
VALUES (
  '10000000-0000-0000-0000-000000000007',
  'Quick Fit Micro-Workouts',
  'quick-fit-micro',
  '10–15 min daily HIIT micro-workouts — proven fat loss for busy people',
  '30-day micro-workout challenge: science-backed HIIT circuits that fit in 10–15 minutes. Includes a daily progress calendar.',
  'Micro-Workout Kit: slider discs, mini loop bands, shaker/water bottle, mini routine card',
  'With only 10–15 minutes a day, you can still achieve real fat loss results. Your plan is designed to make every single minute count.',
  'Start My Quick Fit Plan',
  '{"type":"compound","operator":"AND","conditions":[
    {"type":"simple","attribute":"goal","op":"eq","value":"weight_loss"},
    {"type":"simple","attribute":"context","op":"eq","value":"home"},
    {"type":"simple","attribute":"time_available","op":"eq","value":"10_15"}
  ]}',
  110, FALSE
);

-- Stress Reset Add-on (appended to any primary offer when stress is high)
INSERT INTO offers (id, name, slug, description, digital_plan, physical_kit, why_text, cta_text, conditions, priority, is_addon)
VALUES (
  '10000000-0000-0000-0000-000000000016',
  'Stress Reset Add-on',
  'stress-reset-addon',
  'Stress management module — complements any primary wellness program',
  'Bonus 2-week stress reduction module: daily 5-min breathwork and wind-down routines integrated into your main plan.',
  'Calm-Now Kit: eye mask, aroma roll-on/mini candle, herbal tea sticks, stress ball',
  'We noticed you''re dealing with high stress. We''ve added our Stress Reset module — managing stress is the #1 multiplier for any fitness goal.',
  'Add Stress Relief Module',
  '{"type":"simple","attribute":"stress_level","op":"eq","value":"high"}',
  50, TRUE
);
