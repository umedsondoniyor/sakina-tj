/*
  # Create user profiles table

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `phone` (text)
      - `full_name` (text)
      - `date_of_birth` (date)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `user_profiles` table
    - Add policies for authenticated users to:
      - Read their own profile
      - Update their own profile
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  phone text,
  full_name text,
  date_of_birth date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own profile
CREATE POLICY "Users can read own profile" 
  ON user_profiles 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

-- Policy to allow users to update their own profile
CREATE POLICY "Users can update own profile" 
  ON user_profiles 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

-- Policy to allow users to insert their own profile
CREATE POLICY "Users can insert own profile" 
  ON user_profiles 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = id);