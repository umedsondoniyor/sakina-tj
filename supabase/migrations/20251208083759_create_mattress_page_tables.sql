-- Create mattress_page_settings table
CREATE TABLE IF NOT EXISTS mattress_page_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hero_title text NOT NULL DEFAULT 'Матрасы',
  hero_description text NOT NULL DEFAULT 'Подберите идеальный матрас для здорового сна',
  type_section_title text NOT NULL DEFAULT 'По типу',
  hardness_section_title text NOT NULL DEFAULT 'По жесткости',
  popular_filters_section_title text NOT NULL DEFAULT 'Популярные фильтры',
  collections_section_title text NOT NULL DEFAULT 'По коллекции',
  first_purchase_section_title text NOT NULL DEFAULT 'Первая покупка',
  hit_sales_section_title text NOT NULL DEFAULT 'Хиты продаж',
  view_all_button_text text NOT NULL DEFAULT 'Смотреть все матрасы',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create mattress_collections table
CREATE TABLE IF NOT EXISTS mattress_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  collection_type text NOT NULL, -- 'budget', 'premium', 'relaxation', 'business', 'sleep', 'healthy-sleep'
  price_min integer,
  price_max integer,
  preferences text[],
  order_index integer DEFAULT 0 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create mattress_types table
CREATE TABLE IF NOT EXISTS mattress_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  image_url text NOT NULL,
  type_id text NOT NULL UNIQUE, -- 'double', 'single', 'children', 'rolled'
  width_min integer,
  width_max integer,
  age_categories text[],
  preferences text[],
  mattress_types text[],
  order_index integer DEFAULT 0 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create mattress_hardness_levels table
CREATE TABLE IF NOT EXISTS mattress_hardness_levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  level integer NOT NULL CHECK (level >= 1 AND level <= 5),
  hardness_value text NOT NULL, -- 'Мягкая', 'Средняя', 'Жесткая'
  order_index integer DEFAULT 0 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create mattress_popular_filters table
CREATE TABLE IF NOT EXISTS mattress_popular_filters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  filter_id text NOT NULL UNIQUE, -- 'orthopedic', 'independent-springs', 'children'
  age_categories text[],
  preferences text[],
  functions text[],
  order_index integer DEFAULT 0 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create mattress_first_purchase_articles table
CREATE TABLE IF NOT EXISTS mattress_first_purchase_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  article_url text,
  is_main boolean DEFAULT false NOT NULL,
  order_index integer DEFAULT 0 NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE mattress_page_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE mattress_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE mattress_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE mattress_hardness_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE mattress_popular_filters ENABLE ROW LEVEL SECURITY;
ALTER TABLE mattress_first_purchase_articles ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Allow public read access to mattress page settings"
  ON mattress_page_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public read access to active mattress collections"
  ON mattress_collections
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Allow public read access to active mattress types"
  ON mattress_types
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Allow public read access to active mattress hardness levels"
  ON mattress_hardness_levels
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Allow public read access to active mattress popular filters"
  ON mattress_popular_filters
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Allow public read access to active mattress first purchase articles"
  ON mattress_first_purchase_articles
  FOR SELECT
  TO public
  USING (is_active = true);

-- Admin manage policies
CREATE POLICY "Admins can manage mattress page settings"
  ON mattress_page_settings
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can manage mattress collections"
  ON mattress_collections
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can manage mattress types"
  ON mattress_types
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can manage mattress hardness levels"
  ON mattress_hardness_levels
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can manage mattress popular filters"
  ON mattress_popular_filters
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can manage mattress first purchase articles"
  ON mattress_first_purchase_articles
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create triggers for updated_at
CREATE TRIGGER update_mattress_page_settings_updated_at
  BEFORE UPDATE ON mattress_page_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mattress_collections_updated_at
  BEFORE UPDATE ON mattress_collections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mattress_types_updated_at
  BEFORE UPDATE ON mattress_types
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mattress_hardness_levels_updated_at
  BEFORE UPDATE ON mattress_hardness_levels
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mattress_popular_filters_updated_at
  BEFORE UPDATE ON mattress_popular_filters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mattress_first_purchase_articles_updated_at
  BEFORE UPDATE ON mattress_first_purchase_articles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings
INSERT INTO mattress_page_settings (
  hero_title,
  hero_description,
  type_section_title,
  hardness_section_title,
  popular_filters_section_title,
  collections_section_title,
  first_purchase_section_title,
  hit_sales_section_title,
  view_all_button_text
) VALUES (
  'Матрасы',
  'Подберите идеальный матрас для здорового сна',
  'По типу',
  'По жесткости',
  'Популярные фильтры',
  'По коллекции',
  'Первая покупка',
  'Хиты продаж',
  'Смотреть все матрасы'
) ON CONFLICT DO NOTHING;

-- Insert default collections
INSERT INTO mattress_collections (title, description, image_url, collection_type, price_min, price_max, preferences, order_index, is_active) VALUES
  ('Бюджетные матрасы', 'Доступные матрасы с превосходным качеством для комфортного сна', 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=400&q=80', 'budget', 0, 2000, NULL, 0, true),
  ('Матрасы Премиум', 'Элитные матрасы с IT-технологиями и дорогими премиальными материалами', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80', 'premium', 5000, NULL, NULL, 1, true),
  ('Серия релаксации', 'Специальные матрасы для максимального расслабления и восстановления', 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=400&q=80', 'relaxation', NULL, NULL, ARRAY['Для релаксации', 'Максимальный комфорт'], 2, true),
  ('Бизнес коллекция', 'Матрасы с идеальным соотношением цены и качества', 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=400&q=80', 'business', 2000, 5000, NULL, 3, true),
  ('Серия матрасов', 'Инновационные матрасы для здорового сна', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80', 'sleep', NULL, NULL, NULL, 4, true),
  ('Для здорового сна', 'Ортопедические матрасы для профилактики и лечения проблем со спиной', 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80', 'healthy-sleep', NULL, NULL, ARRAY['Ортопедические', 'Для здорового сна'], 5, true)
ON CONFLICT DO NOTHING;

-- Insert default mattress types
INSERT INTO mattress_types (name, image_url, type_id, width_min, width_max, age_categories, preferences, mattress_types, order_index, is_active) VALUES
  ('Двуспальные', 'https://i.askona.ru/uploads/matrasy_spread/typeSlider/dvuhspal_v2.png', 'double', 140, 200, NULL, NULL, NULL, 0, true),
  ('Односпальные', 'https://i.askona.ru/uploads/matrasy_spread/typeSlider/odnospal_v2.png', 'single', 70, 120, NULL, NULL, NULL, 1, true),
  ('Детские', 'https://i.askona.ru/uploads/matrasy_spread/typeSlider/detskie_v2.png', 'children', NULL, NULL, ARRAY['from0to3', 'from3to7', 'from7to14'], ARRAY['Для детей и подростков'], NULL, 2, true),
  ('Топер для матраса', 'https://i.askona.ru/uploads/matrasy_spread/typeSlider/namatrasy_v2.png', 'rolled', NULL, NULL, NULL, NULL, ARRAY['В скрутке'], 3, true)
ON CONFLICT (type_id) DO NOTHING;

-- Insert default hardness levels
INSERT INTO mattress_hardness_levels (name, description, level, hardness_value, order_index, is_active) VALUES
  ('МЯГКИЕ', 'Для тех, кто предпочитает комфорт', 2, 'Мягкая', 0, true),
  ('СРЕДНЕЙ ЖЕСТКОСТИ', 'Универсальный выбор', 3, 'Средняя', 1, true),
  ('ЖЕСТКИЕ', 'Для поддержки позвоночника', 4, 'Жесткая', 2, true)
ON CONFLICT DO NOTHING;

-- Insert default popular filters
INSERT INTO mattress_popular_filters (name, description, image_url, filter_id, age_categories, preferences, functions, order_index, is_active) VALUES
  ('Ортопедические', 'Для здоровья позвоночника', 'https://i.askona.ru/upload/iblock/c47/c479e7185286f1c8da079aefe6261bd9.svg', 'orthopedic', NULL, ARRAY['Ортопедические'], NULL, 0, true),
  ('Независимый пружинный блок', 'Индивидуальная поддержка', 'https://i.askona.ru/upload/iblock/784/78420d3ebf9d96a1f11555650042288d.svg', 'independent-springs', NULL, NULL, ARRAY['Независимый пружинный блок'], 1, true),
  ('Для малышей', 'Безопасные материалы', 'https://i.askona.ru/upload/iblock/784/78420d3ebf9d96a1f11555650042288d.svg', 'children', ARRAY['from0to3', 'from3to7', 'from7to14'], ARRAY['Для детей и подростков'], NULL, 2, true)
ON CONFLICT (filter_id) DO NOTHING;

-- Insert default first purchase articles
INSERT INTO mattress_first_purchase_articles (title, description, image_url, article_url, is_main, order_index, is_active) VALUES
  ('Полный гид по выбору матраса: виды, важные параметры и специальные функции', 'Выбор матраса может показаться сложным, но с нашим подробным гидом вы найдете идеальный вариант.', 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=600&q=80', NULL, true, 0, true),
  ('Типы ортопедических матрасов', 'Разбираемся в особенностях ортопедических матрасов и их влиянии на здоровье.', 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=300&q=80', NULL, false, 1, true),
  ('Что купить вместе с матрасом: 5 необходимых товаров', 'Дополнительные товары, которые сделают ваш сон еще комфортнее.', 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=300&q=80', NULL, false, 2, true),
  ('Как выбрать детский матрас?', 'Все что нужно знать при выборе матраса для ребенка.', 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=300&q=80', NULL, false, 3, true)
ON CONFLICT DO NOTHING;

