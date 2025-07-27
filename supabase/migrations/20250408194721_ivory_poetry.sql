/*
  # Create Admin User and Role

  1. Changes
    - Creates an initial admin user
    - Adds admin role to user_profiles
    - Sets up admin permissions
*/

-- First, check if the admin user already exists
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  -- Try to get existing admin user id
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@sakina.com';

  -- If admin user doesn't exist, create one
  IF admin_user_id IS NULL THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@sakina.com',
      crypt('admin123', gen_salt('bf')),
      now(),
      now(),
      now()
    )
    RETURNING id INTO admin_user_id;
  END IF;

  -- Create or update admin profile
  INSERT INTO public.user_profiles (
    id,
    full_name,
    role,
    created_at,
    updated_at
  ) VALUES (
    admin_user_id,
    'Admin User',
    'admin',
    now(),
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    role = 'admin',
    updated_at = now();

END $$;