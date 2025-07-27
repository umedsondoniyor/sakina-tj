/*
  # Create carousel slides table

  1. New Tables
    - `carousel_slides`
      - `id` (uuid, primary key)
      - `title` (text)
      - `subtitle` (text, nullable)
      - `image_url` (text)
      - `order` (integer)
      - `active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `carousel_slides` table
    - Add policies for:
      - Public read access
      - Admin write access
*/

-- Create carousel slides table
CREATE TABLE IF NOT EXISTS carousel_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  subtitle text,
  image_url text NOT NULL,
  "order" integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE carousel_slides ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access"
  ON carousel_slides
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can do everything"
  ON carousel_slides
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create updated_at trigger
CREATE TRIGGER update_carousel_slides_updated_at
  BEFORE UPDATE ON carousel_slides
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_carousel_slides_order ON carousel_slides ("order");
CREATE INDEX IF NOT EXISTS idx_carousel_slides_active ON carousel_slides (active);

-- Insert some initial slides
INSERT INTO carousel_slides (title, subtitle, image_url, "order", active)
VALUES 
  (
    'Бери больше — плати меньше',
    'Скидки до 9% на комплекты',
    'https://ir.askona.ru/upload/banner_main/detail_1915757_1738936964.jpg',
    1,
    true
  ),
  (
    'Новая коллекция матрасов',
    'Инновационные технологии сна',
    'https://ir.askona.ru/upload/banner_main/detail_1910617_1738528695.jpg',
    2,
    true
  ),
  (
    'Эргономичные кровати',
    'Для здорового сна',
    'https://ir.askona.ru/upload/banner_main/detail_1910618_1738528863.jpg',
    3,
    true
  )
ON CONFLICT (id) DO NOTHING;