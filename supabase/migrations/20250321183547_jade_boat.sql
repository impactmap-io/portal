/*
  # Add Solution Relationships

  1. New Relationships
    - solution_collaborations
      - Links solutions that work together or depend on each other
      - Tracks collaboration type and status
    - solution_dependencies
      - Tracks technical or operational dependencies between solutions
      - Includes dependency type and criticality
    - solution_integrations
      - Records integration points between solutions
      - Includes integration type and configuration
    - solution_versions
      - Tracks major versions and changes of solutions
      - Includes changelog and compatibility info

  2. Security
    - Enable RLS on all new tables
    - Policies follow solution access patterns
*/

-- Solution collaborations
CREATE TABLE solution_collaborations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_solution_id uuid REFERENCES solutions(id) ON DELETE CASCADE,
  target_solution_id uuid REFERENCES solutions(id) ON DELETE CASCADE,
  collaboration_type text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  description text,
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz,
  terms jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT different_solutions CHECK (source_solution_id != target_solution_id)
);

-- Solution dependencies
CREATE TABLE solution_dependencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dependent_solution_id uuid REFERENCES solutions(id) ON DELETE CASCADE,
  dependency_solution_id uuid REFERENCES solutions(id) ON DELETE CASCADE,
  dependency_type text NOT NULL,
  criticality text NOT NULL DEFAULT 'medium',
  description text,
  requirements jsonb,
  validation_rules jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT different_solutions CHECK (dependent_solution_id != dependency_solution_id)
);

-- Solution integrations
CREATE TABLE solution_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_solution_id uuid REFERENCES solutions(id) ON DELETE CASCADE,
  target_solution_id uuid REFERENCES solutions(id) ON DELETE CASCADE,
  integration_type text NOT NULL,
  config jsonb,
  status text NOT NULL DEFAULT 'active',
  health_check_url text,
  last_sync timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT different_solutions CHECK (source_solution_id != target_solution_id)
);

-- Solution versions
CREATE TABLE solution_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id uuid REFERENCES solutions(id) ON DELETE CASCADE,
  version text NOT NULL,
  changelog text,
  compatibility jsonb,
  released_at timestamptz NOT NULL DEFAULT now(),
  released_by uuid REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE solution_collaborations ENABLE ROW LEVEL SECURITY;
ALTER TABLE solution_dependencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE solution_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE solution_versions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read solution collaborations"
  ON solution_collaborations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM solutions s
      WHERE (s.id = source_solution_id OR s.id = target_solution_id)
      AND (
        auth.uid() = s.owner OR 
        auth.uid()::text = ANY(ARRAY(SELECT jsonb_array_elements_text(s.team)))
      )
    )
  );

CREATE POLICY "Users can read solution dependencies"
  ON solution_dependencies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM solutions s
      WHERE (s.id = dependent_solution_id OR s.id = dependency_solution_id)
      AND (
        auth.uid() = s.owner OR 
        auth.uid()::text = ANY(ARRAY(SELECT jsonb_array_elements_text(s.team)))
      )
    )
  );

CREATE POLICY "Users can read solution integrations"
  ON solution_integrations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM solutions s
      WHERE (s.id = source_solution_id OR s.id = target_solution_id)
      AND (
        auth.uid() = s.owner OR 
        auth.uid()::text = ANY(ARRAY(SELECT jsonb_array_elements_text(s.team)))
      )
    )
  );

CREATE POLICY "Users can read solution versions"
  ON solution_versions FOR SELECT
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

-- Add triggers for updated_at
CREATE TRIGGER update_solution_collaborations_updated_at
  BEFORE UPDATE ON solution_collaborations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_solution_dependencies_updated_at
  BEFORE UPDATE ON solution_dependencies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_solution_integrations_updated_at
  BEFORE UPDATE ON solution_integrations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_solution_versions_updated_at
  BEFORE UPDATE ON solution_versions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();