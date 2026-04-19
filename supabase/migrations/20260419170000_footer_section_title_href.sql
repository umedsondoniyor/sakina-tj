-- Optional URL for the column title when there are no child links (clickable heading only)
ALTER TABLE footer_sections ADD COLUMN IF NOT EXISTS title_href text;

-- «О компании»: one clickable title → /about, no sub-links
UPDATE footer_sections SET title_href = '/about' WHERE slug = 'company';

DELETE FROM footer_section_links
WHERE section_id IN (SELECT id FROM footer_sections WHERE slug = 'company');
