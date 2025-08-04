/*
  # Create product_variants table for dynamic size management

  1. New Tables
    - `product_variants`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `size_name` (text, e.g., "XS", "140×200")
      - `size_type` (text, e.g., 'pillow', 'mattress', 'bed')
      - `height_cm` (numeric, nullable, for pillow heights)
      - `width_cm` (numeric, nullable, for mattress/bed widths)
      - `length_cm` (numeric, nullable, for mattress/bed lengths)
      - `price` (numeric, variant-specific price)
      - `old_price` (numeric, nullable, for sale prices)
      - `in_stock` (boolean, availability status)
      - `display_order` (integer, for sorting in UI)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `product_variants` table
    - Add policy for public read access
    - Add policy for admin full access

  3. Indexes
    - Index on product_id for efficient lookups
    - Index on size_type for filtering by category
    - Index on display_order for sorting

  4. Constraints
    - Check constraint for valid size_type values
    - Check constraint for positive prices
    - Foreign key constraint to products table
*/

-- Create product_variants table
CREATE TABLE IF NOT EXISTS product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  size_name text NOT NULL,
  size_type text NOT NULL,
  height_cm numeric,
  width_cm numeric,
  length_cm numeric,
  price numeric NOT NULL,
  old_price numeric,
  in_stock boolean DEFAULT true,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'product_variants_product_id_fkey'
  ) THEN
    ALTER TABLE product_variants 
    ADD CONSTRAINT product_variants_product_id_fkey 
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Add check constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'valid_size_type'
  ) THEN
    ALTER TABLE product_variants 
    ADD CONSTRAINT valid_size_type 
    CHECK (size_type IN ('pillow', 'mattress', 'bed', 'sofa', 'blanket', 'furniture'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'positive_price'
  ) THEN
    ALTER TABLE product_variants 
    ADD CONSTRAINT positive_price 
    CHECK (price > 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'positive_old_price'
  ) THEN
    ALTER TABLE product_variants 
    ADD CONSTRAINT positive_old_price 
    CHECK (old_price IS NULL OR old_price > 0);
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id 
ON product_variants USING btree (product_id);

CREATE INDEX IF NOT EXISTS idx_product_variants_size_type 
ON product_variants USING btree (size_type);

CREATE INDEX IF NOT EXISTS idx_product_variants_display_order 
ON product_variants USING btree (display_order);

CREATE INDEX IF NOT EXISTS idx_product_variants_in_stock 
ON product_variants USING btree (in_stock);

-- Enable Row Level Security
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow public read access"
  ON product_variants
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can do everything"
  ON product_variants
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create trigger for updated_at
CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();