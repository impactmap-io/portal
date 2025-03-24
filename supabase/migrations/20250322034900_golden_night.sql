/*
  # Enhanced Git Integration Features

  1. New Tables
    - solution_branches
      - Track branch information and protection rules
      - Monitor branch status and health
    - solution_releases
      - Manage releases and deployment tracking
      - Store changelogs and approvals
    - solution_security
      - Track security scan results
      - Store vulnerability information
    - solution_ci_status
      - Track CI/CD pipeline status
      - Store build and test results

  2. Security
    - RLS policies for all new tables
    - Team-based access control
*/

-- Branch management
CREATE TABLE solution_branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id uuid REFERENCES solutions(id) ON DELETE CASCADE,
  name text NOT NULL,
  is_default boolean DEFAULT false,
  is_protected boolean DEFAULT false,
  protection_rules jsonb DEFAULT '{}',
  ahead_count int DEFAULT 0,
  behind_count int DEFAULT 0,
  last_commit jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Release management
CREATE TABLE solution_releases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id uuid REFERENCES solutions(id) ON DELETE CASCADE,
  version text NOT NULL,
  name text,
  description text,
  changelog text,
  artifacts jsonb,
  environment text,
  status text NOT NULL DEFAULT 'draft',
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  released_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Security tracking
CREATE TABLE solution_security (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id uuid REFERENCES solutions(id) ON DELETE CASCADE,
  scan_type text NOT NULL,
  severity text NOT NULL,
  description text,
  file_path text,
  line_number int,
  status text NOT NULL DEFAULT 'open',
  remediation_steps text,
  fixed_in_commit text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- CI/CD status
CREATE TABLE solution_ci_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id uuid REFERENCES solutions(id) ON DELETE CASCADE,
  pipeline_id text NOT NULL,
  branch text NOT NULL,
  status text NOT NULL,
  stages jsonb,
  test_coverage float,
  code_quality_score float,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE solution_branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE solution_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE solution_security ENABLE ROW LEVEL SECURITY;
ALTER TABLE solution_ci_status ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read solution branches"
  ON solution_branches FOR SELECT
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

CREATE POLICY "Users can read solution releases"
  ON solution_releases FOR SELECT
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

CREATE POLICY "Users can read solution security"
  ON solution_security FOR SELECT
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

CREATE POLICY "Users can read solution CI status"
  ON solution_ci_status FOR SELECT
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

-- Add indexes
CREATE INDEX idx_solution_branches_solution_id