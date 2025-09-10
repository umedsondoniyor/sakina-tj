/*
  # Create Blog System

  1. New Tables
    - `blog_categories`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `description` (text, optional)
      - `color` (text, for UI theming)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `blog_tags`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `slug` (text, unique)
      - `color` (text, for UI theming)
      - `is_active` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `blog_posts`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `slug` (text, unique)
      - `excerpt` (text, short description)
      - `content` (text, full content)
      - `featured_image` (text, URL)
      - `category_id` (uuid, foreign key)
      - `author_id` (uuid, foreign key to user_profiles)
      - `status` (enum: draft, published, archived)
      - `is_featured` (boolean, for main post)
      - `published_at` (timestamp)
      - `reading_time` (integer, estimated minutes)
      - `view_count` (integer, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `blog_post_tags` (junction table)
      - `post_id` (uuid, foreign key)
      - `tag_id` (uuid, foreign key)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all blog tables
    - Add policies for public read access to published content
    - Add policies for admin management

  3. Indexes
    - Performance indexes for common queries
    - Full-text search indexes for content
*/

-- Blog Categories
CREATE TABLE IF NOT EXISTS blog_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  color text DEFAULT '#0fb6c9',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Blog Tags
CREATE TABLE IF NOT EXISTS blog_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  slug text UNIQUE NOT NULL,
  color text DEFAULT '#0fb6c9',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Blog Posts
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text,
  featured_image text,
  category_id uuid REFERENCES blog_categories(id) ON DELETE SET NULL,
  author_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  is_featured boolean DEFAULT false,
  published_at timestamptz,
  reading_time integer DEFAULT 5,
  view_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Blog Post Tags (Many-to-Many)
CREATE TABLE IF NOT EXISTS blog_post_tags (
  post_id uuid REFERENCES blog_posts(id) ON DELETE CASCADE,
  tag_id uuid REFERENCES blog_tags(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (post_id, tag_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_author ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(is_featured);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_categories_active ON blog_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_blog_tags_active ON blog_tags(is_active);

-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_blog_posts_search ON blog_posts USING gin(to_tsvector('russian', title || ' ' || COALESCE(excerpt, '') || ' ' || COALESCE(content, '')));

-- Enable RLS
ALTER TABLE blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_post_tags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for blog_categories
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

-- RLS Policies for blog_tags
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

-- RLS Policies for blog_posts
CREATE POLICY "Allow public read access to published posts"
  ON blog_posts
  FOR SELECT
  TO public
  USING (status = 'published' AND published_at <= now());

CREATE POLICY "Admins can manage all posts"
  ON blog_posts
  FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Authors can manage their own posts"
  ON blog_posts
  FOR ALL
  TO authenticated
  USING (author_id = uid())
  WITH CHECK (author_id = uid());

-- RLS Policies for blog_post_tags
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

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION update_blog_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blog_categories_updated_at
  BEFORE UPDATE ON blog_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_updated_at_column();

CREATE TRIGGER update_blog_tags_updated_at
  BEFORE UPDATE ON blog_tags
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_updated_at_column();

-- Function to automatically set published_at when status changes to published
CREATE OR REPLACE FUNCTION set_blog_post_published_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'published' AND OLD.status != 'published' THEN
    NEW.published_at = COALESCE(NEW.published_at, now());
  ELSIF NEW.status != 'published' THEN
    NEW.published_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER set_blog_post_published_at_trigger
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION set_blog_post_published_at();

-- Insert default blog categories
INSERT INTO blog_categories (name, slug, description, color) VALUES
  ('Здоровый сон', 'healthy-sleep', 'Статьи о важности и влиянии здорового сна', '#0fb6c9'),
  ('Советы экспертов', 'expert-tips', 'Профессиональные рекомендации от специалистов', '#10b981'),
  ('Уход за матрасом', 'mattress-care', 'Как правильно ухаживать за матрасом', '#f59e0b'),
  ('Новости компании', 'company-news', 'Новости и обновления от Sakina', '#8b5cf6')
ON CONFLICT (slug) DO NOTHING;

-- Insert default blog tags
INSERT INTO blog_tags (name, slug, color) VALUES
  ('Сон', 'sleep', '#0fb6c9'),
  ('Здоровье', 'health', '#10b981'),
  ('Матрас', 'mattress', '#f59e0b'),
  ('Советы', 'tips', '#8b5cf6'),
  ('Исследования', 'research', '#ef4444'),
  ('Уход', 'care', '#06b6d4')
ON CONFLICT (slug) DO NOTHING;