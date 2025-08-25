-- Fix RLS policies for companies table to allow operations
DROP POLICY IF EXISTS "Admins can manage companies" ON public.companies;

-- Allow everyone to create and update companies
CREATE POLICY "Anyone can manage companies" 
ON public.companies 
FOR ALL 
USING (true)
WITH CHECK (true);