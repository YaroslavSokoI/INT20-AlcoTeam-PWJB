-- ============================================================
-- SEED v4: BetterMe full wellness quiz DAG + offer catalog
-- Uses split tables: nodes (base) + type-specific tables
-- ============================================================

-- ---- QUESTION NODES ----------------------------------------

-- 1. Main goal (START)
INSERT INTO nodes (id, type, pos_x, pos_y, is_start)
VALUES ('00000000-0000-0000-0000-000000000001','question',0,0,TRUE);
INSERT INTO question_nodes (node_id, title, question_type, options, attribute_key)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'What is your main wellness goal?',
  'single_choice',
  '[
    {"value":"weight_loss",  "label":"Lose Weight",    "icon":"🔥"},
    {"value":"strength",     "label":"Build Strength", "icon":"💪"},
    {"value":"flexibility",  "label":"Get Flexible",   "icon":"🧘"},
    {"value":"stress_relief","label":"Reduce Stress",  "icon":"🌿"},
    {"value":"endurance",    "label":"Boost Endurance","icon":"🏃"}
  ]',
  'goal'
);

-- 2. Fitness level
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000002','question',0,200);
INSERT INTO question_nodes (node_id, title, question_type, options, attribute_key)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'How would you describe your current fitness level?',
  'single_choice',
  '[
    {"value":"beginner",    "label":"Beginner — just starting out",        "icon":"🌱"},
    {"value":"intermediate","label":"Intermediate — work out occasionally","icon":"⚡"},
    {"value":"advanced",    "label":"Advanced — train regularly",          "icon":"🚀"}
  ]',
  'level'
);

-- 3. Age range
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000003','question',0,400);
INSERT INTO question_nodes (node_id, title, question_type, options, attribute_key)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'What is your age range?',
  'single_choice',
  '[
    {"value":"under_25","label":"Under 25","icon":"🌱"},
    {"value":"25_35",   "label":"25–35",   "icon":"⚡"},
    {"value":"36_50",   "label":"36–50",   "icon":"🎯"},
    {"value":"over_50", "label":"50+",     "icon":"🌟"}
  ]',
  'age'
);

-- 4. Gender
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000004','question',0,600);
INSERT INTO question_nodes (node_id, title, question_type, options, attribute_key)
VALUES (
  '00000000-0000-0000-0000-000000000004',
  'What is your gender?',
  'single_choice',
  '[
    {"value":"male",             "label":"Male",              "icon":"👨"},
    {"value":"female",           "label":"Female",            "icon":"👩"},
    {"value":"non_binary",       "label":"Non-binary",        "icon":"🧑"},
    {"value":"prefer_not_to_say","label":"Prefer not to say", "icon":"🔒"}
  ]',
  'gender'
);

-- 5. Workout context / location
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000005','question',0,800);
INSERT INTO question_nodes (node_id, title, question_type, options, attribute_key)
VALUES (
  '00000000-0000-0000-0000-000000000005',
  'Where do you prefer to work out?',
  'single_choice',
  '[
    {"value":"home",   "label":"At Home",   "icon":"🏠"},
    {"value":"gym",    "label":"At the Gym","icon":"🏋️"},
    {"value":"outdoor","label":"Outdoors",  "icon":"🌳"}
  ]',
  'context'
);

-- 6a. Time available (branch: weight_loss + home)
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000006','question',-500,1050);
INSERT INTO question_nodes (node_id, title, question_type, options, attribute_key)
VALUES (
  '00000000-0000-0000-0000-000000000006',
  'How much time can you dedicate to training each day?',
  'single_choice',
  '[
    {"value":"10_15",  "label":"10–15 minutes","icon":"⚡"},
    {"value":"20_30",  "label":"20–30 minutes","icon":"🕐"},
    {"value":"45_plus","label":"45+ minutes",  "icon":"💥"}
  ]',
  'time_available'
);

-- 6b. Injuries / limitations (branch: strength or weight_loss + gym)
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000007','question',0,1050);
INSERT INTO question_nodes (node_id, title, question_type, options, attribute_key)
VALUES (
  '00000000-0000-0000-0000-000000000007',
  'Do you have any injuries or physical limitations?',
  'single_choice',
  '[
    {"value":"none",    "label":"No injuries",         "icon":"✅"},
    {"value":"knee",    "label":"Knee issues",         "icon":"🦵"},
    {"value":"back",    "label":"Back / spine issues", "icon":"🔙"},
    {"value":"shoulder","label":"Shoulder issues",     "icon":"💪"}
  ]',
  'injuries'
);

-- 6c. Running experience (branch: endurance + outdoor)
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000008','question',500,1050);
INSERT INTO question_nodes (node_id, title, question_type, options, attribute_key)
VALUES (
  '00000000-0000-0000-0000-000000000008',
  'What''s your running experience?',
  'single_choice',
  '[
    {"value":"never",     "label":"Never run before", "icon":"🐢"},
    {"value":"occasional","label":"Run occasionally", "icon":"🚶"},
    {"value":"regular",   "label":"Run regularly",    "icon":"🏃"}
  ]',
  'run_level'
);

-- 6d. Flexibility format preference (branch: flexibility, after info)
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000010','question',-1000,1250);
INSERT INTO question_nodes (node_id, title, question_type, options, attribute_key)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  'What type of flexibility training appeals to you?',
  'single_choice',
  '[
    {"value":"yoga",      "label":"Yoga flows",                "icon":"🧘"},
    {"value":"stretching","label":"Deep stretching / mobility","icon":"🤸"},
    {"value":"pilates",   "label":"Pilates",                   "icon":"🏋️"}
  ]',
  'flex_pref'
);

-- 7. Main barrier (universal convergence)
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000011','question',0,1450);
INSERT INTO question_nodes (node_id, title, question_type, options, attribute_key)
VALUES (
  '00000000-0000-0000-0000-000000000011',
  'What''s the biggest thing getting in the way of your wellness goals?',
  'single_choice',
  '[
    {"value":"time_lack",     "label":"Not enough time",                        "icon":"⏰"},
    {"value":"low_motivation","label":"Lack of motivation or discipline",        "icon":"😔"},
    {"value":"stress_fatigue","label":"Stress and fatigue",                      "icon":"😰"},
    {"value":"no_guidance",   "label":"No guidance — don''t know where to start","icon":"🤷"},
    {"value":"nothing",       "label":"Nothing — I''m ready to go!",            "icon":"🚀"}
  ]',
  'barrier'
);

-- 8. Stress level (universal)
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000012','question',0,1650);
INSERT INTO question_nodes (node_id, title, question_type, options, attribute_key)
VALUES (
  '00000000-0000-0000-0000-000000000012',
  'How would you rate your current stress level?',
  'single_choice',
  '[
    {"value":"low",   "label":"Low — I feel calm and balanced",  "icon":"😊"},
    {"value":"medium","label":"Medium — some tension day-to-day","icon":"😐"},
    {"value":"high",  "label":"High — I often feel overwhelmed", "icon":"😰"}
  ]',
  'stress_level'
);

-- 9. Sleep quality (universal)
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000013','question',0,1850);
INSERT INTO question_nodes (node_id, title, question_type, options, attribute_key)
VALUES (
  '00000000-0000-0000-0000-000000000013',
  'How is your sleep quality lately?',
  'single_choice',
  '[
    {"value":"good","label":"Good — 7–8h, I wake up rested",        "icon":"😴"},
    {"value":"fair","label":"Fair — inconsistent, could be better", "icon":"🌙"},
    {"value":"poor","label":"Poor — I often wake up tired",         "icon":"😵"}
  ]',
  'sleep_quality'
);

-- 10. Energy level (universal)
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000014','question',0,2050);
INSERT INTO question_nodes (node_id, title, question_type, options, attribute_key)
VALUES (
  '00000000-0000-0000-0000-000000000014',
  'How would you describe your typical daily energy levels?',
  'single_choice',
  '[
    {"value":"high",  "label":"High — energized most of the day","icon":"⚡"},
    {"value":"medium","label":"Medium — ups and downs",          "icon":"🔋"},
    {"value":"low",   "label":"Low — I often feel drained",      "icon":"🪫"}
  ]',
  'energy_level'
);

-- ---- INFO NODES --------------------------------------------

-- INFO: Flexibility motivation (branch: flexibility goal)
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000009','info',-1000,1050);
INSERT INTO info_nodes (node_id, title, content)
VALUES (
  '00000000-0000-0000-0000-000000000009',
  'Flexibility is the foundation of a healthy body 🧘',
  'People who improve mobility report 40% less pain and significantly better posture within just 4 weeks. Small, consistent daily sessions make a huge difference.'
);

-- 15. INFO: Plan ready (transition — routes to offer nodes)
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000015','info',0,2250);
INSERT INTO info_nodes (node_id, title, content)
VALUES (
  '00000000-0000-0000-0000-000000000015',
  'Your personalized wellness plan is ready! 🎉',
  'Based on your answers, we''ve crafted a program that matches your lifestyle, goals, schedule, and current wellbeing. Thousands of people with your exact profile have already transformed their health.'
);

-- ---- OFFER NODES -------------------------------------------

-- 16. OFFER: Weight Loss Starter (home, 20-30+ min)
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000016','offer',-900,2500);
INSERT INTO offer_nodes (node_id, title, description, cta_text, slug, digital_plan, physical_kit, why_text, conditions, priority)
VALUES (
  '00000000-0000-0000-0000-000000000016',
  'Weight Loss Starter',
  '4-week home fat-burn program — 20–30 min daily sessions, no equipment needed',
  'Get My Weight Loss Plan',
  'weight-loss-starter',
  'Structured 4-week progressive plan: cardio intervals + bodyweight circuits. Daily 20–30 min sessions. Includes a nutrition guidance sheet and weekly progress tracker.',
  'Home Fat-Burn Kit: resistance bands, jump rope, shaker bottle, electrolytes + healthy snack',
  'Based on your goal to lose weight at home with 20–30 minutes daily, this plan delivers exactly the right intensity to see real results without overcommitting.',
  '{"type":"compound","operator":"AND","conditions":[
    {"type":"simple","attribute":"goal","op":"eq","value":"weight_loss"},
    {"type":"simple","attribute":"context","op":"eq","value":"home"},
    {"type":"simple","attribute":"time_available","op":"in","value":["20_30","45_plus"]}
  ]}',
  100
);

-- 17. OFFER: Quick Fit Micro-Workouts (home, 10-15 min)
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000017','offer',-600,2500);
INSERT INTO offer_nodes (node_id, title, description, cta_text, slug, digital_plan, physical_kit, why_text, conditions, priority)
VALUES (
  '00000000-0000-0000-0000-000000000017',
  'Quick Fit Micro-Workouts',
  '10–15 min daily HIIT micro-workouts — proven fat loss for busy people',
  'Start My Quick Fit Plan',
  'quick-fit-micro',
  '30-day micro-workout challenge: science-backed HIIT circuits that fit in 10–15 minutes. Includes a daily progress calendar.',
  'Micro-Workout Kit: slider discs, mini loop bands, shaker/water bottle, mini routine card',
  'With only 10–15 minutes a day, you can still achieve real fat loss results. Your plan is designed to make every single minute count.',
  '{"type":"compound","operator":"AND","conditions":[
    {"type":"simple","attribute":"goal","op":"eq","value":"weight_loss"},
    {"type":"simple","attribute":"context","op":"eq","value":"home"},
    {"type":"simple","attribute":"time_available","op":"eq","value":"10_15"}
  ]}',
  110
);

-- 18. OFFER: Lean Strength Builder (gym, no injuries)
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000018','offer',-300,2500);
INSERT INTO offer_nodes (node_id, title, description, cta_text, slug, digital_plan, physical_kit, why_text, conditions, priority)
VALUES (
  '00000000-0000-0000-0000-000000000018',
  'Lean Strength Builder',
  'Progressive gym strength program — 6 weeks, compound lifts + hypertrophy work',
  'Build My Strength Plan',
  'lean-strength-builder',
  'Periodized 6-week strength program: compound lifts + hypertrophy work. 3–4 sessions/week with progressive overload tracking. Includes a printable workout log and deload guidance.',
  'Gym Support Kit: wrist wraps/straps, mini loop band, compact towel, electrolytes/protein snack',
  'With gym access and no injuries holding you back, you''re in the perfect position to build serious strength with a smart progressive program.',
  '{"type":"compound","operator":"AND","conditions":[
    {"type":"simple","attribute":"goal","op":"eq","value":"strength"},
    {"type":"simple","attribute":"context","op":"eq","value":"gym"},
    {"type":"simple","attribute":"injuries","op":"eq","value":"none"}
  ]}',
  100
);

-- 19. OFFER: Low-Impact Fat Burn (gym, with injuries)
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000019','offer',0,2500);
INSERT INTO offer_nodes (node_id, title, description, cta_text, slug, digital_plan, physical_kit, why_text, conditions, priority)
VALUES (
  '00000000-0000-0000-0000-000000000019',
  'Low-Impact Fat Burn',
  'Joint-friendly strength and fat-burn program — safe for knees, back, and shoulders',
  'Start My Joint-Safe Plan',
  'low-impact-fat-burn',
  '5-week low-impact program: resistance band work, modified exercises, and swimming-inspired movements. Protects your joints while still delivering measurable results.',
  'Joint-Friendly Kit: knee sleeve/brace, massage ball, mini loop bands, cooling patch/recovery gel',
  'Given your physical limitations, we''ve designed a plan that protects your joints while still helping you reach your goals safely and effectively.',
  '{"type":"compound","operator":"AND","conditions":[
    {"type":"simple","attribute":"goal","op":"in","value":["strength","weight_loss"]},
    {"type":"simple","attribute":"context","op":"eq","value":"gym"},
    {"type":"simple","attribute":"injuries","op":"in","value":["knee","back","shoulder"]}
  ]}',
  100
);

-- 20. OFFER: Run Your First 5K (outdoor)
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000020','offer',300,2500);
INSERT INTO offer_nodes (node_id, title, description, cta_text, slug, digital_plan, physical_kit, why_text, conditions, priority)
VALUES (
  '00000000-0000-0000-0000-000000000020',
  'Run Your First 5K',
  '8-week outdoor Couch-to-5K running program — 3 sessions/week',
  'Start My 5K Journey',
  'run-first-5k',
  '8-week Couch-to-5K: 3 sessions/week with walk-run intervals. GPS route suggestions, pacing guide, and post-run recovery protocols included.',
  'Runner Starter Kit: electrolytes, reflective armband/safety light, blister prevention kit, running belt',
  'Your outdoor preference and endurance goal make you the perfect candidate for our 5K program.',
  '{"type":"compound","operator":"AND","conditions":[
    {"type":"simple","attribute":"goal","op":"eq","value":"endurance"},
    {"type":"simple","attribute":"context","op":"eq","value":"outdoor"}
  ]}',
  100
);

-- 21. OFFER: Yoga & Mobility (flexibility)
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000021','offer',600,2500);
INSERT INTO offer_nodes (node_id, title, description, cta_text, slug, digital_plan, physical_kit, why_text, conditions, priority)
VALUES (
  '00000000-0000-0000-0000-000000000021',
  'Yoga & Mobility Program',
  'Daily 10–25 min yoga and mobility sessions — flexibility, posture, and pain relief',
  'Start My Flexibility Journey',
  'yoga-mobility',
  '6-week progressive yoga + mobility program: morning flows, deep stretching sessions, and posture correction routines. Adapts to all levels.',
  'Mobility Kit: travel yoga mat or yoga strap, massage ball, mini foam roller',
  'Flexibility training is one of the most underrated investments in your body. This program will have you moving pain-free within weeks.',
  '{"type":"simple","attribute":"goal","op":"eq","value":"flexibility"}',
  100
);

-- 22. OFFER: Stress Reset Program (stress_relief)
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000022','offer',900,2500);
INSERT INTO offer_nodes (node_id, title, description, cta_text, slug, digital_plan, physical_kit, why_text, conditions, priority)
VALUES (
  '00000000-0000-0000-0000-000000000022',
  'Stress Reset Program',
  '4-week mental reset — breathwork, meditation, and anti-stress daily routines',
  'Reset My Stress Today',
  'stress-reset',
  '4-week stress reset: daily 10-min breathwork sessions, guided meditations, sleep optimization routines, and mood-tracking micro-habits.',
  'Calm-Now Kit: eye mask, aroma roll-on/mini candle, herbal tea sticks, stress ball/fidget, quick reset card',
  'Chronic stress is the hidden blocker of every wellness goal. This program gives you science-backed tools to reset your nervous system.',
  '{"type":"simple","attribute":"goal","op":"eq","value":"stress_relief"}',
  100
);

-- ---- CONDITIONAL NODES -------------------------------------

-- Node 23: Is goal weight_loss?
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000023','conditional',0,2500);
INSERT INTO conditional_nodes (node_id, title)
VALUES ('00000000-0000-0000-0000-000000000023','goal = weight_loss?');

-- Node 24: Is context home? (within weight_loss)
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000024','conditional',-700,2700);
INSERT INTO conditional_nodes (node_id, title)
VALUES ('00000000-0000-0000-0000-000000000024','context = home?');

-- Node 25: Is time 10–15 min? (weight_loss + home)
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000025','conditional',-1000,2900);
INSERT INTO conditional_nodes (node_id, title)
VALUES ('00000000-0000-0000-0000-000000000025','time = 10–15 min?');

-- Node 26: No injuries? (weight_loss + gym)
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000026','conditional',-400,2900);
INSERT INTO conditional_nodes (node_id, title)
VALUES ('00000000-0000-0000-0000-000000000026','injuries = none?');

-- Node 27: Is goal strength?
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000027','conditional',700,2700);
INSERT INTO conditional_nodes (node_id, title)
VALUES ('00000000-0000-0000-0000-000000000027','goal = strength?');

-- Node 28: No injuries? (strength)
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000028','conditional',400,2900);
INSERT INTO conditional_nodes (node_id, title)
VALUES ('00000000-0000-0000-0000-000000000028','injuries = none?');

-- Node 29: Is goal endurance?
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000029','conditional',1000,2900);
INSERT INTO conditional_nodes (node_id, title)
VALUES ('00000000-0000-0000-0000-000000000029','goal = endurance?');

-- Node 30: Is goal flexibility?
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000030','conditional',1300,3100);
INSERT INTO conditional_nodes (node_id, title)
VALUES ('00000000-0000-0000-0000-000000000030','goal = flexibility?');


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

-- Q5 → Q7: default fallback
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000011',NULL,NULL,0);

-- Branch exits → Q7 (universal convergence)
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000011',NULL,NULL,0);
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000011',NULL,NULL,0);
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000011',NULL,NULL,0);

-- Flexibility info → Q6d, Q6d → Q7
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000009','00000000-0000-0000-0000-000000000010',NULL,NULL,0);
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

-- 15 → 23 (single unconditional entry to decision tree)
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


-- All offer data (digital_plan, physical_kit, why_text, conditions, priority) is now
-- stored in offer_nodes above. The separate offers table has been removed.
