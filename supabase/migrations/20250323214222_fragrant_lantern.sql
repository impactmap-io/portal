/*
  # Add Flow Types and GitHub Integration

  1. Changes
    - Add flow_type enum for solution relationships
    - Add flow_type column to relationship tables
    - Update existing relationship tables with flow direction support
    - Add GitHub repository tracking improvements

  2. Security
    - Maintain existing RLS policies
    - Add validation for flow types
*/

-- Create flow type enum
CREATE TYPE flow_type AS ENUM ('unidirectional', 'bidirectional', 'lateral');

-- Add flow_type to solution_collaborations
ALTER TABLE solution_collaborations
ADD COLUMN flow_type flow_type NOT NULL DEFAULT 'unidirectional';

-- Add flow_type to solution_dependencies
ALTER TABLE solution_dependencies
ADD COLUMN flow_type flow_type NOT NULL DEFAULT 'unidirectional';

-- Add flow_type to solution_integrations
ALTER TABLE solution_integrations
ADD COLUMN flow_type flow_type NOT NULL DEFAULT 'unidirectional';

-- Add GitHub tracking improvements
ALTER TABLE solutions
ADD COLUMN github_installation_id text,
ADD COLUMN github_repository_id text,
ADD COLUMN github_repository_name text,
ADD COLUMN github_default_branch text,
ADD COLUMN github_last_sync timestamptz;

-- Add GitHub sync status tracking
CREATE TYPE github_sync_status AS ENUM ('pending', 'in_progress', 'completed', 'failed');

CREATE TABLE github_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id uuid REFERENCES solutions(id) ON DELETE CASCADE,
  status github_sync_status NOT NULL DEFAULT 'pending',
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  error_message text,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE github_sync_logs ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can read GitHub sync logs"
  ON github_sync_logs FOR SELECT
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
CREATE INDEX idx_solutions_github_installation_id ON solutions(github_installation_id);
CREATE INDEX idx_solutions_github_repository_id ON solutions(github_repository_id);
CREATE INDEX idx_github_sync_logs_solution_id ON github_sync_logs(solution_id);
CREATE INDEX idx_github_sync_logs_status ON github_sync_logs(status);

-- Add trigger for updated_at
CREATE TRIGGER update_github_sync_logs_updated_at
  BEFORE UPDATE ON github_sync_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();