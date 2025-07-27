/*
  # Fix Customer Reviews RLS Policies

  1. Changes
    - Drop existing RLS policies
    - Create new policies with proper permissions
    - Add admin check function if not exists

  2. Security
    - Allow public read access
    - Allow admins full access
    - Enable RLS
*/

-- First ensure the admin check function exists
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

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access" ON customer_reviews;
DROP POLICY IF EXISTS "Admins can do everything" ON customer_reviews;

-- Create new policies with proper permissions
CREATE POLICY "Allow public read access"
ON customer_reviews
FOR SELECT
TO public
USING (true);

CREATE POLICY "Admins can do everything"
ON customer_reviews
FOR ALL
TO authenticated
USING (is_admin());

-- Ensure RLS is enabled
ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;