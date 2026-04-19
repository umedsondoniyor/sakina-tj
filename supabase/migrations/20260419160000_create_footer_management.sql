/*
  # Footer content (settings + sections + manual links)

  section_type: manual | categories | blog
  - categories/blog: links built in app; manual links ignored for those sections
*/

CREATE TABLE IF NOT EXISTS footer_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_display text NOT NULL DEFAULT '+992 90 533 95 95',
  phone_href text NOT NULL DEFAULT 'tel:+992905339595',
  email text NOT NULL DEFAULT 'info@sakina.tj',
  email_href text NOT NULL DEFAULT 'mailto:info@sakina.tj',
  address text NOT NULL DEFAULT 'Душанбе, Пулоди 4',
  copyright_line1 text NOT NULL DEFAULT '© {year} Компания «Sakina»',
  copyright_line2 text NOT NULL DEFAULT 'Все права защищены',
  legal_text text,
  payment_label text NOT NULL DEFAULT 'Принимаем к оплате:',
  show_payment_icons boolean NOT NULL DEFAULT true,
  social_heading text NOT NULL DEFAULT 'Следите за новостями',
  instagram_url text,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS footer_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  section_type text NOT NULL CHECK (section_type IN ('manual', 'categories', 'blog')),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS footer_section_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id uuid NOT NULL REFERENCES footer_sections(id) ON DELETE CASCADE,
  label text NOT NULL,
  href text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_footer_sections_sort ON footer_sections(sort_order);
CREATE INDEX IF NOT EXISTS idx_footer_section_links_section ON footer_section_links(section_id);

ALTER TABLE footer_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE footer_section_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read footer settings"
  ON footer_settings FOR SELECT TO public USING (true);

CREATE POLICY "Allow public read footer sections"
  ON footer_sections FOR SELECT TO public USING (true);

CREATE POLICY "Allow public read footer section links"
  ON footer_section_links FOR SELECT TO public USING (is_active = true);

CREATE POLICY "Staff can manage footer settings"
  ON footer_settings FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role IN ('admin', 'editor'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role IN ('admin', 'editor'))
  );

CREATE POLICY "Staff can manage footer sections"
  ON footer_sections FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role IN ('admin', 'editor'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role IN ('admin', 'editor'))
  );

CREATE POLICY "Staff can manage footer section links"
  ON footer_section_links FOR ALL TO authenticated
  USING (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role IN ('admin', 'editor'))
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM user_profiles WHERE user_profiles.id = auth.uid() AND user_profiles.role IN ('admin', 'editor'))
  );

DROP TRIGGER IF EXISTS update_footer_settings_updated_at ON footer_settings;
CREATE TRIGGER update_footer_settings_updated_at
  BEFORE UPDATE ON footer_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_footer_sections_updated_at ON footer_sections;
CREATE TRIGGER update_footer_sections_updated_at
  BEFORE UPDATE ON footer_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_footer_section_links_updated_at ON footer_section_links;
CREATE TRIGGER update_footer_section_links_updated_at
  BEFORE UPDATE ON footer_section_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DO $seed$
DECLARE
  sid_company uuid;
  sid_info uuid;
  sid_contacts uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM footer_settings LIMIT 1) THEN
    INSERT INTO footer_settings (
      phone_display, phone_href, email, email_href, address,
      copyright_line1, copyright_line2, legal_text, payment_label, show_payment_icons,
      social_heading, instagram_url
    ) VALUES (
      '+992 90 533 95 95',
      'tel:+992905339595',
      'info@sakina.tj',
      'mailto:info@sakina.tj',
      'Душанбе, Пулоди 4',
      '© {year} Компания «Sakina»',
      'Все права защищены',
      E'ИП "Sakina"\nИНН: указать при наличии',
      'Принимаем к оплате:',
      true,
      'Следите за новостями',
      'https://www.instagram.com/sakina.tj?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=='
    );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM footer_sections LIMIT 1) THEN
    INSERT INTO footer_sections (slug, title, sort_order, section_type) VALUES
      ('catalog', 'Каталог', 0, 'categories'),
      ('company', 'О компании', 1, 'manual'),
      ('blog', 'Блог', 2, 'blog'),
      ('info', 'Информация', 3, 'manual'),
      ('contacts', 'Контакты', 4, 'manual');

    SELECT id INTO sid_company FROM footer_sections WHERE slug = 'company';
    SELECT id INTO sid_info FROM footer_sections WHERE slug = 'info';
    SELECT id INTO sid_contacts FROM footer_sections WHERE slug = 'contacts';

    INSERT INTO footer_section_links (section_id, label, href, sort_order) VALUES
      (sid_company, 'О нас', '/about', 0),
      (sid_info, 'Доставка и оплата', '/delivery-payment', 0),
      (sid_info, 'Гарантия', '/about#warranty', 1),
      (sid_info, 'Возврат товара', '/about#returns', 2),
      (sid_contacts, 'Контакты', '/contacts', 0),
      (sid_contacts, 'Адреса магазинов', '/about#locations', 1);
  END IF;
END
$seed$;

INSERT INTO menu_role_permissions (path, label, section, roles)
VALUES ('/admin/footer', 'Подвал сайта', 'Контент', ARRAY['admin', 'editor']::text[])
ON CONFLICT (path) DO UPDATE SET
  label = EXCLUDED.label,
  section = EXCLUDED.section,
  roles = EXCLUDED.roles,
  updated_at = now();
