/*
  # Create customer reviews table

  1. New Tables
    - `customer_reviews`
      - `id` (uuid, primary key)
      - `username` (text)
      - `description` (text)
      - `image_url` (text)
      - `type` (text)
      - `instagram_url` (text)
      - `order` (integer)
      - `active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `customer_reviews` table
    - Add policies for:
      - Public read access
      - Admin write access
*/

-- Create customer reviews table
CREATE TABLE IF NOT EXISTS customer_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text NOT NULL,
  description text,
  image_url text NOT NULL,
  type text NOT NULL DEFAULT 'image',
  instagram_url text,
  "order" integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Add constraint to validate type
  CONSTRAINT valid_review_type CHECK (type IN ('image', 'video'))
);

-- Enable RLS
ALTER TABLE customer_reviews ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access"
  ON customer_reviews
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can do everything"
  ON customer_reviews
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create updated_at trigger
CREATE TRIGGER update_customer_reviews_updated_at
  BEFORE UPDATE ON customer_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_customer_reviews_order ON customer_reviews ("order");
CREATE INDEX IF NOT EXISTS idx_customer_reviews_active ON customer_reviews (active);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_type ON customer_reviews (type);

-- Insert initial reviews
INSERT INTO customer_reviews (username, description, image_url, type, instagram_url, "order", active)
VALUES 
  (
    '@azizka.m @farik.mukhtarov',
    'Блог о семье, любви и юмора. Автор цифрового контента.',
    'info-images/azizkam.png',
    'video',
    'https://www.instagram.com/reel/DDpOHYLuRRk',
    1,
    true
  ),
  (
    '@prozarnigor',
    'Психолог и коуч, Основательница Первого Женского Пространства',
    'info-images/prozarnigor.png',
    'video',
    'https://www.instagram.com/reel/DFVGof9I0l4',
    2,
    true
  ),
  (
    '@ibragimov.t.z',
    'Ибрагимов Тохир Основатель Tajikistan Fashion Week и модельного агентства Mood Models',
    'info-images/ibragimov.png',
    'video',
    'https://www.instagram.com/reel/DFo6_f6sEnq',
    3,
    true
  ),
  (
    '@sakina.tj',
    'Бехруз Зеваров Предприниматель, музыкальный продюсер и исследователь таджикского шоу-бизнеса Основатель лейбла Tamoshow',
    'info-images/behruz.png',
    'video',
    'https://www.instagram.com/reel/DFo6_f6sEnq',
    4,
    true
  )
ON CONFLICT (id) DO NOTHING;