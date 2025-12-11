/*
  # Create menu_role_permissions table

  1. New Table
    - `menu_role_permissions`
      - `id` (uuid, primary key)
      - `path` (text, unique) - menu item path
      - `label` (text) - menu item label
      - `section` (text) - menu section name
      - `roles` (text[]) - array of allowed roles
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Only admins can read/write
*/

CREATE TABLE IF NOT EXISTS menu_role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text UNIQUE NOT NULL,
  label text NOT NULL,
  section text NOT NULL,
  roles text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE menu_role_permissions ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can read menu role permissions
CREATE POLICY "Admins can read menu role permissions"
ON menu_role_permissions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

-- Policy: Only admins can insert menu role permissions
CREATE POLICY "Admins can insert menu role permissions"
ON menu_role_permissions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

-- Policy: Only admins can update menu role permissions
CREATE POLICY "Admins can update menu role permissions"
ON menu_role_permissions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

-- Policy: Only admins can delete menu role permissions
CREATE POLICY "Admins can delete menu role permissions"
ON menu_role_permissions
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.role = 'admin'
  )
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_menu_role_permissions_path ON menu_role_permissions(path);
CREATE INDEX IF NOT EXISTS idx_menu_role_permissions_section ON menu_role_permissions(section);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_menu_role_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_menu_role_permissions_updated_at
  BEFORE UPDATE ON menu_role_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_menu_role_permissions_updated_at();
