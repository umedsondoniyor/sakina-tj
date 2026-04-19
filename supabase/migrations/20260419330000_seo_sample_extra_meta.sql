/*
  # Sample extra_meta for testing Helmet + index.html inject (only when still empty)

  Safe to re-run: updates only rows where extra_meta is still the default [].
*/

UPDATE seo_page_settings
SET
  extra_meta = '[
    {"property": "og:image", "content": "https://sakina.tj/og/cover-1200x630.jpg"},
    {"name": "twitter:card", "content": "summary_large_image"},
    {"name": "twitter:image", "content": "https://sakina.tj/og/cover-1200x630.jpg"}
  ]'::jsonb,
  updated_at = now()
WHERE route_key = 'default'
  AND extra_meta = '[]'::jsonb;
