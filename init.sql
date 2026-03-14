-- BetterMe Wellness Platform Database Schema

-- Graphs (quiz configurations)
CREATE TABLE graphs (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    is_active   BOOLEAN DEFAULT false,
    created_at  TIMESTAMPTZ DEFAULT now(),
    updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Node types
CREATE TYPE node_type AS ENUM ('question', 'info', 'start', 'end');
CREATE TYPE answer_type AS ENUM ('single_choice', 'multi_choice', 'slider', 'text_input', 'none');

-- Nodes in a graph
CREATE TABLE nodes (
    id          SERIAL PRIMARY KEY,
    graph_id    INTEGER NOT NULL REFERENCES graphs(id) ON DELETE CASCADE,
    node_type   node_type NOT NULL,
    slug        VARCHAR(100),
    title       TEXT,
    description TEXT,
    image_url   TEXT,
    answer_type answer_type DEFAULT 'none',
    options     JSONB DEFAULT '[]',
    position_x  FLOAT DEFAULT 0,
    position_y  FLOAT DEFAULT 0,
    metadata    JSONB DEFAULT '{}',
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- Edges between nodes
CREATE TABLE edges (
    id          SERIAL PRIMARY KEY,
    graph_id    INTEGER NOT NULL REFERENCES graphs(id) ON DELETE CASCADE,
    source_id   INTEGER NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    target_id   INTEGER NOT NULL REFERENCES nodes(id) ON DELETE CASCADE,
    priority    INTEGER DEFAULT 0,
    conditions  JSONB DEFAULT '[]',
    label       VARCHAR(255),
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- Offers catalog
CREATE TABLE offers (
    id          SERIAL PRIMARY KEY,
    slug        VARCHAR(100) UNIQUE NOT NULL,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    image_url   TEXT,
    plan_details JSONB DEFAULT '{}',
    kit_details  JSONB DEFAULT '{}',
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- Offer resolution rules
CREATE TABLE offer_rules (
    id          SERIAL PRIMARY KEY,
    offer_id    INTEGER NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    conditions  JSONB NOT NULL DEFAULT '[]',
    priority    INTEGER DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- User quiz sessions
CREATE TABLE sessions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    graph_id    INTEGER NOT NULL REFERENCES graphs(id),
    current_node_id INTEGER REFERENCES nodes(id),
    answers     JSONB DEFAULT '{}',
    history     JSONB DEFAULT '[]',
    status      VARCHAR(20) DEFAULT 'in_progress',
    result_offer_ids INTEGER[] DEFAULT '{}',
    created_at  TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_nodes_graph ON nodes(graph_id);
CREATE INDEX idx_edges_graph ON edges(graph_id);
CREATE INDEX idx_edges_source ON edges(source_id);
CREATE INDEX idx_sessions_graph ON sessions(graph_id);

-- Seed 7 default offers
INSERT INTO offers (slug, name, description, plan_details, kit_details) VALUES
('weight_loss_starter', 'Weight Loss Starter (Home)', '4-week home weight loss plan (20-30 min sessions)',
 '{"duration": "4 weeks", "format": "home", "session_length": "20-30 min", "description": "Structured home workout plan focused on fat burning with progressive intensity"}',
 '{"name": "Home Fat-Burn Kit", "items": ["Resistance bands", "Jump rope", "Shaker bottle", "Electrolytes", "Healthy snack pack"]}'),

('lean_strength_builder', 'Lean Strength Builder (Gym)', 'Gym-based strength program with progressive overload',
 '{"duration": "6 weeks", "format": "gym", "session_length": "45-60 min", "description": "Progressive strength training program with structured periodization"}',
 '{"name": "Gym Support Kit", "items": ["Wrist wraps/straps", "Mini loop band", "Compact gym towel", "Electrolytes", "Protein snack"]}'),

('low_impact_fat_burn', 'Low-Impact Fat Burn', 'Joint-friendly fat burning program (knees/back safe)',
 '{"duration": "4 weeks", "format": "home/gym", "session_length": "25-35 min", "description": "Low-impact exercises designed to burn fat while protecting joints"}',
 '{"name": "Joint-Friendly Kit", "items": ["Knee sleeve/bandage", "Massage ball", "Mini loop bands", "Cooling patch", "Recovery gel"]}'),

('run_first_5k', 'Run Your First 5K (Outdoor)', '5K running preparation program (3x/week)',
 '{"duration": "8 weeks", "format": "outdoor", "session_length": "20-40 min", "frequency": "3x/week", "description": "Couch-to-5K progressive running program"}',
 '{"name": "Runner Starter Kit", "items": ["Electrolytes", "Reflective armband", "Safety light", "Blister kit", "Running belt"]}'),

('yoga_mobility', 'Yoga & Mobility (Home)', 'Flexibility and posture improvement program (10-25 min)',
 '{"duration": "4 weeks", "format": "home", "session_length": "10-25 min", "description": "Daily yoga and mobility routines for flexibility, posture, and stress relief"}',
 '{"name": "Mobility Kit", "items": ["Travel yoga mat", "Yoga strap", "Massage ball", "Mini foam roller"]}'),

('stress_reset', 'Stress Reset Program', 'Mental reset with breathing, meditation, and micro-habits',
 '{"duration": "3 weeks", "format": "anywhere", "session_length": "5-15 min", "description": "Guided breathing exercises, meditations, and anti-stress routines"}',
 '{"name": "Calm-Now Kit", "items": ["Eye mask", "Aroma roll-on", "Tea sticks", "Stress ball", "Quick reset card"]}'),

('quick_fit_micro', 'Quick Fit Micro-Workouts', 'Daily 10-15 min micro-workouts',
 '{"duration": "4 weeks", "format": "anywhere", "session_length": "10-15 min", "frequency": "daily", "description": "Short, efficient daily workouts that fit into any schedule"}',
 '{"name": "Micro-Workout Kit", "items": ["Slider discs", "Mini loop bands", "Shaker bottle", "Mini routine card"]}');
