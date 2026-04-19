/*
  # Catalog menu (left column of mega-menu «Каталог»)

  Separate from navigation_items (верхнее меню) so each can be ordered and titled independently.
*/

CREATE TABLE IF NOT EXISTS catalog_menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category_slug text NOT NULL,
  icon_name text,
  icon_image_url text,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_catalog_menu_items_order ON catalog_menu_items (order_index);
CREATE INDEX IF NOT EXISTS idx_catalog_menu_items_slug ON catalog_menu_items (category_slug);

ALTER TABLE catalog_menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read active catalog menu items"
  ON catalog_menu_items FOR SELECT TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage catalog menu items"
  ON catalog_menu_items FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE TRIGGER update_catalog_menu_items_updated_at
  BEFORE UPDATE ON catalog_menu_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Seed once (mirror typical navigation defaults)
DO $seed$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM catalog_menu_items LIMIT 1) THEN
    INSERT INTO catalog_menu_items (title, category_slug, icon_name, order_index, icon_image_url) VALUES
      ('Матрасы', 'mattresses', 'BedDouble', 1, NULL),
      ('Кровать', 'beds', 'Sofa', 2, NULL),
      ('Массажное кресло', 'smartchair', NULL, 3, '/icons/filledSmartChair.png'),
      ('Карта', 'map', 'Earth', 4, NULL),
      ('О нас', 'about', 'Users', 5, NULL);
  END IF;
END
$seed$;
