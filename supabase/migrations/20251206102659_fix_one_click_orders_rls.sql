/*
  # Fix one-click orders RLS policy
  
  The existing policy might not be working correctly. This migration:
  1. Drops all existing policies
  2. Creates new policies that allow anon (anonymous) and authenticated users to create orders
  3. Ensures admins can view and update orders
  4. Uses proper Supabase role names (anon instead of public)
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow public to create one-click orders" ON one_click_orders;
DROP POLICY IF EXISTS "Allow anon to create one-click orders" ON one_click_orders;
DROP POLICY IF EXISTS "Allow authenticated to create one-click orders" ON one_click_orders;
DROP POLICY IF EXISTS "Admins can view all one-click orders" ON one_click_orders;
DROP POLICY IF EXISTS "Admins can update one-click orders" ON one_click_orders;

-- IMPORTANT: In Supabase, anonymous users use the 'anon' role, not 'public'
-- Create policy for anonymous users (unauthenticated) to INSERT
CREATE POLICY "Allow anon to create one-click orders"
  ON one_click_orders
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Also allow authenticated users to create orders (in case they're logged in)
CREATE POLICY "Allow authenticated to create one-click orders"
  ON one_click_orders
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Allow admins to view all orders
CREATE POLICY "Admins can view all one-click orders"
  ON one_click_orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Allow admins to update order status
CREATE POLICY "Admins can update one-click orders"
  ON one_click_orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Ensure RLS is enabled
ALTER TABLE one_click_orders ENABLE ROW LEVEL SECURITY;
