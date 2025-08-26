-- Fix delete permissions for uploads, coupons, and storage objects in 'uploads' bucket

-- Ensure RLS is enabled (safe to run if already enabled)
ALTER TABLE public.uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Allow anyone to delete uploads
CREATE POLICY "Anyone can delete uploads"
ON public.uploads
FOR DELETE
USING (true);

-- Allow anyone to delete coupons
CREATE POLICY "Anyone can delete coupons"
ON public.coupons
FOR DELETE
USING (true);

-- Storage policy: allow delete of objects in the 'uploads' bucket
CREATE POLICY "Anyone can delete objects in uploads bucket"
ON storage.objects
FOR DELETE
USING (bucket_id = 'uploads');