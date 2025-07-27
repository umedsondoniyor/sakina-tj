/*
  # Add image_urls array to products table

  1. Changes
    - Add `image_urls` column of type text[] to products table
    - Remove redundant `image_url` column
    - Migrate existing image_url data to image_urls array
    - Update RLS policies to include new column

  2. Security
    - Maintain existing RLS policies
    - Ensure policies cover the new image_urls column
*/

-- First, add the new image_urls column
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS image_urls text[] DEFAULT '{}';

-- Migrate existing image_url data to image_urls array
DO $$
BEGIN
  UPDATE products 
  SET image_urls = ARRAY[image_url]
  WHERE image_url IS NOT NULL 
    AND (image_urls IS NULL OR array_length(image_urls, 1) IS NULL);
END $$;

-- Remove the old image_url column
ALTER TABLE products 
DROP COLUMN IF EXISTS image_url;

-- Ensure RLS policies are up to date
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Recreate policies to ensure they cover all columns including image_urls
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Admins can do everything" ON products;
  DROP POLICY IF EXISTS "Allow authenticated users to create products" ON products;
  DROP POLICY IF EXISTS "Allow authenticated users to update their products" ON products;
  DROP POLICY IF EXISTS "Allow public read access" ON products;
END $$;

CREATE POLICY "Admins can do everything"
ON products
FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Allow authenticated users to create products"
ON products
FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update their products"
ON products
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow public read access"
ON products
FOR SELECT
TO public
USING (true);