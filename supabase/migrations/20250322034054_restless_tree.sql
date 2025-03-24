/*
  # Add Git Repository Integration

  1. Changes
    - Add repository information to solutions table
    - Track Git repository details and sync status
    - Store last commit information

  2. Security
    - Maintain existing RLS policies
    - Add policies for repository data access
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