/*
  # Optional meta keywords for SEO rows (home / default resolution in app)
*/

ALTER TABLE seo_page_settings
  ADD COLUMN IF NOT EXISTS meta_keywords text;

COMMENT ON COLUMN seo_page_settings.meta_keywords IS 'Comma-separated keywords for <meta name="keywords">; home overrides default.';

UPDATE seo_page_settings
SET meta_keywords = 'матрасы, кровати, подушки, одеяла, Sakina, ортопедический матрас, Таджикистан'
WHERE route_key IN ('default', 'home')
  AND (meta_keywords IS NULL OR btrim(meta_keywords) = '');
