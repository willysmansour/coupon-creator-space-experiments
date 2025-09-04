-- Fix handle_new_user trigger to properly create profiles and companies
-- This ensures all new registrations get complete profiles automatically

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_company_id uuid;
  user_first_name text;
  user_last_name text;
  company_name text;
BEGIN
  -- Skip if this is the designated superadmin
  IF NEW.email = 'admin@test.com' THEN
    RETURN NEW;
  END IF;

  -- Extract data from metadata with fallbacks
  user_first_name := COALESCE(NEW.raw_user_meta_data->>'first_name', 'User');
  user_last_name := COALESCE(NEW.raw_user_meta_data->>'last_name', 'Name');
  company_name := COALESCE(NEW.raw_user_meta_data->>'company_name', 'New Company');

  -- Create a company for the new user
  INSERT INTO public.companies (name, owner_user_id, is_active, discount_active)
  VALUES (company_name, NEW.id, true, true)
  RETURNING id INTO new_company_id;

  -- Assign company_admin role (not customer)
  INSERT INTO public.user_roles (user_id, role, company_id)
  VALUES (NEW.id, 'company_admin', new_company_id)
  ON CONFLICT (user_id, role, company_id) DO NOTHING;

  -- Create profile with proper data
  INSERT INTO public.profiles (user_id, email, first_name, last_name, company_id)
  VALUES (
    NEW.id,
    NEW.email,
    user_first_name,
    user_last_name,
    new_company_id
  )
  ON CONFLICT (user_id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    company_id = EXCLUDED.company_id;

  RETURN NEW;
END;
$$;

-- Create trigger to automatically call function on new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix existing users that have empty profiles
UPDATE public.profiles p
SET 
  email = au.email,
  first_name = COALESCE(au.raw_user_meta_data->>'first_name', 'User'),
  last_name = COALESCE(au.raw_user_meta_data->>'last_name', 'Name')
FROM auth.users au
WHERE p.user_id = au.id
  AND (p.email = '' OR p.email IS NULL OR p.first_name = '' OR p.first_name IS NULL);

-- Create missing profile for test@test.com user if it doesn't exist
INSERT INTO public.profiles (user_id, email, first_name, last_name, company_id)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'first_name', 'User'),
  COALESCE(au.raw_user_meta_data->>'last_name', 'Name'),
  ur.company_id
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.user_id
LEFT JOIN public.user_roles ur ON au.id = ur.user_id AND ur.role = 'company_admin'
WHERE au.email = 'test@test.com'
  AND p.user_id IS NULL
ON CONFLICT (user_id) DO NOTHING;
