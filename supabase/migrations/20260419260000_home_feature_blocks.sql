/*
  # Home page «Преимущества» (Features.tsx) — blocks with Lucide icon name + title + text
*/

CREATE TABLE IF NOT EXISTS home_feature_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  icon_name text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_home_feature_blocks_order ON home_feature_blocks (order_index);
CREATE INDEX IF NOT EXISTS idx_home_feature_blocks_active ON home_feature_blocks (is_active);

ALTER TABLE home_feature_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read active home feature blocks"
  ON home_feature_blocks
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Staff can manage home feature blocks"
  ON home_feature_blocks
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

DROP TRIGGER IF EXISTS update_home_feature_blocks_updated_at ON home_feature_blocks;
CREATE TRIGGER update_home_feature_blocks_updated_at
  BEFORE UPDATE ON home_feature_blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DO $seed$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM home_feature_blocks LIMIT 1) THEN
    INSERT INTO home_feature_blocks (icon_name, title, description, order_index) VALUES
      ('UserSearch', 'Индивидуальный', 'Персональный Подбор Матрас', 0),
      ('Award', 'Гарантия', 'Качества И Долговечности', 1),
      ('Store', 'Шоурум', 'В Центре Города', 2),
      ('Truck', 'Доставка', 'По Всему Таджикистану', 3),
      ('FlaskRound', 'Экологически', 'Чистые И Гипоаллергенные Материалы', 4);
  END IF;
END
$seed$;

INSERT INTO menu_role_permissions (path, label, section, roles)
VALUES ('/admin/features', 'Преимущества (главная)', 'Контент', ARRAY['admin', 'editor']::text[])
ON CONFLICT (path) DO UPDATE SET
  label = EXCLUDED.label,
  section = EXCLUDED.section,
  roles = EXCLUDED.roles,
  updated_at = now();
