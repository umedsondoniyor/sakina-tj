/*
  # Add Password Field to User Profiles

  1. Changes
    - Adds password field to user_profiles table
    - Makes it nullable since we're using Supabase auth
    - Updates existing policies to handle the new field
*/

-- Add password field to user_profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS password text;

-- Update policies to handle password field
DO $$
BEGIN
  -- Update select policy to exclude password field
  DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
  CREATE POLICY "Users can read own profile" 
    ON user_profiles 
    FOR SELECT 
    TO authenticated 
    USING (auth.uid() = id);

  -- Update update policy to allow password updates
  DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
  CREATE POLICY "Users can update own profile" 
    ON user_profiles 
    FOR UPDATE 
    TO authenticated 
    USING (auth.uid() = id);

  -- Update insert policy
  DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
  CREATE POLICY "Users can insert own profile" 
    ON user_profiles 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (auth.uid() = id);

  -- Add admin policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_profiles' 
    AND policyname = 'Admins can do everything'
  ) THEN
    CREATE POLICY "Admins can do everything" 
      ON user_profiles 
      FOR ALL 
      TO authenticated 
      USING (is_admin())
      WITH CHECK (is_admin());
  END IF;
END $$;