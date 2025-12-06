/*
  # Fix RLS Policies for About Tables
  
  This migration ensures proper Row Level Security policies for all about_* tables:
  - Public read access for all users
  - Admin write access (INSERT, UPDATE, DELETE) for authenticated admin users
  - Uses the is_admin() function to check admin status
*/

-- Ensure is_admin() function exists
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

-- Ensure RLS is enabled on all about tables
ALTER TABLE about_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_team ENABLE ROW LEVEL SECURITY;

-- ============================================
-- ABOUT_SETTINGS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Allow public read access to about settings" ON about_settings;
DROP POLICY IF EXISTS "Allow admin manage about settings" ON about_settings;

CREATE POLICY "Allow public read access to about settings"
  ON about_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin manage about settings"
  ON about_settings
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================
-- ABOUT_STATS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Allow public read access to about stats" ON about_stats;
DROP POLICY IF EXISTS "Allow admin manage about stats" ON about_stats;

CREATE POLICY "Allow public read access to about stats"
  ON about_stats
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin manage about stats"
  ON about_stats
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================
-- ABOUT_VALUES POLICIES
-- ============================================
DROP POLICY IF EXISTS "Allow public read access to about values" ON about_values;
DROP POLICY IF EXISTS "Allow admin manage about values" ON about_values;

CREATE POLICY "Allow public read access to about values"
  ON about_values
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin manage about values"
  ON about_values
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================
-- ABOUT_TIMELINE POLICIES
-- ============================================
DROP POLICY IF EXISTS "Allow public read access to about timeline" ON about_timeline;
DROP POLICY IF EXISTS "Allow admin manage about timeline" ON about_timeline;

CREATE POLICY "Allow public read access to about timeline"
  ON about_timeline
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin manage about timeline"
  ON about_timeline
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================
-- ABOUT_TEAM POLICIES
-- ============================================
DROP POLICY IF EXISTS "Allow public read access to about team" ON about_team;
DROP POLICY IF EXISTS "Allow admin manage about team" ON about_team;

CREATE POLICY "Allow public read access to about team"
  ON about_team
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin manage about team"
  ON about_team
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

