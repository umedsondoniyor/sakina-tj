/*
  # Create Admin User Migration
  
  1. Changes
    - Creates admin user profile with admin role
    - Sets up admin role check function
    - Adds admin policies
*/

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

-- Create admin policies
DO $$
BEGIN
  -- Products policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'products' 
    AND policyname = 'Admins can do everything'
  ) THEN
    CREATE POLICY "Admins can do everything" 
    ON products 
    FOR ALL 
    TO authenticated 
    USING (is_admin())
    WITH CHECK (is_admin());
  END IF;

  -- Categories policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'categories' 
    AND policyname = 'Admins can do everything'
  ) THEN
    CREATE POLICY "Admins can do everything" 
    ON categories 
    FOR ALL 
    TO authenticated 
    USING (is_admin())
    WITH CHECK (is_admin());
  END IF;
END $$;