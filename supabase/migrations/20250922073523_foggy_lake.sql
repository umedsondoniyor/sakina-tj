/*
  # Add detailed payment information fields

  1. New Columns
    - `product_title` (text) - Product name for quick reference
    - `customer_name` (text) - Customer full name
    - `customer_phone` (text) - Customer phone number
    - `customer_email` (text) - Customer email
    - `delivery_type` (text) - 'home' or 'pickup'
    - `delivery_address` (text) - Delivery address if applicable
    - `payment_gateway` (text) - Payment gateway used (alif_bank, etc.)
    - `order_summary` (jsonb) - Complete order summary for reference

  2. Security
    - No RLS changes needed as existing policies cover new columns
*/

-- Add new columns to payments table
DO $$
BEGIN
  -- Product title
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'product_title'
  ) THEN
    ALTER TABLE payments ADD COLUMN product_title text;
  END IF;

  -- Customer information
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'customer_name'
  ) THEN
    ALTER TABLE payments ADD COLUMN customer_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'customer_phone'
  ) THEN
    ALTER TABLE payments ADD COLUMN customer_phone text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'customer_email'
  ) THEN
    ALTER TABLE payments ADD COLUMN customer_email text;
  END IF;

  -- Delivery information
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'delivery_type'
  ) THEN
    ALTER TABLE payments ADD COLUMN delivery_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'delivery_address'
  ) THEN
    ALTER TABLE payments ADD COLUMN delivery_address text;
  END IF;

  -- Payment gateway
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'payment_gateway'
  ) THEN
    ALTER TABLE payments ADD COLUMN payment_gateway text;
  END IF;

  -- Order summary
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'payments' AND column_name = 'order_summary'
  ) THEN
    ALTER TABLE payments ADD COLUMN order_summary jsonb;
  END IF;
END $$;