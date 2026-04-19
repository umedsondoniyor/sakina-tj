/*
  # Seed three mattress guide posts (formerly static BlogGuide* pages)

  Same URLs: /blog/kak-vybrat-matras, /blog/matras-dlya-boli-v-spine, /blog/zhestkost-matrasa
  Idempotent: ON CONFLICT (slug) updates copy so re-runs align with app.
*/

INSERT INTO blog_posts (
  title,
  slug,
  excerpt,
  content,
  featured_image,
  category_id,
  author_id,
  status,
  is_featured,
  published_at,
  reading_time,
  view_count
)
VALUES
  (
    'Как выбрать матрас: практическое руководство для Душанбе',
    'kak-vybrat-matras',
    'Подробный гид по выбору матраса: жесткость, высота, наполнение и размер. Советы перед покупкой в Душанбе.',
    $c1$Это базовый гид, который поможет быстро выбрать подходящий матрас по размерам, жесткости и наполнителям. Полная версия материала готовится и будет опубликована в ближайшее время.

## Что учесть при выборе

- Размер матраса под вашу кровать (например, 160x200 или 180x200).
- Жесткость в зависимости от предпочтений и веса.
- Высота и состав слоев (latex, memory foam, пружинный блок).
- Наличие индивидуального производства под нестандартные размеры.$c1$,
    NULL,
    NULL,
    NULL,
    'published',
    false,
    now(),
    2,
    0
  ),
  (
    'Матрас для боли в спине: как выбрать в Душанбе',
    'matras-dlya-boli-v-spine',
    'Практические рекомендации по выбору матраса при болях в спине: жесткость, высота и поддержка позвоночника.',
    $c2$Этот материал поможет выбрать матрас, который поддерживает позвоночник и снижает нагрузку на поясницу. Расширенная версия статьи готовится к публикации.$c2$,
    NULL,
    NULL,
    NULL,
    'published',
    false,
    now(),
    1,
    0
  ),
  (
    'Жесткость матраса: какую выбрать в Душанбе',
    'zhestkost-matrasa',
    'Разбираем, как подобрать жесткость матраса под вес, привычки сна и состояние спины.',
    $c3$Краткий гид по выбору жесткости матраса: мягкий, средний или жесткий вариант. Полный разбор скоро появится в блоге.$c3$,
    NULL,
    NULL,
    NULL,
    'published',
    false,
    now(),
    1,
    0
  )
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  status = EXCLUDED.status,
  reading_time = EXCLUDED.reading_time,
  updated_at = now();
