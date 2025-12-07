/*
  # Add product_type to quiz_steps table

  1. New Column
    - `product_type` (text) - Type of product: 'mattress' or 'bed'
    - Default value: 'mattress' for existing records
    - Not null constraint

  2. Index
    - Add index on product_type for better query performance
*/

-- Add product_type column
ALTER TABLE quiz_steps
ADD COLUMN IF NOT EXISTS product_type text NOT NULL DEFAULT 'mattress';

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_quiz_steps_product_type ON quiz_steps(product_type);

-- Update existing records to have 'mattress' as product_type (already default, but explicit)
UPDATE quiz_steps
SET product_type = 'mattress'
WHERE product_type IS NULL OR product_type = '';

-- Add comment for documentation
COMMENT ON COLUMN quiz_steps.product_type IS 'Type of product this quiz step belongs to: mattress or bed';

