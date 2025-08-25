-- Update RLS policies for campaigns to allow management
DROP POLICY IF EXISTS "Admins can manage campaigns" ON public.campaigns;

-- Allow everyone to manage campaigns for now (public demo)
CREATE POLICY "Anyone can manage campaigns"
ON public.campaigns
FOR ALL
USING (true)
WITH CHECK (true);

-- Keep existing select policy for active campaigns (already present)
-- Note: We do not drop it; this policy remains for clarity