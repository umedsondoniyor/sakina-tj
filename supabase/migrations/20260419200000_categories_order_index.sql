-- Display order for product categories (admin «Категории каталога», getCategories(), etc.)

ALTER TABLE categories ADD COLUMN IF NOT EXISTS order_index integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_categories_order_index ON categories (order_index);

-- One-time backfill: stable order by name (matches previous alphabetical sort)
UPDATE categories AS c
SET order_index = n.ord
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY name ASC) - 1 AS ord
  FROM categories
) AS n
WHERE c.id = n.id;
