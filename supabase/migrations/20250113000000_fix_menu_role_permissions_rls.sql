/*
  # Fix RLS policies for menu_role_permissions table

  Problem: Only admins could read permissions, but all authenticated users need to read
  to determine which menu items they can access.

  Solution: Allow all authenticated users to read, but only admins can write.
*/

-- Drop the existing SELECT policy
DROP POLICY IF EXISTS "Admins can read menu role permissions" ON menu_role_permissions;

-- New policy: All authenticated users can read menu role permissions
-- This is necessary so users can see which menu items they have access to
CREATE POLICY "Authenticated users can read menu role permissions"
ON menu_role_permissions
FOR SELECT
TO authenticated
USING (true); -- All authenticated users can read

-- The INSERT, UPDATE, DELETE policies remain admin-only (correct)
