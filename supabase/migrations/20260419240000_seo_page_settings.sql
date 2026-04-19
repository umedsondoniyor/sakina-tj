/*
  # SEO meta (default site + home page)

  `default` — fallback when a page-specific row is missing or incomplete.
  `home` — overrides for `/` (title/description); falls back to `default` then built-in strings in the app.
*/

CREATE TABLE IF NOT EXISTS seo_page_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_key text NOT NULL UNIQUE,
  meta_title text NOT NULL,
  meta_description text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_seo_page_settings_route ON seo_page_settings (route_key);

ALTER TABLE seo_page_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read seo page settings"
  ON seo_page_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Staff can manage seo page settings"
  ON seo_page_settings
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

DROP TRIGGER IF EXISTS update_seo_page_settings_updated_at ON seo_page_settings;
CREATE TRIGGER update_seo_page_settings_updated_at
  BEFORE UPDATE ON seo_page_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DO $seed$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM seo_page_settings WHERE route_key = 'default') THEN
    INSERT INTO seo_page_settings (route_key, meta_title, meta_description) VALUES
      (
        'default',
        'Матрасы и товары для сна в Душанбе',
        'Матрасы, кровати, подушки и товары для сна в Душанбе с доставкой и гарантией.'
      );
  END IF;
  IF NOT EXISTS (SELECT 1 FROM seo_page_settings WHERE route_key = 'home') THEN
    INSERT INTO seo_page_settings (route_key, meta_title, meta_description) VALUES
      (
        'home',
        'Матрасы и товары для сна в Душанбе',
        'Матрасы, кровати, подушки и товары для сна в Душанбе с доставкой и гарантией.'
      );
  END IF;
END
$seed$;

INSERT INTO menu_role_permissions (path, label, section, roles)
VALUES ('/admin/seo', 'SEO (главная и по умолчанию)', 'Контент', ARRAY['admin', 'editor']::text[])
ON CONFLICT (path) DO UPDATE SET
  label = EXCLUDED.label,
  section = EXCLUDED.section,
  roles = EXCLUDED.roles,
  updated_at = now();
