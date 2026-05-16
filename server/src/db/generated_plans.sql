CREATE TABLE IF NOT EXISTS generated_plans (
  id SERIAL PRIMARY KEY,
  plan_id INTEGER REFERENCES training_plans(id) ON DELETE CASCADE UNIQUE,
  content TEXT NOT NULL,
  flags JSONB DEFAULT '[]',
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
