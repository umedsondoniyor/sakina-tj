/*
  # Create Services and Delivery/Payment Pages Tables

  1. New Tables
    - `services_settings` - Settings for Services page
    - `delivery_payment_settings` - Settings for Delivery and Payment page

  2. Security
    - Enable RLS on both tables
    - Public read access
    - Admin management access
*/

-- Create services_settings table
CREATE TABLE IF NOT EXISTS services_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Наши услуги',
  description text,
  content text, -- Main content (can be HTML or markdown)
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create delivery_payment_settings table
CREATE TABLE IF NOT EXISTS delivery_payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'Доставка и оплата',
  description text,
  delivery_content text, -- Delivery information
  payment_content text, -- Payment information
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE services_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_payment_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for services_settings
CREATE POLICY "Allow public read access to services settings"
  ON services_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage services settings"
  ON services_settings
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create policies for delivery_payment_settings
CREATE POLICY "Allow public read access to delivery payment settings"
  ON delivery_payment_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage delivery payment settings"
  ON delivery_payment_settings
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_services_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_services_updated_at();

CREATE TRIGGER update_delivery_payment_updated_at
  BEFORE UPDATE ON delivery_payment_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_services_updated_at();

-- Insert default records
INSERT INTO services_settings (title, description, content)
VALUES (
  'Наши услуги',
  'Мы предлагаем широкий спектр услуг для вашего комфорта',
  'Наша компания предоставляет качественные услуги по подбору и доставке товаров для сна. Мы поможем вам выбрать идеальный матрас, кровать или аксессуары для здорового и комфортного сна.'
)
ON CONFLICT DO NOTHING;

INSERT INTO delivery_payment_settings (title, description, delivery_content, payment_content)
VALUES (
  'Доставка и оплата',
  'Удобные способы доставки и оплаты',
  'Мы осуществляем доставку по всему Душанбе. Срок доставки: 1-3 рабочих дня. Также доступен самовывоз из наших шоурумов.',
  'Принимаем оплату наличными при получении или онлайн через Alif Bank. Все платежи защищены и безопасны.'
)
ON CONFLICT DO NOTHING;

