-- Restrict uploads SELECT to admins only
DROP POLICY IF EXISTS "Uploads are viewable by everyone" ON public.uploads;
CREATE POLICY "Uploads are viewable by admins" ON public.uploads
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));