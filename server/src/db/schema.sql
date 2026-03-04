-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('parent', 'rbt', 'bcba')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Children
CREATE TABLE IF NOT EXISTS children (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  diagnosis_level VARCHAR(10) CHECK (diagnosis_level IN ('level_1', 'level_2', 'level_3')),
  strengths TEXT,
  areas_of_concern TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Who can access which child
CREATE TABLE IF NOT EXISTS child_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('parent', 'rbt', 'bcba')),
  UNIQUE(child_id, user_id)
);

-- Goal library + custom goals
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(50) NOT NULL CHECK (domain IN (
    'verbal_behavior', 'daily_living', 'social_skills',
    'academic', 'behavior_reduction', 'imitation', 'motor_skills'
  )),
  description TEXT,
  -- Program plan template fields
  data_collection TEXT,
  prerequisite_skills TEXT,
  materials TEXT,
  sd TEXT,
  correct_responses TEXT,
  incorrect_responses TEXT,
  prompting_hierarchy VARCHAR(20) DEFAULT 'most_to_least'
    CHECK (prompting_hierarchy IN ('most_to_least', 'least_to_most')),
  prompting_hierarchy_detail TEXT,
  error_correction TEXT,
  transfer_procedure TEXT,
  reinforcement_schedule TEXT,
  generalization_plan TEXT,
  maintenance_plan TEXT,
  is_library_goal BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Training plans
CREATE TABLE IF NOT EXISTS training_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Goals within a plan (with optional child-specific overrides)
CREATE TABLE IF NOT EXISTS plan_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES training_plans(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES goals(id),
  status VARCHAR(20) DEFAULT 'in_progress'
    CHECK (status IN ('not_started', 'in_progress', 'mastered', 'on_hold')),
  mastery_criteria VARCHAR(255) DEFAULT '80% correct over 3 consecutive sessions',
  sort_order INTEGER DEFAULT 0,
  -- Child-specific overrides of template fields
  custom_materials TEXT,
  custom_sd TEXT,
  custom_reinforcement_schedule TEXT,
  added_at TIMESTAMP DEFAULT NOW()
);

-- Therapy sessions
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID REFERENCES children(id),
  plan_id UUID REFERENCES training_plans(id),
  therapist_id UUID REFERENCES users(id),
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes INTEGER,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Trial-by-trial data
CREATE TABLE IF NOT EXISTS session_trials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  plan_goal_id UUID REFERENCES plan_goals(id),
  trial_number INTEGER NOT NULL,
  response VARCHAR(20) CHECK (response IN ('correct', 'incorrect', 'no_response')),
  prompt_level VARCHAR(30) CHECK (prompt_level IN (
    'independent', 'gestural', 'verbal', 'partial_physical', 'full_physical'
  )),
  notes TEXT,
  recorded_at TIMESTAMP DEFAULT NOW()
);

-- Aggregated progress per goal per session
CREATE TABLE IF NOT EXISTS data_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_goal_id UUID REFERENCES plan_goals(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id),
  session_date DATE NOT NULL,
  total_trials INTEGER NOT NULL,
  correct_trials INTEGER NOT NULL,
  percentage_correct DECIMAL(5,2) GENERATED ALWAYS AS
    (ROUND((correct_trials::DECIMAL / NULLIF(total_trials, 0)) * 100, 2)) STORED,
  prompt_level_used VARCHAR(30),
  notes TEXT,
  recorded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
