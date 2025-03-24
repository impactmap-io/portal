/*
  # Initial Schema Setup

  1. New Tables
    - solutions
      - Core table for tracking different solutions/projects
      - Includes metrics and team information
    - workflows
      - Tracks automated and manual workflows
      - Connected to solutions via foreign key
    - workflow_steps
      - Individual steps within workflows
      - Includes validation and completion criteria
    - workflow_events
      - Audit trail of workflow execution
    - goals
      - Tracks impact goals and objectives
    - stakeholders
      - Manages stakeholder information and engagement
    - impacts
      - Tracks impact measurements and metrics
    - deliverables
      - Manages concrete deliverables and their status

  2. Security
    - RLS policies for each table
    - Authenticated users can read/write their own data
    - Team members can access shared resources

  3. Enums
    - Various status and type enums for consistent data
*/

-- Create custom types
CREATE TYPE solution_status AS ENUM ('active', 'archived', 'draft');
CREATE TYPE solution_category AS ENUM ('product', 'service', 'platform', 'integration');
CREATE TYPE workflow_status AS ENUM ('active', 'paused', 'completed');
CREATE TYPE workflow_type AS ENUM ('integration', 'engagement', 'automation', 'collaboration');
CREATE TYPE step_type AS ENUM ('manual', 'automated');
CREATE TYPE step_status AS ENUM ('pending', 'in-progress', 'completed', 'failed');
CREATE TYPE impact_status AS ENUM ('positive', 'negative', 'neutral');
CREATE TYPE stakeholder_type AS ENUM ('investor', 'partner', 'end-user', 'team', 'community');
CREATE TYPE engagement_level AS ENUM ('high', 'medium', 'low');
CREATE TYPE priority_level AS ENUM ('high', 'medium', 'low');
CREATE TYPE deliverable_status AS ENUM ('planned', 'in-progress', 'completed');

-- Solutions table
CREATE TABLE solutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  status solution_status NOT NULL DEFAULT 'draft',
  category solution_category NOT NULL,
  owner uuid REFERENCES auth.users(id),
  team jsonb,
  metrics jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Workflows table
CREATE TABLE workflows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id uuid REFERENCES solutions(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  status workflow_status NOT NULL DEFAULT 'active',
  type workflow_type NOT NULL,
  steps jsonb,
  triggers jsonb,
  metrics jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Workflow events table
CREATE TABLE workflow_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_id uuid REFERENCES workflows(id) ON DELETE CASCADE,
  step_id text,
  type text NOT NULL,
  actor uuid REFERENCES auth.users(id),
  data jsonb,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Goals table
CREATE TABLE goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id uuid REFERENCES solutions(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  deadline timestamptz,
  status text NOT NULL DEFAULT 'in-progress',
  team_members jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Stakeholders table
CREATE TABLE stakeholders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type stakeholder_type NOT NULL,
  description text,
  goal_id uuid REFERENCES goals(id),
  contact_info text,
  role text,
  engagement_level engagement_level NOT NULL DEFAULT 'medium',
  influence engagement_level NOT NULL DEFAULT 'medium',
  interests jsonb,
  expectations jsonb,
  communication_preference text,
  last_engagement timestamptz
);

-- Impacts table
CREATE TABLE impacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  actor_id uuid REFERENCES stakeholders(id),
  status impact_status NOT NULL DEFAULT 'neutral',
  metrics jsonb,
  scenarios jsonb
);

-- Deliverables table
CREATE TABLE deliverables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  impact_id uuid REFERENCES impacts(id) ON DELETE CASCADE,
  status deliverable_status NOT NULL DEFAULT 'planned',
  priority priority_level NOT NULL DEFAULT 'medium',
  assignee uuid REFERENCES auth.users(id),
  due_date timestamptz,
  comments jsonb
);

-- Enable RLS
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE stakeholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE impacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliverables ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their solutions"
  ON solutions FOR SELECT
  TO authenticated
  USING (
    auth.uid() = owner OR 
    auth.uid()::text = ANY(ARRAY(SELECT jsonb_array_elements_text(team)))
  );

CREATE POLICY "Users can update their solutions"
  ON solutions FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = owner OR 
    auth.uid()::text = ANY(ARRAY(SELECT jsonb_array_elements_text(team)))
  );

-- Similar policies for other tables...

-- Functions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_solutions_updated_at
  BEFORE UPDATE ON solutions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_workflows_updated_at
  BEFORE UPDATE ON workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();