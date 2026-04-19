-- Human-readable URLs for products: /products/my-product-slug (SEO-friendly vs UUID-only)

ALTER TABLE products ADD COLUMN IF NOT EXISTS slug text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug_unique ON products (slug) WHERE slug IS NOT NULL;

COMMENT ON COLUMN products.slug IS 'URL segment for /products/:slug; Latin kebab-case, unique when set';
