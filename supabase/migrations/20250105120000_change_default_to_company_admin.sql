-- Change default role from customer to company_admin and auto-create company
-- This ensures all new registrations become company admins with their own company

-- Update the handle_new_user function to create company_admin + company
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_company_id uuid;
BEGIN
  -- Skip if this is the designated superadmin
  IF NEW.email = 'admin@test.com' THEN
    RETURN NEW;
  END IF;

  -- Create a company for the new user
  INSERT INTO public.companies (name, owner_user_id, is_active, discount_active)
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'company_name', 'New Company'),
    NEW.id,
    true,
    true
  )
  RETURNING id INTO new_company_id;

  -- Assign company_admin role (not customer)
  INSERT INTO public.user_roles (user_id, role, company_id)
  VALUES (NEW.id, 'company_admin', new_company_id)
  ON CONFLICT (user_id, role, company_id) DO NOTHING;

  -- Create profile
  INSERT INTO public.profiles (user_id, email, first_name, last_name, company_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    new_company_id
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$;
