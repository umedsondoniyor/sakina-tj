/*
  # Multi-location inventory system

  1. New Tables
    - `locations`
      - `id` (uuid, primary key)
      - `name` (text, unique, not null)
      - `address` (text)
      - `phone` (text)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `inventory`
      - `location_id` (uuid, foreign key to locations)
      - `product_variant_id` (uuid, foreign key to product_variants)
      - `stock_quantity` (integer, default 0)
      - `in_stock` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - Primary key: (location_id, product_variant_id)

  2. Changes
    - Remove `stock_quantity` and `in_stock` from `product_variants` table
    - Insert default "Main Store" location
    - Migrate existing stock data to new inventory table

  3. Security
    - Enable RLS on both new tables
    - Add policies for public read access and admin management
*/

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  address text,
  phone text,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create inventory table
CREATE TABLE IF NOT EXISTS inventory (
  location_id uuid NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
  product_variant_id uuid NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
  stock_quantity integer DEFAULT 0 NOT NULL,
  in_stock boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (location_id, product_variant_id)
);

-- Add constraints
ALTER TABLE inventory ADD CONSTRAINT positive_stock_quantity CHECK (stock_quantity >= 0);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_location_id ON inventory(location_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product_variant_id ON inventory(product_variant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_in_stock ON inventory(in_stock);
CREATE INDEX IF NOT EXISTS idx_locations_active ON locations(is_active);

-- Enable RLS
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for locations
CREATE POLICY "Allow public read access to active locations"
  ON locations
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage locations"
  ON locations
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Add RLS policies for inventory
CREATE POLICY "Allow public read access to inventory"
  ON inventory
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage inventory"
  ON inventory
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Add triggers for updated_at
CREATE TRIGGER update_locations_updated_at
  BEFORE UPDATE ON locations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON inventory
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default location
INSERT INTO locations (name, address, phone, is_active)
VALUES ('Main Store', 'Душанбе, Таджикистан', '+992 90 533 9595', true)
ON CONFLICT (name) DO NOTHING;

-- Migrate existing stock data from product_variants to inventory
DO $$
DECLARE
  default_location_id uuid;
  variant_record RECORD;
BEGIN
  -- Get the default location ID
  SELECT id INTO default_location_id FROM locations WHERE name = 'Main Store' LIMIT 1;
  
  IF default_location_id IS NOT NULL THEN
    -- Migrate stock data for each variant
    FOR variant_record IN 
      SELECT id, stock_quantity, in_stock 
      FROM product_variants 
      WHERE stock_quantity IS NOT NULL OR in_stock IS NOT NULL
    LOOP
      INSERT INTO inventory (location_id, product_variant_id, stock_quantity, in_stock)
      VALUES (
        default_location_id,
        variant_record.id,
        COALESCE(variant_record.stock_quantity, 0),
        COALESCE(variant_record.in_stock, true)
      )
      ON CONFLICT (location_id, product_variant_id) DO UPDATE SET
        stock_quantity = EXCLUDED.stock_quantity,
        in_stock = EXCLUDED.in_stock,
        updated_at = now();
    END LOOP;
  END IF;
END $$;

-- Remove stock fields from product_variants table
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_variants' AND column_name = 'stock_quantity'
  ) THEN
    ALTER TABLE product_variants DROP COLUMN stock_quantity;
  END IF;
  
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'product_variants' AND column_name = 'in_stock'
  ) THEN
    ALTER TABLE product_variants DROP COLUMN in_stock;
  END IF;
END $$;