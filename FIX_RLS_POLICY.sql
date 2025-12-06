-- ============================================
-- FIX ONE-CLICK ORDERS RLS POLICY
-- ============================================
-- Run this SQL in your Supabase SQL Editor
-- This fixes the Row Level Security policy that's blocking public users from creating orders
-- ============================================

-- First, let's see what policies currently exist
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'one_click_orders'
ORDER BY policyname;

-- Drop ALL existing policies on one_click_orders to start fresh
DROP POLICY IF EXISTS "Allow public to create one-click orders" ON one_click_orders;
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

-- Verify the policies were created
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'one_click_orders'
ORDER BY policyname;
