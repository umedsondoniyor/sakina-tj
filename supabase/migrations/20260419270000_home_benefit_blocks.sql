/*
  # Home page image benefit cards (Benefits.tsx) — image URL, title, subtitle, body, optional link
*/

CREATE TABLE IF NOT EXISTS home_benefit_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  title text NOT NULL,
  subtitle text NOT NULL,
  body text NOT NULL,
  link_url text,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_home_benefit_blocks_order ON home_benefit_blocks (order_index);
CREATE INDEX IF NOT EXISTS idx_home_benefit_blocks_active ON home_benefit_blocks (is_active);

ALTER TABLE home_benefit_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read active home benefit blocks"
  ON home_benefit_blocks
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Staff can manage home benefit blocks"
  ON home_benefit_blocks
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

DROP TRIGGER IF EXISTS update_home_benefit_blocks_updated_at ON home_benefit_blocks;
CREATE TRIGGER update_home_benefit_blocks_updated_at
  BEFORE UPDATE ON home_benefit_blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DO $seed$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM home_benefit_blocks LIMIT 1) THEN
    INSERT INTO home_benefit_blocks (image_url, title, subtitle, body, link_url, order_index) VALUES
      ('/images/review.png', 'Более 1000+', 'положительных отзывов',
       'Тысячи счастливых историй — тысячи спокойных ночей. Люди доверяют Sakina свой сон — и остаются влюблены в комфорт.',
       NULL, 0),
      ('/images/waranty.png', 'Гарантия - 8 лет,', 'но прослужить более 20 лет',
       'Матрас, который заботится о вас долгие годы. Мы уверены в своём качестве и готовы отвечать за него.',
       NULL, 1),
      ('/images/delivery.png', 'Быстрая доставка', 'в день заказа',
       'Комфорт не должен ждать. Вы выбираете — мы доставляем уже сегодня, чтобы этой ночью вы спали лучше.',
       NULL, 2),
      ('/images/labratory.png', 'Мировые стандарты производства', 'для контроля качества',
       'Наши матрасы производятся в самых инновационных и технологичных фабриках',
       NULL, 3);
  END IF;
END
$seed$;

INSERT INTO menu_role_permissions (path, label, section, roles)
VALUES ('/admin/home-benefits', 'Карточки преимуществ (главная)', 'Контент', ARRAY['admin', 'editor']::text[])
ON CONFLICT (path) DO UPDATE SET
  label = EXCLUDED.label,
  section = EXCLUDED.section,
  roles = EXCLUDED.roles,
  updated_at = now();
