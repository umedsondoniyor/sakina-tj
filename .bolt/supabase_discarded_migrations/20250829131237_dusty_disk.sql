/*
  # Fix user profiles RLS policy for public registration

  1. Security Changes
    - Update INSERT policy to allow public users to create profiles
    - Keep existing policies for SELECT and UPDATE (authenticated users only)
    - Maintain admin access for all operations

  2. Notes
    - This allows the simplified registration form to work without authentication
    - Users can register with just phone, name, and date of birth
    - Existing security for viewing and updating profiles remains intact
*/

-- Drop the existing INSERT policy that requires authentication
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

-- Create new INSERT policy that allows public registration
CREATE POLICY "Allow public registration"
  ON user_profiles
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Ensure the SELECT policy still requires authentication for viewing profiles
-- (This should already exist but let's make sure)
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (uid() = id);

-- Ensure the UPDATE policy still requires authentication
-- (This should already exist but let's make sure)
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (uid() = id)
  WITH CHECK (uid() = id);