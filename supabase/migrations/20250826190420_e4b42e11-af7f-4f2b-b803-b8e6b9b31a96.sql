-- Allow users to assign themselves company_admin role for companies they own
CREATE POLICY IF NOT EXISTS "Users can become admin of their own company" 
ON public.user_roles
FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND 
  role = 'company_admin'::app_role AND 
  company_id IN (
    SELECT id FROM public.companies WHERE owner_user_id = auth.uid()
  )
);
