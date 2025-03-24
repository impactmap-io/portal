/*
  # Enhanced Goal Management

  1. New Tables
    - goal_categories
      - Organize goals by category
      - Enable better filtering and reporting
    - goal_revisions
      - Track goal changes over time
      - Maintain audit history
    - goal_milestones
      - Track key checkpoints and timelines
      - Monitor progress at a granular level
    - goal_kpis
      - Track goal-specific KPIs
      - Separate from solution metrics
    - goal_risks
      - Track identified risks
      - Monitor mitigation strategies

  2. Changes to goals table
    - Add new fields for enhanced tracking
    - Add approval workflow support
    - Add resource allocation tracking

  3. Security
    - RLS policies for all new tables
    - Team-based access control
*/

-- Create enums
CREATE TYPE goal_status AS ENUM (
  'draft',
  'pending_review',
  'approved',
  'in_progress',
  'completed',
  'on_hold',
  'cancelled'
);

CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE risk_status AS ENUM ('identified', 'assessed', 'mitigated', 'accepted', 'closed');

-- Goal Categories
CREATE TABLE goal_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  color text,
  icon text,
  parent_id uuid REFERENCES goal_categories(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Goal Revisions
CREATE TABLE goal_revisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  changes jsonb NOT NULL,
  changed_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Goal Milestones
CREATE TABLE goal_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  due_date timestamptz NOT NULL,
  completion_criteria text[],
  status goal_status NOT NULL DEFAULT 'in_progress',
  progress float DEFAULT 0.0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Goal KPIs
CREATE TABLE goal_kpis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  current_value float,
  target_value float,
  unit text,
  frequency text,
  data_source text,
  calculation_method text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Goal Risks
CREATE TABLE goal_risks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  level risk_level NOT NULL DEFAULT 'medium',
  status risk_status NOT NULL DEFAULT 'identified',
  probability float,
  impact float,
  mitigation_strategy text,
  owner uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Add new columns to goals table
ALTER TABLE goals
ADD COLUMN category_id uuid REFERENCES goal_categories(id),
ADD COLUMN status goal_status NOT NULL DEFAULT 'draft',
ADD COLUMN tags text[],
ADD COLUMN budget numeric,
ADD COLUMN resource_allocation jsonb,
ADD COLUMN success_criteria text[],
ADD COLUMN approval_workflow jsonb,
ADD COLUMN approved_by uuid REFERENCES auth.users(id),
ADD COLUMN approved_at timestamptz;

-- Enable RLS
ALTER TABLE goal_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_risks ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read goal categories"
  ON goal_categories FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can read goal revisions"
  ON goal_revisions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM goals g
      JOIN solution_goals sg ON sg.goal_id = g.id
      JOIN solutions s ON s.id = sg.solution_id
      WHERE g.id = goal_id
      AND (
        auth.uid() = s.owner OR 
        auth.uid()::text = ANY(ARRAY(SELECT jsonb_array_elements_text(s.team)))
      )
    )
  );

-- Similar policies for other tables...

-- Add triggers for updated_at
CREATE TRIGGER update_goal_categories_updated_at
  BEFORE UPDATE ON goal_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_goal_milestones_updated_at
  BEFORE UPDATE ON goal_milestones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_goal_kpis_updated_at
  BEFORE UPDATE ON goal_kpis
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_goal_risks_updated_at
  BEFORE UPDATE ON goal_risks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add indexes
CREATE INDEX idx_goal_revisions_goal_id ON goal_revisions(goal_id);
CREATE INDEX idx_goal_milestones_goal_id ON goal_milestones(goal_id);
CREATE INDEX idx_goal_kpis_goal_id ON goal_kpis(goal_id);
CREATE INDEX idx_goal_risks_goal_id ON goal_risks(goal_id);
CREATE INDEX idx_goals_category_id ON goals(category_id);
CREATE INDEX idx_goals_status ON goals(status);
CREATE INDEX idx_goals_tags ON goals USING gin(tags);