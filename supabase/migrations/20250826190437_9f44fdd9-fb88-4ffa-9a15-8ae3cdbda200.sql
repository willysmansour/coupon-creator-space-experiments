-- Fix the duplicate policy issue and create proper company insertion policy
DROP POLICY IF EXISTS "Authenticated users can create their first company" ON public.companies;

CREATE POLICY "Users can create their first company" 
ON public.companies 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  owner_user_id = auth.uid() AND
  NOT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('company_admin', 'super_admin')
  )
);