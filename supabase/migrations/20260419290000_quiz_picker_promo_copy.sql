/*
  # Quiz picker home cards — editable title, subtitle, image, CTA (per mattress / bed)
*/

ALTER TABLE quiz_picker_visibility
  ADD COLUMN IF NOT EXISTS title text,
  ADD COLUMN IF NOT EXISTS subtitle text,
  ADD COLUMN IF NOT EXISTS image_url text,
  ADD COLUMN IF NOT EXISTS cta_label text;

UPDATE quiz_picker_visibility SET
  title = CASE product_type
    WHEN 'mattress' THEN 'Подборщик матрасов'
    WHEN 'bed' THEN 'Подборщик кроватей'
  END,
  subtitle = CASE product_type
    WHEN 'mattress' THEN 'создайте идеальное место для сна'
    WHEN 'bed' THEN 'более 100 моделей для детей и взрослых'
  END,
  image_url = CASE product_type
    WHEN 'mattress' THEN '/images/picker/mattress_picker.png'
    WHEN 'bed' THEN 'https://ik.imagekit.io/3js0rb3pk/bed.png'
  END,
  cta_label = 'Подобрать'
WHERE title IS NULL OR trim(title) = '';

ALTER TABLE quiz_picker_visibility ALTER COLUMN title SET NOT NULL;
ALTER TABLE quiz_picker_visibility ALTER COLUMN subtitle SET NOT NULL;
ALTER TABLE quiz_picker_visibility ALTER COLUMN image_url SET NOT NULL;
ALTER TABLE quiz_picker_visibility ALTER COLUMN cta_label SET NOT NULL;
