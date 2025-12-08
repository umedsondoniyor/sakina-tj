/*
  # Create Showrooms Table

  1. New Table
    - `showrooms`
      - `id` (uuid, primary key)
      - `name` (text) - Name of the showroom
      - `address` (text) - Full address
      - `map_link` (text) - Google Maps or other map service link
      - `phone` (text, optional) - Phone number for this location
      - `order_index` (integer) - Display order
      - `is_active` (boolean) - Whether the showroom is active
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on showrooms table
    - Public read access for active showrooms
    - Admin management access

  3. Indexes
    - Add indexes for performance
*/

-- Create showrooms table
CREATE TABLE IF NOT EXISTS showrooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  map_link text NOT NULL,
  phone text,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE showrooms ENABLE ROW LEVEL SECURITY;

-- Create policies for showrooms
CREATE POLICY "Allow public read access to active showrooms"
  ON showrooms
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage showrooms"
  ON showrooms
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_showrooms_order ON showrooms(order_index);
CREATE INDEX IF NOT EXISTS idx_showrooms_active ON showrooms(is_active);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_showrooms_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_showrooms_updated_at
  BEFORE UPDATE ON showrooms
  FOR EACH ROW
  EXECUTE FUNCTION update_showrooms_updated_at();

-- Insert default showroom
INSERT INTO showrooms (name, address, map_link, order_index, is_active)
VALUES ('Душанбе, Пулоди 4', 'Душанбе, Пулоди 4', 'https://maps.app.goo.gl/5exgpkraKy9foeD27', 0, true)
ON CONFLICT DO NOTHING;

