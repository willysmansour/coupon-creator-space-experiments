-- Update user roles enum to include company admin
DROP TYPE IF EXISTS app_role CASCADE;
CREATE TYPE app_role AS ENUM ('super_admin', 'company_admin', 'customer');

-- Recreate user_roles table with updated enum
DROP TABLE IF EXISTS public.user_roles CASCADE;
CREATE TABLE public.user_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'customer',
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    UNIQUE(user_id, role, company_id)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Update profiles table to include company_id
ALTER TABLE public.profiles ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE SET NULL;

-- Update companies table to add owner information
ALTER TABLE public.companies ADD COLUMN owner_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.companies ADD COLUMN is_active boolean DEFAULT true;

-- Recreate security functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() ORDER BY 
    CASE 
      WHEN role = 'super_admin' THEN 1
      WHEN role = 'company_admin' THEN 2
      ELSE 3
    END
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT company_id FROM public.user_roles WHERE user_id = auth.uid() AND role = 'company_admin' LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT public.has_role(auth.uid(), 'super_admin');
$$;

-- Update RLS policies for user_roles
CREATE POLICY "Super admins can manage all roles" ON public.user_roles
FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (user_id = auth.uid());

-- Update RLS policies for companies
DROP POLICY IF EXISTS "Admins can manage companies" ON public.companies;
DROP POLICY IF EXISTS "Companies are viewable by everyone" ON public.companies;

CREATE POLICY "Super admins can manage all companies" ON public.companies
FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Company admins can view and update their company" ON public.companies
FOR ALL USING (
  public.has_role(auth.uid(), 'company_admin') AND 
  id = public.get_user_company_id()
);

CREATE POLICY "Companies are viewable by everyone for public access" ON public.companies
FOR SELECT USING (is_active = true);

-- Update RLS policies for campaigns
DROP POLICY IF EXISTS "Admins can manage campaigns" ON public.campaigns;

CREATE POLICY "Super admins can manage all campaigns" ON public.campaigns
FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Company admins can manage their campaigns" ON public.campaigns
FOR ALL USING (
  public.has_role(auth.uid(), 'company_admin') AND 
  company_id = public.get_user_company_id()
);

-- Update RLS policies for uploads
DROP POLICY IF EXISTS "Admins can manage all uploads" ON public.uploads;
DROP POLICY IF EXISTS "Uploads are viewable by admins" ON public.uploads;

CREATE POLICY "Super admins can manage all uploads" ON public.uploads
FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Company admins can manage their uploads" ON public.uploads
FOR ALL USING (
  public.has_role(auth.uid(), 'company_admin') AND 
  company_id = public.get_user_company_id()
);

-- Update RLS policies for coupons
DROP POLICY IF EXISTS "Admins can delete coupons" ON public.coupons;
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;

CREATE POLICY "Super admins can manage all coupons" ON public.coupons
FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Company admins can manage their coupons" ON public.coupons
FOR ALL USING (
  public.has_role(auth.uid(), 'company_admin') AND 
  company_id = public.get_user_company_id()
);

-- Update RLS policies for profiles
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can manage their own profile" ON public.profiles
FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Super admins can manage all profiles" ON public.profiles
FOR ALL USING (public.has_role(auth.uid(), 'super_admin'));

-- Update the handle_new_user function to assign default customer role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert default customer role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer')
  ON CONFLICT (user_id, role, company_id) DO NOTHING;
  RETURN NEW;
END;
$$;