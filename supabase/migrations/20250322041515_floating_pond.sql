/*
  # Add Outcomes Model
  
  1. New Tables
    - outcomes
      - Tracks actual results from solutions
      - Links to goals and solutions
      - Includes metrics and measurements
    - outcome_impacts
      - Maps outcomes to their impacts
      - Tracks stakeholder effects

  2. Security
    - RLS policies for data access
    - Team-based access control
*/

-- Create outcomes table
CREATE TABLE outcomes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  solution_id uuid REFERENCES solutions(id) ON DELETE CASCADE,
  goal_id uuid REFERENCES goals(id),
  status text NOT NULL DEFAULT 'measured',
  metrics jsonb DEFAULT '{}',
  measured_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create outcome_impacts junction table
CREATE TABLE outcome_impacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  outcome_id uuid REFERENCES outcomes(id) ON DELETE CASCADE,
  impact_id uuid REFERENCES impacts(id) ON DELETE CASCADE,
  effect_strength float DEFAULT 1.0,
  effect_type text NOT NULL,
  evidence text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(outcome_id, impact_id)
);

-- Enable RLS
ALTER TABLE outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE outcome_impacts ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can read outcomes"
  ON outcomes FOR SELECT
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

CREATE POLICY "Users can read outcome impacts"
  ON outcome_impacts FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM outcomes o
      JOIN solutions s ON s.id = o.solution_id
      WHERE o.id = outcome_id
      AND (
        auth.uid() = s.owner OR 
        auth.uid()::text = ANY(ARRAY(SELECT jsonb_array_elements_text(s.team)))
      )
    )
  );

-- Add triggers
CREATE TRIGGER update_outcomes_updated_at
  BEFORE UPDATE ON outcomes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_outcome_impacts_updated_at
  BEFORE UPDATE ON outcome_impacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add indexes
CREATE INDEX idx_outcomes_solution_id ON outcomes(solution_id);
CREATE INDEX idx_outcomes_goal_id ON outcomes(goal_id);
CREATE INDEX idx_outcome_impacts_outcome_id ON outcome_impacts(outcome_id);
CREATE INDEX idx_outcome_impacts_impact_id ON outcome_impacts(impact_id);