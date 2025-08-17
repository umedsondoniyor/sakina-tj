/*
  # Create quiz steps management system

  1. New Tables
    - `quiz_steps`
      - `id` (uuid, primary key)
      - `label` (text, question text)
      - `step_key` (text, unique identifier)
      - `order_index` (integer, display order)
      - `is_active` (boolean, whether step is enabled)
      - `parent_step_key` (text, conditional parent step)
      - `parent_value` (text, required parent value to show this step)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `quiz_step_options`
      - `id` (uuid, primary key)
      - `step_id` (uuid, foreign key to quiz_steps)
      - `option_value` (text, option value)
      - `option_label` (text, display label)
      - `image_url` (text, option image)
      - `order_index` (integer, display order)
      - `is_active` (boolean, whether option is enabled)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access
    - Add policies for admin management