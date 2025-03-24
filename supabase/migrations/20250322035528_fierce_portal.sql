/*
  # Solution-Goal Relationships

  1. New Tables
    - solution_goals
      - Many-to-many relationship between solutions and goals
      - Tracks contribution metrics and progress
    - goal_dependencies
      - Tracks dependencies between goals
      - Enables goal hierarchy and relationships

  2. Changes
    - Remove direct solutionId from goals table
    - Add weight and progress tracking
*/

-- Remove solution_id from goals
ALTER TABLE goals DROP COLUMN solution_id;

-- Add goal hierarchy support
ALTER TABLE goals
ADD COLUMN parent_goal_id uuid REFERENCES goals(id),
ADD COLUMN weight float DEFAULT 1.0,
ADD COLUMN progress float DEFAULT 0.0;

-- Create solution_goals junction table
CREATE TABLE solution_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id uuid REFERENCES solutions(id) ON DELETE CASCADE,
  goal_id uuid REFERENCES goals(id) ON DELETE CASCADE,
  contribution_weight float DEFAULT 1.0,
  contribution_percentage float DEFAULT 0.0,
  metrics jsonb DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(solution_id, goal_id)
);

-- Create goal_dependencies table
CREATE TABLE goal_dependencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dependent_goal_id uuid REFERENCES goals(id) ON DELETE CASCADE,
  dependency_goal_id uuid REFERENCES goals(id) ON DELETE CASCADE,
  relationship_type text NOT NULL,
  impact_weight float DEFAULT 1.0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(dependent_goal_id, dependency_goal_id),
  CHECK (dependent_goal_id != dependency_goal_id)
);

-- Enable RLS
ALTER TABLE solution_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_dependencies ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Users can read solution goals"
  ON solution_goals FOR SELECT
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

CREATE POLICY "Users can read goal dependencies"
  ON goal_dependencies FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM goals g
      WHERE g.id IN (dependent_goal_id, dependency_goal_id)
      AND EXISTS (
        SELECT 1 FROM solution_goals sg
        JOIN solutions s ON s.id = sg.solution_id
        WHERE sg.goal_id = g.id
        AND (
          auth.uid() = s.owner OR 
          auth.uid()::text = ANY(ARRAY(SELECT jsonb_array_elements_text(s.team)))
        )
      )
    )
  );

-- Add triggers for updated_at
CREATE TRIGGER update_solution_goals_updated_at
  BEFORE UPDATE ON solution_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_goal_dependencies_updated_at
  BEFORE UPDATE ON goal_dependencies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();