/*
  # Admin Credentials Setup

  1. Changes
    - Creates admin credentials table if not exists
    - Sets up admin check function
    - Adds necessary policies if they don't exist
  
  2. Security
    - Enables RLS
    - Adds admin-only policies
*/

-- Create admin credentials table if not exists
CREATE TABLE IF NOT EXISTS admin_credentials (
  email text PRIMARY KEY,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on admin_credentials
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;

-- Create or replace admin check function
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM user_profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create policy if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'admin_credentials' 
    AND policyname = 'Only admins can view credentials'
  ) THEN
    CREATE POLICY "Only admins can view credentials"
    ON admin_credentials
    FOR ALL
    TO authenticated
    USING (is_admin());
  END IF;
END $$;

-- Insert initial admin email
INSERT INTO admin_credentials (email)
VALUES ('admin@sakina.com')
ON CONFLICT (email) DO NOTHING;