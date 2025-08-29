/*
  # Create navigation items table

  1. New Tables
    - `navigation_items`
      - `id` (uuid, primary key)
      - `title` (text, menu item title)
      - `category_slug` (text, category identifier)
      - `icon_name` (text, lucide icon name)
      - `icon_image_url` (text, custom icon image URL)
      - `order_index` (integer, display order)
      - `is_active` (boolean, visibility)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `navigation_items` table
    - Add policy for public read access to active items
    - Add policy for admin management

  3. Initial Data
    - Insert default navigation items
*/

CREATE TABLE IF NOT EXISTS navigation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category_slug text NOT NULL,
  icon_name text,
  icon_image_url text,
  order_index integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE navigation_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active navigation items"
  ON navigation_items
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage navigation items"
  ON navigation_items
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_navigation_items_updated_at
  BEFORE UPDATE ON navigation_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default navigation items
INSERT INTO navigation_items (title, category_slug, icon_name, order_index) VALUES
  ('Матрасы', 'mattresses', 'BedDouble', 1),
  ('Кровать', 'beds', 'Sofa', 2),
  ('Массажное кресло', 'smartchair', null, 3),
  ('Карта', 'map', 'Earth', 4),
  ('О нас', 'about', 'Users', 5);

-- Update the smartchair item to use custom icon
UPDATE navigation_items 
SET icon_image_url = '/icons/filledSmartChair.png' 
WHERE category_slug = 'smartchair';