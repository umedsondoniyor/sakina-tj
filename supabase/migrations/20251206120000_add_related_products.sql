/*
  # Create related products table
  
  This table stores relationships between products (e.g., mattress -> pillow)
  Allows many-to-many relationships with display order
*/

CREATE TABLE IF NOT EXISTS related_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  related_product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  display_order integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  -- Prevent duplicate relationships
  UNIQUE(product_id, related_product_id),
  -- Prevent self-referencing
  CHECK (product_id != related_product_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_related_products_product_id ON related_products(product_id);
CREATE INDEX IF NOT EXISTS idx_related_products_related_product_id ON related_products(related_product_id);
CREATE INDEX IF NOT EXISTS idx_related_products_display_order ON related_products(product_id, display_order);

-- Enable RLS
ALTER TABLE related_products ENABLE ROW LEVEL SECURITY;

-- Allow public to read related products
CREATE POLICY "Allow public to read related products"
  ON related_products
  FOR SELECT
  TO public
  USING (true);

-- Allow authenticated admins to manage related products
CREATE POLICY "Admins can manage related products"
  ON related_products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 
      FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create trigger to update updated_at
CREATE TRIGGER update_related_products_updated_at
  BEFORE UPDATE ON related_products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

