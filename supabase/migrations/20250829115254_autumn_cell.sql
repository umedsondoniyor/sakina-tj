/*
  # Create one-click orders table

  1. New Tables
    - `one_click_orders`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key to products)
      - `product_name` (text)
      - `product_price` (numeric)
      - `selected_variant_id` (uuid, nullable)
      - `selected_size` (text, nullable)
      - `phone_number` (text)
      - `status` (text, default 'pending')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `one_click_orders` table
    - Add policy for admins to view all orders
    - Add policy for public to create orders
*/

CREATE TABLE IF NOT EXISTS one_click_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL,
  product_name text NOT NULL,
  product_price numeric NOT NULL CHECK (product_price > 0),
  selected_variant_id uuid,
  selected_size text,
  phone_number text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE one_click_orders ENABLE ROW LEVEL SECURITY;

-- Allow public to create one-click orders
CREATE POLICY "Allow public to create one-click orders"
  ON one_click_orders
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow admins to view all one-click orders
CREATE POLICY "Admins can view all one-click orders"
  ON one_click_orders
  FOR SELECT
  TO authenticated
  USING (is_admin());

-- Allow admins to update order status
CREATE POLICY "Admins can update one-click orders"
  ON one_click_orders
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Add foreign key constraint to products table
ALTER TABLE one_click_orders 
ADD CONSTRAINT one_click_orders_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_one_click_orders_created_at ON one_click_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_one_click_orders_status ON one_click_orders(status);
CREATE INDEX IF NOT EXISTS idx_one_click_orders_product_id ON one_click_orders(product_id);

-- Add trigger to update updated_at column
CREATE TRIGGER update_one_click_orders_updated_at
  BEFORE UPDATE ON one_click_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();