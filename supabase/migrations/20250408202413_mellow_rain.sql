/*
  # Schema Improvements

  1. Constraints
    - Add price range constraints
    - Add rating range constraints
    - Add sale percentage range constraints
  
  2. Indexes
    - Add indexes for frequently queried columns
    - Add composite indexes for common query patterns
    
  3. Triggers
    - Add trigger for updating sale_percentage based on price changes
*/

-- Add constraints to products table
ALTER TABLE products
  ADD CONSTRAINT check_price_positive CHECK (price >= 0),
  ADD CONSTRAINT check_old_price_positive CHECK (old_price >= 0),
  ADD CONSTRAINT check_rating_range CHECK (rating >= 0 AND rating <= 5),
  ADD CONSTRAINT check_review_count_positive CHECK (review_count >= 0),
  ADD CONSTRAINT check_sale_percentage_range CHECK (sale_percentage >= 0 AND sale_percentage <= 100);

-- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products (rating DESC);
CREATE INDEX IF NOT EXISTS idx_products_review_count ON products (review_count DESC);
CREATE INDEX IF NOT EXISTS idx_products_price ON products (price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products (created_at DESC);

-- Add composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_products_category_rating ON products (category, rating DESC);
CREATE INDEX IF NOT EXISTS idx_products_category_price ON products (category, price);

-- Add indexes for user_profiles
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles (role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles (email);

-- Add indexes for categories
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories (slug);

-- Create function to calculate sale percentage
CREATE OR REPLACE FUNCTION calculate_sale_percentage()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.old_price IS NOT NULL AND NEW.old_price > 0 AND NEW.price < NEW.old_price THEN
    NEW.sale_percentage := ROUND(((NEW.old_price - NEW.price) / NEW.old_price * 100)::numeric);
  ELSE
    NEW.sale_percentage := NULL;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update sale_percentage
DROP TRIGGER IF EXISTS update_sale_percentage ON products;
CREATE TRIGGER update_sale_percentage
  BEFORE INSERT OR UPDATE OF price, old_price
  ON products
  FOR EACH ROW
  EXECUTE FUNCTION calculate_sale_percentage();