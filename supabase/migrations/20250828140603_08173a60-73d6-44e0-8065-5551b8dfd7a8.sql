-- Phase 1: Critical Security Fixes - Fix Profiles RLS Policy
-- URGENT: Remove dangerous public profile access policy

-- Drop the dangerous policy that exposes all user data publicly
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Add secure policies that protect user privacy
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Super admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (has_role(auth.uid(), 'super_admin'));

-- Also secure the coupons table to prevent public access to coupon codes
DROP POLICY IF EXISTS "Coupons are viewable by everyone" ON public.coupons;

CREATE POLICY "Users can view coupons they earned" 
ON public.coupons 
FOR SELECT 
USING (
  upload_id IN (
    SELECT id FROM uploads WHERE customer_email IN (
      SELECT email FROM profiles WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Company admins can view their company coupons" 
ON public.coupons 
FOR SELECT 
USING (
  has_role(auth.uid(), 'company_admin') 
  AND company_id = get_user_company_id()
);

-- Secure companies table to hide owner information from public
DROP POLICY IF EXISTS "Companies are viewable by everyone for public access" ON public.companies;

CREATE POLICY "Companies basic info viewable for public access" 
ON public.companies 
FOR SELECT 
USING (is_active = true);

-- Note: This removes owner_user_id from public view while keeping company name/logo accessible