-- Home page category tiles (CategoryGrid), managed in Admin → Навигация

CREATE TABLE IF NOT EXISTS home_category_grid_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category_slug text NOT NULL,
  icon_name text,
  icon_image_url text,
  -- Optional: if set, navigate here instead of /categories/{category_slug}
  link_url text,
  order_index integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_home_category_grid_order ON home_category_grid_items (order_index);
CREATE INDEX IF NOT EXISTS idx_home_category_grid_active ON home_category_grid_items (is_active);

ALTER TABLE home_category_grid_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read active home category grid items"
  ON home_category_grid_items
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage home category grid items"
  ON home_category_grid_items
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

DROP TRIGGER IF EXISTS update_home_category_grid_items_updated_at ON home_category_grid_items;
CREATE TRIGGER update_home_category_grid_items_updated_at
  BEFORE UPDATE ON home_category_grid_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DO $seed$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM home_category_grid_items LIMIT 1) THEN
    INSERT INTO home_category_grid_items (title, category_slug, icon_image_url, link_url, order_index) VALUES
      ('Матрасы', 'mattresses', 'https://ik.imagekit.io/3js0rb3pk/categ_matress.png', '/categories/mattresses', 0),
      ('Кровати', 'beds', 'https://ik.imagekit.io/3js0rb3pk/categ_bed.png', '/categories/beds', 1),
      ('Одеяло', 'blankets', 'https://ik.imagekit.io/3js0rb3pk/categ_blanket.png', NULL, 2),
      ('Массажное кресло', 'smartchair', '/images/smart-chair-b.png', '/categories/smartchair', 3),
      ('Подушки', 'pillows', 'https://ik.imagekit.io/3js0rb3pk/categ_pillow.png', '/categories/pillows', 4),
      ('Деревянные 3D-карты', 'world-maps', 'https://ik.imagekit.io/3js0rb3pk/categ_map.png', '/categories/map', 5);
  END IF;
END
$seed$;
