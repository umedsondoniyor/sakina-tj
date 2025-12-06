/*
  # Add mission_text to about_settings table

  1. New Column
    - Add `mission_text` (text, nullable) to `about_settings` table
    - This will store the mission statement text displayed above the values section
*/

ALTER TABLE about_settings 
ADD COLUMN IF NOT EXISTS mission_text text;

