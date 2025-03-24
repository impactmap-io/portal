/*
  # Repository Schema Update

  1. Changes
    - Add repository information to solutions table
    - Add repository type enum
    - Add repository URL and commit tracking
    - Add appropriate indexes and constraints

  2. Security
    - Maintain existing RLS policies
    - Add validation for repository URLs
*/

-- Create repository type enum
CREATE TYPE repository_type AS ENUM ('github', 'gitlab', 'bitbucket');

-- Add repository columns to solutions table
ALTER TABLE solutions
ADD COLUMN repository_type repository_type,
ADD COLUMN repository_url text,
ADD COLUMN repository_last_commit jsonb;

-- Add index for repository URL
CREATE INDEX idx_solutions_repository_url ON solutions(repository_url);

-- Add repository URL validation
ALTER TABLE solutions
ADD CONSTRAINT valid_repository_url 
CHECK (
  repository_url IS NULL OR 
  repository_url ~* '^https?://[^\s/$.?#].[^\s]*$'
);

-- Add constraint to ensure repository type and URL are both present or both null
ALTER TABLE solutions
ADD CONSTRAINT repository_info_consistency
CHECK (
  (repository_type IS NULL AND repository_url IS NULL) OR
  (repository_type IS NOT NULL AND repository_url IS NOT NULL)
);

-- Update solutions policies to include repository access
CREATE POLICY "Users can update repository info"
  ON solutions FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = owner OR 
    auth.uid()::text = ANY(ARRAY(SELECT jsonb_array_elements_text(team)))
  )
  WITH CHECK (
    auth.uid() = owner OR 
    auth.uid()::text = ANY(ARRAY(SELECT jsonb_array_elements_text(team)))
  );