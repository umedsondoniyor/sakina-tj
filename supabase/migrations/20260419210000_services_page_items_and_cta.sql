-- Service page: CTA block on services_settings + repeatable icon cards (services_page_items)

ALTER TABLE services_settings
  ADD COLUMN IF NOT EXISTS cta_title text,
  ADD COLUMN IF NOT EXISTS cta_description text,
  ADD COLUMN IF NOT EXISTS cta_button_label text;

UPDATE services_settings
SET
  cta_title = COALESCE(cta_title, 'Готовы начать?'),
  cta_description = COALESCE(
    cta_description,
    'Свяжитесь с нами для получения дополнительной информации о наших услугах'
  ),
  cta_button_label = COALESCE(cta_button_label, 'Связаться с нами');

DROP POLICY IF EXISTS "Admins can manage services settings" ON services_settings;

CREATE POLICY "Staff can manage services settings"
  ON services_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'editor')
    )
  );

CREATE TABLE IF NOT EXISTS services_page_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  icon_name text NOT NULL DEFAULT 'Package',
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_services_page_items_order ON services_page_items (order_index);
CREATE INDEX IF NOT EXISTS idx_services_page_items_active ON services_page_items (is_active);

ALTER TABLE services_page_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read active services page items"
  ON services_page_items
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Staff can manage services page items"
  ON services_page_items
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'editor')
    )
  );

DROP TRIGGER IF EXISTS update_services_page_items_updated_at ON services_page_items;
CREATE TRIGGER update_services_page_items_updated_at
  BEFORE UPDATE ON services_page_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DO $seed$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM services_page_items LIMIT 1) THEN
    INSERT INTO services_page_items (title, description, icon_name, order_index) VALUES
      ('Подбор товаров', 'Поможем выбрать идеальный матрас, кровать или аксессуары для здорового сна', 'Package', 0),
      ('Доставка', 'Быстрая и надежная доставка по всему Душанбе. Также доступен самовывоз', 'Truck', 1),
      ('Консультация', 'Профессиональные консультации по выбору товаров для сна', 'Headphones', 2),
      ('Гарантия качества', 'Все товары имеют гарантию качества и сертификаты соответствия', 'Shield', 3),
      ('Быстрое обслуживание', 'Обработка заказов в течение 24 часов, доставка 1-3 рабочих дня', 'Clock', 4),
      ('Индивидуальный подход', 'Учитываем ваши предпочтения и особенности для подбора идеального решения', 'Star', 5);
  END IF;
END
$seed$;
