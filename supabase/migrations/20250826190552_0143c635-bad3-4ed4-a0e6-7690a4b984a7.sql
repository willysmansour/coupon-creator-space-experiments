-- Allow users to assign themselves company_admin role for companies they own
CREATE POLICY "Users can become admin of their own company" 
ON public.user_roles
FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND 
  role = 'company_admin' AND 
  company_id IN (
    SELECT id FROM public.companies WHERE owner_user_id = auth.uid()
  )
);