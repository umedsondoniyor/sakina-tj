/*
  # Privacy policy page (manageable content for /privacy)

  Single-row settings: title, SEO, intro, markdown body.
*/

CREATE TABLE IF NOT EXISTS privacy_policy_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page_title text NOT NULL DEFAULT 'Политика конфиденциальности',
  meta_description text,
  intro text,
  body_markdown text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE privacy_policy_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read privacy policy settings"
  ON privacy_policy_settings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Staff can manage privacy policy settings"
  ON privacy_policy_settings
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'editor')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role IN ('admin', 'editor')
    )
  );

DROP TRIGGER IF EXISTS update_privacy_policy_settings_updated_at ON privacy_policy_settings;
CREATE TRIGGER update_privacy_policy_settings_updated_at
  BEFORE UPDATE ON privacy_policy_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DO $seed$
DECLARE
  default_body text := $markdown$
## 1. Общие положения

Настоящая политика описывает, какие персональные данные могут обрабатываться при использовании сайта, оформлении заказов, доставке товаров и обращении в службу поддержки. Мы обрабатываем данные добросовестно, в объёме, необходимом для оказания услуг и исполнения закона.

## 2. Какие данные мы можем собирать

- Контактные данные: имя, номер телефона, адрес доставки, адрес электронной почты (если указаны).
- Данные о заказах: состав заказа, способ оплаты и доставки, история обращений.
- Технические данные: IP-адрес, тип браузера, сведения об устройстве, файлы cookie (см. ниже).

## 3. Цели обработки

Данные используются для приёма и обработки заказов, доставки товаров, связи с вами по вопросам заказа, улучшения работы сайта, соблюдения требований законодательства, защиты прав сторон при спорах, а также — с вашего отдельного согласия — для рассылок и акций, если вы на них подписались.

## 4. Файлы cookie и аналитика

Сайт может использовать cookie и аналогичные технологии для работы корзины, сессии, запоминания настроек и оценки посещаемости. Вы можете ограничить cookie в настройках браузера; часть функций сайта при этом может работать ограниченно.

## 5. Передача данных третьим лицам

Мы можем передавать необходимый минимум данных службам доставки, платёжным провайдерам и юридически уполномоченным органам, если это требуется для исполнения заказа или по закону. Такие получатели обязаны использовать данные только в указанных целях.

## 6. Хранение и защита

Данные хранятся столько, сколько нужно для целей, описанных выше, и не дольше, чем это допустимо по закону. Мы применяем организационные и технические меры, разумно необходимые для защиты данных от несанкционированного доступа.

## 7. Ваши права

Вы можете запросить уточнение обрабатываемых данных, исправление неточностей, удаление или ограничение обработки там, где это применимо. Для обращений используйте контакты ниже.

## 8. Контакты

Вопросы по персональным данным: [+992 90 533 9595](tel:+992905339595), а также через раздел [Контакты](/contacts) на сайте.
$markdown$;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM privacy_policy_settings LIMIT 1) THEN
    INSERT INTO privacy_policy_settings (page_title, meta_description, intro, body_markdown)
    VALUES (
      'Политика конфиденциальности',
      'Как Sakina обрабатывает персональные данные при заказах, доставке и работе сайта sakina.tj.',
      'Действует для сайта sakina.tj и сервисов Sakina. Обновляется по мере необходимости; актуальная версия всегда на этой странице.',
      default_body
    );
  END IF;
END
$seed$;

INSERT INTO menu_role_permissions (path, label, section, roles)
VALUES ('/admin/privacy', 'Политика конфиденциальности', 'Контент', ARRAY['admin', 'editor']::text[])
ON CONFLICT (path) DO UPDATE SET
  label = EXCLUDED.label,
  section = EXCLUDED.section,
  roles = EXCLUDED.roles,
  updated_at = now();
