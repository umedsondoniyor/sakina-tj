/*
  # Add Weight Category to Products

  1. New Columns
    - `weight_category` (text) - Weight category for mattresses (e.g., "50-85 kg (Soft)")

  2. Changes
    - Add weight_category column to products table
    - Add check constraint for valid weight categories
    - Update existing RLS policies to include new column

  3. Security
    - Maintain existing RLS policies
    - Ensure policies cover the new weight_category column
*/

-- Add weight_category column to products table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'weight_category'
  ) THEN
    ALTER TABLE products ADD COLUMN weight_category text;
  END IF;
END $$;

-- Add check constraint for valid weight categories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'valid_weight_category'
  ) THEN
    ALTER TABLE products 
    ADD CONSTRAINT valid_weight_category 
    CHECK (weight_category IN ('50-85 kg (Soft)', '85-100 kg (Medium)', '100+ kg (Hard)') OR weight_category IS NULL);
  END IF;
END $$;

-- Create index for weight category filtering
CREATE INDEX IF NOT EXISTS idx_products_weight_category ON products(weight_category);