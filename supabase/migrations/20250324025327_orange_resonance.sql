/*
  # Add Hubs Support

  1. New Tables
    - hubs
      - Core table for managing tenant hubs
      - Includes settings and billing info
    - hub_domains
      - Tracks custom domains for hubs
      - Manages domain verification status

  2. Security
    - RLS policies for hub access
    - Team-based access control
*/

-- Create hub_status enum
CREATE TYPE hub_status AS ENUM ('active', 'archived', 'suspended');

-- Create billing_plan enum
CREATE TYPE billing_plan AS ENUM ('free', 'pro', 'enterprise');

-- Create domain_status enum
CREATE TYPE domain_status AS ENUM ('pending', 'verified', 'failed');

-- Create hubs table
CREATE TABLE hubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  status hub_status NOT NULL DEFAULT 'active',
  settings jsonb DEFAULT '{}',
  billing_plan billing_plan NOT NULL DEFAULT 'free',
  subscription_id text,
  trial_ends_at timestamptz,
  owner_id uuid REFERENCES auth.users(id),
  team jsonb DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create hub_domains table
CREATE TABLE hub_domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id uuid REFERENCES hubs(id) ON DELETE CASCADE,
  domain text NOT NULL UNIQUE,
  status domain_status NOT NULL DEFAULT 'pending',
  verification_token text,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE hubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hub_domains ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their hubs"
  ON hubs FOR SELECT
  TO authenticated
  USING (
    auth.uid() = owner_id OR 
    auth.uid()::text = ANY(ARRAY(SELECT jsonb_array_elements_text(team)))
  );

CREATE POLICY "Users can update their hubs"
  ON hubs FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = owner_id OR 
    auth.uid()::text = ANY(ARRAY(SELECT jsonb_array_elements_text(team)))
  );

CREATE POLICY "Users can read hub domains"
  ON hub_domains FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM hubs h
      WHERE h.id = hub_id
      AND (
        auth.uid() = h.owner_id OR 
        auth.uid()::text = ANY(ARRAY(SELECT jsonb_array_elements_text(h.team)))
      )
    )
  );

-- Add triggers for updated_at
CREATE TRIGGER update_hubs_updated_at
  BEFORE UPDATE ON hubs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_hub_domains_updated_at
  BEFORE UPDATE ON hub_domains
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Add indexes
CREATE INDEX idx_hubs_name ON hubs(name);
CREATE INDEX idx_hubs_owner_id ON hubs(owner_id);
CREATE INDEX idx_hub_domains_hub_id ON hub_domains(hub_id);
CREATE INDEX idx_hub_domains_domain ON hub_domains(domain);