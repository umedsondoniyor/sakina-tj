/*
  # Home «Процесс производства» — hero video (YouTube) + repeatable steps (image, caption, order)
*/

CREATE TABLE IF NOT EXISTS home_manufacturing_settings (
  id text PRIMARY KEY DEFAULT 'default' CHECK (id = 'default'),
  youtube_url text NOT NULL,
  hero_title text NOT NULL,
  hero_subtitle text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE home_manufacturing_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read manufacturing settings"
  ON home_manufacturing_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Staff can manage manufacturing settings"
  ON home_manufacturing_settings
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

DROP TRIGGER IF EXISTS update_home_manufacturing_settings_updated_at ON home_manufacturing_settings;
CREATE TRIGGER update_home_manufacturing_settings_updated_at
  BEFORE UPDATE ON home_manufacturing_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

INSERT INTO home_manufacturing_settings (id, youtube_url, hero_title, hero_subtitle)
VALUES (
  'default',
  'https://youtu.be/62pbhdQ-c1M?si=5o7PK4duweZo323t',
  'Создание наших матрасов',
  'Заглянем за кулисы производственных цехов компании Sakina, чтобы узнать, откуда берется качество'
)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS home_manufacturing_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  caption text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_home_manufacturing_steps_order ON home_manufacturing_steps (order_index);
CREATE INDEX IF NOT EXISTS idx_home_manufacturing_steps_active ON home_manufacturing_steps (is_active);

ALTER TABLE home_manufacturing_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read active manufacturing steps"
  ON home_manufacturing_steps
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Staff can manage manufacturing steps"
  ON home_manufacturing_steps
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

DROP TRIGGER IF EXISTS update_home_manufacturing_steps_updated_at ON home_manufacturing_steps;
CREATE TRIGGER update_home_manufacturing_steps_updated_at
  BEFORE UPDATE ON home_manufacturing_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

INSERT INTO menu_role_permissions (path, label, section, roles)
VALUES ('/admin/manufacturing-process', 'Процесс производства (главная)', 'Контент', ARRAY['admin', 'editor']::text[])
ON CONFLICT (path) DO UPDATE SET
  label = EXCLUDED.label,
  section = EXCLUDED.section,
  roles = EXCLUDED.roles,
  updated_at = now();
