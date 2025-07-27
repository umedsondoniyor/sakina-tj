-- Create admin check function if not exists
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

-- Create or update admin profile table
CREATE TABLE IF NOT EXISTS admin_credentials (
  email text PRIMARY KEY,
  created_at timestamptz DEFAULT now()
);

-- Insert admin email (actual user will be created via Edge Function)
INSERT INTO admin_credentials (email)
VALUES ('admin@sakina.com')
ON CONFLICT (email) DO NOTHING;

-- Enable RLS
ALTER TABLE admin_credentials ENABLE ROW LEVEL SECURITY;

-- Add RLS policy
CREATE POLICY "Only admins can view credentials"
ON admin_credentials
FOR ALL
TO authenticated
USING (is_admin());