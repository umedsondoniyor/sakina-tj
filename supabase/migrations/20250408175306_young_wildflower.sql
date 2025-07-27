/*
  # Product Catalog Schema

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (numeric)
      - `old_price` (numeric)
      - `image_url` (text)
      - `category` (text)
      - `sale_percentage` (integer)
      - `rating` (numeric)
      - `review_count` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `categories`
      - `id` (uuid, primary key)
      - `name` (text)
      - `slug` (text)
      - `image_url` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for admin write access
*/

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL,
  old_price numeric,
  image_url text,
  category text NOT NULL,
  sale_percentage integer,
  rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policies for products
CREATE POLICY "Allow public read access" ON products
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to create products" ON products
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update their products" ON products
  FOR UPDATE TO authenticated USING (true);

-- Policies for categories
CREATE POLICY "Allow public read access" ON categories
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to create categories" ON categories
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update categories" ON categories
  FOR UPDATE TO authenticated USING (true);

-- Add updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers
CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();