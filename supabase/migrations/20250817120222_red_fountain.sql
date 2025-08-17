/*
  # Create Quiz Steps and Options Tables

  1. New Tables
    - `quiz_steps`
      - `id` (uuid, primary key)
      - `label` (text) - The question text displayed to users
      - `step_key` (text, unique) - Internal identifier for the step
      - `order_index` (integer) - Display order of the step
      - `is_active` (boolean) - Whether the step is currently active
      - `parent_step_key` (text, optional) - For conditional steps
      - `parent_value` (text, optional) - Required parent value to show this step
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `quiz_step_options`
      - `id` (uuid, primary key)
      - `step_id` (uuid, foreign key) - References quiz_steps.id
      - `option_value` (text) - The value stored when this option is selected
      - `option_label` (text) - The display text for the option
      - `image_url` (text) - URL for the option's image
      - `order_index` (integer) - Display order within the step
      - `is_active` (boolean) - Whether the option is currently active
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access and admin management

  3. Indexes
    - Add indexes for performance on commonly queried columns
*/

-- Create quiz_steps table
CREATE TABLE IF NOT EXISTS quiz_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  step_key text UNIQUE NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  parent_step_key text,
  parent_value text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create quiz_step_options table with proper foreign key
CREATE TABLE IF NOT EXISTS quiz_step_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  step_id uuid NOT NULL REFERENCES quiz_steps(id) ON DELETE CASCADE,
  option_value text NOT NULL,
  option_label text NOT NULL,
  image_url text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE quiz_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_step_options ENABLE ROW LEVEL SECURITY;

-- Create policies for quiz_steps
CREATE POLICY "Allow public read access to active quiz steps"
  ON quiz_steps
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage quiz steps"
  ON quiz_steps
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create policies for quiz_step_options
CREATE POLICY "Allow public read access to active quiz options"
  ON quiz_step_options
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage quiz options"
  ON quiz_step_options
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_quiz_steps_order ON quiz_steps(order_index);
CREATE INDEX IF NOT EXISTS idx_quiz_steps_active ON quiz_steps(is_active);
CREATE INDEX IF NOT EXISTS idx_quiz_steps_parent ON quiz_steps(parent_step_key, parent_value);

CREATE INDEX IF NOT EXISTS idx_quiz_options_step_id ON quiz_step_options(step_id);
CREATE INDEX IF NOT EXISTS idx_quiz_options_order ON quiz_step_options(order_index);
CREATE INDEX IF NOT EXISTS idx_quiz_options_active ON quiz_step_options(is_active);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_quiz_steps_updated_at'
  ) THEN
    CREATE TRIGGER update_quiz_steps_updated_at
      BEFORE UPDATE ON quiz_steps
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'update_quiz_step_options_updated_at'
  ) THEN
    CREATE TRIGGER update_quiz_step_options_updated_at
      BEFORE UPDATE ON quiz_step_options
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;