-- ============================================================
-- SEED v5: Wellness quiz — diverse, branching DAG
--
-- Structure per user path:
--   4 universal start Qs → info tip → 2 goal-specific Qs
--   → 5 universal end Qs → info "plan ready" → conditional tree → offer
--
-- Total unique question nodes: 19  (user sees 11 per path)
-- Branching: after Q4 based on goal; offer tree based on all attributes
-- ============================================================

-- ============================================================
-- PHASE 1: UNIVERSAL START (everyone)
-- ============================================================

-- Q1: Main wellness goal (START)
INSERT INTO nodes (id, type, pos_x, pos_y, is_start)
VALUES ('00000000-0000-0000-0000-000000000001','question',0,0,TRUE);
INSERT INTO question_nodes (node_id, title, question_type, options, attribute_key)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'What is your main wellness goal?',
  'single_choice',
  '[
    {"value":"weight_loss",   "label":"Lose Weight",     "icon":"Scale"},
    {"value":"strength",      "label":"Build Strength",  "icon":"Dumbbell"},
    {"value":"flexibility",   "label":"Get Flexible",    "icon":"PersonStanding"},
    {"value":"stress_relief", "label":"Reduce Stress",   "icon":"Leaf"},
    {"value":"endurance",     "label":"Boost Endurance", "icon":"Footprints"}
  ]',
  'goal'
);

-- Q2: Age range
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000002','question',0,200);
INSERT INTO question_nodes (node_id, title, question_type, options, attribute_key)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'What is your age range?',
  'single_choice',
  '[
    {"value":"under_25", "label":"Under 25", "icon":"Sprout"},
    {"value":"25_35",    "label":"25 to 35",    "icon":"Zap"},
    {"value":"36_50",    "label":"36 to 50",    "icon":"Target"},
    {"value":"over_50",  "label":"50+",      "icon":"Star"}
  ]',
  'age'
);

-- Q3: Gender
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000003','question',0,400);
INSERT INTO question_nodes (node_id, title, question_type, options, attribute_key)
VALUES (
  '00000000-0000-0000-0000-000000000003',
  'What is your gender?',
  'single_choice',
  '[
    {"value":"male",              "label":"Male",              "icon":"User"},
    {"value":"female",            "label":"Female",            "icon":"User"},
    {"value":"non_binary",        "label":"Non-binary",        "icon":"Users"},
    {"value":"prefer_not_to_say", "label":"Prefer not to say", "icon":"Lock"}
  ]',
  'gender'
);

-- Q4: Fitness level
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000004','question',0,600);
INSERT INTO question_nodes (node_id, title, question_type, options, attribute_key)
VALUES (
  '00000000-0000-0000-0000-000000000004',
  'How would you describe your current fitness level?',
  'single_choice',
  '[
    {"value":"beginner",     "label":"Beginner, just starting out",       "icon":"Sprout"},
    {"value":"intermediate", "label":"Intermediate, work out sometimes", "icon":"Zap"},
    {"value":"advanced",     "label":"Advanced, train regularly",         "icon":"Rocket"}
  ]',
  'level'
);

-- ============================================================
-- CONDITIONAL: Branch by goal after Q4
-- ============================================================

INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000040','conditional',0,800);
INSERT INTO conditional_nodes (node_id, title)
VALUES ('00000000-0000-0000-0000-000000000040','Branch by goal');

-- ============================================================
-- GOAL-SPECIFIC INFO NODES (motivational tips)
-- ============================================================

-- INFO: Weight Loss
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000030','info',-800,1000);
INSERT INTO info_nodes (node_id, title, content)
VALUES (
  '00000000-0000-0000-0000-000000000030',
  'Smart weight loss starts with understanding your body',
  'Research shows that people who combine structured exercise with mindful eating lose 2x more weight than those who diet alone. A few more questions will help us build the perfect plan for you.'
);

-- INFO: Strength
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000031','info',-400,1000);
INSERT INTO info_nodes (node_id, title, content)
VALUES (
  '00000000-0000-0000-0000-000000000031',
  'Strength training transforms more than just muscles',
  'Progressive resistance training increases bone density by up to 8% and boosts metabolism for 72 hours after each session. Let''s tailor your program to your equipment and body.'
);

-- INFO: Flexibility
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000032','info',0,1000);
INSERT INTO info_nodes (node_id, title, content)
VALUES (
  '00000000-0000-0000-0000-000000000032',
  'Flexibility is the foundation of a healthy body',
  'People who improve mobility report 40% less pain and significantly better posture within just 4 weeks. Small, consistent sessions make a huge difference.'
);

-- INFO: Stress Relief
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000033','info',400,1000);
INSERT INTO info_nodes (node_id, title, content)
VALUES (
  '00000000-0000-0000-0000-000000000033',
  'Your body keeps the score. Let''s reset it.',
  'Chronic stress raises cortisol levels, disrupting sleep, digestion, and focus. Science-backed techniques like breathwork and movement can lower cortisol by up to 25% in just 2 weeks.'
);

-- INFO: Endurance
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000034','info',800,1000);
INSERT INTO info_nodes (node_id, title, content)
VALUES (
  '00000000-0000-0000-0000-000000000034',
  'Endurance is the ultimate health multiplier',
  'Improving cardiovascular fitness by even 10% reduces all-cause mortality risk by 15%. Whether running, cycling, or swimming, consistency beats intensity.'
);

-- ============================================================
-- PHASE 2: GOAL-SPECIFIC QUESTIONS (2 per branch)
-- ============================================================

-- ---- WEIGHT LOSS BRANCH ----

-- Q5a: Workout location
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000005','question',-800,1200);
INSERT INTO question_nodes (node_id, title, question_type, options, attribute_key)
VALUES (
  '00000000-0000-0000-0000-000000000005',
  'Where do you prefer to work out?',
  'single_choice',
  '[
    {"value":"home",    "label":"At Home",    "icon":"Home"},
    {"value":"gym",     "label":"At the Gym", "icon":"Dumbbell"},
    {"value":"outdoor", "label":"Outdoors",   "icon":"TreePine"}
  ]',
  'context'
);

-- Q6a: Diet habits
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000006','question',-800,1400);
INSERT INTO question_nodes (node_id, title, question_type, options, attribute_key)
VALUES (
  '00000000-0000-0000-0000-000000000006',
  'How would you describe your current eating habits?',
  'single_choice',
  '[
    {"value":"healthy", "label":"Mostly healthy and balanced",           "icon":"Salad"},
    {"value":"mixed",   "label":"Mixed, good days and bad days",        "icon":"Utensils"},
    {"value":"poor",    "label":"Mostly fast food and irregular meals", "icon":"Pizza"}
  ]',
  'diet'
);

-- ---- STRENGTH BRANCH ----

-- Q5b: Equipment access
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000007','question',-400,1200);
INSERT INTO question_nodes (node_id, title, question_type, options, attribute_key)
VALUES (
  '00000000-0000-0000-0000-000000000007',
  'What equipment do you have access to?',
  'single_choice',
  '[
    {"value":"full_gym",    "label":"Full gym with machines and free weights", "icon":"Dumbbell"},
    {"value":"home_basics", "label":"Home basics: dumbbells, bands, etc.",    "icon":"Home"},
    {"value":"none",        "label":"No equipment, bodyweight only",          "icon":"User"}
  ]',
  'equipment'
);

-- Q6b: Injuries
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000008','question',-400,1400);
INSERT INTO question_nodes (node_id, title, question_type, options, attribute_key)
VALUES (
  '00000000-0000-0000-0000-000000000008',
  'Do you have any injuries or physical limitations?',
  'single_choice',
  '[
    {"value":"none",     "label":"No injuries",          "icon":"Check"},
    {"value":"knee",     "label":"Knee issues",          "icon":"AlertCircle"},
    {"value":"back",     "label":"Back / spine issues",  "icon":"AlertCircle"},
    {"value":"shoulder", "label":"Shoulder issues",       "icon":"AlertCircle"}
  ]',
  'injuries'
);

-- ---- FLEXIBILITY BRANCH ----

-- Q5c: Flexibility type preference
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000009','question',0,1200);
INSERT INTO question_nodes (node_id, title, question_type, options, attribute_key)
VALUES (
  '00000000-0000-0000-0000-000000000009',
  'What type of flexibility training interests you?',
  'single_choice',
  '[
    {"value":"yoga",       "label":"Yoga flows",                 "icon":"PersonStanding"},
    {"value":"stretching", "label":"Deep stretching / mobility", "icon":"Move"},
    {"value":"pilates",    "label":"Pilates",                    "icon":"Dumbbell"}
  ]',
  'flex_pref'
);

-- Q6c: Chronic pain
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000010','question',0,1400);
INSERT INTO question_nodes (node_id, title, question_type, options, attribute_key)
VALUES (
  '00000000-0000-0000-0000-000000000010',
  'Do you experience any chronic pain or stiffness?',
  'single_choice',
  '[
    {"value":"none",   "label":"No pain, I just want more flexibility",  "icon":"Check"},
    {"value":"back",   "label":"Lower back pain",                       "icon":"AlertCircle"},
    {"value":"joints", "label":"Joint stiffness",                       "icon":"AlertCircle"},
    {"value":"neck",   "label":"Neck and shoulders",                    "icon":"AlertCircle"}
  ]',
  'pain'
);

-- ---- STRESS RELIEF BRANCH ----

-- Q5d: Main stress source
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000011','question',400,1200);
INSERT INTO question_nodes (node_id, title, question_type, options, attribute_key)
VALUES (
  '00000000-0000-0000-0000-000000000011',
  'What is your main source of stress?',
  'single_choice',
  '[
    {"value":"work",          "label":"Work and career pressure",  "icon":"Briefcase"},
    {"value":"relationships", "label":"Relationships and family",  "icon":"Users"},
    {"value":"health",        "label":"Health concerns",           "icon":"Heart"},
    {"value":"financial",     "label":"Financial worries",         "icon":"DollarSign"}
  ]',
  'stress_source'
);

-- Q6d: Relaxation preference
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000012','question',400,1400);
INSERT INTO question_nodes (node_id, title, question_type, options, attribute_key)
VALUES (
  '00000000-0000-0000-0000-000000000012',
  'What relaxation methods appeal to you?',
  'single_choice',
  '[
    {"value":"meditation",  "label":"Meditation and breathwork",     "icon":"Wind"},
    {"value":"movement",    "label":"Gentle movement (yoga, walks)", "icon":"PersonStanding"},
    {"value":"journaling",  "label":"Journaling and reflection",     "icon":"BookOpen"},
    {"value":"nothing_yet", "label":"Haven''t tried anything yet",   "icon":"HelpCircle"}
  ]',
  'relax_pref'
);

-- ---- ENDURANCE BRANCH ----

-- Q5e: Cardio type preference
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000013','question',800,1200);
INSERT INTO question_nodes (node_id, title, question_type, options, attribute_key)
VALUES (
  '00000000-0000-0000-0000-000000000013',
  'What type of cardio do you enjoy most?',
  'single_choice',
  '[
    {"value":"running",  "label":"Running / jogging", "icon":"Footprints"},
    {"value":"cycling",  "label":"Cycling",           "icon":"Bike"},
    {"value":"swimming", "label":"Swimming",           "icon":"Droplet"},
    {"value":"mixed",    "label":"A mix of everything","icon":"Shuffle"}
  ]',
  'cardio_type'
);

-- Q6e: Current cardio endurance
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000014','question',800,1400);
INSERT INTO question_nodes (node_id, title, question_type, options, attribute_key)
VALUES (
  '00000000-0000-0000-0000-000000000014',
  'How far can you comfortably run or cycle without stopping?',
  'single_choice',
  '[
    {"value":"none",     "label":"I can''t run / cycle far at all", "icon":"Pause"},
    {"value":"low",      "label":"About 1 to 2 km / 10 min",         "icon":"Zap"},
    {"value":"moderate", "label":"3 to 5 km / 20 to 30 min",            "icon":"TrendingUp"},
    {"value":"high",     "label":"5+ km / 30+ min easily",        "icon":"Rocket"}
  ]',
  'cardio_level'
);

-- ============================================================
-- PHASE 3: UNIVERSAL END (everyone converges here)
-- ============================================================

-- Q7: Time available
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000020','question',0,1700);
INSERT INTO question_nodes (node_id, title, question_type, options, attribute_key)
VALUES (
  '00000000-0000-0000-0000-000000000020',
  'How much time can you dedicate to training each day?',
  'single_choice',
  '[
    {"value":"10_15",   "label":"10 to 15 minutes", "icon":"Zap"},
    {"value":"20_30",   "label":"20 to 30 minutes", "icon":"Clock"},
    {"value":"45_plus", "label":"45+ minutes",   "icon":"Flame"}
  ]',
  'time_available'
);

-- Q8: Biggest barrier
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000021','question',0,1900);
INSERT INTO question_nodes (node_id, title, question_type, options, attribute_key)
VALUES (
  '00000000-0000-0000-0000-000000000021',
  'What''s the biggest thing getting in the way of your wellness goals?',
  'single_choice',
  '[
    {"value":"time_lack",      "label":"Not enough time",                          "icon":"Clock"},
    {"value":"low_motivation", "label":"Lack of motivation or discipline",         "icon":"Frown"},
    {"value":"stress_fatigue",  "label":"Stress and fatigue",                       "icon":"Cloud"},
    {"value":"no_guidance",     "label":"No guidance, don''t know where to start",  "icon":"HelpCircle"},
    {"value":"nothing",         "label":"Nothing, I''m ready to go!",              "icon":"Rocket"}
  ]',
  'barrier'
);

-- Q9: Stress level
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000022','question',0,2100);
INSERT INTO question_nodes (node_id, title, question_type, options, attribute_key)
VALUES (
  '00000000-0000-0000-0000-000000000022',
  'How would you rate your current stress level?',
  'single_choice',
  '[
    {"value":"low",    "label":"Low, I feel calm and balanced",    "icon":"Smile"},
    {"value":"medium", "label":"Medium, some tension day-to-day",  "icon":"Meh"},
    {"value":"high",   "label":"High, I often feel overwhelmed",   "icon":"Frown"}
  ]',
  'stress_level'
);

-- Q10: Sleep quality
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000023','question',0,2300);
INSERT INTO question_nodes (node_id, title, question_type, options, attribute_key)
VALUES (
  '00000000-0000-0000-0000-000000000023',
  'How is your sleep quality lately?',
  'single_choice',
  '[
    {"value":"good", "label":"Good, 7 to 8h, wake up rested",       "icon":"Moon"},
    {"value":"fair", "label":"Fair, inconsistent, could be better",  "icon":"CloudMoon"},
    {"value":"poor", "label":"Poor, I often wake up tired",          "icon":"Cloud"}
  ]',
  'sleep_quality'
);

-- Q11: What motivates you
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000024','question',0,2500);
INSERT INTO question_nodes (node_id, title, question_type, options, attribute_key)
VALUES (
  '00000000-0000-0000-0000-000000000024',
  'What motivates you the most to keep going?',
  'multi_choice',
  '[
    {"value":"results",    "label":"Seeing visible results",          "icon":"TrendingUp"},
    {"value":"discipline", "label":"Building discipline and habits",  "icon":"CheckSquare"},
    {"value":"community",  "label":"Community and accountability",    "icon":"Users"},
    {"value":"health",     "label":"Long-term health and longevity",  "icon":"Heart"}
  ]',
  'motivation'
);

-- Q12: Name (text input, no routing impact)
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000025','question',0,2700);
INSERT INTO question_nodes (node_id, title, question_type, options, attribute_key)
VALUES (
  '00000000-0000-0000-0000-000000000025',
  'What would you like us to call you?',
  'text_input',
  NULL,
  'name'
);

-- ============================================================
-- INFO: Plan ready (transition to offers)
-- ============================================================

INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000035','info',0,2900);
INSERT INTO info_nodes (node_id, title, content)
VALUES (
  '00000000-0000-0000-0000-000000000035',
  'Your personalized wellness plan is ready!',
  'Based on your answers, we''ve crafted a program that matches your lifestyle, goals, schedule, and current wellbeing. Thousands of people with your exact profile have already transformed their health.'
);

-- ============================================================
-- OFFER NODES (7 unique offers)
-- ============================================================

-- OFFER 1: Home Fat Burn (weight_loss + home)
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000050','offer',-900,3200);
INSERT INTO offer_nodes (node_id, title, description, cta_text, slug, digital_plan, physical_kit, why_text, conditions, priority)
VALUES (
  '00000000-0000-0000-0000-000000000050',
  'Home Fat Burn Program',
  '4-week home fat-burn program with daily sessions, no equipment needed',
  'Get My Weight Loss Plan',
  'home-fat-burn',
  'Structured 4-week progressive plan: cardio intervals + bodyweight circuits. Includes a nutrition guidance sheet and weekly progress tracker.',
  'Home Fat-Burn Kit: resistance bands, jump rope, shaker bottle, electrolytes + healthy snack pack',
  'Based on your goal to lose weight at home, this plan delivers exactly the right intensity to see real results without any equipment.',
  '{"type":"compound","operator":"AND","conditions":[
    {"type":"simple","attribute":"goal","op":"eq","value":"weight_loss"},
    {"type":"simple","attribute":"context","op":"eq","value":"home"}
  ]}',
  100
);

-- OFFER 2: Gym Shred (weight_loss + gym/outdoor)
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000051','offer',-600,3200);
INSERT INTO offer_nodes (node_id, title, description, cta_text, slug, digital_plan, physical_kit, why_text, conditions, priority)
VALUES (
  '00000000-0000-0000-0000-000000000051',
  'Gym Shred Program',
  '6-week gym fat-loss program: compound lifts + HIIT cardio for maximum burn',
  'Start My Gym Shred',
  'gym-shred',
  '6-week periodized fat-loss program: compound lifts, supersets, and HIIT finishers. 4 sessions/week with progressive overload. Includes meal prep guide.',
  'Gym Shred Kit: wrist wraps, shaker bottle, resistance bands, meal prep containers, electrolytes',
  'With gym access and your determination, this plan combines weight training and cardio for maximum fat loss while building lean muscle.',
  '{"type":"compound","operator":"AND","conditions":[
    {"type":"simple","attribute":"goal","op":"eq","value":"weight_loss"},
    {"type":"simple","attribute":"context","op":"in","value":["gym","outdoor"]}
  ]}',
  90
);

-- OFFER 3: Power Builder (strength + no injuries)
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000052','offer',-300,3200);
INSERT INTO offer_nodes (node_id, title, description, cta_text, slug, digital_plan, physical_kit, why_text, conditions, priority)
VALUES (
  '00000000-0000-0000-0000-000000000052',
  'Power Builder Program',
  '8-week progressive strength program: compound lifts and hypertrophy work',
  'Build My Strength Plan',
  'power-builder',
  'Periodized 8-week strength program: compound lifts + hypertrophy blocks. 3 to 4 sessions/week with progressive overload tracking. Includes printable workout log and deload guidance.',
  'Strength Kit: wrist wraps/straps, mini loop band, compact towel, protein bar pack, workout log notebook',
  'With no injuries holding you back, you''re in the perfect position to build serious strength with a smart progressive program.',
  '{"type":"compound","operator":"AND","conditions":[
    {"type":"simple","attribute":"goal","op":"eq","value":"strength"},
    {"type":"simple","attribute":"injuries","op":"eq","value":"none"}
  ]}',
  100
);

-- OFFER 4: Safe Strength (strength + has injuries)
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000053','offer',0,3200);
INSERT INTO offer_nodes (node_id, title, description, cta_text, slug, digital_plan, physical_kit, why_text, conditions, priority)
VALUES (
  '00000000-0000-0000-0000-000000000053',
  'Safe Strength Program',
  'Joint-friendly strength program that builds muscle while protecting your body',
  'Start My Safe Strength Plan',
  'safe-strength',
  '6-week low-impact strength program: modified exercises, resistance band work, and machine-based movements. Protects your joints while still building real strength.',
  'Recovery Strength Kit: knee sleeve, massage ball, mini loop bands, cooling gel patches, workout card deck',
  'Given your physical limitations, we''ve designed a plan that protects your joints while still helping you build meaningful strength safely.',
  '{"type":"compound","operator":"AND","conditions":[
    {"type":"simple","attribute":"goal","op":"eq","value":"strength"},
    {"type":"simple","attribute":"injuries","op":"in","value":["knee","back","shoulder"]}
  ]}',
  100
);

-- OFFER 5: Yoga & Mobility (flexibility)
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000054','offer',300,3200);
INSERT INTO offer_nodes (node_id, title, description, cta_text, slug, digital_plan, physical_kit, why_text, conditions, priority)
VALUES (
  '00000000-0000-0000-0000-000000000054',
  'Yoga & Mobility Program',
  'Daily 10 to 25 min yoga and mobility sessions for flexibility, posture, and pain relief',
  'Start My Flexibility Journey',
  'yoga-mobility',
  '6-week progressive yoga + mobility program: morning flows, deep stretching sessions, and posture correction routines. Adapts to all levels.',
  'Mobility Kit: travel yoga mat or yoga strap, massage ball, mini foam roller',
  'Flexibility training is one of the most underrated investments in your body. This program will have you moving pain-free within weeks.',
  '{"type":"simple","attribute":"goal","op":"eq","value":"flexibility"}',
  100
);

-- OFFER 6: Endurance Runner (endurance)
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000055','offer',600,3200);
INSERT INTO offer_nodes (node_id, title, description, cta_text, slug, digital_plan, physical_kit, why_text, conditions, priority)
VALUES (
  '00000000-0000-0000-0000-000000000055',
  'Endurance Runner Program',
  '8-week Couch-to-5K running program, 3 sessions per week with progressive goals',
  'Start My 5K Journey',
  'endurance-runner',
  '8-week Couch-to-5K: 3 sessions/week with walk-run intervals. GPS route suggestions, pacing guide, and post-run recovery protocols included.',
  'Runner Starter Kit: electrolytes, reflective armband, blister prevention kit, running belt, energy gels',
  'Your endurance goal and cardio preferences make you the perfect candidate for our structured running program.',
  '{"type":"simple","attribute":"goal","op":"eq","value":"endurance"}',
  100
);

-- OFFER 7: Stress Reset (stress_relief — fallback)
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000056','offer',900,3200);
INSERT INTO offer_nodes (node_id, title, description, cta_text, slug, digital_plan, physical_kit, why_text, conditions, priority)
VALUES (
  '00000000-0000-0000-0000-000000000056',
  'Stress Reset Program',
  '4-week mental reset: breathwork, meditation, and anti-stress daily routines',
  'Reset My Stress Today',
  'stress-reset',
  '4-week stress reset: daily 10-min breathwork sessions, guided meditations, sleep optimization routines, and mood-tracking micro-habits.',
  'Calm-Now Kit: eye mask, aroma roll-on, herbal tea sticks, stress ball, quick reset card',
  'Chronic stress is the hidden blocker of every wellness goal. This program gives you science-backed tools to reset your nervous system.',
  '{"type":"simple","attribute":"goal","op":"eq","value":"stress_relief"}',
  80
);

-- ============================================================
-- CONDITIONAL DECISION TREE (routes to offers)
-- ============================================================

-- COND: goal = weight_loss?
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000041','conditional',0,2900);
INSERT INTO conditional_nodes (node_id, title)
VALUES ('00000000-0000-0000-0000-000000000041','goal = weight_loss?');

-- COND: context = home? (within weight_loss)
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000042','conditional',-700,3000);
INSERT INTO conditional_nodes (node_id, title)
VALUES ('00000000-0000-0000-0000-000000000042','context = home?');

-- COND: goal = strength?
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000043','conditional',300,3000);
INSERT INTO conditional_nodes (node_id, title)
VALUES ('00000000-0000-0000-0000-000000000043','goal = strength?');

-- COND: injuries = none? (within strength)
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000044','conditional',-150,3100);
INSERT INTO conditional_nodes (node_id, title)
VALUES ('00000000-0000-0000-0000-000000000044','injuries = none?');

-- COND: goal = flexibility?
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000045','conditional',600,3100);
INSERT INTO conditional_nodes (node_id, title)
VALUES ('00000000-0000-0000-0000-000000000045','goal = flexibility?');

-- COND: goal = endurance?
INSERT INTO nodes (id, type, pos_x, pos_y)
VALUES ('00000000-0000-0000-0000-000000000046','conditional',900,3100);
INSERT INTO conditional_nodes (node_id, title)
VALUES ('00000000-0000-0000-0000-000000000046','goal = endurance?');


-- ============================================================
-- EDGES
-- ============================================================

-- ---- Phase 1: Linear start Q1 → Q2 → Q3 → Q4 → COND(40) ----
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000001','00000000-0000-0000-0000-000000000002',NULL,NULL,0);
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000002','00000000-0000-0000-0000-000000000003',NULL,NULL,0);
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000003','00000000-0000-0000-0000-000000000004',NULL,NULL,0);
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000004','00000000-0000-0000-0000-000000000040',NULL,NULL,0);

-- ---- COND(40): Branch by goal → info nodes ----
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority, source_handle)
VALUES ('00000000-0000-0000-0000-000000000040','00000000-0000-0000-0000-000000000030','weight_loss',
  '{"type":"simple","attribute":"goal","op":"eq","value":"weight_loss"}',10,'true');
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority, source_handle)
VALUES ('00000000-0000-0000-0000-000000000040','00000000-0000-0000-0000-000000000031','strength',
  '{"type":"simple","attribute":"goal","op":"eq","value":"strength"}',10,'true');
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority, source_handle)
VALUES ('00000000-0000-0000-0000-000000000040','00000000-0000-0000-0000-000000000032','flexibility',
  '{"type":"simple","attribute":"goal","op":"eq","value":"flexibility"}',10,'true');
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority, source_handle)
VALUES ('00000000-0000-0000-0000-000000000040','00000000-0000-0000-0000-000000000033','stress_relief',
  '{"type":"simple","attribute":"goal","op":"eq","value":"stress_relief"}',10,'true');
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority, source_handle)
VALUES ('00000000-0000-0000-0000-000000000040','00000000-0000-0000-0000-000000000034','endurance',
  '{"type":"simple","attribute":"goal","op":"eq","value":"endurance"}',10,'true');
-- Fallback: if somehow no goal matches, go to stress info
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority, source_handle)
VALUES ('00000000-0000-0000-0000-000000000040','00000000-0000-0000-0000-000000000033',NULL,NULL,0,'false');

-- ---- Info → goal-specific Q5 ----
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000030','00000000-0000-0000-0000-000000000005',NULL,NULL,0);
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000031','00000000-0000-0000-0000-000000000007',NULL,NULL,0);
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000032','00000000-0000-0000-0000-000000000009',NULL,NULL,0);
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000033','00000000-0000-0000-0000-000000000011',NULL,NULL,0);
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000034','00000000-0000-0000-0000-000000000013',NULL,NULL,0);

-- ---- Q5 → Q6 within each branch ----
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000005','00000000-0000-0000-0000-000000000006',NULL,NULL,0);
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000007','00000000-0000-0000-0000-000000000008',NULL,NULL,0);
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000009','00000000-0000-0000-0000-000000000010',NULL,NULL,0);
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000011','00000000-0000-0000-0000-000000000012',NULL,NULL,0);
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000013','00000000-0000-0000-0000-000000000014',NULL,NULL,0);

-- ---- All Q6 branches converge → Q7 (time_available) ----
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000006','00000000-0000-0000-0000-000000000020',NULL,NULL,0);
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000008','00000000-0000-0000-0000-000000000020',NULL,NULL,0);
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000010','00000000-0000-0000-0000-000000000020',NULL,NULL,0);
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000012','00000000-0000-0000-0000-000000000020',NULL,NULL,0);
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000014','00000000-0000-0000-0000-000000000020',NULL,NULL,0);

-- ---- Phase 3: Universal end Q7 → Q8 → Q9 → Q10 → Q11 → INFO(35) ----
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000020','00000000-0000-0000-0000-000000000021',NULL,NULL,0);
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000021','00000000-0000-0000-0000-000000000022',NULL,NULL,0);
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000022','00000000-0000-0000-0000-000000000023',NULL,NULL,0);
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000023','00000000-0000-0000-0000-000000000024',NULL,NULL,0);
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000024','00000000-0000-0000-0000-000000000025',NULL,NULL,0);
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000025','00000000-0000-0000-0000-000000000035',NULL,NULL,0);

-- ---- INFO(35) → COND(41) decision tree ----
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority)
VALUES ('00000000-0000-0000-0000-000000000035','00000000-0000-0000-0000-000000000041',NULL,NULL,0);

-- ---- Decision tree edges ----

-- COND(41): goal = weight_loss? → COND(42) : COND(43)
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority, source_handle)
VALUES ('00000000-0000-0000-0000-000000000041','00000000-0000-0000-0000-000000000042','weight_loss',
  '{"type":"simple","attribute":"goal","op":"eq","value":"weight_loss"}',10,'true');
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority, source_handle)
VALUES ('00000000-0000-0000-0000-000000000041','00000000-0000-0000-0000-000000000043',NULL,NULL,0,'false');

-- COND(42): context = home? → OFFER(50) Home Fat Burn : OFFER(51) Gym Shred
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority, source_handle)
VALUES ('00000000-0000-0000-0000-000000000042','00000000-0000-0000-0000-000000000050','home',
  '{"type":"simple","attribute":"context","op":"eq","value":"home"}',10,'true');
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority, source_handle)
VALUES ('00000000-0000-0000-0000-000000000042','00000000-0000-0000-0000-000000000051','gym/outdoor',NULL,0,'false');

-- COND(43): goal = strength? → COND(44) : COND(45)
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority, source_handle)
VALUES ('00000000-0000-0000-0000-000000000043','00000000-0000-0000-0000-000000000044','strength',
  '{"type":"simple","attribute":"goal","op":"eq","value":"strength"}',10,'true');
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority, source_handle)
VALUES ('00000000-0000-0000-0000-000000000043','00000000-0000-0000-0000-000000000045',NULL,NULL,0,'false');

-- COND(44): injuries = none? → OFFER(52) Power Builder : OFFER(53) Safe Strength
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority, source_handle)
VALUES ('00000000-0000-0000-0000-000000000044','00000000-0000-0000-0000-000000000052','no injuries',
  '{"type":"simple","attribute":"injuries","op":"eq","value":"none"}',10,'true');
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority, source_handle)
VALUES ('00000000-0000-0000-0000-000000000044','00000000-0000-0000-0000-000000000053','has injuries',NULL,0,'false');

-- COND(45): goal = flexibility? → OFFER(54) Yoga : COND(46)
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority, source_handle)
VALUES ('00000000-0000-0000-0000-000000000045','00000000-0000-0000-0000-000000000054','flexibility',
  '{"type":"simple","attribute":"goal","op":"eq","value":"flexibility"}',10,'true');
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority, source_handle)
VALUES ('00000000-0000-0000-0000-000000000045','00000000-0000-0000-0000-000000000046',NULL,NULL,0,'false');

-- COND(46): goal = endurance? → OFFER(55) Runner : OFFER(56) Stress Reset (fallback)
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority, source_handle)
VALUES ('00000000-0000-0000-0000-000000000046','00000000-0000-0000-0000-000000000055','endurance',
  '{"type":"simple","attribute":"goal","op":"eq","value":"endurance"}',10,'true');
INSERT INTO edges (source_node_id, target_node_id, label, conditions, priority, source_handle)
VALUES ('00000000-0000-0000-0000-000000000046','00000000-0000-0000-0000-000000000056','stress / other',NULL,0,'false');
