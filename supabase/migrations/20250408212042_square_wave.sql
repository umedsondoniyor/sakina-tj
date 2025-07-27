/*
  # Fix user profiles foreign key constraint

  1. Changes
    - Remove the invalid foreign key constraint from user_profiles table that references non-existent users table
    - The users table is managed by Supabase Auth and shouldn't have an explicit foreign key constraint

  2. Security
    - Maintains existing RLS policies
    - No changes to security settings
*/

DO $$ 
BEGIN
    -- Check if the constraint exists before trying to drop it
    IF EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'user_profiles_id_fkey' 
        AND table_name = 'user_profiles'
    ) THEN
        ALTER TABLE user_profiles DROP CONSTRAINT user_profiles_id_fkey;
    END IF;
END $$;