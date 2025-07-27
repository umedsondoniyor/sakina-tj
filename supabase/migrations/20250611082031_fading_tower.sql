/*
  # Create payments table for Alif Bank integration

  1. New Tables
    - `payments`
      - `id` (uuid, primary key)
      - `alif_order_id` (varchar, unique)
      - `amount` (numeric)
      - `currency` (varchar)
      - `status` (varchar)
      - `alif_transaction_id` (varchar)
      - `alif_callback_payload` (jsonb)
      - `user_id` (uuid, references auth.users)
      - `order_data` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `payments` table
    - Add policies for authenticated users to view their own payments
    - Add policies for admins to view all payments
*/

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alif_order_id varchar NOT NULL UNIQUE,
  amount numeric NOT NULL,
  currency varchar NOT NULL DEFAULT 'TJS',
  status varchar NOT NULL DEFAULT 'pending',
  alif_transaction_id varchar,
  alif_callback_payload jsonb,
  user_id uuid,
  order_data jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments"
  ON payments
  FOR ALL
  TO authenticated
  USING (is_admin());

-- Create updated_at trigger
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payments_alif_order_id ON payments (alif_order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments (status);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments (user_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments (created_at DESC);