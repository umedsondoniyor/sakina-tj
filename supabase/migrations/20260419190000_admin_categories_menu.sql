-- Admin screen: product catalog categories (table `categories`)
INSERT INTO menu_role_permissions (path, label, section, roles)
VALUES ('/admin/categories', 'Категории каталога', 'Товары', ARRAY['admin', 'editor']::text[])
ON CONFLICT (path) DO UPDATE SET
  label = EXCLUDED.label,
  section = EXCLUDED.section,
  roles = EXCLUDED.roles,
  updated_at = now();
