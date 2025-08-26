-- Fix RLS policy issue for company registration
-- Allow authenticated users without existing company roles to create companies

-- Add policy to allow authenticated users to create companies if they don't have one yet
CREATE POLICY "Authenticated users can create their first company" 
ON public.companies 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND (role = 'company_admin' OR role = 'super_admin')
  )
);

-- Also ensure the owner_user_id matches the authenticated user
DROP POLICY IF EXISTS "Authenticated users can create their first company" ON public.companies;

CREATE POLICY "Authenticated users can create their first company" 
ON public.companies 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  owner_user_id = auth.uid() AND
  NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND (role = 'company_admin' OR role = 'super_admin')
  )
);