/*
  # Solution Users and Identity Management

  1. New Tables
    - solution_users
      - Tracks identities of users interacting with solutions
      - Maps to Console identity data
      - Stores impact and interaction metrics
    - solution_user_activities
      - Logs activities and interactions
      - Links to workflow events and impacts
    - portal_user_roles
      - Defines roles for Portal users (auth.users)
      - Manages Portal-specific permissions

  2. Security
    - RLS policies for data access
    - Separation between Portal and Solution user data
*/

-- Portal user roles
CREATE TYPE portal_role AS ENUM ('admin', 'analyst', 'viewer');

CREATE TABLE portal_user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  role portal_role NOT NULL DEFAULT 'viewer',
  permissions jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Solution users
CREATE TABLE solution_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id uuid REFERENCES solutions(id) ON DELETE CASCADE,
  external_id text, -- Maps to Console identity
  name text NOT NULL,
  email text,
  role text,
  metadata jsonb, -- Additional attributes from Console
  status text DEFAULT 'active',
  first_seen_at timestamptz,
  last_seen_at timestamptz,
  impact_metrics jsonb DEFAULT '{}', -- Aggregated impact metrics
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Solution user activities
CREATE TABLE solution_user_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_user_id uuid REFERENCES solution_users(id) ON DELETE CASCADE,
  workflow_id uuid REFERENCES workflows(id),
  activity_type text NOT NULL,
  description text,
  metadata jsonb,
  impact_score float,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE portal_user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE solution_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE solution_user_activities ENABLE ROW LEVEL SECURITY;

-- Portal user roles policies
CREATE POLICY "Users can read their own role"
  ON portal_user_roles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Solution users policies
CREATE POLICY "Portal users can read solution users"
  ON solution_users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM solutions s
      WHERE s.id = solution_id
      AND (
        auth.uid() = s.owner OR 
        auth.uid()::text = ANY(ARRAY(SELECT jsonb_array_elements_text(s.team)))
      )
    )
  );

-- Solution user activities policies
CREATE POLICY "Portal users can read solution user activities"
  ON solution_user_activities FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM solution_users su
      JOIN solutions s ON s.id = su.solution_id
      WHERE su.id = solution_user_id
      AND (
        auth.uid() = s.owner OR 
        auth.uid()::text = ANY(ARRAY(SELECT jsonb_array_elements_text(s.team)))
      )
    )
  );

-- Add triggers for updated_at
CREATE TRIGGER update_portal_user_roles_updated_at
  BEFORE UPDATE ON portal_user_roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_solution_users_updated_at
  BEFORE UPDATE ON solution_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Indexes
CREATE INDEX idx_solution_users_solution_id ON solution_users(solution_id);
CREATE INDEX idx_solution_users_external_id ON solution_users(external_id);
CREATE INDEX idx_solution_user_activities_user_id ON solution_user_activities(solution_user_id);
CREATE INDEX idx_solution_user_activities_workflow_id ON solution_user_activities(workflow_id);