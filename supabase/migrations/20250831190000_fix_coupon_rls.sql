-- Fix RLS policy for coupons to allow public access
-- Drop the restrictive policy that's blocking public access
DROP POLICY IF EXISTS "Company admins can view their company coupons" ON public.coupons;
DROP POLICY IF EXISTS "Super admins can view all coupons" ON public.coupons;

-- Create a simple policy that allows anyone to view coupons
CREATE POLICY "Anyone can view coupons" 
ON public.coupons 
FOR SELECT 
USING (true);

-- Keep the existing policy for other operations
CREATE POLICY "Company admins can manage their coupons" 
ON public.coupons 
FOR ALL 
USING (
  has_role(auth.uid(), 'company_admin') 
  AND company_id = get_user_company_id()
);

CREATE POLICY "Super admins can manage all coupons" 
ON public.coupons 
FOR ALL 
USING (has_role(auth.uid(), 'super_admin'));
