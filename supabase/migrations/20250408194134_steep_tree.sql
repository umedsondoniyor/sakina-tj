/*
  # Add admin role to user_profiles

  1. Changes
    - Add role column to user_profiles table
    - Add admin role check function
    - Update RLS policies to include admin access
*/

-- Add role column to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS role text DEFAULT 'user';

-- Create admin check function
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

-- Update RLS policies to allow admin access
CREATE POLICY "Admins can do everything" 
ON products 
FOR ALL 
TO authenticated 
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Admins can do everything" 
ON categories 
FOR ALL 
TO authenticated 
USING (is_admin())
WITH CHECK (is_admin());