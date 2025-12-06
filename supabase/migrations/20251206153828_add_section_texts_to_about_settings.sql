/*
  # Add section titles and descriptions to about_settings table

  1. New Columns
    - Add section titles and descriptions for Mission, Timeline, Team, and CTA sections
    - These will allow admins to customize all text on the About page
*/

ALTER TABLE about_settings 
ADD COLUMN IF NOT EXISTS mission_section_title text DEFAULT 'Наша миссия',
ADD COLUMN IF NOT EXISTS timeline_section_title text DEFAULT 'История развития',
ADD COLUMN IF NOT EXISTS timeline_section_description text DEFAULT 'Путь от небольшой мастерской до ведущего производителя товаров для сна',
ADD COLUMN IF NOT EXISTS team_section_title text DEFAULT 'Наша команда',
ADD COLUMN IF NOT EXISTS team_section_description text DEFAULT 'Профессионалы, которые делают ваш сон лучше каждый день',
ADD COLUMN IF NOT EXISTS cta_title text DEFAULT 'Готовы улучшить качество вашего сна?',
ADD COLUMN IF NOT EXISTS cta_description text DEFAULT 'Свяжитесь с нами для персональной консультации и подбора идеального матраса';

