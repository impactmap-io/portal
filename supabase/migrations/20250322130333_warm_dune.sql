/*
  # Update Goal Status and Contract Integration

  1. Changes
    - Update goal_status enum to match new contract flow
    - Add contract relationship to goals
    - Add deployment tracking
    - Update existing goals to new status format

  2. Security
    - Maintain existing RLS policies
    - Add policies for contract relationships
*/

-- Update goal_status enum
ALTER TYPE goal_status ADD VALUE IF NOT EXISTS 'live';
ALTER TYPE goal_status ADD VALUE IF NOT EXISTS 'terminated';

-- Add contract relationship to goals
ALTER TABLE goals
ADD COLUMN contract_id uuid REFERENCES contracts(id),
ADD COLUMN deployed_at timestamptz,
ADD COLUMN deployed_by uuid REFERENCES auth.users(id);

-- Add deployment tracking
CREATE TABLE goal_deployments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE,
  version int NOT NULL,
  status text NOT NULL,
  deployed_by uuid REFERENCES auth.users(id),
  deployed_at timestamptz NOT NULL DEFAULT now(),
  contract_context jsonb,
  metadata jsonb
);

-- Enable RLS
ALTER TABLE goal_deployments ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can read goal deployments"
  ON goal_deployments FOR SELECT
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

-- Add indexes
CREATE INDEX idx_goals_contract_id ON goals(contract_id);
CREATE INDEX idx_goal_deployments_goal_id ON goal_deployments(goal_id);
CREATE INDEX idx_goal_deployments_deployed_at ON goal_deployments(deployed_at);