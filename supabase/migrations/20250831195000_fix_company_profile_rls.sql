-- Fix RLS policies for companies and profiles so users can save their company profile
-- When a user creates a company, they automatically become company_admin for that company

-- First, drop restrictive policies
DROP POLICY IF EXISTS "Company admins can view and update their company" ON public.companies;
DROP POLICY IF EXISTS "Companies are viewable by everyone for public access" ON public.companies;

-- Create simple policies for companies
CREATE POLICY "Users can create their own company" ON public.companies
FOR INSERT WITH CHECK (owner_user_id = auth.uid());

CREATE POLICY "Users can view and update their own company" ON public.companies
FOR ALL USING (
  owner_user_id = auth.uid() OR 
  public.has_role(auth.uid(), 'super_admin')
);

CREATE POLICY "Companies are viewable by everyone for public access" ON public.companies
FOR SELECT USING (is_active = true);

-- Fix profiles table policies
DROP POLICY IF EXISTS "Users can manage their own profile" ON public.profiles;

CREATE POLICY "Users can create their own profile" ON public.profiles
FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view and update their own profile" ON public.profiles
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Super admins can manage all profiles" ON public.profiles
FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Create function to automatically assign company_admin role when company is created
CREATE OR REPLACE FUNCTION public.handle_new_company()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert company_admin role for the company owner
  INSERT INTO public.user_roles (user_id, role, company_id)
  VALUES (NEW.owner_user_id, 'company_admin', NEW.id)
  ON CONFLICT (user_id, role, company_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Create trigger to automatically assign company_admin role
DROP TRIGGER IF EXISTS on_company_created ON public.companies;
CREATE TRIGGER on_company_created
  AFTER INSERT ON public.companies
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_company();

-- Create storage policies for uploads bucket
CREATE POLICY "Users can upload to uploads bucket" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'uploads' AND 
  (auth.uid() IS NOT NULL)
);

CREATE POLICY "Users can view uploads" ON storage.objects
FOR SELECT USING (bucket_id = 'uploads');

-- Create storage policies for profiles bucket
CREATE POLICY "Users can upload to profiles bucket" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'profiles' AND 
  (auth.uid() IS NOT NULL)
);

CREATE POLICY "Users can view profiles" ON storage.objects
FOR SELECT USING (bucket_id = 'profiles');
