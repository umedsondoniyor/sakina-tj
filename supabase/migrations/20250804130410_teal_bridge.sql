/*
  # Add stock quantity to product variants

  1. Schema Changes
    - Add `stock_quantity` column to `product_variants` table
    - Set default value to 0 for existing records
    - Add check constraint to ensure non-negative values

  2. Data Integrity
    - Ensures stock quantities cannot be negative
    - Provides default value for backward compatibility
*/

-- Add stock_quantity column with default value
ALTER TABLE product_variants 
ADD COLUMN IF NOT EXISTS stock_quantity integer DEFAULT 0;

-- Add check constraint to ensure stock quantity is not negative
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'positive_stock_quantity' 
    AND table_name = 'product_variants'
  ) THEN
    ALTER TABLE product_variants 
    ADD CONSTRAINT positive_stock_quantity CHECK (stock_quantity >= 0);
  END IF;
END $$;