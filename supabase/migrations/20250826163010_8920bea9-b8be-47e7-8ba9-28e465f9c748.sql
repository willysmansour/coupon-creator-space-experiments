-- Idempotent security hardening migration
-- 1) Roles enum and table
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'customer');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'customer',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2) Helper functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS public.app_role
LANGUAGE SQL STABLE SECURITY DEFINER AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- 3) Clean up overly permissive policies and re-create secure ones
-- Companies
DROP POLICY IF EXISTS "Anyone can manage companies" ON public.companies;
DROP POLICY IF EXISTS "Companies are viewable by everyone" ON public.companies;

CREATE POLICY "Admins can manage companies" ON public.companies
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Companies are viewable by everyone" ON public.companies
FOR SELECT USING (true);

-- Campaigns
DROP POLICY IF EXISTS "Anyone can manage campaigns" ON public.campaigns;
CREATE POLICY "Admins can manage campaigns" ON public.campaigns
FOR ALL USING (public.has_role(auth.uid(), 'admin'));
-- Keep existing public SELECT for active campaigns

-- Uploads
DROP POLICY IF EXISTS "Anyone can update uploads" ON public.uploads;
DROP POLICY IF EXISTS "Anyone can delete uploads" ON public.uploads;
-- keep existing INSERT and SELECT public policies if present
CREATE POLICY IF NOT EXISTS "Admins can manage all uploads" ON public.uploads
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Coupons
DROP POLICY IF EXISTS "Anyone can delete coupons" ON public.coupons;
CREATE POLICY "Admins can delete coupons" ON public.coupons
FOR DELETE USING (public.has_role(auth.uid(), 'admin'));
-- keep existing public SELECT and redeem policies

-- 4) Assign default role to new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer')
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();