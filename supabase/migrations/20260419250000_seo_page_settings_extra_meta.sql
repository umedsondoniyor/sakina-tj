-- Optional extra <meta> tags per route (JSON array), e.g. og:image, twitter:card

ALTER TABLE seo_page_settings
  ADD COLUMN IF NOT EXISTS extra_meta jsonb NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN seo_page_settings.extra_meta IS
  'Array of { name?, property?, content } for additional head meta tags.';
