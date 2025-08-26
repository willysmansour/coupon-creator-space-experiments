-- Create user roles system
CREATE TYPE public.app_role AS ENUM ('admin', 'customer');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = auth.uid() 
  LIMIT 1
$$;

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Anyone can manage companies" ON public.companies;
DROP POLICY IF EXISTS "Anyone can manage campaigns" ON public.campaigns; 
DROP POLICY IF EXISTS "Anyone can create uploads" ON public.uploads;
DROP POLICY IF EXISTS "Anyone can update uploads" ON public.uploads;
DROP POLICY IF EXISTS "Anyone can delete uploads" ON public.uploads;
DROP POLICY IF EXISTS "Anyone can delete coupons" ON public.coupons;

-- Create secure RLS policies for companies
CREATE POLICY "Admins can manage companies" ON public.companies
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Companies are viewable by everyone" ON public.companies
FOR SELECT USING (true);

-- Create secure RLS policies for campaigns  
CREATE POLICY "Admins can manage campaigns" ON public.campaigns
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create secure RLS policies for uploads
CREATE POLICY "Anyone can create uploads" ON public.uploads
FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can manage all uploads" ON public.uploads
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Uploads are viewable by admins" ON public.uploads
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Create secure RLS policies for coupons
CREATE POLICY "Admins can view all coupons" ON public.coupons
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete coupons" ON public.coupons
FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Create secure RLS policies for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all roles" ON public.user_roles
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create function to handle new user signup (creates customer role by default)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'customer');
  RETURN new;
END;
$$;

-- Create trigger to assign default role on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();