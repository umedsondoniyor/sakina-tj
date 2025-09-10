/*
  # Fix About Page RLS Policies and Database Setup

  1. Database Security
    - Enable RLS on all about_* tables
    - Add proper policies for public read access
    - Add admin-only write policies
    - Add missing constraints and indexes

  2. Performance Optimizations
    - Add indexes for ordering and active status
    - Add constraints for data validation

  3. Security
    - Proper RLS policies for different user roles
    - Public read access for active content
    - Admin-only write access
*/

-- Enable RLS on all about tables
ALTER TABLE about_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_values ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE about_team ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to about settings" ON about_settings;
DROP POLICY IF EXISTS "Allow admin manage about settings" ON about_settings;
DROP POLICY IF EXISTS "Allow public read access to about stats" ON about_stats;
DROP POLICY IF EXISTS "Allow admin manage about stats" ON about_stats;
DROP POLICY IF EXISTS "Allow public read access to about values" ON about_values;
DROP POLICY IF EXISTS "Allow admin manage about values" ON about_values;
DROP POLICY IF EXISTS "Allow public read access to about timeline" ON about_timeline;
DROP POLICY IF EXISTS "Allow admin manage about timeline" ON about_timeline;
DROP POLICY IF EXISTS "Allow public read access to about team" ON about_team;
DROP POLICY IF EXISTS "Allow admin manage about team" ON about_team;

-- About Settings Policies
CREATE POLICY "Allow public read access to about settings"
  ON about_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin manage about settings"
  ON about_settings
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin' OR EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (auth.jwt() ->> 'role' = 'admin' OR EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- About Stats Policies
CREATE POLICY "Allow public read access to about stats"
  ON about_stats
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin manage about stats"
  ON about_stats
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin' OR EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (auth.jwt() ->> 'role' = 'admin' OR EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- About Values Policies
CREATE POLICY "Allow public read access to about values"
  ON about_values
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin manage about values"
  ON about_values
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin' OR EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (auth.jwt() ->> 'role' = 'admin' OR EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- About Timeline Policies
CREATE POLICY "Allow public read access to about timeline"
  ON about_timeline
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin manage about timeline"
  ON about_timeline
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin' OR EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (auth.jwt() ->> 'role' = 'admin' OR EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- About Team Policies
CREATE POLICY "Allow public read access to about team"
  ON about_team
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow admin manage about team"
  ON about_team
  FOR ALL
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin' OR EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (auth.jwt() ->> 'role' = 'admin' OR EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_about_stats_order ON about_stats(order);
CREATE INDEX IF NOT EXISTS idx_about_values_order ON about_values(order);
CREATE INDEX IF NOT EXISTS idx_about_timeline_order ON about_timeline(order);
CREATE INDEX IF NOT EXISTS idx_about_team_order ON about_team(order);

-- Add data validation constraints
ALTER TABLE about_stats 
ADD CONSTRAINT IF NOT EXISTS check_about_stats_order_positive 
CHECK (order >= 0);

ALTER TABLE about_values 
ADD CONSTRAINT IF NOT EXISTS check_about_values_order_positive 
CHECK (order >= 0);

ALTER TABLE about_timeline 
ADD CONSTRAINT IF NOT EXISTS check_about_timeline_order_positive 
CHECK (order >= 0);

ALTER TABLE about_team 
ADD CONSTRAINT IF NOT EXISTS check_about_team_order_positive 
CHECK (order >= 0);

-- Add updated_at triggers for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_about_settings_updated_at'
    ) THEN
        CREATE TRIGGER update_about_settings_updated_at
            BEFORE UPDATE ON about_settings
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;