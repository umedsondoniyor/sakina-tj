/*
  # Add mattress characteristics fields to products table

  1. New Columns
    - `mattress_type` (text) - Type of mattress (e.g., "Ортопедический")
    - `hardness` (text) - Hardness level (e.g., "Средняя")
    - `spring_count` (integer) - Number of springs
    - `spring_block_type` (text) - Type of spring block (e.g., "Независимый")
    - `cover_material` (text) - Cover material (e.g., "Трикотаж")
    - `removable_cover` (boolean) - Whether cover is removable
    - `filler_material` (text) - Filler material (e.g., "Анатомическая пена + кокосовая койра")
    - `warranty_years` (integer) - Warranty period in years
    - `recommended_mattress_pad` (text) - Recommended mattress pad
    - `country_of_origin` (text) - Country of manufacture

  2. Security
    - These fields are optional for all categories except mattresses
    - Admin can manage all characteristics
    - Public can read all characteristics
*/

-- Add mattress characteristics columns
DO $$
BEGIN
  -- Mattress type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'mattress_type'
  ) THEN
    ALTER TABLE products ADD COLUMN mattress_type text;
  END IF;

  -- Hardness level
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'hardness'
  ) THEN
    ALTER TABLE products ADD COLUMN hardness text;
  END IF;

  -- Spring count
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'spring_count'
  ) THEN
    ALTER TABLE products ADD COLUMN spring_count integer;
  END IF;

  -- Spring block type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'spring_block_type'
  ) THEN
    ALTER TABLE products ADD COLUMN spring_block_type text;
  END IF;

  -- Cover material
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'cover_material'
  ) THEN
    ALTER TABLE products ADD COLUMN cover_material text;
  END IF;

  -- Removable cover
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'removable_cover'
  ) THEN
    ALTER TABLE products ADD COLUMN removable_cover boolean DEFAULT false;
  END IF;

  -- Filler material
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'filler_material'
  ) THEN
    ALTER TABLE products ADD COLUMN filler_material text;
  END IF;

  -- Warranty years
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'warranty_years'
  ) THEN
    ALTER TABLE products ADD COLUMN warranty_years integer DEFAULT 8;
  END IF;

  -- Recommended mattress pad
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'recommended_mattress_pad'
  ) THEN
    ALTER TABLE products ADD COLUMN recommended_mattress_pad text;
  END IF;

  -- Country of origin
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'country_of_origin'
  ) THEN
    ALTER TABLE products ADD COLUMN country_of_origin text DEFAULT 'Таджикистан';
  END IF;
END $$;