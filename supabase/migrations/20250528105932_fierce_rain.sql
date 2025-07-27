/*
  # Fix Product Images Schema

  1. Changes
    - Add temporary image_url column for backward compatibility
    - Update triggers to maintain both fields
    - Migrate existing data
    
  2. Security
    - Maintain existing RLS policies
*/

-- Add temporary image_url column if it doesn't exist
ALTER TABLE products
ADD COLUMN IF NOT EXISTS image_url text;

-- Update trigger to maintain both fields
CREATE OR REPLACE FUNCTION sync_product_images()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Set image_url to first image from image_urls if available
    IF NEW.image_urls IS NOT NULL AND array_length(NEW.image_urls, 1) > 0 THEN
      NEW.image_url := NEW.image_urls[1];
    END IF;
    
    -- Ensure image_urls contains image_url if set
    IF NEW.image_url IS NOT NULL AND 
       (NEW.image_urls IS NULL OR NOT NEW.image_url = ANY(NEW.image_urls)) THEN
      NEW.image_urls := array_append(COALESCE(NEW.image_urls, ARRAY[]::text[]), NEW.image_url);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS sync_product_images_trigger ON products;
CREATE TRIGGER sync_product_images_trigger
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION sync_product_images();

-- Migrate existing data
UPDATE products 
SET image_url = image_urls[1]
WHERE image_urls IS NOT NULL 
  AND array_length(image_urls, 1) > 0 
  AND image_url IS NULL;