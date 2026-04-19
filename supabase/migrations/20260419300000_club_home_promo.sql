/*
  # Home «Клуб Sakina» promo block — hero image, title, badge, 3 benefit bullets (icon + text), CTA labels
*/

CREATE TABLE IF NOT EXISTS club_home_promo_settings (
  id text PRIMARY KEY DEFAULT 'default' CHECK (id = 'default'),
  hero_image_url text NOT NULL,
  title text NOT NULL,
  badge_text text NOT NULL,
  benefits jsonb NOT NULL DEFAULT '[]'::jsonb,
  cta_register_label text NOT NULL,
  cta_login_label text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE club_home_promo_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read club home promo settings"
  ON club_home_promo_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Staff can manage club home promo settings"
  ON club_home_promo_settings
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

DROP TRIGGER IF EXISTS update_club_home_promo_settings_updated_at ON club_home_promo_settings;
CREATE TRIGGER update_club_home_promo_settings_updated_at
  BEFORE UPDATE ON club_home_promo_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

INSERT INTO club_home_promo_settings (id, hero_image_url, title, badge_text, benefits, cta_register_label, cta_login_label)
VALUES (
  'default',
  'https://ik.imagekit.io/3js0rb3pk/Sakina/%D0%B8%D0%BA%D0%BE%D0%BD%D0%BA%D0%B0.png',
  'Вступайте в Клуб Sakina!',
  'Получайте еще больше бонусов и преимуществ',
  '[
    {"icon_name": "MessageCircleHeart", "body": "Получайте еженедельные советы по здоровому и комфортному сну."},
    {"icon_name": "Percent", "body": "Узнайте первыми об акции и скидках."},
    {"icon_name": "Cake", "body": "Бонусы в день рождения."}
  ]'::jsonb,
  'Зарегистрироваться',
  'Вступить в Сообщество'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO menu_role_permissions (path, label, section, roles)
VALUES ('/admin/club-home-promo', 'Клуб Sakina (главная)', 'Контент', ARRAY['admin', 'editor']::text[])
ON CONFLICT (path) DO UPDATE SET
  label = EXCLUDED.label,
  section = EXCLUDED.section,
  roles = EXCLUDED.roles,
  updated_at = now();
