/*
  # Create SMS Templates Management

  1. New Tables
    - `sms_templates`
      - `id` (uuid, primary key)
      - `name` (text, unique) - template identifier
      - `description` (text) - human readable description
      - `phone_number` (text) - recipient phone (can use variables)
      - `text_template` (text) - message template with variables
      - `sender_address` (text) - SMS sender ID
      - `priority` (integer) - SMS priority
      - `sms_type` (integer) - SMS type
      - `is_active` (boolean) - whether template is active
      - `order_index` (integer) - display order
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `sms_templates` table
    - Add policy for admins to manage templates
    - Add policy for public read access to active templates

  3. Default Templates
    - Customer success notification
    - Admin order notification  
    - Delivery team notification
</*/

CREATE TABLE IF NOT EXISTS sms_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  phone_number text NOT NULL,
  text_template text NOT NULL,
  sender_address text DEFAULT 'SAKINA' NOT NULL,
  priority integer DEFAULT 1 NOT NULL,
  sms_type integer DEFAULT 2 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  order_index integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE sms_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage SMS templates"
  ON sms_templates
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Allow public read access to active SMS templates"
  ON sms_templates
  FOR SELECT
  TO public
  USING (is_active = true);

-- Create trigger for updated_at
CREATE TRIGGER update_sms_templates_updated_at
  BEFORE UPDATE ON sms_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_sms_templates_active ON sms_templates(is_active);
CREATE INDEX idx_sms_templates_order ON sms_templates(order_index);

-- Insert default templates
INSERT INTO sms_templates (name, description, phone_number, text_template, sender_address, priority, sms_type, order_index) VALUES
(
  'customer_payment_success',
  'Уведомление клиенту об успешной оплате',
  '{{payment.customer_phone}}',
  '✅ Оплата прошла успешно! Ваш заказ: «{{orderTitle}}». Спасибо, что выбрали Sakina.tj 🙏',
  'SAKINA',
  1,
  2,
  1
),
(
  'admin_payment_notification',
  'Уведомление администратору о новом платеже',
  '+992936337785',
  '💰 Оплачен новый заказ: «{{orderTitle}}». Покупатель подтвердил оплату.',
  'SAKINA',
  1,
  2,
  2
),
(
  'delivery_team_notification',
  'Уведомление команде доставки о новом заказе',
  '{{payment.delivery_phone}}',
  '🚚 Новый заказ для доставки: «{{orderTitle}}». Пожалуйста, свяжитесь с клиентом и доставьте вовремя.',
  'SAKINA',
  1,
  2,
  3
);