/*
  # Add card_image field to customer_reviews table

  1. Changes
    - Add card_image column to customer_reviews table
    - Update existing records with default card images
    - Add NOT NULL constraint after setting defaults

  2. Security
    - No changes to RLS policies needed
    - Existing policies will cover the new field
*/

-- Add card_image column
ALTER TABLE customer_reviews 
ADD COLUMN card_image text;

-- Update existing records with static card images
UPDATE customer_reviews
SET card_image = 'info-images/azizkam.png'
WHERE username = '@azizka.m @farik.mukhtarov';

UPDATE customer_reviews
SET card_image = 'info-images/prozarnigor.png'
WHERE username = '@prozarnigor';

UPDATE customer_reviews
SET card_image = 'info-images/ibragimov.png'
WHERE username = '@ibragimov.t.z';

UPDATE customer_reviews
SET card_image = 'info-images/behruz.png'
WHERE username = '@sakina.tj';

-- Add NOT NULL constraint after setting defaults
ALTER TABLE customer_reviews 
ALTER COLUMN card_image SET NOT NULL;