-- Fix RLS policy for uploads table to allow updates
-- Remove the restrictive admin-only policy and add a proper policy for updating uploads
DROP POLICY IF EXISTS "Admins can manage uploads" ON public.uploads;

-- Create a policy that allows updating uploads by anyone (since customers need to update their details)
CREATE POLICY "Anyone can update uploads" 
ON public.uploads 
FOR UPDATE 
USING (true)
WITH CHECK (true);