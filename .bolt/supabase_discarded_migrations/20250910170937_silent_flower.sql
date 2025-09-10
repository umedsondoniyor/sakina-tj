/*
  # Create Blog System

  1. New Tables
    - `blog_categories` - Categories for organizing blog posts
    - `blog_tags` - Tags for flexible content labeling  
    - `blog_posts` - Main blog posts with full content management
    - `blog_post_tags` - Many-to-many relationship for post tagging

  2. Security
    - Enable RLS on all blog tables
    - Add policies for public read access to published content
    - Add policies for admin management

  3. Performance
    - Add indexes for common queries
    - Full-text search capabilities
    - Automatic timestamp updates
*/

-- Create blog_categories table
CREATE TABLE IF NOT EXISTS blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  color text NOT NULL DEFAULT '#0fb6c9',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create blog_tags table
CREATE TABLE IF NOT EXISTS blog_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  color text NOT NULL DEFAULT '#0fb6c9',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text,
  featured_image text,
  category_id uuid,
  author_id uuid,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured boolean NOT NULL DEFAULT false,
  published_at timestamptz,
  reading_time integer NOT NULL DEFAULT 1,
  view_count integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create blog_post_tags junction table
CREATE TABLE IF NOT EXISTS blog_post_tags (
  post_id uuid NOT NULL,
  tag_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (post_id, tag_id)
);

-- Add foreign key constraints
DO $$
BEGIN
  -- Add foreign key for blog_posts.category_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'blog_posts_category_id_fkey'
  ) THEN
    ALTER TABLE blog_posts 
    ADD CONSTRAINT blog_posts_category_id_fkey 
    FOREIGN KEY (category_id) REFERENCES blog_categories(id) ON DELETE SET NULL;
  END IF;

  -- Add foreign key for blog_posts.author_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'blog_posts_author_id_fkey'
  ) THEN
    ALTER TABLE blog_posts 
    ADD CONSTRAINT blog_posts_author_id_fkey 
    FOREIGN KEY (author_id) REFERENCES user_profiles(id) ON DELETE SET NULL;
  END IF;

  -- Add foreign key for blog_post_tags.post_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'blog_post_tags_post_id_fkey'
  ) THEN
    ALTER TABLE blog_post_tags 
    ADD CONSTRAINT blog_post_tags_post_id_fkey 
    FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE;
  END IF;

  -- Add foreign key for blog_post_tags.tag_id
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'blog_post_tags_tag_id_fkey'
  ) THEN
    ALTER TABLE blog_post_tags 
    ADD CONSTRAINT blog_post_tags_tag_id_fkey 
    FOREIGN KEY (tag_id) REFERENCES blog_tags(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for blog_categories
CREATE POLICY "Allow public read access to active categories"
  ON blog_categories
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage categories"
  ON blog_categories
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create RLS policies for blog_tags
CREATE POLICY "Allow public read access to active tags"
  ON blog_tags
  FOR SELECT
  TO public
  USING (is_active = true);

CREATE POLICY "Admins can manage tags"
  ON blog_tags
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create RLS policies for blog_posts
CREATE POLICY "Allow public read access to published posts"
  ON blog_posts
  FOR SELECT
  TO public
  USING (status = 'published');

CREATE POLICY "Admins can manage all posts"
  ON blog_posts
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create RLS policies for blog_post_tags
CREATE POLICY "Allow public read access to post tags"
  ON blog_post_tags
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can manage post tags"
  ON blog_post_tags
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);
CREATE INDEX IF NOT EXISTS idx_blog_categories_active ON blog_categories(is_active);

CREATE INDEX IF NOT EXISTS idx_blog_tags_slug ON blog_tags(slug);
CREATE INDEX IF NOT EXISTS idx_blog_tags_active ON blog_tags(is_active);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category_id ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author_id ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_is_featured ON blog_posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_view_count ON blog_posts(view_count DESC);

CREATE INDEX IF NOT EXISTS idx_blog_post_tags_post_id ON blog_post_tags(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_post_tags_tag_id ON blog_post_tags(tag_id);

-- Create full-text search index for Russian content
CREATE INDEX IF NOT EXISTS idx_blog_posts_search 
ON blog_posts 
USING gin(to_tsvector('russian', title || ' ' || COALESCE(excerpt, '') || ' ' || COALESCE(content, '')));

-- Create update triggers
CREATE OR REPLACE FUNCTION update_blog_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers to all blog tables
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_blog_categories_updated_at') THEN
    CREATE TRIGGER update_blog_categories_updated_at
      BEFORE UPDATE ON blog_categories
      FOR EACH ROW
      EXECUTE FUNCTION update_blog_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_blog_tags_updated_at') THEN
    CREATE TRIGGER update_blog_tags_updated_at
      BEFORE UPDATE ON blog_tags
      FOR EACH ROW
      EXECUTE FUNCTION update_blog_updated_at_column();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_blog_posts_updated_at') THEN
    CREATE TRIGGER update_blog_posts_updated_at
      BEFORE UPDATE ON blog_posts
      FOR EACH ROW
      EXECUTE FUNCTION update_blog_updated_at_column();
  END IF;
END $$;

-- Insert sample data
INSERT INTO blog_categories (name, slug, description, color) VALUES
  ('Здоровый сон', 'healthy-sleep', 'Статьи о важности здорового сна', '#0fb6c9'),
  ('Выбор матраса', 'mattress-selection', 'Советы по выбору правильного матраса', '#10b981'),
  ('Уход за матрасом', 'mattress-care', 'Как ухаживать за матрасом', '#f59e0b')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO blog_tags (name, slug, color) VALUES
  ('Советы', 'tips', '#8b5cf6'),
  ('Здоровье', 'health', '#ef4444'),
  ('Матрасы', 'mattresses', '#06b6d4'),
  ('Сон', 'sleep', '#84cc16')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample blog posts
DO $$
DECLARE
  healthy_sleep_cat_id uuid;
  mattress_selection_cat_id uuid;
  tips_tag_id uuid;
  health_tag_id uuid;
  mattresses_tag_id uuid;
  sleep_tag_id uuid;
  post1_id uuid;
  post2_id uuid;
  post3_id uuid;
  post4_id uuid;
BEGIN
  -- Get category IDs
  SELECT id INTO healthy_sleep_cat_id FROM blog_categories WHERE slug = 'healthy-sleep';
  SELECT id INTO mattress_selection_cat_id FROM blog_categories WHERE slug = 'mattress-selection';
  
  -- Get tag IDs
  SELECT id INTO tips_tag_id FROM blog_tags WHERE slug = 'tips';
  SELECT id INTO health_tag_id FROM blog_tags WHERE slug = 'health';
  SELECT id INTO mattresses_tag_id FROM blog_tags WHERE slug = 'mattresses';
  SELECT id INTO sleep_tag_id FROM blog_tags WHERE slug = 'sleep';

  -- Insert blog posts
  INSERT INTO blog_posts (title, slug, excerpt, content, featured_image, category_id, status, is_featured, published_at, reading_time) VALUES
    (
      'Влияние здорового сна на организм',
      'healthy-sleep-impact',
      '😴 Здоровый сон - это один из важнейших факторов здоровья нашего организма.',
      'Здоровый сон играет критически важную роль в поддержании физического и психического здоровья. Во время сна наш организм восстанавливается, укрепляется иммунная система и происходит консолидация памяти.

Качественный сон помогает:
• Восстановить энергию и силы
• Укрепить иммунитет
• Улучшить концентрацию и память
• Поддержать эмоциональное равновесие
• Ускорить процессы заживления

Недостаток сна может привести к серьезным проблемам со здоровьем, включая ослабление иммунной системы, проблемы с сердцем, диабет и депрессию.',
      'https://ik.imagekit.io/3js0rb3pk/cover.png?updatedAt=1744149464470',
      healthy_sleep_cat_id,
      'published',
      true,
      now(),
      5
    ),
    (
      'Последствия нарушения сна',
      'sleep-disorders-consequences',
      'Хотим обсудить с вами очень важную тему - последствия нарушения сна.',
      'Нарушения сна могут иметь серьезные последствия для здоровья и качества жизни. Хронический недосып влияет на все системы организма.

Основные последствия нарушения сна:

**Физические последствия:**
• Ослабление иммунной системы
• Повышение риска сердечно-сосудистых заболеваний
• Нарушение обмена веществ
• Увеличение риска диабета
• Преждевременное старение

**Психологические последствия:**
• Снижение концентрации внимания
• Ухудшение памяти
• Повышенная раздражительность
• Депрессия и тревожность
• Снижение работоспособности

Важно обратиться к специалисту при хронических нарушениях сна.',
      'https://ik.imagekit.io/3js0rb3pk/cover1.png?updatedAt=1744149464740',
      healthy_sleep_cat_id,
      'published',
      false,
      now(),
      4
    ),
    (
      'Как спать и высыпаться?',
      'how-to-sleep-well',
      'Привет, друзья! Сегодня мы хотим поделиться с вами советом от специалиста',
      'Качественный сон - это искусство, которому можно научиться. Вот основные принципы здорового сна:

**Режим сна:**
• Ложитесь и вставайте в одно и то же время
• Спите 7-9 часов в сутки
• Избегайте дневного сна после 15:00

**Подготовка ко сну:**
• Создайте ритуал отхода ко сну
• Избегайте экранов за час до сна
• Проветрите спальню
• Поддерживайте температуру 18-20°C

**Правильная постель:**
• Выберите качественный матрас
• Используйте удобную подушку
• Обеспечьте темноту и тишину

**Образ жизни:**
• Регулярные физические упражнения
• Избегайте кофеина после 14:00
• Не ешьте тяжелую пищу перед сном
• Управляйте стрессом

Следуя этим простым правилам, вы значительно улучшите качество своего сна.',
      'https://ik.imagekit.io/3js0rb3pk/cover2.png?updatedAt=1744149464181',
      healthy_sleep_cat_id,
      'published',
      false,
      now(),
      6
    ),
    (
      'Матрас – залог вашего крепкого и здорового сна',
      'mattress-healthy-sleep',
      'Качество сна напрямую влияет на наше здоровье, настроение и продуктивность.',
      'Выбор правильного матраса - это инвестиция в ваше здоровье и качество жизни. Хороший матрас обеспечивает правильную поддержку позвоночника и комфортный сон.

**Как выбрать матрас:**

**1. Определите жесткость**
• Мягкие матрасы - для любителей спать на боку
• Средние - универсальный выбор
• Жесткие - для тех, кто спит на спине или животе

**2. Учтите вес**
• До 60 кг - мягкие и средние матрасы
• 60-90 кг - средние и умеренно жесткие
• Свыше 90 кг - жесткие матрасы

**3. Выберите размер**
• Односпальные: 80×200, 90×200
• Полутораспальные: 120×200
• Двуспальные: 140×200, 160×200, 180×200

**4. Материалы**
• Независимые пружины - лучшая поддержка
• Пена с эффектом памяти - анатомический комфорт
• Натуральные материалы - экологичность

**Признаки качественного матраса:**
• Сертификаты качества
• Гарантия от производителя
• Гипоаллергенные материалы
• Правильная вентиляция

В Sakina мы поможем вам выбрать идеальный матрас для здорового сна!',
      'https://ik.imagekit.io/3js0rb3pk/cover3.png?updatedAt=1744149462628',
      mattress_selection_cat_id,
      'published',
      false,
      now(),
      7
    )
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO post1_id, post2_id, post3_id, post4_id;

  -- Get the actual post IDs for tagging
  SELECT id INTO post1_id FROM blog_posts WHERE slug = 'healthy-sleep-impact';
  SELECT id INTO post2_id FROM blog_posts WHERE slug = 'sleep-disorders-consequences';
  SELECT id INTO post3_id FROM blog_posts WHERE slug = 'how-to-sleep-well';
  SELECT id INTO post4_id FROM blog_posts WHERE slug = 'mattress-healthy-sleep';

  -- Add tags to posts
  INSERT INTO blog_post_tags (post_id, tag_id) VALUES
    (post1_id, health_tag_id),
    (post1_id, sleep_tag_id),
    (post2_id, health_tag_id),
    (post2_id, sleep_tag_id),
    (post3_id, tips_tag_id),
    (post3_id, sleep_tag_id),
    (post4_id, mattresses_tag_id),
    (post4_id, tips_tag_id)
  ON CONFLICT DO NOTHING;
END $$;