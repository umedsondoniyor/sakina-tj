/*
  # FAQ items (public /faq page, admin managed)

  - Public may read rows where is_active = true
  - Admins may manage all rows (including inactive for authoring)
*/

CREATE TABLE IF NOT EXISTS faq_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to active faq items"
  ON faq_items
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Staff can manage faq items"
  ON faq_items
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

CREATE INDEX IF NOT EXISTS idx_faq_items_order ON faq_items(order_index);
CREATE INDEX IF NOT EXISTS idx_faq_items_active ON faq_items(is_active);

DROP TRIGGER IF EXISTS update_faq_items_updated_at ON faq_items;
CREATE TRIGGER update_faq_items_updated_at
  BEFORE UPDATE ON faq_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DO $seed$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM faq_items LIMIT 1) THEN
    INSERT INTO faq_items (question, answer, order_index, is_active) VALUES
    (
      'Как оформить заказ?',
      'Вы можете оформить заказ на сайте через корзину, по телефону +992 90 533 9595 или в шоуруме в Душанбе. Консультант поможет подобрать модель и сроки доставки.',
      1,
      true
    ),
    (
      'Есть ли доставка по Таджикистану?',
      'Да, мы доставляем по Душанбе и регионам. Сроки и стоимость зависят от адреса — уточняйте у менеджера при оформлении заказа.',
      2,
      true
    ),
    (
      'Какая гарантия на матрасы?',
      'На матрасы предоставляется гарантия производителя (обычно до нескольких лет в зависимости от модели). Условия гарантии указаны в карточке товара и в документах при покупке.',
      3,
      true
    ),
    (
      'Можно ли вернуть или обменять товар?',
      'Условия возврата и обмена зависят от состояния товара и сроков. Свяжитесь с нами по телефону или в шоуруме — мы подскажем актуальные правила.',
      4,
      true
    ),
    (
      'Как подобрать матрас онлайн?',
      'На главной странице есть подборщик матрасов по шагам. Также вы можете позвонить консультанту — мы учтём вес, привычки сна и бюджет.',
      5,
      true
    ),
    (
      'Какие способы оплаты доступны?',
      'Доступны оплата при получении и онлайн-оплата (в том числе через банковские сервисы). Точные варианты уточняйте при оформлении заказа.',
      6,
      true
    ),
    (
      'Где находится шоурум и какой график работы?',
      'Шоурум в Душанбе по адресу Пулоди 4. График: ежедневно 09:00–20:00. Подробности и схема проезда — в разделе «Контакты».',
      7,
      true
    );
  END IF;
END
$seed$;

-- Register admin menu (for existing databases that already have menu_role_permissions)
INSERT INTO menu_role_permissions (path, label, section, roles)
VALUES ('/admin/faq', 'Частые вопросы (FAQ)', 'Контент', ARRAY['admin', 'editor']::text[])
ON CONFLICT (path) DO UPDATE SET
  label = EXCLUDED.label,
  section = EXCLUDED.section,
  roles = EXCLUDED.roles,
  updated_at = now();
