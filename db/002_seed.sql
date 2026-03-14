-- ============================================================
-- SEED: BetterMe quiz DAG + offer catalog
-- ============================================================

-- ---- NODES -------------------------------------------------

-- Q1: Main goal (START)
INSERT INTO nodes (id, type, title, description, question_type, options, attribute_key, pos_x, pos_y, is_start)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'question',
  'What is your main wellness goal?',
  'We''ll build a program tailored specifically to what you want to achieve.',
  'single_choice',
  '[
    {"value":"weight_loss",  "label":"Lose Weight",      "icon":"🔥"},
    {"value":"strength",     "label":"Build Strength",   "icon":"💪"},
    {"value":"flexibility",  "label":"Get Flexible",     "icon":"🧘"},
    {"value":"stress_relief","label":"Reduce Stress",    "icon":"🌿"},
    {"value":"endurance",    "label":"Boost Endurance",  "icon":"🏃"}
  ]',
  'goal',
  100, 100,
  TRUE
);

-- Q2: Workout location
INSERT INTO nodes (id, type, title, description, question_type, options, attribute_key, pos_x, pos_y)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'question',
  'Where do you prefer to work out?',
  'Your environment shapes your program.',
  'single_choice',
  '[
    {"value":"home",   "label":"At Home",   "icon":"🏠"},
    {"value":"gym",    "label":"At the Gym","icon":"🏋️"},
    {"value":"outdoor","label":"Outdoors",  "icon":"🌳"}
  ]',
  'context',
  100, 250
);

-- Q3: Fitness level
INSERT INTO nodes (id, type, title, description, question_type, options, attribute_key, pos_x, pos_y)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'question',
  'How would you describe your current fitness level?',
  'Be honest — there are no wrong answers!',
  'single_choice',
  '[
    {"value":"beginner",    "label":"Beginner — just starting out",   "icon":"🌱"},
    {"value":"intermediate","label":"Intermediate — workout sometimes","icon":"⚡"},
    {"value":"advanced",    "label":"Advanced — train regularly",      "icon":"🚀"}
  ]',
  'level',
  100, 400
);

-- Q4a: Time available (branch: weight_loss + home)
INSERT INTO nodes (id, type, title, description, question_type, options, attribute_key, pos_x, pos_y)
VALUES (
  '00000000-0000-0000-0000-000000000004',
  'question',
  'How much time can you dedicate per day?',
  'We''ll match the intensity to your schedule.',
  'single_choice',
  '[
    {"value":"10-15","label":"10–15 minutes","icon":"⚡"},
    {"value":"20-30","label":"20–30 minutes","icon":"🕐"},
    {"value":"45+",  "label":"45+ minutes",  "icon":"💥"}
  ]',
  'time_available',
  -200, 580
);

-- Q4b: Injuries (branch: strength + gym)
INSERT INTO nodes (id, type, title, description, question_type, options, attribute_key, pos_x, pos_y)
VALUES (
  '00000000-0000-0000-0000-000000000005',
  'question',
  'Do you have any injuries or physical limitations?',
  'We want to make sure your plan is safe and effective.',
  'single_choice',
  '[
    {"value":"none",      "label":"No injuries",          "icon":"✅"},
    {"value":"knee",      "label":"Knee issues",          "icon":"🦵"},
    {"value":"back",      "label":"Back/spine issues",    "icon":"🔙"},
    {"value":"shoulder",  "label":"Shoulder issues",      "icon":"💪"}
  ]',
  'injuries',
  100, 580
);

-- Q4c: Running experience (branch: endurance + outdoor)
INSERT INTO nodes (id, type, title, description, question_type, options, attribute_key, pos_x, pos_y)
VALUES (
  '00000000-0000-0000-0000-000000000006',
  'question',
  'What''s your running experience?',
  'We''ll calibrate the right starting point for your 5K journey.',
  'single_choice',
  '[
    {"value":"never",     "label":"Never run before",       "icon":"🐢"},
    {"value":"occasional","label":"Run occasionally",       "icon":"🚶"},
    {"value":"regular",   "label":"Run regularly",          "icon":"🏃"}
  ]',
  'run_level',
  400, 580
);

-- INFO: Motivational page (branch: flexibility)
INSERT INTO nodes (id, type, title, description, question_type, options, attribute_key, pos_x, pos_y)
VALUES (
  '00000000-0000-0000-0000-000000000007',
  'info',
  'Flexibility is the foundation of a healthy body 🧘',
  'People who improve mobility report 40% less pain and significantly better posture within 4 weeks. You''re making a great choice.',
  NULL, NULL, NULL,
  -400, 580
);

-- Q Universal: Stress level interceptor (all paths converge here before end)
INSERT INTO nodes (id, type, title, description, question_type, options, attribute_key, pos_x, pos_y)
VALUES (
  '00000000-0000-0000-0000-000000000008',
  'question',
  'How would you rate your current stress level?',
  'Stress management is a key part of any wellness journey.',
  'single_choice',
  '[
    {"value":"low",   "label":"Low — I feel calm",       "icon":"😊"},
    {"value":"medium","label":"Medium — some tension",   "icon":"😐"},
    {"value":"high",  "label":"High — I feel overwhelmed","icon":"😰"}
  ]',
  'stress_level',
  100, 750
);

-- Q Universal: Sleep quality
INSERT INTO nodes (id, type, title, description, question_type, options, attribute_key, pos_x, pos_y)
VALUES (
  '00000000-0000-0000-0000-000000000009',
  'question',
  'How is your sleep quality lately?',
  'Sleep recovery directly impacts your fitness results.',
  'single_choice',
  '[
    {"value":"good",  "label":"Good — 7-8h, feel rested","icon":"😴"},
    {"value":"fair",  "label":"Fair — could be better",  "icon":"🌙"},
    {"value":"poor",  "label":"Poor — often exhausted",  "icon":"😵"}
  ]',
  'sleep_quality',
  100, 900
);


-- ---- EDGES -------------------------------------------------

-- Q1 (goal) → Q2 (context) — unconditional
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', NULL, NULL, 0);

-- Q2 (context) → Q3 (level) — unconditional
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', NULL, NULL, 0);

-- Q3 → Q4a: weight_loss + home
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000004',
  'Weight loss at home',
  '{"type":"compound","operator":"AND","conditions":[
    {"type":"simple","attribute":"goal","op":"eq","value":"weight_loss"},
    {"type":"simple","attribute":"context","op":"eq","value":"home"}
  ]}',
  10
);

-- Q3 → Q4b: strength + gym
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000005',
  'Strength at gym',
  '{"type":"compound","operator":"AND","conditions":[
    {"type":"simple","attribute":"goal","op":"eq","value":"strength"},
    {"type":"simple","attribute":"context","op":"eq","value":"gym"}
  ]}',
  10
);

-- Q3 → Q4c: endurance + outdoor
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000006',
  'Endurance outdoors',
  '{"type":"compound","operator":"AND","conditions":[
    {"type":"simple","attribute":"goal","op":"eq","value":"endurance"},
    {"type":"simple","attribute":"context","op":"eq","value":"outdoor"}
  ]}',
  10
);

-- Q3 → INFO flexibility
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000007',
  'Flexibility path',
  '{"type":"simple","attribute":"goal","op":"eq","value":"flexibility"}',
  10
);

-- Q3 → stress interceptor: stress_relief (skip branching)
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000008',
  'Stress relief direct',
  '{"type":"simple","attribute":"goal","op":"eq","value":"stress_relief"}',
  10
);

-- Q3 → stress interceptor: default fallback (weight_loss+gym, strength+home, etc.)
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  '00000000-0000-0000-0000-000000000008',
  'Default path',
  NULL,
  0
);

-- Q4a (time_available) → stress interceptor
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000008', NULL, NULL, 0);

-- Q4b (injuries) → stress interceptor
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000008', NULL, NULL, 0);

-- Q4c (run_level) → stress interceptor
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000008', NULL, NULL, 0);

-- INFO flexibility → stress interceptor
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000008', NULL, NULL, 0);

-- Stress interceptor → sleep quality
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000009', NULL, NULL, 0);

-- Sleep quality → NULL (no outgoing edge = quiz complete)


-- ---- OFFERS ------------------------------------------------

-- Offer 1: Weight Loss Starter (Home, 20-30 min)
INSERT INTO offers (id, name, slug, description, digital_plan, physical_kit, why_text, cta_text, conditions, priority, is_addon)
VALUES (
  '10000000-0000-0000-0000-000000000001',
  'Weight Loss Starter',
  'weight-loss-starter',
  '4-week home fat-burn program with 20–30 min daily sessions',
  'Structured 4-week progressive plan: cardio intervals + bodyweight circuits. No equipment needed. Daily 20–30 min sessions designed to maximize calorie burn at home.',
  'Home Fat-Burn Kit: resistance bands, jump rope, shaker bottle, electrolytes + healthy snack',
  'Based on your goal to lose weight at home with 20–30 minutes available daily, this plan gives you exactly the right intensity to see results without overcommitting.',
  'Get My Weight Loss Plan',
  '{"type":"compound","operator":"AND","conditions":[
    {"type":"simple","attribute":"goal","op":"eq","value":"weight_loss"},
    {"type":"simple","attribute":"context","op":"eq","value":"home"},
    {"type":"simple","attribute":"time_available","op":"in","value":["20-30","45+"]}
  ]}',
  100,
  FALSE
);

-- Offer 2: Lean Strength Builder (Gym, no injuries)
INSERT INTO offers (id, name, slug, description, digital_plan, physical_kit, why_text, cta_text, conditions, priority, is_addon)
VALUES (
  '10000000-0000-0000-0000-000000000002',
  'Lean Strength Builder',
  'lean-strength-builder',
  'Progressive gym strength program with muscle-building focus',
  'Periodized 6-week strength program: compound lifts + hypertrophy work. 3–4 sessions/week. Includes progressive overload tracking.',
  'Gym Support Kit: wrist wraps/straps, mini loop band, compact towel, electrolytes/protein snack',
  'With your gym access and no injuries holding you back, you''re in the perfect position to build serious strength with a smart progressive program.',
  'Build My Strength Plan',
  '{"type":"compound","operator":"AND","conditions":[
    {"type":"simple","attribute":"goal","op":"eq","value":"strength"},
    {"type":"simple","attribute":"context","op":"eq","value":"gym"},
    {"type":"simple","attribute":"injuries","op":"eq","value":"none"}
  ]}',
  100,
  FALSE
);

-- Offer 3: Low-Impact Fat Burn (joint friendly)
INSERT INTO offers (id, name, slug, description, digital_plan, physical_kit, why_text, cta_text, conditions, priority, is_addon)
VALUES (
  '10000000-0000-0000-0000-000000000003',
  'Low-Impact Fat Burn',
  'low-impact-fat-burn',
  'Joint-friendly strength and fat-burn program — safe for knees and back',
  '5-week low-impact program: swimming-inspired movements, resistance band work, and modified exercises that protect your joints while still delivering results.',
  'Joint-Friendly Kit: knee sleeve/brace, massage ball, mini loop bands, cooling patch/recovery gel',
  'Given your joint limitations, we''ve designed a plan that protects your knees and back while still helping you reach your strength goals safely.',
  'Start My Joint-Safe Plan',
  '{"type":"compound","operator":"AND","conditions":[
    {"type":"simple","attribute":"goal","op":"eq","value":"strength"},
    {"type":"simple","attribute":"context","op":"eq","value":"gym"},
    {"type":"simple","attribute":"injuries","op":"in","value":["knee","back","shoulder"]}
  ]}',
  100,
  FALSE
);

-- Offer 4: Run Your First 5K
INSERT INTO offers (id, name, slug, description, digital_plan, physical_kit, why_text, cta_text, conditions, priority, is_addon)
VALUES (
  '10000000-0000-0000-0000-000000000004',
  'Run Your First 5K',
  'run-first-5k',
  '8-week outdoor running program from couch to 5K',
  '8-week Couch-to-5K program: 3 sessions/week with walk-run intervals that progressively build your endurance. GPS route suggestions and pacing guide included.',
  'Runner Starter Kit: electrolytes, reflective armband/safety light, blister prevention kit, running belt',
  'Your outdoor environment and endurance goal make you the perfect candidate for our 5K program. Thousands of beginners have crossed the finish line with this exact plan.',
  'Start My 5K Journey',
  '{"type":"compound","operator":"AND","conditions":[
    {"type":"simple","attribute":"goal","op":"eq","value":"endurance"},
    {"type":"simple","attribute":"context","op":"eq","value":"outdoor"}
  ]}',
  100,
  FALSE
);

-- Offer 5: Yoga & Mobility
INSERT INTO offers (id, name, slug, description, digital_plan, physical_kit, why_text, cta_text, conditions, priority, is_addon)
VALUES (
  '10000000-0000-0000-0000-000000000005',
  'Yoga & Mobility Program',
  'yoga-mobility',
  'Daily 10–25 min yoga and mobility sessions for flexibility and posture',
  '6-week progressive yoga + mobility program: morning flows, deep stretching sessions, and posture correction routines. 10–25 min daily.',
  'Mobility Kit: travel yoga mat or yoga strap, massage ball, mini foam roller',
  'Flexibility training is one of the most underrated investments in your body. This program will have you moving pain-free and feeling lighter within weeks.',
  'Start My Flexibility Journey',
  '{"type":"simple","attribute":"goal","op":"eq","value":"flexibility"}',
  100,
  FALSE
);

-- Offer 6: Stress Reset Program (primary — for stress_relief goal)
INSERT INTO offers (id, name, slug, description, digital_plan, physical_kit, why_text, cta_text, conditions, priority, is_addon)
VALUES (
  '10000000-0000-0000-0000-000000000006',
  'Stress Reset Program',
  'stress-reset',
  'Mental reset + micro-habits: breathing, meditation, and anti-stress routines',
  '4-week stress reset: daily 10-min breathwork sessions, guided meditations, sleep optimization routines, and mood-tracking micro-habits.',
  'Calm-Now Kit: eye mask, aroma roll-on/mini candle, herbal tea sticks, stress ball/fidget, quick reset card',
  'Chronic stress is the hidden blocker of every wellness goal. This program gives you the tools to reset your nervous system and build lasting calm.',
  'Reset My Stress Today',
  '{"type":"simple","attribute":"goal","op":"eq","value":"stress_relief"}',
  100,
  FALSE
);

-- Offer 6 addon: Stress Reset (addon for high stress — added to any primary offer)
INSERT INTO offers (id, name, slug, description, digital_plan, physical_kit, why_text, cta_text, conditions, priority, is_addon)
VALUES (
  '10000000-0000-0000-0000-000000000016',
  'Stress Reset Add-on',
  'stress-reset-addon',
  'Stress management module to complement your main program',
  'Bonus: 2-week stress reduction module included with your plan. Daily 5-min breathwork and wind-down routines.',
  'Calm-Now Kit: eye mask, aroma roll-on/mini candle, herbal tea sticks, stress ball',
  'We noticed you''re dealing with high stress. We''ve added our Stress Reset module to your plan — because managing stress is the #1 multiplier for any fitness goal.',
  'Add Stress Relief Module',
  '{"type":"simple","attribute":"stress_level","op":"eq","value":"high"}',
  50,
  TRUE
);

-- Offer 7: Quick Fit Micro-Workouts (weight_loss + home + 10-15 min)
INSERT INTO offers (id, name, slug, description, digital_plan, physical_kit, why_text, cta_text, conditions, priority, is_addon)
VALUES (
  '10000000-0000-0000-0000-000000000007',
  'Quick Fit Micro-Workouts',
  'quick-fit-micro',
  '10–15 min daily micro-workouts for busy people who want to lose weight at home',
  '30-day micro-workout challenge: science-backed HIIT circuits that fit in 10–15 minutes. Proven to be as effective as 30-min traditional workouts when done consistently.',
  'Micro-Workout Kit: slider discs, mini loop bands, shaker/water bottle, mini routine card',
  'With only 10–15 minutes a day, you can still achieve real fat loss results — science backs this up. Your plan is designed to make every minute count.',
  'Start My Quick Fit Plan',
  '{"type":"compound","operator":"AND","conditions":[
    {"type":"simple","attribute":"goal","op":"eq","value":"weight_loss"},
    {"type":"simple","attribute":"context","op":"eq","value":"home"},
    {"type":"simple","attribute":"time_available","op":"eq","value":"10-15"}
  ]}',
  110,
  FALSE
);
